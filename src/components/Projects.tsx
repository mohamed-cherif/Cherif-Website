"use client";

import { useState } from "react";
import { SectionHeading } from "./SectionHeading";
import { ProjectCard } from "./ProjectCard";
import { ProjectModal } from "./ProjectModal";
import { projects, Project } from "@/data/projects";

export function Projects() {
  const [active, setActive] = useState<Project | null>(null);

  return (
    <section id="projects" className="py-20 md:py-28" style={{ background: "var(--color-bg)" }}>
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeading
          label="projects"
          title="Things I built"
          subtitle="My impact on my community and environment. Each project started with a real problem and ended with a functional solution."
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects
            .sort((a, b) => a.priority - b.priority)
            .map((p, i) => (
              <ProjectCard
                key={p.id}
                project={p}
                onClick={() => setActive(p)}
                index={i}
              />
            ))}
        </div>
      </div>

      <ProjectModal project={active} onClose={() => setActive(null)} />
    </section>
  );
}
