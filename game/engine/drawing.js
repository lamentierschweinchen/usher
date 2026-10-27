// The map, cut from the shared library (game/shared/cuts.js, Shadow Theatre).
// The house, the grounds and the cast are each one def, used twice: upright in
// black paper against the chapter's light, and returned by the tarn as light.
// The spine draws nothing of its own here except the manicule and the hit areas.

import * as C from '../shared/cuts.js';

export const { WATER, FLIP, FISSURE } = C;

// The tarn's truths, in house coordinates (the group carries the flip). They
// don't ripple. Each shows once its chapter is played (unannounced, during the game).
const glow = 'filter="url(#sh-glow)" style="--gauze:#fff6e0"';
const red = s => `<g style="color:var(--sh-red)">${s}</g>`;
const TRUTHS = `
  <g data-truth="fissure" class="shown">${C.truthFissure()}</g>
  <g data-truth="face">${C.figure('madeline', { x: 293, y: 338, faint: false, flip: true, attrs: glow })}</g>
  <g data-truth="cellar">${red('<path d="M334 362h72v1.6h-72z"/>')}${C.figure('madeline', { x: 372, y: 361, pose: 'lie', faint: false, attrs: glow })}</g>
  <g data-truth="lid">${red(C.coffin({ x: 352, y: 361, w: 46, lid: 'off' }))}</g>
  <g data-truth="stair">${red(C.door('iron', { x: 398, y: 347, w: 12, h: 16, open: .6 }))}${C.figure('madeline', { x: 480, y: 311, scale: .93, flip: true, faint: false, attrs: glow })}</g>
  <g data-truth="doors">${red('<path d="M440 246l-12 5v27"/>')}${C.figure('madeline', { x: 448, y: 278, flip: true, faint: false, attrs: glow })}</g>
  <g data-truth="whole"><g style="color:var(--sh-return)">${C.shell({ crack: 0 })}${C.rooms()}</g></g>`;

export const TRUTH_IDS = ['fissure', 'face', 'cellar', 'lid', 'stair', 'doors', 'whole'];

// Where things are, for hits, labels, the manicule and the iris (map coordinates).
export const ROOMS = {
  tarn:     { rect: [14, 368, 932, 256], label: 'the tarn', labelAt: [720, 392], anchor: [760, 470], hand: [700, 384, 90] },
  bank:     { rect: [14, 300, 120, 68], label: 'the bank', anchor: [70, 340] },
  causeway: { rect: [134, 320, 146, 48], label: 'the causeway', anchor: [214, 340], hand: [214, 296, 90] },
  door:     { rect: [270, 176, 410, 164], label: 'the door', labelAt: [430, 356], anchor: [480, 318], hand: [480, 278, 90] },
  gallery:  { rect: [300, 176, 360, 44], label: 'the gallery', anchor: [480, 200], hand: [530, 170, 90] },
  bedroom:  { rect: [300, 220, 140, 60], label: 'your bedroom', anchor: [370, 252], hand: [372, 214, 90] },
  hall:     { rect: [300, 280, 140, 60], label: 'the hall', anchor: [370, 312], hand: [372, 276, 90] },
  stair:    { rect: [440, 220, 80, 120], label: 'the stair', anchor: [480, 280], hand: [480, 214, 90] },
  studio:   { rect: [520, 220, 140, 120], label: 'the studio', anchor: [590, 290], hand: [610, 214, 90] },
  vault:    { rect: [300, 340, 140, 28], label: 'the vault', anchor: [370, 355], hand: [370, 324, 90] },
};

// A figure the map can move and turn: position and facing live on the spine's
// own wrappers, so the library's cut stays untouched.
export const actorFigure = (name, pose) => C.figure(name, { pose });

const hand = `<g id="f-hand" style="color:var(--sh-cut)">
  <rect x="-36" y="-7" width="7" height="14" fill="currentColor"/>
  <path style="fill:var(--sh-lamp);stroke:currentColor;stroke-width:1.4" d="M-29-6H-14Q-11-7-8-5.5H8Q11-5.5 11-2.5Q11 .5 8 .5H-5Q-2.5 2.5-5 4.5Q-2.5 6.5-5.5 8.5H-29Z"/>
  <path style="fill:none;stroke:currentColor;stroke-width:.7" d="M-13 .5H-6M-14 4.5H-6"/>
</g>`;

export function mapMarkup(titles) {
  C.autoLace();
  // clip paths that split the house along its fissure, for the end
  const fp = [[486, 130], [476, 164], [490, 194], [478, 234], [490, 280], [480, 330], [488, 368]].map(p => p.join(' ')).join(' L');
  const left = `M-3000 -3000 L486 -3000 L${fp} L488 3000 L-3000 3000Z`;
  const right = `M486 -3000 L${fp} L488 3000 L3000 3000 L3000 -3000Z`;
  const lights = (draw) => C.CHAPTERS.map(ch => `<g class="light" data-light="${ch}">${draw(ch)}</g>`).join('');
  return `
${C.defs()}
<defs>
  <clipPath id="clip-above"><rect x="-3000" y="-3000" width="7000" height="3368"/></clipPath>
  <clipPath id="clip-left"><path d="${left}"/></clipPath>
  <clipPath id="clip-right"><path d="${right}"/></clipPath>
  <g id="grounds">${C.bank()}${C.shore()}</g>
  <g id="house" class="house-def">${C.shell({ crack: 6 })}<g class="rooms">${C.rooms()}</g><g class="facade">${C.facadeWindows()}</g></g>
  <g id="cast"></g>
  ${hand}
</defs>

<g id="lights">${lights(ch => C.backdrop(ch))}</g>
<g id="moon" class="moon">${C.moon(484, 246, 46)}</g>
<g id="cartouche" class="cartouche">${C.card({ text: titles.above, x: 206, y: 30, w: 548, h: 92, size: 40 })}</g>

<g class="above" style="color:var(--sh-cut)">
  <use href="#grounds"/>
  <g clip-path="url(#clip-above)">
    <use id="house-whole" href="#house"/>
    <g id="sink-left" class="half"><use href="#house" clip-path="url(#clip-left)"/></g>
    <g id="sink-right" class="half"><use href="#house" clip-path="url(#clip-right)"/></g>
  </g>
  <use href="#cast"/>
</g>

<g id="glasses">${lights(ch => C.glass(ch))}</g>
${C.returned('<use href="#grounds"/><use href="#house"/><use href="#cast"/>', { truth: `<g id="truths" class="truths">${TRUTHS}</g>` })}
<g id="title-below" class="title-below" filter="url(#sh-ripple)">
  <text class="t-title-below" transform="translate(480 590) scale(1 -.85)" text-anchor="middle">${titles.below}</text>
</g>

${C.frame()}
<g id="hits"></g>
<g id="hand" class="hand"><use href="#f-hand"/></g>
<text id="hover-label" class="t-label-svg" x="0" y="0"></text>`;
}
