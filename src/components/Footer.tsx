export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="border-t py-8"
      style={{ background: "var(--color-bg)", borderColor: "var(--color-border)" }}
    >
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="font-mono text-xs" style={{ color: "var(--color-muted)" }}>
          © {year}{" "}
          <span style={{ color: "var(--color-text)" }}>Mohamed Cherif Braham</span>
        </p>

        {/* Binary ticker */}
        <p className="font-mono text-[10px] tracking-widest opacity-30 select-none" style={{ color: "var(--color-muted)" }}>
          01000010 01010101 01001001 01001100 01000100 01000101 01010010
        </p>

        <p className="font-mono text-xs text-center" style={{ color: "var(--color-muted)" }}>
          Built with coffee, solder, and a lot of debugging.
        </p>
      </div>
    </footer>
  );
}
