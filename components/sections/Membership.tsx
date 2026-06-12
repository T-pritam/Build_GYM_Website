"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { splitWords } from "@/lib/split";
import { prefersReducedMotion } from "@/lib/useReducedMotion";
import { scrollToAnchor } from "@/lib/lenis";
import MagneticButton from "@/components/ui/MagneticButton";
import { sceneBus } from "@/lib/sceneBus";

export default function Membership() {
  const section = useRef<HTMLElement>(null);
  const headline = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const reduced = prefersReducedMotion();
    const ctx = gsap.context(() => {
      // feeds the SceneRail plates accent (visible while this section is on screen)
      ScrollTrigger.create({
        trigger: section.current,
        start: "top 75%",
        end: "bottom 35%",
        onUpdate: (self) => {
          sceneBus.membership = self.progress;
        },
      });

      const el = headline.current;
      if (!el) return;

      if (reduced) {
        gsap.fromTo(el, { opacity: 0 }, {
          opacity: 1,
          duration: 0.7,
          scrollTrigger: { trigger: el, start: "top 85%" },
        });
        return;
      }

      // oversized per-word reveal
      const words = splitWords(el);
      for (const w of words) {
        if ((w.textContent ?? "").startsWith("BUILDING")) w.classList.add("text-gradient");
      }
      gsap.fromTo(
        words,
        { yPercent: 120, rotate: 5 },
        {
          yPercent: 0,
          rotate: 0,
          duration: 1.2,
          ease: "power4.out",
          stagger: 0.09,
          scrollTrigger: { trigger: el, start: "top 80%", once: true },
        }
      );

      // slight skew with scroll velocity
      const skewTo = gsap.quickTo(el, "skewY", { duration: 0.5, ease: "power3.out" });
      ScrollTrigger.create({
        trigger: section.current,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          skewTo(gsap.utils.clamp(-4, 4, self.getVelocity() / -350));
        },
      });

      // card entrance
      gsap.fromTo(
        "[data-member-card]",
        { opacity: 0, y: 64 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: { trigger: "[data-member-card]", start: "top 82%", once: true },
        }
      );
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={section} className="relative overflow-hidden py-32 lg:py-44">
      {/* the SceneRail plates accent floats top-right while this section is in view */}
      <div className="purple-wash absolute bottom-0 left-1/2 h-[60vh] w-screen -translate-x-1/2" />

      <div className="relative mx-auto max-w-7xl px-6 text-center lg:px-10">
        <h2
          ref={headline}
          className="font-display mx-auto max-w-5xl text-[clamp(2.6rem,8vw,7rem)] font-extrabold uppercase leading-[1.04] tracking-[0.08em]"
        >
          STOP PLANNING. START BUILDING.
        </h2>
        <p className="tagline mt-6">one membership. everything inside.</p>

        <div
          data-member-card
          className="glass-card mx-auto mt-16 max-w-lg p-8 text-left sm:p-10"
        >
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="font-display text-2xl font-bold uppercase tracking-[0.045em]">
              Elite Membership
            </h3>
            <span className="label rounded-full bg-primary-soft px-3 py-1.5 text-[10px] text-primary-light">
              All access
            </span>
          </div>
          <div className="divider-sheen my-6" />
          <ul className="space-y-3 text-sm text-text-secondary">
            {[
              "Every activity, every class, every facility",
              "Smart gate access + your own locker",
              "Full app: tracking, streaks, leaderboard",
              "500 Build Coins bonus on joining",
              "Free trial session with any trainer",
            ].map((line) => (
              <li key={line} className="flex items-start gap-3">
                <span className="text-gradient mt-0.5 font-bold">✦</span>
                {line}
              </li>
            ))}
          </ul>
          <MagneticButton className="mt-8 w-full">
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                scrollToAnchor("#contact");
              }}
              className="btn-holo label block w-full rounded-full px-9 py-4 text-center text-sm"
            >
              Book Your Free Trial
            </a>
          </MagneticButton>
        </div>
      </div>
    </section>
  );
}
