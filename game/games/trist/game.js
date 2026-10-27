// Trist: One of Your Favorite Romances (chapter VI; absorbs the opening of VII).
// You draw Ethelred's blows on a one-colour woodcut romance. Then the page turns
// over: the blows were Madeline's, clawing out of the vault, and the dragon is her
// brother. Spec: work/design/games/trist.md. Contract: work/design/CONTRACT.md.
//
// Every colour and weight goes through CSS custom properties and classes scoped
// to .g-trist, so a change of visual direction is a token swap.

const NS = 'http://www.w3.org/2000/svg';
const FLOOR = 372;                              // romance floor line
const DOOR_X = 580, PLANK_W = 35, DOOR_TOP = 136;
const HERO_DOOR = 330, HERO_HALL = 300;
const REST = -40;                               // mace angle at rest
const MACE = 116;                               // shoulder to mace head

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
const STATIONS = [
  { k: 'lid', n: 2, pos: null, box: [212, 462, 96, 70], words: [['crack.', 28], ['RIP.', 40]], echo: ['…cracked,', '…and ripped,'], cap: 'lid' },
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
  --g-trist-truth:color-mix(in srgb,var(--red,#7a3939) 65%,var(--paper,#f2eee5));
  --g-trist-w:2;--g-trist-fine:1.1;--g-trist-hatch:.8;--g-trist-gouge:4.4;--g-trist-stroke:3.4}
.g-trist svg{display:block;width:100%;height:100%;touch-action:none;cursor:crosshair}
.g-trist text{font-family:var(--serif,'IM Fell English',Georgia,serif);fill:var(--ink)}
.g-trist .teach{font-size:26px;font-style:italic}
.g-trist .cap,.g-trist .say{font-size:21px;font-style:italic}
.g-trist .vcap{font-size:21px;font-style:italic}
.g-trist .vcap .s{fill:var(--muted);text-decoration:line-through}
.g-trist .vcap .r{fill:var(--red)}
.g-trist .vcap .R{fill:var(--red);font-size:28px}
.g-trist .vcap .l,.g-trist .lab{font-style:normal;font-size:14px;letter-spacing:.14em;fill:var(--muted)}
.g-trist .lab.on-ink{fill:var(--rule)}
.g-trist .snd{font-style:italic}
.g-trist .snd.truth{fill:var(--g-trist-truth)}
.g-trist .snd.paper,.g-trist .end-line{fill:var(--paper)}
.g-trist .snd.muted{fill:var(--muted)}
.g-trist .end-line{font-size:22px;font-style:italic}
.g-trist .m{fill:var(--ink)}
.g-trist .pp{fill:var(--paper)}
.g-trist .hatch{fill:url(#gt-hatch)}
.g-trist .rainfill{fill:url(#gt-rain)}
.g-trist .ln,.g-trist .lnp,.g-trist .lnr,.g-trist .lnm,.g-trist .lnt{fill:none;stroke-width:var(--g-trist-w);stroke-linecap:round;stroke-linejoin:round}
.g-trist .ln{stroke:var(--ink)}
.g-trist .lnp{stroke:var(--paper)}
.g-trist .lnr{stroke:var(--rule)}
.g-trist .lnm{stroke:var(--muted)}
.g-trist .lnt{stroke:var(--g-trist-truth)}
.g-trist .fine{stroke-width:var(--g-trist-fine)}
.g-trist .hl{stroke-width:var(--g-trist-hatch)}
.g-trist .w3{stroke-width:3}
.g-trist .w4{stroke-width:4}
.g-trist .w8{stroke-width:8}
.g-trist .face{fill:var(--paper);stroke:var(--ink);stroke-width:1.3}
.g-trist .plank{fill:var(--paper);stroke:var(--ink);stroke-width:1.4}
.g-trist .grain{fill:none;stroke:var(--muted);stroke-width:var(--g-trist-hatch)}
.g-trist .splinter{fill:var(--paper);stroke:var(--ink);stroke-width:1.2;stroke-linejoin:round}
.g-trist .slab{fill:var(--ink);stroke:var(--paper);stroke-width:var(--g-trist-w);stroke-linejoin:round}
.g-trist .slab.fine{stroke-width:1.5}
.g-trist .mw{fill:var(--paper);stroke:var(--muted);stroke-width:.9}
.g-trist .heart{fill:var(--g-trist-truth)}
.g-trist .neck{fill:none;stroke:var(--ink);stroke-width:30;stroke-linecap:round}
.g-trist .tongue{fill:none;stroke:var(--ink);stroke-width:4;stroke-linecap:round;stroke-linejoin:round}
.g-trist .paw{fill:var(--ink);stroke:var(--paper);stroke-width:1.2}
.g-trist .rain-l{stroke:var(--ink);stroke-width:.9;stroke-linecap:round;opacity:.45}
.g-trist .pat-l{stroke:var(--ink);stroke-width:var(--g-trist-hatch)}
.g-trist .hint{fill:none;stroke:var(--muted);stroke-width:2;stroke-dasharray:2 9;stroke-linecap:round;transition:opacity .6s}
.g-trist .hint.on-ink{stroke:var(--rule)}
.g-trist .stroke{fill:none;stroke-width:var(--g-trist-stroke);stroke-linecap:round;stroke-linejoin:round;opacity:.85}
.g-trist .stroke.ink{stroke:var(--ink)}
.g-trist .stroke.paper{stroke:var(--paper)}
.g-trist .gouge-o{fill:none;stroke:var(--ink);stroke-width:var(--g-trist-gouge);stroke-linecap:round;stroke-linejoin:round}
.g-trist .gouge-i{fill:none;stroke:var(--paper);stroke-width:1.1;stroke-linecap:round;stroke-linejoin:round}
.g-trist .gouge-p{fill:none;stroke:var(--paper);stroke-width:3;stroke-linecap:round;stroke-linejoin:round}
.g-trist .gouge-t{fill:none;stroke:var(--g-trist-truth);stroke-width:3.6;stroke-linecap:round;stroke-linejoin:round}
.g-trist .gouge-white{fill:none;stroke:var(--paper);stroke-width:9;stroke-linecap:round;stroke-linejoin:round}
.g-trist .scratch{fill:none;stroke:var(--g-trist-truth);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;opacity:.9}
.g-trist .smudge{fill:var(--ink);opacity:.35}
.g-trist .tally{fill:none;stroke-width:1.7;stroke-linecap:round}
.g-trist .tally.rule{stroke:var(--rule)}
.g-trist .tally.paper{stroke:var(--paper)}
.g-trist .vborder{fill:none;stroke:var(--paper);stroke-linejoin:round}
.g-trist .streak{stroke:var(--paper);stroke-width:1.6;stroke-linecap:round}
.g-trist .flood{flood-color:var(--rule)}
`;

const HEART = 'M0 4C-7-1-7-7-3.5-8C-1.5-8.6 0-7 0-5.5C0-7 1.5-8.6 3.5-8C7-7 7-1 0 4Z';

const SVG = `
<svg viewBox="0 0 960 640" xmlns="${NS}" role="img" aria-label="One of Your Favorite Romances. Draw the blow.">
<defs>
  <pattern id="gt-hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
    <line x1="0" y1="0" x2="0" y2="5" class="pat-l"/>
  </pattern>
  <pattern id="gt-rain" width="46" height="40" patternUnits="userSpaceOnUse">
    <path class="rain-l" d="M8 2l-4 13M33 17l-4 13M21 27l-4 13M44 6l-4 11"/>
  </pattern>
  <filter id="gt-ripple" filterUnits="userSpaceOnUse" x="32" y="496" width="896" height="116">
    <feTurbulence type="turbulence" baseFrequency="0.006 0.09" numOctaves="2" seed="7" result="n">
      <animate attributeName="baseFrequency" dur="14s" repeatCount="indefinite" values="0.006 0.09;0.006 0.115;0.006 0.09"/>
    </feTurbulence>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="7" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
  <filter id="gt-cutout" x="-10%" y="-10%" width="125%" height="125%">
    <feOffset in="SourceAlpha" dx="2" dy="3" result="o"/>
    <feFlood class="flood"/><feComposite in2="o" operator="in" result="s"/>
    <feMerge><feMergeNode in="s"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <clipPath id="gt-clip"><rect x="54" y="86" width="852" height="328"/></clipPath>
  <clipPath id="gt-shriek" clipPathUnits="userSpaceOnUse"><rect class="shriek-r" x="0" y="80" width="0" height="100"/></clipPath>
</defs>
<rect width="960" height="640" class="pp"/>
<g class="flip">

<!-- ═════ The romance: ink on paper ═════ -->
<g class="rom">
  <text class="teach rom-teach" x="48" y="62">Draw the blow.</text>
  <rect x="48" y="80" width="864" height="340" class="ln" style="stroke-width:1.5"/>
  <rect x="54" y="86" width="852" height="328" class="ln fine"/>
  <g clip-path="url(#gt-clip)">
    <rect class="rainfill rain" x="54" y="86" width="500" height="286"/>
    <g class="hall" transform="translate(0 -340)">
      <rect x="54" y="86" width="44" height="286" class="hatch"/>
      <rect x="862" y="86" width="44" height="286" class="hatch"/>
      <path class="ln fine" d="M120 372V206a48 48 0 0 1 96 0V372M246 372V206a48 48 0 0 1 96 0V372M380 372V206a48 48 0 0 1 96 0V372"/>
      <path class="ln fine" d="M54 100H906"/>
      <path class="ln fine" d="M470 138V162"/>
      <g class="shield" transform="translate(470 196)">
        <circle r="34" class="face" style="stroke-width:2"/>
        <circle r="25" class="ln fine"/>
        <circle r="5" class="m"/>
        <path class="ln hl" d="M-18-8H18M-16 8H16"/>
      </g>
      <g class="dragon">
        <path class="ln" style="stroke-width:10" d="M880 350C912 340 912 300 888 292"/>
        <path class="m" d="M690 372C676 330 700 290 744 280C790 270 846 274 872 300C892 322 892 352 884 372Z"/>
        <path class="pp" d="M726 356C732 336 756 324 790 324C826 324 848 336 856 356C836 366 748 366 726 356Z"/>
        <path class="hatch" d="M726 356C732 336 756 324 790 324C826 324 848 336 856 356C836 366 748 366 726 356Z"/>
        <path class="m" d="M752 288L772 170L796 226L826 160L842 230L872 196L866 290Z"/>
        <path class="lnp fine" d="M772 170L782 286M826 160L822 286M872 196L858 288"/>
        <path class="m" d="M704 372L708 334H734L738 372Z"/>
        <path class="ln fine" d="M698 372l7-6 4 6 4-6 4 6 4-6"/>
        <path class="neck"/>
        <path class="tongue"/>
        <g class="head">
          <path class="ln hl" d="M-14-22c-9-8-2-20 8-14c2-11 17-11 18 0c10-4 16 8 8 14M-30-20c-8-9 2-19 10-12M-2-30c-4-10 6-14 10-8"/>
          <path class="m" d="M10-18C2-30-40-28-72-14L-86-2L6 4Z"/>
          <g class="jaw"><path class="m" d="M6 2L-84 0C-64 12-28 18 6 14Z"/></g>
          <path class="m" d="M2-16L16-40L14-10Z"/>
          <circle cx="-26" cy="-12" r="3.6" class="pp"/>
          <g class="paws" style="display:none">
            <path class="paw" d="M-2-4C-10-26-2-46 12-50L18-44C8-38 6-22 10-6Z"/>
            <path class="paw" d="M-44-4C-52-24-48-40-36-46L-30-40C-38-32-38-18-34-6Z"/>
          </g>
        </g>
      </g>
    </g>
    <g class="doorflat">
      <rect x="${DOOR_X}" y="${DOOR_TOP}" width="${PLANK_W * 6}" height="${FLOOR - DOOR_TOP}" class="m"/>
      <g class="planks"></g>
      <rect x="560" y="120" width="20" height="252" class="m"/>
      <rect x="790" y="120" width="20" height="252" class="m"/>
      <path class="m" d="M524 106H826L808 92H542Z"/>
      <rect x="540" y="104" width="290" height="30" class="m"/>
      <rect x="828" y="86" width="78" height="286" class="hatch"/>
      <path class="hint" d="M448 214Q540 120 640 232"/>
      <path class="hint" d="M628 214L640 232L618 226"/>
    </g>
    <rect x="54" y="${FLOOR}" width="852" height="42" class="m"/>
    <path class="lnr hl" d="M60 386H900M60 400H900" style="opacity:.5"/>
    <g class="hero" transform="translate(${HERO_DOOR} ${FLOOR})">
      <g filter="url(#gt-cutout)">
        <path class="m" d="M-18-104C-22-70-30-32-34 0H32C28-32 22-70 18-104Z"/>
        <path class="m" d="M-25-100C-22-118 22-118 25-100Z"/>
        <path class="lnp fine" d="M-2-92V-58M-12-80H8"/>
        <ellipse class="face" cx="0" cy="-128" rx="11" ry="14"/>
        <path class="m" d="M-13-127C-15-152 15-152 13-127H8V-133H-8V-127Z"/>
        <path class="m" d="M2-147C8-170 30-178 42-166C28-168 14-162 2-147Z"/>
        <g class="arm" transform="translate(12 -100) rotate(${REST})">
          <path class="ln w8" d="M0 0H44"/>
          <path class="ln w3" d="M42 0H94"/>
          <circle cx="104" cy="0" r="12" class="m"/>
          <path class="ln" style="stroke-width:2.4" d="M104-19V19M85 0H123M91-13L117 13M91 13L117-13"/>
        </g>
      </g>
    </g>
    <g class="fx"></g>
  </g>
  <g class="speech"></g>
  <text class="cap c1" x="48" y="452"></text>
  <text class="cap c2" x="48" y="478"></text>
  <rect x="32" y="500" width="896" height="108" class="m"/>
  <g class="echo" filter="url(#gt-ripple)"></g>
  <g class="tally1"></g>
  <text class="lab on-ink tl1" x="912" y="598" text-anchor="end">BLOWS STRUCK 0</text>
</g>

<!-- ═════ The page turned over: the vault, paper on ink ═════ -->
<g class="vlt" style="display:none">
  <rect x="32" y="32" width="896" height="576" class="m"/>
  <rect x="32" y="32" width="780" height="138" class="pp"/>
  <g transform="translate(600 170)">
    <path class="ln fine" d="M-24 0V-58M-24-30H12M10-30V0"/>
    <path class="m" d="M-18-30C-18-50-14-64-8-70H6C10-60 12-46 10-30Z"/>
    <path class="m" d="M8-34H24V0H17V-26H8Z"/>
    <ellipse class="face" cx="-1" cy="-78" rx="6" ry="7.5"/>
    <path class="ln w4" d="M4-62L20-52"/>
    <path class="plank" style="stroke-width:1.2" d="M16-62L34-69L36-50L18-45Z"/>
    <path class="ln hl" d="M26-65L27-48"/>
  </g>
  <path class="ln fine" d="M660 170V122M650 122H670L664 106H656Z"/>
  <g class="rod">
    <path class="ln fine" d="M-22 0V-62M-22-30H16M14-30V0"/>
    <path class="m" d="M-16-30C-16-52-12-70-6-76H6C12-68 14-50 12-30Z"/>
    <path class="m" d="M8-34H26V0H18V-26H8Z"/>
    <ellipse class="face" cx="1" cy="-85" rx="6.5" ry="8"/>
    <path class="ln hl" d="M-6-90c-9-3-8-15 1-14c1-9 13-10 15-1c9-1 11 10 4 14M-8-84c-7 2-9-6-4-9"/>
    <g class="rdown"><path class="ln w4" d="M5-66L18-40"/></g>
    <g class="rup" style="display:none">
      <path class="ln" style="stroke-width:3.6" d="M-5-70L-10-80L-7-86M7-70L12-80L9-86"/>
      <circle cx="-6" cy="-86" r="3.4" class="face"/><circle cx="9" cy="-86" r="3.4" class="face"/>
    </g>
  </g>
  <g class="rdoor"><rect x="790" y="62" width="22" height="8" class="m"/><rect x="798" y="70" width="14" height="100" class="m"/></g>
  <text class="teach vteach" x="48" y="62"></text>
  <g class="vcap"></g>
  <g class="recho"></g>
  <path class="vborder" d="M40 178H820V40H920V600H40Z" style="stroke-width:1.5"/>
  <g class="tally2"></g>
  <path class="lnp fine" d="M40 580H660"/>
  <!-- coffin -->
  <path class="slab fine" d="M90 462L122 512L312 502L334 462V480L312 520L122 530L90 480Z"/>
  <path class="lnp fine" d="M134 530L124 580M150 530L160 580M296 522L286 580M312 520L322 580"/>
  <g class="lid">
    <path class="slab" d="M90 462L122 412L312 422L334 462L312 502L122 512Z"/>
    <path class="lnr hl" d="M122 412L132 462L122 512M312 422L304 462L312 502"/>
    <g class="lidmarks"></g>
    <path class="heart lidheart" d="${HEART}" transform="translate(212 462) scale(2.6)"/>
  </g>
  <!-- iron door, in its pier -->
  <path class="lnp fine" d="M406 186V396M484 186V396"/>
  <path class="lnr hl" d="M406 236H484M406 290H484M406 344H484M445 186V236M425 236V290M465 290V344M440 344V396"/>
  <path class="lnp fine" d="M410 580V396H480V580"/>
  <g class="idoor">
    <rect x="410" y="396" width="70" height="184" class="slab"/>
    <path class="lnp" style="stroke-width:3.2" d="M420 408h0M445 408h0M470 408h0M420 568h0M445 568h0M470 568h0M420 488h0M470 488h0"/>
    <path class="lnp w4" d="M404 424H440M404 552H440"/>
    <g class="idmarks"></g>
  </g>
  <!-- the coppered archway -->
  <path class="lnp" d="M540 580V470A40 40 0 0 1 620 470V580"/>
  <path class="lnp fine" d="M528 580V470A52 52 0 0 1 632 470V580"/>
  <path class="lnr hl copper"/>
  <g class="bars">
    <path class="lnp w3" d="M552 442V580M566 433V580M580 430V580M594 433V580M608 442V580"/>
    <path class="lnp" style="stroke-width:2.4" d="M542 500H618M542 552H618"/>
    <g class="armarks"></g>
  </g>
  <!-- the stair -->
  <path class="lnp" d="M660 580V${TOP(0)}H${RX(1)}V${TOP(1)}H${RX(2)}V${TOP(2)}H${RX(3)}V${TOP(3)}H${RX(4)}V${TOP(4)}H920"/>
  <path class="lnr hl stairtex"/>
  <g class="stmarks"></g>
  <g class="scratches"></g>
  <g class="mad" style="opacity:0">
    <path class="mw" d="M7-78C12-50 16-22 18 0H-46C-36-3-25-7-15-9C-13-38-11-58-7-78Z"/>
    <path class="mw" d="M-10-75C-8-86 8-86 10-75Z"/>
    <path class="lnp fine" d="M-5-100C-13-92-13-74-10-60"/>
    <ellipse class="mw" cx="0" cy="-92" rx="7" ry="9"/>
    <g class="marm" transform="translate(4 -70) rotate(30)">
      <path class="lnp" style="stroke-width:3.4" d="M0 0H30"/>
      <path class="lnp fine" d="M30 0l8-5M30 0h9M30 0l8 5"/>
    </g>
    <path class="heart chestheart" d="${HEART}" transform="translate(1 -60) scale(1.2)"/>
  </g>
  <path class="hint on-ink vhint" style="opacity:0" d="M870 96Q836 46 806 104"/>
  <g class="vfx"></g>
  <g class="gust"></g>
  <text class="lab on-ink tl2" x="908" y="590" text-anchor="end">BLOWS STRUCK 0</text>
  <g class="blk" style="display:none"><rect x="32" y="32" width="896" height="576" class="m"/></g>
</g>
</g>
<g class="ink"></g>
</svg>`;

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

    const root = document.createElement('div');
    root.className = 'g-trist';
    root.innerHTML = `<style>${CSS}</style>${SVG}`;
    stage.appendChild(root);
    const svg = root.querySelector('svg');
    const q = s => svg.querySelector(s);
    if (RM && svg.pauseAnimations) svg.pauseAnimations();

    const flipG = q('.flip'), rom = q('.rom'), vlt = q('.vlt'), inkL = q('.ink');
    const hero = q('.hero'), arm = q('.arm'), fx = q('.fx'), speechG = q('.speech');
    const echoG = q('.echo'), rain = q('.rain'), doorFlat = q('.doorflat'), hall = q('.hall');
    const neck = q('.neck'), tongue = q('.tongue'), head = q('.head'), jawG = q('.jaw'), paws = q('.paws');
    const shield = q('.shield'), romTeach = q('.rom-teach'), c1 = q('.c1'), c2 = q('.c2');
    const doorHints = [...doorFlat.querySelectorAll('.hint')];

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
      t.style.fontSize = size + 'px';
      t.textContent = text;
      if (RM) { transient.push(t); return t; }
      later(hold, () => { t.style.transition = 'opacity .6s'; t.style.opacity = '0'; later(650, () => t.remove()); });
      return t;
    }
    function clearTransient() { transient.forEach(t => t.remove()); transient = []; }
    // Her noise, upside down and red in the black margin, a beat before your blow.
    function echo(text) { word(echoG, rnd(110, 640), 548, text, 30, 'truth', 180 + rnd(-4, 4)); }
    function speak(x, y, text, ms = 2400) {
      const hw = text.length * 4.9;
      const t = el('text', { x: f1(clamp(x, 64 + hw, 896 - hw)), y, 'text-anchor': 'middle', class: 'say' }, speechG);
      t.textContent = text;
      later(ms, () => { t.style.transition = 'opacity .6s'; t.style.opacity = '0'; later(650, () => t.remove()); });
    }
    function caption(lines) { c1.textContent = lines[0] || ''; c2.textContent = lines[1] || ''; }
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
      tally1.replaceChildren(el('path', { class: 'tally rule', d: tallyPath(blows, 722, 514, 5, 2, false) }));
      tally2.replaceChildren(el('path', { class: 'tally paper', d: tallyPath(blows, 60, 196, 8, 4, true) }));
      tl1.textContent = tl2.textContent = `BLOWS STRUCK ${blows}`;
    }

    // ── the door's planks ──────────────────────────────────────────────────
    const planks = [];
    const planksG = q('.planks');
    for (let i = 0; i < 6; i++) {
      const x = DOOR_X + i * PLANK_W;
      const g = el('g', null, planksG), body = el('g', null, g);
      el('rect', { x, y: DOOR_TOP, width: PLANK_W, height: FLOOR - DOOR_TOP, class: 'plank' }, body);
      el('path', { class: 'grain', d: `M${x + 9} ${DOOR_TOP + 6}C${x + 13} 200 ${x + 7} 280 ${x + 11} ${FLOOR - 6}M${x + 24} ${DOOR_TOP + 10}C${x + 21} 230 ${x + 27} 300 ${x + 23} ${FLOOR - 10}` }, body);
      el('rect', { x, y: 166, width: PLANK_W, height: 9, class: 'm' }, body);
      el('rect', { x, y: 328, width: PLANK_W, height: 9, class: 'm' }, body);
      el('circle', { cx: x + 17.5, cy: 170.5, r: 1.7, class: 'pp' }, body);
      el('circle', { cx: x + 17.5, cy: 332.5, r: 1.7, class: 'pp' }, body);
      const marks = el('g', null, body);
      const brk = el('g', { style: 'display:none' }, g);
      el('path', { class: 'splinter', d: `M${x} ${DOOR_TOP}h${PLANK_W}v12l-6 9-7-11-8 15-6-8-8 11Z` }, brk);
      el('path', { class: 'splinter', d: `M${x} ${FLOOR}h${PLANK_W}v-16l-7-9-6 12-8-15-7 8-7-10Z` }, brk);
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
    function poseDragon(hx, hy, jaw, tip, pawsOn) {
      headX = hx; headY = hy;
      neck.setAttribute('d', `M726 304Q${f1((726 + hx) / 2 + 20)} ${f1(Math.min(hy, 300) - 34)} ${f1(hx + 4)} ${f1(hy - 2)}`);
      head.setAttribute('transform', `translate(${f1(hx)} ${f1(hy)})`);
      jawG.setAttribute('transform', `rotate(${jaw} 6 3)`);
      if (tip) {
        const mx = hx - 80, my = hy + 2;
        tongue.setAttribute('d', `M${f1(mx)} ${f1(my)}Q${f1(mx - 16)} ${f1((my + tip[1]) / 2 + 24)} ${f1(tip[0])} ${f1(tip[1])}l-13-6m13 6l-13 6`);
        tongue.style.display = '';
      } else tongue.style.display = 'none';
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
      return [x + 12 + (MACE - 8) * Math.cos(rad(ang)), FLOOR - 100 + (MACE - 8) * Math.sin(rad(ang))];
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
        carve(pl.marks, g, ['gouge-o', 'gouge-i']);
        doorGouges.push({ plank: i, slot, rel: g.map(([x, y]) => [x - box[0], y - box[1]]) });
        if (!saidNobody) { saidNobody = true; later(500, () => speak(heroX - 40, 150, 'Then nobody will mind.')); }
        if (breaks) {
          pl.body.style.display = 'none';
          pl.brk.style.display = '';
          brokenShown++;
          if (brokenShown >= 3) { through(); return; }
          word(fx, 500, box[1] - 30, 'RIP.', 44);
        } else word(fx, 505, box[1] - 30, 'crack.', 30);
      });
    }
    function through() {
      phase = 'toDragon';
      word(fx, 560, 250, 'TORE ALL ASUNDER.', 44, '', rnd(-3, 3), 1300);
      romTeach.textContent = '';
      doorHints.forEach(h => { h.style.opacity = '0'; });
      later(1300, () => {
        const done = () => {
          phase = 'dragon'; dragonLive = true; dState = 'cycle'; cycleStart = performance.now();
          romTeach.textContent = 'Strike as the head dips.';
          caption(CAP.dragon);
        };
        heroBase = HERO_HALL;
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
        speak(560, 150, 'Please. I’m very sensitive to noise.', 2200);
        later(1300, () => speak(heroX - 30, 150, 'Sorry.', 1500));
        later(1700, resume);
      } else {
        speak(560, 150, 'Please.', 1100);
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
      t.style.fontSize = '64px';
      t.textContent = 'SHRIEK';
      const len = (t.getComputedTextLength && t.getComputedTextLength()) || 250;
      const x0 = 500 - len / 2, r = q('.shriek-r');
      t.setAttribute('x', f1(x0));
      r.setAttribute('x', f1(x0 - 4));
      tween(RM ? 0 : 200, k => r.setAttribute('width', f1(len * .7 * k + 4)));
      caption(CAP.shriek);
      later(1300, () => echo('clangour.'));
      later(1600, () => {
        tween(RM ? 0 : 420, k => shield.setAttribute('transform', `translate(470 ${f1(196 + 150 * k * k)}) rotate(${f1(80 * k * k)})`), () => {
          word(fx, 572, 356, 'CLANG.', 40, '', rnd(-3, 3), 1400);
          caption(CAP.shield);
          later(500, () => speak(heroX - 20, 150, 'I didn’t touch it.', 2200));
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
    const mad = q('.mad'), marm = q('.marm'), chestHeart = q('.chestheart'), lidHeart = q('.lidheart');
    const lid = q('.lid'), idoor = q('.idoor'), bars = q('.bars'), rod = q('.rod'), rdoor = q('.rdoor');
    const vborder = q('.vborder'), vcap = q('.vcap'), vteach = q('.vteach'), recho = q('.recho');
    const vfx = q('.vfx'), scratches = q('.scratches'), vhint = q('.vhint');
    const marks = { lid: q('.lidmarks'), door: q('.idmarks'), arch: q('.armarks'), stair: q('.stmarks') };
    let station = 0, stationHits = 0, onBeats = 0, misses = 0, mercy = false;
    let beating = false, lastBeat = 0, nextBeat = 0;
    let madX = 372, madY = 580, madFacing = 1, madRot = 0, madLean = 0, madArm = 30, reel = false;
    let rodFacing = -1, rodRot = 0, thresholdTimer = 0;
    const interval = () => 1100 - 500 * Math.min(1, onBeats / 10);   // the heart quickens

    // copper on the archway, stone on the stair (drawn once)
    (() => {
      let d = '';
      for (let a = 0; a <= 180; a += 12) {
        const c = Math.cos(rad(180 + a)), s = Math.sin(rad(180 + a));
        d += `M${f1(580 + 41 * c)} ${f1(470 + 41 * s)}L${f1(580 + 51 * c)} ${f1(470 + 51 * s)}`;
      }
      d += 'M529 480H539M529 500H539M529 520H539M529 540H539M529 560H539M621 480H631M621 500H631M621 520H631M621 540H631M621 560H631';
      q('.copper').setAttribute('d', d);
      let s = '';
      for (let i = 0; i < 5; i++) for (let y = TOP(i) + 20; y < 580; y += 26) s += `M${RX(i) + 8} ${y}h${i === 4 ? 30 : 22}`;
      q('.stairtex').setAttribute('d', s);
    })();

    function vcaption(key) {
      vcap.replaceChildren();
      VCAP[key].forEach(([t, c], i) => {
        const y = 98 + i * 26 + (c === 'R' ? 6 * i : 0);
        el('text', { x: 48, y, class: c }, vcap).textContent = t;
      });
    }
    function setupVault() {
      drawTally();
      rod.setAttribute('transform', 'translate(720 170) scale(-1 1)');
      vteach.textContent = '';
      beating = true;
      lastBeat = performance.now();
      nextBeat = lastBeat + interval();
    }
    // Your door-strokes, re-cut in red on her coffin lid, one by one.
    function replay() {
      phase = 'replay';
      const step = RM ? 160 : 330;
      doorGouges.forEach((g, n) => {
        later(500 + n * step, () => {
          const cx = 136 + g.plank * 33 + (g.slot ? 10 : 0), cy = g.slot ? 474 : 448;
          const pts = g.rel.map(([x, y]) => [cx + x * .75, cy + y * .75]);
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
      madArm = clamp(poke ? 0 : ang, -80, 80);
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
        tween(RM ? 0 : 500, k => lid.setAttribute('transform', `translate(${f1(-40 * k)} ${f1(80 * k)}) rotate(${f1(-15 * k)} 90 462)`));
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
      madArm = 20;
      reel = true;                            // his sway, reused
      q('.rdown').style.display = 'none';
      q('.rup').style.display = '';           // in the dragon's pose, hands over his ears
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
      tween(RM ? 0 : 1000, k => { rdoor.setAttribute('transform', `translate(0 ${f1(-30 * k)})`); rdoor.style.opacity = 1 - k; });
      later(RM ? 300 : 900, () => {
        reel = false;
        tween(RM ? 0 : 700, k => { madRot = -80 * k * k; rodRot = -50 * k * k; }, () => { beating = false; });
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

    // ── the loop ───────────────────────────────────────────────────────────
    function frame(now) {
      if (!alive) return;
      raf = requestAnimationFrame(frame);
      const sway = RM ? 3 : 4 * Math.sin(now / 2600 * Math.PI * 2);   // the wine
      if (!frozen) swayA = sway;
      if (vlt.style.display === 'none') {
        hero.setAttribute('transform', `translate(${f1(heroX)} ${FLOOR}) rotate(${f1(swayA)})`);
        arm.setAttribute('transform', `translate(12 -100) rotate(${f1(armA)})`);
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
        if (RM) {
          lidHeart.style.opacity = chestHeart.style.opacity = f1(.55 + .45 * pulse);
        } else {
          lidHeart.setAttribute('transform', `translate(212 462) scale(${f1(2.6 * (1 + .4 * pulse))})`);
          chestHeart.setAttribute('transform', `translate(1 -60) scale(${f1(1.2 * (1 + .5 * pulse))})`);
        }
        const r = reel ? sway : 0;
        mad.setAttribute('transform', `translate(${f1(madX)} ${f1(madY)}) rotate(${f1(madRot + madLean * madFacing + r)}) scale(${madFacing} 1)`);
        marm.setAttribute('transform', `translate(4 -70) rotate(${f1(madArm)})`);
        const rs = RM ? 0 : sway * .75;     // Roderick rocks with the same sway [u45]
        rod.setAttribute('transform', `translate(720 ${f1(170 + (+rod.dataset.lift || 0))}) rotate(${f1(rodRot + rs)}) scale(${rodFacing} 1)`);
      }
      for (const tw of [...tweens]) {
        const k = Math.min(1, (now - tw.t0) / tw.dur);
        tw.fn(k);
        if (k >= 1) { tweens.delete(tw); if (tw.done) tw.done(); }
      }
    }
    raf = requestAnimationFrame(frame);

    // ── first ten seconds ──────────────────────────────────────────────────
    caption(CAP.door);
    drawTally();
    later(900, () => speak(685, 230, 'Nobody’s home!', 2600));

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      timers.clear();
      tweens.clear();
      svg.removeEventListener('pointerdown', onDown);
      svg.removeEventListener('pointermove', onMove);
      svg.removeEventListener('pointerup', onUp);
      svg.removeEventListener('pointercancel', onUp);
      svg.removeEventListener('contextmenu', noCtx);
      root.remove();
    };
  },
};
