// เกาะต้นไม้ (วิทยาศาสตร์): ต้นไม้ต้องการอะไร / ลอยหรือจม / วงจรชีวิตผีเสื้อ

// ต้นไม้ 4 ระยะ: 0 เหี่ยว → 3 ออกดอก
function plantSVG(stage) {
  const stem = stage === 0
    ? `<path d="M110 222 Q108 170 132 150 Q152 136 160 160" stroke="#A3A35A" stroke-width="9" fill="none" stroke-linecap="round"/>
       <path d="M118 190 Q96 196 88 214 Q106 214 118 196" fill="#B5A76A"/>
       <path d="M158 160 Q170 176 162 194 Q152 180 158 162" fill="#B5A76A"/>`
    : `<path d="M110 222 L110 ${stage === 1 ? 150 : 110}" stroke="#4CAF50" stroke-width="10" stroke-linecap="round"/>
       <path d="M110 190 Q80 170 66 186 Q84 204 110 196" fill="#5DBB63"/>
       <path d="M110 176 Q140 156 154 172 Q136 190 110 182" fill="#5DBB63"/>
       ${stage >= 2 ? `<path d="M110 150 Q74 126 56 146 Q80 166 110 156" fill="#6CCB72"/>
       <path d="M110 136 Q146 112 164 132 Q140 152 110 142" fill="#6CCB72"/>` : ''}`;
  const flower = stage === 3
    ? `<g class="bloom">${[0, 60, 120, 180, 240, 300].map(a =>
        `<ellipse cx="110" cy="72" rx="16" ry="26" fill="#FF8DB8" transform="rotate(${a} 110 98)"/>`).join('')}
       <circle cx="110" cy="98" r="20" fill="#FFD23F"/>
       <circle cx="103" cy="95" r="2.6" fill="#5A3A1A"/><circle cx="117" cy="95" r="2.6" fill="#5A3A1A"/>
       <path d="M102 104 Q110 111 118 104" stroke="#5A3A1A" stroke-width="2.4" fill="none" stroke-linecap="round"/></g>`
    : stage === 2 ? '<circle cx="110" cy="104" r="11" fill="#9ED36A"/>' : '';
  return `
    <svg viewBox="0 0 220 300" class="plant-svg">
      ${stem}${flower}
      <ellipse cx="110" cy="224" rx="70" ry="12" fill="#7A4B2A"/>
      <path d="M38 222 L182 222 L166 296 L54 296 Z" fill="#E07A4F"/>
      <rect x="32" y="214" width="156" height="22" rx="8" fill="#F09A6A"/>
    </svg>`;
}

// ดักแด้ไม่มีอีโมจิ จึงวาดเอง
const CHRYSALIS = `
  <svg viewBox="0 0 80 100" class="chrysalis">
    <path d="M10 8 Q40 0 70 8" stroke="#7A5A2A" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M40 10 Q66 30 58 64 Q50 92 40 96 Q30 92 22 64 Q14 30 40 10 Z" fill="#8BC34A" stroke="#5E8C2A" stroke-width="3"/>
    <path d="M28 40 Q40 46 52 40 M26 56 Q40 62 54 56 M30 72 Q40 77 50 72" stroke="#5E8C2A" stroke-width="2.5" fill="none"/>
  </svg>`;

LEVELS.science = [
  // ด่าน 1: ลากสิ่งที่ต้นไม้ต้องการไปให้ต้นไม้
  ctx => {
    const L = SAY.science.needs;
    ctx.html('<div class="bunny">🐰</div>');
    const plant = ctx.html(`<div class="plant">${plantSVG(0)}</div>`);
    const meter = ctx.html(`<div class="need-meter">${['💧', '☀️', '💨'].map(i => `<span>${i}</span>`).join('')}</div>`);
    ctx.html('<div class="tray"></div>');
    const items = shuffle([
      { id: 'water', icon: '💧', label: 'น้ำ', good: true },
      { id: 'sun', icon: '☀️', label: 'แสงแดด', good: true },
      { id: 'air', icon: '💨', label: 'อากาศ', good: true },
      { id: 'candy', icon: '🍭', label: 'ขนม', good: false },
      { id: 'game', icon: '🎮', label: 'เกม', good: false },
      { id: 'sock', icon: '🧦', label: 'ถุงเท้า', good: false }
    ]);
    let grown = 0;
    items.forEach((it, k) => {
      const el = ctx.html(`<div class="item-card" style="left:${740 + (k % 3) * 170}px;top:${130 + Math.floor(k / 3) * 200}px">
        <span class="item-icon">${it.icon}</span><span class="item-label">${it.label}</span></div>`);
      el.dataset.good = it.good;
      ctx.draggable(el, plant, () => {
        if (!ctx.alive) return false;
        if (!it.good) {
          if (ctx.mistake(L[it.id])) hint();
          return false;
        }
        Sfx.yay();
        el.classList.add('used');
        el.style.left = '390px'; el.style.top = '230px';
        el.classList.add('absorb');
        meter.children[['water', 'sun', 'air'].indexOf(it.id)].classList.add('on');
        grown++;
        plant.innerHTML = plantSVG(grown);
        plant.classList.remove('grow'); void plant.offsetWidth; plant.classList.add('grow');
        if (grown < 3) { ctx.say(L[it.id]); return true; }
        ctx.say(L[it.id], () => ctx.say(L.bloom, () => ctx.deed({
          ask: L.deedAsk,
          bad: { icon: '✂️🌸', text: 'เด็ดดอกไม้ไปเล่น' },
          good: { icon: '💧🌸', text: 'รดน้ำและชื่นชมดอกไม้' },
          badLine: L.deedBad, goodLine: L.deedGood
        }, () => ctx.win(ctx.starsFromMistakes()))));
        return true;
      });
    });
    const hint = () => {
      const next = [...ctx.play.querySelectorAll('.item-card')].find(e => e.dataset.good === 'true' && !e.classList.contains('used'));
      next && next.classList.add('hint-glow');
    };
    ctx.after(300, () => ctx.instruct(L.intro));
  },

  // ด่าน 2: ทายว่าของจะลอยหรือจม แล้วดูผลจริง
  ctx => {
    const L = SAY.science.sink;
    const objs = shuffle(L.objects);
    let i = 0, right = 0;
    ctx.html(`<div class="tank"><div class="water"></div></div>`);
    const dots = ctx.html(`<div class="sink-dots">${objs.map(() => '<span></span>').join('')}</div>`);
    const btnFloat = ctx.html('<button class="guess-btn float"><b>⬆️</b>ลอย</button>');
    const btnSink = ctx.html('<button class="guess-btn sink"><b>⬇️</b>จม</button>');
    let current = null, waiting = true;

    const next = () => {
      if (i >= objs.length) {
        ctx.sayAll([L.summary, L.thanks], () => ctx.win(right >= 5 ? 3 : right >= 3 ? 2 : 1));
        return;
      }
      const o = objs[i];
      current = ctx.html(`<div class="drop-obj" style="left:545px;top:70px">${o.icon}</div>`);
      ctx.instruct(o.ask);
      waiting = false;
    };
    const guess = (saysFloat) => {
      if (waiting || !current || !ctx.alive) return;
      waiting = true;
      Sfx.pop();
      const o = objs[i];
      const ok = saysFloat === o.floats;
      if (ok) right++;
      dots.children[i].classList.add(ok ? 'ok' : 'miss');
      const el = current;
      const slotX = 340 + i * 82;
      el.classList.add('falling');
      el.style.left = slotX + 'px';
      el.style.top = o.floats ? '270px' : '400px';
      setTimeout(() => { if (o.floats) { el.style.top = '186px'; el.classList.add('bobbing'); } else Sfx.oops(); }, 650);
      ctx.after(900, () => {
        if (ok) Sfx.yay();
        ctx.sayAll([o.result, ok ? L.right : L.wrong], () => { i++; ctx.after(300, next); });
      });
    };
    btnFloat.onclick = () => guess(true);
    btnSink.onclick = () => guess(false);
    ctx.after(300, () => ctx.say(L.intro, next));
  },

  // ด่าน 3: เรียงวงจรชีวิตผีเสื้อ
  ctx => {
    const L = SAY.science.life;
    const order = [
      { id: 'egg', icon: '<span class="eggs">🥚🥚🥚</span>', label: 'ไข่' },
      { id: 'caterpillar', icon: '🐛', label: 'หนอน' },
      { id: 'chrysalis', icon: CHRYSALIS, label: 'ดักแด้' },
      { id: 'butterfly', icon: '🦋', label: 'ผีเสื้อ' }
    ];
    const slotPos = [[480, 96], [650, 262], [480, 428], [310, 262]];
    ctx.html(`<svg class="cycle-arrows" viewBox="0 0 1280 720">
      <defs><marker id="arrowHead" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 Z" fill="#fff"/></marker></defs>
      <path d="M640 150 Q720 170 732 252" /><path d="M735 422 Q720 512 642 525" />
      <path d="M470 525 Q390 512 378 422" /><path d="M375 252 Q390 170 468 150" />
    </svg>`);
    ctx.html('<div class="cycle-center">วงจรชีวิต<br>ผีเสื้อ</div>');
    const slots = slotPos.map(([x, y], k) => ctx.html(`<div class="slot" style="left:${x}px;top:${y}px"><span>${k + 1}</span></div>`));
    const board = ctx.html('<div class="board-target"></div>');
    let filled = 0;
    shuffle(order).forEach((st, k) => {
      const el = ctx.html(`<div class="item-card life-card" style="left:${930 + (k % 2) * 160}px;top:${150 + Math.floor(k / 2) * 190}px">
        <span class="item-icon">${st.icon}</span><span class="item-label">${st.label}</span></div>`);
      el.dataset.id = st.id;
      ctx.draggable(el, board, () => {
        if (!ctx.alive) return false;
        if (st.id !== order[filled].id) {
          if (ctx.mistake(filled === 0 ? L.wrongFirst : L.wrong)) {
            ctx.play.querySelector(`.life-card[data-id="${order[filled].id}"]`).classList.add('hint-glow');
          }
          return false;
        }
        Sfx.yay();
        el.classList.add('used', 'placed');
        const [x, y] = slotPos[filled];
        el.style.left = x + 'px'; el.style.top = y + 'px';
        slots[filled].classList.add('done');
        filled++;
        if (filled < 4) { ctx.say(L[st.id]); return true; }
        ctx.say(L[st.id], () => {
          ctx.root.classList.add('cycle-done');
          const fly = ctx.html('<div class="free-butterfly">🦋</div>');
          ctx.say(L.done, () => ctx.deed({
            ask: L.deedAsk,
            bad: { icon: '🫙🦋', text: 'จับใส่ขวดไว้ดู' },
            good: { icon: '🌤️🦋', text: 'ปล่อยให้บินไปอย่างอิสระ' },
            badLine: L.deedBad, goodLine: L.deedGood
          }, () => {
            fly.classList.add('fly-away');
            const firstClear = Save.data.stars.science[2] === 0;
            if (firstClear) ctx.say(L.islandDone, () => ctx.win(ctx.starsFromMistakes()));
            else ctx.win(ctx.starsFromMistakes());
          }));
        });
        return true;
      });
    });
    ctx.after(300, () => ctx.instruct(L.intro));
  }
];
