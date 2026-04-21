"use client";

import { useEffect, useRef } from "react";

export function CircuitSVG() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const paths = svgRef.current?.querySelectorAll(".circuit-path");
    paths?.forEach((p, i) => {
      const el = p as SVGPathElement;
      const len = el.getTotalLength?.() ?? 600;
      el.style.strokeDasharray = String(len);
      el.style.strokeDashoffset = String(len);
      el.style.animationDelay = `${i * 0.4}s`;
      el.style.animationFillMode = "forwards";
    });
  }, []);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full opacity-60"
      aria-hidden
    >
      {/* Circuit traces */}
      <path
        className="circuit-path"
        d="M 40 200 L 100 200 L 100 100 L 200 100"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        style={{ color: "var(--color-primary)", animationDuration: "2s" }}
      />
      <path
        className="circuit-path"
        d="M 200 100 L 300 100 L 300 200 L 360 200"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        style={{ color: "var(--color-primary)", animationDuration: "2s" }}
      />
      <path
        className="circuit-path"
        d="M 200 100 L 200 50 L 280 50"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        style={{ color: "var(--color-secondary)", animationDuration: "1.8s" }}
      />
      <path
        className="circuit-path"
        d="M 100 200 L 100 300 L 200 300 L 200 350"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        style={{ color: "var(--color-primary)", animationDuration: "2.2s" }}
      />
      <path
        className="circuit-path"
        d="M 300 200 L 300 300 L 200 300"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        style={{ color: "var(--color-accent)", animationDuration: "2s" }}
      />
      <path
        className="circuit-path"
        d="M 200 300 L 140 300 L 140 340"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        style={{ color: "var(--color-secondary)", animationDuration: "1.6s" }}
      />
      <path
        className="circuit-path"
        d="M 160 160 L 200 200 L 240 200 L 240 240"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        style={{ color: "var(--color-accent)", animationDuration: "2.4s" }}
      />

      {/* Nodes (circles at junctions) */}
      {[
        [100, 200], [200, 100], [300, 200], [200, 300], [280, 50], [140, 340], [200, 350],
      ].map(([cx, cy], i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={4}
          fill="var(--color-primary)"
          style={{
            opacity: 0,
            animation: `pulseGlow 2s ease-in-out ${1.5 + i * 0.3}s infinite`,
          }}
        />
      ))}

      {/* Chips (rectangles) */}
      <rect
        x="170" y="75" width="60" height="50" rx="4"
        stroke="var(--color-primary)" strokeWidth="1.5" fill="var(--color-surface)"
        style={{ opacity: 0.5 }}
      />
      <rect
        x="170" y="175" width="60" height="50" rx="4"
        stroke="var(--color-accent)" strokeWidth="1.5" fill="var(--color-surface)"
        style={{ opacity: 0.5 }}
      />
      <text
        x="200" y="105" textAnchor="middle" dominantBaseline="middle"
        fill="var(--color-primary)" style={{ fontSize: "10px", fontFamily: "var(--font-mono)", opacity: 0.7 }}
      >
        ESP32
      </text>
      <text
        x="200" y="205" textAnchor="middle" dominantBaseline="middle"
        fill="var(--color-accent)" style={{ fontSize: "9px", fontFamily: "var(--font-mono)", opacity: 0.7 }}
      >
        MCU
      </text>
    </svg>
  );
}
