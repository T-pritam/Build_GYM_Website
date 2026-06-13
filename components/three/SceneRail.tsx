"use client";

import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { easing } from "maath";
import ModelBoundary from "./ModelBoundary";
import NormalizedModel from "./NormalizedModel";
import HeroAtmosphere from "./HeroAtmosphere";
import {
  ProceduralDumbbell,
  ProceduralKettlebell,
  ProceduralPlateStack,
} from "./Procedural";
import { MODELS } from "@/lib/assets";
import { sceneBus } from "@/lib/sceneBus";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * SceneRail — ONE fixed, full-viewport canvas for the whole site.
 *
 * Instead of a WebGL context per section (hero + premium + accent +
 * particles = 4 contexts, 3 environment maps, 2 bloom passes), a single
 * context hosts the ambient dust and one "traveler" object that hands
 * off between sections as you scroll:
 *
 *   hero (dumbbell, center) → docks bottom-right while you browse →
 *   premium (swaps to kettlebell beside the feature blocks) →
 *   membership (swaps to the plates accent, top-right) → fades out.
 *
 * Choreography is screen-space keyframes driven by sceneBus progress
 * values; positions are damped, so segment changes become smooth flights.
 * No postprocessing, no shadows — lighting does the glow work.
 */

type ModelKey = "dumbbell" | "kettlebell" | "plates";

/* ── ambient dust (merged from the old particles canvas) ── */

const PURPLE = new THREE.Color("#a78bfa");
const CYAN = new THREE.Color("#00f2ff");

function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function Dust() {
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

/* ── the traveler ── */

type Pose = {
  x: number;
  y: number;
  s: number;
  model: ModelKey;
  /** continuous idle spin speed (rad/s); accumulated, never damped */
  idleSpeed: number;
  /** bounded scroll-mapped yaw offset; damped */
  scrollRotY: number;
  rotX: number;
};

function Traveler() {
  const root = useRef<THREE.Group>(null);
  const dumbbellRef = useRef<THREE.Group>(null);
  const kettlebellRef = useRef<THREE.Group>(null);
  const platesRef = useRef<THREE.Group>(null);
  // yaw is split so it can never "unwind": idleSpin accumulates monotonically
  // (never a damp target), scrollRot is a small bounded, damped offset.
  const idleSpin = useRef(0);
  const scrollRot = useRef(0);
  const { viewport, size } = useThree();

  useFrame((state, delta) => {
    const g = root.current;
    if (!g) return;

    const t = state.clock.elapsedTime;
    const vw = viewport.width;
    const vh = viewport.height;
    const desktop = size.width >= 1024;
    const b = sceneBus;

    const dock = (model: ModelKey): Pose => ({
      x: vw * (desktop ? 0.4 : 0.33),
      y: -vh * 0.37 + Math.sin(t * 0.9) * 0.06,
      s: desktop ? 0.22 : 0.17,
      model,
      idleSpeed: 0.45,
      scrollRotY: 0,
      rotX: 0.25,
    });

    let pose: Pose;
    if (b.hero < 1) {
      // hero: centered, slow spin + mouse tilt; flies toward the dock on exit
      const p = b.hero;
      pose = {
        x: vw * 0.4 * p,
        y: Math.sin(t * 0.7) * 0.1 - vh * 0.37 * p,
        s: 1 - 0.78 * p,
        model: "dumbbell",
        idleSpeed: 0.28,
        scrollRotY: p * Math.PI * 1.6,
        rotX: 0.12 + state.pointer.y * -0.18 * (1 - p),
      };
    } else if (b.premium <= 0) {
      pose = dock("dumbbell");
    } else if (b.premium < 1) {
      // premium: beside the feature blocks, scroll turns it through ~1 rev
      const p = b.premium;
      pose = {
        x: desktop ? -vw * 0.25 : vw * 0.2,
        y: desktop ? Math.sin(t * 0.6) * 0.07 : vh * 0.27,
        s: desktop ? 0.85 : 0.5,
        model: "kettlebell",
        idleSpeed: 0, // purely scroll-driven turning
        scrollRotY: 0.4 + p * Math.PI * 2.2,
        rotX: 0.08 + Math.sin(p * Math.PI * 3) * 0.22,
      };
    } else if (b.membership <= 0) {
      pose = dock("plates");
    } else if (b.membership < 1) {
      // membership: decorative accent top-right, fades away at the end
      const p = b.membership;
      const fade = p > 0.8 ? 1 - (p - 0.8) / 0.2 : 1;
      pose = {
        x: vw * (desktop ? 0.31 : 0.26),
        y: vh * 0.24,
        s: (desktop ? 0.52 : 0.34) * fade,
        model: "plates",
        idleSpeed: 0.3,
        scrollRotY: 0,
        rotX: 0.2,
      };
    } else {
      pose = { ...dock("plates"), s: 0 };
    }

    // Mobile: the traveler is the hero piece only. A narrow screen has no
    // side-column room, so once the hero is passed we retire the object
    // (ambient dust stays) — guarantees text legibility and lightens phone
    // GPU. Desktop keeps the full cross-section handoff untouched.
    if (!desktop && b.hero >= 1) {
      pose.s = 0;
    }

    easing.damp3(g.position, [pose.x, pose.y, 0], 0.5, delta);
    easing.damp3(g.scale, [Math.max(pose.s, 0.001), Math.max(pose.s, 0.001), Math.max(pose.s, 0.001)], 0.45, delta);

    // yaw: accumulate idle spin (bounded delta so a backgrounded tab can't
    // jump it), add a damped, bounded scroll offset — no unwinding ever.
    idleSpin.current += Math.min(delta, 0.05) * pose.idleSpeed;
    easing.damp(scrollRot, "current", pose.scrollRotY, 0.35, delta);
    g.rotation.y = idleSpin.current + scrollRot.current;

    easing.damp(g.rotation, "x", pose.rotX, 0.35, delta);
    easing.damp(g.rotation, "z", b.hero < 1 ? state.pointer.x * 0.14 * (1 - b.hero) : 0, 0.4, delta);

    // crossfade between models on handoff
    const subs: [ModelKey, THREE.Group | null][] = [
      ["dumbbell", dumbbellRef.current],
      ["kettlebell", kettlebellRef.current],
      ["plates", platesRef.current],
    ];
    for (const [key, sub] of subs) {
      if (!sub) continue;
      const target = key === pose.model ? 1 : 0;
      easing.damp3(sub.scale, [Math.max(target, 0.001), Math.max(target, 0.001), Math.max(target, 0.001)], 0.3, delta);
      sub.visible = sub.scale.x > 0.02;
    }
  });

  return (
    <group ref={root} scale={0.001}>
      <group ref={dumbbellRef}>
        <ModelBoundary fallback={<ProceduralDumbbell />}>
          <NormalizedModel url={MODELS.hero} targetSize={2.7} rotation={[0, 0, -0.3]} />
        </ModelBoundary>
      </group>
      <group ref={kettlebellRef} visible={false}>
        <ModelBoundary fallback={<ProceduralKettlebell />}>
          <NormalizedModel url={MODELS.premium} targetSize={2.5} />
        </ModelBoundary>
      </group>
      <group ref={platesRef} visible={false}>
        <ModelBoundary fallback={<ProceduralPlateStack />}>
          <NormalizedModel url={MODELS.accent} targetSize={2.6} />
        </ModelBoundary>
      </group>
    </group>
  );
}

export default function SceneRail() {
  const reduced = useReducedMotion();
  if (reduced) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 5.2], fov: 42 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <Environment preset="city" />
        </Suspense>
        <ambientLight intensity={0.15} />
        {/* purple key rim + cyan fill rim — the glow work, no postprocessing */}
        <directionalLight position={[-4, 2.5, -2]} intensity={14} color="#7f29ff" />
        <directionalLight position={[4, -1, -3]} intensity={9} color="#00f2ff" />
        <directionalLight position={[0, 3, 5]} intensity={1.1} color="#e8e0e4" />
        <Dust />
        <HeroAtmosphere />
        <Traveler />
      </Canvas>
    </div>
  );
}
