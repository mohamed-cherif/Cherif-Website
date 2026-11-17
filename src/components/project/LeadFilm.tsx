import type { LeadFilm as LeadFilmData } from "@/data/projects";
import { LoopVideo } from "@/components/LoopVideo";

/**
 * The project's main video: plays on its own, with the browser's controls so
 * it can be paused, scrubbed and taken full screen.
 */
export function LeadFilm({ film }: { film: LeadFilmData }) {
  const { video } = film;
  const w = video.width ?? 16;
  const h = video.height ?? 9;
  const portrait = h > w * 1.1;

  const player = (
    <div className="panel ticks blueprint-grid flex justify-center">
      <div
        className="relative w-full"
        style={{
          aspectRatio: `${w} / ${h}`,
          maxHeight: "80vh",
          maxWidth: `min(100%, calc(80vh * ${w / h}), ${Math.round(Math.max(w * 1.5, 480))}px)`,
          background: "#000",
        }}
      >
        <LoopVideo src={video.src} poster={video.poster} label={video.caption} fit="contain" controls />
      </div>
    </div>
  );

  const notes = (film.title || film.points) && (
    <div>
      {film.title && (
        <h3 className="text-2xl font-display font-semibold leading-tight" style={{ color: "var(--color-text)" }}>
          {film.title}
        </h3>
      )}
      {film.points && (
        <ol className="mt-4 space-y-2.5">
          {film.points.map((point, i) => (
            <li key={point} className="flex gap-3 text-base leading-snug" style={{ color: "var(--color-muted)" }}>
              <span className="label pt-1 shrink-0" style={{ color: "var(--color-accent)" }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              {point}
            </li>
          ))}
        </ol>
      )}
    </div>
  );

  if (portrait && notes) {
    return (
      <div className="grid lg:grid-cols-12 gap-5 lg:gap-10 items-center">
        <div className="lg:col-span-7">{player}</div>
        <div className="lg:col-span-5">{notes}</div>
      </div>
    );
  }
  return (
    <div>
      {player}
      {notes && <div className="mt-5 max-w-3xl">{notes}</div>}
    </div>
  );
}
