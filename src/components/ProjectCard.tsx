"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ExternalLink, ArrowUpRight, FileText } from "lucide-react";
import { Project } from "@/data/projects";

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
  index: number;
}

export function ProjectCard({ project, onClick, index }: ProjectCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const x = ((e.clientY - cy) / (rect.height / 2)) * 4;
    const y = -((e.clientX - cx) / (rect.width / 2)) * 4;
    setTilt({ x, y });
  };

  const hasImage = project.images.length > 0;

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      onClick={onClick}
      style={{
        transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: "transform 0.15s ease",
        cursor: "pointer",
        background: "var(--color-surface)",
        borderColor: "var(--color-border)",
      }}
      className="group relative rounded-2xl border overflow-hidden hover:border-[var(--color-primary)] transition-colors duration-300"
      whileHover={{ y: -4 }}
    >
      {/* Image */}
      {hasImage ? (
        <div className="relative overflow-hidden" style={{ aspectRatio: "16/9" }}>
          <Image
            src={project.images[0]}
            alt={project.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.5))",
            }}
          />
        </div>
      ) : (
        <div
          className="flex items-center justify-center"
          style={{ aspectRatio: "16/9", background: "var(--color-bg)" }}
        >
          {project.pdfUrl ? (
            <FileText size={48} style={{ color: "var(--color-primary)", opacity: 0.45 }} />
          ) : (
            <span className="font-mono text-5xl opacity-30">{"</>"}</span>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3
            className="text-lg font-display font-bold leading-tight"
            style={{ color: "var(--color-text)" }}
          >
            {project.title}
          </h3>
          <motion.div
            className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
            style={{ color: "var(--color-primary)" }}
          >
            <ArrowUpRight size={18} />
          </motion.div>
        </div>

        <p className="font-mono text-xs mb-3" style={{ color: "var(--color-muted)" }}>
          {project.date}
        </p>

        <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--color-muted)" }}>
          {project.tagline}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {project.tech.slice(0, 4).map((t) => (
            <span key={t} className="tech-chip text-[10px] px-2 py-0.5">{t}</span>
          ))}
          {project.tech.length > 4 && (
            <span className="tech-chip text-[10px] px-2 py-0.5">+{project.tech.length - 4}</span>
          )}
        </div>

        {/* Awards strip */}
        {project.awards && project.awards.length > 0 && (
          <div className="mt-3 flex items-center gap-1.5">
            <span style={{ color: "var(--color-accent)" }} className="text-xs">🏆</span>
            <span className="font-mono text-[10px] truncate" style={{ color: "var(--color-accent)" }}>
              {project.awards[0]}
            </span>
          </div>
        )}

        {project.liveUrl && (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="mt-3 inline-flex items-center gap-1 font-mono text-xs transition-colors"
            style={{ color: "var(--color-primary)" }}
          >
            Live <ExternalLink size={10} />
          </a>
        )}
        {project.pdfUrl && (
          <a
            href={project.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="mt-3 inline-flex items-center gap-1 font-mono text-xs transition-colors"
            style={{ color: "var(--color-primary)" }}
          >
            Read PDF <FileText size={10} />
          </a>
        )}
      </div>
    </motion.div>
  );
}
