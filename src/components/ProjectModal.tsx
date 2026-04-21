"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, ExternalLink, FileText } from "lucide-react";
import { Project } from "@/data/projects";

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export function ProjectModal({ project, onClose }: ProjectModalProps) {
  const [imgIdx, setImgIdx] = useState(0);

  useEffect(() => {
    setImgIdx(0);
    if (project) {
      document.body.style.overflow = "hidden";
    }
    return () => { document.body.style.overflow = ""; };
  }, [project]);

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && project) setImgIdx((i) => (i + 1) % project.images.length);
      if (e.key === "ArrowLeft" && project) setImgIdx((i) => (i - 1 + project.images.length) % project.images.length);
    },
    [onClose, project]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ duration: 0.3 }}
            className={`relative w-full ${project.pdfUrl ? "max-w-5xl" : "max-w-3xl"} max-h-[90vh] overflow-y-auto rounded-2xl border`}
            style={{
              background: "var(--color-surface)",
              borderColor: "var(--color-border)",
            }}
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-lg transition-colors cursor-pointer"
              style={{ background: "var(--color-bg)", color: "var(--color-muted)" }}
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {/* Image gallery */}
            {project.images.length > 0 && (
              <div className="relative w-full overflow-hidden rounded-t-2xl" style={{ aspectRatio: "16/9" }}>
                <Image
                  src={project.images[imgIdx]}
                  alt={`${project.title} screenshot ${imgIdx + 1}`}
                  fill
                  className="object-cover"
                />
                {project.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setImgIdx((i) => (i - 1 + project.images.length) % project.images.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full cursor-pointer"
                      style={{ background: "rgba(0,0,0,0.5)", color: "white" }}
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={() => setImgIdx((i) => (i + 1) % project.images.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full cursor-pointer"
                      style={{ background: "rgba(0,0,0,0.5)", color: "white" }}
                    >
                      <ChevronRight size={18} />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {project.images.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setImgIdx(i)}
                          className="w-2 h-2 rounded-full transition-all cursor-pointer"
                          style={{ background: i === imgIdx ? "white" : "rgba(255,255,255,0.4)" }}
                          aria-label={`Image ${i + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Inline PDF embed when no images */}
            {project.images.length === 0 && project.pdfUrl && (
              <div className="rounded-t-2xl overflow-hidden" style={{ borderBottom: "1px solid var(--color-border)" }}>
                <div
                  className="flex items-center justify-between px-4 py-2"
                  style={{ background: "var(--color-bg)" }}
                >
                  <span className="flex items-center gap-1.5 font-mono text-xs" style={{ color: "var(--color-muted)" }}>
                    <FileText size={13} /> {project.title}
                  </span>
                  <a
                    href={project.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 font-mono text-xs transition-colors"
                    style={{ color: "var(--color-primary)" }}
                  >
                    Open in new tab <ExternalLink size={10} />
                  </a>
                </div>
                <iframe
                  src={project.pdfUrl}
                  title={`${project.title} PDF`}
                  width="100%"
                  height="700"
                  style={{ display: "block", border: "none" }}
                />
              </div>
            )}

            <div className="p-6 md:p-8">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-2">
                <h2
                  className="text-2xl font-display font-bold"
                  style={{ color: "var(--color-text)" }}
                >
                  {project.title}
                </h2>
                <div className="flex gap-2 shrink-0">
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-mono font-medium text-white"
                      style={{ background: "var(--color-primary)" }}
                    >
                      Live <ExternalLink size={12} />
                    </a>
                  )}
                  {project.pdfUrl && (
                    <a
                      href={project.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-mono font-medium text-white"
                      style={{ background: "var(--color-primary)" }}
                    >
                      PDF <FileText size={12} />
                    </a>
                  )}
                </div>
              </div>
              <p className="font-mono text-xs mb-4" style={{ color: "var(--color-muted)" }}>
                {project.date}
              </p>

              <p className="text-base leading-relaxed mb-6" style={{ color: "var(--color-muted)" }}>
                {project.description}
              </p>

              {/* Bullets */}
              <ul className="space-y-2 mb-6">
                {project.bullets.map((b, i) => (
                  <li key={i} className="flex gap-3 text-sm" style={{ color: "var(--color-muted)" }}>
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "var(--color-primary)" }} />
                    {b}
                  </li>
                ))}
              </ul>

              {/* Tech chips */}
              <div className="flex flex-wrap gap-2 mb-6">
                {project.tech.map((t) => (
                  <span key={t} className="tech-chip">{t}</span>
                ))}
              </div>

              {/* Awards */}
              {project.awards && project.awards.length > 0 && (
                <div
                  className="rounded-xl p-4 border"
                  style={{ borderColor: "var(--color-border)", background: "var(--color-bg)" }}
                >
                  <p className="font-mono text-xs tracking-widest uppercase mb-2" style={{ color: "var(--color-accent)" }}>
                    Awards & Recognition
                  </p>
                  <ul className="space-y-1">
                    {project.awards.map((a, i) => (
                      <li key={i} className="flex gap-2 text-sm" style={{ color: "var(--color-text)" }}>
                        <span style={{ color: "var(--color-accent)" }}>🏆</span> {a}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
