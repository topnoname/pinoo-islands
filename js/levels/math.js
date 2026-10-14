// เกาะตัวเลข (คณิตศาสตร์): นับกล้วย / ต่อแพทเทิร์น / มากกว่า น้อยกว่า
const randInt = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

// วางของแบบสุ่มในตาราง ไม่ให้ทับกัน
function scatter(n, x, y, cols, rows, cw, ch) {
  return shuffle(Array.from({ length: cols * rows }, (_, k) => k)).slice(0, n)
    .map(k => [x + (k % cols) * cw + randInt(-8, 8), y + Math.floor(k / cols) * ch + randInt(-6, 6)]);
}

// ปุ่มคำตอบตัวเลข 3 ปุ่ม
function numberChoices(ctx, answer, x, y, onPick) {
  const opts = new Set([answer]);
  while (opts.size < 3) {
    const v = answer + randInt(-2, 2);
    if (v >= 1 && v <= 10) opts.add(v);
  }
  return shuffle([...opts]).map((v, k) => {
    const b = ctx.html(`<button class="num-btn" style="left:${x}px;top:${y + k * 140}px">${v}</button>`);
    b.onclick = () => onPick(v, b);
    b.dataset.v = v;
    return b;
  });
}

LEVELS.math = [
  // ด่าน 1: นับกล้วยในตะกร้า 5 รอบ
  ctx => {
    const L = SAY.math.count;
    const N = SAY.math.numbers;
    const ranges = [[2, 4], [4, 6], [5, 7], [7, 9], [8, 10]];
    ctx.html('<div class="monkey">🐵</div>');
    ctx.html('<div class="basket-area"></div>');
    const dots = ctx.html(`<div class="round-dots math-dots">${ranges.map(() => '<span>🍌</span>').join('')}</div>`);
    let round = 0, busy = false;

    function setup() {
      ctx.play.querySelectorAll('.banana, .num-btn').forEach(e => e.remove());
      const n = randInt(...ranges[round]);
      let counted = 0;
      scatter(n, 310, 130, 5, 3, 110, 120).forEach(([x, y]) => {
        const b = ctx.html(`<div class="banana" style="left:${x}px;top:${y}px">🍌</div>`);
        b.onclick = () => {
          if (b.dataset.n) return;
          counted++;
          b.dataset.n = counted;
          b.insertAdjacentHTML('beforeend', `<b>${counted}</b>`);
          Sfx.tone(440 + counted * 40, 0, 0.12, 'triangle');
          Voice.aside(N[counted - 1]);
        };
      });
      const btns = numberChoices(ctx, n, 980, 120, (v, b) => {
        if (busy || !ctx.alive) return;
        if (v !== n) {
          b.classList.add('shake', 'faded');
          if (ctx.mistake(L.wrong)) btns.find(x => +x.dataset.v === n).classList.add('hint-glow');
          return;
        }
        busy = true;
        Sfx.yay();
        b.classList.add('correct');
        dots.children[round].classList.add('on');
        ctx.say(L.right[n - 1], () => {
          busy = false;
          if (round < ranges.length - 1) { round++; setup(); ctx.say(L.ask); return; }
          ctx.say(L.done, () => ctx.deed({
            ask: L.deedAsk,
            bad: { icon: '🫳🍌', text: 'หยิบไปกินเลย' },
            good: { icon: '🙋🍌', text: 'ขออนุญาตน้องลิงก่อน' },
            badLine: L.deedBad, goodLine: L.deedGood
          }, () => ctx.win(ctx.starsFromMistakes())));
        });
      });
    }
    setup();
    ctx.after(300, () => ctx.instruct(L.intro));
  },

  // ด่าน 2: ต่อแพทเทิร์น 5 รอบ
  ctx => {
    const L = SAY.math.pattern;
    const pools = [['🍌', '🍎', '🍇', '🍓', '🍊'], ['🔴', '🔵', '🟡', '🟢', '⭐'], ['🐵', '🐶', '🐱', '🐰', '🐻']];
    const templates = ['AB', 'AB', 'AAB', 'ABB', 'ABC'];
    const dots = ctx.html(`<div class="round-dots math-dots">${templates.map(() => '<span>⭐</span>').join('')}</div>`);
    let round = 0, busy = false;

    function setup() {
      ctx.play.querySelectorAll('.pat-card, .pat-opt').forEach(e => e.remove());
      const pool = shuffle(pools[round % pools.length]);
      const t = templates[round];
      const map = { A: pool[0], B: pool[1], C: pool[2] };
      const seq = Array.from({ length: 6 }, (_, k) => map[t[k % t.length]]);
      const answer = seq[5];
      seq.forEach((item, k) => ctx.html(`<div class="pat-card ${k === 5 ? 'missing' : ''}" style="left:${245 + k * 135}px">${k === 5 ? '❓' : item}</div>`));
      const opts = shuffle([answer, ...pool.filter(p => p !== answer).slice(0, 2)]);
      const btns = opts.map((o, k) => {
        const b = ctx.html(`<button class="pat-opt" style="left:${400 + k * 180}px">${o}</button>`);
        b.onclick = () => {
          if (busy || !ctx.alive) return;
          if (o !== answer) {
            b.classList.add('shake', 'faded');
            if (ctx.mistake(L.wrong)) btns[opts.indexOf(answer)].classList.add('hint-glow');
            return;
          }
          busy = true;
          Sfx.yay();
          const slot = ctx.play.querySelector('.pat-card.missing');
          slot.textContent = answer;
          slot.classList.remove('missing');
          slot.classList.add('pop-in', 'filled');
          dots.children[round].classList.add('on');
          ctx.say(L.right, () => {
            busy = false;
            if (round < templates.length - 1) { round++; setup(); ctx.say(L.ask); return; }
            ctx.sayAll([L.done, L.thanks], () => ctx.win(ctx.starsFromMistakes()));
          });
        };
        return b;
      });
    }
    setup();
    ctx.after(300, () => ctx.instruct(L.intro));
  },

  // ด่าน 3: มากกว่า/น้อยกว่า 2 รอบ บวกเลข 1 รอบ แบ่งกล้วย 1 รอบ
  ctx => {
    const L = SAY.math.compare;
    const tasks = ['more', 'less', 'add', 'share'];
    const dots = ctx.html(`<div class="round-dots math-dots">${tasks.map(() => '<span>🍌</span>').join('')}</div>`);
    let step = 0, busy = false;
    const clear = () => ctx.play.querySelectorAll('.task').forEach(e => e.remove());
    const next = () => {
      dots.children[step].classList.add('on');
      if (step < tasks.length - 1) { step++; run(); return; }
      ctx.say(L.done, () => ctx.deed({
        ask: L.deedAsk,
        bad: { icon: '🍌💨', text: 'โยนทิ้งบนพื้น' },
        good: { icon: '🗑️👍', text: 'ทิ้งลงถังขยะ' },
        badLine: L.deedBad, goodLine: L.deedGood
      }, () => {
        if (Save.data.stars.math[2] === 0) ctx.say(L.islandDone, () => ctx.win(ctx.starsFromMistakes()));
        else ctx.win(ctx.starsFromMistakes());
      }));
    };

    function compare(kind) {
      let a = randInt(2, 8), b = randInt(2, 8);
      while (Math.abs(a - b) < 2) b = randInt(2, 8);
      const counts = [a, b];
      const want = kind === 'more' ? (a > b ? 0 : 1) : (a < b ? 0 : 1);
      const baskets = counts.map((n, k) => {
        const el = ctx.html(`<button class="task basket" style="left:${300 + k * 360}px">
          ${scatter(n, 0, 0, 3, 3, 90, 80).map(([x, y]) => `<span style="left:${x + 20}px;top:${y + 20}px">🍌</span>`).join('')}
        </button>`);
        el.onclick = () => {
          if (busy || !ctx.alive) return;
          if (k !== want) {
            el.classList.add('shake');
            if (ctx.mistake(L.wrongCmp)) baskets[want].classList.add('hint-glow');
            return;
          }
          busy = true;
          Sfx.yay();
          el.classList.add('correct');
          ctx.say(kind === 'more' ? L.rightMore : L.rightLess, () => { busy = false; next(); });
        };
        return el;
      });
      ctx.instruct(L[kind]);
    }

    // บวกเลขเล็กๆ สุ่มทุกครั้ง (ใช้ประโยคชุดเดียวกับด่านบวกลบ)
    function add() {
      const C = SAY.math.calc;
      const a = randInt(1, 4), b = randInt(1, 4), sum = a + b;
      ctx.html(`<div class="task add-row">
        <div class="add-group">${'🍌'.repeat(a)}</div><b>+</b><div class="add-group">${'🍌'.repeat(b)}</div><b>=</b><div class="add-group q">❓</div>
      </div>`);
      const els = shuffle([sum - 1, sum, sum + 1]).map((v, k) => {
        const el = ctx.html(`<button class="task pat-opt num" style="left:${400 + k * 180}px;top:360px">${v}</button>`);
        el.onclick = () => {
          if (busy || !ctx.alive) return;
          if (v !== sum) {
            el.classList.add('shake', 'faded');
            if (ctx.mistake(L.addWrong)) els.find(e => +e.textContent === sum).classList.add('hint-glow');
            return;
          }
          busy = true;
          Sfx.yay();
          ctx.play.querySelector('.add-group.q').textContent = sum;
          ctx.say(C.addRight[`${a}+${b}`], () => { busy = false; next(); });
        };
        return el;
      });
      ctx.instruct(C.addQ[`${a}+${b}`]);
    }

    function share() {
      const total = [4, 6, 8, 10][randInt(0, 3)];
      const pile = ctx.html('<div class="task pile"></div>');
      const plates = [0, 1].map(k => ctx.html(`<div class="task share-monkey" style="left:${300 + k * 400}px">
        <div class="sm-face">🐵</div><div class="plate"></div>
        <button class="give-btn">ให้ 🍌</button></div>`));
      let left = total, got = [0, 0];
      const draw = () => {
        pile.innerHTML = '🍌'.repeat(left) || '<small>หมดแล้ว</small>';
        plates.forEach((p, k) => { p.querySelector('.plate').textContent = '🍌'.repeat(got[k]); });
      };
      plates.forEach((p, k) => {
        p.querySelector('.give-btn').onclick = () => {
          if (busy || !ctx.alive || left === 0) return;
          left--; got[k]++;
          Sfx.tone(520 + got[k] * 60, 0, 0.12, 'triangle');
          draw();
          if (left > 0) return;
          busy = true;
          if (got[0] === got[1]) {
            Sfx.yay();
            plates.forEach(x => x.classList.add('correct'));
            ctx.say(L.shareEqual[total], () => { busy = false; next(); });
          } else {
            ctx.mistake(L.shareUnequal);
            ctx.after(2500, () => { left = total; got = [0, 0]; draw(); busy = false; });
          }
        };
      });
      draw();
      ctx.instruct(L.share[total]);
    }

    function run() {
      clear();
      const t = tasks[step];
      if (t === 'more' || t === 'less') compare(t);
      else if (t === 'add') add();
      else share();
    }
    ctx.after(300, () => ctx.say(L.intro, run));
  },

  // ---------- ด่านท้าทาย ----------
  // ด่าน 4: บวกลบกล้วย 6 ข้อ สุ่มตัวเลขทุกครั้ง ยากขึ้นเรื่อยๆ
  ctx => {
    const L = SAY.math.calc;
    const plan = [
      { op: '+', sum: [3, 6] }, { op: '-', from: [3, 6] },
      { op: '+', sum: [6, 8] }, { op: '-', from: [6, 8] },
      { op: '+', sum: [8, 10] }, { op: '-', from: [8, 10] }
    ];
    const pick = p => {
      const pool = p.op === '+'
        ? MATH_ADD.filter(([a, b]) => a + b >= p.sum[0] && a + b <= p.sum[1])
        : MATH_SUB.filter(([a]) => a >= p.from[0] && a <= p.from[1]);
      return pool[randInt(0, pool.length - 1)];
    };
    const qs = plan.map(p => ({ op: p.op, nums: pick(p) }));
    const dots = ctx.html(`<div class="round-dots math-dots">${qs.map(q => `<span>${q.op === '+' ? '➕' : '➖'}</span>`).join('')}</div>`);
    let round = 0, busy = false;

    function setup() {
      ctx.play.querySelectorAll('.calc').forEach(e => e.remove());
      const { op, nums: [a, b] } = qs[round];
      const answer = op === '+' ? a + b : a - b;
      const key = `${a}${op}${b}`;
      const bananas = (n, cls = '') => Array.from({ length: n }, () => `<i class="${cls}">🍌</i>`).join('');
      // ลบ: กล้วยกองเดียว ลูกท้ายๆ ถูกน้องลิงกินไป
      const groups = op === '+'
        ? `<div class="calc-group">${bananas(a)}<small>${a}</small></div><b>+</b><div class="calc-group">${bananas(b, 'new')}<small>${b}</small></div>`
        : `<div class="calc-group">${bananas(a - b)}${bananas(b, 'eaten')}<small>${a}</small></div><b>−</b><div class="calc-group monkey-eat">🐵<small>${b}</small></div>`;
      ctx.html(`<div class="calc calc-row">${groups}<b>=</b><div class="calc-group q">❓</div></div>`);
      const opts = new Set([answer]);
      while (opts.size < 3) { const v = answer + randInt(-2, 2); if (v >= 0 && v <= 10) opts.add(v); }
      const els = shuffle([...opts]).map((v, k) => {
        const el = ctx.html(`<button class="calc pat-opt num" style="left:${390 + k * 180}px;top:380px">${v}</button>`);
        el.onclick = () => {
          if (busy || !ctx.alive) return;
          if (v !== answer) {
            el.classList.add('shake', 'faded');
            if (ctx.mistake(op === '+' ? L.addWrong : L.subWrong)) els.find(e => +e.textContent === answer).classList.add('hint-glow');
            return;
          }
          busy = true;
          Sfx.yay();
          el.classList.add('correct');
          ctx.play.querySelector('.calc-group.q').textContent = answer;
          dots.children[round].classList.add('on');
          ctx.say(op === '+' ? L.addRight[key] : L.subRight[key], () => {
            busy = false;
            if (round < qs.length - 1) { round++; setup(); return; }
            ctx.sayAll([L.done, L.thanks], () => ctx.win(ctx.starsFromMistakes()));
          });
        };
        return el;
      });
      ctx.instruct(op === '+' ? L.addQ[key] : L.subQ[key]);
    }
    ctx.after(300, () => ctx.say(L.intro, setup));
  },

  // ด่าน 5: เลขที่หายไปบนก้อนหิน นับเพิ่ม นับลด และนับข้าม
  ctx => {
    const L = SAY.math.seq;
    const kinds = [
      { ask: 'up1', step: 1, start: () => randInt(1, 6) },
      { ask: 'up1', step: 1, start: () => randInt(10, 16) },
      { ask: 'down1', step: -1, start: () => randInt(9, 20) },
      { ask: 'up2', step: 2, start: () => 2 * randInt(1, 5) },
      { ask: 'up5', step: 5, start: () => 5 * randInt(1, 2) },
      { ask: 'up10', step: 10, start: () => 10 * randInt(1, 5) }
    ];
    const dots = ctx.html(`<div class="round-dots math-dots">${kinds.map(() => '<span>🪨</span>').join('')}</div>`);
    ctx.html('<div class="seq-river"></div>');
    let round = 0, busy = false;

    function setup() {
      ctx.play.querySelectorAll('.seq').forEach(e => e.remove());
      const k = kinds[round];
      const s0 = k.start();
      const nums = Array.from({ length: 5 }, (_, i) => s0 + i * k.step);
      const hole = randInt(1, 4);
      const answer = nums[hole];
      nums.forEach((n, i) => ctx.html(`<div class="seq pat-card stone ${i === hole ? 'missing' : ''}" style="left:${250 + i * 160}px">${i === hole ? '❓' : n}</div>`));
      ctx.html(`<div class="seq seq-monkey" style="left:${250 + (hole - 1) * 160 + 20}px">🐵</div>`);
      // ตัวเลือกที่ผิดคือเลขใกล้ๆ ที่ดูคล้าย
      const opts = new Set([answer]);
      for (const d of shuffle([k.step, -k.step, 1, -1, 2 * k.step])) {
        if (opts.size >= 3) break;
        const v = answer + d;
        if (v > 0 && v <= 100 && SAY.math.seq.right[v]) opts.add(v);
      }
      const els = shuffle([...opts]).map((v, i) => {
        const el = ctx.html(`<button class="seq pat-opt num" style="left:${390 + i * 180}px;top:400px">${v}</button>`);
        el.onclick = () => {
          if (busy || !ctx.alive) return;
          if (v !== answer) {
            el.classList.add('shake', 'faded');
            if (ctx.mistake(L.wrong)) els.find(e => +e.textContent === answer).classList.add('hint-glow');
            return;
          }
          busy = true;
          Sfx.yay();
          el.classList.add('correct');
          const slot = ctx.play.querySelector('.stone.missing');
          slot.textContent = answer;
          slot.classList.remove('missing');
          slot.classList.add('filled', 'pop-in');
          const monkey = ctx.play.querySelector('.seq-monkey');
          monkey.style.left = 250 + hole * 160 + 20 + 'px';
          dots.children[round].classList.add('on');
          ctx.say(L.right[answer], () => {
            busy = false;
            if (round < kinds.length - 1) { round++; setup(); return; }
            ctx.say(L.done, () => ctx.deed({
              ask: L.deedAsk,
              bad: { icon: '🙄', text: 'บอกว่าเพื่อนไม่เก่ง' },
              good: { icon: '🧑‍🏫💕', text: 'ค่อยๆ สอนเพื่อนนับ' },
              badLine: L.deedBad, goodLine: L.deedGood
            }, () => ctx.win(ctx.starsFromMistakes())));
          });
        };
        return el;
      });
      ctx.instruct(L.ask[k.ask]);
    }
    ctx.after(300, () => ctx.say(L.intro, setup));
  }
];
