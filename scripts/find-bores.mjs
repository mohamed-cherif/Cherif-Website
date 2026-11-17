// Usage: node scripts/find-bores.mjs <axis x|y|z> <file.stl> [...]
// Finds cylindrical bores/bosses whose axis is parallel to the given axis by
// voting on circumcircles of side-wall vertices. Used to locate hinge pivots.
import { readStl } from "./stl.mjs";

const [axisName, ...files] = process.argv.slice(2);
const ax = { x: 0, y: 1, z: 2 }[axisName];
const [u, v] = [0, 1, 2].filter((i) => i !== ax);

for (const file of files) {
  const p = readStl(file);
  const pts = new Map();
  for (let t = 0; t < p.length; t += 9) {
    const a = [p[t], p[t + 1], p[t + 2]];
    const b = [p[t + 3], p[t + 4], p[t + 5]];
    const c = [p[t + 6], p[t + 7], p[t + 8]];
    const e1 = b.map((x, i) => x - a[i]);
    const e2 = c.map((x, i) => x - a[i]);
    const n = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
    const len = Math.hypot(...n) || 1;
    if (Math.abs(n[ax] / len) > 0.05) continue; // keep walls parallel to the axis
    for (const q of [a, b, c]) pts.set(`${q[u].toFixed(2)},${q[v].toFixed(2)}`, [q[u], q[v]]);
  }
  const list = [...pts.values()];
  const votes = new Map();
  // neighbours within 12 mm only, to keep triples local
  for (let i = 0; i < list.length; i++) {
    const near = [];
    for (let j = 0; j < list.length && near.length < 40; j++) {
      if (j !== i && Math.hypot(list[i][0] - list[j][0], list[i][1] - list[j][1]) < 12) near.push(list[j]);
    }
    for (let a = 0; a < near.length; a++)
      for (let b = a + 1; b < near.length; b++) {
        const c = circum(list[i], near[a], near[b]);
        if (!c || c.r < 0.8 || c.r > 8) continue;
        const key = `${c.x.toFixed(1)},${c.y.toFixed(1)},${c.r.toFixed(1)}`;
        votes.set(key, (votes.get(key) || 0) + 1);
      }
  }
  const top = [...votes.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
  console.log(`\n${file.split(/[\\/]/).pop()}  (${list.length} wall points)  [${"xyz"[u]},${"xyz"[v]},r] votes`);
  for (const [k, n] of top) console.log(`  ${k.padEnd(22)} ${n}`);
}

function circum(a, b, c) {
  const d = 2 * (a[0] * (b[1] - c[1]) + b[0] * (c[1] - a[1]) + c[0] * (a[1] - b[1]));
  if (Math.abs(d) < 1e-6) return null;
  const a2 = a[0] ** 2 + a[1] ** 2, b2 = b[0] ** 2 + b[1] ** 2, c2 = c[0] ** 2 + c[1] ** 2;
  const x = (a2 * (b[1] - c[1]) + b2 * (c[1] - a[1]) + c2 * (a[1] - b[1])) / d;
  const y = (a2 * (c[0] - b[0]) + b2 * (a[0] - c[0]) + c2 * (b[0] - a[0])) / d;
  return { x, y, r: Math.hypot(a[0] - x, a[1] - y) };
}
