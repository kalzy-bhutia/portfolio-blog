/* Reveal: the quiet, consistent entrance used outside the signature
   scenes. Elements with [data-reveal] fade and lift once, never
   re-hide. Siblings inside the same parent stagger by --i.
   Hidden states only exist under html.motion (see base.css). */

export function initReveals(root = document) {
  const els = [...root.querySelectorAll('[data-reveal]')];
  if (!els.length) return;
  const html = document.documentElement;
  if (!html.classList.contains('motion') || !('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('is-in'));
    return;
  }
  const siblingsIndex = new Map();
  els.forEach((el) => {
    const parent = el.parentElement;
    const i = siblingsIndex.get(parent) || 0;
    siblingsIndex.set(parent, i + 1);
    if (i) el.style.setProperty('--i', String(Math.min(i, 5)));
  });
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  els.forEach((el) => io.observe(el));
}
