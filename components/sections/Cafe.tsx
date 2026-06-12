"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/useReducedMotion";
import SplitHeading from "@/components/ui/SplitHeading";
import Counter from "@/components/ui/Counter";

const MENU = [
  { name: "Protein Shake", coins: 120, macros: "32g protein · 240 kcal", icon: "🥤" },
  { name: "Fresh Juice", coins: 90, macros: "Cold-pressed · 110 kcal", icon: "🍊" },
  { name: "Pre-Workout Snack", coins: 75, macros: "28g carbs · 9g protein", icon: "🍫" },
  { name: "Supplements", coins: 150, macros: "Creatine · BCAA · Omega-3", icon: "💊" },
];

export default function Cafe() {
  const section = useRef<HTMLElement>(null);

  useEffect(() => {
    const reduced = prefersReducedMotion();
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-menu-card]",
        reduced ? { opacity: 0 } : { opacity: 0, y: 56, rotate: 1.5 },
        {
          opacity: 1,
          y: 0,
          rotate: 0,
          duration: 0.95,
          ease: "power3.out",
          stagger: 0.1,
          scrollTrigger: { trigger: section.current, start: "top 65%", once: true },
        }
      );
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={section} id="cafe" className="relative py-28 lg:py-36">
      <div className="purple-wash absolute left-1/2 top-0 h-[50vh] w-[80vw] -translate-x-1/2" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div>
            <p className="label mb-4 text-xs text-primary-light">06 — In-App Café</p>
            <SplitHeading
              as="h2"
              className="font-display max-w-3xl text-[clamp(2rem,5vw,4rem)] font-bold uppercase leading-[1.05] tracking-[0.05em]"
              gradientWord="FUEL"
            >
              FUEL YOUR WORKOUT
            </SplitHeading>
            <p className="tagline mt-4">order ahead, lift, collect — paid in Build Coins.</p>
          </div>

          {/* animated coin balance */}
          <div className="glass-card flex items-center gap-4 px-6 py-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary-bright to-accent-cyan font-display text-lg font-extrabold text-white shadow-[0_0_22px_-4px_var(--color-primary-neon-glow)]">
              B
            </span>
            <div>
              <p className="label text-[10px] text-text-muted">Your balance</p>
              <p className="font-display text-2xl font-extrabold">
                <Counter to={2690} className="text-gradient" /> <span className="text-xs uppercase text-text-muted">coins</span>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MENU.map((m) => (
            <article
              key={m.name}
              data-menu-card
              className="glass-card group p-6 transition-all duration-500 hover:-translate-y-2 hover:border-primary-border hover:shadow-[0_0_34px_-10px_var(--color-primary-neon-glow)]"
            >
              <span className="text-4xl" role="img" aria-label={m.name}>
                {m.icon}
              </span>
              <h3 className="font-display mt-5 text-xl font-bold uppercase tracking-[0.045em]">
                {m.name}
              </h3>
              <p className="mt-1.5 text-sm text-text-muted">{m.macros}</p>
              <div className="divider-sheen my-5" />
              <p className="font-display text-2xl font-extrabold">
                <span className="text-gradient">{m.coins}</span>{" "}
                <span className="text-[11px] uppercase tracking-widest text-text-muted">coins</span>
              </p>
            </article>
          ))}
        </div>

        <p className="mt-10 max-w-2xl text-sm text-text-secondary">
          Order ahead in the app, pick a pickup slot, get notified when it&apos;s ready, and collect
          with a one-time OTP. Build Coins also pay for activities and trainer sessions.
        </p>
      </div>
    </section>
  );
}
