"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/useReducedMotion";
import SplitHeading from "@/components/ui/SplitHeading";

const FEATURES = [
  {
    title: "Attendance, charted",
    body: "Calories and visits charted weekly, plus a monthly check-in calendar — your consistency at a glance.",
  },
  {
    title: "🔥 Streaks & club rank",
    body: "Keep the streak alive and climb the club ranking. Top spots every month earn Build Coins.",
  },
  {
    title: "Know your split",
    body: "Today's workout assigned by your coach, goal progress, and a full activity breakdown.",
  },
  {
    title: "Your key to the gym",
    body: "Check in with QR, open the gym gate and your locker straight from the app. No cards, no keys.",
  },
];

// Mirrors the real BUILD app home screen: MON/TUE purple, WED/THU cyan (active), FRI–SUN dim
const BARS = [
  { h: 55, tone: "violet" },
  { h: 38, tone: "violet" },
  { h: 92, tone: "cyan" },
  { h: 80, tone: "cyan" },
  { h: 30, tone: "dim" },
  { h: 24, tone: "dim" },
  { h: 18, tone: "dim" },
] as const;

const BAR_TONES: Record<string, string> = {
  violet: "bg-gradient-to-t from-primary-bright/60 to-primary-light",
  cyan: "bg-gradient-to-t from-accent-cyan/70 to-accent-cyan-neon",
  dim: "bg-surface-3",
};

const QUICK_ACTIONS = [
  { label: "Activities", icon: "🏋️" },
  { label: "Cafe", icon: "☕" },
  { label: "Ranking", icon: "📊" },
  { label: "Community", icon: "💬" },
  { label: "Trainers", icon: "🤸" },
  { label: "Blogs", icon: "📖" },
];

export default function AppShowcase() {
  const section = useRef<HTMLElement>(null);
  const phone = useRef<HTMLDivElement>(null);
  const streak = useRef<HTMLSpanElement>(null);
  const visits = useRef<HTMLSpanElement>(null);
  const points = useRef<HTMLSpanElement>(null);
  const calories = useRef<HTMLSpanElement>(null);
  const coins = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const reduced = prefersReducedMotion();

    const setFinal = () => {
      if (streak.current) streak.current.textContent = "16";
      if (visits.current) visits.current.textContent = "8";
      if (points.current) points.current.textContent = "1,240";
      if (calories.current) calories.current.textContent = "2,840";
      if (coins.current) coins.current.textContent = "2,690";
    };

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

      if (reduced) {
        setFinal();
        return;
      }

      // in-phone UI: tiles pop, counters count, bars grow, coins fill
      const tl = gsap.timeline({
        scrollTrigger: { trigger: phone.current, start: "top 70%", once: true },
      });

      const countTo = (el: HTMLElement | null, to: number, pos: string) => {
        const state = { n: 0 };
        tl.to(
          state,
          {
            n: to,
            duration: 1.2,
            ease: "power2.out",
            onUpdate: () => {
              if (el) el.textContent = Math.round(state.n).toLocaleString("en-US");
            },
          },
          pos
        );
      };

      tl.fromTo(
        phone.current,
        { y: 80, opacity: 0, rotate: -3 },
        { y: 0, opacity: 1, rotate: 0, duration: 1, ease: "power3.out" }
      ).fromTo(
        "[data-tile]",
        { y: 22, opacity: 0, scale: 0.94 },
        { y: 0, opacity: 1, scale: 1, duration: 0.55, ease: "back.out(1.5)", stagger: 0.08 },
        "-=0.4"
      );

      countTo(streak.current, 16, "-=0.3");
      countTo(visits.current, 8, "<");
      countTo(points.current, 1240, "<");
      countTo(calories.current, 2840, "<+0.15");

      tl.fromTo(
        "[data-bar]",
        { scaleY: 0 },
        { scaleY: 1, duration: 0.7, ease: "power3.out", stagger: 0.07, transformOrigin: "bottom" },
        "-=1.0"
      ).fromTo(
        "[data-coin-card]",
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
        "-=0.5"
      );
      countTo(coins.current, 2690, "-=0.4");

      tl.fromTo(
        "[data-qa]",
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power2.out", stagger: 0.05 },
        "-=0.9"
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={section} id="app" className="relative py-28 lg:py-40">
      <div className="purple-wash absolute right-0 top-1/4 h-[55vh] w-[55vw]" />

      <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-2 lg:gap-12 lg:px-10">
        {/* phone mockup — recreates the real BUILD app home screen */}
        <div className="flex justify-center">
          <div
            ref={phone}
            className="w-[310px] rounded-[2.8rem] border border-border-strong bg-surface p-3 shadow-[0_0_70px_-18px_var(--color-primary-glow)] sm:w-[340px]"
          >
            <div className="relative overflow-hidden rounded-[2.2rem] border border-border-base bg-background px-4 pb-5 pt-4">
              {/* notch */}
              <div className="mx-auto mb-4 h-5 w-24 rounded-full bg-surface-2" />

              {/* greeting header */}
              <div className="flex items-center justify-between px-1">
                <div>
                  <p className="label text-[9px] text-text-muted">Good evening</p>
                  <p className="font-display text-xl font-extrabold leading-tight">Priya</p>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-8 w-8 items-center justify-center rounded-full border border-border-base text-sm">
                    🔔
                    <span className="label absolute -right-1 -top-1 rounded-full bg-primary-neon px-1 py-px text-[7px] text-white">
                      9+
                    </span>
                  </span>
                  <span className="font-display flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent-cyan text-[10px] font-extrabold text-white">
                    P
                  </span>
                </div>
              </div>

              {/* 2×2 stat tiles */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div data-tile className="rounded-2xl border-t border-primary-light/50 bg-surface p-3">
                  <p className="label text-[8px] text-text-muted">Longest streak 🔥</p>
                  <p className="font-display mt-1 text-xl font-extrabold text-primary-light">
                    <span ref={streak}>0</span> <span className="text-[10px]">Days</span>
                  </p>
                </div>
                <div data-tile className="rounded-2xl border-t border-accent-cyan/50 bg-surface p-3">
                  <p className="label text-[8px] text-text-muted">This month 📅</p>
                  <p className="font-display mt-1 text-xl font-extrabold text-accent-cyan">
                    <span ref={visits}>0</span> <span className="text-[10px]">Visits</span>
                  </p>
                </div>
                <div data-tile className="rounded-2xl border-t border-warning/50 bg-surface p-3">
                  <p className="label text-[8px] text-text-muted">Club rank 🏆</p>
                  <p className="font-display mt-1 text-xl font-extrabold text-warning">#1</p>
                </div>
                <div data-tile className="rounded-2xl border-t border-border-strong bg-surface p-3">
                  <p className="label text-[8px] text-text-muted">Points 💎</p>
                  <p className="font-display mt-1 text-xl font-extrabold">
                    <span ref={points}>0</span>
                  </p>
                </div>
              </div>

              {/* calories burned chart */}
              <div className="glass-card mt-2.5 rounded-2xl p-3.5">
                <p className="label text-[8px] text-text-muted">Calories burned</p>
                <div className="mt-1 flex items-baseline justify-between">
                  <p className="font-display text-lg font-extrabold">
                    <span ref={calories}>0</span>{" "}
                    <span className="text-[10px] font-bold text-text-muted">kcal</span>
                  </p>
                  <span className="text-[9px] font-semibold text-success">+12% vs last week</span>
                </div>
                <div className="mt-2.5 flex h-14 items-end justify-between gap-1.5">
                  {BARS.map((b, i) => (
                    <div
                      key={i}
                      data-bar
                      className={`w-full rounded-sm ${BAR_TONES[b.tone]}`}
                      style={{ height: `${b.h}%` }}
                    />
                  ))}
                </div>
                <div className="mt-1.5 flex justify-between text-[7px] uppercase tracking-widest text-text-dim">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                    <span key={d} className={d === "Thu" ? "font-extrabold text-text-secondary" : ""}>
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              {/* Build Coins */}
              <div
                data-coin-card
                className="mt-2.5 flex items-center gap-3 rounded-2xl border border-warning/35 bg-[rgba(255,193,7,0.06)] p-3"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-warning/60 bg-[rgba(255,193,7,0.12)]">
                  <span className="h-4 w-4 rounded-full bg-warning shadow-[0_0_10px_rgba(255,193,7,0.7)]" />
                </span>
                <div className="flex-1">
                  <p className="label text-[8px] text-warning">Build Coins</p>
                  <p className="font-display text-lg font-extrabold leading-tight">
                    <span ref={coins}>0</span>
                  </p>
                </div>
                <span className="text-[8px] text-text-dim">Tap to view transactions ›</span>
              </div>

              {/* quick actions */}
              <div className="mt-2.5 grid grid-cols-3 gap-1.5">
                {QUICK_ACTIONS.map((q) => (
                  <div
                    key={q.label}
                    data-qa
                    className="flex flex-col items-center gap-1 rounded-xl border border-border-base bg-surface py-2.5"
                  >
                    <span className="text-sm leading-none">{q.icon}</span>
                    <span className="label text-[7px] text-text-muted">{q.label}</span>
                  </div>
                ))}
              </div>

              {/* check-in */}
              <button className="btn-holo label mx-auto mt-3.5 block w-full rounded-full py-2.5 text-[9px]">
                ▣ &nbsp;Check in
              </button>
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
