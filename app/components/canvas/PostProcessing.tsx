"use client";

import { EffectComposer, Bloom, Vignette, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";

export default function PostProcessing() {
  return (
    <EffectComposer multisampling={4}>
      <Bloom
        luminanceThreshold={0.7}
        luminanceSmoothing={0.2}
        intensity={1.1}
        mipmapBlur
      />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <Vignette offset={0.25} darkness={0.95} eskil={false} />
    </EffectComposer>
  );
}
