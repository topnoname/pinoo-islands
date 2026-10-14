// เกาะครัวนักวิทย์: ผสมสี / ละลายไหมนะ / ทำอาหารตามสูตร
const PAINT = { red: '#E8504A', yellow: '#F7D038', blue: '#3D7FE0', orange: '#F59331', green: '#4CB050', purple: '#9B59D0' };
const MIXES = { orange: ['red', 'yellow'], green: ['blue', 'yellow'], purple: ['red', 'blue'] };
const blob = (c, cls = '') => `<i class="paint ${cls}" style="background:${PAINT[c]}"></i>`;

LEVELS.kitchen = [
  // ด่าน 1: ผสมสี 4 ข้อ (2 ข้อเลือกคู่สี 2 ข้อทายสีที่ได้)
  ctx => {
    const L = SAY.kitchen.color;
    const order = shuffle(Object.keys(MIXES));
    const plan = [['want', order[0]], ['want', order[1]], ['mix', order[2]], ['mix', order[0]]];
    const rounds = plan.map(([kind, c]) => {
      const [a, b] = MIXES[c];
      if (kind === 'want') {
        return {
          scene: `<div class="mix-row">${blob(c, 'big')}<b>=</b><span class="mix-q">❓</span><b>+</b><span class="mix-q">❓</span></div>`,
          ask: L.want[c],
          options: shuffle(Object.entries(MIXES)).map(([k, [x, y]]) => ({ html: `<div class="mix-pair">${blob(x)}<b>+</b>${blob(y)}</div>`, ok: k === c })),
          right: L.right[c], wrong: L.wrong,
          after: el => { el.querySelectorAll('.mix-q').forEach((q, k) => { q.outerHTML = blob(k ? b : a); }); }
        };
      }
      return {
        scene: `<div class="mix-row">${blob(a)}<b>+</b>${blob(b)}<b>=</b><span class="mix-q">❓</span></div>`,
        ask: L.mix[c],
        options: shuffle(Object.keys(MIXES)).map(k => ({ html: blob(k, 'big'), ok: k === c })),
        right: L.right[c], wrong: L.wrong,
        after: el => { el.querySelector('.mix-q').outerHTML = blob(c, 'big pop-in'); }
      };
    });
    const q = quiz(ctx, { rounds, dotsIcon: '🎨', optClass: 'mix-opt', onDone: () => ctx.say(L.done, () => deedThenWin(ctx, L,
      { icon: '🙅🖍️', text: 'ไม่ให้ยืม เก็บไว้คนเดียว' },
      { icon: '🖍️🤝', text: 'แบ่งสีให้เพื่อนใช้ด้วย' })) });
    ctx.after(300, () => ctx.say(L.intro, q.start));
  },

  // ด่าน 2: ทายว่าใส่น้ำแล้วละลายไหม แล้วดูผลในแก้ว (สุ่ม 3 + 3)
  ctx => {
    const L = SAY.kitchen.dissolve;
    const glass = ctx.html('<div class="glass"><div class="water"></div><span class="in-glass"></span></div>');
    const sorter = sortOne(ctx, {
      items: pickEach(L.items, 'bin', 3),
      bins: [{ id: 'yes', icon: '🫗', label: 'ละลาย' }, { id: 'no', icon: '🪨', label: 'ไม่ละลาย' }],
      wrong: L.wrong,
      dotsIcon: '🥛',
      // ของตกลงในแก้ว ถ้าละลายจะค่อยๆ หายไป
      onPlace: it => {
        const s = glass.querySelector('.in-glass');
        s.className = 'in-glass drop';
        s.textContent = it.icon;
        void s.offsetWidth;
        if (it.bin === 'yes') ctx.after(900, () => s.classList.add('melt'));
      },
      onDone: () => ctx.say(L.done, () => ctx.deed({
        ask: L.deedAsk,
        bad: { icon: '🚶💦', text: 'เดินหนีไปเงียบๆ' },
        good: { icon: '🙋🧽', text: 'บอกผู้ใหญ่แล้วช่วยเช็ด' },
        badLine: L.deedBad, goodLine: L.deedGood
      }, () => ctx.win(ctx.starsFromMistakes())))
    });
    ctx.after(300, () => ctx.say(L.intro, sorter.start));
  },

  // ด่าน 3: ใส่ของให้ครบตามสูตร 3 เมนู (จำนวนสุ่มทุกครั้ง)
  ctx => {
    const L = SAY.kitchen.recipe;
    const MENUS = {
      sandwich: { icon: '🥪', items: ['🍞', '🧀', '🍅'] },
      salad: { icon: '🥗', items: ['🍓', '🍌', '🍇'] },
      pizza: { icon: '🍕', items: ['🍄', '🌽', '🧀'] }
    };
    const menus = shuffle(Object.keys(MENUS));
    const dots = ctx.html(`<div class="round-dots side-dots">${menus.map(m => `<span>${MENUS[m].icon}</span>`).join('')}</div>`);
    let r = 0;
    function next() {
      ctx.play.querySelectorAll('.recipe').forEach(e => e.remove());
      if (r >= menus.length) { ctx.say(L.done, () => deedThenWin(ctx, L,
        { icon: '🛋️', text: 'ปล่อยให้คุณแม่เก็บคนเดียว' },
        { icon: '🧽🍽️', text: 'ช่วยกันเก็บล้าง' })); return; }
      const m = MENUS[menus[r]];
      // ยิ่งเมนูหลังๆ จำนวนยิ่งมาก
      const want = m.items.map(() => randInt(1, 3 + r));
      const have = m.items.map(() => 0);
      const card = ctx.html(`<div class="recipe recipe-card"><div class="rc-title">${m.icon} สูตร</div>${
        m.items.map((ic, k) => `<div class="rc-line"><span>${ic}</span><b>${want[k]}</b></div>`).join('')}</div>`);
      const rows = m.items.map((ic, k) => {
        const row = ctx.html(`<div class="recipe rc-row" style="top:${130 + k * 120}px">
          <span class="rc-ico">${ic}</span><button class="m-btn minus">−</button><div class="rc-plate"></div><button class="m-btn plus">+</button><b class="rc-n">0</b></div>`);
        const draw = () => {
          row.querySelector('.rc-plate').textContent = ic.repeat(have[k]);
          row.querySelector('.rc-n').textContent = have[k];
        };
        row.querySelector('.plus').onclick = () => { if (have[k] < 8) { have[k]++; Sfx.pop(); draw(); row.classList.remove('hint-glow'); } };
        row.querySelector('.minus').onclick = () => { if (have[k] > 0) { have[k]--; Sfx.pop(); draw(); row.classList.remove('hint-glow'); } };
        return row;
      });
      const doneBtn = ctx.html('<button class="recipe go-btn rc-done">✓ เสร็จแล้ว</button>');
      doneBtn.onclick = () => {
        if (!ctx.alive) return;
        const bad = have.map((h, k) => h !== want[k]);
        if (bad.some(Boolean)) {
          ctx.mistake(L.wrong);
          rows.forEach((row, k) => row.classList.toggle('hint-glow', bad[k]));
          return;
        }
        Sfx.yay();
        card.classList.add('correct');
        dots.children[r].classList.add('on');
        r++;
        ctx.say(L.right, next);
      };
      ctx.instruct(L.ask[menus[r]]);
    }
    ctx.after(300, () => ctx.say(L.intro, next));
  }
];
