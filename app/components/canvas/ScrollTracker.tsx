"use client";

import { useEffect } from "react";
import { heroScroll } from "../hero/heroScroll";
import { sceneScroll } from "./sceneScroll";

const SECTION_IDS = ["hero", "projects", "about", "contact"] as const;

/**
 * Invisible client component that synchronizes window scroll to shared R3F state.
 *
 * - heroScroll.progress: 0.0 -> 1.0 over entire document
 * - sceneScroll.progress: continuous float 0.0 -> 3.0 matching the 4 sections
 * - sceneScroll.phase: current active section index (0, 1, 2, 3)
 */
export default function ScrollTracker() {
  useEffect(() => {
    const update = () => {
      const scrollY = window.scrollY;
      const winH = window.innerHeight;
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - winH);

      // Full document scroll progress 0 -> 1
      heroScroll.progress = Math.min(1, Math.max(0, scrollY / maxScroll));

      // Get section offsets
      const offsets = SECTION_IDS.map((id) => {
        const el = document.getElementById(id);
        if (!el) return 0;
        return el.getBoundingClientRect().top + window.scrollY;
      });

      // Continuous section progress 0.0 -> 3.0
      let continuous = 0;
      if (scrollY <= offsets[0]) {
        continuous = 0;
      } else if (scrollY <= offsets[1]) {
        const span = Math.max(1, offsets[1] - offsets[0]);
        continuous = 0 + (scrollY - offsets[0]) / span;
      } else if (scrollY <= offsets[2]) {
        const span = Math.max(1, offsets[2] - offsets[1]);
        continuous = 1 + (scrollY - offsets[1]) / span;
      } else {
        const span = Math.max(1, offsets[3] - offsets[2]);
        continuous = Math.min(3, 2 + (scrollY - offsets[2]) / span);
      }

      sceneScroll.progress = continuous;
      sceneScroll.phase = Math.min(3, Math.floor(continuous));
      sceneScroll.phaseProgress = continuous - Math.floor(continuous);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return null;
}
