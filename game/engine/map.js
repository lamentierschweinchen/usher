// The map: the house in cutaway over its twin in the tarn. Draws once, then
// moves figures, lights the rooms, changes the chapter's light, shows the tarn's truths.

import { svg, tween, sleep, reducedMotion } from './util.js';
import { mapMarkup, actorFigure, placeFigure, ROOMS, TRUTH_IDS } from './drawing.js';

// Walkable points (feet), and how they join: over the bank, up the arched
// causeway (it climbs from 350 to 336), through the hall's arch, the stair's two flights.
export const NODES = {
  off: [-8, 336], bankTop: [56, 334], cwStart: [150, 350], brink: [214, 343], doorSpot: [262, 338],
  arch: [293, 338], hall: [372, 338], stairFoot: [446, 338], studio: [610, 338],
  landing: [511, 284], bedroom: [372, 278], stairTop: [449, 221], gallery: [560, 216],
};
const EDGES = [
  ['off', 'bankTop'], ['bankTop', 'cwStart'], ['cwStart', 'brink'], ['brink', 'doorSpot'], ['doorSpot', 'arch'],
  ['arch', 'hall'], ['hall', 'stairFoot'], ['stairFoot', 'studio'], ['stairFoot', 'landing'],
  ['landing', 'bedroom'], ['landing', 'stairTop'], ['stairTop', 'gallery'],
];
// Where the cast stands (not on the walk graph).
export const SPOTS = {
  ...NODES,
  horse: [186, 346], peasant: [158, 349], servant: [262, 338], valet: [228, 342], physician: [282, 336],
  servantAway: [176, 347], sofa: [566, 338], sofaSit: [541, 325], hallValet: [398, 338], chair: [424, 278], threshold: [446, 278],
  galleryEast: [640, 216], galleryWest: [316, 216], landingEast: [511, 284],
  hallEast: [404, 338], hallWest: [330, 338], fallen: [398, 272], fallenUnder: [372, 278],
  servantWait: [200, 345], horseWait: [166, 348],
};
export const ROOM_NODE = {
  bank: 'brink', causeway: 'brink', door: 'doorSpot', hall: 'hall', stair: 'landing',
  bedroom: 'bedroom', gallery: 'gallery', studio: 'studio', vault: 'hall',
};
const NODE_ROOM = {
  off: 'bank', bankTop: 'bank', cwStart: 'causeway', brink: 'causeway', doorSpot: 'door', arch: 'hall',
  hall: 'hall', stairFoot: 'stair', studio: 'studio', landing: 'stair', bedroom: 'bedroom', stairTop: 'stair', gallery: 'gallery',
};
// the library has no peasant; a second servant's cut stands in for him
const FIG = { guest: 'guest', roderick: 'roderick', madeline: 'madeline', valet: 'valet', physician: 'physician', servant: 'servant', peasant: 'servant', horse: 'horse' };
const WALK = 90;      // per second (LOOK)
const GLIDE = 30;     // Madeline

const VIEW_WIDE = '0 0 960 640';
const VIEW_TALL = '150 40 540 600';

function route(from, to) {
  if (from === to) return [from];
  const prev = { [from]: null }, q = [from];
  while (q.length) {
    const n = q.shift();
    for (const [a, b] of EDGES) {
      const m = a === n ? b : b === n ? a : null;
      if (m && !(m in prev)) { prev[m] = n; if (m === to) q.length = 0; else q.push(m); }
    }
  }
  const path = [];
  for (let n = to; n; n = prev[n]) path.unshift(n);
  return path;
}

// A cast member: the library's figure, placed with C.place(). Facing lives on a
// wrapper that mirrors about the figure's own x, so a turn can go edge-on
// (scaleX 1 → 0 → −1, 160 ms) without touching the figure's outer <g>.
class Actor {
  constructor(id, castEl) {
    this.id = id;
    // the library bobs a figure while an ancestor is .sh-moving (Madeline never bobs)
    this.g = svg('g', { class: `actor sh-${FIG[id]}`, id: 'a-' + id });
    castEl.append(this.g);
    this.x = 0; this.y = 0; this.dir = 1; this.s = 1; this.turning = 0; this.node = null; this.posed = null;
    this.pose();
  }
  pose(p) {
    if (p === this.posed && this.fig) return;
    this.posed = p;
    this.g.innerHTML = actorFigure(FIG[this.id], p, this.id === 'peasant' ? .94 : 1);
    this.fig = this.g.firstElementChild;
    placeFigure(this.fig, this.x, this.y);
  }
  mirror() {
    this.g.setAttribute('transform', this.s === 1 ? '' : `translate(${this.x.toFixed(1)} 0) scale(${this.s.toFixed(3)} 1) translate(${(-this.x).toFixed(1)} 0)`);
  }
  turn(dir) {
    this.dir = dir;
    const from = this.s;
    if (reducedMotion || !this.shown) { this.s = dir; this.mirror(); return; }
    const t = ++this.turning;
    tween(160, k => { if (t !== this.turning) return; this.s = from + (dir - from) * k; this.mirror(); });
  }
  place(x, y, dir) {
    this.x = x; this.y = y;
    placeFigure(this.fig, x, y);
    if (dir && dir !== this.dir) this.turn(dir); else this.mirror();
  }
  moving(on) { this.g.classList.toggle('sh-moving', on); }
  show(on) { this.g.classList.toggle('on', on); }
  get shown() { return this.g.classList.contains('on'); }
}

export class MapView {
  constructor(el, titles, defsEl) {
    this.el = el;
    this.defsEl = defsEl;   // holds the animated ripple; pause it with the map
    el.innerHTML = mapMarkup(titles);
    this.cast = el.querySelector('#cast');
    this.actors = {};
    for (const id of Object.keys(FIG)) this.actors[id] = new Actor(id, this.cast);
    this.hand = el.querySelector('#hand');
    this.hoverLabel = el.querySelector('#hover-label');
    this.truths = el.querySelector('#truths');
    this.onPick = () => {};
    this.hurried = 1;
    this.walking = 0;
    this.open = false;
    this.buildHits();
    if (reducedMotion) { el.pauseAnimations(); defsEl?.pauseAnimations(); }
  }

  // ---- input ------------------------------------------------------------
  buildHits() {
    const hits = this.el.querySelector('#hits');
    for (const [id, r] of Object.entries(ROOMS)) {
      const [x, y, w, h] = r.rect;
      const rect = svg('rect', { x, y, width: w, height: h, class: 'hit', 'data-room': id, tabindex: 0, role: 'button', 'aria-label': r.label });
      hits.append(rect);
    }
    // the tarn hit sits under the others
    hits.prepend(hits.querySelector('[data-room="tarn"]'));
    this.setOpen(false);
    hits.addEventListener('click', e => {
      const room = e.target.closest('[data-room]')?.dataset.room;
      if (room) { e.stopPropagation(); this.hideLabel(); this.onPick(room); }
    });
    hits.addEventListener('keydown', e => {
      const room = e.target.closest('[data-room]')?.dataset.room;
      if (room && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); e.stopPropagation(); this.onPick(room); }
    });
    hits.addEventListener('pointerover', e => {
      const room = e.target.closest('[data-room]')?.dataset.room;
      if (room && e.pointerType === 'mouse') this.showLabel(room);
    });
    hits.addEventListener('pointerout', () => this.hideLabel());
  }
  showLabel(room) {
    const r = ROOMS[room];
    const [x, y] = r.labelAt || [r.rect[0] + 5, r.rect[1] + 12];
    const below = room === 'tarn';
    this.hoverLabel.textContent = r.label;
    this.hoverLabel.setAttribute('x', x);
    this.hoverLabel.setAttribute('y', y);
    this.hoverLabel.classList.toggle('on-ink', below);
    this.hoverLabel.classList.add('on');
  }
  hideLabel() { this.hoverLabel.classList.remove('on'); }

  setOpen(open) {
    this.open = open;
    for (const h of this.el.querySelectorAll('.hit')) {
      const room = h.dataset.room;
      const inside = ['gallery', 'bedroom', 'hall', 'stair', 'studio', 'vault'].includes(room);
      const off = room === 'door' ? open : inside && !open;
      h.style.display = off ? 'none' : '';
    }
  }

  // ---- layout -------------------------------------------------------------
  setTall(tall) {
    this.el.setAttribute('viewBox', tall ? VIEW_TALL : VIEW_WIDE);
    this.el.classList.toggle('tall', tall);
    // the title cartouche and its reflection, narrowed to fit the portrait crop
    const fit = (y) => tall ? `translate(420 ${y}) scale(.84) translate(-480 ${-y})` : '';
    this.el.querySelector('#cartouche').setAttribute('transform', fit(70));
    this.el.querySelector('#title-below').setAttribute('transform', fit(586));
  }
  // a map point in px, relative to the stage box
  screenPoint([x, y], stage) {
    const m = this.el.getScreenCTM();
    const s = stage.getBoundingClientRect();
    if (!m) return { x: s.width / 2, y: s.height / 2 };
    const p = new DOMPoint(x, y).matrixTransform(m);
    return { x: p.x - s.left, y: p.y - s.top };
  }
  roomPoint(room) { return ROOMS[room]?.anchor || [480, 320]; }

  pause() { this.el.pauseAnimations(); this.defsEl?.pauseAnimations(); this.el.classList.add('paused'); }
  resume() {
    this.el.classList.remove('paused');
    if (!reducedMotion) { this.el.unpauseAnimations(); this.defsEl?.unpauseAnimations(); }
  }

  // ---- the manicule -----------------------------------------------------------
  point(room) {
    const h = ROOMS[room]?.hand;
    this.hand.dataset.room = h ? room : '';
    if (!h) { this.hand.classList.remove('on'); return; }
    const [x, y, rot] = h;
    this.hand.setAttribute('transform', `translate(${x} ${y}) rotate(${rot}) scale(1.7) translate(-11 0)`);
    this.hand.classList.add('on');
  }

  // ---- figures ----------------------------------------------------------------
  put(id, spot, dir = 1, pose) {
    const a = this.actors[id];
    a.pose(pose);
    const [x, y] = Array.isArray(spot) ? spot : SPOTS[spot];
    a.place(x, y, dir);
    a.node = NODES[spot] ? spot : null;
    a.show(true);
  }
  hide(id) { this.actors[id].show(false); }
  hideAll(except = []) { for (const id in this.actors) if (!except.includes(id)) this.hide(id); }
  face(id, dir) { const a = this.actors[id]; a.place(a.x, a.y, dir); }
  pose(id, p) { this.actors[id].pose(p); }
  guestRoom() { return NODE_ROOM[this.actors.guest.node] || null; }

  // walk along a list of points; resolves on arrival
  async travel(id, pts, speed = WALK) {
    const a = this.actors[id];
    if (reducedMotion) {
      a.show(false); await sleep(250);
      const [x, y] = pts[pts.length - 1];
      const prev = pts[pts.length - 2] || [a.x, a.y];
      a.place(x, y, x < prev[0] ? -1 : x > prev[0] ? 1 : a.dir);
      a.show(true); await sleep(250);
      return;
    }
    const segs = [];
    let total = 0, from = [a.x, a.y];
    for (const p of pts) {
      const len = Math.hypot(p[0] - from[0], p[1] - from[1]);
      if (len > .5) { segs.push({ from, to: p, len }); total += len; }
      from = p;
    }
    if (!total) return;
    const counts = id === 'guest';
    if (counts) this.walking++;
    let d = 0, last = performance.now();
    a.moving(true);
    await new Promise(resolve => {
      let guard = 0, ended = false;
      const done = () => { if (ended) return; ended = true; clearInterval(guard); resolve(); };
      const step = now => {
        if (ended) return;
        now = performance.now();
        const dt = Math.min(.5, (now - last) / 1000); last = now;
        d = Math.min(total, d + dt * speed * (id === 'guest' ? this.hurried : 1));
        let k = d;
        for (const s of segs) {
          if (k <= s.len || s === segs[segs.length - 1]) {
            const t = Math.min(1, k / s.len);
            const dx = s.to[0] - s.from[0];
            a.place(s.from[0] + dx * t, s.from[1] + (s.to[1] - s.from[1]) * t, dx < -.5 ? -1 : dx > .5 ? 1 : a.dir);
            break;
          }
          k -= s.len;
        }
        if (d < total) requestAnimationFrame(step); else done();
      };
      requestAnimationFrame(step);
      // when frames stall (a hidden or starved page), keep walking on a timer
      guard = setInterval(() => { if (performance.now() - last > 120) step(); }, 100);
    });
    a.moving(false);
    if (counts) this.walking--;
  }

  async walkTo(id, node, speed) {
    const a = this.actors[id];
    const start = a.node || this.nearest(a.x, a.y);
    const path = route(start, node).map(n => NODES[n]);
    a.node = node;
    await this.travel(id, path, speed);
    if (id === 'guest') this.hurried = 1;
  }
  nearest(x, y) {
    let best = 'brink', bd = Infinity;
    for (const [n, [nx, ny]] of Object.entries(NODES)) {
      const d = Math.hypot(nx - x, (ny - y) * 3);
      if (d < bd) { bd = d; best = n; }
    }
    return best;
  }
  hurry() { this.hurried = 2.6; }
  glide(id, from, to) { this.put(id, from, SPOTS[to][0] < SPOTS[from][0] ? -1 : 1); return this.travel(id, [SPOTS[to]], GLIDE); }

  // ---- the house ----------------------------------------------------------------
  get houseDef() { return this.el.querySelector('#house'); }
  // the door gives: the eye-windows go out and the rooms light up behind them
  flyFacade() {
    this.setOpen(true);
    this.houseDef.classList.add('open');
  }
  setFacade(open) {
    this.setOpen(open);
    const h = this.houseDef;
    h.classList.add('cut'); h.classList.toggle('open', open);
    h.getBoundingClientRect(); h.classList.remove('cut');
  }
  // the light behind the chapter: one lit backdrop and one glass at a time
  light(ch) {
    for (const l of this.el.querySelectorAll('.light')) l.classList.toggle('on', l.dataset.light === ch);
  }
  coffin(on) { this.houseDef.classList.toggle('buried', on); }
  // the hairline of light where the fissure begins: one segment more per chapter, six in all
  fissure(segments) {
    const c = this.houseDef.querySelector('.sh-crack');
    if (!c) return;
    c.setAttribute('pathLength', 6);
    c.style.strokeDasharray = `${Math.max(0, Math.min(6, segments))} 6`;
  }
  title(on) {
    this.el.querySelector('#cartouche').classList.toggle('gone', !on);
    this.el.querySelector('#title-below').classList.toggle('gone', !on);
  }
  // show one truth (plus the water's fissure, always)
  truth(id) {
    for (const t of this.truths.querySelectorAll('[data-truth]')) {
      const k = t.dataset.truth;
      t.classList.toggle('shown', k === 'fissure' || k === id);
    }
  }

  // the end: the moon through the fissure, the halves part and go down into the tarn
  async collapse() {
    const L = this.el.querySelector('#sink-left'), R = this.el.querySelector('#sink-right');
    const whole = this.el.querySelector('#house-whole');
    const moon = this.el.querySelector('#moon');
    this.fissure(7);
    whole.style.display = 'none';
    L.classList.add('on'); R.classList.add('on');
    moon.classList.add('on');
    if (reducedMotion) {
      await sleep(600);
      L.classList.add('fade'); R.classList.add('fade');
      await sleep(800);
      return;
    }
    await sleep(900);
    await tween(1400, k => {
      const e = k * k * (3 - 2 * k);
      L.setAttribute('transform', `translate(${-9 * e} 0)`);
      R.setAttribute('transform', `translate(${9 * e} 0)`);
    });
    await sleep(500);
    await tween(3600, k => {
      const e = k * k;
      L.setAttribute('transform', `translate(-9 ${270 * e}) rotate(${-2 * e} 400 368)`);
      R.setAttribute('transform', `translate(9 ${270 * e}) rotate(${2.4 * e} 560 368)`);
    });
  }
  async moonSet() {
    const moon = this.el.querySelector('#moon');
    if (reducedMotion) { moon.setAttribute('transform', 'translate(0 84)'); return; }
    await tween(9000, k => moon.setAttribute('transform', `translate(0 ${84 * k})`));
  }
  flip(on) { this.el.classList.toggle('turned', on); }
  // the last card wants an empty sky: no moon, no cloud
  clearSky() { this.el.querySelector('#moon').classList.remove('on'); }
}

export { TRUTH_IDS };
