"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/useReducedMotion";

export const PRELOADER_DONE_EVENT = "build:preloader-done";

/**
 * "BUILD" wordmark + counting percentage; gradient sheen sweeps the text;
 * exits with a clip-path reveal into the hero, then fires
 * PRELOADER_DONE_EVENT so the hero can start its intro.
 */
export default function Preloader() {
  const overlay = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const el = overlay.current;
    if (!el) return;

    document.documentElement.style.overflow = "hidden";
    const finish = () => {
      document.documentElement.style.overflow = "";
      window.dispatchEvent(new CustomEvent(PRELOADER_DONE_EVENT));
      setGone(true);
    };

    if (prefersReducedMotion()) {
      const t = setTimeout(finish, 400);
      return () => clearTimeout(t);
    }

    const state = { n: 0 };
    const tl = gsap.timeline({ onComplete: finish });
    tl.to(state, {
      n: 100,
      duration: 1.7,
      ease: "power2.inOut",
      onUpdate: () => {
        if (counter.current) counter.current.textContent = String(Math.round(state.n)).padStart(3, "0");
      },
    })
      .to(el, {
        clipPath: "inset(0 0 100% 0)",
        duration: 1,
        ease: "power4.inOut",
        delay: 0.15,
      });

    return () => {
      tl.kill();
      document.documentElement.style.overflow = "";
    };
  }, []);

  if (gone) return null;

  return (
    <div
      ref={overlay}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
      style={{ clipPath: "inset(0 0 0% 0)" }}
      aria-hidden="true"
    >
      <span
        className="font-display text-[clamp(4rem,14vw,11rem)] font-extrabold uppercase tracking-[0.08em] leading-none preloader-sheen"
      >
        BUILD
      </span>
      <div className="mt-6 flex items-center gap-4">
        <span className="divider-sheen w-24" />
        <span ref={counter} className="label text-sm text-text-muted tabular-nums">
          000
        </span>
        <span className="divider-sheen w-24" />
      </div>

      <style jsx>{`
        .preloader-sheen {
          background: linear-gradient(
            100deg,
            #50434e 0%,
            #50434e 35%,
            #a78bfa 47%,
            #00f2ff 53%,
            #50434e 65%,
            #50434e 100%
          );
          background-size: 280% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: sheen 1.9s ease-in-out infinite;
        }
        @keyframes sheen {
          0% {
            background-position: 120% 0;
          }
          100% {
            background-position: -120% 0;
          }
        }
      `}</style>
    </div>
  );
}
