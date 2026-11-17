"use client";

// Browser simulation of do_robotics: a phone camera detects a bottle, decides
// how to steer, and sends 5-byte frames to an ESP32 that only drives two motors.
import { useEffect, useRef, useState } from "react";

// Wire protocol: arduino/receiver/receiver.ino, lib/services/connectivity/robot_protocol.dart
const HEADER = 0xaa;
const [CMD_HEARTBEAT, CMD_DIGITAL_WRITE, CMD_ANALOG_WRITE] = [0x00, 0x01, 0x02];
const HEARTBEAT_MS = 500; // app -> board keep-alive
const WATCHDOG_MS = 2000; // firmware failsafe after this much silence
// ESP32 car wiring from the in-app tutorials (lib/models/tutorial_data.dart):
// speed (PWM) pin 32 / 33, direction IN1 25 / 26, no IN2 (a wheel cannot reverse).
const LEFT = { en: 32, in1: 25 };
const RIGHT = { en: 33, in1: 26 };
// Smart Follow steering (lib/logic/smart_follow.dart) with the Fetch Bot snippet defaults
const [TURN_GAIN, SPIN_OFFSET] = [1.6, 0.6];
const [BASE, MIN, ARRIVED_PCT] = [150, 100, 30]; // cruise PWM, lowest PWM that turns a wheel, "arrived" box size %
const DECIDE_S = 0.14; // one decision per 70 ms step + 70 ms pause

// Simulation-only assumptions (not from the repo): floor size, robot size, camera FOV.
const [W, H] = [2.0, 1.5]; // floor, m
const [TRACK, CAM] = [0.2, 0.09]; // wheel spacing, camera ahead of the axle, m
const V_PER_PWM = 0.0014; // m/s per PWM unit
const HFOV = (50 * Math.PI) / 180;
const TAN_H = Math.tan(HFOV / 2);
const TAN_V = (TAN_H * 4) / 3; // portrait 3:4 picture
const [BOTTLE_W, BOTTLE_H] = [0.09, 0.26];
const INK = "#0a0b0d";

type Frame = { id: number; b: number[]; note: string };
type Det = { x: number; w: number; h: number; area: number; conf: number };
type View = { frames: Frame[]; l: number; r: number; det: Det | null; holding: boolean };
type Colors = Record<"bg" | "surface" | "text" | "muted" | "border" | "line" | "accent" | "mono", string>;
type Sim = {
  x: number; y: number; th: number; bx: number; by: number; t: number;
  auto: boolean; dragging: boolean; idle: number; since: number;
  holding: boolean; drive: [number, number]; sent: Record<number, number>;
  frames: Frame[]; nextId: number; tDecide: number; tBeat: number;
  trail: { x: number; y: number }[]; tTrail: number;
};

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const hex = (n: number) => n.toString(16).toUpperCase().padStart(2, "0");
const EMPTY: View = { frames: [], l: 0, r: 0, det: null, holding: false };

const createSim = (): Sim => ({
  x: 0.45, y: 1.05, th: -1.5, bx: 1.5, by: 0.45, t: 0,
  auto: true, dragging: false, idle: 0, since: 0,
  holding: false, drive: [0, 0], sent: {},
  frames: [], nextId: 1, tDecide: DECIDE_S, tBeat: 0, trail: [], tTrail: 0,
});

function readColors(): Colors {
  const css = getComputedStyle(document.documentElement);
  const v = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback;
  return {
    bg: v("--color-bg", "#0a0b0d"), surface: v("--color-surface", "#101214"),
    text: v("--color-text", "#e9ebee"), muted: v("--color-muted", "#8b9199"),
    border: v("--color-border", "#22262b"), line: v("--color-line", "#3a4047"),
    accent: v("--color-accent", "#ff5a1f"), mono: v("--font-mono", "ui-monospace, monospace"),
  };
}

// SmartFollowControl.wheel / wheelSpeeds, ported from smart_follow.dart
function wheel(v: number) {
  const a = Math.abs(v);
  if (a < MIN / 2) return 0;
  const s = Math.round(clamp(Math.max(a, MIN), 0, 255));
  return v < 0 ? -s : s;
}
function wheelSpeeds(x: number): [number, number] {
  const forward = BASE * clamp(1 - Math.abs(x) / SPIN_OFFSET, 0, 1);
  const turn = BASE * clamp(TURN_GAIN * x, -1, 1);
  return [wheel(forward + turn), wheel(forward - turn)];
}

// What the camera sees: horizontal offset -1..+1 and box size as a fraction of the picture.
function detect(s: Sim): Det | null {
  const dx = s.bx - (s.x + CAM * Math.cos(s.th));
  const dy = s.by - (s.y + CAM * Math.sin(s.th));
  const d = Math.max(0.06, Math.hypot(dx, dy));
  const a = Math.atan2(dy, dx) - s.th;
  const bearing = Math.atan2(Math.sin(a), Math.cos(a)); // wrapped to -pi..pi, + = right of centre
  if (Math.abs(bearing) >= HFOV / 2) return null;
  const z = d * Math.cos(bearing);
  const w = Math.min(1, BOTTLE_W / (2 * TAN_H * z));
  const h = Math.min(1, BOTTLE_H / (2 * TAN_V * z));
  const conf = clamp(0.93 - 0.12 * d + 0.015 * Math.sin(s.t * 5), 0.5, 0.97);
  return { x: Math.tan(bearing) / TAN_H, w, h, area: w * h * 100, conf };
}

// [0xAA][CMD][PIN][VALUE][CK], CK = (0xAA + CMD + PIN + VALUE) % 256
function send(s: Sim, cmd: number, pin: number, val: number) {
  const note = cmd === CMD_HEARTBEAT ? "HEARTBEAT"
    : cmd === CMD_DIGITAL_WRITE ? `GPIO${pin} ${val ? "HIGH" : "LOW"}` : `GPIO${pin} PWM ${val}`;
  s.frames.push({ id: s.nextId++, b: [HEADER, cmd, pin, val, (HEADER + cmd + pin + val) % 256], note });
  if (s.frames.length > 6) s.frames.shift();
  if (cmd !== CMD_HEARTBEAT) s.sent[pin] = val;
}

// ActuatorDriver.driveMotor: IN1 = direction, then PWM; unchanged values are not re-sent.
function driveMotor(s: Sim, m: { en: number; in1: number }, v: number) {
  const fwd = v > 0 ? 1 : 0;
  const pwm = Math.abs(v);
  if (s.sent[m.in1] !== fwd) send(s, CMD_DIGITAL_WRITE, m.in1, fwd);
  if (s.sent[m.en] !== pwm) send(s, CMD_ANALOG_WRITE, m.en, pwm);
  return fwd ? pwm : 0; // without IN2 a "backward" wheel just stops
}

function decide(s: Sim): View {
  const det = detect(s);
  let cmd: [number, number];
  if (!det) {
    s.holding = false;
    cmd = [BASE, 0]; // search like the Fetch Bot tutorial: left wheel forward, right stopped
  } else {
    if (det.area > ARRIVED_PCT) s.holding = true;
    else if (det.area < ARRIVED_PCT * 0.8) s.holding = false;
    cmd = s.holding ? [0, 0] : wheelSpeeds(det.x);
  }
  s.drive = [driveMotor(s, LEFT, cmd[0]), driveMotor(s, RIGHT, cmd[1])];
  return { frames: [...s.frames], l: s.drive[0], r: s.drive[1], det, holding: s.holding };
}

// Advance the world by dt seconds; returns a new display snapshot when a decision was made.
function step(s: Sim, dt: number): View | null {
  s.t += dt;
  s.since += dt;
  s.idle = s.holding ? s.idle + dt : 0;
  if (s.auto && !s.dragging && (s.idle > 1.3 || s.since > 11)) {
    for (let i = 0; i < 20; i++) {
      s.bx = 0.2 + Math.random() * (W - 0.4);
      s.by = 0.2 + Math.random() * (H - 0.4);
      if (Math.hypot(s.bx - s.x, s.by - s.y) > 0.75) break;
    }
    s.since = s.idle = 0;
  }
  let view: View | null = null;
  if ((s.tBeat += dt) >= HEARTBEAT_MS / 1000) {
    s.tBeat = 0;
    send(s, CMD_HEARTBEAT, 0, 0);
  }
  if ((s.tDecide += dt) >= DECIDE_S) {
    s.tDecide = 0;
    view = decide(s);
  }
  // differential drive
  const vl = s.drive[0] * V_PER_PWM;
  const vr = s.drive[1] * V_PER_PWM;
  s.th += ((vl - vr) / TRACK) * dt;
  s.x = clamp(s.x + ((vl + vr) / 2) * Math.cos(s.th) * dt, 0.14, W - 0.14);
  s.y = clamp(s.y + ((vl + vr) / 2) * Math.sin(s.th) * dt, 0.14, H - 0.14);
  if ((s.tTrail += dt) > 0.07) {
    s.tTrail = 0;
    s.trail.push({ x: s.x, y: s.y });
    if (s.trail.length > 80) s.trail.shift();
  }
  return view;
}

// Reset a canvas for a frame in CSS pixels; returns its size.
function begin(ctx: CanvasRenderingContext2D, cv: HTMLCanvasElement, c: Colors): [number, number] {
  const dpr = window.devicePixelRatio || 1;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = c.bg;
  ctx.fillRect(0, 0, cv.width / dpr, cv.height / dpr);
  ctx.lineWidth = 1;
  ctx.font = `10px ${c.mono}`;
  ctx.textBaseline = "middle";
  return [cv.width / dpr, cv.height / dpr];
}
function line(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) {
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
}

function drawFloor(ctx: CanvasRenderingContext2D, cv: HTMLCanvasElement, s: Sim, det: Det | null, c: Colors) {
  const [w, h] = begin(ctx, cv, c);
  const k = w / W;
  ctx.strokeStyle = c.border; // 0.25 m grid
  ctx.beginPath();
  for (let g = 0.25; g < W; g += 0.25) { const p = Math.round(g * k) + 0.5; ctx.moveTo(p, 0); ctx.lineTo(p, h); }
  for (let g = 0.25; g < H; g += 0.25) { const p = Math.round(g * k) + 0.5; ctx.moveTo(0, p); ctx.lineTo(w, p); }
  ctx.stroke();
  ctx.strokeRect(0.5, 0.5, w - 1, h - 1);
  // fading trail
  ctx.strokeStyle = c.muted;
  for (let i = 1; i < s.trail.length; i++) {
    ctx.globalAlpha = 0.1 + (i / s.trail.length) * 0.9;
    line(ctx, s.trail[i - 1].x * k, s.trail[i - 1].y * k, s.trail[i].x * k, s.trail[i].y * k);
  }
  // camera field of view
  const cx = (s.x + CAM * Math.cos(s.th)) * k;
  const cy = (s.y + CAM * Math.sin(s.th)) * k;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.arc(cx, cy, 0.85 * k, s.th - HFOV / 2, s.th + HFOV / 2);
  ctx.closePath();
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = det ? c.accent : c.muted;
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = det ? c.accent : c.line;
  ctx.stroke();
  const bx = s.bx * k;
  const by = s.by * k;
  if (det) { // line of sight to the locked target
    ctx.setLineDash([3, 4]);
    line(ctx, cx, cy, bx, by);
    ctx.setLineDash([]);
  }
  // bottle marker
  ctx.fillStyle = c.accent;
  ctx.fillRect(Math.round(bx) - 4, Math.round(by) - 4, 8, 8);
  ctx.strokeStyle = c.accent;
  ctx.strokeRect(Math.round(bx) - 9.5, Math.round(by) - 9.5, 19, 19);
  ctx.fillStyle = c.text;
  const tag = s.auto ? "BOTTLE · DRAG ME" : "BOTTLE";
  const tw = ctx.measureText(tag).width;
  ctx.fillText(tag, bx + 16 + tw > w - 4 ? bx - 16 - tw : bx + 16, by);
  // robot: chassis, two wheels, phone slab at the front
  ctx.save();
  ctx.translate(s.x * k, s.y * k);
  ctx.rotate(s.th);
  ctx.fillStyle = c.surface;
  ctx.strokeStyle = c.text;
  ctx.fillRect(-0.1 * k, -0.075 * k, 0.2 * k, 0.15 * k);
  ctx.strokeRect(-0.1 * k, -0.075 * k, 0.2 * k, 0.15 * k);
  ctx.fillStyle = c.text;
  ctx.fillRect(-0.045 * k, (-TRACK / 2 - 0.016) * k, 0.09 * k, 0.032 * k);
  ctx.fillRect(-0.045 * k, (TRACK / 2 - 0.016) * k, 0.09 * k, 0.032 * k);
  ctx.fillStyle = c.accent;
  ctx.fillRect((CAM - 0.018) * k, -0.05 * k, 0.018 * k, 0.1 * k);
  ctx.restore();
  // state + scale bar
  ctx.fillStyle = det ? c.accent : c.muted;
  ctx.fillText(det ? (s.holding ? "ARRIVED · HOLDING" : "TRACKING BOTTLE") : "SEARCHING · PIVOT RIGHT", 10, 14);
  ctx.strokeStyle = c.muted;
  ctx.strokeRect(10.5, h - 15.5, Math.round(0.5 * k), 5);
  ctx.fillStyle = c.muted;
  ctx.fillText("0.5 M", 10, h - 24);
}

function drawPhone(ctx: CanvasRenderingContext2D, cv: HTMLCanvasElement, det: Det | null, t: number, c: Colors) {
  const [w, h] = begin(ctx, cv, c);
  ctx.strokeStyle = c.line; // centre line
  ctx.setLineDash([2, 4]);
  line(ctx, Math.round(w / 2) + 0.5, 0, Math.round(w / 2) + 0.5, h);
  ctx.setLineDash([]);
  if (det) {
    const bw = Math.max(4, det.w * w);
    const bh = Math.max(8, det.h * h);
    const cx = ((det.x + 1) / 2) * w;
    const top = Math.max(1, h * 0.5 - bh / 2);
    ctx.strokeStyle = c.accent;
    ctx.strokeRect(Math.round(cx - bw / 2) + 0.5, Math.round(top) + 0.5, Math.round(bw), Math.round(Math.min(bh, h - 2)));
    const text = `bottle ${Math.round(det.conf * 100)}%`; // overlay format of the app's inference painter
    const tw = ctx.measureText(text).width + 8;
    const lx = clamp(Math.round(cx - bw / 2), 0, w - tw);
    const ly = top > 16 ? Math.round(top) - 14 : Math.round(top) + 1;
    ctx.fillStyle = c.accent;
    ctx.fillRect(lx, ly, tw, 14);
    ctx.fillStyle = INK;
    ctx.fillText(text, lx + 4, ly + 7.5);
    // offset from the centre line
    line(ctx, w / 2, h - 9.5, cx, h - 9.5);
    ctx.fillStyle = c.accent;
    ctx.fillRect(clamp(Math.round(cx) - 3, 0, w - 6), h - 13, 6, 6);
  } else {
    const text = `SEARCHING${".".repeat(1 + (Math.floor(t * 3) % 3))}`;
    ctx.fillStyle = c.muted;
    ctx.fillText(text, (w - ctx.measureText("SEARCHING...").width) / 2, h / 2);
  }
  ctx.strokeStyle = c.line;
  ctx.strokeRect(0.5, 0.5, w - 1, h - 1);
}

const text = { color: "var(--color-text)" };
const accent = { color: "var(--color-accent)" };
const rule = { borderColor: "var(--color-border)" };
const COLS = "grid grid-cols-[repeat(5,28px)_minmax(0,1fr)] gap-x-1";

export default function PhoneRobotDemo() {
  const floorRef = useRef<HTMLCanvasElement>(null);
  const phoneRef = useRef<HTMLCanvasElement>(null);
  const simRef = useRef<Sim | null>(null);
  const [view, setView] = useState<View>(EMPTY);
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    const floor = floorRef.current;
    const phone = phoneRef.current;
    const fctx = floor?.getContext("2d");
    const pctx = phone?.getContext("2d");
    if (!floor || !phone || !fctx || !pctx) return;
    const s = (simRef.current ??= createSim());
    let colors = readColors();
    const render = () => {
      const det = detect(s);
      drawFloor(fctx, floor, s, det, colors);
      drawPhone(pctx, phone, det, s.t, colors);
    };
    const fit = () => {
      const dpr = window.devicePixelRatio || 1;
      for (const cv of [floor, phone]) {
        const r = cv.getBoundingClientRect();
        cv.width = Math.max(1, Math.round(r.width * dpr));
        cv.height = Math.max(1, Math.round(r.height * dpr));
      }
      render();
    };
    const ro = new ResizeObserver(fit);
    ro.observe(floor);
    ro.observe(phone);
    // next-themes flips a class on <html>: re-read the palette
    const mo = new MutationObserver(() => { colors = readColors(); render(); });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    // rAF loop, only while on screen and the tab is visible
    let raf = 0;
    let last = 0;
    let onScreen = false;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - last) / 1000); // real time, capped after a stall
      last = now;
      const next = step(s, dt);
      if (next) setView(next); // about 7 Hz
      render();
    };
    const sync = () => {
      const run = onScreen && !document.hidden;
      if (run && !raf) { last = performance.now(); raf = requestAnimationFrame(tick); }
      else if (!run && raf) { cancelAnimationFrame(raf); raf = 0; }
    };
    const io = new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; sync(); });
    io.observe(floor);
    const ac = new AbortController();
    const on = { signal: ac.signal };
    document.addEventListener("visibilitychange", sync, on);
    window.addEventListener("resize", fit, on); // also catches devicePixelRatio (zoom) changes

    // dragging the bottle takes over from the attract mode
    const place = (e: PointerEvent) => {
      const r = floor.getBoundingClientRect();
      s.bx = clamp(((e.clientX - r.left) / r.width) * W, 0.06, W - 0.06);
      s.by = clamp(((e.clientY - r.top) / r.height) * H, 0.06, H - 0.06);
    };
    const down = (e: PointerEvent) => {
      floor.setPointerCapture(e.pointerId);
      s.dragging = true;
      s.auto = false;
      setAuto(false);
      floor.style.cursor = "grabbing";
      place(e);
    };
    const move = (e: PointerEvent) => { if (s.dragging) place(e); };
    const up = () => { s.dragging = false; floor.style.cursor = "grab"; };
    floor.addEventListener("pointerdown", down, on);
    floor.addEventListener("pointermove", move, on);
    floor.addEventListener("pointerup", up, on);
    floor.addEventListener("pointercancel", up, on);

    return () => {
      cancelAnimationFrame(raf);
      for (const o of [ro, mo, io]) o.disconnect();
      ac.abort();
    };
  }, []);

  const resumeAuto = () => {
    const s = simRef.current;
    if (s) { s.auto = true; s.since = 11; }
    setAuto(true);
  };

  const { det } = view;
  const newest = view.frames[view.frames.length - 1];
  const rows: (Frame | null)[] = [...Array<null>(6 - view.frames.length).fill(null), ...view.frames];
  const readout: [string, string][] = [
    ["target", det ? `bottle ${Math.round(det.conf * 100)}%` : "none"],
    ["x offset", det ? `${Math.round(det.x * 100) >= 0 ? "+" : "-"}${Math.abs(det.x).toFixed(2)}` : "--"],
    ["size", det ? `${det.area.toFixed(0)}% / ${ARRIVED_PCT}%` : "--"],
    ["decision", det ? (view.holding ? "arrived: stop" : `L ${view.l}  R ${view.r}`) : "search: pivot"],
  ];

  return (
    <div className="panel ticks">
      <div className="grid lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)]">
        <div className="p-3 sm:p-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="label">Floor · drag the bottle</span>
            <button type="button" className="btn" onClick={resumeAuto} aria-pressed={auto}
              style={{ padding: "0.15rem 0.5rem", fontSize: "0.6875rem", ...(auto ? { ...accent, borderColor: "var(--color-accent)" } : {}) }}>
              auto
            </button>
          </div>
          <canvas ref={floorRef} role="img" className="block w-full"
            aria-label="Top-down simulation: a two-wheeled robot carrying a phone searches for a bottle, steers toward it and stops in front of it. Drag to move the bottle."
            style={{ aspectRatio: "4 / 3", touchAction: "none", cursor: "grab" }} />
        </div>

        <div className="flex flex-col border-t lg:border-l lg:border-t-0" style={rule}>
          <div className="p-3 sm:p-4">
            <div className="label mb-2">Phone view · on-device detection</div>
            <div className="flex items-start gap-4">
              <canvas ref={phoneRef} role="img" className="block w-[132px] shrink-0" style={{ aspectRatio: "3 / 4" }}
                aria-label="What the phone camera sees: a bounding box around the bottle that slides with its bearing and grows as the robot approaches." />
              <dl className="min-w-0 flex-1 font-mono text-[11px] leading-[1.35]">
                {readout.map(([k, v]) => (
                  <div key={k} className="mb-1.5">
                    <dt className="label" style={{ fontSize: "0.625rem" }}>{k}</dt>
                    <dd className="whitespace-pre" style={k === "x offset" && det ? accent : text}>{v}</dd>
                  </div>
                ))}
                <span className="tech-chip mt-1">EfficientDet-Lite0</span>
              </dl>
            </div>
          </div>

          <div className="flex-1 border-t p-3 sm:p-4" style={rule}>
            <div className="label mb-2">Wire · phone → ESP32 · 5-byte frames</div>
            <div className={`${COLS} label`} style={{ fontSize: "0.5625rem", letterSpacing: "0.08em" }}>
              <span>hdr</span><span>cmd</span><span>pin</span><span>val</span><span>ck</span><span className="text-right">meaning</span>
            </div>
            <div className="mt-1 font-mono text-[11px] leading-[17px]" aria-live="off">
              {rows.map((f, i) => (
                <div key={f ? f.id : `empty-${i}`} className={COLS}
                  style={{ color: f === newest ? "var(--color-text)" : "var(--color-muted)", opacity: f === newest ? 1 : 0.45 + i * 0.1 }}>
                  {f ? (
                    <>
                      <span>{hex(f.b[0])}</span><span>{hex(f.b[1])}</span><span>{hex(f.b[2])}</span>
                      <span style={f === newest ? accent : undefined}>{hex(f.b[3])}</span><span>{hex(f.b[4])}</span>
                      <span className="truncate text-right">{f.note}</span>
                    </>
                  ) : <span>&nbsp;</span>}
                </div>
              ))}
            </div>
            <div className="mt-2 border-t pt-2 font-mono text-[10px] leading-[1.5]" style={{ ...rule, color: "var(--color-muted)" }}>
              ck = ({newest ? newest.b.slice(0, 4).map(hex).join(" + ") : "AA + cmd + pin + val"}) % 256
              {newest && <> = <span style={text}>{hex(newest.b[4])}</span></>}
            </div>
            <div className="mt-3 grid grid-cols-[auto_minmax(0,1fr)_3ch] items-center gap-x-2 gap-y-1.5 font-mono text-[10px]"
              style={{ color: "var(--color-muted)" }}>
              {([["L", LEFT, view.l], ["R", RIGHT, view.r]] as const).map(([name, m, v]) => (
                <div key={name} className="contents">
                  <span>{name} MOTOR · PWM {m.en} · IN1 {m.in1}</span>
                  <div className="h-[5px] border" style={rule}>
                    <div className="h-full" style={{ width: `${(v / 255) * 100}%`, background: "var(--color-accent)" }} />
                  </div>
                  <span className="text-right" style={text}>{v}</span>
                </div>
              ))}
            </div>
            <p className="label mt-3" style={{ fontSize: "0.625rem", letterSpacing: "0.06em", lineHeight: 1.5 }}>
              Link: BLE / USB serial · heartbeat 00 every {HEARTBEAT_MS} ms · firmware stops all outputs after {WATCHDOG_MS} ms without a valid frame
            </p>
          </div>
        </div>
      </div>
      <p className="label border-t px-3 py-2 sm:px-4" style={{ ...rule, letterSpacing: "0.06em" }}>
        Simplified browser simulation of the follow behaviour. In the real robot, detection runs on the phone.
      </p>
    </div>
  );
}
