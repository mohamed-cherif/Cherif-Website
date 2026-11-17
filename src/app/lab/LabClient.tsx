"use client";

// Scratch page for checking models while building the site. Not linked.
import { useEffect, useState } from "react";
import { ModelViewer } from "@/components/three/ModelViewer";
import generated from "@/data/models.generated.json";

export default function LabClient() {
  const ids = Object.keys(generated);
  const q = typeof window === "undefined" ? new URLSearchParams() : new URLSearchParams(window.location.search);
  const [id, setId] = useState(q.get("id") ?? ids[0]);
  const [explode, setExplode] = useState(+(q.get("explode") ?? 0));
  const [open, setOpen] = useState(+(q.get("open") ?? 0));
  const [ghost, setGhost] = useState(q.has("ghost"));
  const [zoom, setZoom] = useState(+(q.get("zoom") ?? 1));
  const [az, setAz] = useState<number | undefined>(q.has("az") ? +q.get("az")! : undefined);
  // capture scripts turn the model by dispatching "lab-az" events
  useEffect(() => {
    const onAz = (e: Event) => setAz((e as CustomEvent<number>).detail);
    window.addEventListener("lab-az", onAz);
    return () => window.removeEventListener("lab-az", onAz);
  }, []);
  const bare = q.has("bare");
  const el = q.has("el") ? +q.get("el")! : undefined;
  return (
    <main className="p-6 pt-24 max-w-5xl mx-auto" suppressHydrationWarning>
      <div className="flex flex-wrap gap-2 mb-4">
        {ids.map((m) => (
          <button key={m} className="btn" onClick={() => setId(m)} style={m === id ? { borderColor: "var(--color-accent)" } : {}}>
            {m}
          </button>
        ))}
      </div>
      <div className="flex gap-6 mb-4 label">
        <label>explode <input type="range" min={0} max={1} step={0.01} value={explode} onChange={(e) => setExplode(+e.target.value)} /></label>
        <label>open <input type="range" min={0} max={1} step={0.01} value={open} onChange={(e) => setOpen(+e.target.value)} /></label>
        <label>zoom <input type="range" min={0.2} max={1.5} step={0.01} value={zoom} onChange={(e) => setZoom(+e.target.value)} /></label>
        <label><input type="checkbox" checked={ghost} onChange={(e) => setGhost(e.target.checked)} /> ghost</label>
      </div>
      {bare && <style>{`header,nextjs-portal{display:none!important} main{padding:0!important;max-width:none!important} main>div.flex{display:none!important} main .panel{height:100vh!important;border:0!important;background:#0a0b0d} main .panel::before,main .panel::after{display:none}`}</style>}
      <ModelViewer
        modelId={id}
        hud={!bare}
        referenceId={id.startsWith("claw") ? "mavic-reference" : undefined}
        view={{ explode, open, ghost, zoom, az, el }}
        spin={!q.has("nospin")}
        className="relative panel ticks"
      />
      <style>{`main .panel{height:70vh}`}</style>
    </main>
  );
}
