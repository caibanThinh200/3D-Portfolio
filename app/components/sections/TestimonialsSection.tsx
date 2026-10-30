"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import AutoScroll from "embla-carousel-auto-scroll";
import clsx from "clsx";

const TESTIMONIALS = [
  { name: "Amelia Hart", role: "CTO, Nebula Labs", hue: 190, quote: "Shipped our dashboard weeks ahead of schedule. The 3D visualisations blew our investors away." },
  { name: "Daniel Okafor", role: "Founder, Orbit Commerce", hue: 265, quote: "Rare mix of design taste and engineering rigour. Conversion jumped 38% after the redesign." },
  { name: "Mai Tran", role: "Product Lead, Pulse", hue: 160, quote: "Communication was flawless and the app felt native from the very first build." },
  { name: "Lucas Meyer", role: "Creative Director, Aurora", hue: 320, quote: "Turned a wild WebGL idea into a smooth, performant experience. Absolute pro." },
  { name: "Sofia Reyes", role: "Eng. Manager, Helix", hue: 30, quote: "Our API now scales effortlessly. Clean code, great docs, zero drama." },
];

const CLIENTS = [
  "Nebula Labs", "Orbit Commerce", "Pulse Fitness", "Aurora Studio", "Helix API",
  "Lumen Docs", "Vertex AI", "Kinetic", "Northwind", "Atlas Cloud", "Solstice", "Quantum Forge",
];

/** Final resting pose of each card in the stack + the pose it flies in from. */
const POSES = [
  { x: -46, y: 18, rotate: -11 },
  { x: 38, y: 10, rotate: 8 },
  { x: -22, y: 2, rotate: -5 },
  { x: 20, y: -6, rotate: 4 },
  { x: 0, y: -12, rotate: -1.5 },
];

function ClientStrip({ direction, angle }: { direction: "forward" | "backward"; angle: number }) {
  const [viewportRef] = useEmblaCarousel({ loop: true, dragFree: true, watchDrag: false }, [
    AutoScroll({ speed: 1, direction, startDelay: 0, stopOnInteraction: false }),
  ]);

  return (
    <div
      aria-hidden="true"
      className={clsx('pointer-events-none', 'absolute', 'left-1/2', 'top-1/2', 'w-[190%]', '-translate-x-1/2', '-translate-y-1/2')}
      style={{ transform: `translate(-50%, -50%) rotate(${angle}deg)` }}
    >
      <div ref={viewportRef} className="overflow-hidden">
        <div className="flex">
          {[...CLIENTS, ...CLIENTS].map((c, i) => (
            <div key={`${c}-${i}`} className={clsx('mr-4', 'shrink-0')}>
              <div className={clsx('rounded-full', 'border', 'border-white/10', 'bg-white/[0.04]', 'px-8', 'py-4', 'font-serif', 'text-xl', 'tracking-wide', 'text-white/30', 'backdrop-blur-sm', 'sm:text-2xl')}>
                {c}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Extra scroll distance (px) between one card appearing and the next. */
const CARD_GAP_PX = 1000;

function TestimonialCard({
  t,
  i,
  progress,
}: {
  t: (typeof TESTIMONIALS)[number];
  i: number;
  progress: MotionValue<number>;
}) {
  const n = TESTIMONIALS.length;
  const pose = POSES[i];
  const side = i % 2 === 0 ? -1 : 1;
  // Card i animates during its own 200px slice of scroll.
  const range = [i / n, (i + 1) / n];
  const x = useTransform(progress, range, [side * 700, pose.x]);
  const y = useTransform(progress, range, [160, pose.y]);
  const rotate = useTransform(progress, range, [side * 55, pose.rotate]);
  const opacity = useTransform(progress, [i / n, i / n + 0.35 / n], [0, 1]);
  const scale = useTransform(progress, range, [0.85, 1]);

  return (
    <motion.article
      className={clsx('absolute', 'inset-0', 'flex', 'flex-col', 'justify-between', 'overflow-hidden', 'rounded-3xl', 'border', 'border-white/15', 'bg-[#0b0b1c]', 'p-7', 'shadow-[0_20px_60px_rgba(0,0,0,0.6)]', 'will-change-transform')}
      style={{
        zIndex: i,
        x,
        y,
        rotate,
        opacity,
        scale,
        backgroundImage: `radial-gradient(circle at 85% 0%, hsla(${t.hue},90%,60%,0.28), transparent 60%)`,
      }}
    >
      <div
        className={clsx('pointer-events-none', 'absolute', 'inset-3', 'rounded-2xl', 'border')}
        style={{ borderColor: `hsla(${t.hue},90%,65%,0.45)` }}
      />
      <div className={clsx('relative', 'flex', 'items-center', 'justify-between', 'text-[10px]', 'uppercase', 'tracking-[0.3em]', 'text-white/40')}>
        <span>{String(i + 1).padStart(2, "0")} / {String(TESTIMONIALS.length).padStart(2, "0")}</span>
        <span style={{ color: `hsl(${t.hue},90%,75%)` }}>&#9733;&#9733;&#9733;&#9733;&#9733;</span>
      </div>
      <p className={clsx('relative', 'font-serif', 'text-xl', 'leading-snug', 'text-white/90')}>
        &ldquo;{t.quote}&rdquo;
      </p>
      <div className={clsx('relative', 'flex', 'items-center', 'gap-4')}>
        <div
          className={clsx('flex', 'h-12', 'w-12', 'items-center', 'justify-center', 'rounded-full', 'text-sm', 'font-medium', 'text-black')}
          style={{ background: `linear-gradient(135deg, hsl(${t.hue},90%,70%), hsl(${t.hue + 40},90%,55%))` }}
        >
          {t.name.split(" ").map((n) => n[0]).join("")}
        </div>
        <div className={clsx('flex', 'flex-col')}>
          <span className={clsx('text-sm', 'text-white/90')}>{t.name}</span>
          <span className={clsx('text-xs', 'text-white/50')}>{t.role}</span>
        </div>
      </div>
    </motion.article>
  );
}

export default function TestimonialsSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  return (
    <section
      ref={ref}
      id="testimonials"
      style={{ height: `calc(100vh + ${TESTIMONIALS.length * CARD_GAP_PX}px)` }}
      className={clsx('relative', 'min-h-[820px]', 'border-t', 'border-white/5')}
    >
      <div className={clsx('sticky', 'top-0', 'h-screen', 'min-h-[820px]', 'overflow-hidden')}>
        <div className={clsx('pointer-events-auto', 'absolute', 'left-6', 'top-16', 'flex', 'flex-col', 'gap-3', 'sm:left-12', 'lg:left-16', 'xl:left-24')}>
          <div className={clsx('flex', 'items-center', 'gap-3', 'text-xs', 'uppercase', 'tracking-[0.3em]', 'text-cyan-400')}>
            <span className={clsx('inline-block', 'h-1.5', 'w-1.5', 'rounded-full', 'bg-cyan-400', 'shadow-[0_0_8px_#00d4ff]')} />
            <span>Phase 04 &bull; Testimonials</span>
          </div>
          <h2 className={clsx('font-serif', 'text-3xl', 'font-light', 'text-white/90', 'sm:text-4xl')}>Kind Words</h2>
        </div>

        <div className={clsx('pointer-events-auto', 'absolute', 'left-1/2', 'top-1/2', 'h-[440px]', 'w-[320px]', '-translate-x-1/2', '-translate-y-1/2', 'sm:h-[480px]', 'sm:w-[360px]')}>
          {TESTIMONIALS.map((t, i) => (
            <TestimonialCard key={t.name} t={t} i={i} progress={scrollYProgress} />
          ))}
        </div>
      </div>
    </section>
  );
}
