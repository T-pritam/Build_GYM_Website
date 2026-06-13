"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/useReducedMotion";
import SplitHeading from "@/components/ui/SplitHeading";

const img = (id: string) =>
  `https://images.unsplash.com/photo-${id}?q=70&w=640&auto=format&fit=crop`;

const ACTIVITIES = [
  { name: "Weight Training", note: "Open floor, always", big: true, photo: img("1534438327276-14e5300c3a48") },
  { name: "HIIT", note: "3 spots left today", photo: img("1599058917212-d750089bc07e") },
  { name: "Yoga", note: "Sunrise & sunset classes", photo: img("1544367567-0f2fcb009e0b") },
  { name: "Pilates", note: "Reformer studio", photo: img("1518611012118-696072aa579a") },
  { name: "Boxing / Kickboxing", note: "Ring + 12 bags", big: true, photo: img("1549719386-74dfcbf7dbed") },
  { name: "Pickleball", note: "Book a court in-app", photo: img("1554068865-24cecd4e34b8") },
  { name: "Swimming", note: "25m heated lane pool", photo: img("1530549387789-4c1017266635") },
  { name: "Sauna & Spa", note: "Members only", photo: img("1583416750470-965b2707b355") },
  { name: "Group Classes", note: "40+ sessions a week", photo: img("1518310383802-640c2de311b2") },
  { name: "Cardio", note: "Skyline cardio deck", photo: img("1571902943202-507ec2618e8f") },
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

      // gentle image parallax — photos drift up as the section scrolls past,
      // adding depth without moving the cards themselves
      if (!reduced) {
        gsap.fromTo(
          "[data-act-img]",
          { yPercent: -8 },
          {
            yPercent: 8,
            ease: "none",
            scrollTrigger: {
              trigger: section.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
            },
          }
        );
      }
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={section} id="activities" className="relative py-28 lg:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
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
              className={`glass-card group relative min-h-44 overflow-hidden transition-all duration-500 hover:-translate-y-1.5 hover:border-primary-border hover:shadow-[0_0_30px_-10px_var(--color-primary-neon-glow)] ${
                a.big ? "md:col-span-2 lg:col-span-2" : ""
              }`}
            >
              {/* photo layer — parallax drift on scroll (wrapper), dimmed,
                  brightens + zooms on hover (img). Extra vertical bleed so the
                  drift never exposes an edge. */}
              <div data-act-img className="absolute -inset-y-[14%] inset-x-0 will-change-transform">
                {/* eslint-disable-next-line @next/next/no-img-element -- Unsplash CDN already serves optimized variants; avoids proxying remote images through next/image */}
                <img
                  src={a.photo}
                  alt={a.name}
                  loading="lazy"
                  className="h-full w-full object-cover opacity-35 saturate-[0.7] transition-all duration-700 ease-out group-hover:scale-110 group-hover:opacity-60 group-hover:saturate-100"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
              {/* legibility gradient */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(8,6,8,0.92)] via-[rgba(8,6,8,0.35)] to-[rgba(8,6,8,0.15)]" />

              <div className="relative flex h-full min-h-44 flex-col justify-between gap-6 p-6">
                <span className="label text-[10px] text-text-muted">
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
