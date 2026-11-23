/* FloatingBadge: small pills that pop in on a spring and settle.
   No idle floating: they move once, then stay still. */

import { DUR, EASE, STAGGER } from './tokens.js';

export function popBadges(gsap, badges, at = 0, tl = gsap.timeline()) {
  return tl.fromTo(badges,
    { opacity: 0, y: 10, scale: 0.9 },
    { opacity: 1, y: 0, scale: 1, duration: DUR.lg, ease: EASE.spring, stagger: STAGGER * 1.5 },
    at);
}
