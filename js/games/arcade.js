/* Game 3: Backlog Arcade (falling catch).
   Same item types, spawn rate, fall speed, catch window, scoring and
   win/lose rules as the original. Items and the basket now move with
   transform (same percentage maths, converted to pixels). */

const TYPES = [
  { icon: '✨', label: 'Feature', good: true },
  { icon: '🧋', label: 'Boba Tea', good: true },
  { icon: '📝', label: 'Clear Spec', good: true },
  { icon: '👾', label: 'Scope Creep', good: false },
  { icon: '🐛', label: 'Prod Bug', good: false },
];

export function init() {
  const stage = document.getElementById('arStage');
  const basket = document.getElementById('arBasket');
  const overlay = document.getElementById('arOverlay');
  const startBtn = document.getElementById('arStart');
  const leftBtn = document.getElementById('arLeft');
  const rightBtn = document.getElementById('arRight');
  const scoreEl = document.getElementById('arScore');
  const moraleEl = document.getElementById('arMorale');
  if (!stage) return;

  let basketX = 50;      // percent
  let score = 0, morale = 100;
  let items = [];        // {el, x, y, good}
  let running = false;
  let lastSpawn = 0, lastTick = 0, rafId = null;
  let W = stage.clientWidth, H = stage.clientHeight;

  if ('ResizeObserver' in window) {
    new ResizeObserver(() => {
      W = stage.clientWidth; H = stage.clientHeight;
      setBasket();
      items.forEach(placeItem);
    }).observe(stage);
  }

  function setBasket() { basket.style.transform = `translate3d(${(basketX / 100) * W}px, 0, 0)`; }
  function placeItem(it) {
    it.el.style.transform = `translate3d(${(it.x / 100) * W}px, ${(it.y / 100) * H}px, 0) translate(-50%, -50%)`;
  }
  function setHud() {
    scoreEl.textContent = score;
    moraleEl.textContent = Math.max(morale, 0);
  }

  function spawn() {
    const t = TYPES[(Math.random() * TYPES.length) | 0];
    const el = document.createElement('div');
    el.className = 'arcade-item';
    const ico = document.createElement('span');
    ico.className = 'ico';
    ico.textContent = t.icon;
    const lbl = document.createElement('span');
    lbl.className = 'lbl';
    lbl.textContent = t.label;
    el.appendChild(ico);
    el.appendChild(lbl);
    const x = Math.floor(Math.random() * 85) + 5;
    const it = { el, x, y: 0, good: t.good };
    placeItem(it);
    stage.appendChild(el);
    items.push(it);
  }

  function endGame(won) {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    items.forEach((it) => it.el.remove());
    items = [];
    overlay.className = 'arcade-overlay gameover';
    overlay.replaceChildren();
    const big = document.createElement('span');
    big.className = 'big';
    big.setAttribute('aria-hidden', 'true');
    big.textContent = won ? '🎉' : '📉';
    const h = document.createElement('h4');
    h.textContent = won ? 'Sprint completed!' : 'Sprint cancelled!';
    const p = document.createElement('p');
    p.textContent = won
      ? 'You aligned requirements smoothly and shipped the roadmap on time. Ship it! 🚀'
      : 'Scope creep overwhelmed the team and morale hit zero. Happens to the best of us.';
    const again = document.createElement('button');
    again.className = 'btn btn-primary btn-sm';
    again.type = 'button';
    again.textContent = 'Try another sprint';
    again.addEventListener('click', startGame);
    overlay.append(big, h, p, again);
    overlay.hidden = false;
    again.focus();
  }

  function tick(ts) {
    if (!running) return;
    if (!lastTick) lastTick = ts;
    const dt = ts - lastTick;
    lastTick = ts;

    // spawn roughly every 1.1s
    if (ts - lastSpawn > 1100) { spawn(); lastSpawn = ts; }

    const fall = dt * 0.022; // percent per ms-ish
    for (let i = items.length - 1; i >= 0; i--) {
      const it = items[i];
      it.y += fall;
      placeItem(it);

      if (it.y >= 80 && it.y <= 92) {
        if (Math.abs(it.x - basketX) <= 13) {
          if (it.good) {
            score += 10;
            if (score >= 100) { score = 100; setHud(); it.el.remove(); items.splice(i, 1); endGame(true); return; }
          } else {
            morale -= 20;
            if (morale <= 0) { morale = 0; setHud(); it.el.remove(); items.splice(i, 1); endGame(false); return; }
          }
          setHud();
          it.el.remove();
          items.splice(i, 1);
          continue;
        }
      }
      if (it.y > 104) { it.el.remove(); items.splice(i, 1); }
    }
    rafId = requestAnimationFrame(tick);
  }

  function startGame() {
    score = 0; morale = 100; basketX = 50;
    items.forEach((it) => it.el.remove());
    items = [];
    running = true;
    lastSpawn = 0; lastTick = 0;
    W = stage.clientWidth; H = stage.clientHeight;
    setHud(); setBasket();
    overlay.hidden = true;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(tick);
    leftBtn.focus({ preventScroll: true });
  }

  function moveLeft() { if (running) { basketX = Math.max(5, basketX - 9); setBasket(); } }
  function moveRight() { if (running) { basketX = Math.min(95, basketX + 9); setBasket(); } }

  startBtn.addEventListener('click', startGame);
  leftBtn.addEventListener('click', moveLeft);
  rightBtn.addEventListener('click', moveRight);
  window.addEventListener('keydown', (e) => {
    if (!running) return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); moveLeft(); }
    if (e.key === 'ArrowRight') { e.preventDefault(); moveRight(); }
  });
  setBasket();
}
