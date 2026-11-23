/* Easter egg: a pokeable, draggable clay sticky note in the footer.
   Poke (click, Enter, Space) to squish it. Drag it, or nudge it with
   the arrow keys. It stays inside its desk and never covers content. */

import { reducedMotion } from '../motion/tokens.js';

export function initEasterEgg() {
  const note = document.getElementById('pokeNote');
  if (!note) return;
  const desk = note.parentElement;
  let x = 0, y = 0, startX = 0, startY = 0, originX = 0, originY = 0;
  let dragging = false, moved = false;

  const place = () => { note.style.translate = `${x}px ${y}px`; };
  const clamp = () => {
    const d = desk.getBoundingClientRect();
    const n = note.getBoundingClientRect();
    const baseLeft = n.left - d.left - x;
    const baseTop = n.top - d.top - y;
    x = Math.min(Math.max(x, -baseLeft + 6), d.width - n.width - baseLeft - 6);
    y = Math.min(Math.max(y, -baseTop + 6), d.height - n.height - baseTop - 6);
  };

  const squish = () => {
    if (reducedMotion() || !note.animate) return;
    note.animate([
      { scale: '1 1' }, { scale: '1.12 .84' }, { scale: '.94 1.08' }, { scale: '1.03 .98' }, { scale: '1 1' },
    ], { duration: 520, easing: 'ease-out' });
  };

  note.addEventListener('pointerdown', (e) => {
    dragging = true; moved = false;
    startX = e.clientX; startY = e.clientY; originX = x; originY = y;
    note.setPointerCapture(e.pointerId);
  });
  note.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX, dy = e.clientY - startY;
    if (!moved && Math.hypot(dx, dy) < 4) return;
    moved = true;
    x = originX + dx; y = originY + dy;
    clamp(); place();
  });
  const end = () => { dragging = false; };
  note.addEventListener('pointerup', end);
  note.addEventListener('pointercancel', end);
  note.addEventListener('click', (e) => {
    if (moved) { e.preventDefault(); moved = false; return; }
    squish();
  });
  note.addEventListener('keydown', (e) => {
    const step = e.shiftKey ? 32 : 12;
    const dir = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key];
    if (!dir) return;
    e.preventDefault();
    x += dir[0]; y += dir[1];
    clamp(); place();
  });
}
