"use client";

import { useEffect, useRef, useState } from "react";

const PROJECTS = [
  { title: "Nebula Dashboard", tag: "Web App", year: "2025", desc: "Real-time analytics dashboard with live 3D data visualisation.", hue: 190 },
  { title: "Orbit Commerce", tag: "E-commerce", year: "2025", desc: "Headless storefront with immersive product configurator.", hue: 265 },
  { title: "Pulse Fitness", tag: "Mobile", year: "2024", desc: "Cross-platform workout tracker with social challenges.", hue: 160 },
  { title: "Aurora Studio", tag: "Creative", year: "2024", desc: "WebGL portfolio engine for digital artists.", hue: 320 },
  { title: "Helix API", tag: "Backend", year: "2023", desc: "Scalable event-driven platform handling millions of requests.", hue: 30 },
  { title: "Lumen Docs", tag: "Tooling", year: "2023", desc: "Developer documentation generator with instant search.", hue: 215 },
];

export default function ProjectsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    const measure = () => {
      const track = trackRef.current;
      if (!track) return;
      const distance = Math.max(0, track.scrollWidth - window.innerWidth);
      setHeight(window.innerHeight + distance);
    };

    const update = () => {
      const section = sectionRef.current;
      const track = trackRef.current;
      if (!section || !track) return;
      const distance = Math.max(0, track.scrollWidth - window.innerWidth);
      const scrolled = -section.getBoundingClientRect().top;
      const p = Math.min(1, Math.max(0, scrolled / Math.max(1, section.offsetHeight - window.innerHeight)));
      track.style.transform = `translate3d(${-p * distance}px,0,0)`;
    };

    const onResize = () => {
      measure();
      update();
    };

    measure();
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="projects"
      style={{ height: height ?? "300vh" }}
      className="relative border-t border-white/5"
    >
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <div className="px-6 sm:px-12 lg:px-16 xl:px-24 mb-10 flex flex-col gap-3 pointer-events-auto">
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-cyan-400">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00d4ff]" />
            <span>Phase 03 &bull; Selected Works</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-light text-white/90">
            Selected Works
          </h2>
        </div>

        <div
          ref={trackRef}
          className="flex w-max gap-6 px-6 sm:px-12 lg:px-16 xl:px-24 will-change-transform pointer-events-auto"
        >
          {PROJECTS.map((p, i) => (
            <article
              key={p.title}
              className="group relative flex h-[340px] w-[300px] sm:w-[380px] shrink-0 flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-2 hover:border-white/25"
              style={{
                backgroundImage: `radial-gradient(circle at 80% 0%, hsla(${p.hue},90%,60%,0.25), transparent 60%)`,
              }}
            >
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-white/50">
                <span>{String(i + 1).padStart(2, "0")}</span>
                <span>{p.year}</span>
              </div>
              <div className="flex flex-col gap-3">
                <span
                  className="w-fit rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.2em]"
                  style={{ borderColor: `hsla(${p.hue},90%,65%,0.5)`, color: `hsl(${p.hue},90%,75%)` }}
                >
                  {p.tag}
                </span>
                <h3 className="font-serif text-2xl text-white/90">{p.title}</h3>
                <p className="text-sm leading-relaxed text-white/50">{p.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
