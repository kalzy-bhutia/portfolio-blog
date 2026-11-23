/* Entry point for both pages. Each feature guards on its own markup,
   so this one file is safe everywhere. Games load only when the Play
   section gets close to the viewport. */

import { initNav } from './ui/nav.js';
import { initReveals } from './motion/reveal.js';
import { initSpringCards } from './motion/spring-card.js';
import { onceVisible } from './motion/scroll-scene.js';
import { initEasterEgg } from './ui/easter-egg.js';
import { initContact } from './scenes/contact-pop.js';
import { initHero } from './scenes/hero-intro.js';
import { initWhatIDo } from './scenes/what-i-do.js';
import { initCaseFilms } from './scenes/case-film.js';
import { initToolkitTray } from './scenes/toolkit-tray.js';

window.__kReady = true;

initHero();
initNav();
initReveals();
initSpringCards();
initWhatIDo();
initCaseFilms();
initToolkitTray();
initContact();
initEasterEgg();

const lazy = [
  ['bgTrack', () => import('./games/bridge.js')],
  ['memGrid', () => import('./games/spec-it.js')],
  ['arStage', () => import('./games/arcade.js')],
  ['tsList', () => import('./about/translation-station.js')],
  ['prioBtn', () => import('./about/tiny-games.js')],
];
lazy.forEach(([id, load]) => {
  const el = document.getElementById(id);
  if (!el) return;
  onceVisible(el, () => load().then((m) => m.init()), { threshold: 0, rootMargin: '600px 0px' });
});
