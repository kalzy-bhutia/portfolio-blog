/* AnimatedUnderline: hand-drawn ink strokes that draw themselves.
   Paths carry pathLength="1" so every stroke animates 1 -> 0 on
   stroke-dashoffset regardless of its real length.
   CSS half (hover underlines on links) lives in base.css (.ink-link). */

import { DUR, EASE } from './tokens.js';

export function hideInk(gsap, paths) {
  gsap.set(paths, { strokeDasharray: 1, strokeDashoffset: 1 });
}

export function drawInk(gsap, paths, opts = {}) {
  return gsap.to(paths, {
    strokeDashoffset: 0,
    duration: opts.duration ?? DUR.lg,
    ease: opts.ease ?? EASE.out,
    stagger: opts.stagger ?? 0.08,
  });
}
