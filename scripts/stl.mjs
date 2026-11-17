// Minimal STL reader (binary + ASCII). Returns a flat Float32Array of triangle
// vertex positions (9 floats per triangle), in the file's own units.
import { readFileSync } from "node:fs";

export function readStl(path) {
  const buf = readFileSync(path);
  if (isBinary(buf)) return readBinary(buf);
  return readAscii(buf.toString("latin1"));
}

function isBinary(buf) {
  if (buf.length < 84) return false;
  const count = buf.readUInt32LE(80);
  if (84 + count * 50 === buf.length) return true;
  // ASCII files start with "solid" and contain "facet"
  const head = buf.subarray(0, 512).toString("latin1");
  return !(head.trimStart().startsWith("solid") && head.includes("facet"));
}

function readBinary(buf) {
  const count = buf.readUInt32LE(80);
  const out = new Float32Array(count * 9);
  let o = 84;
  for (let i = 0; i < count; i++) {
    o += 12; // skip normal
    for (let k = 0; k < 9; k++) {
      out[i * 9 + k] = buf.readFloatLE(o);
      o += 4;
    }
    o += 2; // attribute byte count
  }
  return out;
}

function readAscii(text) {
  const re = /vertex\s+([-+0-9.eE]+)\s+([-+0-9.eE]+)\s+([-+0-9.eE]+)/g;
  const vals = [];
  let m;
  while ((m = re.exec(text))) vals.push(+m[1], +m[2], +m[3]);
  return new Float32Array(vals);
}

export function bounds(positions) {
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < positions.length; i += 3) {
    for (let k = 0; k < 3; k++) {
      const v = positions[i + k];
      if (v < min[k]) min[k] = v;
      if (v > max[k]) max[k] = v;
    }
  }
  return { min, max };
}
