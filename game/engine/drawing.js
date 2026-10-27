// The map's drawing, per work/design/LOOK.md. Everything that appears twice
// (above in ink, below in the tarn as pale line) lives in <defs> and is drawn
// with classes only: .ln .fine .hair .mass .wall .face .robe. Colour comes from
// the <use> that places it (.above / .below).

export const WATER = 368;
export const FLIP = 'matrix(1 0 0 -.85 0 680.8)'; // y' = 368 − .85(y − 368)
export const FISSURE = 'M486 130l-10 34 14 30-12 40 12 46-10 50 8 38';
// fissure as absolute points, for the split at the end
const FP = [[486, 130], [476, 164], [490, 194], [478, 234], [490, 280], [480, 330], [488, 368]];

const lancet = (x, y, w, h) =>
  `M${x} ${y + h}V${y + w * .6}Q${x} ${y + w * .1} ${x + w / 2} ${y}Q${x + w} ${y + w * .1} ${x + w} ${y + w * .6}V${y + h}Z`;

// windows that light up in the tarn at the very end ("every window lit")
const WINDOWS = [
  [314, 186, 12, 26], [352, 186, 12, 26], [390, 186, 12, 26], [558, 186, 12, 26], [596, 186, 12, 26], [634, 186, 12, 26],
  [400, 228, 12, 34], [540, 228, 12, 34], [584, 228, 12, 34], [628, 228, 12, 34],
  [294, 214, 12, 26], [654, 214, 12, 26],
];

function ragged(x0, x1, y, amp, step, seed) {
  // a fixed ragged edge, drawn right to left so it closes a band hanging from the top
  let s = seed, d = '';
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  for (let x = x1; x >= x0; x -= step) d += `L${x} ${(y + (rnd() - .5) * amp).toFixed(1)}`;
  return d;
}

function stair() {
  // two zigzag flights: hall (340) up to the landing (280), then back up to the gallery (220)
  let a = 'M446 340', b = 'M514 280';
  for (let i = 0; i < 6; i++) { a += 'v-10h11.33'; b += 'v-10h-11.33'; }
  return `<path class="ln" d="${a}"/><path class="ln" d="${b}"/>
    <path class="ln fine" d="M446 340L514 280M514 280L446 220"/>
    <path class="ln hair" d="M452 334v-10M474 314v-10M497 294v-10M508 274v-10M486 254v-10M463 234v-10"/>`;
}

const GROUNDS = `
<g id="grounds">
  <path class="mass" d="M16 368V350Q40 334 70 332Q105 334 130 352V368Z"/>
  <path class="wall" d="M37 342L40 262L43 342Z"/><path class="ln fine" d="M40 290L28 270M40 278L50 258M41 300L52 292"/>
  <path class="wall" d="M64 336L67 242L71 336Z"/><path class="ln fine" d="M67 266L54 248M68 258L80 236M68 284L82 276"/>
  <path class="wall" d="M93 340L96 276L99 340Z"/><path class="ln fine" d="M96 296L106 282M96 306L86 296"/>
  <path class="ln hair" d="M118 366l-3-14M122 366l1-12M126 366l4-13M304 368l-2-12M309 368l2-10M676 368l-3-11M681 368l1-13M686 368l4-9M902 368l-2-10M907 368l2-13"/>
  <rect class="wall" x="130" y="360" width="170" height="8"/>
  <path class="ln hair" d="${Array.from({ length: 21 }, (_, i) => `M${138 + i * 8} 361v6`).join('')}"/>
</g>`;

const HOUSE = `
<g id="house">
  <rect class="wall" x="280" y="176" width="40" height="164"/>
  <rect class="wall" x="640" y="176" width="40" height="164"/>
  <path class="mass" d="M280 176L300 118 320 176ZM640 176L660 118 680 176Z"/>
  <path class="mass" d="M320 176L480 126 640 176Z"/>
  <rect class="wall" x="300" y="176" width="360" height="164" style="stroke:none"/>

  <!-- the remoter angles -->
  <path class="hatch" d="M300 176h16L300 192ZM660 176h-16L660 192ZM300 340v-14l14 14ZM660 340v-14l-14 14ZM440 220h12L440 232Z"/>

  <!-- gallery: portraits in pairs, one face painted out -->
  <g class="portraits">
    <rect class="ln fine" x="320" y="185" width="13" height="17"/><ellipse class="ln hair" cx="326.5" cy="192" rx="3" ry="4"/>
    <rect class="ln fine" x="338" y="185" width="13" height="17"/><ellipse class="mass" cx="344.5" cy="192" rx="3.2" ry="4.2"/>
    <rect class="ln fine" x="388" y="185" width="13" height="17"/><ellipse class="ln hair" cx="394.5" cy="192" rx="3" ry="4"/>
    <rect class="ln fine" x="406" y="185" width="13" height="17"/><ellipse class="mass" cx="412.5" cy="192" rx="3.2" ry="4.2"/>
    <rect class="ln fine" x="560" y="185" width="13" height="17"/><ellipse class="ln hair" cx="566.5" cy="192" rx="3" ry="4"/>
    <rect class="ln fine" x="578" y="185" width="13" height="17"/><ellipse class="mass" cx="584.5" cy="192" rx="3.2" ry="4.2"/>
    <rect class="ln fine" x="616" y="185" width="13" height="17"/><ellipse class="ln hair" cx="622.5" cy="192" rx="3" ry="4"/>
    <rect class="ln fine" x="634" y="185" width="13" height="17"/><ellipse class="mass" cx="640.5" cy="192" rx="3.2" ry="4.2"/>
  </g>

  <!-- guest bedroom: bed, draperies, casement, the book -->
  <path class="mass" d="M302 222h9v34l-3-4-2 7-2-5-2 6Z"/>
  <path class="ln fine" d="M316 280V242M372 280V242M312 242H376"/>
  <path class="ln fine" d="M312 242q5 7 10 0q5 7 10 0q5 7 10 0q5 7 10 0q5 7 10 0q5 7 10 0"/>
  <rect class="wall" x="318" y="264" width="52" height="8" style="stroke-width:1.1"/>
  <path class="ln hair" d="M321 264q4-5 10 0"/>
  <path class="ln fine" d="${lancet(400, 228, 12, 34)}M406 230v32M400 247h12"/>
  <path class="ln fine" d="M416 280v-12h20v12M414 268h24"/><rect class="mass" x="420" y="264" width="9" height="4"/>

  <!-- hall: Gothic arch onto the causeway, tapestry, armorial trophy -->
  <path class="ln" d="M280 340V312Q280 298 290 290Q300 298 300 312V340"/>
  <rect class="ln fine" x="322" y="290" width="26" height="36"/>
  <path class="ln hair" d="M327 291v34M332 291v34M337 291v34M342 291v34"/>
  <path class="ln fine" d="M384 290L416 324M416 290L384 324"/>
  <path class="wall" d="M392 298h16v8q0 9-8 13q-8-4-8-13Z" style="stroke-width:1.1"/>

  <!-- stair -->
  ${stair()}

  <!-- studio: three lancets, black draperies, sofa, easel with the long white vault, guitar, books -->
  ${[540, 584, 628].map(x => `<path class="ln fine" d="${lancet(x, 228, 12, 34)}"/><path class="ln hair" d="M${x} 244l12 10M${x + 12} 244l-12 10M${x + 6} 230v32"/>`).join('')}
  <path class="mass" d="M522 268h9v62l-2-5-3 8-2-6-2 7ZM649 268h9v60l-2-4-2 7-3-6-2 6Z"/>
  <path class="wall" d="M600 340v-12q0-8 8-6h38q8-2 8 6v12" style="stroke-width:1.6"/>
  <path class="ln fine" d="M538 340l8-52M562 340l-8-52M550 340v-40"/>
  <rect class="wall" x="534" y="288" width="32" height="20" style="stroke-width:1.1"/>
  <path class="ln hair" d="M534 288l12 7M566 288l-12 7M534 308l12-6M566 308l-12-6M546 295h8v7h-8Z"/>
  <ellipse class="ln fine" cx="594" cy="334" rx="5" ry="4"/><path class="ln fine" d="M597 331l12-14"/>
  <path class="mass" d="M534 335h9v5h-9ZM536 331h7v4h-7Z"/>

  <!-- walls, broken by doorways -->
  <path class="ln" d="M300 176H660M300 176V290M660 176V340M300 220H446M514 220H660M300 280H440M440 220V246M440 280V306M520 220V306"/>
  <path class="ln" d="M280 176V290M680 176V340"/>

  <!-- plinth and the vault: a paper slot in the plinth, under bedroom and hall -->
  <rect class="mass" x="280" y="340" width="400" height="28"/>
  <rect class="wall" x="330" y="346" width="80" height="18" style="stroke:none"/>
  <rect class="ln hair" x="332" y="348" width="76" height="14"/>
  <rect class="mass" x="404" y="348" width="6" height="16"/>
  <path class="ln fine" d="M348 364v-6h12v6M378 364v-6h12v6"/>
  <g id="coffin" class="lift"><path class="wall" d="M344 358l4-5h40l4 5Z" style="stroke-width:1.1"/></g>

  <path id="fissure-above" class="ln fine" pathLength="7" d="${FISSURE}" style="stroke-dasharray:0 7"/>

  <!-- the closed façade: paper, black eye-like lancets; flown out once the door gives -->
  <g id="facade" class="facade">
    <rect class="wall" x="280" y="176" width="400" height="164"/>
    <path class="ln hair" d="${Array.from({ length: 13 }, (_, i) => `M282 ${188 + i * 12}H678`).join('')}" style="stroke-dasharray:34 5 21 4 46 6"/>
    <path class="ln fine" d="M280 176q5 6 10 0q5 6 10 0q5 6 10 0q5 6 10 0q5 6 10 0q5 6 10 0q5 6 10 0q5 6 10 0q5 6 10 0q5 6 10 0q5 6 10 0q5 6 10 0q5 6 10 0q5 6 10 0q5 6 10 0q5 6 10 0q5 6 10 0q5 6 10 0q5 6 10 0q5 6 10 0q5 6 10 0q5 6 10 0q5 6 10 0q5 6 10 0q5 6 10 0q5 6 10 0q5 6 10 0q5 6 10 0q5 6 10 0q5 6 10 0q5 6 10 0q5 6 10 0q5 6 10 0q5 6 10 0q5 6 10 0q5 6 10 0q5 6 10 0q5 6 10 0q5 6 10 0q5 6 10 0"/>
    <path class="mass" d="${[314, 352, 390, 558, 596, 634].map(x => lancet(x, 190, 12, 26)).join('')}${[340, 400, 560, 620].map(x => lancet(x, 238, 12, 32)).join('')}${[294, 654].map(x => lancet(x, 214, 12, 26)).join('')}"/>
    <path class="mass" d="M284 340V306Q284 290 300 282Q316 290 316 306V340Z"/>
    <rect class="mass" x="280" y="340" width="400" height="28"/>
  </g>
</g>`;

// Gorey silhouettes on toy-theatre sticks: ink bodies, blank paper faces, ~40 tall, feet at 0,0, facing right.
const FIGURES = `
<g id="f-guest">
  <path class="mass" d="M-4-26C-6-17-10-7-11 0H11C10-7 6-17 4-26Z"/>
  <path class="ln fine" d="M3-25C9-24 13-19 15-15"/>
  <ellipse class="face" cx="0" cy="-29.5" rx="3.6" ry="4.3"/>
  <path class="mass" d="M-3.2-33V-40H3.2V-33Z"/><path class="ln" d="M-5.5-33H5.5"/>
</g>
<g id="f-roderick">
  <path class="mass" d="M-4.5-31C-7-20-9-8-10 0H10C9-8 7-20 4.5-31Z"/>
  <ellipse class="face" cx="0" cy="-35.5" rx="3.5" ry="4.6"/>
  <path class="ln hair" d="M-3-39c-7-3-4-10 1-8c3-6 9-3 7 1c6 0 6 7 1 8M-4-35c-6 1-8-4-4-7M4-35c6 1 8-4 4-7M-1-41c-2-5 2-7 3-4"/>
</g>
<g id="f-madeline">
  <path class="robe" d="M-4-35C-6-23-8-11-9 0H17C11-1 8-3 7-7C6-18 5-27 4-35Z"/>
  <ellipse class="robe" cx="0" cy="-39" rx="3.3" ry="4.4"/>
  <path class="robe" d="M-3.6-42Q0-45.5 3.6-42L4.6-33H-4.6Z"/>
</g>
<g id="f-valet">
  <path class="mass" d="M-2.6-32C-4-22-4.5-10-3.5-3H3.5C4.5-10 4-22 2.6-32Z"/>
  <path class="ln fine" d="M-2-3L-1.4 0M2-3L1.4 0"/>
  <ellipse class="face" cx="0" cy="-35.5" rx="2.9" ry="3.8"/>
</g>
<g id="f-physician">
  <path class="mass" d="M-7-20C-10-12-11-5-10 0H10C11-5 10-12 7-20Z"/>
  <ellipse class="face" cx="0" cy="-23.5" rx="4" ry="4"/>
  <circle class="mass" cx="2.4" cy="-24" r=".9"/>
  <path class="mass" d="M-3.6-27V-34H3.6V-27Z"/><path class="ln" d="M-6-27.4H6"/>
  <rect class="mass" x="9" y="-9" width="8" height="7"/><path class="ln fine" d="M11-9q2-3 4 0"/>
</g>
<g id="f-servant">
  <path class="mass" d="M-5-24C-7-15-8-7-8 0H8C8-7 7-15 5-24Z"/>
  <ellipse class="face" cx="0" cy="-27.5" rx="3.4" ry="4"/>
  <path class="mass" d="M-3.6-30.5Q0-35 3.6-30.5Z"/>
</g>
<g id="f-peasant">
  <path class="mass" d="M-6-20C-8-12-8-6-7 0H7C8-6 8-14 4-22Z"/>
  <ellipse class="face" cx="2" cy="-23" rx="3.4" ry="3.8"/>
  <path class="ln" d="M-7-26.5H10"/><path class="mass" d="M-2.5-26.5V-30H6V-26.5Z"/>
  <path class="ln fine" d="M-9 0L-6-30"/>
</g>
<g id="f-horse">
  <path class="mass" d="M-14-23C-6-26 8-26 16-22L18-12L15-12L14 0H12L11-12H-8L-9 0H-11L-12-13C-15-15-16-19-14-23Z"/>
  <path class="mass" d="M-11-23L-17-36L-25-33L-24-30L-18-31L-13-17Z"/>
  <path class="ln fine" d="M16-21C22-19 23-11 21-6"/>
</g>
<g id="f-hand">
  <rect class="mass" x="-36" y="-7" width="7" height="14"/>
  <path class="wall" style="stroke-width:1.4" d="M-29-6H-14Q-11-7-8-5.5H8Q11-5.5 11-2.5Q11 .5 8 .5H-5Q-2.5 2.5-5 4.5Q-2.5 6.5-5.5 8.5H-29Z"/>
  <path class="ln hair" d="M-13 .5H-6M-14 4.5H-6"/>
</g>`;

// The tarn's truths, in house coordinates; the group that holds them carries the flip.
// They don't ripple. Each is shown once its chapter has been played (unannounced, during the game).
const person = (x, y) => `<path d="M${x - 4} ${y - 34}C${x - 6} ${y - 22} ${x - 8} ${y - 10} ${x - 9} ${y}H${x + 12}C${x + 8} ${y - 2} ${x + 7} ${y - 6} ${x + 6} ${y - 9}C${x + 5} ${y - 19} ${x + 4} ${y - 27} ${x + 4} ${y - 34}"/><ellipse class="solid" cx="${x}" cy="${y - 38.5}" rx="3.3" ry="4.3"/>`;
const TRUTHS = `
  <path data-truth="fissure" class="shown" d="${FISSURE}"/>
  <g data-truth="window"><path class="solid" d="${lancet(390, 186, 12, 26)}"/><path d="M393 212v-9q3-4 6 0v9"/></g>
  <g data-truth="face">${person(298, 340)}</g>
  <g data-truth="cellar"><path d="M336 362h68"/><path d="M346 360c4-5 10-5 14-4h30c3 0 4 3 2 4Z"/><ellipse class="solid" cx="343" cy="357.5" rx="3.6" ry="3"/></g>
  <g data-truth="lid"><path d="M344 362h48"/><path d="M346 362v-6h44v6"/><path d="M334 362l12-15h4l-12 15Z"/></g>
  <g data-truth="stair"><path d="M404 348l-8 3v13"/>${person(482, 312)}</g>
  <g data-truth="doors"><path d="M440 246l-14 6v28"/>${person(452, 280)}</g>
  <g data-truth="whole">${WINDOWS.map(w => `<path class="solid" d="${lancet(...w)}"/>`).join('')}</g>`;

export const TRUTH_IDS = ['fissure', 'window', 'face', 'cellar', 'lid', 'stair', 'doors', 'whole'];

// Where things are, for hits, labels, the manicule and the iris (map coordinates).
export const ROOMS = {
  tarn:     { rect: [14, 368, 932, 256], label: 'the tarn', labelAt: [720, 392], anchor: [760, 470], hand: [700, 384, 90] },
  bank:     { rect: [14, 300, 120, 68], label: 'the bank', anchor: [70, 340] },
  causeway: { rect: [134, 320, 146, 48], label: 'the causeway', anchor: [220, 352], hand: [222, 300, 90] },
  door:     { rect: [270, 176, 410, 164], label: 'the door', labelAt: [324, 332], anchor: [300, 316], hand: [300, 262, 90] },
  gallery:  { rect: [300, 176, 360, 44], label: 'the gallery', anchor: [480, 200], hand: [530, 170, 90] },
  bedroom:  { rect: [300, 220, 140, 60], label: 'your bedroom', anchor: [370, 252], hand: [392, 214, 90] },
  hall:     { rect: [300, 280, 140, 60], label: 'the hall', anchor: [370, 312], hand: [370, 276, 90] },
  stair:    { rect: [440, 220, 80, 120], label: 'the stair', anchor: [480, 280], hand: [480, 214, 90] },
  studio:   { rect: [520, 220, 140, 120], label: 'the studio', anchor: [590, 290], hand: [610, 214, 90] },
  vault:    { rect: [300, 340, 140, 28], label: 'the vault', anchor: [370, 355], hand: [370, 322, 90] },
};

export function mapMarkup(titles) {
  const cloud = `M14 -80H700V70Q690 84 660 78${ragged(14, 640, 92, 18, 22, 11)}Z`;
  // clip paths that split the house along its fissure
  const fp = FP.map(p => p.join(' ')).join(' L');
  const left = `M-3000 -3000 L486 -3000 L${fp} L488 3000 L-3000 3000Z`;
  const right = `M486 -3000 L${fp} L488 3000 L3000 3000 L3000 -3000Z`;
  return `
<defs>
  <pattern id="hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
    <line x1="0" y1="0" x2="0" y2="5" style="stroke:var(--ink);stroke-width:.8"/>
  </pattern>
  <pattern id="hatch-h" width="9" height="4" patternUnits="userSpaceOnUse">
    <path d="M0 2h6.5" style="stroke:var(--ink);stroke-width:.7;stroke-linecap:round"/>
  </pattern>
  <filter id="cutout" x="-10%" y="-10%" width="125%" height="125%">
    <feOffset in="SourceAlpha" dx="2" dy="3" result="o"/>
    <feFlood flood-color="#cbc3b8"/><feComposite in2="o" operator="in" result="s"/>
    <feMerge><feMergeNode in="s"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <filter id="ripple" x="-5%" y="-5%" width="110%" height="110%">
    <feTurbulence type="turbulence" baseFrequency="0.006 0.09" numOctaves="2" seed="7" result="n">
      <animate attributeName="baseFrequency" dur="14s" repeatCount="indefinite" values="0.006 0.09;0.006 0.115;0.006 0.09"/>
    </feTurbulence>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="7" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
  <linearGradient id="deep" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#fff" stop-opacity=".62"/>
    <stop offset="1" stop-color="#fff" stop-opacity=".12"/>
  </linearGradient>
  <mask id="depth" maskUnits="userSpaceOnUse" x="0" y="368" width="960" height="272">
    <rect x="0" y="368" width="960" height="256" fill="url(#deep)"/>
  </mask>
  <clipPath id="clip-sky"><rect x="14" y="14" width="932" height="354"/></clipPath>
  <clipPath id="clip-above"><rect x="-3000" y="-3000" width="7000" height="3368"/></clipPath>
  <clipPath id="clip-left"><path d="${left}"/></clipPath>
  <clipPath id="clip-right"><path d="${right}"/></clipPath>
  ${GROUNDS}
  ${HOUSE}
  ${FIGURES}
  <g id="cast"></g>
</defs>

<rect class="sky" x="14" y="14" width="932" height="354"/>
<g clip-path="url(#clip-sky)">
  <g id="clouds" class="clouds"><path d="${cloud}" style="fill:url(#hatch-h)"/></g>
  <rect id="night" class="night" x="14" y="14" width="932" height="354"/>
  <circle id="moon" class="moon" cx="484" cy="246" r="46"/>
</g>

<g id="cartouche" class="cartouche">
  <rect class="cart-a" x="196" y="30" width="568" height="80"/>
  <rect class="cart-b" x="203" y="37" width="554" height="66"/>
  <text class="t-title" x="480" y="88" text-anchor="middle">${titles.above}</text>
</g>

<use href="#grounds" class="above"/>
<g clip-path="url(#clip-above)">
  <use id="house-whole" href="#house" class="above"/>
  <g id="sink-left" class="half"><use href="#house" class="above" clip-path="url(#clip-left)"/></g>
  <g id="sink-right" class="half"><use href="#house" class="above" clip-path="url(#clip-right)"/></g>
</g>
<use href="#cast" class="above"/>

<rect class="tarn" x="14" y="368" width="932" height="256"/>
<g class="below">
  <g mask="url(#depth)">
    <g transform="${FLIP}" filter="url(#ripple)">
      <use href="#grounds"/><use href="#house"/><use href="#cast"/>
    </g>
  </g>
  <g id="title-below" class="title-below" filter="url(#ripple)">
    <text class="t-title-below" transform="translate(480 586) scale(1 -.85)" text-anchor="middle">${titles.below}</text>
  </g>
  <g id="truths" class="truth" transform="${FLIP}">${TRUTHS}</g>
</g>

<rect class="frame-a" x="8" y="8" width="944" height="624"/>
<rect class="frame-b" x="14" y="14" width="932" height="612"/>

<g id="hits"></g>
<g id="hand" class="hand"><use href="#f-hand"/></g>
<text id="hover-label" class="t-label-svg" x="0" y="0"></text>`;
}
