import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/data/projects";
import { LoopVideo } from "./LoopVideo";

interface ProjectCardProps {
  project: Project;
  index: number;
  wide?: boolean;
}

export function ProjectCard({ project, index, wide }: ProjectCardProps) {
  const number = String(index + 1).padStart(2, "0");
  return (
    <article
      className={`group relative flex flex-col panel transition-colors duration-150 hover:border-[var(--color-accent)] ${
        wide ? "lg:col-span-3" : "lg:col-span-2"
      }`}
    >
      {/* Media: a looping clip where there is one, otherwise a photo or render */}
      <div
        className="relative overflow-hidden border-b"
        style={{ aspectRatio: wide ? "16/9" : "16/10", borderColor: "var(--color-border)", background: "#000" }}
      >
        {project.card.video ? (
          <LoopVideo src={project.card.video} poster={project.card.poster} label={`${project.title} demo clip`} />
        ) : (
          <Image
            src={project.card.poster}
            alt={project.title}
            fill
            sizes="(min-width: 1024px) 560px, 100vw"
            className={project.card.contain ? "object-contain" : "object-cover"}
          />
        )}
        <span
          className="label absolute top-0 left-0 px-2 py-1"
          style={{ background: "var(--color-bg)", color: "var(--color-text)" }}
        >
          {number}
        </span>
        {project.badge && (
          <span
            className="label absolute top-0 right-0 px-2 py-1"
            style={{ background: "var(--color-accent)", color: "#0a0b0d" }}
          >
            {project.badge}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-display font-semibold leading-snug" style={{ color: "var(--color-text)" }}>
            {/* Stretched link: the ::after overlay makes the whole card clickable */}
            <Link href={`/projects/${project.id}`} className="after:absolute after:inset-0 after:z-10">
              {project.shortTitle ?? project.title}
            </Link>
          </h3>
          <ArrowUpRight
            size={18}
            className="shrink-0 mt-0.5 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            style={{ color: "var(--color-accent)" }}
          />
        </div>
        <p className="mt-1.5 text-sm leading-snug" style={{ color: "var(--color-muted)" }}>
          {project.tagline}
        </p>
        <div className="mt-auto pt-4 flex flex-wrap items-center gap-1.5">
          <span className="label mr-1">{project.date}</span>
          {project.tech.slice(0, 3).map((t) => (
            <span key={t} className="tech-chip">
              {t}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
