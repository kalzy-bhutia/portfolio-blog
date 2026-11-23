/* About: three tiny toys. Same answers and messages as before. */

function show(out, text) {
  out.textContent = text;
  out.hidden = false;
  out.classList.remove('pop');
  void out.offsetWidth; // restart the pop animation
  out.classList.add('pop');
}

function pickNew(list, last) {
  let idx;
  do { idx = (Math.random() * list.length) | 0; } while (list.length > 1 && idx === last);
  return idx;
}

export function init() {
  /* Guess my priority */
  const input = document.getElementById('prioInput');
  const prioBtn = document.getElementById('prioBtn');
  const prioOut = document.getElementById('prioOut');
  if (prioBtn) {
    const good = ['clarity', 'communication', 'alignment', 'context'];
    const check = () => {
      const v = (input.value || '').trim().toLowerCase();
      if (!v) show(prioOut, 'Go on, take a guess! 🌸');
      else if (good.includes(v)) show(prioOut, '✨ Exactly! You clearly get it.');
      else show(prioOut, '“' + v + '” is a cute guess — but mine is “clarity”. 💡');
    };
    prioBtn.addEventListener('click', check);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') check(); });
  }

  /* Fortune petal */
  const petalBtn = document.getElementById('petalBtn');
  const petalOut = document.getElementById('petalOut');
  if (petalBtn) {
    const fortunes = [
      'Small rituals create big outcomes. 🌱',
      'Write it down before repeating it. 📝',
      'Alignment beats heroics. 🤝',
      'Kindness scales surprisingly well. 💗',
      'Clarity is a gift you give the whole team. ✨',
      'A good question saves a week of building. ❓',
    ];
    let last = -1;
    petalBtn.addEventListener('click', () => { last = pickNew(fortunes, last); show(petalOut, fortunes[last]); });
  }

  /* Stakeholder translator */
  const transBtn = document.getElementById('transBtn');
  const transOut = document.getElementById('transOut');
  if (transBtn) {
    const msgs = [
      'Engineer: “We reduced latency by 30%.” → Business: “Users will feel a noticeably faster product.”',
      'Engineer: “We fixed the race conditions.” → Business: “The platform is now more reliable under load.”',
      'Engineer: “Refactor complete.” → Business: “Future features can ship more quickly.”',
      'Engineer: “We added caching.” → Business: “Pages load instantly for returning users.”',
      'Engineer: “We need to pay down tech debt.” → Business: “A short cleanup now keeps us fast for the next year.”',
    ];
    let last = -1;
    transBtn.addEventListener('click', () => { last = pickNew(msgs, last); show(transOut, msgs[last]); });
  }
}
