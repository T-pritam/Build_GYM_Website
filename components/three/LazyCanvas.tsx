"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";

type Props = {
  children: ReactNode;
  className?: string;
  /** Vertical FOV camera distance preset */
  camera?: { position: [number, number, number]; fov?: number };
};

/**
 * Mounts an R3F canvas only once it nears the viewport, and pauses the
 * frameloop entirely (`frameloop="never"`) while it is off-screen, so
 * inactive 3D sections cost zero GPU/CPU.
 */
export default function LazyCanvas({ children, className, camera }: Props) {
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

  return (
    <div ref={holder} className={className} aria-hidden="true">
      {mounted && (
        <Canvas
          dpr={[1, 2]}
          frameloop={active ? "always" : "never"}
          camera={{ position: camera?.position ?? [0, 0, 6], fov: camera?.fov ?? 42 }}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          style={{ background: "transparent" }}
        >
          {children}
        </Canvas>
      )}
    </div>
  );
}
