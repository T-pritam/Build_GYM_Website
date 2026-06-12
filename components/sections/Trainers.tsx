"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import SplitHeading from "@/components/ui/SplitHeading";
import MagneticButton from "@/components/ui/MagneticButton";
import { scrollToAnchor } from "@/lib/lenis";

type Trainer = {
  name: string;
  initials: string;
  years: number;
  certs: string;
  chips: string[];
  hue: string;
  photo: string;
};

const img = (id: string) =>
  `https://images.unsplash.com/photo-${id}?q=75&w=480&h=560&auto=format&fit=crop`;

const TRAINERS: Trainer[] = [
  {
    name: "Marcus Vale",
    initials: "MV",
    years: 12,
    certs: "NASM-CPT · CSCS",
    chips: ["Strength & Conditioning", "HIIT"],
    hue: "from-[rgba(127,41,130,0.45)]",
    photo: img("1567013127542-490d757e51fc"),
  },
  {
    name: "Priya Shankar",
    initials: "PS",
    years: 9,
    certs: "ACE · RYT-500",
    chips: ["Yoga", "Rehabilitation"],
    hue: "from-[rgba(124,58,237,0.4)]",
    photo: img("1594381898411-846e7d193883"),
  },
  {
    name: "Dante Cole",
    initials: "DC",
    years: 11,
    certs: "ISSA · USA Boxing L2",
    chips: ["Boxing", "Strength & Conditioning"],
    hue: "from-[rgba(6,182,212,0.35)]",
    photo: img("1611672585731-fa10603fb9e0"),
  },
  {
    name: "Lena Okafor",
    initials: "LO",
    years: 7,
    certs: "NASM-CPT · PN1",
    chips: ["Weight Loss", "HIIT"],
    hue: "from-[rgba(167,139,250,0.4)]",
    photo: img("1548690312-e3b507d8c110"),
  },
  {
    name: "Rafael Mendes",
    initials: "RM",
    years: 14,
    certs: "ACE · NASM-CES",
    chips: ["Rehabilitation", "Strength & Conditioning"],
    hue: "from-[rgba(127,41,255,0.4)]",
    photo: img("1597347316205-36f6c451902a"),
  },
  {
    name: "Sofia Reyes",
    initials: "SR",
    years: 8,
    certs: "ACE · PMA-CPT",
    chips: ["Pilates", "Yoga"],
    hue: "from-[rgba(127,41,130,0.4)]",
    photo: img("1571731956672-f2b94d7dd0cb"),
  },
  {
    name: "Jonas Weber",
    initials: "JW",
    years: 10,
    certs: "ISSA · CSCS",
    chips: ["Strength & Conditioning", "Boxing"],
    hue: "from-[rgba(6,182,212,0.3)]",
    photo: img("1581009146145-b5ef050c2e1e"),
  },
  {
    name: "Aisha Khan",
    initials: "AK",
    years: 6,
    certs: "ACE · AFAA",
    chips: ["Weight Loss", "HIIT"],
    hue: "from-[rgba(167,139,250,0.35)]",
    photo: img("1574680096145-d05b474e2155"),
  },
];

export default function Trainers() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia();

    // pinned horizontal scroll — desktop, motion allowed
    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      const trackEl = track.current;
      if (!trackEl || !section.current) return;
      const getDistance = () => trackEl.scrollWidth - window.innerWidth;

      gsap.to(trackEl, {
        x: () => -getDistance(),
        ease: "none",
        scrollTrigger: {
          trigger: section.current,
          start: "top top",
          end: () => `+=${getDistance()}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      });

      // subtle per-card drift against the track for depth
      gsap.utils.toArray<HTMLElement>("[data-trainer-photo]").forEach((el, i) => {
        gsap.fromTo(
          el,
          { xPercent: i % 2 ? 4 : -4 },
          {
            xPercent: i % 2 ? -4 : 4,
            ease: "none",
            scrollTrigger: {
              trigger: section.current,
              start: "top top",
              end: () => `+=${getDistance()}`,
              scrub: 1.2,
            },
          }
        );
      });
    });

    return () => mm.revert();
  }, []);

  return (
    <section ref={section} id="trainers" className="relative overflow-hidden py-24 lg:py-0">
      <div className="purple-wash absolute -left-1/4 top-0 h-[60vh] w-[70vw]" />

      <div className="flex min-h-0 flex-col justify-center lg:h-screen">
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
          <p className="label mb-4 text-xs text-primary-light">02 — The Team</p>
          <SplitHeading
            as="h2"
            className="font-display max-w-4xl text-[clamp(2rem,5vw,4rem)] font-bold uppercase leading-[1.05] tracking-[0.05em]"
            gradientWord="TRAINERS"
          >
            TRAINED & EXPERIENCED TRAINERS
          </SplitHeading>
          <p className="tagline mt-4">every coach certified, every session personal.</p>
        </div>

        {/* horizontal track — pinned scroll on desktop, swipe carousel on mobile */}
        <div className="mt-12 overflow-x-auto pb-4 [scrollbar-width:none] lg:overflow-visible lg:pb-0">
          <div
            ref={track}
            className="flex w-max snap-x snap-mandatory gap-6 px-6 lg:snap-none lg:px-10"
          >
            {TRAINERS.map((t) => (
              <article
                key={t.name}
                className="glass-card group w-[78vw] max-w-sm shrink-0 snap-center p-6 transition-all duration-500 hover:-translate-y-2 hover:border-primary-border hover:shadow-[0_0_36px_-8px_var(--color-primary-neon-glow)] sm:w-[340px]"
              >
                {/* photo with initials + gradient wash behind as fallback */}
                <div
                  data-distort
                  className={`relative flex aspect-[4/4.6] items-end justify-start overflow-hidden rounded-2xl bg-gradient-to-br ${t.hue} to-surface-low`}
                >
                  <span className="font-display absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-7xl font-extrabold uppercase tracking-[0.08em] text-glass-bright">
                    {t.initials}
                  </span>
                  <div data-trainer-photo data-distort-mount className="absolute -inset-x-[6%] inset-y-0">
                    {/* eslint-disable-next-line @next/next/no-img-element -- Unsplash CDN already serves optimized variants; avoids proxying remote images through next/image */}
                    <img
                      src={t.photo}
                      alt={`${t.name}, ${t.chips[0]} coach`}
                      loading="lazy"
                      className="h-full w-full object-cover saturate-[0.85] transition-transform duration-700 ease-out group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                  {/* brand tint + legibility gradient over the photo */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(8,6,8,0.85)] via-transparent to-[rgba(127,41,130,0.18)]" />
                  <span className="label relative m-4 rounded-full bg-overlay px-3 py-1.5 text-[11px] text-cyan-neon backdrop-blur">
                    {t.years} yrs experience
                  </span>
                </div>

                <h3 className="font-display mt-5 text-2xl font-bold uppercase tracking-[0.045em]">
                  {t.name}
                </h3>
                <p className="mt-1 text-sm text-text-muted">{t.certs}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {t.chips.map((c) => (
                    <span
                      key={c}
                      className="label rounded-full border border-primary-border bg-primary-soft px-3 py-1.5 text-[10px] text-primary-light"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </article>
            ))}

            {/* end-cap CTA card */}
            <div className="glass-card flex w-[78vw] max-w-sm shrink-0 snap-center flex-col items-start justify-center gap-5 p-8 sm:w-[340px]">
              <p className="font-display text-2xl font-bold uppercase leading-snug tracking-[0.045em]">
                Train with any of them — <span className="text-gradient">free</span>.
              </p>
              <p className="text-sm text-text-secondary">
                New members can book a free trial session with any trainer before committing.
              </p>
              <MagneticButton>
                <a
                  href="#contact"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToAnchor("#contact");
                  }}
                  className="btn-holo label inline-block rounded-full px-7 py-3.5 text-xs"
                >
                  Request a Trial Session
                </a>
              </MagneticButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
