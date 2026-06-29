import fs from 'node:fs';
import path from 'node:path';

const src = fs.readFileSync('data/exercises.seed.ts','utf8');
const json = src.match(/export const exerciseSeed = (\[[\s\S]*\]) satisfies Exercise\[\];/)[1];
const exercises = JSON.parse(json);
const outDir = path.join('public','exercise-images');
fs.mkdirSync(outDir, { recursive: true });

const palette = {
  bodyweight: ['#dff7ff','#0ea5e9','#16a34a'], dumbbell: ['#eef2ff','#4f46e5','#0f766e'], band: ['#ecfdf5','#059669','#2563eb'],
  'pullup-bar': ['#f8fafc','#334155','#0ea5e9'], mat: ['#f0fdf4','#16a34a','#0284c7'], chair: ['#fff7ed','#ea580c','#16a34a'],
  step: ['#fefce8','#ca8a04','#0284c7'], kettlebell: ['#f5f3ff','#7c3aed','#059669'], cardio: ['#fee2e2','#ef4444','#0284c7'],
  core: ['#e0f2fe','#0369a1','#16a34a'], mobility: ['#f0f9ff','#0284c7','#84cc16'], stretching: ['#fdf2f8','#db2777','#16a34a']
};

function colorFor(e){ const key = e.category.find(c=>palette[c]) || 'bodyweight'; return palette[key]; }
function pose(e){
  const n=(e.nameEn||e.nameVi).toLowerCase();
  if(n.includes('squat')||n.includes('lunge')||n.includes('wall sit')) return 'lower';
  if(n.includes('push')||n.includes('press')||n.includes('dip')) return 'push';
  if(n.includes('row')||n.includes('pull')||n.includes('hang')) return 'pull';
  if(n.includes('plank')||n.includes('bug')||n.includes('crunch')||n.includes('raise')||n.includes('hollow')) return 'core';
  if(n.includes('stretch')||n.includes('pose')||n.includes('mobility')||n.includes('cow')||n.includes('cobra')) return 'stretch';
  if(n.includes('jump')||n.includes('burpee')||n.includes('high knees')||n.includes('boxing')||n.includes('fast')) return 'cardio';
  return 'stand';
}
function body(p, a, b){
  const head='<circle cx="160" cy="78" r="22" fill="#0f172a"/>';
  const torso='<path d="M160 102 L142 178 L178 178 Z" fill="#1f2937"/>';
  const common='<circle cx="160" cy="178" r="8" fill="#0f172a"/>';
  if(p==='lower') return `${head}${torso}${common}<path d="M148 176 Q105 225 92 292" stroke="#0f172a" stroke-width="16" stroke-linecap="round" fill="none"/><path d="M174 176 Q218 225 230 292" stroke="#0f172a" stroke-width="16" stroke-linecap="round" fill="none"/><path d="M145 122 Q105 150 90 188" stroke="#0f172a" stroke-width="13" stroke-linecap="round" fill="none"/><path d="M175 122 Q215 150 230 188" stroke="#0f172a" stroke-width="13" stroke-linecap="round" fill="none"/>`;
  if(p==='push') return `<circle cx="132" cy="136" r="20" fill="#0f172a"/><path d="M155 146 L238 180" stroke="#1f2937" stroke-width="22" stroke-linecap="round"/><path d="M212 174 L260 232" stroke="#0f172a" stroke-width="14" stroke-linecap="round"/><path d="M182 158 L152 218" stroke="#0f172a" stroke-width="14" stroke-linecap="round"/><path d="M240 182 L292 270" stroke="#0f172a" stroke-width="14" stroke-linecap="round"/><path d="M165 150 L98 190" stroke="#0f172a" stroke-width="14" stroke-linecap="round"/>`;
  if(p==='pull') return `${head}<path d="M80 55 H240" stroke="#334155" stroke-width="12" stroke-linecap="round"/><path d="M135 62 Q145 120 148 185" stroke="#0f172a" stroke-width="14" stroke-linecap="round" fill="none"/><path d="M185 62 Q175 120 172 185" stroke="#0f172a" stroke-width="14" stroke-linecap="round" fill="none"/>${torso}<path d="M150 178 L128 278" stroke="#0f172a" stroke-width="15" stroke-linecap="round"/><path d="M175 178 L202 278" stroke="#0f172a" stroke-width="15" stroke-linecap="round"/>`;
  if(p==='core') return `<circle cx="95" cy="130" r="20" fill="#0f172a"/><path d="M118 142 Q170 185 238 175" stroke="#1f2937" stroke-width="24" stroke-linecap="round" fill="none"/><path d="M150 170 L105 230" stroke="#0f172a" stroke-width="14" stroke-linecap="round"/><path d="M190 178 L248 238" stroke="#0f172a" stroke-width="14" stroke-linecap="round"/><path d="M125 145 L82 190" stroke="#0f172a" stroke-width="13" stroke-linecap="round"/><path d="M210 174 L265 140" stroke="#0f172a" stroke-width="13" stroke-linecap="round"/>`;
  if(p==='stretch') return `<circle cx="135" cy="106" r="20" fill="#0f172a"/><path d="M148 128 Q182 178 140 230" stroke="#1f2937" stroke-width="22" stroke-linecap="round" fill="none"/><path d="M145 220 Q95 250 78 294" stroke="#0f172a" stroke-width="14" stroke-linecap="round" fill="none"/><path d="M148 225 Q215 248 260 292" stroke="#0f172a" stroke-width="14" stroke-linecap="round" fill="none"/><path d="M155 142 Q205 130 245 102" stroke="#0f172a" stroke-width="13" stroke-linecap="round" fill="none"/>`;
  if(p==='cardio') return `${head}${torso}<path d="M145 120 L90 72" stroke="#0f172a" stroke-width="14" stroke-linecap="round"/><path d="M176 120 L232 74" stroke="#0f172a" stroke-width="14" stroke-linecap="round"/><path d="M150 178 L116 282" stroke="#0f172a" stroke-width="15" stroke-linecap="round"/><path d="M174 178 L224 260" stroke="#0f172a" stroke-width="15" stroke-linecap="round"/><path d="M82 50 Q160 18 238 50" stroke="${b}" stroke-width="8" stroke-dasharray="8 12" fill="none"/>`;
  return `${head}${torso}<path d="M145 123 L98 185" stroke="#0f172a" stroke-width="14" stroke-linecap="round"/><path d="M176 123 L222 185" stroke="#0f172a" stroke-width="14" stroke-linecap="round"/><path d="M150 178 L130 292" stroke="#0f172a" stroke-width="15" stroke-linecap="round"/><path d="M174 178 L194 292" stroke="#0f172a" stroke-width="15" stroke-linecap="round"/>`;
}
function equipment(e, b){ const cats=e.category.join(' '); if(cats.includes('dumbbell')) return '<circle cx="74" cy="190" r="14" fill="#111827"/><rect x="74" y="184" width="64" height="12" rx="6" fill="#111827"/><circle cx="138" cy="190" r="14" fill="#111827"/>'; if(cats.includes('band')) return `<path d="M65 245 Q160 210 255 245" stroke="${b}" stroke-width="10" fill="none"/>`; if(cats.includes('chair')) return '<rect x="218" y="190" width="52" height="14" rx="6" fill="#475569"/><path d="M225 205 V288 M262 205 V288" stroke="#475569" stroke-width="8"/>'; if(cats.includes('step')) return '<rect x="94" y="268" width="150" height="28" rx="8" fill="#64748b"/>'; if(cats.includes('kettlebell')) return '<path d="M235 188 q25 0 25 28 v12 h-50 v-12 q0-28 25-28z" fill="#111827"/><circle cx="235" cy="238" r="26" fill="#111827"/>'; return ''; }
function esc(s){ return String(s).replace(/[&<>]/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[m])); }
for (const e of exercises) {
  const [bg,a,b]=colorFor(e); const p=pose(e);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 420" role="img" aria-label="${esc(e.nameVi)}">
  <defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="${bg}"/><stop offset="1" stop-color="#ffffff"/></linearGradient></defs>
  <rect width="320" height="420" rx="32" fill="url(#g)"/>
  <circle cx="260" cy="64" r="38" fill="${a}" opacity="0.16"/><circle cx="58" cy="350" r="48" fill="${b}" opacity="0.15"/>
  <rect x="42" y="318" width="236" height="18" rx="9" fill="#cbd5e1" opacity="0.8"/>
  <g transform="translate(0,28)">${equipment(e,b)}${body(p,a,b)}</g>
  <rect x="24" y="24" width="88" height="28" rx="14" fill="${a}" opacity="0.95"/><text x="68" y="43" font-family="Arial, sans-serif" font-size="12" font-weight="700" text-anchor="middle" fill="white">FITVN</text>
  <text x="160" y="372" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="800" fill="#0f172a">${esc(e.nameVi).slice(0,32)}</text>
  <text x="160" y="395" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" font-weight="700" fill="#475569">${esc(e.primaryMuscles.join(' • ')).slice(0,38)}</text>
</svg>`;
  fs.writeFileSync(path.join(outDir, `${e.id}.svg`), svg);
}
console.log(`Đã tạo ${exercises.length} SVG minh họa tại ${outDir}.`);
