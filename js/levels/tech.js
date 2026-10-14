// เกาะหุ่นยนต์ (เทคโนโลยี/โค้ดดิ้ง): เดินตามลูกศร / วางแผนก่อนเดิน / คำสั่งทำซ้ำ / เก็บดาวก่อนกลับ / นักแก้บั๊ก
const DIRS = {
  up: { dx: 0, dy: -1, icon: '⬆️' },
  down: { dx: 0, dy: 1, icon: '⬇️' },
  left: { dx: -1, dy: 0, icon: '⬅️' },
  right: { dx: 1, dy: 0, icon: '➡️' }
};
const GRID = { cols: 6, rows: 4, size: 100, x: 290, y: 110 };

const isRock = (rocks, c, r) => rocks.some(([x, y]) => x === c && y === r);
const inGrid = (c, r) => c >= 0 && r >= 0 && c < GRID.cols && r < GRID.rows;
const rndInt = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

// ทิศแรกของทางที่สั้นที่สุด ใช้ทำคำใบ้
function firstStep([sc, sr], [tc, tr], rocks) {
  const seen = new Set([`${sc},${sr}`]);
  const queue = [[sc, sr, null]];
  while (queue.length) {
    const [c, r, first] = queue.shift();
    if (c === tc && r === tr) return first;
    for (const [name, d] of Object.entries(DIRS)) {
      const nc = c + d.dx, nr = r + d.dy, key = `${nc},${nr}`;
      if (!inGrid(nc, nr) || isRock(rocks, nc, nr) || seen.has(key)) continue;
      seen.add(key);
      queue.push([nc, nr, first || name]);
    }
  }
  return null;
}

// จำนวนก้าวของทางที่สั้นที่สุด
function fewestSteps(from, to, rocks) {
  const seen = new Map([[from.join(), 0]]);
  const queue = [from];
  while (queue.length) {
    const [c, r] = queue.shift();
    if (c === to[0] && r === to[1]) return seen.get(`${c},${r}`);
    for (const d of Object.values(DIRS)) {
      const nc = c + d.dx, nr = r + d.dy, key = `${nc},${nr}`;
      if (!inGrid(nc, nr) || isRock(rocks, nc, nr) || seen.has(key)) continue;
      seen.set(key, seen.get(`${c},${r}`) + 1);
      queue.push([nc, nr]);
    }
  }
  return Infinity;
}

// โปรแกรมที่ใช้คำสั่งน้อยที่สุด (คำสั่งหนึ่งอัน = เดินตรงไปทางเดียว 1-5 ก้าว)
// คืนค่า [{dir, times}] หรือ null ถ้าไปไม่ได้
function fewestRuns([sc, sr], [tc, tr], rocks) {
  const prev = new Map([[`${sc},${sr}`, null]]);
  const queue = [[sc, sr]];
  while (queue.length) {
    const [c, r] = queue.shift();
    if (c === tc && r === tr) break;
    for (const [name, d] of Object.entries(DIRS)) {
      for (let n = 1; n <= 5; n++) {
        const nc = c + d.dx * n, nr = r + d.dy * n;
        if (!inGrid(nc, nr) || isRock(rocks, nc, nr)) break;
        const key = `${nc},${nr}`;
        if (prev.has(key)) continue;
        prev.set(key, { from: `${c},${r}`, dir: name, times: n });
        queue.push([nc, nr]);
      }
    }
  }
  if (!prev.has(`${tc},${tr}`)) return null;
  const prog = [];
  for (let k = `${tc},${tr}`; prev.get(k); k = prev.get(k).from) {
    const p = prev.get(k);
    prog.unshift({ dir: p.dir, times: p.times });
  }
  return prog;
}

// สุ่มกระดานใหม่ทุกครั้งที่เล่น ตามความยากที่กำหนด
// steps/runs = [น้อยสุด, มากสุด] ของจำนวนก้าวและจำนวนคำสั่ง, rocks = จำนวนก้อนหิน, star = ต้องแวะเก็บดาวก่อน
function makeRound({ steps = [1, 99], runs = [1, 99], rocks = 0, star = false }) {
  const cell = () => [rndInt(0, GRID.cols - 1), rndInt(0, GRID.rows - 1)];
  const same = (a, b) => a && b && a[0] === b[0] && a[1] === b[1];
  for (let tries = 0; tries < 5000; tries++) {
    const start = cell(), target = cell(), mid = star ? cell() : null;
    if (same(start, target) || same(mid, start) || same(mid, target)) continue;
    const rs = [];
    while (rs.length < rocks) {
      const c = cell();
      if (same(c, start) || same(c, target) || same(c, mid) || isRock(rs, ...c)) continue;
      rs.push(c);
    }
    const legs = mid ? [[start, mid], [mid, target]] : [[start, target]];
    const progs = legs.map(([a, b]) => fewestRuns(a, b, rs));
    if (progs.some(p => !p)) continue;
    const nSteps = legs.reduce((t, [a, b]) => t + fewestSteps(a, b, rs), 0);
    const nRuns = progs.reduce((t, p) => t + p.length, 0);
    if (nSteps < steps[0] || nSteps > steps[1] || nRuns < runs[0] || nRuns > runs[1]) continue;
    return { start, target, rocks: rs, star: mid, solution: progs.flat() };
  }
  return { start: [0, 1], target: [3, 1], rocks: [], star: null, solution: [{ dir: 'right', times: 3 }] };
}

// mode: 'step' กดแล้วเดินเลย, 'plan' เรียงคำสั่งแล้วกดไป, 'loop' เรียงคำสั่งแบบทำซ้ำได้
// 'debug' มีโปรแกรมให้แล้วแต่มีคำสั่งผิดหนึ่งอัน แตะคำสั่งเพื่อหมุนลูกศร
function robotLevel(ctx, mode, rounds, L, finish, slots) {
  const T = SAY.tech;
  const maxSlots = slots || (mode === 'loop' ? 3 : 8);
  const repeatable = mode === 'loop' || mode === 'debug';
  const at = (c, r) => `left:${GRID.x + c * GRID.size}px;top:${GRID.y + r * GRID.size}px`;

  ctx.html(`<div class="grid-board" style="left:${GRID.x}px;top:${GRID.y}px">${
    Array.from({ length: GRID.cols * GRID.rows }, () => '<i></i>').join('')}</div>`);
  const roundDots = ctx.html(`<div class="round-dots">${rounds.map(() => '<span>🔋</span>').join('')}</div>`);
  const pad = ctx.html(`<div class="arrow-pad ${mode === 'step' ? 'center' : ''} ${mode === 'debug' ? 'hidden' : ''}">
    ${Object.entries(DIRS).map(([name, d]) => `<button class="arrow-btn ${name}" data-dir="${name}">${d.icon}</button>`).join('')}
  </div>`);
  let progBar, goBtn;
  if (mode !== 'step') {
    progBar = ctx.html(`<div class="program ${repeatable ? 'loop' : mode} ${mode === 'debug' ? 'debug' : ''} slots-${maxSlots}">${
      Array.from({ length: maxSlots }, () => '<span class="cmd empty"></span>').join('')}</div>`);
    if (mode !== 'debug') {
      ctx.html('<button class="undo-btn" title="ลบอันสุดท้าย">⌫</button>').onclick = () => {
        if (running) return;
        Sfx.pop(); program.pop(); drawProgram();
      };
    }
    goBtn = ctx.html('<button class="go-btn">▶ ไป!</button>');
    goBtn.onclick = run;
  }

  let round = 0, pos, bib, battery, starEl, gotStar = true, bugAt = -1, program = [], running = false;

  function setup() {
    ctx.play.querySelectorAll('.piece, .trail').forEach(e => e.remove());
    const rd = rounds[round];
    rd.rocks.forEach(([c, r]) => ctx.html(`<div class="piece rock" style="${at(c, r)}">🪨</div>`));
    battery = ctx.html(`<div class="piece battery" style="${at(...rd.target)}">🔋</div>`);
    starEl = rd.star ? ctx.html(`<div class="piece star-pick" style="${at(...rd.star)}">⭐</div>`) : null;
    gotStar = !rd.star;
    bib = ctx.html(`<div class="piece bib" style="${at(...rd.start)}">🤖</div>`);
    pos = [...rd.start];
    program = [];
    // ด่านแก้บั๊ก: เอาโปรแกรมที่ถูกมาเปลี่ยนลูกศรให้ผิดหนึ่งอัน
    if (mode === 'debug') {
      program = rd.solution.map(c => ({ ...c }));
      bugAt = rndInt(0, program.length - 1);
      // ลูกศรที่ผิดต้องไม่ซ้ำกับคำสั่งข้างๆ จะได้มองเห็นว่าผิดตรงไหน
      const near = [program[bugAt - 1], program[bugAt], program[bugAt + 1]].filter(Boolean).map(c => c.dir);
      let others = Object.keys(DIRS).filter(d => !near.includes(d));
      if (!others.length) others = Object.keys(DIRS).filter(d => d !== program[bugAt].dir);
      program[bugAt].dir = others[rndInt(0, others.length - 1)];
    }
    drawProgram();
    running = false;
  }

  function drawProgram() {
    if (!progBar) return;
    [...progBar.children].forEach((slot, k) => {
      const cmd = program[k];
      slot.className = 'cmd' + (cmd ? '' : ' empty');
      slot.innerHTML = cmd ? `${DIRS[cmd.dir].icon}${repeatable ? `<b>×${cmd.times}</b>` : ''}` : '';
    });
  }

  // ด่านแก้บั๊ก: แตะคำสั่งเพื่อหมุนลูกศรไปทิศถัดไป
  const ORDER = ['up', 'right', 'down', 'left'];
  if (mode === 'debug') {
    [...progBar.children].forEach((slot, k) => {
      slot.onclick = () => {
        if (running || !program[k]) return;
        Sfx.pop();
        clearHint();
        program[k].dir = ORDER[(ORDER.indexOf(program[k].dir) + 1) % 4];
        drawProgram();
        slot.classList.add('bump-up');
      };
    });
  }
  // แตะคำสั่งที่วางไว้แล้วเพื่อเพิ่มจำนวนครั้ง (เฉพาะด่านทำซ้ำ)
  if (mode === 'loop') {
    [...progBar.children].forEach((slot, k) => {
      slot.onclick = () => {
        if (running || !program[k]) return;
        Sfx.pop();
        program[k].times = program[k].times % 5 + 1;
        drawProgram();
        slot.classList.add('bump-up');
      };
    });
  }

  // เดินหนึ่งก้าว: คืนค่า 'ok' 'bump' หรือ 'edge'
  function step(dir) {
    const d = DIRS[dir];
    const nc = pos[0] + d.dx, nr = pos[1] + d.dy;
    if (!inGrid(nc, nr)) return 'edge';
    const rd = rounds[round];
    if (isRock(rd.rocks, nc, nr)) return 'bump';
    ctx.html(`<div class="trail" style="${at(...pos)}"></div>`);
    pos = [nc, nr];
    bib.style.left = GRID.x + nc * GRID.size + 'px';
    bib.style.top = GRID.y + nr * GRID.size + 'px';
    Sfx.tone(520 + nr * 40 + nc * 30, 0, 0.12, 'square', 0.06);
    if (!gotStar && nc === rd.star[0] && nr === rd.star[1]) {
      gotStar = true;
      starEl.classList.add('collected');
      Sfx.tone(1047, 0.05, 0.2, 'triangle');
    }
    return 'ok';
  }

  const onBattery = () => pos[0] === rounds[round].target[0] && pos[1] === rounds[round].target[1];
  const atTarget = () => gotStar && onBattery();

  function hint(from) {
    if (mode === 'debug') { progBar.children[bugAt].classList.add('hint-glow'); return; }
    const rd = rounds[round];
    const dir = firstStep(from, gotStar ? rd.target : rd.star, rd.rocks);
    pad.querySelectorAll('.arrow-btn').forEach(b => b.classList.toggle('hint-glow', b.dataset.dir === dir));
  }
  const clearHint = () => ctx.play.querySelectorAll('.arrow-btn.hint-glow, .cmd.hint-glow').forEach(b => b.classList.remove('hint-glow'));

  function oops(text, from) {
    bib.classList.remove('shake'); void bib.offsetWidth; bib.classList.add('shake');
    if (ctx.mistake(text)) hint(from);
  }

  function reached() {
    running = true;
    clearHint();
    Sfx.yay();
    battery.classList.add('collected');
    roundDots.children[round].classList.add('on');
    if (round < rounds.length - 1) {
      ctx.say(L.got, () => { round++; setup(); });
    } else {
      ctx.say(L.done, finish);
    }
  }

  // เดินตามโปรแกรมทีละก้าว
  function run() {
    if (running) return;
    if (!program.length) { ctx.say(T.plan.empty); return; }
    Sfx.pop();
    running = true;
    clearHint();
    const steps = program.flatMap(c => Array(c.times).fill(c.dir));
    const start = [...rounds[round].start];
    let k = 0;
    const tick = () => {
      if (!ctx.alive) return;
      if (atTarget()) { reached(); return; }
      if (k >= steps.length) { failRun(onBattery() && !gotStar ? L.needStar : (L.fail || T.plan.fail)); return; }
      const res = step(steps[k++]);
      if (res !== 'ok') { failRun(res === 'bump' ? T.bump : T.edge); return; }
      setTimeout(tick, 420);
    };
    // ผิดแล้วบิบกลับจุดเริ่ม แต่คำสั่งยังอยู่ให้แก้ต่อได้
    const failRun = (text) => {
      const stuckAt = [...pos];
      oops(text, stuckAt);
      ctx.after(1000, () => {
        ctx.play.querySelectorAll('.trail').forEach(e => e.remove());
        pos = [...start];
        if (rounds[round].star) { gotStar = false; starEl.classList.remove('collected'); }
        bib.style.left = GRID.x + start[0] * GRID.size + 'px';
        bib.style.top = GRID.y + start[1] * GRID.size + 'px';
        running = false;
      });
    };
    tick();
  }

  pad.querySelectorAll('.arrow-btn').forEach(b => {
    b.onclick = () => {
      if (running || !ctx.alive) return;
      const dir = b.dataset.dir;
      if (mode === 'step') {
        clearHint();
        const res = step(dir);
        if (res !== 'ok') { oops(res === 'bump' ? T.bump : T.edge, pos); return; }
        if (atTarget()) setTimeout(reached, 380);
        return;
      }
      if (program.length >= maxSlots) { Sfx.oops(); ctx.say(L.full || T.plan.full); return; }
      Sfx.pop();
      clearHint();
      program.push({ dir, times: 1 });
      drawProgram();
    };
  });

  setup();
}

// ความยากของแต่ละรอบ สุ่มกระดานใหม่ทุกครั้งที่เข้าเล่น
const TECH_ROUNDS = {
  step: [{ steps: [2, 3] }, { steps: [4, 5], rocks: 2 }, { steps: [6, 8], rocks: 4 }],
  plan: [{ steps: [3, 3] }, { steps: [4, 5], rocks: 2 }, { steps: [6, 7], rocks: 4 }],
  loop: [{ steps: [4, 5], runs: [1, 1] }, { steps: [5, 7], runs: [2, 2], rocks: 2 }, { steps: [6, 9], runs: [3, 3], rocks: 5 }],
  star: [{ steps: [4, 7], runs: [2, 3], rocks: 2, star: true }, { steps: [6, 9], runs: [3, 4], rocks: 3, star: true }, { steps: [8, 12], runs: [4, 5], rocks: 5, star: true }],
  debug: [{ steps: [4, 6], runs: [2, 2], rocks: 1 }, { steps: [5, 8], runs: [3, 3], rocks: 3 }, { steps: [6, 10], runs: [3, 4], rocks: 4 }]
};
const techRounds = kind => TECH_ROUNDS[kind].map(makeRound);

LEVELS.tech = [
  // ด่าน 1: กดลูกศรแล้วเดินทันที
  ctx => {
    const L = SAY.tech.arrows;
    robotLevel(ctx, 'step', techRounds('step'), L, () => ctx.deed({
      ask: L.deedAsk,
      bad: { icon: '⏩🤖', text: 'แซงคิวไปก่อนเลย' },
      good: { icon: '🤖🤖🤖', text: 'ต่อแถวรอคิว' },
      badLine: L.deedBad, goodLine: L.deedGood
    }, () => ctx.win(ctx.starsFromMistakes())));
    ctx.after(300, () => ctx.instruct(L.intro));
  },

  // ด่าน 2: เรียงคำสั่งให้ครบแล้วกดไป
  ctx => {
    const L = SAY.tech.plan;
    robotLevel(ctx, 'plan', techRounds('plan'), L, () => ctx.win(ctx.starsFromMistakes()));
    ctx.after(300, () => ctx.instruct(L.intro));
  },

  // ด่าน 3: ช่องคำสั่งมีแค่ 3 ช่อง ต้องใช้ทำซ้ำ
  ctx => {
    const L = SAY.tech.loop;
    robotLevel(ctx, 'loop', techRounds('loop'), L, () => ctx.deed({
      ask: L.deedAsk,
      bad: { icon: '😶', text: 'เงียบ ไม่พูดอะไร' },
      good: { icon: '🙏💬', text: 'ขอบคุณมากนะ' },
      badLine: L.deedBad, goodLine: L.deedGood
    }, () => {
      if (Save.data.stars.tech[2] === 0) ctx.say(L.islandDone, () => ctx.win(ctx.starsFromMistakes()));
      else ctx.win(ctx.starsFromMistakes());
    }));
    ctx.after(300, () => ctx.instruct(L.intro));
  },

  // ด่าน 4 (ท้าทาย): แวะเก็บดาวก่อนไปหาแบต ใช้คำสั่งทำซ้ำได้ 5 ช่อง
  ctx => {
    const L = SAY.tech.star;
    robotLevel(ctx, 'loop', techRounds('star'), L, () => ctx.win(ctx.starsFromMistakes()), 5);
    ctx.after(300, () => ctx.instruct(L.intro));
  },

  // ด่าน 5 (ท้าทาย): หาคำสั่งที่ผิดในโปรแกรมแล้วแก้
  ctx => {
    const L = SAY.tech.debug;
    robotLevel(ctx, 'debug', techRounds('debug'), L, () => ctx.deed({
      ask: L.deedAsk,
      bad: { icon: '😆👉', text: 'หัวเราะเยาะเพื่อน' },
      good: { icon: '🤝💡', text: 'ช่วยเพื่อนหาจุดผิดดีๆ' },
      badLine: L.deedBad, goodLine: L.deedGood
    }, () => ctx.win(ctx.starsFromMistakes())), 4);
    ctx.after(300, () => ctx.instruct(L.intro));
  }
];
