"use client";

import { Canvas } from "@react-three/fiber";
import { NoToneMapping } from "three";
import { Leva } from "leva";
import HeroScene from "./HeroScene";
import PostProcessing from "./PostProcessing";

export default function SceneCanvasInner() {
  return (
    <>
      <Leva hidden={process.env.NODE_ENV === "production"} collapsed />
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 9], fov: 35, near: 0.1, far: 50 }}
        gl={{ antialias: false, alpha: false, toneMapping: NoToneMapping }}
      >
        <HeroScene />
        <PostProcessing />
      </Canvas>
    </>
  );
}
