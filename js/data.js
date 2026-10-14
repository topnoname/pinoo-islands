// ข้อมูลผู้เล่นและเกาะทั้งหมด
// ชื่อและเพศของผู้เล่นปัจจุบัน (ตั้งตอนสร้างผู้เล่น)
const CHILD = {
  // ชื่อที่พิมพ์เองอาจมีอักขระพิเศษ จึงแปลงให้ปลอดภัยก่อนใส่ในหน้าเว็บ
  get display() {
    const n = (typeof Save !== 'undefined' && Save.player) ? Save.player.name : 'หนูน้อย';
    return n.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  },
  get gender() { return (typeof Save !== 'undefined' && Save.player) ? Save.player.gender : 'girl'; },
  // คำลงท้ายบนปุ่ม: ค่ะ/คะ สำหรับเด็กหญิง ครับ สำหรับเด็กชาย
  polite(text) { return this.gender === 'boy' ? text.replace(/(ค่ะ|คะ)$/, 'ครับ') : text; }
};

const ISLANDS = [
  {
    id: 'science', stickers: ['🌻', '🦆', '🦋'], name: 'เกาะต้นไม้', subject: 'วิทยาศาสตร์', letter: 'S',
    color: '#7BD389', grass: '#5DBB63', friend: '🐰', friendName: 'น้องกระต่าย',
    decor: ['🌳', '🌻', '🌷'], x: 70, y: 430,
    problem: 'สวนของน้องกระต่ายเหี่ยวหมดเลย ช่วยทำให้ต้นไม้กลับมาสดชื่นได้ไหม',
    levels: ['ต้นไม้ต้องการอะไร', 'ลอยหรือจม', 'วงจรชีวิตผีเสื้อ']
  },
  {
    id: 'tech', stickers: ['🤖', '🧭', '🚀', '🌟', '🐞'], name: 'เกาะหุ่นยนต์', subject: 'เทคโนโลยี', letter: 'T',
    color: '#9AD0F5', grass: '#6FB7E9', friend: '🤖', friendName: 'หุ่นยนต์บิบ',
    decor: ['⚙️', '🛰️', '🔋'], x: 330, y: 200,
    problem: 'บิบหลงทาง ต้องการคนช่วยบอกทางด้วยลูกศร',
    levels: ['เดินตามลูกศร', 'วางแผนก่อนเดิน', 'คำสั่งทำซ้ำ', 'เก็บดาวก่อนกลับ', 'นักแก้บั๊ก']
  },
  {
    id: 'eng', stickers: ['🏠', '🌉', '🗼', '📏', '🔺'], name: 'เกาะช่างสร้าง', subject: 'วิศวกรรม', letter: 'E',
    color: '#FFC98B', grass: '#F4A85A', friend: '🦫', friendName: 'น้องบีเวอร์',
    decor: ['🏗️', '🧱', '🌉'], x: 560, y: 440,
    problem: 'สะพานของน้องบีเวอร์พัง ช่วยกันสร้างใหม่ให้แข็งแรงนะ',
    levels: ['สร้างบ้านจากรูปทรง', 'สะพานแข็งแรง', 'หอคอยสูงไม่ล้ม', 'วัดก่อนสร้าง', 'สามเหลี่ยมแข็งแรง']
  },
  {
    id: 'math', stickers: ['🍌', '🔷', '⚖️', '➕', '🔢'], name: 'เกาะตัวเลข', subject: 'คณิตศาสตร์', letter: 'M',
    color: '#FFE27A', grass: '#F2CC3D', friend: '🐵', friendName: 'น้องลิง',
    decor: ['🌴', '🍌', '🔢'], x: 850, y: 200,
    problem: 'น้องลิงอยากแบ่งกล้วยให้เพื่อน แต่นับไม่เป็น ช่วยหน่อยนะ',
    levels: ['นับกล้วย', 'ต่อแพทเทิร์น', 'มากกว่า น้อยกว่า', 'บวกลบกล้วย', 'เลขที่หายไป']
  },
  {
    id: 'heart', stickers: ['🙏', '♻️', '💞'], name: 'เกาะหัวใจ', subject: 'เด็กดีมีน้ำใจ', letter: '♥',
    color: '#FFB3CF', grass: '#FF8DB8', friend: '🐘', friendName: 'น้องช้าง',
    decor: ['💖', '🌈', '🌸'], x: 1020, y: 440,
    problem: 'น้องช้างอยากมีเพื่อน ช่วยสอนวิธีเป็นเพื่อนที่ดีหน่อยนะ',
    levels: ['คำพูดวิเศษ', 'เก็บขยะแยกถัง', 'เข้าใจหัวใจเพื่อน']
  },

  // ---------- ทะเลชั้นนอก (เปิดเมื่อจบเกาะหัวใจ) ----------
  {
    id: 'space', region: 2, stickers: ['🌞', '🌗', '🚀'], name: 'เกาะอวกาศ', subject: 'ดาราศาสตร์', letter: 'S',
    color: '#B9A7F5', grass: '#8E79E0', friend: '🐶', friendName: 'น้องหมานักบินอวกาศ',
    decor: ['🪐', '🌙', '⭐'], x: 70, y: 430,
    problem: 'น้องหมาอยากไปเที่ยวอวกาศ แต่ยังไม่รู้เรื่องฟ้าเลย ช่วยสอนหน่อยนะ',
    levels: ['กลางวัน กลางคืน', 'เงาอยู่ทางไหน', 'ประกอบจรวด']
  },
  {
    id: 'ocean', region: 2, stickers: ['🐙', '🐋', '🐢'], name: 'เกาะใต้ทะเล', subject: 'สัตว์ทะเล', letter: 'S',
    color: '#7FD8D2', grass: '#3FB7AE', friend: '🐢', friendName: 'น้องเต่าทะเล',
    decor: ['🐠', '🪸', '🐚'], x: 330, y: 200,
    problem: 'ทะเลบ้านน้องเต่ามีขยะเต็มเลย ช่วยกันดูแลทะเลหน่อยนะ',
    levels: ['อยู่ทะเลหรือบนบก', 'เล็กไปใหญ่', 'เก็บขยะในทะเล']
  },
  {
    id: 'body', region: 2, stickers: ['👃', '🪥', '🥦'], name: 'เกาะร่างกาย', subject: 'ร่างกายของเรา', letter: 'S',
    color: '#FFB59A', grass: '#F2896A', friend: '🐻', friendName: 'น้องหมี',
    decor: ['🦷', '🍎', '💪'], x: 560, y: 440,
    problem: 'น้องหมีปวดฟันและไม่สบายบ่อย ช่วยสอนวิธีดูแลร่างกายหน่อยนะ',
    levels: ['ประสาทสัมผัส', 'สะอาดปลอดเชื้อ', 'อาหารดีมีประโยชน์']
  },
  {
    id: 'kitchen', region: 2, stickers: ['🎨', '🧂', '🥪'], name: 'เกาะครัวนักวิทย์', subject: 'วิทยาศาสตร์ในครัว', letter: 'S',
    color: '#F7D06B', grass: '#E2AE36', friend: '🐷', friendName: 'น้องหมูเชฟ',
    decor: ['🍳', '🧁', '🥕'], x: 850, y: 200,
    problem: 'น้องหมูเชฟอยากทำอาหารเหมือนนักวิทยาศาสตร์ มาช่วยทดลองในครัวกันนะ',
    levels: ['ผสมสี', 'ละลายไหมนะ', 'ทำอาหารตามสูตร']
  }
];
ISLANDS.forEach(i => { i.region = i.region || 1; });

// ด่านที่ 4 เป็นต้นไปคือด่านท้าทาย (ไม่ต้องผ่านก็ไปเกาะต่อไปได้)
const MAIN_LEVELS = 3;
const MAX_STARS = ISLANDS.reduce((a, i) => a + i.levels.length * 3, 0);

// ของแต่งห้องนอน ปลดล็อกด้วยเหรียญคนดี 🏅 (ทำความดีในด่านเพื่อสะสม)
// x, y, size คือตำแหน่งในห้อง (หน่วย px ของพื้นที่ห้อง 860x630)
const ROOM_SPOTS = [
  { slot: 'wall', label: 'รูปติดผนัง', x: 70, y: 50, size: 120, options: [
    { id: 'frame', icon: '🖼️', medals: 0 }, { id: 'rainbow', icon: '🌈', medals: 4 }, { id: 'worldmap', icon: '🗺️', medals: 10 }] },
  { slot: 'lamp', label: 'โคมไฟ', x: 380, y: -6, size: 90, options: [
    { id: 'bulb', icon: '💡', medals: 0 }, { id: 'lantern', icon: '🏮', medals: 6 }, { id: 'starlamp', icon: '🌟', medals: 14 }] },
  { slot: 'shelf', label: 'ชั้นวางของ', x: 690, y: 150, size: 84, options: [
    { id: 'books', icon: '📚', medals: 0 }, { id: 'cup', icon: '🏆', medals: 8 }, { id: 'scope', icon: '🔭', medals: 16 }] },
  { slot: 'plant', label: 'ต้นไม้', x: 30, y: 430, size: 110, options: [
    { id: 'pot', icon: '🪴', medals: 1 }, { id: 'cactus', icon: '🌵', medals: 5 }, { id: 'sunflower', icon: '🌻', medals: 12 }] },
  { slot: 'toy', label: 'ของเล่น', x: 300, y: 480, size: 100, options: [
    { id: 'bear', icon: '🧸', medals: 2 }, { id: 'train', icon: '🚂', medals: 7 }, { id: 'kite', icon: '🪁', medals: 18 }] },
  { slot: 'pet', label: 'สัตว์เลี้ยง', x: 740, y: 470, size: 100, options: [
    { id: 'fish', icon: '🐠', medals: 3 }, { id: 'cat', icon: '🐱', medals: 11 }, { id: 'dog', icon: '🐶', medals: 20 }] },
  { slot: 'rug', label: 'พรม', x: 0, y: 0, size: 0, options: [
    { id: 'pink', icon: '🩷', color: '#FFC4DA', medals: 0 }, { id: 'blue', icon: '🩵', color: '#BFE3FF', medals: 9 },
    { id: 'rainbowrug', icon: '🌈', color: 'linear-gradient(90deg,#FFB3B3,#FFE0A3,#FFF6A3,#BFF2C0,#BFE3FF,#E0C8FF)', medals: 22 }] }
];

// ของแต่งตัว ปลดล็อกตามจำนวนดาวที่สะสม
const ACCESSORIES = [
  { id: 'bow', icon: '🎀', name: 'โบว์', slot: 'head', stars: 2 },
  { id: 'glasses', icon: '🕶️', name: 'แว่นกันแดด', slot: 'face', stars: 5 },
  { id: 'flower', icon: '🌸', name: 'ดอกไม้', slot: 'head', stars: 8 },
  { id: 'crown', icon: '👑', name: 'มงกุฎ', slot: 'head', stars: 12 },
  { id: 'balloon', icon: '🎈', name: 'ลูกโป่ง', slot: 'hand', stars: 15 },
  { id: 'cap', icon: '🧢', name: 'หมวกแก๊ป', slot: 'head', stars: 18 },
  { id: 'wand', icon: '🪄', name: 'ไม้กายสิทธิ์', slot: 'hand', stars: 22 },
  { id: 'wings', icon: '🦋', name: 'ปีกผีเสื้อ', slot: 'back', stars: 26 },
  { id: 'grad', icon: '🎓', name: 'หมวกเด็กเก่ง', slot: 'head', stars: 30 },
  { id: 'trophy', icon: '🏆', name: 'ถ้วยรางวัล', slot: 'hand', stars: 36 },
  { id: 'tophat', icon: '🎩', name: 'หมวกนักมายากล', slot: 'head', stars: 45 },
  { id: 'ball', icon: '⚽', name: 'ลูกบอล', slot: 'hand', stars: 55 },
  { id: 'backpack', icon: '🎒', name: 'กระเป๋าเป้', slot: 'back', stars: 68 },
  { id: 'unicorn', icon: '🦄', name: 'ที่คาดผมยูนิคอร์น', slot: 'head', stars: 85 }
];
