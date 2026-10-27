/* IV. A Harmless Precaution — the burial.
   Turn-based stealth carry (stair, gallery, copper), then the lid.
   Spec: work/design/games/burial.md · Contract: work/design/CONTRACT.md
   Every colour, stroke and texture goes through CSS custom properties
   (--paper, --ink, --muted, --rule, --red, --g-burial-*) and classes. */

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

// ── Drawing ──────────────────────────────────────────────────────────────
const FLOOR = 27; // feet sit this far below a node
const f1 = (n) => Math.round(n * 10) / 10;

const FOOT = '<path d="M0-6C2.6-6 3.4-2.6 3-.4C2.6 2.4 2.2 6 0 6C-2 6-2.6 3-2.6.6C-2.8-2.6-2.4-6 0-6Z"/><circle cx="-2.2" cy="-8.4" r="1"/><circle cx="-.5" cy="-9.2" r=".95"/><circle cx="1.1" cy="-9.1" r=".85"/><circle cx="2.5" cy="-8.4" r=".75"/><circle cx="3.5" cy="-7.2" r=".6"/>';
const GUEST = '<path class="gb-mass" d="M-4-26C-6-17-10-7-11 0H11C10-7 6-17 4-26Z"/><path class="gb-ln gb-fine" d="M3-25C9-24 13-19 15-15"/><ellipse class="gb-face" cx="0" cy="-29.5" rx="3.6" ry="4.3"/><path class="gb-mass" d="M-3.2-33V-40H3.2V-33Z"/><path class="gb-ln" d="M-5.5-33H5.5"/>';
const ROD = '<path class="gb-mass" d="M-4.5-30C-7-20-11-8-12 0H12C11-8 7-20 4.5-30Z"/><ellipse class="gb-face" cx="0" cy="-34" rx="3.6" ry="4.4"/><path class="gb-ln gb-hair" d="M-3-38c-3-4 1-8 4-6c2-4 8-2 7 2c4 1 3 6-1 6M-4-37c-4 0-5 4-2 6M3-39c3-1 6 1 5 4"/>';
const BEARERS = `<g transform="translate(-45 0) scale(-1 1)">${GUEST}</g><g transform="translate(45 0)">${ROD}</g>`
  + '<path class="gb-ln gb-fine" d="M-41-21L-36-16M41-24L36-16"/>'
  + '<path class="gb-wall" d="M-37-10H33L38-15L33-22H-35L-37-16Z"/><path class="gb-ln gb-hair" d="M-35-18H34"/>'
  + '<circle class="gb-mass" cx="-18" cy="-13.5" r="1.3"/><circle class="gb-mass" cx="16" cy="-13.5" r="1.3"/>';
const THIRD = '<g class="gb-third"><path class="gb-truthln" d="M-5-10V-1.5M4-10V-1.5"/>'
  + '<path class="gb-truthfill" d="M-5.2-2.2C-5-3.4-1.2-3-.6-1.4C-.4-.4-1 0-2 0H-5.2Z"/>'
  + '<path class="gb-truthfill" d="M3.8-2.2C4-3.4 7.8-3 8.4-1.4C8.6-.4 8 0 7 0H3.8Z"/></g>';
const DOC = '<path class="gb-mass" d="M-12 0C-15-8-14-19-8-25H8C14-19 15-8 12 0Z"/>'
  + '<path class="gb-ln gb-fine" d="M-11-14L-17-8M11-15L18-13M19-21v3"/>'
  + '<path class="gb-mass" d="M-24-9h11v8h-11z"/><path class="gb-ln gb-fine" d="M-21.5-9q3-4 6 0"/>'
  + '<circle class="gb-face" cx="0" cy="-30.5" r="6"/><circle class="gb-mass" cx="3.6" cy="-31" r="1.2"/>'
  + '<path class="gb-mass" d="M-7.5-35.2h15v-1.4c0-3.4-3.2-5.4-7.5-5.4s-7.5 2-7.5 5.4z"/>'
  + '<rect class="gb-face" x="16" y="-18" width="6.5" height="8" rx="1.2"/>';

function stairMarkup(P) {
  const CORR = 'M690 110H160V225M160 225H620L820 290L620 355H160ZM820 290V430L700 505H200';
  let steps = '';
  for (let y = 150; y <= 186; y += 9) steps += `M131 ${y}H189`;
  for (let y = 334; y <= 406; y += 9) steps += `M791 ${y}H849`;
  const [sx, sy] = NODES.S, [cx, cy] = NODES.C1;
  const L = Math.hypot(cx - sx, cy - sy), ux = (cx - sx) / L, uy = (cy - sy) / L;
  for (let t = 40; t <= L - 30; t += 11) {
    const mx = sx + ux * t, my = sy + uy * t;
    steps += `M${f1(mx - uy * 30)} ${f1(my + ux * 30)}L${f1(mx + uy * 30)} ${f1(my - ux * 30)}`;
  }
  let copper = '';
  for (let x = 244; x <= 690; x += 10) copper += `M${x} 477V533`;
  let seams = '';
  for (let x = 266; x <= 686; x += 60) seams += `M${x} 475V535`;
  const portrait = (x, y, out) => `<rect class="gb-face" x="${x}" y="${y}" width="13" height="16"/><ellipse class="${out ? 'gb-mass' : 'gb-face'}" cx="${x + 6.5}" cy="${y + 7}" rx="2.6" ry="3.3"/>`;
  const portraits = [[275, 199], [505, 199], [275, 329], [505, 329]]
    .map(([x, y], i) => portrait(x - 15, y, i % 2 === 0) + portrait(x + 2, y, i % 2 === 1)).join('');
  const rivets = [[211, 485], [231, 485], [211, 527], [231, 527], [221, 506]]
    .map(([x, y]) => `<circle class="gb-dot" cx="${x}" cy="${y}" r="1.6"/>`).join('');
  const rings = Object.entries(NODES).map(([n, [x, y]]) => `<ellipse class="gb-ring" data-n="${n}" cx="${x}" cy="${y + 29}" rx="30" ry="7"/>`).join('');
  const hits = Object.entries(NODES).map(([n, [x, y]]) => `<circle class="gb-hit" data-n="${n}" cx="${x}" cy="${y}" r="55" role="button" tabindex="-1" aria-label="${NAMES[n]}"/>`).join('');
  return `
  <g class="gb-arch">
    <polygon class="gb-mass" points="160,225 620,225 820,290 620,355 160,355"/>
    <rect class="gb-wall" x="66" y="456" width="132" height="98"/>
    <path d="M68 458H118L68 498Z" fill="url(#${P}hatch)"/>
    <path class="gb-corr-o" d="${CORR}"/>
    <path class="gb-corr-i" d="${CORR}"/>
    <path class="gb-ln" d="M690 77V143"/>
    <path class="gb-mass" d="M668 141V102Q668 90 678 90Q688 90 688 102V141Z"/>
    <path class="gb-mass" d="M266 78V96Q275 86 284 96V78ZM496 78V96Q505 86 514 96V78Z"/>
    ${portraits}
    <path class="gb-ln gb-fine" d="${steps}"/>
    <path class="gb-copper" d="${copper}"/>
    <path class="gb-copper gb-seam" d="${seams}"/>
    <rect class="gb-gap" x="192" y="474.5" width="12" height="61"/>
    <rect class="gb-mass" x="206" y="479" width="30" height="54"/>${rivets}
    <path class="gb-ln gb-fine" d="M92 553L100 536L108 553M95 546H105M152 553L160 536L168 553M155 546H165"/>
  </g>
  <g class="gb-rings">${rings}</g>
  <g class="gb-beams"></g>
  <g class="gb-trail"></g>
  <g class="gb-pos gb-ghost" style="opacity:0"><g transform="translate(-6 2) scale(.9)">${FOOT}</g><g transform="translate(6 -3) scale(-.9 .9)">${FOOT}</g></g>
  <g class="gb-pos gb-docpos"><g class="gb-dir"><g filter="url(#${P}cut)">${DOC}</g></g></g>
  <g class="gb-pos gb-coffpos"><g class="gb-bob"><g class="gb-lift"><g filter="url(#${P}cut)">${BEARERS}</g></g>${THIRD}</g></g>
  <g class="gb-smudge"></g>
  <g class="gb-hits">${hits}</g>`;
}

const COFFIN = '100,315 200,262 660,290 660,430 200,458 100,405';
const SATIN = '114,321 203,275 647,300 647,420 203,445 114,399';
const SLIVER = '100,315 200,262 660,290 660,306 200,278 100,331';
const SCREWS = [[218, 290], [218, 430], [600, 306], [600, 414]];
const LID0 = { x: 100, y: -120, r: -8 };

function lidMarkup(P) {
  let floor = '';
  for (let y = 96; y <= 544; y += 64) floor += `M40 ${y}H920`;
  for (let row = 0, y = 96; y < 544; y += 64, row++) for (let x = 40 + (row % 2) * 90; x < 920; x += 180) floor += `M${x} ${y}V${y + 64}`;
  let doorLines = '';
  for (let x = 810; x <= 896; x += 9) doorLines += `M${x} 118V478`;
  const rivets = [[776, 214], [792, 208], [776, 300], [792, 296], [776, 390], [792, 388], [776, 470], [792, 466]]
    .map(([x, y]) => `<circle class="gb-dot" cx="${x}" cy="${y}" r="1.8"/>`).join('');
  const screws = SCREWS.map(([x, y], i) => `
      <g class="gb-screw" data-i="${i}" transform="translate(${x} ${y})">
        <circle class="gb-prog" r="22" transform="rotate(-90)"/>
        <g class="gb-headg" filter="url(#${P}cut)"><circle class="gb-head" r="13"/></g>
        <line class="gb-slot" x1="-8" y1="0" x2="8" y2="0" style="transform:rotate(${i * 37 + 20}deg)"/>
        <circle class="gb-hit" r="62" role="button" tabindex="-1" aria-label="A screw. Turn it clockwise, or tap it."/>
      </g>`).join('');
  return `
  <g class="gb-lidscene">
    <defs><clipPath id="${P}door"><path d="M800 478V182Q800 120 852 120Q904 120 904 182V478Z"/></clipPath></defs>
    <path class="gb-copper" d="${floor}"/>
    <rect class="gb-mass" x="172" y="236" width="16" height="250"/>
    <rect class="gb-mass" x="566" y="258" width="16" height="206"/>
    <polygon class="gb-wall" points="${COFFIN}"/>
    <polygon class="gb-satin" points="${SATIN}"/>
    <polygon class="gb-satinh" points="${SATIN}" fill="url(#${P}hatch)"/>
    <g class="gb-mad">
      <path class="gb-face" d="M188 352C200 344 214 318 238 306C320 294 520 304 612 320C632 334 632 386 612 400C520 416 320 426 238 414C214 402 200 376 188 368Z"/>
      <path class="gb-ln gb-hair" d="M250 330C350 333 480 338 604 342M250 392C350 389 480 384 604 378M262 360C380 361 500 361 616 360M560 318C590 330 600 348 604 360M560 402C590 390 600 372 604 360"/>
      <ellipse class="gb-face" cx="318" cy="351" rx="13" ry="7"/><ellipse class="gb-face" cx="327" cy="368" rx="13" ry="7"/>
      <path class="gb-mass" d="M124 360C124 328 146 314 172 320C160 328 152 344 152 360C152 376 160 392 172 400C146 406 124 392 124 360Z"/>
      <path class="gb-ln gb-hair" d="M172 320C190 314 206 306 220 296M172 400C190 406 206 414 220 424M168 322C186 322 200 318 212 310"/>
      <ellipse class="gb-face" cx="170" cy="360" rx="23" ry="18"/>
      <path class="gb-ln gb-hair" d="M161 349q4 3 0 7M161 364q4 3 0 7M171 358l4 2"/>
      <path class="gb-ln gb-fine" d="M182 353q6 7 0 14"/>
      <ellipse class="gb-blush" cx="175" cy="346" rx="5.5" ry="3.6"/><ellipse class="gb-blush" cx="175" cy="374" rx="5.5" ry="3.6"/>
    </g>
    <polygon class="gb-sliver" points="${SLIVER}"/>
    <g class="gb-doorway">
      <path class="gb-wall" d="M800 478V182Q800 120 852 120Q904 120 904 182V478Z"/>
      <path class="gb-copper" clip-path="url(#${P}door)" d="${doorLines}"/>
      <path class="gb-mass" d="M800 186L768 200V490L800 478Z"/>${rivets}
      <g class="gb-rodd" transform="translate(852 474) scale(2.3)"><g filter="url(#${P}cut)">${ROD}
        <path class="gb-ln gb-fine" d="M4-24L9-20L15-31"/><path class="gb-ln gb-hair" d="M15-32c-3-3-2-7 0-10c2 3 3 7 0 10z"/></g></g>
      <rect class="gb-doorhit" x="760" y="112" width="156" height="384" role="button" tabindex="-1" aria-label="Leave with Roderick"/>
    </g>
    <g class="gb-lid">
      <polygon class="gb-lidbody" points="${COFFIN}" role="button" tabindex="0" aria-label="The lid. Drag it home."/>
      <path class="gb-grain" d="M150 330C280 296 470 300 640 312M135 360C300 350 500 352 648 362M150 390C280 420 480 418 640 408M230 300C330 290 420 292 500 298"/>
      ${screws}
    </g>
  </g>`;
}

function endMarkup() {
  let straps = '';
  for (const y of [236, 330, 424]) straps += `M404 ${y}H556`;
  const rivets = [];
  for (const y of [236, 330, 424]) for (let x = 414; x <= 546; x += 22) rivets.push(`<circle class="gb-dot" cx="${x}" cy="${y}" r="2"/>`);
  return `
  <rect class="gb-band" x="0" y="0" width="960" height="640"/>
  <g class="gb-inv">
    <path class="gb-ln" d="M380 486V210Q380 126 480 126Q580 126 580 210V486M360 486H600"/>
    <path class="gb-ln gb-fine" d="M404 480V218Q404 150 480 150Q556 150 556 218V480Z"/>
    <path class="gb-ln gb-fine" d="${straps}"/>${rivets.join('')}
    <path class="gb-ln gb-fine" d="M542 300v40"/>
  </g>`;
}

const CSS = `
.g-burial{
  --g-burial-ground:var(--paper);--g-burial-line:var(--ink);--g-burial-mass:var(--ink);
  --g-burial-muted:var(--muted);--g-burial-rule:var(--rule);--g-burial-shadow:var(--rule);
  --g-burial-hatch:var(--ink);--g-burial-band:var(--ink);--g-burial-on-ink:var(--paper);
  --g-burial-copper:var(--muted);--g-burial-lamp:var(--ink);
  --g-burial-truth:var(--red);--g-burial-truth-ink:var(--red);--g-burial-blush:var(--red);
  --g-burial-w:2px;--g-burial-fine:1.1px;--g-burial-hair:.8px;
  --u:calc(100cqw / 960);
  position:relative;width:100%;height:100%;overflow:hidden;container-type:inline-size;
  background:var(--g-burial-ground);color:var(--g-burial-line);font-family:var(--serif);
  -webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent;
}
@supports (color:color-mix(in srgb,red,blue)){.g-burial{--g-burial-truth-ink:color-mix(in srgb,var(--red),var(--paper) 35%)}}
.g-burial.gb-dark{background:var(--g-burial-band)}
.g-burial .gb-svg{display:block;width:100%;height:100%;touch-action:manipulation}
.g-burial.gb-lidmode .gb-svg{touch-action:none}
.g-burial.gb-busy .gb-svg{pointer-events:none}
.g-burial .gb-irisvg{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
.g-burial .gb-iris{fill:none;stroke:var(--g-burial-band);stroke-width:2000px}
.g-burial .gb-veil{fill:var(--g-burial-band);opacity:0;transition:opacity .125s linear}
.g-burial .gb-ln{fill:none;stroke:var(--g-burial-line);stroke-width:var(--g-burial-w);stroke-linecap:round;stroke-linejoin:round}
.g-burial .gb-fine{stroke-width:var(--g-burial-fine)}
.g-burial .gb-hair{stroke-width:var(--g-burial-hair)}
.g-burial .gb-mass{fill:var(--g-burial-mass)}
.g-burial .gb-wall{fill:var(--g-burial-ground);stroke:var(--g-burial-line);stroke-width:var(--g-burial-w);stroke-linejoin:round}
.g-burial .gb-face{fill:var(--g-burial-ground);stroke:var(--g-burial-line);stroke-width:var(--g-burial-fine)}
.g-burial .gb-dot,.g-burial .gb-gap{fill:var(--g-burial-ground)}
.g-burial .gb-hl{fill:none;stroke:var(--g-burial-hatch);stroke-width:var(--g-burial-hair)}
.g-burial .gb-flood{flood-color:var(--g-burial-shadow)}
.g-burial .gb-corr-o{fill:none;stroke:var(--g-burial-line);stroke-width:66px;stroke-linejoin:round}
.g-burial .gb-corr-i{fill:none;stroke:var(--g-burial-ground);stroke-width:62px;stroke-linejoin:round}
.g-burial .gb-copper{fill:none;stroke:var(--g-burial-copper);stroke-width:var(--g-burial-hair);opacity:.55}
.g-burial .gb-seam{stroke-width:var(--g-burial-fine);opacity:.8}
.g-burial .gb-band{fill:var(--g-burial-band)}
.g-burial .gb-neg{--g-burial-mass:var(--g-burial-on-ink);--g-burial-line:var(--g-burial-on-ink);--g-burial-ground:var(--g-burial-band);opacity:.42}
.g-burial .gb-inv{--g-burial-mass:var(--g-burial-on-ink);--g-burial-line:var(--g-burial-on-ink);--g-burial-ground:var(--g-burial-band)}
.g-burial .gb-print{fill:var(--g-burial-truth-ink)}
.g-burial .gb-ghost{fill:var(--g-burial-muted)}
.g-burial .gb-truthfill{fill:var(--g-burial-truth)}
.g-burial .gb-truthln{fill:none;stroke:var(--g-burial-truth);stroke-width:var(--g-burial-fine);stroke-linecap:round}
.g-burial .gb-ring{fill:none;stroke:var(--g-burial-muted);stroke-width:var(--g-burial-fine);stroke-dasharray:2 5;opacity:.55}
.g-burial .gb-ring.gb-near{stroke:var(--g-burial-line);stroke-width:var(--g-burial-w);stroke-dasharray:none;opacity:1;animation:gb-pulse 1.3s ease-in-out infinite}
.g-burial .gb-hit{fill:none;pointer-events:all;outline:none}
.g-burial .gb-hit.gb-can{cursor:pointer}
.g-burial .gb-hit:focus-visible{stroke:var(--g-burial-muted);stroke-width:1.5px;stroke-dasharray:4 4}
.g-burial .gb-pos{transition:transform .34s ease,opacity .25s linear}
.g-burial .gb-pos.gb-snap{transition:opacity .25s linear}
.g-burial .gb-gone{opacity:0!important}
.g-burial .gb-lift{transition:transform .6s ease}
.g-burial .gb-lifted .gb-lift{transform:translateY(-6px)}
.g-burial .gb-third{opacity:0;transition:opacity .6s linear}
.g-burial .gb-lifted .gb-third{opacity:1}
.g-burial .gb-left{opacity:.3}
.g-burial .gb-bobbing{animation:gb-bob .34s ease}
.g-burial .gb-cone{opacity:.3}
.g-burial .gb-pool{opacity:.7}
.g-burial .gb-rim{fill:none;stroke:var(--g-burial-lamp);stroke-width:var(--g-burial-fine);stroke-dasharray:3 4}
.g-burial .gb-ray{stroke:var(--g-burial-lamp);stroke-width:var(--g-burial-hair);opacity:.7}
.g-burial .gb-trailp{fill:none;stroke:var(--g-burial-line);stroke-width:3.2px;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:.1 9}
.g-burial .gb-trailt{fill:none;stroke:var(--g-burial-line);stroke-width:2.6px;stroke-linecap:round;stroke-dasharray:.1 6.5}
.g-burial .gb-sw{font-family:var(--serif);font-style:italic;font-size:28px;text-anchor:middle;fill:var(--g-burial-line);paint-order:stroke;stroke:var(--g-burial-ground);stroke-width:6px;stroke-linejoin:round;pointer-events:none}
.g-burial .gb-sw.gb-loud{font-style:normal;font-size:40px;letter-spacing:.04em}
.g-burial .gb-sw.gb-xl{font-style:normal;font-size:64px;letter-spacing:.04em}
.g-burial .gb-sw.gb-onink{fill:var(--g-burial-truth-ink);stroke:none;font-size:40px}
.g-burial .gb-sw.gb-oninkp{fill:var(--g-burial-on-ink);stroke:none}
.g-burial .gb-fade{animation:gb-sw 1.5s linear forwards}
.g-burial .gb-smudge-b{fill:var(--g-burial-mass);opacity:0;animation:gb-smudge .3s ease-out forwards}
@keyframes gb-pulse{0%,100%{opacity:1}50%{opacity:.25}}
@keyframes gb-bob{50%{transform:translateY(-1.5px)}}
@keyframes gb-sw{0%,60%{opacity:1}100%{opacity:0}}
@keyframes gb-smudge{0%{opacity:0}35%{opacity:.85}100%{opacity:0}}
.g-burial .gb-cap{position:absolute;left:calc(var(--u)*40);top:calc(var(--u)*30);width:calc(var(--u)*620);pointer-events:none}
.g-burial .gb-teach{font-style:italic;font-size:max(13px,calc(var(--u)*24));line-height:1.2}
.g-burial .gb-two{position:relative;display:inline-block}
.g-burial .gb-two::after{content:"";position:absolute;left:-.08em;right:-.08em;top:54%;height:max(1.5px,calc(var(--u)*2.4));background:var(--g-burial-truth);transform:scaleX(0);transform-origin:0 50%;transition:transform .7s ease}
.g-burial .gb-two.gb-struck::after{transform:scaleX(1)}
.g-burial .gb-say{display:inline-block;margin-top:calc(var(--u)*6);padding:.05em .45em .12em 0;font-size:max(12px,calc(var(--u)*20));line-height:1.25;background:var(--g-burial-ground);opacity:0;transition:opacity .2s linear}
.g-burial .gb-say.gb-on{opacity:1}
.g-burial .gb-say b{font-weight:normal;font-size:.62em;letter-spacing:.14em;text-transform:uppercase;color:var(--g-burial-muted);margin-right:.7em;vertical-align:.12em}
.g-burial .gb-say em{font-style:italic;color:var(--g-burial-muted)}
.g-burial .gb-score{position:absolute;right:calc(var(--u)*40);bottom:calc(var(--u)*90);font-size:max(10px,calc(var(--u)*13));letter-spacing:.14em;text-transform:uppercase;color:var(--g-burial-muted);pointer-events:none}
.g-burial .gb-leave{position:absolute;left:calc(var(--u)*852);top:calc(var(--u)*498);transform:translateX(-50%);font-size:max(11px,calc(var(--u)*15));letter-spacing:.14em;text-transform:uppercase;color:var(--g-burial-muted);opacity:0;transition:opacity .6s linear;pointer-events:none}
.g-burial .gb-leave.gb-on{opacity:1}
.g-burial .gb-note{position:absolute;left:0;right:0;top:calc(var(--u)*516);text-align:center;font-style:italic;font-size:max(14px,calc(var(--u)*26));color:var(--g-burial-on-ink);opacity:0;transition:opacity .8s linear;pointer-events:none}
.g-burial .gb-note.gb-on{opacity:1}
.g-burial.gb-dark .gb-cap,.g-burial.gb-dark .gb-score{opacity:0}
.g-burial .gb-lidbody{fill:var(--g-burial-mass);stroke:var(--g-burial-mass);stroke-width:3px;stroke-linejoin:round;cursor:grab;outline:none}
.g-burial .gb-dragging .gb-lidbody{cursor:grabbing}
.g-burial .gb-lid.gb-home .gb-lidbody{cursor:default}
.g-burial .gb-lidbody:focus-visible{stroke:var(--g-burial-muted)}
.g-burial .gb-grain{fill:none;stroke:var(--g-burial-on-ink);stroke-width:var(--g-burial-hair);opacity:.28;pointer-events:none}
.g-burial .gb-satin{fill:var(--g-burial-ground);stroke:var(--g-burial-line);stroke-width:var(--g-burial-fine)}
.g-burial .gb-satinh{opacity:.22}
.g-burial .gb-sliver{fill:var(--g-burial-truth);opacity:0}
.g-burial .gb-home-on .gb-sliver{opacity:1}
.g-burial .gb-blush{fill:var(--g-burial-blush);opacity:.45}
.g-burial .gb-head{fill:var(--g-burial-ground);stroke:var(--g-burial-line);stroke-width:var(--g-burial-fine)}
.g-burial .gb-slot{stroke:var(--g-burial-line);stroke-width:2.4px;stroke-linecap:round}
.g-burial .gb-prog{fill:none;stroke:var(--g-burial-on-ink);stroke-width:2px;stroke-linecap:round;stroke-dasharray:0 200;opacity:.85}
.g-burial .gb-screw .gb-hit{pointer-events:none}
.g-burial .gb-home-on .gb-screw:not(.gb-seated) .gb-hit{pointer-events:all;cursor:pointer}
.g-burial .gb-home-on .gb-screw:not(.gb-seated) .gb-headg{animation:gb-pulse 1.6s ease-in-out infinite}
.g-burial .gb-seated .gb-head{stroke:var(--g-burial-muted)}
.g-burial .gb-seated .gb-prog{opacity:0}
.g-burial .gb-rodd{opacity:0;transition:opacity .9s linear}
.g-burial .gb-rodd .gb-ln,.g-burial .gb-rodd .gb-face{vector-effect:non-scaling-stroke}
.g-burial .gb-waiting .gb-rodd{opacity:1}
.g-burial .gb-doorhit{fill:none;pointer-events:none;outline:none}
.g-burial .gb-waiting .gb-doorhit{pointer-events:all;cursor:pointer}
.g-burial .gb-doorhit:focus-visible{stroke:var(--g-burial-muted);stroke-dasharray:4 4}
.g-burial.gb-rm .gb-pos,.g-burial.gb-rm .gb-lift{transition:opacity .25s linear}
.g-burial.gb-rm .gb-lifted .gb-lift{transform:none}
.g-burial.gb-rm .gb-near,.g-burial.gb-rm .gb-bobbing,.g-burial.gb-rm .gb-headg{animation:none!important}
.g-burial.gb-rm .gb-two::after{transition:none}
`;

let mounts = 0;
const SVGNS = 'http://www.w3.org/2000/svg';
const ease = (k) => (k < 0.5 ? 2 * k * k : 1 - (2 - 2 * k) ** 2 / 2);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export default {
  id: 'burial',
  title: 'A Harmless Precaution',
  mount(stage, api = {}) {
    const rm = !!api.reducedMotion;
    const P = `gb${++mounts}-`;
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
    root.className = 'g-burial' + (rm ? ' gb-rm' : '');
    root.innerHTML = `<style>${CSS}</style>
<svg class="gb-svg" viewBox="0 0 960 640" preserveAspectRatio="xMidYMid meet" role="img" aria-label="A cutaway of the house of Usher, down to the vault">
  <defs>
    <pattern id="${P}hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line class="gb-hl" x1="0" y1="0" x2="0" y2="5"/></pattern>
    <filter id="${P}cut" x="-10%" y="-10%" width="125%" height="125%"><feOffset in="SourceAlpha" dx="2" dy="3" result="o"/><feFlood class="gb-flood"/><feComposite in2="o" operator="in" result="s"/><feMerge><feMergeNode in="s"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="${P}ripple" x="-5%" y="-30%" width="110%" height="160%"><feTurbulence type="turbulence" baseFrequency="0.006 0.09" numOctaves="2" seed="7" result="n">${rm ? '' : '<animate attributeName="baseFrequency" dur="14s" repeatCount="indefinite" values="0.006 0.09;0.006 0.115;0.006 0.09"/>'}</feTurbulence><feDisplacementMap in="SourceGraphic" in2="n" scale="7" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="${P}blur" x="-50%" y="-80%" width="200%" height="260%"><feGaussianBlur stdDeviation="7"/></filter>
    <clipPath id="${P}band"><rect x="32" y="560" width="896" height="48"/></clipPath>
  </defs>
  <g class="gb-scene"></g>
  <g class="gb-bandg">
    <rect class="gb-band" x="32" y="560" width="896" height="48"/>
    <g clip-path="url(#${P}band)">
      <g class="gb-refl" filter="url(#${P}ripple)"></g>
      <g class="gb-prints"></g>
    </g>
  </g>
  <g class="gb-sounds"></g>
</svg>
<div class="gb-cap"><div class="gb-teach"></div><div class="gb-say" aria-live="polite"></div></div>
<div class="gb-score"></div>
<div class="gb-leave">leave</div>
<div class="gb-note"></div>
<svg class="gb-irisvg" viewBox="0 0 960 640" aria-hidden="true">
  <defs><filter id="${P}bleed" filterUnits="userSpaceOnUse" x="-200" y="-200" width="1360" height="1040"><feTurbulence type="fractalNoise" baseFrequency=".04" numOctaves="3" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="26" xChannelSelector="R" yChannelSelector="G"/></filter></defs>
  <circle class="gb-iris" cx="480" cy="320" r="2100" filter="url(#${P}bleed)" style="display:none"/>
  <rect class="gb-veil" width="960" height="640"/>
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
      sayEl.classList.add('gb-on');
      sayTimer = later(nextSay, l.ms || 2400);
    }
    function say(lines, clear = false) {
      if (clear) { sayQ.length = 0; if (sayTimer) cancel(sayTimer); sayTimer = null; }
      sayQ.push(...lines);
      if (!sayTimer) nextSay();
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
    let face = -1, saidDoctors = false, printN = 0, finished = false, ending = false;

    function score() {
      scoreEl.textContent = phase === 'lid' ? `screws ${seatedN} of 4` : `glimpses ${model.glimpses}`;
    }

    // ── The stair ──
    scene.innerHTML = stairMarkup(P);
    teach.innerHTML = LINES.teach;
    reflG.innerHTML = `<g class="gb-neg"><g class="gb-pos gb-rc">${BEARERS}</g><g class="gb-pos gb-rd"><g class="gb-rdir">${DOC}</g></g></g>`;
    const coffPos = $('.gb-coffpos'), bobG = $('.gb-bob'), docPos = $('.gb-docpos'), docDir = $('.gb-dir');
    const ghost = $('.gb-ghost'), beamsG = $('.gb-beams'), trailG = $('.gb-trail'), smudgeG = $('.gb-smudge');
    const reflC = $('.gb-rc'), reflD = $('.gb-rd'), reflDir = $('.gb-rdir');
    const rings = [...root.querySelectorAll('.gb-ring')], hits = [...root.querySelectorAll('.gb-hit[data-n]')];

    const at = (n) => NODES[n];
    function placeCoffin(n) {
      const [x, y] = at(n);
      coffPos.style.transform = `translate(${x}px,${y + FLOOR}px)`;
      reflC.style.transform = `translate(${x}px,563px) scale(.62,-.5)`;
    }
    function facingFor(ph) {
      if (ph.mode === 'guard') return -1;
      const nx = ph.path[1];
      if (nx) { const dx = at(nx)[0] - at(ph.at)[0]; if (dx) return Math.sign(dx); }
      if (ph.mode === 'look') return face;
      return face;
    }
    function placeDoc(ph) {
      face = facingFor(ph);
      const [x, y] = at(ph.at);
      docPos.style.transform = `translate(${x}px,${y + FLOOR}px)`;
      docDir.style.transform = `scaleX(${face})`;
      reflD.style.transform = `translate(${x}px,563px) scale(.62,-.5)`;
      reflDir.style.transform = `scaleX(${face})`;
    }
    function drawBeams(ph) {
      const [px, py] = at(ph.at);
      const ox = px + 19 * face, oy = py + FLOOR - 14;
      let s = '';
      for (const n of ph.lit) {
        const [lx, ly0] = at(n), ly = ly0 + 8;
        const vx = lx - ox, vy = ly - oy, len = Math.hypot(vx, vy) || 1;
        const nx = (-vy / len) * 30, ny = (vx / len) * 30;
        s += `<path class="gb-cone" fill="url(#${P}hatch)" d="M${f1(ox)} ${f1(oy)}L${f1(lx + nx)} ${f1(ly + ny)}L${f1(lx - nx)} ${f1(ly - ny)}Z"/>`;
        s += `<circle class="gb-pool" fill="url(#${P}hatch)" cx="${lx}" cy="${ly}" r="34"/><circle class="gb-rim" cx="${lx}" cy="${ly}" r="34"/>`;
        for (let k = -2; k <= 2; k++) s += `<path class="gb-ray" d="M${f1(ox)} ${f1(oy)}L${f1(lx + (nx * k) / 2)} ${f1(ly + (ny * k) / 2)}"/>`;
      }
      beamsG.innerHTML = s;
    }
    function drawTrail(ph) {
      if (ph.path.length < 2) { trailG.replaceChildren(); return; }
      const pts = ph.path.map((n) => `${at(n)[0]},${at(n)[1] + 10}`).join(' ');
      const [tx, ty] = at(ph.path[ph.path.length - 1]);
      trailG.innerHTML = `<polyline class="gb-trailp" points="${pts}"/><circle class="gb-trailt" cx="${tx}" cy="${ty + 10}" r="13"/>`;
    }
    function renderDoc(ph, delay = 0) {
      placeDoc(ph);
      const draw = () => { drawBeams(ph); drawTrail(ph); };
      if (delay && !rm) later(draw, delay); else draw();
    }
    function ghostAt(n) {
      if (!n) { ghost.style.opacity = '0'; return; }
      const [x, y] = at(n);
      ghost.style.transform = `translate(${x}px,${y + FLOOR - 4}px)`;
      ghost.style.opacity = '.6';
    }
    let hush = false; // true while a caught beat plays out
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
      g.setAttribute('transform', `translate(${x + jit} ${594 + side * 5}) rotate(${f1(ang)}) scale(${side * 1.25} 1.25)`);
      g.innerHTML = FOOT;
      printsG.appendChild(g);
      const all = printsG.children;
      while (all.length > 40) all[0].remove();
      for (let i = 0; i < all.length; i++) all[i].style.opacity = String(Math.max(0.25, 1 - (all.length - 1 - i) * 0.07));
    }
    function patAt({ at: n, from }) {
      const [x, y] = at(n);
      const loud = model.copper;
      sound(loud ? 'PAT.' : 'pat.', x + (printN % 2 ? 10 : -10), y - 20, loud ? 'gb-loud' : '');
      printFoot(n, from);
    }
    function bob() {
      if (rm) return;
      bobG.classList.remove('gb-bobbing');
      void bobG.getBoundingClientRect();
      bobG.classList.add('gb-bobbing');
    }
    function smudge(n) {
      const [x, y] = at(n);
      smudgeG.innerHTML = `<ellipse class="gb-smudge-b" cx="${x}" cy="${y + 8}" rx="62" ry="28" filter="url(#${P}blur)"/>`;
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
        later(() => sound('GRATE.', 150, 462, 'gb-xl'), 380);
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

    placeCoffin(model.p);
    renderDoc(model.ph);
    markNear();
    score();

    // ── The iris ──
    function irisTo(cx, cy, from, to, ms) {
      if (rm) {
        veil.style.opacity = to < from ? '1' : '0';
        return new Promise((res) => later(res, 140));
      }
      irisC.style.display = '';
      irisC.setAttribute('cx', cx); irisC.setAttribute('cy', cy);
      return tween(ms, (k) => irisC.setAttribute('r', f1(1000 + from + (to - from) * ease(k)))).then(() => {
        if (to >= 1100) irisC.style.display = 'none';
      });
    }

    // ── The lid ──
    let lidScene, lidG, lidBody, screwEls = [], turn = null;
    const lid = { ...LID0, home: false, drag: null };
    const D0 = Math.hypot(LID0.x, LID0.y - 12);
    const screws = SCREWS.map(() => ({ deg: 0, seated: false }));
    let seatedN = 0;
    const sliver = () => (4 - seatedN) * 3;
    const setLid = () => lidG.setAttribute('transform', `translate(${f1(lid.x)} ${f1(lid.y)}) rotate(${f1(lid.r)} 380 360)`);
    const screwCenter = (i) => ({ x: SCREWS[i][0] + lid.x, y: SCREWS[i][1] + lid.y });

    async function toLid() {
      root.classList.add('gb-busy');
      await irisTo(130, 505, 1100, 0, 700);
      if (dead) return;
      buildLid();
      await irisTo(380, 360, 0, 1100, 900);
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
      score();
      lidScene = $('.gb-lidscene'); lidG = $('.gb-lid'); lidBody = $('.gb-lidbody');
      screwEls = [...root.querySelectorAll('.gb-screw')];
      setLid();

      on(lidBody, 'pointerdown', (e) => {
        if (lid.home || phase !== 'lid') return;
        e.preventDefault();
        capture(lidBody, e.pointerId);
        const p = svgPt(e);
        lid.drag = { id: e.pointerId, sx: p.x, sy: p.y, bx: lid.x, by: lid.y };
        lidG.classList.add('gb-dragging');
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
          if (t.moved < 10 && t.rot < 20) addTurn(i, 90, true);
        };
        on(hit, 'pointerup', up);
        on(hit, 'pointercancel', (e) => { if (turn && turn.id === e.pointerId) turn = null; });
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
    }

    function placeLid() {
      if (lid.home) return;
      lid.home = true;
      if (lid.drag) { release(lidBody, lid.drag.id); lid.drag = null; }
      lidG.classList.remove('gb-dragging');
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
        sound('thud.', 400, 250);
        screwEls.forEach((el) => $('.gb-hit', el).setAttribute('tabindex', '0'));
      });
    }

    function drawScrew(i) {
      const el = screwEls[i], s = screws[i];
      const need = s.seated ? s.deg : seatedN === 3 ? 720 : 360;
      $('.gb-slot', el).style.transform = `rotate(${f1(i * 37 + 20 + s.deg)}deg)`;
      const len = 2 * Math.PI * 22;
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
        sound('creak.', c.x, c.y - 30);
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
      const c = screwCenter(i);
      sound('tk.', c.x, c.y - 28);
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
      await irisTo(cx, cy, 1100, 0, 700);
      if (dead) return;
      root.classList.add('gb-dark');
      root.classList.remove('gb-lidmode');
      say([], true);
      soundsG.replaceChildren();
      scene.innerHTML = endMarkup();
      irisC.style.display = 'none';
      veil.style.opacity = '0';
      later(() => sound('pat.', 480, 318, 'gb-onink'), 800);
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
