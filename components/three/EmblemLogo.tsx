"use client";

import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { SVGLoader } from "three-stdlib";

/**
 * Small rotating 3D brand emblem for the nav/footer — the MAISON de BUILD
 * crossed-dumbbell mark extruded from the brand vector (brandmark.svg),
 * with the wordmark + background rect filtered out.
 *
 * Tiny dedicated canvas (~40px). No environment map, just two coloured rim
 * lights + emissive, so it's cheap. Replaces the old flat PNG mark, which
 * blurred at small sizes.
 */

const VB_W = 422.791;
const VB_H = 501.494;

function buildEmblemGeometry(data: { paths: THREE.ShapePath[] }) {
  const shapes: THREE.Shape[] = [];
  for (const path of data.paths) {
    const c = path.color;
    if (c.r + c.g + c.b < 0.25) continue; // background rect
    for (const shape of SVGLoader.createShapes(path)) {
      const pts = shape.getPoints(6);
      let minX = Infinity,
        maxX = -Infinity,
        minY = Infinity,
        maxY = -Infinity;
      for (const p of pts) {
        minX = Math.min(minX, p.x);
        maxX = Math.max(maxX, p.x);
        minY = Math.min(minY, p.y);
        maxY = Math.max(maxY, p.y);
      }
      const coversAll = maxX - minX > VB_W * 0.8 && maxY - minY > VB_H * 0.8;
      const isWordmark = (minY + maxY) / 2 > VB_H * 0.78; // bottom ~22% = text
      if (coversAll || isWordmark) continue;
      shapes.push(shape);
    }
  }

  const geom = new THREE.ExtrudeGeometry(shapes, {
    depth: 55,
    bevelEnabled: true,
    bevelThickness: 6,
    bevelSize: 3,
    bevelSegments: 2,
    curveSegments: 8,
  });
  geom.center();
  geom.scale(1, -1, 1); // SVG y-down → world y-up
  geom.computeVertexNormals();
  const box = new THREE.Box3().setFromBufferAttribute(
    geom.getAttribute("position") as THREE.BufferAttribute
  );
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z) || 1;
  geom.scale(3 / maxDim, 3 / maxDim, 3 / maxDim);
  return geom;
}

function Mark() {
  const ref = useRef<THREE.Group>(null);
  const data = useLoader(SVGLoader, "/brand/brandmark.svg");
  const geometry = useMemo(() => buildEmblemGeometry(data), [data]);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.6;
  });

  return (
    <group ref={ref} rotation={[0.12, 0, 0]}>
      <mesh geometry={geometry}>
        <meshStandardMaterial
          color="#2a1633"
          metalness={0.9}
          roughness={0.25}
          emissive="#7f29ff"
          emissiveIntensity={0.45}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

export default function EmblemLogo({ className }: { className?: string }) {
  return (
    <div className={className} aria-hidden="true">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 5], fov: 32 }}
        gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.45} />
        <directionalLight position={[-3, 2, 4]} intensity={3.2} color="#a78bfa" />
        <directionalLight position={[3, -1, 2]} intensity={2.6} color="#00f2ff" />
        <directionalLight position={[0, 0, 5]} intensity={1.4} color="#ffffff" />
        <Suspense fallback={null}>
          <Mark />
        </Suspense>
      </Canvas>
    </div>
  );
}
