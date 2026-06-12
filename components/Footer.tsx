"use client";

import Link from "next/link";
import { scrollToAnchor } from "@/lib/lenis";

const ACTIVITIES = [
  "Weight Training",
  "HIIT",
  "Yoga",
  "Pilates",
  "Boxing",
  "Pickleball",
  "Swimming",
  "Sauna & Spa",
  "Group Classes",
  "Cardio",
];

const NAV = [
  { label: "Trainers", href: "#trainers" },
  { label: "The App", href: "#app" },
  { label: "Activities", href: "#activities" },
  { label: "Contact", href: "#contact" },
];

export default function Footer() {
  const marqueeItems = [...ACTIVITIES, ...ACTIVITIES];

  return (
    <footer className="relative border-t border-border-base">
      {/* infinite activity marquee */}
      <div className="relative overflow-hidden py-6">
        <div className="divider-sheen absolute inset-x-0 top-0" />
        <div className="marquee-track" aria-hidden="true">
          {marqueeItems.map((a, i) => (
            <span
              key={i}
              className="label mx-6 flex items-center gap-12 whitespace-nowrap text-sm text-text-dim"
            >
              {a}
              <span className="text-gradient">✦</span>
            </span>
          ))}
        </div>
        <div className="divider-sheen absolute inset-x-0 bottom-0" />
      </div>

      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 py-10 sm:flex-row lg:px-10">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            scrollToAnchor("#top");
          }}
          className="font-display text-lg font-extrabold uppercase tracking-[0.08em]"
        >
          BUILD<span className="text-gradient">.</span>
        </a>

        <ul className="flex flex-wrap items-center justify-center gap-6">
          {NAV.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToAnchor(l.href);
                }}
                className="label text-xs text-text-muted transition-colors hover:text-text-primary"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex flex-col items-center gap-1 text-sm text-text-muted sm:items-end">
          <span>© {new Date().getFullYear()} BUILD Fitness</span>
          <Link href="/credits" className="text-xs text-text-dim underline-offset-4 hover:text-text-muted hover:underline">
            3D models: credits
          </Link>
        </div>
      </div>
    </footer>
  );
}
