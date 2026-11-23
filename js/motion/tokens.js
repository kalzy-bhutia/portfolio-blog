/* Motion tokens for JS. Mirrors css/tokens.css so CSS and GSAP
   animations share one timing language. Change a value in both
   places (durations are seconds here, ms in CSS). */

export const DUR = { xs: 0.12, sm: 0.2, md: 0.36, lg: 0.6, xl: 0.9 };

/* GSAP equivalents of the CSS easing curves:
   --ease-out    cubic-bezier(.2,.8,.2,1)  ~ power3.out
   --ease-in-out cubic-bezier(.6,0,.2,1)   ~ power3.inOut
   --ease-spring low bounce                = back.out(1.4) */
export const EASE = { out: 'power3.out', inOut: 'power3.inOut', spring: 'back.out(1.4)' };

export const STAGGER = 0.06;

const mq = (q) => window.matchMedia(q);
export const reducedMotion = () => mq('(prefers-reduced-motion: reduce)').matches;
export const finePointer = () => mq('(hover: hover) and (pointer: fine)').matches;
export const wideScreen = () => mq('(min-width: 901px)').matches;

/* GSAP and ScrollTrigger are loaded with `defer` on pages that need
   them. Returns null when unavailable so callers fall back to the
   static (final) layout. */
export function getGsap() {
  const { gsap, ScrollTrigger } = window;
  if (!gsap) return null;
  if (ScrollTrigger && !getGsap.registered) {
    gsap.registerPlugin(ScrollTrigger);
    getGsap.registered = true;
  }
  return gsap;
}
