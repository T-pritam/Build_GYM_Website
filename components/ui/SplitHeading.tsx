"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { splitWords } from "@/lib/split";
import { prefersReducedMotion } from "@/lib/useReducedMotion";

type Props = {
  children: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  className?: string;
  /** Render this word with the violet→cyan gradient. */
  gradientWord?: string;
  delay?: number;
  /** Animate immediately instead of on scroll-enter (hero use). */
  immediate?: boolean;
};

/** Headline with staggered word-rise reveal (own splitter, no paid SplitText). */
export default function SplitHeading({
  children,
  as = "h2",
  className,
  gradientWord,
  delay = 0,
  immediate = false,
}: Props) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      gsap.fromTo(
        el,
        { opacity: 0 },
        { opacity: 1, duration: 0.6, scrollTrigger: immediate ? undefined : { trigger: el, start: "top 88%" } }
      );
      return;
    }

    const words = splitWords(el);
    if (gradientWord) {
      const target = gradientWord.toUpperCase().replace(/[^A-Z0-9]/g, "");
      for (const w of words) {
        const clean = (w.textContent ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
        if (clean === target) w.classList.add("text-gradient");
      }
    }

    const tween = gsap.fromTo(
      words,
      { yPercent: 115, rotate: 4 },
      {
        yPercent: 0,
        rotate: 0,
        duration: 1.1,
        ease: "power4.out",
        stagger: 0.07,
        delay,
        scrollTrigger: immediate
          ? undefined
          : { trigger: el, start: "top 88%", once: true },
      }
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [children, gradientWord, delay, immediate]);

  const Tag = as as "h2";
  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}

export { ScrollTrigger };
