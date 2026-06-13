"use client";

import { useEffect, useId, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/useReducedMotion";

/**
 * A holographic divider line that draws itself (left→right) when it
 * scrolls into view. SVG stroke-dashoffset tween — no layout cost.
 * Drop-in replacement for a static `.divider-sheen` rule.
 */
export default function DrawLine({
  className,
  width = 128,
}: {
  className?: string;
  width?: number;
}) {
  const ref = useRef<SVGLineElement>(null);
  const gid = useId().replace(/:/g, "");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      gsap.set(el, { strokeDasharray: "none" });
      return;
    }
    gsap.set(el, { strokeDasharray: width, strokeDashoffset: width });
    const tween = gsap.to(el, {
      strokeDashoffset: 0,
      duration: 1.1,
      ease: "power2.out",
      scrollTrigger: { trigger: el, start: "top 90%", once: true },
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [width]);

  return (
    <svg
      className={className}
      width={width}
      height="2"
      viewBox={`0 0 ${width} 2`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`dl-${gid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#7f2982" />
          <stop offset="50%" stopColor="#00f2ff" />
          <stop offset="100%" stopColor="#7f29ff" />
        </linearGradient>
      </defs>
      <line
        ref={ref}
        x1="0"
        y1="1"
        x2={width}
        y2="1"
        stroke={`url(#dl-${gid})`}
        strokeWidth="2"
      />
    </svg>
  );
}
