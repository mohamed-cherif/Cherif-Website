"use client";

import { useState } from "react";
import { SectionHeading } from "./SectionHeading";
import { ProjectCard } from "./ProjectCard";
import { orderedProjects, type ProjectKind } from "@/data/projects";

const FILTERS: { key: "all" | ProjectKind; label: string }[] = [
  { key: "all", label: "All" },
  { key: "hardware", label: "Hardware" },
  { key: "software", label: "Software + research" },
];

export function Projects() {
  const [filter, setFilter] = useState<"all" | ProjectKind>("all");
  const shown = orderedProjects.filter((p) => filter === "all" || p.kind === filter);

  return (
    <section id="projects" className="py-16 md:py-24" style={{ background: "var(--color-bg)" }}>
      <div className="max-w-6xl mx-auto px-5 md:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading label="Projects" title="Things I built" />
          <div className="flex mb-10 md:mb-12" role="tablist" aria-label="Filter projects">
            {FILTERS.map((f) => {
              const on = filter === f.key;
              return (
                <button
                  key={f.key}
                  role="tab"
                  aria-selected={on}
                  onClick={() => setFilter(f.key)}
                  className="label px-3 py-2 border -ml-px first:ml-0 cursor-pointer transition-colors"
                  style={{
                    borderColor: on ? "var(--color-accent)" : "var(--color-border)",
                    color: on ? "var(--color-accent)" : "var(--color-muted)",
                    position: "relative",
                    zIndex: on ? 1 : 0,
                  }}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          {shown.map((p, i) => (
            <ProjectCard key={p.id} project={p} index={orderedProjects.indexOf(p)} wide={filter === "all" && i < 2} />
          ))}
        </div>
      </div>
    </section>
  );
}
