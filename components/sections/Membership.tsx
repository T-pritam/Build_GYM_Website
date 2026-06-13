"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { splitWords } from "@/lib/split";
import { prefersReducedMotion } from "@/lib/useReducedMotion";
import { scrollToAnchor } from "@/lib/lenis";
import MagneticButton from "@/components/ui/MagneticButton";
import { sceneBus } from "@/lib/sceneBus";

type Plan = {
  name: string;
  tagline: string;
  price: string;
  period: string;
  badge?: string;
  featured?: boolean;
  perks: string[];
};

// Placeholder pricing/perks — easy to swap later.
const PLANS: Plan[] = [
  {
    name: "Basic",
    tagline: "start the habit",
    price: "₹1,499",
    period: "/ month",
    perks: [
      "Full gym floor & cardio access",
      "Weekly group classes",
      "App tracking, streaks & leaderboard",
      "Smart gate check-in",
    ],
  },
  {
    name: "Pro",
    tagline: "train without limits",
    price: "₹2,799",
    period: "/ month",
    badge: "Most Popular",
    featured: true,
    perks: [
      "Everything in Basic",
      "All activities & studio classes",
      "Your own personal locker",
      "2 trainer sessions / month",
      "250 Build Coins bonus monthly",
    ],
  },
  {
    name: "Elite",
    tagline: "the full ritual",
    price: "₹4,499",
    period: "/ month",
    badge: "All Access",
    perks: [
      "Everything in Pro",
      "Unlimited personal training",
      "Sauna, spa & steam — members only",
      "Priority slot booking",
      "Guest passes every month",
      "500 Build Coins bonus monthly",
    ],
  },
];

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

      // pricing cards — staggered entrance
      gsap.fromTo(
        "[data-member-card]",
        { opacity: 0, y: 64 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.12,
          scrollTrigger: { trigger: "[data-plans]", start: "top 80%", once: true },
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
        <p className="tagline mt-6">three ways in. one place to build.</p>

        <div
          data-plans
          className="mx-auto mt-16 grid max-w-6xl items-stretch gap-6 text-left lg:grid-cols-3"
        >
          {PLANS.map((plan) => (
            <article
              key={plan.name}
              data-member-card
              className={`glass-card relative flex flex-col p-8 transition-all duration-500 ${
                plan.featured
                  ? "border-primary-border shadow-[0_0_44px_-10px_var(--color-primary-neon-glow)] lg:-translate-y-4 lg:scale-[1.03]"
                  : "hover:-translate-y-1.5 hover:border-primary-border hover:shadow-[0_0_34px_-12px_var(--color-primary-neon-glow)]"
              }`}
            >
              {/* holographic top edge on the featured plan */}
              {plan.featured && (
                <span
                  className="absolute inset-x-0 top-0 h-px"
                  style={{ background: "var(--gradient-holographic)" }}
                  aria-hidden="true"
                />
              )}

              <div className="flex items-center justify-between gap-3">
                <h3 className="font-display text-2xl font-bold uppercase tracking-[0.045em]">
                  {plan.name}
                </h3>
                {plan.badge && (
                  <span
                    className={`label rounded-full px-3 py-1.5 text-[10px] ${
                      plan.featured
                        ? "btn-holo"
                        : "border border-primary-border bg-primary-soft text-primary-light"
                    }`}
                  >
                    {plan.badge}
                  </span>
                )}
              </div>
              <p className="tagline mt-1 !text-lg">{plan.tagline}</p>

              <div className="mt-6 flex items-baseline gap-1.5">
                <span
                  className={`font-display text-4xl font-extrabold ${
                    plan.featured ? "text-gradient" : ""
                  }`}
                >
                  {plan.price}
                </span>
                <span className="label text-[11px] text-text-muted">{plan.period}</span>
              </div>

              <div className="divider-sheen my-6" />

              <ul className="flex-1 space-y-3 text-base text-text-secondary">
                {plan.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-3">
                    <span className="text-gradient mt-0.5 font-bold">✦</span>
                    {perk}
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
                  className={`label block w-full rounded-full px-9 py-4 text-center text-sm ${
                    plan.featured ? "btn-holo" : "btn-ghost"
                  }`}
                >
                  {plan.featured ? "Start with Pro" : `Choose ${plan.name}`}
                </a>
              </MagneticButton>
            </article>
          ))}
        </div>

        <p className="mt-10 text-base text-text-muted">
          Every plan starts with a free trial. No joining fee · cancel anytime.
        </p>
      </div>
    </section>
  );
}
