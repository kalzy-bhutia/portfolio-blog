/* About: Translation Station. Same three projects, told two ways.
   The toggle crossfades between versions (instant with reduced motion). */

import { reducedMotion } from '../motion/tokens.js';

const projects = [
  {
    title: '🚀 Project Smooth Checkout',
    human: 'Fixed the behind-the-scenes checkout plumbing so customers can buy their goodies seamlessly — no more frozen or crashing pages.',
    tech: 'Orchestrated a refactor of legacy payment-gateway microservices to handle concurrent async webhooks, cutting 504 gateway timeouts by 42%.',
  },
  {
    title: '📊 Dashboard Evolution 2.0',
    human: 'Guided a big, complex data upgrade smoothly without breaking anything — business teams now get their daily reports 5x faster.',
    tech: 'Managed migration of an on-prem monolithic data pipeline to a containerized cloud architecture, holding 99.9% uptime across 4 parallel sprints.',
  },
  {
    title: '🤖 The "Add AI" Initiative',
    human: 'Turned a vague "can we add AI?" into one genuinely useful feature people actually wanted — shipped on the original deadline.',
    tech: 'Scoped a single ML capability with a measurable success metric, ran discovery, wrote the spec, and negotiated achievable scope cuts.',
  },
];

export function init() {
  const list = document.getElementById('tsList');
  const humanBtn = document.getElementById('tsHuman');
  const techBtn = document.getElementById('tsTech');
  if (!list || !humanBtn || !techBtn) return;

  let tech = false;
  function render() {
    list.replaceChildren(...projects.map((p) => {
      const card = document.createElement('div');
      card.className = 'ts-card' + (tech ? ' tech' : '');
      const h = document.createElement('h3');
      h.textContent = p.title;
      const para = document.createElement('p');
      para.textContent = tech ? p.tech : p.human;
      card.append(h, para);
      return card;
    }));
  }
  function setMode(isTech) {
    if (isTech === tech) return;
    tech = isTech;
    humanBtn.setAttribute('aria-pressed', String(!tech));
    techBtn.setAttribute('aria-pressed', String(tech));
    if (reducedMotion() || !list.animate) { render(); return; }
    list.animate([{ opacity: 1 }, { opacity: 0, transform: 'translateY(4px)' }], { duration: 140, easing: 'ease-in' })
      .onfinish = () => {
        render();
        list.animate([{ opacity: 0, transform: 'translateY(4px)' }, { opacity: 1, transform: 'none' }], { duration: 240, easing: 'cubic-bezier(.2,.8,.2,1)' });
      };
  }
  humanBtn.addEventListener('click', () => setMode(false));
  techBtn.addEventListener('click', () => setMode(true));
  render();
}
