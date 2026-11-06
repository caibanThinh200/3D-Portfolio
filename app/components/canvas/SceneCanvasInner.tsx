"use client";

import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { NoToneMapping } from "three";
import { Leva } from "leva";
import HeroScene from "./HeroScene";
import PostProcessing from "./PostProcessing";

export default function SceneCanvasInner() {
  // Adaptive resolution: start at 1.5x and let PerformanceMonitor lower/raise it
  // when the GPU begins to struggle (e.g. thermal throttling after a while).
  const [dpr, setDpr] = useState(1.5);

  return (
    <>
      <Leva hidden={process.env.NODE_ENV === "production"} collapsed />
      <Canvas
        dpr={dpr}
        camera={{ position: [0, 0, 9], fov: 35, near: 0.1, far: 50 }}
        gl={{
          antialias: false,
          alpha: false,
          toneMapping: NoToneMapping,
          powerPreference: "high-performance",
        }}
      >
        <PerformanceMonitor
          bounds={() => [45, 58]}
          flipflops={4}
          onChange={({ factor }) => setDpr(1 + 0.75 * factor)}
          onFallback={() => setDpr(1)}
        />
        <HeroScene />
        <PostProcessing />
      </Canvas>
    </>
  );
}
