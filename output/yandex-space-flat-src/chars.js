// Flat line-art characters in the style of the Yandex Space card video.
// Each bust is drawn in a 400x440 box; bottom-center (200,440) sits on the table bar.
const INK = '#1d1d1f';
const SW = 7;
const st = (w = SW) => `stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;

function bodyPath(w = 150) {
  return `M${200 - w},446 C${204 - w},372 ${200 - w * 0.62},320 165,306 L235,306 C${200 + w * 0.62},320 ${196 + w},372 ${200 + w},446 Z`;
}
const FACE = 'M200,120 C238,120 262,150 262,188 C262,232 236,262 200,262 C164,262 138,232 138,188 C138,150 162,120 200,120 Z';
const neck = (fill = '#fff') => `<rect x="182" y="240" width="36" height="74" fill="${fill}" ${st()}/>`;
const face = () => `<path d="${FACE}" fill="#fff" ${st()}/>`;

// e = {eyes, brows, mouth, open, blink, look, blush, sweat, anger}
function features(e = {}, o = {}) {
  const ey = o.ey ?? 198, ex = o.ex ?? 22, cx = 200 + (e.look || 0);
  const r = o.eyeR ?? 1;
  let s = '';
  if (e.blush) s += `<ellipse cx="158" cy="228" rx="13" ry="6" fill="#f3a39b" opacity=".75"/><ellipse cx="242" cy="228" rx="13" ry="6" fill="#f3a39b" opacity=".75"/>`;
  const eyes = e.eyes || 'dot';
  for (const sx of [-1, 1]) {
    const x = cx + sx * ex;
    if (eyes === 'dot') s += `<ellipse cx="${x}" cy="${ey}" rx="${7 * r}" ry="${Math.max(1.2, 9 * r * (1 - (e.blink || 0)))}" fill="${INK}"/>`;
    else if (eyes === 'wide') s += `<ellipse cx="${x}" cy="${ey}" rx="${9.5 * r}" ry="${12.5 * r}" fill="${INK}"/><circle cx="${x + 3}" cy="${ey - 4}" r="${3 * r}" fill="#fff"/>`;
    else if (eyes === 'happy') s += `<path d="M${x - 10},${ey + 4} Q${x},${ey - 12} ${x + 10},${ey + 4}" fill="none" ${st(6)}/>`;
    else if (eyes === 'flat') s += `<path d="M${x - 11},${ey} L${x + 11},${ey}" fill="none" ${st(6)}/>`;
  }
  const by = o.by ?? (ey - 24);
  if (e.brows === 'angry') s += `<path d="M${cx - 36},${by - 6} L${cx - 10},${by + 5}" ${st(6)}/><path d="M${cx + 10},${by + 5} L${cx + 36},${by - 6}" ${st(6)}/>`;
  if (e.brows === 'worried') s += `<path d="M${cx - 34},${by + 4} L${cx - 10},${by - 5}" ${st(6)}/><path d="M${cx + 10},${by - 5} L${cx + 34},${by + 4}" ${st(6)}/>`;
  if (e.brows === 'up') s += `<path d="M${cx - 32},${by - 4} Q${cx - 22},${by - 12} ${cx - 10},${by - 6}" fill="none" ${st(6)}/><path d="M${cx + 10},${by - 6} Q${cx + 22},${by - 12} ${cx + 32},${by - 4}" fill="none" ${st(6)}/>`;
  const my = o.my ?? 234, mx = cx;
  const m = e.mouth;
  if (m === 'talk') { const a = e.open ?? 0.5; s += `<ellipse cx="${mx}" cy="${my}" rx="${7 + 4 * a}" ry="${2 + 8 * a}" fill="${INK}"/>`; }
  if (m === 'o') { const a = e.open ?? 1; s += `<ellipse cx="${mx}" cy="${my + 2}" rx="${6 + 6 * a}" ry="${6 + 10 * a}" fill="${INK}"/>`; }
  if (m === 'frown') s += `<path d="M${mx - 13},${my + 6} Q${mx},${my - 6} ${mx + 13},${my + 6}" fill="none" ${st(5)}/>`;
  if (m === 'smile') s += `<path d="M${mx - 14},${my - 4} Q${mx},${my + 10} ${mx + 14},${my - 4}" fill="none" ${st(5)}/>`;
  if (m === 'grin') s += `<path d="M${mx - 17},${my - 6} Q${mx},${my + 20} ${mx + 17},${my - 6} Z" fill="${INK}" ${st(4)}/><path d="M${mx - 8},${my + 6} Q${mx},${my + 2} ${mx + 8},${my + 6}" fill="#f07f86"/>`;
  if (m === 'line') s += `<path d="M${mx - 10},${my} L${mx + 10},${my}" ${st(5)}/>`;
  return s;
}

// A — long black hair, beige shirt
function charA(e) {
  return `
  <path d="M128,190 C118,104 282,104 272,190 C276,262 286,334 298,440 L102,440 C114,334 124,262 128,190 Z" fill="#2c201b" ${st()}/>
  <path d="${bodyPath(150)}" fill="#e6dccd" ${st()}/>
  <path d="M164,306 L200,384 L236,306" fill="none" ${st(5)}/>
  <path d="M176,306 L200,360 L224,306 Z" fill="#fff" ${st(5)}/>
  <circle cx="200" cy="334" r="7" fill="#f2b630" ${st(3.5)}/>
  ${neck()}${face()}
  ${features(e)}
  <path d="M134,214 C124,146 156,108 206,110 C250,112 274,142 266,184 C246,154 214,146 192,152 C166,162 146,186 134,214 Z" fill="#2c201b" ${st()}/>
  <path d="M136,196 C128,262 120,338 114,440 L148,440 C150,352 154,282 152,226 Z" fill="#2c201b" ${st()}/>
  <path d="M264,196 C272,262 280,338 286,440 L252,440 C250,352 246,282 248,226 Z" fill="#2c201b" ${st()}/>`;
}

// B — red hijab with dots, round glasses
function charB(e) {
  const dots = [[150, 150], [200, 112], [252, 150], [128, 230], [272, 228], [104, 330], [150, 360], [196, 382], [246, 370], [292, 340], [120, 392], [314, 392], [176, 334], [228, 318], [272, 296], [132, 290]];
  return `
  <path d="${bodyPath(140)}" fill="#2d2226" ${st()}/>
  <path d="M200,102 C126,102 110,170 114,236 C108,302 70,342 60,406 C140,428 260,428 340,406 C330,342 292,302 286,236 C290,170 274,102 200,102 Z" fill="#c25f5a" ${st()}/>
  <path d="M118,334 C168,366 252,370 304,336" fill="none" stroke="#97433f" stroke-width="5" stroke-linecap="round"/>
  ${dots.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5.5" fill="#f2c890"/>`).join('')}
  <ellipse cx="200" cy="198" rx="70" ry="80" fill="#f4ece0" ${st()}/>
  <ellipse cx="200" cy="204" rx="56" ry="66" fill="#fff" ${st()}/>
  ${features(Object.assign({}, e, { eyes: e.eyes === 'dot' || !e.eyes ? 'dotS' : e.eyes }), { ey: 202, ex: 21, my: 244, by: 168 })}
  ${`<circle cx="${179 + (e.look || 0)}" cy="202" r="19" fill="none" ${st(6)}/><circle cx="${221 + (e.look || 0)}" cy="202" r="19" fill="none" ${st(6)}/><path d="M${198 + (e.look || 0)},200 L${202 + (e.look || 0)},200" ${st(5)}/>`}
  ${(!e.eyes || e.eyes === 'dot') ? `<circle cx="${179 + (e.look || 0)}" cy="202" r="${5.5 * (1 - (e.blink || 0)) + 1}" fill="${INK}"/><circle cx="${221 + (e.look || 0)}" cy="202" r="${5.5 * (1 - (e.blink || 0)) + 1}" fill="${INK}"/>` : ''}`;
}

// C — brown bob, dark jacket with maroon top
function charC(e) {
  return `
  <path d="M128,262 C110,168 146,104 200,104 C254,104 290,168 272,262 C262,270 250,266 246,256 L154,256 C150,266 138,270 128,262 Z" fill="#7b4b2e" ${st()}/>
  <path d="${bodyPath(148)}" fill="#2a2a2d" ${st()}/>
  <path d="M176,306 L224,306 L230,446 L170,446 Z" fill="#7a2b35" ${st(5)}/>
  <path d="M200,318 L200,440" stroke="#d9d9d9" stroke-width="3"/>
  <path d="M168,314 L150,440 M232,314 L250,440" stroke="#8a8a8f" stroke-width="3.5" stroke-linecap="round"/>
  ${neck()}${face()}
  ${features(e)}
  <path d="M140,196 C134,140 160,110 200,110 C240,110 266,140 260,196 C250,172 230,160 200,160 C170,160 150,172 140,196 Z" fill="#7b4b2e" ${st()}/>`;
}

// D — curly hair, white hoodie
function charD(e, opt = {}) {
  const curls = [[138, 158, 22], [146, 130, 26], [166, 106, 26], [196, 94, 28], [228, 98, 27], [254, 118, 26], [264, 150, 22], [172, 134, 22], [200, 126, 24], [230, 132, 22]];
  return `
  <path d="${bodyPath(150)}" fill="#f2f0ea" ${st()}/>
  <path d="M146,320 C150,286 250,286 254,320 C236,334 164,334 146,320 Z" fill="#f2f0ea" ${st()}/>
  ${neck()}
  <path d="M186,332 L184,396 M214,332 L216,396" ${st(4)}/>
  <circle cx="184" cy="400" r="5" fill="${INK}"/><circle cx="216" cy="400" r="5" fill="${INK}"/>
  ${face()}
  ${features(e)}
  ${curls.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${INK}" stroke="${INK}" stroke-width="${SW * 2}"/>`).join('')}
  ${curls.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#b98048"/>`).join('')}
  ${opt.laptop ? laptopBack(opt.laptopY || 0) : ''}`;
}

// E — long brown hair, center part, beige shirt
function charE(e) {
  return `
  <path d="M126,196 C116,108 284,108 274,196 L286,440 L114,440 Z" fill="#7a4a2a" ${st()}/>
  <path d="${bodyPath(150)}" fill="#e9cf9e" ${st()}/>
  <path d="M170,306 L188,338 L200,314 L212,338 L230,306 Z" fill="#f5e3bf" ${st(5)}/>
  ${neck()}${face()}
  ${features(e)}
  <path d="M200,116 C158,116 134,150 132,204 L128,440 L154,440 L154,236 C154,184 170,144 200,122 Z" fill="#7a4a2a" ${st()}/>
  <path d="M200,116 C242,116 266,150 268,204 L272,440 L246,440 L246,236 C246,184 230,144 200,122 Z" fill="#7a4a2a" ${st()}/>
  <path d="M144,250 L142,420 M258,250 L260,420" stroke="#5a341c" stroke-width="3" stroke-linecap="round"/>`;
}

// ChatGPT robot
function rosette(cx, cy, s = 1, color = '#fff', w = 5) {
  return `<g transform="translate(${cx},${cy}) scale(${s})">${[0, 60, 120].map(a => `<ellipse rx="20" ry="9" transform="rotate(${a})" fill="none" stroke="${color}" stroke-width="${w}"/>`).join('')}</g>`;
}
function bot(e = {}) {
  const lk = e.look || 0;
  let eyes = '';
  const ey = 178;
  for (const x of [170 + lk, 216 + lk]) {
    if (!e.eyes || e.eyes === 'dot') eyes += `<rect x="${x}" y="${ey + 12 * (e.blink || 0)}" width="15" height="${Math.max(3, 26 * (1 - (e.blink || 0)))}" fill="${INK}"/>`;
    if (e.eyes === 'happy') eyes += `<path d="M${x - 8},${ey + 22} L${x + 7},${ey + 6} L${x + 22},${ey + 22}" fill="none" stroke="${INK}" stroke-width="9" stroke-linejoin="miter"/>`;
    if (e.eyes === 'flat') eyes += `<rect x="${x - 6}" y="${ey + 10}" width="28" height="8" fill="${INK}"/>`;
  }
  if (e.mouth === 'smile') eyes += `<path d="M184,232 L192,240 L208,240 L216,232" fill="none" stroke="${INK}" stroke-width="7"/>`;
  if (e.blush) eyes += `<rect x="140" y="222" width="22" height="9" fill="#f3a39b" opacity=".8"/><rect x="238" y="222" width="22" height="9" fill="#f3a39b" opacity=".8"/>`;
  let sweat = '';
  if (e.sweat) { const sy = 120 + 40 * (e.sweatY || 0); sweat = `<g opacity="${e.sweat}"><path d="M284,${sy} C292,${sy + 14} 298,${sy + 22} 298,${sy + 30} A14,14 0 0 1 270,${sy + 30} C270,${sy + 22} 276,${sy + 14} 284,${sy} Z" fill="#9fd6ff" ${st(4)}/></g>`; }
  return `
  <rect x="146" y="290" width="108" height="160" rx="16" fill="#262628" ${st()}/>
  ${rosette(200, 372, 1, '#fff', 5)}
  <rect x="228" y="304" width="16" height="7" rx="2" fill="#8ff0d0"/>
  <rect x="166" y="266" width="68" height="30" rx="6" fill="#2f9a74" ${st()}/>
  <rect x="92" y="168" width="26" height="64" rx="8" fill="#2f9a74" ${st()}/>
  <rect x="282" y="168" width="26" height="64" rx="8" fill="#2f9a74" ${st()}/>
  <rect x="110" y="104" width="180" height="168" rx="26" fill="#4cbb94" ${st()}/>
  <rect x="124" y="118" width="40" height="10" rx="5" fill="#fff" opacity=".35"/>
  ${eyes}${sweat}`;
}

function laptopBack(dy = 0) {
  return `<g transform="translate(0,${dy})"><rect x="112" y="318" width="176" height="128" rx="12" fill="#c8ccd4" ${st()}/><circle cx="200" cy="380" r="11" fill="#fff" ${st(4)}/></g>`;
}

function overlays(e = {}, dx = 0) {
  let s = '';
  if (e.sweat) {
    const sy = 140 + 30 * (e.sweatY || 0);
    s += `<g opacity="${e.sweat}"><path d="M${268 + dx},${sy} C${276 + dx},${sy + 14} ${282 + dx},${sy + 22} ${282 + dx},${sy + 30} A14,14 0 0 1 ${254 + dx},${sy + 30} C${254 + dx},${sy + 22} ${260 + dx},${sy + 14} ${268 + dx},${sy} Z" fill="#9fd6ff" ${st(4)}/></g>`;
  }
  if (e.anger) {
    const k = e.anger;
    s += `<g transform="translate(${276 + dx},128) scale(${k})" opacity="${Math.min(1, k)}">` +
      [0, 90, 180, 270].map(a => `<path transform="rotate(${a})" d="M6,-22 Q6,-6 22,-6" fill="none" stroke="#e5483d" stroke-width="7" stroke-linecap="round"/>`).join('') + `</g>`;
  }
  return s;
}

const CHARS = { A: charA, B: charB, C: charC, D: charD, E: charE, bot };

// place a bust so that its bottom-center lands at (x,y)
function bust(name, e, x, y, s = 1, opt = {}) {
  const rot = opt.rot || 0;
  return `<g transform="translate(${x},${y}) rotate(${rot}) scale(${s}) translate(-200,-440)">${CHARS[name](e || {}, opt)}${name === 'bot' ? '' : overlays(e || {})}</g>`;
}
