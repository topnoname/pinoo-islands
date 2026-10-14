// หน้าเมนู: สมุดสติกเกอร์ / ห้องแต่งตัว / หน้าผู้ปกครอง / ใบประกาศ
function menuShell(stage, cls, title) {
  stage.innerHTML = `
    <div class="scene menu ${cls}">
      <div class="level-top">
        <button class="icon-btn back-btn" title="กลับแผนที่">🗺️</button>
        <div class="level-title">${title}</div>
      </div>
      <div class="menu-body"></div>
    </div>`;
  stage.querySelector('.back-btn').onclick = () => { Sfx.pop(); App.show('map'); };
  return stage.querySelector('.menu-body');
}

Object.assign(Scenes, {
  // ---------- สมุดสติกเกอร์ ----------
  stickers(stage) {
    const got = Save.data.stickers;
    const total = ISLANDS.reduce((a, i) => a + i.stickers.length, 0);
    const body = menuShell(stage, 'sticker-book', `📒 สมุดสติกเกอร์ของ ${CHILD.display} · ${got.length}/${total}`);
    body.innerHTML = ISLANDS.map(isl => `
      <div class="sticker-row" style="--c:${isl.color}">
        <div class="sticker-island"><span>${isl.friend}</span>${isl.name}</div>
        ${isl.stickers.map((st, lv) => {
          const has = got.includes(st);
          return `<div class="sticker ${has ? 'has' : ''}">
            <div class="sticker-face">${has ? st : '?'}</div><small>${isl.levels[lv]}</small></div>`;
        }).join('')}
      </div>`).join('');
    body.querySelectorAll('.sticker.has').forEach(s => {
      s.onclick = () => { Sfx.pop(); s.classList.remove('wiggle'); void s.offsetWidth; s.classList.add('wiggle'); };
    });
    setTimeout(() => Voice.say(SAY.stickerIntro), 300);
  },

  // ---------- ห้องแต่งตัว ----------
  dress(stage) {
    const stars = Save.totalStars();
    const body = menuShell(stage, 'dress-room', `👗 ห้องแต่งตัว · ⭐ ${stars}`);
    let who = 'kid';
    body.innerHTML = `
      <div class="stage-floor"></div>
      <div class="dress-kid">${Characters.dressed('kid', 90)}</div>
      <div class="dress-pinoo">${Characters.dressed('pinoo', 60)}</div>
      <div class="who-tabs">
        <button class="pill-btn who on" data-who="kid">${CHILD.gender === 'boy' ? '👦' : '👧'} ${CHILD.display}</button>
        <button class="pill-btn who" data-who="pinoo">🐭 พี่หนู</button>
      </div>
      <div class="acc-grid">${ACCESSORIES.map(a => {
        const open = stars >= a.stars;
        return `<button class="acc-card ${open ? '' : 'locked'}" data-id="${a.id}">
          <span class="acc-icon">${open ? a.icon : '🔒'}</span>
          <small>${open ? a.name : `⭐ ${a.stars}`}</small></button>`;
      }).join('')}</div>`;

    const redraw = () => {
      body.querySelector('.dress-kid').innerHTML = Characters.dressed('kid', 90);
      body.querySelector('.dress-pinoo').innerHTML = Characters.dressed('pinoo', 60);
      const worn = Object.values(Save.data.outfit[who]);
      body.querySelectorAll('.acc-card').forEach(c => c.classList.toggle('worn', worn.includes(c.dataset.id)));
      body.querySelector('.dress-kid').classList.toggle('active', who === 'kid');
      body.querySelector('.dress-pinoo').classList.toggle('active', who === 'pinoo');
    };
    body.querySelectorAll('.who').forEach(b => {
      b.onclick = () => {
        Sfx.pop();
        who = b.dataset.who;
        body.querySelectorAll('.who').forEach(x => x.classList.toggle('on', x === b));
        redraw();
      };
    });
    body.querySelectorAll('.acc-card').forEach(c => {
      c.onclick = () => {
        const a = ACCESSORIES.find(x => x.id === c.dataset.id);
        if (stars < a.stars) { Sfx.oops(); Voice.say(SAY.dressLocked); return; }
        const outfit = Save.data.outfit[who];
        // ใส่ชิ้นเดิมซ้ำ = ถอดออก
        if (outfit[a.slot] === a.id) delete outfit[a.slot];
        else { outfit[a.slot] = a.id; Sfx.yay(); Voice.say(SAY.dressWear); }
        Save.write();
        redraw();
      };
    });
    redraw();
    setTimeout(() => Voice.say(SAY.dressIntro), 300);
  },

  // ---------- ห้องนอนของ เด็กผู้เล่น (แต่งด้วยเหรียญคนดี) ----------
  room(stage) {
    const medals = Save.medals();
    const body = menuShell(stage, 'bed-room', `🛏️ ห้องนอนของ ${CHILD.display} · 🏅 ${medals}`);
    const room = Save.data.room;
    let spot = ROOM_SPOTS[0];
    const pick = s => s.options.find(o => o.id === room[s.slot]);
    body.innerHTML = `
      <div class="room">
        <div class="room-wall"></div><div class="room-window"><i></i></div><div class="room-floor"></div>
        <div class="room-rug"></div>
        <div class="room-shelf-board"></div>
        <div class="room-bed"><div class="bed-pillow"></div><div class="bed-ham">${Characters.ham()}</div><div class="bed-pinoo">${Characters.dressed('pinoo', 30)}</div></div>
        <div class="room-kid">${Characters.dressed('kid', 52, undefined, 'wave')}</div>
        ${ROOM_SPOTS.filter(s => s.size).map(s => `<button class="room-spot" data-slot="${s.slot}" style="left:${s.x}px;top:${s.y}px;width:${s.size}px;height:${s.size}px;font-size:${s.size * 0.75}px"></button>`).join('')}
      </div>
      <div class="room-panel">
        <div class="room-tabs">${ROOM_SPOTS.map(s => `<button class="room-tab" data-slot="${s.slot}" title="${s.label}">${(pick(s) || s.options[0]).icon}</button>`).join('')}</div>
        <div class="room-label"></div>
        <div class="room-opts"></div>
        <div class="room-tip">🏅 ทำความดีในด่านต่างๆ เพื่อรับเหรียญคนดี แล้วมาปลดล็อกของแต่งห้องนะ</div>
      </div>`;

    const draw = () => {
      ROOM_SPOTS.forEach(s => {
        const o = pick(s);
        const el = body.querySelector(`.room-spot[data-slot="${s.slot}"]`);
        if (el) { el.textContent = o ? o.icon : '➕'; el.classList.toggle('empty', !o); el.classList.toggle('on', s === spot); }
        body.querySelector(`.room-tab[data-slot="${s.slot}"]`).classList.toggle('on', s === spot);
      });
      const rug = ROOM_SPOTS.find(s => s.slot === 'rug');
      body.querySelector('.room-rug').style.background = (pick(rug) || rug.options[0]).color;
      body.querySelector('.room-label').textContent = spot.label;
      body.querySelector('.room-opts').innerHTML = spot.options.map(o => {
        const open = medals >= o.medals;
        return `<button class="room-opt ${open ? '' : 'locked'} ${room[spot.slot] === o.id ? 'on' : ''}" data-id="${o.id}">
          <span>${open ? o.icon : '🔒'}</span><small>${open ? (room[spot.slot] === o.id ? 'ใช้อยู่' : 'เลือก') : `🏅 ${o.medals}`}</small></button>`;
      }).join('');
      body.querySelectorAll('.room-opt').forEach(b => {
        b.onclick = () => {
          const o = spot.options.find(x => x.id === b.dataset.id);
          if (medals < o.medals) { Sfx.oops(); Voice.say(SAY.roomLocked); return; }
          room[spot.slot] = o.id;
          Save.write();
          Sfx.yay();
          Voice.say(SAY.roomNice);
          draw();
          const el = body.querySelector(`.room-spot[data-slot="${spot.slot}"]`);
          if (el) { el.classList.remove('pop-in'); void el.offsetWidth; el.classList.add('pop-in'); }
        };
      });
    };
    const select = slot => { spot = ROOM_SPOTS.find(s => s.slot === slot); Sfx.pop(); draw(); };
    body.querySelectorAll('.room-spot, .room-tab').forEach(b => { b.onclick = () => select(b.dataset.slot); });
    draw();
    setTimeout(() => Voice.say(SAY.roomIntro), 300);
  },

  // ---------- หน้าผู้ปกครอง (มีโจทย์กันเด็กกดเข้า) ----------
  parent(stage) {
    const body = menuShell(stage, 'parent-page', '👨‍👩‍👧 สำหรับผู้ปกครอง');
    const a = 3 + Math.floor(Math.random() * 7), b = 3 + Math.floor(Math.random() * 7);
    body.innerHTML = `
      <div class="gate-card pop-in">
        <div class="gate-title">ส่วนนี้สำหรับผู้ใหญ่</div>
        <div class="gate-q">${a} × ${b} = ?</div>
        <input class="gate-input" type="number" inputmode="numeric" autocomplete="off">
        <button class="pill-btn gate-ok">ตกลง</button>
      </div>`;
    const input = body.querySelector('.gate-input');
    input.focus();
    const check = () => {
      if (+input.value === a * b) { Sfx.pop(); Scenes.parentReport(body); return; }
      Sfx.oops();
      input.value = '';
      body.querySelector('.gate-card').classList.remove('shake'); void body.offsetWidth;
      body.querySelector('.gate-card').classList.add('shake');
    };
    body.querySelector('.gate-ok').onclick = check;
    input.addEventListener('keydown', e => { if (e.key === 'Enter') check(); });
  },

  parentReport(body) {
    const d = Save.data;
    const mins = Math.round(d.playSeconds / 60);
    const time = mins >= 60 ? `${Math.floor(mins / 60)} ชม. ${mins % 60} นาที` : `${mins} นาที`;
    const strong = [], practice = [], notYet = [];
    const rows = ISLANDS.map(isl => {
      const cells = isl.levels.map((name, lv) => {
        const s = d.stars[isl.id][lv];
        const st = d.stats[`${isl.id}-${lv}`];
        // ด่านที่ผ่านก่อนมีระบบสถิติจะมีดาวแต่ไม่มี stats
        if (!st && s === 0) notYet.push(`${isl.name}: ${name}`);
        else if (s === 3) strong.push(`${isl.name}: ${name}`);
        else if (s <= 1 || (st && st.lastMistakes >= 3)) practice.push(`${isl.name}: ${name}`);
        return `<td>
          <div class="rp-stars">${'★'.repeat(s)}<i>${'★'.repeat(3 - s)}</i></div>
          <small>${name}</small>
          <small class="muted">${st ? `เล่น ${st.plays} ครั้ง · ผิดล่าสุด ${st.lastMistakes}` : s > 0 ? 'ผ่านแล้ว' : 'ยังไม่ได้เล่น'}</small>
          ${d.deeds[`${isl.id}-${lv}`] ? '<span class="rp-medal" title="ได้เหรียญคนดี">🏅</span>' : ''}
        </td>`;
      }).join('');
      return `<tr><th style="--c:${isl.color}"><span>${isl.letter}</span>${isl.subject}<small>${isl.name}</small></th>${cells}</tr>`;
    }).join('');
    const list = items => items.length ? items.map(t => `<li>${t}</li>`).join('') : '<li class="muted">—</li>';
    body.innerHTML = `
      <div class="report">
        <div class="rp-player">ผลการเล่นของ <b>${CHILD.display}</b> ${CHILD.gender === 'boy' ? '👦' : '👧'}</div>
        <div class="rp-cards">
          <div><b>⭐ ${Save.totalStars()}/${MAX_STARS}</b>ดาวทั้งหมด</div>
          <div><b>📒 ${d.stickers.length}/${ISLANDS.reduce((a, i) => a + i.stickers.length, 0)}</b>สติกเกอร์</div>
          <div><b>🏅 ${Save.medals()}</b>เหรียญคนดี</div>
          <div><b>⏱️ ${time}</b>เวลาเล่นรวม</div>
        </div>
        <table class="rp-table">${rows}</table>
        <div class="rp-notes">
          <div><h4>🌟 ทำได้ดีมาก (3 ดาว)</h4><ul>${list(strong)}</ul></div>
          <div><h4>💪 ควรฝึกเพิ่ม</h4><ul>${list(practice)}</ul></div>
          <div><h4>🔒 ยังไม่ได้เล่น</h4><ul>${list(notYet.slice(0, 6))}${notYet.length > 6 ? `<li class="muted">และอีก ${notYet.length - 6} ด่าน</li>` : ''}</ul></div>
        </div>
        <div class="rp-tips">
          <b>ชวนคุยต่อที่บ้าน:</b> ถามน้องว่าต้นไม้ต้องการอะไร · ลองให้น้องสั่งเราเดินด้วยลูกศร · ทายของลอยหรือจมในอ่างน้ำ ·
          นับของในบ้าน · ฝึกพูด "ขอบคุณ ขอโทษ ไม่เป็นไร" ในชีวิตจริง
        </div>
        <div class="rp-actions">
          <button class="pill-btn rp-sound">${Voice.enabled ? '🔊 ปิดเสียงพากย์' : '🔇 เปิดเสียงพากย์'}</button>
          <button class="pill-btn rp-intro">🎬 ดูเนื้อเรื่องตอนต้นอีกครั้ง</button>
          <button class="pill-btn rp-reset">↺ เริ่มใหม่ (ผู้เล่นนี้)</button>
          <button class="pill-btn rp-delete">🗑️ ลบผู้เล่นนี้</button>
        </div>
      </div>`;
    body.querySelector('.rp-sound').onclick = e => {
      Voice.enabled = Sfx.enabled = !Voice.enabled;
      d.muted = !Voice.enabled; Save.write();
      e.target.textContent = Voice.enabled ? '🔊 ปิดเสียงพากย์' : '🔇 เปิดเสียงพากย์';
    };
    body.querySelector('.rp-intro').onclick = () => { d.introSeen = false; Save.write(); App.show('intro'); };
    body.querySelector('.rp-reset').onclick = () => {
      if (!confirm(`ลบดาว สติกเกอร์ เหรียญ ชุดแต่งตัว และสถิติทั้งหมดของ ${Save.player.name} แล้วเริ่มใหม่ใช่ไหม?`)) return;
      Save.player.data = {};
      Save.use(Save.player.id);
      Save.write();
      App.show('title');
    };
    // ลบผู้เล่นคนนี้ออกจากเครื่อง (ผู้เล่นคนอื่นไม่หาย)
    body.querySelector('.rp-delete').onclick = () => {
      if (!confirm(`ลบผู้เล่น ${Save.player.name} ออกจากเครื่องนี้ใช่ไหม? ข้อมูลทั้งหมดของผู้เล่นคนนี้จะหายไป`)) return;
      Save.removePlayer(Save.player.id);
      App.show('players');
    };
  },

  // ---------- ใบประกาศเมื่อช่วยเพื่อนครบทุกเกาะ ----------
  certificate(stage) {
    const wrap = document.createElement('div');
    wrap.className = 'modal-bg win-bg';
    const today = new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' });
    wrap.innerHTML = `
      <div class="confetti">${Array.from({ length: 60 }, (_, i) =>
        `<i style="left:${Math.random() * 100}%;animation-delay:${Math.random() * 2}s;background:${['#FF7A59', '#FFC83D', '#7BD389', '#9AD0F5', '#FFB3CF'][i % 5]}"></i>`).join('')}</div>
      <div class="cert pop-in">
        <div class="cert-title">🏆 ใบประกาศนักผจญภัย 🏆</div>
        <div class="cert-chars">
          <div class="cert-kid">${Characters.dressed('kid', 60)}</div>
          <div class="cert-pinoo">${Characters.dressed('pinoo', 40)}</div>
        </div>
        <div class="cert-name">${CHILD.display}</div>
        <div class="cert-text">ช่วยเพื่อนครบทั้ง 5 เกาะ<br>เก่งทั้งวิทยาศาสตร์ เทคโนโลยี วิศวกรรม คณิตศาสตร์ และเป็นเด็กดีมีน้ำใจ</div>
        <div class="cert-friends">${ISLANDS.map(i => i.friend).join(' ')}</div>
        <div class="cert-date">${today} · ⭐ ${Save.totalStars()} ดาว · 🏅 ${Save.medals()} เหรียญ</div>
        <button class="pill-btn cert-ok">เย้! 🎉</button>
      </div>`;
    stage.querySelector('.scene').appendChild(wrap);
    Sfx.yay();
    setTimeout(() => Voice.say(SAY.allDone), 500);
    wrap.querySelector('.cert-ok').onclick = () => { Sfx.pop(); Voice.reset(); wrap.remove(); };
  }
});
