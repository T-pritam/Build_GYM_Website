"use client";

import { FormEvent, useState } from "react";
import SplitHeading from "@/components/ui/SplitHeading";

const INTERESTS = ["Membership", "Trial Session", "Personal Training", "Other"] as const;

type Errors = Partial<Record<"name" | "email" | "message", string>>;

const inputClass =
  "w-full rounded-xl border border-border-base bg-background-alt px-4 py-3.5 text-base text-text-primary placeholder:text-text-dim transition-shadow focus:border-primary-neon focus:shadow-[0_0_0_1px_var(--color-primary-neon),0_0_24px_-8px_var(--color-primary-neon-glow)] focus:outline-none";

export default function Contact() {
  const [interest, setInterest] = useState<(typeof INTERESTS)[number]>("Membership");
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;

    const next: Errors = {};
    if (!data.name?.trim()) next.name = "Tell us your name";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email ?? "")) next.email = "That email doesn't look right";
    if (!data.message?.trim() || data.message.trim().length < 10)
      next.message = "Give us a sentence or two";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, interest }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStatus("sent");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <section id="contact" className="relative py-28 lg:py-36">
      <div className="purple-wash absolute right-0 top-0 h-[55vh] w-[55vw]" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <div className="glass-card grid overflow-hidden lg:grid-cols-2">
          {/* left: details */}
          <div className="border-b border-border-base p-8 sm:p-12 lg:border-b-0 lg:border-r">
            <SplitHeading
              as="h2"
              className="font-display text-[clamp(2rem,4.5vw,3.4rem)] font-bold uppercase leading-[1.05] tracking-[0.05em]"
              gradientWord="TOUCH"
            >
              GET IN TOUCH
            </SplitHeading>
            <p className="tagline mt-4">the first session is on us.</p>

            <dl className="mt-12 space-y-7 text-base">
              <div>
                <dt className="label mb-1.5 text-[10px] text-text-muted">Address</dt>
                <dd className="text-text-secondary">
                  4 Iron Works Lane, Indiranagar
                  <br />
                  Bengaluru 560038
                </dd>
              </div>
              <div>
                <dt className="label mb-1.5 text-[10px] text-text-muted">Hours</dt>
                <dd className="text-text-secondary">Mon–Sat 5:00–23:00 · Sun 7:00–21:00</dd>
              </div>
              <div>
                <dt className="label mb-1.5 text-[10px] text-text-muted">Phone</dt>
                <dd>
                  <a href="tel:+918045000000" className="text-text-secondary transition-colors hover:text-cyan-neon">
                    +91 80450 00000
                  </a>
                </dd>
              </div>
              <div>
                <dt className="label mb-1.5 text-[10px] text-text-muted">Email</dt>
                <dd>
                  <a
                    href="mailto:hello@buildfitness.in"
                    className="text-text-secondary transition-colors hover:text-cyan-neon"
                  >
                    hello@buildfitness.in
                  </a>
                </dd>
              </div>
              <div>
                <dt className="label mb-1.5 text-[10px] text-text-muted">Social</dt>
                <dd className="flex gap-5">
                  {["Instagram", "YouTube", "X"].map((s) => (
                    <a
                      key={s}
                      href="#"
                      className="label text-[11px] text-text-muted underline-offset-4 transition-colors hover:text-text-primary hover:underline"
                    >
                      {s}
                    </a>
                  ))}
                </dd>
              </div>
            </dl>

            {/* dark map placeholder */}
            <div className="relative mt-10 h-40 overflow-hidden rounded-2xl border border-border-base bg-surface-low">
              <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(var(--color-surface-3)_1px,transparent_1px),linear-gradient(90deg,var(--color-surface-3)_1px,transparent_1px)] [background-size:28px_28px]" />
              <span className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-neon shadow-[0_0_18px_4px_var(--color-primary-neon-glow)]" />
              <span className="label absolute bottom-3 left-4 text-[10px] text-text-dim">
                Map · BUILD Fitness, Indiranagar
              </span>
            </div>
          </div>

          {/* right: form */}
          <div className="p-8 sm:p-12">
            {status === "sent" ? (
              <div className="flex h-full min-h-[420px] flex-col items-center justify-center text-center">
                <span className="flex h-20 w-20 animate-[pulse_2s_ease-in-out_infinite] items-center justify-center rounded-full bg-gradient-to-br from-primary-bright to-accent-cyan text-3xl text-white shadow-[0_0_44px_-4px_var(--color-primary-neon-glow)]">
                  ✓
                </span>
                <h3 className="font-display mt-8 text-2xl font-bold uppercase tracking-[0.045em]">
                  We&apos;ll be in touch
                </h3>
                <p className="tagline mt-3">your first session is waiting.</p>
                <button
                  onClick={() => setStatus("idle")}
                  className="btn-ghost label mt-8 rounded-full px-7 py-3 text-xs"
                >
                  Send another
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="label mb-2 block text-[10px] text-text-muted">
                      Name *
                    </label>
                    <input id="name" name="name" className={inputClass} placeholder="Your name" />
                    {errors.name && <p className="mt-1.5 text-xs text-error">{errors.name}</p>}
                  </div>
                  <div>
                    <label htmlFor="email" className="label mb-2 block text-[10px] text-text-muted">
                      Email *
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      className={inputClass}
                      placeholder="you@example.com"
                    />
                    {errors.email && <p className="mt-1.5 text-xs text-error">{errors.email}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="label mb-2 block text-[10px] text-text-muted">
                    Phone (optional)
                  </label>
                  <input id="phone" name="phone" type="tel" className={inputClass} placeholder="+91…" />
                </div>

                <div>
                  <span className="label mb-2 block text-[10px] text-text-muted">I&apos;m interested in</span>
                  <div className="flex flex-wrap gap-2" role="group" aria-label="Interest">
                    {INTERESTS.map((i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setInterest(i)}
                        aria-pressed={interest === i}
                        className={`label rounded-full px-4 py-2.5 text-[10px] transition-all ${
                          interest === i
                            ? "border border-primary-border bg-primary-soft text-primary-light shadow-[0_0_18px_-6px_var(--color-primary-neon-glow)]"
                            : "border border-border-base text-text-muted hover:border-border-strong hover:text-text-secondary"
                        }`}
                      >
                        {i}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="label mb-2 block text-[10px] text-text-muted">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    className={inputClass}
                    placeholder="Tell us what you're training for…"
                  />
                  {errors.message && <p className="mt-1.5 text-xs text-error">{errors.message}</p>}
                </div>

                {status === "error" && (
                  <p className="text-sm text-error">Something went wrong — please try again.</p>
                )}

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="btn-holo label w-full rounded-full px-9 py-4 text-sm disabled:opacity-60"
                >
                  {status === "sending" ? "Sending…" : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
