"use client";

import { useEffect, useRef } from "react";

/** 2px holographic progress bar pinned above the nav. */
export default function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      if (bar.current) bar.current.style.transform = `scaleX(${p})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5" aria-hidden="true">
      <div
        ref={bar}
        className="h-full w-full origin-left scale-x-0 bg-gradient-to-r from-primary-bright via-accent-cyan to-primary-neon shadow-[0_0_8px_var(--color-primary-neon-glow)]"
      />
    </div>
  );
}
