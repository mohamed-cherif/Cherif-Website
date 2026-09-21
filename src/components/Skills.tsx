"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { SectionHeading } from "./SectionHeading";
import { skillGroups } from "@/data/skills";
import { getProject } from "@/data/projects";

export function Skills() {
  return (
    <section
      id="skills"
      className="py-20 md:py-28"
      style={{ background: "var(--color-surface)" }}
    >
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeading
          label="skills"
          title="What I work with"
          subtitle="The tools and techniques behind my projects. Each group links to the builds where I used them."
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {skillGroups.map((group, gi) => {
            const usedIn = (group.usedIn ?? [])
              .map((id) => getProject(id))
              .filter((p) => p !== undefined);

            return (
              <motion.div
                key={group.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: gi * 0.06 }}
                className="rounded-2xl border p-5 flex flex-col"
                style={{ background: "var(--color-bg)", borderColor: "var(--color-border)" }}
              >
                <p
                  className="font-mono text-xs tracking-widest uppercase mb-3"
                  style={{ color: "var(--color-primary)" }}
                >
                  {group.label}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {group.skills.map((skill) => (
                    <span key={skill} className="tech-chip">{skill}</span>
                  ))}
                </div>

                {usedIn.length > 0 && (
                  <p
                    className="mt-4 pt-3 border-t font-mono text-[11px] leading-relaxed"
                    style={{ borderColor: "var(--color-border)", color: "var(--color-muted)" }}
                  >
                    <span style={{ color: "var(--color-accent)" }}>used in: </span>
                    {usedIn.map((p, i) => (
                      <span key={p.id}>
                        <Link
                          href={`/projects/${p.id}`}
                          className="underline-offset-2 hover:underline"
                          style={{ color: "var(--color-text)" }}
                        >
                          {p.shortTitle ?? p.title}
                        </Link>
                        {i < usedIn.length - 1 && " · "}
                      </span>
                    ))}
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
