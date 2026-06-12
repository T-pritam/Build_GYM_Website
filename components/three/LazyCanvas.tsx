"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";

type Props = {
  children: ReactNode;
  className?: string;
  /** Vertical FOV camera distance preset */
  camera?: { position: [number, number, number]; fov?: number };
  /**
   * Radially fades the canvas edges to transparent so the WebGL viewport
   * never reads as a rectangle against the page (postprocessing can make
   * the buffer opaque on some GPUs).
   */
  feather?: boolean;
};

/**
 * Mounts an R3F canvas only once it nears the viewport, and pauses the
 * frameloop entirely (`frameloop="never"`) while it is off-screen, so
 * inactive 3D sections cost zero GPU/CPU.
 */
export default function LazyCanvas({ children, className, camera, feather }: Props) {
  const holder = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = holder.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setMounted(true);
        setActive(entry.isIntersecting);
      },
      { rootMargin: "240px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const featherMask = feather
    ? "radial-gradient(ellipse 62% 62% at 50% 50%, black 52%, transparent 82%)"
    : undefined;

  return (
    <div
      ref={holder}
      className={className}
      aria-hidden="true"
      style={featherMask ? { maskImage: featherMask, WebkitMaskImage: featherMask } : undefined}
    >
      {mounted && (
        <Canvas
          dpr={[1, 2]}
          frameloop={active ? "always" : "never"}
          camera={{ position: camera?.position ?? [0, 0, 6], fov: camera?.fov ?? 42 }}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
          style={{ background: "transparent" }}
        >
          {children}
        </Canvas>
      )}
    </div>
  );
}
