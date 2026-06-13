# BUILD Fitness — Premium 3D Animated Gym Website

Award-style single-page marketing site for BUILD Fitness, built on the
**Elite Noir / Holographic** design system: void-black canvas, frosted glass,
holographic purple → cyan accents, cinematic scroll-driven 3D.

## Setup

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## Stack & package justifications

| Package | Why |
| --- | --- |
| `next` (App Router, TS) | Foundation per brief. |
| `three` + `@react-three/fiber` | All 3D rendering, declaratively in React. |
| `@react-three/drei` | `useGLTF` (Draco-ready), `Environment`, `ContactShadows` — saves hundreds of lines of boilerplate. |
| `@react-three/postprocessing` | Cheap selective bloom so the purple/cyan neon rims actually glow. |
| `gsap` + ScrollTrigger | Every scroll animation: pins, scrubs, staggers, counters, velocity skew. |
| `lenis` | Smooth scroll site-wide, synced into GSAP's ticker so ScrollTrigger never drifts. |
| `maath` | Frame-rate-independent damped easing for mouse parallax and 3D angle transitions. |
| `tailwindcss` v4 | Styling; the entire design system lives in `@theme` tokens. |

No other runtime dependencies — the split-text utility, magnetic buttons,
phone mockup, preloader, and marquee are all hand-rolled.

Trainer and activity photos are hotlinked from the Unsplash CDN (plain
`<img loading="lazy">` with size/format params — the CDN serves optimized
variants, so they're not proxied through `next/image`). Every image has an
`onError` fallback to the branded gradient placeholder, so the design holds
up offline or if a photo is ever removed.

## Brand assets

`public/brand/brandmark.svg` is the MAISON de BUILD crossed-dumbbell mark as
clean vector (converted losslessly from the brand Illustrator PDF). The nav
renders it as a small rotating 3D emblem (`components/three/EmblemLogo.tsx`,
extruded from the SVG) beside a live-text wordmark
(`components/ui/Wordmark.tsx`, EB Garamond) — no flat logo image is used, so
the lockup stays crisp at any size. `app/icon.png` is the favicon.

## 3D models

Drop GLB files into `public/models/` with these exact names (the manifest is
`lib/assets.ts` — edit it to remap sections):

| File | Section | Notes |
| --- | --- | --- |
| `public/models/dumbbell.glb` | Hero | 1.4 MB (optimized from 4.2 MB) |
| `public/models/kettlebell.glb` | Premium Access | 0.8 MB (optimized from 3.4 MB) |
| `public/models/weight_lifting_set.glb` | Membership accent | 0.6 MB (optimized from 2.2 MB) |

The shipped GLBs are optimized: Draco-compressed geometry (no mesh
simplification — silhouettes untouched) and textures resized 1024→512,
which is still at/above screen density for the sizes these objects render
at. That cut texture GPU/RAM use from ~84 MB to ~21 MB and downloads from
9.8 MB to 2.8 MB with no visible difference. Untouched originals live in
`models_src/` (gitignored, local-only backup). To re-run after swapping a model:

```bash
npx @gltf-transform/cli optimize models_src/model.glb public/models/model.glb \
  --compress draco --texture-size 512 --simplify false
```

All three models you provided were found and wired up — none were skipped
(each is well under the 15 MB ceiling). Your original nested folders
(`dumbbells/`, `Kettlebell/`, ` gym equipment set/` — note the leading space)
were flattened to the clean paths above so URLs stay safe.

### How loading works

- Every model goes through `components/three/NormalizedModel.tsx`, which
  **auto-normalizes** whatever you drop in: re-centers it on its bounding-box
  center and scales the longest edge to a target world size, so any export
  (any units, any origin) drops in cleanly. Baked materials are nudged toward
  dark metallic so the purple/cyan rim lights read.
- Draco-compressed GLBs are supported out of the box (decoder loaded from CDN).
  To compress a model: `npx gltf-pipeline -i model.glb -o model_draco.glb -d`.

### Procedural fallbacks (no-crash rule)

Every model is wrapped in `Suspense` + an error boundary
(`components/three/ModelBoundary.tsx`). While a GLB streams in — or if the
folder is empty, a file is missing, or parsing fails — a stylized procedural
stand-in renders instead (`components/three/Procedural.tsx`: dumbbell from
cylinders + spheres, kettlebell from sphere + torus, plate stack), with the
same dark-metallic material and rim lighting. Delete every GLB and the site
still looks finished.

### Credits

CC-Attribution models must be credited. Fill in `CREDITS.md` and
`app/credits/page.tsx` (linked from the footer as "3D models: credits") with
the exact lines from each model's source page.

## 3D architecture & performance

- **One WebGL context for the whole site** (`components/three/SceneRail.tsx`):
  a single fixed canvas hosts the ambient dust and a "traveler" object that
  hands off between sections as you scroll — hero dumbbell → docked
  bottom-right while browsing → kettlebell beside the Premium feature blocks
  → plates accent in the membership closer → fades out. Sections feed their
  ScrollTrigger progress through `lib/sceneBus.ts` (a plain mutable object —
  zero React re-renders on scroll). This replaced four separate canvases
  (hero/premium/accent/particles), three environment-map copies, and two
  bloom passes; glow now comes from the purple/cyan rim lights alone.
- **Hover distortion** (`components/three/HoverDistortion.tsx`): one extra
  renderer created lazily on first hover and re-parented into whichever
  trainer card is hovered; at most one card-sized texture on the GPU,
  disposed on leave; rAF runs only while the effect is visible.
- **Cursor glow** (`components/CursorGlow.tsx`): pure CSS transforms on two
  fixed divs, no WebGL. Skipped on touch devices.
- `dpr` capped at `[1, 1.75]`; dust is ~180 unlit points (110 on mobile).
- Trainers section: pinned horizontal scroll on desktop, native snap swipe
  carousel on mobile (no pin).
- `prefers-reduced-motion`: pins/scrubs/parallax/marquee/3D/cursor effects
  are all disabled; reveals fall back to simple fades. Lenis is not
  initialized.

## Wiring the contact form to a real email service

The form posts to `app/api/contact/route.ts`, which currently validates,
logs, and returns success. To send real email with [Resend](https://resend.com):

```bash
npm install resend
```

```ts
// app/api/contact/route.ts
import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);

// inside POST, replacing the console.log:
await resend.emails.send({
  from: "site@yourdomain.com",
  to: "hello@buildfitness.in",
  subject: `New enquiry from ${name} (${interest})`,
  replyTo: email,
  text: `${name} <${email}> ${phone ?? ""}\n\n${message}`,
});
```

Add `RESEND_API_KEY` to `.env.local`. (Nodemailer over SMTP works the same
way — swap the send call.)

## Structure

```
app/                  layout (fonts/meta), page, globals.css (design tokens), api/contact, /credits
components/sections/  Hero, Trainers, AppShowcase, Activities, Premium, Cafe, Membership, Contact
components/three/     SceneRail (single site-wide canvas), HoverDistortion, NormalizedModel, ModelBoundary, Procedural
components/ui/        SplitHeading, MagneticButton, Counter
components/           Preloader, Nav, Footer, ScrollProgress, CursorGlow
lib/                  gsap.ts, lenis.tsx, assets.ts (model manifest), sceneBus.ts, split.ts, useReducedMotion.ts
```

## Missing models

None — all three GLBs from the brief were present and are wired up. If you
want a richer accent piece later (e.g. a full machine for the Activities
section), drop it in `public/models/` and add one line to `lib/assets.ts`.
