"use client";

import { motion } from "framer-motion";
import { SectionHeading } from "./SectionHeading";
import { experiences } from "@/data/experience";
import { Microscope, Users, GraduationCap, Wrench } from "lucide-react";

const iconMap = {
  research: Microscope,
  teaching: GraduationCap,
  leadership: Users,
  technical: Wrench,
};

const colorMap = {
  research: "var(--color-primary)",
  teaching: "var(--color-secondary)",
  leadership: "var(--color-accent)",
  technical: "var(--color-secondary)", // Using secondary (teal-ish) or a new one
};

export function Experience() {
  return (
    <section
      id="experience"
      className="py-20 md:py-28"
      style={{ background: "var(--color-surface)" }}
    >
      <div className="max-w-4xl mx-auto px-6">
        <SectionHeading label="experience" title="Where I've worked" />

        <div className="relative">
          {/* Timeline line */}
          <div
            className="absolute left-4 top-0 bottom-0 w-px timeline-line"
            style={{ marginLeft: "2px" }}
          />

          <div className="space-y-10 pl-14">
            {experiences.map((exp, i) => {
              const Icon = iconMap[exp.type];
              const color = colorMap[exp.type];

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="relative"
                >
                  {/* Node */}
                  <div
                    className="absolute -left-14 w-9 h-9 rounded-full border-2 flex items-center justify-center"
                    style={{
                      background: "var(--color-surface)",
                      borderColor: color,
                      color,
                    }}
                  >
                    <Icon size={15} />
                  </div>

                  {/* Card */}
                  <div
                    className="rounded-2xl border p-5 md:p-6"
                    style={{
                      background: "var(--color-bg)",
                      borderColor: "var(--color-border)",
                    }}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                      <div>
                        <h3
                          className="text-base font-display font-semibold"
                          style={{ color: "var(--color-text)" }}
                        >
                          {exp.role}
                        </h3>
                        <p className="text-sm font-medium mt-0.5" style={{ color }}>
                          {exp.org}
                        </p>
                        <p className="font-mono text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>
                          {exp.location}
                        </p>
                      </div>
                      <span
                        className="font-mono text-xs px-2.5 py-1 rounded-full border shrink-0"
                        style={{ borderColor: color, color }}
                      >
                        {exp.dates}
                      </span>
                    </div>

                    <ul className="mt-4 space-y-2">
                      {exp.bullets.map((b, j) => (
                        <li key={j} className="flex gap-3 text-sm" style={{ color: "var(--color-muted)" }}>
                          <span
                            className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ background: color }}
                          />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
