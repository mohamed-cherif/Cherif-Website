"use client";

import { useEffect, useRef, useState } from "react";
import type { Step } from "@/data/projects";
import { ModelViewer } from "@/components/three/ModelViewer";
import { MediaTile } from "@/components/media/MediaViewer";

/**
 * Scroll-driven engineering breakdown. A stage stays pinned while short steps
 * scroll past; each step re-poses the 3D model (explode, open, highlight) or
 * swaps in a photo or clip.
 */
export function Breakdown({ steps }: { steps: Step[] }) {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.index));
        }
      },
      // a thin band across the middle of the viewport decides the active step
      { rootMargin: "-48% 0px -48% 0px" }
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [steps.length]);

  // The model on stage is the one from the nearest model step at or before the
  // active step, so it stays mounted while photo steps pass over it.
  let modelStep = -1;
  for (let i = 0; i < steps.length; i++) {
    if (steps[i].stage.kind === "model" && (i <= active || modelStep === -1)) modelStep = i;
  }
  const modelStage = modelStep >= 0 && steps[modelStep].stage.kind === "model" ? steps[modelStep].stage : null;
  const current = steps[active].stage;
  const showModel = current.kind === "model";
  // One title per model: later steps reuse the first one given for it.
  const modelTitle =
    modelStage?.kind === "model"
      ? steps.map((s) => s.stage).find((s) => s.kind === "model" && s.model === modelStage.model && s.title)
      : undefined;

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)] lg:gap-10">
      {/* Stage */}
      <div
        className="sticky top-16 z-20 h-[44vh] lg:h-[calc(100vh-6rem)] lg:top-20 -mx-5 md:-mx-6 lg:mx-0"
        style={{ background: "var(--color-bg)" }}
      >
        <div className="relative h-full panel ticks overflow-hidden">
          {modelStage && modelStage.kind === "model" && (
            <div
              className="absolute inset-0 transition-opacity duration-300"
              style={{ opacity: showModel ? 1 : 0, pointerEvents: showModel ? "auto" : "none" }}
            >
              <ModelViewer
                modelId={modelStage.model}
                referenceId={modelStage.reference}
                view={showModel && current.kind === "model" ? current.view : modelStage.view}
                title={modelTitle?.kind === "model" ? modelTitle.title : undefined}
                spin={false}
                className="absolute inset-0"
              />
            </div>
          )}
          {steps.map((step, i) => {
            const stage = step.stage;
            if (stage.kind === "model") return null;
            const on = i === active;
            return (
              <div
                key={i}
                className="absolute inset-0 blueprint-grid transition-opacity duration-300"
                style={{ opacity: on ? 1 : 0, pointerEvents: on ? "auto" : "none", background: "var(--color-surface)" }}
                aria-hidden={!on}
              >
                <MediaTile item={stage} sizes="(min-width: 1024px) 760px, 100vw" active={on} />
              </div>
            );
          })}
          <p
            className="label absolute top-0 right-0 px-2 py-1.5 z-10"
            style={{ background: "var(--color-bg)", color: "var(--color-text)" }}
          >
            {String(active + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}
          </p>
        </div>
      </div>

      {/* Steps */}
      <ol className="relative z-10">
        {steps.map((step, i) => {
          const on = i === active;
          return (
            <li
              key={step.title}
              ref={(el) => {
                refs.current[i] = el;
              }}
              data-index={i}
              className="min-h-[56vh] lg:min-h-[78vh] flex items-center py-8"
            >
              <div
                className="w-full border-l pl-5 transition-opacity duration-300"
                style={{
                  borderColor: on ? "var(--color-accent)" : "var(--color-border)",
                  opacity: on ? 1 : 0.35,
                }}
              >
                <p className="label" style={{ color: on ? "var(--color-accent)" : undefined }}>
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-2 text-2xl font-display font-semibold leading-tight" style={{ color: "var(--color-text)" }}>
                  {step.title}
                </h3>
                <p className="mt-3 text-base leading-relaxed" style={{ color: "var(--color-muted)" }}>
                  {step.text}
                </p>
                {step.facts && (
                  <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
                    {step.facts.map(([k, v]) => (
                      <div key={k} className="contents">
                        <dt className="label pt-0.5">{k}</dt>
                        <dd className="font-mono text-xs" style={{ color: "var(--color-text)" }}>
                          {v}
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
