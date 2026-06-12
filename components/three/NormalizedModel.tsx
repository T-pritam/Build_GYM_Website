"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";

type Props = {
  url: string;
  /** Longest bounding-box edge is scaled to this world size. */
  targetSize?: number;
  rotation?: [number, number, number];
};

/**
 * Loads any GLB (Draco/meshopt supported by drei out of the box) and
 * auto-normalizes it: re-centered on its bounding-box center and scaled
 * so its longest edge equals `targetSize`. Any reasonably exported model
 * drops in cleanly regardless of authored units or origin.
 *
 * Baked materials are nudged toward the brand look: slightly darker,
 * more metallic, with strong env response so the purple/cyan rim lights
 * read on the surface.
 */
export default function NormalizedModel({ url, targetSize = 2.4, rotation = [0, 0, 0] }: Props) {
  const { scene } = useGLTF(url);

  const { object, offset, scale } = useMemo(() => {
    const clone = scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;

    clone.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.castShadow = true;
        const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
        for (const mat of materials) {
          if (mat instanceof THREE.MeshStandardMaterial) {
            mat.envMapIntensity = 1.4;
            mat.metalness = Math.max(mat.metalness, 0.55);
            mat.roughness = Math.min(mat.roughness, 0.6);
            // Pull overly bright baked albedo toward the noir palette
            const hsl = { h: 0, s: 0, l: 0 };
            mat.color.getHSL(hsl);
            if (hsl.l > 0.55) mat.color.setHSL(hsl.h, hsl.s, 0.45);
          }
        }
      }
    });

    return {
      object: clone,
      offset: center.multiplyScalar(-1),
      scale: targetSize / maxDim,
    };
  }, [scene, targetSize]);

  return (
    <group rotation={rotation} scale={scale}>
      <primitive object={object} position={offset.toArray()} />
    </group>
  );
}

useGLTF.setDecoderPath?.("https://www.gstatic.com/draco/versioned/decoders/1.5.7/");
