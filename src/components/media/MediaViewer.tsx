"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Maximize2, Pause, Play, X } from "lucide-react";
import type { Media } from "@/data/projects";
import { LoopVideo } from "@/components/LoopVideo";

/* ── Viewer context ───────────────────────────────────────────────────── */

interface Viewer {
  open: (src: string) => void;
}
const ViewerContext = createContext<Viewer>({ open: () => {} });

/**
 * Wraps a page. Every photo and clip inside can be opened full-screen, and
 * the viewer steps through all of the page's media with the arrow keys.
 */
export function MediaProvider({ items, children }: { items: Media[]; children: React.ReactNode }) {
  const [index, setIndex] = useState<number | null>(null);
  const open = useCallback(
    (src: string) => {
      const i = items.findIndex((m) => m.src === src);
      if (i >= 0) setIndex(i);
    },
    [items]
  );
  const viewer = useMemo(() => ({ open }), [open]);
  const close = useCallback(() => setIndex(null), []);
  const step = useCallback(
    (d: number) => setIndex((i) => (i === null ? i : (i + d + items.length) % items.length)),
    [items.length]
  );

  return (
    <ViewerContext.Provider value={viewer}>
      {children}
      {index !== null && <Lightbox items={items} index={index} onClose={close} onStep={step} />}
    </ViewerContext.Provider>
  );
}

function Lightbox({
  items,
  index,
  onClose,
  onStep,
}: {
  items: Media[];
  index: number;
  onClose: () => void;
  onStep: (d: number) => void;
}) {
  const item = items[index];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onStep(1);
      if (e.key === "ArrowLeft") onStep(-1);
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose, onStep]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Media viewer"
      className="fixed inset-0 z-[100] flex flex-col"
      style={{ background: "rgba(5, 6, 7, 0.96)" }}
    >
      <div className="flex items-center justify-between gap-4 px-4 h-12 shrink-0">
        <p className="label" style={{ color: "#e9ebee" }}>
          <span style={{ color: "var(--color-accent)" }}>{String(index + 1).padStart(2, "0")}</span> /{" "}
          {String(items.length).padStart(2, "0")}
          <span className="ml-3 opacity-70">{item.kind === "video" ? "Clip" : "Photo"}</span>
        </p>
        <button onClick={onClose} className="btn" style={{ color: "#e9ebee" }} aria-label="Close viewer">
          Close <X size={14} />
        </button>
      </div>

      <div
        className="relative flex-1 min-h-0 flex items-center justify-center px-4 sm:px-16"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        {item.kind === "video" ? (
          <video
            key={item.src}
            src={item.src}
            poster={item.poster}
            controls
            autoPlay
            loop
            muted
            playsInline
            className="max-w-full max-h-full"
            style={{ background: "#000" }}
          />
        ) : (
          // Full-resolution original, not the resized page version
          // eslint-disable-next-line @next/next/no-img-element
          <img key={item.src} src={item.src} alt={item.alt} className="max-w-full max-h-full object-contain" />
        )}

        {items.length > 1 && (
          <>
            <button
              onClick={() => onStep(-1)}
              aria-label="Previous"
              className="btn absolute left-2 top-1/2 -translate-y-1/2 !px-2"
              style={{ color: "#e9ebee", background: "rgba(5,6,7,0.7)" }}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => onStep(1)}
              aria-label="Next"
              className="btn absolute right-2 top-1/2 -translate-y-1/2 !px-2"
              style={{ color: "#e9ebee", background: "rgba(5,6,7,0.7)" }}
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}
      </div>

      <p className="px-4 py-3 text-center font-mono text-xs shrink-0 min-h-10" style={{ color: "#b5bac1" }}>
        {item.caption ?? (item.kind === "image" ? item.alt : "")}
      </p>
    </div>
  );
}

/* ── Media that opens in the viewer ───────────────────────────────────── */

/** A photo or figure. Click to open it full size. */
export function Photo({
  item,
  sizes,
  priority,
  className = "",
}: {
  item: Extract<Media, { kind: "image" }>;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  const { open } = useContext(ViewerContext);
  return (
    <button
      type="button"
      onClick={() => open(item.src)}
      className={`group absolute inset-0 block cursor-zoom-in ${className}`}
      aria-label={`Open full size: ${item.alt}`}
    >
      <Image
        src={item.src}
        alt={item.alt}
        fill
        sizes={sizes}
        quality={90}
        preload={priority}
        className={item.fit === "cover" ? "object-cover" : "object-contain"}
      />
      <span
        className="label absolute bottom-0 right-0 px-1.5 py-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity"
        style={{ background: "var(--color-bg)", color: "var(--color-text)" }}
      >
        <Maximize2 size={11} /> View
      </span>
    </button>
  );
}

/** A silent looping clip with pause and full-screen buttons. */
export function Clip({
  item,
  active = true,
  fit,
}: {
  item: Extract<Media, { kind: "video" }>;
  active?: boolean;
  fit?: "cover" | "contain";
}) {
  const { open } = useContext(ViewerContext);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [paused, setPaused] = useState(false);

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
      setPaused(false);
    } else {
      video.pause();
      setPaused(true);
    }
  };

  return (
    <div className="absolute inset-0">
      <LoopVideo
        src={item.src}
        poster={item.poster}
        active={active && !paused}
        label={item.caption}
        fit={fit ?? item.fit ?? "contain"}
        onVideo={(el) => {
          videoRef.current = el;
        }}
      />
      <div className="absolute bottom-0 left-0 flex">
        <button
          type="button"
          onClick={toggle}
          className="label px-2 py-1.5 flex items-center gap-1.5 cursor-pointer hover:text-[var(--color-accent)] transition-colors"
          style={{ background: "var(--color-bg)", color: "var(--color-text)" }}
          aria-label={paused ? "Play clip" : "Pause clip"}
        >
          {paused ? <Play size={11} /> : <Pause size={11} />} {paused ? "Play" : "Pause"}
        </button>
        <button
          type="button"
          onClick={() => open(item.src)}
          className="label px-2 py-1.5 flex items-center gap-1.5 cursor-pointer border-l hover:text-[var(--color-accent)] transition-colors"
          style={{ background: "var(--color-bg)", color: "var(--color-text)", borderColor: "var(--color-border)" }}
          aria-label="Open clip with controls"
        >
          <Maximize2 size={11} /> Full screen
        </button>
      </div>
    </div>
  );
}

/** Either kind, filling its (positioned) parent. */
export function MediaTile({
  item,
  sizes,
  active,
  priority,
}: {
  item: Media;
  sizes: string;
  active?: boolean;
  priority?: boolean;
}) {
  return item.kind === "video" ? <Clip item={item} active={active} /> : <Photo item={item} sizes={sizes} priority={priority} />;
}
