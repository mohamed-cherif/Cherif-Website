import type { Diagram, DiagramLink } from "@/data/projects";

// Grid geometry (SVG units)
const CELL_W = 236;
const CELL_H = 120;
const BOX_W = 150;
const BOX_H = 62;
const PAD = 24;

const STYLE: Record<NonNullable<DiagramLink["kind"]>, { stroke: string; dash?: string; label: string }> = {
  signal: { stroke: "var(--color-text)", label: "Signal" },
  power: { stroke: "var(--color-accent)", label: "Power" },
  radio: { stroke: "var(--color-text)", dash: "2 5", label: "Radio" },
  mech: { stroke: "var(--color-muted)", dash: "8 4", label: "Mechanical" },
};

/** Block diagram drawn on a grid: boxes are parts, lines are power, signal, radio or mechanical links. */
export function SystemDiagram({ diagram }: { diagram: Diagram }) {
  const cols = Math.max(...diagram.nodes.map((n) => n.col)) + 1;
  const rows = Math.max(...diagram.nodes.map((n) => n.row)) + 1;
  const width = cols * CELL_W + PAD * 2 - (CELL_W - BOX_W);
  const height = rows * CELL_H + PAD * 2 - (CELL_H - BOX_H);
  const pos = (id: string) => {
    const n = diagram.nodes.find((node) => node.id === id);
    if (!n) throw new Error(`Diagram "${diagram.title}": unknown node "${id}"`);
    return { x: PAD + n.col * CELL_W, y: PAD + n.row * CELL_H, col: n.col, row: n.row };
  };
  const kinds = [...new Set(diagram.links.map((l) => l.kind ?? "signal"))];

  return (
    <figure>
      <div className="panel ticks overflow-x-auto blueprint-grid">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={diagram.title}
          style={{ minWidth: Math.round(width * 0.68), width: "100%", maxHeight: 520, display: "block" }}
        >
          {diagram.links.map((link, i) => {
            const a = pos(link.from);
            const b = pos(link.to);
            const style = STYLE[link.kind ?? "signal"];
            let d: string;
            let lx: number;
            let ly: number;
            if (a.row === b.row) {
              const dir = b.col > a.col ? 1 : -1;
              const x1 = a.x + (dir > 0 ? BOX_W : 0);
              const x2 = b.x + (dir > 0 ? 0 : BOX_W);
              const y = a.y + BOX_H / 2 + (link.shift ?? 0);
              d = `M${x1} ${y}H${x2}`;
              lx = (x1 + x2) / 2;
              ly = y - 6;
            } else if (a.col === b.col) {
              const dir = b.row > a.row ? 1 : -1;
              const y1 = a.y + (dir > 0 ? BOX_H : 0);
              const y2 = b.y + (dir > 0 ? 0 : BOX_H);
              const x = a.x + BOX_W / 2 + (link.shift ?? 0);
              d = `M${x} ${y1}V${y2}`;
              lx = x + 6;
              ly = (y1 + y2) / 2 + 3;
            } else {
              // elbow: leave sideways, arrive from above or below
              const dirX = b.col > a.col ? 1 : -1;
              const dirY = b.row > a.row ? 1 : -1;
              const x1 = a.x + (dirX > 0 ? BOX_W : 0);
              const y1 = a.y + BOX_H / 2 + (link.shift ?? 0);
              const x2 = b.x + BOX_W / 2;
              const y2 = b.y + (dirY > 0 ? 0 : BOX_H);
              d = `M${x1} ${y1}H${x2}V${y2}`;
              lx = (x1 + x2) / 2;
              ly = y1 - 6;
            }
            const vertical = a.col === b.col;
            return (
              <g key={i}>
                <path d={d} fill="none" stroke={style.stroke} strokeWidth={1.25} strokeDasharray={style.dash} />
                {link.label && (
                  <text
                    x={lx}
                    y={ly}
                    textAnchor={vertical ? "start" : "middle"}
                    fontSize={9.5}
                    fontFamily="var(--font-mono)"
                    letterSpacing="0.06em"
                    fill="var(--color-muted)"
                    style={{ paintOrder: "stroke", stroke: "var(--color-surface)", strokeWidth: 4 }}
                  >
                    {link.label}
                  </text>
                )}
              </g>
            );
          })}

          {diagram.nodes.map((node) => {
            const { x, y } = pos(node.id);
            const main = node.kind === "mcu";
            return (
              <g key={node.id}>
                <rect
                  x={x}
                  y={y}
                  width={BOX_W}
                  height={BOX_H}
                  fill="var(--color-surface)"
                  stroke={main ? "var(--color-accent)" : "var(--color-line)"}
                  strokeWidth={main ? 1.5 : 1}
                />
                <text
                  x={x + 10}
                  y={y + (node.sub ? 26 : 36)}
                  fontSize={13}
                  fontWeight={600}
                  fontFamily="var(--font-display)"
                  fill="var(--color-text)"
                >
                  {node.label}
                </text>
                {node.sub && (
                  <text
                    x={x + 10}
                    y={y + 44}
                    fontSize={9.5}
                    fontFamily="var(--font-mono)"
                    letterSpacing="0.06em"
                    fill="var(--color-muted)"
                  >
                    {node.sub}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      <figcaption className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1">
        <span className="label" style={{ color: "var(--color-text)" }}>
          {diagram.title}
        </span>
        {kinds.map((kind) => (
          <span key={kind} className="label flex items-center gap-2">
            <svg width="28" height="6" aria-hidden>
              <path d="M0 3H28" stroke={STYLE[kind].stroke} strokeWidth={1.25} strokeDasharray={STYLE[kind].dash} />
            </svg>
            {STYLE[kind].label}
          </span>
        ))}
        {diagram.caption && (
          <span className="basis-full text-sm mt-1" style={{ color: "var(--color-muted)" }}>
            {diagram.caption}
          </span>
        )}
      </figcaption>
    </figure>
  );
}
