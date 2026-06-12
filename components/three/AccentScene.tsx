"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import LazyCanvas from "./LazyCanvas";
import ModelBoundary from "./ModelBoundary";
import NormalizedModel from "./NormalizedModel";
import Stage from "./Stage";
import { ProceduralPlateStack } from "./Procedural";
import { MODELS } from "@/lib/assets";
import { useReducedMotion } from "@/lib/useReducedMotion";

function AccentObject({ reduced }: { reduced: boolean }) {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    const g = group.current;
    if (!g || reduced) return;
    g.rotation.y = state.clock.elapsedTime * 0.18;
  });

  return (
    <group ref={group} rotation={[0.18, 0, 0]}>
      <ModelBoundary fallback={<ProceduralPlateStack />}>
        <NormalizedModel url={MODELS.accent} targetSize={2.4} />
      </ModelBoundary>
    </group>
  );
}

/** Slow-spinning decorative accent (membership closer). Bloom off — keep it cheap. */
export default function AccentScene({ className }: { className?: string }) {
  const reduced = useReducedMotion();
  return (
    <LazyCanvas className={className} camera={{ position: [0, 0.4, 5.4], fov: 38 }}>
      <Stage shadowY={-1.4} bloom={false}>
        <AccentObject reduced={reduced} />
      </Stage>
    </LazyCanvas>
  );
}
