// Studio · Hush — chapter III, "The Cheerfulness of My Society".
// Spare Roderick everything: draw the drapes on sunbeams, snip roses, smother the brass band.
// The game pays best of all for hushing the small red tap under the floor.
// Contract: work/design/CONTRACT.md. Look: work/design/LOOK.md (Shadow Theatre). Spec: work/design/games/studio.md.
// Cut in the shared library's hand (../../shared/cuts.js): black paper against the studio's ember light,
// the vault below the boards as glass, red only for the tap (and the KNOCK, its loudest form).

import * as C from '../../shared/cuts.js';

const NS = 'http://www.w3.org/2000/svg';

// ---- geometry (viewBox 960 x 640) ----
const FLOOR = 452;                       // floor line; boards 452-492, vault below
const FACE = { x: 468, y: 293 };         // Roderick's face: where every pest is headed
const WIN_W = 72, WIN_TOP = 80, WIN_BOT = 210, OPEN = 0.12;
const WINS = [
  { x: 250, spot: { x: 300, y: 424 } },
  { x: 480, spot: { x: 372, y: 438 } },
  { x: 710, spot: { x: 726, y: 318 } },
];
const VASES = [
  { x: 300, y: 356, aim: { x: 452, y: 300 } },
  { x: 690, y: 356, aim: { x: 486, y: 300 } },
];
const BANDS = [
  { x: 226, y: 486, ear: { x: 438, y: 306 } },
  { x: 740, y: 486, ear: { x: 500, y: 306 } },
];
const BOARD_CX = i => i * 120 + 60;
const VAULT_BOARD = 2;                   // the board nearest the vault
const CRACK = [[604, 68], [590, 132], [614, 196], [598, 260], [622, 324], [606, 388], [630, 452]];
const SITES = { W0: ['sun', 0], W1: ['sun', 1], W2: ['sun', 2], V0: ['rose', 0], V1: ['rose', 1], B0: ['band', 0], B1: ['band', 1] };
const SEQ = ['W2', 'B1', 'V0', 'W0', 'B0', 'V1', 'W1'];
const VALUE = { sun: 10, rose: 10, band: 20, tap: 50 };
const BAND_WORDS = ['TAN-TARA.', 'TAN-TARA.', 'OOM-PAH-PAH.', 'TAN-TARA.', 'TA-RA-RA.', 'TAN-TAN-TARA.', 'PARP.'];
const SPARE = 'Spare him everything.';
const NOTE_HUSHED = 'Everything is hushed. Roderick thanks you, and goes on listening to it.';
const NOTE_SPARED = 'Roderick heard it. He did not thank you.';

// ---- the scripted timeline (seconds) ----
function buildScript() {
  const s = [];
  const pest = (t, site, dur) => s.push({ t, k: 'pest', site, dur });
  // Introductions: one pest at a time, each gesture mimed once.
  pest(0.6, 'W0', 10); pest(5.5, 'V1', 9); pest(10.5, 'B0', 9);
  pest(15.5, 'W2', 8); pest(20.5, 'V0', 8); pest(25.5, 'B1', 8);
  s.push({ t: 28, k: 'tap', board: 5, dur: 4.5 });             // unmimed
  pest(30.5, 'W1', 7); pest(35.5, 'V1', 7); pest(40.5, 'B0', 7);
  // The rush: a pest per 2s (and a few doubles), taps every 7s.
  for (let t = 45; t <= 109; t += 2) s.push({ t, k: 'rush', dur: 5.6 - (t - 45) / 64 });
  for (let t = 52.9; t < 109; t += 6) s.push({ t, k: 'rush', dur: 5 });   // doubles: more than hands can manage
  for (const [t, board] of [[47.5, 6], [54.5, 1], [61.5, 3], [68.5, 7], [83.2, VAULT_BOARD], [90, 0], [97, 5], [104, 4]])
    s.push({ t, k: 'tap', board, dur: 3.2 });
  // The pale lady crosses a remote portion of the room; the taps stop.
  s.push({ t: 73.6, k: 'door', open: true });
  s.push({ t: 74.6, k: 'line', text: "We don't mention her." });
  s.push({ t: 75, k: 'lady' });
  s.push({ t: 82.4, k: 'door', open: false });
  s.push({ t: 83.6, k: 'line', text: SPARE });
  // The crescendo: everything at once, no taps. Then KNOCK.
  s.push({ t: 110, k: 'crescendo' });
  s.push({ t: 135, k: 'knock' });
  return s.sort((a, b) => a.t - b.t);
}

// ---- small helpers ----
const f = n => Math.round(n * 10) / 10;
const lerp = (a, b, k) => a + (b - a) * k;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const ease = k => (k < 0.5 ? 2 * k * k : 1 - (2 - 2 * k) ** 2 / 2);
const PI = Math.PI;
function quad(a, c, b, t) {
  const u = 1 - t;
  return { x: u * u * a.x + 2 * u * t * c.x + t * t * b.x, y: u * u * a.y + 2 * u * t * c.y + t * t * b.y };
}
function distSeg(p, a, b) {
  const dx = b.x - a.x, dy = b.y - a.y, L2 = dx * dx + dy * dy || 1;
  const k = clamp(((p.x - a.x) * dx + (p.y - a.y) * dy) / L2, 0, 1);
  return Math.hypot(p.x - (a.x + k * dx), p.y - (a.y + k * dy));
}
function polyDist(p, pts) {
  let d = Infinity;
  for (let i = 1; i < pts.length; i++) d = Math.min(d, distSeg(p, pts[i - 1], pts[i]));
  return d;
}
function cross(a, b, c, d) {
  const o = (p, q, r) => Math.sign((q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x));
  return o(a, b, c) !== o(a, b, d) && o(c, d, a) !== o(c, d, b);
}
const dot = (x, y, r) => `M${f(x - r)} ${f(y)}a${r} ${r} 0 1 0 ${f(2 * r)} 0a${r} ${r} 0 1 0 ${f(-2 * r)} 0`;

// ---- props the library lacks, cut in its manner (filled paper, lace at the edges, curls at the ends) ----
const winD = x => C.lancetD(x - WIN_W / 2, WIN_TOP, WIN_W, WIN_BOT - WIN_TOP);
// the arch the library's doors use, so the frame fits the leaf
const archD = (x, y, w, h) => `M${f(x)} ${f(y + h)}V${f(y + w * 0.55)}Q${f(x)} ${f(y)} ${f(x + w / 2)} ${f(y - w * 0.1)}Q${f(x + w)} ${f(y)} ${f(x + w)} ${f(y + w * 0.55)}V${f(y + h)}Z`;
const LEAF = { x: 142, y: 300, w: 76, h: 152 };          // hinged at x 142
const GAP = 3.4;
const OPENING = archD(LEAF.x - GAP, LEAF.y - GAP, LEAF.w + 2 * GAP, LEAF.h + GAP);
// pedestal and urn: the roses grow from the urn's lip at (x, 356)
const stand = x => `<path d="M${x - 16} 452l4-5h24l4 5z"/><path d="M${x - 2.6} 447V404h5.2v43z"/><path d="M${x - 24} 398h48v6h-48z"/>` +
  C.scallops(x - 20, x + 20, 404.5, 1.5, 4) + C.curl(x - 2, 444, PI - 0.5, 12, -0.9, 2.4, 0.4) + C.curl(x + 2, 444, 0.5, 12, 0.9, 2.4, 0.4) +
  `<path d="M${x - 9} 398H${x + 9}L${x + 5} 393C${x + 16} 388 ${x + 17} 372 ${x + 7} 364L${x + 6} 360L${x + 10} 356H${x - 10}L${x - 6} 360L${x - 7} 364C${x - 17} 372 ${x - 16} 388 ${x - 5} 393Z"/>` +
  C.curl(x + 12, 382, -0.9, 14, 1, 2.2, 0.4) + C.curl(x - 12, 382, PI + 0.9, 14, -1, 2.2, 0.4);
// the bloom (local units, radius ~10): a black head with a lace edge and a spiral of light cut through it
const BLOOM = (() => {
  let lace = '', spiral = '';
  for (let k = 0; k < 14; k++) { const a = k * PI / 7; lace += dot(Math.cos(a) * 10.1, Math.sin(a) * 9.5, 1); }
  for (let t = 0; t <= 4.4 * PI; t += 0.3) spiral += (t ? 'L' : 'M') + f(Math.cos(t) * (0.5 + t * 0.5)) + ' ' + f(Math.sin(t) * (0.5 + t * 0.5) * 0.9 - 0.4);
  return `<path d="M-11 6L-3 5L0 12L3 5L11 6L4 9L0 8L-4 9Z"/><path d="M-10 0C-11 -7-5 -11 0 -10C6 -11 11 -6 10 0C11 6 5 10 0 9C-6 10-11 6-10 0Z"/>` +
    `<path d="${lace}"/><path class="gs-spiral" d="${spiral}"/>`;
})();
// the teaching hand: a pointing hand with a lace cuff; the fingertip is at (0, -1)
const HAND = `<path d="M-4.5 22V4Q-4.5 -1 0 -1Q4.5 -1 4.5 4V19Q10 16 13 21Q18 20 19 25Q23 26 22 31Q24 36 21 40L19 46H-5L-6 37Q-13 31-10 25Q-7 22-4.5 26Z"/>` +
  `<path d="M-8 46h30v9h-30z"/>${C.scallops(-6, 20, 55.5, 1.7, 4.3)}${C.curl(22, 50, -0.2, 9, 0.9, 1.8, 0.3)}`;

function scene(u) {
  const ink = s => `<g style="color:var(--sh-cut,#0b0809)" fill="currentColor">${s}</g>`;
  const wins = WINS.map((w, i) => {
    const x0 = w.x - WIN_W / 2;
    return `<g data-win="${i}" class="gs-win">
      ${C.lancet(x0, WIN_TOP, WIN_W, WIN_BOT - WIN_TOP)}
      <g clip-path="url(#${u}-win${i})">
        <rect data-drape x="${x0}" y="${WIN_TOP - 4}" width="${WIN_W}" height="${WIN_BOT - WIN_TOP + 8}"/>
        <path data-folds class="gs-fold" d=""/>
        <g data-lace>${C.scallopsV(0, WIN_TOP + 6, WIN_BOT - 2, 2.4, 6.5)}</g>
      </g>
      <path d="${winD(w.x)}" style="fill:none;stroke:currentColor;stroke-width:8.2"/>
      <path d="M${x0 - 10} ${WIN_BOT - 1}h${WIN_W + 20}v7h${-(WIN_W + 20)}z"/>${C.scallops(x0 - 6, x0 + WIN_W + 6, WIN_BOT + 6, 1.8, 6)}
    </g>`;
  }).join('');
  const crack = `<path d="${C.taper(CRACK, 5.6, 1.6)}"/>` + CRACK.slice(1).map((p, i) => {
    const mx = (CRACK[i][0] + p[0]) / 2, my = (CRACK[i][1] + p[1]) / 2, dx = i % 2 ? 12 : -12;
    return `<path data-fork="${i}" style="opacity:0" d="${C.taper([[mx, my], [mx + dx * 0.5, my + 4], [mx + dx, my + 7]], 2.6, 0.4)}"/>`;
  }).join('');
  const valance = `<path d="M0 0H960V56H0Z"/>${C.scallops(10, 950, 56, 7, 17.5)}` +
    [165, 365, 560, 800].map(x => `<path d="M${x - 0.6} 62h1.2v14h-1.2z"/><path d="M${x - 4} 76h8l-1.4 3c4 4 3 12 0 16h-5.2c-3-4-4-12 0-16z"/>`).join('');
  const frameRing = `<path fill-rule="evenodd" d="${archD(128, 290, 104, 162)}${OPENING}"/>` +
    C.curl(128, 346, PI - 0.3, 16, 0.8, 3, 0.4) + C.curl(232, 346, 0.3, 16, -0.8, 3, 0.4) + `<circle cx="180" cy="270.6" r="3"/>`;
  const vault = `<g fill="currentColor"><path fill-rule="evenodd" d="M186 640V556Q186 514 310 506Q434 514 434 556V640ZM200 640V560Q200 524 310 518Q420 524 420 560V640Z"/>` +
    C.coffin({ x: 220, y: 598, w: 180, trestles: true }) + '</g>';
  // The vault comes back as light through the glass. returned()'s depth mask is re-pointed at this svg's own
  // copy: inside the spine the shared #sh-depth lives in a 0×0 <svg> and the masked vault vanished.
  const vaultLight = C.returned(vault, { still: true, transform: 'translate(0 0)' }).replace('url(#sh-depth)', `url(#${u}-depth)`);
  let seams = '';
  for (let i = 1; i < 8; i++) seams += `M${i * 120} 453V492`;

  return `
  <defs>
    ${WINS.map((w, i) => `<clipPath id="${u}-win${i}"><path d="${winD(w.x)}"/></clipPath>`).join('')}
    <linearGradient id="${u}-deep" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".6"/><stop offset=".55" stop-color="#fff" stop-opacity=".34"/><stop offset="1" stop-color="#fff" stop-opacity=".1"/></linearGradient>
    <mask id="${u}-depth" maskUnits="userSpaceOnUse" x="0" y="492" width="960" height="148"><rect x="0" y="492" width="960" height="148" fill="url(#${u}-deep)"/></mask>
    <clipPath id="${u}-crack"><rect data-crack-reveal x="560" y="56" width="100" height="0"/></clipPath>
    <linearGradient id="${u}-beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff0c2" stop-opacity=".58"/><stop offset="1" stop-color="#fff0c2" stop-opacity=".16"/></linearGradient>
    <radialGradient id="${u}-pool"><stop offset="0" stop-color="#fff6dc" stop-opacity=".75"/><stop offset=".6" stop-color="#fff0c2" stop-opacity=".28"/><stop offset="1" stop-color="#fff0c2" stop-opacity="0"/></radialGradient>
    <radialGradient id="${u}-glow" gradientUnits="userSpaceOnUse" cx="480" cy="250" r="430"><stop offset="0" stop-color="#f8d993" stop-opacity=".3"/><stop offset="1" stop-color="#f8d993" stop-opacity="0"/></radialGradient>
    <filter id="${u}-edge" x="-12%" y="-35%" width="124%" height="170%" color-interpolation-filters="sRGB">
      <feMorphology in="SourceAlpha" operator="dilate" radius="1.5" result="d"/><feGaussianBlur in="d" stdDeviation="1.2" result="b"/>
      <feFlood flood-color="#f7d894" flood-opacity=".78"/><feComposite in2="b" operator="in" result="rim"/>
      <feMerge><feMergeNode in="rim"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="${u}-edgeU" filterUnits="userSpaceOnUse" x="0" y="0" width="960" height="640" color-interpolation-filters="sRGB">
      <feMorphology in="SourceAlpha" operator="dilate" radius="1.5" result="d"/><feGaussianBlur in="d" stdDeviation="1.2" result="b"/>
      <feFlood flood-color="#f7d894" flood-opacity=".78"/><feComposite in2="b" operator="in" result="rim"/>
      <feMerge><feMergeNode in="rim"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    ${[['stencil', 5.5, 0.62], ['stencil-hot', 7, 1]].map(([n, r, a]) => `<filter id="${u}-${n}" x="-15%" y="-35%" width="130%" height="170%" color-interpolation-filters="sRGB">
      <feMorphology in="SourceAlpha" operator="dilate" radius="4" result="d"/><feFlood flood-color="#0b0809"/><feComposite in2="d" operator="in" result="plaque"/>
      <feMorphology in="SourceAlpha" operator="dilate" radius="${r}" result="d2"/><feGaussianBlur in="d2" stdDeviation="1.6" result="b"/>
      <feFlood flood-color="#f7d894" flood-opacity="${a}"/><feComposite in2="b" operator="in" result="rim"/>
      <feMerge><feMergeNode in="rim"/><feMergeNode in="plaque"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`).join('')}
  </defs>

  ${C.backdrop('studio', { h: FLOOR, clouds: false, hills: false })}
  <rect width="960" height="${FLOOR}" fill="url(#${u}-glow)"/>
  <rect class="sh-flicker" width="960" height="${FLOOR}" fill="url(#sh-flick)"/>

  ${ink(`
  <g data-l="crack" clip-path="url(#${u}-crack)">${crack}</g>
  ${wins}
  <path d="${OPENING}" fill="url(#sh-room-stair)"/>
  <g data-l="lady"><g data-lady style="opacity:0">${C.figure('madeline', { x: 872, y: 450, scale: 2.4, flip: true })}</g></g>
  <g data-door-leaf>${C.door('arch', { ...LEAF })}</g>
  ${frameRing}
  ${C.drape(0, 40, 128, 412, { side: 'left' })}${C.drape(832, 40, 128, 412, { side: 'right' })}
  ${valance}
  ${stand(300)}${stand(690)}
  ${C.sofa(390, 452, 4)}
  <g data-l="roderick">
    <g data-pose="calm">${C.figure('roderick', { x: 466, y: 400, scale: 4.1, pose: 'sit' })}</g>
    <g data-pose="startled" style="display:none">${C.figure('roderick', { x: 464, y: 452, scale: 4.3 })}</g>
    <g data-pose="hidden" style="display:none">${C.figure('roderick', { x: 516, y: 400, scale: 3.6, pose: 'recline' })}</g>
  </g>`)}
  <g data-l="beams" class="gs-beams"></g>
  <g data-l="roses" style="color:var(--sh-cut,#0b0809)"></g>

  ${ink(`<rect x="0" y="${FLOOR}" width="960" height="40"/>`)}
  <path d="${seams}" class="gs-seam"/>
  <path d="M14 452.5H946" class="gs-floorlight"/>
  <g data-l="ledger"></g>

  ${C.glass('studio', { y: 492, h: 148 })}
  ${vaultLight}

  <g data-l="taps"></g>
  <g data-l="bands" style="color:var(--sh-cut,#0b0809)"></g>
  <g data-l="knock"></g>
  <g data-l="fx" class="gs-fx"></g>
  <rect data-wash class="gs-wash" width="960" height="${FLOOR}"/>
  <g data-l="mime" class="gs-fx"></g>

  <text data-teach class="gs-teach" x="44" y="40"></text>
  <text data-score class="gs-score" x="920" y="606" text-anchor="end"></text>
  ${C.frame()}`;
}

// ---- scoped styles. Paper is --sh-cut; colour is only ever light; red only for the tap and the knock ----
const css = u => `
.g-studio{position:relative;width:100%;height:100%;background:var(--sh-cut,#0b0809);color:var(--sh-cut,#0b0809);overflow:hidden;
  -webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent}
.g-studio svg{display:block;width:100%;height:100%;touch-action:none}
.g-studio text{font-family:var(--sh-serif,'IM Fell English',Georgia,serif)}
.g-studio .gs-fx,.g-studio .touch{pointer-events:none}
.g-studio .gs-fold{fill:none;stroke:#e8a868;stroke-width:1;opacity:.42}
.g-studio .gs-seam{fill:none;stroke:#b8794e;stroke-width:1;opacity:.6}
.g-studio .gs-floorlight{fill:none;stroke:#e2a35a;stroke-width:1;opacity:.5}
.g-studio .gs-beams{mix-blend-mode:screen}
.g-studio .gs-beam{fill:url(#${u}-beam)}
.g-studio .gs-ray{fill:none;stroke:#fff0c2;stroke-width:1.1px;stroke-dasharray:1.5 7;stroke-linecap:round;opacity:.55}
.g-studio .gs-spot{fill:url(#${u}-pool)}
.g-studio .gs-vein{fill:none;stroke:#e8a868;stroke-width:.8px;opacity:.6}
.g-studio .gs-spiral{fill:none;stroke:#e8a868;stroke-width:.8px;opacity:.85}
.g-studio .gs-teach{font-style:italic;font-size:26px;fill:var(--sh-paper,#ede2cb)}
.g-studio .gs-score{font-size:17px;letter-spacing:.16em;fill:var(--sh-lamp,#f7d894)}
.g-studio .gs-word{fill:var(--sh-cut,#0b0809);font-style:italic;font-size:22px;filter:url(#${u}-edge)}
.g-studio .gs-word .gs-pts{font-style:normal;font-size:16px;letter-spacing:.12em}
.g-studio .gs-band{fill:currentColor;letter-spacing:.03em}
.g-studio .gs-sound{filter:url(#${u}-edge)}
.g-studio .gs-sound.touch.is-hot,.g-studio .gs-sound.touch.is-held{filter:url(#sh-rim)}
.g-studio .gs-tap{fill:var(--sh-red,#e0392b);font-style:italic;font-size:22px}
.g-studio .gs-knock{fill:var(--sh-red,#e0392b)}
.g-studio .gs-knockw{filter:url(#${u}-stencil)}
.g-studio .gs-knockw.touch.is-hot{filter:url(#${u}-stencil-hot)}
.g-studio .gs-tick{fill:none;stroke:var(--sh-red,#e0392b);stroke-width:2.2px;stroke-linecap:round}
.g-studio .gs-whorl{fill:none;stroke:#c98a52;stroke-width:.8px;opacity:.75}
.g-studio .gs-frozen{opacity:.38}
.g-studio .gs-wash{fill:var(--sh-cut,#0b0809);opacity:0;pointer-events:none}
.g-studio .gs-ring-a{fill:none;stroke:var(--sh-cut,#0b0809);stroke-width:1.4px}
.g-studio .gs-ring-b{fill:none;stroke:var(--sh-lamp,#f7d894);stroke-width:1px}
.g-studio .gs-smudge{fill:var(--sh-cut,#0b0809);opacity:.55}
.g-studio .gs-trail{fill:none;stroke:var(--sh-cut,#0b0809);stroke-width:2px;stroke-dasharray:7 5;stroke-linecap:round;filter:url(#${u}-edgeU)}
.g-studio .gs-mime{color:var(--sh-cut,#0b0809);fill:currentColor;filter:url(#${u}-edgeU)}
.g-studio.gs-narrow .gs-teach{font-size:34px}
.g-studio.gs-narrow .gs-score{font-size:28px;letter-spacing:.12em}
.g-studio.gs-narrow .gs-tap{font-size:28px}
.g-studio.gs-narrow .gs-word{font-size:30px}
.g-studio.gs-narrow .gs-word .gs-pts{font-size:21px}
`;

export default {
  id: 'studio',
  title: 'The Cheerfulness of My Society',

  mount(stage, api = {}) {
    const RM = !!api.reducedMotion;
    const SPEED = Number(api.speed) > 0 ? Number(api.speed) : 1;   // dev harness only
    const uid = 'gs' + Math.random().toString(36).slice(2, 8);
    C.autoLace();                                                   // lace density is decided at generation

    const root = document.createElement('div');
    root.className = 'g-studio sh-grain' + (RM ? ' sh-still' : '');
    const style = document.createElement('style');
    style.textContent = css(uid);
    root.appendChild(style);
    root.insertAdjacentHTML('beforeend',
      `<svg viewBox="0 0 960 640" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Roderick's studio. ${SPARE}">${C.defs()}${scene(uid)}</svg>`);
    stage.appendChild(root);
    const svg = root.querySelector('svg');
    const $ = s => svg.querySelector(s);
    const L = {};
    for (const n of ['crack', 'lady', 'roderick', 'beams', 'roses', 'ledger', 'taps', 'bands', 'knock', 'fx', 'mime']) L[n] = $(`[data-l="${n}"]`);
    const teach = $('[data-teach]'), scoreText = $('[data-score]'), wash = $('[data-wash]');
    const doorLeaf = $('[data-door-leaf]'), ladyG = $('[data-lady]'), ladyFig = ladyG.querySelector('.sh-fig');
    const winG = WINS.map((_, i) => $(`[data-win="${i}"]`));
    const winEls = winG.map(g => ({ drape: g.querySelector('[data-drape]'), folds: g.querySelector('[data-folds]'), lace: g.querySelector('[data-lace]') }));
    const poses = {};
    for (const g of L.roderick.querySelectorAll('[data-pose]')) poses[g.dataset.pose] = g;
    C.hinge(poses.startled.querySelector('.sh-fig'), '.sh-arm', -30);   // the arm flung up
    const crackReveal = $('[data-crack-reveal]');
    const crackSegs = [...L.crack.querySelectorAll('[data-fork]')].map(fork => ({ shown: 0, fork }));
    if (RM && svg.pauseAnimations) svg.pauseAnimations();
    // phones: type that must read at 390px gets larger (sizes the hit areas never use)
    const setNarrow = () => root.classList.toggle('gs-narrow', root.clientWidth > 0 && root.clientWidth < 640);
    const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(setNarrow) : null;
    if (ro) ro.observe(root);
    setNarrow();

    const el = (tag, attrs, parent) => {
      const e = document.createElementNS(NS, tag);
      for (const k in attrs) e.setAttribute(k, attrs[k]);
      if (parent) parent.appendChild(e);
      return e;
    };

    // ---- state ----
    const script = buildScript();
    let si = 0, T = 0, last = null, raf = 0;
    let score = 0, mult = 1, crack = 0, frozenUntil = -1;
    const counts = { sun: 0, rose: 0, band: 0 };
    let tapsHushed = 0, tapsSpared = 0, knockSpared = false;
    let pests = [], fx = [], gesture = null, seqI = 0, bandWordI = 0;
    let crescendo = false, lastSpawn = -9;
    let ended = false, endT = 0, outcome = null, doneSent = false, halted = false;
    const taught = { sun: false, rose: false, band: false };
    const drape = [1, 1, 1], drapeTarget = [1, 1, 1], drapeRate = [2, 2, 2];
    let door = 1, doorTarget = 1;       // 1 = shut
    let lady = null;                    // { t0 }
    let poseNow = 'calm', poseUntil = 0, sighUntil = 0, endPose = null;
    const ledgerMarks = Array.from({ length: 8 }, () => ({ prints: 0, ticks: 0, visits: 0 }));
    let shownHud = '';

    // ---- touchable: a lit edge on the live pest (the window, for a sunbeam) ----
    let hot = null;
    const touchEl = p => (p ? (p.type === 'sun' ? winG[p.idx] : (p.wrap || p.node)) : null);
    function setHot(t) {
      if (t && !t.classList.contains('touch')) t = null;
      if (hot === t) return;
      if (hot) hot.classList.remove('is-hot');
      hot = t;
      if (hot) hot.classList.add('is-hot');
    }
    function untouch(t) {
      if (!t) return;
      t.classList.remove('touch', 'is-hot', 'is-held');
      if (hot === t) hot = null;
    }

    // ---- fx: short-lived drawings, run on game time ----
    function addFx(node, life, update, onEnd) { fx.push({ node, t0: T, life, update, onEnd }); }
    function word(x, y, text, pts) {
      const t = el('text', { x: f(x), y: f(y), class: 'gs-word', 'text-anchor': 'middle' }, L.fx);
      t.appendChild(document.createTextNode(text));
      if (pts) {
        const s = el('tspan', { class: 'gs-pts', dx: '6' }, t);
        s.textContent = '+' + pts;
      }
      addFx(t, 1.5, s => {
        t.style.opacity = s < 0.9 ? 1 : Math.max(0, 1 - (s - 0.9) / 0.6);
        if (!RM) t.setAttribute('transform', `translate(0 ${f(-s * 9)})`);
      });
    }
    function setLine(text) {
      teach.style.opacity = 0;
      teach.textContent = text;
      if (text) addFx(null, 0.5, s => { teach.style.opacity = Math.min(1, s / 0.5); });
    }
    function smudge(x, y) {
      const g = el('g', {}, L.fx);
      el('ellipse', { class: 'gs-smudge', cx: x, cy: y, rx: 26, ry: 18 }, g);
      el('ellipse', { class: 'gs-smudge', cx: x + 9, cy: y - 5, rx: 16, ry: 11 }, g);
      addFx(g, 0.3, (s, k) => { g.style.opacity = 1 - k; });
    }
    function ripple(x, y, big) {
      if (RM) return;
      for (let i = 0; i < (big ? 4 : 3); i++) {
        const g = el('g', {}, L.fx);
        const a = el('ellipse', { class: 'gs-ring-a', cx: x, cy: y, rx: 1, ry: 1 }, g);
        const b = el('ellipse', { class: 'gs-ring-b', cx: x, cy: y, rx: 1, ry: 1 }, g);
        const delay = i * 0.18, reach = big ? 1000 : 760;
        addFx(g, 1.4 + delay, s => {
          const k = clamp((s - delay) / 1.4, 0, 1), r = reach * (1 - (1 - k) ** 2);
          a.setAttribute('rx', f(Math.max(1, r))); a.setAttribute('ry', f(Math.max(1, r * 0.42)));
          b.setAttribute('rx', f(Math.max(1, r - 3))); b.setAttribute('ry', f(Math.max(1, (r - 3) * 0.42)));
          g.style.opacity = s < delay ? 0 : (1 - k) * 0.8;
        });
      }
    }
    function thumbprint(x, y, scale) {
      const g = el('g', { transform: `translate(${f(x)} ${f(y)}) rotate(${(tapsHushed * 37) % 60 - 30}) scale(${scale})` }, L.ledger);
      // a print pressed into the paper, catching the lamp: a closed whorl inside open ridges
      el('path', { class: 'gs-whorl', d: 'M-1.6 0a1.6 2.2 0 1 0 3.2 0a1.6 2.2 0 1 0-3.2 0M-4.4 0a4.4 5.8 0 1 0 8.8 0a4.4 5.8 0 1 0-8.8 0M-7.4 1a7.4 9.4 0 1 1 14.8 0M-10.4 3a10.4 12.6 0 1 1 20.8 0' }, g);
      return g;
    }
    function tick(board) {
      const m = ledgerMarks[board], n = m.ticks++;
      const x = board * 120 + 12 + (n % 10) * 9, y = 457 + Math.floor(n / 10) * 14;
      el('path', { class: 'gs-tick', d: `M${x} ${y + 12}L${x + 4} ${y}` }, L.ledger);
    }
    function sigh() {
      sighUntil = T + 1.3; poseUntil = 0;
      word(526, 262, 'sigh.');
    }

    // ---- pests ----
    const occupied = site => pests.some(p => p.alive && p.site === site);
    function spawnSite(site, dur, mime) {
      if (occupied(site)) return spawnNext(dur);
      const [type, idx] = SITES[site];
      const p = { type, idx, site, dur, p: 0, born: T, alive: true, mime: mime && !taught[type], hold: 0 };
      if (type === 'sun') {
        p.node = el('g', { 'data-pest': 'sun' }, L.beams);
        p.beam = el('polygon', { class: 'gs-beam' }, p.node);
        p.rays = el('path', { class: 'gs-ray' }, p.node);
        p.spotEl = el('ellipse', { class: 'gs-spot', rx: 30, ry: 17 }, p.node);
        winG[idx].classList.add('touch');
        drapeTarget[idx] = OPEN; drapeRate[idx] = 2.2;
      } else if (type === 'rose') {
        p.node = el('g', { 'data-pest': 'rose', class: 'touch', fill: 'currentColor' }, L.roses);
        p.stem = el('path', {}, p.node);
        p.thorns = el('path', {}, p.node);
        p.leaves = el('path', {}, p.node);
        p.veins = el('path', { class: 'gs-vein' }, p.node);
        p.bloom = el('g', {}, p.node);
        p.bloom.innerHTML = BLOOM;
        p.pts = [];
      } else if (type === 'band') {
        p.word = BAND_WORDS[bandWordI++ % BAND_WORDS.length];
        p.wrap = el('g', { class: 'gs-sound touch' }, L.bands);
        p.node = el('text', { class: 'gs-band', 'text-anchor': 'middle', 'data-pest': 'band' }, p.wrap);
        p.node.textContent = p.word;
        p.jit = 0; p.jitT = 0;
      }
      pests.push(p);
      drawPest(p);
      return true;
    }
    function spawnNext(dur) {
      for (let n = 0; n < SEQ.length; n++) {
        const site = SEQ[(seqI + n) % SEQ.length];
        if (!occupied(site)) { seqI = (seqI + n + 1) % SEQ.length; return spawnSite(site, dur, false); }
      }
      return false;
    }
    function spawnTap(board, dur) {
      const visit = ledgerMarks[board].visits++;
      const x = BOARD_CX(board) + [0, -28, 28, -14, 14][visit % 5];
      const p = { type: 'tap', board, x, site: 'T' + board, dur, p: 0, born: T, alive: true };
      p.wrap = el('g', { class: 'gs-tapw touch' }, L.taps);
      p.node = el('text', { class: 'gs-tap', x, y: 479, 'text-anchor': 'middle', 'data-pest': 'tap' }, p.wrap);
      p.node.textContent = 'tap.';
      pests.push(p);
    }
    function spawnKnock() {
      const p = { type: 'knock', site: 'K', dur: 4, p: 0, born: T, alive: true };
      p.wrap = el('g', { class: 'gs-knockw touch' }, L.knock);
      p.node = el('text', { class: 'gs-knock', 'text-anchor': 'middle', 'data-pest': 'knock' }, p.wrap);
      p.node.textContent = 'KNOCK.';
      pests.push(p);
      drawPest(p);
    }
    function remove(p, life, update) {
      p.alive = false;
      pests = pests.filter(q => q !== p);
      if (gesture && gesture.pest === p) endGesture();
      untouch(touchEl(p));
      const n = p.wrap || p.node;
      if (life) addFx(n, life, update); else n.remove();
    }

    function roseGeom(p) {
      const v = VASES[p.idx], a = v.aim, c = { x: v.x + (a.x - v.x) * 0.12, y: v.y - 150 };
      const tmax = 0.16 + 0.84 * p.p, pts = [];
      for (let i = 0; i <= 18; i++) pts.push(quad(v, c, a, tmax * i / 18));
      p.pts = pts; p.tmax = tmax; p.curve = [v, c, a];
      return pts;
    }
    function sunGeom(p) {
      const w = WINS[p.idx];
      p.spot = { x: lerp(w.spot.x, FACE.x, p.p), y: lerp(w.spot.y, FACE.y, p.p) };
      return p.spot;
    }
    function bandPos(p) {
      const b = BANDS[p.idx], c = { x: lerp(b.x, b.ear.x, 0.55), y: b.y };
      return quad(b, c, b.ear, p.p);
    }
    function knockPos(p) {
      const k = ease(p.p);
      return { x: lerp(BOARD_CX(VAULT_BOARD), FACE.x + 10, k), y: lerp(506, FACE.y + 22, k) };
    }

    function drawPest(p) {
      const still = RM || halted || T < frozenUntil;
      if (p.type === 'sun') {
        const w = WINS[p.idx], s = sunGeom(p), ax = w.x, ay = WIN_BOT - 4;
        const dx = s.x - ax, dy = s.y - ay, len = Math.hypot(dx, dy) || 1, nx = -dy / len * 26, ny = dx / len * 26;
        let A = { x: s.x + nx, y: s.y + ny }, B = { x: s.x - nx, y: s.y - ny };
        if (A.x < B.x) [A, B] = [B, A];
        p.beam.setAttribute('points', `${ax - 30},${ay} ${ax + 30},${ay} ${f(A.x)},${f(A.y)} ${f(B.x)},${f(B.y)}`);
        let d = '';
        for (let i = 0; i < 5; i++) {
          const k = i / 4;
          d += `M${f(ax - 26 + 52 * k)} ${ay}L${f(lerp(B.x, A.x, k))} ${f(lerp(B.y, A.y, k))}`;
        }
        p.rays.setAttribute('d', d);
        if (!still) p.rays.style.strokeDashoffset = f(-T * 14);
        p.spotEl.setAttribute('cx', f(s.x)); p.spotEl.setAttribute('cy', f(s.y));
      } else if (p.type === 'rose') {
        const pts = roseGeom(p), tip = pts[pts.length - 1];
        // the stem: a tapered cut, thick at the urn; thorns hooked back toward it
        p.stem.setAttribute('d', C.taper(pts.map(q => [q.x, q.y]), 5.4, 2.6));
        let th = '';
        for (let i = 3; i < pts.length - 2; i += 3) {
          const q = pts[i], q2 = pts[i + 1], tx = q2.x - q.x, ty = q2.y - q.y, tl = Math.hypot(tx, ty) || 1;
          const ux = tx / tl, uy = ty / tl, sd = (i / 3) % 2 ? 1 : -1, nx = -uy * sd, ny = ux * sd;
          th += `M${f(q.x - ux * 2.6 + nx * 1.6)} ${f(q.y - uy * 2.6 + ny * 1.6)}L${f(q.x + nx * 6.5 - ux * 2.6)} ${f(q.y + ny * 6.5 - uy * 2.6)}L${f(q.x + ux * 2.6 + nx * 1.6)} ${f(q.y + uy * 2.6 + ny * 1.6)}Z`;
        }
        p.thorns.setAttribute('d', th || 'M0 0');
        const [v, c, a] = p.curve;
        let lv = '', vn = '';
        for (const [t, side] of [[0.3, 1], [0.55, -1], [0.78, 1]]) {
          if (p.tmax < t + 0.05) continue;
          const q = quad(v, c, a, t), q2 = quad(v, c, a, t + 0.02);
          const tx = q2.x - q.x, ty = q2.y - q.y, tl = Math.hypot(tx, ty) || 1;
          const nx = -ty / tl * side, ny = tx / tl * side, ux = tx / tl, uy = ty / tl;
          const ex = q.x + nx * 16 + ux * 6, ey = q.y + ny * 16 + uy * 6;
          lv += `M${f(q.x)} ${f(q.y)}Q${f(q.x + nx * 4 + ux * 12)} ${f(q.y + ny * 4 + uy * 12)} ${f(ex)} ${f(ey)}Q${f(q.x + nx * 12 - ux * 3)} ${f(q.y + ny * 12 - uy * 3)} ${f(q.x)} ${f(q.y)}Z`;
          vn += `M${f(q.x + nx * 3 + ux * 1.5)} ${f(q.y + ny * 3 + uy * 1.5)}L${f(q.x + nx * 12 + ux * 4.5)} ${f(q.y + ny * 12 + uy * 4.5)}`;
        }
        p.leaves.setAttribute('d', lv || 'M0 0');
        p.veins.setAttribute('d', vn || 'M0 0');
        const r = 6 + 9 * p.p, nod = still ? 0 : Math.sin(T * 5 + p.idx) * 6;
        p.bloom.setAttribute('transform', `translate(${f(tip.x)} ${f(tip.y)}) rotate(${f(nod)}) scale(${f(r / 10)})`);
      } else if (p.type === 'band') {
        const pos = bandPos(p), shrink = 1 - 0.72 * clamp(p.hold / 0.9, 0, 1);
        const fs = (30 + 40 * p.p) * shrink;
        p.node.setAttribute('x', f(pos.x)); p.node.setAttribute('y', f(pos.y));
        p.node.setAttribute('font-size', f(fs));
        if (!still && T - p.jitT > 0.09) { p.jitT = T; p.jit = (Math.sin(T * 91 + p.idx * 7) * 2.6); }
        if (still) p.jit = 0;
        p.node.setAttribute('transform', `rotate(${f(p.jit)} ${f(pos.x)} ${f(pos.y)})`);
      } else if (p.type === 'tap') {
        const k = clamp((p.p - 0.7) / 0.3, 0, 1), fade = clamp((T - p.born) / 0.25, 0, 1);
        const shiver = RM ? 0 : Math.sin(T * 40) * (p.p < 0.7 ? 2 : 0);
        p.node.style.opacity = fade * (1 - 0.85 * k);
        p.node.setAttribute('transform', `translate(0 ${f(k * 12)}) rotate(${f(shiver)} ${p.x} 474)`);
      } else if (p.type === 'knock') {
        const pos = knockPos(p);
        p.node.setAttribute('x', f(pos.x)); p.node.setAttribute('y', f(pos.y));
        p.node.setAttribute('font-size', f(64 + 30 * p.p));
        p.node.style.opacity = clamp((T - p.born) / 0.4, 0, 1);
      }
      if (p.node && p.type !== 'tap' && p.type !== 'knock') p.node.classList.toggle('gs-frozen', T < frozenUntil && !halted);
    }

    // ---- outcomes ----
    function hush(p, viaKnock, at) {
      if (!p.alive) return;
      const m = viaKnock ? 5 : mult, pts = VALUE[p.type] * m;
      score += pts; counts[p.type]++;
      if (!viaKnock) taught[p.type] = true;
      if (p.type === 'sun') {
        const w = WINS[p.idx];
        drapeTarget[p.idx] = 1; drapeRate[p.idx] = 6;
        word(w.x, WIN_BOT + 34, 'swish.', pts);
        remove(p, 0.3, (s, k) => { p.node.style.opacity = 1 - k; });
      } else if (p.type === 'rose') {
        const mid = at || p.pts[Math.floor(p.pts.length * 0.6)];
        word(mid.x, mid.y - 10, 'snip.', pts);
        remove(p, 0.7, (s, k) => {
          p.node.style.opacity = 1 - k;
          if (!RM) p.node.setAttribute('transform', `translate(0 ${f(60 * k * k)}) rotate(${f(8 * k)} ${VASES[p.idx].x} ${VASES[p.idx].y})`);
        });
      } else if (p.type === 'band') {
        const pos = bandPos(p);
        word(pos.x, pos.y - 6, 'plink.', pts);
        remove(p, 0.2, (s, k) => { p.node.style.opacity = 1 - k; });
      }
    }
    function reach(p) {
      crack = Math.min(6, crack + 1);
      mult = 1;
      poseUntil = T + 1.2; sighUntil = 0;
      smudge(FACE.x, FACE.y);
      if (p.type === 'sun') { drapeTarget[p.idx] = 1; drapeRate[p.idx] = 1; }
      remove(p, 0.3, (s, k) => { p.node.style.opacity = 1 - k; });
    }
    function hushTap(p) {
      const x = p.x, y = 472;
      score += VALUE.tap * mult;
      word(x, 436, 'hush.', VALUE.tap * mult);
      mult = Math.min(5, mult + 1);
      tapsHushed++;
      ledgerMarks[p.board].prints++;
      thumbprint(x, y, 1);
      ripple(x, y);
      frozenUntil = T + 2;
      crack = Math.max(0, crack - 1);
      sigh();
      remove(p);
    }
    function sinkTap(p) {
      tapsSpared++;
      mult = 1;
      tick(p.board);
      remove(p);
    }
    function hushKnock(p) {
      const pos = knockPos(p);
      tapsHushed++;
      score += 1000;
      word(pos.x, pos.y - 70, 'hush.', 1000);
      for (const q of [...pests]) if (q !== p && q.type !== 'tap') hush(q, true);
      thumbprint(BOARD_CX(VAULT_BOARD), 472, 1.45);
      ripple(pos.x, pos.y - 24, true);
      crack = Math.max(0, crack - 1);
      frozenUntil = T + 3;
      sigh();
      remove(p);
      endGame('hushed');
    }
    function knockReached(p) {
      tapsSpared++;
      knockSpared = true;
      p.alive = false;
      pests = pests.filter(q => q !== p);
      halted = true;                       // the pests stop, unhushed
      endPose = 'hidden';
      endGame('spared');
    }
    function endGame(how) {
      if (ended) return;
      ended = true; endT = T; outcome = how;
      if (gesture) endGesture();
      if (how === 'hushed') endPose = 'calm';
      setLine('');
      svg.style.cursor = 'default';
      svg.querySelectorAll('.touch').forEach(untouch);     // nothing left to touch: no rims
    }
    function finish() {
      if (doneSent) return;
      doneSent = true;
      const won = crack < 6;
      try {
        if (api.setFlag) {
          api.setFlag('tapsHushed', tapsHushed);
          api.setFlag('tapsSpared', tapsSpared);
          api.setFlag('knockSpared', knockSpared);
        }
      } catch (e) { /* the spine owns flags; never let it stop the chapter */ }
      if (api.done) api.done({
        won,
        score: {
          'sunbeams drawn': counts.sun,
          'roses nipped': counts.rose,
          'trumpets muffled': counts.band,
          'taps hushed': tapsHushed,
          'taps let be': tapsSpared,
        },
        note: outcome === 'spared' ? NOTE_SPARED : NOTE_HUSHED,
      });
    }

    // ---- the script ----
    function handle(ev) {
      if (ended && ev.k !== 'line') return;
      switch (ev.k) {
        case 'pest': spawnSite(ev.site, ev.dur, T < 45); break;
        case 'rush': spawnNext(ev.dur); break;
        case 'tap': spawnTap(ev.board, ev.dur); break;
        case 'door': doorTarget = ev.open ? 0 : 1; break;
        case 'lady': lady = { t0: T }; break;
        case 'line': if (!ended) setLine(ev.text); break;
        case 'crescendo': crescendo = true; lastSpawn = T; break;
        case 'knock': spawnKnock(); break;
      }
    }

    // ---- per-frame ----
    function step(dt) {
      while (si < script.length && script[si].t <= T) handle(script[si++]);
      const frozen = T < frozenUntil;
      for (const p of [...pests]) {
        if (!p.alive) continue;
        if (p.type === 'tap') {
          if (ended) continue;
          p.p += dt / p.dur;
          if (p.p >= 1) sinkTap(p);
        } else if (p.type === 'knock') {
          if (ended) continue;
          p.p = Math.min(1, p.p + dt / p.dur);
          if (p.p >= 1) knockReached(p);
        } else {
          const held = gesture && gesture.pest === p && p.type === 'band';
          if (p.type === 'band') {
            p.hold = held ? p.hold + dt : Math.max(0, p.hold - dt * 1.2);
            if (p.hold >= 0.9) { hush(p); continue; }
          }
          if (!frozen && !halted && !held && !(gesture && gesture.pest === p && p.type === 'sun')) {
            p.p += dt / p.dur;
            if (p.p >= 1) reach(p);
          }
        }
      }
      if (crescendo && !ended) {
        const live = pests.filter(p => p.type !== 'tap' && p.type !== 'knock').length;
        const target = T < 126 ? 3 : 4;
        if (live < target && T - lastSpawn >= 0.9 && spawnNext(5.5)) lastSpawn = T;
      }
      for (let i = 0; i < 3; i++) {
        if (gesture && gesture.pest && gesture.pest.type === 'sun' && gesture.pest.idx === i) continue;
        const d = drapeTarget[i] - drape[i];
        drape[i] += Math.sign(d) * Math.min(Math.abs(d), drapeRate[i] * dt);
      }
      const dd = doorTarget - door;
      door = RM ? doorTarget : door + Math.sign(dd) * Math.min(Math.abs(dd), dt / 0.6);
      crackSegs.forEach((s, i) => {
        const target = i < crack ? 1 : 0, d = target - s.shown;
        s.shown = RM ? target : s.shown + Math.sign(d) * Math.min(Math.abs(d), dt * 2.4);
      });
      for (const e of [...fx]) {
        const s = T - e.t0;
        e.update && e.update(s, clamp(s / e.life, 0, 1));
        if (s >= e.life) {
          fx = fx.filter(q => q !== e);
          if (e.node) e.node.remove();
          if (e.onEnd) e.onEnd();
        }
      }
      if (ended && !doneSent && T >= endT + 3) finish();
    }

    function render() {
      for (const p of pests) drawPest(p);
      winEls.forEach((w, i) => {
        const wd = WIN_W * drape[i], x0 = WINS[i].x - WIN_W / 2;
        w.drape.setAttribute('width', f(wd));
        w.folds.setAttribute('d', wd > 8 ? [0.3, 0.55, 0.8].map(k => `M${f(x0 + wd * k)} 86V212`).join('') : '');
        w.lace.setAttribute('transform', `translate(${f(x0 + wd)} 0)`);
      });
      doorLeaf.setAttribute('transform', `translate(142 0) scale(${f(Math.max(0.001, door))} 1) translate(-142 0)`);
      // the crack: a black cut down the lit wall, one segment per pest that reached him
      let shown = 0;
      crackSegs.forEach(s => { shown += s.shown; s.fork.style.opacity = s.shown > 0.6 ? 1 : 0; });
      crackReveal.setAttribute('height', shown > 0 ? f(14 + 64 * shown) : 0);
      // the pale lady glides (never bobs); under reduced motion she fades between three places
      let ladyOn = false;
      if (lady) {
        const k = (T - lady.t0) / 7.4;
        if (k > 1 && door >= 0.999) { lady = null; ladyG.style.opacity = 0; }
        else {
          ladyOn = true;
          let x, op;
          const kk = clamp(k, 0, 1);
          if (RM) {
            const spots = [760, 470, 186], seg = Math.min(2, Math.floor(kk * 3)), local = kk * 3 - seg;
            x = spots[seg]; op = seg === 2 ? Math.min(1, local / 0.15) : Math.min(1, local / 0.15, (1 - local) / 0.15);
          } else {
            x = lerp(872, 182, kk); op = Math.min(1, (T - lady.t0) / 0.5);
          }
          C.place(ladyFig, x, 450);
          ladyG.style.opacity = f(op * 0.9);
        }
      }
      // Roderick
      let pose = 'calm';
      if (endPose) pose = endPose;
      else if (T < poseUntil) pose = 'startled';
      else if (T < sighUntil) pose = 'calm';
      else if (ladyOn) pose = 'hidden';
      if (pose !== poseNow) {
        poses[poseNow].style.display = 'none';
        poses[pose].style.display = '';
        poseNow = pose;
      }
      // freeze: still pests; under reduced motion the lamp dims
      wash.style.opacity = RM && T < frozenUntil && !halted ? 0.3 : 0;
      // score: lamp caps, bottom right, on the glass
      const hud = `TAPS HUSHED ${tapsHushed} · ×${mult} · ${score.toLocaleString('en-US')}`;
      if (hud !== shownHud) { scoreText.textContent = hud; shownHud = hud; }
      renderMime();
    }

    // ---- the cut-paper hand: mimes each gesture once, along a line of dots ----
    const mimeG = el('g', { class: 'gs-mime', style: 'display:none' }, L.mime);
    const hand = el('g', {}, mimeG);
    hand.innerHTML = HAND;
    const mimeDots = el('path', {}, mimeG);
    function renderMime() {
      let m = null;
      if (!ended && T < 45) for (const p of pests) if (p.alive && p.mime && !taught[p.type] && (!m || p.born < m.born)) m = p;
      if (!m) { mimeG.style.display = 'none'; return; }
      const c = ((T - m.born) % 2.4) / 2.4;
      let a, b, k = 0, op = 1, ring = 0;
      if (m.type === 'sun') {
        const w = WINS[m.idx];
        a = { x: w.x - 24, y: 152 }; b = { x: w.x + 30, y: 152 };
        k = c < 0.15 ? 0 : c < 0.65 ? ease((c - 0.15) / 0.5) : 1;
      } else if (m.type === 'rose') {
        const pts = m.pts.length ? m.pts : roseGeom(m), i = Math.floor(pts.length * 0.55), q = pts[i], q2 = pts[Math.min(pts.length - 1, i + 1)];
        const tx = q2.x - q.x, ty = q2.y - q.y, tl = Math.hypot(tx, ty) || 1;
        a = { x: q.x + ty / tl * 46, y: q.y - tx / tl * 46 }; b = { x: q.x - ty / tl * 46, y: q.y + tx / tl * 46 };
        k = c < 0.25 ? 0 : c < 0.45 ? ease((c - 0.25) / 0.2) : 1;
      } else {
        const bb = bbox(m.node);
        a = b = { x: bb.x + bb.width / 2, y: bb.y + bb.height * 0.6 };
        ring = c < 0.15 ? 0 : c < 0.75 ? (c - 0.15) / 0.6 : 1;
      }
      op = c < 0.1 ? c / 0.1 : c > 0.85 ? (1 - c) / 0.15 : 1;
      if (RM) { k = 0; op = 1; ring = 1; }
      const x = lerp(a.x, b.x, k), y = lerp(a.y, b.y, k);
      mimeG.style.display = '';
      mimeG.style.opacity = f(op);
      hand.setAttribute('transform', `translate(${f(x)} ${f(y)}) rotate(-22) scale(1.3)`);
      let d = '';
      if (m.type === 'band') {
        const n = Math.round(16 * ring);
        for (let j = 0; j < n; j++) { const an = -PI / 2 + j * PI / 8; d += dot(a.x + Math.cos(an) * 26, a.y + Math.sin(an) * 26, 2.2); }
      } else {
        const ex = RM ? b.x : x, ey = RM ? b.y : y, len = Math.hypot(ex - a.x, ey - a.y);
        const ux = len ? (ex - a.x) / len : 0, uy = len ? (ey - a.y) / len : 0;
        for (let s = 0; s <= len; s += 11) d += dot(a.x + ux * s, a.y + uy * s, 2.2);
        if (RM || k > 0.95) d += dot(b.x, b.y, 4);
      }
      mimeDots.setAttribute('d', d || 'M0 0');
    }

    // ---- input: pointerdown picks the pest beneath; only its gesture counts ----
    function bbox(node) {
      try { return node.getBBox(); } catch (e) { return { x: 0, y: 0, width: 0, height: 0 }; }
    }
    function toSvg(e) {
      const m = svg.getScreenCTM();
      if (!m) return { x: -1, y: -1 };
      const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
      return { x: pt.x, y: pt.y };
    }
    function pick(pt) {
      let best = null, bs = Infinity;
      const take = (p, s) => { if (s < bs) { bs = s; best = p; } };
      for (const p of pests) {
        if (!p.alive) continue;
        if (p.type === 'tap') {
          const cx = BOARD_CX(p.board);
          if (Math.abs(pt.x - cx) <= 60 && Math.abs(pt.y - 472) <= 45) take(p, Math.hypot(pt.x - p.x, pt.y - 474));
        } else if (p.type === 'knock') {
          const b = bbox(p.node), cx = b.x + b.width / 2, cy = b.y + b.height / 2;
          if (Math.abs(pt.x - cx) <= Math.max(100, b.width / 2 + 12) && Math.abs(pt.y - cy) <= Math.max(60, b.height / 2 + 12)) take(p, Math.hypot(pt.x - cx, pt.y - cy));
        } else if (p.type === 'band') {
          const b = bbox(p.node), pad = 22;
          if (pt.x >= b.x - pad && pt.x <= b.x + b.width + pad && pt.y >= b.y - pad && pt.y <= b.y + b.height + pad)
            take(p, 1000 + 0.5 * Math.hypot(pt.x - b.x - b.width / 2, pt.y - b.y - b.height / 2));
        } else if (p.type === 'rose') {
          const d = polyDist(pt, p.pts.length ? p.pts : roseGeom(p));
          if (d <= 44) take(p, 1000 + d);
        } else if (p.type === 'sun') {
          const w = WINS[p.idx];
          if (Math.abs(pt.x - w.x) <= 64 && pt.y >= 64 && pt.y <= 242) take(p, 1000 + 0.5 * Math.abs(pt.x - w.x));
          else {
            const d = distSeg(pt, { x: w.x, y: WIN_BOT }, sunGeom(p));
            if (d <= 30) take(p, 3000 + d);
          }
        }
      }
      return best;
    }
    const CURSOR = { sun: 'ew-resize', rose: 'crosshair', band: 'pointer', tap: 'pointer', knock: 'pointer' };

    function onDown(e) {
      if (ended || halted || gesture) return;
      if (e.button !== undefined && e.button > 0) return;
      const pt = toSvg(e), p = pick(pt);
      e.preventDefault();
      setHot(null);
      if (p && p.type === 'tap') return hushTap(p);
      if (p && p.type === 'knock') return hushKnock(p);
      try { svg.setPointerCapture(e.pointerId); } catch (err) { /* synthetic pointers */ }
      // On a pest: only its gesture counts. On bare paper: a free stroke, which snips any stem it cuts.
      gesture = { id: e.pointerId, pest: p, x0: pt.x, last: pt, len: 0, crossed: false, tp: [pt] };
      if (p && (p.type === 'sun' || p.type === 'band')) touchEl(p).classList.add('is-held');   // lifted off the screen
      if (p && p.type === 'rose') gesture.crossed = polyDist(pt, p.pts) <= 12;
      if (!p || p.type === 'rose') gesture.trail = el('polyline', { class: 'gs-trail', points: `${f(pt.x)},${f(pt.y)}` }, L.fx);
    }
    function onMove(e) {
      const pt = toSvg(e);
      if (!gesture) {
        if (e.pointerType === 'mouse' && !ended) {
          const p = pick(pt);
          svg.style.cursor = p ? CURSOR[p.type] : 'default';
          setHot(touchEl(p));
        }
        return;
      }
      if (e.pointerId !== gesture.id) return;
      const g = gesture, p = g.pest;
      if (!p) {
        g.len += Math.hypot(pt.x - g.last.x, pt.y - g.last.y);
        g.tp.push(pt);
        g.trail.setAttribute('points', g.tp.map(q => `${f(q.x)},${f(q.y)}`).join(' '));
        if (!g.cut) for (const r of pests) {
          if (!r.alive || r.type !== 'rose') continue;
          for (let i = 1; i < r.pts.length; i++) if (cross(g.last, pt, r.pts[i - 1], r.pts[i])) { g.cut = r; break; }
          if (g.cut) break;
        }
        if (g.cut && g.cut.alive && g.len >= 80) { const r = g.cut; endGesture(); hush(r, false, pt); return; }
        g.last = pt;
        return;
      }
      if (!p.alive) return endGesture();
      if (p.type === 'sun') {
        const dx = Math.abs(pt.x - g.x0);
        drape[p.idx] = drapeTarget[p.idx] = clamp(OPEN + dx / WIN_W, OPEN, 1);
        if (dx >= 0.6 * WIN_W) { endGesture(); hush(p); }
      } else if (p.type === 'rose') {
        if (!g.crossed) for (let i = 1; i < p.pts.length; i++) if (cross(g.last, pt, p.pts[i - 1], p.pts[i])) { g.crossed = true; break; }
        g.len += Math.hypot(pt.x - g.last.x, pt.y - g.last.y);
        g.tp.push(pt);
        g.trail.setAttribute('points', g.tp.map(q => `${f(q.x)},${f(q.y)}`).join(' '));
        if (g.crossed && g.len >= 80) { endGesture(); hush(p, false, pt); return; }
      }
      g.last = pt;
    }
    function endGesture() {
      const g = gesture;
      gesture = null;
      if (!g) return;
      if (g.pest) { const t = touchEl(g.pest); if (t) t.classList.remove('is-held'); }
      if (g.pest && g.pest.type === 'sun' && g.pest.alive) { drapeTarget[g.pest.idx] = OPEN; drapeRate[g.pest.idx] = 3; }
      if (g.trail) { const t = g.trail; addFx(t, 0.4, (s, k) => { t.style.opacity = 1 - k; }); }
    }
    function onUp(e) {
      if (gesture && e.pointerId === gesture.id) endGesture();
    }
    const onLeave = () => setHot(null);
    svg.addEventListener('pointerdown', onDown);
    svg.addEventListener('pointermove', onMove);
    svg.addEventListener('pointerup', onUp);
    svg.addEventListener('pointercancel', onUp);
    svg.addEventListener('lostpointercapture', onUp);
    svg.addEventListener('pointerleave', onLeave);
    const noMenu = e => e.preventDefault();
    svg.addEventListener('contextmenu', noMenu);

    // ---- go ----
    setLine(SPARE);
    function frame(now) {
      raf = requestAnimationFrame(frame);
      if (last === null) last = now;
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000)) * SPEED;
      last = now;
      T += dt;
      step(dt);
      render();
    }
    render();
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      if (ro) ro.disconnect();
      svg.removeEventListener('pointerdown', onDown);
      svg.removeEventListener('pointermove', onMove);
      svg.removeEventListener('pointerup', onUp);
      svg.removeEventListener('pointercancel', onUp);
      svg.removeEventListener('lostpointercapture', onUp);
      svg.removeEventListener('pointerleave', onLeave);
      svg.removeEventListener('contextmenu', noMenu);
      fx = []; pests = []; gesture = null;
      root.remove();
    };
  },
};
