"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

const links = [
  { label: "Projects", href: "#projects" },
  { label: "Skills", href: "#skills" },
  { label: "Experience", href: "#experience" },
  { label: "About", href: "#about" },
  { label: "Awards", href: "#awards" },
  { label: "Contact", href: "#contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Sections live on the home page; from a project page, navigate back to them.
  const handleLink = (href: string) => {
    setOpen(false);
    if (isHome) {
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push(`/${href}`);
    }
  };

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? "color-mix(in srgb, var(--color-bg) 92%, transparent)" : "transparent",
          backdropFilter: scrolled ? "blur(8px)" : "none",
          borderBottom: `1px solid ${scrolled ? "var(--color-border)" : "transparent"}`,
        }}
      >
        <nav className="max-w-6xl mx-auto px-5 md:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            onClick={(e) => {
              if (!isHome) return;
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="font-mono font-medium text-sm tracking-[0.18em] flex items-center gap-2"
            style={{ color: "var(--color-text)" }}
          >
            <span className="inline-block w-2 h-2" style={{ background: "var(--color-accent)" }} />
            MCB
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-7">
            {links.map((l) => (
              <button
                key={l.href}
                onClick={() => handleLink(l.href)}
                className="label transition-colors duration-150 cursor-pointer hover:text-[var(--color-accent)]"
              >
                {l.label}
              </button>
            ))}
            <ThemeToggle />
          </div>

          {/* Mobile */}
          <div className="flex md:hidden items-center gap-3">
            <ThemeToggle />
            <motion.button
              onClick={() => setOpen(!open)}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-lg"
              style={{ color: "var(--color-text)" }}
              aria-label="Toggle menu"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </motion.button>
          </div>
        </nav>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 left-0 right-0 z-40 md:hidden border-b"
            style={{
              background: "var(--color-surface)",
              borderColor: "var(--color-border)",
            }}
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              {links.map((l) => (
                <button
                  key={l.href}
                  onClick={() => handleLink(l.href)}
                  className="text-left font-display text-base font-medium py-1 cursor-pointer"
                  style={{ color: "var(--color-text)" }}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
