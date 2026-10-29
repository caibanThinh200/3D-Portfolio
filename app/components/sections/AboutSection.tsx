"use client";

import { useEffect, useRef, useState } from "react";

const BLOCKS = [
  {
    kicker: "01 \u2022 Who I Am",
    title: "Creative Developer",
    body: "I design and build immersive web experiences where interaction, motion and 3D come together into something memorable.",
  },
  {
    kicker: "02 \u2022 What I Do",
    title: "Capabilities",
    body: "Front-end engineering, WebGL / React Three Fiber, motion design, and performance-minded architecture for modern product teams.",
  },
  {
    kicker: "03 \u2022 Toolbox",
    title: "Stack & Craft",
    body: "TypeScript, React, Next.js, Three.js, GLSL, Node.js \u2014 chosen carefully, shipped with attention to detail.",
  },
  {
    kicker: "04 \u2022 Approach",
    title: "How I Work",
    body: "Start with the story, prototype quickly, polish relentlessly. Every pixel and every frame should have a reason to exist.",
  },
];

/**
 * Section 2: content on the RIGHT (hand sits on the left).
 * The section is taller than the viewport; an inner sticky container stays
 * pinned while blocks reveal one after another as the user scrolls down.
 */
/** Scroll distance (px) after the section pins before the first card appears */
const FIRST_CARD_DELAY = 200;

/** Offset (px) between stacked cards, top and left */
const STACK_GAP = 44;

export default function AboutSection() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const update = () => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = Math.max(1, rect.height - window.innerHeight);
      const scrolled = Math.max(0, -rect.top);
      // First card waits for FIRST_CARD_DELAY px of scroll after the section pins
      if (scrolled < FIRST_CARD_DELAY) {
        setActive(-1);
        return;
      }
      const progress = Math.min(
        1,
        (scrolled - FIRST_CARD_DELAY) / Math.max(1, total - FIRST_CARD_DELAY),
      );
      // Reveal in order across the remaining dwell
      const idx = Math.min(
        BLOCKS.length - 1,
        Math.floor(progress * BLOCKS.length),
      );
      setActive(idx);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <section
      ref={ref}
      id="about"
      className="relative border-t border-white/5"
      style={{ height: `${(BLOCKS.length + 1) * 100}vh` }}
    >
      <div className="sticky top-0 flex h-screen items-center px-6 sm:px-12 lg:px-16 xl:px-24">
        <div className="w-full lg:w-1/2 lg:ml-auto pointer-events-auto flex flex-col gap-6">
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-cyan-400">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00d4ff]" />
            <span>Phase 02 &bull; About</span>
          </div>

          {/* Stacked cards: each later card sits STACK_GAP px lower and further right */}
          <div
            className="relative w-full max-w-lg"
            style={{ height: 240 + (BLOCKS.length - 1) * STACK_GAP }}
          >
            {BLOCKS.map((b, i) => {
              const visible = i <= active;
              return (
                <div
                  key={b.title}
                  className="absolute h-60 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#14172b] to-[#0a0c1a] px-6 pb-6 pt-5 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md transition-all duration-200 ease-out"
                  style={{
                    top: i * STACK_GAP,
                    left: i * STACK_GAP,
                    width: `calc(100% - ${(BLOCKS.length - 1) * STACK_GAP}px)`,
                    zIndex: i,
                    opacity: visible ? 1 : 0,
                    transform: visible
                      ? "translateY(0) scale(1)"
                      : "translateY(60px) scale(0.96)",
                  }}
                >
                  <p className="mb-3 text-[11px] uppercase tracking-[0.3em] text-cyan-400">
                    {b.kicker}
                  </p>
                  <h2 className="font-serif text-2xl sm:text-3xl font-light text-white/90">
                    {b.title}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-white/60">
                    {b.body}
                  </p>
                </div>
              );
            })}

          </div>

        </div>
      </div>
    </section>
  );
}
