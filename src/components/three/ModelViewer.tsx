"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect, useRef, useState } from "react";
import { getModel, modelSize, type ModelView } from "@/data/models";

const ModelCanvas = dynamic(() => import("./ModelCanvas"), { ssr: false });

const DEFAULT_VIEW: ModelView = {};

interface ModelViewerProps {
  modelId: string;
  /** faded context model drawn in the same coordinates (for example the drone) */
  referenceId?: string;
  view?: ModelView;
  spin?: boolean;
  labels?: boolean;
  /** corner readouts: part count, size, hint */
  hud?: boolean;
  title?: string;
  className?: string;
}

/** Interactive CAD viewport: drag to orbit, slow turntable when idle. */
export function ModelViewer({
  modelId,
  referenceId,
  view = DEFAULT_VIEW,
  spin = true,
  labels = true,
  hud = true,
  title,
  className = "",
}: ModelViewerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false); // mount the canvas once close to the viewport
  const [visible, setVisible] = useState(false); // only render frames while on screen

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
        if (entry.isIntersecting) setNear(true);
      },
      { rootMargin: "200px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const meta = getModel(modelId);

  return (
    <div ref={ref} className={`blueprint-grid select-none ${className}`} style={{ cursor: "grab" }}>
      {near && (
        <Suspense fallback={null}>
          <ModelCanvas
            modelId={modelId}
            referenceId={referenceId}
            view={view}
            spin={spin}
            labels={labels}
            active={visible}
          />
        </Suspense>
      )}
      {hud && (
        <>
          <p className="label absolute top-3 left-3 pointer-events-none">
            <span style={{ color: "var(--color-accent)" }}>■</span> {title ?? modelId}
            {meta.parts.length > 1 && ` · ${meta.parts.length} parts`}
          </p>
          <p className="label absolute bottom-3 left-3 pointer-events-none">{modelSize(modelId)}</p>
          <p className="label absolute bottom-3 right-3 pointer-events-none">drag to rotate</p>
        </>
      )}
    </div>
  );
}
