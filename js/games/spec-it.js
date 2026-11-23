/* Game 2: Spec it! (memory matching).
   Same pairs, rules and timings as the original. Adds readable
   labels for screen readers as cards turn over. */

const pairs = [
  ['"Make it pop."', 'Increase contrast + add micro-animation on the primary CTA'],
  ['"Can we have AI in it?"', 'Scope one ML feature with a clear success metric'],
  ['"This should be quick."', 'Estimate: 2 sprints, pending API access'],
  ['"Make it scalable."', 'Define expected load, design for 10x growth'],
  ['"Just a small tweak."', 'New ticket: scope, acceptance criteria, QA pass'],
  ['"Make it look premium."', 'Refine type, spacing, and motion polish'],
];

export function init() {
  const grid = document.getElementById('memGrid');
  const statsEl = document.getElementById('memStats');
  const resetBtn = document.getElementById('memReset');
  if (!grid) return;

  let flipped = [], matchedCount = 0, moves = 0, lock = false;

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
  const faceDown = (el) => el.setAttribute('aria-label', 'Card ' + el.dataset.n + ', face down');

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
    deck.forEach((d, idx) => {
      const el = document.createElement('button');
      el.className = 'mem-card';
      el.type = 'button';
      el.dataset.pair = d.pair;
      el.dataset.n = idx + 1;
      el.dataset.text = d.text;
      faceDown(el);
      const front = document.createElement('span');
      front.className = 'mem-face mem-front';
      front.setAttribute('aria-hidden', 'true');
      front.textContent = '?';
      const back = document.createElement('span');
      back.className = 'mem-face mem-back';
      back.setAttribute('aria-hidden', 'true');
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
    el.setAttribute('aria-label', el.dataset.text);
    flipped.push(el);
    if (flipped.length === 2) {
      moves++;
      statsEl.textContent = 'Moves: ' + moves;
      lock = true;
      const [a, b] = flipped;
      if (a.dataset.pair === b.dataset.pair) {
        a.classList.add('matched'); b.classList.add('matched');
        a.setAttribute('aria-label', a.dataset.text + ', matched');
        b.setAttribute('aria-label', b.dataset.text + ', matched');
        matchedCount++;
        flipped = []; lock = false;
        if (matchedCount === pairs.length) {
          statsEl.textContent = 'Solved in ' + moves + ' moves 🎉';
        }
      } else {
        setTimeout(() => {
          a.classList.remove('flipped'); b.classList.remove('flipped');
          faceDown(a); faceDown(b);
          flipped = []; lock = false;
        }, 700);
      }
    }
  }

  resetBtn.addEventListener('click', build);
  build();
}
