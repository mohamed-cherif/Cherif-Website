import Link from "next/link";
import { ArrowDown, ArrowUpRight, Download } from "lucide-react";
import { ModelViewer } from "./three/ModelViewer";

export function Hero() {
  return (
    <section id="hero" className="relative border-b" style={{ borderColor: "var(--color-border)" }}>
      <div className="max-w-6xl mx-auto px-5 md:px-6 pt-28 pb-12 md:pt-32 md:pb-16 grid lg:grid-cols-[5fr_6fr] gap-8 lg:gap-10 items-stretch">
        <div className="flex flex-col justify-center">
          <p className="label flex items-center gap-2">
            <span className="inline-block w-6 h-px" style={{ background: "var(--color-accent)" }} />
            ECE + CS · Duke University · Robotics certificate
          </p>
          <h1
            className="mt-5 text-5xl md:text-6xl font-display font-semibold leading-[1.02]"
            style={{ color: "var(--color-text)" }}
          >
            Mohamed
            <br />
            Cherif Braham
          </h1>
          <p className="mt-5 text-lg leading-relaxed max-w-md" style={{ color: "var(--color-muted)" }}>
            I build solutions that serve the world around me, from wildfire detection to brain injury monitoring.
          </p>

          <div className="mt-8 flex flex-wrap gap-2">
            <a href="#projects" className="btn btn-solid">
              Projects <ArrowDown size={14} />
            </a>
            <a href="/Resume-Mohamed-Cherif-Braham.pdf" download className="btn">
              <Download size={14} /> Resume
            </a>
            <a
              href="https://www.linkedin.com/in/mohamedcherif-braham/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn"
            >
              LinkedIn <ArrowUpRight size={14} />
            </a>
          </div>
          <a
            href="mailto:mohamedcherif.braham@duke.edu"
            className="label mt-5 hover:text-[var(--color-accent)] transition-colors"
          >
            mohamedcherif.braham@duke.edu
          </a>
        </div>

        {/* Featured build: the live CAD of the drone claw */}
        <div className="relative panel ticks min-h-[340px] lg:min-h-[460px]">
          <ModelViewer
            modelId="claw-v3"
            referenceId="mavic-reference"
            title="Drone claw v3 on a Mavic Pro"
            view={{ ghost: true, zoom: 0.5, az: 36, el: 14, open: 0.55 }}
            labels={false}
            className="absolute inset-0"
          />
          <Link
            href="/projects/drone-claw"
            className="label absolute top-0 right-0 px-2 py-1.5 flex items-center gap-1 z-10 hover:opacity-80"
            style={{ background: "var(--color-accent)", color: "#0a0b0d" }}
          >
            Open build <ArrowUpRight size={12} />
          </Link>
        </div>
      </div>
    </section>
  );
}
