"use client";

import { RefObject, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { easing } from "maath";
import LazyCanvas from "./LazyCanvas";
import ModelBoundary from "./ModelBoundary";
import NormalizedModel from "./NormalizedModel";
import Stage from "./Stage";
import { ProceduralKettlebell } from "./Procedural";
import { MODELS } from "@/lib/assets";
import { useReducedMotion } from "@/lib/useReducedMotion";

function PremiumObject({ progressRef, reduced }: { progressRef: RefObject<number>; reduced: boolean }) {
  const group = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const p = progressRef.current ?? 0; // 0→1 across the 3 feature blocks

    if (reduced) {
      g.rotation.set(0.1, 0.5, 0);
      return;
    }

    // each feature block turns the object to a new angle
    easing.damp(g.rotation, "y", 0.4 + p * Math.PI * 2.2, 0.45, delta);
    easing.damp(g.rotation, "x", 0.08 + Math.sin(p * Math.PI * 3) * 0.22, 0.45, delta);
    easing.damp3(
      g.position,
      [0, Math.sin(state.clock.elapsedTime * 0.6) * 0.07, 0],
      0.4,
      delta
    );
  });

  return (
    <group ref={group}>
      <ModelBoundary fallback={<ProceduralKettlebell />}>
        <NormalizedModel url={MODELS.premium} targetSize={2.3} />
      </ModelBoundary>
    </group>
  );
}

export default function PremiumScene({ progressRef }: { progressRef: RefObject<number> }) {
  const reduced = useReducedMotion();
  return (
    <LazyCanvas feather className="absolute inset-0" camera={{ position: [0, 0.2, 5], fov: 40 }}>
      <Stage shadowY={-1.5}>
        <PremiumObject progressRef={progressRef} reduced={reduced} />
      </Stage>
    </LazyCanvas>
  );
}
