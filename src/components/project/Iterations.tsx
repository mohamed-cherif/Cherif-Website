"use client";

import { useState } from "react";
import Image from "next/image";
import type { IterationSet } from "@/data/projects";
import { ModelViewer } from "@/components/three/ModelViewer";

/** Version switcher. Opens on the final version; earlier ones are a click away. */
export function Iterations({ set }: { set: IterationSet }) {
  const finalIndex = Math.max(0, set.items.findIndex((it) => it.final));
  const [index, setIndex] = useState(finalIndex);
  const item = set.items[index];

  return (
    <div className="grid lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)] gap-4 lg:gap-10">
      <div className="relative panel ticks h-[46vh] lg:h-[62vh] overflow-hidden">
        {item.model ? (
          <ModelViewer
            key={item.model}
            modelId={item.model}
            referenceId={set.reference}
            view={item.view}
            title={item.label}
            className="absolute inset-0"
          />
        ) : item.image ? (
          <Image src={item.image} alt={`${item.label}: ${item.note}`} fill sizes="(min-width: 1024px) 720px, 100vw" className="object-contain" />
        ) : null}
      </div>

      <ol className="flex flex-col">
        {set.items.map((it, i) => {
          const on = i === index;
          return (
            <li key={it.label} className="-mt-px first:mt-0">
              <button
                onClick={() => setIndex(i)}
                aria-pressed={on}
                className="w-full text-left border p-4 cursor-pointer transition-colors"
                style={{
                  borderColor: on ? "var(--color-accent)" : "var(--color-border)",
                  background: on ? "var(--color-surface)" : "transparent",
                  position: "relative",
                  zIndex: on ? 1 : 0,
                }}
              >
                <span className="flex items-center gap-2">
                  <span className="font-mono text-sm font-medium" style={{ color: on ? "var(--color-accent)" : "var(--color-text)" }}>
                    {it.label}
                  </span>
                  {it.date && <span className="label">{it.date}</span>}
                  {it.final && (
                    <span className="label ml-auto px-1.5 py-0.5" style={{ background: "var(--color-accent)", color: "#0a0b0d" }}>
                      Final
                    </span>
                  )}
                </span>
                <span className="mt-1.5 block text-sm leading-snug" style={{ color: "var(--color-muted)" }}>
                  {it.note}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
