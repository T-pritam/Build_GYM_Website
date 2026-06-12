/**
 * Section → model manifest. Swap any asset by editing this file.
 *
 * Drop .glb files into /public/models/. If a file is missing or fails
 * to load, the section renders a procedural primitive fallback instead
 * (the site never crashes without models).
 */
export const MODELS = {
  /** Hero — most iconic standalone piece. ~4.2MB */
  hero: "/models/dumbbell.glb",
  /** Premium / Smart Access section. ~3.4MB */
  premium: "/models/kettlebell.glb",
  /** Decorative accent in the membership closer. ~2.2MB */
  accent: "/models/weight_lifting_set.glb",
} as const;

export type ModelSlot = keyof typeof MODELS;
