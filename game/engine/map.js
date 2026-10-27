// The map: the house in cutaway over its twin in the tarn. Draws once, then
// moves figures, flies the façade, sinks clouds, shows the tarn's truths.

import { svg, tween, sleep, reducedMotion } from './util.js';
import { mapMarkup, ROOMS, TRUTH_IDS } from './drawing.js';

// Walkable points (feet), and how they join.
export const NODES = {
  off: [8, 352], bankTop: [70, 334], cwStart: [136, 360], brink: [236, 360], doorSpot: [262, 360],
  arch: [302, 340], hall: [362, 340], stairFoot: [450, 340], studio: [584, 340],
  landing: [512, 280], bedroom: [362, 280], stairTop: [450, 220], gallery: [560, 220],
};
const EDGES = [
  ['off', 'bankTop'], ['bankTop', 'cwStart'], ['cwStart', 'brink'], ['brink', 'doorSpot'], ['doorSpot', 'arch'],
  ['arch', 'hall'], ['hall', 'stairFoot'], ['stairFoot', 'studio'], ['stairFoot', 'landing'],
  ['landing', 'bedroom'], ['landing', 'stairTop'], ['stairTop', 'gallery'],
];
// Where the cast stands (not on the walk graph).
export const SPOTS = {
  ...NODES,
  horse: [196, 360], peasant: [156, 360], servant: [270, 360], valet: [226, 360], physician: [318, 340],
  servantAway: [178, 360], sofa: [632, 340], hallValet: [370, 340], chair: [404, 280], threshold: [450, 280],
  galleryEast: [646, 220], galleryWest: [312, 220], landingEast: [512, 280],
  hallEast: [404, 340], hallWest: [328, 340], fallen: [416, 280],
};
export const ROOM_NODE = {
  bank: 'brink', causeway: 'brink', door: 'doorSpot', hall: 'hall', stair: 'landing',
  bedroom: 'bedroom', gallery: 'gallery', studio: 'studio', vault: 'hall',
};
const NODE_ROOM = {
  off: 'bank', bankTop: 'bank', cwStart: 'causeway', brink: 'causeway', doorSpot: 'door', arch: 'hall',
  hall: 'hall', stairFoot: 'stair', studio: 'studio', landing: 'stair', bedroom: 'bedroom', stairTop: 'stair', gallery: 'gallery',
};
const FIG = { guest: 'guest', roderick: 'roderick', madeline: 'madeline', valet: 'valet', physician: 'physician', servant: 'servant', peasant: 'peasant', horse: 'horse' };
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

class Actor {
  constructor(id, castEl) {
    this.id = id;
    this.g = svg('g', { class: 'actor', id: 'a-' + id });
    this.face = svg('g');
    this.bob = svg('g', { filter: 'url(#cutout)' });
    this.bob.append(svg('use', { href: '#f-' + FIG[id] }));
    this.face.append(this.bob);
    this.g.append(this.face);
    castEl.append(this.g);
    this.x = 0; this.y = 0; this.dir = 1; this.node = null;
  }
  place(x, y, dir) {
    this.x = x; this.y = y;
    this.g.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
    if (dir && dir !== this.dir) { this.dir = dir; this.face.setAttribute('transform', dir < 0 ? 'scale(-1 1)' : ''); }
  }
  lift(h) { this.bob.setAttribute('transform', h ? `translate(0 ${(-h).toFixed(2)})` : ''); }
  show(on) { this.g.classList.toggle('on', on); }
  get shown() { return this.g.classList.contains('on'); }
}

export class MapView {
  constructor(el, titles) {
    this.el = el;
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
    if (reducedMotion) el.pauseAnimations();
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

  pause() { this.el.pauseAnimations(); this.el.classList.add('paused'); }
  resume() { this.el.classList.remove('paused'); if (!reducedMotion) this.el.unpauseAnimations(); }

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
  put(id, spot, dir = 1) {
    const a = this.actors[id];
    const [x, y] = Array.isArray(spot) ? spot : SPOTS[spot];
    a.place(x, y, dir);
    a.node = NODES[spot] ? spot : null;
    a.show(true);
  }
  hide(id) { this.actors[id].show(false); }
  hideAll(except = []) { for (const id in this.actors) if (!except.includes(id)) this.hide(id); }
  face(id, dir) { const a = this.actors[id]; a.place(a.x, a.y, dir); }
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
        a.lift(d < total ? 1.5 * Math.abs(Math.sin(d / 9 * Math.PI)) : 0);
        if (d < total) requestAnimationFrame(step); else done();
      };
      requestAnimationFrame(step);
      // when frames stall (a hidden or starved page), keep walking on a timer
      guard = setInterval(() => { if (performance.now() - last > 120) step(); }, 100);
    });
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
  flyFacade() {
    this.setOpen(true);
    this.el.querySelector('#facade').classList.add('flown');
  }
  setFacade(open) {
    this.setOpen(open);
    const f = this.el.querySelector('#facade');
    f.classList.add('cut'); f.classList.toggle('flown', open);
    f.getBoundingClientRect(); f.classList.remove('cut');
  }
  clouds(step) { this.el.querySelector('#clouds').style.transform = `translateY(${Math.min(40, step * 8)}px)`; }
  night(on) { this.el.querySelector('#night').classList.toggle('on', on); }
  coffin(on) { this.el.querySelector('#coffin').classList.toggle('on', on); }
  fissure(segments) {
    this.el.querySelector('#fissure-above').style.strokeDasharray = `${Math.min(7, segments)} 7`;
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
    if (reducedMotion) { moon.setAttribute('cy', 330); return; }
    await tween(9000, k => moon.setAttribute('cy', 246 + 96 * k));
  }
  flip(on) { this.el.classList.toggle('turned', on); }
  // the last card wants an empty sky: no moon, no cloud
  clearSky() {
    this.el.querySelector('#moon').classList.remove('on');
    this.el.querySelector('#clouds').classList.add('gone');
  }
}

export { TRUTH_IDS };
