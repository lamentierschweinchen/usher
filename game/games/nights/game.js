// V. The Seventh or Eighth Night: Papers, Please for the noises under your bed.
// Spec: work/design/games/nights.md. Contract: work/design/CONTRACT.md.
// Every colour, stroke and texture goes through CSS custom properties and classes
// (--paper, --ink, --muted, --rule, --red, --g-nights-*); no colours in SVG attributes.

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

// ---------- art ----------

const ROOM = `
<rect x="36" y="70" width="764" height="16" fill="url(#gn-hatch-h)"/>
<path d="M36 86H80L36 124Z" fill="url(#gn-hatch)"/>
<path d="M680 86H644L680 106Z" fill="url(#gn-hatch)"/>
<path class="gn-ln" d="M36 70H800M36 86H924M36 70V186M680 86V108M800 70V86"/>
<path class="gn-mass" d="M680 108L702 114V181L680 186Z"/>
<g class="gn-drapes">
  <path class="gn-ln gn-fine" d="M48 96H172"/>
  <circle class="gn-mass" cx="48" cy="96" r="3"/><circle class="gn-mass" cx="172" cy="96" r="3"/>
  <g class="gn-panel"><path class="gn-mass" d="M56 97C60 120 52 150 58 182L64 175 70 184 76 174 84 183C82 150 90 120 94 97Z"/>
    <path class="gn-ln gn-fine gn-paperline" d="M70 104C72 130 66 156 70 172M82 104C84 128 80 150 82 166"/></g>
  <g class="gn-panel gn-panel-b"><path class="gn-mass" d="M126 97C124 128 134 150 128 180L136 173 142 183 150 175 158 184C158 150 168 128 166 97Z"/>
    <path class="gn-ln gn-fine gn-paperline" d="M140 104C138 130 146 152 142 170M154 104C154 128 160 150 156 168"/></g>
</g>
<path class="gn-ln gn-fine" d="M266 158H304M271 158V186M299 158V186M268 172H302"/>
<path class="gn-wall" d="M282 158V145H288V158Z"/>
<path class="gn-mass" d="M285 142C281.5 138 284 133 285.5 129C287.5 134 289 138 285 142Z"/>
<path class="gn-ln" d="M338 98V186M522 98V186"/>
<rect class="gn-mass" x="330" y="93" width="200" height="9"/>
<path class="gn-ln gn-fine" d="M332 102q12.25 11 24.5 0t24.5 0t24.5 0t24.5 0t24.5 0t24.5 0t24.5 0t24.5 0"/>
<path class="gn-wall" d="M340 104C342 124 360 134 352 150C348 158 343 164 341 176H347C352 160 368 136 356 104Z"/>
<path class="gn-wall" d="M520 104C518 124 500 134 508 150C512 158 517 164 519 176H513C508 160 492 136 504 104Z"/>
<rect class="gn-wall" x="346" y="149" width="168" height="15"/>
<path class="gn-wall" d="M384 147C424 141 470 143 514 147V166C470 170 424 168 384 165Z"/>
<ellipse class="gn-wall" cx="366" cy="145" rx="17" ry="7"/>
<path class="gn-ln gn-fine" d="M404 152C434 150 462 151 500 153M414 159C444 158 472 159 506 161"/>
<path class="gn-wall" d="M580 160V118Q610 84 640 118V160Z"/>
<path class="gn-ln gn-fine" d="M610 97V160M580 132H640M572 161H648"/>
<g class="gn-rain"><path class="gn-ln gn-fine" d="M587 120l4 8M598 108l4 8M620 106l4 8M630 118l4 8M586 140l4 8M598 137l4 8M618 138l4 8M628 144l4 8"/></g>
<path class="gn-ln gn-fine" d="M806 150L924 180M818 153V186M842 159V186M866 165V186M890 171V186M914 177V186"/>
<rect class="gn-band" x="36" y="186" width="888" height="46"/>
<path class="gn-ln" d="M36 186H924"/>
<g class="gn-onink">
  <path class="gn-ln gn-fine" d="M682 232V211Q712 190 742 211V232"/>
  <path class="gn-ln gn-fine" d="M800 186V192H820V199H840V206H860V213H880V220H900V227H918"/>
</g>`;

// Her route, in red, drawn only in the reveal.
const ROUTE = `
<path class="gn-route-low" d="M424 222C520 228 610 228 712 228C790 228 850 229 908 229L806 191"/>
<path class="gn-route-hi" d="M806 183C780 176 742 174 706 174"/>
<circle class="gn-route-dot" cx="702" cy="174" r="3.4"/>
<text class="gn-t-snd gn-truth-low" x="430" y="213" text-anchor="middle">grating.</text>
<text class="gn-t-snd gn-truth-low" x="712" y="221" text-anchor="middle">scrape.</text>
<text class="gn-t-snd gn-truth-hi" x="836" y="140" text-anchor="middle">steps.</text>`;

const DRAW = {
  draperies: `<path class="gn-ln gn-fine" d="M138 54H196"/><circle class="gn-mass" cx="138" cy="54" r="2.5"/><circle class="gn-mass" cx="196" cy="54" r="2.5"/>
    <path class="gn-mass" d="M142 55C145 78 138 100 144 126L149 120 153 127 157 119 161 125C159 98 165 76 166 55Z"/>
    <path class="gn-mass" d="M170 55C172 80 180 100 176 124L181 118 185 126 189 119 193 124C192 98 194 78 193 55Z"/>
    <path class="gn-ln gn-fine gn-paperline" d="M153 62C154 82 151 100 153 116M182 62C183 84 186 100 184 114"/>`,
  storm: `<path class="gn-wall" d="M148 128V82Q168 54 188 82V128Z"/><path class="gn-ln gn-fine" d="M168 64V128M148 102H188"/>
    <path class="gn-ln gn-fine" d="M152 86l4 8M160 76l4 8M174 78l4 8M180 88l4 8M153 108l4 8M160 112l4 8M174 106l4 8M180 114l4 8"/>
    <path class="gn-ln gn-fine" d="M134 70q5 -6 10 0t10 0M182 58q5 -6 10 0"/>`,
  roderick: `<path class="gn-mass" d="M167 64C161 80 157 106 152 130H184C179 106 174 80 171 64Z"/>
    <ellipse class="gn-face" cx="169" cy="57" rx="5" ry="6.5"/>
    <path class="gn-ln gn-hair" d="M162 54c-6-4-3-12 3-11c1-7 10-7 11-1c7-2 9 6 4 10M161 58c-5 1-7-4-4-7M177 57c5 1 6-4 3-7M165 44c-2-4 2-7 5-5"/>
    <path class="gn-ln gn-fine" d="M163 80L149 88"/><path class="gn-wall" d="M142 88h9v11h-9z"/>
    <path class="gn-ln gn-fine" d="M146.5 88v-4M138 92l-5-2M138 97l-5 2"/>`,
  fancy: `<ellipse class="gn-wall" cx="168" cy="121" rx="26" ry="8"/>
    <path class="gn-ln gn-fine gn-dots" d="M146 66q4.5 -8 9 0t9 0t9 0t9 0"/>
    <path class="gn-ln gn-fine gn-dots" d="M150 79q4 -7 8 0t8 0t8 0t8 0"/>
    <circle class="gn-ln gn-fine" cx="161" cy="106" r="2"/><circle class="gn-ln gn-fine" cx="156" cy="95" r="3.2"/>`,
};

const CSS = `
.g-nights{
  --g-nights-ground:var(--paper); --g-nights-line:var(--ink); --g-nights-piece:var(--paper);
  --g-nights-band:var(--ink); --g-nights-band-line:var(--paper); --g-nights-shadow:var(--rule);
  --g-nights-hair:var(--rule); --g-nights-faint:var(--muted); --g-nights-stamp:var(--ink);
  --g-nights-truth:var(--red); --g-nights-truth-low:color-mix(in srgb,var(--red),var(--paper) 35%);
  --g-nights-w:2px; --g-nights-w-fine:1.1px; --g-nights-w-hatch:.8px;
  position:relative;width:100%;height:100%;overflow:hidden;
  background:var(--g-nights-ground);color:var(--g-nights-line);font-family:var(--serif);
  user-select:none;-webkit-user-select:none;touch-action:manipulation;-webkit-tap-highlight-color:transparent}
.g-nights svg{display:block;width:100%;height:100%}
.g-nights .gn-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
.g-nights text{font-family:var(--serif);fill:currentColor}
.g-nights .gn-ln{fill:none;stroke:currentColor;stroke-width:var(--g-nights-w);stroke-linecap:round;stroke-linejoin:round}
.g-nights .gn-fine{stroke-width:var(--g-nights-w-fine)}
.g-nights .gn-hair{stroke-width:.6px}
.g-nights .gn-mass{fill:currentColor}
.g-nights .gn-wall{fill:var(--g-nights-ground);stroke:currentColor;stroke-width:var(--g-nights-w-fine);stroke-linejoin:round}
.g-nights .gn-face{fill:var(--g-nights-piece);stroke:currentColor;stroke-width:var(--g-nights-w-fine)}
.g-nights .gn-paperline{stroke:var(--g-nights-band-line);opacity:.5}
.g-nights .gn-dots{stroke-dasharray:1.5 3.2}
.g-nights .gn-band{fill:var(--g-nights-band)}
.g-nights .gn-onink{color:var(--g-nights-band-line)}
.g-nights .gn-pat{stroke:var(--g-nights-line);stroke-width:var(--g-nights-w-hatch);stroke-linecap:round}
.g-nights .gn-flood{flood-color:var(--g-nights-shadow)}
.g-nights .gn-piece{fill:var(--g-nights-piece);stroke:currentColor;stroke-width:1.5px}
.g-nights .gn-hairrule{fill:none;stroke:var(--g-nights-hair);stroke-width:1px}
.g-nights .gn-rulel{stroke:var(--g-nights-hair);stroke-width:1px}
.g-nights .gn-blot{fill:var(--g-nights-line)}
.g-nights .gn-dot{fill:var(--g-nights-line);stroke:var(--g-nights-line);stroke-width:1.5px;transition:fill .3s}
.g-nights .gn-dot.spent{fill:none;stroke:var(--g-nights-hair)}
/* type, in viewBox units */
.g-nights .gn-t-line{font-size:24px;font-style:italic}
.g-nights .gn-t-label{font-size:14px;letter-spacing:.14em;fill:var(--g-nights-faint)}
.g-nights .gn-t-rule{font-size:18px;font-style:italic;fill:var(--g-nights-faint)}
.g-nights .gn-t-kind{font-size:50px;font-style:italic}
.g-nights .gn-t-field{font-size:36px}
.g-nights .gn-t-time{font-size:34px}
.g-nights .gn-t-remark{font-size:22px;font-style:italic;fill:var(--g-nights-faint)}
.g-nights .gn-t-snd{font-size:18px;font-style:italic}
.g-nights .gn-t-title{font-size:24px}
.g-nights .gn-t-limit{font-size:17px}
.g-nights .gn-t-back{font-size:23px;font-style:italic}
.g-nights .gn-t-hint{font-size:16px;font-style:italic;fill:var(--g-nights-faint)}
.g-nights .gn-t-entry{font-size:18px}
.g-nights .gn-t-stamp{font-size:40px;letter-spacing:.12em;fill:var(--g-nights-stamp)}
.g-nights .gn-t-stampby{font-size:19px;font-style:italic;fill:var(--g-nights-stamp)}
.g-nights .gn-t-boom{font-size:42px;font-style:italic;letter-spacing:.04em}
.g-nights .gn-t-inter{font-size:44px;font-style:italic;fill:var(--g-nights-band-line)}
.g-nights .gn-t-interrule{font-size:22px;font-style:italic;fill:var(--g-nights-hair)}
.g-nights .gn-t-borrowed{font-size:26px}
.g-nights .gn-t-say{font-size:20px;font-style:italic;fill:var(--g-nights-truth)}
.g-nights .gn-t-orig{font-size:26px;font-style:italic;fill:var(--g-nights-truth)}
.g-nights .gn-t-prompt{font-size:22px;font-style:italic}
/* pieces */
.g-nights [data-act]{cursor:pointer}
.g-nights [data-act]:focus{outline:none}
.g-nights [data-act]:focus-visible .gn-focus{stroke:var(--g-nights-line);stroke-width:2px;stroke-dasharray:4 4}
.g-nights .gn-slip{transition:transform .62s cubic-bezier(.2,.7,.2,1),opacity .3s}
.g-nights .gn-slip-rule{fill:none;stroke:var(--g-nights-hair);stroke-width:1px;transition:stroke .2s,stroke-width .2s}
.g-nights.gn-armed .gn-slip.cur .gn-slip-rule{stroke:var(--g-nights-line);stroke-width:2px}
.g-nights .gn-card{transition:transform .5s cubic-bezier(.2,.7,.2,1),opacity .4s}
.g-nights .gn-lift{transition:transform .22s cubic-bezier(.2,.7,.2,1);transform-box:fill-box;transform-origin:50% 100%}
.g-nights .gn-card.up .gn-lift{transform:translateY(-16px) rotate(-1.2deg)}
.g-nights .gn-card.up .gn-card-edge{stroke-width:2.5px}
.g-nights .gn-card.nudge .gn-lift{transform:translateY(-5px) rotate(1deg)}
@media (hover:hover){.g-nights .gn-card:not(.up):hover .gn-lift{transform:translateY(-5px)}}
.g-nights .gn-fv{transition:opacity .3s ease}
.g-nights .gn-fv:not(.on){opacity:0}
.g-nights .gn-imp{opacity:0}
.g-nights .gn-imp.on{opacity:.9}
.g-nights .gn-imp-box{fill:var(--g-nights-piece);fill-opacity:.55;stroke:var(--g-nights-stamp);stroke-width:4px}
.g-nights .gn-imp-box2{fill:none;stroke:var(--g-nights-stamp);stroke-width:1.4px}
.g-nights .gn-smudge{fill:var(--g-nights-line);opacity:0;transition:opacity .3s ease-out}
.g-nights .gn-smudge.on{opacity:.2;transition:none}
.g-nights .gn-mark .gn-sq{animation:gn-stir 1.1s ease-in-out infinite alternate}
@keyframes gn-stir{from{opacity:.25}to{opacity:1}}
.g-nights .gn-panel{transform-box:fill-box;transform-origin:50% 0}
.g-nights .windy .gn-panel{animation:gn-sway 3.4s ease-in-out infinite alternate}
.g-nights .windy .gn-panel-b{animation-duration:2.8s;animation-delay:-1.3s}
@keyframes gn-sway{from{transform:rotate(-1.8deg)}to{transform:rotate(1.8deg)}}
.g-nights .gn-rain{opacity:0;transition:opacity .6s}
.g-nights .windy .gn-rain{opacity:1}
.g-nights .gn-backbody{transform-box:fill-box;transform-origin:50% 100%;transition:transform .3s}
.g-nights .gn-back.beckon .gn-backbody{animation:gn-beckon 1.3s ease-in-out infinite alternate}
.g-nights.gn-rm .gn-back.beckon .gn-backbody{transform:translateY(-8px) rotate(-1deg)}
@keyframes gn-beckon{from{transform:translateY(0)}to{transform:translateY(-9px) rotate(-1deg)}}
.g-nights .gn-back.beckon .gn-back-edge{stroke-width:2.5px}
.g-nights .gn-entry{opacity:0;transition:opacity .5s}
.g-nights .gn-entry.on{opacity:1}
.g-nights .gn-boom{opacity:1;transition:opacity .6s}
.g-nights .gn-boom.off{opacity:0}
.g-nights .gn-fade{opacity:0;transition:opacity .6s}
.g-nights .gn-nc{opacity:0;transition:opacity .3s}
.g-nights .gn-nc.on{opacity:1}
.g-nights .gn-route{opacity:0;transition:opacity 1.4s}
.g-nights .gn-route.on{opacity:1}
.g-nights .gn-route-low{fill:none;stroke:var(--g-nights-truth-low);stroke-width:2.6px;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:.1 7}
.g-nights .gn-route-hi{fill:none;stroke:var(--g-nights-truth);stroke-width:2.6px;stroke-linecap:round;stroke-dasharray:.1 7}
.g-nights .gn-route-dot{fill:var(--g-nights-truth)}
.g-nights .gn-truth-low{fill:var(--g-nights-truth-low)}
.g-nights .gn-truth-hi{fill:var(--g-nights-truth)}
.g-nights .gn-rv-slip{opacity:0;transition:opacity .45s}
.g-nights .gn-rv-slip.on{opacity:1}
.g-nights .gn-rv-red{opacity:0;transition:opacity .6s}
.g-nights .gn-rv-red.on{opacity:1}
.g-nights .gn-strike{stroke:var(--g-nights-line);stroke-width:1.6px;stroke-linecap:round}
.g-nights .gn-show{opacity:0;transition:opacity .6s}
.g-nights .gn-show.on{opacity:1}
.g-nights .gn-lamp{fill:var(--g-nights-band);opacity:0;transition:opacity .9s;pointer-events:none}
.g-nights .gn-lamp.on{opacity:.9}
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
    const root = document.createElement('div');
    root.className = 'g-nights' + (RM ? ' gn-rm' : '');
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

    h('defs', {}, svg).innerHTML = `
      <pattern id="gn-hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line class="gn-pat" x1="0" y1="0" x2="0" y2="5"/></pattern>
      <pattern id="gn-hatch-h" width="9" height="4" patternUnits="userSpaceOnUse"><path class="gn-pat" d="M0 2h6.5"/></pattern>
      <filter id="gn-cutout" x="-10%" y="-10%" width="125%" height="125%"><feOffset in="SourceAlpha" dx="2" dy="3" result="o"/><feFlood class="gn-flood"/><feComposite in2="o" operator="in" result="s"/><feMerge><feMergeNode in="s"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <filter id="gn-bleed" x="-40%" y="-40%" width="180%" height="180%"><feTurbulence type="fractalNoise" baseFrequency=".05" numOctaves="3" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="34" xChannelSelector="R" yChannelSelector="G"/></filter>`;

    const L = {};
    for (const n of ['room', 'marks', 'route', 'top', 'left', 'back', 'cards', 'slips', 'fx', 'reveal', 'nc', 'lamp']) {
      L[n] = h('g', { class: 'gn-L-' + n }, svg);
    }

    // --- text fitting (squeeze, never overflow)
    const fits = new Map();
    function fit(el, max) {
      fits.set(el, max);
      try {
        el.removeAttribute('textLength');
        el.removeAttribute('lengthAdjust');
        if (el.getComputedTextLength() > max) {
          el.setAttribute('textLength', max);
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
    room.innerHTML = ROOM;
    const route = h('g', { class: 'gn-route' }, L.route);

    // --- top strip: teaching line (left), night and its rule (right)
    const lineEl = h('text', { class: 'gn-t-line', x: 36, y: 52 }, L.top);
    const nightEl = h('text', { class: 'gn-t-label', x: 924, y: 40, 'text-anchor': 'end' }, L.top);
    const ruleEl = h('text', { class: 'gn-t-rule', x: 924, y: 62, 'text-anchor': 'end' }, L.top);
    function say(t) {
      lineEl.textContent = t;
      fit(lineEl, 560);
      live.textContent = t;
    }

    // --- left: ink and the count
    const inkG = h('g', {}, L.left);
    const countEl = h('text', { class: 'gn-t-label', x: 52, y: 446 }, L.left);

    // --- back page: Unaccounted for
    const back = h('g', { class: 'gn-back', 'data-act': 'back', role: 'button', tabindex: '0',
      'aria-label': 'Unaccounted for: set the slip aside', transform: 'translate(712 244) rotate(1.2)' }, L.back);
    const backBody = h('g', { class: 'gn-backbody' }, back);
    h('rect', { class: 'gn-piece gn-back-edge gn-focus', x: 0, y: 0, width: 208, height: 214, filter: 'url(#gn-cutout)' }, backBody);
    h('path', { class: 'gn-ln gn-fine', d: 'M186 0V22H208' }, backBody);
    h('text', { class: 'gn-t-back', x: 16, y: 36 }, backBody, 'Unaccounted for');
    h('line', { class: 'gn-rulel', x1: 16, y1: 46, x2: 192, y2: 46 }, backBody);
    const entriesG = h('g', {}, backBody);
    const backHint = h('text', { class: 'gn-t-hint', x: 104, y: 196, 'text-anchor': 'middle' }, backBody, 'set a noise aside here');

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
      const lift = h('g', { class: 'gn-lift', filter: 'url(#gn-cutout)' }, g);
      h('rect', { class: 'gn-piece gn-card-edge gn-focus', x: 0, y: 0, width: 204, height: 140 }, lift);
      h('rect', { class: 'gn-hairrule', x: 5, y: 5, width: 194, height: 130 }, lift);
      fit(h('text', { class: 'gn-t-title', x: 14, y: 33 }, lift, c.title), 178);
      h('line', { class: 'gn-rulel', x1: 14, y1: 43, x2: 190, y2: 43 }, lift);
      c.limits.forEach((t, i) => fit(h('text', { class: 'gn-t-limit', x: 14, y: 66 + i * 20 }, lift, t), 122));
      h('g', {}, lift).innerHTML = DRAW[id];
      return { g };
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
        h('circle', { class: 'gn-dot' + (i < ink ? '' : ' spent'), cx: 112 + i * 30, cy: 387, r: 9 }, inkG);
      }
      countEl.textContent = `EXPLAINED ${stamped.length}`;
    }

    // --- room weather and marks
    function weather(windy) { room.classList.toggle('windy', windy); }
    function showMark(s) {
      L.marks.innerHTML = '';
      const p = PLACES[s.place];
      const g = h('g', { class: 'gn-mark' + (p.ink ? ' gn-onink' : ''), transform: `translate(${p.x} ${p.y})` }, L.marks);
      const sq = h('g', { class: 'gn-sq' }, g);
      h('path', { class: 'gn-ln gn-fine', d: 'M-15 -3q3.75 -6 7.5 0t7.5 0t7.5 0t7.5 0' }, sq);
      h('path', { class: 'gn-ln gn-fine', d: 'M-11 4q2.75 -5 5.5 0t5.5 0t5.5 0t5.5 0' }, sq);
      h('text', { class: 'gn-t-snd', x: p.w[0], y: p.w[1], 'text-anchor': p.w[2] }, g, KINDS[s.kind].word);
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
      const g = h('g', { class: 'gn-slip cur', 'data-act': 'slip', role: 'button', tabindex: '0' });
      const body = h('g', { filter: 'url(#gn-cutout)' }, g);
      h('rect', { class: 'gn-piece gn-focus', x: 0, y: 0, width: 420, height: 220 }, body);
      h('rect', { class: 'gn-slip-rule', x: 9, y: 9, width: 402, height: 202 }, g);
      h('text', { class: 'gn-t-label', x: 26, y: 40 }, g, `NO. ${n}`);
      const F = {
        time: field(g, 394, 46, 'gn-t-time', 'end', 140),
        kind: field(g, 26, 100, 'gn-t-kind', 'start', 368),
        place: field(g, 26, 166, 'gn-t-field', 'start', 368),
        loud: field(g, 26, 202, 'gn-t-field', 'start', 250),
      };
      if (s.remark) h('text', { class: 'gn-t-remark', x: 26, y: 130 }, g, s.remark);
      const smudge = h('ellipse', { class: 'gn-smudge', cx: 210, cy: 120, rx: 70, ry: 34, filter: 'url(#gn-bleed)' }, g);
      const imp = h('g', { class: 'gn-imp', transform: 'translate(252 128) rotate(-8)' }, g);
      h('rect', { class: 'gn-imp-box', x: -140, y: -46, width: 280, height: 92, rx: 6 }, imp);
      h('rect', { class: 'gn-imp-box2', x: -131, y: -37, width: 262, height: 74, rx: 3 }, imp);
      h('text', { class: 'gn-t-stamp', x: 0, y: 6, 'text-anchor': 'middle' }, imp, 'EXPLAINED');
      const impBy = h('text', { class: 'gn-t-stampby', x: 0, y: 29, 'text-anchor': 'middle' }, imp);
      return { s, el: g, F, imp, impBy, smudge };
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
      const lh = Math.min(25, 150 / Math.max(n, 1));
      const fs = Math.min(18, lh * 0.78);
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
      h('rect', { class: 'gn-band', x: 0, y: 0, width: 960, height: 640 }, g);
      const o = h('g', { class: 'gn-onink' }, g);
      h('rect', { class: 'gn-ln', x: 36, y: 36, width: 888, height: 568 }, o);
      h('rect', { class: 'gn-ln gn-fine', x: 44, y: 44, width: 872, height: 552 }, o);
      h('text', { class: 'gn-t-inter', x: 480, y: 312, 'text-anchor': 'middle' }, g, n.name + '.');
      h('text', { class: 'gn-t-interrule', x: 480, y: 364, 'text-anchor': 'middle' }, g, n.rule);
      g.getBoundingClientRect();
      g.classList.add('on');
      L.fx.innerHTML = '';
      later(() => setupNight(i, true), dur(320));
      later(() => {
        g.classList.remove('on');
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
          const H = 38 + r.swaps.length * 36;
          h('rect', { class: 'gn-piece', x: 0, y: 0, width: 640, height: H, filter: 'url(#gn-cutout)' }, b);
          h('text', { class: 'gn-t-label', x: 20, y: 25 }, b, `NO. ${r.no} · EXPLAINED · ${CARDS[r.card].title.toUpperCase()}`);
          const reds = [];
          const order = { kind: 0, place: 1, loud: 2 };
          [...r.swaps].sort((a, z) => order[a.field] - order[z.field]).forEach((sw, i) => {
            const ty = 60 + i * 36;
            const t1 = h('text', { class: 'gn-t-borrowed', x: 20, y: ty }, b, fieldLabel(sw.field, sw.to));
            let w = 0;
            try { w = t1.getComputedTextLength(); } catch (e) { w = 140; }
            const red = h('g', { class: 'gn-rv-red' }, b);
            h('line', { class: 'gn-strike', x1: 16, y1: ty - 9, x2: 24 + w, y2: ty - 9 }, red);
            const t2 = h('text', { x: 42 + w, y: ty }, red);
            h('tspan', { class: 'gn-t-say' }, t2, 'say, rather: ');
            h('tspan', { class: 'gn-t-orig' }, t2, fieldLabel(sw.field, sw.from));
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
      const score = h('text', { class: 'gn-t-label gn-show', x: 924, y: 604, 'text-anchor': 'end' }, L.reveal,
        `NOISES EXPLAINED ${n} · UNACCOUNTED FOR ${m} · SAW REASON ${k}`);
      fit(score, 600);
      const prompt = h('text', { class: 'gn-t-prompt gn-show', x: 816, y: 500, 'text-anchor': 'middle' }, L.reveal, 'Tap to put out the lamp.');
      later(() => score.classList.add('on'), t + dur(300));
      later(() => {
        prompt.classList.add('on');
        phase = 'ready';
        live.textContent = `${note} Noises explained ${n}, unaccounted for ${m}, saw reason ${k}. Tap to put out the lamp.`;
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
          'noises explained': `${stamped.length} of 13`,
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

    // --- go
    const start = Math.max(1, Math.min(3, (api.dev && +api.dev.startNight) || 1)) - 1;
    for (let i = 0; i < start; i++) no += NIGHTS[i].slips.length;
    setupNight(start);
    renderEntries(false);
    say(NIGHTS[start].open);
    later(deal, RM ? 150 : 450);

    return () => {
      alive = false;
      for (const id of timers) clearTimeout(id);
      timers.clear();
      root.removeEventListener('click', onClick);
      window.removeEventListener('keydown', onKey);
      root.remove();
    };
  },
};

function h(tag, attrs = {}, parent, text) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) if (attrs[k] != null) e.setAttribute(k, attrs[k]);
  if (text != null) e.textContent = text;
  if (parent) parent.appendChild(e);
  return e;
}
