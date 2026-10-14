// เกาะใต้ทะเล: อยู่ทะเลหรือบนบก / เล็กไปใหญ่ / เก็บขยะในทะเล
LEVELS.ocean = [
  // ด่าน 1: แยกสัตว์ทะเลกับสัตว์บก (สุ่ม 3 + 3)
  ctx => {
    const L = SAY.ocean.where;
    const sorter = sortOne(ctx, {
      items: pickEach(L.items, 'bin', 3),
      bins: [{ id: 'sea', icon: '🌊', label: 'ในทะเล' }, { id: 'land', icon: '🌳', label: 'บนบก' }],
      wrong: L.wrong,
      dotsIcon: '🐚',
      onDone: () => ctx.say(L.done, () => deedThenWin(ctx, L,
        { icon: '🦀🪣', text: 'จับใส่ถังกลับบ้าน' },
        { icon: '🦀👀', text: 'ดูเฉยๆ ไม่รบกวน' }))
    });
    ctx.after(300, () => ctx.say(L.intro, sorter.start));
  },

  // ด่าน 2: เรียงขนาดสัตว์ทะเล 3 รอบ (3, 4, 5 ตัว รอบสุดท้ายเรียงใหญ่ไปเล็ก)
  ctx => {
    const L = SAY.ocean.size;
    const ALL = ['🦐', '🐠', '🐢', '🐬', '🦈', '🐋'];
    const rounds = [{ n: 3, big: false }, { n: 4, big: false }, { n: 5, big: true }];
    const dots = ctx.html(`<div class="round-dots side-dots">${rounds.map(() => '<span>🐋</span>').join('')}</div>`);
    let r = 0;
    function next() {
      ctx.play.querySelectorAll('.order').forEach(e => e.remove());
      if (r >= rounds.length) { ctx.say(L.done, () => ctx.win(ctx.starsFromMistakes())); return; }
      const { n, big } = rounds[r];
      // สุ่มสัตว์ n ตัว แล้วเรียงตามขนาดจริง
      const picked = shuffle(ALL.map((_, k) => k)).slice(0, n).sort((a, b) => (big ? b - a : a - b));
      orderTap(ctx, {
        items: picked.map(k => ({ html: `<span class="sea-ico">${ALL[k]}</span><small>${L.names[k]}</small>`, say: L.names[k] })),
        ask: big ? L.big : L.small,
        wrong: big ? L.wrongBig : L.wrongSmall,
        btnClass: 'sea-btn',
        onDone: () => { dots.children[r].classList.add('on'); r++; ctx.say(L.right, next); }
      });
    }
    ctx.after(300, () => ctx.say(L.intro, next));
  },

  // ด่าน 3: แตะเก็บขยะที่ลอยอยู่ ระวังอย่าโดนปลา (3 รอบ ขยะมากขึ้นเรื่อยๆ)
  ctx => {
    const L = SAY.ocean.trash;
    const TRASH = ['🧴', '🛍️', '🥫', '🥤', '🧃'];
    const FISH = ['🐠', '🐟', '🐡', '🐙', '🐢'];
    const waves = [{ trash: 4, fish: 3 }, { trash: 6, fish: 4 }, { trash: 8, fish: 5 }];
    ctx.html('<div class="sea-water"></div>');
    const net = ctx.html('<div class="sea-net">🗑️ <b>0</b></div>');
    const dots = ctx.html(`<div class="round-dots side-dots">${waves.map(() => '<span>🌊</span>').join('')}</div>`);
    let w = 0, got = 0, left = 0;
    function wave() {
      ctx.play.querySelectorAll('.floater').forEach(e => e.remove());
      const { trash, fish } = waves[w];
      left = trash;
      const spots = shuffle(scatter(trash + fish, 260, 130, 6, 3, 150, 130));
      spots.forEach(([x, y], k) => {
        const isTrash = k < trash;
        const icon = isTrash ? TRASH[randInt(0, TRASH.length - 1)] : FISH[randInt(0, FISH.length - 1)];
        const el = ctx.html(`<button class="floater ${isTrash ? 'trash' : 'fish'}" style="left:${x}px;top:${y}px;animation-delay:${-Math.random() * 3}s">${icon}</button>`);
        el.onclick = () => {
          if (!ctx.alive || el.classList.contains('gone')) return;
          if (!isTrash) {
            el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake');
            ctx.mistake(L.fish);
            return;
          }
          el.classList.add('gone');
          got++; left--;
          net.querySelector('b').textContent = got;
          Sfx.tone(600 + got * 20, 0, 0.12, 'triangle');
          if (left > 0) return;
          Sfx.yay();
          dots.children[w].classList.add('on');
          w++;
          if (w < waves.length) ctx.say(L.wave, wave);
          else ctx.say(L.fact, () => deedThenWin(ctx, L,
            { icon: '🛍️🛍️', text: 'ขอถุงพลาสติกหลายๆ ใบ' },
            { icon: '👜♻️', text: 'ใช้ถุงผ้าที่นำมาเอง' }));
        };
      });
    }
    ctx.after(300, () => ctx.instruct(L.intro, wave));
  }
];
