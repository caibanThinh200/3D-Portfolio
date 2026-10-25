"use client";

import { motion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as const;

export default function HeroOverlay() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-20 text-center max-w-4xl mx-auto">
      {/* Phase Label */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: EASE }}
        className="mb-6 flex items-center justify-center gap-3 text-xs uppercase tracking-[0.3em] text-cyan-400"
      >
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00d4ff]" />
        <span>Phase 01 &bull; Introduction</span>
      </motion.div>

      {/* Main Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.1, ease: EASE }}
        className="font-serif text-[clamp(2.75rem,5.5vw,5.5rem)] font-normal leading-[1.05] tracking-tight text-white drop-shadow-[0_4px_30px_rgba(48,98,255,0.35)] text-center"
      >
        Make magic <br />
        <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-cyan-400">
          happen.
        </span>
      </motion.h1>

      {/* Bio / Tagline */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.25, ease: EASE }}
        className="mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-white/65 font-light text-center"
      >
        Full-stack engineer &amp; creative technologist crafting 3D immersive web
        experiences at the intersection of high-performance code, real-time shaders,
        and tactile aesthetics.
      </motion.p>

      {/* Specialty Badges */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.4, ease: EASE }}
        className="mt-8 flex flex-wrap justify-center gap-2.5"
      >
        {["Three.js / WebGL", "React & Next.js", "Creative Tech", "Shader Art"].map(
          (skill) => (
            <span
              key={skill}
              className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1 text-xs text-white/70 backdrop-blur-md"
            >
              {skill}
            </span>
          ),
        )}
      </motion.div>

      {/* Dual CTA */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.55, ease: EASE }}
        className="mt-10 flex flex-wrap items-center justify-center gap-4"
      >
        <a
          href="#projects"
          className="inline-flex items-center gap-2.5 rounded-full bg-white px-7 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-black transition-all duration-300 hover:bg-cyan-300 hover:shadow-[0_0_24px_rgba(0,212,255,0.5)]"
        >
          Selected Works
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M6 1v10M1 6l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>

        <a
          href="#contact"
          className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.02] px-6 py-3 text-xs font-medium uppercase tracking-[0.16em] text-white/80 backdrop-blur-sm transition-all duration-300 hover:border-cyan-400/50 hover:bg-white/10 hover:text-white"
        >
          Get in Touch
        </a>
      </motion.div>

      {/* Scroll indicator for phase progression */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 0.9 }}
        className="mt-16 flex items-center justify-center gap-3 text-xs uppercase tracking-[0.2em] text-white/35"
      >
        <span className="relative flex h-8 w-px overflow-hidden bg-white/20">
          <motion.span
            className="absolute top-0 h-3 w-px bg-cyan-400"
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </span>
        <span>Scroll to explore perspective shift &rarr;</span>
      </motion.div>
    </div>
  );
}
