// The map, cut from the shared library (game/shared/cuts.js, Shadow Theatre).
// The house, the grounds and the cast are each one def, used twice: upright in
// black paper against the chapter's light, and returned by the tarn as light.
// The spine draws nothing of its own here except the invisible hit areas.

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

// Where things are, for hits, labels and the iris (map coordinates). A target is
// shown by turning up its room's lamp (`lamp`, a --lit-* variable on the upright
// house only) and rimming a cut in lamplight (`rim`, a selector inside the defs).
export const ROOMS = {
  tarn:     { rect: [14, 368, 932, 256], label: 'the tarn', labelAt: [720, 392], anchor: [760, 470], cue: 'title' },
  bank:     { rect: [14, 300, 120, 68], label: 'the bank', anchor: [70, 340] },
  causeway: { rect: [134, 320, 146, 48], label: 'the causeway', anchor: [214, 340], rim: '#grounds .sh-causeway' },
  door:     { rect: [270, 176, 410, 164], label: 'the door', labelAt: [430, 356], anchor: [480, 318], lamp: '--lit-door', rim: '#house .facade .sh-door' },
  gallery:  { rect: [300, 176, 360, 44], label: 'the gallery', anchor: [480, 200], lamp: '--lit-gal' },
  bedroom:  { rect: [300, 220, 140, 60], label: 'your bedroom', anchor: [370, 252], lamp: '--lit-bed' },
  hall:     { rect: [300, 280, 140, 60], label: 'the hall', anchor: [370, 312], lamp: '--lit-hall' },
  stair:    { rect: [440, 220, 80, 120], label: 'the stair', anchor: [480, 280], lamp: '--lit-stair' },
  studio:   { rect: [520, 220, 140, 120], label: 'the studio', anchor: [590, 290], lamp: '--lit-studio' },
  vault:    { rect: [300, 340, 140, 28], label: 'the vault', anchor: [370, 355], lamp: '--lit-vault' },
};

// A figure for the map: placed with C.place(), never transformed on its outer <g>.
export const actorFigure = (name, pose, scale = 1) => C.figure(name, { pose, scale });
export const placeFigure = C.place;



// The library's shared defs (skies, glass, lamps, lattices, ripple, glow…), drawn
// once into the always-rendered #sh-defs <svg> at the top of the page.
export const sharedDefs = () => C.defs();

export function mapMarkup(titles) {
  C.autoLace();
  // clip paths that split the house along its fissure, for the end
  const fp = [[486, 130], [476, 164], [490, 194], [478, 234], [490, 280], [480, 330], [488, 368]].map(p => p.join(' ')).join(' L');
  const left = `M-3000 -3000 L486 -3000 L${fp} L488 3000 L-3000 3000Z`;
  const right = `M486 -3000 L${fp} L488 3000 L3000 3000 L3000 -3000Z`;
  const lights = (draw) => C.CHAPTERS.map(ch => `<g class="light" data-light="${ch}">${draw(ch)}</g>`).join('');
  return `
<defs>
  <clipPath id="clip-above"><rect x="-3000" y="-3000" width="7000" height="3368"/></clipPath>
  <clipPath id="clip-left"><path d="${left}"/></clipPath>
  <clipPath id="clip-right"><path d="${right}"/></clipPath>
  <g id="grounds">${C.bank()}${C.shore()}</g>
  <g id="house" class="house-def">${C.shell({ crack: 6 })}<g class="rooms">${C.rooms()}</g><g class="facade">${C.facadeWindows()}</g></g>
  <g id="cast"></g>
  <!-- a target room's lamp, turned up -->
  <radialGradient id="sp-hot" cx=".5" cy=".6" r=".75"><stop offset="0" stop-color="#fffaea"/><stop offset=".6" stop-color="#fde9b8"/><stop offset="1" stop-color="#f6cf7e"/></radialGradient>
</defs>

<g id="lights">${lights(ch => C.backdrop(ch))}</g>
<g id="moon" class="moon">${C.moon(484, 246, 46)}</g>

<g class="above" style="color:var(--sh-cut)">
  <use href="#grounds"/>
  <g clip-path="url(#clip-above)">
    <use id="house-whole" href="#house"/>
    <g id="sink-left" class="half"><use href="#house" clip-path="url(#clip-left)"/></g>
    <g id="sink-right" class="half"><use href="#house" clip-path="url(#clip-right)"/></g>
  </g>
  <use href="#cast"/>
</g>
<g id="cartouche" class="cartouche">${C.card({ text: titles.above, x: 206, y: 30, w: 548, h: 92, size: 40 })}</g>

<g id="glasses">${lights(ch => C.glass(ch))}</g>
${C.returned('<use href="#grounds"/><use href="#house"/><use href="#cast"/>', { truth: `<g id="truths" class="truths">${TRUTHS}</g>` })}
<g id="title-below" class="title-below" filter="url(#sh-ripple)">
  <text class="t-title-below" transform="translate(480 590) scale(1 -.85)" text-anchor="middle">${titles.below}</text>
</g>

<g id="hits"></g>
<text id="hover-label" class="t-label-svg" x="0" y="0"></text>`;
}
