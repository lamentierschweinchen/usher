// VII. A Thousand Waters: the flight.
// Grandmother's Footsteps on a sinking causeway. Hold to look back: whatever
// follows you freezes, and the house falls faster while you watch.
//
// Look: Shadow Theatre (work/design/LOOK.md). Every cut comes from the shared
// library (../../shared/cuts.js); the causeway's stones and the dark's lace edge
// are cut here in the same manner. The light is the blood moon [u50]: it is the
// only red behind the paper, and it is what shows through the fissure. In the
// tarn the house comes back as light, the fissure whole and red, and Madeline
// bright. Mechanics, timings, flags and scores are unchanged from the ink cut.

import * as C from '../../shared/cuts.js';

const NS = 'http://www.w3.org/2000/svg';

// World, in viewBox units (960 x 640) and seconds.
const WATER = 440, PATH_Y = 428;
const X0 = 150, X1 = 880, NST = 24, SW = (X1 - X0) / NST;
const GUEST0 = 220, GUEST_END = 888;
const RUN = 24, SLOW = 3, FLOOR = 12;
const FOLLOW = 34, CLING = 12;
const COL_RUN = 10, COL_LOOK = 60, COL_BRINK = 24, COL_FINALE = 260;   // spec 14 while running; 10 keeps it below the 12 floor, so only a look can drop you
const HER = 26, HER_LEAD = 60;    // spec 120; shortened because the slower running collapse gives her more room
const HER_LATEST = 760;           // if there's never room for her in the dark, she comes anyway
const BEAT1 = 330, BEAT2 = 600;
const MIN_LOOK = 0.4, BANK_WAIT = 12, STALL = 5;
const VEIL_GAP = 40, VEIL_FADE = 0.15, NEARLY = 22, BRINK = 60;
const HORSE_REACH = 900;
const SCREW_STONE = 12;
const THRONG = ['crack.', 'rip.', 'shriek.', 'clang.'];
const LOUD = { 'crack.': ['CRACK.', 44], 'rip.': ['RIP.', 40], 'shriek.': ['SHRIEK.', 52], 'clang.': ['CLANG.', 62], 'tap.': ['tap.', 24] };

// Staging (look only). Mini-game figures stand 96 units tall (LOOK §2.7).
const GUEST_S = 2.25, HER_S = 2.2, HORSE_S = 2.2;
const HORSE_X = 968;              // the horse waits in the right wing, facing the stage: head, neck and forelegs show.
                                  // The servant holds it from the wing (at this scale he and the horse cut as one blob).
const HER_LIFT = 40;              // up onto its back
const HOUSE_S = 0.6, HOUSE_X = 64;              // the shared house: map (482, 368) lands on (HOUSE_X, WATER)
const MOON_X = 66, MOON_Y = 276, MOON_R = 44;  // setting behind the gable, showing through the fissure
const FLIP = `matrix(1 0 0 -.85 0 ${+(WATER * 1.85).toFixed(1)})`;   // y' = WATER − .85(y − WATER)
const LIT = '--lit:#b9492f;--lit-door:#c85a38;--lit-vault:#4a1a16';  // the moon through the house's holes
const BACKLIT = '#cf8752';        // ember: the moonlight getting round cut type

const r1 = n => Math.round(n * 10) / 10;
const hx = x => r1(HOUSE_X + (x - 482) * HOUSE_S), hy = y => r1(WATER + (y - 368) * HOUSE_S);
// The library's fissure (C.FISSURE), in stage units.
const FIS = [[486, 130], [476, 164], [490, 194], [478, 234], [490, 280], [480, 330], [488, 368]].map(([x, y]) => [hx(x), hy(y)]);
const fisPath = 'M' + FIS.map(p => p.join(' ')).join('L');
const top = FIS[0], foot = FIS[FIS.length - 1];
const clipL = `-80,-400 ${top[0]},-400 ${FIS.map(p => p.join(',')).join(' ')} ${foot[0]},800 -80,800`;
const clipR = `${top[0]},-400 420,-400 420,800 ${foot[0]},800 ${FIS.slice().reverse().map(p => p.join(',')).join(' ')}`;
const FIS_STYLE = 'fill:none;stroke-linecap:round;stroke-linejoin:round;stroke-width:var(--fl-fis-w,2.4)';

const CSS = `
.g-flight{
  --g-flight-veil-alpha:.9; --g-flight-fs:1;
  position:relative;width:100%;height:100%;overflow:hidden;
  background:var(--sh-cut,#0b0809);color:var(--sh-cut,#0b0809);
  font-family:var(--sh-serif,'IM Fell English',Georgia,serif);
  user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;touch-action:none;-webkit-tap-highlight-color:transparent}
.g-flight svg{display:block;width:100%;height:100%;cursor:pointer;outline:none}
.g-flight text{font-family:var(--sh-serif,'IM Fell English',Georgia,serif)}
.g-flight .ring{fill:none;stroke:var(--sh-return,#f3dba2);stroke-width:1.4}
.g-flight .gleam{fill:url(#fl-gleam)}
.g-flight .gleam-flat{fill:var(--sh-return,#f3dba2)}
.g-flight .word{font-style:italic;fill:var(--sh-cut,#0b0809);font-size:calc(24px * var(--g-flight-fs))}
.g-flight .word.clung{font-size:calc(21px * var(--g-flight-fs))}
.g-flight .word.truth{fill:var(--sh-red,#e0392b);font-size:calc(22px * var(--g-flight-fs))}
.g-flight .sound{font-style:italic;fill:var(--sh-cut,#0b0809);transition:opacity .6s}
.g-flight .teach{font-style:italic;fill:var(--sh-paper,#ede2cb);transition:opacity .5s}
.g-flight .score{fill:var(--sh-lamp,#f7d894);letter-spacing:.16em;font-size:calc(17px * var(--g-flight-fs))}
.g-flight .fl-live{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
`;

// One causeway stone, cut like the map's causeway: a slab with an arch of light
// under it, a railing post with its knob, and its length of rail thread.
function stoneCut(x, screw) {
  const a = r1(x + 0.7), b = r1(x + SW - 0.7), m = r1(x + SW / 2), p = r1(x + 2.4);
  let s = `<path d="M${a} ${PATH_Y}H${b}V${WATER}H${r1(b - 3.4)}Q${m} ${PATH_Y + 4.6} ${r1(a + 3.4)} ${WATER}H${a}Z"/>` +
    `<path d="M${p} ${PATH_Y}v-12.6M${r1(x)} ${PATH_Y - 11}H${r1(x + SW)}" style="fill:none;stroke:currentColor;stroke-width:1.2"/><circle cx="${p}" cy="${PATH_Y - 13.6}" r="1.6"/>`;
  if (screw) s += `<circle cx="${m}" cy="${PATH_Y + 4}" r="3" style="fill:${BACKLIT}"/><path d="M${r1(m - 2.2)} ${PATH_Y + 5.6}l4.4-3.2" style="fill:none;stroke:currentColor;stroke-width:1.2"/>`;
  return s;
}

// The dark behind you is black paper too: its leading edge is lace.
function veilEdge() {
  const R = C.rng(17);
  let s = C.scallopsV(0, 4, 636, 3.4, 11);
  for (let y = 16; y < 630; y += 30 / Math.max(C.lace(), 0.55)) {
    s += C.curl(0, r1(y + (R() - 0.5) * 8), (R() - 0.5) * 0.6, 9 + R() * 9, (R() < 0.5 ? -1 : 1) * (0.7 + R() * 0.6), 2.4, 0.4, 14);
  }
  return s;
}

function template() {
  const house = `<g transform="translate(${r1(HOUSE_X - 482 * HOUSE_S)} ${r1(WATER - 368 * HOUSE_S)}) scale(${HOUSE_S})">${C.house({ mode: 'facade', crack: 0 })}</g>`;
  const half = (side) => `<g id="fl-half${side}"><g clip-path="url(#fl-clip${side})"><use href="#fl-house"/>` +
    `<path d="${fisPath}" style="${FIS_STYLE};stroke:var(--fl-fis-col,#e0392b)" filter="url(#sh-glow)"/></g></g>`;
  const banks = `<g fill="currentColor">
    <path d="M-20 ${WATER}V${PATH_Y - 3}C30 ${PATH_Y - 7} 90 ${PATH_Y - 6} 128 ${PATH_Y - 2}C144 ${PATH_Y} 154 ${PATH_Y + 3} 162 ${WATER}Z"/>
    <path d="M874 ${WATER}C880 ${PATH_Y + 3} 892 ${PATH_Y - 1} 912 ${PATH_Y - 3}C932 ${PATH_Y - 5} 952 ${PATH_Y - 4} 980 ${PATH_Y - 5}V${WATER}Z"/></g>` +
    C.sedges(-6, 150, PATH_Y - 1, { count: 30, h: [8, 22], seed: 5 }) + C.sedges(878, 960, PATH_Y - 2, { count: 18, h: [7, 18], seed: 7, lean: -0.05 });
  return `
<style>${CSS}</style>
<svg viewBox="0 0 960 640" xmlns="${NS}" role="img" tabindex="-1"
  aria-label="Shadow theatre: a causeway of black stones across a dark tarn under a blood-red moon, the house behind you. Hold anywhere, or the space bar, to look back.">
${C.defs({ animate: false })}
<defs>
  <clipPath id="fl-above" clipPathUnits="userSpaceOnUse"><rect x="-200" y="-600" width="1400" height="${600 + WATER}"/></clipPath>
  <clipPath id="fl-below" clipPathUnits="userSpaceOnUse"><rect x="0" y="${WATER}" width="960" height="${640 - WATER}"/></clipPath>
  <clipPath id="fl-clipL" clipPathUnits="userSpaceOnUse"><polygon points="${clipL}"/></clipPath>
  <clipPath id="fl-clipR" clipPathUnits="userSpaceOnUse"><polygon points="${clipR}"/></clipPath>
  <radialGradient id="fl-moonglow"><stop offset="0" stop-color="#c8321f" stop-opacity=".5"/><stop offset=".45" stop-color="#c8321f" stop-opacity=".16"/><stop offset="1" stop-color="#c8321f" stop-opacity="0"/></radialGradient>
  <linearGradient id="fl-gleam" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f3dba2" stop-opacity="0"/><stop offset="1" stop-color="#fff3d0" stop-opacity=".95"/></linearGradient>
  <filter id="fl-backlit" x="-30%" y="-70%" width="160%" height="240%" color-interpolation-filters="sRGB">
    <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="b"/>
    <feComponentTransfer in="b" result="a"><feFuncA type="linear" slope="2.6"/></feComponentTransfer>
    <feFlood flood-color="${BACKLIT}" flood-opacity=".92"/><feComposite in2="a" operator="in" result="glow"/>
    <feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <filter id="fl-truth" x="-20%" y="-60%" width="140%" height="220%" color-interpolation-filters="sRGB">
    <feGaussianBlur in="SourceAlpha" stdDeviation="2.6" result="b"/>
    <feComponentTransfer in="b" result="a"><feFuncA type="linear" slope="2.2"/></feComponentTransfer>
    <feFlood flood-color="#0b0809" flood-opacity=".9"/><feComposite in2="a" operator="in" result="sh"/>
    <feMerge><feMergeNode in="sh"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <g id="fl-house">${house}</g>
</defs>

${C.backdrop('flight', { h: WATER })}
<g id="fl-moon"><circle cx="${MOON_X}" cy="${MOON_Y}" r="230" fill="url(#fl-moonglow)"/>${C.moon(MOON_X, MOON_Y, MOON_R)}</g>
${C.glass('flight', { y: WATER, h: 640 - WATER })}
${C.returned('<g style="--fl-fis-col:transparent"><use href="#fl-world"/></g>', { still: true, transform: FLIP })}
<g clip-path="url(#fl-below)"><g class="sh-truth" transform="${FLIP}">
  <g id="fl-tfisL"><path clip-path="url(#fl-clipL)" d="${fisPath}" style="${FIS_STYLE};stroke:var(--sh-red,#e0392b)"/></g>
  <g id="fl-tfisR"><path clip-path="url(#fl-clipR)" d="${fisPath}" style="${FIS_STYLE};stroke:var(--sh-red,#e0392b)"/></g>
  <g id="fl-her-truth" style="display:none">${C.figure('madeline', { scale: HER_S, faint: false, attrs: 'filter="url(#sh-glow)" style="--gauze:#fff6e0"' })}</g>
</g></g>
<g style="color:var(--sh-cut,#0b0809);${LIT}">
  <g id="fl-world" clip-path="url(#fl-above)">
    ${banks}
    ${half('L')}${half('R')}
    <g id="fl-stones" fill="currentColor"></g>
    <g id="fl-horse">${C.figure('horse', { x: HORSE_X, y: PATH_Y, scale: HORSE_S, flip: true })}</g>
    <g id="fl-her" style="display:none">${C.figure('madeline', { scale: HER_S })}</g>
    <g id="fl-guest">${C.figure('guest', { x: GUEST0, y: PATH_Y, scale: GUEST_S })}</g>
  </g>
</g>
<g id="fl-words" clip-path="url(#fl-above)"></g>
<g id="fl-veil" fill="currentColor" style="color:var(--sh-cut,#0b0809)" pointer-events="none">
  <rect id="fl-veil-rect" x="0" y="0" width="0" height="640"/><g id="fl-veil-edge">${veilEdge()}</g>
</g>
<g id="fl-clung" clip-path="url(#fl-above)"></g>
<g id="fl-rings"></g>
<g id="fl-sounds"></g>
<g id="fl-hud">
  <text id="fl-slip-text" class="teach" x="44" y="60" style="opacity:0"></text>
  <text id="fl-score" class="score" x="920" y="606" text-anchor="end"></text>
</g>
${C.frame()}
</svg>
<div class="fl-live" aria-live="polite"></div>`;
}

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const easeIn = k => k * k;
const easeOut = k => 1 - (1 - k) * (1 - k);
const easeInOut = k => (k < 0.5 ? 2 * k * k : 1 - (2 - 2 * k) ** 2 / 2);

// Puppet sticks: move a figure, tilt it while it sinks, turn it edge-on.
const placeAt = (fig, x, y, deg = 0) => {
  if (!deg) { C.place(fig, x, y); return; }
  fig.querySelector('.sh-at').setAttribute('transform', `translate(${r1(x)} ${r1(y)}) rotate(${deg.toFixed(1)})`);
};
// k: 1 facing right, -1 facing left, between = edge-on.
const faceTo = (fig, name, s, k) => {
  const sx = C.figureInfo(name).faces * k * s;
  fig.querySelector('.sh-pose > g').setAttribute('transform', `scale(${sx.toFixed(3)} ${s})`);
};

function soundWord(w) {
  w = String(w).trim().replace(/\s+/g, ' ');
  if (w.length > 30) w = w.slice(0, 29).trim() + '…';
  if (!/[.!?…]$/.test(w)) w += '.';
  return w;
}

export default {
  id: 'flight',
  title: 'A Thousand Waters',

  mount(stage, api) {
    const reduced = !!(api && api.reducedMotion);
    const S = (api && api.state) || {};
    const num = (v, d) => (typeof v === 'number' && isFinite(v) ? v : d);

    // Flags from earlier chapters, all optional.
    const tapsHushed = Math.max(0, num(S.tapsHushed, 30));
    const spared = num(S.tapsSpared, 0) > 0 || S.knockSpared === true;
    const screwOut = S.burialScrewOut === true;
    const unexplained = (Array.isArray(S.nightsUnexplained) ? S.nightsUnexplained : [])
      .filter(w => typeof w === 'string' && w.trim()).slice(0, 3).map(soundWord);
    const tapN = clamp(Math.round(tapsHushed / 10), spared ? 0 : 1, 5);
    const teacher = tapN > 0 ? 'tap.' : 'crack.';
    const truths = [...(spared ? ['tap.'] : []), ...unexplained];

    // DOM (lace density is decided before anything is cut)
    C.autoLace();
    const root = document.createElement('div');
    root.className = 'g-flight' + (reduced ? ' sh-still' : '');
    root.innerHTML = template();
    stage.appendChild(root);
    const svg = root.querySelector('svg');
    const $ = id => svg.querySelector('#' + id);
    const stonesG = $('fl-stones'), wordsG = $('fl-words'), clungG = $('fl-clung');
    const ringsG = $('fl-rings'), soundsG = $('fl-sounds');
    const veil = $('fl-veil'), veilRect = $('fl-veil-rect'), veilEdgeG = $('fl-veil-edge');
    const guestG = $('fl-guest'), guestFig = guestG.querySelector('.sh-fig');
    const herG = $('fl-her'), herFig = herG.querySelector('.sh-fig');
    const herTruthG = $('fl-her-truth'), herTruthFig = herTruthG.querySelector('.sh-fig');
    const horseG = $('fl-horse'), horseFig = horseG.querySelector('.sh-fig');
    const halfL = $('fl-halfL'), halfR = $('fl-halfR'), tfisL = $('fl-tfisL'), tfisR = $('fl-tfisR'), moon = $('fl-moon');
    const slipText = $('fl-slip-text'), slip = slipText;
    const scoreT = $('fl-score'), live = root.querySelector('.fl-live');

    const el = (tag, attrs, parent) => {
      const n = document.createElementNS(NS, tag);
      for (const k in attrs) n.setAttribute(k, attrs[k]);
      if (parent) parent.appendChild(n);
      return n;
    };
    // The house splits as two halves; each half's red seam in the tarn goes with it.
    const setHalf = (L, val) => { for (const n of L ? [halfL, tfisL] : [halfR, tfisR]) n.setAttribute('transform', val); };
    const fadeHalf = (L, o) => { for (const n of L ? [halfL, tfisL] : [halfR, tfisR]) n.style.opacity = o; };

    // Stones
    const stones = [];
    for (let i = 0; i < NST; i++) {
      const x = X0 + i * SW;
      const g = el('g', {}, stonesG);
      g.innerHTML = stoneCut(x, screwOut && i === SCREW_STONE);
      stones.push({ g, x, dropped: false });
    }

    // State
    let clock = 0, last = 0, raf = 0, destroyed = false, doneSent = false;
    let phase = 'run';            // run | bank | sinking | aftermath | finale | over
    let gx = GUEST0, front = X0, dropped = 0, stall = 0, screwDone = false;
    let looking = false, lookUntil = 0, looks = 0, lookTime = 0, forced = false, lb = 0;
    let firstLookDone = false, warnedThisLook = false;
    let beat = 0, bankT = 0, runClock = 0, timeScale = 1, fell = false, finaleAt = 0;
    let her = null;               // { x, alive, out, mounted, words: [] }
    const followers = [], clung = [], tweens = [];
    let events = [];
    const pointers = new Set();
    let spaceDown = false, fs = 1, slipId = '', lastFis = -1, lastScore = '';
    let guestFace = 1, frameDt = 0, wasMoving = false, wasView = false;

    const later = (sec, fn) => events.push({ at: clock + sec, fn });
    const tween = (dur, fn, done) => { tweens.push({ t: 0, dur, fn, done }); fn(0); };

    // The teaching line: italic paper on the dark, top left.
    function layoutSlip() {
      let size = 26 * fs;
      slipText.setAttribute('font-size', size.toFixed(1));
      let w = 0;
      try { w = slipText.getComputedTextLength(); } catch (e) { w = 0; }
      const maxW = 872;
      if (w > maxW) { size *= maxW / w; slipText.setAttribute('font-size', size.toFixed(1)); }
      slipText.setAttribute('y', (30 + size * 1.55 * 0.68).toFixed(1));
    }
    function caption(text, id = text, hold = 0) {
      slipId = id;
      slipText.textContent = text;
      layoutSlip();
      slip.style.opacity = 1;
      live.textContent = text;
      if (hold) later(hold, () => { if (slipId === id) hideCaption(); });
    }
    function hideCaption() { slipId = ''; slip.style.opacity = 0; }

    // Sound-words are cut type, held up against the moonlight.
    function sound(word, x, y, size, opts = {}) {
      const t = el('text', {
        class: 'sound', x: 0, y: 0, 'text-anchor': 'middle', filter: 'url(#fl-backlit)',
        'font-size': (size * Math.max(1, fs * 0.85)).toFixed(1),
        transform: `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(opts.tilt ?? (Math.random() * 8 - 4)).toFixed(1)})`
      }, soundsG);
      t.textContent = word;
      const hold = opts.hold ?? (reduced ? 1.8 : 0.9);
      later(hold, () => { t.style.opacity = 0; });
      later(hold + 0.7, () => t.remove());
    }

    function rings(x, big = 1) {
      for (let j = 0; j < 2; j++) {
        later(j * 0.2, () => {
          const r = el('ellipse', { class: 'ring', cx: x.toFixed(1), cy: 449, rx: 3, ry: 1 }, ringsG);
          tween(reduced ? 0.9 : 1.1, k => {
            const rx = reduced ? 16 * big : (4 + 30 * big * easeOut(k));
            r.setAttribute('rx', rx.toFixed(1));
            r.setAttribute('ry', (rx * 0.24).toFixed(1));
            r.style.opacity = reduced ? (k < 0.3 ? k / 0.3 : 1 - (k - 0.3) / 0.7) : 0.95 * (1 - k);
          }, () => r.remove());
        });
      }
    }

    // The moon glancing along the glass.
    function gleam() {
      if (reduced) {
        const r = el('rect', { class: 'gleam-flat', x: 0, y: WATER - 1.2, width: 960, height: 2.4 }, soundsG);
        tween(0.9, k => { r.style.opacity = 0.85 * Math.sin(Math.PI * k); }, () => r.remove());
      } else {
        const r = el('rect', { class: 'gleam', x: -260, y: WATER - 1.5, width: 260, height: 3 }, soundsG);
        const r2 = el('rect', { class: 'gleam', x: -200, y: WATER + 4, width: 200, height: 1.2 }, soundsG);
        tween(0.6, k => {
          r.setAttribute('x', (-260 + 1240 * k).toFixed(1));
          r2.setAttribute('x', (-320 + 1240 * k).toFixed(1));
        }, () => { r.remove(); r2.remove(); });
      }
    }

    // Followers: the noises you hushed
    function addFollower(word, x) {
      const t = el('text', { class: 'word', 'text-anchor': 'middle', x: 0, y: 0, filter: 'url(#fl-backlit)' }, wordsG);
      t.textContent = word;
      followers.push({ el: t, x, word, clung: false, sunk: false, hop: Math.random() * 3, tilt: Math.random() * 6 - 3 });
    }
    function sinkWord(f, el2 = f.el, y0 = PATH_Y - 6) {
      f.sunk = true;
      tween(reduced ? 0.6 : 0.7, k => {
        if (!reduced) el2.setAttribute('transform', `translate(${f.x.toFixed(1)} ${(y0 + 34 * easeIn(k)).toFixed(1)}) rotate(${(f.tilt + 14 * k).toFixed(1)})`);
        el2.style.opacity = 1 - k;
      }, () => el2.remove());
    }
    function cling(f) {
      f.clung = true;
      f.el.classList.add('clung');
      clungG.appendChild(f.el);
      clung.push(f);
    }

    // Madeline, and what walks beside her
    function spawnHer() {
      if (her) return;
      const x = Math.max(front + 8, Math.min(front + HER_LEAD, gx - VEIL_GAP - 6));
      her = { x, alive: true, out: false, mounted: false, words: [] };
      herG.style.display = '';
      herTruthG.style.display = '';
      truths.forEach(w => {
        const t = el('text', { class: 'word truth', 'text-anchor': 'end', x: 0, y: 0, filter: 'url(#fl-truth)' }, wordsG);
        t.textContent = w;
        her.words.push(t);
      });
    }
    const herOpacity = o => { herG.style.opacity = o; herTruthG.style.opacity = o; her.words.forEach(t => { t.style.opacity = o; }); };
    function herSinks() {
      her.alive = false;
      const x0 = her.x;
      tween(reduced ? 0.9 : 1.1, k => {
        if (!reduced) {
          placeAt(herFig, x0, PATH_Y + 52 * easeIn(k), -8 * k);
          placeAt(herTruthFig, x0, PATH_Y + 52 * easeIn(k), -8 * k);
        }
        herOpacity(1 - k);
      });
      if (phase === 'bank') later(1.2, startFinale);
    }
    function herTakesHorse() {
      her.out = true; her.mounted = true;
      const x0 = her.x;
      if (phase !== 'sinking' && phase !== 'aftermath') caption('She took my horse.', 'horse', 3.4);
      tween(reduced ? 0.4 : 0.5, k => {
        her.x = x0 + (HORSE_X - 2 - x0) * k;
        her.lift = HER_LIFT * k;
        // the horse turns for home: edge-on, then away (160 ms)
        if (!reduced) faceTo(horseFig, 'horse', HORSE_S, clamp(-1 + 2 * k / 0.32, -1, 1));
      }, () => {
        const hx0 = her.x;
        faceTo(horseFig, 'horse', HORSE_S, reduced ? -1 : 1);
        if (!reduced) horseFig.classList.add('sh-moving');
        tween(1.8, k => {
          const dx = reduced ? 0 : 170 * easeIn(k);
          her.x = hx0 + dx;
          C.place(horseFig, HORSE_X + dx, PATH_Y);
          const o = reduced ? 1 - k : (k < 0.6 ? 1 : 1 - (k - 0.6) / 0.4);
          horseG.style.opacity = o;
          herOpacity(o);
        }, () => {
          horseG.style.display = 'none'; herG.style.display = 'none'; herTruthG.style.display = 'none';
          if (phase === 'bank') later(0.8, startFinale);
          if (phase === 'aftermath') later(0.4, startFinale);
        });
      });
    }
    const herResolved = () => her && (!her.alive || her.out);

    // Stones and the collapse
    function dropStone(i) {
      const s = stones[i];
      s.dropped = true;
      const cx = s.x + SW / 2, rot = (i % 2 ? 1 : -1) * 9;
      tween(reduced ? 0.5 : 0.55, k => {
        if (reduced) s.g.style.opacity = 1 - k;
        else s.g.setAttribute('transform', `translate(0 ${(36 * easeIn(k)).toFixed(1)}) rotate(${(rot * k).toFixed(1)} ${cx.toFixed(1)} 434)`);
      });
      later(0.22, () => rings(cx));
    }

    // Beats
    function beatOne() {
      beat = 1;
      gleam();
      caption('Alone behind me.', 'alone', 3.6);
      const list = THRONG.filter(w => w !== teacher);
      const taps = Math.max(0, tapN - (teacher === 'tap.' ? 1 : 0));
      const order = [];
      for (let i = 0; i < Math.max(list.length, taps); i++) {
        if (i < list.length) order.push(list[i]);
        if (i < taps) order.push('tap.');
      }
      order.forEach((w, i) => later(0.35 + i * 0.5, () => {
        if (phase !== 'run' && phase !== 'bank') return;
        const [loud, size] = LOUD[w] || [w.toUpperCase(), 40];
        sound(loud, 70 + Math.random() * 190, 170 + Math.random() * 190, size);
        addFollower(w, Math.max(front + 12, gx - 140));
      }));
    }
    // She comes out of the dark behind you, once there is dark enough to come out of.
    let herDue = false;
    function beatTwo() { herDue = true; }
    function herArrives() {
      herDue = false;
      beat = 2;
      gleam();
      spawnHer();
    }
    function enterBank() {
      phase = 'bank';
      bankT = 0;
      caption('Safe on the bank.', 'bank', 3.2);
      if (herResolved()) later(1.4, startFinale);
    }

    function guestFalls() {
      fell = true;
      phase = 'sinking';
      looking = false;
      forced = true;
      caption('The causeway went from under me.', 'fell');
      const x0 = gx;
      guestFig.classList.remove('sh-moving');
      tween(reduced ? 1 : 1.2, k => {
        if (!reduced) placeAt(guestFig, x0, PATH_Y + 64 * easeIn(k), 10 * k);
        guestG.style.opacity = 1 - k * 0.999;
      });
      clung.forEach((f, i) => sinkWord(f, f.el, PATH_Y - 36 + (i % 3) * 14));
      rings(x0, 1.3);
      later(1.6, () => {
        if (herResolved()) { startFinale(); return; }
        spawnHer();
        phase = 'aftermath';
        timeScale = 5;
      });
    }

    function startFinale() {
      if (phase === 'finale' || phase === 'over' || destroyed) return;
      phase = 'finale';
      finaleAt = clock;
      forced = true;
      looking = false;
      timeScale = 1;
      if (slipId === 'bank' || slipId === 'alone') hideCaption();
      later(0.5, splitHouse);
    }

    // The house's base corners are the hinges it falls about.
    const PIV_L = `${hx(280)} ${WATER - 6}`, PIV_R = `${hx(680)} ${WATER - 6}`;
    function splitHouse() {
      sound('a thousand waters.', 300, 196, 46, { tilt: -3, hold: reduced ? 3.2 : 2.4 });
      if (reduced) {
        tween(1.8, k => { fadeHalf(true, 1 - k); fadeHalf(false, 1 - k); }, sunk);
      } else {
        tween(1.3, k => {
          const a = easeInOut(k);
          setHalf(true, `translate(${(-8 * a).toFixed(1)} 0) rotate(${(-7 * a).toFixed(2)} ${PIV_L})`);
          setHalf(false, `translate(${(9 * a).toFixed(1)} 0) rotate(${(6 * a).toFixed(2)} ${PIV_R})`);
        }, () => tween(2.3, k => {
          const ty = (330 * easeIn(k)).toFixed(1);
          setHalf(true, `translate(-8 ${ty}) rotate(${(-7 - 5 * k).toFixed(2)} ${PIV_L})`);
          setHalf(false, `translate(9 ${ty}) rotate(${(6 + 4 * k).toFixed(2)} ${PIV_R})`);
        }, sunk));
      }
      function sunk() {
        [hx(330), hx(482), hx(640)].forEach((x, i) => later(i * 0.15, () => rings(x, 1.6)));
        tween(reduced ? 0.01 : 3, k => moon.setAttribute('transform', `translate(0 ${(70 * easeOut(k)).toFixed(1)})`));
        const outText = her && her.out
          ? (fell ? 'She took my horse. The tarn took me.' : '“It’s been some weeks, ma’am,” said the servant.')
          : 'The tarn closed sullenly and silently.';
        later(0.8, () => caption(outText, 'end'));
        later(3.6, finish);
      }
    }

    function finish() {
      if (doneSent || destroyed) return;
      doneSent = true;
      phase = 'over';
      const madeline = her && her.out ? 'out' : 'under';
      const note = madeline === 'out'
        ? (fell ? 'The tarn took me. She took my horse.' : 'She took my horse. “It’s been some weeks, ma’am,” said the servant.')
        : (fell ? 'I turned to see, and the tarn closed over all of us.' : 'I turned to see, and the tarn closed sullenly and silently over the House of Usher.');
      try { api.setFlag && api.setFlag('flight', { madeline, looks, fell }); } catch (e) { /* spine's problem */ }
      api.done({
        won: !fell,
        score: {
          'times I turned to see': looks,
          'noises that caught up with me': clung.length,
          'ladies left on the causeway': madeline === 'under' ? 1 : 0
        },
        note
      });
    }

    // Input: hold anywhere, or Space. A tap is a 0.4 s look.
    const canLook = () => phase === 'run' || phase === 'bank';
    const held = () => pointers.size > 0 || spaceDown;
    function press() {
      if (!canLook()) return;
      if (!looking) { looking = true; looks++; warnedThisLook = false; }
      lookUntil = Math.max(lookUntil, clock + MIN_LOOK);
    }
    const onDown = e => {
      if (e.button !== undefined && e.button > 0) return;
      e.preventDefault();
      pointers.add(e.pointerId);
      try { svg.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      press();
    };
    const onUp = e => { pointers.delete(e.pointerId); };
    const onKeyDown = e => {
      if (e.code !== 'Space' && e.key !== ' ') return;
      e.preventDefault();
      if (!e.repeat && !spaceDown) { spaceDown = true; press(); }
    };
    const onKeyUp = e => { if (e.code === 'Space' || e.key === ' ') { e.preventDefault(); spaceDown = false; } };
    const onBlur = () => { pointers.clear(); spaceDown = false; };
    const noMenu = e => e.preventDefault();
    svg.addEventListener('pointerdown', onDown);
    svg.addEventListener('pointerup', onUp);
    svg.addEventListener('pointercancel', onUp);
    svg.addEventListener('lostpointercapture', onUp);
    svg.addEventListener('contextmenu', noMenu);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);

    // Type sizes grow on small screens so the words stay legible.
    function sizeType() {
      const w = svg.getBoundingClientRect().width || 960;
      fs = clamp((960 / w) * 0.62, 1, 1.6);
      root.style.setProperty('--g-flight-fs', fs.toFixed(3));
      if (slipId) layoutSlip();
    }
    sizeType();
    const veilAlpha = parseFloat(getComputedStyle(root).getPropertyValue('--g-flight-veil-alpha')) || 0.9;
    const ro = new ResizeObserver(sizeType);
    ro.observe(root);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (!destroyed && slipId) layoutSlip(); });

    // Simulation
    function step(dt) {
      const lookingNow = looking && canLook();
      if (lookingNow) lookTime += dt;

      // the collapse
      let speed = phase === 'finale' ? COL_FINALE : lookingNow ? (gx - front < BRINK && gx < X1 ? COL_BRINK : COL_LOOK) : COL_RUN;
      if (stall > 0 && phase !== 'finale') { stall -= dt; speed = 0; }
      front = Math.min(X1, front + speed * dt);
      if (screwOut && !screwDone && phase !== 'finale' && front >= X0 + SCREW_STONE * SW) {
        front = X0 + SCREW_STONE * SW;
        stall = STALL;
        screwDone = true;
        sound('creak.', front + SW / 2, 392, 26, { hold: 1.6 });
      }
      // Before she comes, the fall can only come nearly to you; after, it hesitates at your heels.
      if (beat < 2 && phase === 'run') front = Math.min(front, gx - NEARLY);
      while (dropped < NST && front >= X0 + (dropped + 0.5) * SW) dropStone(dropped++);

      // you
      if (phase === 'run' && !lookingNow) {
        gx += Math.max(FLOOR, RUN - SLOW * clung.length) * dt;
        runClock += dt;
        if (beat < 1 && gx >= BEAT1) beatOne();
        if (!herDue && !her && gx >= BEAT2) beatTwo();
        if (herDue && (gx - front >= HER_LEAD + VEIL_GAP + 6 || gx >= HER_LATEST)) herArrives();
        if (gx >= GUEST_END) { gx = GUEST_END; enterBank(); }
      }
      if (lookingNow && !warnedThisLook && gx - front < BRINK && gx < X1) {
        warnedThisLook = true;
        sound('crack.', gx - 8, 404, 22, { tilt: -4 });
      }
      if (phase === 'bank') {
        bankT += dt;
        if (bankT >= BANK_WAIT) startFinale();
      }

      // the noises that follow
      const chasing = (phase === 'run' || phase === 'bank') && !lookingNow;
      for (const f of followers) {
        if (f.sunk || f.clung) continue;
        if (chasing) { f.x += FOLLOW * dt; f.hop += dt * 8.5; }
        if (!fell && (phase === 'run' || phase === 'bank') && f.x >= gx - CLING) cling(f);
        else if (f.x < front) sinkWord(f, f.el, PATH_Y - 6 - hopY(f));
      }

      // her: she does not stop when you look
      if (her && her.alive && !her.out) {
        her.x += HER * dt;
        if (her.x < front && her.x < X1) herSinks();
        else if (her.x >= HORSE_REACH) herTakesHorse();
      }

      // caught
      if (!fell && (phase === 'run' || phase === 'bank') && gx < X1 && front >= gx - 6) guestFalls();
    }

    const hopY = f => (reduced ? 0 : 11 * Math.abs(Math.sin(f.hop)));

    function render() {
      const view = (looking && canLook()) || forced;
      // the dark behind you, with its lace edge
      const vw = Math.max(0, (fell ? 960 : gx) - VEIL_GAP);
      veilRect.setAttribute('width', vw.toFixed(1));
      veilEdgeG.setAttribute('transform', `translate(${vw.toFixed(1)} 0)`);
      veil.style.opacity = (veilAlpha * (1 - lb)).toFixed(3);

      // you: slide and bob while running; turn edge-on to look back
      if (!fell) {
        const moving = phase === 'run' && !view;
        if (moving !== wasMoving) { guestFig.classList.toggle('sh-moving', moving); wasMoving = moving; }
        const target = view ? -1 : 1;
        guestFace = reduced ? target : guestFace + clamp(target - guestFace, -frameDt * 12.5, frameDt * 12.5);
        faceTo(guestFig, 'guest', GUEST_S, guestFace);
        C.place(guestFig, gx, PATH_Y);
        if (view !== wasView) { C.hinge(guestFig, '.sh-arm', view ? 26 : 0); wasView = view; }
      }

      // followers
      for (const f of followers) {
        if (f.sunk) continue;
        if (f.clung) {
          const i = clung.indexOf(f);
          const x = gx - 30 - 21 * i * fs, y = PATH_Y - 42 + (i % 3) * 16;
          f.x = x;
          f.el.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${f.tilt.toFixed(1)})`);
        } else {
          f.el.setAttribute('transform', `translate(${f.x.toFixed(1)} ${(PATH_Y - 6 - hopY(f)).toFixed(1)}) rotate(${f.tilt.toFixed(1)})`);
        }
      }

      // her: she glides, never bobs; bright in the tarn
      if (her && (her.alive || her.out) && herG.style.display !== 'none') {
        const y = PATH_Y - (her.lift || 0);
        C.place(herFig, her.x, y);
        C.place(herTruthFig, her.x, y);
        her.words.forEach((t, i) => {
          t.setAttribute('transform', `translate(${(her.x - 24 - 6 * i).toFixed(1)} ${(y - 46 - 20 * i).toFixed(1)}) rotate(${(i % 2 ? 2 : -2)})`);
        });
      }

      // the fissure widens while you gaze
      const fis = 2.4 + Math.min(7, lookTime * 0.9);
      if (Math.abs(fis - lastFis) > 0.05) { lastFis = fis; svg.style.setProperty('--fl-fis-w', fis.toFixed(2)); }

      const sc = `TURNED TO SEE ${looks}   ·   CAUGHT UP ${clung.length}`;
      if (sc !== lastScore) { lastScore = sc; scoreT.textContent = sc; }
    }

    function frame(now) {
      raf = requestAnimationFrame(frame);
      if (!last) last = now;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      clock += dt;
      frameDt = dt;

      const due = events.filter(e => clock >= e.at);
      if (due.length) { events = events.filter(e => clock < e.at); due.forEach(e => { if (!destroyed) e.fn(); }); }
      for (let i = tweens.length - 1; i >= 0; i--) {
        const tw = tweens[i];
        tw.t += dt;
        const k = Math.min(1, tw.t / tw.dur);
        tw.fn(k);
        if (k >= 1) { tweens.splice(i, 1); tw.done && tw.done(); }
      }

      if (looking && !held() && clock >= lookUntil) {
        looking = false;
        if (!firstLookDone) { firstLookDone = true; later(1.4, () => { if (slipId === 'teach') hideCaption(); }); }
      }
      const view = (looking && canLook()) || forced;
      lb = clamp(lb + (view ? 1 : -1) * dt / VEIL_FADE, 0, 1);

      if (phase !== 'over' && phase !== 'sinking') step(dt * timeScale);
      render();
    }

    // Read-only peek for the dev harness and tests.
    root.flightDebug = () => ({ phase, gx, front, looks, clung: clung.length, followers: followers.filter(f => !f.sunk && !f.clung).length,
      her: her && { x: her.x, alive: her.alive, out: her.out }, fell, beat, stall });

    // Opening: already running; the moon glances along the water.
    addFollower(teacher, GUEST0 - 58);
    later(1.0, () => { gleam(); if (!firstLookDone) caption('Hold anywhere to look back.', 'teach'); });
    render();
    raf = requestAnimationFrame(frame);

    return () => {
      destroyed = true;
      cancelAnimationFrame(raf);
      events = []; tweens.length = 0;
      ro.disconnect();
      svg.removeEventListener('pointerdown', onDown);
      svg.removeEventListener('pointerup', onUp);
      svg.removeEventListener('pointercancel', onUp);
      svg.removeEventListener('lostpointercapture', onUp);
      svg.removeEventListener('contextmenu', noMenu);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
      root.remove();
    };
  }
};
