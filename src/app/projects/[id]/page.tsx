import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight, FileText, Plus } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MediaProvider, MediaTile } from "@/components/media/MediaViewer";
import { DemoSlot } from "@/components/demos/DemoSlot";
import { LeadFilm } from "@/components/project/LeadFilm";
import { Story } from "@/components/project/Story";
import { Breakdown } from "@/components/project/Breakdown";
import { Iterations } from "@/components/project/Iterations";
import { SystemDiagram } from "@/components/project/SystemDiagram";
import { Gallery } from "@/components/project/Gallery";
import { getProject, orderedProjects, type Media } from "@/data/projects";

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
      images: [project.card.poster],
    },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { id } = await params;
  const project = getProject(id);
  if (!project) notFound();

  const index = orderedProjects.findIndex((p) => p.id === project.id);
  const prev = orderedProjects[index - 1];
  const next = orderedProjects[index + 1];
  const number = String(index + 1).padStart(2, "0");
  const total = String(orderedProjects.length).padStart(2, "0");

  // Everything that can be opened in the full-screen viewer, in page order.
  const media: Media[] = [];
  const add = (m: Media | undefined) => {
    if (m && !media.some((x) => x.src === m.src)) media.push(m);
  };
  const posterOnly: Media = { kind: "image", src: project.card.poster, alt: project.title };
  if (!project.lead && !project.steps && !project.story && !project.demo) add(posterOnly);
  add(project.lead?.video);
  project.steps?.forEach((step) => step.stage.kind !== "model" && add(step.stage));
  project.story?.forEach((item) => add(item.media));
  project.gallery?.forEach(add);

  return (
    <MediaProvider items={media}>
      <Navbar />
      <main className="pt-24 pb-20" style={{ background: "var(--color-bg)" }}>
        <article className="max-w-6xl mx-auto px-5 md:px-6">
          {/* Header */}
          <header>
            <div className="flex items-center justify-between gap-4">
              <Link href="/#projects" className="label inline-flex items-center gap-1.5 hover:text-[var(--color-accent)] transition-colors">
                <ArrowLeft size={12} /> All projects
              </Link>
              <p className="label">
                <span style={{ color: "var(--color-accent)" }}>{number}</span> / {total} · {project.kind}
              </p>
            </div>

            <h1
              className="mt-6 text-4xl md:text-6xl font-display font-semibold leading-[1.04] max-w-4xl"
              style={{ color: "var(--color-text)" }}
            >
              {project.title}
            </h1>
            <p className="mt-4 text-lg md:text-xl leading-snug max-w-2xl" style={{ color: "var(--color-muted)" }}>
              {project.tagline}
            </p>

            {(project.liveUrl || project.pdfUrl) && (
              <div className="mt-5 flex flex-wrap gap-2">
                {project.liveUrl && (
                  <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="btn">
                    {project.liveUrl.includes("github.com") ? "Source design" : "Live site"} <ArrowUpRight size={13} />
                  </a>
                )}
                {project.pdfUrl && (
                  <a href={project.pdfUrl} target="_blank" rel="noopener noreferrer" className="btn">
                    <FileText size={13} /> Read the PDF
                  </a>
                )}
              </div>
            )}

            {/* Title block */}
            <dl
              className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-flow-col lg:auto-cols-fr border-t border-l"
              style={{ borderColor: "var(--color-border)" }}
            >
              {[["Date", project.date] as [string, string], ...project.facts].map(([k, v]) => (
                <div key={k} className="border-r border-b px-3 py-2.5" style={{ borderColor: "var(--color-border)" }}>
                  <dt className="label">{k}</dt>
                  <dd className="mt-1 font-mono text-xs leading-snug" style={{ color: "var(--color-text)" }}>
                    {v}
                  </dd>
                </div>
              ))}
            </dl>

            {project.awards && (
              <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1">
                {project.awards.map((a) => (
                  <li key={a} className="label flex items-center gap-2" style={{ color: "var(--color-text)" }}>
                    <span style={{ color: "var(--color-accent)" }}>■</span> {a}
                  </li>
                ))}
              </ul>
            )}
          </header>

          {/* Pages with nothing but a picture still lead with it */}
          {!project.lead && !project.steps && !project.story && !project.demo && (
            <div className="mt-10 relative panel ticks overflow-hidden aspect-video blueprint-grid">
              <MediaTile item={posterOnly} sizes="(min-width: 1152px) 1104px, 100vw" priority />
            </div>
          )}

          {project.lead && (
            <Section label="Watch it work" hint="Video">
              <LeadFilm film={project.lead} />
            </Section>
          )}

          {project.demo && (
            <Section label={project.demo.title} hint="Interactive">
              {project.demo.note && (
                <p className="mb-5 text-base leading-relaxed max-w-3xl" style={{ color: "var(--color-muted)" }}>
                  {project.demo.note}
                </p>
              )}
              <DemoSlot name={project.demo.key} />
            </Section>
          )}

          {project.steps && (
            <Section label="3D breakdown" hint="Scroll">
              <Breakdown steps={project.steps} />
            </Section>
          )}

          {project.story && (
            <Section label={project.lead || project.demo ? "How it works" : "The build"}>
              <Story items={project.story} />
            </Section>
          )}

          {project.iterations && (
            <Section
              label={project.iterations.title ?? "Iterations"}
              hint={project.iterations.title ? "Drag to rotate" : `${project.iterations.items.length} versions`}
            >
              <Iterations set={project.iterations} />
            </Section>
          )}

          {project.diagrams && (
            <Section label="System">
              <div className="space-y-8">
                {project.diagrams.map((d) => (
                  <SystemDiagram key={d.title} diagram={d} />
                ))}
              </div>
            </Section>
          )}

          {project.gallery && project.gallery.length > 0 && (
            <Section label="More photos and clips" hint="Click to open">
              <Gallery items={project.gallery} />
            </Section>
          )}

          {/* Technical details: closed by default so the page stays visual */}
          <Section label="Technical details">
            <div className="border-t" style={{ borderColor: "var(--color-border)" }}>
              {(project.details ?? []).map((block) => (
                <details key={block.heading} className="group border-b" style={{ borderColor: "var(--color-border)" }}>
                  <summary className="flex items-center justify-between gap-4 py-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                    <span className="text-lg font-display font-semibold" style={{ color: "var(--color-text)" }}>
                      {block.heading}
                    </span>
                    <Plus
                      size={16}
                      className="shrink-0 transition-transform duration-150 group-open:rotate-45"
                      style={{ color: "var(--color-accent)" }}
                    />
                  </summary>
                  <ul className="pb-5 space-y-2.5 max-w-3xl">
                    {block.items.map((item) => (
                      <li key={item} className="flex gap-3 text-sm md:text-base leading-relaxed" style={{ color: "var(--color-muted)" }}>
                        <span className="mt-[0.6em] w-1.5 h-px shrink-0" style={{ background: "var(--color-accent)" }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </details>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-1.5">
              {project.tech.map((t) => (
                <span key={t} className="tech-chip">
                  {t}
                </span>
              ))}
            </div>
            {project.credits && (
              <div className="mt-5 space-y-1">
                {project.credits.map((c) => (
                  <p key={c} className="font-mono text-[11px] leading-relaxed max-w-3xl" style={{ color: "var(--color-muted)" }}>
                    <span style={{ color: "var(--color-text)" }}>Credit.</span> {c}
                  </p>
                ))}
              </div>
            )}
          </Section>

          {project.pdfUrl && (
            <Section label="Full document">
              <div className="panel">
                <iframe
                  src={project.pdfUrl}
                  title={`${project.title} PDF`}
                  className="block w-full"
                  style={{ height: "80vh", border: "none" }}
                />
              </div>
            </Section>
          )}

          {/* Prev / next */}
          <nav className="mt-20 grid sm:grid-cols-2" aria-label="More projects">
            {prev ? (
              <Link
                href={`/projects/${prev.id}`}
                className="group border p-4 transition-colors hover:border-[var(--color-accent)] hover:z-10"
                style={{ borderColor: "var(--color-border)" }}
              >
                <span className="label flex items-center gap-1">
                  <ArrowLeft size={12} /> Previous
                </span>
                <span className="mt-1.5 block font-display font-semibold" style={{ color: "var(--color-text)" }}>
                  {prev.shortTitle ?? prev.title}
                </span>
              </Link>
            ) : (
              <span className="hidden sm:block" />
            )}
            {next && (
              <Link
                href={`/projects/${next.id}`}
                className="group border p-4 sm:text-right sm:-ml-px -mt-px sm:mt-0 transition-colors hover:border-[var(--color-accent)] hover:z-10"
                style={{ borderColor: "var(--color-border)" }}
              >
                <span className="label flex items-center gap-1 sm:justify-end">
                  Next <ArrowRight size={12} />
                </span>
                <span className="mt-1.5 block font-display font-semibold" style={{ color: "var(--color-text)" }}>
                  {next.shortTitle ?? next.title}
                </span>
              </Link>
            )}
          </nav>
        </article>
      </main>
      <Footer />
    </MediaProvider>
  );
}

function Section({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="mt-16 md:mt-24">
      <div className="mb-5 flex items-center gap-3">
        <span className="inline-block w-6 h-px" style={{ background: "var(--color-accent)" }} />
        <h2 className="label" style={{ color: "var(--color-text)" }}>
          {label}
        </h2>
        <span className="flex-1 h-px" style={{ background: "var(--color-border)" }} />
        {hint && <span className="label">{hint}</span>}
      </div>
      {children}
    </section>
  );
}
