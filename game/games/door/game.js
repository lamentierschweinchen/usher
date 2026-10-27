// II. A Mere Different Arrangement: the door.
// A sliding-stone puzzle played from the hole. You think you're mending the house;
// you're walking her to the door. Spec: work/design/games/door.md
// Every colour goes through CSS custom properties and classes (scoped to .g-door).

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

const col = i => i % 5, row = i => (i / 5) | 0;
const cellX = i => GX + CW * col(i), cellY = i => GY + CH * row(i);
const midX = i => cellX(i) + CW / 2, midY = i => cellY(i) + CH / 2;
const feetY = i => H - cellY(i) - 7;            // her feet, in the hole's mirrored cell
const key = (a, b) => (a < b ? a + '-' + b : b + '-' + a);
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const easeOut = k => 1 - (1 - k) * (1 - k);
const easeInOut = k => (k < .5 ? 2 * k * k : 1 - (2 - 2 * k) ** 2 / 2);
const linear = k => k;
const f1 = n => (Math.round(n * 10) / 10).toString();
function neighbour(i, d) {
  const [dx, dy] = DIRS[d], c = col(i) + dx, r = row(i) + dy;
  return c < 0 || c > 4 || r < 0 || r > 2 ? null : r * 5 + c;
}

// ---------- the stones (drawn in a 120×90 cell; classes only) ----------
const FACE = '<rect class="gd-face" x="2" y="2" width="116" height="86"/><path class="gd-fine" d="M7 83H113V7"/>';
const CORNICE = '<path class="gd-mass" d="M2 2H118V12H2Z"/><path class="gd-ln" d="M2 18H118"/>' +
  '<path class="gd-fine" d="M2 22H118M2 27H26V47H2M18 47V67H2M18 67H26V88"/><path class="gd-mass" d="M2 12H14L2 24Z"/>';
function hatch(c) {            // diagonal hatching, corners only
  const [x, y, sx, sy] = { tl: [8, 8, 1, 1], tr: [112, 8, -1, 1], bl: [8, 82, 1, -1], br: [112, 82, -1, -1] }[c];
  return `<path class="gd-fine" d="${[9, 16, 23].map(l => `M${x} ${y + sy * l}L${x + sx * l} ${y}`).join('')}"/>`;
}
const ART = {
  plain: v => FACE + hatch(['tl', 'br', 'tr', 'bl'][v % 4]) +
    `<path class="gd-fine" d="${['M74 30l5 7-3 6 4 5', 'M40 56l-4 6 3 5', 'M66 62l6-3 3 5', 'M50 24l4 6-2 5'][v % 4]}"/>`,
  cL: () => FACE + CORNICE,
  cR: () => FACE + `<g transform="matrix(-1 0 0 1 120 0)">${CORNICE}</g>`,
  attic: v => FACE + '<path class="gd-fine" d="M38 24Q60 8 82 24"/><path class="gd-mass" d="M45 64V38Q60 20 75 38V64Z"/>' +
    '<path class="gd-ln" d="M40 68H80"/>' + hatch(v ? 'br' : 'bl'),
  oculus: () => FACE + '<circle class="gd-ln" cx="60" cy="45" r="29"/><circle class="gd-mass" cx="60" cy="45" r="20"/>' +
    '<path class="gd-fine" d="M60 9V16M60 74V81M24 45H31M89 45H96"/>',
  tall: () => FACE + '<path class="gd-fine" d="M42 40Q42 14 60 6Q78 14 78 40"/>' +
    '<path class="gd-mass" d="M47 80V38Q47 18 60 11Q73 18 73 38V80Z"/><path class="gd-ln" d="M41 83H79"/>',
  crest: () => FACE + '<path class="gd-ln" d="M44 18H76V42Q76 62 60 72Q44 62 44 42Z"/>' +
    '<path class="gd-fine" d="M49 47L60 36L71 47M49 55L60 44L71 55M36 26Q28 48 44 70M84 26Q92 48 76 70"/>',
  small: v => FACE + '<path class="gd-fine" d="M45 38H75"/><path class="gd-mass" d="M49 42H71V68H49Z"/>' +
    '<path class="gd-ln" d="M44 72H76"/>' + hatch(v ? 'tr' : 'tl'),
};
// the walled-up doorway at cell 12: a black lintel (the screen's one flat mass) and jambs
const FRAME = '<path class="gd-mass" d="M-10 -9H130V11H-10Z"/><path class="gd-ln" d="M11 11V89M109 11V89"/>';
const DOORWAY = '<rect class="gd-face" x="2" y="11" width="116" height="77"/>' +
  '<path class="gd-void" d="M24 89V46Q24 25 60 18Q96 25 96 46V89Z"/>';
// hooded paper shroud, faceless, train trailing (faces left at scale 1); feet at 0,0
const HER = '<path class="gd-her" d="M0 -74C-7 -74 -9.5 -66 -8 -58C-10 -44 -12 -22 -14 0C-4 1.5 9 1.5 24 3C17 -1 12 -6 9.5 -14' +
  'C8 -30 9 -46 8 -58C9.5 -66 7 -74 0 -74Z"/><ellipse class="gd-her gd-face-blank" cx="-1.6" cy="-63" rx="4" ry="5.4"/>' +
  '<path class="gd-her-ln" d="M-3 -50C-5 -32 -7 -15 -8.5 -1M3.5 -50C3.5 -33 4.5 -17 8.5 -4"/>';
const BANK =
  '<path class="gd-fine" d="M44 320l-4-15M50 320l1-21M57 320l-5-12M64 320l3-17M71 320l-2-10M118 320l-3-13M125 320l2-19M131 320l-4-9"/>' +
  '<path class="gd-face" d="M834 320L837 214 842 196 846 214 848 320Z"/><path class="gd-fine" d="M840 238l-16-20M842 222l11-15M824 218l-6-4"/>' +
  '<path class="gd-face" d="M874 320L876 246 880 232 884 248 885 320Z"/><path class="gd-fine" d="M879 262l12-14M880 250l-9-10"/>' +
  '<path class="gd-face" d="M904 320L906 270 909 258 912 272 912 320Z"/>';
let web = '';
for (let x = 176; x < 780; x += 20) web += `M${x} 47q5 ${5 + ((x / 20) % 3) * 2} 10 0`;
const ROOF = `<path class="gd-ln" d="M168 47H792"/><path class="gd-fine" d="${web}M232 47v9M412 47v12M604 47v8M716 47v11"/>`;
const LAYER = `<g class="gd-bank">${BANK}</g><g class="gd-voids"></g><g class="gd-stones"></g><g class="gd-doorway"></g>` +
  `<g class="gd-frame" transform="translate(420 230)">${FRAME}</g><g class="gd-fissure"></g><g class="gd-roof">${ROOF}</g><g class="gd-words"></g>`;

const CSS = `
.g-door{position:relative;width:100%;height:100%;overflow:hidden;container:gdoor/inline-size;font-family:var(--serif);color:var(--ink);
 -webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent;outline:none;
 --g-door-stone:var(--paper);--g-door-void:var(--ink);--g-door-tarn:var(--ink);--g-door-tarn-alpha:.35;
 --g-door-reflect-line:var(--paper);--g-door-reflect-alpha:.6;--g-door-crack:var(--red);
 --g-door-her:var(--paper);--g-door-her-edge:var(--ink);--g-door-shadow:var(--ink);--g-door-shadow-alpha:.2;
 --g-door-word:var(--ink);--g-door-halo:var(--paper);--g-door-line:var(--ink);--g-door-bank:var(--ink)}
.g-door:focus-visible{outline:1px dashed var(--rule);outline-offset:-4px}
.g-door svg{display:block;width:100%;height:100%;touch-action:none}
.g-door .gd-above{color:var(--ink);--g-door-ground:var(--g-door-stone)}
.g-door .gd-below{color:var(--g-door-reflect-line);--g-door-ground:transparent;opacity:var(--g-door-reflect-alpha)}
.g-door .gd-face{fill:var(--g-door-ground);stroke:currentColor;stroke-width:2;stroke-linejoin:round}
.g-door .gd-mass{fill:currentColor}
.g-door .gd-ln{fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.g-door .gd-fine{fill:none;stroke:currentColor;stroke-width:1.1;stroke-linecap:round;stroke-linejoin:round}
.g-door .gd-void{fill:var(--g-door-void)}
.g-door .gd-tarn{fill:var(--g-door-tarn);opacity:var(--g-door-tarn-alpha)}
.g-door .gd-waterline{fill:none;stroke:var(--g-door-bank);stroke-width:1.1}
.g-door .gd-above .gd-stone{filter:url(#gdoor-cutout)}
.g-door .gd-flood{flood-color:var(--g-door-shadow);flood-opacity:var(--g-door-shadow-alpha)}
.g-door .gd-edge{fill:none;stroke:var(--g-door-crack);stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round;transition:stroke-width .4s}
.g-door .gd-edge.gd-stub{stroke-width:1.8}
.g-door .gd-edge.gd-walked{stroke-width:4.6}
.g-door .gd-glow path{fill:none;stroke:var(--g-door-crack);stroke-width:12;stroke-linecap:round;stroke-linejoin:round;opacity:0}
.g-door .gd-flare .gd-glow path{animation:gdoor-flare .6s ease-out}
@keyframes gdoor-flare{0%{opacity:0}18%{opacity:.5}100%{opacity:0}}
.g-door .gd-her{fill:var(--g-door-her);stroke:var(--g-door-her-edge);stroke-width:1.1;stroke-linejoin:round}
.g-door .gd-her-ln{fill:none;stroke:var(--g-door-her-edge);stroke-width:.7;stroke-linecap:round;opacity:.6}
.g-door .gd-word{font-family:var(--serif);font-style:italic;font-size:22px;fill:var(--g-door-word);paint-order:stroke;
 stroke:var(--g-door-halo);stroke-width:5px;stroke-linejoin:round;pointer-events:none;animation:gdoor-word 1.5s linear forwards}
@keyframes gdoor-word{0%,60%{opacity:1}100%{opacity:0}}
.g-door.g-door-reduced .gd-word{animation:none}
.g-door .gd-smudge{animation:gdoor-smudge .3s ease-out}
@keyframes gdoor-smudge{0%{opacity:.4}100%{opacity:1}}
.g-door .gd-hit{fill:currentColor;fill-opacity:0;cursor:grab}
.g-door.gd-dragging,.g-door.gd-dragging *{cursor:grabbing}
.g-door.gd-ended .gd-hit{display:none}
.g-door .gd-fissure path{fill:none;stroke:var(--g-door-crack);stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round;opacity:0;transition:opacity 1.4s ease-in}
.g-door .gd-fissure.gd-shown path{opacity:1}
.g-door .gd-in-door{opacity:0;transition:opacity 1s}
.g-door .gd-in-door.gd-shown{opacity:1}
.g-door .gd-doorway>g{opacity:0;transition:opacity .3s}
.g-door .gd-doorway>g.gd-shown{opacity:1}
.g-door .g-door-line{position:absolute;margin:0;left:calc(100cqw*36/960);top:calc(100cqw*42/960);white-space:nowrap;pointer-events:none;
 font-style:italic;font-size:max(12px,calc(100cqw*18/960));line-height:1.2;color:var(--g-door-line);transition:opacity 2s}
.g-door .g-door-line.gd-gone{opacity:0}
@container gdoor (max-width:620px){
 .g-door .g-door-line{left:0;right:0;top:2px;text-align:center;font-size:11px}
 .g-door .g-door-line br{display:none}
}
`;

export default {
  id: 'door',
  title: 'The Door',
  mount(stage, api = {}) {
    const reduced = !!api.reducedMotion;
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
    const root = document.createElement('div');
    root.className = 'g-door' + (reduced ? ' g-door-reduced' : '');
    root.tabIndex = 0;
    root.innerHTML = `<style>${CSS}</style>
<svg viewBox="0 0 960 640" role="img" aria-label="The façade of the House of Usher, its stones out of order around a black gap. In the grey tarn below, the house hangs upside down, cracked in red, and a pale figure stands in the gap's reflection. Drag the gap, or her.">
<defs><filter id="gdoor-cutout" x="-10%" y="-10%" width="125%" height="125%"><feOffset in="SourceAlpha" dx="2" dy="3" result="o"/>
<feFlood class="gd-flood"/><feComposite in2="o" operator="in" result="s"/><feMerge><feMergeNode in="s"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
<rect class="gd-tarn" x="32" y="320" width="896" height="288"/>
<g class="gd-below" transform="matrix(1 0 0 -1 0 640)">${LAYER}</g>
<path class="gd-waterline" d="M32 320H928"/>
<g class="gd-crack"><g class="gd-glow"></g><g class="gd-lines"></g></g>
<g class="gd-herw"></g>
<g class="gd-above">${LAYER}</g>
<rect class="gd-hit"/><rect class="gd-hit"/>
</svg>
<p class="g-door-line"><i>A mere different <br>arrangement of <br>the particulars.</i></p>`;
    stage.appendChild(root);
    const svg = root.querySelector('svg');
    const line = root.querySelector('.g-door-line');
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
    let drag = null, nudged = null, leaning = null, idleT = null;
    const grid = new Array(15).fill(null);
    const edges = new Map();
    const walkOrder = [];
    const heldWords = [];

    // stones
    const seen = {};
    let n = 0;
    START.forEach((type, i) => {
      if (!type) return;
      const v = seen[type] = (seen[type] ?? -1) + 1, html = ART[type](v);
      const [ax, ay, ar] = ASKEW[n++];
      const s = { type, x: cellX(i), y: cellY(i), nx: 0, ny: 0, k: type === HOME[i] ? 0 : 1, wob: 0, ax, ay, ar, tw: {} };
      s.g = mk('g', { class: 'gd-stone' }, A.stones, html);
      s.gR = mk('g', { class: 'gd-stone' }, B.stones, html);
      grid[i] = s; drawStone(s);
    });
    function drawStone(s) {
      const t = `translate(${f1(s.x + s.nx + s.k * s.ax)} ${f1(s.y + s.ny + s.k * s.ay)}) rotate(${f1(s.k * s.ar + s.wob)} 60 45)`;
      s.g.setAttribute('transform', t); s.gR.setAttribute('transform', t);
    }
    const raise = s => { s.g.parentNode.appendChild(s.g); s.gR.parentNode.appendChild(s.gR); };

    // the hole: black, in the house and in the water
    const voidRect = parent => mk('rect', { class: 'gd-void', width: CW - 2, height: CH - 2 }, parent);
    const voids = [voidRect(A.voids), voidRect(B.voids)];
    function placeVoid(i) { for (const v of voids) { v.setAttribute('x', cellX(i) + 1); v.setAttribute('y', cellY(i) + 1); } }
    function tempVoid(i, ms) {
      const pair = [voidRect(A.voids), voidRect(B.voids)];
      for (const v of pair) { v.setAttribute('x', cellX(i) + 1); v.setAttribute('y', cellY(i) + 1); }
      later(ms, () => pair.forEach(v => v.remove()));
    }
    placeVoid(hole);

    // her, upright in the hole's reflection
    const herG = mk('g', { class: 'gd-her-w' }, svg.querySelector('.gd-herw'), HER);
    const her = { x: midX(hole), y: feetY(hole), ox: 0, oy: 0, bob: 0, lean: 0, wob: 0, face: 1, tw: {} };
    function drawHer() {
      herG.setAttribute('transform',
        `translate(${f1(her.x + her.ox)} ${f1(her.y + her.oy + her.bob)}) rotate(${f1(her.lean + her.wob)}) scale(${her.face} 1)`);
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
          ln.style.transition = 'stroke-dashoffset .7s ease-in-out, stroke-width .4s';
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
      if (reduced) { restart(herG, 'gd-smudge'); return; }
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
    function herTo(i, from) {
      const dc = col(i) - col(from);
      if (dc) her.face = dc > 0 ? -1 : 1;
      kill(her.tw.go); kill(her.tw.lean); kill(her.tw.off);
      const x0 = her.x + her.ox, y0 = her.y + her.oy, l0 = her.lean, x1 = midX(i), y1 = feetY(i);
      her.ox = her.oy = 0;
      her.tw.go = tween(reduced ? 0 : 200, e => {
        her.x = lerp(x0, x1, e); her.y = lerp(y0, y1, e); her.bob = -1.5 * Math.sin(Math.PI * e); her.lean = l0 * (1 - e); drawHer();
      }, null, easeOut);
    }
    function word(i) {                     // a stone grinds home: the sound is type
      const x = cellX(i) + CW - 8, y = cellY(i) + 24, tilt = f1((((i * 7) % 9) - 4) * .9);
      const t = mk('text', { class: 'gd-word', x, y, 'text-anchor': 'end', transform: `rotate(${tilt} ${x} ${y})` }, A.words);
      t.textContent = WORDS[wordN++ % WORDS.length];
      if (reduced) heldWords.push(t); else later(1550, () => t.remove());
    }
    const clearWords = () => { while (heldWords.length) heldWords.pop().remove(); };

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
      if (s.type === HOME[from]) word(from);
      if (who === 'player' && ++playerMoves === 2) line.classList.add('gd-gone');
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
        her.face = 1; kill(her.tw.lean);
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
    function armIdle(ms = 7000) { cancel(idleT); idleT = ended ? null : later(ms, houseTurn); }
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
      if (!leaning || ended) return;
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
      ended = true; drag = null; cancel(idleT); cancelLean();
      root.classList.add('gd-ended'); root.classList.remove('gd-dragging');
      line.classList.add('gd-gone');
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
      const t0 = reduced ? 0 : 170;
      later(t0, openDoor);
      later(t0 + 900 + 1800, () => { if (!doneSent) { doneSent = true; api.done?.(result); } });
    }
    function openDoor() {
      clearWords();
      const parts =[A, B].map((L, i) => {
        const g = mk('g', { transform: 'translate(420 230)' }, L.doorway, DOORWAY);
        const leaves = [mk('path', { class: 'gd-face' }, g), mk('path', { class: 'gd-face' }, g), mk('path', { class: 'gd-fine' }, g)];
        let inDoor = null;
        if (i === 0) inDoor = mk('g', { class: 'gd-in-door', transform: 'translate(60 88) scale(.86)' }, g, HER);
        return { g, leaves, inDoor };
      });
      const setLeaves = k => {                       // panels thrown back
        const s = 4 * k, t = 46, b = 89, l = lerp(60, -2, k), r = lerp(60, 122, k), m = (t + b) / 2;
        const d = [`M24 ${t}L${f1(l)} ${f1(t - s)}L${f1(l)} ${f1(b + s)}L24 ${b}Z`, `M96 ${t}L${f1(r)} ${f1(t - s)}L${f1(r)} ${f1(b + s)}L96 ${b}Z`,
          `M24 ${m}L${f1(l)} ${m}M96 ${m}L${f1(r)} ${m}`];
        for (const p of parts) p.leaves.forEach((el, j) => el.setAttribute('d', d[j]));
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
      const m = svg.getScreenCTM();
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
        e.preventDefault();
        return;
      }
      const c = cellAt(p);
      if (c != null && grid[c]) { shudder(grid[c]); flare(); }   // stones aren't moved directly
      armIdle();
    }
    function onMove(e) { if (drag && e.pointerId === drag.id) track(svgPt(e)); }
    function onUp(e) {
      if (!drag || e.pointerId !== drag.id) return;
      drag = null;
      root.classList.remove('gd-dragging');
      relax(nudged); nudged = null;
      if (!ended) armIdle();
    }
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
    root.addEventListener('keydown', onKey);

    // the house moves first
    later(1500, () => { if (ended) return; if (!playerMoves && !drag) houseTurn(); else armIdle(); });

    return () => {
      ended = true;
      timers.forEach(clearTimeout); timers.clear();
      tweens.forEach(h => { h.dead = true; cancelAnimationFrame(h.raf); }); tweens.clear();
      svg.removeEventListener('pointerdown', onDown);
      svg.removeEventListener('pointermove', onMove);
      svg.removeEventListener('pointerup', onUp);
      svg.removeEventListener('pointercancel', onUp);
      root.removeEventListener('keydown', onKey);
      root.remove();
    };
  },
};
