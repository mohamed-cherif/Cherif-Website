interface SectionHeadingProps {
  label: string;
  title: string;
  subtitle?: string;
}

export function SectionHeading({ label, title, subtitle }: SectionHeadingProps) {
  return (
    <div className="mb-10 md:mb-12">
      <p className="label flex items-center gap-2">
        <span className="inline-block w-6 h-px" style={{ background: "var(--color-accent)" }} />
        {label.replace(/_/g, " ")}
      </p>
      <h2
        className="mt-3 text-3xl md:text-4xl font-display font-semibold tracking-tight"
        style={{ color: "var(--color-text)" }}
      >
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-base max-w-xl" style={{ color: "var(--color-muted)" }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
