"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/useReducedMotion";
import SplitHeading from "@/components/ui/SplitHeading";

const FEATURES = [
  {
    title: "Attendance, charted",
    body: "Weekly attendance chart and a monthly check-in calendar — see your consistency at a glance.",
  },
  {
    title: "🔥 Streaks & leaderboard",
    body: "Keep the streak alive and climb the podium. Top 3 every month earn Build Coins.",
  },
  {
    title: "Know your split",
    body: "Activity breakdown donut and goal progress — strength, cardio, recovery, all tracked.",
  },
  {
    title: "Your key to the gym",
    body: "Open the gym gate and your locker straight from the app. No cards, no keys.",
  },
];

const BARS = [42, 68, 55, 90, 72, 100, 62];
const RING_CIRC = 2 * Math.PI * 40; // r=40 donut

export default function AppShowcase() {
  const section = useRef<HTMLElement>(null);
  const phone = useRef<HTMLDivElement>(null);
  const streak = useRef<HTMLSpanElement>(null);
  const ring = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const reduced = prefersReducedMotion();
    const ctx = gsap.context(() => {
      // feature rows reveal line-by-line
      gsap.utils.toArray<HTMLElement>("[data-feature]").forEach((el, i) => {
        gsap.fromTo(
          el,
          reduced ? { opacity: 0 } : { opacity: 0, x: 48 },
          {
            opacity: 1,
            x: 0,
            duration: 0.9,
            ease: "power3.out",
            delay: i * 0.05,
            scrollTrigger: { trigger: el, start: "top 85%", once: true },
          }
        );
      });

      // in-phone UI: bars grow, streak counts, ring fills, podium rises
      const tl = gsap.timeline({
        scrollTrigger: { trigger: phone.current, start: "top 70%", once: true },
      });

      if (reduced) {
        if (ring.current) ring.current.style.strokeDashoffset = String(RING_CIRC * 0.22);
        if (streak.current) streak.current.textContent = "23";
        return;
      }

      tl.fromTo(
        phone.current,
        { y: 80, opacity: 0, rotate: -3 },
        { y: 0, opacity: 1, rotate: 0, duration: 1, ease: "power3.out" }
      )
        .fromTo(
          "[data-bar]",
          { scaleY: 0 },
          { scaleY: 1, duration: 0.7, ease: "power3.out", stagger: 0.07, transformOrigin: "bottom" },
          "-=0.3"
        )
        .to(
          { n: 0 },
          {
            n: 23,
            duration: 1.2,
            ease: "power2.out",
            onUpdate(this: gsap.core.Tween) {
              const target = this.targets()[0] as { n: number };
              if (streak.current) streak.current.textContent = String(Math.round(target.n));
            },
          },
          "-=0.5"
        )
        .fromTo(
          ring.current,
          { strokeDashoffset: RING_CIRC },
          { strokeDashoffset: RING_CIRC * 0.22, duration: 1.3, ease: "power2.inOut" },
          "-=1.0"
        )
        .fromTo(
          "[data-podium]",
          { scaleY: 0.2, opacity: 0 },
          { scaleY: 1, opacity: 1, duration: 0.6, ease: "back.out(1.6)", stagger: 0.1, transformOrigin: "bottom" },
          "-=0.8"
        );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={section} id="app" className="relative py-28 lg:py-40">
      <div className="purple-wash absolute right-0 top-1/4 h-[55vh] w-[55vw]" />

      <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-2 lg:gap-12 lg:px-10">
        {/* phone mockup — the screen IS this design system */}
        <div className="flex justify-center">
          <div
            ref={phone}
            className="w-[300px] rounded-[2.8rem] border border-border-strong bg-surface p-3 shadow-[0_0_70px_-18px_var(--color-primary-glow)] sm:w-[330px]"
          >
            <div className="relative overflow-hidden rounded-[2.2rem] border border-border-base bg-background px-5 pb-6 pt-4">
              {/* notch */}
              <div className="mx-auto mb-4 h-5 w-24 rounded-full bg-surface-2" />

              {/* app header */}
              <div className="flex items-center justify-between">
                <span className="font-display text-sm font-extrabold uppercase tracking-[0.08em]">
                  BUILD<span className="text-gradient">.</span>
                </span>
                <span className="label rounded-full bg-primary-soft px-2.5 py-1 text-[9px] text-primary-light">
                  Elite member
                </span>
              </div>

              {/* streak */}
              <div className="glass-card mt-4 flex items-center justify-between rounded-2xl p-4">
                <div>
                  <p className="label text-[9px] text-text-muted">Current streak</p>
                  <p className="font-display mt-1 text-3xl font-extrabold">
                    🔥 <span ref={streak} className="text-gradient">0</span>
                    <span className="ml-1 text-xs font-bold uppercase text-text-muted">days</span>
                  </p>
                </div>
                {/* leaderboard podium */}
                <div className="flex items-end gap-1.5" aria-label="Leaderboard top 3">
                  <div data-podium className="flex w-7 flex-col items-center gap-1">
                    <span className="text-[9px] text-text-muted">PS</span>
                    <div className="h-8 w-full rounded-t bg-surface-3" />
                  </div>
                  <div data-podium className="flex w-7 flex-col items-center gap-1">
                    <span className="text-[9px] text-cyan-neon">You</span>
                    <div className="h-12 w-full rounded-t bg-gradient-to-t from-primary to-accent-cyan" />
                  </div>
                  <div data-podium className="flex w-7 flex-col items-center gap-1">
                    <span className="text-[9px] text-text-muted">DC</span>
                    <div className="h-6 w-full rounded-t bg-surface-2" />
                  </div>
                </div>
              </div>

              {/* weekly attendance bars */}
              <div className="glass-card mt-3 rounded-2xl p-4">
                <p className="label text-[9px] text-text-muted">This week</p>
                <div className="mt-3 flex h-16 items-end justify-between gap-2">
                  {BARS.map((h, i) => (
                    <div
                      key={i}
                      data-bar
                      className="w-full rounded-sm bg-gradient-to-t from-primary-bright to-accent-cyan"
                      style={{ height: `${h}%`, opacity: i === 5 ? 1 : 0.55 }}
                    />
                  ))}
                </div>
                <div className="mt-2 flex justify-between text-[8px] uppercase tracking-widest text-text-dim">
                  {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                    <span key={i}>{d}</span>
                  ))}
                </div>
              </div>

              {/* donut + goal */}
              <div className="mt-3 flex gap-3">
                <div className="glass-card flex flex-1 items-center justify-center rounded-2xl p-3">
                  <svg viewBox="0 0 100 100" className="h-20 w-20 -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="var(--color-surface-3)" strokeWidth="10" />
                    <circle
                      ref={ring}
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="url(#ringGrad)"
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={RING_CIRC}
                      strokeDashoffset={RING_CIRC}
                    />
                    <defs>
                      <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#7c3aed" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="ml-2">
                    <p className="font-display text-lg font-extrabold">78%</p>
                    <p className="text-[9px] uppercase tracking-widest text-text-muted">goal</p>
                  </div>
                </div>
                <div className="glass-card flex flex-1 flex-col justify-center gap-2 rounded-2xl p-3">
                  <button className="btn-holo label rounded-xl py-2.5 text-[9px]">Open gate</button>
                  <button className="label rounded-xl border border-border-strong py-2.5 text-[9px] text-text-secondary">
                    Locker 214
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* copy + features */}
        <div>
          <p className="label mb-4 text-xs text-primary-light">03 — The App</p>
          <SplitHeading
            as="h2"
            className="font-display text-[clamp(2rem,5vw,4rem)] font-bold uppercase leading-[1.05] tracking-[0.05em]"
            gradientWord="EVERY"
          >
            TRACK EVERY WORKOUT
          </SplitHeading>
          <p className="tagline mt-4">your whole gym life, in your pocket.</p>

          <ul className="mt-12 space-y-8">
            {FEATURES.map((f) => (
              <li key={f.title} data-feature className="flex gap-5">
                <span className="divider-sheen mt-3 w-10 shrink-0 rotate-90 lg:rotate-0" />
                <div>
                  <h3 className="font-display text-xl font-bold uppercase tracking-[0.045em]">
                    {f.title}
                  </h3>
                  <p className="mt-2 max-w-md text-sm text-text-secondary">{f.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
