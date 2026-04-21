"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ChevronDown, X } from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import { awards, Award } from "@/data/awards";

/* ── Lightbox for full cert image ─────────────────────────── */
function CertLightbox({ award, onClose }: { award: Award; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        transition={{ duration: 0.2 }}
        className="relative max-w-sm w-full rounded-2xl overflow-hidden border"
        style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-lg cursor-pointer"
          style={{ background: "rgba(0,0,0,0.5)", color: "white" }}
          aria-label="Close"
        >
          <X size={15} />
        </button>
        <div className="relative w-full" style={{ aspectRatio: "3/4" }}>
          <Image src={award.image} alt={award.title} fill className="object-contain" />
        </div>
        <div className="px-4 py-3">
          <p className="text-xs font-display font-semibold" style={{ color: "var(--color-text)" }}>
            {award.title}
          </p>
          <p className="font-mono text-[10px] mt-0.5" style={{ color: "var(--color-muted)" }}>
            {award.issuer} · {award.year}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Terminal awards list ─────────────────────────────────── */
const CMD = "awards --list --all";
const CMD_DELAY = 40;        // ms per char while typing command
const REVEAL_INTERVAL = 90;  // ms between each award line appearing

const EMOJI: Record<string, string> = {
  "1st Place": "🥇",
  "2nd Place": "🥈",
  "Gold Medal": "🥇",
  "Bronze Medal": "🥉",
  "APA": "🧠",
  "National": "🌍",
  "Hackathon": "⚡",
};
function awardEmoji(title: string) {
  for (const [k, v] of Object.entries(EMOJI)) if (title.includes(k)) return v;
  return "🏆";
}

export function Awards() {
  /* typing state */
  const [cmdTyped, setCmdTyped] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const [revealedCount, setRevealedCount] = useState(0);
  const [certsOpen, setCertsOpen] = useState(false);
  const [lightbox, setLightbox] = useState<Award | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const hasStarted = useRef(false);

  /* start animation when section scrolls into view */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted.current) {
          hasStarted.current = true;
          let i = 0;
          const typer = setInterval(() => {
            i++;
            setCmdTyped(CMD.slice(0, i));
            if (i >= CMD.length) {
              clearInterval(typer);
              // reveal awards line by line
              let j = 0;
              const revealer = setInterval(() => {
                j++;
                setRevealedCount(j);
                if (j >= awards.length) clearInterval(revealer);
              }, REVEAL_INTERVAL);
            }
          }, CMD_DELAY);
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  /* blinking cursor */
  useEffect(() => {
    const id = setInterval(() => setShowCursor((c) => !c), 530);
    return () => clearInterval(id);
  }, []);

  const certAwards = awards.filter((a) => a.image);

  return (
    <section
      id="awards"
      ref={sectionRef}
      className="py-20 md:py-28"
      style={{ background: "var(--color-bg)" }}
    >
      <div className="max-w-4xl mx-auto px-6">
        <SectionHeading
          label="awards"
          title="Recognition"
          subtitle="Science fairs, hackathons, and academic competitions across three continents."
        />

        {/* Terminal window */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl overflow-hidden border"
          style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
        >
          {/* Title bar */}
          <div
            className="flex items-center gap-2 px-4 py-3"
            style={{
              background: "var(--color-bg)",
              borderBottom: "1px solid var(--color-border)",
            }}
          >
            <span className="w-3 h-3 rounded-full bg-red-500/70" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <span className="w-3 h-3 rounded-full bg-green-500/70" />
            <span
              className="ml-3 font-mono text-xs select-none"
              style={{ color: "var(--color-muted)" }}
            >
              cherif@portfolio ~ %
            </span>
          </div>

          {/* Terminal body */}
          <div className="p-5 md:p-6 font-mono text-sm min-h-[240px]">
            {/* Command line */}
            <div className="flex items-center gap-2 mb-4">
              <span style={{ color: "var(--color-primary)" }}>❯</span>
              <span style={{ color: "var(--color-text)" }}>{cmdTyped}</span>
              <span
                className="inline-block w-[2px] h-4"
                style={{
                  background: "var(--color-primary)",
                  opacity: cmdTyped.length < CMD.length || showCursor ? 1 : 0,
                  transition: "opacity 0.1s",
                }}
              />
            </div>

            {/* Award lines */}
            <div className="space-y-2">
              {awards.slice(0, revealedCount).map((award, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.18 }}
                  className="flex items-baseline gap-3"
                >
                  {/* index */}
                  <span
                    className="text-[11px] w-5 shrink-0 text-right select-none"
                    style={{ color: "var(--color-border)" }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {/* emoji */}
                  <span className="text-base leading-none shrink-0">{awardEmoji(award.title)}</span>
                  {/* content */}
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <span
                      className="text-[13px] font-semibold leading-snug"
                      style={{ color: "var(--color-text)" }}
                    >
                      {award.title}
                    </span>
                    <span
                      className="text-[11px] opacity-60"
                      style={{ color: "var(--color-muted)" }}
                    >
                      {award.issuer}
                    </span>
                    <span
                      className="text-[11px] font-mono"
                      style={{ color: "var(--color-primary)", opacity: 0.7 }}
                    >
                      [{award.year}]
                    </span>
                  </div>
                </motion.div>
              ))}

              {/* blinking cursor after last line */}
              {revealedCount >= awards.length && (
                <div className="flex items-center gap-2 pt-1">
                  <span style={{ color: "var(--color-primary)" }}>❯</span>
                  <span
                    className="inline-block w-[2px] h-4"
                    style={{
                      background: "var(--color-primary)",
                      opacity: showCursor ? 1 : 0,
                      transition: "opacity 0.1s",
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Show certifications toggle */}
          {revealedCount >= awards.length && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              style={{ borderTop: "1px solid var(--color-border)" }}
            >
              <button
                onClick={() => setCertsOpen((o) => !o)}
                className="w-full flex items-center justify-between px-5 py-3 font-mono text-xs cursor-pointer transition-colors"
                style={{ color: "var(--color-muted)", background: "var(--color-bg)" }}
              >
                <span>
                  <span style={{ color: "var(--color-primary)" }}>$</span>{" "}
                  awards --show-certifications
                </span>
                <motion.span
                  animate={{ rotate: certsOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown size={15} />
                </motion.span>
              </button>

              <AnimatePresence>
                {certsOpen && (
                  <motion.div
                    key="certs"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: "easeInOut" }}
                    style={{ overflow: "hidden" }}
                  >
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-5">
                      {certAwards.map((award, i) => (
                        <motion.button
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.22, delay: i * 0.05 }}
                          onClick={() => setLightbox(award)}
                          className="group relative rounded-xl overflow-hidden border cursor-pointer"
                          style={{ borderColor: "var(--color-border)", aspectRatio: "3/4" }}
                          whileHover={{ scale: 1.03, borderColor: "var(--color-accent)" }}
                        >
                          <Image
                            src={award.image}
                            alt={award.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          {/* hover label */}
                          <div
                            className="absolute inset-0 flex items-end opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2"
                            style={{
                              background:
                                "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 60%)",
                            }}
                          >
                            <p className="font-mono text-[9px] text-white leading-tight">
                              {award.title}
                            </p>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <CertLightbox award={lightbox} onClose={() => setLightbox(null)} />
        )}
      </AnimatePresence>
    </section>
  );
}
