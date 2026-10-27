// game/shared/cuts.js — the cut library. One hand for the whole game.
// Look: work/design/LOOK.md (Shadow Theatre). Every function returns an SVG string.
//
// Units are the stage's viewBox, 960×640. Figures stand with their feet at (0,0),
// 40 units tall at scale 1, facing right; figure(name, {x, y, scale, flip}).
// Colour never lives in a cut: cut paper is `fill="currentColor"` (set `color` on
// a wrapper; default ink), light is a CSS variable with a gradient fallback, so the
// same markup works upright (ink against light) and in the tarn (light against glass).
//
//   import * as C from '../../shared/cuts.js';
//   svg.innerHTML = C.defs() + C.backdrop('studio') + C.figure('roderick', {x:300, y:450, scale:3, pose:'recline'});

export const W = 960, H = 640, WATER = 368;
export const FLIP = 'matrix(1 0 0 -.85 0 680.8)';            // y' = 368 − .85(y − 368)
export const FISSURE = 'M486 130l-10 34 14 30-12 40 12 46-10 50 8 38';

export const COLORS = {
  cut: '#0b0809', lamp: '#f7d894', amber: '#e6a256', rose: '#a2646e', violet: '#5b4170',
  zenith: '#241a34', glass: '#13122a', red: '#e0392b', paper: '#ede2cb', ret: '#f3dba2', gauze: '#f6ead2',
};

// The light behind each chapter: sky stops (top → horizon), halo, glass (top → deep).
export const LIGHT = {
  tarn:   { name: 'dusk amber',  sky: ['#1d1530', '#352646 .22', '#6a4462 .46', '#b46f5c .68', '#e3a157 .86', '#f4cf86'], halo: '#fde6ae', glass: ['#30243f', '#13122a', '#07060d'] },
  door:   { name: 'violet',      sky: ['#120e22', '#2a1f44 .3', '#4b3566 .55', '#7d5f92 .78', '#b48fa8 .93', '#d9b3b0'], halo: '#ecd6ea', glass: ['#2a2140', '#121028', '#07060d'] },
  studio: { name: 'ember',       sky: ['#1f1630', '#4a3150 .35', '#8e5560 .62', '#cf8752 .88', '#eab062'], halo: '#f8d993', glass: ['#33223a', '#16112a', '#08060d'] },
  burial: { name: 'cold copper', sky: ['#0b0f11', '#1c2526 .35', '#3a3f39 .6', '#7a5a40 .85', '#b97a4c'], halo: '#e3a86e', glass: ['#1e2526', '#0f1416', '#050708'] },
  nights: { name: 'deep blue',   sky: ['#04060f', '#0b1430 .4', '#1a2c5a .75', '#2f4a80 .93', '#4b6896'], halo: '#a9bfe2', glass: ['#14203d', '#0a1024', '#04060c'] },
  trist:  { name: 'rain-night',  sky: ['#0f0d1e', '#2c2650 .4', '#6a5a8e .8', '#a796bf'], halo: '#d8cce6', glass: ['#2a2448', '#121028', '#06050c'] },
  vault:  { name: 'the vault',   sky: ['#030203', '#0e0a0b .5', '#24181a .85', '#3a2622'], halo: '#b97a4c', glass: ['#1a1213', '#0a0708', '#030203'] },
  flight: { name: 'blood moon',  sky: ['#060405', '#140b10 .4', '#2a1216 .7', '#4a1a18 .92', '#5e2219'], halo: '#c8321f', glass: ['#2a1214', '#120809', '#050303'] },
};
export const CHAPTERS = Object.keys(LIGHT);

/* ---------- lace density ---------- */
let LACE = 1;
export const setLace = k => (LACE = Math.max(.3, Math.min(1, k)));
export const lace = () => LACE;
// Phones get roughly half the lace: fewer, slightly larger holes and curls.
export function autoLace() {
  try { if (matchMedia('(max-width: 640px), (pointer: coarse)').matches) LACE = .55; } catch (e) { /* no window */ }
  return LACE;
}

/* ---------- primitives ---------- */
const r1 = n => Math.round(n * 10) / 10;
const PI = Math.PI;
export const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export function rng(seed = 1) {
  let s = seed | 0;
  return () => { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
// A stroke of the scissors: walk a heading whose curvature tightens toward the tip.
export function walk(x, y, a, len, k0, k1, n = 28) {
  const p = [[x, y]], s = len / n;
  for (let i = 1; i <= n; i++) { const t = i / n; a += (k0 + (k1 - k0) * t * t * t) * s; x += Math.cos(a) * s; y += Math.sin(a) * s; p.push([x, y]); }
  return p;
}
// ...and cut it out as a tapered ribbon (w0 at the root, w1 at the tip).
export function taper(p, w0, w1) {
  const L = [], R = [], n = p.length;
  for (let i = 0; i < n; i++) {
    const a = p[Math.max(0, i - 1)], b = p[Math.min(n - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1]; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
    const w = (w0 + (w1 - w0) * i / (n - 1)) / 2;
    L.push(r1(p[i][0] - dy * w) + ' ' + r1(p[i][1] + dx * w)); R.push(r1(p[i][0] + dy * w) + ' ' + r1(p[i][1] - dx * w));
  }
  return 'M' + L.join('L') + 'L' + R.reverse().join('L') + 'Z';
}
// curl d-string: from (x,y) at heading a (radians; up = −π/2), length, end curvature k (sign = turn), widths.
export const curlD = (x, y, a, len, k, w0 = 2, w1 = .4, n = 26) => taper(walk(x, y, a, len, k * .02, k, n), w0, w1);
export const curl = (...args) => `<path d="${curlD(...args)}"/>`;
const circ = (x, y, r) => `M${r1(x - r)} ${r1(y)}a${r} ${r} 0 1 0 ${r1(2 * r)} 0a${r} ${r} 0 1 0 ${r1(-2 * r)} 0`;
export function scallops(x0, x1, y, r, step) { let d = ''; for (let x = x0; x <= x1 + .01; x += step) d += circ(x, y, r); return `<path d="${d}"/>`; }
export function scallopsV(x, y0, y1, r, step) { let d = ''; for (let y = y0; y <= y1 + .01; y += step) d += circ(x, y, r); return `<path d="${d}"/>`; }
const lit = (v, fb) => `style="fill:var(${v},${fb})"`;
const LAMP = lit('--lit', 'url(#sh-lamp)');
const g = (inner, attrs = '') => `<g fill="currentColor" ${attrs}>${inner}</g>`;   // cut paper takes the wrapper's color

/* ---------- lace: fringes, sedges, trees, clouds ---------- */
// Lace fringe hanging from an edge (eaves, valances, drapes, thatch). dir 1 hangs down, −1 stands up.
export function fringe(x0, x1, y, { seed = 1, len = [3, 9], step = 4.3, dir = 1, w = 1.5, dots = true } = {}) {
  const R = rng(seed); let s = ''; step = step / Math.max(LACE, .5);
  for (let x = x0; x <= x1; x += step) {
    const l = (len[0] + (len[1] - len[0]) * R()) * (LACE < 1 ? 1.25 : 1);
    s += curl(x, y, dir * PI / 2 + (R() - .5) * .25, l, (R() < .5 ? -1 : 1) * (.4 + R() * .8), w, .3, 10);
    if (dots && R() < .35) s += `<circle cx="${r1(x + (R() - .5) * 2)}" cy="${r1(y + dir * (l + 2))}" r="${r1(w * .5)}"/>`;
  }
  return g(s, 'class="sh-fringe"');
}
// Curling sedges along a bank.
export function sedges(x0, x1, y, { count = 30, h = [8, 22], seed = 2, lean = 0, w = 2.2 } = {}) {
  const R = rng(seed); let s = ''; const n = Math.round(count * LACE);
  for (let i = 0; i < n; i++) {
    const x = x0 + (x1 - x0) * R(), hh = h[0] + (h[1] - h[0]) * R(), dir = R() < .5 ? -1 : 1;
    s += curl(x, y + 2, -PI / 2 + lean + (R() - .5) * .8, hh, dir * (.3 + R() * .5), w + R() * 1.3, .35, 24);
  }
  return g(s, 'class="sh-sedges"');
}
// A bare tree, every branch ending in a curl. trunk:'white' cuts the trunk hollow (Poe's "white trunks" [u02]).
export function tree(x, y, { h = 170, seed = 3, depth = 4, w = 5.4, lean = 0, trunk = 'white', crown = 64 } = {}) {
  const R = rng(seed); let s = '';
  const yt = y - h, xt = x + lean * 120, tw = w * .85;
  const branch = (bx, by, a, len, bw, d) => {
    const dir = R() < .5 ? -1 : 1, tip = d === 0 ? (.28 + R() * .3) : (.07 + R() * .06);
    const pts = walk(bx, by, a, len, (R() - .5) * .012, dir * tip, 28);
    s += `<path d="${taper(pts, bw, .5)}"/>`;
    if (d > 0) {
      const m = 2 + (R() < .5 * LACE ? 1 : 0);
      for (let i = 0; i < m; i++) {
        const idx = Math.max(2, Math.floor((pts.length - 1) * (.3 + R() * .45))), p = pts[idx], q = pts[idx - 1];
        const pa = Math.atan2(p[1] - q[1], p[0] - q[0]);
        branch(p[0], p[1], pa + (i % 2 ? 1 : -1) * (.45 + R() * .5), len * (.48 + R() * .22), bw * (.5 + R() * .12), d - 1);
      }
    }
  };
  branch(xt, yt + 10, -PI / 2 + lean * 1.4, crown, w, LACE < 1 ? depth - 1 : depth);
  const body = `M${r1(x - tw)} ${y}C${r1(x - tw * .6)} ${r1((y + yt) / 2)} ${r1(xt - tw * .5)} ${r1(yt + 20)} ${r1(xt - 1.4)} ${r1(yt)}H${r1(xt + 1.4)}C${r1(xt + tw * .5)} ${r1(yt + 20)} ${r1(x + tw * .6)} ${r1((y + yt) / 2)} ${r1(x + tw)} ${y}Z`;
  s += trunk === 'white'
    ? `<path d="${body}" style="fill:var(--lit-trunk,url(#sh-trunk));stroke:currentColor;stroke-width:2.2"/><path d="M${x - 1} ${y - 20}c1-6-1-10 0-16M${r1(x + lean * 40 + 1)} ${r1(y - h * .45)}c-1-5 1-9 0-14" style="fill:none;stroke:currentColor;stroke-width:.8"/>`
    : `<path d="${body}"/>`;
  return g(s, 'class="sh-tree"');
}
// Torn-paper cloud band hanging from the top; lower edge from yL (left) to yR (right), ending at xEnd.
export function clouds(yL, yR, { xEnd = 980, seed = 41, r = [16, 36], fill = '#160f22', opacity = .86 } = {}) {
  const R = rng(seed); let x = xEnd, d = `M-10 -10H${xEnd + 50}C${xEnd + 20} ${r1(yR * .2)} ${xEnd + 6} ${r1(yR * .8)} ${xEnd} ${yR}`;
  while (x > -20) { const rr = r[0] + (r[1] - r[0]) * R(), nx = x - rr * 1.6, ny = yL + (yR - yL) * Math.max(0, nx) / xEnd + (R() - .5) * 10; d += `A${r1(rr)} ${r1(rr * .8)} 0 0 1 ${r1(nx)} ${r1(ny)}`; x = nx; }
  return `<path class="sh-cloud" d="${d}Z" style="fill:${fill};opacity:${opacity}"/>`;
}
export const hills = (y = 368, { fill = '#6c4662', opacity = .55, seed = 0 } = {}) =>
  `<path class="sh-hills" d="M0 ${y}V${y - 52}C60 ${y - 68} 120 ${y - 50} 190 ${y - 62}C250 ${y - 72} 300 ${y - 56} 360 ${y - 64}C430 ${y - 72} 520 ${y - 68} 600 ${y - 72}C680 ${y - 76} 760 ${y - 58} 830 ${y - 68}C880 ${y - 74} 930 ${y - 64} 960 ${y - 68}V${y}Z" style="fill:${fill};opacity:${opacity}"/>`;

/* ---------- light: backdrops and glass ---------- */
export function backdrop(ch = 'tarn', { x = 0, y = 0, w = 960, h = WATER, clouds: cl = true, hills: hl = true, seed = 41 } = {}) {
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#sh-sky-${ch})"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#sh-halo-${ch})"/>`;
  if (cl) s += clouds(y + h * .2, y + h * .07, { xEnd: x + w + 20, seed, fill: '#0e0a14', opacity: .7 }) + clouds(y + h * .34, y + h * .18, { xEnd: x + w * .72, seed: seed + 1, r: [14, 30], fill: '#3c2a4c', opacity: .32 });
  if (hl) s += hills(y + h, { fill: '#000', opacity: .18 }) + `<path d="M${x} ${y + h}V${y + h - 28}C${x + 70} ${y + h - 38} 140 ${y + h - 24} 220 ${y + h - 32}C320 ${y + h - 40} 420 ${y + h - 28} 520 ${y + h - 34}C640 ${y + h - 40} 760 ${y + h - 24} 860 ${y + h - 34}C900 ${y + h - 38} 940 ${y + h - 34} ${x + w} ${y + h - 36}V${y + h}Z" style="fill:#000;opacity:.3"/>`;
  return g(s, `class="sh-backdrop sh-light-${ch}"`);
}
export const glass = (ch = 'tarn', { y = WATER, h = H - WATER } = {}) =>
  `<rect class="sh-glass" y="${y}" width="960" height="${h}" fill="url(#sh-glass-${ch})"/><path d="M14 ${y + .6}H946" style="stroke:#f7d894;stroke-width:.8;opacity:.45"/><path d="M590 ${y + 1}H668L430 ${y + h}H352ZM700 ${y + 1}H716L478 ${y + h}H462Z" style="fill:#e9e0ff;opacity:.035"/>`;
// The tarn returns what stands above it as light: flipped, rippled, fading with depth.
// Truths go in `truth`: same flip, no ripple, no fade, drawn in red or bright gauze.
export function returned(inner, { truth = '', still = false, transform = FLIP } = {}) {
  return `<g class="sh-return" mask="url(#sh-depth)" style="color:var(--sh-return,#f3dba2);--lit:#15122a;--lit-gal:#17132b;--lit-bed:#17132b;--lit-hall:#17132b;--lit-stair:#120f24;--lit-studio:#1a142c;--lit-vault:#0d0b18;--lit-trunk:#15122a;--gauze:transparent;--crack:transparent;--lattice:none">
  <g transform="${transform}" filter="url(#${still ? 'sh-ripple-still' : 'sh-ripple'})">${inner}</g></g>` +
    (truth ? `<g class="sh-truth" transform="${transform}">${truth}</g>` : '');
}
export const truthFissure = (scale = 1) =>
  `<path d="${FISSURE}" style="fill:none;stroke:var(--sh-red,#e0392b);stroke-width:${2.4 / scale};stroke-linecap:round;stroke-linejoin:round"/>`;
export const moon = (x, y, r = 46) =>
  `<g class="sh-moon"><circle cx="${x}" cy="${y}" r="${r * 2.4}" style="fill:#c8321f;opacity:.16" filter="url(#sh-soft)"/><circle cx="${x}" cy="${y}" r="${r}" style="fill:var(--sh-red,#e0392b)" filter="url(#sh-glow)"/><path d="M${x - r * .5} ${y - r * .2}a${r * .22} ${r * .16} 0 1 0 1 0M${x + r * .2} ${y + r * .35}a${r * .16} ${r * .12} 0 1 0 1 0" style="fill:#000;opacity:.12"/></g>`;

/* ---------- the house (map coordinates: house 280–680, rooms per engine/drawing.js ROOMS) ---------- */
export const lancetD = (x, y, w, h) => `M${x} ${y + h}V${r1(y + w * .6)}Q${x} ${r1(y + w * .1)} ${r1(x + w / 2)} ${y}Q${x + w} ${r1(y + w * .1)} ${x + w} ${r1(y + w * .6)}V${y + h}Z`;
export function lancet(x, y, w, h, { lattice = true, mullion = true, light = '--lit', fallback = 'url(#sh-lamp)' } = {}) {
  const d = lancetD(x, y, w, h), bw = Math.max(1.2, w / 14);
  return g(`<path d="${d}" ${lit(light, fallback)}/>` +
    (lattice ? `<path d="${d}" style="fill:var(--lattice,url(#sh-lattice${w > 30 ? '-l' : ''}))"/>` : '') +
    (mullion ? `<path d="M${r1(x + w / 2 - bw / 2)} ${r1(y + w * .45)}h${r1(bw)}V${y + h}h${r1(-bw)}zM${x} ${r1(y + h * .45)}h${w}v${r1(bw)}h${-w}z"/>` : '') +
    `<path d="${d}" style="fill:none;stroke:currentColor;stroke-width:${r1(bw * 1.6)}"/>`, 'class="sh-lancet"');
}
function crockets() {
  let s = '';
  for (let t = .12; t < .96; t += .105) { const xl = 310 + 170 * t, y = 177 - 59 * t; s += curl(xl, y - 1, -PI / 2 - .85, 8, -.9, 2.2, .4, 14) + curl(650 - 170 * t, y - 1, -PI / 2 + .85, 8, .9, 2.2, .4, 14); }
  for (const cx of [300, 660]) for (let t = .2; t < .9; t += .22) { const y = 160 - 74 * t, w = 25 * (1 - t) + 1; s += curl(cx - w, y, -PI + .5, 6, -1, 1.6, .3, 12) + curl(cx + w, y, -.5, 6, 1, 1.6, .3, 12); }
  s += curl(300, 70, -.1, 12, .9, 1.8, .3, 16) + curl(660, 70, PI + .1, 12, -.9, 1.8, .3, 16) + curl(480, 96, -PI / 2 - .9, 9, -1.1, 2, .3, 14) + curl(480, 96, -PI / 2 + .9, 9, 1.1, 2, .3, 14);
  return s;
}
function roseWindow(cx, cy, r) {
  let s = `<circle cx="${cx}" cy="${cy}" r="${r}" ${LAMP}/><circle cx="${cx}" cy="${cy}" r="${r1(r * .23)}"/>`;
  for (let k = 0; k < 8; k++) { const a = k * PI / 4; s += `<path d="M${r1(cx + Math.cos(a) * r * .17)} ${r1(cy + Math.sin(a) * r * .17)}L${r1(cx + Math.cos(a) * r)} ${r1(cy + Math.sin(a) * r)}" style="stroke:currentColor;stroke-width:${r1(r / 10)}"/><path d="${circ(cx + Math.cos(a + PI / 8) * r * .71, cy + Math.sin(a + PI / 8) * r * .71, r1(r / 10))}"/>`; }
  return s + `<circle cx="${cx}" cy="${cy}" r="${r}" style="fill:none;stroke:currentColor;stroke-width:${r1(r / 7)}"/>`;
}
// The shell: turrets, cones, gable, crockets, plinth frieze, the hairline of light where the fissure begins.
export function shell({ crack = 1 } = {}) {
  const slit = (x, y) => `M${x - 2.6} ${y + 26}V${y + 8}Q${x} ${y} ${x + 2.6} ${y + 8}V${y + 26}Z`;
  let fr = ''; for (let x = 424; x <= 652; x += 9 / Math.max(LACE, .6)) fr += circ(x, 354, 1.7) + circ(x + 4.5, 358, 1);
  const crackPts = [[486, 130], [476, 164], [490, 194], [478, 234], [490, 280], [480, 330], [488, 368]];
  const segs = Math.max(0, Math.min(6, Math.round(crack)));
  return g(`<path d="M300 172h360v196H300zM280 166h22v202h-22zM658 166h22v202h-22zM273 158h54v9h-54zM633 158h54v9h-54z"/>
<path d="M275 160Q296 134 300 86Q304 134 325 160ZM635 160Q656 134 660 86Q664 134 685 160Z"/>
<path d="M299.1 62h1.8v26h-1.8zM659.1 62h1.8v26h-1.8zM479 88h2v34h-2z"/><circle cx="300" cy="76" r="2.8"/><circle cx="660" cy="76" r="2.8"/><circle cx="480" cy="100" r="2.6"/>
<path d="M310 177L480 118 650 177Z"/>${roseWindow(480, 152, 11.5)}
<path d="${slit(291, 190)}${slit(291, 236)}${slit(669, 190)}${slit(669, 236)}${slit(669, 288)}" ${LAMP}/>
${crockets()}<path d="${fr}" ${lit('--lit-vault', '#3a2a4c')}/>
${segs ? `<path class="sh-crack" d="M${crackPts.slice(0, segs + 1).map(p => p.join(' ')).join('L')}" style="fill:none;stroke:var(--crack,#ffe7ae);stroke-width:1.2;stroke-linecap:round;stroke-linejoin:round"/>` : ''}`, 'class="sh-shell"');
}
// The cutaway: rooms as lit panels, furniture cut in black. Figures are placed separately.
export function rooms({ seed = 11 } = {}) {
  const R = rng(seed);
  let por = '';
  for (const [a, b] of [[332, 348], [546, 562], [606, 622]]) [a, b].forEach((x, j) => {
    por += `<ellipse cx="${x}" cy="198" rx="5.4" ry="7" style="fill:none;stroke:currentColor;stroke-width:1.7"/>` + curl(x, 190.5, -PI / 2, 3, j ? 1.4 : -1.4, 1.2, .3, 8);
    if (j === 0) por += `<path d="M${x - 3.4} 204.4c0-3 1.6-4.2 3.4-4.4c-1.6-.8-2.2-2.2-1.8-3.6c.2-1.6 1.4-2.6 2.4-2.6c1.4 0 2.4 1 2.4 2.4l1 1.2-.9.4c0 1.2-.6 1.8-1.4 2.2c1.6.4 2.6 1.8 2.6 4.4z"/>`;
  });
  const flight = (x0, y0, x1, y1, n, t) => {
    const dx = (x1 - x0) / n, dy = (y1 - y0) / n; let d = `M${x0} ${y0}`, x = x0, y = y0;
    for (let i = 0; i < n; i++) { y += dy; d += `V${r1(y)}`; x += dx; d += `H${r1(x)}`; }
    let s = `<path d="${d}L${x1} ${r1(y1 + t)}L${r1(x0 + dx * 1.2)} ${r1(y0 + t * .2)}Z"/>`;
    for (let i = 1; i < n; i++) s += `<path d="M${r1(x0 + dx * (i + .5))} ${r1(y0 + dy * (i + 1))}v-11" style="fill:none;stroke:currentColor;stroke-width:.7"/>`;
    return s + `<path d="M${r1(x0 + dx * .5)} ${r1(y0 + dy - 11)}L${r1(x1 - dx * .5)} ${r1(y1 - 11)}" style="fill:none;stroke:currentColor;stroke-width:1.4"/>`;
  };
  const studioLancets = [542, 583, 624].map(x => lancet(x, 226, 12, 38, { lattice: true })).join('');
  return g(`
<rect data-room="gallery" x="306" y="180" width="348" height="36" ${lit('--lit-gal', 'url(#sh-room-gal)')}/>
${fringe(309, 651, 179, { seed: seed + 1 })}
<rect data-room="bedroom" x="306" y="221" width="130" height="57" ${lit('--lit-bed', 'url(#sh-room-bed)')}/>
<path data-room="hall" d="M306 283h130v55H306zM280 338V318Q280 304 293 299Q306 304 306 318V338Z" ${lit('--lit-hall', 'url(#sh-room-hall)')}/>
<rect data-room="stair" x="441" y="221" width="78" height="117" ${lit('--lit-stair', 'url(#sh-room-stair)')}/>
<rect data-room="studio" x="524" y="221" width="130" height="117" ${lit('--lit-studio', 'url(#sh-room-studio)')}/>
<rect class="sh-flicker" x="524" y="221" width="130" height="117" style="fill:var(--lit-flick,url(#sh-flick))"/>
<rect data-room="vault" x="330" y="347" width="80" height="16" ${lit('--lit-vault', '#3a2a4c')}/>
${coffin({ x: 346, y: 360, w: 46, trestles: true })}
${por}
<path d="M404.6 180h.8v10h-.8zM396 194q9 5 18 0v1.4q-9 5-18 0zM397 190h1.2v4.4h-1.2zM404.4 190h1.2v5.6h-1.2zM411.8 190h1.2v4.4h-1.2z"/>${curl(396, 194.5, PI / 2 + .2, 5, 1.2, 1.3, .3, 10)}${curl(414, 194.5, PI / 2 - .2, 5, -1.2, 1.3, .3, 10)}
<path d="M325 238h3v40h-3zM397 238h3v40h-3zM321 234h83v4.5h-83zM328 252h4v14h-4zM330 262h68v7h-68zM333 262c2-6 12-6 13 0z"/><circle cx="326.5" cy="232.5" r="2"/><circle cx="398.5" cy="232.5" r="2"/>
<path d="M328 238C333 248 326 258 331 268L335 268C331.5 258 338 249 333 238ZM397 238C392 248 399 258 394 268L390 268C393.5 258 387 249 392 238Z"/>${scallops(331, 395, 239, 1.6, 4.6)}${scallops(332, 397, 269.5, 1.2, 3.6)}
<path d="M418 278v-18h1.6v18zM414 278h10v-1.6h-10zM416 260h6v-1.4h-6zM418.3 258.6v-4.2h1v4.2z"/>
<path d="M356.6 283h.8v8h-.8zM353 291h8l-1 9h-6zM352 300h10v1.4h-10zM355 289.4h4v1.6h-4z"/>
${flight(441, 338, 505, 286, 8, 6)}<path d="M503 284h16v5h-16z"/>${flight(519, 284, 449, 224, 8, 6)}<path d="M441 221h12v5h-12z"/>
${studioLancets}
<path d="M524 221h130v5H524z"/>${scallops(527, 651, 226, 2.2, 5.2)}
<path d="M524 224h13c-2 10 2 20-2 30c-1 6 2 12-3 16c4 10 1 20 1 30h-9zM654 224h-12c2 10-2 20 2 30c1 6-2 12 3 16c-4 10-1 20-1 30h8z"/>${curl(535, 270, PI / 2 - .1, 10, .9, 1.6, .3, 12)}${curl(643, 270, PI / 2 + .1, 10, -.9, 1.6, .3, 12)}
${sofa(531, 338)}
<path d="M598 338v-3h12v3zM599 335v-2.6h10v2.6zM600.5 332.4v-2.4h8v2.4z"/>`, 'class="sh-rooms"');
}
// The closed façade: vacant eye-like windows [u02], the door the family don't use.
export function facadeWindows() {
  let s = '';
  for (const x of [330, 372, 414, 546, 588, 630]) for (const y of [214, 268]) s += `<path d="M${x} ${y - 15}Q${x + 8} ${y} ${x} ${y + 15}Q${x - 8} ${y} ${x} ${y - 15}Z" style="fill:var(--lit,url(#sh-lamp));opacity:.75"/><path d="M${x - 5} ${y - .6}h10v1.2h-10z"/>`;
  for (let x = 318; x <= 642; x += 18) if (Math.abs(x - 480) > 14) s += `<path d="M${x - 2.4} 208V194Q${x} 188 ${x + 2.4} 194V208Z" style="fill:var(--lit,url(#sh-lamp));opacity:.6"/>`;
  return g(s + `<path d="M300 336h360v6H300z"/>` + door('arch', { x: 466, y: 294, w: 28, h: 48 }), 'class="sh-windows"');
}
export const house = ({ mode = 'cutaway', crack = 1, seed = 11 } = {}) => shell({ crack }) + (mode === 'facade' ? facadeWindows() : rooms({ seed }));

// The bank: mound, three white trunks, sedges, the causeway to the hall's arch. And the far shore.
export function bank({ seed = 23 } = {}) {
  return g(`<path d="M0 368V336C24 330 52 332 78 338C100 343 120 346 140 352C152 356 160 362 168 368Z"/>` +
    tree(34, 354, { h: 158, seed, crown: 62, lean: -.05 }) + tree(66, 352, { h: 126, seed: seed + 1, crown: 70, lean: .08, w: 5 }) + tree(98, 350, { h: 166, seed: seed + 2, crown: 78, lean: -.12 }) +
    causeway() + sedges(10, 170, 364, { count: 46, seed: seed + 3 }) + sedges(262, 298, 366, { count: 10, h: [8, 15], seed: seed + 4 }), 'class="sh-bank"');
}
export const shore = ({ seed = 29 } = {}) => g(`<path d="M672 368C700 362 740 358 800 357C860 356 910 358 960 356V368Z"/>` + sedges(676, 946, 362, { count: 56, h: [7, 18], seed, lean: -.05 }) + sedges(662, 700, 366, { count: 10, h: [8, 15], seed: seed + 1 }), 'class="sh-shore"');
export function causeway(x0 = 150, y0 = 350, x1 = 282, y1 = 336) {
  const yAt = x => y0 + (x - x0) * (y1 - y0) / (x1 - x0), span = x1 - x0;
  let s = `<path d="M${x0} ${y0}L${x1} ${y1}V${y1 + 5}L${x0} ${y0 + 5}Z"/>`;
  const piers = [.17, .43, .69, .92].map(t => x0 + span * t);
  piers.forEach(x => (s += `<path d="M${r1(x - 2)} ${r1(yAt(x) + 3)}h4V368h-4z"/>`));
  for (let k = 0; k < 3; k++) { const a = piers[k] + 2, b = piers[k + 1] - 2, ya = yAt(a) + 6; s += `<path d="M${r1(a)} 368Q${r1(a)} ${r1(ya)} ${r1((a + b) / 2)} ${r1(ya - 1)}Q${r1(b)} ${r1(ya - 2)} ${r1(b)} 368" style="fill:none;stroke:currentColor;stroke-width:2.2"/>`; }
  for (let x = x0 + 4; x <= x1 - 2; x += 8 / Math.max(LACE, .6)) s += `<path d="M${r1(x)} ${r1(yAt(x))}v-7" style="fill:none;stroke:currentColor;stroke-width:.9"/><circle cx="${r1(x)}" cy="${r1(yAt(x) - 7.6)}" r=".9"/>`;
  return g(s + `<path d="M${x0 + 2} ${r1(y0 - 6.6)}L${x1 - 2} ${r1(y1 - 6.5)}" style="fill:none;stroke:currentColor;stroke-width:1.2"/>`, 'class="sh-causeway"');
}

/* ---------- furniture and set pieces ---------- */
export function sofa(x, y, s = 1) {
  return g(`<path d="M3-13H55Q59-13 59-10V-8H3Z"/>${scallops(5, 57, -8, 1.25, 3.2)}${curl(5, -9, -PI / 2 - .05, 20, -.75, 5.5, .8, 26)}${curl(57, -10, -PI / 2 + .15, 8, .9, 3, .5, 16)}${curl(7, -8, PI / 2 + .3, 8, .9, 2.2, .5, 12)}${curl(54, -8, PI / 2 - .3, 8, -.9, 2.2, .5, 12)}`, `class="sh-sofa" transform="translate(${x} ${y}) scale(${s})"`);
}
// Coffin, side view, feet to the right. lid: 'shut' | 'ajar' | 'off'. The lid is its own group (.sh-lid) for the burial.
export function coffin({ x = 0, y = 0, w = 50, lid = 'shut', trestles = false } = {}) {
  const k = w / 50;
  const box = `M0-2L5-8H45L50-3L46 0H4Z`;
  const lidD = `M3-8.6L6-12H44L48-8.6Z`;
  const lidT = lid === 'ajar' ? 'rotate(-9 3 -8.6) translate(0 -1)' : lid === 'off' ? 'translate(-6 -30) rotate(-78 3 -8.6)' : '';
  return g(`<path d="${box}"/><g class="sh-lid" transform="${lidT}"><path d="${lidD}"/>${scallops(8, 43, -12, .9, 3)}<path d="M23-11.4h4v-2.2h-4z"/></g>` +
    `<path d="M10-5.6h.01M40-5.6h.01" style="stroke:var(--lit,#f7d894);stroke-width:1.6;stroke-linecap:round;opacity:.55"/>` +
    (trestles ? `<path d="M8 0l-3 4h1.6l3-4zM8 0l3 4h-1.6l-3-4zM42 0l-3 4h1.6l3-4zM42 0l3 4h-1.6l-3-4z"/>` : ''),
    `class="sh-coffin" transform="translate(${x} ${y}) scale(${r1(k * 100) / 100})"`);
}
// Doors. kind: 'arch' (the house), 'plank' (the hermit), 'iron' (the vault, copper-sheathed [u29]), 'ebony' (the panels' "ebony jaws" [u49]; open 0–1).
export function door(kind = 'plank', { x = 0, y = 0, w = 90, h = 130, planks = 6, open = 0, light = '--lit-door', fallback = '#f2b866' } = {}) {
  const gap = Math.max(2, w * .045);
  if (kind === 'arch') {
    const a = (xx, yy, ww, hh) => `M${xx} ${yy + hh}V${r1(yy + ww * .55)}Q${xx} ${yy} ${r1(xx + ww / 2)} ${r1(yy - ww * .1)}Q${xx + ww} ${yy} ${xx + ww} ${r1(yy + ww * .55)}V${yy + hh}Z`;
    let seams = ''; for (let i = 1; i < 4; i++) seams += `M${r1(x + w * i / 4)} ${r1(y + w * .3)}V${y + h}`;
    return g(`<path d="${a(x - gap, y - gap, w + gap * 2, h + gap)}" ${lit(light, fallback)}/><path d="${a(x, y, w, h)}"/><path d="${seams}" style="fill:none;stroke:var(${light},${fallback});stroke-width:${r1(w / 60)};opacity:.5"/>` +
      curl(x + w * .1, y + h * .3, 0, w * .45, .25, w * .06, w * .012) + curl(x + w * .1, y + h * .75, 0, w * .45, .25, w * .06, w * .012) + `<circle cx="${r1(x + w * .8)}" cy="${r1(y + h * .55)}" r="${r1(w * .05)}" style="fill:var(${light},${fallback})"/>`, 'class="sh-door sh-door-arch"');
  }
  if (kind === 'plank') {
    let seams = ''; for (let i = 1; i < planks; i++) seams += `M${r1(x + w * i / planks)} ${y + 2}V${y + h}`;
    return g(`<path d="M${x - gap} ${y + h}V${y - gap}H${x + w + gap}V${y + h}Z" ${lit(light, fallback)}/><path d="M${x} ${y + h}V${y}H${x + w}V${y + h}Z"/><path d="${seams}" style="fill:none;stroke:var(${light},${fallback});stroke-width:1.1;opacity:.55"/>` +
      `<path d="M${x} ${r1(y + h * .2)}h${w}v${r1(h * .04)}h${-w}zM${x} ${r1(y + h * .76)}h${w}v${r1(h * .04)}h${-w}z"/>` +
      curl(x - gap, y + h * .22, PI, w * .14, -.8, 2.4, .4) + curl(x - gap, y + h * .78, PI, w * .14, .8, 2.4, .4), 'class="sh-door sh-door-plank"');
  }
  if (kind === 'iron') {
    let riv = ''; for (let yy = y + 8; yy < y + h - 4; yy += 12) riv += circ(x + 6, yy, 1.2) + circ(x + w - 6, yy, 1.2);
    for (let xx = x + 14; xx < x + w - 10; xx += 12) riv += circ(xx, y + 6, 1.2) + circ(xx, y + h * .5, 1.2);
    return g(`<path d="M${x - gap} ${y + h}V${y - gap}H${x + w + gap}V${y + h}Z" ${lit(light, '#9b6a44')}/><path d="M${x} ${y + h}V${y}H${x + w}V${y + h}Z"/>` +
      `<path d="M${x + 3} ${y + h * .25}H${x + w - 3}M${x + 3} ${y + h * .75}H${x + w - 3}" style="stroke:#c98a52;stroke-width:1.2;opacity:.6"/><path d="${riv}" style="fill:#c98a52;opacity:.8"/>` +
      `<circle cx="${r1(x + w * .78)}" cy="${r1(y + h * .55)}" r="${r1(w * .08)}" style="fill:none;stroke:#c98a52;stroke-width:1.6"/>`, 'class="sh-door sh-door-iron"');
  }
  // ebony: two tall carved panels that "threw slowly back" [u49]
  const half = w / 2, sx = Math.max(.02, 1 - open);
  const leaf = (side) => {
    let holes = ''; for (let yy = y + 18; yy < y + h - 12; yy += 26) { const cx = side < 0 ? x + half * .5 : x + half * 1.5; holes += circ(cx, yy, 3.2) + circ(cx - 4, yy + 4, 1.6) + circ(cx + 4, yy + 4, 1.6) + circ(cx, yy + 8, 1.6); }
    const ox = side < 0 ? x : x + w;
    return `<g transform="translate(${ox} 0) scale(${r1(sx * 100) / 100} 1) translate(${-ox} 0)"><path fill-rule="evenodd" d="M${side < 0 ? x : x + half + .5} ${y + h}V${y}H${side < 0 ? x + half - .5 : x + w}V${y + h}Z${holes}"/></g>`;
  };
  return g(`<path d="M${x - gap} ${y + h}V${y - gap}H${x + w + gap}V${y + h}Z" ${lit(light, fallback)}/>${leaf(-1)}${leaf(1)}${scallops(x - gap, x + w + gap, y - gap, 2.4, 7)}`, 'class="sh-door sh-door-ebony"');
}
// Draperies: a black curtain with a lace hem, folds cut as hairlines of light, a cord and tassel. side 'left' | 'right'.
export function drape(x, y, w, h, { side = 'left', tie = .5 } = {}) {
  const t = y + h * tie;
  const body = `M0 0H${w}C${r1(w * .96)} ${r1(h * .15)} ${r1(w * .84)} ${r1(h * .32)} ${r1(w * .6)} ${r1(h * tie)}C${r1(w * .78)} ${r1(h * (tie + .12))} ${r1(w * .9)} ${r1(h * .8)} ${r1(w * .84)} ${h}H0Z`;
  const folds = `M${r1(w * .25)} ${r1(h * .04)}C${r1(w * .28)} ${r1(h * .2)} ${r1(w * .25)} ${r1(h * .32)} ${r1(w * .38)} ${r1(h * tie - 4)}M${r1(w * .48)} ${r1(h * .04)}C${r1(w * .52)} ${r1(h * .2)} ${r1(w * .43)} ${r1(h * .34)} ${r1(w * .52)} ${r1(h * tie - 2)}M${r1(w * .43)} ${r1(h * tie + 12)}C${r1(w * .5)} ${r1(h * .7)} ${r1(w * .46)} ${r1(h * .86)} ${r1(w * .52)} ${r1(h - 4)}M${r1(w * .22)} ${r1(h * tie + 18)}C${r1(w * .27)} ${r1(h * .74)} ${r1(w * .23)} ${r1(h * .88)} ${r1(w * .28)} ${r1(h - 4)}`;
  const tx = w * .6;
  const inner = `<path d="${body}"/>${scallops(4, w * .82, h, Math.max(2, w / 30), Math.max(4, w / 15))}<path d="${folds}" style="fill:none;stroke:var(--lit-fold,#e8a868);stroke-width:${r1(Math.max(.6, w / 160))};opacity:.42"/>` +
    `<path d="M${r1(tx - 4)} ${r1(h * tie - 8)}q${r1(w * .14)} 6 ${r1(w * .2)} 18q-4 4-10 2q-8-8-14-12z"/><path d="M${r1(tx + w * .16)} ${r1(h * tie + 8)}q6 16 3 32" style="fill:none;stroke:currentColor;stroke-width:1.6"/>` +
    `<path d="M${r1(tx + w * .16 - 6)} ${r1(h * tie + 40)}h12l-2 4c5 6 5 18 0 26h-8c-5-8-5-20 0-26z"/>`;
  const flip = side === 'right' ? `translate(${x + w} ${y}) scale(-1 1)` : `translate(${x} ${y})`;
  return g(inner, `class="sh-drape" transform="${flip}"`);
}

/* ---------- figures: feet at 0,0, 40 tall, facing right ---------- */
function hair(cx, cy, { n = 13, from = PI * .55, to = PI * 1.6, r = 3, len = [6, 10.5], w = 1.2, seed = 5, rings = [] } = {}) {
  const R = rng(seed); let s = ''; const m = Math.max(6, Math.round(n * (LACE < 1 ? .75 : 1)));
  for (let k = 0; k < m; k++) { const a = from + k * (to - from) / (m - 1); s += curl(cx + Math.cos(a) * r, cy + Math.sin(a) * r, a + (R() - .5) * .3, len[0] + R() * (len[1] - len[0]), (k % 2 ? 1 : -1) * (1.1 + R() * .6), w, .25, 14); }
  for (const [x, y, rr] of rings) s += `<circle cx="${x}" cy="${y}" r="${rr || .9}" style="fill:none;stroke:currentColor;stroke-width:${r1((rr || .9) * .6)}"/>`;
  return s;
}
const FIG = {
  guest: { faces: -1, h: 43, hinges: { arm: [-3, -24] }, draw: () =>
    `<path d="M-2.6-13L-3.4-.9-6.4 0-6.2.8H-1.8L-1-13ZM1-13L1.5-.9-.5 0-.3.8H3.2L2.8-13Z"/>
<path d="M-3.6-26.5C-5.4-21-6.6-15-8.6-8.8C-6.2-8.2-3.2-9.2-1.6-10.6H2.4C4.2-9.4 6.4-8.4 8.4-8.8C7-15 5.2-21 3.6-26.5Z"/>
<g class="sh-arm" data-hinge="-3 -24"><path d="M-3-24.6C-6.8-22.4-9.6-20.2-12.2-19.8L-12.3-18.4C-9.2-18.4-6.2-19.6-2.6-21.6Z"/></g>
<path d="M-1.6-27.4C-1.6-29-2.4-29.6-3.6-30.4L-4.8-31.2-3.4-31.9C-3.4-34.6-1.2-35.6.8-35.4C3-35.2 4-33.6 3.8-31C3.6-29 2.6-28 1.6-27.2Z"/>
<path d="M-3.1-34.4L-2.7-42.6H3.3L3.6-34.4ZM-6.4-34.8Q.2-33.2 6.6-34.8L6.6-33.4Q.2-31.8-6.4-33.4Z"/>${curl(2.2, -27.8, .3, 16, .5, 2.6, .5, 20)}` },
  roderick: { faces: 1, h: 46, hinges: { arm: [2.4, -27] }, draw: (o) => {
    if (o.pose === 'sit') return `<path d="M-3.4-21C-5.8-14-6.8-6-6.6 0H6C5.6-7 4.4-14 2.6-21Z"/><path d="M2-4.8C11-5.4 20-5.2 28-3.6L29.8-1.8C30.6-.4 29.6.4 28.4 0H2Z"/>
<g class="sh-arm" data-hinge="1.6 -17"><path d="M1.6-18C6-15.6 10-14.8 13.8-16.4L14.2-15C10.2-12.6 5.6-12.6.6-14.6Z"/></g>
<path d="M-2.4-21.6C-3.6-23-4-25.6-3.2-27.6C-2.2-30 .6-30.6 2.4-29.4C3.4-28.6 3.6-27.4 3.4-26.6L4.9-25.1 3.6-24.6C3.6-23 3-22 1.6-21.6Z"/>${hair(-.6, -26.2, { rings: [[-7, -28], [-6, -32.5], [-2.6, -34.4], [-8.2, -24.4], [1.6, -34]] })}`;
    if (o.pose === 'recline') { // full length on a chaise, an arm across his eyes; 58 long, head at left
      return `<g transform="scale(.25) translate(-310 -452)"><path d="M206 420C224 414 244 420 268 428C304 436 352 440 402 440C414 440 422 446 416 452H202C192 444 194 428 206 420Z"/><path d="M246 452C252 466 268 474 296 472C326 474 354 466 374 452Z"/>${scallops(256, 368, 470, 2.6, 7)}<path d="M402 438c6-6 14-8 22-6c2 2 0 4-2 4c-6 0-12 3-16 6z"/><path d="M196 418C190 410 190 398 198 392C204 388 212 388 216 392L222 386L222 393C226 398 226 406 222 412C218 418 206 422 196 418Z"/><g class="sh-arm" data-hinge="226 420"><path d="M222 424C232 414 236 402 230 392C226 386 218 384 210 386L208 392C214 392 220 394 222 400C224 408 220 414 214 420Z"/></g>${hair(205, 404, { n: 26, from: PI * .38, to: PI * 1.58, r: 10, len: [26, 50], w: 3.6, seed: 9, rings: [[160, 396, 2.4], [166, 372, 2], [180, 356, 2.6], [204, 350, 2], [158, 420, 2], [226, 356, 1.8], [150, 404, 1.6]] })}</g>`;
    }
    return `<path d="M-3.4-29.6C-5-25.6-5.8-20-6.4-14C-7.2-8-8.8-3.2-11.8 0H9.2C7.6-4 6.6-9 6-14C5.4-20 4.8-25.6 3.4-29.6C1.6-30.8-1.6-30.8-3.4-29.6Z"/>${scallops(-10.4, 8, 0, .8, 2.3)}<path d="M-1.1-31.2h2.6v2h-2.6z"/>
<g class="sh-arm" data-hinge="2.6 -28"><path d="M2.4-29C6-26 7.8-21.4 7.6-16.6C8.6-15.6 8.6-14.2 7.4-13.8C6.4-14.6 5.8-15.6 6-16.8C5.8-21 4.2-24.4 1.2-27Z"/>${curl(7.2, -14.2, PI / 2 + .3, 3.4, 1.2, 1, .25, 8)}</g>
<path d="M-.9-31C-1.7-32.2-2.8-33.4-3-35.8C-3.3-39.6-1.4-42.2 1.4-42C3.8-41.8 4.9-40 4.5-38L4.7-36.6 6.1-35 4.5-34.5C4.7-33.4 4.2-32.6 3.3-32.4L3.2-31.6C2.6-30.8 1.4-30.5.2-30.6Z"/>${hair(.4, -37.4, { n: 19, from: PI * .45, to: PI * 1.75, r: 4, len: [8, 15], w: .95, rings: [[-9, -39, .8], [-7.4, -45, 1], [-2, -48, .8], [-10.6, -33.4, .9], [4, -47, .7], [-11, -44, .6]] })}`; } },
  madeline: { faces: -1, h: 44, gauze: true, draw: (o) => {
    const hx = o.pose === 'lie' ? -9 : -1.6, hy = o.pose === 'lie' ? -9.4 : -30.4;
    const heart = o.heart ? `<path d="M${hx} ${hy}c0-1.4 1.8-2 2.4-.6c.6-1.4 2.4-.8 2.4.6c0 1.4-2.4 2.8-2.4 2.8s-2.4-1.4-2.4-2.8z" style="fill:var(--sh-red,#e0392b)"/>` : '';
    if (o.pose === 'lie') return `<path d="M-17-6C-8-8.6 6-8 16-6C20-5 22-3.4 22-1.4C22 0 21 .6 19 .6H-17C-19.4.6-20-5-17-6Z"/><path d="M-1-8.2c2-1.6 5-1.6 6 0z"/><circle cx="-21" cy="-3.6" r="3.4"/>${hair(-21, -3.6, { n: 9, from: PI * .7, to: PI * 1.3, r: 3, len: [5, 9], w: 1, seed: 6 })}${heart}`;
    return `<path d="M-1.4-43.2C-3.8-43-4.8-40.6-4.2-38.2C-4.6-37-5.4-35.6-5.6-33.6C-6.6-27-7-17-7.6-8C-8-4-8.4-1-8.8 0H4C10 0 18-.2 25 .7C18-1.6 10-2.6 5.6-5C4-12 3.6-22 3.2-30C3-33 2.6-35 1.8-36.6C2.4-39.6 1.2-43.2-1.4-43.2Z"/><path d="M1.4-40.4C4.2-36.4 5-30 4.2-23.6L3-23.8C3.4-30 2.8-35 .4-38.4Z"/>${heart}`; } },
  valet: { faces: -1, h: 40, hinges: { arm: [-2.6, -27] }, draw: () =>
    `<path d="M-1.8-15L-2.6-2.2-3.4 0H-1.7L-.6-15ZM1-15L2.2-2.6 1.9 0H3.3L2.6-15Z"/>
<path d="M-3.2-31C-4-25-4.2-19-3.2-15H3C3.6-12.6 5.2-8 8.2-4.2L8.9-4.9C6.8-9 5.6-14 4.6-19C4.4-24 3.8-28 3-31Z"/>
<g class="sh-arm" data-hinge="-2.6 -27"><path d="M-2.8-28C-6-25.4-8-23.8-10.2-24.4L-10.5-23.2C-8-22-5.6-22.8-2.4-25.2Z"/><path d="M-11.4-29.6h1.4v5.6h-1.4zM-12.9-24.3h4.4v1h-4.4z"/><path d="M-10.7-30.2c-.8-1.2-.4-2.6.4-3.4c.4 1 1.2 1.8.8 3.2z" style="fill:var(--lit,#f7d894)"/></g>
<path d="M-1.6-31.4C-2.6-33-3.6-34-6.2-34.4L-3.7-35.7C-3.6-38.3-1.6-39.5.6-39.1C2.8-38.5 3.4-36 2.6-33.4C2.2-32 1.4-31.4.8-31Z"/>` },
  physician: { faces: 1, h: 36, hinges: { arm: [5, -22] }, draw: (o) =>
    `<path d="M-4-9L-4.6 0H-1.4L-1-9ZM1.6-9L2.2 0H5.6L4.2-9Z"/><path d="M-1.4 0h-4.4l.4-1.2h4ZM5.6 0h-4l.2-1.2h3.6Z"/>
<path d="M-7-23.6C-11.4-18-11.4-10.4-6.4-8H7C11.2-10.4 11.2-18 7-23.6C4-26.6-4-26.6-7-23.6Z"/>
<path d="M-3.6-25C-5.2-27.6-4.6-32.2-.6-33.2C3-34 5.2-32 5.2-30L7.8-28.4 5.2-27.6C5-26 3.6-24.6 1.4-24.4Z"/><circle cx="2.4" cy="-30.2" r=".75" style="fill:var(--lit,#f7d894)"/>
<path d="M-4.8-32.2C-4.6-36.4 4-37.4 4.8-32.4ZM-7.6-32.4H7.8V-31.2H-7.6Z"/>
<path d="M-7-20C-10-16-11.4-12-11.4-9L-9.8-9C-9.6-12-8.6-15-6-18Z"/><path d="M-15-9h8v-5c0-2-1.6-3-4-3s-4 1-4 3zM-13.6-17c0-3 5.2-3 5.2 0" style="stroke:currentColor;stroke-width:.6"/>
<g class="sh-arm" data-hinge="5 -22">${o.lamp ? `<path d="M5-22C9-22 12-21 14-19.4L13.2-18.2C11-19.4 8.6-20 5.6-19.6Z"/><path d="M13.4-19v3M11.4-16h4v.8h-4zM11.6-15.2h3.6l-.4 5h-2.8z"/><path d="M12.4-14.6h2l-.3 3.8h-1.4z" style="fill:var(--lit,#f7d894)"/><path d="M11.2-10.2h4.2v.9h-4.2z"/>` : `<path d="M5-22C8-19.6 9-16.6 8.6-13.6L7.2-13.8C7.4-16.4 6.4-18.8 4.4-20.2Z"/>`}</g>` },
  servant: { faces: 1, h: 38, hinges: { arm: [2.6, -26] }, draw: () =>
    `<path d="M-3-14L-3.6 0H-.6L-.2-14ZM1-14L2 0H5L3.8-14Z"/><path d="M-.6 0h-4l.3-1h3.7ZM5 0H1.6l.2-1H5Z"/>
<path d="M-5-29C-7-24-7-18-6-12C-8-8-9.2-5-9.4-2.6L-6.6-3.6C-4.6-7.6-2.2-11.4-1-13H4C5.2-18 6-24 4-29C2-31-3-31-5-29Z"/>
<g class="sh-arm" data-hinge="2.6 -26"><path d="M3-27C7-25 9.4-22 11.4-20.6L11-19.4C8.4-20.2 5.4-22 2.4-24Z"/><path d="M11.2-20.4C14-18 17-17 20-17.2" style="fill:none;stroke:currentColor;stroke-width:.6"/></g>
<path d="M.6-29.4C-.6-31-.6-34 1.4-35.2C3.6-36.4 6-35 6.4-33L7.8-31.4 6.2-31C6.4-29.6 5-28.4 3.2-28.6Z"/>${curl(-.2, -33.4, PI + .3, 3.6, .9, 1, .2, 10)}${curl(.2, -31.6, PI - .2, 3.2, -.9, 1, .2, 10)}` },
  horse: { faces: 1, h: 41, draw: () => {
    const leg = (x, y, bend) => `<path d="${taper(walk(x, y, PI / 2 + bend, 13.4, -bend * .05, bend * .3, 12), 2.8, 1.5)}"/>`;
    let mane = ''; for (let t = .1; t < .95; t += LACE < 1 ? .2 : .12) { const x = 9 + 8 * t, y = -25 - 13 * t; mane += curl(x, y, PI + .9, 4.4, -1.1, 1.2, .25, 10); }
    return `<path d="M-18-24C-12-27 4-27 12-25.4C16-24.4 18-20 17-16.4C16-13.4 12-12.4 6-12.6H-10C-16-12.4-20-15-20.6-19C-20.8-21.6-20-23.2-18-24Z"/>
<path d="M8.6-25C11-30.4 13.6-35.2 16.8-38.4L17.8-41.2 19.4-38.8C22-37.6 25.6-35.6 28.4-32.2C29.6-30.6 29-29 27.2-29.2C24.4-29.6 22-30.2 20.4-30.4C18.6-27.2 16.6-23 15-19.8Z"/>
<circle cx="21.6" cy="-35.4" r=".7" style="fill:var(--lit,#f7d894)"/>${leg(-15, -14, .08)}${leg(-10.6, -13, -.12)}${leg(8.6, -13, .1)}${leg(13, -14, -.06)}
<path d="M-17.2 0h3.8v-1.4h-3.4zM-11.4 0h3.6v-1.4h-3.4zM7.8 0h3.6v-1.4h-3.4zM13.2 0h3.6v-1.4h-3.4z"/>
${curl(-19.6, -22, PI + .5, 16, -.24, 3.2, .4, 20)}${curl(-19.8, -20.6, PI + 1, 14, .3, 2.4, .3, 18)}${curl(-19.4, -19, PI + 1.3, 11, -.5, 1.6, .3, 16)}${mane}` } },
  ethelred: { faces: 1, h: 46, hinges: { arm: [3, -31] }, draw: (o) => {
    let spikes = ''; for (let k = 0; k < 8; k++) { const a = k * PI / 4, cx = 1.4, cy = -53.6; spikes += `M${r1(cx + Math.cos(a - .3) * 2.4)} ${r1(cy + Math.sin(a - .3) * 2.4)}L${r1(cx + Math.cos(a) * 4.6)} ${r1(cy + Math.sin(a) * 4.6)}L${r1(cx + Math.cos(a + .3) * 2.4)} ${r1(cy + Math.sin(a + .3) * 2.4)}Z`; }
    let plume = ''; const R = rng(4); const m = LACE < 1 ? 5 : 8; for (let k = 0; k < m; k++) plume += curl(-.4 + k * .3, -43, -PI / 2 - 1.5 + k * (1.3 / (m - 1)), 8 + R() * 5, (k % 2 ? 1 : -1) * (.5 + R() * .4), 1.6, .3, 18);
    return `<path d="M-4-16L-5 0H-1.6L-1-16ZM1.4-16L2.6 0H6L4.6-16Z"/><path d="M-5 0h-2.4l.4-1.2h2ZM6 0h2.6l-.4-1.2H6Z"/>
<path d="M-6.6-16C-7.2-22-6.4-28-4.4-31H4.6C6.4-28 7.2-22 6.6-16Z"/>${scallops(-6, 6, -16, .9, 2)}<path d="M-6-29.6C-6.4-33-3-34.2 0-34.2C3-34.2 6.4-33 6-29.6Z"/>
<path d="M-3.6-34V-41.4C-3.6-43.2 3.6-43.2 3.8-41.4L4.6-38 3.8-34Z"/><path d="M.4-39.2h4v.8h-4z" style="fill:var(--lit,#f7d894);opacity:.9"/>${plume}
${o.shield ? `<path d="M-10.4-28H-3.6V-22C-3.6-19-5.6-17-7-16C-8.4-17-10.4-19-10.4-22Z"/><path d="M-7-26.4v8M-9.2-23.4h4.4" style="stroke:var(--lit,#f7d894);stroke-width:.6;opacity:.8"/>` : ''}
<g class="sh-arm" data-hinge="3 -31"><path d="M2-31C5-34 6-38 5-42L6.6-42.4C7.8-38 7-33 4-30Z"/><path d="${taper([[6.2, -41.6], [3.8, -47.4], [1.8, -52]], 1.6, 1.2)}"/><circle cx="1.4" cy="-53.6" r="2.6"/><path d="${spikes}"/></g>` } },
  dragon: { faces: 1, h: 52, hinges: { jaw: [62, -42] }, draw: () => { // ~135 long; Roderick's hair for a mane ("the dragon had her brother's face")
    const spine = walk(36, -30, PI + .28, 118, -.004, -.2, 60);
    let s = `<path d="${taper(spine, 22, .8)}"/><path d="${taper(walk(34, -32, -.75, 22, .01, .02, 12), 13, 9)}"/>`;
    for (let i = 4; i < 44; i += LACE < 1 ? 6 : 4) { const p = spine[i], q = spine[i + 1], a = Math.atan2(q[1] - p[1], q[0] - p[0]) + PI / 2, wv = 11 * (1 - i / 60); const bx = p[0] + Math.cos(a) * wv * .9, by = p[1] + Math.sin(a) * wv * .9;
      s += `<path d="M${r1(bx - 2.4)} ${r1(by)}L${r1(bx + Math.cos(a) * 6)} ${r1(by + Math.sin(a) * 6 - 2)}L${r1(bx + 2.4)} ${r1(by)}Z"/>`; }
    for (const [i, bend] of [[6, .2], [12, -.2], [30, .2], [37, -.2]]) { const p = spine[i]; s += `<path d="${taper(walk(p[0], p[1] + 4, PI / 2 + bend, 18, 0, -bend, 10), 5, 2.4)}"/>` + curl(p[0] + bend * 30, p[1] + 21, .2, 5, .9, 1.6, .3, 10); }
    // wing: membrane cut with lace holes, ribs ending in curls
    const root = [14, -42], tips = [[-30, -66], [-14, -78], [4, -82], [20, -76]];
    let wing = `M${root.join(' ')}`; tips.forEach((t, j) => { wing += `L${t.join(' ')}`; if (j < tips.length - 1) { const n = tips[j + 1]; wing += `Q${r1((t[0] + n[0]) / 2)} ${r1((t[1] + n[1]) / 2 + 9)} ${n.join(' ')}`; } });
    wing += 'Z'; const R = rng(14); for (let k = 0; k < Math.round(16 * LACE); k++) { const t = R(), u = R() * .7 + .15; const tp = tips[Math.floor(t * 3.99)]; wing += circ(root[0] + (tp[0] - root[0]) * u, root[1] + (tp[1] - root[1]) * u + 4, 1 + R() * 1.4); }
    s += `<path fill-rule="evenodd" d="${wing}"/>` + tips.map(t => curl(t[0], t[1], Math.atan2(t[1] - root[1], t[0] - root[0]), 9, -.7, 2, .3, 14)).join('');
    s += `<path d="M48-46C54-51 61-50 65-47L73-45C74.4-44.2 73.6-42.4 71.6-42.6L63-43C64-41.6 65-41 64.4-40C62-39.6 57-39.6 53-40.4C50-41 47.6-42.6 47.4-44Z"/><circle cx="58" cy="-46.2" r=".9" style="fill:var(--lit,#f7d894)"/>`;
    s += `<g class="sh-jaw" data-hinge="62 -42"><path d="M62-41.4C66-40 70-38 72-36L71-35C67-36.2 63-38 60.6-39.6Z"/>${curl(70, -36, PI / 2 - .5, 42, .32, 1.6, .4, 30)}</g>`;
    s += hair(52, -47, { n: 15, from: PI * .62, to: PI * 1.62, r: 4, len: [9, 17], w: 1.6, seed: 21, rings: [[40, -52, 1.2], [44, -60, 1.4], [52, -63, 1.2], [36, -46, 1]] });
    return s; } },
};
export const FIGURES = Object.keys(FIG);
export const figureInfo = name => ({ faces: FIG[name].faces, height: FIG[name].h, hinges: FIG[name].hinges || {} });

// figure('guest', {x, y, scale, flip, pose, faint, heart, lamp, shield, cls, id, attrs})
// Facing right unless flip. Madeline is gauze (pale paper): faint above water unless {faint:false}.
export function figure(name, o = {}) {
  const f = FIG[name]; if (!f) throw new Error('no cut called ' + name);
  const { x = 0, y = 0, scale = 1, flip = false, cls = '', id = '', attrs = '' } = o;
  const sx = r1(f.faces * (flip ? -1 : 1) * scale * 1000) / 1000;
  const fill = f.gauze ? `style="fill:var(--gauze,#f6ead2);${o.faint === false ? '' : 'opacity:var(--gauze-a,.42)'}"` : 'fill="currentColor"';
  // outer <g>: class and state only (safe for CSS transforms: .touch, lifts) › position › .sh-pose (bob, sway) › scale
  return `<g class="sh-fig sh-${name} ${cls}" data-fig="${name}"${id ? ` id="${id}"` : ''} ${attrs}><g class="sh-at" transform="translate(${r1(x)} ${r1(y)})"><g class="sh-pose"><g transform="scale(${sx} ${scale})" ${fill}>${f.draw(o)}</g></g></g></g>`;
}
// Move a placed figure (an element made by figure()) without touching its classes or state.
export function place(el, x, y) { el.querySelector('.sh-at').setAttribute('transform', `translate(${r1(x)} ${r1(y)})`); }
// Turn a hinged part (".sh-arm", ".sh-jaw") inside a placed figure: hinge(figEl, '.sh-arm', −20)
export function hinge(el, sel, deg) {
  const p = el.querySelector(sel); if (!p) return;
  const [hx, hy] = p.dataset.hinge.split(' ').map(Number);
  p.setAttribute('transform', `rotate(${deg} ${hx} ${hy})`);
}

/* ---------- type on light, frames, iris ---------- */
// A lit card in a cut frame with scroll ends: black type on lamplight (titles, intertitles above water).
export function card({ x = 206, y = 30, w = 548, h = 98, text = '', size = 43, italic = false, sub = '' } = {}) {
  const ix = x + 14, iy = y + 12, iw = w - 28, ih = h - 24;
  return g(`<path d="M${x} ${y}h${w}v${h}H${x}Z"/><path d="M${ix} ${iy}h${iw}v${ih}H${ix}Z" fill="url(#sh-lamp)"/>${scallops(ix + 6, ix + iw - 6, iy, 2.4, 7.5)}${scallops(ix + 6, ix + iw - 6, iy + ih, 2.4, 7.5)}` +
    [[x, 1], [x + w, -1]].map(([xx, s]) => curl(xx, y + h / 2, s > 0 ? PI : 0, 40, s * -.42, 12, .7, 40) + curl(xx, y + 20, s > 0 ? PI - .5 : .5, 26, s * -.6, 5, .4) + curl(xx, y + h - 20, s > 0 ? PI + .5 : -.5, 26, s * .6, 5, .4)).join('') +
    curl(x + w / 2, y, -PI / 2 - .2, 20, -.7, 4, .4) + curl(x + w / 2, y, -PI / 2 + .2, 20, .7, 4, .4) + `<circle cx="${x + w / 2}" cy="${y - 8}" r="2.6"/>` +
    `<text x="${x + w / 2}" y="${r1(iy + ih / 2 + size * .33)}" text-anchor="middle" style="font-family:var(--sh-serif,'IM Fell English',Georgia,serif);font-size:${size}px;${italic ? 'font-style:italic;' : ''}fill:var(--sh-cut,#0b0809)">${esc(text)}</text>` +
    (sub ? `<text x="${x + w / 2}" y="${y + h + 24}" text-anchor="middle" style="font-family:var(--sh-serif,'IM Fell English',Georgia,serif);font-size:13px;letter-spacing:.16em;fill:var(--sh-lamp,#f7d894)">${esc(sub.toUpperCase())}</text>` : ''),
    'class="sh-card" fill="currentColor" style="color:var(--sh-cut,#0b0809)"');
}
// The dialogue strip: a black cut ribbon on the glass; speaker in rose caps, line in paper.
export function banner({ speaker = '', line = '', x = 70, y = 576, w = 820, h = 44, portrait = '' } = {}) {
  const tx = portrait ? x + 62 : x + 26;
  return g(`<path d="M${x} ${y}h${w}v${h}H${x}Z"/>${scallops(x + 6, x + w - 6, y, 2.2, 7.4)}${scallops(x + 6, x + w - 6, y + h, 2.2, 7.4)}` +
    [[x + 2, 1], [x + w - 2, -1]].map(([xx, s]) => curl(xx, y + h / 2, s > 0 ? PI + .1 : -.1, 30, s * -.55, 9, .6) + curl(xx, y + h / 2 - 6, s > 0 ? -PI / 2 - .3 : -PI / 2 + .3, 22, s * -.8, 4, .4) + curl(xx, y + h / 2 + 8, s > 0 ? PI / 2 + .3 : PI / 2 - .3, 22, s * .8, 4, .4)).join('') +
    `<path d="M${x + 10} ${y + 5.5}H${x + w - 10}M${x + 10} ${y + h - 5.5}H${x + w - 10}" style="stroke:var(--sh-lamp,#f7d894);stroke-width:.6;opacity:.35"/>` +
    (portrait ? `<ellipse cx="${x + 34}" cy="${y + h / 2}" rx="14" ry="17.5" fill="url(#sh-lamp)"/>${portrait}<ellipse cx="${x + 34}" cy="${y + h / 2}" rx="14" ry="17.5" style="fill:none;stroke:currentColor;stroke-width:2.4"/>` : '') +
    (speaker ? `<text x="${tx}" y="${y + 15}" style="font-family:var(--sh-serif,'IM Fell English',Georgia,serif);font-size:12px;letter-spacing:.2em;fill:#d79a6a">${esc(speaker.toUpperCase())}</text>` : '') +
    `<text x="${tx}" y="${y + h - 9}" style="font-family:var(--sh-serif,'IM Fell English',Georgia,serif);font-size:21px;fill:var(--sh-paper,#ede2cb)">${esc(line)}</text>`,
    'class="sh-banner" fill="currentColor" style="color:var(--sh-cut,#0b0809)"');
}
// A Roderick cameo for the banner (clipped to the oval).
export const cameo = (x, y, id = 'sh-cameo') => `<clipPath id="${id}"><ellipse cx="${x}" cy="${y}" rx="14" ry="17.5"/></clipPath><g clip-path="url(#${id})">${figure('roderick', { x: x + 2, y: y + 27, scale: 1.05, pose: 'sit' })}</g>`;
// The stage's lace frame (the proscenium). Draw last.
export function frame({ w = 960, h = 640, i = 14 } = {}) {
  let s = `<path fill-rule="evenodd" d="M0 0H${w}V${h}H0ZM${i} ${i}V${h - i}H${w - i}V${i}Z"/>` + scallops(i + 8, w - i - 8, i, 3.1, 10.6) + scallops(i + 8, w - i - 8, h - i, 3.1, 10.6) + scallopsV(i, i + 8, h - i - 8, 3.1, 10.6) + scallopsV(w - i, i + 8, h - i - 8, 3.1, 10.6);
  for (const [x, y, sx, sy] of [[0, 0, 1, 1], [w, 0, -1, 1], [0, h, 1, -1], [w, h, -1, -1]])
    s += `<g transform="translate(${x} ${y}) scale(${sx} ${sy})">${curl(i, i, .22, 50, .42, 5, .5)}${curl(i, i, PI / 2 - .22, 50, -.42, 5, .5)}${curl(i, i, PI / 4, 26, .6, 3.4, .4)}<circle cx="${i + 19}" cy="${i + 19}" r="2.2"/></g>`;
  return g(s + `<rect x="5.5" y="5.5" width="${w - 11}" height="${h - 11}" style="fill:none;stroke:var(--sh-lamp,#f7d894);stroke-width:.7;opacity:.4"/>`, 'class="sh-frame" fill="currentColor" style="color:var(--sh-cut,#0b0809)" pointer-events="none"');
}
// Iris: black stage with a scalloped round hole (lace-edged), centre (cx,cy), radius r. Animate r.
export function irisD(cx, cy, r, { w = 960, h = 640 } = {}) {
  let d = `M-20 -20H${w + 20}V${h + 20}H-20Z`;
  if (r <= 0) return d;
  const n = Math.max(18, Math.round(r / 7)), bump = Math.min(6, r * .08);
  d += `M${r1(cx + r)} ${cy}`;
  for (let k = 1; k <= n; k++) { const a = k * 2 * PI / n; d += `A${r1(bump)} ${r1(bump)} 0 0 0 ${r1(cx + Math.cos(a) * r)} ${r1(cy + Math.sin(a) * r)}`; }
  return d + 'Z';
}
export const iris = (cx, cy, r) => `<path class="sh-iris" fill-rule="evenodd" d="${irisD(cx, cy, r)}" style="fill:var(--sh-cut,#0b0809)"/>`;
// Run it: closes or opens the iris path in `el` (a <path class="sh-iris">). Resolves when done.
export function runIris(el, cx, cy, from, to, ms = 700) {
  return new Promise(done => {
    const t0 = performance.now();
    requestAnimationFrame(function f(t) {
      const k = Math.min(1, (t - t0) / ms), e = k < .5 ? 2 * k * k : 1 - (2 - 2 * k) ** 2 / 2;
      el.setAttribute('d', irisD(cx, cy, from + (to - from) * e));
      k < 1 ? requestAnimationFrame(f) : done();
    });
  });
}

/* ---------- shared defs: put once in each <svg> (ids are prefixed sh-) ---------- */
function grad(id, stops, attrs) {
  return `<linearGradient id="${id}" ${attrs}>${stops.map((st, i) => { const [c, o] = st.split(' '); return `<stop offset="${o ?? (i === 0 ? 0 : 1)}" stop-color="${c}"/>`; }).join('')}</linearGradient>`;
}
export function defs({ animate = true } = {}) {
  let skies = '';
  for (const [ch, L] of Object.entries(LIGHT)) {
    skies += grad(`sh-sky-${ch}`, L.sky, 'x1="0" y1="0" x2="0" y2="1"');
    skies += `<radialGradient id="sh-halo-${ch}" cx=".52" cy=".92" r=".75"><stop offset="0" stop-color="${L.halo}" stop-opacity=".55"/><stop offset=".45" stop-color="${L.halo}" stop-opacity=".16"/><stop offset="1" stop-color="${L.halo}" stop-opacity="0"/></radialGradient>`;
    skies += grad(`sh-glass-${ch}`, [L.glass[0], `${L.glass[1]} .45`, L.glass[2]], 'x1="0" y1="0" x2="0" y2="1"');
  }
  return `<defs>${skies}
<linearGradient id="sh-lamp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff0c2"/><stop offset="1" stop-color="#f2c06e"/></linearGradient>
<linearGradient id="sh-trunk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f5e3b8"/><stop offset="1" stop-color="#d9a76a"/></linearGradient>
<radialGradient id="sh-room-gal" cx=".5" cy=".7" r=".7"><stop offset="0" stop-color="#f8d993"/><stop offset="1" stop-color="#cf8a4e"/></radialGradient>
<radialGradient id="sh-room-bed" cx=".55" cy=".55" r=".75"><stop offset="0" stop-color="#f6e2b0"/><stop offset="1" stop-color="#c58a5a"/></radialGradient>
<radialGradient id="sh-room-hall" cx=".35" cy=".7" r=".8"><stop offset="0" stop-color="#eeb066"/><stop offset="1" stop-color="#94574f"/></radialGradient>
<radialGradient id="sh-room-stair" cx=".5" cy=".4" r=".8"><stop offset="0" stop-color="#8e6f9c"/><stop offset="1" stop-color="#3e2c54"/></radialGradient>
<radialGradient id="sh-room-studio" cx=".6" cy=".25" r=".9"><stop offset="0" stop-color="#f6c172"/><stop offset=".55" stop-color="#d08655"/><stop offset="1" stop-color="#8a4f58"/></radialGradient>
<radialGradient id="sh-flick" cx=".7" cy=".2" r=".6"><stop offset="0" stop-color="#ffe9b5" stop-opacity=".35"/><stop offset="1" stop-color="#ffe9b5" stop-opacity="0"/></radialGradient>
<pattern id="sh-lattice" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0V4M0 0H4" style="stroke:#0b0809;stroke-width:.7"/></pattern>
<pattern id="sh-lattice-l" width="13" height="13" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0V13M0 0H13" style="stroke:#0b0809;stroke-width:1.6"/></pattern>
<linearGradient id="sh-deep" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".62"/><stop offset=".5" stop-color="#fff" stop-opacity=".34"/><stop offset="1" stop-color="#fff" stop-opacity=".08"/></linearGradient>
<mask id="sh-depth" maskUnits="userSpaceOnUse" x="0" y="${WATER}" width="960" height="${H - WATER}"><rect x="0" y="${WATER}" width="960" height="${H - WATER}" fill="url(#sh-deep)"/></mask>
<filter id="sh-ripple" x="-5%" y="-10%" width="110%" height="120%" color-interpolation-filters="sRGB">
  <feTurbulence type="turbulence" baseFrequency="0.006 0.09" numOctaves="2" seed="7" result="n">${animate ? '<animate attributeName="baseFrequency" dur="14s" repeatCount="indefinite" values="0.006 0.09;0.006 0.115;0.006 0.09"/>' : ''}</feTurbulence>
  <feDisplacementMap in="SourceGraphic" in2="n" scale="7" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="2.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="d"/></feMerge></filter>
<filter id="sh-ripple-still" x="-5%" y="-20%" width="110%" height="140%" color-interpolation-filters="sRGB">
  <feTurbulence type="turbulence" baseFrequency="0.008 0.11" numOctaves="2" seed="3" result="n"/>
  <feDisplacementMap in="SourceGraphic" in2="n" scale="6" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="1.8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="d"/></feMerge></filter>
<filter id="sh-glow" x="-60%" y="-30%" width="220%" height="160%"><feGaussianBlur in="SourceGraphic" stdDeviation="3.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<filter id="sh-soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="6"/></filter>
<filter id="sh-lift" x="-20%" y="-20%" width="140%" height="150%"><feGaussianBlur in="SourceAlpha" stdDeviation="3" result="b"/><feOffset in="b" dx="0" dy="4" result="o"/><feComponentTransfer in="o" result="s"><feFuncA type="linear" slope=".45"/></feComponentTransfer><feMerge><feMergeNode in="s"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<filter id="sh-rim" x="-20%" y="-20%" width="140%" height="140%"><feMorphology in="SourceAlpha" operator="dilate" radius="1.6" result="d"/><feGaussianBlur in="d" stdDeviation="1.3" result="b"/><feFlood flood-color="#f7d894"/><feComposite in2="b" operator="in" result="rim"/><feMerge><feMergeNode in="rim"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<filter id="sh-rim-soft" x="-20%" y="-20%" width="140%" height="140%"><feMorphology in="SourceAlpha" operator="dilate" radius=".8" result="d"/><feGaussianBlur in="d" stdDeviation="1" result="b"/><feFlood flood-color="#f7d894" flood-opacity=".55"/><feComposite in2="b" operator="in" result="rim"/><feMerge><feMergeNode in="rim"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<filter id="sh-press" x="-20%" y="-20%" width="140%" height="140%"><feMorphology in="SourceAlpha" operator="dilate" radius=".6" result="d"/><feFlood flood-color="#fff3d0"/><feComposite in2="d" operator="in" result="rim"/><feMerge><feMergeNode in="rim"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>`;
}
// Convenience: a whole stage <svg> string.
export const stage = (inner, { cls = '', label = '' } = {}) =>
  `<svg class="sh-stage ${cls}" viewBox="0 0 960 640" role="img"${label ? ` aria-label="${esc(label)}"` : ''}>${defs()}${inner}${frame()}</svg>`;
