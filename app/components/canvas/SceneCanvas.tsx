"use client";

import dynamic from "next/dynamic";

/** SSR-free wrapper: Three.js must never render on the server. */
const SceneCanvasInner = dynamic(() => import("./SceneCanvasInner"), {
  ssr: false,
});

export default function SceneCanvas() {
  return (
    <div className="absolute -inset-[3%] bg-black" aria-hidden="true">
      <SceneCanvasInner />
    </div>
  );
}
