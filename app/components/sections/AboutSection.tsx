export default function AboutSection() {
  return (
    <section
      id="about"
      className="flex min-h-screen items-center px-6 sm:px-12 lg:px-16 xl:px-24 border-t border-white/5"
    >
      <div className="w-full lg:w-1/2 pointer-events-auto flex flex-col gap-3">
        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-cyan-400">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00d4ff]" />
          <span>Phase 03 &bull; Capabilities &amp; About</span>
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl font-light text-white/90">
          About &amp; Capabilities
        </h2>
        <p className="text-xs uppercase tracking-[0.2em] text-white/40">
          Upcoming Phase &bull; Hand on the Right &bull; Content on the Left
        </p>
      </div>
    </section>
  );
}
