"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useReducedMotion } from "@/lib/useReducedMotion";

const PURPLE = new THREE.Color("#a78bfa");
const CYAN = new THREE.Color("#00f2ff");

// deterministic PRNG so the field is identical on every render (mulberry32)
function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function Field() {
  const ref = useRef<THREE.Points>(null);
  const { size } = useThree();
  const count = size.width < 768 ? 110 : 180;

  const { positions, colors } = useMemo(() => {
    const rand = mulberry32(20260612);
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (rand() - 0.5) * 14;
      pos[i * 3 + 1] = (rand() - 0.5) * 9;
      pos[i * 3 + 2] = (rand() - 0.5) * 5;
      c.copy(rand() > 0.4 ? PURPLE : CYAN).multiplyScalar(0.5 + rand() * 0.5);
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return { positions: pos, colors: col };
  }, [count]);

  useFrame((state, delta) => {
    const p = ref.current;
    if (!p) return;
    // slow drift + gentle scroll parallax (dust hangs in the air while you scroll)
    p.rotation.y += delta * 0.016;
    const scrollOffset = (window.scrollY / window.innerHeight) * 0.45;
    p.position.y += ((scrollOffset % 2) - 1 - p.position.y) * Math.min(delta * 1.5, 1) * 0.4;
    p.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.04;
  });

  return (
    <points ref={ref} key={count}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.045}
        vertexColors
        transparent
        opacity={0.55}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/**
 * Site-wide holographic "dust": one fixed, full-viewport canvas behind the
 * content. Deliberately cheap — ~180 unlit points, dpr locked to 1, no
 * postprocessing — so it never competes with the section canvases.
 */
export default function AmbientParticles() {
  const reduced = useReducedMotion();
  if (reduced) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
      <Canvas
        dpr={1}
        camera={{ position: [0, 0, 6], fov: 50 }}
        gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
        style={{ background: "transparent" }}
      >
        <Field />
      </Canvas>
    </div>
  );
}
