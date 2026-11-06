"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import Lenis from "lenis";

const LenisContext = createContext<Lenis | null>(null);

export const useLenis = () => useContext(LenisContext);

/** Wraps the app in Lenis smooth scrolling (drives native window scroll, so scroll listeners keep working). */
export default function SmoothScroll({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    const instance = new Lenis({ lerp: 0.1, smoothWheel: true, autoRaf: false });
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLenis(instance);

    let raf = 0;
    const loop = (time: number) => {
      instance.raf(time);
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(loop);
    };
    const onVisibility = () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else start();
    };
    start();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      cancelAnimationFrame(raf);
      instance.destroy();
      setLenis(null);
    };
  }, []);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}
