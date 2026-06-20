/* =========================================================
   Kalzang — Program Manager · Portfolio
   Shared behaviour for index.html and about.html.
   Every block guards on element existence, so it's safe
   to load the same file on both pages.
   ========================================================= */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Mobile nav toggle ---------- */
  (function () {
    const nav = document.getElementById('siteNav');
    const toggle = document.getElementById('navToggle');
    if (!nav || !toggle) return;
    toggle.addEventListener('click', () => nav.classList.toggle('open'));
    nav.querySelectorAll('.navlinks a').forEach((a) =>
      a.addEventListener('click', () => nav.classList.remove('open'))
    );
  })();

  /* ---------- Scroll reveal ---------- */
  (function () {
    const reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('in');
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15 }
      );
      reveals.forEach((el) => io.observe(el));
    } else {
      reveals.forEach((el) => el.classList.add('in'));
    }
  })();

  /* ---------- Cute mouse-pointer trail ---------- */
  (function () {
    if (prefersReducedMotion) return;
    const glyphs = ['✨', '🌸', '⭐', '💫', '🌼'];
    let last = 0;
    window.addEventListener('mousemove', (e) => {
      const now = Date.now();
      if (now - last < 40) return; // throttle so it stays light
      last = now;
      const s = document.createElement('span');
      s.className = 'trail';
      s.textContent = glyphs[(Math.random() * glyphs.length) | 0];
      s.style.left = e.clientX + 'px';
      s.style.top = e.clientY + 'px';
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 850);
    });
  })();

  /* ---------- Dismissible sticker ---------- */
  (function () {
    const sticker = document.getElementById('sticker');
    const close = document.getElementById('stickerClose');
    if (!sticker || !close) return;
    close.addEventListener('click', () => sticker.remove());
  })();

  /* ---------- Game 1: Cross the bridge (timing) ---------- */
  (function () {
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

    function buildDots() {
      dotsWrap.innerHTML = '';
      for (let i = 0; i < totalPlanks; i++) {
        const d = document.createElement('span');
        d.className = 'bg-dot';
        dotsWrap.appendChild(d);
      }
    }
    function updateDots() {
      dotsWrap.querySelectorAll('.bg-dot').forEach((d, i) =>
        d.classList.toggle('filled', i < planks)
      );
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
    function loop() {
      pos += dir * speed;
      if (pos >= 1) { pos = 1; dir = -1; }
      if (pos <= 0) { pos = 0; dir = 1; }
      marker.style.left = pos * 100 + '%';
      rafId = requestAnimationFrame(loop);
    }
    function start() {
      planks = 0; lives = 3; pos = 0; dir = 1;
      buildDots(); updateDots(); setZone();
      status.textContent = heartsStr(lives) + ' · Planks: 0/8';
      playBtn.style.display = 'inline-flex'; playBtn.disabled = false;
      resetBtn.style.display = 'none';
      if (rafId) cancelAnimationFrame(rafId);
      loop();
    }
    playBtn.addEventListener('click', () => {
      const hit = pos >= zoneStart && pos <= zoneStart + zoneWidth;
      if (hit) {
        planks++;
        updateDots();
        if (planks >= totalPlanks) {
          status.textContent = 'You shipped it! Bridge complete 🎉';
          cancelAnimationFrame(rafId);
          playBtn.style.display = 'none';
          resetBtn.style.display = 'inline-flex';
          return;
        }
        setZone();
        status.textContent = heartsStr(lives) + ' · Planks: ' + planks + '/8';
      } else {
        lives--;
        if (lives <= 0) {
          status.textContent = 'Out of tries — try again?';
          cancelAnimationFrame(rafId);
          playBtn.style.display = 'none';
          resetBtn.style.display = 'inline-flex';
        } else {
          status.textContent = heartsStr(lives) + ' · Planks: ' + planks + '/8';
        }
      }
    });
    resetBtn.addEventListener('click', start);
    start();
  })();

  /* ---------- Game 2: Spec it! (memory matching) ---------- */
  (function () {
    const grid = document.getElementById('memGrid');
    const statsEl = document.getElementById('memStats');
    const resetBtn = document.getElementById('memReset');
    if (!grid) return;

    const pairs = [
      ['"Make it pop."', 'Increase contrast + add micro-animation on the primary CTA'],
      ['"Can we have AI in it?"', 'Scope one ML feature with a clear success metric'],
      ['"This should be quick."', 'Estimate: 2 sprints, pending API access'],
      ['"Make it scalable."', 'Define expected load, design for 10x growth'],
      ['"Just a small tweak."', 'New ticket: scope, acceptance criteria, QA pass'],
      ['"Make it look premium."', 'Refine type, spacing, and motion polish'],
    ];

    let flipped = [], matchedCount = 0, moves = 0, lock = false;

    function shuffle(arr) {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    }

    function build() {
      flipped = []; matchedCount = 0; moves = 0; lock = false;
      statsEl.textContent = 'Moves: 0';
      let deck = [];
      pairs.forEach((p, i) => {
        deck.push({ text: p[0], pair: i });
        deck.push({ text: p[1], pair: i });
      });
      deck = shuffle(deck);
      grid.innerHTML = '';
      deck.forEach((d) => {
        const el = document.createElement('button');
        el.className = 'mem-card';
        el.type = 'button';
        el.setAttribute('aria-label', 'Flip card');
        el.dataset.pair = d.pair;
        const front = document.createElement('span');
        front.className = 'mem-face mem-front';
        front.textContent = '?';
        const back = document.createElement('span');
        back.className = 'mem-face mem-back';
        back.textContent = d.text;
        el.appendChild(front);
        el.appendChild(back);
        el.addEventListener('click', onFlip);
        grid.appendChild(el);
      });
    }

    function onFlip(e) {
      if (lock) return;
      const el = e.currentTarget;
      if (el.classList.contains('flipped') || el.classList.contains('matched')) return;
      el.classList.add('flipped');
      flipped.push(el);
      if (flipped.length === 2) {
        moves++;
        statsEl.textContent = 'Moves: ' + moves;
        lock = true;
        const [a, b] = flipped;
        if (a.dataset.pair === b.dataset.pair) {
          a.classList.add('matched'); b.classList.add('matched');
          matchedCount++;
          flipped = []; lock = false;
          if (matchedCount === pairs.length) {
            statsEl.textContent = 'Solved in ' + moves + ' moves 🎉';
          }
        } else {
          setTimeout(() => {
            a.classList.remove('flipped'); b.classList.remove('flipped');
            flipped = []; lock = false;
          }, 700);
        }
      }
    }

    resetBtn.addEventListener('click', build);
    build();
  })();

  /* ---------- Game 3: Backlog Arcade (falling catch) ---------- */
  (function () {
    const stage = document.getElementById('arStage');
    const basket = document.getElementById('arBasket');
    const overlay = document.getElementById('arOverlay');
    const startBtn = document.getElementById('arStart');
    const leftBtn = document.getElementById('arLeft');
    const rightBtn = document.getElementById('arRight');
    const scoreEl = document.getElementById('arScore');
    const moraleEl = document.getElementById('arMorale');
    if (!stage) return;

    const TYPES = [
      { icon: '✨', label: 'Feature', good: true },
      { icon: '🧋', label: 'Boba Tea', good: true },
      { icon: '📝', label: 'Clear Spec', good: true },
      { icon: '👾', label: 'Scope Creep', good: false },
      { icon: '🐛', label: 'Prod Bug', good: false },
    ];

    let basketX = 50;      // percent
    let score = 0, morale = 100;
    let items = [];        // {el, x, y, good}
    let running = false, over = false;
    let lastSpawn = 0, lastTick = 0, rafId = null;

    function setBasket() { basket.style.left = basketX + '%'; }
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
      el.style.left = x + '%';
      el.style.top = '0%';
      stage.appendChild(el);
      items.push({ el, x, y: 0, good: t.good });
    }

    function endGame(won) {
      over = true; running = false;
      if (rafId) cancelAnimationFrame(rafId);
      items.forEach((it) => it.el.remove());
      items = [];
      overlay.className = 'arcade-overlay gameover';
      overlay.innerHTML =
        '<span class="big">' + (won ? '🎉' : '📉') + '</span>' +
        '<h4 style="color:var(--marigold)">' +
        (won ? 'Sprint completed!' : 'Sprint cancelled!') + '</h4>' +
        '<p>' + (won
          ? 'You aligned requirements smoothly and shipped the roadmap on time. Ship it! 🚀'
          : 'Scope creep overwhelmed the team and morale hit zero. Happens to the best of us.') +
        '</p>';
      const again = document.createElement('button');
      again.className = 'btn btn-primary';
      again.type = 'button';
      again.textContent = 'Try another sprint';
      again.addEventListener('click', startGame);
      overlay.appendChild(again);
      overlay.style.display = 'flex';
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
        it.el.style.top = it.y + '%';

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
      over = false; running = true;
      lastSpawn = 0; lastTick = 0;
      setHud(); setBasket();
      overlay.style.display = 'none';
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(tick);
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
  })();

  /* ---------- About: Guess my priority ---------- */
  (function () {
    const input = document.getElementById('prioInput');
    const btn = document.getElementById('prioBtn');
    const out = document.getElementById('prioOut');
    if (!btn) return;
    const good = ['clarity', 'communication', 'alignment', 'context'];
    function check() {
      const v = (input.value || '').trim().toLowerCase();
      if (!v) {
        out.textContent = 'Go on, take a guess! 🌸';
      } else if (good.includes(v)) {
        out.textContent = '✨ Exactly! You clearly get it.';
      } else {
        out.textContent = '“' + v + '” is a cute guess — but mine is “clarity”. 💡';
      }
      out.classList.add('show');
    }
    btn.addEventListener('click', check);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') check(); });
  })();

  /* ---------- About: Fortune petal ---------- */
  (function () {
    const btn = document.getElementById('petalBtn');
    const out = document.getElementById('petalOut');
    if (!btn) return;
    const fortunes = [
      'Small rituals create big outcomes. 🌱',
      'Write it down before repeating it. 📝',
      'Alignment beats heroics. 🤝',
      'Kindness scales surprisingly well. 💗',
      'Clarity is a gift you give the whole team. ✨',
      'A good question saves a week of building. ❓',
    ];
    let lastIdx = -1;
    btn.addEventListener('click', () => {
      let idx;
      do { idx = (Math.random() * fortunes.length) | 0; }
      while (fortunes.length > 1 && idx === lastIdx);
      lastIdx = idx;
      out.textContent = fortunes[idx];
      out.classList.add('show');
    });
  })();

  /* ---------- About: Stakeholder translator ---------- */
  (function () {
    const btn = document.getElementById('transBtn');
    const out = document.getElementById('transOut');
    if (!btn) return;
    const msgs = [
      'Engineer: “We reduced latency by 30%.” → Business: “Users will feel a noticeably faster product.”',
      'Engineer: “We fixed the race conditions.” → Business: “The platform is now more reliable under load.”',
      'Engineer: “Refactor complete.” → Business: “Future features can ship more quickly.”',
      'Engineer: “We added caching.” → Business: “Pages load instantly for returning users.”',
      'Engineer: “We need to pay down tech debt.” → Business: “A short cleanup now keeps us fast for the next year.”',
    ];
    let lastIdx = -1;
    btn.addEventListener('click', () => {
      let idx;
      do { idx = (Math.random() * msgs.length) | 0; }
      while (msgs.length > 1 && idx === lastIdx);
      lastIdx = idx;
      out.textContent = msgs[idx];
      out.classList.add('show');
    });
  })();

  /* ---------- About: Translation Station toggle ---------- */
  (function () {
    const list = document.getElementById('tsList');
    const humanBtn = document.getElementById('tsHuman');
    const techBtn = document.getElementById('tsTech');
    if (!list || !humanBtn || !techBtn) return;

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

    let tech = false;
    function render() {
      list.innerHTML = '';
      projects.forEach((p) => {
        const card = document.createElement('div');
        card.className = 'ts-card reveal in' + (tech ? ' tech' : '');
        const h = document.createElement('h3');
        h.textContent = p.title;
        const para = document.createElement('p');
        para.textContent = tech ? p.tech : p.human;
        card.appendChild(h);
        card.appendChild(para);
        list.appendChild(card);
      });
    }
    humanBtn.addEventListener('click', () => {
      tech = false;
      humanBtn.classList.add('active');
      techBtn.classList.remove('active');
      render();
    });
    techBtn.addEventListener('click', () => {
      tech = true;
      techBtn.classList.add('active');
      humanBtn.classList.remove('active');
      render();
    });
    render();
  })();
})();
