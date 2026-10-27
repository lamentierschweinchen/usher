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
const BAND_LIFT = 60;                    // the band's type is drawn this far above its path, clear of Roderick's profile;
                                         // its touch box (the word's own box, padded) goes with it
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

// mirror: only the room, its paper left uncoloured so returned() can turn it to light (act two)
function scene(u, { mirror = false } = {}) {
  const ink = s => mirror ? `<g fill="currentColor">${s}</g>` : `<g style="color:var(--sh-cut,#0b0809)" fill="currentColor">${s}</g>`;
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
  const ROOM_INK = `
  <g data-l="crack" clip-path="url(#${u}-crack)">${crack}</g>
  ${wins}
  <path d="${OPENING}" fill="${mirror ? '#120f24' : 'url(#sh-room-stair)'}"/>
  <g data-l="lady"><g data-lady style="opacity:0${mirror ? ';--gauze:#fff6e0;--gauze-a:.62' : ''}">${C.figure('madeline', { x: 872, y: 450, scale: 2.4, flip: true })}</g></g>
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
  </g>`;
  let seams = '';
  for (let i = 1; i < 8; i++) seams += `M${i * 120} 453V492`;

  const clips = WINS.map((w, i) => `<clipPath id="${u}-win${i}"><path d="${winD(w.x)}"/></clipPath>`).join('') +
    `<clipPath id="${u}-crack"><rect data-crack-reveal x="560" y="56" width="100" height="0"/></clipPath>` +
    `<linearGradient id="${u}-beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff0c2" stop-opacity=".58"/><stop offset="1" stop-color="#fff0c2" stop-opacity=".16"/></linearGradient>` +
    `<radialGradient id="${u}-pool"><stop offset="0" stop-color="#fff6dc" stop-opacity=".75"/><stop offset=".6" stop-color="#fff0c2" stop-opacity=".28"/><stop offset="1" stop-color="#fff0c2" stop-opacity="0"/></radialGradient>`;
  const ROOM = () => `${ink(ROOM_INK)}
  <g data-l="beams" class="gs-beams"></g>
  <g data-l="roses"${mirror ? '' : ' style="color:var(--sh-cut,#0b0809)"'}></g>`;
  if (mirror) return `<defs>${clips}</defs>${ROOM()}<g data-l="ledger"></g><g data-l="taps"></g><g data-l="bands"></g><g data-l="knock"></g><g data-l="fx" class="gs-fx"></g><g data-l="mime" class="gs-fx"></g>`;
  return `
  <defs>
    ${clips}
    <linearGradient id="${u}-deep" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".6"/><stop offset=".55" stop-color="#fff" stop-opacity=".34"/><stop offset="1" stop-color="#fff" stop-opacity=".1"/></linearGradient>
    <mask id="${u}-depth" maskUnits="userSpaceOnUse" x="0" y="492" width="960" height="148"><rect x="0" y="492" width="960" height="148" fill="url(#${u}-deep)"/></mask>
    <radialGradient id="${u}-glow" gradientUnits="userSpaceOnUse" cx="480" cy="250" r="430"><stop offset="0" stop-color="#f8d993" stop-opacity=".3"/><stop offset="1" stop-color="#f8d993" stop-opacity="0"/></radialGradient>
    <filter id="${u}-edgeU" filterUnits="userSpaceOnUse" x="0" y="0" width="960" height="640" color-interpolation-filters="sRGB">
      <feMorphology in="SourceAlpha" operator="dilate" radius="1.5" result="d"/><feGaussianBlur in="d" stdDeviation="1.2" result="b"/>
      <feFlood flood-color="#f7d894" flood-opacity=".78"/><feComposite in2="b" operator="in" result="rim"/>
      <feMerge><feMergeNode in="rim"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    ${[['stencil', 5.5, 0], ['stencil-soft', 5, 0.55], ['stencil-hot', 7, 1]].map(([n, r, a]) => `<filter id="${u}-${n}" x="-15%" y="-35%" width="130%" height="170%" color-interpolation-filters="sRGB">
      <feMorphology in="SourceAlpha" operator="dilate" radius="4" result="d"/><feFlood flood-color="#0b0809"/><feComposite in2="d" operator="in" result="plaque"/>
      <feMorphology in="SourceAlpha" operator="dilate" radius="${r}" result="d2"/><feGaussianBlur in="d2" stdDeviation="1.6" result="b"/>
      <feFlood flood-color="#f7d894" flood-opacity="${a}"/><feComposite in2="b" operator="in" result="rim"/>
      <feMerge><feMergeNode in="rim"/><feMergeNode in="plaque"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`).join('')}
  </defs>

  ${C.backdrop('studio', { h: FLOOR, clouds: false, hills: false })}
  <rect width="960" height="${FLOOR}" fill="url(#${u}-glow)"/>
  <rect class="sh-flicker" width="960" height="${FLOOR}" fill="url(#sh-flick)"/>

  ${ROOM()}

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
.g-studio .gs-word{fill:var(--sh-cut,#0b0809);font-style:italic;font-size:22px}
.g-studio .gs-word .gs-pts{font-style:normal;font-size:16px;letter-spacing:.12em}
.g-studio .gs-band{fill:currentColor;letter-spacing:.03em}
.g-studio .gs-tap{fill:var(--sh-red,#e0392b);font-style:italic;font-size:22px}
.g-studio .gs-knock{fill:var(--sh-red,#e0392b)}
.g-studio .gs-knockw{filter:url(#${u}-stencil)}
@media (hover:none){.g-studio .gs-knockw.touch{filter:url(#${u}-stencil-soft)}}
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
.g-studio.gs-narrow .gs-teach{font-size:39px}
.g-studio.gs-narrow .gs-score{font-size:25.5px;letter-spacing:.12em}
.g-studio.gs-narrow .gs-tap{font-size:33px}
.g-studio.gs-narrow .gs-word{font-size:33px}
.g-studio.gs-narrow .gs-word .gs-pts{font-size:24px}
`;

// ---- the studio's engine. Act one plays it; act two replays it inside the mirror (cfg.replay) ----
// Act one's rules live only here, unchanged. cfg: { api, RM, replay, record, pose }.
function core(svg, scope, u, cfg) {
    const { api = {}, RM = false, replay = false, record = null } = cfg;
    const $ = s => scope.querySelector(s);
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

    const el = (tag, attrs, parent) => {
      const e = document.createElementNS(NS, tag);
      for (const k in attrs) e.setAttribute(k, attrs[k]);
      if (parent) parent.appendChild(e);
      return e;
    };

    // ---- state ----
    const script = buildScript();
    let si = 0, T = 0;
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
    // act one's record (api.record): the game's clock as t, never allowed to touch play
    const r2 = n => Math.round(n * 100) / 100;
    const rec = (type, data) => { if (!record) return; try { record(type, { t: r2(T), ...data }); } catch (e) { /* the spine owns the save */ } };

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
      if (replay) return;
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
      if (!teach) return;
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
      if (RM || replay) return;
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
        if (!replay) winG[idx].classList.add('touch');
        drapeTarget[idx] = OPEN; drapeRate[idx] = 2.2;
      } else if (type === 'rose') {
        p.node = el('g', replay ? { 'data-pest': 'rose', fill: 'currentColor' } : { 'data-pest': 'rose', class: 'touch', fill: 'currentColor' }, L.roses);
        p.stem = el('path', {}, p.node);
        p.thorns = el('path', {}, p.node);
        p.leaves = el('path', {}, p.node);
        p.veins = el('path', { class: 'gs-vein' }, p.node);
        p.bloom = el('g', {}, p.node);
        p.bloom.innerHTML = BLOOM;
        p.pts = [];
      } else if (type === 'band') {
        p.word = BAND_WORDS[bandWordI++ % BAND_WORDS.length];
        p.wrap = el('g', { class: replay ? 'gs-sound' : 'gs-sound touch' }, L.bands);
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
        const ty = pos.y - BAND_LIFT;
        p.node.setAttribute('x', f(pos.x)); p.node.setAttribute('y', f(ty));
        p.node.setAttribute('font-size', f(fs));
        if (!still && T - p.jitT > 0.09) { p.jitT = T; p.jit = (Math.sin(T * 91 + p.idx * 7) * 2.6); }
        if (still) p.jit = 0;
        p.node.setAttribute('transform', `rotate(${f(p.jit)} ${f(pos.x)} ${f(ty)})`);
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
      rec('hush', viaKnock ? { type: p.type, board: null, react: r2(T - p.born), site: p.site, via: 'knock' } : { type: p.type, board: null, react: r2(T - p.born), site: p.site });
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
        word(pos.x, pos.y - BAND_LIFT - 6, 'plink.', pts);
        remove(p, 0.2, (s, k) => { p.node.style.opacity = 1 - k; });
      }
    }
    function reach(p) {
      rec('reach', { type: p.type, site: p.site });
      crack = Math.min(6, crack + 1);
      mult = 1;
      poseUntil = T + 1.2; sighUntil = 0;
      smudge(FACE.x, FACE.y);
      if (p.type === 'sun') { drapeTarget[p.idx] = 1; drapeRate[p.idx] = 1; }
      remove(p, 0.3, (s, k) => { p.node.style.opacity = 1 - k; });
    }
    function hushTap(p) {
      rec('hush', { type: 'tap', board: p.board, react: r2(T - p.born) });
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
      rec('spare', { board: p.board });
      tapsSpared++;
      mult = 1;
      tick(p.board);
      remove(p);
    }
    function hushKnock(p) {
      rec('knock', { result: 'hushed', react: r2(T - p.born) });
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
      rec('knock', { result: 'spared', react: null });
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
      if (replay && (ev.k === 'tap' || ev.k === 'line' || ev.k === 'knock')) return;
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
      const po = cfg.pose && cfg.pose(pose);
      if (po) pose = po;
      if (pose !== poseNow) {
        poses[poseNow].style.display = 'none';
        poses[pose].style.display = '';
        poseNow = pose;
      }
      // freeze: still pests; under reduced motion the lamp dims
      if (wash) wash.style.opacity = RM && T < frozenUntil && !halted ? 0.3 : 0;
      // score: lamp caps, bottom right, on the glass
      const num = v => (v ? v.toLocaleString('en-US') : 'NONE');   // an old-style zero reads as a letter
      const hud = `TAPS HUSHED ${num(tapsHushed)} · ×${mult} · ${num(score)}`;
      if (scoreText && hud !== shownHud) { scoreText.textContent = hud; shownHud = hud; }
      if (!replay) renderMime();
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
      gesture = { id: e.pointerId, pest: p, x0: pt.x, last: pt, len: 0, crossed: false, tp: [pt], t0: T };
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
      rec('gesture', { t0: r2(g.t0), t1: r2(T), kind: g.pest && g.pest.type === 'sun' ? 'drape' : g.pest && g.pest.type === 'band' ? 'hold' : 'snip' });
      if (g.pest) { const t = touchEl(g.pest); if (t) t.classList.remove('is-held'); }
      if (g.pest && g.pest.type === 'sun' && g.pest.alive) { drapeTarget[g.pest.idx] = OPEN; drapeRate[g.pest.idx] = 3; }
      if (g.trail) { const t = g.trail; addFx(t, 0.4, (s, k) => { t.style.opacity = 1 - k; }); }
    }
    function onUp(e) {
      if (gesture && e.pointerId === gesture.id) endGesture();
    }
    const onLeave = () => setHot(null);
    const noMenu = e => e.preventDefault();
    // the record's pointer: where the hand is, sampled every 100 ms of game time (capture phase, never consumed)
    let ptr = null, nextPtr = 0;
    const track = e => { const pt = toSvg(e); ptr = { x: pt.x, y: pt.y, down: e.type === 'pointerdown' ? true : e.type === 'pointermove' ? !!(ptr && ptr.down) : false }; };
    if (!replay) {
      svg.addEventListener('pointerdown', onDown);
      svg.addEventListener('pointermove', onMove);
      svg.addEventListener('pointerup', onUp);
      svg.addEventListener('pointercancel', onUp);
      svg.addEventListener('lostpointercapture', onUp);
      svg.addEventListener('pointerleave', onLeave);
      svg.addEventListener('contextmenu', noMenu);
      if (record) for (const t of ['pointerdown', 'pointermove', 'pointerup', 'pointercancel']) svg.addEventListener(t, track, true);
    }

    // ---- replay hooks (act two): the recorded outcomes, applied on their old timings ----
    function replayHush(e) {            // a recorded hush of a sunbeam, rose or band
      const p = pests.find(q => q.alive && q.site === e.site) || pests.find(q => q.alive && q.type === e.type);
      if (p && p.type !== 'tap' && p.type !== 'knock') hush(p, false);
    }
    function replayTapHush() {          // act one's freeze and sigh, without the tap: she is the tapper now
      mult = Math.min(5, mult + 1);
      tapsHushed++;
      frozenUntil = T + 2;
      crack = Math.max(0, crack - 1);
      sigh();
    }
    function replayKnock(result) {      // how act one's knock ended
      if (ended) return;
      if (result === 'hushed') {
        for (const q of [...pests]) if (q.type !== 'tap') hush(q, true);
        crack = Math.max(0, crack - 1);
        frozenUntil = T + 3;
        sigh();
        endPose = 'calm';
      } else { halted = true; endPose = 'hidden'; }
      ended = true;
    }

    // ---- go ----
    if (!replay) setLine(SPARE);
    function advance(dt) {
      T += dt;
      step(dt);
      render();
      if (record && ptr && T >= nextPtr) {
        rec('ptr', { x: f(ptr.x), y: f(ptr.y), down: ptr.down });
        nextPtr = (Math.floor(T * 10 + 1e-6) + 1) / 10;
      }
    }
    render();
    return {
      advance, render, poses, L,
      get T() { return T; },
      replayHush, replayTapHush, replayKnock,
      cleanup() {
        svg.removeEventListener('pointerdown', onDown);
        svg.removeEventListener('pointermove', onMove);
        svg.removeEventListener('pointerup', onUp);
        svg.removeEventListener('pointercancel', onUp);
        svg.removeEventListener('lostpointercapture', onUp);
        svg.removeEventListener('pointerleave', onLeave);
        svg.removeEventListener('contextmenu', noMenu);
        for (const t of ['pointerdown', 'pointermove', 'pointerup', 'pointercancel']) svg.removeEventListener(t, track, true);
        fx = []; pests = []; gesture = null;
      },
    };
}

// ======================================================================================
// Act two, *Burial*: the mirror studio (work/fullgame/MILESTONE-1.md §3).
// Madeline in the vault, the boards her ceiling; above them the studio as returned() light,
// replaying your act one: its pests on their old timings, and your hand on its recorded path.
// ======================================================================================
// The spec maps studio y 0–452 to 200–0 (upside down). That puts act one's floor, where your hand hushed
// the taps, at the top of the screen, far from her boards. Kept false, act one's floor lies on her ceiling
// (y 0–452 → 0–200) and your recorded presses land on the boards she knocks. One switch either way.
const MIRROR_FLIP = false;
const SY = 200 / 452;
const mapY = y => (MIRROR_FLIP ? 200 - y * SY : y * SY);
const MIRROR_T = MIRROR_FLIP ? `matrix(1 0 0 ${-SY} 0 200)` : `matrix(1 0 0 ${SY} 0 0)`;
const CEIL = 200, CEIL_B = 240, VFLOOR = 588;
const BEAT = 60 / 86, BAR = 3 * BEAT, WINDOW = 0.2;       // Roderick's waltz: 86 bpm in 3/4; beat three ±0.2 s
const TAP_LIFE = 1.2, DART_R = 240, KNOCK_R = 360, SLAM_R = 480, RISE = 3, TABLEAU = 3;
const LEARN_END = 45, TURN_AT = 110, TURN_END = 140;
const MFACE = { x: FACE.x, y: mapY(FACE.y) };
const HAND_Y_MAX = CEIL + 12;                             // the hand presses the boards from above, never through them
const LINES = {
  someone: 'Someone did it for you.',
  third: 'Knock on the third beat.',
  hand: "That's your hand. Wait till it's busy.",
  heard: 'He heard.',
  never: 'You never heard a thing.',
  turn: 'Hold a board a whole bar. Let go on three.',
};
const SETTLE = 'the house settling.';
const onBeat3 = t => { const k = Math.round((t - 2 * BEAT) / BAR); return Math.abs(t - (2 * BEAT + k * BAR)) <= WINDOW; };
const beatAt = t => { const n = Math.floor(t / BEAT); return { n, b: ((n % 3) + 3) % 3, ph: t - n * BEAT }; };

function mirrorScene(u) {
  const room = scene(u, { mirror: true });
  const lifted = C.returned(`<g class="gm-room" style="--lit-door:#1a142c;--lit-fold:#6a5878">${room}</g>`, { still: true, transform: MIRROR_T })
    .replace('url(#sh-depth)', `url(#${u}-mdepth)`);
  let seams = '', shafts = '';
  for (let i = 1; i < 8; i++) {
    const x = i * 120;
    seams += `M${x} ${CEIL}V${CEIL_B}`;
    shafts += `M${x - 1.5} ${CEIL_B}L${x + 1.5} ${CEIL_B}L${x + 18} 560L${x - 18} 560Z`;
  }
  const boards = Array.from({ length: 8 }, (_, i) => `<g class="gm-board" data-board="${i}"><rect x="${i * 120 + 1}" y="${CEIL}" width="118" height="${CEIL_B - CEIL}"/></g>`).join('');
  const pillar = x => `<path d="M${x - 16} ${VFLOOR}V${CEIL_B + 74}h32V${VFLOOR}z"/><path d="M${x - 24} ${CEIL_B + 66}h48v9h-48z"/>${C.scallops(x - 20, x + 20, CEIL_B + 75.5, 1.8, 5)}<path d="M${x - 24} ${VFLOOR - 9}h48v9h-48z"/>`;
  const rib = (x0, x1) => { const m = (x0 + x1) / 2, y = CEIL_B + 66; return `<path d="M${x0 - 6} ${y}Q${x0 - 6} ${CEIL_B - 4} ${m} ${CEIL_B - 4}Q${x1 + 6} ${CEIL_B - 4} ${x1 + 6} ${y}H${x1 - 6}Q${x1 - 6} ${CEIL_B + 8} ${m} ${CEIL_B + 8}Q${x0 + 6} ${CEIL_B + 8} ${x0 + 6} ${y}Z"/>`; };
  const vault = pillar(48) + pillar(480) + pillar(912) + rib(48, 480) + rib(480, 912) +
    C.fringe(16, 944, CEIL_B, { seed: 7, len: [2, 7], step: 6, w: 1.2 }) +
    C.coffin({ x: 136, y: 574, w: 170, lid: 'off', trestles: true }) +
    C.door('iron', { x: 700, y: 452, w: 100, h: 136, light: '--lit-vault-door', fallback: '#b97a4c' }) +
    `<path d="M0 ${VFLOOR}H960V640H0Z"/>`;
  return `
  <defs>
    <clipPath id="${u}-upper"><rect x="0" y="0" width="960" height="${CEIL}"/></clipPath>
    <linearGradient id="${u}-mdeep" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".42"/><stop offset="1" stop-color="#fff" stop-opacity=".9"/></linearGradient>
    <mask id="${u}-mdepth" maskUnits="userSpaceOnUse" x="0" y="0" width="960" height="${CEIL}"><rect x="0" y="0" width="960" height="${CEIL}" fill="url(#${u}-mdeep)"/></mask>
    <linearGradient id="${u}-vault" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d99a62"/><stop offset=".2" stop-color="#9a6544"/><stop offset=".55" stop-color="#3a2a26"/><stop offset="1" stop-color="#0d0b0c"/></linearGradient>
    <radialGradient id="${u}-vhalo" gradientUnits="userSpaceOnUse" cx="480" cy="${CEIL_B}" r="420"><stop offset="0" stop-color="#f3c387" stop-opacity=".5"/><stop offset="1" stop-color="#f3c387" stop-opacity="0"/></radialGradient>
    <linearGradient id="${u}-shaft" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff0c2" stop-opacity=".55"/><stop offset="1" stop-color="#fff0c2" stop-opacity="0"/></linearGradient>
    ${[['stencil', 5.5, 0]].map(([n, r, a]) => `<filter id="${u}-${n}" x="-15%" y="-35%" width="130%" height="170%" color-interpolation-filters="sRGB">
      <feMorphology in="SourceAlpha" operator="dilate" radius="4" result="d"/><feFlood flood-color="#0b0809"/><feComposite in2="d" operator="in" result="plaque"/>
      <feMorphology in="SourceAlpha" operator="dilate" radius="${r}" result="d2"/><feGaussianBlur in="d2" stdDeviation="1.6" result="b"/>
      <feFlood flood-color="#f7d894" flood-opacity="${a}"/><feComposite in2="b" operator="in" result="rim"/>
      <feMerge><feMergeNode in="rim"/><feMergeNode in="plaque"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`).join('')}
  </defs>

  <rect width="960" height="${CEIL}" fill="url(#sh-glass-studio)"/>
  <g clip-path="url(#${u}-upper)">${lifted}</g>

  <rect x="0" y="${CEIL_B}" width="960" height="${640 - CEIL_B}" fill="url(#${u}-vault)"/>
  <rect x="0" y="${CEIL_B}" width="960" height="${640 - CEIL_B}" fill="url(#${u}-vhalo)"/>
  <path class="gm-shaft" d="${shafts}"/>
  <g style="color:var(--sh-cut,#0b0809)" fill="currentColor">${vault}</g>
  <path d="M14 ${VFLOOR + 0.5}H946" class="gs-floorlight"/>
  <g data-l="her" class="gm-her">${C.figure('madeline', { x: 480, y: VFLOOR, scale: 3.1, faint: false })}</g>

  <g style="color:var(--sh-cut,#0b0809)" fill="currentColor">${boards}</g>
  <path class="gm-pulse" d="${seams}M14 ${CEIL_B - 0.6}H946M14 ${CEIL + 0.6}H946"/>
  <g data-l="mmarks"></g>
  <g data-l="mtaps"></g>
  <g data-l="mfx" class="gs-fx"></g>
  <g data-l="mhand" class="gs-fx">
    <path class="gm-warn" d=""/><path class="gm-dots" d=""/><path class="gm-ring" d=""/><path class="gm-charge" d=""/>
    <g class="gm-hand" style="display:none">${HAND}</g>
  </g>
  <g data-l="mknock" class="gs-fx"></g>

  <text data-mteach class="gm-teach" x="40" y="621"></text>
  <text data-mhud class="gm-hud" x="920" y="621" text-anchor="end"></text>
  ${C.frame()}`;
}

const mirrorCss = u => `
.g-mirror .gm-pulse{fill:none;stroke:#f7d894;stroke-width:1.3px;opacity:.25}
.g-mirror .gm-shaft{fill:url(#${u}-shaft);opacity:.5}
.g-mirror .gm-hand,.g-mirror .gm-dots{fill:var(--sh-return,#f3dba2)}
.g-mirror .gm-ring{fill:var(--sh-return,#f3dba2);opacity:.45}
.g-mirror .gm-warn{fill:#fff3d0}
.g-mirror .gm-charge{fill:var(--sh-lamp,#f7d894)}
.g-mirror .gm-tap{fill:var(--sh-red,#e0392b);font-style:italic;font-size:22px}
.g-mirror .gm-knock{fill:var(--sh-red,#e0392b)}
.g-mirror .gm-knockw{filter:url(#${u}-stencil)}
.g-mirror .gm-settle{fill:var(--sh-cut,#0b0809);font-style:italic;font-size:22px}
.g-mirror .gm-teach{font-style:italic;font-size:26px;fill:var(--sh-paper,#ede2cb)}
.g-mirror .gm-hud{font-size:17px;letter-spacing:.16em;fill:var(--sh-lamp,#f7d894)}
.g-mirror .gm-tick{fill:none;stroke:var(--sh-red,#e0392b);stroke-width:2.2px;stroke-linecap:round}
.g-mirror .gm-whorl{fill:none;stroke:#c98a52;stroke-width:.8px;opacity:.85}
.g-mirror .gm-board{cursor:pointer}
.g-mirror.gs-narrow .gm-teach{font-size:39px}
.g-mirror.gs-narrow .gm-hud{font-size:25.5px;letter-spacing:.12em}
.g-mirror.gs-narrow .gm-tap,.g-mirror.gs-narrow .gm-settle{font-size:33px}
`;

// Optional sound, local to this game: Roderick's waltz on a plucked (Karplus–Strong) string, and her wooden taps.
// Every cue is also seen. It starts only on a real tap (never before a user gesture) and closes with the game.
function makeWaltz(enabled) {
  let ctx = null, out = null, nextN = 0;
  const cache = new Map();
  const BARS = [[65.41, [261.63, 329.63, 392.0]], [49.0, [246.94, 293.66, 349.23]], [49.0, [246.94, 293.66, 349.23]], [65.41, [261.63, 329.63, 392.0]]];
  function string(freq) {
    if (cache.has(freq)) return cache.get(freq);
    const sr = ctx.sampleRate, n = Math.floor(sr * 1.6), N = Math.max(2, Math.round(sr / freq));
    const buf = ctx.createBuffer(1, n, sr), d = buf.getChannelData(0);
    for (let i = 0; i < N; i++) d[i] = Math.random() * 2 - 1;
    d[N] = d[0] * 0.99;
    for (let i = N + 1; i < n; i++) d[i] = 0.4975 * (d[i - N] + d[i - N - 1]);
    cache.set(freq, buf);
    return buf;
  }
  function play(buf, when, gain, filterHz) {
    const s = ctx.createBufferSource(), g = ctx.createGain();
    s.buffer = buf; g.gain.value = gain;
    if (filterHz) { const bq = ctx.createBiquadFilter(); bq.type = 'bandpass'; bq.frequency.value = filterHz; bq.Q.value = 3; s.connect(bq); bq.connect(g); } else s.connect(g);
    g.connect(out);
    s.start(Math.max(ctx.currentTime, when));
  }
  let wood = null;
  return {
    start() {
      if (ctx || !enabled) return;
      const AC = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
      if (!AC) return;
      try { ctx = new AC(); out = ctx.createGain(); out.gain.value = 0.22; out.connect(ctx.destination); } catch (e) { ctx = null; }
    },
    schedule(T, speed) {
      if (!ctx) return;
      if (nextN * BEAT < T - 0.02) nextN = Math.ceil((T - 0.02) / BEAT);
      while (nextN * BEAT < T + 0.12) {
        const when = ctx.currentTime + (nextN * BEAT - T) / speed, b = nextN % 3, [bass, chord] = BARS[Math.floor(nextN / 3) % 4];
        if (b === 0) play(string(bass), when, 0.9);
        else chord.forEach((fq, j) => play(string(fq), when + j * 0.014, b === 2 ? 0.34 : 0.2));
        nextN++;
      }
    },
    tap() {
      if (!ctx) return;
      if (!wood) {
        const sr = ctx.sampleRate, n = Math.floor(sr * 0.09);
        wood = ctx.createBuffer(1, n, sr);
        const d = wood.getChannelData(0);
        for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (sr * 0.012));
      }
      play(wood, ctx.currentTime, 1.4, 640);
    },
    close() { try { if (ctx) ctx.close(); } catch (e) { /* already closed */ } ctx = null; },
  };
}

function watchNarrow(root) {
  // under a 600px stage, game type is ×1.5 (sizes the hit areas never use)
  const setNarrow = () => root.classList.toggle('gs-narrow', root.clientWidth > 0 && root.clientWidth < 600);
  const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(setNarrow) : null;
  if (ro) ro.observe(root);
  setNarrow();
  return ro;
}

// ---- act one, *Sojourn*: the studio as it was, now recording itself through api.record ----
function mountSojourn(stage, api) {
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
  if (RM && svg.pauseAnimations) svg.pauseAnimations();
  const ro = watchNarrow(root);
  const record = typeof api.record === 'function' ? (type, data) => api.record(type, data) : null;
  const S = core(svg, svg, uid, { api, RM, record });
  let raf = 0, last = null;
  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (last === null) last = now;
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000)) * SPEED;
    last = now;
    S.advance(dt);
  }
  raf = requestAnimationFrame(frame);
  return () => {
    cancelAnimationFrame(raf);
    if (ro) ro.disconnect();
    S.cleanup();
    root.remove();
  };
}

// ---- act two, *Burial*: the mirror studio ----
function mountBurial(stage, api) {
  const RM = !!api.reducedMotion;
  const SPEED = Number(api.speed) > 0 ? Number(api.speed) : 1;
  const uid = 'gm' + Math.random().toString(36).slice(2, 8);
  C.autoLace();
  const root = document.createElement('div');
  root.className = 'g-studio g-mirror sh-grain' + (RM ? ' sh-still' : '');
  const style = document.createElement('style');
  style.textContent = css(uid) + mirrorCss(uid);
  root.appendChild(style);
  root.insertAdjacentHTML('beforeend',
    `<svg viewBox="0 0 960 640" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Under the studio: Madeline in the vault; above the boards, the studio as light, and your hand.">${C.defs()}${mirrorScene(uid)}</svg>`);
  stage.appendChild(root);
  const svg = root.querySelector('svg');
  const $ = s => svg.querySelector(s);
  if (RM && svg.pauseAnimations) svg.pauseAnimations();
  const ro = watchNarrow(root);
  const el = (tag, attrs, parent) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };

  // the studio above, replaying act one; Roderick's pose can be taken over (the break, the KNOCK)
  let poseOverride = null;
  const S = core(svg, $('.gm-room'), uid, { api, RM, replay: true, pose: () => poseOverride });
  const calmFig = S.poses.calm.querySelector('.sh-fig'), rodL = S.L.roderick;
  const handG = $('.gm-hand'), dotsP = $('.gm-dots'), ringP = $('.gm-ring'), warnP = $('.gm-warn'), chargeP = $('.gm-charge');
  const pulseP = $('.gm-pulse'), shaftP = $('.gm-shaft');
  const marks = $('[data-l="mmarks"]'), tapsL = $('[data-l="mtaps"]'), mfx = $('[data-l="mfx"]'), knockL = $('[data-l="mknock"]');
  const herG = $('[data-l="her"]'), herFig = herG.querySelector('.sh-fig');
  const teach = $('[data-mteach]'), hudT = $('[data-mhud]');
  const boardEls = [...svg.querySelectorAll('.gm-board')];
  const audio = makeWaltz(api.sound !== false);

  // ---- the ghost: your act one, or the fixture (a builder's real run) when it's missing or thin ----
  let G = null, synthetic = false, ready = false, dead = false;
  const hushCount = ev => (Array.isArray(ev) ? ev.filter(e => e && e.type === 'hush').length : 0);
  const given = api.ghost && Array.isArray(api.ghost.events) ? api.ghost : null;
  if (given && hushCount(given.events) >= 10) begin(given.events, !!given.synthetic);
  else {
    let url = 'ghost.json';
    try { url = new URL('./ghost.json', import.meta.url).href; } catch (e) { /* relative */ }
    fetch(url).then(r => (r.ok ? r.json() : Promise.reject(new Error('ghost ' + r.status))))
      .then(j => { if (!dead) begin(Array.isArray(j) ? j : j.events, true); })
      .catch(() => { if (!dead) begin(given ? given.events : [], true); });
  }
  function prepare(events) {
    const num = v => typeof v === 'number' && isFinite(v);
    const ev = (events || []).filter(e => e && typeof e === 'object');
    const ptr = ev.filter(e => e.type === 'ptr' && num(e.t) && num(e.x) && num(e.y)).map(e => ({ t: e.t, x: e.x, y: e.y, down: !!e.down })).sort((a, b) => a.t - b.t);
    const gest = ev.filter(e => e.type === 'gesture' && num(e.t0) && num(e.t1)).map(e => [e.t0, e.t1]);
    const hush = ev.filter(e => e.type === 'hush' && num(e.t) && !e.via).sort((a, b) => a.t - b.t);
    const taps = hush.filter(e => e.type === 'tap');
    const reacts = taps.map(e => e.react).filter(num).sort((a, b) => a - b), m = reacts.length;
    const median = m ? clamp(m % 2 ? reacts[(m - 1) / 2] : (reacts[m / 2 - 1] + reacts[m / 2]) / 2, 0.35, 1.2) : null;
    const knock = ev.find(e => e.type === 'knock' && num(e.t)) || null;
    const queue = hush.map(e => ({ t: e.t, k: e.type === 'tap' ? 'tap' : 'hush', e }));
    if (knock) queue.push({ t: knock.t, k: 'knock', e: knock });
    queue.sort((a, b) => a.t - b.t);
    return { ptr, gest, median, knock, queue, n: taps.length + (knock && knock.result === 'hushed' ? 1 : 0) };
  }
  function begin(events, synth) {
    G = prepare(events);
    synthetic = synth;
    ready = true;
    if (synthetic) say('someone');
    say('third');
  }
  function pathAt(t) {
    const P = G.ptr;
    if (!P.length) return null;
    if (t <= P[0].t) return P[0];
    if (t >= P[P.length - 1].t) return P[P.length - 1];
    let lo = 0, hi = P.length - 1;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (P[m].t <= t) lo = m; else hi = m; }
    const a = P[lo], b = P[hi], k = (t - a.t) / ((b.t - a.t) || 1);
    return { x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), down: a.down };
  }
  const screenAt = t => { const p = pathAt(t); return p && { x: p.x, y: Math.min(HAND_Y_MAX, mapY(p.y)) }; };
  const busyAt = t => G.gest.some(([a, b]) => t >= a && t <= b);

  // ---- state ----
  let T = 0, last = null, raf = 0;
  let heard = 0, hushedN = 0, broke = false, knockState = 'none';
  let lag = 0, stallUntil = -1, stallPos = null, rejoin = null;
  let stillUntil = -1, lastTapT = -9;
  let herX = 480, herTarget = 480;
  let lean = 0;
  let taps = [], fxs = [];
  let hand = null, free = false, dart = null;
  let qi = 0;
  let K = null, hold = null, knockUsed = false;
  let ending = false, endClock = 0, doneSent = false;
  let hot = null;
  const visits = Array(8).fill(0);
  const said = {}, lineQ = [];
  let lineT = -9;
  function say(key) { if (said[key]) return; said[key] = true; lineQ.push(LINES[key]); }
  function addFx(node, life, update) { fxs.push({ node, t0: T, life, update }); }

  // ---- her taps ----
  function herTap(board) {
    const v = visits[board]++;
    const x = BOARD_CX(board) + [0, -28, 28, -14, 14][v % 5];
    const tap = { board, x, born: T, beat3: onBeat3(T), alive: true };
    tap.node = el('text', { class: 'gm-tap', x, y: 228, 'text-anchor': 'middle' }, tapsL);
    tap.node.textContent = 'tap.';
    taps.push(tap);
    herTarget = BOARD_CX(board);
    audio.tap();
    if (G.median === null) say('never');
  }
  function fadeOut(node, life) { addFx(node, life, k => { node.style.opacity = 1 - k; }); }
  function hushTap(tap) {                    // your hand got there first
    if (!tap.alive) return;
    tap.alive = false;
    hushedN++;
    const g = el('g', { transform: `translate(${f(tap.x)} 220) rotate(${(hushedN * 37) % 60 - 30})` }, marks);
    el('path', { class: 'gm-whorl', d: 'M-1.6 0a1.6 2.2 0 1 0 3.2 0a1.6 2.2 0 1 0-3.2 0M-4.4 0a4.4 5.8 0 1 0 8.8 0a4.4 5.8 0 1 0-8.8 0M-7.4 1a7.4 9.4 0 1 1 14.8 0' }, g);
    fadeOut(tap.node, 0.25);
    stillUntil = T + BAR;                    // a hush stills her for one bar, as act one's froze the room
    say('hand');
  }
  function expire(tap) {
    tap.alive = false;
    if (tap.beat3) {                         // heard: unhushed and on beat three
      heard++;
      const n = heard - 1, x = tap.board * 120 + 12 + (n % 10) * 9;
      el('path', { class: 'gm-tick', d: `M${x} ${CEIL + 30}L${x + 4} ${CEIL + 18}` }, marks);
      say('hand'); say('heard');               // the learn lines keep their order
      fadeOut(tap.node, 0.6);
      if (heard === 3 && !broke) breakRecording();
    } else {                                 // explained: the guest's black italic
      settle(tap.board);
      fadeOut(tap.node, 0.4);
    }
  }
  function settle(board) {
    const t = el('text', { class: 'gm-settle', x: BOARD_CX(board), y: 274, 'text-anchor': 'middle' }, mfx);
    t.textContent = SETTLE;
    addFx(t, 1.8, k => { t.style.opacity = k < 0.6 ? 1 : 1 - (k - 0.6) / 0.4; if (!RM) t.setAttribute('transform', `translate(0 ${f(k * 8)})`); });
  }
  function breakRecording() {                // the third heard tap breaks the recording
    broke = true;
    dart = null;
    stallPos = hand ? { ...hand } : null;
    stallUntil = T + 2 * BAR;
    lag = 0.5;
    poseOverride = 'startled';               // Roderick lifts his face
  }

  // ---- her KNOCK (the turn) ----
  function launchKnock(board) {
    knockUsed = true;
    K = { board, x0: BOARD_CX(board), t0: T, alive: true, dart: false };
    K.wrap = el('g', { class: 'gm-knockw' }, knockL);
    K.node = el('text', { class: 'gm-knock', 'text-anchor': 'middle' }, K.wrap);
    K.node.textContent = 'KNOCK.';
    drawKnock();
  }
  function knockPos() {
    const k = ease(clamp((T - K.t0) / RISE, 0, 1));
    return { x: lerp(K.x0, MFACE.x, k), y: lerp(232, MFACE.y + 20, k), size: 44 + 30 * k };
  }
  function drawKnock() {
    const p = knockPos();
    K.node.setAttribute('x', f(p.x)); K.node.setAttribute('y', f(p.y)); K.node.setAttribute('font-size', f(p.size));
  }
  function hushKnock() {
    if (!K || !K.alive) return;
    K.alive = false;
    knockState = 'hushed';
    fadeOut(K.wrap, 0.4);
    endMirror();
  }
  function endMirror() {
    if (ending) return;
    ending = true;
    endClock = 0;
    hold = null;
    chargeP.setAttribute('d', '');
    if (knockState === 'heard') poseOverride = 'startled';
  }
  function finish() {
    if (doneSent) return;
    doneSent = true;
    const res = { heard, hushed: hushedN, broke, knock: knockState };
    try { if (api.setFlag) api.setFlag('mirrorStudio', res); } catch (e) { /* the spine owns flags */ }
    const n = api.state && typeof api.state.tapsHushed === 'number' ? api.state.tapsHushed : G.n;
    const times = c => (c === 1 ? 'once' : `${c} times`);
    const line = knockState === 'heard' ? `she knocked ${times(n + heard + 1)}. The last one he heard.`
      : heard > 0 ? `she knocked ${times(n + heard)}. He heard ${heard}.`
        : 'she knocked, and you hushed her twice.';
    try { if (api.rewrite) api.rewrite('taps hushed', line); } catch (e) { /* the spine owns the Account */ }
    if (api.done) api.done({ won: heard >= 3 || knockState === 'heard', score: { 'taps heard': heard } });
  }

  // ---- your hand, on the recording's time (behind by `lag` once it breaks) ----
  function updateHand() {
    const tr = T - lag, path = screenAt(tr);
    free = false;
    if (!path) { hand = null; return; }
    if (T < stallUntil && stallPos) { hand = stallPos; return; }
    if (stallPos && !rejoin) { rejoin = { from: stallPos, t0: T }; stallPos = null; }
    if (dart) {
      const tgt = dart.target === K ? knockPos() : { x: dart.target.x, y: CEIL + 14 };
      if (!dart.target.alive && !dart.done) { dart = null; hand = path; return; }
      if (T < dart.t0) hand = path;
      else if (T < dart.land) {
        if (!dart.from) dart.from = hand ? { ...hand } : path;
        const k = ease((T - dart.t0) / Math.max(0.01, dart.land - dart.t0));
        hand = RM ? path : { x: lerp(dart.from.x, tgt.x, k), y: lerp(dart.from.y, tgt.y, k) };
      } else if (!dart.done) {
        dart.done = true; dart.back = T; dart.at = { x: tgt.x, y: tgt.y }; hand = dart.at;
        if (dart.target === K) hushKnock(); else hushTap(dart.target);
      } else {
        const k = (T - dart.back) / 0.35;
        if (k >= 1) { dart = null; hand = path; } else hand = RM ? dart.at : { x: lerp(dart.at.x, path.x, ease(k)), y: lerp(dart.at.y, path.y, ease(k)) };
      }
      return;
    }
    if (rejoin) {
      const k = (T - rejoin.t0) / 0.4;
      if (k >= 1 || RM) rejoin = null; else { hand = { x: lerp(rejoin.from.x, path.x, ease(k)), y: lerp(rejoin.from.y, path.y, ease(k)) }; return; }
    }
    hand = path;
    free = !busyAt(tr);
  }
  function scheduleDarts() {
    if (!hand || !free || dart || G.median === null || ending) return;
    const react = T < LEARN_END ? Math.min(1.15, G.median * 1.3) : G.median;   // slow while she learns
    if (K && K.alive && !K.dart) {
      const p = knockPos();
      if (Math.hypot(p.x - hand.x, p.y - hand.y) <= KNOCK_R && T + react < K.t0 + RISE) {
        K.dart = true; dart = { target: K, land: T + react, t0: T + react - 0.24 };
        return;
      }
    }
    for (const tap of taps) {
      if (!tap.alive || tap.dart) continue;
      if (Math.hypot(tap.x - hand.x, CEIL + 14 - hand.y) > DART_R) continue;
      const land = Math.max(tap.born + react, T + 0.24);
      if (land > tap.born + TAP_LIFE) continue;
      tap.dart = true; dart = { target: tap, land, t0: land - 0.24 };
      return;
    }
  }
  function pressBoard(board) {               // your recorded hand hushes on its old timings
    if (dart || T < stallUntil || !hand) return;
    const tap = taps.find(t => t.alive && t.board === board);
    if (tap) hushTap(tap);
  }
  function slam() {                          // act one hushed its knock: the hand comes down at that time
    if (!K || !K.alive || !hand) return;
    const p = knockPos();
    if (Math.hypot(p.x - hand.x, p.y - hand.y) > SLAM_R) return;
    K.dart = true; dart = { target: K, land: T + 0.14, t0: T };
  }

  // ---- per frame ----
  function step(dt) {
    const tr = T - lag;
    while (qi < G.queue.length && G.queue[qi].t <= tr + dt * 0.5) {
      const q = G.queue[qi++];
      if (q.k === 'hush') S.replayHush(q.e);
      else if (q.k === 'tap') { S.replayTapHush(); pressBoard(q.e.board); }
      else { S.replayKnock(q.e.result); if (q.e.result === 'hushed') slam(); }
    }
    updateHand();
    scheduleDarts();
    for (const tap of taps) if (tap.alive && T - tap.born >= TAP_LIFE) expire(tap);
    taps = taps.filter(t => t.alive || t.node.isConnected);
    if (K && K.alive) {
      drawKnock();
      if (T - K.t0 >= RISE) { K.alive = false; knockState = 'heard'; endMirror(); }
    }
    if (hold && !knockUsed) hold.charged = T - hold.t0 >= BAR;
    if (T >= stallUntil && poseOverride === 'startled' && broke && !ending) poseOverride = null;
    if (T > 20) say('hand');
    if (T >= TURN_AT) say('turn');
    if (T >= TURN_END && !(K && K.alive) && (!hold || T >= TURN_END + BAR)) endMirror();
  }
  function render(dt) {
    // lines: one at a time, each held a moment
    if (lineQ.length && T - lineT >= 2.6) { teach.textContent = lineQ.shift(); lineT = T; }
    teach.style.opacity = RM ? 1 : f(clamp((T - lineT) / 0.4, 0, 1));
    // the beat: Roderick's arm and the boards, brightest on beat three (reduced motion: a still lamp change)
    const { b, ph } = beatAt(T), amp = b === 2 ? 1 : 0.42, k = ending ? 0.3 : RM ? amp : amp * Math.exp(-ph / 0.22);
    pulseP.style.opacity = Math.min(1, 0.22 + 0.78 * k).toFixed(2);
    shaftP.style.opacity = (0.28 + 0.5 * k).toFixed(2);
    C.hinge(calmFig, '.sh-arm', RM || ending ? 0 : -(b === 2 ? 24 : 12) * k);
    // his head dips a notch for each tap he hears; after the break he lifts his face
    const target = broke ? -6 : Math.min(3, heard) * 2.5;
    lean = RM ? target : lean + Math.sign(target - lean) * Math.min(Math.abs(target - lean), 12 * dt);
    rodL.setAttribute('transform', `rotate(${f(lean)} 466 400)`);
    // Madeline glides (never bobs) under the board she knocked; a hush stills her
    herX = RM ? herTarget : herX + Math.sign(herTarget - herX) * Math.min(Math.abs(herTarget - herX), 30 * dt);
    C.place(herFig, herX, VFLOOR);
    herG.style.opacity = T < stillUntil ? 0.35 : 1;
    // the hand, its next second dotted ahead, a faint ring while it listens
    if (hand) {
      handG.style.display = '';
      handG.setAttribute('transform', `translate(${f(hand.x)} ${f(hand.y)}) rotate(22) scale(1.25 -1.25)`);
      let d = '';
      const tr = T - lag, torn = T < stallUntil;
      if (!ending) for (let i = 1; i <= 10; i++) {
        const p = screenAt(tr + i * 0.1);
        if (!p) break;
        const jx = torn ? Math.sin(i * 12.9 + T * 3) * 26 * (T - (stallUntil - 2 * BAR)) : 0, jy = torn ? Math.cos(i * 7.3 + T * 2) * 14 * (T - (stallUntil - 2 * BAR)) : 0;
        if (torn && i % 3 === 0) continue;
        d += dot(p.x + jx, p.y + jy, Math.max(0.8, 2.4 - i * 0.14));
      }
      dotsP.setAttribute('d', d);
      dotsP.style.opacity = T < stallUntil ? Math.max(0, 1 - (T - (stallUntil - 2 * BAR)) / (2 * BAR)).toFixed(2) : 0.75;
      let r = '';
      if (free && !ending) for (let i = 0; i < 12; i++) { const a = i * PI / 6; r += dot(hand.x + Math.cos(a) * 26, hand.y + Math.sin(a) * 26, 1.6); }
      ringP.setAttribute('d', r);
      // the slam warning: act one hushed its knock here, at this time
      let w = '';
      if (G.knock && G.knock.result === 'hushed' && !ending) {
        const dtk = G.knock.t - (T - lag);
        if (dtk > 0 && dtk < 1.4) { const p = screenAt(G.knock.t); if (p) for (let i = 0; i < 10; i++) { const a = i * PI / 5 + T * (RM ? 0 : 1.5); w += dot(p.x + Math.cos(a) * 36, p.y + Math.sin(a) * 36, 3.2); } }
      }
      warnP.setAttribute('d', w);
    } else { handG.style.display = 'none'; dotsP.setAttribute('d', ''); ringP.setAttribute('d', ''); warnP.setAttribute('d', ''); }
    // the KNOCK, charging: a ring of lamp dots fills over a bar
    if (hold && !knockUsed && !ending) {
      const n = Math.min(12, Math.floor(12 * (T - hold.t0) / BAR)), cx = BOARD_CX(hold.board);
      let c = '';
      for (let i = 0; i < n; i++) { const a = -PI / 2 + i * PI / 6; c += dot(cx + Math.cos(a) * 34, CEIL + 20 + Math.sin(a) * 34, hold.charged ? 3 : 2.2); }
      chargeP.setAttribute('d', c);
    } else chargeP.setAttribute('d', '');
    // her taps, alive
    for (const tap of taps) if (tap.alive) tap.node.style.opacity = clamp((T - tap.born) / 0.12, 0, 1).toFixed(2);
    for (const e of [...fxs]) {
      const k = clamp((T - e.t0) / e.life, 0, 1);
      e.update && e.update(k);
      if (k >= 1) { fxs = fxs.filter(q => q !== e); e.node.remove(); }
    }
    hudT.textContent = 'HEARD ' + '●'.repeat(Math.min(3, heard)) + '○'.repeat(Math.max(0, 3 - heard)) + (heard > 3 ? ' ' + heard : '');
  }
  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (last === null) last = now;
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000)) * SPEED;
    last = now;
    if (!ready) return;
    if (!ending) {
      T += dt;
      step(dt);
      S.advance(dt);
      audio.schedule(T, SPEED);
    } else {
      endClock += dt;
      if (endClock >= TABLEAU) finish();
    }
    render(dt);
  }

  // ---- input: tap a board (anywhere in its column below the light); in the turn, hold one for a bar ----
  function toSvg(e) {
    const m = svg.getScreenCTM();
    if (!m) return { x: -1, y: -1 };
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    return { x: p.x, y: p.y };
  }
  const boardAt = pt => (pt.y < CEIL - 30 || pt.x < 0 || pt.x > 960 ? -1 : clamp(Math.floor(pt.x / 120), 0, 7));
  function onDown(e) {
    if (!ready || ending || (e.button !== undefined && e.button > 0)) return;
    const b = boardAt(toSvg(e));
    if (b < 0) return;
    e.preventDefault();
    if (e.isTrusted) audio.start();
    if (T < stillUntil || T - lastTapT < 0.25) return;
    lastTapT = T;
    herTap(b);
    if (T >= TURN_AT && T < TURN_END && !knockUsed) {
      hold = { board: b, t0: T, id: e.pointerId, charged: false };
      try { svg.setPointerCapture(e.pointerId); } catch (err) { /* synthetic pointers */ }
    }
  }
  function onUp(e) {
    if (!hold || e.pointerId !== hold.id) return;
    const h = hold;
    hold = null;
    if (!h.charged || knockUsed || ending) return;
    if (onBeat3(T)) launchKnock(h.board); else settle(h.board);   // off the beat, it's only the house
  }
  function onMove(e) {
    if (e.pointerType !== 'mouse') return;
    const b = boardAt(toSvg(e)), t = b >= 0 && !ending ? boardEls[b] : null;
    if (hot === t) return;
    if (hot) hot.classList.remove('is-hot');
    hot = t;
    if (hot) hot.classList.add('is-hot');
  }
  const onLeave = () => { if (hot) hot.classList.remove('is-hot'); hot = null; };
  const noMenu = e => e.preventDefault();
  boardEls.forEach(g => g.classList.add('touch'));
  svg.addEventListener('pointerdown', onDown);
  svg.addEventListener('pointerup', onUp);
  svg.addEventListener('pointercancel', onUp);
  svg.addEventListener('pointermove', onMove);
  svg.addEventListener('pointerleave', onLeave);
  svg.addEventListener('contextmenu', noMenu);

  raf = requestAnimationFrame(frame);
  return () => {
    dead = true;
    cancelAnimationFrame(raf);
    if (ro) ro.disconnect();
    svg.removeEventListener('pointerdown', onDown);
    svg.removeEventListener('pointerup', onUp);
    svg.removeEventListener('pointercancel', onUp);
    svg.removeEventListener('pointermove', onMove);
    svg.removeEventListener('pointerleave', onLeave);
    svg.removeEventListener('contextmenu', noMenu);
    audio.close();
    S.cleanup();
    root.remove();
  };
}

export default {
  id: 'studio',
  title: 'The Cheerfulness of My Society',
  // api.mode: 'sojourn' (act one, recording) or 'burial' (act two, the mirror studio). Absent means act one.
  mount(stage, api = {}) {
    return api.mode === 'burial' ? mountBurial(stage, api) : mountSojourn(stage, api);
  },
};
