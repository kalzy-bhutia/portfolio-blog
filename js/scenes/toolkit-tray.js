/* Toolkit: scattered tool chips fly in and settle into a tidy tray
   of four compartments. Desktop follows scroll (forward only);
   mobile plays once with shorter throws. */

import { createScene } from '../motion/scroll-scene.js';
import { EASE, wideScreen } from '../motion/tokens.js';

function build(gsap, el) {
  const q = gsap.utils.selector(el);
  const reach = wideScreen() ? 240 : Math.min(120, window.innerWidth * 0.25);
  const tl = gsap.timeline();
  tl.from(q('.tray-group'), { opacity: 0, scale: 0.94, duration: 0.5, ease: EASE.out, stagger: 0.08 }, 0)
    .from(q('.chip'), {
      x: () => gsap.utils.random(-reach, reach),
      y: () => gsap.utils.random(-reach * 0.9, -reach * 0.3),
      rotation: () => gsap.utils.random(-28, 28),
      opacity: 0,
      duration: 0.7,
      ease: 'back.out(1.2)',
      stagger: { each: 0.045, from: 'random' },
    }, 0.2);
  return tl;
}

export function initToolkitTray() {
  const tray = document.querySelector('[data-scene="toolkit"]');
  createScene(tray, { build, scrub: true, start: 'top 85%', end: 'top 30%' });
}
