"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { CircuitSVG } from "./CircuitSVG";
import { Download, ArrowRight, ExternalLink } from "lucide-react";

const BOOT_LINES = [
  "> initializing systems...",
  "> loading projects...",
  "> calibrating sensors...",
  "> ready.",
];

function TypewriterBoot() {
  const [lines, setLines] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    const addLine = () => {
      if (i < BOOT_LINES.length) {
        setLines((prev) => [...prev, BOOT_LINES[i]]);
        i++;
        setTimeout(addLine, i < BOOT_LINES.length - 1 ? 600 : 200);
      } else {
        setTimeout(() => setDone(true), 400);
      }
    };
    const timer = setTimeout(addLine, 500);
    return () => clearTimeout(timer);
  }, []);

  if (done) return null;

  return (
    <div className="font-mono text-xs mb-6 space-y-0.5" style={{ color: "var(--color-muted)" }}>
      {lines.map((line, i) => (
        <motion.p
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {line}
        </motion.p>
      ))}
    </div>
  );
}

export function Hero() {
  const [bootDone, setBootDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setBootDone(true), 2800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden blueprint-grid"
    >
      {/* Subtle gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 50%, transparent 60%, var(--color-bg) 100%)",
        }}
      />

      <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-16 w-full">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left: text */}
          <div>
            <TypewriterBoot />

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: bootDone ? 1 : 0, y: bootDone ? 0 : 24 }}
              transition={{ duration: 0.6 }}
            >
              {/* Online LED */}
              <div className="flex items-center gap-2 mb-4">
                <span
                  className="w-2 h-2 rounded-full animate-[pulseGlow_2s_ease-in-out_infinite]"
                  style={{ background: "var(--color-secondary)" }}
                />
                <span className="font-mono text-xs tracking-widest" style={{ color: "var(--color-secondary)" }}>
                  ONLINE
                </span>
              </div>

              <h1
                className="text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight leading-tight mb-4"
                style={{ color: "var(--color-text)" }}
              >
                Mohamed{" "}
                <span className="gradient-text">Cherif</span>{" "}
                Braham
              </h1>

              <p
                className="text-lg md:text-xl font-display font-medium mb-2"
                style={{ color: "var(--color-muted)" }}
              >
                Duke University — Electrical & Computer Engineering
              </p>
              <p className="text-sm font-mono mb-6" style={{ color: "var(--color-primary)" }}>
                Robotics & Automation Certificate
              </p>


              <p
                className="text-base md:text-lg leading-relaxed mb-8 max-w-lg"
                style={{ color: "var(--color-muted)" }}
              >
                I build solutions that serve the world around me
                <br />
                from wildfire detection to brain injury monitoring.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3 mb-8">
                <motion.button
                  onClick={() => document.querySelector("#projects")?.scrollIntoView({ behavior: "smooth" })}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-display font-semibold text-sm text-white cursor-pointer transition-all"
                  style={{ background: "var(--color-primary)" }}
                  whileHover={{ scale: 1.04, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                >
                  See my projects <ArrowRight size={15} />
                </motion.button>

                <motion.a
                  href="/Resume-Mohamed-Cherif-Braham.pdf"
                  download
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-display font-semibold text-sm border cursor-pointer transition-all"
                  style={{
                    borderColor: "var(--color-border)",
                    color: "var(--color-text)",
                    background: "var(--color-surface)",
                  }}
                  whileHover={{ scale: 1.04, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Download size={15} /> Download resume
                </motion.a>
              </div>

              {/* Socials */}
              <div className="flex items-center gap-4 flex-wrap">
                <motion.a
                  href="https://www.linkedin.com/in/mohamedcherif-braham/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 font-mono text-xs transition-colors"
                  style={{ color: "var(--color-muted)" }}
                  whileHover={{ scale: 1.05 }}
                >
                  <ExternalLink size={12} /> LinkedIn
                </motion.a>
                <span style={{ color: "var(--color-border)" }}>·</span>
                <motion.a
                  href="mailto:mohamedcherif.braham@duke.edu"
                  whileHover={{ scale: 1.05 }}
                  className="font-mono text-xs transition-colors"
                  style={{ color: "var(--color-muted)" }}
                >
                  mohamedcherif.braham@duke.edu
                </motion.a>
              </div>
            </motion.div>
          </div>

          {/* Right: portrait + circuit overlay */}
          <motion.div
            className="relative flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: bootDone ? 1 : 0, scale: bootDone ? 1 : 0.9 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            {/* Circuit SVG behind */}
            <div className="absolute inset-0 opacity-40">
              <CircuitSVG />
            </div>

            {/* Hexagon portrait frame */}
            <div className="relative z-10">
              <div
                className="relative overflow-hidden rounded-full w-64 h-64 md:w-80 md:h-80 border-4 glow-blue"
                style={{ borderColor: "var(--color-primary)" }}
              >
                <Image
                  src="/images/me/hero.jpg"
                  alt="Mohamed Cherif Braham speaking at an event"
                  fill
                  className="object-cover object-top"
                  priority
                />
              </div>

              {/* Floating badge */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-4 -right-4 px-3 py-1.5 rounded-lg text-xs font-mono border"
                style={{
                  background: "var(--color-surface)",
                  borderColor: "var(--color-primary)",
                  color: "var(--color-primary)",
                }}
              >
                🤖 builder & engineer
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Scroll hint */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity }}
        >
          <div className="w-px h-8" style={{ background: "var(--color-border)" }} />
          <span className="font-mono text-xs" style={{ color: "var(--color-muted)" }}>scroll</span>
        </motion.div>
      </div>
    </section>
  );
}
