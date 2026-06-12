"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/useReducedMotion";
import SplitHeading from "@/components/ui/SplitHeading";

const ACTIVITIES = [
  { name: "Weight Training", note: "Open floor, always", big: true },
  { name: "HIIT", note: "3 spots left today" },
  { name: "Yoga", note: "Sunrise & sunset classes" },
  { name: "Pilates", note: "Reformer studio" },
  { name: "Boxing / Kickboxing", note: "Ring + 12 bags", big: true },
  { name: "Pickleball", note: "Book a court in-app" },
  { name: "Swimming", note: "25m heated lane pool" },
  { name: "Sauna & Spa", note: "Members only" },
  { name: "Group Classes", note: "40+ sessions a week" },
  { name: "Cardio", note: "Skyline cardio deck" },
];

export default function Activities() {
  const section = useRef<HTMLElement>(null);

  useEffect(() => {
    const reduced = prefersReducedMotion();
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>("[data-activity]");
      gsap.fromTo(
        cards,
        reduced ? { opacity: 0 } : { clipPath: "inset(100% 0 0 0)", y: 32 },
        {
          opacity: 1,
          clipPath: "inset(0% 0 0 0)",
          y: 0,
          duration: 1,
          ease: "power4.out",
          stagger: 0.08,
          scrollTrigger: { trigger: section.current, start: "top 70%", once: true },
        }
      );
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={section} id="activities" className="relative py-28 lg:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <p className="label mb-4 text-xs text-primary-light">04 — Activities</p>
        <SplitHeading
          as="h2"
          className="font-display max-w-4xl text-[clamp(2rem,5vw,4rem)] font-bold uppercase leading-[1.05] tracking-[0.05em]"
          gradientWord="EVERY"
        >
          ONE MEMBERSHIP. EVERY ACTIVITY.
        </SplitHeading>
        <p className="tagline mt-4">
          book a slot in the app — live capacity, zero queueing.
        </p>

        <div className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {ACTIVITIES.map((a) => (
            <article
              key={a.name}
              data-activity
              className={`glass-card group relative overflow-hidden p-6 transition-transform duration-500 hover:scale-[1.03] ${
                a.big ? "md:col-span-2 lg:col-span-2" : ""
              }`}
            >
              <div className="purple-wash absolute -right-1/4 -top-1/4 h-full w-full opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="relative flex h-full min-h-32 flex-col justify-between gap-6">
                <span className="label text-[10px] text-text-dim">
                  {a.note.includes("spots") ? (
                    <span className="text-cyan-neon">{a.note}</span>
                  ) : (
                    a.note
                  )}
                </span>
                <h3 className="font-display text-lg font-bold uppercase tracking-[0.045em] sm:text-xl">
                  <span className="underline-sweep pb-1">{a.name}</span>
                </h3>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
