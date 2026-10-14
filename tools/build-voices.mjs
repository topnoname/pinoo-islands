// สร้างไฟล์เสียงพากย์ (voice/*.mp3) จากประโยคใน js/lines.js
// พี่หนูใช้เสียง Niwat ส่วนพี่แฮม (ประโยคที่ขึ้นต้นด้วย HAM) ใช้เสียง Vivienne
// วิธีใช้:  node tools/build-voices.mjs
// ต้องติดตั้ง edge-tts ก่อน (pip install edge-tts) หรือกำหนด EDGE_TTS_PATH เป็นโฟลเดอร์ที่ติดตั้งไว้
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const VOICE = process.env.TTS_VOICE || 'th-TH-NiwatNeural';
const HAM_VOICE = process.env.TTS_HAM_VOICE || 'fr-FR-VivienneMultilingualNeural';
const PITCH = process.env.TTS_PITCH || '+0Hz';
const RATE = '-5%';

const ctx = vm.createContext({});
for (const f of ['js/data.js', 'js/lines.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
}
const lines = vm.runInContext('allLines().map(t => [voiceKey(t), speakText(t), isHam(t)])', ctx);

const outDir = path.join(root, 'voice');
fs.mkdirSync(outDir, { recursive: true });
const env = { ...process.env, PYTHONIOENCODING: 'utf-8' };
if (process.env.EDGE_TTS_PATH) env.PYTHONPATH = process.env.EDGE_TTS_PATH;

// ส่งข้อความผ่านไฟล์ UTF-8 เพื่อไม่ให้ภาษาไทยเพี้ยนบน Windows และลองใหม่ถ้าเซิร์ฟเวอร์ไม่ตอบ
const tmp = path.join(outDir, '.line.txt');
let made = 0;
const failed = [];
for (const [key, text, ham] of lines) {
  const file = path.join(outDir, `${key}.mp3`);
  if (fs.existsSync(file) && fs.statSync(file).size > 0) continue;
  console.log(`${ham ? '🌈' : '🎙️ '} ${key}  ${text}`);
  fs.writeFileSync(tmp, text, 'utf8');
  for (let attempt = 1; ; attempt++) {
    try {
      execFileSync('python', ['-m', 'edge_tts', '--voice', ham ? HAM_VOICE : VOICE, `--rate=${RATE}`, `--pitch=${PITCH}`, '--file', tmp, '--write-media', file], { env, stdio: ['ignore', 'ignore', 'pipe'], timeout: 30000 });
      if (fs.statSync(file).size > 0) break;
    } catch (e) {
      // บางคำ เช่น "กดที่" ทำให้เสียง Premwadee ไม่ส่งเสียงกลับมา ให้ลองเปลี่ยนถ้อยคำ
      if (attempt >= 3) { fs.rmSync(file, { force: true }); failed.push(key); console.log("   ❌ สร้างไม่ได้ ลองเปลี่ยนถ้อยคำ (ในเกมจะใช้เสียงเบราว์เซอร์แทน)"); break; }
    }
    console.log(`   ลองใหม่ครั้งที่ ${attempt + 1}`);
  }
  if (!failed.includes(key)) made++;
}
fs.rmSync(tmp, { force: true });

const manifest = Object.fromEntries(lines.filter(([k]) => !failed.includes(k)).map(([k]) => [k, 1]));
fs.writeFileSync(path.join(outDir, 'manifest.js'),
  '// สร้างอัตโนมัติโดย tools/build-voices.mjs ห้ามแก้เอง\nconst VOICE_FILES = ' + JSON.stringify(manifest) + ';\n');
console.log(`เสร็จแล้ว: สร้างใหม่ ${made} ไฟล์ รวมทั้งหมด ${lines.length} ประโยค สร้างไม่ได้ ${failed.length}`);
