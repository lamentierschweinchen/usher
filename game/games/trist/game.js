// Trist: One of Your Favorite Romances (chapter VI; absorbs the opening of VII).
// You draw Ethelred's blows on a romance cut in black paper against the rain-night.
// Then the page turns over: the blows were Madeline's, clawing out of the vault,
// and the dragon is her brother. Spec: work/design/games/trist.md.
// Contract: work/design/CONTRACT.md. Look: work/design/LOOK.md (Shadow Theatre).
//
// Every figure, door, coffin, tree and backdrop comes from the shared cut library;
// the props it lacks (the hermit's planks, the shield, the arcade, the chair, the
// tongue and the dragon's raised paws) are cut here in the same manner. Mechanics,
// timings, flags and score labels are unchanged from the ink-line build.

import * as C from '../../shared/cuts.js';

const NS = 'http://www.w3.org/2000/svg';
const FLOOR = 372;                              // romance floor line
const DOOR_X = 580, PLANK_W = 35, DOOR_TOP = 136;
const HERO_DOOR = 330, HERO_HALL = 300;
const REST = -40;                               // mace angle at rest
const MACE = 116;                               // shoulder to mace head
// Ethelred is the library's cut, scaled so his mace reaches MACE from the shoulder.
const ES = 4.25, SH_Y = -31 * ES;
const LIB_MACE = Math.atan2(-22.6, -1.6) * 180 / Math.PI;   // the cut's mace points here at hinge 0
// The dragon is the library's cut, facing the hero.
const DS = 2.6, DX0 = 712;
// The tarn's glass under the romance; the scene comes back in it, flipped at the floor.
const GLASS = 414, RFLIP = `matrix(1 0 0 -.6 0 ${GLASS + .6 * FLOOR})`;
const CAP_Y = 422;                              // the caption ribbon, on the glass

const rnd = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;
const ease = k => (k < .5 ? 2 * k * k : 1 - (2 - 2 * k) ** 2 / 2);
const easeOut = k => 1 - (1 - k) ** 2;
const f1 = n => Math.round(n * 10) / 10;
const rad = d => d * Math.PI / 180;
const deg = r => r * 180 / Math.PI;
const pathOf = pts => pts.map((p, i) => (i ? 'L' : 'M') + f1(p[0]) + ' ' + f1(p[1])).join('') + (pts.length === 1 ? 'l.1 0' : '');

// The romance, as Ethelred's book prints it ([u39], [u41], [u43], [u46]).
const CAP = {
  door: ['And Ethelred, mighty withal on account of the wine, uplifted his mace,',
         'and with blows made quickly room in the plankings of the door.'],
  dragon: ['But in the stead thereof, a dragon of a scaly and prodigious demeanor,',
           'and of a fiery tongue, which sate in guard before a palace of gold.'],
  shriek: ['And Ethelred struck upon the head of the dragon, which gave up its breath',
           'with a shriek so horrid and harsh that he had fain to close his ears.'],
  shield: ['And the shield tarried not for his full coming, but fell down at his feet',
           'upon the silver floor, with a mighty great and terrible ringing sound.'],
};

// The same book, corrected in Roderick's phrase ([u48]), and his own lines (VII).
// s: struck romance · r: red correction · l: speaker label · R: red, large
const VCAP = {
  lid:   [['made quickly room in the plankings of the door', 's'], ['say, rather, the rending of her coffin', 'r']],
  door:  [['the death-cry of the dragon', 's'], ['say, rather, the grating of the iron hinges', 'r'], ['of her prison', 'r']],
  arch:  [['the clangor of the shield', 's'], ['say, rather, her struggles within', 'r'], ['the coppered archway of the vault', 'r']],
  heard: [['RODERICK', 'l'], ['I heard her days ago.', 'r']],
  sent:  [['RODERICK', 'l'], ['I sent for you because', 'r'], ['you never hear anything.', 'r']],
  door2: [['RODERICK', 'l'], ['Madman! She now stands', 'R'], ['without the door!', 'R']],
};

// Vault stations: two strokes per obstacle, one per stair. pos = where she
// stands while working it; box = where her gouge lands [cx, cy, w, h].
const RX = i => 660 + i * 48;                   // riser x of stair i
const TOP = i => 580 - (i + 1) * 82;            // tread y of stair i
const COF = { x: 50, y: 556, w: 300 };          // the library coffin, on trestles; side 508–556, lid 484–504
const STATIONS = [
  { k: 'lid', n: 2, pos: null, box: [200, 530, 150, 38], words: [['crack.', 28], ['RIP.', 40]], echo: ['…cracked,', '…and ripped,'], cap: 'lid' },
  { k: 'door', n: 2, pos: [372, 580], box: [445, 488, 46, 120], words: [['grate.', 28], ['GRATE.', 40]], echo: ['…a death-cry,', '…harsh, protracted,'], cap: 'door' },
  { k: 'arch', n: 2, pos: [500, 580], box: [580, 510, 46, 96], words: [['scrape.', 28], ['CLANG.', 40]], echo: ['…a clangour,', '…a ringing,'], cap: 'arch' },
  ...[0, 1, 2, 3, 4].map(i => ({
    k: 'stair', i, n: 1,
    pos: i === 0 ? [622, 580] : [RX(i - 1) + 24, TOP(i - 1)],
    box: [RX(i) + 24, TOP(i) + 41, 30, 50],
    words: [['step.', 22]], echo: [], cap: i < 2 ? 'heard' : 'sent',
  })),
];
const LANDING = [888, 170];

const CSS = `
.g-trist{position:relative;width:100%;height:100%;overflow:hidden;user-select:none;-webkit-user-select:none;
  background:var(--sh-cut,#0b0809);color:var(--sh-cut,#0b0809);
  --g-trist-cutlight:#fbe3a6;--g-trist-rain:#e9e0ff}
.g-trist svg{display:block;width:100%;height:100%;touch-action:none;cursor:crosshair}
.g-trist text{font-family:var(--sh-serif,'IM Fell English',Georgia,serif)}
.g-trist .teach{font-size:26px;font-style:italic;fill:var(--sh-paper,#ede2cb)}
.g-trist .cap{font-style:italic;fill:var(--sh-paper,#ede2cb)}
.g-trist .say{font-size:21px;font-style:italic;fill:var(--sh-lamp,#f7d894)}
.g-trist.in-hall .say{fill:var(--sh-cut,#0b0809)}
.g-trist .vcap text{font-size:21px;font-style:italic}
.g-trist .vcap .s{fill:var(--sh-paper,#ede2cb);opacity:.55;text-decoration:line-through}
.g-trist .vcap .r{fill:var(--sh-red,#e0392b)}
.g-trist .vcap .R{fill:var(--sh-red,#e0392b);font-size:28px}
.g-trist .vcap .l{font-style:normal;font-size:14px;letter-spacing:.2em;fill:var(--sh-speaker,#d79a6a)}
.g-trist .lab{font-size:17px;letter-spacing:.16em;fill:var(--sh-lamp,#f7d894)}
.g-trist .snd{font-style:italic;fill:var(--sh-cut,#0b0809)}
.g-trist .snd.truth{fill:var(--sh-red,#e0392b)}
.g-trist .snd.paper{fill:var(--sh-gauze,#f6ead2)}
.g-trist .snd.muted{opacity:.6}
.g-trist .end-line{font-size:22px;font-style:italic;fill:var(--sh-paper,#ede2cb)}
.g-trist .lit-room{fill:var(--lit,url(#sh-room-gal))}
.g-trist .copper{fill:none;stroke:var(--sh-copper,#b97a4c);stroke-width:1.6;stroke-linecap:round;opacity:.85}
.g-trist .rain-l{stroke:var(--g-trist-rain);stroke-width:.9;stroke-linecap:round;opacity:.34}
.g-trist .hint{fill:none;stroke:var(--sh-paper,#ede2cb);stroke-width:4.2;stroke-dasharray:.1 11;stroke-linecap:round;opacity:.9;transition:opacity .6s}
.g-trist .stroke{fill:none;stroke-width:3.4;stroke-linecap:round;stroke-linejoin:round;opacity:.9}
.g-trist .stroke.ink{stroke:var(--g-trist-cutlight)}
.g-trist .stroke.paper{stroke:var(--sh-gauze,#f6ead2)}
.g-trist .gouge-p{fill:none;stroke:var(--sh-gauze,#f6ead2);stroke-width:3;stroke-linecap:round;stroke-linejoin:round}
.g-trist .gouge-t{fill:none;stroke:var(--sh-red,#e0392b);stroke-width:3.2;stroke-linecap:round;stroke-linejoin:round}
.g-trist .gouge-white{fill:none;stroke:var(--sh-gauze,#f6ead2);stroke-width:9;stroke-linecap:round;stroke-linejoin:round}
.g-trist .scratch{fill:none;stroke:var(--sh-red,#e0392b);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;opacity:.9}
.g-trist .smudge{fill:var(--sh-paper,#ede2cb);opacity:.4}
.g-trist .tally{fill:none;stroke-width:1.8;stroke-linecap:round}
.g-trist .tally.rule{stroke:var(--sh-lamp,#f7d894);opacity:.85}
.g-trist .tally.paper{stroke:var(--sh-gauze,#f6ead2);opacity:.8}
.g-trist .vborder{fill:none;stroke:var(--sh-lamp,#f7d894);stroke-linejoin:round;opacity:.5}
.g-trist .streak{stroke:var(--sh-gauze,#f6ead2);stroke-width:1.6;stroke-linecap:round}
.g-trist .heart{fill:var(--sh-red,#e0392b)}
.g-trist .blk-r{fill:var(--sh-cut,#0b0809)}
.g-trist .stairtex{display:none}
/* phones: type the eye can read at 390 px */
.g-trist.is-narrow .teach{font-size:40px}
.g-trist.is-narrow .say{font-size:32px}
.g-trist.is-narrow .vcap text{font-size:30px}
.g-trist.is-narrow .vcap .R{font-size:38px}
.g-trist.is-narrow .vcap .l{font-size:20px}
.g-trist.is-narrow .lab{font-size:26px}
.g-trist.is-narrow .end-line{font-size:32px}
.g-trist.is-narrow .tally{stroke-width:2.6}
.g-trist.is-narrow .hint{stroke-width:6;stroke-dasharray:.1 14}
.g-trist.is-narrow .stroke{stroke-width:5}
`;

// Inline styles for anything inside #gt-scene: the tarn's <use> clone keeps them.
const FIRE = 'style="fill:var(--lit,url(#gt-fire))"';
const GLINT = (w, o) => `style="fill:none;stroke:var(--lit,#f7d894);stroke-width:${w};stroke-linecap:round;opacity:${o}"`;
const THREAD = w => `style="fill:none;stroke:currentColor;stroke-width:${w};stroke-linecap:round"`;
const GOUGE = 'fill:none;stroke:var(--lit,#fbe3a6);stroke-width:3.4;stroke-linecap:round;stroke-linejoin:round';

const HEART = 'M0 4C-7-1-7-7-3.5-8C-1.5-8.6 0-7 0-5.5C0-7 1.5-8.6 3.5-8C7-7 7-1 0 4Z';

/* ---------- props the library lacks, cut in its manner ---------- */
// The hermit's door: a wall of black thatch, the lit doorway the planks are laid over.
function hutCut() {
  return `<path d="M520 112H960V${FLOOR}H520Z"/>
<rect x="577" ${FIRE} y="131" width="216" height="${FLOOR - 131}"/>
<path d="M556 116H581V${FLOOR}H556ZM789 116H814V${FLOOR}H789Z"/>
<path d="M496 120L534 84H960V120Z"/>${C.fringe(498, 946, 119, { seed: 9, len: [5, 15], step: 4.6, w: 2 })}
<path d="M845 198h44v58h-44z" ${FIRE}/><path d="M865.6 198h2.8v58h-2.8zM845 225.6h44v2.8h-44z"/>
${C.curl(845, 198, -Math.PI / 2 - .5, 16, -.8, 3, .4)}${C.curl(889, 198, -Math.PI / 2 + .5, 16, .8, 3, .4)}`;
}
// Ethelred's flagon, at the foot of the door.
const flagonCut = () =>
  `<path d="M232 ${FLOOR}c-4-10-4-20 2-26v-6h10v6c6 6 6 16 2 26z"/><path d="M246 ${FLOOR - 22}c8 0 8 12 0 12" ${THREAD(2.6)}/>`;
// The palace hall: a lit wall behind a black arcade, a lace fringe under the beam.
function hallCut() {
  const holes = [71, 233].map(x => C.lancetD(x, 112, 150, 88)).join('');
  const caps = [227, 389].map(x => `<path d="M${x - 14} 200h28v6h-28z"/>${C.curl(x - 14, 203, Math.PI + .3, 14, -.9, 3, .4)}${C.curl(x + 14, 203, -.3, 14, .9, 3, .4)}`).join('');
  return `<rect style="fill:var(--lit,url(#gt-hall))" x="14" y="86" width="932" height="${FLOOR - 86}"/>
<path fill-rule="evenodd" d="M14 104H395V200H14Z${holes}"/>
<path d="M14 104H71V${FLOOR}H14ZM221 200H233V${FLOOR}H221ZM383 200H395V${FLOOR}H383Z"/>${caps}
<path d="M14 86H946V105H14Z"/>${C.fringe(395, 946, 104, { seed: 15, len: [4, 12], step: 4.4 })}
<path d="M470 104V162" style="fill:none;stroke:currentColor;stroke-width:1.8;stroke-dasharray:4 2.4"/>`;
}
function shieldCut() {
  let rim = '';
  for (let k = 0; k < 30; k++) { const a = k * Math.PI / 15; rim += `<circle cx="${f1(Math.cos(a) * 34)}" cy="${f1(Math.sin(a) * 34)}" r="2.3"/>`; }
  return `<g class="shield" transform="translate(470 196)"><circle r="34"/>${rim}
<circle r="23.5" ${GLINT(1.3, .75)}/><path d="M-15-7H15M-13 7H13" ${GLINT(1, .6)}/><circle r="4.4" style="fill:var(--lit,#f7d894)"/></g>`;
}
// The dragon's forepaws over its ears, cut in the dragon's own (native, facing-right) units.
function pawsCut() {
  const paw = (x, y, a, len, k) => {
    const p = C.walk(x, y, a, len, 0, k, 14), e = p[p.length - 1], q = p[p.length - 2];
    const h = Math.atan2(e[1] - q[1], e[0] - q[0]);
    return `<path d="${C.taper(p, 5.4, 2.6)}"/>` + C.curl(e[0], e[1], h + .4, 6, 1, 2.2, .4, 12) + C.curl(e[0], e[1], h - .5, 5, -1, 1.8, .4, 12);
  };
  return `<g class="gt-paws" style="display:none">${paw(44, -16, -.8, 44, -.08)}${paw(38, -14, -1.15, 42, -.06)}</g>`;
}
// The reader's book, and Roderick's high chair with its footstool (chair-local; he faces +x).
const bookCut = (x, y) => `<path d="M${x - 12} ${y + 3}l12-5 12 5v3l-12-4-12 4z"/><path d="M${x - 11} ${y + 2.4}l11-4.4 11 4.4" ${GLINT(.9, .8)}/>`;
function chairCut() {
  return `<path d="M-21 0V-120h5V-34H14v6h-3V0H7.6V-28H-16V0Z"/>${C.curl(-18.5, -120, -Math.PI / 2 - .4, 16, -.9, 3.4, .4)}${C.curl(-18.5, -120, -Math.PI / 2 + .5, 13, .9, 2.6, .4)}
<path d="M52 -30H80V-25H77V0H74V-25H58V0H55V-25H52Z"/>${C.scallops(54, 78, -24.6, 1.2, 4)}`;
}
// The iron door's pier, the coppered archway with its bars, the vault stair.
const pierCut = () => `<path d="M398 186H636V392H398Z"/>`;
const archCut = () => `<path fill-rule="evenodd" d="M524 390H636V580H524ZM540 580V470A40 40 0 0 1 620 470V580Z"/>`;
const barsCut = () => `<path d="M550 438h4v142h-4zM564 432h4v148h-4zM578 430h4v150h-4zM592 432h4v148h-4zM606 438h4v142h-4zM541 498h78v3.6h-78zM541 550h78v3.6h-78z"/>`;
const stairCut = () => `<path d="M660 580V${TOP(0)}H${RX(1)}V${TOP(1)}H${RX(2)}V${TOP(2)}H${RX(3)}V${TOP(3)}H${RX(4)}V${TOP(4)}H946V580Z"/>`;
const ebony = open => C.door('ebony', { x: 786, y: 70, w: 28, h: 100, open });

function svgMarkup() {
  const rainD = 'M8 2l-3 13M33 17l-3 13M21 27l-3 13M44 6l-3 11';
  return `
<svg viewBox="0 0 960 640" xmlns="${NS}" role="img" aria-label="One of Your Favorite Romances. Draw the blow.">
${C.defs({ animate: false })}
<defs>
  <radialGradient id="gt-fire" cx=".5" cy=".72" r=".8"><stop offset="0" stop-color="#ffe9b5"/><stop offset=".55" stop-color="#f2b866"/><stop offset="1" stop-color="#b56a4c"/></radialGradient>
  <radialGradient id="gt-hall" cx=".55" cy=".62" r=".75"><stop offset="0" stop-color="#fff0c2"/><stop offset=".5" stop-color="#f2c06e"/><stop offset="1" stop-color="#c0814a"/></radialGradient>
  <radialGradient id="gt-glow" gradientUnits="userSpaceOnUse" cx="470" cy="300" r="400"><stop offset="0" stop-color="#e6ddf2" stop-opacity=".62"/><stop offset=".5" stop-color="#c8bce0" stop-opacity=".3"/><stop offset="1" stop-color="#c8bce0" stop-opacity="0"/></radialGradient>
  <radialGradient id="gt-well" gradientUnits="userSpaceOnUse" cx="860" cy="170" r="360"><stop offset="0" stop-color="#f2b866" stop-opacity=".42"/><stop offset=".55" stop-color="#b97a4c" stop-opacity=".14"/><stop offset="1" stop-color="#b97a4c" stop-opacity="0"/></radialGradient>
  <pattern id="gt-rain" width="46" height="40" patternUnits="userSpaceOnUse"><path class="rain-l" d="${rainD}"/></pattern>
  <clipPath id="gt-clip"><rect x="14" y="86" width="932" height="${FLOOR - 86}"/></clipPath>
  <clipPath id="gt-band"><rect x="0" y="${GLASS}" width="960" height="${640 - GLASS}"/></clipPath>
  <clipPath id="gt-shriek" clipPathUnits="userSpaceOnUse"><rect class="shriek-r" x="0" y="80" width="0" height="120"/></clipPath>
</defs>
<rect width="960" height="640" class="blk-r"/>
<g class="flip">

<!-- ═════ The romance: black paper against the rain-night ═════ -->
<g class="rom">
  ${C.backdrop('trist', { h: FLOOR })}
  <rect x="0" y="0" width="960" height="${FLOOR}" fill="url(#gt-glow)"/>
  <g clip-path="url(#gt-clip)"><rect class="rain" x="14" y="46" width="932" height="${FLOOR - 46}" fill="url(#gt-rain)"/></g>
  <g style="color:var(--sh-cut)">
    <g id="gt-scene" clip-path="url(#gt-clip)" fill="currentColor">
      <g class="hall" transform="translate(0 -340)">
        ${hallCut()}${shieldCut()}
        ${C.figure('dragon', { x: DX0, y: FLOOR, scale: DS, flip: true, cls: 'gt-dragon' })}
        <path class="gt-tongue" style="display:none"/>
      </g>
      <g class="doorflat">
        ${C.tree(52, FLOOR, { h: 206, seed: 7, crown: 86, w: 6.6, lean: -.03, trunk: 'cut' })}
        ${C.sedges(14, 516, FLOOR, { count: 44, h: [8, 24], seed: 12 })}
        ${flagonCut()}
        ${hutCut()}
        <g class="planks"></g>
        <path class="hint" style="fill:none" d="M432 168Q548 84 648 214"/>
      </g>
      ${C.figure('ethelred', { x: HERO_DOOR, y: FLOOR, scale: ES, cls: 'gt-hero' })}
    </g>
  </g>
  <g class="fx"></g>
  <rect x="0" y="${FLOOR}" width="960" height="${GLASS - FLOOR}" class="blk-r"/>
  ${C.glass('trist', { y: GLASS, h: 640 - GLASS })}
  <g clip-path="url(#gt-band)">${C.returned('<use href="#gt-scene"/>', { still: true, transform: RFLIP })}</g>
  <g class="capband"></g>
  <g class="speech"></g>
  <text class="teach rom-teach" x="48" y="62">Draw the blow.</text>
  <g class="echo"></g>
  <g class="tally1"></g>
  <text class="lab tl1" x="912" y="606" text-anchor="end">BLOWS STRUCK 0</text>
</g>

<!-- ═════ The page turned over: the vault, and the room above it ═════ -->
<g class="vlt" style="display:none">
  ${C.backdrop('vault', { h: 580, clouds: false, hills: false })}
  <rect x="0" y="0" width="960" height="580" fill="url(#gt-well)"/>
  <rect class="lit-room" x="536" y="36" width="280" height="134"/>
  <g style="color:var(--sh-cut)" fill="currentColor">
    <path d="M656 170h8v-3h-3V124h-2v43h-3z"/><path d="M648 126h24l-6-16h-12z"/><ellipse cx="660" cy="129" rx="7" ry="2.6" style="fill:#fff3d0"/>
    ${C.figure('guest', { x: 600, y: 170, scale: 2.3, cls: 'gt-reader' })}${bookCut(630, 120)}
    <g class="rod" transform="translate(720 170) scale(-1 1)">${chairCut()}${C.figure('roderick', { x: 0, y: -30, scale: 2.4, pose: 'sit', cls: 'gt-rod' })}</g>
    <g class="rdoor">${ebony(0)}</g>
    <path d="M32 170H816V186H32Z"/>
    ${pierCut()}
    <g class="idoor">${C.door('iron', { x: 410, y: 396, w: 70, h: 184 })}<g class="idmarks"></g></g>
    ${archCut()}<path class="copper"/>
    <g class="bars">${barsCut()}<g class="armarks"></g></g>
    ${stairCut()}<path class="stairtex"/>
    <g class="stmarks"></g>
    ${C.coffin({ x: COF.x, y: COF.y, w: COF.w, trestles: true })}
    <path d="M14 580H946V626H14Z"/>
  </g>
  <g class="lidmarks"></g>
  <path class="heart lidheart" d="${HEART}" transform="translate(200 494) scale(1.8)"/>
  <text class="teach vteach" x="48" y="62"></text>
  <g class="vcap"></g>
  <g class="recho"></g>
  <path class="vborder" d="M40 178H820V40H920V600H40Z" style="stroke-width:1.5"/>
  <g class="tally2"></g>
  <g class="scratches"></g>
  ${C.figure('madeline', { x: 372, y: 580, scale: 2.3, heart: true, faint: false, cls: 'mad', attrs: 'style="opacity:0" filter="url(#sh-glow)"' })}
  <path class="hint vhint" style="opacity:0" d="M870 96Q836 46 806 104"/>
  <g class="vfx"></g>
  <g class="gust"></g>
  <text class="lab tl2" x="904" y="588" text-anchor="end">BLOWS STRUCK 0</text>
  <g class="blk" style="display:none"><rect x="0" y="0" width="960" height="640" class="blk-r"/></g>
</g>
</g>
<g class="ink"></g>
<g class="meas" style="visibility:hidden" aria-hidden="true"><text x="-999" y="-999"></text></g>
${C.frame()}
</svg>`;
}

function el(tag, attrs, parent) {
  const n = document.createElementNS(NS, tag);
  if (attrs) for (const k in attrs) n.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(n);
  return n;
}

// Fit a polyline into a box, keeping its shape; never enlarge past maxS.
function fit(pts, cx, cy, w, h, maxS = 1) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [x, y] of pts) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  const bw = Math.max(1, x1 - x0), bh = Math.max(1, y1 - y0);
  const s = Math.min(maxS, w / bw, h / bh);
  const mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
  return pts.map(([x, y]) => [cx + (x - mx) * s, cy + (y - my) * s]);
}

export default {
  id: 'trist',
  title: 'One of Your Favorite Romances',

  mount(stage, api = {}) {
    const RM = !!api.reducedMotion;
    let alive = true, finished = false, raf = 0;
    const timers = new Set();
    const later = (ms, fn) => {
      const id = setTimeout(() => { timers.delete(id); if (alive) fn(); }, ms);
      timers.add(id);
      return id;
    };
    const cancel = id => { clearTimeout(id); timers.delete(id); };

    C.autoLace();                                 // lace density is decided before the cuts are made
    const root = document.createElement('div');
    root.className = 'g-trist' + (RM ? ' sh-still' : '');
    root.innerHTML = `<style>${CSS}</style>${svgMarkup()}`;
    stage.appendChild(root);
    const svg = root.querySelector('svg');
    const q = s => svg.querySelector(s);
    if (RM && svg.pauseAnimations) svg.pauseAnimations();

    const flipG = q('.flip'), rom = q('.rom'), vlt = q('.vlt'), inkL = q('.ink');
    const hero = q('.gt-hero'), heroPose = hero.querySelector('.sh-pose'), fx = q('.fx'), speechG = q('.speech');
    const echoG = q('.echo'), rain = q('.rain'), doorFlat = q('.doorflat'), hall = q('.hall');
    const dragon = q('.gt-dragon'), dPose = dragon.querySelector('.sh-pose'), tongue = q('.gt-tongue');
    dPose.firstElementChild.insertAdjacentHTML('beforeend', pawsCut());
    const paws = dragon.querySelector('.gt-paws'), libTongue = dragon.querySelector('.sh-jaw').children[1];
    const shield = q('.shield'), romTeach = q('.rom-teach'), capG = q('.capband');
    const doorHints = [...doorFlat.querySelectorAll('.hint')];

    // ── phones: larger type, rewrapped ─────────────────────────────────────
    let narrow = false;
    const TS = () => (narrow ? 1.38 : 1);
    const meas = q('.meas text');
    function textW(t, size, italic = true) {
      meas.style.fontSize = size + 'px';
      meas.style.fontStyle = italic ? 'italic' : 'normal';
      meas.textContent = t;
      try { return meas.getComputedTextLength(); } catch (_) { return t.length * size * .42; }
    }
    function wrap(text, size, maxW, italic) {
      const total = textW(text, size, italic);
      if (total <= maxW) return [text];
      const lim = Math.min(maxW, total / Math.ceil(total / maxW) * 1.12);   // balanced lines, no orphans
      const out = [];
      let cur = '';
      for (const w of text.split(' ')) {
        const t = cur ? cur + ' ' + w : w;
        if (cur && textW(t, size, italic) > lim) { out.push(cur); cur = w; } else cur = t;
      }
      if (cur) out.push(cur);
      return out;
    }

    // ── tweens: one rAF loop drives everything ─────────────────────────────
    const tweens = new Set();
    function tween(dur, fn, done) {
      if (dur <= 0) { fn(1); if (done) done(); return null; }
      const tw = { t0: performance.now(), dur, fn, done };
      tweens.add(tw);
      return tw;
    }

    // ── shared state ───────────────────────────────────────────────────────
    let phase = 'door';           // door → toDragon → dragon → freeze → flip → replay → vault → threshold → end
    let blows = 0;
    let heroX = HERO_DOOR, heroBase = HERO_DOOR, armA = REST, swayA = 0, frozen = false;
    let lungeId = 0, lungeTw = null;
    let lastStrokeAt = performance.now() - 8000;
    let transient = [];           // reduced motion: sound-words stay until the next action

    // ── type ───────────────────────────────────────────────────────────────
    function word(parent, x, y, text, size, cls = '', rot = rnd(-4, 4), hold = 900) {
      const t = el('text', { x: 0, y: 0, 'text-anchor': 'middle', class: 'snd ' + cls, transform: `translate(${f1(x)} ${f1(y)}) rotate(${f1(rot)})` }, parent);
      t.style.fontSize = f1(size * TS()) + 'px';
      t.textContent = text;
      if (RM) { transient.push(t); return t; }
      later(hold, () => { t.style.transition = 'opacity .6s'; t.style.opacity = '0'; later(650, () => t.remove()); });
      return t;
    }
    function clearTransient() { transient.forEach(t => t.remove()); transient = []; }
    // Her noise, upside down and red in the glass, a beat before your blow.
    function echo(text) { word(echoG, rnd(110, 640), 548, text, 30, 'truth', 180 + rnd(-4, 4)); }
    function speak(x, y, text, ms = 2400, maxW = 860) {
      let size = narrow ? 32 : 21, lines = [text];
      if (narrow && textW(text, size) > maxW) {
        if (textW(text, 27) <= maxW) size = 27; else lines = wrap(text, size, maxW, true);
      }
      const hw = Math.max(...lines.map(l => textW(l, size))) / 2;
      const cx = f1(clamp(x, 64 + hw, 896 - hw));
      const t = el('text', { x: cx, y, 'text-anchor': 'middle', class: 'say' }, speechG);
      t.style.fontSize = size + 'px';
      lines.forEach((l, i) => { el('tspan', { x: cx, dy: i ? f1(size * 1.15) : 0 }, t).textContent = l; });
      later(ms, () => { t.style.transition = 'opacity .6s'; t.style.opacity = '0'; later(650, () => t.remove()); });
    }
    // The book's two lines, paper on a black ribbon over the glass.
    let capLines = CAP.door;
    function caption(lines) {
      capLines = lines;
      const size = narrow ? 30 : 21, lh = Math.round(size * 1.24);
      const out = [];
      for (const line of lines) if (line) out.push(...wrap(line, size, 856, true));
      const h = out.length * lh + 20;
      capG.innerHTML = C.banner({ x: 30, y: CAP_Y, w: 900, h }) +
        out.map((t, i) => `<text class="cap" x="54" y="${f1(CAP_Y + 8 + size * .96 + i * lh)}" style="font-size:${size}px">${C.esc(t)}</text>`).join('');
    }
    function smudge(x, y) {
      const s = el('ellipse', { cx: f1(x), cy: f1(y), rx: 11, ry: 6, class: 'smudge' }, fx);
      later(300, () => s.remove());
    }

    // ── tally: never resets ────────────────────────────────────────────────
    const tally1 = q('.tally1'), tally2 = q('.tally2'), tl1 = q('.tl1'), tl2 = q('.tl2');
    function tallyPath(n, x0, y0, perRow, maxRows, jitter) {
      let d = '';
      const j = i => (jitter ? Math.sin(i * 12.9898) * 2.4 : 0);
      for (let i = 0; i < n; i++) {
        const g = Math.floor(i / 5), k = i % 5, row = Math.floor(g / perRow);
        if (row >= maxRows) break;
        const gx = x0 + (g % perRow) * 36, gy = y0 + row * 34;
        d += k < 4 ? `M${f1(gx + k * 6 + j(i))} ${f1(gy + j(i + 3))}l${f1(j(i + 7) * .6)} 26`
                   : `M${f1(gx - 4)} ${f1(gy + 20 + j(i))}L${f1(gx + 24)} ${f1(gy + 5 + j(i + 1))}`;
      }
      return d;
    }
    function drawTally() {
      tally1.replaceChildren(el('path', { class: 'tally rule', d: tallyPath(blows, 722, 528, 5, 2, false) }));
      tally2.replaceChildren(el('path', { class: 'tally paper', d: tallyPath(blows, 60, 240, 8, 4, true) }));
      tl1.textContent = tl2.textContent = `BLOWS STRUCK ${blows}`;
    }

    // ── the door's planks: black paper over the lit doorway ────────────────
    const planks = [];
    const planksG = q('.planks');
    for (let i = 0; i < 6; i++) {
      const x = DOOR_X + i * PLANK_W;
      const g = el('g', null, planksG), body = el('g', null, g);
      el('rect', { x: x + .8, y: DOOR_TOP, width: PLANK_W - 1.6, height: FLOOR - DOOR_TOP, fill: 'currentColor' }, body);
      for (const y of [170.5, 332.5]) {
        el('rect', { x, y: y - 5, width: PLANK_W, height: 10, fill: 'currentColor' }, body);
        el('circle', { cx: x + 17.5, cy: y, r: 1.8, style: 'fill:var(--lit,#fbe3a6)' }, body);
      }
      const marks = el('g', null, body);
      const brk = el('g', { style: 'display:none', fill: 'currentColor' }, g);
      el('path', { d: `M${x} ${DOOR_TOP}h${PLANK_W}v12l-6 9-7-11-8 15-6-8-8 11Z` }, brk);
      el('path', { d: `M${x} ${FLOOR}h${PLANK_W}v-16l-7-9-6 12-8-15-7 8-7-10Z` }, brk);
      planks.push({ body, marks, brk, hits: 0, broken: false, cx: x + PLANK_W / 2 });
    }
    const doorGouges = [];        // kept for the lid: {plank, slot, rel}
    let brokenShown = 0, saidNobody = false;

    function pickPlank(x) {
      const idx = clamp(Math.floor((x - DOOR_X) / PLANK_W), 0, 5);
      if (!planks[idx].broken) return idx;
      let best = -1, bd = 99;
      planks.forEach((p, i) => { if (!p.broken && Math.abs(i - idx) < bd) { bd = Math.abs(i - idx); best = i; } });
      return best;
    }
    function carve(parent, pts, cls) {
      for (const c of cls) el('path', { class: c, d: pathOf(pts) }, parent);
    }

    // ── the dragon ─────────────────────────────────────────────────────────
    let dragonLive = false, dState = 'cycle', cycleStart = 0, dHits = 0, saidSensitive = false;
    let headX = 600, headY = 236;
    const MID = [600, 236], DIP = [520, 322], UP = [600, 200];
    // Its tongue sweeps the floor every 2.4 s; as it retracts the head dips for 0.8 s.
    function headAt(p) {
      if (p < 1000) {
        const s = Math.sin(Math.PI * p / 1000);
        const hx = MID[0], hy = MID[1] + s * 8;
        return [hx, hy, [lerp(hx - 84, 330, s), lerp(hy + 14, 366, Math.min(1, s * 3))]];
      }
      if (p < 1150) { const k = ease((p - 1000) / 150); return [lerp(MID[0], DIP[0], k), lerp(MID[1], DIP[1], k), null]; }
      if (p < 1650) return [DIP[0], DIP[1] + Math.sin((p - 1150) / 500 * Math.PI) * 3, null];
      if (p < 1800) { const k = ease((p - 1650) / 150); return [lerp(DIP[0], UP[0], k), lerp(DIP[1], UP[1], k), null]; }
      return [UP[0], lerp(UP[1], MID[1], ease((p - 1800) / 600)), null];
    }
    const inWindow = p => p >= 1000 && p < 1800;
    // The cut is one stick puppet: it slides toward the head's mark, sinks behind the
    // floor and nods (≤8°) about its feet, so its head travels the same path as before.
    function dWorld(px, py, X, Y, phi) {
      const c = Math.cos(rad(phi)), s = Math.sin(rad(phi)), lx = -DS * px, ly = DS * py;
      return [X + lx * c - ly * s, Y + lx * s + ly * c];
    }
    function poseDragon(hx, hy, jaw, tip, pawsOn) {
      const ox = hx - MID[0], oy = hy - MID[1];
      const X = DX0 + ox * .6, Y = FLOOR + Math.max(0, oy * .5), phi = clamp(-oy * .1, -8, 8);
      C.place(dragon, X, Y);
      dPose.setAttribute('transform', `rotate(${f1(phi)})`);
      [headX, headY] = dWorld(60, -45, X, Y, phi);
      C.hinge(dragon, '.sh-jaw', clamp(-jaw, 0, 30));
      if (tip) {
        const [mx, my] = dWorld(70, -38, X, Y, phi);
        const cx = mx - 16, cy = (my + tip[1]) / 2 + 24, pts = [];
        for (let i = 0; i <= 16; i++) {
          const t = i / 16, u = 1 - t;
          pts.push([u * u * mx + 2 * u * t * cx + t * t * tip[0], u * u * my + 2 * u * t * cy + t * t * tip[1]]);
        }
        const h = Math.atan2(tip[1] - cy, tip[0] - cx);
        tongue.setAttribute('d', C.taper(pts, 7, 2.4) + C.curlD(tip[0], tip[1], h - .5, 13, -1, 2.4, .4, 12) + C.curlD(tip[0], tip[1], h + .5, 13, 1, 2.4, .4, 12));
        tongue.style.display = '';
        libTongue.style.display = 'none';
      } else { tongue.style.display = 'none'; libTongue.style.display = ''; }
      paws.style.display = pawsOn ? '' : 'none';
    }
    poseDragon(MID[0], MID[1], 0, null, false);

    // ── the hero's lunge ───────────────────────────────────────────────────
    function lunge(dx, ang, maxX) {
      const id = ++lungeId, from = heroX, to = clamp(heroBase + dx, heroBase - 200, maxX);
      armA = ang;
      if (lungeTw) tweens.delete(lungeTw);
      lungeTw = tween(RM ? 0 : 250, k => { heroX = lerp(from, to, easeOut(k)); });
      later(390, () => {
        if (id !== lungeId || frozen) return;
        const f = heroX;
        lungeTw = tween(RM ? 0 : 300, k => { heroX = lerp(f, heroBase, ease(k)); }, () => { if (id === lungeId) armA = REST; });
      });
    }
    const maceTip = (dx, ang, maxX) => {
      const x = clamp(heroBase + dx, heroBase - 200, maxX);
      return [x + 12 + (MACE - 8) * Math.cos(rad(ang)), FLOOR + SH_Y + (MACE - 8) * Math.sin(rad(ang))];
    };

    // ── door: aim ──────────────────────────────────────────────────────────
    function doorBlow(pts, dx, ang, poke) {
      const ldx = poke ? 40 : clamp(dx, -260, 260);
      const reach = heroBase + ldx + 12 + MACE * Math.cos(rad(ang));
      const tip = maceTip(ldx, ang, 450);
      lunge(ldx, ang, 450);
      if (reach < DOOR_X - 4) { later(250, () => { if (phase === 'door') smudge(tip[0], tip[1]); }); return; }
      const end = pts[pts.length - 1];
      const i = pickPlank(end[0]);
      const pl = planks[i], slot = pl.hits;
      pl.hits++;
      const breaks = pl.hits >= 2;
      if (breaks) pl.broken = true;
      const third = breaks && planks.filter(p => p.broken).length === 3;
      echo(third ? 'tore.' : breaks ? 'rip.' : 'crack.');          // her noise comes first
      later(250, () => {
        if (phase !== 'door') return;
        const box = [pl.cx, slot ? 296 : 212, 24, 72];
        const g = poke ? [[box[0] - 5, box[1] - 7], [box[0] + 5, box[1] + 7]] : fit(pts, ...box);
        el('path', { style: GOUGE, d: pathOf(g) }, pl.marks);          // cut through the plank: light comes through
        doorGouges.push({ plank: i, slot, rel: g.map(([x, y]) => [x - box[0], y - box[1]]) });
        if (!saidNobody) { saidNobody = true; later(500, () => speak(heroX - 110, 120, 'Then nobody will mind.')); }
        if (breaks) {
          pl.body.style.display = 'none';
          pl.brk.style.display = '';
          brokenShown++;
          if (brokenShown >= 3) { through(); return; }
          word(fx, 440, slot ? 150 : 128, 'RIP.', 44);
        } else word(fx, 440, slot ? 150 : 128, 'crack.', 30);
      });
    }
    function through() {
      phase = 'toDragon';
      word(fx, 190, 212, 'TORE ALL', 38, '', rnd(-3, 3), 1300);    // between the tree and his return
      word(fx, 198, 254, 'ASUNDER.', 38, '', rnd(-3, 3), 1300);
      romTeach.textContent = '';
      doorHints.forEach(h => { h.style.opacity = '0'; });
      later(1300, () => {
        const done = () => {
          phase = 'dragon'; dragonLive = true; dState = 'cycle'; cycleStart = performance.now();
          romTeach.textContent = 'Strike as the head dips.';
          caption(CAP.dragon);
        };
        heroBase = HERO_HALL;
        root.classList.add('in-hall');
        const hx0 = heroX;
        if (RM) {
          tween(250, k => { doorFlat.style.opacity = 1 - k; rain.style.opacity = 1 - k; }, () => {
            doorFlat.style.display = 'none';
            hall.setAttribute('transform', 'translate(0 0)');
            hall.style.opacity = 0;
            heroX = HERO_HALL;
            tween(250, k => { hall.style.opacity = k; }, done);
          });
        } else {
          tween(1000, k => {
            const e = ease(k);
            doorFlat.setAttribute('transform', `translate(0 ${f1(-340 * e)})`);
            hall.setAttribute('transform', `translate(0 ${f1(-340 * (1 - e))})`);
            rain.style.opacity = 1 - k;
            heroX = lerp(hx0, HERO_HALL, e);
          }, done);
        }
      });
    }

    // ── dragon: timing ─────────────────────────────────────────────────────
    function dragonBlow(pts, dx, ang, poke) {
      const ldx = poke ? 40 : clamp(dx, -260, 260);
      const reach = heroBase + ldx + 12 + MACE * Math.cos(rad(ang));
      const tip = maceTip(ldx, ang, 360);
      const reachOK = reach >= 430;
      const land = performance.now() + 250;
      if (reachOK && dState === 'cycle' && inWindow((land - cycleStart) % 2400)) echo(dHits ? 'screaming.' : 'grating.');
      lunge(ldx, ang, 360);
      later(250, () => {
        if (phase !== 'dragon') return;
        if (!reachOK) { smudge(tip[0], tip[1]); return; }
        if (dState !== 'cycle') { word(fx, headX - 30, headY - 44, 'bonk.', 22, 'muted'); return; }
        if (!inWindow((performance.now() - cycleStart) % 2400)) { coverEars(); return; }
        if (dHits === 0) {
          dHits = 1;
          dState = 'stun';
          poseDragon(DIP[0] - 12, DIP[1] + 12, -8, null, false);
          word(fx, headX - 40, headY - 40, 'bonk.', 34);
          later(650, () => (saidSensitive ? resume() : coverEars()));
        } else kill();
      });
    }
    function coverEars() {
      dState = 'ears';
      poseDragon(604, 206, 0, null, true);
      if (!saidSensitive) {
        saidSensitive = true;
        speak(590, 140, 'Please. I’m very sensitive to noise.', 2200, 420);
        later(1300, () => speak(146, 170, 'Sorry.', 1500, 140));
        later(1700, resume);
      } else {
        speak(590, 140, 'Please.', 1100);
        later(1100, resume);
      }
    }
    function resume() {
      if (phase !== 'dragon') return;
      dState = 'cycle';
      cycleStart = performance.now() - 1800;   // rise from the cringe, then sweep again
    }
    function kill() {
      phase = 'freeze'; frozen = true; dragonLive = false; dState = 'shriek';
      romTeach.textContent = '';
      poseDragon(560, 246, -34, null, false);
      // The second blow freezes mid-shriek.
      const t = el('text', { x: 0, y: 176, class: 'snd', 'clip-path': 'url(#gt-shriek)' }, fx);
      t.style.fontSize = f1(64 * TS()) + 'px';
      t.textContent = 'SHRIEK';
      const len = (t.getComputedTextLength && t.getComputedTextLength()) || 250;
      const x0 = 600 - len / 2, r = q('.shriek-r');
      t.setAttribute('x', f1(x0));
      r.setAttribute('x', f1(x0 - 4));
      tween(RM ? 0 : 200, k => r.setAttribute('width', f1(len * .7 * k + 4)));
      caption(CAP.shriek);
      later(1300, () => echo('clangour.'));
      later(1600, () => {
        tween(RM ? 0 : 420, k => shield.setAttribute('transform', `translate(470 ${f1(196 + 150 * k * k)}) rotate(${f1(80 * k * k)})`), () => {
          word(fx, 146, 306, 'CLANG.', 30, '', rnd(-3, 3), 1400);
          caption(CAP.shield);
          later(500, () => speak(146, 170, 'I didn’t touch it.', 2200, 140));
        });
      });
      later(4700, flip);
    }

    // ── the page turns over ────────────────────────────────────────────────
    const sc = s => `translate(0 320) scale(1 ${Math.max(.002, s).toFixed(3)}) translate(0 -320)`;
    function flip() {
      phase = 'flip';
      inkL.replaceChildren();
      clearTransient();
      const swap = () => { rom.style.display = 'none'; vlt.style.display = ''; setupVault(); };
      if (RM) {
        tween(250, k => { flipG.style.opacity = 1 - k; }, () => { swap(); tween(250, k => { flipG.style.opacity = k; }, replay); });
      } else {
        tween(350, k => flipG.setAttribute('transform', sc(1 - ease(k))), () => {
          swap();
          tween(350, k => flipG.setAttribute('transform', sc(ease(k))), () => { flipG.removeAttribute('transform'); replay(); });
        });
      }
    }

    // ── the vault: rhythm ──────────────────────────────────────────────────
    const mad = q('.mad'), madPose = mad.querySelector('.sh-pose'), madInner = madPose.firstElementChild;
    const chestHeart = mad.querySelector('path[style*="sh-red"]'), lidHeart = q('.lidheart');
    const MS = 2.3;
    const lid = q('.sh-coffin .sh-lid'), idoor = q('.idoor'), bars = q('.bars'), rod = q('.rod'), rodFig = q('.gt-rod'), rdoor = q('.rdoor');
    const vborder = q('.vborder'), vcap = q('.vcap'), vteach = q('.vteach'), recho = q('.recho');
    const vfx = q('.vfx'), scratches = q('.scratches'), vhint = q('.vhint');
    const marks = { lid: q('.lidmarks'), door: q('.idmarks'), arch: q('.armarks'), stair: q('.stmarks') };
    let station = 0, stationHits = 0, onBeats = 0, misses = 0, mercy = false;
    let beating = false, lastBeat = 0, nextBeat = 0;
    let madX = 372, madY = 580, madFacing = 1, madRot = 0, madLean = 0, reel = false;
    let madFace = 1, rodFace = -1;              // shown facing: turns edge-on toward the target
    let rodFacing = -1, rodRot = 0, thresholdTimer = 0;
    const interval = () => 1100 - 500 * Math.min(1, onBeats / 10);   // the heart quickens
    chestHeart.style.transformBox = 'fill-box';
    chestHeart.style.transformOrigin = 'center';

    // copper on the archway, stone on the stair (drawn once)
    (() => {
      let d = '';
      for (let a = 0; a <= 180; a += 12) {
        const c = Math.cos(rad(180 + a)), s = Math.sin(rad(180 + a));
        d += `M${f1(580 + 43 * c)} ${f1(470 + 43 * s)}L${f1(580 + 51 * c)} ${f1(470 + 51 * s)}`;
      }
      d += 'M529 480H537M529 500H537M529 520H537M529 540H537M529 560H537M623 480H631M623 500H631M623 520H631M623 540H631M623 560H631';
      q('.copper').setAttribute('d', d);
      let s = '';
      for (let i = 0; i < 5; i++) for (let y = TOP(i) + 20; y < 580; y += 26) s += `M${RX(i) + 8} ${y}h${i === 4 ? 30 : 22}`;
      q('.stairtex').setAttribute('d', s);
    })();

    let vKey = null;
    function vcaption(key) {
      vKey = key;
      vcap.replaceChildren();
      const k = narrow ? 1.42 : 1;
      let y = 98;
      VCAP[key].forEach(([t, c], i) => {
        const size = (c === 'R' ? 28 : c === 'l' ? 14 : 21) * k;
        if (i) y += Math.max(size, 21 * k) * 1.24 + (c === 'R' ? 6 * k : 0);
        wrap(t, size, 470, c !== 'l').forEach((part, j) => {
          if (j) y += size * 1.24;
          el('text', { x: 48, y: f1(y), class: c }, vcap).textContent = part;
        });
      });
    }
    function setupVault() {
      drawTally();
      vteach.textContent = '';
      beating = true;
      lastBeat = performance.now();
      nextBeat = lastBeat + interval();
    }
    // Your door-strokes, re-cut in red on her coffin, one by one.
    function replay() {
      phase = 'replay';
      const step = RM ? 160 : 330;
      doorGouges.forEach((g, n) => {
        later(500 + n * step, () => {
          const cx = 96 + g.plank * 42 + (g.slot ? 14 : 0), cy = 532;
          const ys = g.rel.map(p => p[1]), k = Math.min(1, 40 / Math.max(1, Math.max(...ys) - Math.min(...ys)));
          const pts = g.rel.map(([x, y]) => [cx + x * k, cy + y * k]);       // as large as on the door, if the side allows
          const p = el('path', { class: 'gouge-t', d: pathOf(pts) }, marks.lid);
          if (!RM && p.getTotalLength) {
            const L = p.getTotalLength() + 1;
            p.style.strokeDasharray = L;
            p.style.strokeDashoffset = L;
            tween(280, k => { p.style.strokeDashoffset = f1(L * (1 - k)); });
          }
        });
      });
      later(500 + doorGouges.length * step + 500, () => {
        vcaption('lid');
        vteach.textContent = 'Draw on the heartbeat.';
        phase = 'vault';
      });
    }

    function vaultBlow(pts, dx, dy, ang, poke) {
      const t = performance.now();
      const near = Math.min(Math.abs(t - lastBeat), Math.abs(nextBeat - t));
      const st = STATIONS[station];
      if (!(mercy || near <= 220)) {
        // off the beat: a red scratch where you drew, and she does not move
        misses++;
        if (misses >= 6) mercy = true;
        el('path', { class: 'scratch', d: pathOf(pts) }, scratches);
        return;
      }
      onBeats++;
      if (!RM) tween(260, k => { madLean = 9 * Math.sin(Math.PI * k); });
      const [bx, by, bw, bh] = st.box;
      const g = poke ? [[bx - 6, by - 8], [bx + 6, by + 8]]
        : fit(pts, bx + rnd(-bw * .15, bw * .15), by + rnd(-bh * .12, bh * .12), bw * .8, bh * .8);
      carve(marks[st.k], g, ['gouge-p']);
      const [w, size] = st.words[Math.min(stationHits, st.words.length - 1)];
      word(vfx, bx, by - bh / 2 - 14, w, size, 'paper');
      const e = st.echo[stationHits];
      if (e) later(420, () => word(recho, 596, 78, e, 19, '', rnd(-3, 3), 1100));   // the book follows her
      stationHits++;
      if (stationHits >= st.n) advance();
    }

    function glide(x, y, ms = 260, done) {
      const x0 = madX, y0 = madY;
      tween(RM ? 0 : ms, k => { const e = ease(k); madX = lerp(x0, x, e); madY = lerp(y0, y, e); }, done);
    }
    function advance() {
      const was = STATIONS[station];
      station++;
      stationHits = 0;
      if (was.k === 'lid') {
        // the library lid, in coffin units: heaved up at the head end, pivoting on the foot
        tween(RM ? 0 : 500, k => lid.setAttribute('transform', `rotate(${f1(14 * k)} 48 -8.6) translate(${f1(-2 * k)} 0)`));
        lidHeart.style.display = 'none';
        madX = 372; madY = 596;
        tween(RM ? 0 : 420, k => { mad.style.opacity = k; madY = lerp(596, 580, k); });
      } else if (was.k === 'door') {
        tween(RM ? 0 : 420, k => { idoor.setAttribute('transform', `translate(0 ${f1(-36 * k)})`); idoor.style.opacity = 1 - k; });
        rodFacing = 1;                                                  // he turns his chair to the door
        tween(RM ? 0 : 300, k => rod.dataset.lift = f1(-6 * Math.sin(Math.PI * k)));
      } else if (was.k === 'arch') {
        tween(RM ? 0 : 420, k => { bars.setAttribute('transform', `translate(0 ${f1(-40 * k)})`); bars.style.opacity = 1 - k; });
      }
      if (station >= STATIONS.length) { glide(LANDING[0], LANDING[1], 300, threshold); return; }
      const nx = STATIONS[station];
      if (nx.pos && was.k !== 'lid') glide(nx.pos[0], nx.pos[1]);
      if (nx.cap !== was.cap) vcaption(nx.cap);
    }

    // ── the threshold: a choice ────────────────────────────────────────────
    function threshold() {
      // a breath before the choice, so a stroke drawn on the climb's rhythm can't pre-empt it
      phase = 'arrive';
      later(1000, () => { if (phase === 'arrive') phase = 'threshold'; });
      vteach.textContent = '';
      vcaption('door2');
      madFacing = -1;                         // she turns to the doors
      reel = true;                            // his sway, reused
      C.hinge(rodFig, '.sh-arm', -70);        // in the dragon's pose, a hand to his ear
      vhint.style.opacity = '1';
      thresholdTimer = later(6000, gust);
    }
    function thresholdBlow(pts) {
      cancel(thresholdTimer);
      phase = 'end';
      vhint.style.opacity = '0';
      rdoor.style.display = 'none';
      reel = false;
      tween(RM ? 0 : 320, k => { madRot = -80 * k * k; }, () => {
        beating = false;
        q('.blk').style.display = '';
        const blk = q('.blk');
        el('path', { class: 'gouge-white', d: pathOf(pts) }, blk);   // one white gouge: yours
        later(900, () => {
          el('text', { x: 480, y: 584, 'text-anchor': 'middle', class: 'end-line' }, blk)
            .textContent = 'Who slayeth the dragon, the shield he shall win.';
        });
        later(2200, () => finish('struck'));
      });
    }
    function gust() {
      if (phase !== 'threshold') return;
      phase = 'end';
      vhint.style.opacity = '0';
      const gG = q('.gust');
      for (let i = 0; i < 16; i++) {
        const y = rnd(190, 590), len = rnd(60, 180), x = rnd(300, 900);
        const l = el('path', { class: 'streak', d: `M${f1(x)} ${f1(y)}h${f1(-len)}` }, gG);
        if (!RM) {
          const d0 = rnd(0, 400);
          l.style.opacity = '0';
          later(d0, () => tween(900, k => { l.setAttribute('transform', `translate(${f1(-260 * k)} 0)`); l.style.opacity = f1(Math.sin(Math.PI * k)); }));
        }
      }
      // threw slowly back their ponderous and ebony jaws: it was the work of the rushing gust
      tween(RM ? 0 : 1000, k => { rdoor.innerHTML = ebony(ease(k)); });
      later(RM ? 300 : 900, () => {
        reel = false;
        tween(RM ? 0 : 700, k => { madRot = -80 * k * k; rodRot = -50 * k * k; }, () => { beating = false; });
        vKey = null;
        vcap.replaceChildren();
        el('text', { x: 48, y: 110, class: 'r' }, vcap).textContent = 'It was the work of the rushing gust.';
        if (RM) later(1000, () => q('.gust').replaceChildren());
      });
      later(3200, () => finish('gust'));
    }

    function finish(kind) {
      if (finished) return;
      finished = true;
      try {
        api.setFlag?.('tristLastBlow', kind);
        api.setFlag?.('tristBlows', blows);
        api.done?.({
          won: true,
          score: { 'dragons slain': kind === 'struck' ? 1 : 0, 'blows struck': blows },
          note: kind === 'struck' ? 'Who slayeth the dragon, the shield he shall win.' : 'It was the work of the rushing gust.',
        });
      } catch (err) { console.warn('trist: api.done threw', err); }
    }

    // ── input: draw anywhere ───────────────────────────────────────────────
    let drawing = null;
    const accepting = () => ['door', 'dragon', 'vault', 'threshold'].includes(phase);
    function toVB(e) {
      const m = svg.getScreenCTM();
      if (!m) return [0, 0];
      const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
      return [p.x, p.y];
    }
    function onDown(e) {
      if (!accepting() || drawing) return;
      e.preventDefault();
      try { svg.setPointerCapture(e.pointerId); } catch (_) { /* fine */ }
      const p = toVB(e);
      const inVault = phase === 'vault' || phase === 'threshold';
      drawing = { id: e.pointerId, pts: [p], path: el('path', { class: 'stroke ' + (inVault ? 'paper' : 'ink'), d: pathOf([p]) }, inkL) };
    }
    function onMove(e) {
      if (!drawing || e.pointerId !== drawing.id) return;
      e.preventDefault();
      const p = toVB(e), l = drawing.pts[drawing.pts.length - 1];
      if (Math.hypot(p[0] - l[0], p[1] - l[1]) < 3) return;
      drawing.pts.push(p);
      drawing.path.setAttribute('d', pathOf(drawing.pts));
    }
    function onUp(e) {
      if (!drawing || e.pointerId !== drawing.id) return;
      const d = drawing;
      drawing = null;
      d.path.style.transition = 'opacity .7s';
      later(20, () => { d.path.style.opacity = '0'; });
      later(760, () => d.path.remove());
      if (accepting()) release(d.pts);
    }
    function release(pts) {
      clearTransient();
      lastStrokeAt = performance.now();
      doorHints.forEach(h => { h.style.opacity = '0'; });
      const a = pts[0], b = pts[pts.length - 1];
      const dx = b[0] - a[0], dy = b[1] - a[1];
      const poke = Math.hypot(dx, dy) < 12;
      const ang = poke ? 0 : deg(Math.atan2(dy, dx));
      blows++;
      drawTally();
      if (phase === 'door') doorBlow(pts, dx, ang, poke);
      else if (phase === 'dragon') dragonBlow(pts, dx, ang, poke);
      else if (phase === 'vault') vaultBlow(pts, dx, dy, ang, poke);
      else if (phase === 'threshold') thresholdBlow(pts);
    }
    svg.addEventListener('pointerdown', onDown);
    svg.addEventListener('pointermove', onMove);
    svg.addEventListener('pointerup', onUp);
    svg.addEventListener('pointercancel', onUp);
    const noCtx = e => e.preventDefault();
    svg.addEventListener('contextmenu', noCtx);

    // ── phones: re-set the type when the stage narrows or the font arrives ─
    function relayout() {
      if (!alive) return;
      const w = root.clientWidth;
      const n = w > 0 && w < 640;
      if (n !== narrow) { narrow = n; root.classList.toggle('is-narrow', n); }
      caption(capLines);
      if (vKey) vcaption(vKey);
    }
    let lastW = -1;
    const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(() => { const w = root.clientWidth; if (w !== lastW) { lastW = w; relayout(); } }) : null;
    if (ro) ro.observe(root);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);

    // ── the loop ───────────────────────────────────────────────────────────
    const turnStep = RM ? 2 : 2 / 160;            // edge-on turn: 1 → 0 → −1 in 160 ms
    let lastNow = performance.now();
    function frame(now) {
      if (!alive) return;
      raf = requestAnimationFrame(frame);
      const dt = Math.max(0, Math.min(100, now - lastNow));
      lastNow = now;
      const sway = RM ? 3 : 4 * Math.sin(now / 2600 * Math.PI * 2);   // the wine
      if (!frozen) swayA = sway;
      if (vlt.style.display === 'none') {
        C.place(hero, heroX, FLOOR);
        heroPose.setAttribute('transform', `rotate(${f1(swayA)})`);
        C.hinge(hero, '.sh-arm', f1(armA - LIB_MACE));
        if (!RM && !frozen && phase === 'door') rain.setAttribute('transform', `translate(0 ${f1((now * .32) % 40)})`);
        if (dragonLive && dState === 'cycle') {
          const [hx, hy, tip] = headAt((now - cycleStart) % 2400);
          poseDragon(hx, hy, 0, tip, false);
        }
        if (phase === 'door' && now - lastStrokeAt > 7000) doorHints.forEach(h => { h.style.opacity = '1'; });
      } else {
        if (beating && now >= nextBeat) {
          lastBeat = nextBeat;
          nextBeat = lastBeat + interval();
          if (now > nextBeat) { lastBeat = now; nextBeat = now + interval(); }
        }
        const pulse = beating ? clamp(1 - (now - lastBeat) / 240, 0, 1) : 0;
        vborder.style.strokeWidth = f1(1.5 + 3 * pulse);
        vborder.style.opacity = f1(.45 + .4 * pulse);
        if (RM) {
          lidHeart.style.opacity = chestHeart.style.opacity = f1(.55 + .45 * pulse);
        } else {
          lidHeart.setAttribute('transform', `translate(200 494) scale(${f1(1.8 * (1 + .4 * pulse))})`);
          chestHeart.style.transform = `scale(${f1(1 + .5 * pulse)})`;
        }
        madFace = madFace < madFacing ? Math.min(madFacing, madFace + turnStep * dt) : Math.max(madFacing, madFace - turnStep * dt);
        rodFace = rodFace < rodFacing ? Math.min(rodFacing, rodFace + turnStep * dt) : Math.max(rodFacing, rodFace - turnStep * dt);
        const r = reel ? sway : 0;
        C.place(mad, madX, madY);
        madPose.setAttribute('transform', `rotate(${f1(madRot + madLean * madFacing + r)})`);
        madInner.setAttribute('transform', `scale(${f1(-MS * madFace * 100) / 100} ${MS})`);
        const rs = RM ? 0 : sway * .75;     // Roderick rocks with the same sway [u45]
        rod.setAttribute('transform', `translate(720 ${f1(170 + (+rod.dataset.lift || 0))}) rotate(${f1(rodRot + rs)}) scale(${f1(rodFace * 100) / 100} 1)`);
      }
      for (const tw of [...tweens]) {
        const k = Math.min(1, (now - tw.t0) / tw.dur);
        tw.fn(k);
        if (k >= 1) { tweens.delete(tw); if (tw.done) tw.done(); }
      }
    }
    raf = requestAnimationFrame(frame);

    // ── first ten seconds ──────────────────────────────────────────────────
    relayout();
    drawTally();
    later(900, () => speak(685, 230, 'Nobody’s home!', 2600));

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      timers.clear();
      tweens.clear();
      if (ro) ro.disconnect();
      svg.removeEventListener('pointerdown', onDown);
      svg.removeEventListener('pointermove', onMove);
      svg.removeEventListener('pointerup', onUp);
      svg.removeEventListener('pointercancel', onUp);
      svg.removeEventListener('contextmenu', noCtx);
      root.remove();
    };
  },
};
