"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/useReducedMotion";
import SplitHeading from "@/components/ui/SplitHeading";
import PremiumScene from "@/components/three/PremiumScene";

const BLOCKS = [
  {
    n: "01",
    title: "Smart Gate Access",
    body: "Open the gym gate with one tap. Every check-in is logged automatically and feeds your streak.",
  },
  {
    n: "02",
    title: "Your Own Locker",
    body: "An assigned personal locker, unlocked from the app. Your gear stays where you left it.",
  },
  {
    n: "03",
    title: "Premium Facilities",
    body: "Sauna, spa, steam and showers — members only, included with every membership.",
  },
];

/**
 * Cinematic pinned section: the canvas column is sticky while the three
 * feature blocks scroll past; section scroll progress drives the 3D
 * object to a new angle per block.
 */
export default function Premium() {
  const section = useRef<HTMLElement>(null);
  const progressRef = useRef(0);

  useEffect(() => {
    const reduced = prefersReducedMotion();
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section.current,
        start: "top center",
        end: "bottom center",
        onUpdate: (self) => {
          progressRef.current = self.progress;
        },
      });

      gsap.utils.toArray<HTMLElement>("[data-block]").forEach((el) => {
        gsap.fromTo(
          el,
          reduced ? { opacity: 0 } : { opacity: 0, y: 64 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 78%", once: true },
          }
        );
      });
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={section} id="premium" className="relative">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* sticky 3D column */}
          <div className="relative h-[42vh] lg:h-auto">
            <div className="purple-wash lg:sticky lg:top-0 lg:flex lg:h-screen lg:items-center">
              <div className="relative h-[42vh] w-full lg:h-[70vh]">
                <PremiumScene progressRef={progressRef} />
              </div>
            </div>
          </div>

          {/* scrolling feature blocks */}
          <div className="flex flex-col justify-center gap-[12vh] py-24 lg:gap-[55vh] lg:py-[40vh]">
            <div>
              <p className="label mb-4 text-xs text-primary-light">05 — Premium Experience</p>
              <SplitHeading
                as="h2"
                className="font-display text-[clamp(2rem,4.5vw,3.6rem)] font-bold uppercase leading-[1.05] tracking-[0.05em]"
                gradientWord="ACCESS"
              >
                PREMIUM ACCESS
              </SplitHeading>
              <p className="tagline mt-4">where strength meets ritual.</p>
            </div>

            {BLOCKS.map((b) => (
              <article key={b.n} data-block className="max-w-md">
                <span className="font-display text-gradient text-5xl font-extrabold">{b.n}</span>
                <h3 className="font-display mt-4 text-2xl font-bold uppercase tracking-[0.045em] sm:text-3xl">
                  {b.title}
                </h3>
                <div className="divider-sheen my-5 w-32" />
                <p className="text-text-secondary">{b.body}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
