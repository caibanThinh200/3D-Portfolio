"use client";

import { useEffect } from "react";
import { heroScroll } from "../hero/heroScroll";
import { sceneScroll } from "./sceneScroll";

const SECTION_IDS = ["hero", "about", "projects", "contact"] as const;

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

      // Section offsets, with "dwell" (extra pinned scroll in tall sections)
      // removed so the 3D scene holds its pose while content reveals.
      const rawOffsets: number[] = [];
      const dwells: number[] = [];
      SECTION_IDS.forEach((id) => {
        const el = document.getElementById(id);
        if (!el) {
          rawOffsets.push(0);
          dwells.push(0);
          return;
        }
        rawOffsets.push(el.getBoundingClientRect().top + window.scrollY);
        dwells.push(Math.max(0, el.offsetHeight - winH));
      });

      let consumed = 0;
      let removed = 0;
      const offsets = rawOffsets.map((o, i) => {
        const eff = o - removed;
        removed += dwells[i];
        consumed += Math.min(dwells[i], Math.max(0, scrollY - o));
        return eff;
      });
      const effScroll = scrollY - consumed;

      // Continuous section progress 0.0 -> 3.0
      let continuous = 0;
      if (effScroll <= offsets[0]) {
        continuous = 0;
      } else if (effScroll <= offsets[1]) {
        const span = Math.max(1, offsets[1] - offsets[0]);
        continuous = 0 + (effScroll - offsets[0]) / span;
      } else if (effScroll <= offsets[2]) {
        const span = Math.max(1, offsets[2] - offsets[1]);
        continuous = 1 + (effScroll - offsets[1]) / span;
      } else {
        const span = Math.max(1, offsets[3] - offsets[2]);
        continuous = Math.min(3, 2 + (effScroll - offsets[2]) / span);
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
