"use client";

import { motion } from "framer-motion";

export default function ScrollIndicator() {
  return (
    <motion.button
      type="button"
      id="scroll-indicator"
      aria-label="Scroll to selected works"
      onClick={() =>
        document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })
      }
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, delay: 1.4 }}
      className="group absolute bottom-[5vh] right-[5vw] z-20 flex flex-col items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-white/50 transition-colors hover:text-white"
    >
      <span>Scroll</span>
      <span className="relative block h-12 w-px overflow-hidden bg-white/20">
        <motion.span
          className="absolute left-0 top-0 block h-4 w-px bg-white"
          animate={{ y: [-16, 48] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
      </span>
    </motion.button>
  );
}
