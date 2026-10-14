// เกาะร่างกาย: ประสาทสัมผัส / สะอาดปลอดเชื้อ / อาหารดีมีประโยชน์
const SENSES = [
  { id: 'eye', icon: '👀', label: 'ตา ดู' },
  { id: 'ear', icon: '👂', label: 'หู ฟัง' },
  { id: 'nose', icon: '👃', label: 'จมูก ดม' },
  { id: 'tongue', icon: '👅', label: 'ลิ้น ชิม' },
  { id: 'hand', icon: '✋', label: 'มือ สัมผัส' }
];

LEVELS.body = [
  // ด่าน 1: สิ่งนี้รู้ได้ด้วยประสาทสัมผัสไหน (สุ่ม 6 ข้อ)
  ctx => {
    const L = SAY.body.senses;
    const rounds = shuffle(L.items).slice(0, 6).map(it => ({
      scene: `<div class="big-thing">${it.icon}</div>`,
      ask: it.ask,
      options: SENSES.map(s => ({ html: `<span class="sense-ico">${s.icon}</span><small>${s.label}</small>`, ok: s.id === it.sense })),
      right: it.right,
      wrong: L.wrong
    }));
    const q = quiz(ctx, { rounds, dotsIcon: '🖐️', optClass: 'sense-opt', onDone: () => ctx.say(L.done, () => deedThenWin(ctx, L,
      { icon: '😆🙈', text: 'หัวเราะแล้วเดินผ่านไป' },
      { icon: '🤝🦯', text: 'จูงมือพาเพื่อนไป' })) });
    ctx.after(300, () => ctx.say(L.intro, q.start));
  },

  // ด่าน 2: แปรงฟันไล่เชื้อโรค แล้วเรียงขั้นตอนล้างมือ
  ctx => {
    const L = SAY.body.clean;
    const dots = ctx.html('<div class="round-dots side-dots"><span>🦷</span><span>🧼</span></div>');
    function teeth() {
      const mouth = ctx.html(`<div class="mouth">
        <div class="teeth top">${'<i></i>'.repeat(6)}</div><div class="teeth bottom">${'<i></i>'.repeat(6)}</div>
      </div>`);
      // เชื้อโรคเกาะบนฟันแบบสุ่ม 8 ซี่
      const spots = shuffle(Array.from({ length: 12 }, (_, k) => k)).slice(0, 8);
      let left = spots.length;
      spots.forEach(k => {
        const tooth = mouth.querySelectorAll('.teeth i')[k];
        const g = document.createElement('button');
        g.className = 'germ';
        g.textContent = '🦠';
        g.onclick = () => {
          if (!ctx.alive || g.classList.contains('gone')) return;
          g.classList.add('gone');
          tooth.classList.add('shine');
          Sfx.tone(700 + left * 30, 0, 0.1, 'triangle');
          left--;
          if (left > 0) return;
          Sfx.yay();
          dots.children[0].classList.add('on');
          ctx.say(L.teethDone, () => { mouth.remove(); hands(); });
        };
        tooth.appendChild(g);
      });
      ctx.instruct(L.teeth);
    }
    function hands() {
      const icons = ['💧', '🧼', '👐', '🚿', '🧻'];
      orderTap(ctx, {
        items: icons.map((ic, k) => ({ html: `<span class="step-ico">${ic}</span><small>${L.steps[k]}</small>` })),
        ask: L.hands, wrong: L.wrong, btnClass: 'step-btn',
        onDone: () => {
          dots.children[1].classList.add('on');
          ctx.say(L.done, () => ctx.deed({
            ask: L.deedAsk,
            bad: { icon: '🤧😮', text: 'ไอใส่หน้าเพื่อน' },
            good: { icon: '💪🤧', text: 'ปิดปากด้วยข้อพับแขน' },
            badLine: L.deedBad, goodLine: L.deedGood
          }, () => ctx.win(ctx.starsFromMistakes())));
        }
      });
    }
    ctx.after(300, () => ctx.say(L.intro, teeth));
  },

  // ด่าน 3: อาหารที่ควรกินบ่อยๆ กับกินนิดเดียว (สุ่ม 4 + 4)
  ctx => {
    const L = SAY.body.food;
    const sorter = sortOne(ctx, {
      items: pickEach(L.items, 'bin', 4),
      bins: [{ id: 'good', icon: '💪', label: 'กินบ่อยๆ' }, { id: 'little', icon: '🤏', label: 'กินนิดเดียว' }],
      wrong: L.wrong,
      dotsIcon: '🍎',
      onDone: () => ctx.say(L.done, () => deedThenWin(ctx, L,
        { icon: '🏃💨', text: 'ลุกไปเล่นทันที' },
        { icon: '🍽️🧽', text: 'ช่วยเก็บจานไปไว้ที่ซิงก์' }))
    });
    ctx.after(300, () => ctx.say(L.intro, sorter.start));
  }
];
