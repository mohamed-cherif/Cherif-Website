"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Download, Copy, Check } from "lucide-react";
import { SectionHeading } from "./SectionHeading";

const EMAIL = "mohamedcherif.braham@duke.edu";

export function Contact() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: open mailto
      window.location.href = `mailto:${EMAIL}`;
    }
  };

  const actions = [
    {
      icon: copied ? Check : Copy,
      label: "Copy email",
      sub: EMAIL,
      onClick: handleCopy,
      color: "var(--color-primary)",
      iconColor: copied ? "var(--color-secondary)" : "var(--color-primary)",
    },
    {
      icon: ExternalLink,
      label: "LinkedIn",
      sub: "mohamedcherif-braham",
      href: "https://www.linkedin.com/in/mohamedcherif-braham/",
      color: "#0A66C2",
      iconColor: "#0A66C2",
    },
    {
      icon: Download,
      label: "Resume",
      sub: "Download PDF",
      href: "/Resume-Mohamed-Cherif-Braham.pdf",
      download: true,
      color: "var(--color-accent)",
      iconColor: "var(--color-accent)",
    },
  ];

  return (
    <section
      id="contact"
      className="py-20 md:py-28"
      style={{ background: "var(--color-surface)" }}
    >
      <div className="max-w-4xl mx-auto px-6">
        <SectionHeading
          label="contact"
          title="Let's connect"
          subtitle="I'm always open to collaborations, cool ideas, or just a good conversation."
        />

        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          {actions.map((action, i) => {
            const Icon = action.icon;
            const Wrapper = action.href ? motion.a : motion.button;
            const wrapperProps = action.href
              ? {
                  href: action.href,
                  target: action.download ? undefined : "_blank",
                  rel: action.download ? undefined : "noopener noreferrer",
                  download: action.download || undefined,
                }
              : { onClick: action.onClick };

            return (
              <Wrapper
                key={i}
                {...(wrapperProps as any)}
                className="flex flex-col items-center gap-3 p-6 rounded-2xl border cursor-pointer transition-all duration-300 text-center"
                style={{
                  background: "var(--color-bg)",
                  borderColor: "var(--color-border)",
                }}
                whileHover={{ y: -4, borderColor: action.color }}
                whileTap={{ scale: 0.97 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: `${action.color}15`, color: action.iconColor }}
                >
                  <Icon size={22} />
                </div>
                <div>
                  <p className="font-display font-semibold text-sm" style={{ color: "var(--color-text)" }}>
                    {action.label}
                  </p>
                  <p className="font-mono text-xs mt-0.5 truncate max-w-[160px]" style={{ color: "var(--color-muted)" }}>
                    {action.sub}
                  </p>
                </div>
              </Wrapper>
            );
          })}
        </div>

        {/* Email text */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center"
        >
          <p className="font-mono text-sm" style={{ color: "var(--color-muted)" }}>
            Or reach me directly at{" "}
            <a
              href={`mailto:${EMAIL}`}
              className="transition-colors"
              style={{ color: "var(--color-primary)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-accent)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-primary)")}
            >
              {EMAIL}
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
