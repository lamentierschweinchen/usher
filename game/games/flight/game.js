// VII. A Thousand Waters: the flight.
// Grandmother's Footsteps on a sinking causeway. Hold to look back: whatever
// follows you freezes, and the house falls faster while you watch.
// Every colour, weight and texture goes through CSS tokens and classes below,
// so a change of visual direction is a token swap.

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
const HORSE_X = 912, SERVANT_X = 934, HORSE_REACH = 900;
const SCREW_STONE = 12;
const FIS = [[86, 146], [79, 180], [91, 206], [80, 240], [93, 276], [82, 316], [95, 354], [86, 390], [92, 422]];
const THRONG = ['crack.', 'rip.', 'shriek.', 'clang.'];
const LOUD = { 'crack.': ['CRACK.', 44], 'rip.': ['RIP.', 40], 'shriek.': ['SHRIEK.', 52], 'clang.': ['CLANG.', 62], 'tap.': ['tap.', 24] };

const CSS = `
.g-flight{
  --g-flight-paper:var(--paper,#f2eee5); --g-flight-ink:var(--ink,#29272a); --g-flight-muted:var(--muted,#625d5a);
  --g-flight-rule:var(--rule,#cbc3b8); --g-flight-red:var(--red,#7a3939);
  --g-flight-veil:var(--g-flight-ink); --g-flight-veil-alpha:.9;
  --g-flight-ring:var(--g-flight-paper); --g-flight-gleam:var(--g-flight-red);
  --g-flight-moon:var(--g-flight-red); --g-flight-fissure:var(--g-flight-red); --g-flight-truth:var(--g-flight-red);
  --g-flight-shadow:var(--g-flight-rule);
  --g-flight-contour:2; --g-flight-fine:1.1; --g-flight-hatch:.8; --g-flight-edge:.8;
  --g-flight-fs:1;
  position:relative;width:100%;height:100%;overflow:hidden;background:var(--g-flight-paper);
  font-family:var(--serif,'IM Fell English',Georgia,serif);
  user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;touch-action:none;-webkit-tap-highlight-color:transparent}
.g-flight svg{display:block;width:100%;height:100%;cursor:pointer;outline:none}
.g-flight .above{color:var(--g-flight-ink);--ground:var(--g-flight-paper)}
.g-flight .below{color:var(--g-flight-paper);--ground:transparent}
.g-flight .ln{fill:none;stroke:currentColor;stroke-width:var(--g-flight-contour);stroke-linecap:round;stroke-linejoin:round}
.g-flight .ln.fine{stroke-width:var(--g-flight-fine)}
.g-flight .mass{fill:currentColor}
.g-flight .wall{fill:var(--ground);stroke:currentColor;stroke-width:var(--g-flight-contour);stroke-linejoin:round}
.g-flight .wall.fine{stroke-width:var(--g-flight-fine)}
.g-flight .bg{fill:var(--g-flight-paper)}
.g-flight .tarn{fill:var(--g-flight-ink)}
.g-flight .hatch-ln{stroke:var(--g-flight-ink);stroke-width:var(--g-flight-hatch);stroke-linecap:round}
.g-flight .fill-hatch{fill:url(#fl-hatch)}
.g-flight .fill-hatch-h{fill:url(#fl-hatch-h)}
.g-flight .mask-w{fill:#fff}
.g-flight .mask-deep-a{stop-color:#fff;stop-opacity:.62}
.g-flight .mask-deep-b{stop-color:#fff;stop-opacity:.12}
.g-flight .mask-k{stroke:#000;stroke-width:1.3;fill:none}
.g-flight .shadow-flood{flood-color:var(--g-flight-shadow)}
.g-flight .fissure{fill:none;stroke:var(--g-flight-fissure);stroke-width:var(--g-flight-fis,2.4);stroke-linejoin:round;stroke-linecap:round}
.g-flight .moon{fill:var(--g-flight-moon)}
.g-flight .her-body{fill:var(--g-flight-paper);stroke:currentColor;stroke-width:var(--g-flight-edge);stroke-linejoin:round}
.g-flight .her-train{fill:var(--g-flight-paper);stroke:currentColor;stroke-width:var(--g-flight-edge)}
.g-flight .veil{fill:var(--g-flight-veil)}
.g-flight .ring{fill:none;stroke:var(--g-flight-ring);stroke-width:1.4}
.g-flight .gleam-a{stop-color:var(--g-flight-gleam);stop-opacity:0}
.g-flight .gleam-b{stop-color:var(--g-flight-gleam);stop-opacity:.95}
.g-flight .gleam{fill:url(#fl-gleam)}
.g-flight .gleam-flat{fill:var(--g-flight-gleam)}
.g-flight .word{font-style:italic;fill:var(--g-flight-ink);font-size:calc(22px * var(--g-flight-fs))}
.g-flight .word.clung{font-size:calc(19px * var(--g-flight-fs))}
.g-flight .word.truth{fill:var(--g-flight-truth);font-size:calc(20px * var(--g-flight-fs))}
.g-flight .sound{font-style:italic;fill:var(--g-flight-paper);stroke:var(--g-flight-ink);stroke-width:3;paint-order:stroke;stroke-linejoin:round;transition:opacity .6s}
.g-flight .sound.inked{fill:var(--g-flight-ink);stroke:var(--g-flight-paper)}
.g-flight .slip{transition:opacity .5s}
.g-flight .slip-card{fill:var(--g-flight-paper);stroke:var(--g-flight-ink);stroke-width:var(--g-flight-fine)}
.g-flight .slip-rule{fill:none;stroke:var(--g-flight-ink);stroke-width:.5}
.g-flight .slip-text{font-style:italic;fill:var(--g-flight-ink)}
.g-flight .score{fill:var(--g-flight-rule);letter-spacing:.14em;font-size:calc(13px * var(--g-flight-fs))}
.g-flight .fl-live{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
`;

const fisPts = FIS.map(p => p.join(' ')).join(' ');
const fisPath = 'M' + FIS.map(p => p.join(' ')).join('L');
const clipL = `-60,-400 86,-400 ${FIS.map(p => p.join(',')).join(' ')} 92,800 -60,800`;
const clipR = `86,-400 320,-400 320,800 92,800 ${FIS.slice().reverse().map(p => p.join(',')).join(' ')}`;

const TEMPLATE = `
<style>${CSS}</style>
<svg viewBox="0 0 960 640" xmlns="${NS}" role="img" tabindex="-1"
  aria-label="A causeway across a black tarn at night, the house behind you. Hold anywhere, or the space bar, to look back.">
<defs>
  <pattern id="fl-hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
    <line class="hatch-ln" x1="0" y1="0" x2="0" y2="5"/>
  </pattern>
  <pattern id="fl-hatch-h" width="9" height="4" patternUnits="userSpaceOnUse">
    <path class="hatch-ln" d="M0 2h6.5"/>
  </pattern>
  <filter id="fl-cutout" x="-20%" y="-20%" width="150%" height="150%">
    <feOffset in="SourceAlpha" dx="2" dy="3" result="o"/>
    <feFlood class="shadow-flood"/><feComposite in2="o" operator="in" result="s"/>
    <feMerge><feMergeNode in="s"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <linearGradient id="fl-deep" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" class="mask-deep-a"/><stop offset="1" class="mask-deep-b"/>
  </linearGradient>
  <pattern id="fl-streaks" width="70" height="6" patternUnits="userSpaceOnUse">
    <path class="mask-k" d="M0 1h28M38 4h22"/>
  </pattern>
  <mask id="fl-depth" maskUnits="userSpaceOnUse" x="0" y="440" width="960" height="200">
    <rect x="0" y="440" width="960" height="200" style="fill:url(#fl-deep)"/>
    <rect x="0" y="443" width="960" height="197" style="fill:url(#fl-streaks)"/>
  </mask>
  <linearGradient id="fl-gleam" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" class="gleam-a"/><stop offset="1" class="gleam-b"/>
  </linearGradient>
  <clipPath id="fl-above" clipPathUnits="userSpaceOnUse"><rect x="-200" y="-600" width="1400" height="1040"/></clipPath>
  <clipPath id="fl-clipL" clipPathUnits="userSpaceOnUse"><polygon points="${clipL}"/></clipPath>
  <clipPath id="fl-clipR" clipPathUnits="userSpaceOnUse"><polygon points="${clipR}"/></clipPath>
  <g id="fl-house">
    <rect class="wall" x="32" y="214" width="108" height="200"/>
    <path class="fill-hatch" d="M34 216h24L34 240Z"/>
    <path class="fill-hatch" d="M138 216h-24l24 24Z"/>
    <path class="ln fine" d="M32 292H140"/>
    <path class="mass" d="M45 274V250Q51 234 57 250V274Z"/>
    <path class="mass" d="M108 274V250Q114 234 120 250V274Z"/>
    <path class="mass" d="M45 346V322Q51 306 57 322V346Z"/>
    <path class="mass" d="M106 346V322Q112 306 118 322V346Z"/>
    <path class="mass" d="M22 219L86 144L150 219Z"/>
    <path class="ln fine" d="M38 219v5M46 219v3M54 219v6M62 219v3M70 219v5M100 219v4M108 219v6M116 219v3M124 219v5M132 219v3"/>
    <path class="mass" d="M117 414V386Q126 366 135 386V414Z"/>
    <path class="wall fine" d="M135 414L146 408V381L135 386Z"/>
    <rect class="mass" x="24" y="412" width="124" height="14"/>
    <path class="fissure" d="${fisPath}"/>
  </g>
</defs>

<rect class="bg" x="0" y="0" width="960" height="640"/>
<g class="above">
  <path class="fill-hatch-h" d="M0 40H960V112C900 124 860 108 800 120S690 104 640 118 520 106 460 120 340 102 280 116 160 104 100 120 40 108 0 116Z"/>
  <path class="mass" d="M0 0H960V44C900 58 860 40 800 54S690 40 640 58 520 42 460 56 340 38 280 52 160 40 100 58 40 44 0 52Z"/>
</g>
<rect class="tarn" x="0" y="440" width="960" height="200"/>
<g class="below" mask="url(#fl-depth)">
  <g transform="matrix(1 0 0 -0.85 0 814)"><use href="#fl-world"/></g>
</g>
<g class="above">
  <g id="fl-world" clip-path="url(#fl-above)">
    <path class="mass" d="M0 424H162V440H0Z"/>
    <path class="ln fine" d="M150 424l4-14M156 424l5-11M12 424l-2-12M20 424l3-9"/>
    <path class="mass" d="M878 426Q900 420 960 421V440H878Z"/>
    <path class="ln fine" d="M884 426l-3-12M890 426l2-9M950 421l3-11"/>
    <circle class="moon" id="fl-moon" cx="88" cy="300" r="46"/>
    <g id="fl-halfL"><use href="#fl-house" clip-path="url(#fl-clipL)"/></g>
    <g id="fl-halfR"><use href="#fl-house" clip-path="url(#fl-clipR)"/></g>
    <g id="fl-stones"></g>
    <g id="fl-servant" transform="translate(${SERVANT_X} ${PATH_Y}) scale(1.35)" filter="url(#fl-cutout)">
      <path class="mass" d="M-3-26C-4-17-6-8-6 0H6C6-8 4-17 3-26Z"/>
      <ellipse cx="0" cy="-29.5" rx="3.4" ry="4.2" class="wall fine"/>
      <path class="ln fine" d="M-3-34C-1-35 2-35 3-33"/>
    </g>
    <g id="fl-horse" transform="translate(${HORSE_X} ${PATH_Y}) scale(1.2)" filter="url(#fl-cutout)">
      <path class="mass" d="M-18-24C-18-30-9-30 0-29L9-28 16-38C19-41 23-40 27-34L28-31C26-30 24-30 21-31L15-21C12-17 4-16-4-16-12-16-18-18-18-24Z"/>
      <path class="ln" d="M-14-17V0M-10-16V0M8-16V0M12-18V0"/>
      <path class="ln fine" d="M-18-25C-23-22-24-16-23-9M17-38l1-4"/>
    </g>
    <g id="fl-her" style="display:none">
      <g id="fl-her-fig" filter="url(#fl-cutout)">
        <path class="her-train" d="M-7-1C-18-1-30-1-42 0C-32-4-18-6-6-9Z"/>
        <path class="her-body" d="M-3-31C-5-20-8-10-9 0H8C7-10 5-20 3-31Z"/>
        <ellipse class="her-body" cx="0" cy="-34" rx="3.4" ry="4.3"/>
        <path class="ln fine" d="M-3-37C-6-31-8-22-12-10"/>
      </g>
    </g>
    <g id="fl-guest" filter="url(#fl-cutout)">
      <g id="fl-guest-body">
        <path class="mass" d="M-4-26C-6-17-10-9-11-6H11C10-9 6-17 4-26Z"/>
        <path class="ln fine" d="M-3-25C-9-25-15-22-19-19"/>
        <ellipse cx="0" cy="-29.5" rx="3.6" ry="4.3" class="wall fine"/>
        <path class="mass" d="M-3.2-33V-40H3.2V-33Z"/><path class="ln" d="M-5.5-33H5.5"/>
      </g>
      <path id="fl-legs-a" class="ln" d="M-3-6L-8 0M3-6L8 0"/>
      <path id="fl-legs-b" class="ln" d="M-1.5-6L0 0M1.5-6L0 0" style="display:none"/>
    </g>
  </g>
</g>
<g id="fl-words" clip-path="url(#fl-above)"></g>
<rect id="fl-veil" class="veil" x="0" y="0" width="0" height="640"/>
<g id="fl-clung" clip-path="url(#fl-above)"></g>
<g id="fl-rings"></g>
<g id="fl-sounds"></g>
<g id="fl-hud">
  <g id="fl-slip" class="slip" style="opacity:0">
    <rect id="fl-slip-card" class="slip-card" x="36" y="30" width="10" height="10"/>
    <rect id="fl-slip-rule" class="slip-rule" x="40" y="34" width="2" height="2"/>
    <text id="fl-slip-text" class="slip-text" x="54" y="60"></text>
  </g>
  <text id="fl-score" class="score" x="924" y="608" text-anchor="end"></text>
</g>
</svg>
<div class="fl-live" aria-live="polite"></div>`;

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const easeIn = k => k * k;
const easeOut = k => 1 - (1 - k) * (1 - k);
const easeInOut = k => (k < 0.5 ? 2 * k * k : 1 - (2 - 2 * k) ** 2 / 2);

// Class rules can't reach inside <use> shadow trees (the house, the reflection),
// so cloned drawing carries its token styles inline. Same tokens, same weights.
const INLINE = {
  ln: 'fill:none;stroke:currentColor;stroke-width:var(--g-flight-contour);stroke-linecap:round;stroke-linejoin:round',
  mass: 'fill:currentColor',
  wall: 'fill:var(--ground);stroke:currentColor;stroke-width:var(--g-flight-contour);stroke-linejoin:round',
  fine: 'stroke-width:var(--g-flight-fine)',
  'fill-hatch': 'fill:url(#fl-hatch)',
  fissure: 'fill:none;stroke:var(--g-flight-fissure);stroke-width:var(--g-flight-fis,2.4);stroke-linejoin:round;stroke-linecap:round',
  moon: 'fill:var(--g-flight-moon)',
  'her-body': 'fill:var(--g-flight-paper);stroke:currentColor;stroke-width:var(--g-flight-edge);stroke-linejoin:round',
  'her-train': 'fill:var(--g-flight-paper);stroke:currentColor;stroke-width:var(--g-flight-edge)'
};
function inlineStyles(node) {
  const all = [node, ...node.querySelectorAll('[class]')];
  for (const n of all) {
    const cls = (n.getAttribute('class') || '').split(/\s+/).filter(c => INLINE[c]);
    if (!cls.length) continue;
    // 'fine' must come after ln/wall so it wins
    cls.sort((a, b) => (a === 'fine') - (b === 'fine'));
    n.setAttribute('style', cls.map(c => INLINE[c]).join(';') + (n.getAttribute('style') ? ';' + n.getAttribute('style') : ''));
  }
}

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

    // DOM
    const root = document.createElement('div');
    root.className = 'g-flight';
    root.innerHTML = TEMPLATE;
    stage.appendChild(root);
    const svg = root.querySelector('svg');
    const $ = id => svg.querySelector('#' + id);
    const world = $('fl-world'), stonesG = $('fl-stones'), wordsG = $('fl-words'), clungG = $('fl-clung');
    const ringsG = $('fl-rings'), soundsG = $('fl-sounds'), veil = $('fl-veil');
    const guestG = $('fl-guest'), guestBody = $('fl-guest-body'), legsA = $('fl-legs-a'), legsB = $('fl-legs-b');
    const herG = $('fl-her'), horseG = $('fl-horse'), halfL = $('fl-halfL'), halfR = $('fl-halfR'), moon = $('fl-moon');
    const slip = $('fl-slip'), slipCard = $('fl-slip-card'), slipRule = $('fl-slip-rule'), slipText = $('fl-slip-text');
    const scoreT = $('fl-score'), live = root.querySelector('.fl-live');

    const el = (tag, attrs, parent) => {
      const n = document.createElementNS(NS, tag);
      for (const k in attrs) n.setAttribute(k, attrs[k]);
      if (parent) parent.appendChild(n);
      return n;
    };

    // Stones
    const stones = [];
    for (let i = 0; i < NST; i++) {
      const x = X0 + i * SW;
      const g = el('g', {}, stonesG);
      el('rect', { class: 'wall fine', x: x + 1, y: 429, width: SW - 2, height: 11, rx: 1.5 }, g);
      el('path', { class: 'ln fine', d: `M${(x + SW * (i % 2 ? 0.35 : 0.6)).toFixed(1)} 431v6` }, g);
      if (screwOut && i === SCREW_STONE) {
        const cx = x + SW / 2;
        el('circle', { class: 'wall fine', cx, cy: 434.5, r: 3.2 }, g);
        el('path', { class: 'ln fine', d: `M${cx - 2} ${436.5}l4-4` }, g);
      }
      stones.push({ g, x, dropped: false });
    }
    inlineStyles(svg.querySelector('#fl-house'));
    inlineStyles(world);

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

    const later = (sec, fn) => events.push({ at: clock + sec, fn });
    const tween = (dur, fn, done) => { tweens.push({ t: 0, dur, fn, done }); fn(0); };

    // Teaching slip, top left
    function layoutSlip() {
      let size = 24 * fs;
      slipText.setAttribute('font-size', size.toFixed(1));
      let w = 0;
      try { w = slipText.getComputedTextLength(); } catch (e) { w = 0; }
      const maxW = 880;
      if (w + 36 > maxW && w > 0) { size *= (maxW - 36) / w; slipText.setAttribute('font-size', size.toFixed(1)); w = (maxW - 36); }
      const h = size * 1.55;
      slipText.setAttribute('y', (30 + h * 0.68).toFixed(1));
      slipCard.setAttribute('width', (w + 36).toFixed(1));
      slipCard.setAttribute('height', h.toFixed(1));
      slipRule.setAttribute('width', (w + 28).toFixed(1));
      slipRule.setAttribute('height', (h - 8).toFixed(1));
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

    function sound(word, x, y, size, opts = {}) {
      const t = el('text', {
        class: 'sound' + (opts.inked ? ' inked' : ''), x: 0, y: 0, 'text-anchor': 'middle',
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

    function gleam() {
      if (reduced) {
        const r = el('rect', { class: 'gleam-flat', x: 0, y: 422.5, width: 960, height: 2.4 }, soundsG);
        tween(0.9, k => { r.style.opacity = 0.85 * Math.sin(Math.PI * k); }, () => r.remove());
      } else {
        const r = el('rect', { class: 'gleam', x: -260, y: 422, width: 260, height: 3 }, soundsG);
        const r2 = el('rect', { class: 'gleam', x: -200, y: 417, width: 200, height: 1.2 }, soundsG);
        tween(0.6, k => {
          r.setAttribute('x', (-260 + 1240 * k).toFixed(1));
          r2.setAttribute('x', (-320 + 1240 * k).toFixed(1));
        }, () => { r.remove(); r2.remove(); });
      }
    }

    // Followers: the noises you hushed
    function addFollower(word, x) {
      const t = el('text', { class: 'word', 'text-anchor': 'middle', x: 0, y: 0 }, wordsG);
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
      truths.forEach((w, i) => {
        const t = el('text', { class: 'word truth', 'text-anchor': 'end', x: 0, y: 0 }, wordsG);
        t.textContent = w;
        her.words.push(t);
      });
    }
    function herSinks() {
      her.alive = false;
      const x0 = her.x;
      tween(reduced ? 0.9 : 1.1, k => {
        if (!reduced) herG.setAttribute('transform', `translate(${x0.toFixed(1)} ${(PATH_Y + 52 * easeIn(k)).toFixed(1)}) scale(1.45) rotate(${(-8 * k).toFixed(1)})`);
        herG.style.opacity = 1 - k;
        her.words.forEach(t => { t.style.opacity = 1 - k; });
      });
      if (phase === 'bank') later(1.2, startFinale);
    }
    function herTakesHorse() {
      her.out = true; her.mounted = true;
      const x0 = her.x;
      if (phase !== 'sinking' && phase !== 'aftermath') caption('She took my horse.', 'horse', 3.4);
      tween(reduced ? 0.4 : 0.5, k => {
        her.x = x0 + (HORSE_X - 2 - x0) * k;
        her.lift = 16 * k;
      }, () => {
        const hx = her.x;
        tween(1.8, k => {
          const dx = reduced ? 0 : 170 * easeIn(k);
          her.x = hx + dx;
          horseG.setAttribute('transform', `translate(${(HORSE_X + dx).toFixed(1)} ${PATH_Y}) scale(1.2)`);
          const o = reduced ? 1 - k : (k < 0.6 ? 1 : 1 - (k - 0.6) / 0.4);
          horseG.style.opacity = o; herG.style.opacity = o;
          her.words.forEach(t => { t.style.opacity = o; });
        }, () => {
          horseG.style.display = 'none'; herG.style.display = 'none';
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
      tween(reduced ? 1 : 1.2, k => {
        if (!reduced) guestG.setAttribute('transform', `translate(${x0.toFixed(1)} ${(PATH_Y + 64 * easeIn(k)).toFixed(1)}) scale(1.35) rotate(${(10 * k).toFixed(1)})`);
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

    function splitHouse() {
      const moonY0 = 300;
      sound('a thousand waters.', 300, 196, 46, { inked: true, tilt: -3, hold: reduced ? 3.2 : 2.4 });
      if (reduced) {
        tween(1.8, k => { halfL.style.opacity = 1 - k; halfR.style.opacity = 1 - k; }, sunk);
      } else {
        tween(1.3, k => {
          const a = easeInOut(k);
          halfL.setAttribute('transform', `translate(${(-8 * a).toFixed(1)} 0) rotate(${(-7 * a).toFixed(2)} 30 422)`);
          halfR.setAttribute('transform', `translate(${(9 * a).toFixed(1)} 0) rotate(${(6 * a).toFixed(2)} 150 422)`);
        }, () => tween(2.3, k => {
          const ty = (330 * easeIn(k)).toFixed(1);
          halfL.setAttribute('transform', `translate(-8 ${ty}) rotate(${(-7 - 5 * k).toFixed(2)} 30 422)`);
          halfR.setAttribute('transform', `translate(9 ${ty}) rotate(${(6 + 4 * k).toFixed(2)} 150 422)`);
        }, sunk));
      }
      function sunk() {
        [48, 88, 128].forEach((x, i) => later(i * 0.15, () => rings(x, 1.6)));
        tween(reduced ? 0.01 : 3, k => moon.setAttribute('cy', (moonY0 + 70 * easeOut(k)).toFixed(1)));
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
      // veil
      veil.setAttribute('width', Math.max(0, (fell ? 960 : gx) - VEIL_GAP).toFixed(1));
      veil.style.opacity = (veilAlpha * (1 - lb)).toFixed(3);

      // guest
      if (!fell) {
        const moving = phase === 'run' && !view;
        const frame = Math.floor(runClock / 0.16) % 2;
        const bob = moving && !reduced ? -1.5 * Math.abs(Math.sin(runClock * Math.PI / 0.16)) : 0;
        const dir = view ? -1 : 1;
        guestG.setAttribute('transform', `translate(${gx.toFixed(1)} ${(PATH_Y + bob).toFixed(1)}) scale(${dir * 1.35} 1.35)`);
        guestBody.setAttribute('transform', moving ? 'rotate(6 0 -6)' : '');
        legsA.style.display = moving && frame === 0 ? '' : 'none';
        legsB.style.display = moving && frame === 0 ? 'none' : '';
      }

      // followers
      for (const f of followers) {
        if (f.sunk) continue;
        if (f.clung) {
          const i = clung.indexOf(f);
          const x = gx - 20 - 17 * i * fs, y = PATH_Y - 36 + (i % 3) * 14;
          f.x = x;
          f.el.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${f.tilt.toFixed(1)})`);
        } else {
          f.el.setAttribute('transform', `translate(${f.x.toFixed(1)} ${(PATH_Y - 6 - hopY(f)).toFixed(1)}) rotate(${f.tilt.toFixed(1)})`);
        }
      }

      // her
      if (her && (her.alive || her.out) && herG.style.display !== 'none') {
        const bob = reduced || her.mounted ? 0 : -1.5 * Math.abs(Math.sin(clock * 2.6));
        const y = PATH_Y + bob - (her.lift || 0);
        herG.setAttribute('transform', `translate(${her.x.toFixed(1)} ${y.toFixed(1)}) scale(1.45)`);
        her.words.forEach((t, i) => {
          t.setAttribute('transform', `translate(${(her.x - 16 - 6 * i).toFixed(1)} ${(y - 20 - 17 * i).toFixed(1)}) rotate(${(i % 2 ? 2 : -2)})`);
        });
      }

      // the fissure widens while you gaze
      const fis = 2.4 + Math.min(7, lookTime * 0.9);
      if (Math.abs(fis - lastFis) > 0.05) { lastFis = fis; world.style.setProperty('--g-flight-fis', fis.toFixed(2)); }

      const sc = `TURNED TO SEE ${looks}   ·   CAUGHT UP ${clung.length}`;
      if (sc !== lastScore) { lastScore = sc; scoreT.textContent = sc; }
    }

    function frame(now) {
      raf = requestAnimationFrame(frame);
      if (!last) last = now;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      clock += dt;

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

    // Opening: already running; a red gleam shoots past.
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
