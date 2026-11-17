import type { Media } from "@/data/projects";
import { MediaTile } from "@/components/media/MediaViewer";

/** Photos and silent clips in a tight grid. Click any of them to open it full size. */
export function Gallery({ items }: { items: Media[] }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 items-start">
      {items.map((item) => {
        const portrait = (item.height ?? 3) > (item.width ?? 4);
        const wide = item.wide && !portrait;
        return (
          <figure key={item.src} className={wide ? "col-span-2" : ""}>
            <div
              className="relative panel overflow-hidden"
              style={{ aspectRatio: `${item.width ?? 4} / ${item.height ?? 3}`, background: "var(--color-surface)" }}
            >
              <MediaTile item={item.fit ? item : { ...item, fit: "cover" }} sizes="(min-width: 1024px) 560px, 50vw" />
            </div>
            {item.caption && (
              <figcaption className="mt-1.5 font-mono text-[11px] leading-snug" style={{ color: "var(--color-muted)" }}>
                {item.caption}
              </figcaption>
            )}
          </figure>
        );
      })}
    </div>
  );
}
