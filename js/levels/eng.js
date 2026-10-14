// เกาะช่างสร้าง (วิศวกรรม): สร้างบ้านจากรูปทรง / สะพานแข็งแรง / หอคอยสูงไม่ล้ม / วัดก่อนสร้าง / สามเหลี่ยมแข็งแรง

function shapeSVG(type, color) {
  const body = {
    square: `<rect x="3" y="3" width="94" height="94" rx="8" fill="${color}"/>`,
    rect: `<rect x="3" y="3" width="94" height="94" rx="8" fill="${color}"/><circle cx="78" cy="55" r="6" fill="#FFE27A"/>`,
    triangle: `<polygon points="50,3 97,97 3,97" fill="${color}" stroke-linejoin="round"/>`,
    circle: `<circle cx="50" cy="50" r="46" fill="${color}"/><path d="M50 6 V94 M6 50 H94" stroke="#fff" stroke-width="5"/>`,
    star: `<polygon points="50,4 62,38 98,38 69,59 80,94 50,73 20,94 31,59 2,38 38,38" fill="${color}"/>`,
    heart: `<path d="M50 92 C10 64 2 38 20 20 C34 8 48 16 50 30 C52 16 66 8 80 20 C98 38 90 64 50 92 Z" fill="${color}"/>`,
    ball: `<circle cx="50" cy="50" r="46" fill="${color}"/><path d="M14 36 Q50 56 86 36 M14 64 Q50 44 86 64" stroke="#fff" stroke-width="5" fill="none"/>`
  }[type];
  return `<svg viewBox="0 0 100 100" preserveAspectRatio="none" class="shape-svg">${body}</svg>`;
}

LEVELS.eng = [
  // ด่าน 1: ใส่รูปทรงลงช่องที่รูปร่างตรงกันจนเป็นบ้าน
  ctx => {
    const L = SAY.eng.house;
    ctx.html('<div class="ground-strip"></div>');
    ctx.html('<div class="beaver">🦫</div>');
    const zone = ctx.html('<div class="house-zone"></div>');
    const slotDefs = [
      { type: 'triangle', color: '#E86A5C', x: 340, y: 112, w: 320, h: 150 },
      { type: 'square', color: '#FFCC80', x: 380, y: 262, w: 240, h: 240, z: 1 },
      { type: 'rect', color: '#A1887F', x: 465, y: 382, w: 70, h: 120 },
      { type: 'circle', color: '#81D4FA', x: 400, y: 292, w: 70, h: 70 },
      { type: 'square', color: '#81D4FA', x: 530, y: 292, w: 70, h: 70 }
    ];
    const slots = slotDefs.map(s => {
      const el = ctx.html(`<div class="shape-slot ${s.type}" style="left:${s.x}px;top:${s.y}px;width:${s.w}px;height:${s.h}px;z-index:${s.z || 2}">${shapeSVG(s.type, 'rgba(255,255,255,.55)')}</div>`);
      return { ...s, el, filled: false };
    });
    const pieces = shuffle([
      { type: 'square', color: '#FFCC80', label: 'สี่เหลี่ยมจัตุรัส' },
      { type: 'square', color: '#81D4FA', label: 'สี่เหลี่ยมจัตุรัส' },
      { type: 'triangle', color: '#E86A5C', label: 'สามเหลี่ยม' },
      { type: 'rect', color: '#A1887F', label: 'สี่เหลี่ยมผืนผ้า' },
      { type: 'circle', color: '#81D4FA', label: 'วงกลม' },
      { type: 'star', color: '#FFD23F', label: 'ดาว' },
      { type: 'heart', color: '#FF8DB8', label: 'หัวใจ' }
    ]);
    let placed = 0;
    pieces.forEach((p, k) => {
      const el = ctx.html(`<div class="item-card shape-card" style="left:${740 + (k % 4) * 128}px;top:${120 + Math.floor(k / 4) * 196}px">
        <span class="shape-thumb ${p.type}">${shapeSVG(p.type, p.color)}</span><span class="item-label small">${p.label}</span></div>`);
      el.dataset.type = p.type;
      el.dataset.color = p.color;
      ctx.draggable(el, zone, () => {
        if (!ctx.alive) return false;
        // สี่เหลี่ยมจัตุรัสมีสองชิ้น (ผนังสีส้ม หน้าต่างสีฟ้า) จึงจับคู่ตามสีด้วย
        const slot = slots.find(s => !s.filled && s.type === p.type && s.color === p.color);
        if (!slot) {
          if (ctx.mistake(L[p.type] || L.star)) hint();
          return false;
        }
        Sfx.yay();
        slot.filled = true;
        slot.el.innerHTML = shapeSVG(p.type, p.color);
        slot.el.classList.add('filled', 'pop-in');
        el.classList.add('used', 'gone');
        placed++;
        if (placed < slots.length) { ctx.say(L[p.type]); return true; }
        ctx.root.classList.add('house-done');
        ctx.say(L[p.type], () => ctx.say(L.done, () => ctx.deed({
          ask: L.deedAsk,
          bad: { icon: '🙅🔨', text: 'ทำคนเดียว ไม่ให้ใครช่วย' },
          good: { icon: '🤝🏠', text: 'ชวนเพื่อนมาช่วยกันสร้าง' },
          badLine: L.deedBad, goodLine: L.deedGood
        }, () => ctx.win(ctx.starsFromMistakes()))));
        return true;
      });
    });
    const hint = () => {
      const need = slots.find(s => !s.filled);
      const card = need && [...ctx.play.querySelectorAll('.shape-card')].find(c => c.dataset.type === need.type && c.dataset.color === need.color && !c.classList.contains('used'));
      card && card.classList.add('hint-glow');
    };
    ctx.after(300, () => ctx.instruct(L.intro));
  },

  // ด่าน 2: เลือกวัสดุสะพานแล้วทดสอบกับรถที่หนักขึ้นเรื่อยๆ
  ctx => {
    const L = SAY.eng.bridge;
    // สลับตำแหน่งปุ่มวัสดุทุกครั้ง จะได้ไม่จำตำแหน่ง
    const materials = shuffle([
      { id: 'leaf', icon: '🍃', label: 'ใบไม้', strength: 0 },
      { id: 'paper', icon: '📄', label: 'กระดาษ', strength: 0 },
      { id: 'wood', icon: '🪵', label: 'ไม้', strength: 2 },
      { id: 'stone', icon: '🪨', label: 'หิน', strength: 3 }
    ]);
    const rounds = [
      { id: 'bike', icon: '🚲', weight: 1 },
      { id: 'car', icon: '🚗', weight: 2 },
      { id: 'truck', icon: '🚚', weight: 3 }
    ];
    ctx.html('<div class="river"></div>');
    ctx.html('<div class="cliff left"><span>🏠🦫</span></div>');
    ctx.html('<div class="cliff right"></div>');
    const bridge = ctx.html('<div class="bridge empty"></div>');
    const vehicle = ctx.html('<div class="vehicle"></div>');
    const dots = ctx.html(`<div class="round-dots bridge-dots">${rounds.map(r => `<span>${r.icon}</span>`).join('')}</div>`);
    const btns = materials.map((m, k) => {
      const b = ctx.html(`<button class="material-btn" style="left:${330 + k * 165}px"><span>${m.icon}</span>${m.label}</button>`);
      b.onclick = () => choose(m, b);
      return b;
    });
    let round = 0, busy = true;

    const setup = () => {
      const r = rounds[round];
      vehicle.textContent = r.icon;
      vehicle.className = 'vehicle';
      vehicle.style.left = '1010px';
      bridge.className = 'bridge empty';
      ctx.instruct(L[r.id]);
      busy = false;
    };

    function choose(m, b) {
      if (busy || !ctx.alive) return;
      busy = true;
      Sfx.pop();
      btns.forEach(x => x.classList.remove('hint-glow'));
      const r = rounds[round];
      bridge.className = `bridge ${m.id} pop-in`;
      ctx.after(700, () => {
        vehicle.classList.add('driving');
        vehicle.style.left = '560px';
        ctx.after(1300, () => {
          if (m.strength >= r.weight) {
            vehicle.style.left = '130px';
            ctx.after(1300, () => {
              Sfx.yay();
              dots.children[round].classList.add('on');
              if (round < rounds.length - 1) ctx.say(L.ok, () => { round++; setup(); });
              else ctx.sayAll([L.ok, L.done, L.thanks], () => ctx.win(ctx.starsFromMistakes()));
            });
            return;
          }
          // สะพานพัง: รถถอยกลับ ให้เลือกใหม่
          bridge.classList.add('broken');
          vehicle.classList.add('shake');
          const needHint = ctx.mistake(L[m.id]);
          ctx.after(900, () => {
            vehicle.className = 'vehicle driving';
            vehicle.style.left = '1010px';
            ctx.after(1300, () => {
              bridge.className = 'bridge empty';
              vehicle.className = 'vehicle';
              if (needHint) btns[materials.findIndex(x => x.strength >= r.weight)].classList.add('hint-glow');
              busy = false;
            });
          });
        });
      });
    }
    ctx.after(300, () => ctx.say(L.intro, setup));
  },

  // ด่าน 3: ต่อหอคอย ใหญ่ไว้ล่าง เล็กไว้บน สามเหลี่ยมไว้ยอด
  ctx => {
    const L = SAY.eng.tower;
    const PIECES = {
      big: { type: 'block', w: 260, color: '#E8A25C' },
      med: { type: 'block', w: 200, color: '#7BD389' },
      small: { type: 'block', w: 140, color: '#9AD0F5' },
      tiny: { type: 'block', w: 90, color: '#FFB3CF' },
      tri: { type: 'triangle', w: 140, color: '#E86A5C' },
      ball: { type: 'ball', w: 70, color: '#FF7A59' }
    };
    const rounds = [
      { pieces: ['big', 'med', 'small', 'tiny'], order: ['big', 'med', 'small', 'tiny'] },
      { pieces: ['big', 'med', 'small', 'tri', 'ball'], order: ['big', 'med', 'small', 'tri'] }
    ];
    const H = 70, BASE = 540, CX = 520;
    ctx.html(`<div class="tower-ground"></div>`);
    ctx.html(`<div class="goal-line" style="top:${BASE - 4 * H}px"></div>`);
    const flag = ctx.html(`<div class="flag-pole" style="top:${BASE - 4 * H - 30}px;height:${4 * H + 30}px"><span>🚩</span></div>`);
    const zone = ctx.html('<div class="tower-zone"></div>');
    const dots = ctx.html(`<div class="round-dots tower-dots">${rounds.map(() => '<span>🏰</span>').join('')}</div>`);
    let round = 0, idx = 0;

    function setup() {
      ctx.play.querySelectorAll('.block-piece').forEach(e => e.remove());
      flag.classList.remove('wave');
      idx = 0;
      shuffle(rounds[round].pieces).forEach((id, k) => {
        const p = PIECES[id];
        const inner = p.type === 'block' ? '' : shapeSVG(p.type === 'triangle' ? 'triangle' : 'ball', p.color);
        const el = ctx.html(`<div class="block-piece ${p.type}" style="left:${1020 - p.w / 2}px;top:${112 + k * 88}px;width:${p.w}px;height:${H}px;${p.type === 'block' ? `background:${p.color}` : ''}">${inner}</div>`);
        el.dataset.id = id;
        const handle = ctx.draggable(el, zone, () => place(id, el, handle));
      });
    }

    function place(id, el, handle) {
      if (!ctx.alive) return false;
      const want = rounds[round].order[idx];
      const p = PIECES[id];
      el.style.left = CX - p.w / 2 + 'px';
      el.style.top = BASE - (idx + 1) * H + 'px';
      if (id !== want) {
        // วางผิด: ชิ้นนั้นล้มลงแล้วกลับที่เดิม
        el.classList.add('topple');
        const text = id === 'ball' ? L.ball : id === 'tri' ? L.triangleLast : L.bigFirst;
        const needHint = ctx.mistake(text);
        setTimeout(() => {
          el.classList.remove('topple');
          handle.goHome();
          if (needHint) ctx.play.querySelector(`.block-piece[data-id="${want}"]`).classList.add('hint-glow');
        }, 700);
        return true;
      }
      Sfx.tone(392 + idx * 98, 0, 0.18, 'triangle');
      el.classList.add('used', 'stacked');
      el.classList.remove('hint-glow');
      idx++;
      if (idx < rounds[round].order.length) return true;
      Sfx.yay();
      flag.classList.add('wave');
      dots.children[round].classList.add('on');
      if (round === 0) {
        ctx.say(L.round, () => { round++; setup(); ctx.instruct(L.round2); });
      } else {
        ctx.say(L.done, () => ctx.deed({
          ask: L.deedAsk,
          bad: { icon: '🙅🧱', text: 'เก็บไว้เล่นคนเดียว' },
          good: { icon: '🧱🤝', text: 'แบ่งตัวต่อให้เพื่อนเล่นด้วย' },
          badLine: L.deedBad, goodLine: L.deedGood
        }, () => {
          if (Save.data.stars.eng[2] === 0) ctx.say(L.islandDone, () => ctx.win(ctx.starsFromMistakes()));
          else ctx.win(ctx.starsFromMistakes());
        }));
      }
      return true;
    }

    setup();
    ctx.after(300, () => ctx.instruct(L.intro));
  },

  // ---------- ด่านท้าทาย ----------
  // ด่าน 4: นับช่องว่างของแม่น้ำ แล้วใส่แผ่นไม้ให้พอดี (ขนาดสุ่มทุกครั้ง)
  ctx => {
    const L = SAY.eng.measure;
    const U = 80;
    const rounds = [
      { gap: randBetween(2, 4), plank: 1 },
      { gap: randBetween(5, 7), plank: 1 },
      { gap: [4, 6, 8][randBetween(0, 2)], plank: 2 }
    ];
    ctx.html('<div class="m-river"></div>');
    const left = ctx.html('<div class="m-cliff left"><span>🦫</span></div>');
    const right = ctx.html('<div class="m-cliff right"><span>🏠</span></div>');
    const ruler = ctx.html('<div class="m-ruler"></div>');
    const deck = ctx.html('<div class="m-deck"></div>');
    const car = ctx.html('<div class="m-car">🚗</div>');
    const dots = ctx.html(`<div class="round-dots m-dots">${rounds.map(() => '<span>🌉</span>').join('')}</div>`);
    const panel = ctx.html(`<div class="m-panel">
      <div class="m-plank-icon"></div>
      <div class="m-row"><button class="m-btn minus">−</button><div class="m-count">0</div><button class="m-btn plus">+</button></div>
    </div>`);
    const test = ctx.html('<button class="go-btn m-test">🚗 ทดสอบ</button>');
    let round = 0, planks = 0, busy = true, gapX = 0;

    const draw = () => {
      const r = rounds[round];
      panel.querySelector('.m-count').textContent = planks;
      deck.innerHTML = Array.from({ length: planks }, (_, k) =>
        `<i class="pop-in" style="left:${k * r.plank * U}px;width:${r.plank * U - 4}px"></i>`).join('');
    };

    function setup() {
      const r = rounds[round];
      gapX = 640 - (r.gap * U) / 2;
      left.style.width = gapX + 'px';
      right.style.left = gapX + r.gap * U + 'px';
      ruler.style.left = deck.style.left = gapX + 'px';
      ruler.style.width = r.gap * U + 'px';
      ruler.innerHTML = Array.from({ length: r.gap }, (_, k) => `<i style="left:${k * U}px"><b>${k + 1}</b></i>`).join('');
      panel.querySelector('.m-plank-icon').innerHTML = `<i style="width:${r.plank * 50}px"></i><small>ไม้ 1 แผ่น = ${r.plank} ช่อง</small>`;
      car.className = 'm-car';
      car.style.left = gapX - 110 + 'px';
      planks = 0;
      draw();
      ctx.instruct(r.plank === 1 ? L.unit : L.long);
      busy = false;
    }

    panel.querySelector('.plus').onclick = () => {
      const r = rounds[round];
      if (busy || planks * r.plank >= r.gap + 2) return;
      Sfx.pop(); planks++; draw();
    };
    panel.querySelector('.minus').onclick = () => {
      if (busy || planks === 0) return;
      Sfx.pop(); planks--; draw();
    };

    test.onclick = () => {
      if (busy || !ctx.alive) return;
      const r = rounds[round];
      if (!planks) { ctx.say(L.empty); return; }
      busy = true;
      Sfx.pop();
      const length = planks * r.plank;
      if (length > r.gap) {
        deck.classList.remove('shake'); void deck.offsetWidth; deck.classList.add('shake');
        if (ctx.mistake(L.over)) ruler.classList.add('hint-glow');
        busy = false;
        return;
      }
      car.classList.add('driving');
      if (length < r.gap) {
        // รถวิ่งไปสุดแผ่นไม้แล้วตกน้ำ
        car.style.left = gapX + length * U - 30 + 'px';
        ctx.after(1000, () => {
          car.classList.add('fall');
          const needHint = ctx.mistake(L.short);
          ctx.after(1600, () => {
            car.className = 'm-car';
            car.style.left = gapX - 110 + 'px';
            if (needHint) ruler.classList.add('hint-glow');
            busy = false;
          });
        });
        return;
      }
      car.style.left = gapX + r.gap * U + 40 + 'px';
      ctx.after(1300, () => {
        Sfx.yay();
        ruler.classList.remove('hint-glow');
        dots.children[round].classList.add('on');
        const line = r.plank === 1 ? L.okUnit[r.gap] : L.okLong[r.gap];
        if (round < rounds.length - 1) ctx.say(line, () => { round++; setup(); });
        else ctx.sayAll([line, L.done], () => ctx.win(ctx.starsFromMistakes()));
      });
    };

    ctx.after(300, () => ctx.say(L.intro, setup));
  },

  // ด่าน 5: ใส่ไม้ทแยงให้เป็นสามเหลี่ยม โครงจะไม่ล้มเมื่อลมพัด
  ctx => {
    const L = SAY.eng.truss;
    const S = 120;
    // โครงสี่เหลี่ยมหนึ่งช่อง brace: 'h' ไม้นอน 'v' ไม้ตั้ง 'd' ไม้ทแยง
    const cell = (x, y, brace) => `
      <g class="t-cell ${brace === 'd' ? 'braced' : ''}" data-x="${x}" data-y="${y}">
        <rect x="${x}" y="${y}" width="${S}" height="${S}" class="t-hit"/>
        <path d="M${x} ${y} H${x + S} V${y + S} H${x} Z" class="t-beam"/>
        ${brace === 'h' ? `<path d="M${x} ${y + S / 2} H${x + S}" class="t-beam"/>` : ''}
        ${brace === 'v' ? `<path d="M${x + S / 2} ${y} V${y + S}" class="t-beam"/>` : ''}
        ${brace === 'd' ? `<path d="M${x} ${y + S} L${x + S} ${y}" class="t-beam diag"/>` : ''}
        ${[[x, y], [x + S, y], [x, y + S], [x + S, y + S]].map(([a, b]) => `<circle cx="${a}" cy="${b}" r="9" class="t-joint"/>`).join('')}
      </g>`;
    const frame = (cols, rows, brace, mini) => {
      const w = cols * S + 40, h = rows * S + 40;
      let cells = '';
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) cells += cell(20 + c * S, 20 + r * S, typeof brace === 'function' ? brace(c, r) : brace);
      }
      return `<svg class="t-frame ${mini ? 'mini' : ''}" viewBox="0 0 ${w} ${h}" style="width:${mini ? w * 0.55 : w}px;height:${mini ? h * 0.55 : h}px">${cells}</svg>`;
    };
    // ทดสอบลม: โครงที่ไม่มีไม้ทแยงจะเอียงล้ม
    const blow = (el, strong, onDone) => {
      const wind = ctx.html('<div class="t-wind">💨💨💨</div>');
      Sfx.whoosh();
      ctx.after(700, () => {
        el.classList.add(strong ? 't-hold' : 't-wobble');
        ctx.after(1400, () => { wind.remove(); el.classList.remove('t-hold', 't-wobble'); onDone(); });
      });
    };
    ctx.html('<div class="t-ground"></div>');
    const dots = ctx.html('<div class="round-dots t-dots"><span>🏠</span><span>🌉</span><span>🗼</span></div>');
    let busy = false;
    const clearRound = () => ctx.play.querySelectorAll('.t-stage, .t-opt, .t-test').forEach(e => e.remove());

    // เลือกแบบโครง แล้วทดสอบลม (รอบ 1 เลือกไม้ค้ำ รอบ 2 เลือกแบบสะพาน)
    function choose(roundIdx, cols, opts, ask, next) {
      const stage = ctx.html(`<div class="t-stage">${frame(cols, 1, 'none')}</div>`);
      const btns = opts.map((o, k) => {
        const b = ctx.html(`<button class="t-opt" style="left:${(cols > 1 ? 250 : 330) + k * (cols > 1 ? 270 : 210)}px">${frame(cols, 1, o.brace, true)}<span>${o.label}</span></button>`);
        b.onclick = () => {
          if (busy || !ctx.alive) return;
          busy = true;
          Sfx.pop();
          btns.forEach(x => x.classList.remove('hint-glow'));
          stage.innerHTML = frame(cols, 1, o.brace);
          blow(stage, o.strong, () => {
            if (!o.strong) {
              if (ctx.mistake(L.wobble)) btns[opts.findIndex(x => x.strong)].classList.add('hint-glow');
              stage.innerHTML = frame(cols, 1, 'none');
              busy = false;
              return;
            }
            Sfx.yay();
            dots.children[roundIdx].classList.add('on');
            ctx.say(L.right, () => { clearRound(); busy = false; next(); });
          });
        };
        return b;
      });
      ctx.instruct(ask);
    }

    const round1 = () => choose(0, 1, shuffle([
      { brace: 'h', label: 'ไม้แนวนอน' }, { brace: 'v', label: 'ไม้แนวตั้ง' }, { brace: 'd', label: 'ไม้ทแยง', strong: true }
    ]), L.pick, round2);

    const round2 = () => {
      const opts = shuffle([
        { brace: 'none' }, { brace: () => 'd', strong: true }, { brace: c => (c % 2 ? 'v' : 'h') }
      ]);
      opts.forEach((o, k) => { o.label = `แบบที่ ${k + 1}`; });
      choose(1, 3, opts, L.design, round3);
    };

    // รอบ 3: แตะใส่ไม้ทแยงให้ครบทุกช่องของหอคอย (ขนาดสุ่ม)
    function round3() {
      const rows = randBetween(2, 3), cols = randBetween(1, 2);
      const braced = new Set();
      const stage = ctx.html('<div class="t-stage tower"></div>');
      const draw = () => {
        stage.innerHTML = frame(cols, rows, (c, r) => (braced.has(`${c},${r}`) ? 'd' : 'none'));
        stage.querySelectorAll('.t-cell').forEach(g => {
          g.onclick = () => {
            if (busy) return;
            const key = `${(g.dataset.x - 20) / S},${(g.dataset.y - 20) / S}`;
            braced.has(key) ? braced.delete(key) : braced.add(key);
            Sfx.pop();
            draw();
          };
        });
      };
      draw();
      const test = ctx.html('<button class="go-btn t-test">💨 ทดสอบลม</button>');
      test.onclick = () => {
        if (busy || !ctx.alive) return;
        busy = true;
        const all = braced.size === rows * cols;
        blow(stage, all, () => {
          if (!all) {
            if (ctx.mistake(L.notAll)) stage.querySelectorAll('.t-cell:not(.braced)').forEach(g => g.classList.add('hint-cell'));
            busy = false;
            return;
          }
          Sfx.yay();
          dots.children[2].classList.add('on');
          ctx.sayAll([L.right, L.done], () => ctx.deed({
            ask: L.deedAsk,
            bad: { icon: '🙈', text: 'ทำเป็นไม่เห็น' },
            good: { icon: '🧹🤝', text: 'ไปช่วยคุณยายเก็บกวาด' },
            badLine: L.deedBad, goodLine: L.deedGood
          }, () => ctx.win(ctx.starsFromMistakes())));
        });
      };
      ctx.instruct(L.brace);
    }

    ctx.after(300, () => ctx.say(L.intro, round1));
  }
];

function randBetween(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
