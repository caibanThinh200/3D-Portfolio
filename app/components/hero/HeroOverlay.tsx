"use client";

import { motion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as const;

function BrandMark() {
  return (
    <motion.svg
      width="28"
      height="40"
      viewBox="0 0 28 40"
      fill="none"
      aria-label="Brand mark"
      role="img"
      animate={{ y: [0, -6, 0], opacity: [0.85, 1, 0.85] }}
      transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Abstract faceted glyph */}
      <path d="M0 0H28V13.3H14L0 0Z" fill="#fff" />
      <path d="M0 13.3H14L28 26.6H14V40L0 26.6V13.3Z" fill="#fff" fillOpacity="0.92" />
      <path d="M14 13.3L28 26.6H14V13.3Z" fill="#fff" fillOpacity="0.55" />
    </motion.svg>
  );
}

export default function HeroOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      <motion.h1
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: EASE }}
        style={{ left: "50%", x: "-50%" }}
        className="font-serif absolute top-[7.5vh] whitespace-nowrap text-[clamp(2.25rem,5.2vw,4.5rem)] font-normal leading-none tracking-tight text-white"
      >
        Make magic happen
      </motion.h1>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.6, delay: 0.8, ease: EASE }}
        className="absolute bottom-[5vh] left-1/2 -translate-x-1/2"
      >
        <BrandMark />
      </motion.div>
    </div>
  );
}
