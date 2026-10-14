// เกาะหัวใจ (เด็กดีมีน้ำใจ): คำพูดวิเศษ / เก็บขยะแยกถัง / เข้าใจหัวใจเพื่อน

function sceneCard(ctx, scene, story) {
  ctx.play.querySelector('.scene-card')?.remove();
  return ctx.html(`<div class="scene-card pop-in">
    <div class="scene-emoji"><span class="elephant">🐘</span>${scene}</div>
    <div class="scene-story">${shown(story)}</div></div>`);
}

LEVELS.heart = [
  // ด่าน 1: เลือกคำพูดที่เหมาะกับสถานการณ์
  ctx => {
    const L = SAY.heart.words;
    const phrases = L.situations.map(s => s.answer);
    const dots = ctx.html(`<div class="round-dots heart-dots">${L.situations.map(() => '<span>💖</span>').join('')}</div>`);
    let round = 0, busy = false;

    function setup() {
      ctx.play.querySelectorAll('.phrase-btn').forEach(e => e.remove());
      const s = L.situations[round];
      sceneCard(ctx, s.scene, s.story);
      const opts = shuffle([s.answer, ...shuffle(phrases.filter(p => p !== s.answer)).slice(0, 2)]);
      const btns = opts.map((p, k) => {
        const b = ctx.html(`<button class="phrase-btn" style="left:${300 + k * 200}px">💬<br>${CHILD.polite(p)}</button>`);
        b.onclick = () => {
          if (busy || !ctx.alive) return;
          if (p !== s.answer) {
            b.classList.add('shake', 'faded');
            if (ctx.mistake(L.wrong)) btns[opts.indexOf(s.answer)].classList.add('hint-glow');
            return;
          }
          busy = true;
          Sfx.yay();
          b.classList.add('correct');
          dots.children[round].classList.add('on');
          ctx.say(s.right, () => {
            busy = false;
            if (round < L.situations.length - 1) { round++; setup(); ctx.instruct(L.situations[round].story); return; }
            ctx.say(L.done, () => { ctx.giveMedal(); ctx.win(ctx.starsFromMistakes()); });
          });
        };
        return b;
      });
    }
    setup();
    ctx.after(300, () => ctx.say(L.intro, () => ctx.instruct(L.situations[0].story)));
  },

  // ด่าน 2: ทิ้งขยะลงถังสีที่ถูกต้อง
  ctx => {
    const L = SAY.heart.trash;
    const items = shuffle(L.items);
    const bins = [
      { id: 'green', label: 'เศษอาหาร', icon: '🍂', color: '#5DBB63' },
      { id: 'yellow', label: 'รีไซเคิล', icon: '♻️', color: '#F2CC3D' },
      { id: 'blue', label: 'ทั่วไป', icon: '🗑️', color: '#5B8FD9' }
    ];
    ctx.html('<div class="park-tree">🌳</div>');
    ctx.html('<div class="park-tree right">🌳</div>');
    const dots = ctx.html(`<div class="round-dots heart-dots">${items.map(() => '<span>✨</span>').join('')}</div>`);
    const binEls = bins.map((b, k) => {
      const el = ctx.html(`<button class="bin" style="left:${330 + k * 230}px;--bin:${b.color}">
        <span class="bin-lid"></span><span class="bin-icon">${b.icon}</span><span class="bin-label">${b.label}</span></button>`);
      el.onclick = () => drop(b, el);
      return el;
    });
    let i = 0, busy = true, cur = null;

    function next() {
      if (i >= items.length) { ctx.say(L.done, () => { ctx.giveMedal(); ctx.win(ctx.starsFromMistakes()); }); return; }
      const it = items[i];
      cur = ctx.html(`<div class="trash-item"><span>${it.icon}</span><small>${it.name}</small></div>`);
      ctx.instruct(it.ask);
      busy = false;
    }
    function drop(b, el) {
      if (busy || !cur || !ctx.alive) return;
      const it = items[i];
      if (b.id !== it.bin) {
        el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake');
        if (ctx.mistake(L.wrong)) binEls[bins.findIndex(x => x.id === it.bin)].classList.add('hint-glow');
        return;
      }
      busy = true;
      Sfx.yay();
      binEls.forEach(x => x.classList.remove('hint-glow'));
      const k = bins.indexOf(b);
      cur.classList.add('tossed');
      cur.style.left = 330 + k * 230 + 40 + 'px';
      el.classList.add('gulp');
      setTimeout(() => el.classList.remove('gulp'), 600);
      dots.children[i].classList.add('on');
      const done = cur;
      ctx.say(L.right[b.id], () => { done.remove(); i++; next(); });
    }
    ctx.after(300, () => ctx.say(L.intro, next));
  },

  // ด่าน 3: ดูว่าเพื่อนรู้สึกอย่างไร แล้วเลือกวิธีช่วย
  ctx => {
    const L = SAY.heart.feelings;
    const feelings = [
      { id: 'happy', icon: '😊', label: 'ดีใจ' },
      { id: 'sad', icon: '😢', label: 'เสียใจ' },
      { id: 'scared', icon: '😨', label: 'กลัว' },
      { id: 'angry', icon: '😠', label: 'โกรธ' }
    ];
    const dots = ctx.html(`<div class="round-dots heart-dots">${L.scenes.map(() => '<span>🤗</span>').join('')}</div>`);
    let round = 0, busy = false;

    function setup() {
      ctx.play.querySelectorAll('.feel-btn').forEach(e => e.remove());
      const s = L.scenes[round];
      sceneCard(ctx, s.scene, s.story);
      const btns = feelings.map((f, k) => {
        const b = ctx.html(`<button class="feel-btn" style="left:${300 + k * 150}px"><span>${f.icon}</span>${f.label}</button>`);
        b.onclick = () => {
          if (busy || !ctx.alive) return;
          if (f.id !== s.feel) {
            b.classList.add('shake', 'faded');
            if (ctx.mistake(L.wrong)) btns[feelings.findIndex(x => x.id === s.feel)].classList.add('hint-glow');
            return;
          }
          busy = true;
          Sfx.yay();
          b.classList.add('correct');
          ctx.say(s.right, () => ctx.deed({
            ask: s.helpAsk, bad: s.bad, good: s.good, badLine: L.helpWrong, goodLine: s.helpRight
          }, () => {
            dots.children[round].classList.add('on');
            busy = false;
            if (round < L.scenes.length - 1) { round++; setup(); ctx.instruct(L.scenes[round].story); return; }
            ctx.say(L.done, () => {
              if (Save.data.stars.heart[2] === 0) ctx.say(L.islandDone, () => ctx.win(ctx.starsFromMistakes()));
              else ctx.win(ctx.starsFromMistakes());
            });
          }));
        };
        return b;
      });
    }
    setup();
    ctx.after(300, () => ctx.say(L.intro, () => ctx.instruct(L.scenes[0].story)));
  }
];
