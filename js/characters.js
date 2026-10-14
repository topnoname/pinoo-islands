// ภาพตัวละครทั้งหมดวาดด้วย SVG เพื่อให้คมชัดทุกขนาดจอ
const Characters = {
  // ลวดลายที่ใช้ร่วมกัน ใส่ไว้ครั้งเดียวในหน้า
  injectDefs() {
    const defs = `
    <svg width="0" height="0" style="position:absolute" aria-hidden="true">
      <defs>
        <pattern id="girlSkirt" width="30" height="26" patternUnits="userSpaceOnUse">
          <rect width="30" height="26" fill="#D7C3FA"/>
          <circle cx="8" cy="7" r="2.6" fill="#fff"/>
          <circle cx="23" cy="19" r="2.6" fill="#fff"/>
          <path transform="translate(22 6) scale(.5)" d="M0 5 C-8 -1 -5 -8 0 -3.5 C5 -8 8 -1 0 5 Z" fill="#FF7FAF"/>
        </pattern>
        <!-- พี่แฮม ด้านหน้า: ผ้าสีพีช ลายรุ้ง เมฆจุด หัวใจ -->
        <pattern id="hamFront" width="84" height="84" patternUnits="userSpaceOnUse">
          <rect width="84" height="84" fill="#EBC8B2"/>
          ${Characters.rainbow(26, 36, 20)}
          ${Characters.rainbow(66, 76, 13)}
          ${Characters.dotCloud(52, 22)}
          ${Characters.heart(74, 44, 1, '#D86E7E')}
          ${Characters.heart(8, 74, 0.8, '#2E3446')}
          ${Characters.heart(40, 58, 0.65, '#E9A3AB')}
          <g fill="#FAF4EC"><ellipse cx="18" cy="60" rx="9" ry="3.8"/><ellipse cx="14" cy="57" rx="4.5" ry="3.8"/><ellipse cx="21" cy="56" rx="5" ry="4.3"/></g>
          <g fill="#FAF4EC"><ellipse cx="74" cy="10" rx="7" ry="3.2"/><ellipse cx="71" cy="7.5" rx="3.6" ry="3.2"/><ellipse cx="77" cy="7" rx="4" ry="3.6"/></g>
        </pattern>
        <!-- พี่แฮม ด้านหลัง: ผ้ามิงกี้สีชมพูอ่อน มีปุ่มนุ่มๆ -->
        <pattern id="hamBack" width="14" height="14" patternUnits="userSpaceOnUse">
          <rect width="14" height="14" fill="#F1D9D2"/>
          <circle cx="3.6" cy="4.4" r="2.5" fill="#DDBDB4"/><circle cx="3.2" cy="3.8" r="2.4" fill="#FBEEEA"/>
          <circle cx="10.6" cy="11.4" r="2.5" fill="#DDBDB4"/><circle cx="10.2" cy="10.8" r="2.4" fill="#FBEEEA"/>
        </pattern>
      </defs>
    </svg>`;
    document.body.insertAdjacentHTML('afterbegin', defs);
    this.bindHam();
  },

  // ลายบนผ้าพี่แฮม: รุ้ง (มะกอก ชมพูแดง เทาฟ้า ขาว ชมพูอ่อน)
  rainbow(x, y, r) {
    const cols = ['#A89B3C', '#C9566A', '#8F9DB6', '#F7F1EA', '#E9A3AB'];
    const w = r / 5.2;
    return cols.map((c, i) => {
      const rr = r - i * w * 1.05;
      return rr > 1 ? `<path d="M${x - rr} ${y + 3} L${x - rr} ${y} A${rr} ${rr} 0 0 1 ${x + rr} ${y} L${x + rr} ${y + 3}" stroke="${c}" stroke-width="${w}" fill="none" stroke-linecap="round"/>` : '';
    }).join('');
  },
  dotCloud(x, y) {
    const pts = [[0,0],[4,-3],[8,0],[-4,-2],[2,4],[6,4],[-2,4],[10,4],[4,-7],[-1,-6],[8,-5],[12,0],[-6,2],[1,8],[6,8]];
    return `<g fill="#2E3446">${pts.map(([a, b]) => `<circle cx="${x + a}" cy="${y + b}" r="1.15"/>`).join('')}</g>`;
  },
  heart(x, y, s, c) {
    return `<path transform="translate(${x} ${y}) scale(${s})" d="M0 5 C-8 -1 -5 -8 0 -3.5 C5 -8 8 -1 0 5 Z" fill="${c}"/>`;
  },

  // พี่แฮม: ผ้าห่มตัวโปรดของ เด็กผู้เล่น (ผ้าห่มเฉยๆ ไม่มีหน้า) พับมุมให้เห็นผ้าอีกด้าน
  // side = 'front' (ผ้าพีชลายรุ้ง) หรือ 'back' (ผ้ามิงกี้ชมพูอ่อน)
  hamSide(side) {
    const out = side === 'front' ? 'hamFront' : 'hamBack';
    const inner = side === 'front' ? 'hamBack' : 'hamFront';
    const edge = side === 'front' ? '#C99B84' : '#D7B3A9';
    return `
    <svg class="char ham-svg" viewBox="0 0 220 200" xmlns="http://www.w3.org/2000/svg">
      <!-- เงาใต้ผ้า -->
      <ellipse cx="110" cy="190" rx="92" ry="7" fill="#000" opacity=".08"/>
      <!-- ผืนผ้าห่ม ขอบพลิ้วนิดๆ มุมขวาล่างพับขึ้น -->
      <path d="M22 28 Q66 14 112 25 Q158 36 200 20 Q211 68 204 110 Q199 136 205 146 L170 182 Q120 172 70 183 Q40 189 16 178 Q27 140 16 100 Q9 60 22 28 Z"
        fill="url(#${out})" stroke="${edge}" stroke-width="3.5" stroke-linejoin="round"/>
      <!-- รอยยับผ้าให้ดูนุ่ม -->
      <g stroke="#7A4E40" stroke-width="3" fill="none" stroke-linecap="round" opacity=".12">
        <path d="M60 30 Q52 90 64 178"/><path d="M118 28 Q128 96 116 176"/><path d="M28 110 Q100 100 180 120"/>
      </g>
      <!-- มุมที่พับ เห็นผ้าอีกด้าน -->
      <path d="M205 146 L170 182 Q173 160 166 142 Q186 150 205 146 Z" fill="#7A4E40" opacity=".14" transform="translate(-6 -4)"/>
      <path d="M205 146 L170 182 Q173 160 166 142 Q186 150 205 146 Z"
        fill="url(#${inner})" stroke="${edge}" stroke-width="3" stroke-linejoin="round"/>
    </svg>`;
  },
  // กล่องพลิกสองด้าน กดที่พี่แฮมเพื่อพลิกผ้าห่ม
  ham(side = 'front') {
    return `<div class="ham${side === 'back' ? ' flipped' : ''}" title="พลิกผ้าห่ม">
      <div class="ham-inner">
        <div class="ham-face front">${this.hamSide('front')}</div>
        <div class="ham-face back">${this.hamSide('back')}</div>
      </div>
    </div>`;
  },
  // ฟังการกดพี่แฮมครั้งเดียวทั้งหน้า
  bindHam() {
    if (this._hamBound) return;
    this._hamBound = true;
    document.addEventListener('click', e => {
      const h = e.target.closest('.ham');
      if (!h || h.classList.contains('no-flip') || h.classList.contains('flipping')) return;
      h.classList.add('flipping');
      setTimeout(() => h.classList.toggle('flipped'), 300);
      setTimeout(() => h.classList.remove('flipping'), 620);
      if (typeof Sfx !== 'undefined') Sfx.pop();
    });
  },

  // ตัวละครเด็กผู้หญิง: ผมน้ำตาลมัดจุกสองข้าง ชุดกระโปรงสีม่วงลาเวนเดอร์
  GIRL: {
    back: `
      <path d="M40 100 Q36 30 100 28 Q164 30 160 100 L158 130 Q100 142 42 130 Z" fill="#6B3E26"/>
      <circle cx="30" cy="112" r="24" fill="#6B3E26"/><circle cx="170" cy="112" r="24" fill="#6B3E26"/>
      <circle cx="47" cy="100" r="8" fill="#FF7FAF"/><circle cx="153" cy="100" r="8" fill="#FF7FAF"/>`,
    lower: `
      <rect x="80" y="258" width="14" height="36" rx="6" fill="#FFDCC2"/>
      <rect x="106" y="258" width="14" height="36" rx="6" fill="#FFDCC2"/>
      <ellipse cx="85" cy="296" rx="14" ry="8" fill="#FF7FAF"/>
      <ellipse cx="115" cy="296" rx="14" ry="8" fill="#FF7FAF"/>
      <path d="M66 204 L134 204 L160 268 Q100 284 40 268 Z" fill="url(#girlSkirt)" stroke="#A98BE0" stroke-width="2"/>`,
    top: `
      <path d="M70 154 Q100 147 130 154 L137 208 L63 208 Z" fill="#B99AF0"/>
      <ellipse cx="66" cy="165" rx="15" ry="13" fill="#B99AF0"/>
      <ellipse cx="134" cy="165" rx="15" ry="13" fill="#B99AF0"/>
      <ellipse cx="88" cy="157" rx="15" ry="9" fill="#fff"/><ellipse cx="112" cy="157" rx="15" ry="9" fill="#fff"/>
      <circle cx="100" cy="176" r="4" fill="#FFD23F"/><circle cx="100" cy="190" r="4" fill="#FFD23F"/>
      <rect x="63" y="203" width="74" height="6" rx="3" fill="#fff"/>`,
    front: `
      <path d="M44 96 Q40 36 100 34 Q160 36 156 96 Q146 72 124 78 Q110 62 96 76 Q80 64 64 80 Q52 78 44 96 Z" fill="#6B3E26"/>
      <path d="M70 46 Q90 38 110 42" stroke="#8A5A3C" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path transform="translate(132 52)" d="M0 -9 L2.6 -3 L9 -2.8 L4 1.6 L5.6 8 L0 4.6 L-5.6 8 L-4 1.6 L-9 -2.8 L-2.6 -3 Z" fill="#FFD23F" stroke="#E2A91A" stroke-width="1.5"/>`
  },

  // ตัวละครเด็กผู้ชาย: ผมสั้นชี้ เสื้อยืดสีฟ้าลายดาว กางเกงขาสั้น รองเท้าผ้าใบ
  BOY: {
    back: `
      <ellipse cx="44" cy="106" rx="9" ry="12" fill="#F7CDB0"/><ellipse cx="156" cy="106" rx="9" ry="12" fill="#F7CDB0"/>
      <path d="M42 98 Q38 30 100 30 Q162 30 158 98 Q150 70 100 66 Q50 70 42 98 Z" fill="#3A2A20"/>`,
    lower: `
      <rect x="79" y="238" width="15" height="54" rx="6" fill="#FFDCC2"/>
      <rect x="106" y="238" width="15" height="54" rx="6" fill="#FFDCC2"/>
      <path d="M70 288 Q70 280 86 280 Q100 280 100 292 L100 298 L70 298 Z" fill="#fff" stroke="#3E6FB0" stroke-width="3"/>
      <path d="M100 292 Q100 280 114 280 Q130 280 130 288 L130 298 L100 298 Z" fill="#fff" stroke="#3E6FB0" stroke-width="3"/>
      <path d="M64 202 L136 202 L140 246 L104 246 L100 228 L96 246 L60 246 Z" fill="#3E6FB0"/>`,
    top: `
      <path d="M70 154 Q100 147 130 154 L136 208 L64 208 Z" fill="#5CB8EE"/>
      <ellipse cx="66" cy="165" rx="15" ry="13" fill="#5CB8EE"/>
      <ellipse cx="134" cy="165" rx="15" ry="13" fill="#5CB8EE"/>
      <path d="M86 152 Q100 164 114 152" stroke="#3E95CC" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path transform="translate(100 182) scale(1.5)" d="M0 -9 L2.6 -3 L9 -2.8 L4 1.6 L5.6 8 L0 4.6 L-5.6 8 L-4 1.6 L-9 -2.8 L-2.6 -3 Z" fill="#FFD23F"/>`,
    front: `
      <path d="M44 92 Q42 36 100 34 Q158 36 156 92 L146 70 L134 82 L122 62 L110 80 L98 60 L86 80 L74 64 L64 82 L54 70 Z" fill="#3A2A20"/>
      <path d="M72 46 Q90 40 108 44" stroke="#5A4638" stroke-width="3" fill="none" stroke-linecap="round"/>`
  },

  // เด็กผู้เล่น (เด็กหญิงหรือเด็กชายตามที่เลือกตอนสร้างผู้เล่น)
  // pose: 'wave' โบกมือ, 'idle' ยืนเฉยๆ, 'cheer' ชูสองมือดีใจ, 'think' เอามือแตะคาง, 'oops' มือแตะแก้มตกใจ
  kid({ wave = true, pose = 'wave', gender = CHILD.gender } = {}) {
    const arm = (d, hx, hy, r = 8) => `
        <path d="${d}" stroke="#E9B596" stroke-width="16" stroke-linecap="round" fill="none"/>
        <path d="${d}" stroke="#FFDCC2" stroke-width="12" stroke-linecap="round" fill="none"/>
        <circle cx="${hx}" cy="${hy}" r="${r}" fill="#FFDCC2" stroke="#E9B596" stroke-width="2"/>`;
    const L_DOWN = arm('M66 168 Q48 194 52 220', 52, 223);
    const R_DOWN = arm('M134 168 Q152 194 148 220', 148, 223);
    // แขนหลังตัว (วาดก่อนเสื้อ) และแขนหน้าตัว (วาดทับหน้า)
    const arms = {
      wave: [L_DOWN + `
      <g class="${wave ? 'arm-wave' : ''}" style="transform-origin:136px 168px">${arm('M138 168 Q170 158 178 130', 179, 122, 10)}</g>`, ''],
      idle: [L_DOWN + R_DOWN, ''],
      cheer: [arm('M62 166 Q36 142 30 110', 29, 102, 10) + arm('M138 166 Q164 142 170 110', 171, 102, 10), ''],
      think: [L_DOWN, arm('M137 170 Q168 204 124 150', 121, 146, 10)],
      oops: ['', arm('M64 172 Q36 168 56 134', 57, 129, 10) + arm('M136 172 Q164 168 144 134', 143, 129, 10)]
    }[pose] || [L_DOWN + R_DOWN, ''];
    const face = {
      cheer: `
        <path d="M72 108 Q80 98 88 108" stroke="#2A2320" stroke-width="3.6" fill="none" stroke-linecap="round"/>
        <path d="M112 108 Q120 98 128 108" stroke="#2A2320" stroke-width="3.6" fill="none" stroke-linecap="round"/>
        <path d="M87 124 Q100 144 113 124 Z" fill="#C8524A" stroke="#9A3E36" stroke-width="2" stroke-linejoin="round"/>
        <path d="M93 133 Q100 138 107 133" fill="#FF9AA2"/>`,
      think: `
        <g class="blink">
          <ellipse cx="80" cy="107" rx="7" ry="9" fill="#2A2320"/><ellipse cx="120" cy="107" rx="7" ry="9" fill="#2A2320"/>
          <circle cx="83" cy="102" r="2.6" fill="#fff"/><circle cx="123" cy="102" r="2.6" fill="#fff"/>
        </g>
        <path d="M93 131 Q101 127 108 130" stroke="#9A3E36" stroke-width="2.6" fill="none" stroke-linecap="round"/>`,
      oops: `
        <g class="blink">
          <ellipse cx="80" cy="107" rx="7.5" ry="9.5" fill="#2A2320"/><ellipse cx="120" cy="107" rx="7.5" ry="9.5" fill="#2A2320"/>
          <circle cx="82.5" cy="103.5" r="2.6" fill="#fff"/><circle cx="122.5" cy="103.5" r="2.6" fill="#fff"/>
        </g>
        <ellipse cx="100" cy="130" rx="5.5" ry="7" fill="#C8524A" stroke="#9A3E36" stroke-width="2"/>`
    }[pose];
    const brows = pose === 'oops' || pose === 'think'
      ? `<path d="M72 87 Q80 82 88 86" stroke="#3A2E2A" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M112 86 Q120 82 128 87" stroke="#3A2E2A" stroke-width="2.5" fill="none" stroke-linecap="round"/>`
      : `<path d="M72 92 Q80 88 88 91" stroke="#3A2E2A" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M112 91 Q120 88 128 92" stroke="#3A2E2A" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
    const look = gender === 'boy' ? this.BOY : this.GIRL;
    return `
    <svg class="char kid ${gender}" viewBox="0 0 200 310" xmlns="http://www.w3.org/2000/svg">
      <!-- ผมด้านหลัง -->
      ${look.back}
      <!-- ขา รองเท้า และกระโปรง/กางเกง -->
      ${look.lower}
      <!-- แขน (ตามท่าทาง) -->
      ${arms[0]}
      <!-- ตัวเสื้อ -->
      ${look.top}
      <!-- คอ -->
      <rect x="92" y="138" width="16" height="16" fill="#F7CDB0"/>
      <!-- หน้า -->
      <ellipse cx="100" cy="98" rx="56" ry="54" fill="#FFE1CB"/>
      <!-- ผมด้านหน้า -->
      ${look.front}
      <!-- คิ้ว -->
      ${brows}
      <!-- ตา และปาก (ตามท่าทาง) -->
      ${face || `<g class="blink">
        <ellipse cx="80" cy="107" rx="7" ry="9" fill="#2A2320"/>
        <ellipse cx="120" cy="107" rx="7" ry="9" fill="#2A2320"/>
        <circle cx="82.5" cy="103.5" r="2.6" fill="#fff"/>
        <circle cx="122.5" cy="103.5" r="2.6" fill="#fff"/>
        <circle cx="78" cy="110" r="1.2" fill="#fff"/>
        <circle cx="118" cy="110" r="1.2" fill="#fff"/>
      </g>
      <path d="M90 127 Q100 138 110 127 Q100 131 90 127 Z" fill="#C8524A" stroke="#9A3E36" stroke-width="2" stroke-linejoin="round"/>`}
      <!-- แก้มแดง -->
      <ellipse cx="68" cy="125" rx="10" ry="6" fill="#FF9AA2" opacity=".55"/>
      <ellipse cx="132" cy="125" rx="10" ry="6" fill="#FF9AA2" opacity=".55"/>
      <!-- จมูก -->
      <path d="M98 117 Q100 119 102 117" stroke="#E0A88A" stroke-width="2" fill="none" stroke-linecap="round"/>
      <!-- มือที่อยู่หน้าตัว -->
      ${arms[1]}
    </svg>`;
  },

  // พี่หนู: ตุ๊กตาหนูสีเทา หูชมพู ยิ้มกว้าง
  pinoo() {
    return `
    <svg class="char pinoo" viewBox="0 0 170 190" xmlns="http://www.w3.org/2000/svg">
      <!-- หาง -->
      <path d="M118 158 Q156 160 150 126 Q146 104 162 98" stroke="#9C9CA5" stroke-width="6" fill="none" stroke-linecap="round"/>
      <!-- ตัว -->
      <ellipse cx="84" cy="144" rx="38" ry="34" fill="#B3B3BC"/>
      <ellipse cx="84" cy="150" rx="23" ry="22" fill="#D3D3DA"/>
      <!-- เท้าชมพู -->
      <ellipse cx="64" cy="176" rx="15" ry="9" fill="#F5B4C8"/>
      <ellipse cx="104" cy="176" rx="15" ry="9" fill="#F5B4C8"/>
      <!-- มือ -->
      <ellipse cx="50" cy="146" rx="10" ry="14" fill="#A6A6AF" transform="rotate(20 50 146)"/>
      <ellipse cx="118" cy="146" rx="10" ry="14" fill="#A6A6AF" transform="rotate(-20 118 146)"/>
      <!-- หู -->
      <g class="ear-l" style="transform-origin:52px 60px">
        <circle cx="40" cy="40" r="31" fill="#A6A6AF"/>
        <circle cx="41" cy="42" r="20" fill="#F5B4C8"/>
      </g>
      <g class="ear-r" style="transform-origin:116px 60px">
        <circle cx="128" cy="40" r="31" fill="#A6A6AF"/>
        <circle cx="127" cy="42" r="20" fill="#F5B4C8"/>
      </g>
      <!-- หัว -->
      <ellipse cx="84" cy="84" rx="50" ry="44" fill="#B3B3BC"/>
      <!-- ปาก/จมูกยื่น -->
      <ellipse cx="84" cy="101" rx="26" ry="19" fill="#DCDCE2"/>
      <!-- ตา -->
      <g class="blink">
        <circle cx="66" cy="80" r="5.5" fill="#1F1F24"/>
        <circle cx="102" cy="80" r="5.5" fill="#1F1F24"/>
        <circle cx="68" cy="78" r="1.8" fill="#fff"/>
        <circle cx="104" cy="78" r="1.8" fill="#fff"/>
      </g>
      <!-- จมูก -->
      <ellipse cx="84" cy="92" rx="5.5" ry="4" fill="#3A3A40"/>
      <!-- ยิ้มกว้าง -->
      <path d="M84 96 L84 102 M70 101 Q84 116 98 101" stroke="#2A2A30" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <!-- หนวด -->
      <g stroke="#6E6E78" stroke-width="1.6" stroke-linecap="round">
        <path d="M60 96 L36 90"/><path d="M60 101 L35 103"/>
        <path d="M108 96 L132 90"/><path d="M108 101 L133 103"/>
      </g>
    </svg>`;
  },

  // ตัวละครพร้อมของแต่งตัวที่เลือกไว้ (ตำแหน่งเป็น % ของภาพ)
  ACC_POS: {
    kid: { head: [50, 9, 1], face: [50, 35, 0.9], hand: [90, 37, 0.8], back: [50, 52, 3] },
    // ของถือในมือของ เด็กผู้เล่น ย้ายตามท่าทาง
    kidHand: { wave: [90, 37, 0.8], idle: [74, 72, 0.7], cheer: [86, 31, 0.8], think: [66, 46, 0.6], oops: [72, 41, 0.6] },
    pinoo: { head: [50, 11, 0.9], face: [50, 42, 0.75], hand: [74, 76, 0.6], back: [50, 66, 2.2] }
  },
  dressed(who, accPx, outfit = (typeof Save !== "undefined" && Save.data ? Save.data.outfit[who] : {}), pose = 'wave', gender = CHILD.gender) {
    const svg = who === "kid" ? this.kid({ pose, gender }) : this.pinoo();
    const acc = Object.entries(outfit || {}).map(([slot, id]) => {
      const a = ACCESSORIES.find(x => x.id === id);
      const [x, y, sc] = who === "kid" && slot === "hand" ? this.ACC_POS.kidHand[pose] : this.ACC_POS[who][slot];
      return a ? `<span class="acc ${slot}" style="left:${x}%;top:${y}%;transform:translate(-50%,-50%) scale(${sc})">${a.icon}</span>` : "";
    }).join("");
    return `<div class="dressed" style="--acc:${accPx}px">${svg}${acc}</div>`;
  },

  // เครื่องบินสีเหลืองของสายการบินพี่หนู
  plane() {
    return `
    <svg class="plane-svg" viewBox="0 0 400 170" xmlns="http://www.w3.org/2000/svg">
      <path d="M44 58 L22 6 L74 6 L108 56 Z" fill="#F2B21C"/>
      <circle cx="44" cy="22" r="7" fill="#A6A6AF"/><circle cx="60" cy="22" r="7" fill="#A6A6AF"/>
      <circle cx="52" cy="32" r="9" fill="#B3B3BC"/>
      <path d="M30 84 Q30 52 84 52 L318 52 Q380 56 392 88 Q380 118 318 118 L84 118 Q30 118 30 84 Z" fill="#FFC83D"/>
      <path d="M40 100 Q60 112 90 116 L318 116 Q370 114 386 98" stroke="#F2B21C" stroke-width="6" fill="none"/>
      <path d="M352 70 Q372 72 380 84 L350 84 Z" fill="#5A7FA8"/>
      ${[0, 1, 2, 3, 4, 5, 6, 7].map(i =>
        `<rect x="${118 + i * 26}" y="68" width="14" height="16" rx="6" fill="#CFEFFF" stroke="#7DB5D6" stroke-width="2"/>`).join('')}
      <text x="96" y="108" font-size="18" font-weight="700" fill="#8A5A00" font-family="Mali, 'Leelawadee UI', sans-serif">พี่หนูแอร์ ✈</text>
      <path d="M214 98 L294 98 L240 160 L200 160 Z" fill="#F2B21C"/>
      <path d="M60 80 L20 70 L26 92 Z" fill="#F2B21C"/>
    </svg>`;
  }
};
