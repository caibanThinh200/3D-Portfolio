"use client";

import clsx from "clsx";
import { motion, type Variants } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Shared container drives staggered children */
const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.13, delayChildren: 0.08 },
  },
};

/** Standard item: fade + slide-up + unblur — spring on filter avoids end-of-transition snap */
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 32, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      opacity: { duration: 1.1, ease: EASE },
      y: { duration: 1.1, ease: EASE },
      filter: { type: "spring" as const, stiffness: 60, damping: 20, restDelta: 0.001 },
    },
  },
};

/** Headline gets a stronger entrance */
const headlineVariants: Variants = {
  hidden: { opacity: 0, y: 48, filter: "blur(14px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      opacity: { duration: 1.35, ease: EASE },
      y: { duration: 1.35, ease: EASE },
      filter: { type: "spring" as const, stiffness: 45, damping: 18, restDelta: 0.001 },
    },
  },
};

export default function HeroOverlay() {
  return (
    <motion.div
      className={clsx('relative', 'flex', 'min-h-screen', 'flex-col', 'items-center', 'justify-center', 'px-6', 'py-20', 'text-center', 'max-w-4xl', 'mx-auto')}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Ambient glow behind the text block */}
      <motion.div
        variants={itemVariants}
        aria-hidden
        className={clsx('pointer-events-none', 'absolute', 'left-1/2', 'top-1/2', '-translate-x-1/2', '-translate-y-1/2', 'h-[340px]', 'w-[640px]', 'rounded-full', 'opacity-25', 'blur-[100px]')}
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,212,255,0.6) 0%, rgba(48,98,255,0.45) 50%, transparent 80%)",
        }}
      />

      {/* Phase Label */}
      <motion.div
        variants={itemVariants}
        className={clsx('mb-6', 'flex', 'items-center', 'justify-center', 'gap-3', 'text-xs', 'uppercase', 'tracking-[0.3em]', 'text-cyan-400')}
      >
        <span className={clsx('inline-block', 'h-1.5', 'w-1.5', 'rounded-full', 'bg-cyan-400', 'shadow-[0_0_8px_#00d4ff]')} />
        <span>Phase 01 &bull; Introduction</span>
      </motion.div>

      {/* Main Headline */}
      <motion.h1
        variants={headlineVariants}
        className={clsx('font-serif', 'text-[clamp(2.75rem,5.5vw,5.5rem)]', 'font-normal', 'leading-[1.08]', 'tracking-tight', 'text-white', 'drop-shadow-[0_4px_30px_rgba(48,98,255,0.35)]', 'text-center')}
      >
        Crafting Digital&nbsp;
        <br />
        {/* Highlight: bold, larger, gradient — no italic */}
        <span
          className={clsx('font-extrabold', 'tracking-[0.08em]', 'text-[clamp(3.4rem,6.8vw,6.8rem)]', 'leading-[1]', 'text-transparent', 'bg-clip-text')}
          style={{
            backgroundImage:
              "linear-gradient(135deg, #ffffff 0%, #a5f3fc 35%, #22d3ee 65%, #06b6d4 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Experiences.
        </span>
      </motion.h1>

      {/* Bio / Tagline */}
      <motion.p
        variants={itemVariants}
        className={clsx('mt-6', 'max-w-2xl', 'text-base', 'sm:text-lg', 'leading-relaxed', 'text-white/65', 'font-light', 'text-center')}
      >
        Full-stack engineer &amp; creative technologist crafting 3D immersive web
        experiences at the intersection of high-performance code, real-time shaders,
        and tactile aesthetics.
      </motion.p>

      {/* Specialty Badges */}
      <motion.div
        variants={itemVariants}
        className={clsx('mt-8', 'flex', 'flex-wrap', 'justify-center', 'gap-2.5')}
      >
        {["Three.js / WebGL", "React & Next.js", "Creative Tech", "Shader Art"].map(
          (skill) => (
            <span
              key={skill}
              className={clsx('rounded-full', 'border', 'border-white/10', 'bg-white/[0.04]', 'px-3.5', 'py-1', 'text-xs', 'text-white/70', 'backdrop-blur-md')}
            >
              {skill}
            </span>
          ),
        )}
      </motion.div>

      {/* Dual CTA */}
      <motion.div
        variants={itemVariants}
        className={clsx('mt-10', 'flex', 'flex-wrap', 'items-center', 'justify-center', 'gap-4')}
      >
        <a
          href="#projects"
          className={clsx('inline-flex', 'items-center', 'gap-2.5', 'rounded-full', 'bg-white', 'px-7', 'py-3', 'text-xs', 'font-semibold', 'uppercase', 'tracking-[0.16em]', 'text-black', 'transition-all', 'duration-300', 'hover:bg-cyan-300', 'hover:shadow-[0_0_24px_rgba(0,212,255,0.5)]')}
        >
          Selected Works
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M6 1v10M1 6l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>

        <a
          href="#contact"
          className={clsx('inline-flex', 'items-center', 'gap-2', 'rounded-full', 'border', 'border-white/20', 'bg-white/[0.02]', 'px-6', 'py-3', 'text-xs', 'font-medium', 'uppercase', 'tracking-[0.16em]', 'text-white/80', 'backdrop-blur-sm', 'transition-all', 'duration-300', 'hover:border-cyan-400/50', 'hover:bg-white/10', 'hover:text-white')}
        >
          Get in Touch
        </a>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        variants={itemVariants}
        className={clsx('mt-16', 'flex', 'items-center', 'justify-center', 'gap-3', 'text-xs', 'uppercase', 'tracking-[0.2em]', 'text-white/35')}
      >
        <span className={clsx('relative', 'flex', 'h-8', 'w-px', 'overflow-hidden', 'bg-white/20')}>
          <motion.span
            className={clsx('absolute', 'top-0', 'h-3', 'w-px', 'bg-cyan-400')}
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </span>
        <span>Scroll to explore perspective shift &rarr;</span>
      </motion.div>
    </motion.div>
  );
}
