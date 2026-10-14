// โครงของทุกด่าน: แถบด้านบน พี่หนูผู้ช่วย การลาก ตัวเลือกคนดี และหน้าจบด่าน
const LEVELS = {};

class LevelCtx {
  constructor(stage, isl, lv) {
    this.stage = stage;
    this.isl = isl;
    this.lv = lv;
    this.mistakes = 0;
    this.alive = true;
    this.instructionText = '';
    stage.innerHTML = `
      <div class="scene level ${isl.id}-level" style="--c:${isl.color}">
        <div class="level-bg"></div>
        <div class="play"></div>
        <div class="level-top">
          <button class="icon-btn back-btn" title="กลับแผนที่">✕</button>
          <div class="level-title">${isl.name} · ด่าน ${lv + 1}: ${isl.levels[lv]}</div>
          <button class="icon-btn replay-btn" title="ฟังอีกครั้ง">🔊</button>
        </div>
        <div class="level-guide">
          <div class="guide-kid"></div>
          <div class="guide-pinoo">${Characters.dressed("pinoo", 40)}</div>
          <div class="guide-ham">${Characters.ham()}</div>
          <div class="speech guide-speech hidden"><div class="speech-text"></div></div>
        </div>
      </div>`;
    this.root = stage.querySelector('.scene');
    this.play = stage.querySelector('.play');
    this.bubble = stage.querySelector('.guide-speech');
    this.pinoo = stage.querySelector('.level-guide .guide-pinoo');
    this.ham = stage.querySelector('.level-guide .guide-ham');
    this.kidEl = stage.querySelector('.level-guide .guide-kid');
    this.pose('idle');
    // ตอบถูกเมื่อไหร่ เด็กผู้เล่น ดีใจไปด้วย
    Sfx.onYay = () => { if (this.alive) this.pose('cheer', 1600); };
    stage.querySelector('.back-btn').onclick = () => { Sfx.pop(); this.exit('map'); };
    stage.querySelector('.replay-btn').onclick = () => this.say(this.instructionText);
  }

  exit(scene) { this.alive = false; App.show(scene); }

  // เปลี่ยนท่าของ เด็กผู้เล่น ที่มุมจอ ถ้าใส่เวลา จะกลับไปยืนรอเองเมื่อครบเวลา
  pose(name, ms) {
    clearTimeout(this.poseTimer);
    if (this.kidPose !== name) {
      this.kidPose = name;
      this.kidEl.innerHTML = Characters.dressed('kid', 26, undefined, name);
      this.kidEl.className = `guide-kid pose-${name}`;
    }
    if (ms) this.poseTimer = setTimeout(() => this.pose(this.deedOpen ? 'think' : 'idle'), ms);
  }

  // เรียกฟังก์ชันภายหลัง เฉพาะเมื่อยังอยู่ในด่านนี้
  after(ms, fn) { setTimeout(() => { if (this.alive) fn(); }, ms); }

  say(text, onend) {
    if (!text) return;
    // ใครพูด: พี่แฮม หรือพี่หนู
    const who = isHam(text) ? this.ham : this.pinoo;
    this.bubble.querySelector('.speech-text').textContent = shown(text);
    this.bubble.classList.toggle('ham-says', isHam(text));
    this.bubble.classList.remove('hidden', 'pop-in'); void this.bubble.offsetWidth; this.bubble.classList.add('pop-in');
    this.pinoo.classList.remove('talk'); this.ham.classList.remove('talk');
    who.classList.add('talk');
    Voice.say(text, { onend: () => { who.classList.remove('talk'); if (this.alive && onend) onend(); } });
  }

  // พูดหลายประโยคต่อกัน
  sayAll(texts, onend) {
    const [first, ...rest] = texts;
    if (!first) { onend && onend(); return; }
    this.say(first, () => this.sayAll(rest, onend));
  }

  instruct(text, onend) { this.instructionText = text; this.say(text, onend); }

  mistake(text) {
    this.mistakes++;
    Sfx.oops();
    this.pose('oops', 1500);
    const hint = this.mistakes % 3 === 2; // ถึงเวลาใบ้
    const lines = [text];
    if (hint) lines.push(SAY.hint);
    // ผิดบ่อยแล้ว พี่แฮมช่วยปลอบใจ
    else if (this.mistakes % 3 === 0) lines.push(SAY.ham.cheer[(this.mistakes / 3 - 1) % SAY.ham.cheer.length]);
    this.sayAll(lines);
    return hint;
  }

  starsFromMistakes() { return this.mistakes === 0 ? 3 : this.mistakes <= 2 ? 2 : 1; }

  html(markup) {
    const t = document.createElement('template');
    t.innerHTML = markup.trim();
    return this.play.appendChild(t.content.firstElementChild);
  }

  // ลากของไปวาง หรือคลิกเพื่อส่งของไปที่เป้าหมายเลย (เหมาะกับเด็กที่ยังลากเมาส์ไม่คล่อง)
  draggable(el, target, onDrop) {
    let start = null;
    const home = { left: el.style.left, top: el.style.top };
    const scale = () => this.stage.getBoundingClientRect().width / 1280;
    const goHome = () => {
      el.classList.add('returning');
      el.style.left = home.left; el.style.top = home.top;
      setTimeout(() => el.classList.remove('returning'), 350);
    };
    el.addEventListener('pointerdown', e => {
      if (el.classList.contains('used')) return;
      el.setPointerCapture(e.pointerId);
      start = { x: e.clientX, y: e.clientY, left: parseFloat(el.style.left), top: parseFloat(el.style.top), moved: false };
      el.classList.add('dragging');
    });
    el.addEventListener('pointermove', e => {
      if (!start) return;
      const dx = (e.clientX - start.x) / scale(), dy = (e.clientY - start.y) / scale();
      if (Math.abs(dx) + Math.abs(dy) > 8) start.moved = true;
      el.style.left = start.left + dx + 'px';
      el.style.top = start.top + dy + 'px';
    });
    el.addEventListener('pointerup', e => {
      if (!start) return;
      el.classList.remove('dragging');
      const r = target.getBoundingClientRect();
      const onTarget = !start.moved || (e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom);
      start = null;
      if (!onTarget) { goHome(); return; }
      if (!onDrop(el)) goHome();
    });
    return { goHome };
  }

  // ให้เลือกสิ่งที่ดี: ตัวเลือกไม่ดีจะได้คำอธิบายแล้วให้เลือกใหม่
  deed({ ask, bad, good, badLine, goodLine }, done) {
    const wrap = document.createElement('div');
    wrap.className = 'modal-bg deed-bg';
    wrap.innerHTML = `
      <div class="deed-card pop-in">
        <div class="card-kid think">${Characters.dressed('kid', 52, undefined, 'think')}</div>
        <div class="deed-title">💖 ${shown(ask)}</div>
        <div class="deed-options">
          <button class="deed-opt" data-good="0"><span>${bad.icon}</span>${bad.text}</button>
          <button class="deed-opt" data-good="1"><span>${good.icon}</span>${good.text}</button>
        </div>
      </div>`;
    if (Math.random() < 0.5) wrap.querySelector('.deed-options').append(wrap.querySelector('[data-good="0"]'));
    this.root.appendChild(wrap);
    this.deedOpen = true;
    this.root.classList.add('deed-open');
    this.pose('think');
    this.say(ask);
    wrap.querySelectorAll('.deed-opt').forEach(b => {
      b.onclick = () => {
        if (b.dataset.good === '0') {
          Sfx.oops();
          b.classList.add('shake', 'faded');
          this.say(badLine);
          return;
        }
        Sfx.yay();
        b.classList.add('chosen');
        this.deedOpen = false;
        const cardKid = wrap.querySelector('.card-kid');
        cardKid.className = 'card-kid cheer';
        cardKid.innerHTML = Characters.dressed('kid', 52, undefined, 'cheer');
        Save.data.deeds[`${this.isl.id}-${this.lv}`] = true;
        Save.write();
        this.medal = true;
        this.after(900, () => { wrap.remove(); this.root.classList.remove('deed-open'); this.say(goodLine, done); });
      };
    });
  }

  // ให้เหรียญคนดีโดยไม่ต้องมีคำถาม (ใช้ในเกาะหัวใจที่ทั้งด่านคือเรื่องคนดี)
  giveMedal() {
    Save.data.deeds[`${this.isl.id}-${this.lv}`] = true;
    Save.write();
    this.medal = true;
  }

  win(stars) {
    this.alive = false; // ปิดการโต้ตอบในด่าน
    const isl = this.isl, lv = this.lv;
    const data = Save.data;
    const firstClear = data.stars[isl.id][lv] === 0;
    data.stars[isl.id][lv] = Math.max(data.stars[isl.id][lv], stars);
    const sticker = isl.stickers[lv];
    const newSticker = !data.stickers.includes(sticker);
    if (newSticker) data.stickers.push(sticker);
    const idx = ISLANDS.indexOf(isl);
    if (firstClear && lv === 2 && idx < ISLANDS.length - 1) data.justUnlocked = idx + 1;
    if (firstClear && ISLANDS.every(i => data.stars[i.id].every(s => s > 0))) data.justFinished = true;
    // สถิติสำหรับหน้าผู้ปกครอง
    const key = `${isl.id}-${lv}`;
    const st = data.stats[key] || { plays: 0, mistakes: 0, lastMistakes: 0 };
    st.plays++;
    st.mistakes += this.mistakes;
    st.lastMistakes = this.mistakes;
    st.last = Date.now();
    data.stats[key] = st;
    Save.write();

    Sfx.yay();
    const wrap = document.createElement('div');
    wrap.className = 'modal-bg win-bg';
    wrap.innerHTML = `
      <div class="confetti">${Array.from({ length: 40 }, (_, i) =>
        `<i style="left:${Math.random() * 100}%;animation-delay:${Math.random() * 1.5}s;background:${['#FF7A59', '#FFC83D', '#7BD389', '#9AD0F5', '#FFB3CF'][i % 5]}"></i>`).join('')}</div>
      <div class="win-card pop-in">
        <div class="card-kid cheer">${Characters.dressed('kid', 52, undefined, 'cheer')}</div>
        <div class="win-friends"><div class="wf-pinoo">${Characters.dressed('pinoo', 30)}</div><div class="wf-ham">${Characters.ham()}</div></div>
        <div class="win-title">เก่งมาก ${CHILD.display}!</div>
        <div class="win-stars">${[0, 1, 2].map(i => `<span class="${i < stars ? 'on' : ''}" style="animation-delay:${0.3 + i * 0.35}s">★</span>`).join('')}</div>
        <div class="win-rewards">
          <div class="reward"><div class="reward-icon">${sticker}</div>${newSticker ? 'สติกเกอร์ใหม่!' : 'สติกเกอร์'}</div>
          ${this.medal ? '<div class="reward"><div class="reward-icon">🏅</div>เหรียญคนดี</div>' : ''}
        </div>
        <div class="win-btns">
          <button class="pill-btn again">↻ เล่นอีกครั้ง</button>
          <button class="pill-btn to-map">🗺️ แผนที่</button>
          ${lv < isl.levels.length - 1 ? '<button class="pill-btn next">ด่านต่อไป ➜</button>' : ''}
        </div>
      </div>`;
    this.root.appendChild(wrap);
    this.root.classList.add('won');
    const lines = [SAY.win[stars - 1]];
    if (newSticker) lines.push(SAY.newSticker);
    if (this.medal) lines.push(SAY.medal);
    if (stars === 3) lines.push(SAY.ham.proud[Math.floor(Math.random() * SAY.ham.proud.length)]);
    const speak = (list) => { if (list.length) Voice.say(list[0], { onend: () => speak(list.slice(1)) }); };
    setTimeout(() => speak(lines), 400);
    wrap.querySelector('.again').onclick = () => { Sfx.pop(); Level.start(this.stage, isl, lv); };
    wrap.querySelector('.to-map').onclick = () => { Sfx.pop(); App.show('map'); };
    wrap.querySelector('.next')?.addEventListener('click', () => { Sfx.pop(); Level.start(this.stage, isl, lv + 1); });
  }
}

const Level = {
  start(stage, isl, lv) {
    const def = LEVELS[isl.id]?.[lv];
    if (!def) { App.toast(SAY.levelSoon); return; }
    Voice.reset();
    def(new LevelCtx(stage, isl, lv));
  }
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
