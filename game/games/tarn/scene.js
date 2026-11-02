// The tarn's own cuts and its scene, shared by both acts (game.js above, below.js below).
// Cut from the shared library (../../shared/cuts.js): the house, its eye-like windows and arch
// door, the white-trunked tree, sedges, the far shore, the tarn's light and glass, Madeline and
// Roderick, the frame. Cut here in the same manner: the chimney and its smoke, the portrait
// window, the open door, the rod and its stud, the opened red eye, the water's script.

import * as C from '../../shared/cuts.js';
export { C };

export const NS = 'http://www.w3.org/2000/svg';
export const WL = 340;                                   // waterline
export const MIRROR = 'translate(0 680) scale(1 -1)';    // y' = 680 - y
export const HOUSE = 'translate(20 -28)';                // the library house (water 368) stood on this game's waterline
const P = Math.PI;

// Colour comes from shadow.css (--sh-*); everything here is a token over it.
export const CSS = `
.g-tarn{
  --g-tarn-ink:var(--sh-cut,#0b0809);
  --g-tarn-light:var(--sh-lamp,#f7d894);
  --g-tarn-type:var(--sh-paper,#ede2cb);
  --g-tarn-ring:var(--sh-lamp,#f7d894);
  --g-tarn-ring-spare:var(--sh-lilac,#a796bf);
  --g-tarn-smear:var(--sh-ember,#cf8752);
  --g-tarn-red:var(--sh-red,#e0392b);
  --g-tarn-truth-w:1.1;
  position:relative;width:100%;height:100%;aspect-ratio:3/2;overflow:hidden;
  container-type:inline-size;background:var(--g-tarn-ink);color:var(--g-tarn-type);
  font-family:var(--sh-serif,'IM Fell English',Georgia,serif);-webkit-tap-highlight-color:transparent;
  user-select:none;-webkit-user-select:none;-webkit-touch-callout:none}
.g-tarn .tarn-svg{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:manipulation;cursor:pointer}
/* the fissure is hers: red, and only a faint hairline, seen when you look */
.g-tarn .tarn-fissure path{fill:none;stroke:var(--g-tarn-red);stroke-width:var(--g-tarn-truth-w);stroke-linecap:round;stroke-linejoin:round;opacity:.7}
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
.g-tarn .marks,.g-tarn .strike,.g-tarn .drip,.g-tarn .halos,.g-tarn .scripts,.g-tarn .gaze,.g-tarn .rimfx{pointer-events:none}
.g-tarn .halo{transform-box:fill-box;transform-origin:center}
.g-tarn .xs{fill:var(--g-tarn-ink);transform-box:fill-box;transform-origin:center}
.g-tarn .glint{fill:url(#g-tarn-glint)}
.g-tarn .drip-ln,.g-tarn .drip-dot{fill:var(--g-tarn-light)}
.g-tarn .drip-ln{transform-box:fill-box;transform-origin:50% 0}
/* the water's script: flipped top to bottom; it rights itself in 400 ms on a tap or after two
   seconds. Never red. (A local copy of the spine's .sh-mirror until that lands in shadow.css.) */
.g-tarn .wscript text{font-style:italic;font-size:30px;fill:var(--sh-return,#f3dba2)}
.g-tarn .wflip{transform-box:fill-box;transform-origin:center;transform:scaleY(-1);transition:transform .4s var(--sh-ease,ease)}
.g-tarn .wflip.right{transform:none}
.g-tarn.rm .wflip{transition:none}
.g-tarn .tarn-hud{position:absolute;left:4.6%;right:4.6%;top:4.4%;pointer-events:none;line-height:1;font-size:max(12px,2.6cqw)}
.g-tarn .tarn-line{font-style:italic;white-space:nowrap;color:var(--g-tarn-type);text-shadow:0 0 .3em var(--g-tarn-ink),0 0 .12em var(--g-tarn-ink);transition:opacity .35s}
.g-tarn .tarn-line.off{opacity:0}
.g-tarn .rom{font-style:normal}
.g-tarn .tarn-rings{display:block;height:1.5em;width:calc(1.5em * 186 / 40);margin-top:.35em;overflow:visible}
.g-tarn .slot .r{fill:var(--g-tarn-ring);opacity:.22}
.g-tarn .slot .f{fill:var(--g-tarn-ring);transform:scale(0);transform-box:fill-box;transform-origin:center;transition:transform .35s ease-out}
.g-tarn .slot.full .f{transform:scale(1)}
.g-tarn .slot.smear .f{transition:none}
.g-tarn .slot.smear .r{opacity:.1}
.g-tarn .slot .sm{fill:var(--g-tarn-smear);opacity:0;transition:opacity .3s}
.g-tarn .slot.smear .sm{opacity:.9;transition:opacity 1.2s ease-in}
.g-tarn .slot .dr{opacity:0;transition:opacity .3s}
.g-tarn .slot.drip .dr{opacity:1;transition:none}
.g-tarn .slot .dr path{fill:var(--g-tarn-smear);transform:scaleY(0);transform-box:fill-box;transform-origin:50% 0;transition:transform 1.6s ease-in}
.g-tarn .slot .dr circle{fill:var(--g-tarn-smear);opacity:0;transition:opacity .3s ease-in 1.45s}
.g-tarn .slot.drip .dr path{transform:scaleY(1)}
.g-tarn .slot.drip .dr circle{opacity:1}
.g-tarn.rm .slot .f{transform:none;opacity:0;transition:opacity .3s}
.g-tarn.rm .slot.full .f{opacity:1}
.g-tarn.rm .slot.smear .f{transition:none}
.g-tarn.rm .slot .dr path,.g-tarn.rm .slot .dr circle{transition:none}
.g-tarn .six{opacity:0;transition:opacity .4s}
.g-tarn .six.on{opacity:1}
.g-tarn .six .r6{fill:var(--g-tarn-ring-spare);opacity:.55}
.g-tarn .six .x{fill:var(--g-tarn-ink);opacity:0;transition:opacity .18s ease-in}
.g-tarn .six .x2{transition-delay:.19s}
.g-tarn .six.crossed .x{opacity:1}
/* below: his line, in his black italic, on a slip of lamplight */
.g-tarn .his-slip{position:absolute;left:4.6%;bottom:5.6%;pointer-events:none;font-style:italic;line-height:1.05;white-space:nowrap;
  font-size:max(12px,2.5cqw);color:var(--g-tarn-ink);background:linear-gradient(180deg,#fff0c2,#f2c06e);padding:.26em .7em .34em;
  box-shadow:0 0 0 .14em var(--g-tarn-ink);opacity:0;transition:opacity .35s}
.g-tarn .his-slip.on{opacity:1}
.g-tarn.rm .his-slip,.g-tarn.rm .tarn-line{transition:none}
.g-tarn .vh{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
/* phones: a stage under 600 px gets its type at 1.5x; the rings move to the top right */
@container (max-width:599px){
  .g-tarn{--g-tarn-truth-w:1.6}
  .g-tarn .tarn-hud{top:3.4%;font-size:max(18px,3.9cqw)}
  .g-tarn .tarn-line{white-space:normal;width:7.7em}
  .g-tarn .tarn-rings{position:absolute;top:0;right:0;margin:0;height:1em;width:calc(1em * 186 / 40)}
  .g-tarn .wscript text{font-size:44px}
  .g-tarn .his-slip{font-size:max(16px,3.7cqw)}}
`;

// The five differences, in house coordinates (the water copy sits at y' = 680 - y).
// hits: tap circles (the spec's r >= 70 kept, helpers where the cut reaches further); every
// state's whole cut also counts, through its measured box (see `pick`). loop: the lamp halo that
// glows behind a find ('sky': behind the whole cut; 'face': behind the detail, over the wall).
// house/water: the false (above) and true (below) states.
export const DIFFS = [
  { id: 'crack', hits: [{ x: 430, y: 200, r: 90 }, { x: 434, y: 300, r: 55 }, { x: 505, y: 148, r: 70 }, { x: 504, y: 196, r: 44 }, { x: 507, y: 331, r: 20 }],
    loop: { cx: 504, cy: 168, rx: 30, ry: 66, at: 'face' } },   // helpers and halo stop short of the door
  { id: 'smoke', hits: [{ x: 640, y: 70, r: 70 }], loop: { cx: 632, cy: 70, rx: 40, ry: 46, at: 'sky' },
    house: 'on', water: 'off', drip: { x: 645, y: 98 } },
  { id: 'tree', hits: [{ x: 150, y: 230, r: 90 }, { x: 98, y: 300, r: 50 }, { x: 62, y: 262, r: 58 }, { x: 214, y: 200, r: 80 }],
    loop: { cx: 186, cy: 222, rx: 100, ry: 96, at: 'sky' }, house: 'up', water: 'down', drip: { x: 217, y: 296 } },
  { id: 'portrait', hits: [{ x: 580, y: 180, r: 70 }, { x: 608, y: 187, r: 70 }], loop: { cx: 608, cy: 187, rx: 40, ry: 46, at: 'face' },
    house: 'one', water: 'two', drip: { x: 631, y: 214 }, box: { x0: 583, x1: 633, y0: 156, y1: 218 } },   // the window (its sitters are clipped)
  { id: 'door', hits: [{ x: 480, y: 290, r: 70 }, { x: 500, y: 284, r: 60 }], loop: { cx: 500, cy: 282, rx: 36, ry: 46, at: 'face' },
    house: 'shut', water: 'open', drip: { x: 523, y: 262 } },
];
export const BYID = Object.fromEntries(DIFFS.map(d => [d.id, d]));
export const FALSE = { smoke: 'on', tree: 'up', portrait: 'one', door: 'shut' };
export const TRUE = { smoke: 'off', tree: 'down', portrait: 'two', door: 'open' };
// The eye-like window at (350,186) that opens red in the water.
export const WINDOW = { hits: [{ x: 360, y: 151, r: 70 }, { x: 350, y: 186, r: 70 }], loop: { cx: 350, cy: 186, rx: 32, ry: 44, at: 'face' } };

// What lies under a press at (x, hy), in house coordinates: the best difference that `ok` allows.
// A circle scores its distance over its radius (0 at the centre, 1 at the edge); anywhere on a
// state's measured box (padded) scores .99, so the whole cut counts and the circles still decide
// between neighbours. Returns { d, k } or null.
export function pick(x, hy, boxes, ok = () => true) {
  let best = null;
  for (const d of DIFFS) {
    if (!ok(d)) continue;
    let k = Infinity;
    for (const h of d.hits) k = Math.min(k, Math.hypot(x - h.x, hy - h.y) / h.r);
    if (k > 1 && boxes && boxes[d.id] && boxes[d.id].some(b => x >= b.x0 && x <= b.x1 && hy >= b.y0 && hy <= b.y1)) k = .99;
    if (k <= 1 && (!best || k < best.k)) best = { d, k };
  }
  return best;
}
export const onWindow = (x, hy) => WINDOW.hits.some(h => Math.hypot(x - h.x, hy - h.y) <= h.r);
// Each variant's whole cut, measured once in house coordinates and padded for a fingertip.
export function measure(container, pad = 12) {
  const boxes = {};
  for (const d of DIFFS) if (d.box) boxes[d.id] = [{ x0: d.box.x0 - pad, x1: d.box.x1 + pad, y0: d.box.y0 - pad, y1: d.box.y1 + pad }];
  container.querySelectorAll('[data-d][data-v]').forEach(g => {
    if (BYID[g.dataset.d] && BYID[g.dataset.d].box) return;    // getBBox ignores clip-path
    try {
      const b = g.getBBox();
      if (!b.width && !b.height) return;
      (boxes[g.dataset.d] = boxes[g.dataset.d] || []).push({ x0: b.x - pad, x1: b.x + b.width + pad, y0: b.y - pad, y1: Math.min(WL, b.y + b.height + pad) });
    } catch (e) { /* not rendered yet: the circles alone */ }
  });
  return boxes;
}

/* ---------- cuts made here, in the library's manner ---------- */
const LIT = (fb = 'url(#sh-lamp)') => `style="fill:var(--lit,${fb})"`;
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
export const TREE_ROOT = [210, 320], TREE_FALL = -70;
const treeUp = () => C.tree(210, 320, TREE);
const treeDown = () => {
  // uprooted, it lies back across the mound; the root plate tears up into curls
  let roots = '';
  for (const [a, l, k] of [[-.2, 13, .9], [.5, 11, -1], [1.1, 9, .8], [-.8, 10, -.9], [1.6, 8, 1.1]]) roots += C.curl(210, 320, a, l, k, 3, .4, 14);
  return `<g transform="rotate(${TREE_FALL} 210 320)">${C.tree(210, 320, TREE)}</g><g fill="currentColor">${roots}</g>` +
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

// The portrait window on the right wing, over the eye at (608,187): 44 x 56. Above, one profile
// (Roderick, his floating hair); in the water, two, the twins face to face.
export const PORTRAIT_D = lancetD(586, 630, 159, 215);
const portrait = inner =>
  `<path d="${lancetD(583, 633, 156, 217)}"/><path d="${PORTRAIT_D}" ${LIT()}/>` +
  `<g clip-path="url(#g-tarn-pw)">${inner}</g>` + `<path d="M583 214h50v3.4h-50z"/>`;
const portraitOne = () => portrait(C.figure('roderick', { x: 606, y: 258, scale: 2 }));
const portraitTwo = () => portrait(
  C.figure('roderick', { x: 595, y: 249, scale: 1.75 }) +
  C.figure('madeline', { x: 623, y: 249, scale: 1.75, flip: true, faint: false, attrs: 'style="--gauze:#fff3d6"' }));

// The door: the library's arch door, cut larger so it reads on a phone; and open.
const doorShut = () => C.door('arch', { x: 480, y: 252, w: 40, h: 62 });
const doorOpen = () =>
  `<path d="${archD(478, 250, 44, 64)}"/><path d="${archD(480, 252, 40, 62)}" style="fill:var(--lit-door,url(#sh-lamp))"/>` +
  `<path d="M481 314V259L490 265V314Z"/><path d="M480 312h40v2h-40z"/>` +
  C.curl(490, 272, 0, 7, .9, 1.6, .3, 10) + C.curl(490, 300, 0, 7, -.9, 1.6, .3, 10);

// The house and its grounds, in one of two states. `all` keeps every variant (a house that can
// redraw a detail by cross-fading); otherwise only the given states are cut.
export function scene(st, all) {
  const v = (id, val, body) => (all || st[id] === val)
    ? `<g data-d="${id}" data-v="${val}"${st[id] === val ? '' : ' style="opacity:0"'}>${body}</g>` : '';
  return `<g fill="currentColor"><g class="halos halos-sky"></g><g transform="translate(0 -28)">${C.shore()}</g>` + bank() +
    `<g transform="${HOUSE}">${C.house({ mode: 'facade', crack: 0 })}</g>` + chimney() + `<g class="halos halos-face"></g>` +
    v('smoke', 'on', smoke()) + v('smoke', 'off', chimneyCold()) +
    v('portrait', 'one', portraitOne()) + v('portrait', 'two', portraitTwo()) +
    v('door', 'shut', doorShut()) + v('door', 'open', doorOpen()) +
    v('tree', 'up', treeUp()) + v('tree', 'down', treeDown()) + `</g>`;
}

// Her fissure: red, a faint hairline in the house's own place.
const fissure = () => `<g class="tarn-fissure" transform="${HOUSE}"><path d="${C.FISSURE}"/></g>`;

// The tarn returns the house as light, through this game's mirror (the library's returned(),
// with this game's own depth mask, so every difference still reads at the bottom of the glass).
export const reflect = (st, all, depth = 'g-tarn-depth') =>
  `<g class="sh-return" mask="url(#${depth})" style="color:var(--sh-return,#f3dba2);--lit:#15122a;--lit-door:#15122a;--gauze:transparent;--crack:transparent;--lattice:none">` +
  `<g transform="${MIRROR}" filter="url(#sh-ripple-still)">${scene(st, all)}</g></g>` +
  `<g class="sh-truth" transform="${MIRROR}">${fissure()}</g>`;

// The red window: an eye-like window opens wider and lights; she is in it, upright.
// `dy` moves it from the water (act one) to her house (act two).
export const eyeD = (dy = 0) => `M350 ${458 + dy}Q395 ${494 + dy} 350 ${530 + dy}Q305 ${494 + dy} 350 ${458 + dy}Z`;
export const herInEye = (id, dy = 0) =>
  `<clipPath id="${id}"><path d="${eyeD(dy)}"/></clipPath>` +
  `<g clip-path="url(#${id})"><g transform="rotate(-6 351 ${480 + dy})">` +
  C.figure('madeline', { x: 347, y: 566 + dy, scale: 2.2, faint: false, attrs: 'style="--gauze:#fff6e0"' }) +
  `</g></g>`;

// Her rim: Madeline's cut, drawn only as its gauze edge (filter g-tarn-rim). Feet at (x, y);
// `down` hangs her head-down, as everything in the water hangs.
export const herRim = (x, y, scale = 1.5, down = false) =>
  `<g filter="url(#g-tarn-rim)"><g transform="translate(${x} ${y})${down ? ' scale(1 -1)' : ''}">` +
  C.figure('madeline', { x: 0, y: 0, scale, faint: false, attrs: 'style="--gauze:#f6ead2"' }) + `</g></g>`;

// A rod, in the interlude's manner: a thin cut strip ending in a lamp-lit stud (her end).
// From (x, y0) to (x, y1); the stud sits at y0. Drawn with a faint lamp rim so it reads on black.
export const rodCut = (x, y0, y1) => {
  const dir = Math.sign(y1 - y0) || 1, L = Math.abs(y1 - y0);
  return `<g class="rod" filter="url(#sh-rim-soft)" style="color:var(--sh-cut,#0b0809)" fill="currentColor">` +
    `<g class="rod-shaft" transform="translate(${x} ${y0}) scale(1 ${dir})"><path d="M-1.9 0H1.9L1.3 ${L}H-1.3Z"/>` +
    `<path d="M-4.2 ${L - 2}h8.4v3h-8.4z"/></g>` +
    `<circle cx="${x}" cy="${y0}" r="8.6"/><circle cx="${x}" cy="${y0}" r="5.2" style="fill:var(--lit-stud,url(#sh-lamp))"/></g>`;
};

// This game's defs: depth masks, halos, glint, the portrait's clip, her rim, the gaze ring.
export const gameDefs = () => `<defs>
    <linearGradient id="g-tarn-deep" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".92"/><stop offset=".55" stop-color="#fff" stop-opacity=".66"/><stop offset="1" stop-color="#fff" stop-opacity=".44"/></linearGradient>
    <mask id="g-tarn-depth" maskUnits="userSpaceOnUse" x="0" y="${WL}" width="960" height="${640 - WL}"><rect x="0" y="${WL}" width="960" height="${640 - WL}" fill="url(#g-tarn-deep)"/></mask>
    <mask id="g-tarn-depth2" maskUnits="userSpaceOnUse" x="0" y="${WL}" width="960" height="${680 - WL}"><rect x="0" y="${WL}" width="960" height="${680 - WL}" fill="url(#g-tarn-deep)"/></mask>
    <radialGradient id="g-tarn-halo"><stop offset="0" stop-color="#fff0c2" stop-opacity=".95"/><stop offset=".42" stop-color="#f7d894" stop-opacity=".62"/><stop offset=".78" stop-color="#e6a256" stop-opacity=".2"/><stop offset="1" stop-color="#e6a256" stop-opacity="0"/></radialGradient>
    <radialGradient id="g-tarn-halo-w"><stop offset="0" stop-color="#e6a256" stop-opacity=".9"/><stop offset=".45" stop-color="#cf8752" stop-opacity=".55"/><stop offset=".8" stop-color="#a2646e" stop-opacity=".18"/><stop offset="1" stop-color="#a2646e" stop-opacity="0"/></radialGradient>
    <radialGradient id="g-tarn-glint"><stop offset="0" stop-color="#fff3d0" stop-opacity=".95"/><stop offset=".45" stop-color="#f7d894" stop-opacity=".55"/><stop offset="1" stop-color="#f7d894" stop-opacity="0"/></radialGradient>
    <radialGradient id="g-tarn-ring"><stop offset="0" stop-color="#f7d894" stop-opacity=".07"/><stop offset=".76" stop-color="#f7d894" stop-opacity=".05"/><stop offset=".86" stop-color="#fff0c2" stop-opacity=".62"/><stop offset=".93" stop-color="#f7d894" stop-opacity=".26"/><stop offset="1" stop-color="#f7d894" stop-opacity="0"/></radialGradient>
    <clipPath id="g-tarn-pw"><path d="${PORTRAIT_D}"/></clipPath>
    <clipPath id="g-tarn-upper"><rect x="0" y="0" width="960" height="${WL}"/></clipPath>
    <clipPath id="g-tarn-lower"><rect x="0" y="${WL}" width="960" height="${640 - WL}"/></clipPath>
    <filter id="g-tarn-cut" filterUnits="userSpaceOnUse" x="0" y="0" width="960" height="640"><feMorphology in="SourceAlpha" operator="dilate" radius="1.9" result="d"/><feFlood flood-color="#0b0809"/><feComposite in2="d" operator="in" result="band"/><feMerge><feMergeNode in="band"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="g-tarn-rim" x="-40%" y="-20%" width="180%" height="140%" color-interpolation-filters="sRGB"><feMorphology in="SourceAlpha" operator="dilate" radius="1.5" result="d"/><feComposite in="d" in2="SourceAlpha" operator="out" result="ring"/><feFlood flood-color="#f6ead2"/><feComposite in2="ring" operator="in" result="r"/><feGaussianBlur in="r" stdDeviation="2.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="r"/></feMerge></filter>
  </defs>`;

/* ---------- small runtime helpers shared by both acts ---------- */
export function kit(root, alive, rm) {
  const timers = new Set();
  const later = (fn, ms) => {
    const t = setTimeout(() => { timers.delete(t); if (alive()) fn(); }, ms);
    timers.add(t);
    return t;
  };
  const cancel = t => { if (t) { clearTimeout(t); timers.delete(t); } };
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
    if (from !== to) anim(el, [{ opacity: from }, { opacity: to }], { duration: rm ? Math.min(ms, 200) : ms, easing: 'ease-in-out' });
  };
  // step(k) for k 0 → 1 over ms on animation frames (with a timer when frames stall)
  const tween = (ms, step, done) => {
    const t0 = performance.now();
    let over = false;
    const tick = () => {
      if (over || !alive()) return;
      const k = Math.min(1, (performance.now() - t0) / ms);
      step(k);
      if (k >= 1) { over = true; if (done) done(); }
    };
    requestAnimationFrame(function f() { tick(); if (!over && alive()) requestAnimationFrame(f); });
    later(tick, ms + 60);
  };
  // A find lights up: a lamp halo glows behind the cut. `to` (0–100) holds part of the light back.
  const pen = (el, ms, to = 0, delay = 0) => {
    const k = 1 - to / 100;
    el.style.opacity = k;
    if (rm) anim(el, [{ opacity: 0 }, { opacity: k }], { duration: 200, delay, fill: 'backwards' });
    else anim(el, [{ opacity: 0, transform: 'scale(.55)' }, { opacity: k, transform: 'scale(1)' }],
      { duration: ms, delay, easing: 'cubic-bezier(.45,0,.25,1)', fill: 'backwards' });
    return el;
  };
  const unpen = (el, ms) => {
    el.getAnimations().forEach(a => a.cancel());
    const k = parseFloat(el.style.opacity) || 1;
    const a = rm ? anim(el, [{ opacity: k }, { opacity: 0 }], { duration: 200, fill: 'forwards' })
      : anim(el, [{ opacity: k, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(.35)' }], { duration: ms, easing: 'cubic-bezier(.5,0,.6,1)', fill: 'forwards' });
    if (a) a.onfinish = () => el.remove(); else el.remove();
  };
  const kill = el => { el.getAnimations().forEach(a => a.cancel()); el.remove(); };
  // A pinprick of light where a look fell on nothing.
  const tick = (x, y, layer) => {
    const p = mk('circle', { class: 'glint tick ' + (y > WL ? 'tick-b' : 'tick-a'), cx: x.toFixed(1), cy: y.toFixed(1), r: 8 }, layer);
    const a = anim(p, [{ opacity: 0.9 }, { opacity: 0 }], { duration: 1400, easing: 'ease-in', fill: 'forwards' });
    if (a) a.onfinish = () => p.remove(); else later(() => p.remove(), 1400);
  };
  // A cut-paper cross over (cx, cy) in both halves: tapered black strips, rim-lit by the layer.
  const cross = (c, layer, delay = 0) => {
    const dx = c.rx * .8, dy = c.ry * .84;
    [[c.cx - dx, c.cy - dy, c.cx + dx, c.cy + dy], [c.cx + dx, c.cy - dy, c.cx - dx, c.cy + dy]].forEach(([x1, y1, x2, y2], i) => {
      for (const below of [false, true]) {
        const a = below ? 680 - y1 : y1, b = below ? 680 - y2 : y2;
        const pts = []; for (let k = 0; k <= 10; k++) { const t = k / 10, u = 1 - t;
          pts.push([u * u * x1 + 2 * u * t * ((x1 + x2) / 2 + 4) + t * t * x2, u * u * a + 2 * u * t * ((a + b) / 2 - 3) + t * t * b]); }
        pen(mk('path', { class: 'xs ' + (below ? 'xb' : 'xa'), d: C.taper(pts, 5.2, 3.4) }, layer), 170, 0, delay + i * 190);
      }
    });
  };
  // The water's script: a line flipped top to bottom at (cx, cy) that rights itself in 400 ms on
  // a tap (right()) or after two seconds, then fades. Lines stack downward as written.
  const scripts = [];
  const script = (lines, cx, cy, layer, { hold = 5200 } = {}) => {
    const g = mk('g', { class: 'wscript', transform: `translate(${cx} ${cy})` }, layer);
    const f = mk('g', { class: 'wflip' }, g);
    lines.forEach((s, i) => { const t = mk('text', { x: 0, y: 0, dy: `${(i * 1.15).toFixed(2)}em`, 'text-anchor': 'middle' }, f); t.textContent = s; });
    scripts.push(f);
    if (!rm) anim(g, [{ opacity: 0 }, { opacity: 1 }], { duration: 500 });
    later(() => f.classList.add('right'), 2000);
    later(() => { fade(g, 0, 900); later(() => g.remove(), 950); }, 2000 + hold);
    return g;
  };
  const right = () => { scripts.forEach(f => f.classList.add('right')); scripts.length = 0; };
  return { timers, later, cancel, mk, anim, fade, tween, pen, unpen, kill, tick, cross, script, right };
}

// Set a variant group's state inside `scope` (cross-fade; `fresh` gives the re-cut paper a soft rim).
export function setVariant(k, scope, id, val, ms, fresh) {
  scope.querySelectorAll(`[data-d="${id}"]`).forEach(g => {
    const on = g.dataset.v === val;
    g.classList.toggle('fresh', !!fresh && on);
    k.fade(g, on ? 1 : 0, ms);
  });
}
// The tree falls in `scope`: the standing cut turns about its root to lie as the water shows it.
export function fell(k, scope, rm, done) {
  const up = scope.querySelector('[data-d="tree"][data-v="up"]');
  if (!up || rm) { setVariant(k, scope, 'tree', 'down', 200); if (done) done(); return; }
  const [rx, ry] = TREE_ROOT;
  k.tween(820, t => up.setAttribute('transform', `rotate(${(TREE_FALL * t * t * t).toFixed(2)} ${rx} ${ry})`), () => {
    scope.querySelectorAll('[data-d="tree"]').forEach(g => {
      g.getAnimations().forEach(a => a.cancel());
      g.style.opacity = g.dataset.v === 'down' ? 1 : 0;
    });
    up.removeAttribute('transform');
    if (done) done();
  });
}
