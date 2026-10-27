// Tarn: A Somewhat Childish Experiment (chapter I).
// Spot the difference between the house and its reflection. The house cheats once
// (an earlier find unwinds while you look away); catch it. Then a window lights in
// the water only, and the find that matters doesn't count.
// Spec: work/design/games/tarn.md · Contract: work/design/CONTRACT.md · Look: work/design/LOOK.md (Shadow Theatre)
//
// Cut from the shared library (../../shared/cuts.js): the house, its eye-like windows and
// arch door, the white-trunked tree, sedges, the far shore, the tarn's light and glass,
// returned(), the fissure, Madeline, the frame. Cut here in the same manner: the chimney
// and its smoke, the shuttered window, the open door, the opened red eye.

import * as C from '../../shared/cuts.js';

const NS = 'http://www.w3.org/2000/svg';
const WL = 340;                                   // waterline
const MIRROR = 'translate(0 680) scale(1 -1)';    // y' = 680 - y
const HOUSE = 'translate(20 -28)';                // the library house (water 368) stood on this game's waterline
const P = Math.PI;

// Colour comes from shadow.css (--sh-*); everything here is a token over it.
const CSS = `
.g-tarn{
  --g-tarn-ink:var(--sh-cut,#0b0809);
  --g-tarn-light:var(--sh-lamp,#f7d894);
  --g-tarn-type:var(--sh-paper,#ede2cb);
  --g-tarn-miss:var(--sh-paper,#ede2cb);
  --g-tarn-ring:var(--sh-lamp,#f7d894);
  --g-tarn-ring-spare:var(--sh-lilac,#a796bf);
  --g-tarn-smear:var(--sh-ember,#cf8752);
  --g-tarn-red:var(--sh-red,#e0392b);
  --g-tarn-mark-w:3.2;
  --g-tarn-strike-w:3.6;
  --g-tarn-tick-w:2.4;
  --g-tarn-truth-w:3;
  position:relative;width:100%;height:100%;aspect-ratio:3/2;overflow:hidden;
  container-type:inline-size;background:var(--g-tarn-ink);color:var(--g-tarn-type);
  font-family:var(--sh-serif,'IM Fell English',Georgia,serif);-webkit-tap-highlight-color:transparent;
  user-select:none;-webkit-user-select:none;-webkit-touch-callout:none}
.g-tarn .tarn-svg{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:manipulation;cursor:pointer}
.g-tarn .tarn-fissure path{stroke-width:var(--g-tarn-truth-w) !important}
.g-tarn .wisp{animation:g-tarn-wisp 4.2s linear infinite;opacity:0}
.g-tarn .wisp.w2{animation-delay:-1.4s}
.g-tarn .wisp.w3{animation-delay:-2.8s}
@keyframes g-tarn-wisp{0%{opacity:0;transform:translate(0,4px)}16%{opacity:1}68%{opacity:.75}100%{opacity:0;transform:translate(-9px,-30px)}}
.g-tarn.rm .wisp{animation:none}
.g-tarn.rm .wisp.w1{opacity:1}
.g-tarn.rm .wisp.w2{opacity:.7;transform:translate(-4px,-13px)}
.g-tarn.rm .wisp.w3{opacity:.4;transform:translate(-8px,-26px)}
@media (prefers-reduced-motion:reduce){
  .g-tarn .wisp{animation:none}
  .g-tarn .wisp.w1{opacity:1}
  .g-tarn .wisp.w2{opacity:.7;transform:translate(-4px,-13px)}
  .g-tarn .wisp.w3{opacity:.4;transform:translate(-8px,-26px)}}
.g-tarn .fresh{filter:url(#sh-rim-soft)}
.g-tarn .marks,.g-tarn .strike,.g-tarn .drip{pointer-events:none}
.g-tarn .mk{fill:none;stroke:var(--g-tarn-light);stroke-width:var(--g-tarn-mark-w);stroke-linecap:round;stroke-linejoin:round}
.g-tarn .xs{fill:none;stroke:var(--g-tarn-ink);stroke-width:var(--g-tarn-strike-w);stroke-linecap:round}
.g-tarn .tick{fill:none;stroke:var(--g-tarn-miss);stroke-width:var(--g-tarn-tick-w);stroke-linecap:round;stroke-linejoin:round}
.g-tarn .drip-ln{fill:none;stroke:var(--g-tarn-light);stroke-width:var(--g-tarn-mark-w);stroke-linecap:round}
.g-tarn .drip-dot{fill:var(--g-tarn-light)}
.g-tarn .tarn-hud{position:absolute;left:4.6%;top:4.4%;pointer-events:none;line-height:1;font-size:max(12px,2.6cqw)}
.g-tarn .tarn-line{font-style:italic;white-space:nowrap;color:var(--g-tarn-type);text-shadow:0 0 .3em var(--g-tarn-ink),0 0 .12em var(--g-tarn-ink)}
.g-tarn .tarn-rings{display:block;height:1.5em;width:calc(1.5em * 186 / 40);margin-top:.35em;overflow:visible}
.g-tarn .slot .r{fill:none;stroke:var(--g-tarn-ring);stroke-width:1.6}
.g-tarn .slot .f{fill:var(--g-tarn-ring);transform:scale(0);transform-box:fill-box;transform-origin:center;transition:transform .35s ease-out}
.g-tarn .slot.full .f{transform:scale(1)}
.g-tarn .slot.smear .f{transition-duration:1.2s}
.g-tarn .slot .sm{fill:var(--g-tarn-smear);opacity:0;transition:opacity .3s}
.g-tarn .slot.smear .sm{opacity:.95;transition:opacity 1.2s ease-in}
.g-tarn .slot .dr{opacity:0;transition:opacity .3s}
.g-tarn .slot.drip .dr{opacity:1;transition:none}
.g-tarn .slot .dr path{fill:none;stroke:var(--g-tarn-smear);stroke-width:2.4;stroke-linecap:round;stroke-dasharray:22;stroke-dashoffset:22;transition:stroke-dashoffset 1.6s ease-in}
.g-tarn .slot .dr circle{fill:var(--g-tarn-smear);opacity:0;transition:opacity .3s ease-in 1.45s}
.g-tarn .slot.drip .dr path{stroke-dashoffset:0}
.g-tarn .slot.drip .dr circle{opacity:1}
.g-tarn.rm .slot .f{transform:none;opacity:0;transition:opacity .3s}
.g-tarn.rm .slot.full .f{opacity:1}
.g-tarn.rm .slot .dr path,.g-tarn.rm .slot .dr circle{transition:none}
.g-tarn .six{opacity:0;transition:opacity .4s}
.g-tarn .six.on{opacity:1}
.g-tarn .six .r6{fill:none;stroke:var(--g-tarn-ring-spare);stroke-width:1.4}
.g-tarn .six .x{fill:none;stroke:var(--g-tarn-type);stroke-width:2.2;stroke-linecap:round;stroke-dasharray:23;stroke-dashoffset:23;transition:stroke-dashoffset .18s ease-in}
.g-tarn .six .x2{transition-delay:.19s}
.g-tarn .six.crossed .x{stroke-dashoffset:0}
.g-tarn .vh{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
@container (max-width:540px){
  .g-tarn{--g-tarn-mark-w:5;--g-tarn-strike-w:5.4;--g-tarn-tick-w:3.6;--g-tarn-truth-w:4.6}
  .g-tarn .tarn-hud{top:3.4%}
  .g-tarn .tarn-line{white-space:normal;width:7.4em}
  .g-tarn .tarn-rings{height:1.2em;width:calc(1.2em * 186 / 40);margin-top:.25em}}
`;

// The five differences, in house coordinates (the water copy sits at y' = 680 - y).
// hits: tap circles; the spec's circles (r >= 70) are kept as they were, and helpers are
// added where the cut reaches further. loop: the circle of light you cut round a find.
// house/water: the false (above) and true (below) states.
const DIFFS = [
  { id: 'crack', hits: [{ x: 430, y: 200, r: 90 }, { x: 434, y: 300, r: 55 }, { x: 505, y: 148, r: 70 }, { x: 504, y: 214, r: 50 }],
    loop: { cx: 504, cy: 220, rx: 32, ry: 124 } },
  { id: 'smoke', hits: [{ x: 640, y: 70, r: 70 }], loop: { cx: 632, cy: 66, rx: 40, ry: 42 },
    house: 'on', water: 'off', drip: { x: 645, y: 98 } },
  { id: 'tree', hits: [{ x: 150, y: 230, r: 90 }, { x: 98, y: 300, r: 50 }, { x: 62, y: 262, r: 58 }, { x: 214, y: 200, r: 80 }],
    loop: { cx: 140, cy: 236, rx: 114, ry: 92 }, house: 'up', water: 'down', drip: { x: 217, y: 296 } },
  { id: 'shutters', hits: [{ x: 580, y: 180, r: 70 }, { x: 608, y: 187, r: 70 }], loop: { cx: 608, cy: 187, rx: 36, ry: 37 },
    house: 'shut', water: 'open', drip: { x: 621, y: 210 } },
  { id: 'door', hits: [{ x: 480, y: 290, r: 70 }, { x: 500, y: 284, r: 60 }], loop: { cx: 500, cy: 282, rx: 36, ry: 46 },
    house: 'shut', water: 'open', drip: { x: 523, y: 262 } },
];
// The eye-like window at (350,186) that opens red in the water.
const WINDOW = { hits: [{ x: 360, y: 151, r: 70 }, { x: 350, y: 186, r: 70 }], loop: { cx: 350, cy: 186, rx: 32, ry: 44 } };

/* ---------- cuts made here, in the library's manner ---------- */
const LIT = (fb = 'url(#sh-lamp)') => `style="fill:var(--lit,${fb})"`;
const LIT_LINE = (w, o = .85) => `style="fill:none;stroke:var(--lit,#f7d894);stroke-width:${w};opacity:${o}"`;
const lancetD = (x0, x1, top, bot) => {
  const w = x1 - x0, m = (x0 + x1) / 2;
  return `M${x0} ${bot}V${top + w * .42}Q${x0} ${top + w * .08} ${m} ${top}Q${x1} ${top + w * .08} ${x1} ${top + w * .42}V${bot}Z`;
};
const archD = (x, y, w, h) => `M${x} ${y + h}V${y + w * .55}Q${x} ${y} ${x + w / 2} ${y - w * .1}Q${x + w} ${y} ${x + w} ${y + w * .55}V${y + h}Z`;

// The bank: a mound, one white-trunked tree (the one that falls in the water), sedges.
const bank = () =>
  `<path d="M0 340V303C28 296 62 293 100 296C138 299 168 307 200 318C226 327 248 334 268 340Z"/>` +
  C.sedges(10, 258, 338, { count: 36, h: [7, 20], seed: 7 }) + C.sedges(272, 300, 339, { count: 9, h: [6, 14], seed: 8 });
const TREE = { h: 104, seed: 44, crown: 74, w: 7, lean: .03 };
const treeUp = () => C.tree(210, 320, TREE);
const treeDown = () => {
  // uprooted, it lies back across the mound; the root plate tears up into curls
  let roots = '';
  for (const [a, l, k] of [[-.2, 13, .9], [.5, 11, -1], [1.1, 9, .8], [-.8, 10, -.9], [1.6, 8, 1.1]]) roots += C.curl(210, 320, a, l, k, 3, .4, 14);
  return `<g transform="rotate(-70 210 320)">${C.tree(210, 320, TREE)}</g><g fill="currentColor">${roots}</g>` +
    `<path d="M200 322C204 313 216 313 220 322Z"/>`;
};

// The chimney the map's house never needed, cut onto the gable's right slope.
const chimney = () =>
  `<path d="M626 143V95H642V146Z"/><path d="M621 89h26v6.6h-26z"/>${C.scallops(623.5, 644.5, 95.8, 1.3, 4.2)}` +
  C.curl(621, 92, P + .2, 6, -1.2, 2, .4, 12) + C.curl(647, 92, -.2, 6, 1.2, 2, .4, 12);
const smoke = () =>
  `<g class="smoke">` +
  `<path d="${C.curlD(633, 91, -P / 2 + .08, 20, -1.4, 6.4, 2, 20)}"/>` + `<path d="${C.curlD(636, 91, -P / 2 - .3, 13, 1.5, 4.6, 1.4, 16)}"/>` +
  `<path class="wisp w1" d="${C.curlD(634, 84, -P / 2 - .1, 46, 1.25, 6.4, .7, 30)}"/>` +
  `<path class="wisp w2" d="${C.curlD(632, 84, -P / 2 - .22, 42, -1.1, 5.8, .7, 30)}"/>` +
  `<path class="wisp w3" d="${C.curlD(635, 84, -P / 2 + .02, 40, 1.3, 5.6, .7, 30)}"/></g>`;
const chimneyCold = () => `<path d="M621 89h26v6.6h-26z"/>`;   // re-cut cap: what the house redraws when it lies

// The shuttered window on the right wing, over the eye at (608,186).
const shuttersShut = () => {
  let louvres = '';
  for (let y = 181; y <= 200; y += 5.6) louvres += `M598.6 ${y}h7.6M609.8 ${y}h7.6`;
  return `<path d="${lancetD(593.6, 622.4, 162.6, 208.4)}" ${LIT()}/><path d="${lancetD(596, 620, 166, 207)}"/>` +
    `<path d="${louvres}" ${LIT_LINE(1.5)}/><path d="M608 170V206" ${LIT_LINE(.9, .7)}/>`;
};
const shuttersOpen = () => {
  const leaf = (x0, x1, lean) => {
    const yA = 207, yB = 174, tilt = lean * 3;
    let lv = ''; for (let y = 183; y <= 201; y += 5.6) lv += `M${x0 + 2} ${y + tilt * .4}L${x1 - 2} ${y - tilt * .4}`;
    return `<path d="M${x0 - 1.6} ${yA + 1.6}V${yB - 1.6 + tilt}L${x1 + 1.6} ${yB - 1.6 - tilt}V${yA + 1.6}Z" ${LIT()}/>` +
      `<path d="M${x0} ${yA}V${yB + tilt}L${x1} ${yB - tilt}V${yA}Z"/><path d="${lv}" ${LIT_LINE(1.4)}/>`;
  };
  return `<path d="${lancetD(598, 618, 167, 206)}" ${LIT()}/><path d="${lancetD(598, 618, 167, 206)}" style="fill:var(--lattice,url(#sh-lattice))"/>` +
    `<path d="M607.1 178h1.8V206h-1.8zM598 189.4h20v1.6h-20z"/><path d="${lancetD(598, 618, 167, 206)}" style="fill:none;stroke:currentColor;stroke-width:2.2"/>` +
    leaf(583, 594, 1) + leaf(622, 633, -1);
};

// The door: the library's arch door, cut larger so it reads on a phone; and open.
const doorShut = () => C.door('arch', { x: 480, y: 252, w: 40, h: 62 });
const doorOpen = () =>
  `<path d="${archD(478, 250, 44, 64)}"/><path d="${archD(480, 252, 40, 62)}" style="fill:var(--lit-door,url(#sh-lamp))"/>` +
  `<path d="M481 314V259L490 265V314Z"/><path d="M480 312h40v2h-40z"/>` +
  C.curl(490, 272, 0, 7, .9, 1.6, .3, 10) + C.curl(490, 300, 0, 7, -.9, 1.6, .3, 10);

// The house and its grounds, in one of two states. `all` keeps every variant (the house above,
// which can redraw a detail by cross-fading); the water gets only its true states.
function scene(st, all) {
  const v = (id, val, body) => (all || st[id] === val)
    ? `<g data-d="${id}" data-v="${val}"${st[id] === val ? '' : ' style="opacity:0"'}>${body}</g>` : '';
  return `<g fill="currentColor"><g transform="translate(0 -28)">${C.shore()}</g>` + bank() +
    `<g transform="${HOUSE}">${C.house({ mode: 'facade', crack: 0 })}</g>` + chimney() +
    v('smoke', 'on', smoke()) + v('smoke', 'off', chimneyCold()) +
    v('shutters', 'shut', shuttersShut()) + v('shutters', 'open', shuttersOpen()) +
    v('door', 'shut', doorShut()) + v('door', 'open', doorOpen()) +
    v('tree', 'up', treeUp()) + v('tree', 'down', treeDown()) + `</g>`;
}

const FALSE = { smoke: 'on', tree: 'up', shutters: 'shut', door: 'shut' };
const TRUE = { smoke: 'off', tree: 'down', shutters: 'open', door: 'open' };

// The tarn returns the true house as light, through this game's mirror; the depth fades
// less than the map's so every difference still reads at the bottom of the glass.
const reflect = () =>
  `<g style="--lit-door:#15122a">` +
  C.returned(scene(TRUE, false), {
    still: true, transform: MIRROR,
    truth: `<g class="tarn-fissure" transform="${HOUSE}">${C.truthFissure()}</g>`,
  }).replace('mask="url(#sh-depth)"', 'mask="url(#g-tarn-depth)"') + `</g>`;

// The red window: in the water only, an eye-like window opens and lights; she is in it.
const EYE_D = 'M350 458Q395 494 350 530Q305 494 350 458Z';
const herCut = () =>
  `<clipPath id="g-tarn-eye"><path d="${EYE_D}"/></clipPath>` +
  `<g clip-path="url(#g-tarn-eye)"><g transform="rotate(-6 351 480)">` +
  C.figure('madeline', { x: 347, y: 566, scale: 2.2, faint: false, cls: 'touch', attrs: 'style="--gauze:#fff6e0"' }) +
  `</g></g>`;

// A pen loop: one turn and a little more, slightly spiralled, slightly uneven.
function loopPath(cx, cy, rx, ry) {
  const n = 60, start = -1.9 + (Math.random() - 0.5) * 0.6, wob = Math.random() * 6.28, turn = 1.09;
  let d = '';
  for (let i = 0; i <= n; i++) {
    const t = i / n, a = start + t * turn * 2 * Math.PI;
    const k = 1 + 0.03 * Math.sin(3 * a + wob) + 0.06 * (t - 0.5);
    d += (i ? 'L' : 'M') + (cx + rx * k * Math.cos(a)).toFixed(1) + ' ' + (cy + ry * k * Math.sin(a)).toFixed(1);
  }
  return d;
}

export default {
  id: 'tarn',
  title: 'A Somewhat Childish Experiment',
  mount(stage, api = {}) {
    const rm = !!api.reducedMotion;
    const setFlag = (k, val) => { try { api.setFlag && api.setFlag(k, val); } catch (e) { console.error(e); } };
    let alive = true;
    const timers = new Set();
    const later = (fn, ms) => {
      const t = setTimeout(() => { timers.delete(t); if (alive) fn(); }, ms);
      timers.add(t);
      return t;
    };
    const cancel = t => { if (t) { clearTimeout(t); timers.delete(t); } };

    C.autoLace();                                   // phones: about half the lace (decided before any markup)
    const root = document.createElement('div');
    root.className = 'g-tarn' + (rm ? ' rm sh-still' : '');
    const slotsSvg = [0, 1, 2, 3, 4].map(i => `<g class="slot" transform="translate(${14 + i * 28} 14)">
        <circle class="f" r="10"/><circle class="r" r="10"/>
        <path class="sm" d="M-10 2.5C-8-3-2-6.5 4-6C9-5.5 11-1.5 8.5 1.5C6 4.5 1 3.5-3 6.5C-6 9-10.5 7-10 2.5Z"/>
        <g class="dr"><path d="M1 6V28"/><circle cx="1" cy="30.5" r="2.6"/></g></g>`).join('');
    root.innerHTML = `<style>${CSS}</style>
<svg class="tarn-svg" viewBox="0 0 960 640" preserveAspectRatio="xMidYMid meet" role="img"
     aria-label="The house cut from black paper against a dusk sky, and the dark tarn below returning it upside down as light">
  ${C.defs({ animate: false })}
  <defs>
    <linearGradient id="g-tarn-deep" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".92"/><stop offset=".55" stop-color="#fff" stop-opacity=".66"/><stop offset="1" stop-color="#fff" stop-opacity=".44"/></linearGradient>
    <mask id="g-tarn-depth" maskUnits="userSpaceOnUse" x="0" y="${WL}" width="960" height="${640 - WL}"><rect x="0" y="${WL}" width="960" height="${640 - WL}" fill="url(#g-tarn-deep)"/></mask>
    <filter id="g-tarn-cut" filterUnits="userSpaceOnUse" x="0" y="0" width="960" height="640"><feMorphology in="SourceAlpha" operator="dilate" radius="1.9" result="d"/><feFlood flood-color="#0b0809"/><feComposite in2="d" operator="in" result="band"/><feMerge><feMergeNode in="band"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  ${C.backdrop('tarn', { h: WL })}
  <g class="above" style="color:var(--sh-cut)">${scene(FALSE, true)}</g>
  ${C.glass('tarn', { y: WL, h: 640 - WL })}
  ${reflect()}
  <g class="lit" style="opacity:0"><path d="${EYE_D}" style="fill:var(--g-tarn-red)" filter="url(#sh-glow)"/></g>
  <g class="her" style="opacity:0">${herCut()}</g>
  <g class="marks" filter="url(#g-tarn-cut)"></g>
  <g class="strike" filter="url(#sh-rim)"></g>
  ${C.frame()}
</svg>
<div class="tarn-hud">
  <div class="tarn-line">Find the five differences.</div>
  <svg class="tarn-rings" viewBox="0 0 186 40" aria-hidden="true">${slotsSvg}
    <g class="six" transform="translate(166 14)"><circle class="r6" r="10"/><path class="x" d="M-8-8L8 8"/><path class="x x2" d="M8-8L-8 8"/></g>
  </svg>
  <span class="vh" aria-live="polite"></span>
</div>`;
    stage.appendChild(root);

    const $ = s => root.querySelector(s);
    const svg = $('.tarn-svg'), above = $('.above'), marks = $('.marks'), strike = $('.strike');
    const lit = $('.lit'), her = $('.her'), six = $('.six'), live = $('.vh');
    const slotEls = [...root.querySelectorAll('.slot')];
    const slotState = ['empty', 'empty', 'empty', 'empty', 'empty'];

    const mk = (tag, attrs, parent) => {
      const e = document.createElementNS(NS, tag);
      for (const k in attrs) e.setAttribute(k, attrs[k]);
      if (parent) parent.appendChild(e);
      return e;
    };
    const anim = (el, frames, opts) => { try { return el.animate(frames, opts); } catch (e) { return null; } };
    const fade = (el, to, ms) => {
      const from = parseFloat(getComputedStyle(el).opacity);
      el.style.opacity = to;
      if (from !== to) anim(el, [{ opacity: from }, { opacity: to }], { duration: ms, easing: 'ease-in-out' });
    };
    // Pen stroke: offset 102 is hidden, 0 is whole; anything between is a partial stroke.
    const pen = (el, ms, to = 0, delay = 0) => {
      el.setAttribute('pathLength', '100');
      el.style.strokeDasharray = '100 120';
      el.style.strokeDashoffset = to;
      if (rm) anim(el, [{ opacity: 0 }, { opacity: 1 }], { duration: 260, delay, fill: 'backwards' });
      else anim(el, [{ strokeDashoffset: 102 }, { strokeDashoffset: to }],
        { duration: ms, delay, easing: 'cubic-bezier(.45,0,.25,1)', fill: 'backwards' });
      return el;
    };
    const unpen = (el, ms) => {
      el.getAnimations().forEach(a => a.cancel());
      const a = rm ? anim(el, [{ opacity: 1 }, { opacity: 0 }], { duration: ms, fill: 'forwards' })
        : anim(el, [{ strokeDashoffset: 0 }, { strokeDashoffset: 102 }], { duration: ms, easing: 'cubic-bezier(.5,0,.6,1)', fill: 'forwards' });
      if (a) a.onfinish = () => el.remove(); else el.remove();
    };
    const kill = el => { el.getAnimations().forEach(a => a.cancel()); el.remove(); };
    const loops = (c, ms, delay = 0, scale = 1, to = 0) => [
      pen(mk('path', { class: 'mk mk-a', d: loopPath(c.cx, c.cy, c.rx * scale, c.ry * scale) }, marks), ms, to, delay),
      pen(mk('path', { class: 'mk mk-b', d: loopPath(c.cx, 680 - c.cy, c.rx * scale, c.ry * scale) }, marks), ms, to, delay),
    ];
    const tick = (x, y) => {
      const p = mk('path', { class: 'tick ' + (y > WL ? 'tick-b' : 'tick-a'), d: `M${(x - 7).toFixed(1)} ${(y - 1).toFixed(1)}l4.5 5.5 10-12` }, marks);
      const a = anim(p, [{ opacity: 0.9 }, { opacity: 0 }], { duration: 1400, easing: 'ease-in', fill: 'forwards' });
      if (a) a.onfinish = () => p.remove(); else later(() => p.remove(), 1400);
    };
    const setSlot = (i, s) => {
      slotState[i] = s;
      slotEls[i].classList.remove('empty', 'full', 'smear', 'drip');
      slotEls[i].classList.add(s);
      live.textContent = `${slotState.filter(x => x === 'full').length} of five`;
    };
    const setVariant = (id, val, ms, fresh) => {
      above.querySelectorAll(`[data-d="${id}"]`).forEach(g => {
        const on = g.dataset.v === val;
        g.classList.toggle('fresh', !!fresh && on);
        fade(g, on ? 1 : 0, ms);
      });
    };

    // ---- state ----
    const diffs = DIFFS.map(d => ({ ...d, state: 'hidden', marks: [], slot: -1, n: 0 }));
    let phase = 'play';            // play → interlude → window → over
    let finds = 0, glances = 0;
    let cheatPending = false, cheatDone = false, cheated = null;
    let hinted = false, hintT = null, spotDrip = null;
    let litOn = false, sawHer = false, windowT = null, doneCalled = false;

    function armHint() {
      cancel(hintT); hintT = null;
      if (!cheated || hinted || phase !== 'play') return;
      if (diffs.some(d => d.state === 'hidden')) return;      // only the cheated spot left
      hintT = later(showHint, 10000);
    }
    function showHint() {
      if (!cheated) return;
      hinted = true;
      slotEls[cheated.slot].classList.add('drip');
      // The re-cut detail hasn't set, and light runs from it.
      const a = cheated.drip;
      spotDrip = mk('g', { class: 'drip', filter: 'url(#g-tarn-cut)' }, above);
      const line = mk('path', { class: 'drip-ln', d: `M${a.x} ${a.y}v20` }, spotDrip);
      const drop = mk('circle', { class: 'drip-dot', cx: a.x, cy: a.y + 22.5, r: 3.2 }, spotDrip);
      pen(line, 1600);
      if (!rm) anim(drop, [{ opacity: 0 }, { opacity: 1 }], { duration: 250, delay: 1500, fill: 'backwards' });
    }

    function find(d) {
      d.state = 'found';
      d.n = ++finds;
      d.slot = slotState.findIndex(s => s === 'empty');
      d.marks = loops(d.loop, 400);
      setSlot(d.slot, 'full');
      if (finds === 4 && !cheatPending && !cheatDone) { cheatPending = true; later(cheat, 700); }
      checkComplete();
    }

    // Once, 700 ms after the fourth find: an earlier find unwinds, and the house matches the water.
    function cheat() {
      cheatPending = false; cheatDone = true;
      const pool = diffs.filter(d => d.state === 'found' && d.id !== 'crack' && d.n < 4).sort((a, b) => a.n - b.n);
      const t = pool.find(d => d.id === 'smoke') || pool[0];
      if (!t) { checkComplete(); return; }
      t.state = 'cheated'; cheated = t;
      t.marks.forEach(el => unpen(el, 1200)); t.marks = [];
      setSlot(t.slot, 'smear');
      setVariant(t.id, t.water, 1200, true);
      armHint();
    }

    // Caught: double circle, the ring refills, the house puts it back and flinches.
    function caught(d) {
      d.state = 'found';
      setFlag('tarnCaught', hinted ? 'hinted' : 'unaided');
      d.marks.forEach(kill);
      d.marks = [...loops(d.loop, 380), ...loops(d.loop, 300, 320, 1.17)];
      setSlot(d.slot, 'full');
      setVariant(d.id, d.house, 350, false);
      if (spotDrip) { const s = spotDrip; spotDrip = null; fade(s, 0, 300); later(() => s.remove(), 320); }
      cheated = null; cancel(hintT);
      if (!rm) anim(above, [{ transform: 'translate(0px,0px)' }, { transform: 'translate(4px,0px)' },
        { transform: 'translate(-2px,0px)' }, { transform: 'translate(0px,0px)' }], { duration: 240, easing: 'ease-out' });
      checkComplete();
    }

    function checkComplete() {
      if (phase === 'play' && cheatDone && !cheatPending && diffs.every(d => d.state === 'found')) {
        phase = 'interlude';
        later(startWindow, 1000);
      }
    }

    // Looked back at: in the water only, a window lights; someone in it faces up.
    function startWindow() {
      phase = 'window'; litOn = true;
      fade(lit, 1, rm ? 250 : 700);
      fade(her, 1, rm ? 250 : 900);
      windowT = later(lightOut, 5000);
    }
    function tapHer() {
      sawHer = true; cancel(windowT);
      six.classList.add('on');
      const ms = 380;
      loops(WINDOW.loop, ms, 0, 1, 45);          // your circle starts…
      later(() => {                                // …a cut-paper cross strikes it out
        const c = WINDOW.loop, dx = c.rx * .8, dy = c.ry * .84;
        [[c.cx - dx, c.cy - dy, c.cx + dx, c.cy + dy], [c.cx + dx, c.cy - dy, c.cx - dx, c.cy + dy]].forEach(([x1, y1, x2, y2], i) => {
          for (const below of [false, true]) {
            const a = below ? 680 - y1 : y1, b = below ? 680 - y2 : y2;
            const d = `M${x1} ${a}Q${(x1 + x2) / 2 + 4} ${(a + b) / 2 - 3} ${x2} ${b}`;
            pen(mk('path', { class: 'xs ' + (below ? 'xb' : 'xa'), d }, strike), 170, 0, i * 190);
          }
        });
        six.classList.add('crossed');
      }, ms + 60);
      later(lightOut, ms + 60 + 400);               // …the light dies
    }
    function lightOut() {
      if (!litOn) return;
      litOn = false; phase = 'over'; cancel(windowT);
      fade(lit, 0, rm ? 250 : 700);
      fade(her, 0, rm ? 250 : 700);
      setFlag('tarnSawHer', sawHer);
      setFlag('tarnGlancesDown', glances);
      later(finish, 1200);
    }
    function finish() {
      if (doneCalled) return;
      doneCalled = true;
      try {
        api.done && api.done({
          won: true,
          score: { 'differences found': 5, 'glances down': glances },
          note: 'Five of five. The house thanks you.',
        });
      } catch (e) { console.error(e); }
    }

    function tap(x, y) {
      if (phase === 'over') return;
      const water = y > WL;
      if (water) glances++;
      const hy = water ? 680 - y : y;               // both halves are the same place
      if (phase === 'window') {
        if (litOn && !sawHer && WINDOW.hits.some(h => Math.hypot(x - h.x, hy - h.y) <= h.r)) tapHer();
        else tick(x, y);
        return;
      }
      let best = null, bestK = Infinity, onFound = false;
      for (const d of diffs) {
        for (const h of d.hits) {
          const k = Math.hypot(x - h.x, hy - h.y) / h.r;
          if (k > 1) continue;
          if (d.state === 'found') { onFound = true; continue; }
          if (k < bestK) { best = d; bestK = k; }
        }
      }
      if (phase === 'play' && best) {
        if (best.state === 'cheated') caught(best); else find(best);
      } else if (!onFound) tick(x, y);
      armHint();
    }

    const onDown = e => {
      if (!alive || !e.isPrimary || (e.pointerType === 'mouse' && e.button !== 0)) return;
      const m = svg.getScreenCTM();
      if (!m) return;
      const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
      if (p.x < 0 || p.x > 960 || p.y < 0 || p.y > 640) return;
      e.preventDefault();
      tap(p.x, p.y);
    };
    svg.addEventListener('pointerdown', onDown);

    return () => {
      alive = false;
      timers.forEach(clearTimeout); timers.clear();
      svg.removeEventListener('pointerdown', onDown);
      try { root.getAnimations({ subtree: true }).forEach(a => a.cancel()); } catch (e) { /* older engines */ }
      root.remove();
    };
  },
};
