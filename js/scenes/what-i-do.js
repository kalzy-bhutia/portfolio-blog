/* What I do: three small transformations, each played once when its
   card scrolls into view. Every scene animates INTO the SVG's drawn
   (final) state, which is what reduced motion and no-JS show. */

import { createScene } from '../motion/scroll-scene.js';
import { hideInk, drawInk } from '../motion/animated-underline.js';
import { EASE } from '../motion/tokens.js';

/* Translate: a vague speech bubble reshapes into a spec card. */
function translate(gsap, el) {
  const q = gsap.utils.selector(el);
  hideInk(gsap, [...q('.st-arrow'), ...q('.st-ticks path')]);
  const tl = gsap.timeline({ defaults: { ease: EASE.out } });
  gsap.set(q('.st-bubble'), { x: 55, scale: 1.2, transformOrigin: '50% 50%' });
  tl.to(q('.st-bubble'), { keyframes: { rotation: [0, -6, 5, -3, 0] }, duration: 0.6, ease: 'none' }, 0)
    .to(q('.st-bubble'), { x: 0, scale: 1, duration: 0.55 }, 0.6)
    .from(q('.st-card'), { x: -70, scale: 0.4, opacity: 0, transformOrigin: '20% 50%', duration: 0.7, ease: EASE.spring }, 0.8)
    .add(drawInk(gsap, q('.st-arrow'), { duration: 0.4 }), 1.05)
    .from(q('.st-lines path'), { scaleX: 0, transformOrigin: '0% 50%', duration: 0.4, stagger: 0.08 }, 1.15)
    .add(drawInk(gsap, q('.st-ticks path'), { duration: 0.25, stagger: 0.14 }), 1.45);
  return tl;
}

/* Align: two lopsided blocks balance on a scale. */
function align(gsap, el) {
  const q = gsap.utils.selector(el);
  hideInk(gsap, q('.sa-tick'));
  const tl = gsap.timeline({ defaults: { ease: EASE.out } });
  gsap.set(q('.sa-beam'), { rotation: -14, svgOrigin: '120 99' });
  gsap.set(q('.sa-left'), { scale: 1.32, transformOrigin: '50% 100%' });
  gsap.set(q('.sa-right'), { scale: 0.7, transformOrigin: '50% 100%' });
  tl.from(q('.sa-plan'), { y: -80, opacity: 0, duration: 0.5, ease: 'power2.in' }, 0.25)
    .fromTo(q('.sa-plan'), { scaleY: 1 }, { scaleY: 0.82, scaleX: 1.1, transformOrigin: '50% 100%', duration: 0.08, yoyo: true, repeat: 1 }, 0.75)
    .to(q('.sa-left, .sa-right'), { scale: 1, duration: 0.7, ease: EASE.spring }, 0.8)
    .to(q('.sa-beam'), { rotation: 0, duration: 0.9, ease: 'elastic.out(1, 0.55)' }, 0.8)
    .add(drawInk(gsap, q('.sa-tick'), { duration: 0.4 }), 1.55);
  return tl;
}

/* Ship: a box gets sealed and launched. */
function ship(gsap, el) {
  const q = gsap.utils.selector(el);
  hideInk(gsap, q('.ss-lines path'));
  const tl = gsap.timeline({ defaults: { ease: EASE.out } });
  gsap.set(q('.ss-box'), { y: 14 });
  gsap.set(q('.ss-lid'), { rotation: -38, svgOrigin: '74 61' });
  gsap.set(q('.ss-tape'), { scaleY: 0, svgOrigin: '120 50' });
  gsap.set(q('.ss-stamp'), { scale: 0, rotation: -40, svgOrigin: '120 96' });
  tl.from(q('.ss-item'), { y: -60, opacity: 0, duration: 0.45, ease: 'power2.in', stagger: 0.12 }, 0.1)
    .to(q('.ss-lid'), { rotation: 0, duration: 0.45, ease: EASE.spring }, 0.8)
    .to(q('.ss-tape'), { scaleY: 1, duration: 0.3 }, 1.15)
    .to(q('.ss-stamp'), { scale: 1, rotation: 0, duration: 0.45, ease: 'back.out(2.2)' }, 1.4)
    .to(q('.ss-box'), { y: 0, duration: 0.5, ease: 'power2.out' }, 1.8)
    .add(drawInk(gsap, q('.ss-lines path'), { duration: 0.35, stagger: 0.06 }), 1.85);
  return tl;
}

const SCENES = { translate, align, ship };

export function initWhatIDo() {
  document.querySelectorAll('[data-scene="translate"], [data-scene="align"], [data-scene="ship"]').forEach((el) => {
    createScene(el, { build: SCENES[el.dataset.scene], start: 'top 82%' });
  });
}
