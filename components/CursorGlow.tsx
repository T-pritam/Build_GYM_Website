"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/useReducedMotion";

/**
 * Holographic cursor: a soft purple/cyan glow that trails the pointer
 * (lerped) plus a crisp dot that expands over interactive elements.
 * Pure CSS transforms on two fixed divs — no WebGL, no layout work.
 * Skipped on touch devices and under reduced motion.
 */
export default function CursorGlow() {
  const glow = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion() || window.matchMedia("(pointer: coarse)").matches) return;

    let tx = -400;
    let ty = -400;
    let gx = -400;
    let gy = -400;
    let hot = false;
    let visible = false;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!visible) {
        visible = true;
        if (glow.current) glow.current.style.opacity = "1";
        if (dot.current) dot.current.style.opacity = "1";
      }
      hot = !!(e.target as HTMLElement).closest?.("a, button, [role='button'], input, textarea, label");
    };
    const onLeave = () => {
      visible = false;
      if (glow.current) glow.current.style.opacity = "0";
      if (dot.current) dot.current.style.opacity = "0";
    };

    const tick = () => {
      raf = requestAnimationFrame(tick);
      gx += (tx - gx) * 0.09;
      gy += (ty - gy) * 0.09;
      if (glow.current) {
        glow.current.style.transform = `translate3d(${gx}px, ${gy}px, 0) translate(-50%, -50%) scale(${hot ? 1.35 : 1})`;
      }
      if (dot.current) {
        dot.current.style.transform = `translate3d(${tx}px, ${ty}px, 0) translate(-50%, -50%) scale(${hot ? 2.4 : 1})`;
      }
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div
        ref={glow}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[45] h-[360px] w-[360px] rounded-full opacity-0 mix-blend-screen transition-opacity duration-500 will-change-transform"
        style={{
          background:
            "radial-gradient(circle, rgba(127,41,255,0.14) 0%, rgba(0,242,255,0.05) 38%, transparent 68%)",
        }}
      />
      <div
        ref={dot}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[46] h-2 w-2 rounded-full opacity-0 transition-opacity duration-500 will-change-transform"
        style={{
          background: "linear-gradient(120deg, #7f29ff, #00f2ff)",
          boxShadow: "0 0 12px rgba(127,41,255,0.8)",
          transitionProperty: "opacity, scale",
        }}
      />
    </>
  );
}
