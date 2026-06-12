"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { splitWords } from "@/lib/split";
import { prefersReducedMotion } from "@/lib/useReducedMotion";
import { scrollToAnchor } from "@/lib/lenis";
import { PRELOADER_DONE_EVENT } from "@/components/Preloader";
import HeroScene from "@/components/three/HeroScene";
import MagneticButton from "@/components/ui/MagneticButton";

export default function Hero() {
  const section = useRef<HTMLElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const line1 = useRef<HTMLSpanElement>(null);
  const line2 = useRef<HTMLSpanElement>(null);
  const progressRef = useRef(0);

  useEffect(() => {
    const reduced = prefersReducedMotion();
    const ctx = gsap.context(() => {
      // ── intro (waits for the preloader) ──
      const els = {
        w1: line1.current ? splitWords(line1.current) : [],
        w2: line2.current ? splitWords(line2.current) : [],
      };
      // gradient on the keyword
      for (const w of els.w2) {
        if ((w.textContent ?? "").startsWith("PROGRESS")) w.classList.add("text-gradient");
      }

      const fadeItems = section.current?.querySelectorAll("[data-hero-fade]") ?? [];

      if (reduced) {
        gsap.set([...els.w1, ...els.w2, ...fadeItems], { opacity: 1 });
      } else {
        gsap.set([...els.w1, ...els.w2], { yPercent: 115, rotate: 4 });
        gsap.set(fadeItems, { opacity: 0, y: 24 });

        const play = () => {
          gsap
            .timeline()
            .to([...els.w1, ...els.w2], {
              yPercent: 0,
              rotate: 0,
              duration: 1.2,
              ease: "power4.out",
              stagger: 0.08,
            })
            .to(fadeItems, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.12 }, "-=0.6");
        };
        window.addEventListener(PRELOADER_DONE_EVENT, play, { once: true });
        // fallback if the preloader was skipped (e.g. fast refresh)
        const fallback = setTimeout(play, 3500);
        window.addEventListener(PRELOADER_DONE_EVENT, () => clearTimeout(fallback), { once: true });
      }

      // ── pinned scroll exit: dumbbell scales/rotates out, copy drifts up ──
      if (!reduced) {
        ScrollTrigger.create({
          trigger: section.current,
          start: "top top",
          end: "+=65%",
          pin: true,
          scrub: 0.6,
          onUpdate: (self) => {
            progressRef.current = self.progress;
          },
        });
        gsap.to(content.current, {
          opacity: 0,
          y: -90,
          ease: "none",
          scrollTrigger: {
            trigger: section.current,
            start: "top top",
            end: "+=55%",
            scrub: true,
          },
        });
      }
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={section} id="top" className="relative h-screen overflow-hidden">
      {/* radial brand wash behind the object */}
      <div className="purple-wash absolute inset-0 scale-125" />

      <HeroScene progressRef={progressRef} />

      <div
        ref={content}
        className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center"
      >
        <p data-hero-fade className="label mb-6 text-xs text-primary-light">
          Premium Gym · Smart Access · One App
        </p>

        <h1 className="font-display text-[clamp(2.6rem,8vw,7.5rem)] font-extrabold uppercase leading-[1.02] tracking-[0.08em]">
          <span ref={line1} className="block">
            BUILD YOUR BODY.
          </span>
          <span ref={line2} className="block">
            TRACK YOUR PROGRESS.
          </span>
        </h1>

        <p data-hero-fade className="tagline mt-7 max-w-xl">
          a premium gym with smart access, expert trainers, and an app that tracks everything.
        </p>

        <div data-hero-fade className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <MagneticButton>
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                scrollToAnchor("#contact");
              }}
              className="btn-holo label inline-block rounded-full px-9 py-4 text-sm"
            >
              Book a Free Trial
            </a>
          </MagneticButton>
          <a
            href="#trainers"
            onClick={(e) => {
              e.preventDefault();
              scrollToAnchor("#trainers");
            }}
            className="btn-ghost label inline-block rounded-full px-9 py-4 text-sm"
          >
            Explore the Gym
          </a>
        </div>
      </div>

      {/* scroll cue */}
      <div data-hero-fade className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2">
        <div className="h-12 w-px bg-gradient-to-b from-transparent via-primary-neon to-transparent" />
      </div>
    </section>
  );
}
