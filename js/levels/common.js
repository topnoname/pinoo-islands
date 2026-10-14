// แม่แบบด่านที่ใช้ซ้ำในเกาะทะเลชั้นนอก: แยกกลุ่ม / ตอบคำถามจากภาพ / แตะเรียงลำดับ

// แยกของทีละชิ้นลงกลุ่มที่ถูก (เช่น กลางวัน-กลางคืน, ทะเล-บก)
// items: [{icon, name, bin, ask, right}], bins: [{id, icon, label}]
function sortOne(ctx, { items, bins, wrong, dotsIcon = '⭐', onDone, onPlace }) {
  const dots = ctx.html(`<div class="round-dots side-dots">${items.map(() => `<span>${dotsIcon}</span>`).join('')}</div>`);
  const binEls = bins.map((b, k) => {
    const el = ctx.html(`<button class="sort-bin" style="left:${640 - bins.length * 140 + 20 + k * 280}px"><span>${b.icon}</span>${b.label}</button>`);
    el.onclick = () => choose(b, el);
    return el;
  });
  let i = 0, busy = true, card;

  function next() {
    if (i >= items.length) { onDone(); return; }
    const it = items[i];
    card = ctx.html(`<div class="sort-card pop-in"><span>${it.icon}</span><small>${it.name}</small></div>`);
    ctx.instruct(it.ask);
    busy = false;
  }

  function choose(b, el) {
    if (busy || !ctx.alive || !card) return;
    const it = items[i];
    if (b.id !== it.bin) {
      el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake');
      if (ctx.mistake(it.wrong || wrong)) binEls[bins.findIndex(x => x.id === it.bin)].classList.add('hint-glow');
      return;
    }
    busy = true;
    Sfx.yay();
    binEls.forEach(x => x.classList.remove('hint-glow'));
    const r = el.getBoundingClientRect(), s = ctx.stage.getBoundingClientRect(), sc = s.width / 1280;
    card.classList.add('flying');
    card.style.left = (r.left - s.left) / sc + r.width / sc / 2 - 100 + 'px';
    card.style.top = (r.top - s.top) / sc - 60 + 'px';
    dots.children[i].classList.add('on');
    if (onPlace) onPlace(it, b);
    const done = card;
    ctx.say(it.right, () => { done.remove(); card = null; i++; next(); });
  }

  return { start: next };
}

// คำถามจากภาพ เลือกคำตอบที่ถูก
// rounds: [{scene, ask, options: [{html, ok}], right, wrong, after}]
function quiz(ctx, { rounds, dotsIcon = '⭐', onDone, optClass = '' }) {
  const dots = ctx.html(`<div class="round-dots side-dots">${rounds.map(() => `<span>${dotsIcon}</span>`).join('')}</div>`);
  let r = 0, busy = false;
  function next() {
    ctx.play.querySelectorAll('.quiz').forEach(e => e.remove());
    if (r >= rounds.length) { onDone(); return; }
    const rd = rounds[r];
    const sceneEl = ctx.html(`<div class="quiz quiz-scene pop-in">${rd.scene}</div>`);
    const n = rd.options.length;
    const w = n > 3 ? 190 : 230;
    const btns = rd.options.map((o, k) => {
      const b = ctx.html(`<button class="quiz quiz-opt ${optClass}" style="left:${640 - (n * (w + 20)) / 2 + k * (w + 20)}px;width:${w}px">${o.html}</button>`);
      b.onclick = () => {
        if (busy || !ctx.alive) return;
        if (!o.ok) {
          b.classList.add('shake', 'faded');
          if (ctx.mistake(rd.wrong)) btns[rd.options.findIndex(x => x.ok)].classList.add('hint-glow');
          return;
        }
        busy = true;
        Sfx.yay();
        b.classList.add('correct');
        dots.children[r].classList.add('on');
        if (rd.after) rd.after(sceneEl);
        ctx.say(rd.right, () => { busy = false; r++; next(); });
      };
      return b;
    });
    ctx.instruct(rd.ask);
  }
  return { start: next };
}

// แตะของให้เรียงตามลำดับที่ถูก (เช่น เล็กไปใหญ่ ขั้นตอนล้างมือ นับถอยหลัง)
// items: เรียงตามลำดับที่ถูกแล้ว [{html, say}] ระบบจะสลับตำแหน่งให้เอง
function orderTap(ctx, { items, ask, wrong, onDone, onStep, rowY = 380, btnY = 150, btnClass = '', hideRow = false }) {
  const n = items.length;
  const slotW = Math.min(170, 1000 / n);
  const row = ctx.html(`<div class="order order-row ${hideRow ? 'hidden' : ''}" style="top:${rowY}px">${items.map(() => `<i style="width:${slotW - 14}px"></i>`).join('')}</div>`);
  const order = shuffle(items.map((_, k) => k));
  let want = 0, busy = false;
  const btns = order.map((k, pos) => {
    const b = ctx.html(`<button class="order order-btn ${btnClass}" style="left:${640 - (n * slotW) / 2 + pos * slotW + 7}px;top:${btnY}px;width:${slotW - 14}px">${items[k].html}</button>`);
    b.onclick = () => {
      if (busy || !ctx.alive || b.classList.contains('used')) return;
      if (k !== want) {
        b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake');
        if (ctx.mistake(wrong)) btns[order.indexOf(want)].classList.add('hint-glow');
        return;
      }
      b.classList.remove('hint-glow');
      b.classList.add('used');
      const slot = row.children[want];
      slot.innerHTML = items[k].html;
      slot.classList.add('filled', 'pop-in');
      Sfx.tone(440 + want * 70, 0, 0.15, 'triangle');
      if (items[k].say) Voice.aside(items[k].say);
      if (onStep) onStep(want);
      want++;
      if (want === n) { busy = true; Sfx.yay(); ctx.after(500, onDone); }
    };
    return b;
  });
  ctx.instruct(ask);
  return { row, btns };
}

// คำถามคนดีแล้วจบด่าน (พูดขอบคุณจากเพื่อนบนเกาะครั้งแรกที่ผ่านด่าน 3)
function deedThenWin(ctx, L, bad, good) {
  ctx.deed({ ask: L.deedAsk, bad, good, badLine: L.deedBad, goodLine: L.deedGood }, () => winWithThanks(ctx, L));
}
function winWithThanks(ctx, L) {
  if (L.islandDone && Save.data.stars[ctx.isl.id][ctx.lv] === 0) ctx.say(L.islandDone, () => ctx.win(ctx.starsFromMistakes()));
  else ctx.win(ctx.starsFromMistakes());
}
// สุ่มเลือกของจากแต่ละกลุ่มให้เท่าๆ กัน แล้วสลับลำดับ
function pickEach(items, key, perGroup) {
  const groups = {};
  items.forEach(it => { (groups[it[key]] = groups[it[key]] || []).push(it); });
  return shuffle(Object.values(groups).flatMap(g => shuffle(g).slice(0, perGroup)));
}
