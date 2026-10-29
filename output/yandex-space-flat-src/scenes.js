// Story scenes, rendered as a pure function of the source frame number (30 fps).
const FPS = 30;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;
const prog = (t, a, b) => clamp((t - a) / (b - a));
const easeOut = k => 1 - Math.pow(1 - k, 3);
const easeInOut = k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
const easeBack = k => { const c = 1.9; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); };
const FONT = `font-family="Inter, 'Noto Color Emoji', sans-serif"`;

function rand(i) { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }

// ---------- shared pieces ----------
const PAL = ['#cfe8d6', '#dbe4fb', '#e8e0fb', '#fbe8b4', '#d6ebf7', '#f7dcd6'];
function dots(t, fill = 1) {
  let s = '';
  for (let i = 0; i < 34; i++) {
    const x = rand(i) * 1920, y0 = rand(i + 50) * 1080, r = 7 + rand(i + 99) * 15;
    const y = y0 + Math.sin(t * 0.8 + i) * 10;
    s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="${PAL[i % PAL.length]}" opacity="${0.9 * fill}"/>`;
  }
  return s;
}
const bgFill = (c) => `<rect width="1920" height="1080" fill="${c}"/>`;
const bar = (x1, x2, y, h = 36) => `<rect x="${x1}" y="${y}" width="${x2 - x1}" height="${h}" rx="${h / 2}" fill="#fff" ${st(8)}/>`;
function cam(inner, s = 1, cx = 960, cy = 540, dx = 0, dy = 0, rot = 0) {
  return `<g transform="translate(${960 + dx},${540 + dy}) rotate(${rot}) scale(${s}) translate(${-cx},${-cy})">${inner}</g>`;
}
function popIn(t, t0, dur = 0.3) { return easeBack(prog(t, t0, t0 + dur)); }
// talking mouth amount (deterministic "speech")
function talk(t, speed = 13) { return clamp(0.5 + 0.5 * Math.sin(t * speed) * Math.sin(t * speed * 0.37 + 1.3) * 1.6, 0, 1); }
function blinkAt(t, times) { for (const b of times) { const k = (t - b) / 0.16; if (k >= 0 && k <= 1) return Math.sin(k * Math.PI); } return 0; }

// pastel full-screen "card" backdrop like the reference cards
let CARD = null;
function cardBg(t, color, k = 1) {
  const m = 46 * (1 - k);
  CARD = [40 + m, 40 + m, 1840 - 2 * m, 1000 - 2 * m];
  const r = `x="${CARD[0]}" y="${CARD[1]}" width="${CARD[2]}" height="${CARD[3]}" rx="44"`;
  return bgFill('#fff') + dots(t, 0.8) +
    `<clipPath id="cc"><rect ${r}/></clipPath><g clip-path="url(#cc)"><rect ${r} fill="${color}"/>`;
}
function cardIcon(x, y, kind, color) {
  let g = '';
  if (kind === 'laptop') g = `<rect x="-16" y="-12" width="32" height="20" rx="3" fill="none" stroke="${color}" stroke-width="4.5"/><path d="M-22,13 L22,13" stroke="${color}" stroke-width="4.5" stroke-linecap="round"/>`;
  if (kind === 'chat') g = `<path d="M-18,-14 H18 Q22,-14 22,-10 V8 Q22,12 18,12 H-4 L-14,20 V12 H-18 Q-22,12 -22,8 V-10 Q-22,-14 -18,-14 Z" fill="none" stroke="${color}" stroke-width="4.5" stroke-linejoin="round"/>`;
  if (kind === 'bolt') g = `<path d="M4,-22 L-12,4 H2 L-4,22 L14,-6 H0 Z" fill="${color}"/>`;
  if (kind === 'people') g = `<circle cx="-12" cy="-6" r="7" fill="none" stroke="${color}" stroke-width="4"/><circle cx="12" cy="-6" r="7" fill="none" stroke="${color}" stroke-width="4"/><circle cx="0" cy="-10" r="7" fill="none" stroke="${color}" stroke-width="4"/><path d="M-24,16 Q-12,2 0,16 Q12,2 24,16" fill="none" stroke="${color}" stroke-width="4"/>`;
  if (kind === 'gpt') g = rosette(0, 0, 0.75, color, 4.5);
  return `<g transform="translate(${x},${y})"><circle r="40" fill="#fff" ${st(7)}/>${g}</g>`;
}
const cornerTag = (x, y, txt, color) => `<text x="${x}" y="${y}" ${FONT} font-size="48" font-weight="800" fill="${color}" text-anchor="end">${txt}</text>`;

// ---------- props ----------
function noticeBoard(x, y) {
  let s = `<g transform="translate(${x},${y})"><rect width="420" height="280" rx="22" fill="#f7e3b8" ${st(7)}/>
  <text x="210" y="56" ${FONT} font-size="30" font-weight="800" fill="${INK}" text-anchor="middle">РАСПИСАНИЕ</text>`;
  const papers = [[34, 84, 150, 160, -3], [206, 80, 180, 120, 2], [214, 214, 96, 50, -4], [326, 210, 66, 54, 5]];
  papers.forEach(([px, py, w, h, r], i) => {
    s += `<g transform="rotate(${r} ${px + w / 2} ${py + h / 2})"><rect x="${px}" y="${py}" width="${w}" height="${h}" rx="8" fill="${i == 2 ? '#e8e0fb' : i == 3 ? '#cfe8d6' : '#fff'}" ${st(5)}/>`;
    if (i < 2) for (let l = 0; l < (i ? 4 : 6); l++) s += `<path d="M${px + 16},${py + 26 + l * 22} H${px + w - 16 - (l % 3) * 20}" stroke="#b9b4ab" stroke-width="5" stroke-linecap="round"/>`;
    s += `<circle cx="${px + w / 2}" cy="${py + 10}" r="7" fill="${['#e5483d', '#4f86f7', '#f2b630', '#2fa36b'][i]}" ${st(3)}/></g>`;
  });
  return s + '</g>';
}
function clock(x, y, t, r = 56) {
  const a1 = t * 30, a2 = t * 2.5 + 60;
  return `<g transform="translate(${x},${y})"><circle r="${r}" fill="#fff" ${st(7)}/>
  ${[0, 90, 180, 270].map(a => `<path transform="rotate(${a})" d="M0,${-r + 12} V${-r + 20}" ${st(5)}/>`).join('')}
  <path transform="rotate(${a2})" d="M0,0 V${-r * 0.45}" ${st(7)}/><path transform="rotate(${a1})" d="M0,0 V${-r * 0.7}" ${st(5)}/><circle r="6" fill="${INK}"/></g>`;
}
function bubble(x, y, w, h, text, k, tail = 'left', fs = 34) {
  const sc = easeBack(k);
  const [ax, bx, cx] = tail === 'left' ? [x + 70, x + 40, x + 130] : [x + w - 130, x + w - 40, x + w - 70];
  const by = y + h;
  return `<g opacity="${clamp(k * 3)}" transform="translate(${bx},${by}) scale(${sc}) translate(${-bx},${-by})">
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="34" fill="#fff" ${st(7)}/>
    <path d="M${ax},${by - 10} L${bx},${by + 40} L${cx},${by - 10} Z" fill="#fff"/>
    <path d="M${ax},${by - 1} L${bx},${by + 40} L${cx},${by - 1}" fill="none" ${st(7)}/>
    ${text}</g>`;
}
function typeText(str, k) { const n = Math.floor(str.length * clamp(k)); return str.slice(0, n); }
function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

function sparkle(x, y, s, color) {
  return `<g transform="translate(${x},${y}) scale(${s})"><path d="M0,-26 Q4,-4 26,0 Q4,4 0,26 Q-4,4 -26,0 Q-4,-4 0,-26 Z" fill="${color}" ${st(4)}/></g>`;
}

// ---------- ChatGPT window ----------
function gptWindow(t, state) {
  // state: {typing, status:'search'|'done', rows:[k...], red:k}
  let s = `<rect x="250" y="110" width="1420" height="860" rx="40" fill="#fff" ${st(9)}/>
  <circle cx="326" cy="186" r="30" fill="#4cbb94" ${st(6)}/>${rosette(326, 186, 0.78, '#fff', 4)}
  <text x="374" y="198" ${FONT} font-size="36" font-weight="800" fill="${INK}">ChatGPT</text>
  <text x="1610" y="196" ${FONT} font-size="26" font-weight="500" fill="#8b8b93" text-anchor="end">поиск места · 12 человек</text>
  <path d="M250,250 H1670" stroke="${INK}" stroke-width="6"/>`;
  const msg = 'Найди, где нам посидеть всей группой. Нас 12.';
  s += `<rect x="850" y="282" width="760" height="70" rx="35" fill="#e8e0fb" ${st(5)}/>
  <text x="1580" y="328" ${FONT} font-size="29" font-weight="600" fill="${INK}" text-anchor="end">${msg}</text>`;
  if (state.typing) {
    s += [0, 1, 2].map(i => `<circle cx="${330 + i * 34}" cy="${400 - 10 * Math.max(0, Math.sin(t * 9 - i * 0.9))}" r="11" fill="${INK}" opacity="${0.35 + 0.65 * Math.max(0, Math.sin(t * 9 - i * 0.9))}"/>`).join('');
  }
  if (state.status) {
    const done = state.status === 'done';
    const kk = done ? easeBack(state.doneK ?? 1) : 1;
    const w = done ? 190 : 210;
    s += `<g transform="translate(310,380) scale(${kk}) translate(-310,-380)"><rect x="310" y="372" width="${w}" height="54" rx="27" fill="${done ? '#d6f2df' : '#f1f1f4'}" ${st(5)}/>
    <text x="${310 + w / 2}" y="408" ${FONT} font-size="26" font-weight="700" fill="${done ? '#1f8a4c' : '#6b6b73'}" text-anchor="middle">${done ? '✓ Готово!' : 'Ищу место' + '...'.slice(0, 1 + Math.floor(t * 3) % 3)}</text></g>`;
  }
  const rows = [
    ['Место на 12 человек', '✓ найдено', '#d6f2df', '#1f8a4c'],
    ['Вся группа точно придёт', '✓ гарантировано', '#d6f2df', '#1f8a4c'],
    ['Аудитория 305', 'свободна с 8:00', '#fdf0c2', '#a26f00'],
  ];
  rows.forEach((r, i) => {
    const k = state.rows[i] || 0;
    if (k <= 0) return;
    const y = 462 + i * 106 + 30 * (1 - easeOut(k));
    s += `<g opacity="${clamp(k * 1.5)}"><rect x="310" y="${y}" width="1300" height="84" rx="22" fill="#f7f7f9" ${st(5)}/>
    <text x="346" y="${y + 53}" ${FONT} font-size="32" font-weight="700" fill="${INK}">${r[0]}</text>
    <rect x="${1580 - r[1].length * 17 - 40}" y="${y + 18}" width="${r[1].length * 17 + 40}" height="48" rx="24" fill="${r[2]}" ${st(4)}/>
    <text x="${1580 - (r[1].length * 17 + 40) / 2}" y="${y + 51}" ${FONT} font-size="25" font-weight="700" fill="${r[3]}" text-anchor="middle">${r[1]}</text></g>`;
  });
  if (state.red > 0) {
    const k = state.red, y = 462 + 3 * 106, sc = lerp(1.25, 1, easeOut(k));
    const shake = k < 1 ? Math.sin(k * 60) * 10 * (1 - k) : 0;
    s += `<g opacity="${clamp(k * 2)}" transform="translate(${960 + shake},${y + 42}) scale(${sc}) translate(-960,${-y - 42})">
    <rect x="300" y="${y - 10}" width="1320" height="104" rx="30" fill="#e5483d" opacity="${0.18 + 0.12 * Math.sin(t * 8)}"/>
    <rect x="310" y="${y}" width="1300" height="84" rx="22" fill="#fde3e0" stroke="#d63c31" stroke-width="7"/>
    <text x="346" y="${y + 54}" ${FONT} font-size="33" font-weight="800" fill="#c42f25">Пересдача · Экономический анализ</text>
    <rect x="1170" y="${y + 18}" width="410" height="48" rx="24" fill="#e5483d" ${st(4)}/>
    <text x="1375" y="${y + 51}" ${FONT} font-size="25" font-weight="700" fill="#fff" text-anchor="middle">12 студентов ✓ записаны</text></g>`;
  }
  return s;
}

// ---------- group chat phone ----------
const CHAT = [
  { t: 24.3, name: 'Преподаватель', col: '#4f86f7', ini: 'П', text: ['Жду всех завтра в 8:00.', 'Аудитория 305.'] },
  { t: 25.3, name: 'Староста', col: '#e5483d', ini: 'С', text: ['КТО ЗАПИСАЛ НАС', 'НА ПЕРЕСДАЧУ'], red: 1 },
  { t: 26.5, name: 'Тимур', col: '#f2a530', ini: 'Т', text: ['😡😡😡'] },
  { t: 27.2, name: 'Аня', col: '#2fa36b', ini: 'А', text: ['ЧТО???'] },
  { t: 27.8, name: 'Альбина', col: '#9a6cf0', ini: 'А', text: ['😡'] },
  { t: 28.3, name: 'Фархад', col: '#2fa3b5', ini: 'Ф', text: ['мы же сдали 😡😡'] },
];
function msgH(m) { return 56 + m.text.length * 40 + 18; }
function phoneChat(t) {
  const X = 640, Y = 50, W = 640, H = 990;
  let s = `<rect x="${X}" y="${Y}" width="${W}" height="${H}" rx="70" fill="#fff" ${st(11)}/>
  <rect x="${X + W / 2 - 70}" y="${Y + 22}" width="140" height="34" rx="17" fill="${INK}"/>
  <text x="${X + 56}" y="${Y + 50}" ${FONT} font-size="24" font-weight="700" fill="${INK}">20:54</text>
  <text x="${X + W - 56}" y="${Y + 50}" ${FONT} font-size="24" font-weight="700" fill="${INK}" text-anchor="end">87%</text>
  <circle cx="${X + 80}" cy="${Y + 124}" r="34" fill="#4f86f7" ${st(5)}/>
  <text x="${X + 80}" y="${Y + 133}" ${FONT} font-size="22" font-weight="800" fill="#fff" text-anchor="middle">04.1</text>
  <text x="${X + 132}" y="${Y + 118}" ${FONT} font-size="32" font-weight="800" fill="${INK}">Группа 04.1-408</text>
  <text x="${X + 132}" y="${Y + 150}" ${FONT} font-size="22" font-weight="500" fill="#8b8b93">28 участников</text>
  <path d="M${X},${Y + 186} H${X + W}" stroke="${INK}" stroke-width="5"/>`;
  const shown = CHAT.filter(m => t >= m.t);
  const unread = 3 + shown.length * 4;
  const bk = shown.length ? easeBack(prog(t, shown[shown.length - 1].t, shown[shown.length - 1].t + 0.25)) : 1;
  s += `<g transform="translate(${X + W - 70},${Y + 124}) scale(${0.8 + 0.2 * bk})"><circle r="26" fill="#e5483d" ${st(4)}/><text y="9" ${FONT} font-size="24" font-weight="800" fill="#fff" text-anchor="middle">${unread}</text></g>`;
  // input
  s += `<rect x="${X + 30}" y="${Y + H - 96}" width="${W - 60}" height="62" rx="31" fill="#f4f4f6" ${st(4)}/>
  <text x="${X + 64}" y="${Y + H - 55}" ${FONT} font-size="24" fill="#a0a0a8">Сообщение</text>`;
  // messages stack from the bottom; newest pushes others up
  let s2 = '';
  let bottom = Y + H - 120;
  for (let i = shown.length - 1; i >= 0; i--) {
    const m = shown[i];
    const k = easeOut(prog(t, m.t, m.t + 0.3));
    const h = msgH(m);
    const top = bottom - h * (i === shown.length - 1 ? k : 1);
    const bw = Math.max(m.name.length * 15 + 40, ...m.text.map(l => l.length * (m.red ? 21 : 16) + 50));
    const bx = X + 96, by = top;
    s2 += `<g opacity="${clamp(k * 2)}" transform="translate(${bx},${by + h}) scale(${0.7 + 0.3 * easeBack(prog(t, m.t, m.t + 0.3))}) translate(${-bx},${-by - h})">
      <circle cx="${X + 60}" cy="${by + h - 38}" r="24" fill="${m.col}" ${st(4)}/>
      <text x="${X + 60}" y="${by + h - 29}" ${FONT} font-size="22" font-weight="800" fill="#fff" text-anchor="middle">${m.ini}</text>
      <rect x="${bx}" y="${by}" width="${bw}" height="${h - 16}" rx="22" fill="${m.red ? '#fde3e0' : '#f4f4f6'}" stroke="${m.red ? '#d63c31' : INK}" stroke-width="5"/>
      <text x="${bx + 22}" y="${by + 38}" ${FONT} font-size="21" font-weight="800" fill="${m.col}">${m.name}</text>
      ${m.text.map((l, j) => `<text x="${bx + 22}" y="${by + 78 + j * 38}" ${FONT} font-size="${m.red ? 30 : 28}" font-weight="${m.red ? 900 : 600}" fill="${m.red ? '#c42f25' : INK}">${l}</text>`).join('')}
    </g>`;
    bottom = top - 6;
  }
  s += `<clipPath id="chatclip"><rect x="${X}" y="${Y + 190}" width="${W}" height="${H - 300}"/></clipPath><g clip-path="url(#chatclip)">${s2}</g>`;
  return s;
}

// little "Yandex-like" booking app screen on a phone (no logos)
function bookingPhone(x, y, s, rot) {
  return `<g transform="translate(${x},${y}) rotate(${rot}) scale(${s})">
  <rect x="-110" y="-200" width="220" height="400" rx="34" fill="#fff" ${st(8)}/>
  <rect x="-30" y="-188" width="60" height="16" rx="8" fill="${INK}"/>
  <rect x="-92" y="-160" width="184" height="64" rx="16" fill="#ffd84d" ${st(5)}/>
  <circle cx="-62" cy="-128" r="16" fill="${INK}"/><path d="M-62,-140 L-50,-126 L-74,-126 Z" fill="#ffd84d"/>
  <rect x="-36" y="-138" width="100" height="12" rx="6" fill="${INK}"/><rect x="-36" y="-120" width="70" height="9" rx="4.5" fill="#8b6b00"/>
  ${[0, 1, 2].map(i => `<rect x="-92" y="${-80 + i * 66}" width="184" height="54" rx="14" fill="${['#fdeeb5', '#dbe4fb', '#cfe8d6'][i]}" ${st(4)}/>
  <circle cx="-66" cy="${-53 + i * 66}" r="12" fill="#fff" ${st(3.5)}/><rect x="-46" y="${-60 + i * 66}" width="${100 - i * 14}" height="11" rx="5" fill="${INK}"/>
  <path d="M60,${-58 + i * 66} l7,8 l14,-16" fill="none" stroke="#1f8a4c" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`).join('')}
  <rect x="-92" y="132" width="184" height="46" rx="23" fill="#ffd84d" ${st(5)}/>
  <rect x="-48" y="150" width="96" height="10" rx="5" fill="${INK}"/></g>`;
}

function confetti(t, t0, n = 90) {
  let s = '';
  const cols = ['#e5483d', '#4f86f7', '#f2b630', '#2fa36b', '#9a6cf0', '#f07f86', '#2fa3b5'];
  for (let i = 0; i < n; i++) {
    const dt = t - t0 - rand(i + 300) * 1.4;
    if (dt < 0) continue;
    const x = rand(i + 7) * 1920 + Math.sin(dt * 3 + i) * 30;
    const y = -40 + dt * (260 + rand(i + 9) * 200);
    if (y > 1120) continue;
    const r = dt * 300 * (rand(i) - 0.5) * 2;
    s += `<rect x="-9" y="-5" width="18" height="10" rx="2" fill="${cols[i % cols.length]}" ${st(2.5)} transform="translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${r.toFixed(0)})"/>`;
  }
  return s;
}

// ---------- the timeline ----------
function overlay(color, a) { return a > 0 ? `<!--OV--><rect width="1920" height="1080" fill="${color}" opacity="${clamp(a)}"/>` : ''; }

function scene(n) {
  CARD = null;
  let s = sceneRaw(n);
  if (CARD) {
    const close = `</g><rect x="${CARD[0]}" y="${CARD[1]}" width="${CARD[2]}" height="${CARD[3]}" rx="44" fill="none" ${st(9)}/>`;
    const i = s.indexOf('<!--OV-->');
    s = i < 0 ? s + close : s.slice(0, i) + close + s.slice(i);
  }
  return s;
}

function sceneRaw(n) {
  const t = n / FPS;
  // 0 – 5.6: corridor, student asks ChatGPT
  if (t < 5.6) {
    const z = lerp(1, 1.06, easeInOut(prog(t, 0, 5.6)));
    const dTalk = (t > 0.7 && t < 4.6) ? talk(t) : 0;
    const bounceD = Math.abs(Math.sin(t * 6.5)) * (t > 0.7 && t < 4.6 ? 6 : 0);
    let w = bgFill('#fff') + dots(t) + noticeBoard(130, 200) + clock(960, 150, t);
    w += bust('bot', { blink: blinkAt(t, [2.2, 4.9]), look: t > 1 ? 10 : 0 }, 740, 960, 1.4);
    w += bust('D', { mouth: dTalk > 0 ? 'talk' : null, open: dTalk, look: -8, blink: blinkAt(t, [3.3]) }, 1190, 960 - bounceD, 1.4, { laptop: true });
    w += bar(380, 1560, 956);
    const k = prog(t, 0.55, 0.85);
    const msg = 'Найди, где нам посидеть всей группой. Нас 12.';
    const L = ['Найди, где нам посидеть', 'всей группой. Нас 12.'];
    const tk2 = prog(t, 0.7, 3.4) * (L[0].length + L[1].length);
    const lines = [L[0].slice(0, Math.floor(tk2)), L[1].slice(0, Math.max(0, Math.floor(tk2) - L[0].length))];
    w += bubble(1250, 140, 580, 170, lines.map((l, i) => `<text x="1290" y="${212 + i * 54}" ${FONT} font-size="40" font-weight="700" fill="${INK}">${esc(l)}</text>`).join(''), k, 'left');
    return cam(w, z, 960, 600);
  }
  // 5.6 – 7.2: ChatGPT close-up, happy
  if (t < 7.2) {
    const k = easeBack(prog(t, 5.6, 5.85));
    let w = cardBg(t, '#dcf3e8', k) + cardIcon(130, 130, 'gpt', '#2f9a74');
    const hop = Math.abs(Math.sin((t - 5.6) * 7)) * 22;
    w += bust('bot', { eyes: 'happy', mouth: 'smile', blush: 1 }, 960, 1160 - hop, 2.55);
    [[560, 300, 5.75], [1380, 260, 5.9], [1460, 560, 6.05], [470, 620, 6.2]].forEach(([x, y, t0], i) => {
      const kk = prog(t, t0, t0 + 0.3); if (kk > 0) w += sparkle(x, y, easeBack(kk) * (1 + 0.1 * Math.sin(t * 10 + i)), ['#ffd84d', '#9fd6ff', '#f7b6c2', '#cfe8d6'][i]);
    });
    return w;
  }
  // 7.2 – 13.4: ChatGPT window fills in
  if (t < 13.4) {
    const k = easeBack(prog(t, 7.2, 7.45));
    const z = lerp(1, 1.04, prog(t, 7.2, 13.4));
    let w = cardBg(t, '#ebe5fb', k) + cam(gptWindow(t, {
      typing: t < 8.4,
      status: t >= 8.4 ? (t >= 13.0 ? 'done' : 'search') : null,
      doneK: prog(t, 13.0, 13.25),
      rows: [prog(t, 8.45, 8.85), prog(t, 9.55, 9.95), prog(t, 11.25, 11.65)],
      red: 0,
    }), z * lerp(0.94, 1, k));
    return w;
  }
  // 13.4 – 15.4: student close-up, pleased, talking
  if (t < 15.4) {
    const k = easeBack(prog(t, 13.4, 13.65));
    const tk = (t > 13.6 && t < 15.1) ? talk(t, 12) : 0;
    let w = cardBg(t, '#e2f1e3', k) + cardIcon(130, 130, 'laptop', '#2fa36b');
    w += bust('D', { mouth: tk > 0.05 ? 'talk' : 'smile', open: tk, brows: 'up', blink: blinkAt(t, [14.6]) }, 960, 1300 - Math.abs(Math.sin(t * 6)) * 8, 2.5, { laptop: true, laptopY: 40 });
    return w;
  }
  // 15.4 – 19.0: window, "done" + red row
  if (t < 19.0) {
    const zk = easeInOut(prog(t, 16.2, 19.0));
    const z = lerp(1.04, 1.32, zk);
    const cy = lerp(540, 820, zk);
    let w = cardBg(t, '#ebe5fb', 1);
    const tint = prog(t, 15.95, 16.3);
    w += cam(gptWindow(t, { status: 'done', rows: [1, 1, 1], red: prog(t, 15.9, 16.35) }), z, 960, cy);
    w += overlay('#e5483d', 0.08 * tint * (0.6 + 0.4 * Math.sin(t * 8)));
    return w;
  }
  // 19.0 – 20.8: student shocked
  if (t < 20.8) {
    const k = prog(t, 19.0, 19.25);
    const sh = Math.sin(t * 70) * 6 * (1 - prog(t, 19.0, 19.6));
    let w = cardBg(t, '#e2f1e3', 1) + cardIcon(130, 130, 'bolt', '#e5483d');
    const o = 0.4 + 0.6 * easeBack(k) + (t > 19.6 ? 0.12 * Math.sin(t * 9) : 0);
    w += cam(bust('D', { eyes: 'wide', brows: 'worried', mouth: 'o', open: o, sweat: prog(t, 19.3, 19.5), sweatY: prog(t, 19.5, 20.8) }, 960, 1300, 2.5, { laptop: true, laptopY: 40 }), lerp(1, 1.08, easeOut(k)), 960, 520, sh, 0);
    return w;
  }
  // 20.8 – 23.8: ChatGPT deadpan
  if (t < 23.8) {
    let w = cardBg(t, '#dcf3e8', 1) + cardIcon(130, 130, 'gpt', '#2f9a74');
    const z = lerp(1, 1.07, easeInOut(prog(t, 20.8, 23.8)));
    w += cam(bust('bot', { eyes: 'flat', sweat: prog(t, 21.8, 22.1), sweatY: easeInOut(prog(t, 22.1, 23.6)), look: lerp(0, 14, easeInOut(prog(t, 22.6, 23.0))) }, 960, 1150, 2.55), z, 960, 520);
    // silent "…" bubble
    const kk = prog(t, 21.2, 21.45);
    if (kk > 0) w += bubble(1300, 170, 260, 130, [0, 1, 2].map(i => `<circle cx="${1380 + i * 50}" cy="235" r="11" fill="${INK}" opacity="${t > 21.4 + i * 0.3 ? 1 : 0.15}"/>`).join(''), kk, 'left');
    return w;
  }
  // 23.8 – 29.0: group chat explodes
  if (t < 29.0) {
    const k = easeBack(prog(t, 23.8, 24.05));
    let shake = 0;
    for (const m of CHAT) { const d = t - m.t; if (d >= 0 && d < 0.35) shake = Math.sin(d * 60) * 7 * (1 - d / 0.35) * (m.red ? 2 : 1); }
    let w = cardBg(t, '#dbe4fb', k) + cardIcon(130, 130, 'chat', '#4f86f7');
    w += cam(phoneChat(t), lerp(0.9, 1, k) * lerp(1, 1.04, prog(t, 24, 29)), 960, 545, shake, 0, shake * 0.2);
    return w;
  }
  // 29.0 – 30.6: the class monitor (A) is furious
  if (t < 30.6) {
    const k = easeBack(prog(t, 29.0, 29.25));
    const sh = Math.sin(t * 55) * 4;
    let w = cardBg(t, '#fdeeb5', k) + cardIcon(130, 130, 'people', '#c48a00');
    w += cam(bust('A', { brows: 'angry', mouth: 'frown', anger: 0.9 + 0.25 * Math.abs(Math.sin(t * 8)), blink: 0 }, 960, 1300, 2.5), lerp(1, 1.06, prog(t, 29, 30.6)), 960, 520, sh, 0);
    w += overlay('#e5483d', 0.05 + 0.03 * Math.sin(t * 10));
    return w;
  }
  // 30.6 – 32.53: everyone glares at the student; fade to black
  if (n < 977) {
    const z = lerp(1, 1.05, prog(t, 30.6, 32.5));
    let w = bgFill('#fff') + dots(t) + clock(960, 110, t, 48);
    const ang = { brows: 'angry', mouth: 'frown', look: -10 };
    const ys = 930, s = 0.86;
    w += bust('B', ang, 1480, ys, s * 0.95);
    w += bust('E', { ...ang, blink: blinkAt(t, [31.4]) }, 1760, ys, s * 0.95);
    w += bust('C', ang, 1220, ys, s * 0.95);
    w += bust('bot', { eyes: 'flat', look: 14, sweat: 1, sweatY: prog(t, 30.6, 32.4) }, 230, ys, s);
    w += bust('D', { eyes: 'wide', brows: 'worried', mouth: 'line', sweat: 1, sweatY: prog(t, 30.8, 32.4) }, 520, ys + Math.sin(t * 40) * 2, s);
    w += bust('A', { ...ang, anger: 0.9 + 0.2 * Math.abs(Math.sin(t * 8)) }, 900, ys, s);
    w += bar(40, 1880, ys - 4);
    w = cam(w, z, 960, 600);
    // match original darken: frames 960..976 ramp to black
    const fade = prog(n, 958, 976);
    return w + overlay('#000', Math.pow(fade, 0.9) * 0.97);
  }
  // 38.93 – 41.4: A shows the booking app to D
  if (n >= 1170 && n < 1242) {
    const fin = 1 - prog(n, 1170, 1177);
    const out = prog(n, 1229, 1241);
    const z = lerp(1, 1.9, Math.pow(out, 1.6));
    let w = cardBg(t, '#fdeeb5', 1);
    const tk = (t > 39.25 && t < 40.9) ? talk(t, 12) : 0;
    const lift = easeOut(prog(t, 39.1, 39.5));
    const curious = t > 40.25;
    w += bust('D', curious ? { eyes: 'wide', brows: 'up', mouth: 'o', open: 0.25, look: -14 } : { brows: 'worried', mouth: 'frown', look: -10 }, 1330, 1200, 2.1);
    w += bust('A', { mouth: tk > 0.05 ? 'talk' : 'smile', open: tk, look: 12, blink: blinkAt(t, [40.6]) }, 640, 1210, 2.1);
    w += bookingPhone(1000, lerp(860, 500, lift), 1.25, lerp(10, -6, lift) + Math.sin(t * 3) * 1.5);
    if (curious) w += sparkle(1580, 330, easeBack(prog(t, 40.25, 40.5)), '#ffd84d');
    w = cam(w, z, lerp(960, 1000, out), lerp(540, 560, out));
    return w + overlay('#fffcff', Math.max(fin, Math.pow(out, 1.3)));
  }
  // 54.5 – 57.47: party at «Кыстыбый Хаус»
  if (n >= 1635 && n < 1725) {
    const fin = 1 - prog(n, 1635, 1644);
    const out = prog(n, 1716, 1724);
    let w = bgFill('#fff') + dots(t) + `<rect x="40" y="40" width="1840" height="1000" rx="44" fill="#fde3c8" ${st(9)}/>`;
    // garland
    let g = `<path d="M40,170 Q480,250 960,170 Q1440,250 1880,170" fill="none" ${st(5)}/>`;
    for (let i = 0; i < 18; i++) {
      const x = 90 + i * 102, half = x < 960 ? (x - 40) / 920 : (x - 960) / 920;
      const y = 170 + Math.sin(half * Math.PI) * 58;
      g += `<path transform="translate(${x},${y}) rotate(${Math.sin(t * 4 + i) * 6})" d="M-22,0 L22,0 L0,44 Z" fill="${PAL[i % PAL.length]}" ${st(4)}/>`;
    }
    w += g;
    // sign
    w += `<g transform="translate(960,108)"><rect x="-300" y="-58" width="600" height="104" rx="52" fill="#fff" ${st(8)}/>
      <text y="18" ${FONT} font-size="54" font-weight="900" fill="${INK}" text-anchor="middle">Кыстыбый Хаус</text></g>`;
    const ys = 960, s = 0.9;
    const order = [['B', 300], ['C', 560], ['D', 820], ['A', 1100], ['E', 1360], ['bot', 1640]];
    order.forEach(([nm, x], i) => {
      const hop = Math.abs(Math.sin(t * 7 + i * 1.1)) * 18;
      const e = nm === 'bot' ? { eyes: 'happy', mouth: 'smile', blush: 1 } : { eyes: 'happy', mouth: 'grin', blush: 1 };
      w += bust(nm, e, x, ys - hop, s, { rot: Math.sin(t * 5 + i) * 3 });
    });
    w += bar(80, 1840, ys - 6);
    // cake on the table
    const cx = 960, cb = ys - 6;
    w += `<g transform="translate(${cx},${cb})">
      <rect x="-120" y="-110" width="240" height="110" rx="18" fill="#f7b6c2" ${st(7)}/>
      <path d="M-120,-80 Q-100,-56 -80,-80 Q-60,-56 -40,-80 Q-20,-56 0,-80 Q20,-56 40,-80 Q60,-56 80,-80 Q100,-56 120,-80 V-92 Q120,-110 102,-110 H-102 Q-120,-110 -120,-92 Z" fill="#fff" ${st(6)}/>
      ${[-60, 0, 60].map((x, i) => `<rect x="${x - 8}" y="-170" width="16" height="60" rx="5" fill="${['#9fd6ff', '#ffd84d', '#cfe8d6'][i]}" ${st(5)}/>
      <path transform="translate(${x},-182) scale(${1 + 0.15 * Math.sin(t * 20 + i)},${1 + 0.2 * Math.sin(t * 17 + i)})" d="M0,-22 C10,-8 12,0 0,10 C-12,0 -10,-8 0,-22 Z" fill="#f2a530" ${st(4)}/>`).join('')}
    </g>`;
    w += confetti(t, 54.5);
    return w + overlay('#fffcff', Math.max(fin, out));
  }
  return bgFill('#f0f');
}
