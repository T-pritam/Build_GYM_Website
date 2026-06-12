/**
 * Tiny mutable store linking section ScrollTriggers to the single fixed
 * 3D canvas (SceneRail). Sections write their scroll progress here every
 * scroll tick; the canvas reads it every frame. No React state — no
 * re-renders on scroll.
 */
export const sceneBus = {
  /** Hero pin progress 0→1 (object exits center, flies to dock) */
  hero: 0,
  /** Premium section progress 0→1 (kettlebell turns per feature block) */
  premium: 0,
  /** Membership section progress 0→1 (plates accent, then fade out) */
  membership: 0,
};
