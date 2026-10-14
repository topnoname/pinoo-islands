// ตัวควบคุมหลักของเกม: บันทึกผล ย่อขยายจอ และสลับฉาก
// เก็บผู้เล่นหลายคนในเครื่องเดียว แต่ละคนมีดาว สติกเกอร์ ชุด ห้องนอน และสถิติของตัวเอง
const Save = {
  key: 'pinoo-islands-v1',
  all: { players: [], current: null },
  data: null,
  player: null,

  load() {
    try { this.all = JSON.parse(localStorage.getItem(this.key)) || this.all; } catch (e) { /* ใช้ค่าเริ่มต้น */ }
    this.all.players = this.all.players || [];
    this.use(this.all.current);
  },

  // เลือกผู้เล่น (ถ้าไม่มี data จะเป็น null จนกว่าจะเลือกหรือสร้างผู้เล่น)
  use(id) {
    this.player = this.all.players.find(p => p.id === id) || null;
    this.all.current = this.player ? this.player.id : null;
    this.data = this.player ? this.fill(this.player.data) : null;
    if (this.player) this.player.data = this.data;
  },

  // เติมค่าที่ยังไม่มี เผื่อเกมมีด่านหรือของใหม่เพิ่มเข้ามา
  fill(d = {}) {
    d.stars = d.stars || {};
    ISLANDS.forEach(i => { d.stars[i.id] = i.levels.map((_, lv) => (d.stars[i.id] || [])[lv] || 0); });
    d.stickers = d.stickers || [];
    d.deeds = d.deeds || {};
    d.stats = d.stats || {};
    d.outfit = d.outfit || { kid: {}, pinoo: {} };
    d.room = d.room || { wall: 'frame', lamp: 'bulb', shelf: 'books', rug: 'pink' };
    d.playSeconds = d.playSeconds || 0;
    d.introSeen = !!d.introSeen;
    return d;
  },

  addPlayer(name, gender) {
    const id = 'p' + Date.now().toString(36);
    this.all.players.push({ id, name, gender, data: {} });
    this.use(id);
    this.write();
  },

  removePlayer(id) {
    this.all.players = this.all.players.filter(p => p.id !== id);
    if (this.all.current === id) this.use(null);
    this.write();
  },

  medals() { return Object.keys(this.data.deeds).length; },
  allDone() { return ISLANDS.every(i => this.data.stars[i.id].every(s => s > 0)); },
  write() { try { localStorage.setItem(this.key, JSON.stringify(this.all)); } catch (e) { /* โหมดส่วนตัว */ } },
  islandStars(id) { return this.data.stars[id].reduce((a, b) => a + b, 0); },
  totalStars() { return ISLANDS.reduce((a, i) => a + this.islandStars(i.id), 0); },
  islandUnlocked(idx) { return idx === 0 || this.data.stars[ISLANDS[idx - 1].id][2] > 0; },
  levelUnlocked(id, lv) { return lv === 0 || this.data.stars[id][lv - 1] > 0; }
};

const App = {
  stage: null,

  init() {
    Characters.injectDefs();
    Voice.init();
    Save.load();
    Voice.enabled = Sfx.enabled = !(Save.data && Save.data.muted);
    this.stage = document.getElementById('stage');
    this.fit();
    window.addEventListener('resize', () => this.fit());
    this.show('title');
    // นับเวลาเล่นสำหรับหน้าผู้ปกครอง
    setInterval(() => {
      if (document.visibilityState === 'visible' && Save.data) { Save.data.playSeconds += 15; Save.write(); }
    }, 15000);
  },

  // ออกแบบที่ขนาด 1280x720 แล้วย่อขยายให้พอดีหน้าจอ
  fit() {
    const s = Math.min(window.innerWidth / 1280, window.innerHeight / 720);
    this.stage.style.transform = `translate(-50%, -50%) scale(${s})`;
  },

  show(name) {
    Voice.reset();
    Sfx.onYay = null;
    this.stage.innerHTML = '';
    Scenes[name](this.stage);
  },

  toast(text, speak = true) {
    document.querySelectorAll('.toast').forEach(t => t.remove());
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = shown(text);
    this.stage.appendChild(t);
    if (speak) Voice.say(text);
    setTimeout(() => t.remove(), 3200);
  }
};

const Scenes = {
  // ---------- หน้าแรก: สนามบิน ----------
  title(stage) {
    stage.innerHTML = `
      <div class="scene airport">
        ${Scenes.airportBackdrop()}
        <div class="logo-card pop-in">
          <div class="logo-small">✈ เกมผจญภัยเรียนรู้ STEM</div>
          <h1><span class="pinoo-name">พี่หนู</span>พาตะลุย</h1>
          <div class="logo-sub">หมู่เกาะความรู้</div>
          <div class="stem-chips">
            <span style="background:#7BD389">S</span><span style="background:#9AD0F5">T</span>
            <span style="background:#FFC98B">E</span><span style="background:#FFE27A">M</span>
            <span style="background:#FFB3CF">♥</span>
          </div>
        </div>
        <div class="hero-kid bob">${Characters.dressed("kid", 80)}</div>
        <div class="hero-pinoo on-head">${Characters.dressed("pinoo", 46)}</div>
        <div class="hero-ham">${Characters.ham()}</div>
        <button class="big-btn play-btn">▶ เริ่มเล่น</button>
        <div class="voice-warn hidden">🔈 ไม่พบเสียงภาษาไทยในเบราว์เซอร์นี้ แนะนำเปิดเกมด้วย Microsoft Edge</div>
      </div>`;
    stage.querySelector('.play-btn').onclick = () => {
      Sfx.pop();
      App.show(Save.all.players.length ? 'players' : 'newPlayer');
    };
    setTimeout(() => {
      if (!Voice.hasThai()) stage.querySelector('.voice-warn')?.classList.remove('hidden');
    }, 1500);
  },

  // ---------- เลือกผู้เล่น ----------
  players(stage) {
    const list = Save.all.players;
    const starsOf = p => Object.values((p.data && p.data.stars) || {}).flat().reduce((a, b) => a + b, 0);
    stage.innerHTML = `
      <div class="scene players-scene">
        <div class="players-title">วันนี้ใครจะเล่นนะ? 🎈</div>
        <div class="player-grid">
          ${list.map(p => `
            <button class="player-card" data-id="${p.id}">
              <div class="player-face">${Characters.dressed('kid', 30, p.data && p.data.outfit ? p.data.outfit.kid : {}, 'wave', p.gender)}</div>
              <b></b><small>⭐ ${starsOf(p)}</small>
            </button>`).join('')}
          ${list.length < 6 ? '<button class="player-card add-card"><span>➕</span><b>ผู้เล่นใหม่</b></button>' : ''}
        </div>
        <button class="icon-btn players-home" title="หน้าแรก">🏠</button>
        <div class="players-pinoo">${Characters.dressed('pinoo', 30)}</div>
      </div>`;
    // ใส่ชื่อด้วย textContent เพื่อไม่ให้ตัวอักษรพิเศษในชื่อกลายเป็นโค้ด
    stage.querySelectorAll('.player-card[data-id]').forEach(c => {
      c.querySelector('b').textContent = list.find(p => p.id === c.dataset.id).name;
      c.onclick = () => {
        Sfx.pop();
        Save.use(c.dataset.id);
        Save.write();
        Voice.enabled = Sfx.enabled = !Save.data.muted;
        App.show(Save.data.introSeen ? 'map' : 'intro');
      };
    });
    const add = stage.querySelector('.add-card');
    if (add) add.onclick = () => { Sfx.pop(); App.show('newPlayer'); };
    stage.querySelector('.players-home').onclick = () => { Sfx.pop(); App.show('title'); };
    setTimeout(() => Voice.say(SAY.playersAsk), 300);
  },

  newPlayer(stage) {
    stage.innerHTML = `
      <div class="scene players-scene">
        <div class="new-step name-step">
          <div class="players-title">หนูชื่ออะไรจ๊ะ? ✏️</div>
          <input class="name-input" maxlength="12" placeholder="พิมพ์ชื่อตรงนี้" autocomplete="off">
          <button class="big-btn name-next">ต่อไป ➜</button>
        </div>
        <div class="new-step gender-step hidden">
          <div class="players-title"></div>
          <div class="gender-row">
            <button class="gender-card" data-g="boy"><div class="gender-kid">${Characters.dressed('kid', 50, {}, 'wave', 'boy')}</div><b>เด็กผู้ชาย</b></button>
            <button class="gender-card" data-g="girl"><div class="gender-kid">${Characters.dressed('kid', 50, {}, 'wave', 'girl')}</div><b>เด็กผู้หญิง</b></button>
          </div>
        </div>
        <button class="icon-btn players-home" title="กลับ">⬅</button>
        <div class="players-pinoo">${Characters.dressed('pinoo', 30)}</div>
      </div>`;
    const input = stage.querySelector('.name-input');
    let name = '';
    setTimeout(() => input.focus(), 100);
    const next = () => {
      name = input.value.trim();
      if (!name) { Sfx.oops(); Voice.say(SAY.nameEmpty); input.focus(); return; }
      Sfx.pop();
      stage.querySelector('.name-step').classList.add('hidden');
      const g = stage.querySelector('.gender-step');
      g.classList.remove('hidden');
      g.querySelector('.players-title').textContent = `${name} เป็นเด็กผู้ชายหรือเด็กผู้หญิงจ๊ะ?`;
      Voice.say(SAY.pickGender);
    };
    stage.querySelector('.name-next').onclick = next;
    input.addEventListener('keydown', e => { if (e.key === 'Enter') next(); });
    stage.querySelectorAll('.gender-card').forEach(c => {
      c.onclick = () => {
        if (stage.querySelector('.gender-card.chosen')) return;
        Sfx.yay();
        Save.addPlayer(name, c.dataset.g);
        Voice.enabled = Sfx.enabled = true;
        c.classList.add('chosen');
        // ไปต่อเมื่อพูดจบ หรือไม่เกิน 4 วินาที (กันค้างถ้าเสียงเล่นไม่ได้)
        let gone = false;
        const go = () => { if (!gone) { gone = true; App.show('intro'); } };
        Voice.say(SAY.welcomeNew, { onend: go });
        setTimeout(go, 4000);
      };
    });
    stage.querySelector('.players-home').onclick = () => { Sfx.pop(); App.show(Save.all.players.length ? 'players' : 'title'); };
    setTimeout(() => Voice.say(SAY.newName), 300);
  },

  airportBackdrop() {
    return `
      <div class="window-sky">
        <div class="cloud c1"></div><div class="cloud c2"></div><div class="cloud c3"></div>
        <div class="runway"></div>
        <div class="window-plane">${Characters.plane()}</div>
      </div>
      <div class="window-frame">
        <div class="mullion" style="left:420px"></div>
        <div class="mullion" style="left:850px"></div>
        <div class="transom"></div>
      </div>
      <div class="floor"><div class="carpet"></div></div>`;
  },

  // ---------- เนื้อเรื่องเปิดเกม ----------
  intro(stage) {
    stage.innerHTML = `
      <div class="scene airport">
        ${Scenes.airportBackdrop()}
        <div class="hero-kid">${Characters.dressed("kid", 80)}</div>
        <div class="hero-pinoo on-head">${Characters.dressed("pinoo", 46)}</div>
        <div class="hero-ham hidden">${Characters.ham()}</div>
        <div class="speech hidden"><div class="speech-text"></div>
          <button class="replay" title="ฟังอีกครั้ง">🔊</button></div>
        <button class="big-btn next-btn hidden">ถัดไป ➜</button>
        <button class="skip-btn">ข้าม ⏭</button>
      </div>`;
    const lines = SAY.intro;
    const pinoo = stage.querySelector('.hero-pinoo');
    const ham = stage.querySelector('.hero-ham');
    const speech = stage.querySelector('.speech');
    const text = stage.querySelector('.speech-text');
    const next = stage.querySelector('.next-btn');
    let i = 0;
    const showLine = () => {
      const who = isHam(lines[i]) ? ham : pinoo;
      // พี่แฮมลอยออกมาตอนที่ถึงบทของตัวเองครั้งแรก
      if (who === ham && ham.classList.contains('hidden')) { ham.classList.remove('hidden'); ham.classList.add('pop-in'); Sfx.pop(); }
      text.textContent = shown(lines[i]);
      speech.classList.toggle('ham-says', who === ham);
      speech.classList.remove('hidden');
      speech.classList.remove('pop-in'); void speech.offsetWidth; speech.classList.add('pop-in');
      next.textContent = i === lines.length - 1 ? 'ขึ้นเครื่องบิน ✈' : 'ถัดไป ➜';
      // ประโยคสุดท้าย เด็กผู้เล่น ชูมือดีใจพร้อมออกเดินทาง
      if (i === lines.length - 1) stage.querySelector('.hero-kid').innerHTML = Characters.dressed('kid', 80, undefined, 'cheer');
      next.classList.remove('hidden');
      pinoo.classList.remove('talk'); ham.classList.remove('talk');
      who.classList.add('talk');
      Voice.say(lines[i], { onend: () => who.classList.remove('talk') });
    };
    // พี่หนูกระโดดลงจากหัว เด็กผู้เล่น มายืนข้างๆ ก่อนเริ่มพูด
    setTimeout(() => { pinoo.classList.remove('on-head'); pinoo.classList.add('beside'); Sfx.pop(); }, 400);
    setTimeout(showLine, 1300);
    stage.querySelector('.replay').onclick = () => Voice.say(lines[i]);
    const takeoff = () => {
      Save.data.introSeen = true; Save.write();
      Voice.reset(); Sfx.whoosh();
      stage.querySelector('.scene').classList.add('takeoff');
      setTimeout(() => App.show('map'), 2200);
    };
    next.onclick = () => {
      Sfx.pop();
      if (i < lines.length - 1) { i++; showLine(); } else takeoff();
    };
    stage.querySelector('.skip-btn').onclick = takeoff;
  },

  // ---------- แผนที่หมู่เกาะ ----------
  map(stage) {
    // แผนที่มีสองทะเล: หมู่เกาะแรก (region 1) และทะเลชั้นนอก (region 2)
    const unlockedIdx = Save.data.justUnlocked;
    if (unlockedIdx != null) Save.data.mapRegion = ISLANDS[unlockedIdx].region;
    const outerFirst = ISLANDS.findIndex(i => i.region === 2);
    const outerOpen = Save.islandUnlocked(outerFirst);
    let region = Save.data.mapRegion === 2 && outerOpen ? 2 : 1;
    const here = ISLANDS.map((isl, k) => ({ isl, k })).filter(o => o.isl.region === region);
    const centers = here.map(({ isl }) => [isl.x + 120, isl.y + 90]);
    const path = centers.map((c, k) => (k ? 'L' : 'M') + c.join(' ')).join(' ');
    // เกาะล่าสุดที่เปิดในทะเลนี้ (เครื่องบินจอดอยู่ตรงนั้น)
    let cur = 0;
    here.forEach((o, n) => { if (Save.islandUnlocked(o.k)) cur = n; });
    const current = here[cur].k;
    stage.innerHTML = `
      <div class="scene ocean ${region === 2 ? 'outer' : ''}">
        <div class="waves"></div>
        <div class="cloud c1"></div><div class="cloud c2"></div>
        <svg class="route" viewBox="0 0 1280 720"><path d="${path}"/></svg>
        ${here.map(({ isl, k }) => Scenes.islandHTML(isl, k)).join('')}
        <div class="map-plane" style="left:${centers[cur][0] - 70}px;top:${centers[cur][1] - 150}px">${Characters.plane()}</div>
        <button class="region-btn ${region === 1 && !outerOpen ? 'locked' : ''}" data-act="region">${region === 1
          ? `${outerOpen ? '' : '🔒 '}🌌 ทะเลชั้นนอก ➜`
          : '⬅ 🏝️ หมู่เกาะแรก'}</button>
        <div class="topbar">
          <button class="icon-btn" data-act="home" title="หน้าแรก">🏠</button>
          <div class="star-count">⭐ ${Save.totalStars()} / ${MAX_STARS}</div>
          <div class="star-count medal-count" title="เหรียญคนดี">🏅 ${Save.medals()}</div>
          <div class="spacer"></div>
          <button class="pill-btn" data-act="stickers">📒 สติกเกอร์</button>
          <button class="pill-btn" data-act="room">🛏️ ห้องนอน</button>
          <button class="pill-btn" data-act="dress">👗 แต่งตัว</button>
          <button class="pill-btn" data-act="parent">👨‍👩‍👧 ผู้ปกครอง</button>
          <button class="icon-btn" data-act="sound" title="เปิด/ปิดเสียง">${Voice.enabled ? '🔊' : '🔇'}</button>
        </div>
        <div class="guide">
          <div class="speech small pop-in"><div class="speech-text">${Save.allDone() ? SAY.allDone : SAY.mapWelcome(ISLANDS[current])}</div></div>
          <div class="guide-pinoo">${Characters.dressed("pinoo", 34)}</div>
        </div>
      </div>`;
    // เพิ่งปลดล็อกเกาะใหม่: ฉลองและพาไปเกาะนั้น
    const unlocked = Save.data.justUnlocked;
    if (unlocked != null) {
      delete Save.data.justUnlocked; Save.write();
      const el = stage.querySelector(`.island[data-idx="${unlocked}"]`);
      el.classList.add("new-unlock");
      // เปิดทะเลชั้นนอกครั้งแรก: บอกก่อนว่ามาถึงทะเลใหม่
      const first = unlocked === outerFirst;
      setTimeout(() => {
        Sfx.yay();
        if (first) Voice.say(SAY.outerOpen, { onend: () => Voice.say(SAY.islandUnlocked(ISLANDS[unlocked])) });
        else Voice.say(SAY.islandUnlocked(ISLANDS[unlocked]));
      }, 400);
    } else if (Save.data.justFinished) {
      delete Save.data.justFinished; Save.write();
      Scenes.certificate(stage);
    } else {
      setTimeout(() => Voice.say(Save.allDone() ? SAY.allDone : SAY.mapWelcome(ISLANDS[current])), 400);
    }

    stage.querySelectorAll('.island').forEach(el => {
      el.onclick = () => {
        const k = +el.dataset.idx;
        if (!Save.islandUnlocked(k)) {
          Sfx.oops();
          el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake');
          Voice.say(SAY.islandLocked);
          return;
        }
        Sfx.pop();
        Scenes.islandModal(stage, ISLANDS[k]);
      };
    });
    stage.querySelectorAll('[data-act]').forEach(b => {
      b.onclick = () => {
        Sfx.pop();
        const act = b.dataset.act;
        if (act === 'home') App.show('title');
        else if (act === 'region') {
          if (region === 1 && !outerOpen) { Sfx.oops(); Voice.say(SAY.outerLocked); return; }
          Save.data.mapRegion = region === 1 ? 2 : 1; Save.write();
          Sfx.whoosh();
          App.show('map');
        }
        else if (act === 'sound') {
          Voice.enabled = Sfx.enabled = !Voice.enabled;
          Save.data.muted = !Voice.enabled; Save.write();
          if (!Voice.enabled) Voice.stop();
          b.textContent = Voice.enabled ? '🔊' : '🔇';
        } else App.show(act);
      };
    });
  },

  islandHTML(isl, k) {
    const locked = !Save.islandUnlocked(k);
    const heart = isl.id === 'heart';
    const land = heart
      ? `<path d="M120 150 C60 120 40 90 62 70 C80 54 106 62 120 80 C134 62 160 54 178 70 C200 90 180 120 120 150 Z" fill="${isl.grass}" stroke="#fff" stroke-width="4"/>`
      : `<path d="M34 108 Q40 70 90 66 Q120 46 158 64 Q206 68 206 108 Q200 132 120 134 Q40 132 34 108 Z" fill="${isl.grass}" stroke="#fff" stroke-width="4"/>`;
    return `
      <div class="island ${locked ? 'locked' : 'open'} ${heart ? 'heart' : ''}" data-idx="${k}" style="left:${isl.x}px;top:${isl.y}px">
        <svg viewBox="0 0 240 190" class="island-svg">
          <ellipse cx="120" cy="140" rx="116" ry="34" fill="#ffffff" opacity=".35"/>
          <ellipse cx="120" cy="128" rx="100" ry="30" fill="#FFE3A3"/>
          ${land}
          <text x="74" y="96" font-size="44" text-anchor="middle">${isl.decor[0]}</text>
          <text x="168" y="104" font-size="34" text-anchor="middle">${isl.decor[1]}</text>
          <text x="124" y="122" font-size="26" text-anchor="middle">${isl.decor[2]}</text>
          <text x="122" y="80" font-size="46" text-anchor="middle" class="friend">${isl.friend}</text>
        </svg>
        <div class="island-label" style="--c:${isl.color}">
          <b>${isl.name}</b>
          <small>${isl.letter} · ${isl.subject} · ⭐ ${Save.islandStars(isl.id)}/${isl.levels.length * 3}</small>
        </div>
        ${locked ? '<div class="lock">🔒</div>' : ''}
      </div>`;
  },

  islandModal(stage, isl) {
    const stars = Save.data.stars[isl.id];
    const wrap = document.createElement('div');
    wrap.className = 'modal-bg';
    wrap.innerHTML = `
      <div class="modal pop-in" style="--c:${isl.color}">
        <button class="close-btn" title="ปิด">✕</button>
        <div class="modal-head">${isl.name} <small>${isl.subject}</small></div>
        <div class="friend-row">
          <div class="friend-big">${isl.friend}</div>
          <div class="speech inline"><div class="speech-text"><b>${isl.friendName}:</b> "${isl.problem}"</div>
            <button class="replay" title="ฟังอีกครั้ง">🔊</button></div>
        </div>
        <div class="levels ${isl.levels.length > 3 ? 'many' : ''}">
          ${isl.levels.map((name, lv) => {
            const open = Save.levelUnlocked(isl.id, lv);
            const s = stars[lv];
            return `<button class="level-btn ${open ? '' : 'locked'} ${lv >= MAIN_LEVELS ? 'challenge' : ''}" data-lv="${lv}">
              <span class="lv-num">${open ? lv + 1 : '🔒'}</span>
              <span class="lv-name">${name}</span>
              <span class="lv-stars">${'★'.repeat(s)}<i>${'★'.repeat(3 - s)}</i></span>
            </button>`;
          }).join('')}
        </div>
      </div>`;
    stage.appendChild(wrap);
    const speak = () => Voice.say(SAY.islandProblem(isl));
    speak();
    wrap.querySelector('.replay').onclick = speak;
    const close = () => { Voice.reset(); wrap.remove(); };
    wrap.querySelector('.close-btn').onclick = () => { Sfx.pop(); close(); };
    wrap.onclick = e => { if (e.target === wrap) close(); };
    wrap.querySelectorAll('.level-btn').forEach(b => {
      b.onclick = () => {
        if (b.classList.contains('locked')) { Sfx.oops(); Voice.say(SAY.levelLocked); return; }
        Sfx.pop();
        close();
        Level.start(stage, isl, +b.dataset.lv);
      };
    });
  }
};

window.addEventListener('DOMContentLoaded', () => App.init());
