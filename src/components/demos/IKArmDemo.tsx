"use client";

import { useEffect, useRef, useState } from "react";

// World window shown in the plot, in the same units as the link lengths.
const X0 = -3.6;
const X1 = 3.6;
const Y0 = -1.4;
const Y1 = 3.6;
const PX = 100; // SVG units per world unit
const W = (X1 - X0) * PX;
const H = (Y1 - Y0) * PX;
const sx = (x: number) => (x - X0) * PX;
const sy = (y: number) => (Y1 - y) * PX;

const deg = (rad: number) => (rad * 180) / Math.PI;
const f2 = (n: number) => n.toFixed(2);
const f1 = (n: number) => n.toFixed(1);

interface Solution {
  reachable: boolean;
  c2: number;
  t1: number;
  t2: number;
  elbow: [number, number];
  tip: [number, number];
}

/** Closed-form inverse kinematics of a planar two-link arm, then forward kinematics as a check. */
function solve(x: number, y: number, l1: number, l2: number, sign: 1 | -1): Solution {
  const raw = (x * x + y * y - l1 * l1 - l2 * l2) / (2 * l1 * l2);
  const reachable = Math.abs(raw) <= 1;
  const c2 = Math.max(-1, Math.min(1, raw)); // out of reach: stretch or fold toward the target
  const t2 = sign * Math.acos(c2);
  const t1 = Math.atan2(y, x) - Math.atan2(l2 * Math.sin(t2), l1 + l2 * Math.cos(t2));
  const elbow: [number, number] = [l1 * Math.cos(t1), l1 * Math.sin(t1)];
  const tip: [number, number] = [elbow[0] + l2 * Math.cos(t1 + t2), elbow[1] + l2 * Math.sin(t1 + t2)];
  return { reachable, c2: raw, t1, t2, elbow, tip };
}

/** SVG arc from angle a0 to a1 (radians, counter-clockwise positive) around a world point. */
function arc(cx: number, cy: number, r: number, a0: number, a1: number) {
  const p0 = [sx(cx + r * Math.cos(a0)), sy(cy + r * Math.sin(a0))];
  const p1 = [sx(cx + r * Math.cos(a1)), sy(cy + r * Math.sin(a1))];
  const large = Math.abs(a1 - a0) > Math.PI ? 1 : 0;
  const sweep = a1 > a0 ? 0 : 1; // screen y is flipped
  return `M${p0[0]} ${p0[1]}A${r * PX} ${r * PX} 0 ${large} ${sweep} ${p1[0]} ${p1[1]}`;
}

/**
 * Interactive version of the paper: drag the target and the two joint angles
 * are solved live, with every number in the formulas filled in.
 */
export default function IKArmDemo() {
  const [l1, setL1] = useState(2);
  const [l2, setL2] = useState(1);
  const [target, setTarget] = useState<[number, number]>([1.2, 2]);
  const [sign, setSign] = useState<1 | -1>(1);
  const [auto, setAuto] = useState(true);
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  // Until someone takes over, the target traces the paper's path y = 2.
  useEffect(() => {
    if (!auto) return;
    let frame = 0;
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    if (wrapRef.current) io.observe(wrapRef.current);
    const start = performance.now();
    const tick = (now: number) => {
      if (visible) {
        const span = Math.min(2.2, Math.sqrt(Math.max(0.2, (l1 + l2) ** 2 - 4)) - 0.15);
        setTarget([span * Math.sin((now - start) / 1700), 2]);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      io.disconnect();
    };
  }, [auto, l1, l2]);

  const pointTo = (e: React.PointerEvent) => {
    const svg = svgRef.current;
    if (!svg) return;
    const box = svg.getBoundingClientRect();
    const x = X0 + ((e.clientX - box.left) / box.width) * (X1 - X0);
    const y = Y1 - ((e.clientY - box.top) / box.height) * (Y1 - Y0);
    setTarget([Math.max(X0, Math.min(X1, x)), Math.max(Y0, Math.min(Y1, y))]);
  };

  const [x, y] = target;
  const s = solve(x, y, l1, l2, sign);
  const r2 = x * x + y * y;
  const phi = Math.atan2(y, x);
  const beta = Math.atan2(l2 * Math.sin(s.t2), l1 + l2 * Math.cos(s.t2));
  const err = Math.hypot(s.tip[0] - x, s.tip[1] - y);

  const text = "var(--color-text)";
  const muted = "var(--color-muted)";
  const accent = "var(--color-accent)";
  const line = "var(--color-line)";
  const mono = { fontFamily: "var(--font-mono)", fontSize: 13, fill: muted } as const;

  return (
    <div ref={wrapRef} className="panel ticks grid lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
      {/* Plot */}
      <div className="relative blueprint-grid border-b lg:border-b-0 lg:border-r" style={{ borderColor: "var(--color-border)" }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label="Two-link arm reaching for a target point"
          className="block w-full h-auto select-none"
          style={{ touchAction: "none", cursor: "crosshair" }}
          onPointerDown={(e) => {
            dragging.current = true;
            e.currentTarget.setPointerCapture(e.pointerId);
            setAuto(false);
            pointTo(e);
          }}
          onPointerMove={(e) => dragging.current && pointTo(e)}
          onPointerUp={() => (dragging.current = false)}
          onPointerCancel={() => (dragging.current = false)}
        >
          {/* axes */}
          <path d={`M0 ${sy(0)}H${W}M${sx(0)} 0V${H}`} stroke={line} strokeWidth={1} />
          {[-3, -2, -1, 1, 2, 3].map((n) => (
            <g key={n}>
              <text x={sx(n)} y={sy(0) + 18} textAnchor="middle" {...mono}>
                {n}
              </text>
              {n > 0 && (
                <text x={sx(0) - 10} y={sy(n) + 4} textAnchor="end" {...mono}>
                  {n}
                </text>
              )}
            </g>
          ))}

          {/* reachable workspace: between |L1 - L2| and L1 + L2 */}
          <circle cx={sx(0)} cy={sy(0)} r={(l1 + l2) * PX} fill="none" stroke={muted} strokeWidth={1} strokeDasharray="3 7" />
          <circle cx={sx(0)} cy={sy(0)} r={Math.abs(l1 - l2) * PX} fill="none" stroke={muted} strokeWidth={1} strokeDasharray="3 7" />
          <text x={sx(0) + 8} y={sy(l1 + l2) - 8} {...mono}>
            reach L₁ + L₂
          </text>

          {/* the paper's desired path */}
          <path d={`M${sx(X0)} ${sy(2)}H${sx(X1)}`} stroke={accent} strokeWidth={1} strokeDasharray="10 6" opacity={auto ? 0.9 : 0.35} />
          <text x={sx(X1) - 8} y={sy(2) - 8} textAnchor="end" {...mono} fill={accent}>
            path y = 2
          </text>

          {/* angle arcs */}
          <path d={arc(0, 0, 0.45, 0, s.t1)} fill="none" stroke={text} strokeWidth={1.5} />
          <path d={arc(s.elbow[0], s.elbow[1], 0.32, s.t1, s.t1 + s.t2)} fill="none" stroke={accent} strokeWidth={1.5} />
          <path
            d={`M${sx(s.elbow[0])} ${sy(s.elbow[1])}L${sx(s.elbow[0] + 0.7 * Math.cos(s.t1))} ${sy(s.elbow[1] + 0.7 * Math.sin(s.t1))}`}
            stroke={line}
            strokeWidth={1}
            strokeDasharray="4 4"
          />
          <text x={sx(0.55 * Math.cos(s.t1 / 2)) + 4} y={sy(0.55 * Math.sin(s.t1 / 2)) + 4} {...mono} fill={text}>
            θ₁
          </text>
          <text
            x={sx(s.elbow[0] + 0.5 * Math.cos(s.t1 + s.t2 / 2))}
            y={sy(s.elbow[1] + 0.5 * Math.sin(s.t1 + s.t2 / 2)) + 4}
            textAnchor="middle"
            {...mono}
            fill={accent}
          >
            θ₂
          </text>

          {/* links */}
          <path d={`M${sx(0)} ${sy(0)}L${sx(s.elbow[0])} ${sy(s.elbow[1])}`} stroke={text} strokeWidth={7} strokeLinecap="square" />
          <path
            d={`M${sx(s.elbow[0])} ${sy(s.elbow[1])}L${sx(s.tip[0])} ${sy(s.tip[1])}`}
            stroke={accent}
            strokeWidth={7}
            strokeLinecap="square"
          />
          {/* joints */}
          {[[0, 0], s.elbow].map(([jx, jy], i) => (
            <rect key={i} x={sx(jx) - 8} y={sy(jy) - 8} width={16} height={16} fill="var(--color-bg)" stroke={text} strokeWidth={2} />
          ))}

          {/* target */}
          <g stroke={s.reachable ? text : accent} strokeWidth={1.5} fill="none">
            <circle cx={sx(x)} cy={sy(y)} r={13} />
            <path d={`M${sx(x) - 22} ${sy(y)}h44M${sx(x)} ${sy(y) - 22}v44`} />
          </g>
          <text x={sx(x) + 20} y={sy(y) - 16} {...mono} fill={text}>
            ({f2(x)}, {f2(y)})
          </text>
        </svg>
        <p className="label absolute top-3 left-3 pointer-events-none">
          <span style={{ color: accent }}>■</span> {auto ? "Tracing the path. Drag anywhere to take over" : "Drag the target"}
        </p>
      </div>

      {/* Live maths */}
      <div className="p-4 md:p-5 flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          <button className="btn" onClick={() => setAuto((a) => !a)} aria-pressed={auto}>
            {auto ? "Stop tracing" : "Trace y = 2"}
          </button>
          <button className="btn" onClick={() => setSign((v) => (v === 1 ? -1 : 1))}>
            Elbow {sign === 1 ? "down" : "up"} ⇄
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {(
            [
              ["L₁", l1, setL1, 1, 2.5],
              ["L₂", l2, setL2, 0.5, 1.5],
            ] as const
          ).map(([name, value, set, min, max]) => (
            <label key={name} className="label flex flex-col gap-1.5">
              <span>
                {name} = <span style={{ color: text }}>{f2(value)}</span>
              </span>
              <input
                type="range"
                min={min}
                max={max}
                step={0.05}
                value={value}
                onChange={(e) => set(Number(e.target.value))}
                style={{ accentColor: "var(--color-accent)" }}
              />
            </label>
          ))}
        </div>

        <dl className="font-mono text-[12.5px] leading-relaxed space-y-3" style={{ color: muted }}>
          <Row label="1 · Elbow angle">
            cos θ₂ = (x² + y² − L₁² − L₂²) / (2 L₁ L₂)
            <br />= ({f2(r2)} − {f2(l1 * l1)} − {f2(l2 * l2)}) / {f2(2 * l1 * l2)} ={" "}
            <b style={{ color: s.reachable ? text : accent }}>{f2(s.c2)}</b>
            <br />
            θ₂ = {sign === 1 ? "+" : "−"}acos({f2(Math.max(-1, Math.min(1, s.c2)))}) = <b style={{ color: accent }}>{f1(deg(s.t2))}°</b>
          </Row>
          <Row label="2 · Shoulder angle">
            θ₁ = atan2(y, x) − atan2(L₂ sin θ₂, L₁ + L₂ cos θ₂)
            <br />= {f1(deg(phi))}° − ({f1(deg(beta))}°) = <b style={{ color: text }}>{f1(deg(s.t1))}°</b>
          </Row>
          <Row label="3 · Check with forward kinematics">
            x = L₁ cos θ₁ + L₂ cos(θ₁ + θ₂) = <b style={{ color: text }}>{f2(s.tip[0])}</b>
            <br />y = L₁ sin θ₁ + L₂ sin(θ₁ + θ₂) = <b style={{ color: text }}>{f2(s.tip[1])}</b>
            <br />
            error = <b style={{ color: s.reachable ? text : accent }}>{err.toFixed(3)}</b>
          </Row>
        </dl>

        <p className="label mt-auto pt-2 border-t" style={{ borderColor: "var(--color-border)", color: s.reachable ? muted : accent }}>
          {s.reachable
            ? "Target is inside the workspace: exact solution"
            : "Out of reach: |cos θ₂| > 1, so the arm points at the target instead"}
        </p>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="label mb-1" style={{ color: "var(--color-text)" }}>
        {label}
      </dt>
      <dd>{children}</dd>
    </div>
  );
}
