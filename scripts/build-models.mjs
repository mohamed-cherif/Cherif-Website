// Usage: node scripts/build-models.mjs [id ...]
// Converts the CAD listed in models.config.mjs into compressed GLB files.
import { mkdirSync, readdirSync, readFileSync, writeFileSync, existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Document, NodeIO } from "@gltf-transform/core";
import { EXTMeshoptCompression, KHRMeshQuantization } from "@gltf-transform/extensions";
import { weld, simplify, meshopt, prune, getBounds } from "@gltf-transform/functions";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { MeshoptEncoder, MeshoptSimplifier } from "meshoptimizer";
import { readStl } from "./stl.mjs";
import { models } from "./models.config.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "models");
const metaPath = join(root, "src", "data", "models.generated.json");
mkdirSync(outDir, { recursive: true });

// Source axes → Y-up. Every mapping is a proper rotation (keeps winding).
const UP = {
  y: (x, y, z) => [x, y, z],
  "-y": (x, y, z) => [-x, -y, z],
  z: (x, y, z) => [x, z, -y],
  "-z": (x, y, z) => [x, -z, y],
  x: (x, y, z) => [-y, x, z],
};

function transform(positions, map) {
  const out = new Float32Array(positions.length);
  for (let i = 0; i < positions.length; i += 3) {
    const [x, y, z] = map(positions[i], positions[i + 1], positions[i + 2]);
    out[i] = x;
    out[i + 1] = y;
    out[i + 2] = z;
  }
  return out;
}

function box(positions) {
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < positions.length; i += 3)
    for (let k = 0; k < 3; k++) {
      if (positions[i + k] < min[k]) min[k] = positions[i + k];
      if (positions[i + k] > max[k]) max[k] = positions[i + k];
    }
  return { min, max };
}

const r2 = (n) => Math.round(n * 100) / 100;

await MeshoptEncoder.ready;
await MeshoptSimplifier.ready;
const io = new NodeIO()
  .registerExtensions([EXTMeshoptCompression, KHRMeshQuantization])
  .registerDependencies({ "meshopt.encoder": MeshoptEncoder });

const previous = existsSync(metaPath) ? JSON.parse(readFileSync(metaPath, "utf8")) : {};
// keep only models that are still in the config
const meta = Object.fromEntries(models.filter((m) => previous[m.id]).map((m) => [m.id, previous[m.id]]));
const only = process.argv.slice(2);

for (const model of models) {
  if (only.length && !only.includes(model.id)) continue;

  // Ready-made GLB (for example a PCB export with its own materials): just
  // compress it and record its bounds. The viewer shows it with its own colours.
  if (model.glb) {
    const rawIo = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ "meshopt.encoder": MeshoptEncoder });
    const doc = await rawIo.read(model.glb);
    await doc.transform(weld(), prune(), meshopt({ encoder: MeshoptEncoder, level: "medium" }));
    const file = join(outDir, `${model.id}.glb`);
    await rawIo.write(file, doc);
    const b = getBounds(doc.getRoot().listScenes()[0]);
    let n = 0;
    for (const mesh of doc.getRoot().listMeshes())
      for (const prim of mesh.listPrimitives()) n += (prim.getIndices()?.getCount() ?? prim.getAttribute("POSITION").getCount()) / 3;
    meta[model.id] = {
      src: `/models/${model.id}.glb`,
      bytes: statSync(file).size,
      triangles: Math.round(n),
      min: b.min.map((v) => r2(v * (model.unitScale ?? 1))),
      max: b.max.map((v) => r2(v * (model.unitScale ?? 1))),
      raw: true,
      unitScale: model.unitScale ?? 1,
      parts: [{ name: model.name ?? model.id, role: "structure", center: [0, 0, 0], size: [0, 0, 0] }],
    };
    console.log(`${model.id.padEnd(22)} raw glb ${String(Math.round(n)).padStart(7)} tris  ${(statSync(file).size / 1024).toFixed(0).padStart(5)} KB  bounds ${b.min.map((v) => v.toFixed(3))} .. ${b.max.map((v) => v.toFixed(3))}`);
    continue;
  }
  const map = UP[model.up ?? "z"];
  const pre = model.pre ?? ((x, y, z) => [x, y, z]);
  const doc = new Document();
  const buffer = doc.createBuffer();
  const scene = doc.createScene(model.id);

  let parts = model.parts ?? [];
  if (model.merge) {
    // Merge every STL in a folder into one part.
    const chunks = readdirSync(model.dir)
      .filter((f) => f.toLowerCase().endsWith(".stl"))
      .map((f) => readStl(join(model.dir, f)));
    const total = chunks.reduce((n, c) => n + c.length, 0);
    const merged = new Float32Array(total);
    let o = 0;
    for (const c of chunks) {
      merged.set(c, o);
      o += c.length;
    }
    parts = [{ name: model.merge, positions: merged, role: model.role ?? "reference" }];
  }

  const partMeta = [];
  const all = { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] };
  let tris = 0;

  for (const part of parts) {
    const raw = part.positions ?? readStl(part.file);
    const place = part.place ?? ((x, y, z) => [x, y, z]);
    const positions = transform(transform(transform(raw, place), pre), map);
    const b = box(positions);
    for (let k = 0; k < 3; k++) {
      all.min[k] = Math.min(all.min[k], b.min[k]);
      all.max[k] = Math.max(all.max[k], b.max[k]);
    }
    tris += positions.length / 9;

    const accessor = doc.createAccessor().setType("VEC3").setArray(positions).setBuffer(buffer);
    const prim = doc.createPrimitive().setAttribute("POSITION", accessor);
    const mesh = doc.createMesh(part.name).addPrimitive(prim);
    scene.addChild(doc.createNode(part.name).setMesh(mesh));

    const entry = {
      name: part.name,
      role: part.role ?? "structure",
      center: b.min.map((v, i) => r2((v + b.max[i]) / 2)),
      size: b.min.map((v, i) => r2(b.max[i] - v)),
    };
    if (part.pivot) {
      const at = map(...pre(...place(...part.pivot.at)));
      const axisVec = { x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] }[part.pivot.axis];
      const o = map(...pre(...place(0, 0, 0)));
      const a = map(...pre(...place(...axisVec)));
      entry.pivot = {
        at: at.map(r2),
        axis: a.map((v, i) => r2(v - o[i])),
        open: part.pivot.open,
      };
    }
    if (part.slide) {
      const o = map(...pre(...place(0, 0, 0)));
      const a = map(...pre(...place(...part.slide.axis)));
      entry.slide = { axis: a.map((v, i) => r2(v - o[i])), mm: part.slide.mm };
    }
    if (part.note) entry.note = part.note;
    partMeta.push(entry);
  }

  await doc.transform(weld());
  if (model.simplify) {
    await doc.transform(simplify({ simplifier: MeshoptSimplifier, ratio: model.simplify, error: 0.01 }));
  }
  await doc.transform(prune(), meshopt({ encoder: MeshoptEncoder, level: "medium" }));

  const file = join(outDir, `${model.id}.glb`);
  await io.write(file, doc);

  let outTris = 0;
  for (const mesh of doc.getRoot().listMeshes())
    for (const prim of mesh.listPrimitives()) outTris += (prim.getIndices()?.getCount() ?? 0) / 3;

  meta[model.id] = {
    src: `/models/${model.id}.glb`,
    bytes: statSync(file).size,
    triangles: Math.round(outTris),
    min: all.min.map(r2),
    max: all.max.map(r2),
    parts: partMeta,
  };
  console.log(
    `${model.id.padEnd(22)} ${String(parts.length).padStart(2)} parts  ${String(tris).padStart(7)} → ${String(Math.round(outTris)).padStart(6)} tris  ${(statSync(file).size / 1024).toFixed(0).padStart(5)} KB  size ${all.max.map((v, i) => (v - all.min[i]).toFixed(0)).join("×")} mm`
  );
}

mkdirSync(dirname(metaPath), { recursive: true });
writeFileSync(metaPath, JSON.stringify(meta, null, 2) + "\n");
