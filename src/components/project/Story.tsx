import type { StoryItem } from "@/data/projects";
import { MediaTile } from "@/components/media/MediaViewer";

/**
 * Photo-and-clip projects: big media with a short note beside it, sides
 * alternating down the page. Media is never stretched past its real size.
 */
export function Story({ items }: { items: StoryItem[] }) {
  return (
    <ol className="space-y-12 md:space-y-20">
      {items.map((item, i) => {
        const w = item.media.width ?? 4;
        const h = item.media.height ?? 3;
        const portrait = h > w;
        const flip = i % 2 === 1;
        return (
          <li key={item.title} className="grid lg:grid-cols-12 gap-5 lg:gap-10 items-center">
            <div className={`lg:col-span-8 ${flip ? "lg:order-2" : ""}`}>
              <div className="panel ticks blueprint-grid flex justify-center">
                <div
                  className="relative w-full"
                  style={{
                    aspectRatio: `${w} / ${h}`,
                    // keep portrait media on one screen and low-res media near its real size
                    maxHeight: portrait ? "78vh" : undefined,
                    maxWidth: portrait ? `calc(78vh * ${w / h})` : Math.max(w * 1.35, 480),
                  }}
                >
                  <MediaTile item={item.media} sizes="(min-width: 1024px) 760px, 100vw" priority={i === 0} />
                </div>
              </div>
            </div>
            <div className={`lg:col-span-4 ${flip ? "lg:order-1" : ""}`}>
              <p className="label" style={{ color: "var(--color-accent)" }}>
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-2 text-2xl font-display font-semibold leading-tight" style={{ color: "var(--color-text)" }}>
                {item.title}
              </h3>
              <p className="mt-3 text-base leading-relaxed" style={{ color: "var(--color-muted)" }}>
                {item.text}
              </p>
              {item.facts && (
                <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
                  {item.facts.map(([k, v]) => (
                    <div key={k} className="contents">
                      <dt className="label pt-0.5">{k}</dt>
                      <dd className="font-mono text-xs" style={{ color: "var(--color-text)" }}>
                        {v}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
