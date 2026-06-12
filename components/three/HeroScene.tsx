"use client";

import { RefObject, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { easing } from "maath";
import LazyCanvas from "./LazyCanvas";
import ModelBoundary from "./ModelBoundary";
import NormalizedModel from "./NormalizedModel";
import Stage from "./Stage";
import { ProceduralDumbbell } from "./Procedural";
import { MODELS } from "@/lib/assets";
import { useReducedMotion } from "@/lib/useReducedMotion";

function HeroObject({ progressRef, reduced }: { progressRef: RefObject<number>; reduced: boolean }) {
  const group = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const p = progressRef.current ?? 0; // 0→1 hero scroll exit

    if (reduced) {
      g.rotation.set(0.15, 0.6, -0.1);
      return;
    }

    // slow idle rotation + float, accelerated by scroll exit
    g.rotation.y = t * 0.28 + p * Math.PI * 1.6;
    g.position.y = Math.sin(t * 0.7) * 0.1 - p * 0.6;

    // subtle mouse-parallax tilt
    easing.damp(g.rotation, "x", 0.12 + state.pointer.y * -0.18, 0.5, delta);
    easing.damp(g.rotation, "z", state.pointer.x * 0.14, 0.5, delta);

    // scale out as the hero unpins
    const s = 1 - p * 0.55;
    g.scale.setScalar(Math.max(s, 0.2));
  });

  return (
    <group ref={group}>
      <ModelBoundary fallback={<ProceduralDumbbell />}>
        <NormalizedModel url={MODELS.hero} targetSize={2.7} rotation={[0, 0, -0.3]} />
      </ModelBoundary>
    </group>
  );
}

export default function HeroScene({ progressRef }: { progressRef: RefObject<number> }) {
  const reduced = useReducedMotion();
  return (
    <LazyCanvas className="absolute inset-0" camera={{ position: [0, 0, 5.2], fov: 42 }}>
      <Stage shadowY={-1.7}>
        <HeroObject progressRef={progressRef} reduced={reduced} />
      </Stage>
    </LazyCanvas>
  );
}
