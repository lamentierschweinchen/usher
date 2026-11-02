// The first interlude: A Mere Different Arrangement. The narrator's own theory, that "a mere
// different arrangement of the particulars of the scene" might undo its sorrow [u02], played as a
// toy theatre in the hall [u07]: cut-outs on rods before the valet's lamp, and on the wall a
// woman's shadow that nothing here casts. Hide her behind a shadow and the Account writes the
// excuse; let her be and the back page takes a strange fancy. Whatever moves without a rod is the
// house, or her.
//
// Mounted by the spine in the game layer (main.js). Writes flags `excuses` and `unaccountable`,
// the Account's lines, and records.interlude1 for act two.

import * as A from '../shared/arrangement.js';
import { INTERLUDE1 as T } from './story.js';
import { enter, slip } from './account.js';
import { sleep, reducedMotion } from './util.js';

const SIGHTINGS = [
  { box: [580, 130, 120, 270], idle: 12 },                     // beside the drape's corner
  { box: [350, 40, 160, 360], idle: 8, from: [30, 40, 160, 360] },  // in from the doorway, larger
];
const EXPLAINED = { n: 44, hold: .6 };    // one shadow over 44 of her 48 points, her head with them, for 0.6 s
const DOORWAY = [20, 0, 110, 400];        // where she walks out

export async function interlude1({ host, slipHost, acc, flags, record, still = reducedMotion }) {
  host.innerHTML = `<div class="g-interlude"><svg class="il-stage" aria-label="The hall: a lamp, a wall, three pieces on rods"></svg><div class="il-teach" aria-live="polite"></div></div>`;
  const svg = host.querySelector('svg'), teachEl = host.querySelector('.il-teach');
  const st = A.createStage(svg, { still, pieces: [{ id: 'chair', x: 260 }, { id: 'trophies', x: 480 }, { id: 'drape', x: 700 }] });
  st.setHer({ box: SIGHTINGS[0].box, visible: false });
  host.__stage = st;   // for test entries
  const taught = new Set();
  const teach = (key, text) => { if (taught.has(key)) return; taught.add(key); teachEl.textContent = text; teachEl.classList.add('on'); };
  const clock = () => performance.now() / 1000;
  let lastTouch = clock(), dragged = false, alive = true;
  const offs = [
    st.on('touch', () => { lastTouch = clock(); }),
    st.on('drag', () => { dragged = true; }),
  ];
  const outcomes = [], kept = [];
  (flags.excuses ||= []); (flags.unaccountable ||= []);

  // 0:00 the valet sets his lamp down and goes
  teach('drag', T.drag);   // N · R [u02]

  // the one teaching gesture: nothing touched for three seconds, a pale glove drags the chair 90 right
  const glove = (async () => {
    while (alive && clock() - lastTouch < 3) await sleep(150);
    if (!alive || dragged || clock() - lastTouch < 3) return;
    if (still) { await arrow(svg, st.piece('chair')); return; }
    await st.hand('chair', { dx: 90, by: 'glove' });
  })();

  // her shadow, after the first drag or at eight seconds
  const t0 = clock();
  while (!dragged && clock() - t0 < 8) await sleep(150);
  await glove.catch(() => {});

  for (let n = 0; n < SIGHTINGS.length; n++) {
    const sg = SIGHTINGS[n];
    // she can be let be from the moment she appears
    let letBe = false;
    const offHer = st.on('her', () => { letBe = true; });
    if (sg.from) {
      st.setHer({ box: sg.from, visible: true });
      await st.herTo(sg.box, still ? 0 : 2200);
      teach('second', T.second);   // N
      await st.pulse(1);           // she can be touched
    } else {
      st.setHer({ box: sg.box, visible: false });
      await st.herFade(true, 900);
    }
    const out = letBe ? { outcome: 'let' } : await sighting(st, n, sg, { teach, clock, lastTouchRef: () => lastTouch });
    offHer();
    outcomes.push({ sighting: n + 1, ...out, arrangement: st.pieces().map(p => ({ id: p.id, x: Math.round(p.x), groove: p.groove })) });

    // the Account, and what it costs: an excuse in ink or paler m.; or the back page, let be
    if (out.outcome === 'let') {
      flags.unaccountable.push({ sighting: n + 1 });
      const i = acc.back.filter(l => l.id.startsWith('fancy')).length;
      if (i < T.fancy.length) enter(acc, { id: `fancy${i + 1}`, text: T.fancy[i], hand: 'guest' });
    } else {
      const hand = out.outcome === 'm' ? 'm' : 'guest';
      flags.excuses.push({ id: out.piece, hand, sighting: n + 1 });
      const line = enter(acc, { id: `excuse${n + 1}`, label: '', value: T.excuses[out.piece], hand });
      slip(slipHost, line);
    }

    // the house: she walks out through the doorway, and something moves that no rod moved
    teach(`house${n}`, T.house);   // R [u06]
    taught.delete(`house${n}`);
    if (out.outcome === 'let') {
      // the house slides the nearest shadow over her as she goes; nobody writes it
      const near = nearest(st);
      const cx = st.her().box[0] + st.her().box[2] / 2;
      const dx = (cx - shadowCentre(st, near)) * .6;
      const walk = walkOut(st, still);
      await st.slideShadow(near.id, dx, still ? 0 : 1400);
      await walk;
    } else {
      // explained: the excuse's shadow goes with her while its rod stands still
      const k = st.keep(out.piece);
      kept.push(out.piece);
      const shift = DOORWAY[0] - (st.her().box[0]);
      await Promise.all([walkOut(st, still), carry(k, shift, still)]);
    }
    await sleep(still ? 300 : 1200);
  }

  // the valet takes his lamp: every shadow goes with the light except hers, 1.5 s longer, cast by nothing
  st.setHer({ box: [40, 170, 100, 230], visible: true });
  svg.classList.add('il-dark');
  await sleep(still ? 800 : 2200);
  await st.herFade(false, still ? 200 : 600);
  alive = false;
  offs.forEach(off => off());
  record({ moves: st.record(), sightings: outcomes, kept });
  st.destroy();
  host.innerHTML = '';
}

// one sighting: explained by one shadow, let be, or m. (the guest's pale hand) if she's left alone
async function sighting(st, n, sg, { teach, clock, lastTouchRef }) {
  const start = clock();
  let since = null, by = null, partSince = null, settled = null;
  const offHer = st.on('her', () => { settled ||= { outcome: 'let' }; });
  let touchedAt = lastTouchRef();
  while (!settled) {
    await sleep(100);
    const now = clock();
    // which shadow covers her best, and is it enough?
    const best = st.pieces().map(p => ({ p, ...st.cover(p.id) })).sort((a, b) => b.n - a.n)[0];
    const whole = best.n >= EXPLAINED.n && best.head === best.headOf;
    if (whole) {
      if (by !== best.p.id) { by = best.p.id; since = now; }
      if (now - since >= EXPLAINED.hold) settled = { outcome: 'explained', piece: by };
    } else { by = null; since = null; }
    // a piece covers part of her for 0.8 s: her rim shows what's left
    if (!whole && best.n > 0) {
      partSince ??= now;
      if (now - partSince >= .8) {
        st.tryPiece(best.p);
        teach('reach', T.reach);   // N
        // no tap two seconds later: the nearest stud pulses
        if (now - partSince >= 2.8 && now - lastTouchRef() >= 2) { teach('tapRod', T.tapRod); pulseStud(st, best.p); }   // N
      }
    } else partSince = null;
    // left alone: m.
    if (lastTouchRef() !== touchedAt) touchedAt = lastTouchRef();
    const quiet = now - Math.max(start, lastTouchRef());
    if (!settled && quiet >= sg.idle) settled = await m(st);
  }
  offHer();
  st.tryPiece(null);
  return settled;
}

// m.: the guest's pale hand moves the piece nearest her under her and taps it forward. If it can't
// reach (the trophies), the evidence bends: her shadow narrows into the lace and her rim goes out.
async function m(st) {
  st.lock(true);
  const p = nearest(st), h = st.her().box, cx = h[0] + h[2] / 2;
  const g = st.options.grooves.front, P = st.options.P;
  const target = P[0] + (cx - P[0]) / g.k;          // where its front shadow centres on her
  if (p.groove === 'back') {
    await st.hand(p.id, { dx: target - p.x, toggle: true, by: 'guest' });
  } else await st.hand(p.id, { dx: target - p.x, by: 'guest' });
  const c = st.cover(p.id);
  if (!(c.n >= EXPLAINED.n && c.head === c.headOf)) await bend(st, p);
  st.lock(false);
  return { outcome: 'm', piece: p.id };
}

// the evidence bends: she narrows until the shadow tried on her covers her
async function bend(st, p) {
  const b = st.her().box;
  let lo = .05, hi = 1, fit = null;
  for (let i = 0; i < 12; i++) {
    const k = (lo + hi) / 2, w = b[2] * k, box = [b[0] + (b[2] - w) / 2, b[1] + b[3] * (1 - k) * .3, w, b[3] * (1 - (1 - k) * .3)];
    const c = st.cover(p.id, A.herSamples(box));
    if (c.n >= EXPLAINED.n && c.head === c.headOf) { fit = box; lo = k; } else hi = k;
  }
  if (!fit) { const w = b[2] * .12; fit = [b[0] + (b[2] - w) / 2, b[1] + b[3] * .35, w, b[3] * .55]; }
  st.tryPiece(null);
  await st.herTo(fit, 900);
}

const shadowCentre = (st, p) => { const g = st.options.grooves[p.groove], P = st.options.P; return P[0] + (p.x + p.dx - P[0]) * g.k; };
// the piece nearest her: by its rod, the thing the guest's hand would reach for
const nearest = st => {
  const h = st.her().box, cx = h[0] + h[2] / 2;
  return st.pieces().sort((a, b) => Math.abs(a.x - cx) - Math.abs(b.x - cx))[0];
};

async function walkOut(st, still) {
  const b = st.her().box;
  await st.herTo([DOORWAY[0] + 10, b[1], b[2], b[3]], still ? 0 : 2400);
  await st.herFade(false, still ? 200 : 500);
}
async function carry(keptEl, dx, still) {
  if (still) { keptEl.remove(); return; }
  keptEl.style.transition = 'transform 2.4s ease-in-out, opacity .6s 2.2s';
  keptEl.style.transform = `translateX(${dx}px)`;
  await sleep(2500);
  keptEl.style.opacity = '0';
  await sleep(600);
  keptEl.remove();
}
function pulseStud(st, p) {
  const s = p.el.querySelector('.sh-stud');
  if (!s || s.classList.contains('il-pulse')) return;
  s.classList.add('il-pulse');
  setTimeout(() => s.classList.remove('il-pulse'), 3200);
}
// reduced motion: the glove becomes a still dotted arrow, for a moment
async function arrow(svg, p) {
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('class', 'il-arrow');
  const y = 545;
  g.innerHTML = `<path d="M${p.x} ${y}H${p.x + 90}" style="fill:none;stroke:var(--sh-gauze);stroke-width:2.5;stroke-dasharray:2 7;stroke-linecap:round"/><path d="M${p.x + 90} ${y}l-10-6v12z" style="fill:var(--sh-gauze)"/>`;
  svg.append(g);
  await sleep(2600);
  g.remove();
}
