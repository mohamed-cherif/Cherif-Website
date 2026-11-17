"use client";

import { useEffect, useRef } from "react";

interface LoopVideoProps {
  src: string;
  poster: string;
  /** play only while true (and on screen); defaults to "whenever on screen" */
  active?: boolean;
  label?: string;
  className?: string;
  fit?: "cover" | "contain";
  /** show the browser's own controls (scrub, fullscreen) */
  controls?: boolean;
  /** receives the <video> element, for callers that add their own controls */
  onVideo?: (el: HTMLVideoElement | null) => void;
}

/**
 * Silent looping clip that plays while it is on screen, like a GIF.
 *
 * It plays even when the system asks for reduced motion: these clips are the
 * content of the page, and every one can be paused or opened in the viewer.
 */
export function LoopVideo({ src, poster, active = true, label, className = "", fit = "cover", controls, onVideo }: LoopVideoProps) {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    // React does not reliably set `muted` on a server-rendered <video>, and
    // browsers refuse to autoplay anything that is not muted.
    video.muted = true;
    video.defaultMuted = true;

    let onScreen = false;
    const sync = () => {
      if (onScreen && active) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        sync();
      },
      { threshold: 0.2 }
    );
    io.observe(video);
    return () => io.disconnect();
  }, [active]);

  return (
    <video
      ref={(el) => {
        ref.current = el;
        onVideo?.(el);
      }}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      controls={controls}
      preload="metadata"
      aria-label={label}
      className={`block w-full h-full ${className}`}
      style={{ objectFit: fit }}
    />
  );
}
