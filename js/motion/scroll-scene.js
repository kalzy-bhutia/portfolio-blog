/* ScrollScene: one wrapper for every scroll-driven signature scene.

   createScene(el, {
     build(gsap, el) -> timeline   // animates FROM a start state INTO the CSS layout
     scrub: false | true           // true = progress follows scroll (desktop only)
     start, end                    // ScrollTrigger positions
     mobile(el)                    // optional alternative for narrow screens
   })

   Rules it enforces:
   - Reduced motion or no GSAP: nothing runs, the CSS final state shows.
   - Never pins, never hijacks scroll.
   - Monotonic: scrubbed scenes only move forward, so a reveal never
     re-hides when you scroll back up.
   - A scene already scrolled past on load jumps to its end. */

import { getGsap, reducedMotion, wideScreen } from './tokens.js';

export function createScene(el, { build, scrub = false, start = 'top 78%', end = 'top 30%', mobile } = {}) {
  if (!el || reducedMotion()) return;
  const gsap = getGsap();
  const ST = window.ScrollTrigger;
  if (!gsap || !ST) return;

  if (mobile && !wideScreen()) { mobile(el); return; }

  const tl = build(gsap, el);
  tl.pause(0);

  if (scrub && wideScreen()) {
    let max = 0;
    const st = ST.create({
      trigger: el, start, end,
      onUpdate(self) {
        if (self.progress <= max) return;
        max = self.progress;
        gsap.to(tl, { progress: max, duration: 0.4, ease: 'power2.out', overwrite: true });
      },
    });
    if (window.scrollY > st.end) { max = 1; tl.progress(1); }
    return;
  }

  const st = ST.create({ trigger: el, start, once: true, onEnter: () => tl.play() });
  if (window.scrollY > st.start + window.innerHeight) tl.progress(1);
  else if (window.scrollY > st.start) tl.play();
}

/* Trigger-once without GSAP (used by mobile variants). */
export function onceVisible(el, fn, { threshold = 0.35, rootMargin = '0px 0px -10% 0px' } = {}) {
  if (!('IntersectionObserver' in window)) { fn(el); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      fn(e.target);
    });
  }, { threshold, rootMargin });
  io.observe(el);
}
