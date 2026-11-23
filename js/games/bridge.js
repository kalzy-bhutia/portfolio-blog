/* Game 1: Cross the bridge (timing).
   Gameplay is unchanged from the original script.js: same speed,
   zone sizes, lives and plank count. Changes are presentation only:
   the marker moves with transform, buttons use `hidden`, and the
   loop pauses while the game is off screen. */

export function init() {
  const track = document.getElementById('bgTrack');
  const marker = document.getElementById('bgMarker');
  const zone = document.getElementById('bgZone');
  const playBtn = document.getElementById('bgPlay');
  const resetBtn = document.getElementById('bgReset');
  const status = document.getElementById('bgStatus');
  const dotsWrap = document.getElementById('bgDots');
  if (!track) return;

  const totalPlanks = 8;
  let pos = 0, dir = 1;
  const speed = 0.014;
  let planks = 0, lives = 3;
  let zoneStart = 0.4, zoneWidth = 0.22;
  let rafId = null;
  let active = false, onScreen = true;
  let trackW = track.clientWidth;

  if ('ResizeObserver' in window) new ResizeObserver(() => { trackW = track.clientWidth; drawMarker(); }).observe(track);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting;
      if (onScreen && active && !rafId) loop();
    }).observe(track);
  }

  function buildDots() {
    dotsWrap.innerHTML = '';
    for (let i = 0; i < totalPlanks; i++) {
      const d = document.createElement('span');
      d.className = 'bg-dot';
      dotsWrap.appendChild(d);
    }
  }
  function updateDots() {
    dotsWrap.querySelectorAll('.bg-dot').forEach((d, i) => d.classList.toggle('filled', i < planks));
  }
  function setZone() {
    zoneWidth = Math.max(0.22 - planks * 0.012, 0.13);
    zoneStart = Math.random() * (1 - zoneWidth);
    zone.style.left = zoneStart * 100 + '%';
    zone.style.width = zoneWidth * 100 + '%';
  }
  function heartsStr(n) {
    return '❤'.repeat(Math.max(n, 0)) + '♡'.repeat(Math.max(3 - n, 0));
  }
  function drawMarker() {
    marker.style.transform = `translate3d(${pos * trackW}px, 0, 0)`;
  }
  function loop() {
    rafId = null;
    if (!active || !onScreen) return;
    pos += dir * speed;
    if (pos >= 1) { pos = 1; dir = -1; }
    if (pos <= 0) { pos = 0; dir = 1; }
    drawMarker();
    rafId = requestAnimationFrame(loop);
  }
  function stop() {
    active = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  }
  function finishRound(message) {
    status.textContent = message;
    stop();
    playBtn.hidden = true;
    resetBtn.hidden = false;
    resetBtn.focus();
  }
  function start() {
    planks = 0; lives = 3; pos = 0; dir = 1;
    buildDots(); updateDots(); setZone();
    status.textContent = heartsStr(lives) + ' · Planks: 0/8';
    playBtn.hidden = false; playBtn.disabled = false;
    resetBtn.hidden = true;
    stop();
    active = true;
    loop();
  }
  playBtn.addEventListener('click', () => {
    const hit = pos >= zoneStart && pos <= zoneStart + zoneWidth;
    if (hit) {
      planks++;
      updateDots();
      if (planks >= totalPlanks) {
        finishRound('You shipped it! Bridge complete 🎉');
        return;
      }
      setZone();
      status.textContent = heartsStr(lives) + ' · Planks: ' + planks + '/8';
    } else {
      lives--;
      if (lives <= 0) {
        finishRound('Out of tries — try again?');
      } else {
        status.textContent = heartsStr(lives) + ' · Planks: ' + planks + '/8';
      }
    }
  });
  resetBtn.addEventListener('click', () => { start(); playBtn.focus(); });
  start();
}
