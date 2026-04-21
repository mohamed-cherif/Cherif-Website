"use client";

import { motion } from "framer-motion";

interface SectionHeadingProps {
  label: string;
  title: string;
  subtitle?: string;
}

export function SectionHeading({ label, title, subtitle }: SectionHeadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5 }}
      className="mb-12 md:mb-16"
    >
      <p
        className="font-mono text-sm mb-3 tracking-widest uppercase"
        style={{ color: "var(--color-primary)" }}
      >
        <span style={{ color: "var(--color-accent)" }}>{">"}</span> {label}
      </p>
      <h2
        className="text-3xl md:text-4xl font-display font-bold tracking-tight"
        style={{ color: "var(--color-text)" }}
      >
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-base max-w-xl" style={{ color: "var(--color-muted)" }}>
          {subtitle}
        </p>
      )}
      <div className="mt-4 flex items-center gap-2">
        <div
          className="h-0.5 w-12 rounded"
          style={{ background: "var(--color-primary)" }}
        />
        <div
          className="h-0.5 w-4 rounded"
          style={{ background: "var(--color-accent)" }}
        />
      </div>
    </motion.div>
  );
}
