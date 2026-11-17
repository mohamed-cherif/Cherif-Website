// Usage: node scripts/probe-stl.mjs <dir> [<dir>...]
// Prints triangle count, bounding box and size for every STL in the folders.
import { readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { readStl, bounds } from "./stl.mjs";

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (extname(name).toLowerCase() === ".stl") out.push(p);
  }
  return out;
}

const f = (n) => n.toFixed(1).padStart(8);
for (const dir of process.argv.slice(2)) {
  console.log(`\n== ${dir}`);
  for (const file of walk(dir)) {
    const pos = readStl(file);
    const { min, max } = bounds(pos);
    const size = max.map((v, i) => v - min[i]);
    console.log(
      `${String(pos.length / 9).padStart(7)} tri  min[${min.map(f)}] max[${max.map(f)}] size[${size.map(f)}]  ${file.slice(dir.length + 1)}`
    );
  }
}
