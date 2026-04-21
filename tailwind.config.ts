import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2563EB",
          light: "#3B82F6",
          dark: "#1D4ED8",
        },
        accent: {
          DEFAULT: "#F97316",
          light: "#FB923C",
          dark: "#EA6c00",
        },
        secondary: {
          DEFAULT: "#10B981",
          light: "#34D399",
          dark: "#059669",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          dark: "#0F1526",
        },
        bg: {
          DEFAULT: "#F8FAFC",
          dark: "#07090F",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      animation: {
        "blink": "blink 1.4s step-start infinite",
        "dash": "dash 2s ease-in-out forwards",
        "float": "float 6s ease-in-out infinite",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "cursor-pulse": "cursorPulse 1s ease-in-out infinite",
        "scan": "scan 3s linear infinite",
      },
      keyframes: {
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        dash: {
          from: { strokeDashoffset: "1000" },
          to: { strokeDashoffset: "0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "1" },
        },
        cursorPulse: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.3)" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
      },
      backgroundImage: {
        "grid-light":
          "radial-gradient(circle, #cbd5e1 1px, transparent 1px)",
        "grid-dark":
          "radial-gradient(circle, #1e293b 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};

export default config;
