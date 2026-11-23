/* Hero intro: chaos -> clarity, about 3 s, once per session.
   - Headline and buttons reveal in CSS from first paint, readable by ~0.8 s.
   - Any click, scroll, wheel, touch or key press jumps to the end.
   - The final layout is plain CSS, so no-JS and reduced motion get
     the finished bridge with no animation.
   Retime: edit the positions passed to tl.to() below.
   Disable: delete the `intro` class logic in the <head> boot script. */

import { getGsap, reducedMotion, finePointer, wideScreen, DUR, EASE } from '../motion/tokens.js';
import { hideInk, drawInk } from '../motion/animated-underline.js';
import { popBadges } from '../motion/floating-badge.js';

const SEEN_KEY = 'k:intro';

/* Where each object starts, in the stage's 500px design space:
   [dx, dy, rotation]. Final positions come from CSS. */
const CHAOS = {
  l1: [60, -210, 24], l2: [250, -40, -32], r1: [-230, -170, -18], r2: [-40, 30, 40],
  dl: [-100, -150, 50], dr: [80, 90, -60], key: [120, -170, 70], v1: [-150, 170, -24],
  note: [180, 190, 30], bubble: [-230, 150, -20], bug: [-120, -230, 0],
};
const SORT_ORDER = ['l1', 'r1', 'l2', 'r2', 'dl', 'dr', 'note', 'bubble'];
const REST_ROTATION = { note: -6 };

export function initHero() {
  const html = document.documentElement;
  const stage = document.getElementById('heroStage');
  if (!stage) return;
  const gsap = getGsap();
  window.__kIntro = true;
  const shouldPlay = html.classList.contains('intro') && window.scrollY < 40;
  if (!gsap || reducedMotion() || !shouldPlay) {
    html.classList.remove('intro');
  } else {
    runIntro(gsap, stage);
  }
  if (gsap && !reducedMotion()) initRestState(gsap, stage);
}

function runIntro(gsap, stage) {
  const html = document.documentElement;
  const hero = stage.closest('.hero');
  const pills = hero.querySelectorAll('.maker-pill');
  const under = hero.querySelectorAll('.ink-word .ink-path');
  const sparkle = hero.querySelectorAll('.ink-sparkle .ink-path');
  const ticks = stage.querySelectorAll('.hero-ticks .ink-path');
  const thread = stage.querySelector('.hero-thread');
  const skip = document.getElementById('introSkip');
  const objs = {};
  stage.querySelectorAll('[data-obj]').forEach((el) => { objs[el.dataset.obj] = el; });
  const u = stage.clientWidth / 500;

  // Start states. Inline styles win over the .intro hold, then we drop it.
  objs.bug.hidden = false;
  gsap.set(pills, { opacity: 0 });
  hideInk(gsap, [...under, ...sparkle, ...ticks]);
  Object.entries(CHAOS).forEach(([k, [dx, dy, r]]) => {
    if (objs[k]) gsap.set(objs[k], { x: dx * u, y: dy * u, rotation: r, scale: 0.5, opacity: 0 });
  });
  gsap.set(thread, { opacity: 1 });
  hideInk(gsap, thread.querySelector('path'));
  html.classList.remove('intro');

  const tl = gsap.timeline({ defaults: { ease: EASE.out }, onComplete: finish });

  // The words reveal in CSS from first paint (see .intro-text in sections.css).

  // the mess pops in, a tangled thread scribbles through it
  tl.to(Object.values(objs), { scale: 1, opacity: 1, duration: DUR.md, ease: EASE.spring, stagger: 0.03 }, 0)
    .add(drawInk(gsap, thread.querySelector('path'), { duration: 0.5, ease: 'power1.inOut' }), 0.05)
    .to(thread, { opacity: 0, duration: 0.4 }, 0.9);

  // pieces sort themselves into piers, deck and labels
  SORT_ORDER.forEach((k, i) => {
    tl.to(objs[k], { x: 0, y: 0, rotation: REST_ROTATION[k] || 0, duration: 0.7, ease: EASE.spring }, 0.65 + i * 0.09);
  });

  // the stray bug gets out of the way
  tl.to(objs.bug, { x: 380 * u, y: 120 * u, rotation: 25, duration: 0.8, ease: 'power2.in' }, 1.05)
    .to(objs.bug, { opacity: 0, duration: 0.2 }, 1.7);

  // the keystone closes the gap, the v1 box lands on top
  tl.to(objs.key, { x: 0, y: -40 * u, rotation: 0, duration: 0.45 }, 1.5)
    .to(objs.key, { y: 0, duration: 0.24, ease: 'power2.in' }, 1.98)
    .to(objs.key, { scaleY: 0.86, scaleX: 1.08, transformOrigin: '50% 100%', duration: 0.08, yoyo: true, repeat: 1 }, 2.22)
    .add(drawInk(gsap, ticks, { duration: 0.3, stagger: 0.05 }), 2.26)
    .to(objs.v1, { x: 0, y: 0, rotation: 0, duration: 0.6, ease: EASE.spring }, 2.15);

  // ink signs it off
  tl.add(drawInk(gsap, under, { duration: 0.55 }), 2.55)
    .add(drawInk(gsap, sparkle, { duration: 0.28, stagger: 0.06 }), 2.95);
  popBadges(gsap, pills, 2.6, tl);

  const skipNow = () => { if (tl.progress() < 1) tl.progress(1); };
  const events = ['pointerdown', 'wheel', 'touchstart', 'keydown', 'scroll'];
  events.forEach((ev) => window.addEventListener(ev, skipNow, { passive: true }));
  skip.hidden = false;
  skip.addEventListener('click', skipNow);

  function finish() {
    try { sessionStorage.setItem(SEEN_KEY, '1'); } catch (e) { /* storage blocked: intro may replay */ }
    events.forEach((ev) => window.removeEventListener(ev, skipNow));
    objs.bug.hidden = true;
    gsap.set(thread, { opacity: 0 });
    if (skip.contains(document.activeElement)) document.querySelector('.hero .btn-primary')?.focus();
    skip.hidden = true;
  }
}

/* Resting state: a soft parallax and a small wiggle on hover.
   Desktop with a fine pointer only. The bridge moves as one piece
   so it never looks broken; loose objects move a little more. */
function initRestState(gsap, stage) {
  if (!finePointer() || !wideScreen()) return;
  const hero = stage.closest('.hero');
  const depthOf = (name) => ({ note: 14, bubble: 14, v1: 10 }[name] || 6);
  const layers = [...stage.querySelectorAll('[data-obj]')].map((obj) => {
    const svg = obj.querySelector('svg');
    return {
      depth: depthOf(obj.dataset.obj),
      x: gsap.quickTo(svg, 'x', { duration: 0.9, ease: 'power3.out' }),
      y: gsap.quickTo(svg, 'y', { duration: 0.9, ease: 'power3.out' }),
    };
  });
  hero.addEventListener('pointermove', (e) => {
    const r = hero.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    layers.forEach((l) => { l.x(-px * l.depth); l.y(-py * l.depth); });
  });
  hero.addEventListener('pointerleave', () => layers.forEach((l) => { l.x(0); l.y(0); }));
  stage.querySelectorAll('.o-note, .o-bubble, .o-v1').forEach((obj) => {
    obj.addEventListener('pointerenter', () => {
      gsap.to(obj.querySelector('svg'), { keyframes: { rotation: [0, -6, 4, -2, 0] }, duration: 0.55, ease: 'none' });
    });
  });
}
