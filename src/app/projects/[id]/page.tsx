import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ExternalLink, FileText } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CursorDot } from "@/components/CursorDot";
import {
  getProject,
  orderedProjects,
  type Project,
  type ProjectDemo,
  type ProjectVideo,
} from "@/data/projects";

type Props = { params: Promise<{ id: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return orderedProjects.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const project = getProject(id);
  if (!project) return {};
  return {
    title: `${project.shortTitle ?? project.title} | Mohamed Cherif Braham`,
    description: project.tagline,
    openGraph: {
      title: project.title,
      description: project.tagline,
      images: (project.cover ?? project.images[0]) ? [project.cover ?? project.images[0]] : undefined,
    },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { id } = await params;
  const project = getProject(id);
  if (!project) notFound();

  // Lead media: a demo GIF sits beside the overview; otherwise a video or the
  // first photo runs full width above it. Everything else goes to the gallery.
  const demos = project.demos ?? [];
  const videos = project.videos ?? [];
  const leadDemo = demos[0];
  const leadVideo = leadDemo ? undefined : videos[0];
  const leadImage = leadDemo || leadVideo ? undefined : project.images[0];
  const galleryImages = leadImage ? project.images.slice(1) : project.images;
  const galleryDemos = demos.slice(1);
  const galleryVideos = leadVideo ? videos.slice(1) : videos;

  const index = orderedProjects.findIndex((p) => p.id === project.id);
  const prev = orderedProjects[index - 1];
  const next = orderedProjects[index + 1];

  return (
    <>
      <CursorDot />
      <Navbar />
      <main className="pt-28 pb-20" style={{ background: "var(--color-bg)" }}>
        <article className="max-w-5xl mx-auto px-6">
          <Link
            href="/#projects"
            className="inline-flex items-center gap-1.5 font-mono text-xs hover:underline underline-offset-2"
            style={{ color: "var(--color-muted)" }}
          >
            <ArrowLeft size={12} /> All projects
          </Link>

          {/* Header */}
          <header className="mt-8">
            <p
              className="font-mono text-sm mb-3 tracking-widest uppercase"
              style={{ color: "var(--color-primary)" }}
            >
              <span style={{ color: "var(--color-accent)" }}>{">"}</span> projects/{project.id}
            </p>
            <h1
              className="text-3xl md:text-5xl font-display font-bold tracking-tight leading-tight"
              style={{ color: "var(--color-text)" }}
            >
              {project.title}
            </h1>
            <p className="font-mono text-xs mt-3" style={{ color: "var(--color-muted)" }}>
              {project.date}
            </p>
            <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: "var(--color-muted)" }}>
              {project.tagline}
            </p>

            {(project.liveUrl || project.pdfUrl) && (
              <div className="mt-5 flex flex-wrap gap-2">
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-mono font-medium text-white"
                    style={{ background: "var(--color-primary)" }}
                  >
                    Live <ExternalLink size={12} />
                  </a>
                )}
                {project.pdfUrl && (
                  <a
                    href={project.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-mono font-medium text-white"
                    style={{ background: "var(--color-primary)" }}
                  >
                    PDF <FileText size={12} />
                  </a>
                )}
              </div>
            )}

            <div className="mt-6 flex items-center gap-2">
              <div className="h-0.5 w-12 rounded" style={{ background: "var(--color-primary)" }} />
              <div className="h-0.5 w-4 rounded" style={{ background: "var(--color-accent)" }} />
            </div>
          </header>

          {/* Lead media + overview */}
          {leadDemo ? (
            <div className="mt-12 grid gap-10 items-start md:grid-cols-2">
              <div className="md:sticky md:top-24">
                <DemoFigure demo={leadDemo} preload />
              </div>
              <Summary project={project} />
            </div>
          ) : (
            <>
              {leadVideo && (
                <div className="mt-12">
                  <VideoFigure video={leadVideo} />
                </div>
              )}
              {leadImage && (
                <div className="mt-12">
                  <StageImage src={leadImage} alt={project.title} caption={project.captions?.[leadImage]} />
                </div>
              )}
              <div className="mt-12">
                <Summary project={project} wide />
              </div>
            </>
          )}

          {/* Write-up */}
          {project.sections ? (
            project.sections.map((section) => (
              <section key={section.heading} className="mt-14">
                <Heading>{section.heading}</Heading>
                {section.body && (
                  <p className="mt-3 text-base leading-relaxed max-w-3xl" style={{ color: "var(--color-muted)" }}>
                    {section.body}
                  </p>
                )}
                {section.bullets && <BulletList items={section.bullets} />}
              </section>
            ))
          ) : (
            <section className="mt-14">
              <Heading>What I built</Heading>
              <BulletList items={project.bullets} />
            </section>
          )}

          {/* Gallery */}
          {(galleryImages.length > 0 || galleryDemos.length > 0 || galleryVideos.length > 0) && (
            <section className="mt-14">
              <Heading>Gallery</Heading>
              <div className="mt-5 grid sm:grid-cols-2 gap-6 items-start">
                {galleryVideos.map((video) => (
                  <VideoFigure key={video.src} video={video} />
                ))}
                {galleryDemos.map((demo) => (
                  <DemoFigure key={demo.src} demo={demo} />
                ))}
                {galleryImages.map((src, i) => (
                  <ImageFigure
                    key={src}
                    src={src}
                    alt={`${project.title} photo ${i + 1}`}
                    caption={project.captions?.[src]}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Document */}
          {project.pdfUrl && (
            <section className="mt-14">
              <Heading>Full document</Heading>
              <div
                className="mt-5 rounded-2xl border overflow-hidden"
                style={{ borderColor: "var(--color-border)" }}
              >
                <div
                  className="flex items-center justify-between px-4 py-2"
                  style={{ background: "var(--color-surface)" }}
                >
                  <span className="flex items-center gap-1.5 font-mono text-xs" style={{ color: "var(--color-muted)" }}>
                    <FileText size={13} /> {project.shortTitle ?? project.title}
                  </span>
                  <a
                    href={project.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 font-mono text-xs"
                    style={{ color: "var(--color-primary)" }}
                  >
                    Open in new tab <ExternalLink size={10} />
                  </a>
                </div>
                <iframe
                  src={project.pdfUrl}
                  title={`${project.title} PDF`}
                  className="block w-full"
                  style={{ height: "80vh", border: "none" }}
                />
              </div>
            </section>
          )}

          {/* Prev / next */}
          <nav
            className="mt-20 pt-8 border-t grid sm:grid-cols-2 gap-4"
            style={{ borderColor: "var(--color-border)" }}
            aria-label="More projects"
          >
            {prev ? (
              <Link
                href={`/projects/${prev.id}`}
                className="rounded-xl border p-4 transition-colors hover:border-[var(--color-primary)]"
                style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
              >
                <span className="flex items-center gap-1 font-mono text-xs" style={{ color: "var(--color-muted)" }}>
                  <ArrowLeft size={12} /> Previous
                </span>
                <span className="mt-1 block font-display font-semibold" style={{ color: "var(--color-text)" }}>
                  {prev.shortTitle ?? prev.title}
                </span>
              </Link>
            ) : (
              <span className="hidden sm:block" />
            )}
            {next && (
              <Link
                href={`/projects/${next.id}`}
                className="rounded-xl border p-4 sm:text-right transition-colors hover:border-[var(--color-primary)]"
                style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
              >
                <span
                  className="flex items-center gap-1 sm:justify-end font-mono text-xs"
                  style={{ color: "var(--color-muted)" }}
                >
                  Next <ArrowRight size={12} />
                </span>
                <span className="mt-1 block font-display font-semibold" style={{ color: "var(--color-text)" }}>
                  {next.shortTitle ?? next.title}
                </span>
              </Link>
            )}
          </nav>
        </article>
      </main>
      <Footer />
    </>
  );
}

function Summary({ project, wide }: { project: Project; wide?: boolean }) {
  const overview = (
    <div className="space-y-6">
      <div>
        <Label>Overview</Label>
        <p className="text-base leading-relaxed" style={{ color: "var(--color-muted)" }}>
          {project.description}
        </p>
      </div>
      {project.sections && (
        <Panel label="Highlights">
          <BulletList items={project.bullets} />
        </Panel>
      )}
    </div>
  );

  const facts = (
    <div className="space-y-6">
      {project.awards && project.awards.length > 0 && (
        <Panel label="Awards & Recognition" accent>
          <ul className="space-y-1">
            {project.awards.map((a) => (
              <li key={a} className="flex gap-2 text-sm" style={{ color: "var(--color-text)" }}>
                <span style={{ color: "var(--color-accent)" }}>🏆</span> {a}
              </li>
            ))}
          </ul>
        </Panel>
      )}
      <div>
        <Label>Built with</Label>
        <div className="flex flex-wrap gap-1.5">
          {project.tech.map((t) => (
            <span key={t} className="tech-chip">{t}</span>
          ))}
        </div>
      </div>
    </div>
  );

  return wide ? (
    <div className="grid gap-10 items-start md:grid-cols-[3fr_2fr]">
      {overview}
      {facts}
    </div>
  ) : (
    <div className="space-y-6">
      {overview}
      {facts}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-xs tracking-widest uppercase mb-3" style={{ color: "var(--color-primary)" }}>
      {children}
    </p>
  );
}

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xl md:text-2xl font-display font-bold tracking-tight" style={{ color: "var(--color-text)" }}>
      {children}
    </h2>
  );
}

function Panel({ label, accent, children }: { label: string; accent?: boolean; children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl p-4 border"
      style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
    >
      <p
        className="font-mono text-xs tracking-widest uppercase mb-2"
        style={{ color: accent ? "var(--color-accent)" : "var(--color-primary)" }}
      >
        {label}
      </p>
      {children}
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="mt-4 space-y-2.5">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-sm md:text-base leading-relaxed" style={{ color: "var(--color-muted)" }}>
          <span className="mt-2 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "var(--color-primary)" }} />
          {item}
        </li>
      ))}
    </ul>
  );
}

function DemoFigure({ demo, preload }: { demo: ProjectDemo; preload?: boolean }) {
  return (
    <figure>
      <div
        className="rounded-2xl border overflow-hidden flex justify-center"
        style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
      >
        {/* GIFs are served as-is so they keep animating */}
        <Image
          src={demo.src}
          alt={demo.caption}
          width={demo.width}
          height={demo.height}
          unoptimized
          preload={preload}
          className="block w-auto h-auto max-w-full max-h-[70vh]"
        />
      </div>
      <figcaption className="mt-2 font-mono text-xs leading-relaxed" style={{ color: "var(--color-muted)" }}>
        {demo.caption}
      </figcaption>
    </figure>
  );
}

function VideoFigure({ video }: { video: ProjectVideo }) {
  return (
    <figure>
      <div
        className="rounded-2xl border overflow-hidden"
        style={{ background: "#000", borderColor: "var(--color-border)" }}
      >
        <video
          src={video.src}
          poster={video.poster}
          width={video.width}
          height={video.height}
          controls
          playsInline
          preload="metadata"
          className="block w-full h-auto"
        />
      </div>
      <figcaption className="mt-2 font-mono text-xs leading-relaxed" style={{ color: "var(--color-muted)" }}>
        {video.caption}
      </figcaption>
    </figure>
  );
}

// Full-width lead photo on a 16:9 stage, contained so nothing is cropped
function StageImage({ src, alt, caption }: { src: string; alt: string; caption?: string }) {
  return (
    <figure>
      <a
        href={src}
        target="_blank"
        rel="noopener noreferrer"
        className="relative block rounded-2xl border overflow-hidden aspect-video"
        style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
      >
        <Image
          src={src}
          alt={caption ?? alt}
          fill
          sizes="(min-width: 1024px) 928px, 100vw"
          preload
          className="object-contain"
        />
      </a>
      {caption && (
        <figcaption className="mt-2 font-mono text-xs leading-relaxed" style={{ color: "var(--color-muted)" }}>
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

function ImageFigure({ src, alt, caption }: { src: string; alt: string; caption?: string }) {
  return (
    <figure>
      <a
        href={src}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-2xl border overflow-hidden"
        style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
      >
        {/* Nominal 4:3 size; h-auto lets the browser switch to the photo's real aspect ratio once loaded */}
        <Image
          src={src}
          alt={caption ?? alt}
          width={1600}
          height={1200}
          sizes="(min-width: 1024px) 480px, (min-width: 640px) 50vw, 100vw"
          className="block w-full h-auto"
        />
      </a>
      {caption && (
        <figcaption className="mt-2 font-mono text-xs leading-relaxed" style={{ color: "var(--color-muted)" }}>
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
