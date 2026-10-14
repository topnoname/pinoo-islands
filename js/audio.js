// เสียงพากย์: เล่นไฟล์เสียงที่สร้างไว้ใน voice/ ก่อน ถ้าไม่มีจึงใช้เสียงของเบราว์เซอร์
// เสียงเอฟเฟกต์ใช้ Web Audio
const Voice = {
  voice: null,
  enabled: true,
  audio: null,

  init() {
    if (!("speechSynthesis" in window)) return;
    const pick = () => {
      const thai = speechSynthesis.getVoices().filter(v => v.lang.toLowerCase().startsWith("th"));
      this.voice = thai.find(v => /premwadee|natural|online/i.test(v.name)) || thai[0] || null;
    };
    pick();
    speechSynthesis.addEventListener("voiceschanged", pick);
  },

  // มีไฟล์เสียงในเกม หรือมีเสียงไทยในเบราว์เซอร์
  hasThai() { return Object.keys(VOICE_FILES).length > 0 || !!this.voice; },

  // onend จะถูกเรียกครั้งเดียวเสมอ แม้เสียงถูกตัดกลางคัน เพื่อไม่ให้เกมค้างรอเสียงที่ไม่มีวันจบ
  pending: null,

  say(text, { onend } = {}) {
    this.stop();
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      if (this.pending === finish) this.pending = null;
      onend && onend();
    };
    this.pending = finish;
    // ปิดเสียงอยู่: เว้นจังหวะให้พอๆ กับเวลาที่ใช้พูด
    if (!this.enabled) { this.timer = setTimeout(finish, 600 + text.length * 45); return; }
    const key = voiceKey(text);
    if (VOICE_FILES[key]) {
      const a = new Audio(`voice/${key}.mp3`);
      this.audio = a;
      a.onended = finish;
      a.onerror = () => this.speak(text, finish);
      a.play().catch(() => { if (this.audio === a) this.speak(text, finish); });
    } else {
      this.speak(text, finish);
    }
  },

  speak(text, onend) {
    if (!("speechSynthesis" in window)) { setTimeout(onend, 600 + text.length * 45); return; }
    const u = new SpeechSynthesisUtterance(speakText(text));
    u.lang = "th-TH";
    if (this.voice) u.voice = this.voice;
    u.rate = 0.95;
    u.onend = onend;
    u.onerror = onend;
    speechSynthesis.speak(u);
  },

  // เสียงสั้นๆ ที่เล่นซ้อนได้ (เช่น นับเลข) ไม่ตัดเสียงพี่หนู
  aside(text) {
    if (!this.enabled) return;
    const key = voiceKey(text);
    if (VOICE_FILES[key]) new Audio(`voice/${key}.mp3`).play().catch(() => {});
  },

  stop() {
    clearTimeout(this.timer);
    if (this.audio) { this.audio.onended = null; this.audio.onerror = null; this.audio.pause(); this.audio = null; }
    if ("speechSynthesis" in window) speechSynthesis.cancel();
    // เสียงที่ถูกตัด: ให้เดินเรื่องต่อหลังจากเสียงใหม่เริ่มแล้ว
    const p = this.pending;
    this.pending = null;
    if (p) setTimeout(p, 0);
  },

  // เปลี่ยนฉาก: ตัดเสียงและยกเลิกเรื่องที่ค้างอยู่ทั้งหมด
  reset() {
    this.pending = null;
    this.stop();
  }
};

const Sfx = {
  ctx: null,
  enabled: true,

  tone(freq, start, dur, type = 'sine', vol = 0.18) {
    if (!this.enabled) return;
    this.ctx = this.ctx || new (window.AudioContext || window.webkitAudioContext)();
    const t = this.ctx.currentTime + start;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g).connect(this.ctx.destination);
    o.start(t);
    o.stop(t + dur + 0.05);
  },

  pop() { this.tone(660, 0, 0.12, 'triangle'); this.tone(990, 0.05, 0.1, 'triangle', 0.1); },
  // onYay: ฉากที่กำลังเล่นใช้ให้ เด็กผู้เล่น ดีใจไปด้วยเมื่อตอบถูก
  onYay: null,
  yay() { [523, 659, 784, 1047].forEach((f, i) => this.tone(f, i * 0.09, 0.25, 'triangle'));  this.onYay && this.onYay(); },
  oops() { this.tone(330, 0, 0.18, 'sine', 0.12); this.tone(262, 0.12, 0.25, 'sine', 0.12); },
  whoosh() { [300, 400, 520, 680].forEach((f, i) => this.tone(f, i * 0.12, 0.3, 'sawtooth', 0.04)); }
};
