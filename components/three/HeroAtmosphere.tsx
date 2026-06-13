"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { sceneBus } from "@/lib/sceneBus";

/**
 * Cinematic "studio" atmosphere around the hero object — god-ray shafts,
 * a soft floor light-pool, drifting volumetric fog, and a slow sweeping
 * rim light so the purple→cyan edge travels across the metal.
 *
 * Deliberately cheap: all faked with a handful of additive, depth-write-off
 * planes + one moving light. No postprocessing pass, no render targets, no
 * new geometry on the models. The whole group fades out as the hero exits
 * (driven by sceneBus.hero), so it never appears in later sections.
 */

function gradientTexture(stops: [number, string][], radial: boolean) {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d")!;
  const grad = radial
    ? ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
    : ctx.createLinearGradient(0, 0, 0, 128);
  for (const [offset, color] of stops) grad.addColorStop(offset, color);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

const RAYS = [
  { x: -1.7, rot: 0.22, w: 1.1, h: 7, color: "#7f29ff", base: 0.16 },
  { x: 0.1, rot: -0.12, w: 1.5, h: 7.5, color: "#a78bfa", base: 0.12 },
  { x: 1.8, rot: -0.26, w: 1.0, h: 7, color: "#00f2ff", base: 0.14 },
];

const FOG = [
  { x: -2.2, y: -0.6, s: 4.5, color: "#7f2982", drift: 0.04 },
  { x: 2.4, y: 0.5, s: 5, color: "#06b6d4", drift: -0.03 },
  { x: 0.2, y: -1.4, s: 4, color: "#7f29ff", drift: 0.05 },
];

export default function HeroAtmosphere() {
  const group = useRef<THREE.Group>(null);
  const sweep = useRef<THREE.PointLight>(null);
  const mats = useRef<THREE.Material[]>([]);

  const rayTex = useMemo(
    () =>
      gradientTexture(
        [
          [0, "rgba(255,255,255,0)"],
          [0.5, "rgba(255,255,255,0.85)"],
          [1, "rgba(255,255,255,0)"],
        ],
        false
      ),
    []
  );
  const softTex = useMemo(
    () =>
      gradientTexture(
        [
          [0, "rgba(255,255,255,0.9)"],
          [1, "rgba(255,255,255,0)"],
        ],
        true
      ),
    []
  );

  const register = (m: THREE.Material | null) => {
    if (m && !mats.current.includes(m)) mats.current.push(m);
  };

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    // visible only through the hero; gone by the time it has exited
    const vis = Math.max(0, 1 - sceneBus.hero * 1.4);
    g.visible = vis > 0.01;
    if (!g.visible) return;

    for (const m of mats.current) {
      const base = (m.userData.base as number) ?? 0.5;
      (m as THREE.Material & { opacity: number }).opacity =
        base * vis * (0.8 + Math.sin(t * 0.6 + (m.userData.phase as number)) * 0.2);
    }

    // slow rim-light sweep across the metal
    if (sweep.current) {
      sweep.current.position.set(Math.sin(t * 0.45) * 3.4, 1.2 + Math.cos(t * 0.3) * 0.6, 2.2);
      sweep.current.intensity = 9 * vis;
    }

    // gentle fog drift
    g.children.forEach((child) => {
      if (child.userData.drift) child.position.x += (child.userData.drift as number) * delta;
    });
  });

  return (
    <group ref={group}>
      {/* sweeping rim light */}
      <pointLight ref={sweep} color="#00f2ff" intensity={9} distance={14} />

      {/* god-ray shafts (behind the object) */}
      {RAYS.map((r, i) => (
        <mesh key={`ray-${i}`} position={[r.x, 1.2, -2.4]} rotation={[0, 0, r.rot]}>
          <planeGeometry args={[r.w, r.h]} />
          <meshBasicMaterial
            ref={(m) => {
              if (m) {
                m.userData.base = r.base;
                m.userData.phase = i;
                register(m);
              }
            }}
            map={rayTex}
            color={r.color}
            transparent
            opacity={r.base}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        </mesh>
      ))}

      {/* floor light-pool under the object */}
      <mesh position={[0, -1.75, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6, 4]} />
        <meshBasicMaterial
          ref={(m) => {
            if (m) {
              m.userData.base = 0.55;
              m.userData.phase = 1.5;
              register(m);
            }
          }}
          map={softTex}
          color="#7f29ff"
          transparent
          opacity={0.55}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>

      {/* drifting volumetric fog */}
      {FOG.map((f, i) => (
        <mesh key={`fog-${i}`} position={[f.x, f.y, -1.6]} userData={{ drift: f.drift }}>
          <planeGeometry args={[f.s, f.s]} />
          <meshBasicMaterial
            ref={(m) => {
              if (m) {
                m.userData.base = 0.35;
                m.userData.phase = i * 2;
                register(m);
              }
            }}
            map={softTex}
            color={f.color}
            transparent
            opacity={0.35}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}
