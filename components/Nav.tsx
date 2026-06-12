"use client";

import { useEffect, useState } from "react";
import { scrollToAnchor } from "@/lib/lenis";

const LINKS = [
  { label: "Trainers", href: "#trainers" },
  { label: "The App", href: "#app" },
  { label: "Activities", href: "#activities" },
  { label: "Access", href: "#premium" },
  { label: "Café", href: "#cafe" },
  { label: "Contact", href: "#contact" },
];

/** Hides on scroll down, reveals on scroll up; frosted glass after leaving the hero. */
export default function Nav() {
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setHidden(y > last && y > 140);
      setScrolled(y > window.innerHeight * 0.75);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    setOpen(false);
    scrollToAnchor(href);
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        hidden && !open ? "-translate-y-full" : "translate-y-0"
      } ${
        scrolled || open
          ? "bg-overlay backdrop-blur-xl border-b border-border-base"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <a href="#top" onClick={(e) => go(e, "#top")} className="shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element -- small static brand asset, no optimization needed */}
          <img
            src="/brand/logo-horizontal.png"
            alt="MAISON de BUILD"
            className="h-6 w-auto sm:h-7"
          />
        </a>

        <ul className="hidden items-center gap-8 lg:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                onClick={(e) => go(e, l.href)}
                className="label text-xs text-text-muted transition-colors hover:text-text-primary"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <a
            href="#contact"
            onClick={(e) => go(e, "#contact")}
            className="btn-holo label hidden rounded-full px-6 py-2.5 text-xs sm:inline-block"
          >
            Free Trial
          </a>
          <button
            className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            <span
              className={`h-px w-6 bg-text-primary transition-transform ${open ? "translate-y-[3.5px] rotate-45" : ""}`}
            />
            <span
              className={`h-px w-6 bg-text-primary transition-transform ${open ? "-translate-y-[3.5px] -rotate-45" : ""}`}
            />
          </button>
        </div>
      </nav>

      {/* mobile menu */}
      <div
        className={`overflow-hidden transition-[max-height] duration-500 lg:hidden ${
          open ? "max-h-96" : "max-h-0"
        }`}
      >
        <ul className="flex flex-col gap-1 px-6 pb-6">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                onClick={(e) => go(e, l.href)}
                className="label block py-3 text-sm text-text-secondary"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
