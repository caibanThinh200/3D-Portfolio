"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { heroScroll } from "./heroScroll";

/** Tall wrapper + sticky viewport: the hero stays pinned while the user scrolls
 *  through the wrapper, and `heroScroll.progress` goes 0 → 1 over that range. */
export default function HeroPin({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const update = () => {
      const el = ref.current;
      if (!el) return;
      const range = el.offsetHeight - window.innerHeight;
      const top = el.getBoundingClientRect().top;
      heroScroll.progress = range > 0 ? Math.min(1, Math.max(0, -top / range)) : 0;
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      heroScroll.progress = 0;
    };
  }, []);

  return (
    <section ref={ref} id="hero" className="relative h-[260vh] w-full">
      <div className="sticky top-0 h-screen w-full overflow-hidden">{children}</div>
    </section>
  );
}
