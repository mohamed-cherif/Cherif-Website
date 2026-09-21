"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { SectionHeading } from "./SectionHeading";

export function About() {
  return (
    <section
      id="about"
      className="py-20 md:py-28"
      style={{ background: "var(--color-surface)" }}
    >
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeading label="about_me" title="Who I am" />

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Portrait */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div
              className="relative overflow-hidden rounded-2xl border"
              style={{ borderColor: "var(--color-border)", aspectRatio: "4/5", maxHeight: "480px" }}
            >
              <Image
                src="/images/me/expo.jpg"
                alt="Mohamed Cherif Braham at Duke University"
                fill
                className="object-cover object-top"
              />
            </div>
            {/* Corner accent */}
            <div
              className="absolute -bottom-3 -right-3 w-24 h-24 rounded-xl opacity-20"
              style={{ background: "var(--color-primary)" }}
            />
          </motion.div>

          {/* Bio */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div
              className="text-base leading-relaxed space-y-4"
              style={{ color: "var(--color-muted)" }}
            >
              <p>
                I&apos;m a{" "}
                <span style={{ color: "var(--color-accent)" }} className="font-semibold">
                  Duke International Scholar
                </span>
                {" "}studying{" "}
                <span style={{ color: "var(--color-text)" }} className="font-semibold">
                  Electrical and Computer Engineering and Computer Science
                </span>{" "}
                with a{" "}
                <span style={{ color: "var(--color-primary)" }} className="font-semibold">
                  Robotics and Automation certificate
                </span>
                .
                </p>
                <p>
                  I love building.
                </p>
              <p>
                I&apos;m most alive when I&apos;m turning an idea into something physical and functional with an impact.
              </p>
              <p>
                My work spans robotics, computer vision, embedded systems, and ML. My goal is to build technologies that make the world a better place.
              </p>
              <p>
                Right now I&apos;m at the{" "}
                <span style={{ color: "var(--color-text)" }} className="font-medium">Duke Biomechanics and Wearable Robotics Lab</span>
                , building an ankle exoskeleton for gait rehabilitation.
              </p>
              <p>
                I&apos;ve done research at the{" "}
                <span style={{ color: "var(--color-text)" }} className="font-medium">University of Cambridge</span>{" "}
                on RNA sequencing for neurodivergence, instructed 25+ students in AI and robotics in Tunisia, and participated in multiple expos and hackathons across 3 continents.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
