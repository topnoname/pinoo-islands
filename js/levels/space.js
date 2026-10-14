// เกาะอวกาศ: กลางวัน กลางคืน / เงาอยู่ทางไหน / ประกอบจรวด
LEVELS.space = [
  // ด่าน 1: แยกสิ่งที่เกิดตอนกลางวันกับกลางคืน (สุ่ม 3 + 3 จากทั้งหมด 10)
  ctx => {
    const L = SAY.space.daynight;
    ctx.root.classList.add('day');
    const sorter = sortOne(ctx, {
      items: pickEach(L.items, 'bin', 3),
      bins: [{ id: 'day', icon: '☀️', label: 'กลางวัน' }, { id: 'night', icon: '🌙', label: 'กลางคืน' }],
      wrong: L.wrong,
      dotsIcon: '🌗',
      // ท้องฟ้าเปลี่ยนตามคำตอบล่าสุด
      onPlace: (it) => { ctx.root.classList.toggle('day', it.bin === 'day'); ctx.root.classList.toggle('night', it.bin === 'night'); },
      onDone: () => ctx.say(L.done, () => deedThenWin(ctx, L,
        { icon: '🥁🔊', text: 'เล่นเสียงดังต่อไป' },
        { icon: '🤫🧸', text: 'เล่นเบาๆ หรือรอพรุ่งนี้' }))
    });
    ctx.after(300, () => ctx.say(L.intro, sorter.start));
  },

  // ด่าน 2: ดวงอาทิตย์อยู่ตรงไหน เงาจะอยู่ทางไหน (สุ่ม 4 รอบ)
  ctx => {
    const L = SAY.space.shadow;
    const things = ['🌳', '🐶', '🏠', '⛄', '🦒'];
    const suns = shuffle(['left', 'right', 'top', shuffle(['left', 'right'])[0]]);
    const pic = (sun, shadow, thing) => `
      <div class="sh-pic">
        <span class="sh-sun ${sun}">☀️</span>
        <i class="sh-shadow ${shadow}"></i>
        <span class="sh-thing">${thing}</span>
        <b class="sh-ground"></b>
      </div>`;
    const rounds = suns.map(sun => {
      const thing = things[randInt(0, things.length - 1)];
      const want = sun === 'left' ? 'right' : sun === 'right' ? 'left' : 'under';
      return {
        scene: pic(sun, 'none', thing),
        ask: L.ask[sun],
        options: shuffle(['left', 'right', 'under']).map(s => ({ html: pic('none', s, thing), ok: s === want })),
        right: sun === 'top' ? L.rightTop : L.right,
        wrong: L.wrong,
        after: el => el.querySelector('.sh-shadow').className = `sh-shadow ${want} pop-in`
      };
    });
    const q = quiz(ctx, { rounds, dotsIcon: '☀️', optClass: 'sh-opt', onDone: () => ctx.say(L.done, () => ctx.win(ctx.starsFromMistakes())) });
    ctx.after(300, () => ctx.say(L.intro, q.start));
  },

  // ด่าน 3: ประกอบจรวดจากล่างขึ้นบน แล้วนับถอยหลัง 10 ถึง 1
  ctx => {
    const L = SAY.space.rocket;
    const N = SAY.math.numbers;
    const PARTS = ['🔥', '🛢️', '🪟', '🔺'];
    // โครงจรวดจางๆ ให้เห็นว่าชิ้นไหนอยู่ตรงไหน ใส่ถูกแล้วจะเป็นสีจริง
    const rocket = ctx.html(`<div class="rk-rocket">${PARTS.map((_, k) => `<div class="rk-piece p${k}">${k === 2 ? '<span>🐶</span>' : ''}</div>`).join('')}</div>`);
    const parts = PARTS.map((icon, k) => ({ html: `<span class="rk-part p${k}">${icon}</span><small>${L.parts[k]}</small>` }));
    function build() {
      orderTap(ctx, {
        items: parts, ask: L.ask, wrong: L.wrong, btnClass: 'rk-btn', hideRow: true,
        onStep: k => rocket.children[k].classList.add('filled', 'pop-in'),
        onDone: () => {
          ctx.play.querySelectorAll('.order').forEach(e => e.remove());
          ctx.say(L.built, countdown);
        }
      });
    }
    function countdown() {
      const nums = Array.from({ length: 10 }, (_, k) => 10 - k);
      const spots = shuffle(scatter(10, 540, 120, 4, 3, 160, 140));
      let want = 10;
      nums.forEach((n, k) => {
        const b = ctx.html(`<button class="rk-num" style="left:${spots[k][0]}px;top:${spots[k][1]}px">${n}</button>`);
        b.onclick = () => {
          if (!ctx.alive || b.classList.contains('used')) return;
          if (n !== want) {
            b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake');
            if (ctx.mistake(L.countWrong)) [...ctx.play.querySelectorAll('.rk-num')].find(x => +x.textContent === want).classList.add('hint-glow');
            return;
          }
          b.classList.remove('hint-glow');
          b.classList.add('used');
          Voice.aside(N[n - 1]);
          Sfx.tone(300 + (10 - n) * 60, 0, 0.15, 'triangle');
          want--;
          if (want > 0) return;
          Sfx.whoosh();
          rocket.classList.add('launch');
          ctx.after(1200, () => ctx.say(L.launch, () => deedThenWin(ctx, L,
            { icon: '🔭😤', text: 'แย่งดูคนเดียว' },
            { icon: '🔭🤝', text: 'ผลัดกันดูทีละคน' })));
        };
      });
    }
    ctx.after(300, () => ctx.say(L.intro, build));
  }
];
