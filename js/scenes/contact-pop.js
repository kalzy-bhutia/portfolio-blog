/* Contact: the closing beat. Blocks drop onto the desk and come to
   rest, then the CTA pops. Clicking the CTA (any [data-pop]) gives a
   small sparkle burst; the mailto link still works as normal. */

import { createScene } from '../motion/scroll-scene.js';
import { reducedMotion, EASE } from '../motion/tokens.js';

function closing(gsap, el) {
  const q = gsap.utils.selector(el);
  const cta = el.closest('.contact-grid')?.querySelector('[data-pop]');
  const tl = gsap.timeline();
  tl.from(q('.desk-block'), {
      y: -170, rotation: () => gsap.utils.random(-30, 30), opacity: 0,
      duration: 0.6, ease: 'bounce.out', stagger: 0.12,
    }, 0)
    .from(q('.poke-note'), { scale: 0.6, rotation: -24, opacity: 0, duration: 0.6, ease: EASE.spring }, 0.55);
  if (cta) tl.from(cta, { scale: 0.85, duration: 0.5, ease: 'back.out(2)' }, 0.75);
  return tl;
}

const SPARK = '<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M7 1v4M7 9v4M1 7h4M9 7h4"/></svg>';

function sparkleBurst(target) {
  if (reducedMotion() || !target.animate) return;
  const r = target.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  const n = 10;
  for (let i = 0; i < n; i++) {
    const s = document.createElement('span');
    s.className = 'pop-spark';
    s.innerHTML = SPARK;
    s.style.left = `${cx - 7}px`;
    s.style.top = `${cy - 7}px`;
    document.body.appendChild(s);
    const a = (i / n) * Math.PI * 2 + Math.random() * 0.4;
    const d = r.width / 2 + 24 + Math.random() * 30;
    s.animate([
      { transform: 'translate(0,0) scale(.4) rotate(0deg)', opacity: 1 },
      { transform: `translate(${Math.cos(a) * d}px, ${Math.sin(a) * d * 0.7}px) scale(1) rotate(90deg)`, opacity: 0 },
    ], { duration: 650, easing: 'cubic-bezier(.2,.8,.2,1)' }).onfinish = () => s.remove();
  }
}

export function initContact() {
  document.querySelectorAll('[data-pop]').forEach((el) => el.addEventListener('click', () => sparkleBurst(el)));
  const desk = document.querySelector('[data-scene="contact"]');
  createScene(desk, { build: closing, start: 'top 80%' });
}
