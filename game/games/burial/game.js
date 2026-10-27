/* IV. A Harmless Precaution — the burial.
   Turn-based stealth carry (stair, gallery, copper), then the lid.
   Spec: work/design/games/burial.md · Contract: work/design/CONTRACT.md
   Look: Shadow Theatre (work/design/LOOK.md), cut from game/shared/cuts.js;
   colour comes only from the --sh-* tokens in game/shared/shadow.css. */

import * as C from '../../shared/cuts.js';

// ── The house, as a graph ────────────────────────────────────────────────
const NODES = {
  A1: [620, 110], A2: [390, 110], A3: [160, 110],
  R1: [160, 225], R2: [390, 225], R3: [620, 225], R4: [820, 290],
  R5: [620, 355], R6: [390, 355], R7: [160, 355],
  S: [820, 430],
  C1: [700, 505], C2: [520, 505], C3: [340, 505], V: [130, 505],
};
const EDGES = 'A1-A2 A2-A3 A3-R1 R1-R2 R2-R3 R3-R4 R4-R5 R5-R6 R6-R7 R7-R1 R4-S S-C1 C1-C2 C2-C3 C3-V'
  .split(' ').map((e) => e.split('-'));
const ADJ = Object.fromEntries(Object.keys(NODES).map((k) => [k, []]));
for (const [a, b] of EDGES) { ADJ[a].push(b); ADJ[b].push(a); }
const HEARD = new Set(['R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7', 'S']); // the physician's ears
const COPPER = new Set(['C1', 'C2', 'C3', 'V']);
const DEEPER = { C1: 'C2', C2: 'C3', C3: 'V' };
const DELAY = 3;
const NAMES = {
  A1: 'the top landing', A2: 'the middle landing', A3: 'the last landing',
  R1: 'the gallery', R2: 'the gallery', R3: 'the gallery', R4: 'the head of the stair',
  R5: 'the gallery', R6: 'the gallery', R7: 'the gallery', S: 'the stair down',
  C1: 'the copper archway', C2: 'the copper archway', C3: 'the copper archway', V: 'the vault',
};

// Shortest way through the rooms he can hear. The ring is odd, so there are no ties.
function bfs(from, to) {
  if (from === to) return [from];
  const prev = { [from]: null };
  const q = [from];
  while (q.length) {
    const n = q.shift();
    for (const k of ADJ[n]) {
      if (!HEARD.has(k) || k in prev) continue;
      prev[k] = n;
      if (k === to) {
        const path = [k];
        for (let c = n; c !== null; c = prev[c]) path.unshift(c);
        return path;
      }
      q.push(k);
    }
  }
  return [from];
}

// ── The rules (pure; no DOM) ─────────────────────────────────────────────
function guardAt(ph) { ph.at = 'S'; ph.mode = 'guard'; ph.target = null; ph.lit = ['R4']; ph.path = []; }

export function createModel() {
  const ph = {};
  guardAt(ph);
  return { p: 'A1', hist: ['A1'], fIdx: -1, f: null, delay: DELAY, copper: false, lifted: false, over: false, ph, glimpses: 0, beats: 0 };
}

const seen = (m) => !m.copper && (m.p === m.ph.at || m.ph.lit.includes(m.p));
const snapshot = (m) => ({ p: m.p, f: m.f, ph: { ...m.ph, lit: m.ph.lit.slice(), path: m.ph.path.slice() } });

function physAct(ph) {
  if (ph.mode === 'look') ph.mode = 'return';
  if (ph.mode === 'go') {
    if (ph.at !== ph.target) ph.at = bfs(ph.at, ph.target)[1];
    if (ph.at === ph.target) { ph.mode = 'look'; ph.lit = ADJ[ph.at].slice(); ph.path = []; return; }
    ph.path = bfs(ph.at, ph.target); ph.lit = [ph.path[1]];
    return;
  }
  if (ph.mode === 'return') {
    if (ph.at !== 'S') ph.at = bfs(ph.at, 'S')[1];
    if (ph.at === 'S') { guardAt(ph); return; }
    ph.path = bfs(ph.at, 'S'); ph.lit = [ph.path[1]];
    return;
  }
  guardAt(ph);
}

export function canMove(m, to) {
  if (m.over) return false;
  if (to === 'w' || to === m.p) return true;
  if (m.copper) return DEEPER[m.p] === to;
  return ADJ[m.p].includes(to);
}

function caughtReset(m, ev, when) {
  ev.caught = when;
  ev.show = snapshot(m);
  m.glimpses++;
  m.p = 'R1'; m.hist = ['R1']; m.fIdx = -1; m.f = null;
  guardAt(m.ph);
  return ev;
}

// One beat: you act; check; the footsteps step to hist[len-1-delay]; he acts; check.
export function beat(m, to) {
  if (to === 'w') to = m.p;
  const ev = { from: m.p, to, wait: to === m.p, pats: [], heard: null, caught: 0, copperStart: false, lift: false, vault: false };
  m.p = to; m.hist.push(to); m.beats++;
  if (!m.copper && COPPER.has(to)) { m.copper = true; ev.copperStart = true; }
  if (seen(m)) return caughtReset(m, ev, 1);
  if (m.copper) m.delay = Math.max(0, m.delay - 1); // the footsteps hurry
  const idx = m.hist.length - 1 - m.delay;
  for (let i = Math.max(0, m.fIdx + 1); i <= idx; i++) {
    const n = m.hist[i];
    if (n !== m.f) { ev.pats.push({ at: n, from: m.f }); m.f = n; if (HEARD.has(n)) ev.heard = n; }
  }
  m.fIdx = Math.max(m.fIdx, idx);
  if (!m.copper) {
    if (ev.heard) { m.ph.mode = 'go'; m.ph.target = ev.heard; }
    physAct(m.ph);
    if (seen(m)) return caughtReset(m, ev, 2);
  }
  if (m.copper && m.delay === 0 && !m.lifted) { m.lifted = true; ev.lift = true; }
  if (to === 'V') { m.over = true; ev.vault = true; }
  ev.show = snapshot(m);
  return ev;
}

// For tests: play a route ('w' waits) and log each beat.
export function simulate(route, m = createModel()) {
  const log = [];
  let result = 'open';
  for (const a of route) {
    if (!canMove(m, a)) { log.push(`${a}: illegal from ${m.p}`); result = 'illegal'; break; }
    const ev = beat(m, a);
    const s = ev.show;
    log.push(`${a.padEnd(2)} you ${s.p.padEnd(2)} feet ${(s.f || '-').padEnd(2)} doc ${s.ph.at.padEnd(2)} ${s.ph.mode.padEnd(6)} lit ${s.ph.lit.join(',')}${ev.pats.length ? ' pat@' + ev.pats.map((p) => p.at).join(',') : ''}${ev.caught ? ' CAUGHT' : ''}`);
    if (ev.caught) { result = 'caught'; break; }
    if (ev.copperStart) result = 'copper';
    if (ev.vault) { result = 'vault'; break; }
  }
  return { result, log, model: m };
}

// ── Words ────────────────────────────────────────────────────────────────
const LINES = {
  teach: 'We <span class="gb-two">two</span> alone bore it to its rest.',
  doctors: [
    { who: 'Roderick', text: '“A fortnight in the vault. The doctors are so <i>eager</i>.”', ms: 2800 },
    { who: 'You', text: '“I don’t feel at liberty to dispute it.”', ms: 2600 },
  ],
  caught: [
    { who: 'The physician', text: '“Might I just see her?”', ms: 1300 },
    { who: 'Roderick', text: '“No.”', ms: 900 },
  ],
  hints: [
    'He doesn’t follow you. He follows them.',
    'He always takes the short way round. Take the long one.',
    'Tap the coffin to wait a beat. Then the long way round.',
  ],
  heavy: [
    { who: 'Roderick', text: '“You’ve got the heavy end?”', ms: 1500 },
    { who: 'You', text: '“I thought you had.”', ms: 2200 },
  ],
  lidTeach: 'We replaced and screwed down the lid.',
  blush: [
    { who: 'You', text: '“She’s blushing.”', ms: 2000 },
    { who: 'Roderick', text: '“It’s usual. In our family.”', ms: 2600 },
  ],
  waits: 'Roderick waits at the door.',
  out3: 'Three screws home. That’ll hold.',
  out4: 'Four screws home. The lid is flush, more or less.',
};

// ── Drawing: Shadow Theatre (work/design/LOOK.md) ───────────────────────
// The house is one sheet of black paper; corridors, stairs and the vault are
// holes in it onto the chapter's cold copper light. Every figure, coffin and
// door is a library cut (game/shared/cuts.js); only the stairs, portraits,
// arches, Madeline's bare feet and the screws are cut here, in the same manner.
const FLOOR = 27; // feet sit this far below a node
const FS = 1.95; // figure scale on the stair: ≈ 90 units, as tall as the node grid allows (rooms 98 high, nodes 230 apart)
const f1 = (n) => Math.round(n * 10) / 10;
const PI = Math.PI;
// a bare footprint, for the prints the tarn keeps (returned light)
const FOOT = '<path d="M0-6C2.6-6 3.4-2.6 3-.4C2.6 2.4 2.2 6 0 6C-2 6-2.6 3-2.6.6C-2.8-2.6-2.4-6 0-6Z"/><circle cx="-2.2" cy="-8.4" r="1"/><circle cx="-.5" cy="-9.2" r=".95"/><circle cx="1.1" cy="-9.1" r=".85"/><circle cx="2.5" cy="-8.4" r=".75"/><circle cx="3.5" cy="-7.2" r=".6"/>';

// Little cut-paper helpers (fill comes from the wrapper's currentColor).
const dot = (x, y, r) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${r}"/>`;
function along(x0, y0, x1, y1, r, step) {
  const n = Math.max(1, Math.round(Math.hypot(x1 - x0, y1 - y0) / step));
  let s = '';
  for (let i = 0; i <= n; i++) s += dot(x0 + ((x1 - x0) * i) / n, y0 + ((y1 - y0) * i) / n, r);
  return s;
}
const poly = (pts, attrs = '') => `<path d="M${pts.map((p) => p.map(f1).join(' ')).join('L')}Z" ${attrs}/>`;
const rect = (x0, y0, x1, y1) => poly([[x0, y0], [x1, y0], [x1, y1], [x0, y1]]);
// A flight of stairs cut in profile, top (x0,y0) to bottom (x1,y1), with thread balusters and rail.
function flight(x0, y0, x1, y1, n, t = 7) {
  const dx = (x1 - x0) / n, dy = (y1 - y0) / n;
  let d = `M${f1(x0)} ${f1(y0)}`, x = x0, y = y0, bal = '';
  for (let i = 0; i < n; i++) {
    y += dy; d += `V${f1(y)}`; x += dx; d += `H${f1(x)}`;
    if (i < n - 1) bal += `M${f1(x - dx / 2)} ${f1(y)}v-12`;
  }
  d += `L${f1(x1)} ${f1(y1 + t)}L${f1(x0 + dx * 1.2)} ${f1(y0 + t * 0.2)}Z`;
  return `<path d="${d}"/><path d="${bal}" style="fill:none;stroke:currentColor;stroke-width:.9"/>`
    + `<path d="M${f1(x0 + dx * 0.5)} ${f1(y0 + dy - 12)}L${f1(x1 - dx * 0.5)} ${f1(y1 - 12)}" style="fill:none;stroke:currentColor;stroke-width:1.5"/>`;
}
// An empty portrait frame (cut thread), sometimes with an ancestor's bust.
function portrait(x, y, bust, k = 1.6) {
  return `<ellipse cx="${x}" cy="${y}" rx="${f1(5.4 * k)}" ry="${f1(7 * k)}" style="fill:none;stroke:currentColor;stroke-width:${f1(1.4 * k)}"/>`
    + C.curl(x, y - 7 * k, -PI / 2, 3 * k, bust ? 1.4 : -1.4, 1.1 * k, 0.3, 8)
    + (bust ? `<path transform="translate(${x} ${y}) scale(${k})" d="M-3.4 6.4c0-3 1.6-4.2 3.4-4.4c-1.6-.8-2.2-2.2-1.8-3.6c.2-1.6 1.4-2.6 2.4-2.6c1.4 0 2.4 1 2.4 2.4l1 1.2-.9.4c0 1.2-.6 1.8-1.4 2.2c1.6.4 2.6 1.8 2.6 4.4z"/>` : '');
}
// A mourning hatchment on a thread.
const hatchment = (x, y) => `<path d="M${x} ${y - 8}v9" style="fill:none;stroke:currentColor;stroke-width:1"/><path d="M${x} ${y}l9 11-9 11-9-11z"/>`
  + C.curl(x - 9, y + 11, PI, 6, -1, 1.4, 0.3, 10) + C.curl(x + 9, y + 11, 0, 6, 1, 1.4, 0.3, 10);

// Madeline's bare feet, cut in gauze: the only pale paper (LOOK §2.5). Feet at 0,0, toes right.
const GAUZE = 'style="fill:var(--gauze,#f6ead2);opacity:var(--gauze-a,.42)"';
const feet = (shin) => `<g transform="scale(${FS})" ${GAUZE}><path d="M-5.6-${shin}h2.2l.2 ${shin - 2}c1.4.6 3.6 1 4.8 1.6c.6.4.4.8-.4.8H-5.8c-.2-1.2 0-2 .2-3zM2.4-${shin}h2.2l.2 ${shin - 2}c1.4.6 3.6 1 4.8 1.6c.6.4.4.8-.4.8H2.2c-.2-1.2 0-2 .2-3z"/></g>`;

// The bearers, facing right: you behind, Roderick in front, the coffin between at the hands.
const carry = (cls = '') => C.figure('guest', { x: -52, scale: FS, cls: `gb-guest ${cls}` })
  + C.coffin({ x: -44, y: -26, w: 88 })
  + C.figure('roderick', { x: 52, scale: FS, cls: `gb-rodf ${cls}` });
const doctor = () => C.figure('physician', { scale: FS, lamp: true });

// Where the paper is cut away (mask: black = hole).
const HOLES = rect(120, 42, 690, 139) + rect(120, 42, 200, 383) // top landings, the left stair
  + rect(120, 155, 624, 253) + rect(120, 285, 624, 383) // the two galleries (overlapping the turn: no seam)
  + poly([[620, 155], [820, 212], [820, 318], [620, 253]]) + poly([[620, 285], [820, 212], [820, 318], [620, 383]]) // the turn
  + rect(756, 210, 904, 318) + rect(785, 208, 855, 460) + rect(756, 352, 904, 458) // head of the stair, the stair down
  + poly([[700, 430], [820, 352], [820, 458], [700, 533]]) + rect(200, 430, 766, 533) // down to the copper archway
  + '<path d="M40 533V436Q40 396 80 396H200V533Z"/>'; // the vault
const LANDING = { A3: [120, 139, 200, 149], R1: [120, 253, 200, 263], R4: [788, 318, 904, 328], S: [760, 458, 904, 468] };

function stairMarkup(P) {
  const floors = [[200, 690, 139], [200, 620, 253], [120, 620, 383], [40, 760, 533]];
  const ceilings = [[200, 690, 42, 3], [200, 620, 155, 5], [200, 620, 285, 7]];
  let lace = '';
  for (const [a, b, y] of floors) lace += C.scallops(a, b, y, 1.7, 5);
  for (const [a, b, y, seed] of ceilings) lace += C.fringe(a + 4, b - 4, y, { seed, len: [2, 4.5], step: 5.2 });
  lace += `<g fill="currentColor">${along(620, 155, 820, 212, 1.5, 5)}${along(620, 383, 788, 328.4, 1.5, 5)}</g>`;
  let props = '';
  for (const [a, b, c, d] of Object.values(LANDING)) props += rect(a, b, c, d);
  props += poly([[662, 266.7], [820, 318], [820, 326], [662, 274.7]]); // the turn's floor, from the gallery floor's point
  props += flight(196, 149, 124, 253, 8) + flight(124, 263, 196, 383, 8) + flight(852, 328, 790, 458, 9) + flight(792, 468, 702, 533, 7);
  props += [[275, 197, 1], [505, 197, 0], [275, 327, 0], [505, 327, 1]]
    .map(([x, y, b]) => portrait(x - 11, y, b) + portrait(x + 11, y, !b)).join('');
  props += hatchment(275, 50) + hatchment(505, 50);
  // the copper archway: piers and pointed spandrels between the stations
  for (const [a, b] of [[240, 430], [430, 610], [610, 760]]) {
    const m = (a + b) / 2;
    props += `<path d="M${a} 430H${b}V458Q${b} 437 ${m} 433Q${a} 437 ${a} 458Z"/>`;
  }
  for (const x of [240, 430, 610]) props += rect(x - 5, 430, x + 5, 533) + C.curl(x, 460, PI / 2 + 0.6, 7, 1, 1.6, 0.3, 10) + C.curl(x, 460, PI / 2 - 0.6, 7, -1, 1.6, 0.3, 10);
  // the vault's trestles and its iron door, standing open; the door you came down by
  props += '<path d="M92 533l16-26h3l-16 26zM108 533l-16-26h3l16 26zM160 533l16-26h3l-16 26zM176 533l-16-26h3l16 26zM88 505h26v3H88zM156 505h26v3h-26z"/>';
  props += C.door('iron', { x: 202, y: 452, w: 22, h: 81 }) + C.door('arch', { x: 696, y: 80, w: 24, h: 59 });

  const slots = Object.entries(NODES).map(([n, [x, y]]) => {
    const ly = (LANDING[n] ? LANDING[n][1] : y + 28) + 5;
    return `<path class="gb-ring" data-n="${n}" d="M${x - 26} ${ly}Q${x} ${ly - 5.5} ${x + 26} ${ly}Q${x} ${ly + 5.5} ${x - 26} ${ly}Z"/>`;
  }).join('');
  const hits = Object.entries(NODES).map(([n, [x, y]]) => `<circle class="gb-hit" data-n="${n}" cx="${x}" cy="${y}" r="55" role="button" tabindex="-1" aria-label="${NAMES[n]}"/>`).join('');
  return `
  <defs>
    <mask id="${P}holes" maskUnits="userSpaceOnUse" x="0" y="0" width="960" height="560"><rect width="960" height="560" fill="#fff"/><g fill="#000">${HOLES}</g></mask>
    <radialGradient id="${P}spill"><stop offset="0" stop-color="#f7d894" stop-opacity=".55"/><stop offset="1" stop-color="#f7d894" stop-opacity="0"/></radialGradient>
    <radialGradient id="${P}pool"><stop offset="0" stop-color="#fff3d0" stop-opacity=".95"/><stop offset=".55" stop-color="#f7d894" stop-opacity=".75"/><stop offset="1" stop-color="#f7d894" stop-opacity="0"/></radialGradient>
    <radialGradient id="${P}flash"><stop offset="0" stop-color="#fff3d0"/><stop offset=".6" stop-color="#f7d894" stop-opacity=".7"/><stop offset="1" stop-color="#f7d894" stop-opacity="0"/></radialGradient>
  </defs>
  <g class="gb-light">
    ${C.backdrop('burial', { y: -900, h: 1460, clouds: false, hills: false })}
    <ellipse cx="700" cy="104" rx="360" ry="80" fill="url(#${P}spill)"/>
  </g>
  <g class="gb-beams"></g>
  <g class="gb-smudge"></g>
  <g class="gb-paper" fill="currentColor">
    <rect width="960" height="560" mask="url(#${P}holes)"/>
    ${lace}${props}
  </g>
  <g class="gb-rings">${slots}</g>
  <g class="gb-trail"></g>
  <g class="gb-pos gb-ghost" style="opacity:0">${feet(7)}</g>
  <g class="gb-pos gb-docpos"><g class="gb-dir">${doctor()}</g></g>
  <g class="gb-pos gb-coffpos"><g class="gb-turn"><g class="gb-bob"><g class="gb-lift"><g class="gb-carry touch">${carry()}</g></g><g class="gb-third">${feet(13.2)}</g></g></g></g>
  <g class="gb-hits">${hits}</g>`;
}

const COFFIN = '100,315 200,262 660,290 660,430 200,458 100,405';
const SATIN = '114,321 203,275 647,300 647,420 203,445 114,399';
const SLIVER = '100,315 200,262 660,290 660,306 200,278 100,331';
const SCREWS = [[218, 290], [218, 430], [600, 306], [600, 414]];
const LID0 = { x: 100, y: -120, r: -8 };
const CPTS = COFFIN.split(' ').map((p) => p.split(',').map(Number));
// the lid's top edge, for sound-words that should sit on the light above it
const lidTop = (x) => (x < 200 ? 315 - ((x - 100) * 53) / 100 : 262 + ((x - 200) * 28) / 460);

// Lace holes along the lid, set in from its edge (light through holes when it is off).
function lidPath() {
  const hole = C.lace() < 1 ? 3 : 2.2, step = C.lace() < 1 ? 26 : 17, inset = 21; // clear of the sliver band (16): only the sliver shows red
  let d = `M${COFFIN.replace(/ /g, 'L')}Z`;
  for (let i = 0; i < CPTS.length; i++) {
    const [ax, ay] = CPTS[i], [bx, by] = CPTS[(i + 1) % CPTS.length];
    const L = Math.hypot(bx - ax, by - ay), n = Math.max(1, Math.round(L / step));
    let nx = -(by - ay) / L, ny = (bx - ax) / L;
    if ((380 - (ax + bx) / 2) * nx + (360 - (ay + by) / 2) * ny < 0) { nx = -nx; ny = -ny; }
    for (let k = 1; k < n; k++) {
      const x = ax + ((bx - ax) * k) / n + nx * inset, y = ay + ((by - ay) * k) / n + ny * inset;
      d += `M${f1(x - hole)} ${f1(y)}a${hole} ${hole} 0 1 0 ${f1(2 * hole)} 0a${hole} ${hole} 0 1 0 ${f1(-2 * hole)} 0Z`;
    }
  }
  return d;
}

function lidMarkup(P) {
  const VAULT = 'M40 556V250Q40 96 390 92Q740 96 740 250V556Z';
  const DOOR = 'M800 478V182Q800 120 852 120Q904 120 904 182V478Z';
  let rivets = '';
  for (let t = 0.06; t < 0.95; t += 0.045) { // copper sheathing: rivet holes round the vault [u29]
    const x = (1 - t) * (1 - t) * 40 + 2 * (1 - t) * t * 390 + t * t * 740, y = (1 - t) * (1 - t) * 216 + 2 * (1 - t) * t * 60 + t * t * 216;
    rivets += dot(x, y, 1.6);
  }
  for (let y = 250; y <= 520; y += 30) rivets += dot(22, y, 1.6) + dot(760, y, 1.6);
  const screws = SCREWS.map(([x, y], i) => `
      <g class="gb-screw" data-i="${i}" transform="translate(${x} ${y})">
        <g class="gb-screwt touch" aria-disabled="true">
          <circle class="gb-well" r="17"/>
          <circle class="gb-prog" r="23" transform="rotate(-90)"/>
          <g class="gb-headg"><circle class="gb-head" r="12.5"/></g>
          <line class="gb-slot" x1="-8" y1="0" x2="8" y2="0" style="transform:rotate(${i * 37 + 20}deg)"/>
          <circle class="gb-hit" r="62" role="button" tabindex="-1" aria-label="A screw. Turn it clockwise, or tap it."/>
        </g>
      </g>`).join('');
  // Madeline lying (the library's cut), head to the left, in gauze on the black satin; the blush is the truth.
  const MS = 8, MX = 392, MY = 386;
  return `
  <g class="gb-lidscene">
    <defs>
      <mask id="${P}vault" maskUnits="userSpaceOnUse" x="0" y="0" width="960" height="560"><rect width="960" height="560" fill="#fff"/><path d="${VAULT}${DOOR}" fill="#000"/></mask>
      <radialGradient id="${P}torch"><stop offset="0" stop-color="#f7d894" stop-opacity=".6"/><stop offset=".5" stop-color="#e3a86e" stop-opacity=".28"/><stop offset="1" stop-color="#e3a86e" stop-opacity="0"/></radialGradient>
    </defs>
    <g class="gb-light">
      ${C.backdrop('burial', { y: -900, h: 1460, clouds: false, hills: false })}
      <ellipse cx="400" cy="210" rx="400" ry="230" fill="url(#${P}torch)"/>
      <path d="${DOOR}" fill="url(#sh-lamp)"/>
    </g>
    <g class="gb-paper" fill="currentColor">
      <rect width="960" height="560" mask="url(#${P}vault)"/>
      <g style="fill:var(--sh-lamp)" opacity=".55">${rivets}</g>
      ${C.scallops(46, 734, 540, 1.7, 5)}<rect x="40" y="540" width="700" height="16"/>
      <path d="M180 440h12v100h-12zM570 420h12v120h-12zM186 500h390v6H186z"/>
      <polygon points="${COFFIN}"/>
      <polygon class="gb-satin" points="${SATIN}"/>
      ${C.figure('madeline', { x: MX, y: MY, scale: MS, flip: true, pose: 'lie', cls: 'gb-mad' })}
      <ellipse class="gb-blush" cx="${f1(MX - 18.6 * MS)}" cy="${f1(MY - 5.6 * MS)}" rx="7" ry="4.4"/>
      <polygon class="gb-sliver" points="${SLIVER}"/>
      <path d="M800 186L768 200V490L800 478Z"/>
      <g style="fill:#c98a52" opacity=".85">${[[776, 214], [792, 208], [776, 300], [792, 296], [776, 390], [792, 388], [776, 470], [792, 466]].map(([x, y]) => dot(x, y, 1.8)).join('')}</g>
    </g>
    <g class="gb-doorway">
      <g class="gb-rodd">${C.figure('roderick', { x: 852, y: 476, scale: 4.2, flip: true, cls: 'touch gb-rodt' })}</g>
      <rect class="gb-doorhit" x="760" y="112" width="156" height="384" role="button" tabindex="-1" aria-label="Leave with Roderick"/>
    </g>
    <g class="gb-lid">
      <g class="gb-lidt touch">
        <path class="gb-lidbody" fill-rule="evenodd" d="${lidPath()}" role="button" tabindex="0" aria-label="The lid. Drag it home."/>
      </g>
      ${screws}
    </g>
  </g>`;
}

function endMarkup(P) {
  return `
  <defs><radialGradient id="${P}endlight"><stop offset="0" stop-color="#b97a4c" stop-opacity=".5"/><stop offset=".55" stop-color="#7a5a40" stop-opacity=".18"/><stop offset="1" stop-color="#7a5a40" stop-opacity="0"/></radialGradient></defs>
  <rect width="960" height="560" style="fill:var(--sh-cut)"/>
  <ellipse cx="480" cy="330" rx="250" ry="210" fill="url(#${P}endlight)"/>
  <g fill="currentColor">${C.door('iron', { x: 404, y: 150, w: 152, h: 330 })}${C.scallops(330, 630, 480, 2.2, 7.4)}<rect x="330" y="480" width="300" height="8"/></g>`;
}

const CSS = `
.g-burial{
  --u:calc(100cqw / 960);
  position:relative;width:100%;height:100%;overflow:hidden;container-type:inline-size;
  background:var(--sh-cut,#0b0809);color:var(--sh-paper,#ede2cb);font-family:var(--sh-serif,'IM Fell English',Georgia,serif);
  -webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent;
}
.g-burial .gb-svg{display:block;width:100%;height:100%;touch-action:manipulation;color:var(--sh-cut,#0b0809)}
.g-burial.gb-lidmode .gb-svg{touch-action:none}
.g-burial.gb-busy .gb-svg{pointer-events:none}
.g-burial .gb-irisvg{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
.g-burial .gb-iris{fill:var(--sh-cut,#0b0809)}
.g-burial .gb-veil{fill:var(--sh-cut,#0b0809);opacity:0;transition:opacity .125s linear}
.g-burial .gb-ring{fill:url(#sh-lamp);opacity:0;transition:opacity .2s linear;transform-box:fill-box;transform-origin:50% 50%}
.g-burial .gb-ring.gb-near{opacity:1;animation:gb-pulse 1.3s ease-in-out infinite}
.g-burial .gb-ring.gb-near.is-hot{animation:none;opacity:1;transform:scale(1.18)}
.g-burial .gb-hit{fill:none;pointer-events:all;outline:none}
.g-burial .gb-hit.gb-can{cursor:pointer}
.g-burial .gb-hit:focus-visible{stroke:var(--sh-lamp,#f7d894);stroke-width:1.5px;stroke-dasharray:4 5}
.g-burial .gb-pos{transition:transform .34s ease,opacity .25s linear}
.g-burial .gb-pos.gb-snap{transition:opacity .25s linear}
.g-burial .gb-gone{opacity:0!important}
.g-burial .gb-turn,.g-burial .gb-dir,.g-burial .gb-rturn,.g-burial .gb-rdir{transition:transform var(--sh-turn,160ms) linear}
.g-burial .gb-lift{transition:transform .6s ease}
.g-burial .gb-lifted .gb-lift{transform:translateY(-6px)}
.g-burial .gb-third{opacity:0;transition:opacity .6s linear}
.g-burial .gb-lifted .gb-third{opacity:1}
.g-burial .gb-left{opacity:.3}
.g-burial .gb-bobbing{animation:gb-bob .34s ease}
.g-burial .gb-cone{fill:var(--sh-lamp,#f7d894);opacity:.3}
.g-burial .gb-trailp{fill:none;stroke:var(--sh-cut,#0b0809);stroke-width:5.5px;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:.1 12}
.g-burial .gb-trailt{fill:none;stroke:var(--sh-cut,#0b0809);stroke-width:5px;stroke-linecap:round;stroke-dasharray:.1 9.5}
.g-burial .gb-print{fill:var(--sh-return,#f3dba2)}
.g-burial .gb-sw{font-family:var(--sh-serif,'IM Fell English',Georgia,serif);font-style:italic;font-size:34px;text-anchor:middle;fill:var(--sh-cut,#0b0809);pointer-events:none}
.g-burial .gb-sw.gb-loud{font-style:normal;font-size:44px;letter-spacing:.04em}
.g-burial .gb-sw.gb-xl{font-style:normal;font-size:58px;letter-spacing:.04em}
.g-burial .gb-sw.gb-cutout{fill:var(--sh-lamp,#f7d894)}
.g-burial .gb-sw.gb-onink{fill:var(--sh-return,#f3dba2);font-size:40px}
.g-burial .gb-fade{animation:gb-sw 1.5s linear forwards}
.g-burial .gb-flash{opacity:0;animation:gb-flash .3s ease-out forwards}
.g-burial.gb-rm .gb-flash{animation:none;opacity:.85}
@keyframes gb-pulse{0%,100%{opacity:1}50%{opacity:.35}}
@keyframes gb-bob{50%{transform:translateY(-1.5px)}}
@keyframes gb-sw{0%,60%{opacity:1}100%{opacity:0}}
@keyframes gb-flash{0%{opacity:0}35%{opacity:.95}100%{opacity:0}}
.g-burial .gb-cap{position:absolute;left:calc(var(--u)*44);top:calc(var(--u)*7);width:calc(var(--u)*640);pointer-events:none}
.g-burial .gb-teach{display:inline-block;padding:0 .35em .05em 0;background:var(--sh-cut,#0b0809);font-style:italic;font-size:max(13px,calc(var(--u)*26));line-height:1.2;color:var(--sh-paper,#ede2cb)}
.g-burial .gb-two{position:relative;display:inline-block}
.g-burial .gb-two::after{content:"";position:absolute;left:-.08em;right:-.08em;top:54%;height:max(1.5px,calc(var(--u)*2.6));background:var(--sh-red,#e0392b);transform:scaleX(0);transform-origin:0 50%;transition:transform .7s ease}
.g-burial .gb-two.gb-struck::after{transform:scaleX(1)}
.g-burial .gb-say{position:absolute;left:calc(var(--u)*40);top:calc(var(--u)*52);max-width:calc(var(--u)*640);pointer-events:none;padding:.22em .7em .3em;font-size:max(12px,calc(var(--u)*21));line-height:1.25;color:var(--sh-paper,#ede2cb);background:var(--sh-cut,#0b0809);border-top:1px solid rgba(247,216,148,.35);border-bottom:1px solid rgba(247,216,148,.35);opacity:0;transition:opacity .2s linear}
.g-burial .gb-say.gb-on{opacity:1}
.g-burial .gb-say b{display:block;font-weight:normal;font-size:max(10px,calc(var(--u)*12));letter-spacing:.2em;text-transform:uppercase;color:var(--sh-speaker,#d79a6a);margin-bottom:.15em}
.g-burial .gb-say em{font-style:italic;color:var(--sh-paper,#ede2cb)}
.g-burial .gb-score{position:absolute;right:calc(var(--u)*40);bottom:calc(var(--u)*86);font-size:max(10px,calc(var(--u)*17));letter-spacing:.16em;text-transform:uppercase;color:var(--sh-lamp,#f7d894);pointer-events:none}
.g-burial .gb-leave{position:absolute;left:calc(var(--u)*852);top:calc(var(--u)*112);transform:translate(-50%,-100%);font-size:max(11px,calc(var(--u)*15));letter-spacing:.16em;text-transform:uppercase;color:var(--sh-lamp,#f7d894);opacity:0;transition:opacity .6s linear;pointer-events:none}
.g-burial .gb-leave.gb-on{opacity:1}
.g-burial .gb-note{position:absolute;left:0;right:0;top:calc(var(--u)*504);text-align:center;font-style:italic;font-size:max(14px,calc(var(--u)*26));color:var(--sh-paper,#ede2cb);opacity:0;transition:opacity .8s linear;pointer-events:none}
.g-burial .gb-note.gb-on{opacity:1}
.g-burial.gb-dark .gb-cap,.g-burial.gb-dark .gb-score{opacity:0}
.g-burial .gb-lidbody{fill:var(--sh-cut,#0b0809);cursor:grab;outline:none}
.g-burial .gb-lidt.is-held .gb-lidbody{cursor:grabbing}
.g-burial .gb-lid.gb-home .gb-lidbody{cursor:default}
/* black lid over a black coffin: while it is off, the lamp always gets round its edge (legibility of the one thing to touch) */
.g-burial .gb-lid:not(.gb-home) .gb-lidt:not(:hover):not(.is-held):not(:focus-within){filter:url(#sh-rim-soft)}
.g-burial .gb-lidbody:focus-visible{stroke:var(--sh-lamp,#f7d894);stroke-width:1.5px;stroke-dasharray:4 5}
.g-burial .gb-satin{fill:var(--sh-cut,#0b0809);stroke:var(--sh-lamp,#f7d894);stroke-width:1.2px;stroke-opacity:.55}
.g-burial .gb-sliver{fill:var(--sh-red,#e0392b);opacity:0}
.g-burial .gb-home-on .gb-sliver{opacity:1}
.g-burial .gb-blush{fill:var(--sh-red,#e0392b);opacity:.8}
.g-burial .gb-well{fill:url(#sh-lamp)}
.g-burial .gb-head{fill:var(--sh-cut,#0b0809)}
.g-burial .gb-slot{stroke:var(--sh-lamp,#f7d894);stroke-width:2.6px;stroke-linecap:round}
.g-burial .gb-prog{fill:none;stroke:var(--sh-lamp,#f7d894);stroke-width:2.4px;stroke-linecap:butt;stroke-dasharray:0 200}
.g-burial .gb-screw .gb-hit{pointer-events:none}
.g-burial .gb-home-on .gb-screw:not(.gb-seated) .gb-hit{pointer-events:all;cursor:pointer}
.g-burial .gb-home-on .gb-screw:not(.gb-seated) .gb-well{animation:gb-pulse 1.6s ease-in-out infinite}
.g-burial .gb-seated .gb-well{transform:scale(.82);opacity:.45}
.g-burial .gb-seated .gb-prog{opacity:0}
.g-burial .gb-rodd{opacity:0;transition:opacity .9s linear}
.g-burial .gb-waiting .gb-rodd{opacity:1}
.g-burial .gb-doorhit{fill:none;pointer-events:none;outline:none}
.g-burial .gb-waiting .gb-doorhit{pointer-events:all;cursor:pointer}
.g-burial .gb-doorhit:focus-visible{stroke:var(--sh-lamp,#f7d894);stroke-dasharray:4 5}
.g-burial.gb-rm .gb-pos,.g-burial.gb-rm .gb-lift,.g-burial.gb-rm .gb-turn,.g-burial.gb-rm .gb-dir,.g-burial.gb-rm .gb-rturn,.g-burial.gb-rm .gb-rdir{transition:opacity .25s linear}
.g-burial.gb-rm .gb-lifted .gb-lift{transform:none}
.g-burial.gb-rm .gb-near,.g-burial.gb-rm .gb-bobbing,.g-burial.gb-rm .gb-well{animation:none!important}
.g-burial.gb-rm .gb-two::after{transition:none}
/* small stages (phones): game type ×1.5; the ribbon spans the stage and keeps off the bearers */
@container (max-width:600px){
  .g-burial .gb-teach{font-size:calc(max(13px,calc(var(--u)*26))*1.5)}
  .g-burial .gb-say{top:calc(var(--u)*10 + 30px);right:calc(var(--u)*40);max-width:none;font-size:calc(max(12px,calc(var(--u)*21))*1.5)}
  .g-burial.gb-saylow .gb-say{top:auto;bottom:calc(var(--u)*24)}
  .g-burial.gb-teachlow .gb-cap{top:auto;bottom:calc(var(--u)*30)}
  .g-burial.gb-teachlow .gb-score{opacity:0}
  .g-burial .gb-say b{display:inline;font-size:calc(max(10px,calc(var(--u)*12))*1.5);margin:0 .6em 0 0}
  .g-burial .gb-score{bottom:calc(var(--u)*40);font-size:calc(max(10px,calc(var(--u)*17))*1.5)}
  .g-burial .gb-leave{font-size:calc(max(11px,calc(var(--u)*15))*1.5)}
  .g-burial .gb-note{font-size:calc(max(14px,calc(var(--u)*26))*1.5)}
  .g-burial .gb-sw{font-size:51px}
  .g-burial .gb-sw.gb-loud{font-size:66px}
  .g-burial .gb-sw.gb-xl{font-size:80px}
  .g-burial .gb-sw.gb-onink{font-size:60px}
}
@media (prefers-reduced-motion:reduce){.g-burial .gb-near,.g-burial .gb-bobbing,.g-burial .gb-well{animation:none!important}}
`;

let mounts = 0;
const SVGNS = 'http://www.w3.org/2000/svg';
const ease = (k) => (k < 0.5 ? 2 * k * k : 1 - (2 - 2 * k) ** 2 / 2);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const OPEN = 1200; // iris radius that clears the stage from any centre

export default {
  id: 'burial',
  title: 'A Harmless Precaution',
  mount(stage, api = {}) {
    const rm = !!api.reducedMotion;
    const P = `gb${++mounts}-`;
    C.autoLace(); // lace density is decided at generation: before any markup
    let dead = false;
    const timers = new Set(), rafs = new Set(), offs = [];
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); if (!dead) fn(); }, ms); timers.add(id); return id; };
    const cancel = (id) => { clearTimeout(id); timers.delete(id); };
    const raf = (fn) => { const id = requestAnimationFrame((t) => { rafs.delete(id); if (!dead) fn(t); }); rafs.add(id); };
    const on = (el, type, fn, opt) => { el.addEventListener(type, fn, opt); offs.push(() => el.removeEventListener(type, fn, opt)); };
    const tween = (ms, step) => new Promise((res) => {
      if (rm || ms <= 0) { step(1); res(); return; }
      const t0 = performance.now();
      const fr = (t) => { const k = Math.min(1, (t - t0) / ms); step(k); if (k < 1) raf(fr); else res(); };
      raf(fr);
    });

    // ── DOM ──
    const root = document.createElement('div');
    root.className = 'g-burial' + (rm ? ' gb-rm sh-still' : '');
    root.innerHTML = `<style>${CSS}</style>
<svg class="gb-svg" viewBox="0 0 960 640" preserveAspectRatio="xMidYMid meet" role="img" aria-label="A cutaway of the house of Usher in black paper, down to the vault">
  ${C.defs({ animate: !rm })}
  <defs><clipPath id="${P}band"><rect x="0" y="560" width="960" height="48"/></clipPath></defs>
  <g class="gb-scene"></g>
  <g class="gb-bandg">
    ${C.glass('burial', { y: 560, h: 48 })}
    <g clip-path="url(#${P}band)">
      <g class="gb-refl"></g>
      <g class="gb-prints"></g>
    </g>
    <g fill="currentColor">${C.scallops(18, 942, 560, 2.2, 7.4)}<rect x="0" y="608" width="960" height="32"/>${C.scallops(18, 942, 608, 2.2, 7.4)}</g>
  </g>
  <g class="gb-sounds"></g>
  ${C.frame()}
</svg>
<div class="gb-cap"><div class="gb-teach"></div></div>
<div class="gb-score"></div>
<div class="gb-say" aria-live="polite"></div>
<div class="gb-leave">leave</div>
<div class="gb-note"></div>
<svg class="gb-irisvg" viewBox="0 0 960 640" aria-hidden="true">
  <path class="gb-iris sh-iris" fill-rule="evenodd" d="" style="display:none"/>
  <rect class="gb-veil" x="-20" y="-20" width="1000" height="680"/>
</svg>`;
    stage.appendChild(root);
    const $ = (s, el = root) => el.querySelector(s);
    const svg = $('.gb-svg'), scene = $('.gb-scene'), reflG = $('.gb-refl'), printsG = $('.gb-prints'), soundsG = $('.gb-sounds');
    const teach = $('.gb-teach'), sayEl = $('.gb-say'), scoreEl = $('.gb-score'), leaveEl = $('.gb-leave'), noteEl = $('.gb-note');
    const irisC = $('.gb-iris'), veil = $('.gb-veil');

    const svgPt = (e) => {
      const m = svg.getScreenCTM();
      if (!m) return { x: 0, y: 0 };
      const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
      return { x: p.x, y: p.y };
    };
    const capture = (el, id) => { try { el.setPointerCapture(id); } catch (_) { /* synthetic pointer */ } };
    const release = (el, id) => { try { el.releasePointerCapture(id); } catch (_) { /* already gone */ } };

    // ── Type: the teaching line, speech, sound-words ──
    const sayQ = [];
    let sayTimer = null;
    function nextSay() {
      sayTimer = null;
      const l = sayQ.shift();
      if (!l) { sayEl.classList.remove('gb-on'); return; }
      sayEl.innerHTML = l.who ? `<b>${l.who}</b>${l.text}` : `<em>${l.text}</em>`;
      placeSay();
      sayEl.classList.add('gb-on');
      sayTimer = later(nextSay, l.ms || 2400);
    }
    function say(lines, clear = false) {
      if (clear) { sayQ.length = 0; if (sayTimer) cancel(sayTimer); sayTimer = null; }
      sayQ.push(...lines);
      if (!sayTimer) nextSay();
    }
    // On a small stage the ribbon is big: keep it off the bearers (top normally, bottom while they are upstairs or at the lid).
    function placeSay() {
      const low = phase === 'lid' || (phase === 'stair' && NODES[model.p][1] < 300);
      root.classList.toggle('gb-saylow', low);
      // the big phone teaching line would hide their heads on the top landings: it waits over the glass till they're down
      root.classList.toggle('gb-teachlow', phase === 'stair' && NODES[model.p][1] < 150);
    }
    let tilt = 0;
    function sound(text, x, y, kind = '') {
      const t = document.createElementNS(SVGNS, 'text');
      tilt = (tilt + 1) % 5;
      t.setAttribute('x', f1(x)); t.setAttribute('y', f1(y));
      t.setAttribute('transform', `rotate(${(tilt - 2) * 1.6} ${f1(x)} ${f1(y)})`);
      t.setAttribute('class', `gb-sw ${kind}${rm ? '' : ' gb-fade'}`);
      t.textContent = text;
      soundsG.appendChild(t);
      if (!rm) later(() => t.remove(), 1600);
      return t;
    }

    // ── State ──
    let phase = 'stair';
    let lockUntil = 0;
    const lockFor = (ms) => { lockUntil = Math.max(lockUntil, performance.now() + ms); };
    const locked = () => performance.now() < lockUntil;
    const model = createModel();
    let face = -1, bface = -1, saidDoctors = false, printN = 0, finished = false, ending = false;

    function score() {
      const n = (v) => (v === 0 ? 'none' : v); // an old-style 0 reads as a letter
      scoreEl.textContent = phase === 'lid' ? `screws ${n(seatedN)} of 4` : `glimpses ${n(model.glimpses)}`;
    }

    // ── The stair ──
    scene.innerHTML = stairMarkup(P);
    teach.innerHTML = LINES.teach;
    reflG.innerHTML = C.returned(`<g class="gb-pos gb-rc"><g class="gb-rturn">${carry()}</g></g><g class="gb-pos gb-rd"><g class="gb-rdir">${doctor()}</g></g>`, { still: true, transform: 'translate(0 0)' });
    const coffPos = $('.gb-coffpos'), bobG = $('.gb-bob'), docPos = $('.gb-docpos'), docDir = $('.gb-dir');
    const ghost = $('.gb-ghost'), beamsG = $('.gb-beams'), trailG = $('.gb-trail'), smudgeG = $('.gb-smudge');
    const reflC = $('.gb-rc'), reflD = $('.gb-rd'), reflDir = $('.gb-rdir');
    const turnG = $('.gb-turn'), rturnG = $('.gb-rturn'), carryG = $('.gb-carry'), docFig = $('.gb-docpos .sh-fig');
    const rings = [...root.querySelectorAll('.gb-ring')], hits = [...root.querySelectorAll('.gb-hit[data-n]')];
    // hands to the handles: Roderick's arm swings back to the coffin behind him
    for (const el of root.querySelectorAll('.sh-roderick')) C.hinge(el, '.sh-arm', 28);

    const at = (n) => NODES[n];
    function setFacing() {
      turnG.style.transform = `scaleX(${bface})`;
      rturnG.style.transform = `scaleX(${bface})`;
    }
    function placeCoffin(n) {
      const [x, y] = at(n);
      coffPos.style.transform = `translate(${x}px,${y + FLOOR}px)`;
      reflC.style.transform = `translate(${x}px,563px) scale(.4,-.36)`;
    }
    function facingFor(ph) {
      if (ph.mode === 'guard') return -1;
      const nx = ph.path[1];
      if (nx) { const dx = at(nx)[0] - at(ph.at)[0]; if (dx) return Math.sign(dx); }
      if (ph.mode === 'look') return face;
      return face;
    }
    let docAt = null;
    function placeDoc(ph) {
      face = facingFor(ph);
      const [x, y] = at(ph.at);
      if (docAt && docAt !== ph.at && !rm) { docFig.classList.add('sh-moving'); later(() => docFig.classList.remove('sh-moving'), 340); }
      docAt = ph.at;
      docPos.style.transform = `translate(${x}px,${y + FLOOR}px)`;
      docDir.style.transform = `scaleX(${face})`;
      reflD.style.transform = `translate(${x}px,563px) scale(.4,-.36)`;
      reflDir.style.transform = `scaleX(${face})`;
    }
    function drawBeams(ph) {
      const [px, py] = at(ph.at);
      const ox = px + 26 * face, oy = py + FLOOR - 25;
      let s = '';
      for (const n of ph.lit) {
        const [lx, ly0] = at(n), ly = ly0 + 6;
        const vx = lx - ox, vy = ly - oy, len = Math.hypot(vx, vy) || 1;
        const nx = (-vy / len) * 36, ny = (vx / len) * 36;
        s += `<path class="gb-cone" d="M${f1(ox)} ${f1(oy)}L${f1(lx + nx)} ${f1(ly + ny)}L${f1(lx - nx)} ${f1(ly - ny)}Z"/>`;
        s += `<ellipse cx="${lx}" cy="${ly}" rx="52" ry="46" fill="url(#${P}pool)"/>`;
      }
      beamsG.innerHTML = s;
    }
    function drawTrail(ph) {
      if (ph.path.length < 2) { trailG.replaceChildren(); return; }
      const pts = ph.path.map((n) => `${at(n)[0]},${at(n)[1] + 10}`).join(' ');
      const [tx, ty] = at(ph.path[ph.path.length - 1]);
      trailG.innerHTML = `<polyline class="gb-trailp" points="${pts}"/><circle class="gb-trailt" cx="${tx}" cy="${ty + 10}" r="15"/>`;
    }
    function renderDoc(ph, delay = 0) {
      placeDoc(ph);
      const draw = () => { drawBeams(ph); drawTrail(ph); };
      if (delay && !rm) later(draw, delay); else draw();
    }
    function ghostAt(n) {
      if (!n) { ghost.style.opacity = '0'; return; }
      const [x, y] = at(n);
      ghost.style.transform = `translate(${x}px,${y + FLOOR}px)`;
      ghost.style.opacity = '1';
    }
    let hush = false; // true while a caught beat plays out
    let hot = null; // the node under the pointer or focus
    function applyHot() {
      const live = phase === 'stair' && !model.over && !hush;
      for (const r of rings) r.classList.toggle('is-hot', r.getAttribute('data-n') === hot);
      carryG.classList.toggle('is-hot', live && hot === model.p);
      carryG.setAttribute('aria-disabled', live ? 'false' : 'true');
    }
    function markNear() {
      const live = phase === 'stair' && !model.over && !hush;
      const near = live ? Object.keys(NODES).filter((n) => n !== model.p && canMove(model, n)) : [];
      for (const r of rings) r.classList.toggle('gb-near', near.includes(r.getAttribute('data-n')));
      for (const h of hits) {
        const n = h.getAttribute('data-n');
        const ok = live && (near.includes(n) || n === model.p);
        h.classList.toggle('gb-can', ok);
        h.setAttribute('tabindex', ok ? '0' : '-1');
        h.setAttribute('aria-label', n === model.p ? 'Wait a beat' : `Carry her to ${NAMES[n]}`);
      }
      applyHot();
    }
    function printFoot(n, from) {
      const [x, y] = at(n);
      const [fx, fy] = from ? at(from) : [x, y - 100];
      const ang = (Math.atan2(y - fy, x - fx) * 180) / Math.PI + 90;
      const side = printN % 2 ? 1 : -1;
      const jit = ((printN * 37) % 23) - 11;
      printN++;
      const g = document.createElementNS(SVGNS, 'g');
      g.setAttribute('class', 'gb-print');
      g.setAttribute('transform', `translate(${x + jit} ${586 + side * 6}) rotate(${f1(ang)}) scale(${side * 1.3} 1.3)`);
      g.innerHTML = FOOT;
      printsG.appendChild(g);
      const all = printsG.children;
      while (all.length > 40) all[0].remove();
      for (let i = 0; i < all.length; i++) all[i].style.opacity = String(Math.max(0.25, 1 - (all.length - 1 - i) * 0.07));
    }
    function patAt({ at: n, from }) {
      const [x, y] = at(n);
      const loud = model.copper;
      sound(loud ? 'PAT.' : 'pat.', x + (printN % 2 ? 10 : -10), y - 18, loud ? 'gb-loud' : '');
      printFoot(n, from);
    }
    function bob() {
      if (rm) return;
      bobG.classList.remove('gb-bobbing');
      void bobG.getBoundingClientRect();
      bobG.classList.add('gb-bobbing');
    }
    function smudge(n) { // his lamp finds them: the light behind the paper flares
      const [x, y] = at(n);
      smudgeG.innerHTML = `<ellipse class="gb-flash" cx="${x}" cy="${y}" rx="110" ry="70" fill="url(#${P}flash)"/>`;
      later(() => smudgeG.replaceChildren(), 400);
    }
    function teleport() {
      const els = [coffPos, docPos, ghost];
      for (const el of els) el.classList.add('gb-snap');
      placeCoffin(model.p); renderDoc(model.ph); ghostAt(null);
      void root.getBoundingClientRect();
      coffPos.classList.remove('gb-gone'); docPos.classList.remove('gb-gone');
      later(() => { for (const el of els) el.classList.remove('gb-snap'); }, 300);
    }

    function act(n) {
      if (phase !== 'stair' || locked()) return;
      const to = n === model.p ? 'w' : n;
      if (!canMove(model, to)) return;
      if (rm) soundsG.replaceChildren();
      const ev = beat(model, to);
      showBeat(ev);
    }

    function showBeat(ev) {
      const s = ev.show;
      lockFor(rm ? 80 : 240);
      if (!ev.wait) bob();
      placeSay();
      if (!ev.caught && !ev.wait) { const dx = at(ev.to)[0] - at(ev.from)[0]; if (dx) { bface = Math.sign(dx); setFacing(); } }
      placeCoffin(s.p);
      const step = 150;
      ev.pats.forEach((p, i) => later(() => patAt(p), 90 + i * step));
      later(() => ghostAt(model.copper && s.f === s.p ? null : s.f), 90 + Math.max(0, ev.pats.length - 1) * step);
      if (ev.copperStart) {
        docPos.classList.add('gb-left'); reflD.classList.add('gb-gone');
        beamsG.replaceChildren(); trailG.replaceChildren();
      } else if (!model.copper || ev.caught) {
        renderDoc(s.ph, 200);
      }
      if (ev.caught) { runCaught(ev); return; }
      if (ev.heard && !saidDoctors) { saidDoctors = true; later(() => say(LINES.doctors), 500); }
      if (ev.lift) {
        lockFor(2900);
        later(() => { coffPos.classList.add('gb-lifted'); say(LINES.heavy, true); }, 450);
        later(() => $('.gb-two')?.classList.add('gb-struck'), 2500);
      }
      markNear();
      if (ev.vault) {
        phase = 'trans';
        markNear();
        later(() => sound('GRATE.', 150, 470, 'gb-xl'), 380);
        later(toLid, 1500);
      }
    }

    function runCaught(ev) {
      lockFor(2300);
      hush = true;
      markNear();
      later(() => smudge(ev.show.p), 300);
      say([...LINES.caught, { text: LINES.hints[Math.min(model.glimpses, 3) - 1], ms: 5200 }], true);
      later(() => { coffPos.classList.add('gb-gone'); docPos.classList.add('gb-gone'); }, 1700);
      later(() => { teleport(); score(); hush = false; markNear(); }, 2000);
    }

    on(svg, 'click', (e) => {
      const h = e.target.closest && e.target.closest('.gb-hit[data-n]');
      if (h) act(h.getAttribute('data-n'));
    });
    on(svg, 'keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const h = e.target.closest && e.target.closest('.gb-hit[data-n]');
      if (h) { e.preventDefault(); act(h.getAttribute('data-n')); }
    });
    const hover = (e, inside) => {
      const h = e.target.closest && e.target.closest('.gb-hit[data-n]');
      if (!h) return;
      const n = h.getAttribute('data-n');
      if (inside) hot = n; else if (hot === n) hot = null;
      applyHot();
    };
    on(svg, 'pointerover', (e) => hover(e, true));
    on(svg, 'pointerout', (e) => hover(e, false));
    on(svg, 'focusin', (e) => hover(e, true));
    on(svg, 'focusout', (e) => hover(e, false));

    setFacing();
    placeSay();
    placeCoffin(model.p);
    renderDoc(model.ph);
    markNear();
    score();

    // ── The iris: a lace-edged hole in the black stage (LOOK §8) ──
    function irisTo(cx, cy, from, to, ms) {
      if (rm) {
        veil.style.opacity = to < from ? '1' : '0';
        return new Promise((res) => later(res, 140));
      }
      irisC.style.display = '';
      return tween(ms, (k) => irisC.setAttribute('d', C.irisD(cx, cy, Math.max(0, from + (to - from) * ease(k))))).then(() => {
        if (to >= OPEN) irisC.style.display = 'none';
      });
    }

    // ── The lid ──
    let lidScene, lidG, lidT, lidBody, screwEls = [], turn = null;
    const lid = { ...LID0, home: false, drag: null };
    const D0 = Math.hypot(LID0.x, LID0.y - 12);
    const screws = SCREWS.map(() => ({ deg: 0, seated: false }));
    let seatedN = 0;
    const sliver = () => (4 - seatedN) * 3;
    const setLid = () => lidG.setAttribute('transform', `translate(${f1(lid.x)} ${f1(lid.y)}) rotate(${f1(lid.r)} 380 360)`);
    const screwCenter = (i) => ({ x: SCREWS[i][0] + lid.x, y: SCREWS[i][1] + lid.y });
    const screwTouch = (i) => $('.gb-screwt', screwEls[i]);

    async function toLid() {
      root.classList.add('gb-busy');
      await irisTo(130, 505, OPEN, 0, 700);
      if (dead) return;
      buildLid();
      await irisTo(380, 360, 0, OPEN, 900);
      if (dead) return;
      root.classList.remove('gb-busy');
      say(LINES.blush, true);
    }

    function buildLid() {
      phase = 'lid';
      soundsG.replaceChildren();
      reflG.replaceChildren();
      scene.innerHTML = lidMarkup(P);
      root.classList.add('gb-lidmode');
      teach.textContent = LINES.lidTeach;
      placeSay();
      score();
      lidScene = $('.gb-lidscene'); lidG = $('.gb-lid'); lidT = $('.gb-lidt'); lidBody = $('.gb-lidbody');
      screwEls = [...root.querySelectorAll('.gb-screw')];
      const rod = $('.gb-rodt');
      rod.setAttribute('aria-disabled', 'true');
      setLid();

      on(lidBody, 'pointerdown', (e) => {
        if (lid.home || phase !== 'lid') return;
        e.preventDefault();
        capture(lidBody, e.pointerId);
        const p = svgPt(e);
        lid.drag = { id: e.pointerId, sx: p.x, sy: p.y, bx: lid.x, by: lid.y };
        lidG.classList.add('gb-dragging');
        lidT.classList.add('is-held');
      });
      on(lidBody, 'pointermove', (e) => {
        const d = lid.drag;
        if (!d || d.id !== e.pointerId) return;
        const p = svgPt(e);
        lid.x = clamp(d.bx + p.x - d.sx, -160, 300);
        lid.y = clamp(d.by + p.y - d.sy, -300, 180);
        const dist = Math.hypot(lid.x, lid.y - sliver());
        lid.r = LID0.r * Math.min(1, dist / D0);
        setLid();
        if (dist < 30) placeLid();
      });
      const endDrag = (e) => {
        if (!lid.drag || lid.drag.id !== e.pointerId) return;
        release(lidBody, e.pointerId);
        lid.drag = null;
        lidG.classList.remove('gb-dragging');
        lidT.classList.remove('is-held');
      };
      on(lidBody, 'pointerup', endDrag);
      on(lidBody, 'pointercancel', endDrag);
      on(lidBody, 'keydown', (e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !lid.home && phase === 'lid') { e.preventDefault(); placeLid(); }
      });

      screwEls.forEach((el, i) => {
        const hit = $('.gb-hit', el);
        on(hit, 'pointerdown', (e) => {
          if (!lid.home || screws[i].seated || phase !== 'lid') return;
          e.preventDefault(); e.stopPropagation();
          capture(hit, e.pointerId);
          const p = svgPt(e), c = screwCenter(i);
          const far = Math.hypot(p.x - c.x, p.y - c.y) >= 10;
          turn = { i, id: e.pointerId, a: far ? Math.atan2(p.y - c.y, p.x - c.x) * 180 / Math.PI : null, cx: e.clientX, cy: e.clientY, moved: 0, rot: 0 };
          screwTouch(i).classList.add('is-pressed');
        });
        on(hit, 'pointermove', (e) => {
          if (!turn || turn.id !== e.pointerId || turn.i !== i) return;
          turn.moved = Math.max(turn.moved, Math.hypot(e.clientX - turn.cx, e.clientY - turn.cy));
          const p = svgPt(e), c = screwCenter(i);
          if (Math.hypot(p.x - c.x, p.y - c.y) < 10) return;
          const a = Math.atan2(p.y - c.y, p.x - c.x) * 180 / Math.PI;
          if (turn.a === null) { turn.a = a; return; }
          let d = a - turn.a;
          if (d > 180) d -= 360;
          if (d < -180) d += 360;
          turn.a = a;
          if (d > 0) { turn.rot += d; addTurn(i, d, false); }
        });
        const up = (e) => {
          if (!turn || turn.id !== e.pointerId || turn.i !== i) return;
          const t = turn; turn = null;
          release(hit, e.pointerId);
          screwTouch(i).classList.remove('is-pressed');
          if (t.moved < 10 && t.rot < 20) addTurn(i, 90, true);
        };
        on(hit, 'pointerup', up);
        on(hit, 'pointercancel', (e) => { if (turn && turn.id === e.pointerId) turn = null; screwTouch(i).classList.remove('is-pressed'); });
        on(hit, 'keydown', (e) => {
          if (e.key !== 'Enter' && e.key !== ' ') return;
          e.preventDefault();
          if (lid.home && !screws[i].seated && phase === 'lid') addTurn(i, 90, true);
        });
      });

      const doorHit = $('.gb-doorhit');
      on(doorHit, 'click', () => { if (seatedN === 3 && phase === 'lid') finish('door'); });
      on(doorHit, 'keydown', (e) => {
        if ((e.key === 'Enter' || e.key === ' ') && seatedN === 3 && phase === 'lid') { e.preventDefault(); finish('door'); }
      });
      const rodHot = (v) => rod.classList.toggle('is-hot', v && seatedN === 3 && phase === 'lid');
      on(doorHit, 'pointerover', () => rodHot(true));
      on(doorHit, 'pointerout', () => rodHot(false));
      on(doorHit, 'focus', () => rodHot(true));
      on(doorHit, 'blur', () => rodHot(false));
    }

    function placeLid() {
      if (lid.home) return;
      lid.home = true;
      if (lid.drag) { release(lidBody, lid.drag.id); lid.drag = null; }
      lidG.classList.remove('gb-dragging');
      lidT.classList.remove('is-held');
      lidT.setAttribute('aria-disabled', 'true');
      lidBody.setAttribute('aria-label', 'The lid, home');
      const fx = lid.x, fy = lid.y, fr = lid.r, ty = sliver();
      tween(160, (k) => {
        const e = ease(k);
        lid.x = fx * (1 - e); lid.y = fy + (ty - fy) * e; lid.r = fr * (1 - e);
        setLid();
      }).then(() => {
        if (dead) return;
        lidG.classList.add('gb-home');
        lidScene.classList.add('gb-home-on');
        sound('thud.', 400, 240);
        screwEls.forEach((el, i) => { $('.gb-hit', el).setAttribute('tabindex', '0'); screwTouch(i).setAttribute('aria-disabled', 'false'); });
      });
    }

    function drawScrew(i) {
      const el = screwEls[i], s = screws[i];
      const need = s.seated ? s.deg : seatedN === 3 ? 720 : 360;
      $('.gb-slot', el).style.transform = `rotate(${f1(i * 37 + 20 + s.deg)}deg)`;
      const len = 2 * Math.PI * 23;
      $('.gb-prog', el).style.strokeDasharray = `${f1((len * Math.min(s.deg, need)) / need)} 200`;
    }

    function addTurn(i, d) {
      const s = screws[i];
      if (s.seated || ending) return;
      const need = seatedN === 3 ? 720 : 360;
      const before = s.deg;
      s.deg = Math.min(need, s.deg + d);
      if (need === 720 && Math.floor(s.deg / 180) > Math.floor(before / 180) && s.deg < need) {
        const c = screwCenter(i);
        sound('creak.', c.x, c.y - 30, 'gb-cutout');
      }
      drawScrew(i);
      if (s.deg >= need) seat(i);
    }

    function seat(i) {
      const s = screws[i];
      s.seated = true; seatedN++;
      const el = screwEls[i];
      el.classList.add('gb-seated');
      $('.gb-headg', el).removeAttribute('filter');
      $('.gb-hit', el).setAttribute('tabindex', '-1');
      screwTouch(i).setAttribute('aria-disabled', 'true');
      screwTouch(i).classList.remove('is-pressed');
      const c = screwCenter(i);
      sound('tk.', c.x, lidTop(c.x) + lid.y - 14);
      const fy = lid.y, ty = sliver();
      tween(220, (k) => { lid.y = fy + (ty - fy) * ease(k); setLid(); });
      score();
      for (let j = 0; j < screws.length; j++) if (!screws[j].seated) drawScrew(j);
      if (seatedN === 3) later(rodWaits, 500);
      if (seatedN === 4) later(() => finish('screw'), 700);
    }

    function rodWaits() {
      if (seatedN !== 3 || ending) return;
      lidScene.classList.add('gb-waiting');
      leaveEl.classList.add('gb-on');
      $('.gb-doorhit').setAttribute('tabindex', '0');
      $('.gb-rodt').setAttribute('aria-disabled', 'false');
      say([{ text: LINES.waits, ms: 7000 }], true);
    }

    // ── The end ──
    async function finish(kind) {
      if (ending) return;
      ending = true; phase = 'end';
      root.classList.add('gb-busy');
      leaveEl.classList.remove('gb-on');
      if (turn) turn = null;
      const out = seatedN < 4;
      const [cx, cy] = kind === 'door' ? [852, 300] : [380, 360];
      await irisTo(cx, cy, OPEN, 0, 700);
      if (dead) return;
      root.classList.add('gb-dark');
      root.classList.remove('gb-lidmode');
      say([], true);
      soundsG.replaceChildren();
      scene.innerHTML = endMarkup(P);
      irisC.style.display = 'none';
      veil.style.opacity = '0';
      later(() => sound('pat.', 480, 330, 'gb-onink'), 800);
      later(() => { noteEl.textContent = out ? LINES.out3 : LINES.out4; noteEl.classList.add('gb-on'); }, 1500);
      later(() => complete(out), 3000);
    }

    function complete(out) {
      if (finished) return;
      finished = true;
      if (typeof api.setFlag === 'function') {
        api.setFlag('burialScrewOut', out);
        api.setFlag('burialGlimpses', model.glimpses);
      }
      if (typeof api.done === 'function') {
        api.done({
          won: true,
          score: { bearers: 2, 'screws turned': seatedN, "the physician's glimpses": model.glimpses },
          note: out ? LINES.out3 : LINES.out4,
        });
      }
    }

    return () => {
      dead = true;
      for (const id of timers) clearTimeout(id);
      timers.clear();
      for (const id of rafs) cancelAnimationFrame(id);
      rafs.clear();
      for (const off of offs) off();
      offs.length = 0;
      root.remove();
    };
  },
};
