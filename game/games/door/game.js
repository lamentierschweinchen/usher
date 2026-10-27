// II. A Mere Different Arrangement: the door.
// A sliding-stone puzzle played from the hole. You think you're mending the house;
// you're walking her to the door. Spec: work/design/games/door.md
// Look: Shadow Theatre (work/design/LOOK.md). The façade is black cut paper held up against
// the chapter's violet light: windows are lamplight through cuts, the joints are hairlines of
// light, the gap is the light behind the house. The tarn returns it all as a negative; the
// crack and Madeline are its truths. Shapes from ../../shared/cuts.js; styles scoped to .g-door.

import * as C from '../../shared/cuts.js';

const NS = 'http://www.w3.org/2000/svg';
const H = 640, CW = 120, CH = 90, GX = 180, GY = 50, WL = 320;
const DOOR = 12;
const HOME  = ['cL', 'attic', 'oculus', 'attic', 'cR', 'plain', 'tall', 'crest', 'tall', 'plain', 'plain', 'small', 'DOOR', 'small', 'plain'];
const START = ['cL', 'attic', null, 'oculus', 'attic', 'plain', 'crest', 'tall', 'plain', 'cR', 'plain', 'tall', 'small', 'small', 'plain'];
const MAIN  = [2, 3, 4, 9, 8, 7, 6, 11, 12];
const CRACK = [[2, 3], [3, 4], [4, 9], [9, 8], [8, 7], [7, 6], [6, 11], [11, 12]];
const STUBS = [[2, 1], [9, 14], [6, 5]];
const SHORT = [[8, 13], [13, 12]];
const WORDS = ['grind.', 'scrape.', 'chock.', 'grate.', 'thud.', 'rasp.', 'clunk.', 'grind.'];
const DIRS = { L: [-1, 0], R: [1, 0], U: [0, -1], D: [0, 1] };
const JAGS = [
  [[.28, 7], [.55, -8], [.8, 5]],
  [[.3, -6], [.52, 7], [.78, -6]],
  [[.33, 6], [.66, -7]],
  [[.25, -7], [.5, 6], [.74, -4]],
  [[.4, 8], [.7, -5]],
  [[.3, -5], [.6, 7], [.82, -3]],
];
// out of place, a stone sits a little askew: [dx, dy, degrees]
const ASKEW = [[1.5, -1, 1.6], [-1, 1.5, -2.1], [1, 1, 1.3], [-1.5, -1, -1.5], [1, 1.5, 2.2], [-1, -1.5, -1.8], [1.5, 1, 1.4],
  [-1.5, 1, -2.3], [1, -1.5, 1.9], [-1, 1, -1.2], [1.5, -1.5, 2], [-1, -1, -1.7], [1, 1, 1.5], [-1.5, 1.5, -2]];
const MIRROR = 'matrix(1 0 0 -1 0 640)';      // this game's tarn is an exact mirror about y=320 (dragging her depends on it)
const DROP = 36;                               // the whole picture sits 36 units lower, so the house's roof fits under the proscenium
const ROOF_S = .64;                            // the library's gable and turrets, at this scale
const IDLE = 15000;                            // once the player has moved, the house steps in after 15 s without a move
const HINT_FIRST = 2500, HINT_EVERY = 9000;    // before that it only leans (she tips toward the next step, the stone gives), never moves
const HOLD = 3000;                             // the open door, her in it, held before done
const HER_SCALE = 1.95;                        // Madeline in the water: 86 tall, the most her 90-unit cell holds below the waterline

const col = i => i % 5, row = i => (i / 5) | 0;
const cellX = i => GX + CW * col(i), cellY = i => GY + CH * row(i);
const midX = i => cellX(i) + CW / 2, midY = i => cellY(i) + CH / 2;
const feetY = i => H - cellY(i) - 3;            // her feet, in the hole's mirrored cell
const key = (a, b) => (a < b ? a + '-' + b : b + '-' + a);
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const easeOut = k => 1 - (1 - k) * (1 - k);
const easeInOut = k => (k < .5 ? 2 * k * k : 1 - (2 - 2 * k) ** 2 / 2);
const linear = k => k;
const f1 = n => (Math.round(n * 10) / 10).toString();
const f2 = n => { const v = Math.round(n * 100) / 100; return (v === 0 ? 0 : v).toString(); };
function neighbour(i, d) {
  const [dx, dy] = DIRS[d], c = col(i) + dx, r = row(i) + dy;
  return c < 0 || c > 4 || r < 0 || r > 2 ? null : r * 5 + c;
}

// ---------- the stones: black paper in a 120×90 cell, light through the cuts ----------
// Every stone is cut 3 units short of its neighbours, so the joints are hairlines of light;
// a stone out of place sits askew and lets a wedge of light through.
const LIT = 'style="fill:var(--lit,url(#sh-lamp))"';            // lamplight through a cut; dark glass in the tarn
const THREAD = 'style="fill:none;stroke:var(--lit,#f7d894);stroke-width:1.3;stroke-linecap:round;stroke-linejoin:round;opacity:.85"';
const BODY = '<path d="M1.5 1.5H118.5V88.5H1.5Z"/>';
const circ = (x, y, r) => `M${f1(x - r)} ${f1(y)}a${r} ${r} 0 1 0 ${f1(2 * r)} 0a${r} ${r} 0 1 0 ${f1(-2 * r)} 0`;
// the oculus: a rose, cut in the manner of the house's own rose window
function rose(cx, cy, r) {
  let s = `<circle cx="${cx}" cy="${cy}" r="${r}" ${LIT}/><circle cx="${cx}" cy="${cy}" r="${f1(r * .23)}"/>`;
  for (let k = 0; k < 8; k++) {
    const a = k * Math.PI / 4;
    s += `<path d="M${f1(cx + Math.cos(a) * r * .17)} ${f1(cy + Math.sin(a) * r * .17)}L${f1(cx + Math.cos(a) * r)} ${f1(cy + Math.sin(a) * r)}" style="stroke:currentColor;stroke-width:${f1(r / 10)}"/>` +
      `<path d="${circ(cx + Math.cos(a + Math.PI / 8) * r * .71, cy + Math.sin(a + Math.PI / 8) * r * .71, f1(r / 10))}"/>`;
  }
  return s + `<circle cx="${cx}" cy="${cy}" r="${r}" style="fill:none;stroke:currentColor;stroke-width:${f1(r / 7)}"/>`;
}
// the cornice corner: a projecting ledge, a frieze of lit dentils, quoins, lace curling off the outer corner
function cornice() {
  let dent = '';
  for (let x = 8; x <= 112; x += 8) dent += `M${x} 15h3.2v5.4h-3.2z`;
  return '<path d="M-7 -1.5H118.5V11H-7Z"/><path d="M-4 24H1.5V42H-4ZM-4 50H1.5V68H-4ZM-4 76H1.5V88.5H-4Z"/>' + BODY +
    `<path d="${dent}" ${LIT}/><path d="M6 27H112" ${THREAD}/>` +
    C.curl(-7, 1, Math.PI + .25, 15, -.9, 2.6, .4, 18) + C.curl(-7, 9, Math.PI / 2 + .55, 12, .95, 2.2, .35, 16) +
    C.curl(-4, 40, Math.PI - .2, 7, .9, 1.6, .3, 12) + C.curl(-4, 66, Math.PI - .2, 7, .9, 1.6, .3, 12);
}
const CHINKS = ['M74 30l5 7-3 6 4 5', 'M40 56l-4 6 3 5', 'M66 62l6-3 3 5', 'M50 24l4 6-2 5'];
const ART = {
  plain: v => BODY + `<path d="${CHINKS[v % 4]}" ${THREAD}/>`,
  cL: () => cornice(),
  cR: () => `<g transform="matrix(-1 0 0 1 120 0)">${cornice()}</g>`,
  attic: () => BODY + C.lancet(49, 18, 22, 52) + '<path d="M44 71H76V75H44Z"/>' + `<path d="${circ(32, 30, 2.6)}${circ(88, 30, 2.6)}" ${LIT}/>`,
  oculus: () => BODY + rose(60, 45, 27),
  tall: () => BODY + C.lancet(45, 7, 30, 77),
  crest: () => BODY +
    `<path d="M44 16H76V40Q76 60 60 71Q44 60 44 40Z" ${LIT}/>` +
    '<path d="M44 46L60 32L76 46V55L60 41L44 55Z"/><path d="M52 62L60 55L68 62L64 66L60 62.5L56 66Z"/><path d="M44 16H76V21H44Z"/>' +
    `<g ${LIT}>${C.curl(42, 22, Math.PI * .78, 24, -.75, 3.4, .5, 22)}${C.curl(78, 22, Math.PI * .22, 24, .75, 3.4, .5, 22)}` +
    `${C.curl(43, 46, Math.PI * .62, 18, -.9, 2.6, .4, 18)}${C.curl(77, 46, Math.PI * .38, 18, .9, 2.6, .4, 18)}</g>`,
  small: v => BODY + `<path d="M46 38H74V67H46Z" ${LIT}/><path d="M58.6 38h2.8v29h-2.8zM46 51.2h28v2.6H46z"/><path d="M42 67H78V71H42Z"/>` +
    `<path d="${v ? 'M88 20l4 5-2 4' : 'M30 70l-3 5 3 4'}" ${THREAD}/>`,
};
// the walled-up doorway at cell 12: a lintel with lit dentils, and light leaking round the bricked arch
const ARCH = 'M24 89V46Q24 25 60 18Q96 25 96 46V89';
const FRAME = `<path d="M-10 -9H130V11H-10Z"/><path d="${[...Array(13)].map((_, k) => circ(-1 + k * 10.2, 1, 1.9)).join('')}" ${LIT}/>` +
  C.curl(-10, -8, Math.PI + .3, 9, -.9, 2.2, .3, 14) + C.curl(130, -8, -.3, 9, .9, 2.2, .3, 14) +
  `<path d="${ARCH}" style="fill:none;stroke:var(--lit,#f7d894);stroke-width:1.6;stroke-linejoin:round;opacity:.8"/>`;
const DOORFACE = '<path d="M1.5 11H118.5V88.5H1.5Z"/>';

const CSS = `
.g-door{position:relative;width:100%;height:100%;overflow:hidden;container:gdoor/inline-size;font-family:var(--sh-serif);color:var(--sh-cut);
 background:var(--sh-cut);-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent;outline:none}
.g-door:focus-visible{outline:1px dashed rgba(247,216,148,.5);outline-offset:-6px}
.g-door:focus-visible .gd-gap{filter:url(#sh-rim)}
.g-door svg{display:block;width:100%;height:100%;touch-action:none}
.g-door .gd-gap rect,.g-door .gd-light,.g-door .gd-voids>rect{fill:url(#gdoor-panel)}
.g-door .gd-gap.is-hot rect,.g-door .gd-gap.is-held rect{fill:url(#gdoor-panel-hot)}
.g-door .gd-voids-b rect{fill:none}
.g-door .gd-edge{fill:none;stroke:var(--sh-return);stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round;opacity:.35;transition:stroke .4s,opacity .4s,stroke-width .4s}
.g-door .gd-edge.gd-stub{stroke-width:1.6}
.g-door .gd-edge.gd-walked{stroke:var(--sh-red);opacity:1;stroke-width:4.4}
.g-door .gd-glow path{fill:none;stroke:var(--sh-return);stroke-width:12;stroke-linecap:round;stroke-linejoin:round;opacity:0}
.g-door .gd-flare .gd-glow path{animation:gdoor-flare .6s ease-out}
@keyframes gdoor-flare{0%{opacity:0}18%{opacity:.5}100%{opacity:0}}
.g-door .gd-herw{--gauze:#fff6e0}
.g-door .gd-word{font-family:var(--sh-serif);font-style:italic;font-size:30px;fill:var(--sh-cut);pointer-events:none;animation:gdoor-word 1.5s linear forwards}
@keyframes gdoor-word{0%,60%{opacity:1}100%{opacity:0}}
.g-door.g-door-reduced .gd-word{animation:none}
.g-door .gd-smudge{animation:gdoor-smudge .3s ease-out}
@keyframes gdoor-smudge{0%{opacity:.4}100%{opacity:1}}
.g-door .gd-hit{fill:#000;fill-opacity:0;cursor:grab}
.g-door.gd-dragging,.g-door.gd-dragging *{cursor:grabbing}
.g-door.gd-ended .gd-hit{display:none}
.g-door .gd-fissure path{fill:none;stroke:var(--sh-red);stroke-linecap:round;stroke-linejoin:round;opacity:0;transition:opacity 1.4s ease-in}
.g-door .gd-fissure.gd-shown path{opacity:1}
.g-door .gd-in-door{opacity:0;transition:opacity 1s}
.g-door .gd-in-door.gd-shown{opacity:1}
.g-door .gd-doorway>g{opacity:0;transition:opacity .3s}
.g-door .gd-doorway>g.gd-shown{opacity:1}
.g-door .g-door-line{position:absolute;margin:0;left:calc(100cqw*32/960);top:calc(100cqw*58/960);white-space:nowrap;pointer-events:none;
 font-family:var(--sh-serif);font-style:italic;font-size:max(12px,calc(100cqw*23/960));line-height:1.22;color:var(--sh-paper);transition:opacity 2s}
.g-door .g-door-line.gd-gone,.g-door .gd-ribbon.gd-gone{opacity:0}
.g-door .g-door-end,.g-door .gd-ribbon-end{transition-duration:.8s}
.g-door .gd-ribbon{display:none;pointer-events:none;transition:opacity 2s}
.g-door .gd-ribbon text{font-family:var(--sh-serif);font-style:italic;font-size:38px;fill:var(--sh-paper)}
@container gdoor (max-width:600px){                 /* a phone: game type x1.5, the line on a ribbon over the glass */
 .g-door .g-door-line{display:none}
 .g-door .gd-ribbon{display:inline}
 .g-door .gd-word{font-size:45px}
}
@media (prefers-reduced-motion:reduce){.g-door .gd-word,.g-door .gd-smudge{animation:none}}
`;

export default {
  id: 'door',
  title: 'The Door',
  mount(stage, api = {}) {
    const reduced = !!api.reducedMotion;
    C.autoLace();                                  // phones: about half the lace (decided before any markup)
    const timers = new Set(), tweens = new Set();
    const later = (ms, fn) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); return t; };
    const cancel = t => { if (t != null) { clearTimeout(t); timers.delete(t); } };
    function tween(ms, fn, done, ease = easeInOut) {
      if (ms <= 0) { fn(1); if (done) done(); return null; }
      const h = { raf: 0, dead: false }, t0 = performance.now();
      const tick = now => {
        if (h.dead) return;
        const k = Math.min(1, (now - t0) / ms);
        fn(ease(k));
        if (k < 1) h.raf = requestAnimationFrame(tick);
        else { tweens.delete(h); if (done) done(); }
      };
      h.raf = requestAnimationFrame(tick); tweens.add(h);
      return h;
    }
    const kill = h => { if (h) { h.dead = true; cancelAnimationFrame(h.raf); tweens.delete(h); } };
    const mk = (tag, attrs, parent, html) => {
      const e = document.createElementNS(NS, tag);
      for (const k in attrs) e.setAttribute(k, attrs[k]);
      if (html) e.innerHTML = html;
      if (parent) parent.appendChild(e);
      return e;
    };
    const restart = (el, cls) => { el.classList.remove(cls); void el.getBoundingClientRect(); el.classList.add(cls); };

    // ---------- the scene ----------
    // the bank: a low mound and sedges at left (the teaching line has the sky above it), white trunks at right
    const BANK = '<path d="M14 320V308C44 302 84 303 122 309C146 313 164 317 178 320Z"/>' + C.sedges(18, 176, 318, { count: 34, h: [7, 19], seed: 7 }) +
      '<path d="M782 320C806 313 842 308 880 306C910 305 932 305 946 303V320Z"/>' +
      C.tree(842, 314, { h: 148, seed: 23, crown: 46, w: 4.6, lean: .05 }) + C.tree(878, 311, { h: 116, seed: 24, crown: 40, w: 4.2, lean: -.04 }) +
      C.tree(912, 309, { h: 168, seed: 25, crown: 52, w: 5, lean: -.08 }) + C.sedges(786, 944, 316, { count: 30, h: [6, 16], seed: 8, lean: -.05 });
    // the roof: the house's own gable and turrets from the cut library (C.shell, clipped to roof and spires), on a laced parapet
    const SHELL = C.shell({ crack: 0 });
    const part = (clip, x, y, ax, ay) => `<g transform="translate(${x} ${y}) scale(${ROOF_S}) translate(${-ax} ${-ay})"><g clip-path="url(#${clip})">${SHELL}</g></g>`;
    const ROOF = '<path d="M174 43H786V49.5H174Z"/>' + C.fringe(214, 746, 43.5, { seed: 5, len: [3, 7], step: 7.5, dir: -1, w: 1.4, dots: false }) +
      part('gdoor-cl-gable', 480, 49.5, 480, 177) + part('gdoor-cl-tl', 192, 49.5, 300, 167) + part('gdoor-cl-tr', 768, 49.5, 660, 167);
    const LAYER = `<g class="gd-bank" fill="currentColor">${BANK}</g><g class="gd-voids"></g><g class="gd-stones"></g><g class="gd-doorway"></g>` +
      `<g class="gd-frame" fill="currentColor" transform="translate(420 230)">${FRAME}</g><g class="gd-fissure"></g><g class="gd-roof" fill="currentColor">${ROOF}</g><g class="gd-words"></g>`;
    const MY_DEFS = `<defs>
<radialGradient id="gdoor-panel" gradientUnits="userSpaceOnUse" cx="480" cy="236" r="340"><stop offset="0" stop-color="#f1dbe4"/><stop offset=".5" stop-color="#bf9fbe"/><stop offset="1" stop-color="#7a5f97"/></radialGradient>
<radialGradient id="gdoor-panel-hot" gradientUnits="userSpaceOnUse" cx="480" cy="236" r="340"><stop offset="0" stop-color="#fdeec6"/><stop offset=".5" stop-color="#e6c79c"/><stop offset="1" stop-color="#b58d8e"/></radialGradient>
<linearGradient id="gdoor-deep" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".46"/><stop offset=".45" stop-color="#fff" stop-opacity=".24"/><stop offset=".85" stop-color="#fff" stop-opacity=".07"/></linearGradient>
<mask id="gdoor-depth" maskUnits="userSpaceOnUse" x="0" y="${WL}" width="960" height="${H - WL}"><rect x="0" y="${WL}" width="960" height="${H - WL}" fill="url(#gdoor-deep)"/></mask>
<clipPath id="gdoor-arch"><path d="${ARCH}Z"/></clipPath>
<clipPath id="gdoor-cl-gable"><path d="M290 182L480 74L670 182Z"/></clipPath>
<clipPath id="gdoor-cl-tl"><rect x="262" y="40" width="74" height="127"/></clipPath><clipPath id="gdoor-cl-tr"><rect x="624" y="40" width="74" height="127"/></clipPath>
<radialGradient id="gdoor-roofglow" gradientUnits="userSpaceOnUse" cx="480" cy="46" r="420" gradientTransform="translate(480 46) scale(1 .32) translate(-480 -46)"><stop offset="0" stop-color="#f0d2dc" stop-opacity=".8"/><stop offset=".5" stop-color="#a787b0" stop-opacity=".34"/><stop offset="1" stop-color="#a787b0" stop-opacity="0"/></radialGradient></defs>`;
    // the tarn returns the house as light: the library's returned(), on this game's exact mirror and waterline
    const reflection = C.returned(`<g class="gd-below">${LAYER.replace('"gd-voids"', '"gd-voids gd-voids-b"')}</g>`, { still: true, transform: MIRROR })
      .replace('url(#sh-depth)', 'url(#gdoor-depth)');

    const root = document.createElement('div');
    root.className = 'g-door' + (reduced ? ' g-door-reduced sh-still' : '');
    root.tabIndex = 0;
    root.innerHTML = `<style>${CSS}</style>
<svg viewBox="0 0 960 640" role="img" aria-label="The façade of the House of Usher, cut in black paper against violet light, its stones out of order around a lit gap. In the dark tarn below, the house comes back as light, cracked in red, and a pale figure stands upright in the gap's reflection. Drag the gap, or her.">
${C.defs({ animate: false })}${MY_DEFS}
<g class="gd-view" transform="translate(0 ${DROP})">
${C.backdrop('door', { y: -DROP, h: WL + DROP })}
<rect x="0" y="${-DROP}" width="960" height="${GY + DROP + 12}" fill="url(#gdoor-roofglow)"/>
${C.clouds(164, 150, { xEnd: 150, seed: 44, r: [14, 26], fill: '#0d0a14', opacity: .9 }).replace('<path', `<path transform="translate(0 ${-DROP})"`)}
<rect class="gd-light" x="${GX}" y="${GY}" width="${5 * CW}" height="${3 * CH}"/>
${C.glass('door', { y: WL, h: H - WL })}
${reflection}
<g class="gd-crack"><g class="gd-glow"></g><g class="gd-lines"></g></g>
<g class="gd-herw" filter="url(#sh-glow)"></g>
<g class="gd-above" style="color:var(--sh-cut)">${LAYER}</g>
<rect class="gd-hit"/><rect class="gd-hit"/>
</g>
<g class="gd-ribbon">${C.banner({ x: 40, y: DROP + WL + 4, w: 880, h: 52, line: '' })}<text x="480" y="${DROP + WL + 40}" text-anchor="middle">A mere different arrangement of the particulars.</text></g>
<g class="gd-ribbon gd-ribbon-end gd-gone">${C.banner({ x: 40, y: 568, w: 880, h: 52, line: '' })}<text class="gd-end-text" x="480" y="604" text-anchor="middle"></text></g>
${C.frame()}
</svg>
<p class="g-door-line"><i>A mere different <br>arrangement of <br>the particulars.</i></p>
<p class="g-door-line g-door-end gd-gone" aria-live="polite"><i></i></p>`;
    stage.appendChild(root);
    const svg = root.querySelector('svg'), view = svg.querySelector('.gd-view');
    const line = root.querySelector('.g-door-line'), ribbon = svg.querySelector('.gd-ribbon');
    const endLine = root.querySelector('.g-door-end'), endRibbon = svg.querySelector('.gd-ribbon-end');
    const layer = side => {
      const g = svg.querySelector('.gd-' + side), q = s => g.querySelector('.gd-' + s);
      return { voids: q('voids'), stones: q('stones'), doorway: q('doorway'), fissure: q('fissure'), words: q('words') };
    };
    const A = layer('above'), B = layer('below');
    const crackG = svg.querySelector('.gd-crack'), glowG = svg.querySelector('.gd-glow'), linesG = svg.querySelector('.gd-lines');
    const [hitHole, hitHer] = svg.querySelectorAll('.gd-hit');

    // ---------- state ----------
    let hole = 2, lastFrom = null, grown = false, ended = false, doneSent = false;
    let playerMoves = 0, houseMoves = 0, wordN = 0;
    let drag = null, nudged = null, leaning = null, idleT = null, hintT = null;
    const grid = new Array(15).fill(null);
    const edges = new Map();
    const walkOrder = [];
    const words = [];

    // stones
    const seen = {};
    let n = 0;
    START.forEach((type, i) => {
      if (!type) return;
      const v = seen[type] = (seen[type] ?? -1) + 1, html = ART[type](v);
      const [ax, ay, ar] = ASKEW[n++];
      const s = { type, x: cellX(i), y: cellY(i), nx: 0, ny: 0, k: type === HOME[i] ? 0 : 1, wob: 0, ax, ay, ar, tw: {} };
      s.g = mk('g', { class: 'gd-stone', fill: 'currentColor' }, A.stones, html);
      s.gR = mk('g', { class: 'gd-stone', fill: 'currentColor' }, B.stones, html);
      grid[i] = s; drawStone(s);
    });
    function drawStone(s) {
      const t = `translate(${f1(s.x + s.nx + s.k * s.ax)} ${f1(s.y + s.ny + s.k * s.ay)}) rotate(${f1(s.k * s.ar + s.wob)} 60 45)`;
      s.g.setAttribute('transform', t); s.gR.setAttribute('transform', t);
    }
    const raise = s => { s.g.parentNode.appendChild(s.g); s.gR.parentNode.appendChild(s.gR); };

    // the hole: the light behind the house, where a stone is missing (dark glass in the tarn)
    const gap = mk('g', { class: 'gd-gap touch' }, A.voids);
    const voidRect = parent => mk('rect', { class: 'gd-void', width: CW, height: CH }, parent);
    const voids = [voidRect(gap), voidRect(B.voids)];
    function placeVoid(i) { for (const v of voids) { v.setAttribute('x', cellX(i)); v.setAttribute('y', cellY(i)); } }
    function tempVoid(i, ms) {
      const pair = [voidRect(A.voids), voidRect(B.voids)];
      for (const v of pair) { v.setAttribute('x', cellX(i)); v.setAttribute('y', cellY(i)); }
      later(ms, () => pair.forEach(v => v.remove()));
    }
    placeVoid(hole);

    // her: Madeline, upright in the hole's reflection, bright (the tarn's truth)
    const herW = svg.querySelector('.gd-herw');
    herW.innerHTML = C.figure('madeline', { scale: HER_SCALE, faint: false, cls: 'touch gd-her' });
    const herEl = herW.firstElementChild, herPose = herEl.querySelector('.sh-pose');
    const her = { x: midX(hole), y: feetY(hole), ox: 0, oy: 0, bob: 0, lean: 0, wob: 0, face: 1, sx: -1, tw: {} };
    function drawHer() {                       // the cut faces right; face 1 is left, so the pose mirrors it
      C.place(herEl, her.x + her.ox, her.y + her.oy + her.bob);
      herPose.setAttribute('transform', `rotate(${f1(her.lean + her.wob)}) scale(${f2(her.sx)} 1)`);
    }
    function setFace(f) {                      // turn by flipping edge-on, 160 ms
      if (f === her.face) return;
      her.face = f; kill(her.tw.turn);
      const s0 = her.sx, s1 = -f;
      her.tw.turn = tween(reduced ? 0 : 160, e => { her.sx = lerp(s0, s1, e); drawHer(); }, null, linear);
    }
    drawHer();

    // the crack, in the water only
    function edgePts(a, b, stub, idx) {
      const ax = midX(a), ay = H - midY(a), bx = midX(b), by = H - midY(b);
      const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy), nx = -dy / len, ny = dx / len;
      const end = stub ? .9 : 1, pts = [[ax, ay]];
      for (const [t, o] of JAGS[idx % JAGS.length]) if (t < end - .05) pts.push([ax + dx * t + nx * o, ay + dy * t + ny * o]);
      pts.push([ax + dx * end, ay + dy * end]);
      return pts;
    }
    const dOf = pts => 'M' + pts.map(p => f1(p[0]) + ' ' + f1(p[1])).join('L');
    function addEdge(a, b, stub, idx, drawInAfter) {
      const pts = edgePts(a, b, stub, idx), d = dOf(pts);
      const ln = mk('path', { class: 'gd-edge' + (stub ? ' gd-stub' : ''), d }, linesG);
      mk('path', { d }, glowG);
      edges.set(key(a, b), { a, b, stub, pts, ln, walked: false });
      if (drawInAfter != null && !reduced) {
        const L = ln.getTotalLength();
        ln.style.strokeDasharray = L; ln.style.strokeDashoffset = L;
        later(drawInAfter + 20, () => {
          ln.style.transition = 'stroke-dashoffset .7s ease-in-out, stroke .4s, opacity .4s, stroke-width .4s';
          ln.style.strokeDashoffset = 0;
        });
      }
    }
    CRACK.forEach(([a, b], i) => addEdge(a, b, false, i));
    STUBS.forEach(([a, b], i) => addEdge(a, b, true, i + 3));
    const isCrack = (a, b) => edges.has(key(a, b));
    const adj = u => { const out = []; for (const e of edges.values()) { if (e.a === u) out.push(e.b); else if (e.b === u) out.push(e.a); } return out; };
    const flare = () => restart(crackG, 'gd-flare');

    // grab areas (+24 round the hole and round her)
    function placeHits() {
      const x = cellX(hole) - 24, y = cellY(hole) - 24;
      for (const [r, ry] of [[hitHole, y], [hitHer, H - cellY(hole) - CH - 24]]) {
        r.setAttribute('x', x); r.setAttribute('y', ry); r.setAttribute('width', CW + 48); r.setAttribute('height', CH + 48);
      }
    }
    placeHits();

    // touchable: a lit edge where the lamp gets round the paper on hover; lifted while held
    let hot = null;
    const touchEl = mode => (mode === 'hole' ? gap : mode === 'her' ? herEl : null);
    function setHot(mode) {
      if (hot === mode) return;
      touchEl(hot)?.classList.remove('is-hot');
      hot = mode;
      touchEl(hot)?.classList.add('is-hot');
    }

    // ---------- feel ----------
    function slideStone(s, to) {
      kill(s.tw.slide); kill(s.tw.nudge);
      const x0 = s.x + s.nx, y0 = s.y + s.ny, x1 = cellX(to), y1 = cellY(to);
      s.nx = s.ny = 0; if (nudged === s) nudged = null;
      s.tw.slide = tween(reduced ? 0 : 140, e => { s.x = lerp(x0, x1, e); s.y = lerp(y0, y1, e); drawStone(s); }, () => settle(s, to), easeOut);
    }
    function settle(s, at) {               // home: it grinds square; elsewhere: it sits askew
      const k0 = s.k, k1 = s.type === HOME[at] ? 0 : 1;
      if (k0 === k1) return;
      kill(s.tw.k);
      s.tw.k = tween(reduced ? 0 : 220, e => { s.k = lerp(k0, k1, e); drawStone(s); });
    }
    function shudder(s) {
      if (!s) return;
      if (reduced) { restart(s.g, 'gd-smudge'); restart(s.gR, 'gd-smudge'); return; }
      kill(s.tw.wob);
      s.tw.wob = tween(300, e => { s.wob = 2.4 * Math.sin(e * Math.PI * 5) * (1 - e); drawStone(s); }, null, linear);
    }
    function herWobble() {
      if (reduced) { restart(herW, 'gd-smudge'); return; }
      kill(her.tw.wob);
      her.tw.wob = tween(300, e => { her.wob = 3 * Math.sin(e * Math.PI * 5) * (1 - e); drawHer(); }, null, linear);
    }
    function relax(s) {
      const ox = her.ox, oy = her.oy;
      kill(her.tw.off);
      her.tw.off = tween(reduced ? 0 : 160, e => { her.ox = ox * (1 - e); her.oy = oy * (1 - e); drawHer(); }, null, easeOut);
      if (s) {
        const nx = s.nx, ny = s.ny;
        kill(s.tw.nudge);
        s.tw.nudge = tween(reduced ? 0 : 140, e => { s.nx = nx * (1 - e); s.ny = ny * (1 - e); drawStone(s); }, null, easeOut);
      }
    }
    function herTo(i, from) {              // she glides (Madeline never bobs); reduced motion: she fades to her place
      const dc = col(i) - col(from);
      if (dc) setFace(dc > 0 ? -1 : 1);
      kill(her.tw.go); kill(her.tw.lean); kill(her.tw.off);
      const x0 = her.x + her.ox, y0 = her.y + her.oy, l0 = her.lean, x1 = midX(i), y1 = feetY(i);
      her.ox = her.oy = 0;
      if (reduced) restart(herW, 'gd-smudge');
      her.tw.go = tween(reduced ? 0 : 200, e => {
        her.x = lerp(x0, x1, e); her.y = lerp(y0, y1, e); her.lean = l0 * (1 - e); drawHer();
      }, null, easeOut);
    }
    function word(i, t) {                  // a stone grinds home: the sound is cut type, black on the light of the gap beside it
      const dc = col(i) - col(t), dr = row(i) - row(t);
      let x = midX(t), y = midY(t) + 11, anchor = 'middle';
      if (root.clientWidth <= 600) y = midY(t) + 14;             // a phone: the word is half again as big; centre it in the gap
      else if (dc > 0) { x = cellX(t) + CW - 10; anchor = 'end'; }
      else if (dc < 0) { x = cellX(t) + 10; anchor = 'start'; }
      else if (dr > 0) y = cellY(t) + CH - 14;
      else if (dr < 0) y = cellY(t) + 34;
      const tilt = f1((((i * 7) % 9) - 4) * .9);
      const el = mk('text', { class: 'gd-word sh-sound', x, y, 'text-anchor': anchor, transform: `rotate(${tilt} ${x} ${y})` }, A.words);
      el.textContent = WORDS[wordN++ % WORDS.length];
      words.push(el);
      if (!reduced) later(1550, () => { el.remove(); const k = words.indexOf(el); if (k >= 0) words.splice(k, 1); });
    }
    const clearWords = () => { while (words.length) words.pop().remove(); };

    // ---------- the rules ----------
    function move(t, who) {
      const from = hole, s = grid[t];
      grid[from] = s; grid[t] = null; hole = t; lastFrom = from;
      const e = edges.get(key(from, t));
      if (e && !e.walked) { e.walked = true; e.ln.classList.add('gd-walked'); }
      walkOrder.push(key(from, t));
      clearWords();
      placeVoid(t);
      if (!reduced) tempVoid(from, 160);
      raise(s); slideStone(s, from);
      herTo(t, from);
      placeHits();
      if (s.type === HOME[from]) word(from, t);
      if (who === 'player' && ++playerMoves === 2) { line.classList.add('gd-gone'); ribbon.classList.add('gd-gone'); }
      if (t === 8 && !grown) grow();
      if (t === DOOR) { finish(from); return; }
      if (!drag) armIdle();
    }
    function attempt(dir) {
      const t = neighbour(hole, dir);
      if (t != null && isCrack(hole, t)) { move(t, 'player'); return true; }
      flare();
      if (t != null && grid[t]) shudder(grid[t]); else herWobble();
      return false;
    }
    function grow() {                      // the crack runs from her straight to the walled door
      grown = true;
      addEdge(8, 13, false, 4, 0);
      addEdge(13, 12, false, 5, reduced ? 0 : 650);
      later(reduced ? 0 : 260, () => {     // she turns toward it
        if (ended || hole !== 8) return;
        setFace(1); kill(her.tw.lean);
        const l0 = her.lean;
        her.tw.lean = tween(reduced ? 0 : 500, e => { her.lean = lerp(l0, -6, e); drawHer(); });
      });
    }

    // ---------- the house moves ----------
    function houseNext() {
      const dist = new Array(15).fill(Infinity), q = [DOOR];
      dist[DOOR] = 0;
      while (q.length) { const u = q.shift(); for (const v of adj(u)) if (dist[v] === Infinity) { dist[v] = dist[u] + 1; q.push(v); } }
      const c = adj(hole).filter(v => dist[v] === dist[hole] - 1);
      // ties: forward (don't turn back; then further along the fissure)
      c.sort((a, b) => (a === lastFrom) - (b === lastFrom) || MAIN.indexOf(b) - MAIN.indexOf(a));
      return c.length ? c[0] : null;
    }
    function armIdle(ms = IDLE) { cancel(idleT); idleT = ended || !playerMoves ? null : later(ms, houseTurn); }   // still until the player's first move
    function hintLean() {                  // before the first move the house only leans: she tips toward the next step, the stone gives, both settle back
      hintT = null;
      if (ended || playerMoves) return;
      hintT = later(HINT_EVERY, hintLean);
      if (drag || leaning) return;
      const next = houseNext();
      if (next == null) return;
      const vx = col(next) - col(hole), vy = row(next) - row(hole), s = grid[next];
      if (reduced) { if (s) { restart(s.g, 'gd-smudge'); restart(s.gR, 'gd-smudge'); } restart(herW, 'gd-smudge'); return; }
      kill(her.tw.lean); kill(her.tw.off);
      const l0 = her.lean;
      leaning = { next, l0, s, hint: true };
      leaning.h = tween(520, e => {
        her.lean = lerp(l0, vx * 7, e); her.ox = vx * 8 * e; her.oy = -vy * 7 * e; drawHer();
        if (s) { s.nx = -vx * .06 * CW * e; s.ny = -vy * .06 * CH * e; drawStone(s); }
      }, () => { leaning.t = later(420, () => { if (leaning?.hint) cancelLean(); }); });
    }
    function houseTurn() {
      idleT = null;
      if (ended) return;
      if (drag) { armIdle(); return; }
      const next = houseNext();
      if (next == null) return;
      const vx = col(next) - col(hole), vy = row(next) - row(hole), s = grid[next];
      kill(her.tw.lean); kill(her.tw.off);
      const l0 = her.lean;
      leaning = { next, l0, s };
      if (reduced) { leaning.t = later(450, commitHouse); return; }
      leaning.h = tween(520, e => {                 // lean, then step
        her.lean = lerp(l0, vx * 7, e); her.ox = vx * 8 * e; her.oy = -vy * 7 * e; drawHer();
        if (s) { s.nx = -vx * .06 * CW * e; s.ny = -vy * .06 * CH * e; drawStone(s); }
      }, () => { leaning.t = later(140, commitHouse); });
    }
    function commitHouse() {
      if (!leaning || leaning.hint || ended) return;
      const next = leaning.next;
      leaning = null; houseMoves++;
      move(next, 'house');
    }
    function cancelLean() {
      if (!leaning) return;
      kill(leaning.h); cancel(leaning.t);
      const { s, l0 } = leaning, l1 = her.lean;
      leaning = null;
      her.tw.lean = tween(reduced ? 0 : 160, e => { her.lean = lerp(l1, l0, e); drawHer(); });
      relax(s);
    }

    // ---------- the end: the door opens the instant she reaches it ----------
    function finish(from) {
      ended = true; drag = null; cancel(idleT); cancel(hintT); cancelLean();
      root.classList.add('gd-ended'); root.classList.remove('gd-dragging');
      setHot(null);
      for (const el of [gap, herEl]) { el.classList.remove('is-held'); el.setAttribute('aria-disabled', 'true'); }
      line.classList.add('gd-gone'); ribbon.classList.add('gd-gone');
      const short = from === 13;
      let askew = 0, inOrder = 0;
      for (let i = 0; i < 15; i++) {
        if (i === DOOR) continue;
        const ok = grid[i] && grid[i].type === HOME[i];
        if (!ok) askew++; else if (START[i] !== HOME[i]) inOrder++;
      }
      api.setFlag?.('doorRoute', short ? 'short' : 'long');
      api.setFlag?.('stonesAskew', askew);
      api.setFlag?.('doorHouseMoves', houseMoves);
      const result = {
        won: true,
        score: { 'stones set in order': inOrder, 'times the house lent a hand': houseMoves },
        note: askew ? 'Near enough. It opened anyway.' : 'Every stone in its place.',
        // the confession's red corrections ("say, rather:"), keyed by score label
        rather: { 'stones set in order': askew ? 'she was in a hurry' : 'the ninth was her', 'times the house lent a hand': 'she did.' },
      };
      // the door is held open, her in it, for HOLD; a line says what happened
      endLine.firstChild.innerHTML = askew ? 'It opened. <br>You hadn\u2019t <br>finished.' : 'It opened.';
      endRibbon.querySelector('.gd-end-text').textContent = askew ? 'It opened. You hadn\u2019t finished.' : 'It opened.';
      const t0 = reduced ? 0 : 170, inAt = reduced ? 0 : 1500;   // she is fully in the doorway 1.5 s after it starts to open
      later(t0, openDoor);
      later(t0 + (reduced ? 0 : 900), () => { endLine.classList.remove('gd-gone'); endRibbon.classList.remove('gd-gone'); });
      later(t0 + inAt + HOLD, () => { if (!doneSent) { doneSent = true; api.done?.(result); } });
    }
    function openDoor() {
      clearWords();
      // the ebony panels throw slowly back [u49] on the stair's violet light; she is in it, faint above, bright below
      const parts = [A, B].map((L, i) => {
        const g = mk('g', { transform: 'translate(420 230)', fill: 'currentColor' }, L.doorway, DOORFACE);
        const leaves = mk('g', { 'clip-path': 'url(#gdoor-arch)' }, g);
        let inDoor = null;
        if (i === 0) inDoor = mk('g', { class: 'gd-in-door' }, g, C.figure('madeline', { x: 64, y: 88, scale: 1.5 }));
        return { g, leaves, inDoor };
      });
      const setLeaves = k => {
        const html = C.door('ebony', { x: 24, y: 18, w: 72, h: 71, open: k, light: '--lit-stair', fallback: 'url(#sh-room-stair)' });
        for (const p of parts) p.leaves.innerHTML = html;
      };
      setLeaves(0);
      const show = el => { void el.getBoundingClientRect(); el.classList.add('gd-shown'); };
      parts.forEach(p => show(p.g));
      tween(reduced ? 0 : 900, setLeaves, null, easeInOut);
      later(reduced ? 0 : 500, () => show(parts[0].inDoor));
      // her route shows red on the house. It was the fissure.
      for (const k of new Set(walkOrder)) {
        const e = edges.get(k);
        mk('path', { d: dOf(e.pts.map(([x, y]) => [x, H - y])), style: `stroke-width:${e.stub ? 1.8 : 2.8}px` }, A.fissure);
      }
      later(reduced ? 0 : 600, () => show(A.fissure));
    }

    // ---------- input: drag the hole, or her ----------
    function svgPt(e) {
      const m = view.getScreenCTM();
      if (!m) return { x: -1, y: -1 };
      const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
      return { x: p.x, y: p.y };
    }
    function grabMode(p) {
      const x0 = cellX(hole) - 24, x1 = cellX(hole) + CW + 24;
      if (p.x < x0 || p.x > x1) return null;
      const inHole = p.y >= cellY(hole) - 24 && p.y <= cellY(hole) + CH + 24;
      const inHer = p.y >= H - cellY(hole) - CH - 24 && p.y <= H - cellY(hole) + 24;
      if (inHole && inHer) return p.y < WL ? 'hole' : 'her';
      return inHole ? 'hole' : inHer ? 'her' : null;
    }
    function cellAt(p) {
      if (p.x < GX || p.x >= GX + 5 * CW) return null;
      const c = ((p.x - GX) / CW) | 0;
      if (p.y >= GY && p.y < WL) return ((p.y - GY) / CH | 0) * 5 + c;
      if (p.y >= WL && p.y < WL + 3 * CH) return (2 - ((p.y - WL) / CH | 0)) * 5 + c;
      return null;
    }
    function preview(dir, f) {
      const amt = clamp((f - .08) / .47, 0, 1), [vx, vy] = DIRS[dir];
      kill(her.tw.off);
      her.ox = vx * amt * 16; her.oy = -vy * amt * 12; drawHer();
      const t = neighbour(hole, dir), s = t != null ? grid[t] : null;
      if (nudged && nudged !== s) { kill(nudged.tw.nudge); nudged.nx = nudged.ny = 0; drawStone(nudged); }
      nudged = s;
      if (s) {
        const give = isCrack(hole, t) ? .28 : .035;      // on the crack a stone gives; off it, it won't
        kill(s.tw.nudge);
        s.nx = -vx * amt * give * CW; s.ny = -vy * amt * give * CH; drawStone(s);
      }
    }
    function track(p) {
      for (let guard = 0; guard < 4 && drag && !ended; guard++) {
        const dx = p.x - drag.ox, dy = (p.y - drag.oy) * (drag.mode === 'her' ? -1 : 1);   // vertical inverted in water
        const fx = dx / CW, fy = dy / CH, horiz = Math.abs(fx) >= Math.abs(fy);
        const f = horiz ? Math.abs(fx) : Math.abs(fy);
        const dir = horiz ? (fx > 0 ? 'R' : 'L') : (fy > 0 ? 'D' : 'U');
        if (drag.refused && (drag.refused !== dir || f < .3)) drag.refused = null;
        if (f <= .55 || drag.refused === dir) { preview(dir, f); return; }
        if (attempt(dir)) {                              // the stroke continues
          if (!drag) return;
          const [vx, vy] = DIRS[dir];
          drag.ox += vx * CW; drag.oy += (drag.mode === 'her' ? -vy : vy) * CH;
        } else { drag.refused = dir; preview(dir, .55); return; }
      }
    }
    function onDown(e) {
      if (ended || drag) return;
      const p = svgPt(e);
      cancel(idleT); cancelLean();
      const mode = grabMode(p);
      if (mode) {
        drag = { id: e.pointerId, mode, ox: p.x, oy: p.y, refused: null };
        try { svg.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
        root.classList.add('gd-dragging');
        setHot(null); touchEl(mode).classList.add('is-held');
        e.preventDefault();
        return;
      }
      const c = cellAt(p);
      if (c != null && grid[c]) { shudder(grid[c]); flare(); }   // stones aren't moved directly
      armIdle();
    }
    function onMove(e) {
      if (drag) { if (e.pointerId === drag.id) track(svgPt(e)); return; }
      if (!ended && e.pointerType === 'mouse') setHot(grabMode(svgPt(e)));
    }
    function onUp(e) {
      if (!drag || e.pointerId !== drag.id) return;
      touchEl(drag.mode).classList.remove('is-held');
      drag = null;
      root.classList.remove('gd-dragging');
      relax(nudged); nudged = null;
      if (!ended) armIdle();
    }
    const onLeave = () => setHot(null);
    function onKey(e) {
      const d = { ArrowLeft: 'L', ArrowRight: 'R', ArrowUp: 'U', ArrowDown: 'D' }[e.key];
      if (!d || ended) return;
      e.preventDefault();
      cancel(idleT); cancelLean();
      attempt(d);
      if (!ended) armIdle();
    }
    svg.addEventListener('pointerdown', onDown);
    svg.addEventListener('pointermove', onMove);
    svg.addEventListener('pointerup', onUp);
    svg.addEventListener('pointercancel', onUp);
    svg.addEventListener('pointerleave', onLeave);
    root.addEventListener('keydown', onKey);

    // the house waits for the player; it only leans
    hintT = later(HINT_FIRST, hintLean);

    return () => {
      ended = true;
      timers.forEach(clearTimeout); timers.clear();
      tweens.forEach(h => { h.dead = true; cancelAnimationFrame(h.raf); }); tweens.clear();
      svg.removeEventListener('pointerdown', onDown);
      svg.removeEventListener('pointermove', onMove);
      svg.removeEventListener('pointerup', onUp);
      svg.removeEventListener('pointercancel', onUp);
      svg.removeEventListener('pointerleave', onLeave);
      root.removeEventListener('keydown', onKey);
      root.remove();
    };
  },
};
