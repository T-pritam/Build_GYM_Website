"use client";

import { Suspense } from "react";
import { ContactShadows, Environment } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";

/**
 * Shared lighting rig: studio environment, purple key rim + cyan fill rim
 * (the two brand accent hues), soft contact shadows, and a cheap selective
 * bloom (high luminance threshold → only the neon highlights glow).
 */
export default function Stage({
  children,
  shadowY = -1.6,
  bloom = true,
}: {
  children: React.ReactNode;
  shadowY?: number;
  bloom?: boolean;
}) {
  return (
    <>
      <Suspense fallback={null}>
        <Environment preset="city" />
      </Suspense>

      <ambientLight intensity={0.15} />
      {/* purple key rim */}
      <directionalLight position={[-4, 2.5, -2]} intensity={14} color="#7f29ff" />
      {/* cyan fill rim */}
      <directionalLight position={[4, -1, -3]} intensity={9} color="#00f2ff" />
      {/* soft front fill */}
      <directionalLight position={[0, 3, 5]} intensity={1.1} color="#e8e0e4" />

      {children}

      <ContactShadows
        position={[0, shadowY, 0]}
        opacity={0.55}
        scale={9}
        blur={2.6}
        far={3}
        color="#000000"
        frames={1}
      />

      {bloom && (
        <EffectComposer multisampling={0}>
          <Bloom
            mipmapBlur
            intensity={0.55}
            luminanceThreshold={0.85}
            luminanceSmoothing={0.25}
          />
        </EffectComposer>
      )}
    </>
  );
}
