import Link from "next/link";

export const metadata = { title: "3D Model Credits — BUILD Fitness" };

const CREDITS = [
  {
    file: "dumbbell.glb",
    use: "Hero section",
    line: "Dumbbell — author: [add author from Sketchfab 'Copy Credits'] — license: [CC-BY / CC0]",
  },
  {
    file: "kettlebell.glb",
    use: "Premium Access section",
    line: "Kettlebell — author: [add author] — license: [CC-BY / CC0]",
  },
  {
    file: "weight_lifting_set.glb",
    use: "Membership accent",
    line: "Weight Lifting Set — author: [add author] — license: [CC-BY / CC0]",
  },
];

export default function CreditsPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-24">
      <h1 className="font-display text-4xl font-bold uppercase tracking-[0.05em]">
        3D Model <span className="text-gradient">Credits</span>
      </h1>
      <p className="tagline mt-4">with thanks to the artists.</p>

      <ul className="mt-12 space-y-6">
        {CREDITS.map((c) => (
          <li key={c.file} className="glass-card p-6">
            <p className="label text-[10px] text-primary-light">{c.use}</p>
            <p className="mt-2 font-medium">{c.line}</p>
            <p className="mt-1 text-sm text-text-dim">/public/models/{c.file}</p>
          </li>
        ))}
      </ul>

      <p className="mt-10 text-sm text-text-muted">
        Replace the placeholder lines above (and in CREDITS.md) with the exact credit text from each
        model&apos;s source page.
      </p>

      <Link href="/" className="btn-ghost label mt-12 self-start rounded-full px-7 py-3 text-xs">
        ← Back to site
      </Link>
    </main>
  );
}
