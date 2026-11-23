/* Selected work: each case study plays like a short film.
   Desktop: a progress line runs through ask -> did -> shipped as you
   scroll (forward only, never re-hides).
   Mobile: the beats stack vertically and light up one by one as each
   reaches the middle of the screen. */

import { createScene, onceVisible } from '../motion/scroll-scene.js';
import { EASE } from '../motion/tokens.js';

function desktopFilm(gsap, el) {
  const q = gsap.utils.selector(el);
  const beats = q('.beat');
  const tl = gsap.timeline({ defaults: { ease: 'none' } });
  tl.fromTo(q('.beat-track-fill'), { scaleX: 0 }, { scaleX: 1, duration: 2 }, 0);
  beats.forEach((beat, i) => {
    const at = i * 0.95;
    tl.fromTo(beat, { y: 10 }, { y: 0, duration: 0.45, ease: EASE.out }, at)
      .fromTo(beat.querySelector('.beat-icon svg'), { scale: 0.55, rotation: -8, opacity: 0.35 }, { scale: 1, rotation: 0, opacity: 1, duration: 0.5, ease: EASE.spring }, at);
  });
  return tl;
}

function mobileFilm(el) {
  el.classList.add('film-armed');
  const beats = [...el.querySelectorAll('.beat')];
  beats.forEach((beat, i) => {
    onceVisible(beat, () => beats.slice(0, i + 1).forEach((b) => b.classList.add('is-lit')),
      { threshold: 0.6, rootMargin: '0px 0px -25% 0px' });
  });
}

export function initCaseFilms() {
  document.querySelectorAll('[data-scene="case"]').forEach((el) => {
    createScene(el, { build: desktopFilm, scrub: true, start: 'top 72%', end: 'bottom 72%', mobile: mobileFilm });
  });
}
