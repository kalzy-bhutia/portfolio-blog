/* SpringCard: cards that lift and tilt slightly toward the pointer,
   then spring back. Desktop with a fine pointer only. */

import { finePointer, reducedMotion } from './tokens.js';

const MAX_TILT = 3.5; // degrees

export function initSpringCards(root = document) {
  if (!finePointer() || reducedMotion()) return;
  root.querySelectorAll('[data-spring]').forEach((card) => {
    let raf = 0;
    card.classList.add('spring-card');
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        card.style.transform =
          `perspective(900px) translateY(-6px) rotateX(${(-py * MAX_TILT).toFixed(2)}deg) rotateY(${(px * MAX_TILT).toFixed(2)}deg)`;
      });
    });
    card.addEventListener('pointerleave', () => {
      cancelAnimationFrame(raf);
      card.style.transform = '';
    });
  });
}
