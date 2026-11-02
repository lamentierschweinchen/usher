// game/shared/arrangement.js — A Mere Different Arrangement [u02]: cut-outs on rods before a
// lamp; their shadows are what's there. The spine's first interlude stands on it, and later
// scenes reuse it. Read-only for games (the spine builder owns it).
//
//   import * as A from '../shared/arrangement.js';
//   const st = A.createStage(svg, { pieces: [{ id: 'chair', x: 260, groove: 'back' }, …] });
//   st.setHer({ box: [580, 130, 120, 270] });  st.on('toggle', e => …);  st.cover('chair');
//
// Units are the stage's viewBox, 960×640. A piece stands with its foot on its groove; its rod
// runs down through the groove to a lamp-lit stud, the handle. Its shadow is the piece scaled
// about P: nearer the lamp is larger and less distinct. Whatever moves without a rod is the
// house, or her.

import * as C from './cuts.js';

const NS = 'http://www.w3.org/2000/svg';
const r1 = n => Math.round(n * 10) / 10;
const ease = k => (k < .5 ? 2 * k * k : 1 - (2 - 2 * k) ** 2 / 2);

export const DEFAULTS = {
  lamp: [480, 622],
  P: [480, 700],
  wallFoot: 400,
  doorway: [30, 130],
  grooves: {
    back: { y: 505, x: [200, 760], k: 1.55, blur: 1.5, opacity: 1, gain: 1 },
    front: { y: 590, x: [330, 630], k: 2.7, blur: 9, opacity: .82, gain: .6 },
  },
  gap: 110,          // rods on one groove stay this far apart
  rodLen: 30,
  hit: [128, 210],   // the least a rod's hit area may be: 128 units is 48 px on a 358 px phone stage (45 px is the floor)
  herPad: 24,
  tapPx: 8, tapMs: 600,
  still: false,      // reduced motion: moves cut, with a short fade
};

// A piece's shadow: its markup scaled about P by k, blurred in stage units.
export function castShadow(markup, P, k, blur = 0, opacity = 1, { prefix = 'ar', cls = '' } = {}) {
  const f = blur ? ` filter="url(#${prefix}-blur-${String(blur).replace('.', '_')})"` : '';
  return `<g class="${cls}"${f} opacity="${opacity}"><g transform="translate(${P[0]} ${P[1]}) scale(${k}) translate(${-P[0]} ${-P[1]})">${markup}</g></g>`;
}
export const blurDef = (v, prefix = 'ar') =>
  `<filter id="${prefix}-blur-${String(v).replace('.', '_')}" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="${v}"/></filter>`;

// Her 48 sample points: six at the head, forty-two over the body, inside her box [x, y, w, h].
export function herSamples([x, y, w, h]) {
  const cx = x + w / 2, out = [];
  const hy = y + h * .085, hr = h * .06;
  for (const [dx, dy] of [[0, 0], [-.6, -.4], [.6, -.4], [-.6, .5], [.6, .5], [0, .85]]) out.push({ x: cx + dx * hr, y: hy + dy * hr, head: true });
  for (let row = 0; row < 6; row++) {
    const t = row / 5, ry = y + h * (.2 + .72 * t), rw = w * (.38 + .5 * t) * .9;
    for (let c = 0; c < 7; c++) out.push({ x: cx + (c / 6 - .5) * rw, y: ry, head: false });
  }
  return out;
}

let stages = 0;

export function createStage(svg, options = {}) {
  const o = { ...DEFAULTS, ...options, grooves: { ...DEFAULTS.grooves, ...(options.grooves || {}) } };
  const id = `ar${++stages}`;
  const [W, H] = [960, 640];
  const listeners = {};
  const emit = (name, data = {}) => (listeners[name] || []).forEach(fn => fn(data));
  const log = [];
  const t0 = performance.now();
  const now = () => +((performance.now() - t0) / 1000).toFixed(2);
  const blurs = [...new Set(Object.values(o.grooves).map(g => g.blur).filter(Boolean))];

  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.classList.add('sh-arrangement');
  svg.style.touchAction = 'none';
  const [dx0, dx1] = o.doorway;
  svg.innerHTML = `
<defs>
  ${blurs.map(v => blurDef(v, id)).join('')}
  <radialGradient id="${id}-wall" cx="${o.lamp[0] / W}" cy="1.05" r=".95">
    <stop offset="0" stop-color="#f6d89a"/><stop offset=".45" stop-color="#c98d5c"/><stop offset=".8" stop-color="#5a3440"/><stop offset="1" stop-color="#241a34"/>
  </radialGradient>
  <radialGradient id="${id}-pool" cx="${o.lamp[0] / W}" cy="${o.lamp[1] / H}" r=".42" gradientUnits="objectBoundingBox">
    <stop offset="0" stop-color="#f2b866" stop-opacity=".55"/><stop offset=".5" stop-color="#8a4f3a" stop-opacity=".22"/><stop offset="1" stop-color="#0b0809" stop-opacity="0"/>
  </radialGradient>
  <clipPath id="${id}-wallclip"><rect width="${W}" height="${o.wallFoot}"/></clipPath>
  <mask id="${id}-rimmask" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}">
    <rect width="${W}" height="${H}" fill="#fff"/><g class="ar-rim-cut" style="fill:#000;color:#000;--lit:#000"></g>
  </mask>
</defs>
<rect class="ar-wall" width="${W}" height="${o.wallFoot}" fill="url(#${id}-wall)"/>
<path class="ar-doorway" d="M${dx0} ${o.wallFoot}V${o.wallFoot - 210}Q${(dx0 + dx1) / 2} ${o.wallFoot - 250} ${dx1} ${o.wallFoot - 210}V${o.wallFoot}Z" style="fill:#2a1d27;opacity:.75"/>
<g clip-path="url(#${id}-wallclip)">
  <g class="ar-kept"></g>
  <g class="ar-her" opacity="0"></g>
  <g class="ar-shadows"></g>
  <g class="ar-rim" mask="url(#${id}-rimmask)" opacity="0"></g>
</g>
<rect class="ar-floor" y="${o.wallFoot}" width="${W}" height="${H - o.wallFoot}" style="fill:var(--sh-cut,#0b0809)"/>
<rect y="${o.wallFoot}" width="${W}" height="${H - o.wallFoot}" fill="url(#${id}-pool)"/>
${Object.entries(o.grooves).map(([g, v]) => `<path class="ar-groove ar-groove-${g}" d="M${v.x[0] - 40} ${v.y}H${v.x[1] + 40}" style="stroke:var(--sh-lamp,#f7d894);stroke-width:1;opacity:.5"/>`).join('')}
<g class="ar-lamp" transform="translate(${o.lamp[0]} ${o.lamp[1]})"></g>
<g class="ar-pieces" style="color:var(--sh-cut,#0b0809)"></g>
<rect class="ar-her-hit" fill="transparent" tabindex="-1" role="button" aria-label="her shadow"/>
<g class="ar-hands"></g>`;
  const $ = s => svg.querySelector(s);
  // the valet's lamp: a glow, a chimney, a flame
  $('.ar-lamp').innerHTML = `<circle r="40" style="fill:#f7d894;opacity:.28" filter="url(#sh-soft)"/>` +
    `<path d="M-13 0L-9-9H9L13 0Z" style="fill:var(--sh-cut,#0b0809)"/><path d="M-5-9V-24Q0-31 5-24V-9Z" style="fill:#fff0c2;opacity:.9"/>` +
    `<path d="M0-13Q-2.6-17 0-21Q2.6-17 0-13Z" style="fill:#f2b866"/>`;
  const layer = { kept: $('.ar-kept'), her: $('.ar-her'), shadows: $('.ar-shadows'), rim: $('.ar-rim'), rimCut: $('.ar-rim-cut'),
    pieces: $('.ar-pieces'), hands: $('.ar-hands'), herHit: $('.ar-her-hit'), lamp: $('.ar-lamp') };

  // ---- pieces ----
  const pieces = new Map();
  let active = null;     // the piece being tried: her rim shows where its shadow fails her
  function render(p) {
    const g = o.grooves[p.groove];
    p.el.setAttribute('transform', `translate(${r1(p.x)} ${r1(p.y ?? g.y)})`);
    // a shadow is all one dark: lit details in the cut (folds, studs) go dark with it
    const markup = `<g transform="translate(${r1(p.x + p.dx)} ${r1(p.y ?? g.y)})" style="fill:var(--sh-shadow,#0b0809);--lit:var(--sh-shadow,#0b0809)">${C.PIECES[p.id].draw()}</g>`;
    p.shadow.innerHTML = castShadow(markup, o.P, p.k ?? g.k, p.blur ?? g.blur, p.opacity ?? g.opacity, { prefix: id }).replace(/^<g class=""/, '<g');
    if (p === active) drawRimCut();
  }
  function addPiece({ id: pid, x, groove = 'back' }) {
    const p = { id: pid, x, groove, dx: 0, el: document.createElementNS(NS, 'g'), shadow: document.createElementNS(NS, 'g') };
    p.el.setAttribute('class', `ar-piece ar-piece-${pid}`);
    p.el.setAttribute('tabindex', '0');
    p.el.setAttribute('role', 'button');
    p.el.setAttribute('aria-label', `${pid}, on a rod`);
    p.el.dataset.id = pid;
    p.el.innerHTML = `${C.rod(o.rodLen)}${C.piece(pid)}`;
    p.shadow.setAttribute('class', `ar-shadow ar-shadow-${pid}`);
    layer.pieces.append(p.el);
    layer.shadows.append(p.shadow);
    pieces.set(pid, p);
    render(p);
    return p;
  }
  (o.pieces || []).forEach(addPiece);
  const order = () => [...pieces.values()].sort((a, b) => (a.groove === b.groove ? 0 : a.groove === 'front' ? -1 : 1));
  // keep the front groove's pieces drawn on top
  function restack() { for (const p of [...order()].reverse()) layer.pieces.append(p.el); }
  restack();

  // the x nearest `want` on `groove` that keeps the gap to every other rod there
  function slot(p, groove, want) {
    const g = o.grooves[groove];
    const others = [...pieces.values()].filter(q => q !== p && q.groove === groove).map(q => q.x);
    let best = null;
    for (let x = g.x[0]; x <= g.x[1]; x++) {
      if (others.some(ox => Math.abs(ox - x) < o.gap)) continue;
      if (best === null || Math.abs(x - want) < Math.abs(best - want)) best = x;
    }
    return best;
  }
  // a drag keeps to its groove and never passes a neighbour
  function constrain(p, want) {
    const g = o.grooves[p.groove];
    let lo = g.x[0], hi = g.x[1];
    for (const q of pieces.values()) {
      if (q === p || q.groove !== p.groove) continue;
      if (q.x <= p.x) lo = Math.max(lo, q.x + o.gap); else hi = Math.min(hi, q.x - o.gap);
    }
    return Math.max(lo, Math.min(hi, want));
  }

  function tween(ms, step) {
    if (o.still || ms <= 0) { step(1); return Promise.resolve(); }
    return new Promise(done => {
      const t0 = performance.now();
      let over = false;
      const finish = () => { if (!over) { over = true; step(1); done(); } };
      requestAnimationFrame(function f(t) { if (over) return; const k = Math.min(1, (t - t0) / ms); step(ease(k)); k < 1 ? requestAnimationFrame(f) : finish(); });
      setTimeout(finish, ms + 200);
    });
  }
  // reduced motion: a move is a cut with a short fade
  async function fadeCut(els, apply) {
    els.forEach(e => e.style.transition = 'opacity 100ms'); els.forEach(e => e.style.opacity = '0');
    await new Promise(r => setTimeout(r, 100)); apply(); els.forEach(e => e.style.opacity = '');
    await new Promise(r => setTimeout(r, 100));
  }

  async function moveTo(pid, x, by = 'player', ms = 600, { record = true } = {}) {
    const p = pieces.get(pid);
    const to = constrain(p, x), from = p.x;
    if (o.still && ms) await fadeCut([p.el, p.shadow], () => { p.x = to; render(p); });
    else await tween(ms, k => { p.x = from + (to - from) * k; render(p); });
    if (record) log.push({ t: now(), id: pid, x: r1(p.x), groove: p.groove, by });
    emit('move', { id: pid, x: p.x, by });
  }
  async function toggle(pid, by = 'player') {
    const p = pieces.get(pid);
    const to = p.groove === 'back' ? 'front' : 'back';
    const x = slot(p, to, p.x);
    if (x === null) { emit('blocked', { id: pid }); return false; }
    const a = o.grooves[p.groove], b = o.grooves[to], x0 = p.x;
    const apply = k => { p.x = x0 + (x - x0) * k; p.y = a.y + (b.y - a.y) * k; p.k = a.k + (b.k - a.k) * k;
      p.opacity = a.opacity + (b.opacity - a.opacity) * k; p.blur = k < .5 ? a.blur : b.blur; render(p); };
    if (o.still) await fadeCut([p.el, p.shadow], () => apply(1)); else await tween(250, apply);
    p.groove = to; delete p.y; delete p.k; delete p.opacity; delete p.blur;
    restack(); render(p);
    log.push({ t: now(), id: pid, x: r1(p.x), groove: to, by });
    emit('toggle', { id: pid, groove: to, by });
    return true;
  }
  // the house moves a shadow and leaves its rod where it stands
  async function slideShadow(pid, dx, ms = 900) {
    const p = pieces.get(pid), from = p.dx;
    if (o.still) await fadeCut([p.shadow], () => { p.dx = from + dx; render(p); });
    else await tween(ms, k => { p.dx = from + dx * k; render(p); });
    log.push({ t: now(), id: pid, x: r1(p.x + p.dx), groove: p.groove, by: 'house' });
    emit('move', { id: pid, x: p.x, by: 'house' });
  }
  // a shadow with no rod: it stays on the wall, and the piece casts a fresh one
  function keep(pid) {
    const p = pieces.get(pid);
    const k = p.shadow.cloneNode(true);
    k.setAttribute('class', `ar-kept-shadow ar-kept-${pid}`);
    layer.kept.append(k);
    p.dx = 0;
    render(p);
    return k;
  }

  // ---- her ----
  const her = { box: null, visible: false, el: null };
  function drawHer() {
    if (!her.box) return;
    const [x, y, w, h] = her.box, s = h / 44;
    const fig = (extra) => C.figure('madeline', { x: x + w / 2 - 2 * s, y: y + h, scale: s, ...extra });
    layer.her.innerHTML = fig({ shadow: true });
    layer.rim.innerHTML = fig({ rim: 'only' });
    const pad = o.herPad;
    const top = y - pad, bottom = Math.min(o.wallFoot, y + h + pad);
    layer.herHit.setAttribute('x', x - pad); layer.herHit.setAttribute('y', top);
    layer.herHit.setAttribute('width', w + 2 * pad); layer.herHit.setAttribute('height', Math.max(0, bottom - top));
  }
  function setHer({ box, visible = true } = {}) {
    if (box) her.box = box;
    her.visible = visible;
    drawHer();
    layer.her.setAttribute('opacity', visible ? 1 : 0);
    layer.herHit.setAttribute('tabindex', visible ? '0' : '-1');
    layer.herHit.style.display = visible ? '' : 'none';
  }
  async function herTo(box, ms = 2000) {
    const from = her.box.slice();
    if (o.still) { her.box = box; drawHer(); return; }
    await tween(ms, k => { her.box = from.map((v, i) => v + (box[i] - v) * k); drawHer(); });
  }
  async function herFade(on, ms = 600) {
    if (o.still) ms = 200;
    layer.her.style.transition = `opacity ${ms}ms`;
    layer.her.setAttribute('opacity', on ? 1 : 0);
    her.visible = on;
    layer.herHit.style.display = on ? '' : 'none';
    await new Promise(r => setTimeout(r, ms));
  }

  // the rim shows only where the piece being tried fails to cover her (`active`, declared above)
  function drawRimCut() {
    if (!active) { layer.rimCut.innerHTML = ''; return; }
    const g = o.grooves[active.groove];
    const markup = `<g transform="translate(${r1(active.x + active.dx)} ${r1(active.y ?? g.y)})">${C.PIECES[active.id].draw()}</g>`;
    layer.rimCut.innerHTML = castShadow(markup, o.P, active.k ?? g.k, 0, 1, { prefix: id });
  }
  function tryPiece(p) {
    active = p || null;
    drawRimCut();
    layer.rim.style.transition = 'opacity 200ms';
    layer.rim.setAttribute('opacity', active && her.visible ? 1 : 0);
  }
  async function pulse(times = 1) {
    const wasActive = active;
    active = null; drawRimCut();
    for (let i = 0; i < times; i++) {
      layer.rim.style.transition = `opacity ${o.still ? 0 : 450}ms`;
      layer.rim.setAttribute('opacity', 1);
      await new Promise(r => setTimeout(r, 500));
      layer.rim.setAttribute('opacity', 0);
      await new Promise(r => setTimeout(r, 500));
    }
    if (wasActive) tryPiece(wasActive);
  }

  // ---- what a shadow covers ----
  function covers(p, pt) {
    const g = o.grooves[p.groove], k = p.k ?? g.k, gy = p.y ?? g.y;
    const qx = o.P[0] + (pt.x - o.P[0]) / k, qy = o.P[1] + (pt.y - o.P[1]) / k;
    const lx = qx - (p.x + p.dx), ly = qy - gy;
    return C.PIECES[p.id].solid.some(([rx, ry, rw, rh]) => lx >= rx && lx <= rx + rw && ly >= ry && ly <= ry + rh);
  }
  // how much of her one piece's shadow covers: { n, of, head, headOf, fraction }
  function cover(pid, samples = her.box ? herSamples(her.box) : []) {
    const p = pieces.get(pid);
    let n = 0, head = 0;
    const headOf = samples.filter(s => s.head).length;
    for (const s of samples) if (covers(p, s)) { n++; if (s.head) head++; }
    return { n, of: samples.length, head, headOf, fraction: samples.length ? n / samples.length : 0 };
  }
  // on release, a piece covering 80% of her eases up to 15 units to cover her
  async function settle(p) {
    if (!her.visible || !her.box || cover(p.id).fraction < .8) return;
    const start = p.x;
    let best = start, bestN = cover(p.id).n;
    for (let d = -15; d <= 15; d++) {
      const x = constrain(p, start + d);
      p.x = x;
      const n = cover(p.id).n;
      if (n > bestN || (n === bestN && Math.abs(x - start) < Math.abs(best - start))) { best = x; bestN = n; }
    }
    p.x = start;
    if (best !== start) await moveTo(p.id, best, 'player', 180, { record: false });
  }

  // ---- hands that move rods: the teaching glove, and the guest's own (m.) ----
  async function hand(pid, { dx = 0, toggle: tap = false, by = 'guest', ms = 1000 } = {}) {
    const p = pieces.get(pid), g = o.grooves[p.groove];
    const hnd = document.createElementNS(NS, 'g');
    hnd.setAttribute('class', `ar-hand ar-hand-${by}`);
    hnd.innerHTML = C.glove();
    const at = (x, y) => hnd.setAttribute('transform', `translate(${r1(x)} ${r1(y)}) rotate(180) scale(1.4)`);
    const sy = (p.y ?? g.y) + o.rodLen;
    at(p.x, sy + 60);
    layer.hands.append(hnd);
    hnd.style.opacity = '0'; hnd.style.transition = 'opacity 250ms';
    requestAnimationFrame(() => { hnd.style.opacity = '1'; });
    await tween(o.still ? 0 : 450, k => at(p.x, sy + 60 * (1 - k)));
    if (dx) {
      const from = p.x, to = constrain(p, p.x + dx);
      if (o.still) await fadeCut([p.el, p.shadow, hnd], () => { p.x = to; render(p); at(p.x, sy); });
      else await tween(ms, k => { p.x = from + (to - from) * k; render(p); at(p.x, sy); });
      if (by !== 'glove') log.push({ t: now(), id: pid, x: r1(p.x), groove: p.groove, by });
      emit('move', { id: pid, x: p.x, by });
    }
    if (tap) { await new Promise(r => setTimeout(r, 200)); await toggle(pid, by); }
    hnd.style.opacity = '0';
    await new Promise(r => setTimeout(r, 300));
    hnd.remove();
  }

  // ---- the player's hand: one pointer; a tap moves under 8 px and lifts within 600 ms ----
  function toStage(e) {
    const m = svg.getScreenCTM();
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    return { x: pt.x, y: pt.y, scale: m.a };
  }
  // each rod's hit area is its cut and rod, padded to at least 120×200, front pieces on top
  function hitBox(p) {
    const g = o.grooves[p.groove], pc = C.PIECES[p.id], gy = p.y ?? g.y;
    const w = Math.max(o.hit[0], pc.w), x0 = p.x - w / 2;
    let y0 = gy - pc.h, y1 = gy + o.rodLen + 8;
    const need = o.hit[1] - (y1 - y0);
    if (need > 0) { const down = Math.min(need, H - y1); y1 += down; y0 -= need - down; }
    return [x0, y0, w, y1 - y0];
  }
  function pick(pt) {
    const inside = ([x, y, w, h]) => pt.x >= x && pt.x <= x + w && pt.y >= y && pt.y <= y + h;
    const hits = order().filter(p => inside(hitBox(p)));
    if (hits.length) {
      const front = hits.filter(p => p.groove === 'front');
      const pool = front.length ? front : hits;
      return { piece: pool.sort((a, b) => Math.abs(a.x - pt.x) - Math.abs(b.x - pt.x))[0] };
    }
    if (her.visible && her.box && pt.y < o.wallFoot) {
      const [x, y, w, h] = her.box, pad = o.herPad;
      if (pt.x >= x - pad && pt.x <= x + w + pad && pt.y >= y - pad && pt.y <= y + h + pad) return { her: true };
    }
    return null;
  }
  let press = null;
  svg.addEventListener('pointerdown', e => {
    if (!e.isPrimary || press || locked) return;
    const pt = toStage(e), hit = pick(pt);
    emit('touch', {});
    if (!hit) return;
    e.preventDefault();
    svg.setPointerCapture?.(e.pointerId);
    press = { id: e.pointerId, sx: e.clientX, sy: e.clientY, t: performance.now(), pt, hit, dragging: false, x0: hit.piece?.x };
    if (hit.piece) { tryPiece(hit.piece); hit.piece.el.classList.add('is-held'); }
  });
  svg.addEventListener('pointermove', e => {
    if (!press || e.pointerId !== press.id) return;
    const moved = Math.hypot(e.clientX - press.sx, e.clientY - press.sy);
    if (!press.dragging && moved >= o.tapPx && press.hit.piece) { press.dragging = true; emit('drag', { id: press.hit.piece.id }); }
    if (press.dragging) {
      const p = press.hit.piece, pt = toStage(e), g = o.grooves[p.groove];
      p.x = constrain(p, press.x0 + (pt.x - press.pt.x) * g.gain);
      render(p);
    }
  });
  const end = async e => {
    if (!press || e.pointerId !== press.id) return;
    const pr = press; press = null;
    pr.hit.piece?.el.classList.remove('is-held');
    const quick = performance.now() - pr.t <= o.tapMs && Math.hypot(e.clientX - pr.sx, e.clientY - pr.sy) < o.tapPx;
    if (e.type === 'pointercancel') { if (pr.dragging) render(pr.hit.piece); return; }
    if (pr.hit.her) { if (quick) { log.push({ t: now(), id: 'her', by: 'player' }); emit('her', {}); } return; }
    const p = pr.hit.piece;
    if (pr.dragging) {
      log.push({ t: now(), id: p.id, x: r1(p.x), groove: p.groove, by: 'player' });
      emit('move', { id: p.id, x: p.x, by: 'player' });
      await settle(p);
      emit('release', { id: p.id });
    } else if (quick) {
      emit('tap', { id: p.id });
      await toggle(p.id, 'player');
    }
  };
  svg.addEventListener('pointerup', end);
  svg.addEventListener('pointercancel', end);

  // keyboard: Tab between rods (and her), ←/→ for 30 units, Enter to tap
  svg.addEventListener('keydown', async e => {
    if (locked) return;
    const pid = e.target.closest?.('.ar-piece')?.dataset.id;
    if (e.target === layer.herHit && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); emit('touch', {}); log.push({ t: now(), id: 'her', by: 'player' }); emit('her', {}); return; }
    if (!pid) return;
    const p = pieces.get(pid);
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault(); emit('touch', {}); tryPiece(p);
      await moveTo(pid, p.x + (e.key === 'ArrowLeft' ? -30 : 30), 'player', 150);
      await settle(p); emit('release', { id: pid });
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault(); emit('touch', {}); tryPiece(p); emit('tap', { id: pid }); await toggle(pid, 'player');
    }
  });

  let locked = false;
  return {
    svg, options: o,
    on(name, fn) { (listeners[name] ||= []).push(fn); return () => { listeners[name] = listeners[name].filter(f => f !== fn); }; },
    piece: pid => pieces.get(pid),
    pieces: () => [...pieces.values()],
    addPiece, moveTo, toggle, slideShadow, keep, hand, setHer, herTo, herFade, pulse, tryPiece, cover, herSamples,
    her: () => ({ ...her }),
    hitBox,
    lock(on = true) { locked = on; },
    record: () => log.slice(),
    // where a stage point lands on the screen (for tests and for the lines placed over the stage)
    screen([x, y]) { const m = svg.getScreenCTM(); const p = new DOMPoint(x, y).matrixTransform(m); return { x: p.x, y: p.y }; },
    destroy() { svg.innerHTML = ''; svg.classList.remove('sh-arrangement'); },
  };
}
