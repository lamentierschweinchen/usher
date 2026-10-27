// V. The Seventh or Eighth Night: Papers, Please for the noises under your bed.
// Spec: work/design/games/nights.md. Contract: work/design/CONTRACT.md. Look: work/design/LOOK.md (Shadow Theatre).
// Cut from the shared library (../../shared/cuts.js); colour comes only from --sh-* tokens and this game's
// own light gradients. The rules, timings, hit areas, flags and scores are unchanged from the ink build.

import * as C from '../../shared/cuts.js';

const PI = Math.PI;
const NS = 'http://www.w3.org/2000/svg';

// ---------- data ----------

// Where a noise can be. `room`: in this room, above the floor. `ink`: drawn on the black band.
// x/y: where its mark stirs in the room band; w: where its sound-word sits, relative to the mark.
const PLACES = {
  bed:     { label: 'about the bed',     room: true,  below: false, x: 430, y: 134, w: [0, -11, 'middle'] },
  windows: { label: 'at the windows',    room: true,  below: false, x: 660, y: 134, w: [0, -12, 'middle'] },
  roof:    { label: 'on the roof',       room: false, below: false, x: 250, y: 78,  w: [22, 5, 'start'] },
  passage: { label: 'in the passage',    room: false, below: false, x: 744, y: 156, w: [0, -12, 'middle'] },
  stair:   { label: 'on the stair',      room: false, below: false, x: 866, y: 216, w: [-24, 5, 'end'], ink: true },
  below:   { label: 'beneath the floor', room: false, below: true,  x: 430, y: 216, w: [24, 5, 'start'], ink: true },
  archway: { label: 'in the archway',    room: false, below: true,  x: 712, y: 222, w: [-34, 4, 'end'], ink: true },
};

const KINDS = {
  rustle:  { label: 'a rustle',      word: 'rustle.',  verb: 'rustle' },
  rattle:  { label: 'a rattle',      word: 'rattle.',  verb: 'rattle' },
  hurried: { label: 'hurried steps', word: 'steps.',   verb: 'walk' },
  slow:    { label: 'slow steps',    word: 'steps.',   verb: 'walk' },
  tap:     { label: 'a tap',         word: 'tap.',     verb: 'tap' },
  grating: { label: 'a grating',     word: 'grating.', verb: 'grate' },
  scrape:  { label: 'a scrape',      word: 'scrape.',  verb: 'scrape' },
};

// The excuses. `agree`: what a failing field turns into on the third night.
const CARDS = {
  draperies: { title: 'The draperies', gloss: 'curtains in a draught',
    limits: ['rustles', 'in this room', 'above the floor', 'needs wind'], agree: { kind: 'rustle', place: 'bed' } },
  storm: { title: 'The storm', gloss: 'wind at the windows',
    limits: ['rattles', 'windows or roof', 'needs wind'], agree: { kind: 'rattle', place: 'windows' } },
  roderick: { title: 'Roderick, roaming', gloss: "your host can't sleep either",
    limits: ['hurried steps', 'passage or stair'], agree: { kind: 'hurried', place: 'passage' } },
  fancy: { title: 'Excited fancy', gloss: 'you imagined it',
    limits: ['anything faint'], agree: { loud: 'faint' } },
};

// Thirteen slips; ten can be explained at most (ink is one fewer than the night's slips).
const NIGHTS = [
  { name: 'The first night', rule: 'The storm is up all night.', pause: null, ink: 3,
    cards: ['draperies', 'storm', 'roderick'], open: 'Account for every noise.',
    slips: [
      { kind: 'rustle',  place: 'bed',     loud: 'low',   time: '1:05' },
      { kind: 'rattle',  place: 'windows', loud: 'loud',  time: '1:20' },
      { kind: 'hurried', place: 'passage', loud: 'low',   time: '1:40' },
      { kind: 'tap',     place: 'below',   loud: 'faint', time: '2:10' },
    ] },
  { name: 'The fourth or fifth night', rule: 'The storm paused from two until three.', pause: [120, 180], ink: 3,
    cards: ['draperies', 'storm', 'roderick', 'fancy'], open: 'The storm paused from two until three.',
    slips: [
      { kind: 'rattle',  place: 'roof',  loud: 'loud',  time: '1:30' },
      { kind: 'hurried', place: 'stair', loud: 'low',   time: '1:50' },
      { kind: 'rustle',  place: 'bed',   loud: 'faint', time: '2:20' },
      { kind: 'tap',     place: 'below', loud: 'faint', time: '2:50' },
    ] },
  { name: 'The seventh or eighth night', rule: 'The storm is rising.', pause: null, ink: 4, agree: true,
    cards: ['draperies', 'storm', 'roderick', 'fancy'], open: 'Account for every noise.',
    slips: [
      { kind: 'grating', place: 'below',   loud: 'loud', time: '12:40' },
      { kind: 'rattle',  place: 'windows', loud: 'loud', time: '12:55' },
      { kind: 'scrape',  place: 'archway', loud: 'low',  time: '1:15' },
      { kind: 'rustle',  place: 'bed',     loud: 'low',  time: '1:30' },
      { kind: 'slow',    place: 'stair',   loud: 'low',  time: '1:50', remark: 'resting on every step',
        words: 'steps, on the stair', stair: true },
    ] },
];

const minutes = t => { const [h, m] = t.split(':').map(Number); return (h % 12) * 60 + m; };
const windAt = (night, t) => !night.pause || !(minutes(t) >= night.pause[0] && minutes(t) < night.pause[1]);
const words = s => s.words || `${KINDS[s.kind].label}, ${PLACES[s.place].label}`;
const fieldLabel = (f, v) => f === 'kind' ? KINDS[v].label : f === 'place' ? PLACES[v].label : v;

// Why an excuse fails a slip: [{ field, note }], place first, then kind, wind, loudness.
function fails(s, id, night) {
  const P = PLACES[s.place], K = KINDS[s.kind], out = [];
  const no = (field, note) => out.push({ field, note });
  if (id === 'draperies') {
    if (!P.room) no('place', P.below ? "The draperies don't reach below the floor."
      : s.place === 'roof' ? "The draperies don't reach the roof." : "The draperies don't leave the room.");
    if (s.kind !== 'rustle') no('kind', `The draperies rustle; they don't ${K.verb}.`);
    if (!windAt(night, s.time)) no('time', `The draperies hung quite still at ${s.time}: the storm had paused.`);
  } else if (id === 'storm') {
    if (s.place !== 'windows' && s.place !== 'roof') no('place', P.below ? "The storm doesn't get beneath the floor."
      : P.room ? 'The storm stays outside the windows.' : 'The storm keeps to the windows and the roof.');
    if (s.kind !== 'rattle') no('kind', `The storm rattles; it doesn't ${K.verb}.`);
    if (!windAt(night, s.time)) no('time', `The storm had paused at ${s.time}.`);
  } else if (id === 'roderick') {
    if (s.place !== 'passage' && s.place !== 'stair') no('place', P.room ? "Roderick isn't in your room. You'd have noticed."
      : P.below ? "Roderick doesn't go beneath the floor. Not at this hour." : "Roderick doesn't go on the roof.");
    if (s.kind !== 'hurried') no('kind', s.kind === 'slow' ? 'Roderick never walks slowly.' : `Roderick hurries; he doesn't ${K.verb}.`);
  } else if (id === 'fancy') {
    if (s.loud !== 'faint') no('loud', `Fancy only whispers. This was ${s.loud}.`);
  }
  return out;
}

// ---------- art: cut paper against the night's light (work/design/LOOK.md) ----------
// Everything solid is black paper (fill="currentColor" under a wrapper set to --sh-cut). Colour is only
// light: the night's deep blue in the bedroom, a candle's own lamp, violet on the stair, lamplight on the
// slips and cards, moonlight on the back page. Red is only the truth, in the reveal.

// Marks that sit on black paper (the beam, the floor band): their curls and words are light through holes.
const ON_PAPER = new Set(['roof', 'below', 'archway', 'stair']);

const cutG = (s, extra = '') => `<g fill="currentColor" style="color:var(--sh-cut)" ${extra}>${s}</g>`;
const thread = (d, w = 1.2) => `<path d="${d}" style="fill:none;stroke:currentColor;stroke-width:${w};stroke-linecap:round"/>`;
const rainD = (x, y, w, h, step) => {
  let d = '';
  for (let yy = y + 4, row = 0; yy < y + h - 6; yy += step, row++) {
    for (let xx = x + 3 + (row % 2) * step * .5; xx < x + w - 2; xx += step) d += `M${xx.toFixed(1)} ${yy.toFixed(1)}l3 8`;
  }
  return `<path d="${d}"/>`;
};

// A lit card in a cut frame: black paper, a lit panel, lace along its long edges, a curl in each corner.
function litCard(w, ht, i = 8, light = 'url(#sh-lamp)', cl = 13) {
  const corners = [[i + 1.5, i + 1.5, PI / 4, 1], [w - i - 1.5, i + 1.5, PI * 3 / 4, -1],
    [i + 1.5, ht - i - 1.5, -PI / 4, -1], [w - i - 1.5, ht - i - 1.5, -PI * 3 / 4, 1]];
  return `<rect width="${w}" height="${ht}" style="fill:var(--sh-cut)"/><rect x="${i}" y="${i}" width="${w - 2 * i}" height="${ht - 2 * i}" fill="${light}"/>` +
    cutG(C.scallops(i + 7, w - i - 7, i, 2.2, 7.2) + C.scallops(i + 7, w - i - 7, ht - i, 2.2, 7.2) +
      corners.map(([x, y, a, k]) => C.curl(x, y, a, cl, k * 1.1, 2.6, .35, 16)).join(''));
}
// A black ribbon over the glass (the reveal): paper type on it, lamp hairlines, lace top and bottom.
function ribbon(w, ht) {
  return cutG(`<path d="M0 0H${w}V${ht}H0Z"/>` + C.scallops(6, w - 6, 0, 2.2, 7.4) + C.scallops(6, w - 6, ht, 2.2, 7.4)) +
    `<path d="M10 5.5H${w - 10}M10 ${ht - 5.5}H${w - 10}" style="fill:none;stroke:var(--sh-lamp);stroke-width:.6;opacity:.4"/>`;
}

// The bedroom, the passage, the stair, and what lies beneath the floor. Built at mount, after autoLace().
function roomArt() {
  const light =
    `<rect x="36" y="84" width="646" height="104" fill="url(#gn-room)"/>` +
    `<rect x="680" y="84" width="248" height="104" style="fill:var(--lit-stair,url(#gn-pass))"/>` +
    `<circle class="sh-flicker" cx="285" cy="138" r="92" fill="url(#gn-candle)"/>`;
  const cut =
    // beam, walls, and the floor with what lies beneath it
    `<path d="M26 66H934V86H26ZM26 66H38V234H26ZM926 66H934V234H926ZM26 186H934V234H26Z"/>` +
    C.fringe(40, 674, 86, { seed: 5, len: [3, 8], step: 5 }) + C.fringe(706, 922, 86, { seed: 6, len: [2, 6], step: 5.5 }) +
    `<path d="M38 86H78L38 120Z"/>` + C.curl(39, 119, PI / 2 - .2, 8, -1.1, 2.2, .3, 12) +
    `<path d="M676 86H646L676 104Z"/>` + C.curl(647, 87, PI / 2 + .3, 7, 1.1, 2, .3, 12) +
    // the door to the passage, ajar
    `<path d="M673 86H686V108H673ZM680 108L702 114V181L680 186Z"/>` +
    // draperies on their rod; each panel sways in a draught
    `<path d="M44 91h134v3H44z"/><circle cx="44" cy="92.5" r="3.2"/><circle cx="178" cy="92.5" r="3.2"/>` +
    `<g class="gn-panel"><g transform="translate(52 94) scale(.5)">${C.drape(0, 0, 88, 182, { side: 'left', tie: .42 })}</g></g>` +
    `<g class="gn-panel gn-panel-b"><g transform="translate(126 94) scale(.5)">${C.drape(0, 0, 88, 182, { side: 'right', tie: .42 })}</g></g>` +
    // a night table and its candle; the flame is light
    `<path d="M262 155h46v4h-46zM267 159h3.4l-2.6 27h-3zM303 159h-3.4l2.6 27h3zM268 171h34v2.6h-34zM277 155v-2.6h16v2.6zM283.4 152.4v-9h3.2v9zM279.5 143.4v-2h11v2zM283.2 141.4v-11h3.6v11z"/>` +
    C.curl(262, 157, PI - .2, 9, -1.2, 2.2, .3, 12) + C.curl(308, 157, .2, 9, 1.2, 2.2, .3, 12) +
    `<path d="M285 128.4c-3.2-3.6-1.6-8.4 0-12.6c1.6 4.2 3.2 9 0 12.6z" style="fill:var(--lit,#fff0c2)"/>` +
    // the bed: the cut library's canopy bed (shared/cuts.js rooms()), cut again at this scale
    `<g transform="translate(338 186) scale(2.2) translate(-321 -278)"><path d="M325 238h3v40h-3zM397 238h3v40h-3zM321 234h83v4.5h-83zM328 252h4v14h-4zM330 262h68v7h-68zM333 262c2-6 12-6 13 0z"/><circle cx="326.5" cy="232.5" r="2"/><circle cx="398.5" cy="232.5" r="2"/><path d="M328 238C333 248 326 258 331 268L335 268C331.5 258 338 249 333 238ZM397 238C392 248 399 258 394 268L390 268C393.5 258 387 249 392 238Z"/>${C.scallops(331, 395, 239, 1.6, 4.6)}${C.scallops(332, 397, 269.5, 1.2, 3.6)}</g>` +
    // the window: a lancet onto the storm
    C.lancet(582, 98, 56, 62, { light: '--gn-win', fallback: 'url(#gn-win)' }) +
    `<path d="M574 159h72v4h-72z"/>` + C.curl(575, 162, PI / 2 + .3, 7, 1.1, 2, .3, 12) + C.curl(645, 162, PI / 2 - .3, 7, -1.1, 2, .3, 12) +
    // the stair: newel, rail and balusters as cut thread
    `<path d="M802 148h7v38h-7z"/>` + C.curl(805.5, 148.5, -PI / 2 - .1, 9, 1.2, 2.4, .3, 12) +
    thread('M806 151L926 181', 2.6) + thread('M818 154V186M842 160V186M866 166V186M890 172V186M914 178V186', 1.3);
  const holes =
    `<path d="M38 186.7H926" style="fill:none;stroke:#a9bfe2;stroke-width:.8;opacity:.35"/>` +
    `<path d="M684 232V213Q712 193 740 213V232Z" fill="url(#gn-hole)"/>` +                              // the archway, beneath
    `<path d="M800 187H925V227H900V220H880V213H860V206H840V199H820V192H800Z" fill="url(#gn-hole)"/>` +   // the stair, going down
    `<g class="gn-rain" clip-path="url(#gn-clip-win)">${rainD(582, 98, 56, 62, 11)}</g>`;
  return light + cutG(cut, 'style="color:var(--sh-cut);--lit-fold:#a9bfe2"') + holes;
}

// A noise stirring: a little spray of curls.
const markArt = () => C.curl(-10, 5, -PI / 2 - .75, 10, -1.3, 2.1, .3, 14) + C.curl(0, 6, -PI / 2, 12, 1.25, 2.3, .3, 14) +
  C.curl(10, 5, -PI / 2 + .75, 10, 1.3, 2.1, .3, 14);

// Her route, in red, drawn only in the reveal.
const ROUTE = `
<path class="gn-route-low" d="M424 222C520 228 610 228 712 228C790 228 850 229 908 229L806 191"/>
<path class="gn-route-hi" d="M806 183C780 176 742 174 706 174"/>
<circle class="gn-route-dot" cx="702" cy="174" r="3.4"/>
<text class="gn-t-snd gn-truth-low" x="430" y="213" text-anchor="middle">grating.</text>
<text class="gn-t-snd gn-truth-low" x="712" y="221" text-anchor="middle">scrape.</text>
<text class="gn-t-snd gn-truth-hi" x="836" y="140" text-anchor="middle">steps.</text>`;

// Each excuse's emblem, cut in black on its card (card-local units, right of the limits).
function emblem(id) {
  if (id === 'draperies') {
    return cutG(`<path d="M134 50h62v2.6h-62z"/><circle cx="134" cy="51.3" r="2.6"/><circle cx="196" cy="51.3" r="2.6"/>` +
      `<g transform="translate(137 53) scale(.42)">${C.drape(0, 0, 66, 176, { side: 'left', tie: .42 })}</g>` +
      `<g transform="translate(166 53) scale(.42)">${C.drape(0, 0, 66, 176, { side: 'right', tie: .42 })}</g>`);
  }
  if (id === 'storm') {
    return cutG(C.lancet(152, 60, 38, 64, { light: '--gn-win', fallback: 'url(#gn-win)' }) + `<path d="M146 123h50v4h-50z"/>` +
      C.curl(140, 56, -.15, 20, .7, 2.2, .3, 20) + C.curl(162, 50, .05, 16, .8, 1.8, .3, 16)) +
      `<g class="gn-rainlines" clip-path="url(#gn-clip-cardwin)">${rainD(152, 60, 38, 64, 9)}</g>`;
  }
  if (id === 'roderick') return cutG(C.figure('roderick', { x: 166, y: 130, scale: 1.62 }));
  // fancy: a pillow, and what rises from it
  let s = `<path d="M144 129c-5-1-5-8 1-9.4c12-2.4 34-2.4 46 0c6 1.4 6 8.4 1 9.4c-14 2-34 2-48 0z"/>` +
    C.curl(145, 121, PI + .6, 6, -1.2, 1.8, .3, 10) + C.curl(191, 121, -.6, 6, 1.2, 1.8, .3, 10);
  for (let k = 0; k < 5; k++) s += C.curl(160 + k * 4, 119, -PI / 2 + (k - 2) * .24, 46 + (k % 2) * 12, (k % 2 ? 1 : -1) * .3, 2.4, .3, 30);
  return cutG(s + '<circle cx="146" cy="74" r="2.4"/><circle cx="192" cy="66" r="2"/><circle cx="170" cy="52" r="2.6"/>');
}

// Defs of this game's own light (the shared ones come from C.defs()).
const DEFS = `<defs>
<radialGradient id="gn-room" cx=".6" cy=".82" r=".72"><stop offset="0" stop-color="#bccbe6"/><stop offset=".45" stop-color="#7f97c4"/><stop offset="1" stop-color="#2f4a80"/></radialGradient>
<radialGradient id="gn-pass" cx=".35" cy=".7" r=".85"><stop offset="0" stop-color="#9a80a8"/><stop offset="1" stop-color="#3e2c54"/></radialGradient>
<radialGradient id="gn-candle"><stop offset="0" stop-color="#f7d894" stop-opacity=".55"/><stop offset=".5" stop-color="#e6a256" stop-opacity=".16"/><stop offset="1" stop-color="#e6a256" stop-opacity="0"/></radialGradient>
<linearGradient id="gn-win" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1430"/><stop offset=".6" stop-color="#1a2c5a"/><stop offset="1" stop-color="#2f4a80"/></linearGradient>
<linearGradient id="gn-hole" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a3b68"/><stop offset="1" stop-color="#241a34"/></linearGradient>
<clipPath id="gn-clip-win"><path d="${C.lancetD(582, 98, 56, 62)}"/></clipPath>
<clipPath id="gn-clip-cardwin"><path d="${C.lancetD(152, 60, 38, 64)}"/></clipPath>
</defs>`;

const CSS = `
.g-nights{
  --g-nights-moon:#c9d6ee;
  position:relative;width:100%;height:100%;overflow:hidden;
  background:var(--sh-cut,#0b0809);color:var(--sh-paper,#ede2cb);font-family:var(--sh-serif,'IM Fell English',Georgia,serif);
  user-select:none;-webkit-user-select:none;touch-action:manipulation;-webkit-tap-highlight-color:transparent}
.g-nights svg{display:block;width:100%;height:100%}
.g-nights .gn-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
.g-nights text{font-family:var(--sh-serif,'IM Fell English',Georgia,serif);fill:var(--sh-paper,#ede2cb)}
/* type on lit paper is cut paper */
.g-nights .gn-slip text,.g-nights .gn-card text,.g-nights .gn-back text,.g-nights .gn-t-boom{fill:var(--sh-cut,#0b0809)}
.g-nights .gn-rulel{stroke:var(--sh-cut,#0b0809);stroke-width:1px;opacity:.5}
.g-nights .gn-dot{fill:var(--sh-lamp);stroke:var(--sh-lamp);stroke-width:1.5px;transition:fill .3s}
.g-nights .gn-dot.spent{fill:none;stroke-opacity:.4}
/* type, in viewBox units */
.g-nights .gn-t-line{font-size:26px;font-style:italic}
.g-nights .gn-t-label{font-size:14px;letter-spacing:.16em;fill:var(--sh-lamp)}
.g-nights .gn-t-rule{font-size:18px;font-style:italic;opacity:.75}
.g-nights .gn-t-kind{font-size:50px;font-style:italic}
.g-nights .gn-t-field{font-size:36px}
.g-nights .gn-t-time{font-size:34px}
.g-nights .gn-t-remark{font-size:22px;font-style:italic;opacity:.72}
.g-nights .gn-t-snd{font-size:21px;font-style:italic}
.g-nights .gn-t-title{font-size:24px}
.g-nights .gn-t-limit{font-size:17px}
.g-nights .gn-t-back{font-size:23px;font-style:italic}
.g-nights .gn-t-hint{font-size:16px;font-style:italic;opacity:.7}
.g-nights .gn-t-entry{font-size:18px}
.g-nights .gn-slip .gn-t-stamp{font-size:38px;letter-spacing:.14em;fill:var(--sh-lamp)}
.g-nights .gn-slip .gn-t-stampby{font-size:19px;font-style:italic;fill:var(--sh-paper)}
.g-nights .gn-t-boom{font-size:42px;font-style:italic;letter-spacing:.04em}
.g-nights .gn-t-inter{font-size:44px;font-style:italic;fill:var(--sh-lamp)}
.g-nights .gn-t-interrule{font-size:22px;font-style:italic;opacity:.8}
.g-nights .gn-t-borrowed{font-size:26px}
.g-nights .gn-t-say{font-size:20px;font-style:italic;fill:var(--sh-red)}
.g-nights .gn-t-orig{font-size:26px;font-style:italic;fill:var(--sh-red)}
.g-nights .gn-t-prompt{font-size:22px;font-style:italic}
.g-nights .gn-t-score{font-size:17px;letter-spacing:.16em;fill:var(--sh-lamp)}
/* marks: black paper on the lit rooms, light through holes on the black beam and band */
.g-nights .gn-mark{color:var(--sh-cut)}
.g-nights .gn-mark.gn-dark{color:var(--g-nights-moon)}
.g-nights .gn-mark text,.g-nights .gn-sq{fill:currentColor}
.g-nights .gn-mark .gn-sq{animation:gn-stir 1.1s ease-in-out infinite alternate}
@keyframes gn-stir{from{opacity:.3}to{opacity:1}}
/* touchables: shared .touch gives the lit edge; these say when it should show without a hover */
.g-nights [data-act]{cursor:pointer}
.g-nights [data-act]:focus{outline:none}
.g-nights [data-act]:focus-visible .touch,.g-nights.gn-armed .gn-slip.cur .touch,.g-nights .gn-card.up .touch,
.g-nights .gn-back.beckon .touch{filter:url(#sh-rim)}
.g-nights .gn-slip{transition:transform .62s cubic-bezier(.2,.7,.2,1),opacity .3s}
.g-nights .gn-card{transition:transform .5s cubic-bezier(.2,.7,.2,1),opacity .4s}
.g-nights .gn-lift{transition:transform .22s cubic-bezier(.2,.7,.2,1);transform-box:fill-box;transform-origin:50% 100%}
.g-nights .gn-card.up .gn-lift{transform:translateY(-16px) rotate(-1.2deg)}
.g-nights .gn-card.nudge .gn-lift{transform:translateY(-5px) rotate(1deg)}
@media (hover:hover){.g-nights .gn-card:not(.up):hover .gn-lift{transform:translateY(-5px)}}
.g-nights .gn-fv{transition:opacity .3s ease}
.g-nights .gn-fv:not(.on){opacity:0}
.g-nights .gn-imp{opacity:0}
.g-nights .gn-imp.on{opacity:1}
.g-nights .gn-smudge{fill:var(--sh-cut);opacity:0;transition:opacity .3s ease-out}
.g-nights .gn-smudge.on{opacity:.34;transition:none}
.g-nights .gn-panel{transform-box:fill-box;transform-origin:50% 0}
.g-nights .windy .gn-panel{animation:gn-sway 3.4s ease-in-out infinite alternate}
.g-nights .windy .gn-panel-b{animation-duration:2.8s;animation-delay:-1.3s}
@keyframes gn-sway{from{transform:rotate(-1.8deg)}to{transform:rotate(1.8deg)}}
.g-nights .gn-rain{opacity:0;transition:opacity .6s}
.g-nights .windy .gn-rain{opacity:1}
.g-nights .gn-rain path,.g-nights .gn-rainlines path{fill:none;stroke:var(--g-nights-moon);stroke-width:1px;stroke-linecap:round;opacity:.75}
.g-nights .gn-backbody{transform-box:fill-box;transform-origin:50% 100%;transition:transform .3s}
.g-nights .gn-back.beckon .gn-backbody{animation:gn-beckon 1.3s ease-in-out infinite alternate}
.g-nights.gn-rm .gn-back.beckon .gn-backbody{transform:translateY(-8px) rotate(-1deg)}
@keyframes gn-beckon{from{transform:translateY(0)}to{transform:translateY(-9px) rotate(-1deg)}}
.g-nights .gn-entry{opacity:0;transition:opacity .5s}
.g-nights .gn-entry.on{opacity:1}
.g-nights .gn-boom{opacity:1;transition:opacity .6s}
.g-nights .gn-boom.off{opacity:0}
.g-nights .gn-fade{opacity:0;transition:opacity .6s}
.g-nights .gn-nc{opacity:0;transition:opacity .3s}
.g-nights .gn-nc.on{opacity:1}
.g-nights .gn-nc .gn-nc-t{opacity:0;transition:opacity .16s}
.g-nights .gn-nc.on .gn-nc-t{opacity:1;transition-delay:.16s}
.g-nights .gn-nc-rule{fill:none;stroke:var(--sh-lamp);stroke-width:1px;opacity:.6}
.g-nights .gn-route{opacity:0;transition:opacity 1.4s}
.g-nights .gn-route.on{opacity:1}
.g-nights .gn-route-low{fill:none;stroke:var(--sh-red);stroke-width:2.6px;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:.1 7;opacity:.8}
.g-nights .gn-route-hi{fill:none;stroke:var(--sh-red);stroke-width:2.6px;stroke-linecap:round;stroke-dasharray:.1 7}
.g-nights .gn-route-dot{fill:var(--sh-red)}
.g-nights .gn-truth-low{fill:var(--sh-red);opacity:.85}
.g-nights .gn-truth-hi{fill:var(--sh-red)}
.g-nights .gn-rv-slip{opacity:0;transition:opacity .45s}
.g-nights .gn-rv-slip.on{opacity:1}
.g-nights .gn-rv-red{opacity:0;transition:opacity .6s}
.g-nights .gn-rv-red.on{opacity:1}
.g-nights .gn-strike{stroke:var(--sh-paper);stroke-width:1.6px;stroke-linecap:round}
.g-nights .gn-show{opacity:0;transition:opacity .6s}
.g-nights .gn-show.on{opacity:1}
.g-nights .gn-lamp{fill:var(--sh-cut);opacity:0;transition:opacity .9s;pointer-events:none}
.g-nights .gn-lamp.on{opacity:.9}
/* phones (a stage under 600 px, ~.39 px a unit): all type ×1.5; the card emblems step aside to give it room.
   The stamp's ribbon is scaled as a whole in code, so its type is not scaled again here. */
.g-nights.gn-phone .gn-emb{display:none}
.g-nights.gn-phone .gn-L-top .gn-t-label{display:none}
.g-nights.gn-phone .gn-t-line{font-size:39px}
.g-nights.gn-phone .gn-t-label{font-size:21px;letter-spacing:.1em}
.g-nights.gn-phone .gn-t-rule{font-size:27px}
.g-nights.gn-phone .gn-t-kind{font-size:75px}
.g-nights.gn-phone .gn-t-field{font-size:54px}
.g-nights.gn-phone .gn-t-time{font-size:51px}
.g-nights.gn-phone .gn-t-remark{font-size:33px}
.g-nights.gn-phone .gn-t-snd{font-size:31.5px}
.g-nights.gn-phone .gn-t-title{font-size:36px}
.g-nights.gn-phone .gn-t-limit{font-size:25.5px}
.g-nights.gn-phone .gn-t-back{font-size:34.5px}
.g-nights.gn-phone .gn-t-hint{font-size:24px}
.g-nights.gn-phone .gn-t-boom{font-size:63px}
.g-nights.gn-phone .gn-t-inter{font-size:66px}
.g-nights.gn-phone .gn-t-interrule{font-size:33px}
.g-nights.gn-phone .gn-t-borrowed{font-size:39px}
.g-nights.gn-phone .gn-t-say{font-size:30px}
.g-nights.gn-phone .gn-t-orig{font-size:39px}
.g-nights.gn-phone .gn-t-prompt{font-size:33px}
.g-nights.gn-phone .gn-t-score{font-size:25.5px;letter-spacing:.1em}
.g-nights.gn-rm *{transition:none!important;animation:none!important}
`;

// ---------- the game ----------

export default {
  id: 'nights',
  title: 'The Seventh or Eighth Night',

  mount(stage, api = {}) {
    const RM = !!api.reducedMotion;
    const dur = ms => (RM ? 0 : ms);
    let alive = true;
    const timers = new Set();
    const later = (fn, ms) => {
      const id = setTimeout(() => { timers.delete(id); if (alive) fn(); }, ms);
      timers.add(id);
      return id;
    };

    // --- scaffold
    C.autoLace();          // lace density is decided at generation: phones and coarse pointers get about half
    const root = document.createElement('div');
    root.className = 'g-nights' + (RM ? ' gn-rm sh-still' : '');
    const style = document.createElement('style');
    style.textContent = CSS;
    root.appendChild(style);
    const svg = h('svg', { viewBox: '0 0 960 640', preserveAspectRatio: 'xMidYMid meet' });
    root.appendChild(svg);
    const live = document.createElement('div');
    live.className = 'gn-sr';
    live.setAttribute('aria-live', 'polite');
    root.appendChild(live);
    stage.appendChild(root);
    // phones: the stage is about .39 px a unit there, so type grows (see .gn-phone in CSS)
    let PHONE = root.clientWidth > 0 && root.clientWidth < 600;
    root.classList.toggle('gn-phone', PHONE);

    h('g', { class: 'gn-defs' }, svg).innerHTML = C.defs({ animate: false }) + DEFS;

    const L = {};
    for (const n of ['bg', 'room', 'marks', 'route', 'top', 'left', 'back', 'cards', 'slips', 'fx', 'reveal', 'nc', 'lamp', 'frame']) {
      L[n] = h('g', { class: 'gn-L-' + n }, svg);
    }
    // the night's light above, the tarn's dark glass below the floor; the lace frame over everything
    L.bg.innerHTML = C.backdrop('nights', { y: 0, h: 232, clouds: false, hills: false }) + C.glass('nights', { y: 232, h: 408 });
    L.frame.innerHTML = C.frame();

    // --- text fitting (squeeze, never overflow); max may be [desktop, phone]
    const fits = new Map();
    function fit(el, max) {
      fits.set(el, max);
      const m = Array.isArray(max) ? max[PHONE ? 1 : 0] : max;
      try {
        el.removeAttribute('textLength');
        el.removeAttribute('lengthAdjust');
        if (el.getComputedTextLength() > m) {
          el.setAttribute('textLength', m);
          el.setAttribute('lengthAdjust', 'spacingAndGlyphs');
        }
      } catch (e) { /* not rendered yet */ }
      return el;
    }
    const refit = () => {
      for (const [el, max] of [...fits]) {
        if (!el.isConnected) fits.delete(el);
        else fit(el, max);
      }
    };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => alive && refit());

    // --- room
    const room = h('g', { class: 'gn-room' }, L.room);
    room.innerHTML = roomArt();
    const route = h('g', { class: 'gn-route' }, L.route);

    // --- top strip: teaching line (left), night and its rule (right)
    const lineEl = h('text', { class: 'gn-t-line', x: 36, y: 52 }, L.top);
    const nightEl = h('text', { class: 'gn-t-label', x: 924, y: 40, 'text-anchor': 'end' }, L.top);
    const ruleEl = h('text', { class: 'gn-t-rule', x: 924, y: 62, 'text-anchor': 'end' }, L.top);
    function placeTop() {   // visual only
      ruleEl.setAttribute('x', PHONE ? 918 : 924);
      ruleEl.setAttribute('y', PHONE ? 82 : 62);
      fit(ruleEl, [560, 520]);
    }
    placeTop();
    function say(t) {
      lineEl.textContent = t;
      fit(lineEl, [560, 884]);
      live.textContent = t;
    }

    // --- left: ink and the count
    const inkG = h('g', {}, L.left);
    const countEl = h('text', { class: 'gn-t-label', x: 52, y: 446 }, L.left);

    // --- back page: Unaccounted for
    const back = h('g', { class: 'gn-back', 'data-act': 'back', role: 'button', tabindex: '0',
      'aria-label': 'Unaccounted for: set the slip aside', transform: 'translate(712 244) rotate(1.2)' }, L.back);
    const backTouch = h('g', { class: 'touch' }, back);
    const backBody = h('g', { class: 'gn-backbody' }, backTouch);
    // a lamp-lit slip card, cut like the slips and the excuses
    h('g', {}, backBody).innerHTML = litCard(208, 214, 8);
    fit(h('text', { class: 'gn-t-back', x: 16, y: 36 }, backBody, 'Unaccounted for'), [180, 182]);
    h('line', { class: 'gn-rulel', x1: 16, y1: 46, x2: 192, y2: 46 }, backBody);
    const entriesG = h('g', {}, backBody);
    const backHint = fit(h('text', { class: 'gn-t-hint', x: 104, y: 196, 'text-anchor': 'middle' }, backBody, 'set a noise aside here'), [180, 182]);

    // --- state
    let ni = 0;            // night index
    let si = 0;            // slip index within the night
    let no = 0;            // slip number, 1..13
    let ink = 0;
    let lifted = null;     // card id
    let busy = true;
    let phase = 'play';    // play | reveal | ready | done
    let cur = null;        // { s, el, F, imp, impBy, smudge }
    let bounces = 0;
    let everLifted = false, everStamped = false;
    let stairResult = 'unexplained';
    let doneFired = false;
    const stamped = [];    // { no, s, card, swaps }
    const aside = [];      // { no, s }
    const cards = {};      // id -> { g }
    let piled = 0;

    // --- cards
    function cardSlots(ids) {
      const W = 204, G = 16, total = ids.length * W + (ids.length - 1) * G, x0 = 480 - total / 2;
      const out = {};
      ids.forEach((id, i) => { out[id] = x0 + i * (W + G); });
      return out;
    }
    function makeCard(id) {
      const c = CARDS[id];
      const g = h('g', { class: 'gn-card', 'data-act': 'card', 'data-id': id, role: 'button', tabindex: '0',
        'aria-pressed': 'false', 'aria-label': `${c.title}: ${c.gloss}. ${c.limits.join(', ')}.` });
      // position (style transform) › lit edge (.touch) › lifted (.gn-lift) › the card itself
      const touch = h('g', { class: 'touch' }, g);
      const lift = h('g', { class: 'gn-lift' }, touch);
      drawCard(id, lift);
      return { g, lift };
    }
    // The card's face; redrawn when the stage crosses the phone width (visual only).
    function drawCard(id, lift) {
      const c = CARDS[id];
      lift.innerHTML = '';
      h('g', {}, lift).innerHTML = litCard(204, 140, 6, 'url(#sh-lamp)', 9);
      h('g', { class: 'gn-emb' }, lift).innerHTML = emblem(id);
      // on phones a long title with few limits takes two lines rather than a hard squeeze
      const two = PHONE && c.limits.length <= 2 && c.title.includes(', ');
      const tt = h('text', { class: 'gn-t-title', x: 14, y: 33 }, lift);
      if (two) {
        const [a, z] = c.title.split(', ');
        h('tspan', { x: 14 }, tt, a + ',');
        h('tspan', { x: 14, dy: 30 }, tt, z);
      } else {
        tt.textContent = c.title;
        fit(tt, [178, 184]);
      }
      const ry = PHONE ? (two ? 71 : 41) : 43;
      h('line', { class: 'gn-rulel', x1: 14, y1: ry, x2: 190, y2: ry }, lift);
      c.limits.forEach((t, i) => fit(h('text', { class: 'gn-t-limit', x: 14, y: PHONE ? ry + 22 + i * 22 : 66 + i * 20 }, lift, t), [122, 180]));
    }
    function layoutCards(ids, animateIn) {
      const slots = cardSlots(ids);
      for (const id of ids) {
        if (!cards[id]) {
          cards[id] = makeCard(id);
          L.cards.appendChild(cards[id].g);
          if (animateIn && !RM) {
            cards[id].g.style.transform = 'translate(980px, 468px)';
            cards[id].g.getBoundingClientRect();
          }
          fitIn(cards[id].g);
        }
        cards[id].x = slots[id];
        cards[id].g.style.transform = `translate(${slots[id]}px, 468px)`;
      }
    }
    // re-fit text inside a freshly attached group
    function fitIn(g) { for (const [el, max] of [...fits]) if (g.contains(el)) fit(el, max); }
    function setLifted(id) {
      lifted = id;
      for (const k in cards) {
        cards[k].g.classList.toggle('up', k === id);
        cards[k].g.setAttribute('aria-pressed', String(k === id));
      }
      root.classList.toggle('gn-armed', !!id);
    }

    // --- ink
    function renderInk() {
      inkG.innerHTML = '';
      h('text', { class: 'gn-t-label', x: 52, y: 392 }, inkG, 'INK');
      for (let i = 0; i < NIGHTS[ni].ink; i++) {
        h('circle', { class: 'gn-dot' + (i < ink ? '' : ' spent'), cx: (PHONE ? 128 : 112) + i * 30, cy: 387, r: 9 }, inkG);
      }
      countEl.textContent = `EXPLAINED ${say0(stamped.length)}`;
      fit(countEl, [200, 206]);
    }

    // --- room weather and marks
    function weather(windy) { room.classList.toggle('windy', windy); }
    function showMark(s) {
      L.marks.innerHTML = '';
      const p = PLACES[s.place];
      const g = h('g', { class: 'gn-mark' + (ON_PAPER.has(s.place) ? ' gn-dark' : ''), transform: `translate(${p.x} ${p.y})` }, L.marks);
      h('g', { class: 'gn-sq' }, g).innerHTML = markArt();
      // a sound-word: cut type, lowercase with a stop, tilted a little
      h('text', { class: 'gn-t-snd', x: p.w[0], y: p.w[1], 'text-anchor': p.w[2], transform: `rotate(-3 ${p.w[0]} ${p.w[1]})` }, g, KINDS[s.kind].word);
    }

    // --- the slip
    function field(parent, x, y, cls, anchor, max) {
      const g = h('g', {}, parent);
      const a = h('text', { class: `${cls} gn-fv on`, x, y, 'text-anchor': anchor }, g);
      const b = h('text', { class: `${cls} gn-fv`, x, y, 'text-anchor': anchor }, g);
      return {
        front: a, value: null,
        init(v) { this.value = v; a.textContent = v; fit(a, max); },
        set(v) {
          if (v === this.value) return false;
          this.value = v;
          const nxt = this.front === a ? b : a;
          nxt.textContent = v;
          fit(nxt, max);
          nxt.classList.add('on');
          this.front.classList.remove('on');
          this.front = nxt;
          return true;
        },
      };
    }
    function makeSlip(s, n) {
      const g0 = h('g', { class: 'gn-slip cur', 'data-act': 'slip', role: 'button', tabindex: '0' });
      const g = h('g', { class: 'touch' }, g0);      // its lit edge shows once an excuse is lifted
      h('g', {}, g).innerHTML = litCard(420, 220, 9);
      h('text', { class: 'gn-t-label', x: 26, y: PHONE ? 34 : 40 }, g, `NO. ${n}`);
      const F = {
        time: field(g, 394, PHONE ? 52 : 46, 'gn-t-time', 'end', 140),
        kind: field(g, 26, PHONE ? 108 : 100, 'gn-t-kind', 'start', 368),
        place: field(g, 26, PHONE ? 162 : 166, 'gn-t-field', 'start', 368),
        loud: field(g, 26, PHONE ? 204 : 202, 'gn-t-field', 'start', 250),
      };
      // on phones the remark shares the loudness line, at the right, so the big type keeps its spacing
      if (s.remark) fit(h('text', PHONE ? { class: 'gn-t-remark', x: 394, y: 204, 'text-anchor': 'end' } : { class: 'gn-t-remark', x: 26, y: 130 }, g, s.remark), PHONE ? 262 : 368);
      // a refused stamp: the lamp behind the slip gutters for a moment
      const smudge = h('rect', { class: 'gn-smudge', x: 9, y: 9, width: 402, height: 202 }, g);
      // the stamp: a black ribbon, its word cut out of it so the lamp shows through
      const imp = h('g', { class: 'gn-imp', transform: PHONE ? 'translate(210 124) rotate(-8) scale(1.4)' : 'translate(252 128) rotate(-8)' }, g);
      imp.innerHTML = cutG(`<path d="M-140 -40H140V40H-140Z"/>` + C.scallops(-133, 133, -40, 2.4, 7.4) + C.scallops(-133, 133, 40, 2.4, 7.4) +
        C.curl(-139, 0, PI + .1, 20, -.6, 8, .6, 24) + C.curl(139, 0, -.1, 20, .6, 8, .6, 24)) +
        `<path d="M-126 -31H126M-126 33H126" style="fill:none;stroke:var(--sh-lamp);stroke-width:.8;opacity:.6"/>`;
      h('text', { class: 'gn-t-stamp', x: 0, y: 6, 'text-anchor': 'middle' }, imp, 'EXPLAINED');
      const impBy = h('text', { class: 'gn-t-stampby', x: 0, y: 28, 'text-anchor': 'middle' }, imp);
      return { s, el: g0, F, imp, impBy, smudge };
    }
    function slipLabel(s, n) {
      return `Slip ${n}: ${KINDS[s.kind].label}${s.remark ? ', ' + s.remark : ''}, ${PLACES[s.place].label}, ${s.loud}, ${s.time}.`;
    }

    // What the slip says with this card lifted (the third night agrees with you).
    function display(card) {
      const s = cur.s, night = NIGHTS[ni];
      const disp = { kind: s.kind, place: s.place, loud: s.loud };
      const swaps = [];
      if (night.agree && card) {
        for (const f of fails(s, card, night)) {
          const v = CARDS[card].agree[f.field];
          if (v && disp[f.field] !== v) { swaps.push({ field: f.field, from: s[f.field], to: v }); disp[f.field] = v; }
        }
      }
      let changed = false;
      changed = cur.F.kind.set(KINDS[disp.kind].label) || changed;
      changed = cur.F.place.set(PLACES[disp.place].label) || changed;
      changed = cur.F.loud.set(disp.loud) || changed;
      return { swaps, changed };
    }

    // --- sound-words
    function boom(text, x, y, rot = 4) {
      L.fx.innerHTML = '';
      const t = h('text', { class: 'gn-t-boom gn-boom', x, y, transform: `rotate(${rot} ${x} ${y})`, 'text-anchor': 'middle' }, L.fx, text);
      if (!RM) later(() => t.classList.add('off'), 900);
    }

    // --- flow
    function setupNight(i, holdCards) {
      ni = i; si = 0;
      const n = NIGHTS[i];
      ink = n.ink;
      nightEl.textContent = n.name.toUpperCase();
      ruleEl.textContent = n.rule;
      fit(ruleEl, [560, 520]);
      renderInk();
      if (!holdCards) layoutCards(n.cards, false);
    }

    function deal() {
      const night = NIGHTS[ni], s = night.slips[si];
      no += 1;
      bounces = 0;
      setLifted(null);
      back.classList.remove('beckon');
      if (RM) L.fx.innerHTML = '';
      cur = makeSlip(s, no);
      cur.el.setAttribute('aria-label', slipLabel(s, no) + ' Lift an excuse, then tap to stamp.');
      cur.F.time.init(s.time);
      cur.F.kind.init(KINDS[s.kind].label);
      cur.F.place.init(PLACES[s.place].label);
      cur.F.loud.init(s.loud);
      // slides in under the bedroom door
      cur.el.style.transform = 'translate(684px, 176px) scale(.16) rotate(-8deg)';
      cur.el.style.opacity = '0';
      L.slips.appendChild(cur.el);
      fitIn(cur.el);
      cur.el.getBoundingClientRect();
      cur.el.style.transform = 'translate(270px, 242px) scale(1) rotate(0deg)';
      cur.el.style.opacity = '1';
      weather(windAt(night, s.time));
      later(() => showMark(s), dur(260));
      if (si === 0) say(night.open);
      if (ink === 0) {
        say('The pad is dry.');
        back.classList.add('beckon');
      }
      later(() => { busy = false; }, dur(420));
    }

    function lift(id) {
      if (busy || phase !== 'play' || !cards[id] || !NIGHTS[ni].cards.includes(id)) return;
      if (lifted === id) { lower(); return; }
      setLifted(id);
      const c = CARDS[id];
      const { changed } = display(id);
      if (NIGHTS[ni].agree && changed) {
        say('Quite so.');
      } else {
        say(`${c.title}: ${c.gloss}.` + (everLifted || everStamped ? '' : ' Now stamp the slip.'));
      }
      everLifted = true;
    }

    function lower() {
      if (!lifted) return;
      setLifted(null);
      if (cur) display(null);
    }

    function stamp() {
      if (busy || phase !== 'play' || !cur) return;
      const night = NIGHTS[ni];
      if (!lifted) {
        say('Lift an excuse first: tap a card below.');
        for (const id of night.cards) {
          cards[id].g.classList.add('nudge');
          later(() => cards[id] && cards[id].g.classList.remove('nudge'), 320);
        }
        return;
      }
      if (ink <= 0) {
        say('The pad is dry. It goes on the back page.');
        back.classList.add('beckon');
        return;
      }
      const f = night.agree ? [] : fails(cur.s, lifted, night);
      if (f.length) { bounce(f[0].note); return; }
      explain();
    }

    function bounce(note) {
      bounces += 1;
      const sm = cur.smudge;
      sm.classList.add('on');
      sm.getBoundingClientRect();
      later(() => sm.classList.remove('on'), RM ? 300 : 30);
      lower();
      if (bounces >= 2) {
        say(note + ' Or leave it unaccounted for.');
        back.classList.add('beckon');
      } else {
        say(note);
      }
    }

    function explain() {
      busy = true;
      const night = NIGHTS[ni];
      const card = lifted;
      const { swaps } = display(card);
      ink -= 1;
      stamped.push({ no, s: cur.s, card, swaps });
      if (cur.s.stair) stairResult = card;
      everStamped = true;
      cur.impBy.textContent = CARDS[card].title.replace(/^The /, 'the ');
      cur.imp.classList.add('on');
      boom('THUNK.', 596, 448, -4);
      say(night.agree ? 'Quite so.' : 'Explained.');
      renderInk();
      const el = cur.el;
      el.classList.remove('cur');
      el.removeAttribute('data-act');
      el.removeAttribute('tabindex');
      el.removeAttribute('role');
      untouch(el);
      setLifted(null);
      L.marks.innerHTML = '';
      later(() => {
        const j = (piled * 37) % 7 - 3;
        el.style.transform = `translate(${52 + j}px, ${250 + Math.min(piled, 6) * 3}px) scale(.42) rotate(${j * .8}deg)`;
        piled += 1;
        next();
      }, dur(720) || 380);
    }

    function setAside() {
      if (busy || phase !== 'play' || !cur) return;
      busy = true;
      if (lifted) { setLifted(null); }
      const s = cur.s, el = cur.el;
      display(null);
      aside.push({ no, s });
      if (s.stair) stairResult = 'unexplained';
      el.classList.remove('cur');
      el.removeAttribute('data-act');
      untouch(el);
      el.style.transform = 'translate(744px, 300px) scale(.3) rotate(4deg)';
      el.style.opacity = '0';
      back.classList.remove('beckon');
      L.marks.innerHTML = '';
      say('Unaccounted for.');
      later(() => el.remove(), dur(650) + 20);
      later(() => { renderEntries(true); next(); }, dur(380));
    }

    function renderEntries(fresh) {
      entriesG.innerHTML = '';
      backHint.style.display = aside.length ? 'none' : '';
      const n = aside.length;
      const lh = PHONE ? Math.min(32, 140 / Math.max(n, 1)) : Math.min(25, 150 / Math.max(n, 1));
      const fs = PHONE ? Math.min(27, lh * 0.84) : Math.min(18, lh * 0.78);
      aside.forEach((a, i) => {
        const t = h('text', { class: 'gn-t-entry gn-entry' + (fresh && i === n - 1 ? '' : ' on'),
          x: 16, y: 70 + i * lh, style: `font-size:${fs}px` }, entriesG, '— ' + words(a.s));
        fit(t, 178);
        if (fresh && i === n - 1) { t.getBoundingClientRect(); t.classList.add('on'); }
      });
    }

    function next() {
      cur = null;
      si += 1;
      const night = NIGHTS[ni];
      if (si < night.slips.length) {
        later(deal, dur(380));
      } else if (ni < NIGHTS.length - 1) {
        later(() => nightCard(ni + 1), dur(650) + 150);
      } else {
        later(reveal, dur(800) + 200);
      }
    }

    function nightCard(i) {
      busy = true;
      const n = NIGHTS[i];
      L.nc.innerHTML = '';
      const g = h('g', { class: 'gn-nc' }, L.nc);
      // the iris: a black stage with a lace-edged hole closes on the room, the intertitle holds, it opens
      const ir = h('path', { class: 'sh-iris', 'fill-rule': 'evenodd', d: C.irisD(480, 320, RM ? 0 : 300), style: 'fill:var(--sh-cut)' }, g);
      h('path', { class: 'gn-nc-rule gn-nc-t', d: PHONE ? 'M170 250H790M170 394H790' : 'M300 262H660M300 386H660' }, g);
      h('text', { class: 'gn-t-inter gn-nc-t', x: 480, y: 312, 'text-anchor': 'middle' }, g, n.name + '.');
      h('text', { class: 'gn-t-interrule gn-nc-t', x: 480, y: 364, 'text-anchor': 'middle' }, g, n.rule);
      g.getBoundingClientRect();
      g.classList.add('on');
      if (!RM) C.runIris(ir, 480, 320, 300, 0, 320);
      L.fx.innerHTML = '';
      later(() => setupNight(i, true), dur(320));
      later(() => {
        g.classList.remove('on');
        if (!RM) C.runIris(ir, 480, 320, 0, 600, 320);
        layoutCards(n.cards, true);   // a new excuse slides in, if there is one
        later(() => { L.nc.innerHTML = ''; deal(); }, dur(320));
      }, dur(320) + 1200);
    }

    // --- the reveal: persuaded slips come back, corrected in red
    function reveal() {
      phase = 'reveal';
      busy = true;
      setLifted(null);
      L.marks.innerHTML = '';
      L.fx.innerHTML = '';
      back.classList.remove('beckon');
      for (const id in cards) {
        cards[id].g.style.transform = `translate(${cards[id].x}px, 720px)`;
        cards[id].g.style.opacity = '0';
      }
      for (const el of L.slips.children) { el.classList.add('gn-fade'); el.style.opacity = '0'; }
      L.left.classList.add('gn-fade');
      back.removeAttribute('data-act');
      back.removeAttribute('tabindex');
      backTouch.setAttribute('aria-disabled', 'true');
      weather(true);
      route.innerHTML = ROUTE;
      route.getBoundingClientRect();
      later(() => route.classList.add('on'), dur(400));

      const persuaded = stamped.filter(r => r.swaps.length);
      const k = persuaded.length, n = stamped.length, m = aside.length;
      const note = k ? 'The evidence agreed with me throughout.' : 'The evidence declined to agree with me.';
      say(note);
      ruleEl.textContent = '';

      const wrap = h('g', {}, L.reveal);
      const blocks = [];
      let y = 0;
      if (k) {
        for (const r of persuaded) {
          const b = h('g', { class: 'gn-rv-slip', transform: `translate(0 ${y})` }, wrap);
          const RS = PHONE ? 46 : 36, R0 = PHONE ? 70 : 60;
          const H = (PHONE ? 50 : 38) + r.swaps.length * RS;
          h('g', {}, b).innerHTML = ribbon(640, H);
          h('text', { class: 'gn-t-label', x: 20, y: 25 }, b, `NO. ${r.no} · EXPLAINED · ${CARDS[r.card].title.toUpperCase()}`);
          const reds = [];
          const order = { kind: 0, place: 1, loud: 2 };
          [...r.swaps].sort((a, z) => order[a.field] - order[z.field]).forEach((sw, i) => {
            const ty = R0 + i * RS;
            const t1 = fit(h('text', { class: 'gn-t-borrowed', x: 20, y: ty }, b, fieldLabel(sw.field, sw.to)), 260);
            let w = 0;
            try { w = Math.min(260, t1.getComputedTextLength()); } catch (e) { w = 140; }
            const red = h('g', { class: 'gn-rv-red' }, b);
            h('line', { class: 'gn-strike', x1: 16, y1: ty - (PHONE ? 13 : 9), x2: 24 + w, y2: ty - (PHONE ? 13 : 9) }, red);
            const t2 = h('text', { x: 42 + w, y: ty }, red);
            h('tspan', { class: 'gn-t-say' }, t2, 'say, rather: ');
            h('tspan', { class: 'gn-t-orig' }, t2, fieldLabel(sw.field, sw.from));
            fit(t2, 616 - (42 + w));
            reds.push(red);
          });
          blocks.push({ b, reds });
          y += H + 12;
        }
        const s = Math.min(1, 350 / Math.max(1, y - 12));
        wrap.setAttribute('transform', `translate(44 ${250 + (350 - (y - 12) * s) / 2}) scale(${s})`);
      } else {
        const b = h('g', { class: 'gn-rv-slip', transform: 'translate(364 400)' }, wrap);
        h('text', { class: 'gn-t-borrowed', x: 0, y: 0, 'text-anchor': 'middle' }, b, 'Nothing saw reason.');
        blocks.push({ b, reds: [] });
      }
      let t = dur(500);
      for (const blk of blocks) {
        later(() => blk.b.classList.add('on'), t);
        later(() => blk.reds.forEach(r => r.classList.add('on')), t + dur(450));
        t += dur(420);
      }
      const score = h('text', { class: 'gn-t-score gn-show', x: 922, y: 604, 'text-anchor': 'end' }, L.reveal,
        `NOISES EXPLAINED ${say0(n)} · UNACCOUNTED FOR ${say0(m)} · SAW REASON ${say0(k)}`);
      fit(score, [600, 870]);
      const prompt = h('text', { class: 'gn-t-prompt gn-show', x: 816, y: 500, 'text-anchor': 'middle' }, L.reveal, PHONE ? null : 'Tap to put out the lamp.');
      if (PHONE) { h('tspan', { x: 816 }, prompt, 'Tap to put out'); h('tspan', { x: 816, dy: 38 }, prompt, 'the lamp.'); }
      later(() => score.classList.add('on'), t + dur(300));
      later(() => {
        prompt.classList.add('on');
        phase = 'ready';
        live.textContent = `${note} Noises explained ${say0(n)}, unaccounted for ${say0(m)}, saw reason ${say0(k)}. Tap to put out the lamp.`;
      }, t + dur(900) + 300);
    }

    function finish() {
      if (phase !== 'ready' || doneFired) return;
      phase = 'done';
      doneFired = true;
      const persuaded = stamped.filter(r => r.swaps.length).length;
      const result = {
        won: true,
        score: { 'noises explained': stamped.length, 'unaccounted for': aside.length, 'saw reason': persuaded },
        note: persuaded ? 'The evidence agreed with me throughout.' : 'The evidence declined to agree with me.',
        // the confession's red "say, rather:" lines (optional in the contract)
        rather: {
          'noises explained': `${say0(stamped.length)} of 13`,
          'unaccounted for': 'one route, to my door',
          'saw reason': persuaded ? `${persuaded}, persuaded by me` : 'none; they kept to their story',
        },
      };
      const lamp = h('rect', { class: 'gn-lamp', x: 0, y: 0, width: 960, height: 640 }, L.lamp);
      lamp.getBoundingClientRect();
      lamp.classList.add('on');
      try {
        if (api.setFlag) {
          api.setFlag('nightsUnexplained', aside.map(a => words(a.s)));
          api.setFlag('nightsStair', stairResult);
          api.setFlag('nightsAgreed', persuaded);
        }
      } finally {
        if (api.done) api.done(result);
      }
    }

    // --- input
    function act(el) {
      const a = el.getAttribute('data-act');
      if (a === 'card') lift(el.getAttribute('data-id'));
      else if (a === 'slip') stamp();
      else if (a === 'back') setAside();
    }
    function onClick(e) {
      if (phase === 'ready') { finish(); return; }
      const el = e.target.closest && e.target.closest('[data-act]');
      if (el && root.contains(el)) act(el);
    }
    function onKey(e) {
      if (!alive || e.metaKey || e.ctrlKey || e.altKey) return;
      const ae = document.activeElement;
      if (ae && ae !== document.body && !root.contains(ae)) return;
      const k = e.key;
      if (phase === 'ready') {
        if (k === 'Enter' || k === ' ') { e.preventDefault(); finish(); }
        return;
      }
      if (phase !== 'play') return;
      const target = e.target && e.target.closest && e.target.closest('[data-act]');
      if ((k === 'Enter' || k === ' ') && target && root.contains(target)) { e.preventDefault(); act(target); return; }
      if (/^[1-4]$/.test(k)) { const id = NIGHTS[ni].cards[+k - 1]; if (id) { e.preventDefault(); lift(id); } return; }
      if (k === 'Enter' || k === ' ' || k === 's') { e.preventDefault(); stamp(); return; }
      if (k === 'Backspace' || k === 'a' || k === 'u') { e.preventDefault(); setAside(); return; }
      if (k === 'Escape') lower();
    }
    root.addEventListener('click', onClick);
    window.addEventListener('keydown', onKey);

    // --- phones: re-fit the type when the stage crosses the phone width
    const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(() => {
      const p = root.clientWidth > 0 && root.clientWidth < 600;
      if (p === PHONE || !alive) return;
      PHONE = p;
      root.classList.toggle('gn-phone', p);
      for (const id in cards) drawCard(id, cards[id].lift);
      placeTop();
      renderInk();
      renderEntries(false);
      refit();
    }) : null;
    if (ro) ro.observe(root);

    // --- go
    const start = Math.max(1, Math.min(3, (api.dev && +api.dev.startNight) || 1)) - 1;
    for (let i = 0; i < start; i++) no += NIGHTS[i].slips.length;
    setupNight(start);
    renderEntries(false);
    say(NIGHTS[start].open);
    later(deal, RM ? 150 : 450);

    return () => {
      alive = false;
      if (ro) ro.disconnect();
      for (const id of timers) clearTimeout(id);
      timers.clear();
      root.removeEventListener('click', onClick);
      window.removeEventListener('keydown', onKey);
      root.remove();
    };
  },
};

// A zero score reads as "none" (IM Fell's old-style 0 looks like a letter o).
function say0(n) { return n === 0 ? 'none' : String(n); }

// A slip that has left the desk is no longer touchable: no lit edge.
function untouch(el) { const t = el.querySelector('.touch'); if (t) t.classList.remove('touch'); }

function h(tag, attrs = {}, parent, text) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) if (attrs[k] != null) e.setAttribute(k, attrs[k]);
  if (text != null) e.textContent = text;
  if (parent) parent.appendChild(e);
  return e;
}
