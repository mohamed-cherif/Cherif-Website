"use client";

import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

/* WiFi search-and-rescue robots (CalHacks 13.0), as a small top-down simulation.
   Four boards around a taped zone -> 6 links -> tomography heatmap -> smoothed estimate ->
   A* path round a wall -> mission state machine. Constants are the project's own where
   they exist (file named next to each group); the radio signal itself is simulated. */

type Pt = { x: number; y: number };
type Mission = "sentry" | "dispatch" | "verify" | "found" | "follow" | "return";
const STATES: Mission[] = ["sentry", "dispatch", "verify", "found", "follow", "return"];

// Floor plan in metres (AGENTS.md), drawn landscape: demo x = real y, demo y = real x.
const ZW = 2.38, ZH = 1.97, OUT = 0.18; // taped zone; boards 18 cm outside each corner
const BOARDS: Pt[] = [{ x: -OUT, y: -OUT }, { x: ZW + OUT, y: -OUT }, { x: ZW + OUT, y: ZH + OUT }, { x: -OUT, y: ZH + OUT }];
const LINKS: [number, number][] = [[0, 1], [1, 2], [2, 3], [3, 0], [0, 2], [1, 3]];
const WALL_A: Pt = { x: 0.55, y: 0 }, WALL_B: Pt = { x: 0.55, y: 1.3 }; // the team's front (virtual) wall
const DOCK: Pt = { x: 0.295, y: 0.75 }; // robot A's sentry spot

// Localizer (presence_server.py): 10 cm cells, ellipse scale, "disturbed" ratio, centroid of cells >= 60 % of peak, 5 Hz.
const GRID = 0.1, ELLIPSE = 0.35, ACTIVE = 0.8, PEAK_FRAC = 0.6, SENSE_S = 0.2;
const GX0 = -0.2, GY0 = -0.2, GNX = 28, GNY = 24;
// Planner and navigator (planner.py): 5 cm grid, 13 cm wall clearance, replan every second.
const CELL = 0.05, CLEAR = 0.13, REPLAN_S = 1, REACHED = 0.03;
const PNX = Math.round(ZW / CELL) + 1, PNY = Math.round(ZH / CELL) + 1;
// Mission (mission.py MissionConfig) and drive speeds (config.json + sim.py, m/s).
// Re-aiming uses follow mode's 25 cm (the team's active config) while dispatched too; plain dispatch uses 80 cm.
const STANDOFF = 0.45, RETARGET = 0.25, DETECT_HOLD = 2, ARRIVE_TOL = 0.1;
const HOME_TOL = 0.15, VERIFY_RADIUS = 1.5, FOUND_HOLD = 20;
const VERIFY_S = 3, SETTLE_S = 2; // shortened for the demo (real: 8 s and 5 s)
const V_MIN = 0.18, V_MAX = 0.32, SLOW_M = 0.4, DRIVE_ARRIVE = 0.08;
// Demo-only: timestep, walking speed, estimate smoothing, link noise, simulated link signal and match width.
const STEP = 1 / 60, WALK = 0.15, EST_TAU = 0.5, NOISE_TAU = 2.5, GAIN = 2.4, BASE = 0.2, MATCH = 0.3;

const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const inZone = (p: Pt): Pt => ({ x: clamp(p.x, 0.05, ZW - 0.05), y: clamp(p.y, 0.05, ZH - 0.05) });
const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) * 2;
const excess = (p: Pt, a: Pt, b: Pt) => dist(p, a) + dist(p, b) - dist(a, b); // extra path via p
function wallDist(p: Pt) {
  const dx = WALL_B.x - WALL_A.x, dy = WALL_B.y - WALL_A.y;
  const t = clamp(((p.x - WALL_A.x) * dx + (p.y - WALL_A.y) * dy) / (dx * dx + dy * dy), 0, 1);
  return Math.hypot(p.x - WALL_A.x - t * dx, p.y - WALL_A.y - t * dy);
}

// Each link's sensing ellipse sampled on the heatmap grid (geometry is fixed, so once).
const heatPt = (c: number): Pt => ({ x: GX0 + ((c % GNX) + 0.5) * GRID, y: GY0 + (Math.floor(c / GNX) + 0.5) * GRID });
const SHAPE = LINKS.map(([a, b]) =>
  Float32Array.from({ length: GNX * GNY }, (_, c) => Math.exp(-((excess(heatPt(c), BOARDS[a], BOARDS[b]) / ELLIPSE) ** 2))),
);
// Planner grid: every point closer than the clearance to the wall is blocked.
const gridPt = (c: number): Pt => ({ x: (c % PNX) * CELL, y: Math.floor(c / PNX) * CELL });
const BLOCKED = Uint8Array.from({ length: PNX * PNY }, (_, c) => (wallDist(gridPt(c)) < CLEAR ? 1 : 0));

/** Straight p -> q keeps clear of the wall (right at p the robot may be close, unless strict). */
function clearLine(p: Pt, q: Pt, strict: boolean) {
  const n = Math.max(2, Math.floor(dist(p, q) / (CELL / 2)) + 1);
  for (let i = 0; i <= n; i++) {
    const s = { x: p.x + ((q.x - p.x) * i) / n, y: p.y + ((q.y - p.y) * i) / n };
    if ((strict || dist(s, p) > CLEAR) && wallDist(s) < CLEAR) return false;
  }
  return true;
}
function nearestFreeCell(p: Pt) {
  let best = 0, bd = Infinity;
  for (let c = 0; c < BLOCKED.length; c++) {
    const d = BLOCKED[c] ? Infinity : dist(gridPt(c), p);
    if (d < bd) { bd = d; best = c; }
  }
  return best;
}
const nearestFree = (p: Pt): Pt => (wallDist(p) >= CLEAR ? p : gridPt(nearestFreeCell(p)));

/** A* on the 8-connected grid, then straightened: waypoints after `start`, ending at the goal. */
function plan(start: Pt, to: Pt): Pt[] {
  const goal = nearestFree(to);
  if (clearLine(start, goal, false)) return [goal];
  const cellOf = (p: Pt) => clamp(Math.round(p.x / CELL), 0, PNX - 1) + PNX * clamp(Math.round(p.y / CELL), 0, PNY - 1);
  const s = cellOf(start);
  const g = BLOCKED[cellOf(goal)] ? nearestFreeCell(goal) : cellOf(goal);
  const cost = new Float32Array(PNX * PNY).fill(Infinity), f = new Float32Array(PNX * PNY);
  const came = new Int32Array(PNX * PNY).fill(-1);
  const open = [s];
  cost[s] = 0;
  while (open.length) {
    let bi = 0; // lowest f by linear scan: the grid is only ~2000 cells
    for (let i = 1; i < open.length; i++) if (f[open[i]] < f[open[bi]]) bi = i;
    const c = open.splice(bi, 1)[0];
    if (c === g) break;
    const cx = c % PNX, cy = Math.floor(c / PNX);
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
      const nx = cx + dx, ny = cy + dy, n = nx + PNX * ny;
      if ((!dx && !dy) || nx < 0 || ny < 0 || nx >= PNX || ny >= PNY || BLOCKED[n]) continue;
      const nc = cost[c] + Math.hypot(dx, dy);
      if (nc < cost[n]) {
        cost[n] = nc; came[n] = c;
        f[n] = nc + Math.hypot(nx - (g % PNX), ny - Math.floor(g / PNX));
        open.push(n);
      }
    }
  }
  if (came[g] < 0) return [goal];
  const pts: Pt[] = [goal];
  for (let c = came[g]; c !== s && c >= 0; c = came[c]) pts.unshift(gridPt(c));
  const out: Pt[] = [];
  for (let i = 0, cur = start; i < pts.length; ) { // jump to the farthest waypoint in plain view
    let j = pts.length - 1;
    while (j > i && !clearLine(cur, pts[j], out.length > 0)) j--;
    out.push(pts[j]); cur = pts[j]; i = j + 1;
  }
  return out;
}

/** The point `back` metres before the end of a route (the stop point short of the person). */
function backAlong(pts: Pt[], back: number): Pt {
  for (let i = pts.length - 1; i > 0; i--) {
    const a = pts[i], b = pts[i - 1], d = dist(a, b);
    if (d >= back) return { x: a.x + ((b.x - a.x) * back) / d, y: a.y + ((b.y - a.y) * back) / d };
    back -= d;
  }
  return pts[0];
}

/** Radio tomography image: each cell collects evidence from all six links, scoring how well their
 *  disturbance matches a person standing in that cell (inside a link's ellipse = that link should be lit).
 *  The real server adds disturbed links' ellipses and subtracts quiet ones; this matched form of the same
 *  idea tracks better on a zone this small. Returns the centroid of the cells near the peak. */
function localize(ratio: number[], heat: Float32Array): Pt | null {
  if (!ratio.some((r) => r >= ACTIVE)) { heat.fill(0); return null; }
  const lit = ratio.map((r) => clamp((r - BASE) / GAIN, 0, 1.2));
  let peak = 0;
  for (let c = 0; c < heat.length; c++) {
    let d2 = 0;
    for (let l = 0; l < lit.length; l++) d2 += (lit[l] - SHAPE[l][c]) ** 2;
    peak = Math.max(peak, (heat[c] = Math.exp(-d2 / (2 * MATCH * MATCH))));
  }
  let sw = 0, sx = 0, sy = 0;
  for (let c = 0; c < heat.length; c++) {
    const v = heat[c], p = heatPt(c);
    if (v >= PEAK_FRAC * peak) { sw += v; sx += v * p.x; sy += v * p.y; }
    heat[c] = Math.max(0, v / peak);
  }
  return { x: sx / sw, y: sy / sw };
}

type Sim = {
  t: number; acc: number; senseT: number; replanT: number; since: number; seen: number; foundAt: number;
  person: Pt; wanderTo: Pt; pause: number; auto: boolean; dragging: boolean;
  noise: number[]; ratio: number[]; heat: Float32Array; raw: Pt | null; est: Pt | null;
  robot: Pt; target: Pt; aimedAt: Pt; path: Pt[]; state: Mission;
};
const createSim = (): Sim => ({
  t: 0, acc: 0, senseT: -1, replanT: 0, since: 0, seen: 0, foundAt: 0,
  person: { x: 2.05, y: 1.5 }, wanderTo: { x: 1.9, y: 0.45 }, pause: 0, auto: true, dragging: false,
  noise: LINKS.map(gauss), ratio: LINKS.map(() => 0), heat: new Float32Array(GNX * GNY), raw: null, est: null,
  robot: { ...DOCK }, target: DOCK, aimedAt: DOCK, path: [], state: "sentry",
});

function stepToward(p: Pt, to: Pt, len: number) {
  const d = dist(p, to);
  if (d < 1e-6) return;
  const k = Math.min(1, len / d);
  p.x += (to.x - p.x) * k; p.y += (to.y - p.y) * k;
}

/** One fixed step: person -> links -> heatmap/estimate -> mission -> robot. */
function step(s: Sim, dt: number) {
  s.t += dt;
  if (s.auto && !s.dragging) { // attract mode: stroll between random spots with short stops
    if (s.pause > 0) s.pause -= dt;
    else if (dist(s.person, s.wanderTo) < 0.02) {
      s.wanderTo = { x: 0.9 + Math.random() * 1.25, y: 0.25 + Math.random() * 1.45 };
      s.pause = 1 + Math.random() * 2.5;
    } else stepToward(s.person, s.wanderTo, WALK * dt);
  }
  LINKS.forEach(([a, b], i) => { // a body in a link's ellipse disturbs it; slow noise so it reads like a signal
    s.noise[i] += (-s.noise[i] / NOISE_TAU) * dt + Math.sqrt((2 * dt) / NOISE_TAU) * gauss();
    const sig = Math.exp(-((excess(s.person, BOARDS[a], BOARDS[b]) / ELLIPSE) ** 2));
    s.ratio[i] = Math.max(0, GAIN * sig * (1 + 0.2 * s.noise[i]) + BASE + 0.12 * s.noise[i]);
  });
  if (s.t - s.senseT >= SENSE_S) { s.senseT = s.t; s.raw = localize(s.ratio, s.heat); }
  if (!s.raw) s.est = null; // light smoothing; stands in for the project's Kalman tracker
  else if (!s.est) s.est = { ...s.raw };
  else stepToward(s.est, s.raw, dist(s.est, s.raw) * (1 - Math.exp(-dt / EST_TAU)));

  const set = (st: Mission) => { s.state = st; s.since = s.t; };
  const go = (target: Pt) => { s.target = target; s.path = plan(s.robot, target); s.replanT = s.t; };
  const aim = (est: Pt) => { // stop 45 cm short of the estimate, measured back along the planned route
    go(nearestFree(inZone(backAlong([s.robot, ...plan(s.robot, est)], STANDOFF))));
    s.aimedAt = { ...est };
  };
  const arrived = dist(s.robot, s.target) <= ARRIVE_TOL;
  const { est } = s;
  if (s.state === "sentry") {
    s.seen = est ? s.seen + dt : Math.min(s.seen, 0);
    if (est && s.seen >= DETECT_HOLD) { aim(est); set("dispatch"); }
  } else if (s.state === "dispatch") {
    if (est && dist(est, s.aimedAt) > RETARGET) aim(est);
    if (arrived) set("verify");
  } else if (s.state === "verify") { // hold still and listen
    if (s.t - s.since >= VERIFY_S) {
      if (est && dist(est, s.target) <= VERIFY_RADIUS) { set("found"); s.foundAt = s.t; }
      else { go(DOCK); set("return"); }
    }
  } else if (s.state === "found" || s.state === "follow") {
    if (s.t - s.foundAt >= FOUND_HOLD) { go(DOCK); set("return"); }
    else if (est && dist(est, s.aimedAt) > RETARGET) { aim(est); set("follow"); }
    else if (s.state === "follow" && arrived) set("found");
  } else if (dist(s.robot, DOCK) <= HOME_TOL) { set("sentry"); s.seen = -SETTLE_S; }

  const dGoal = dist(s.robot, s.target); // drive along the path, slowing near the goal
  if (dGoal <= DRIVE_ARRIVE) { s.path = []; return; }
  if (s.t - s.replanT >= REPLAN_S) go(s.target);
  while (s.path.length > 1 && dist(s.robot, s.path[0]) < REACHED) s.path.shift();
  const v = dGoal < SLOW_M ? V_MIN + ((V_MAX - V_MIN) * dGoal) / SLOW_M : V_MAX;
  stepToward(s.robot, s.path[0] ?? s.target, v * dt);
}

type Hud = { state: Mission; links: number; est: Pt | null; err: number | null; path: number; auto: boolean; ratio: number[] };
const HUD0: Hud = { state: "sentry", links: 0, est: null, err: null, path: 0, auto: true, ratio: LINKS.map(() => 0) };
const readout = (s: Sim): Hud => ({
  state: s.state, auto: s.auto, est: s.est && { ...s.est }, ratio: [...s.ratio],
  links: s.ratio.filter((r) => r >= ACTIVE).length,
  err: s.est && dist(s.est, s.person),
  path: s.path.reduce((a, p, i) => a + dist(i ? s.path[i - 1] : s.robot, p), 0),
});

type Theme = { bg: string; surface: string; text: string; muted: string; border: string; line: string; accent: string; mono: string };
function readTheme(): Theme {
  const css = getComputedStyle(document.documentElement);
  const v = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback;
  return {
    bg: v("--color-bg", "#0a0b0d"), surface: v("--color-surface", "#101214"), text: v("--color-text", "#e9ebee"),
    muted: v("--color-muted", "#8b9199"), border: v("--color-border", "#22262b"), line: v("--color-line", "#3a4047"),
    accent: v("--color-accent", "#ff5a1f"),
    mono: getComputedStyle(document.body).getPropertyValue("--font-mono").trim() || "ui-monospace, monospace",
  };
}

// World -> canvas: fit the zone plus a margin for the boards and their labels.
const MX = 0.5, MY = 0.46;
function view(w: number, h: number) {
  const k = Math.min(w / (ZW + 2 * MX), h / (ZH + 2 * MY));
  return { k, ox: (w - ZW * k) / 2, oy: (h - ZH * k) / 2 };
}

function draw(ctx: CanvasRenderingContext2D, w: number, h: number, dpr: number, s: Sim, th: Theme) {
  const { k, ox, oy } = view(w, h);
  const X = (x: number) => Math.round(ox + x * k) + 0.5, Y = (y: number) => Math.round(oy + y * k) + 0.5;
  const poly = (pts: Pt[], color: string, dash: number[] = [], close = false) => {
    ctx.beginPath();
    pts.forEach((p, i) => (i ? ctx.lineTo(X(p.x), Y(p.y)) : ctx.moveTo(X(p.x), Y(p.y))));
    if (close) ctx.closePath();
    ctx.strokeStyle = color; ctx.setLineDash(dash); ctx.stroke(); ctx.setLineDash([]);
  };
  const text = (str: string, x: number, y: number, color: string, align: CanvasTextAlign = "left") => {
    ctx.fillStyle = color; ctx.textAlign = align; ctx.fillText(str.toUpperCase(), x, y);
  };
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = th.bg; ctx.fillRect(0, 0, w, h);
  ctx.font = `10px ${th.mono}`; ctx.textBaseline = "middle"; ctx.lineWidth = 1;

  // Heatmap: coarse 10 cm cells in stepped opacity; cells >= 60 % of the peak (the ones the estimate uses) stand out.
  ctx.fillStyle = th.accent;
  for (let c = 0; c < s.heat.length; c++) {
    const lvl = Math.floor(s.heat[c] * 5) / 5;
    if (lvl < 0.2) continue;
    const x0 = Math.round(ox + (GX0 + (c % GNX) * GRID) * k), y0 = Math.round(oy + (GY0 + Math.floor(c / GNX) * GRID) * k);
    const x1 = Math.round(ox + (GX0 + ((c % GNX) + 1) * GRID) * k), y1 = Math.round(oy + (GY0 + (Math.floor(c / GNX) + 1) * GRID) * k);
    ctx.globalAlpha = lvl < 0.6 ? 0.03 + 0.1 * lvl : 0.25 + 0.75 * (lvl - 0.6);
    ctx.fillRect(x0 + 1, y0 + 1, x1 - x0 - 1, y1 - y0 - 1);
  }
  ctx.globalAlpha = 1;

  // Taped zone, scale bar, wall with its clearance band, sentry spot.
  poly([{ x: 0, y: 0 }, { x: ZW, y: 0 }, { x: ZW, y: ZH }, { x: 0, y: ZH }], th.line, [], true);
  text(`${w < 420 ? "" : "Zone "}${ZW} x ${ZH} m`, X(ZW) - 6, Y(0) + 10, th.muted, "right");
  poly([{ x: ZW / 2 - 0.25, y: ZH + 0.33 }, { x: ZW / 2 + 0.25, y: ZH + 0.33 }], th.muted);
  text("0.5 m", X(ZW / 2 + 0.25) + 6, Y(ZH + 0.33), th.muted);
  const c0 = { x: WALL_A.x - CLEAR, y: 0 }, c1 = { x: WALL_B.x + CLEAR, y: WALL_B.y + CLEAR };
  poly([c0, { x: c1.x, y: c0.y }, c1, { x: c0.x, y: c1.y }], th.line, [2, 3], true);
  ctx.lineWidth = 3; poly([WALL_A, WALL_B], th.text); ctx.lineWidth = 1;
  text("Wall", X(WALL_B.x) + 7, Y(0.12), th.muted);
  const d = 0.13;
  poly([{ x: DOCK.x - d, y: DOCK.y - d }, { x: DOCK.x + d, y: DOCK.y - d }, { x: DOCK.x + d, y: DOCK.y + d }, { x: DOCK.x - d, y: DOCK.y + d }], th.muted, [3, 3], true);
  text("Spot", X(DOCK.x), Y(DOCK.y - d) - 8, th.muted, "center");

  // Links: hairline when quiet, accent in proportion to disturbance.
  LINKS.forEach(([a, b], i) => {
    poly([BOARDS[a], BOARDS[b]], th.border);
    ctx.globalAlpha = clamp(s.ratio[i] / 2.2, 0, 1);
    ctx.lineWidth = s.ratio[i] >= ACTIVE ? 2 : 1;
    poly([BOARDS[a], BOARDS[b]], th.accent);
    ctx.globalAlpha = 1; ctx.lineWidth = 1;
  });
  BOARDS.forEach((b, i) => {
    ctx.fillStyle = th.text; ctx.fillRect(X(b.x) - 4.5, Y(b.y) - 4.5, 9, 9);
    text(i ? `B${i + 1}` : "B1 gateway", X(b.x) + (i === 1 || i === 2 ? 5 : -5), Y(b.y) + (i < 2 ? -13 : 13), th.muted, i === 1 || i === 2 ? "right" : "left");
  });

  // Planned path (dashed) to the stop point, then the robot (a 3-wheel omni: triangle).
  if (s.path.length) {
    poly([s.robot, ...s.path], th.text, [5, 4]);
    const e = s.path[s.path.length - 1];
    ctx.strokeStyle = th.text; ctx.strokeRect(X(e.x) - 3, Y(e.y) - 3, 6, 6);
  }
  const rr = Math.max(7, 0.09 * k), rx = X(s.robot.x), ry = Y(s.robot.y);
  ctx.beginPath(); ctx.moveTo(rx, ry - rr); ctx.lineTo(rx + rr, ry + rr * 0.8); ctx.lineTo(rx - rr, ry + rr * 0.8); ctx.closePath();
  ctx.fillStyle = th.surface; ctx.fill(); ctx.strokeStyle = th.text; ctx.stroke();
  ctx.fillStyle = th.text; ctx.fillRect(rx - 1.5, ry - 0.5, 3, 3);
  text("Robot", rx, ry + rr + 9, th.text, "center");

  // Estimate (crosshair + square ring), its error to the true position, and the person (diamond).
  const px = X(s.person.x), py = Y(s.person.y);
  if (s.est) {
    const ex = X(s.est.x), ey = Y(s.est.y), q = 9;
    poly([s.est, s.person], th.muted, [1, 3]);
    ctx.strokeStyle = th.accent; ctx.strokeRect(ex - q, ey - q, 2 * q, 2 * q);
    ctx.beginPath();
    for (const [ax, ay] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { ctx.moveTo(ex + ax * 4, ey + ay * 4); ctx.lineTo(ex + ax * (q + 7), ey + ay * (q + 7)); }
    ctx.stroke();
    text("Est", ex - q - 4, ey + q + 7, th.accent, "right");
  }
  const pr = s.dragging ? 9 : 7;
  ctx.beginPath(); ctx.moveTo(px, py - pr); ctx.lineTo(px + pr, py); ctx.lineTo(px, py + pr); ctx.lineTo(px - pr, py); ctx.closePath();
  ctx.fillStyle = th.text; ctx.fill(); ctx.strokeStyle = th.bg; ctx.stroke();
  text("Person", px + pr + 5, py - pr - 3, th.text);
}

export default function WifiSensingDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const simRef = useRef<Sim | null>(null);
  const [hud, setHud] = useState<Hud>(HUD0);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current, ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const sim = (simRef.current ??= createSim());
    let theme = readTheme(), w = 0, h = 0, dpr = 1, raf = 0, last = 0, hudAt = 0, onScreen = false;
    const paint = () => { if (w && h) draw(ctx, w, h, dpr, sim, theme); };
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      sim.acc += Math.min(0.1, (now - last) / 1000); // fixed 60 Hz steps, whatever the refresh rate
      last = now;
      for (; sim.acc >= STEP; sim.acc -= STEP) step(sim, STEP);
      paint();
      if (now - hudAt >= 100) { hudAt = now; setHud(readout(sim)); } // readout at 10 Hz
    };
    const sync = () => { // run only while on screen and the tab is visible
      const run = onScreen && !document.hidden;
      if (run && !raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
      if (!run && raf) { cancelAnimationFrame(raf); raf = 0; }
    };
    const resize = new ResizeObserver(() => {
      const r = canvas.getBoundingClientRect();
      dpr = window.devicePixelRatio || 1; w = r.width; h = r.height;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      paint();
    });
    resize.observe(canvas);
    const seen = new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; sync(); });
    seen.observe(canvas);
    const themed = new MutationObserver(() => { theme = readTheme(); paint(); });
    themed.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    document.addEventListener("visibilitychange", sync);
    document.fonts?.ready.then(() => { theme = readTheme(); paint(); });
    return () => {
      cancelAnimationFrame(raf); resize.disconnect(); seen.disconnect(); themed.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  // Dragging the person: pointer position -> metres; the visitor is then in control.
  const toWorld = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect(), { k, ox, oy } = view(r.width, r.height);
    return { p: { x: (e.clientX - r.left - ox) / k, y: (e.clientY - r.top - oy) / k }, k };
  };
  const onDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const s = simRef.current, { p, k } = toWorld(e);
    if (!s || dist(p, s.person) > Math.max(0.35, 30 / k)) return;
    s.dragging = true; s.auto = false; s.person = inZone(p);
    setDragging(true);
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* pointer already gone: the drag still works */ }
  };
  const onMove = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const s = simRef.current;
    if (s?.dragging) s.person = inZone(toWorld(e).p);
  };
  const onUp = () => {
    if (simRef.current) simRef.current.dragging = false;
    setDragging(false);
  };
  const resumeAuto = () => {
    const s = simRef.current;
    if (s) { s.auto = true; s.pause = 0; s.wanderTo = { ...s.person }; }
  };

  const border = { borderColor: "var(--color-border)" };
  const rows: [string, string][] = [
    ["Links disturbed", `${hud.links}/${LINKS.length}`],
    ["Estimate x, y", hud.est ? `${hud.est.x.toFixed(2)}, ${hud.est.y.toFixed(2)} m` : "none"],
    ["Error vs true", hud.err === null ? "n/a" : `${hud.err.toFixed(2)} m`],
    ["Path length", `${hud.path.toFixed(2)} m`],
    ["State", hud.state],
  ];
  return (
    <div className="panel ticks">
      <div className="grid lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)]">
        <div className="min-w-0">
          <div className="relative w-full" style={{ aspectRatio: "4 / 3", background: "var(--color-bg)" }}>
            <canvas
              ref={canvasRef}
              role="img"
              aria-label="Top-down simulation: four WiFi boards around a taped zone sense a person from the links they disturb, a heatmap gives a position estimate, and a robot plans a path around a wall to reach it."
              className="absolute inset-0 h-full w-full"
              style={{ touchAction: "none", cursor: dragging ? "grabbing" : "grab" }}
              onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
            />
          </div>
          <div className="flex flex-wrap items-center gap-1.5 border-t px-3 py-2.5" style={border}>
            <span className="label mr-1">Mission</span>
            {STATES.map((st) => (
              <span key={st} className="tech-chip" aria-current={st === hud.state ? "step" : undefined}
                style={st === hud.state ? { color: "var(--color-accent)", borderColor: "var(--color-accent)" } : undefined}>
                {st}
              </span>
            ))}
          </div>
        </div>
        <div className="flex min-w-0 flex-col gap-4 border-t p-4 font-mono text-xs lg:border-l lg:border-t-0" style={{ ...border, color: "var(--color-text)" }}>
          <div className="flex items-center justify-between gap-3">
            <span className="label">WiFi sensing / live sim</span>
            <button type="button" className="btn px-2 py-1" onClick={resumeAuto} aria-pressed={hud.auto}
              title="Let the person wander on their own"
              style={hud.auto ? { color: "var(--color-accent)", borderColor: "var(--color-accent)" } : undefined}>
              Auto
            </button>
          </div>
          <dl className="tabular-nums">
            {rows.map(([name, value]) => (
              <div key={name} className="flex items-baseline justify-between gap-3 border-b py-1.5" style={border}>
                <dt className="label">{name}</dt>
                <dd style={name === "State" ? { color: "var(--color-accent)" } : undefined}>{value}</dd>
              </div>
            ))}
          </dl>
          <div className="flex flex-col gap-1.5" aria-hidden="true">
            <span className="label">Link disturbance</span>
            {LINKS.map(([a, b], i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="label w-10 shrink-0">B{a + 1}-B{b + 1}</span>
                <div className="h-1.5 flex-1" style={{ background: "var(--color-border)" }}>
                  <div className="h-full" style={{
                    width: `${clamp(hud.ratio[i] / 3, 0, 1) * 100}%`,
                    background: hud.ratio[i] >= ACTIVE ? "var(--color-accent)" : "var(--color-line)",
                  }} />
                </div>
              </div>
            ))}
          </div>
          <p className="label mt-auto">{hud.auto ? "Drag the person to take over." : "You are in control. Auto returns to wandering."}</p>
        </div>
      </div>
      <p className="border-t px-3 py-2 font-mono text-[11px]" style={{ ...border, color: "var(--color-muted)" }}>
        A simplified browser simulation of the pipeline, not the recorded data.
      </p>
    </div>
  );
}
