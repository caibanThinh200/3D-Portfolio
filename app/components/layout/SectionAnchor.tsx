"use client";

import { useEffect, useState } from "react";
import { useLenis } from "./SmoothScroll";

const ITEMS = [
  { id: "hero", label: "Home" },
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "testimonials", label: "Testimonials" },
  { id: "contact", label: "Contact" },
] as const;

export default function SectionAnchor() {
  const lenis = useLenis();
  const [active, setActive] = useState<string>(ITEMS[0].id);

  useEffect(() => {
    const update = () => {
      const line = window.scrollY + window.innerHeight * 0.4;
      let current: string = ITEMS[0].id;
      for (const { id } of ITEMS) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top + window.scrollY <= line) current = id;
      }
      setActive(current);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const go = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { duration: 1.4 });
    else el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      aria-label="Section navigation"
      className="fixed right-6 top-6 z-50 hidden border-l border-white/20 lg:block"
    >
      <ul className="flex flex-col gap-4 py-1">
        {ITEMS.map(({ id, label }) => {
          const isActive = active === id;
          return (
            <li key={id} className="relative">
              <span
                aria-hidden="true"
                className={`absolute -left-px top-0 h-full w-px bg-[#ff2d95] transition-opacity duration-300 ${
                  isActive ? "opacity-100" : "opacity-0"
                }`}
              />
              <button
                type="button"
                id={`anchor-${id}`}
                onClick={() => go(id)}
                aria-current={isActive ? "true" : undefined}
                className={`block pl-4 text-left text-xs uppercase tracking-[0.2em] transition-colors duration-300 hover:text-[#ff7ac6] ${
                  isActive ? "text-[#ff2d95]" : "text-white/50"
                }`}
              >
                {label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
