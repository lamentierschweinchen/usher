// Studio · Hush — chapter III, "The Cheerfulness of My Society".
// Spare Roderick everything: draw the drapes on sunbeams, snip roses, smother the brass band.
// The game pays best of all for hushing the small red tap under the floor.
// Contract: work/design/CONTRACT.md. Look: work/design/LOOK.md. Spec: work/design/games/studio.md.

const NS = 'http://www.w3.org/2000/svg';

// ---- geometry (viewBox 960 x 640) ----
const FLOOR = 452;                       // floor line; boards 452-492, vault below
const FACE = { x: 468, y: 293 };         // Roderick's face: where every pest is headed
const WIN_W = 72, WIN_TOP = 80, WIN_BOT = 210, OPEN = 0.12;
const WINS = [
  { x: 250, spot: { x: 300, y: 424 } },
  { x: 480, spot: { x: 372, y: 438 } },
  { x: 710, spot: { x: 726, y: 318 } },
];
const VASES = [
  { x: 300, y: 356, aim: { x: 452, y: 300 } },
  { x: 690, y: 356, aim: { x: 486, y: 300 } },
];
const BANDS = [
  { x: 226, y: 486, ear: { x: 438, y: 306 } },
  { x: 740, y: 486, ear: { x: 500, y: 306 } },
];
const BOARD_CX = i => i * 120 + 60;
const VAULT_BOARD = 2;                   // the board nearest the vault
const CRACK = [[604, 68], [590, 132], [614, 196], [598, 260], [622, 324], [606, 388], [630, 452]];
const SITES = { W0: ['sun', 0], W1: ['sun', 1], W2: ['sun', 2], V0: ['rose', 0], V1: ['rose', 1], B0: ['band', 0], B1: ['band', 1] };
const SEQ = ['W2', 'B1', 'V0', 'W0', 'B0', 'V1', 'W1'];
const VALUE = { sun: 10, rose: 10, band: 20, tap: 50 };
const BAND_WORDS = ['TAN-TARA.', 'TAN-TARA.', 'OOM-PAH-PAH.', 'TAN-TARA.', 'TA-RA-RA.', 'TAN-TAN-TARA.', 'PARP.'];
const SPARE = 'Spare him everything.';
const NOTE_HUSHED = 'Everything is hushed. Roderick thanks you, and goes on listening to it.';
const NOTE_SPARED = 'Roderick heard it. He did not thank you.';

// ---- the scripted timeline (seconds) ----
function buildScript() {
  const s = [];
  const pest = (t, site, dur) => s.push({ t, k: 'pest', site, dur });
  // Introductions: one pest at a time, each gesture mimed once.
  pest(0.6, 'W0', 10); pest(5.5, 'V1', 9); pest(10.5, 'B0', 9);
  pest(15.5, 'W2', 8); pest(20.5, 'V0', 8); pest(25.5, 'B1', 8);
  s.push({ t: 28, k: 'tap', board: 5, dur: 4.5 });             // unmimed
  pest(30.5, 'W1', 7); pest(35.5, 'V1', 7); pest(40.5, 'B0', 7);
  // The rush: a pest per 2s (and a few doubles), taps every 7s.
  for (let t = 45; t <= 109; t += 2) s.push({ t, k: 'rush', dur: 5.6 - (t - 45) / 64 });
  for (let t = 52.9; t < 109; t += 6) s.push({ t, k: 'rush', dur: 5 });   // doubles: more than hands can manage
  for (const [t, board] of [[47.5, 6], [54.5, 1], [61.5, 3], [68.5, 7], [83.2, VAULT_BOARD], [90, 0], [97, 5], [104, 4]])
    s.push({ t, k: 'tap', board, dur: 3.2 });
  // The pale lady crosses a remote portion of the room; the taps stop.
  s.push({ t: 73.6, k: 'door', open: true });
  s.push({ t: 74.6, k: 'line', text: "We don't mention her." });
  s.push({ t: 75, k: 'lady' });
  s.push({ t: 82.4, k: 'door', open: false });
  s.push({ t: 83.6, k: 'line', text: SPARE });
  // The crescendo: everything at once, no taps. Then KNOCK.
  s.push({ t: 110, k: 'crescendo' });
  s.push({ t: 135, k: 'knock' });
  return s.sort((a, b) => a.t - b.t);
}

// ---- small helpers ----
const f = n => Math.round(n * 10) / 10;
const lerp = (a, b, k) => a + (b - a) * k;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const ease = k => (k < 0.5 ? 2 * k * k : 1 - (2 - 2 * k) ** 2 / 2);
function quad(a, c, b, t) {
  const u = 1 - t;
  return { x: u * u * a.x + 2 * u * t * c.x + t * t * b.x, y: u * u * a.y + 2 * u * t * c.y + t * t * b.y };
}
function distSeg(p, a, b) {
  const dx = b.x - a.x, dy = b.y - a.y, L2 = dx * dx + dy * dy || 1;
  const k = clamp(((p.x - a.x) * dx + (p.y - a.y) * dy) / L2, 0, 1);
  return Math.hypot(p.x - (a.x + k * dx), p.y - (a.y + k * dy));
}
function polyDist(p, pts) {
  let d = Infinity;
  for (let i = 1; i < pts.length; i++) d = Math.min(d, distSeg(p, pts[i - 1], pts[i]));
  return d;
}
function cross(a, b, c, d) {
  const o = (p, q, r) => Math.sign((q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x));
  return o(a, b, c) !== o(a, b, d) && o(c, d, a) !== o(c, d, b);
}

// ---- drawing: hair, figures, scene ----
function hairCloud(cx, cy) {
  let d = '';
  for (const [rx, ry, n, off] of [[36, 28, 15, 0], [29, 22, 12, 0.4], [21, 16, 9, 0.15]]) {
    let px = 0, py = 0;
    for (let i = 0; i <= n; i++) {
      const a = ((i % n) + off) / n * Math.PI * 2, j = 1 + 0.09 * Math.sin(i * 2.7 + rx);
      const x = cx + Math.cos(a) * rx * j, y = cy + Math.sin(a) * ry * j;
      if (!i) d += `M${f(x)} ${f(y)}`;
      else {
        const mx = (px + x) / 2, my = (py + y) / 2;
        d += `Q${f(mx + (mx - cx) * 0.32)} ${f(my + (my - cy) * 0.32)} ${f(x)} ${f(y)}`;
      }
      px = x; py = y;
    }
  }
  return d;
}
function hairUp(cx, cy) {
  let d = '';
  for (let i = 0; i < 19; i++) {
    const a = -Math.PI * (0.12 + 0.76 * i / 18), len = 44 + 20 * Math.sin(i * 1.9) ** 2;
    const x0 = cx + Math.cos(a) * 12, y0 = cy + Math.sin(a) * 15;
    const x1 = cx + Math.cos(a) * (12 + len), y1 = cy + Math.sin(a) * (15 + len);
    d += `M${f(x0)} ${f(y0)}Q${f((x0 + x1) / 2 + (i % 2 ? 4 : -4))} ${f((y0 + y1) / 2)} ${f(x1)} ${f(y1)}`;
  }
  return d;
}
function hairDroop(cx, cy) {
  let d = '';
  for (let i = 0; i < 16; i++) {
    const s = i / 15 * 2 - 1, x0 = cx + s * 12, y0 = cy - 13 + Math.abs(s) * 4;
    const x1 = cx + s * 30 + Math.sin(i * 2.1) * 3, y1 = cy + 20 + 9 * Math.sin(i * 1.3) ** 2;
    d += `M${f(x0)} ${f(y0)}Q${f(cx + s * 34)} ${f(cy - 18)} ${f(x1)} ${f(y1)}`;
  }
  return d;
}

const GOWN = 'M455 314C445 336 439 372 435 400C431 420 428 438 424 451H520C516 438 511 420 507 400C503 372 495 336 483 314Z';
function roderick() {
  return `
  <g data-pose="calm">
    <path class="gs-hair" d="${hairCloud(466, 283)}"/>
    <path class="gs-mass" d="${GOWN}"/>
    <path class="gs-pl" d="M461 318L469 332L477 318"/>
    <path class="gs-ln gs-fine" d="M469 309V316"/>
    <ellipse class="gs-face" cx="466" cy="294" rx="13" ry="17" transform="rotate(-9 468 310)"/>
    <ellipse class="gs-face" cx="461" cy="384" rx="7.5" ry="5"/><ellipse class="gs-face" cx="476" cy="386" rx="7.5" ry="5"/>
  </g>
  <g data-pose="startled" style="display:none">
    <path class="gs-hair" d="${hairUp(468, 290)}"/>
    <path class="gs-mass" d="${GOWN}"/>
    <path class="gs-mass" d="M457 320C446 318 438 306 440 292L447 291C448 302 454 310 462 314Z"/>
    <path class="gs-mass" d="M481 320C492 318 500 306 498 292L491 291C490 302 484 310 476 314Z"/>
    <ellipse class="gs-face" cx="468" cy="290" rx="13" ry="17"/>
    <circle class="gs-mass" cx="463" cy="287" r="1.7"/><circle class="gs-mass" cx="473" cy="287" r="1.7"/>
    <ellipse class="gs-face" cx="444" cy="287" rx="5" ry="7.5"/><ellipse class="gs-face" cx="494" cy="287" rx="5" ry="7.5"/>
  </g>
  <g data-pose="hidden" style="display:none">
    <path class="gs-mass" d="M452 332C442 352 437 378 435 400C431 420 428 438 424 451H520C516 438 512 420 509 400C505 378 498 352 486 332Z"/>
    <ellipse class="gs-face" cx="469" cy="319" rx="13" ry="15"/>
    <path class="gs-hair" d="${hairDroop(469, 318)}"/>
    <path class="gs-mass" d="M446 356C442 344 447 333 456 327L462 333C457 339 455 348 457 356Z"/>
    <path class="gs-mass" d="M492 356C496 344 491 333 482 327L476 333C481 339 483 348 481 356Z"/>
    <path class="gs-face" d="M455 331C451 321 455 310 463 306C466 306 468 310 468 316V335C464 337 458 336 455 331Z"/>
    <path class="gs-face" d="M483 331C487 321 483 310 475 306C472 306 470 310 470 316V335C474 337 480 336 483 331Z"/>
    <path class="gs-ln gs-fine" d="M459 318L462 311M462 323L465 313M479 318L476 311M476 323L473 313"/>
  </g>`;
}
function lady() {
  return `<g data-lady style="opacity:0">
    <path class="gs-lady" d="M-5 -96C-9 -68-15 -32-20 0C2 2 44 3 78 1C54 -3 34 -6 18 -9C14 -40 10 -70 5 -96Z"/>
    <ellipse class="gs-lady" cx="0" cy="-105" rx="6.5" ry="8.5"/>
    <path class="gs-hair" d="M3 -112C12 -104 11 -86 9 -72M5 -110C14 -100 15 -84 13 -74M-6 -88C-10 -72-10 -58-7 -46"/>
  </g>`;
}
const lancet = x => `M${x - 36} ${WIN_BOT}V118Q${x - 36} 92 ${x} ${WIN_TOP}Q${x + 36} 92 ${x + 36} 118V${WIN_BOT}Z`;
const HAND = `<path class="gs-hand" d="M-4.5 22V4Q-4.5 -1 0 -1Q4.5 -1 4.5 4V19Q10 16 13 21Q18 20 19 25Q23 26 22 31Q24 36 21 40L19 46H-5L-6 37Q-13 31-10 25Q-7 22-4.5 26Z"/>
  <path class="gs-ln gs-fine" d="M4.5 22Q10 22 12 24M6 28Q13 28 17 30M7 34Q14 34 19 36"/>
  <rect class="gs-mass" x="-7" y="46" width="28" height="9"/>`;
const DOOR = 'M142 452V346Q142 308 180 298Q218 308 218 346V452Z';

function scene(u) {
  const wins = WINS.map((w, i) => {
    let lat = '';
    for (let k = -3; k <= 3; k++) lat += `M${w.x - 36 + k * 24} 80l72 136M${w.x + 36 - k * 24} 80l-72 136`;
    return `<g data-win="${i}">
      <path class="gs-wall" d="${lancet(w.x)}"/>
      <g clip-path="url(#${u}-win${i})">
        <path class="gs-ln gs-hair-w" d="${lat}"/>
        <rect data-drape class="gs-mass" x="${w.x - 36}" y="76" width="${WIN_W}" height="140"/>
        <path data-folds class="gs-pl gs-faint" d=""/>
      </g>
      <path class="gs-ln" d="${lancet(w.x)}"/>
      <path class="gs-ln gs-heavy" d="M${w.x - 44} ${WIN_BOT + 2}H${w.x + 44}"/>
    </g>`;
  }).join('');
  let pennants = 'M0 0H960V52';
  for (let x = 960; x > 0; x -= 48) pennants += `L${x - 24} 68L${x - 48} 52`;
  pennants += 'Z';
  let boards = '', grain = '';
  for (let i = 0; i < 8; i++) {
    const x = i * 120;
    if (i) boards += `M${x} 452V492`;
    grain += `M${x + 10} 463h${38 + (i % 3) * 8}M${x + 66 - (i % 2) * 10} 463h${40}M${x + 22} 474h${52}M${x + 84} 474h22M${x + 8} 484h30M${x + 50} 484h${56 - (i % 2) * 14}`;
  }
  const table = x => `<path class="gs-ln gs-heavy" d="M${x - 32} 400H${x + 32}"/>
    <path class="gs-ln" d="M${x} 400V448M${x - 16} 452L${x} 442L${x + 16} 452"/>
    <path class="gs-wall" d="M${x - 10} 398C${x - 20} 392 ${x - 18} 376 ${x - 8} 370C${x - 12} 364 ${x - 9} 358 ${x - 5} 356H${x + 5}C${x + 9} 358 ${x + 12} 364 ${x + 8} 370C${x + 18} 376 ${x + 20} 392 ${x + 10} 398Z"/>`;
  const crack = CRACK.slice(1).map((p, i) =>
    `<path data-crack="${i}" class="gs-ln gs-crack" d="M${CRACK[i][0]} ${CRACK[i][1]}L${p[0]} ${p[1]}"/>` +
    `<path data-fork="${i}" class="gs-ln gs-fine" style="opacity:0" d="M${f((CRACK[i][0] + p[0]) / 2)} ${f((CRACK[i][1] + p[1]) / 2)}l${i % 2 ? 11 : -11} 7"/>`).join('');

  return `
  <defs>
    <pattern id="${u}-hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <line x1="0" y1="0" x2="0" y2="5" class="gs-hatch-line"/>
    </pattern>
    <filter id="${u}-cutout" x="-10%" y="-10%" width="125%" height="125%">
      <feOffset in="SourceAlpha" dx="2" dy="3" result="o"/>
      <feFlood class="gs-flood"/><feComposite in2="o" operator="in" result="s"/>
      <feMerge><feMergeNode in="s"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="${u}-ripple" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="turbulence" baseFrequency="0.006 0.09" numOctaves="2" seed="7" result="n">
        <animate attributeName="baseFrequency" dur="14s" repeatCount="indefinite" values="0.006 0.09;0.006 0.115;0.006 0.09"/>
      </feTurbulence>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="7" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
    ${WINS.map((w, i) => `<clipPath id="${u}-win${i}"><path d="${lancet(w.x)}"/></clipPath>`).join('')}
  </defs>

  <rect class="gs-paper" width="960" height="640"/>
  <path d="M134 68H232L134 166Z" style="fill:url(#${u}-hatch)"/>
  <path d="M826 68H728L826 166Z" style="fill:url(#${u}-hatch)"/>
  <g data-l="crack">${crack}</g>
  ${wins}
  <path class="gs-mass" d="${DOOR}"/>
  <g data-l="lady" transform="translate(872 450)">${lady()}</g>
  <g data-door-leaf>
    <path class="gs-wall gs-thin" d="${DOOR}"/>
    <path class="gs-ln gs-fine" d="M161 452V305M180 452V299M199 452V305M146 384H214"/>
    <circle class="gs-mass" cx="207" cy="392" r="2.6"/>
  </g>
  <path class="gs-ln gs-heavy" d="M136 452V344Q136 302 180 290Q224 302 224 344V452"/>

  <g data-drapery>
    <path class="gs-mass" d="M0 0H128C118 110 134 200 120 290C112 360 128 410 118 452H0Z"/>
    <path class="gs-pl gs-faint" d="M40 70C36 200 48 330 38 452M76 70C82 190 70 320 80 452M104 70C98 180 110 300 100 452"/>
    <g transform="translate(960 0) scale(-1 1)">
      <path class="gs-mass" d="M0 0H128C118 110 134 200 120 290C112 360 128 410 118 452H0Z"/>
      <path class="gs-pl gs-faint" d="M40 70C36 200 48 330 38 452M76 70C82 190 70 320 80 452M104 70C98 180 110 300 100 452"/>
    </g>
    <path class="gs-mass" d="${pennants}"/>
  </g>

  <g filter="url(#${u}-cutout)">
    ${table(300)}${table(690)}
    <path class="gs-wall" d="M352 402C340 384 336 346 350 330C360 320 378 326 374 342C371 354 378 362 396 364L560 368C576 370 586 382 588 402Z"/>
    <path class="gs-ln gs-fine" d="M352 334C358 328 366 332 364 340C362 346 356 344 357 339"/>
    <path class="gs-wall" d="M344 400H596Q604 400 604 408V418Q604 426 596 426H344Q336 426 336 418V408Q336 400 344 400Z"/>
    <path class="gs-ln" d="M352 426L346 450M588 426L594 450"/>
    <g data-l="roderick">${roderick()}</g>
  </g>
  <g data-l="beams"></g>
  <g data-l="roses"></g>

  <rect class="gs-paper" x="0" y="452" width="960" height="40"/>
  <path class="gs-ln gs-hair-w gs-faint-ink" d="${grain}"/>
  <path class="gs-ln" d="M0 452H960M0 492H960${boards}"/>
  <g data-l="ledger"></g>

  <rect class="gs-mass" x="0" y="492" width="960" height="148"/>
  <g class="gs-vault" filter="url(#${u}-ripple)">
    <path class="gs-pl" d="M186 640V556Q186 514 310 506Q434 514 434 556V640M200 640V560Q200 524 310 518Q420 524 420 560V640"/>
    <path class="gs-pl" d="M218 566H402M218 571H402M230 571V606M390 571V606M246 571V600M374 571V600"/>
    <path class="gs-pl gs-faint" d="M40 540H150M470 530H560M600 556H720M760 528H900M60 600H140M470 610H600"/>
  </g>

  <g data-l="taps"></g>
  <g data-l="bands"></g>
  <g data-l="knock"></g>
  <g data-l="fx"></g>
  <rect data-wash class="gs-wash" width="960" height="452"/>
  <g data-l="mime"></g>

  <text data-teach class="gs-teach" x="44" y="40"></text>
  <text data-score class="gs-score" x="916" y="598" text-anchor="end"><tspan class="gs-mult">×1</tspan><tspan dx="16">0</tspan></text>`;
}

// ---- scoped styles: every colour, weight and texture is a token ----
const CSS = `
.g-studio{
  --g-studio-line:2px; --g-studio-fine:1.1px; --g-studio-hairline:.8px; --g-studio-heavy:3px;
  --g-studio-shadow:var(--rule); --g-studio-beam:var(--ink); --g-studio-beam-alpha:.05;
  --g-studio-tap:var(--red); --g-studio-vault:var(--paper); --g-studio-vault-alpha:.5;
  --g-studio-wash:var(--rule); --g-studio-frozen:.38; --g-studio-halo:var(--paper);
  position:relative;width:100%;height:100%;background:var(--paper);color:var(--ink);overflow:hidden;
  -webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent}
.g-studio svg{display:block;width:100%;height:100%;touch-action:none}
.g-studio text{font-family:var(--serif,'IM Fell English',Georgia,serif)}
.g-studio .gs-paper{fill:var(--paper)}
.g-studio .gs-mass{fill:var(--ink)}
.g-studio .gs-ln{fill:none;stroke:var(--ink);stroke-width:var(--g-studio-line);stroke-linecap:round;stroke-linejoin:round}
.g-studio .gs-fine{stroke-width:var(--g-studio-fine)}
.g-studio .gs-heavy{stroke-width:var(--g-studio-heavy)}
.g-studio .gs-hair-w{stroke-width:var(--g-studio-hairline)}
.g-studio .gs-faint-ink{opacity:.55}
.g-studio .gs-wall{fill:var(--paper);stroke:var(--ink);stroke-width:var(--g-studio-line);stroke-linejoin:round}
.g-studio .gs-thin{stroke-width:var(--g-studio-fine)}
.g-studio .gs-face{fill:var(--paper);stroke:var(--ink);stroke-width:1.4px}
.g-studio .gs-pl{fill:none;stroke:var(--paper);stroke-width:var(--g-studio-fine);stroke-linecap:round}
.g-studio .gs-faint{opacity:.45}
.g-studio .gs-hair{fill:none;stroke:var(--ink);stroke-width:var(--g-studio-hairline);stroke-linecap:round}
.g-studio .gs-hatch-line{stroke:var(--ink);stroke-width:var(--g-studio-hairline)}
.g-studio .gs-flood{flood-color:var(--g-studio-shadow)}
.g-studio .gs-crack{stroke-width:var(--g-studio-line);stroke-linecap:butt}
.g-studio .gs-vault{opacity:var(--g-studio-vault-alpha)}
.g-studio .gs-vault .gs-pl{stroke:var(--g-studio-vault)}
.g-studio .gs-lady{fill:var(--paper);stroke:var(--ink);stroke-width:var(--g-studio-fine)}
.g-studio .gs-hand{fill:var(--paper);stroke:var(--ink);stroke-width:1.4px;stroke-linejoin:round}
.g-studio .gs-teach{fill:var(--paper);font-style:italic;font-size:30px}
.g-studio .gs-score{fill:var(--paper);font-size:32px;letter-spacing:.12em}
.g-studio .gs-mult{fill:var(--rule)}
.g-studio .gs-word{fill:var(--ink);font-style:italic;font-size:22px;paint-order:stroke;stroke:var(--g-studio-halo);stroke-width:5px;stroke-linejoin:round}
.g-studio .gs-word .gs-pts{font-style:normal;font-size:17px;letter-spacing:.1em}
.g-studio .gs-band{fill:var(--ink);letter-spacing:.03em;paint-order:stroke;stroke:var(--g-studio-halo);stroke-width:6px;stroke-linejoin:round}
.g-studio .gs-tap{fill:var(--g-studio-tap);font-style:italic;font-size:22px;paint-order:stroke;stroke:var(--g-studio-halo);stroke-width:4px;stroke-linejoin:round}
.g-studio .gs-knock{fill:var(--g-studio-tap);paint-order:stroke;stroke:var(--g-studio-halo);stroke-width:7px;stroke-linejoin:round}
.g-studio .gs-tick{fill:none;stroke:var(--g-studio-tap);stroke-width:2.2px;stroke-linecap:round}
.g-studio .gs-print{fill:var(--ink);opacity:.86}
.g-studio .gs-whorl{fill:none;stroke:var(--paper);stroke-width:.7px;opacity:.7}
.g-studio .gs-beam{fill:var(--g-studio-beam);fill-opacity:var(--g-studio-beam-alpha);stroke:none}
.g-studio .gs-ray{fill:none;stroke:var(--g-studio-beam);stroke-width:var(--g-studio-fine);stroke-dasharray:1.5 7;stroke-linecap:round}
.g-studio .gs-spot{fill:var(--g-studio-beam);fill-opacity:.07;stroke:var(--g-studio-beam);stroke-width:1px;stroke-dasharray:2 4}
.g-studio .gs-bloom{fill:var(--paper);stroke:var(--ink);stroke-width:1.2px;stroke-linejoin:round}
.g-studio .gs-leaf{fill:var(--paper);stroke:var(--ink);stroke-width:var(--g-studio-fine)}
.g-studio .gs-stem{fill:none;stroke:var(--ink);stroke-width:var(--g-studio-line);stroke-linecap:round}
.g-studio .gs-frozen{opacity:var(--g-studio-frozen)}
.g-studio .gs-wash{fill:var(--g-studio-wash);opacity:0;pointer-events:none}
.g-studio .gs-ring{fill:none;stroke:var(--ink);stroke-width:1.2px}
.g-studio .gs-trail{fill:none;stroke:var(--ink);stroke-width:1.4px;stroke-linecap:round;stroke-dasharray:3 5}
.g-studio .gs-smudge{fill:var(--muted);opacity:.5}
.g-studio .gs-mime-path{fill:none;stroke:var(--ink);stroke-width:1.2px;stroke-dasharray:2 5;stroke-linecap:round}
.g-studio .gs-mime-ring{fill:none;stroke:var(--ink);stroke-width:1.6px}
`;

export default {
  id: 'studio',
  title: 'The Cheerfulness of My Society',

  mount(stage, api = {}) {
    const RM = !!api.reducedMotion;
    const SPEED = Number(api.speed) > 0 ? Number(api.speed) : 1;   // dev harness only
    const uid = 'gs' + Math.random().toString(36).slice(2, 8);

    const root = document.createElement('div');
    root.className = 'g-studio';
    const style = document.createElement('style');
    style.textContent = CSS;
    root.appendChild(style);
    root.insertAdjacentHTML('beforeend',
      `<svg viewBox="0 0 960 640" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Roderick's studio. ${SPARE}">${scene(uid)}</svg>`);
    stage.appendChild(root);
    const svg = root.querySelector('svg');
    const $ = s => svg.querySelector(s);
    const L = {};
    for (const n of ['crack', 'lady', 'roderick', 'beams', 'roses', 'ledger', 'taps', 'bands', 'knock', 'fx', 'mime']) L[n] = $(`[data-l="${n}"]`);
    const teach = $('[data-teach]'), scoreText = $('[data-score]'), wash = $('[data-wash]');
    const doorLeaf = $('[data-door-leaf]'), ladyG = $('[data-lady]');
    const winEls = WINS.map((_, i) => {
      const g = $(`[data-win="${i}"]`);
      return { drape: g.querySelector('[data-drape]'), folds: g.querySelector('[data-folds]') };
    });
    const poses = {};
    for (const g of L.roderick.querySelectorAll('[data-pose]')) poses[g.dataset.pose] = g;
    const crackSegs = [...L.crack.querySelectorAll('[data-crack]')].map(p => {
      const len = p.getTotalLength ? p.getTotalLength() : 80;
      p.style.strokeDasharray = `${len} ${len}`;
      p.style.strokeDashoffset = len;
      return { p, len, shown: 0, fork: L.crack.querySelector(`[data-fork="${p.dataset.crack}"]`) };
    });
    if (RM && svg.pauseAnimations) svg.pauseAnimations();

    const el = (tag, attrs, parent) => {
      const e = document.createElementNS(NS, tag);
      for (const k in attrs) e.setAttribute(k, attrs[k]);
      if (parent) parent.appendChild(e);
      return e;
    };

    // ---- state ----
    const script = buildScript();
    let si = 0, T = 0, last = null, raf = 0;
    let score = 0, mult = 1, crack = 0, frozenUntil = -1;
    const counts = { sun: 0, rose: 0, band: 0 };
    let tapsHushed = 0, tapsSpared = 0, knockSpared = false;
    let pests = [], fx = [], gesture = null, seqI = 0, bandWordI = 0;
    let crescendo = false, lastSpawn = -9;
    let ended = false, endT = 0, outcome = null, doneSent = false, halted = false;
    const taught = { sun: false, rose: false, band: false };
    const drape = [1, 1, 1], drapeTarget = [1, 1, 1], drapeRate = [2, 2, 2];
    let door = 1, doorTarget = 1;       // 1 = shut
    let lady = null;                    // { t0 }
    let poseNow = 'calm', poseUntil = 0, sighUntil = 0, endPose = null;
    const ledgerMarks = Array.from({ length: 8 }, () => ({ prints: 0, ticks: 0, visits: 0 }));
    let shownScore = '', shownMult = '';

    // ---- fx: short-lived drawings, run on game time ----
    function addFx(node, life, update, onEnd) { fx.push({ node, t0: T, life, update, onEnd }); }
    function word(x, y, text, pts) {
      const t = el('text', { x: f(x), y: f(y), class: 'gs-word', 'text-anchor': 'middle' }, L.fx);
      t.appendChild(document.createTextNode(text));
      if (pts) {
        const s = el('tspan', { class: 'gs-pts', dx: '6' }, t);
        s.textContent = '+' + pts;
      }
      addFx(t, 1.5, s => {
        t.style.opacity = s < 0.9 ? 1 : Math.max(0, 1 - (s - 0.9) / 0.6);
        if (!RM) t.setAttribute('transform', `translate(0 ${f(-s * 9)})`);
      });
    }
    function setLine(text) {
      teach.style.opacity = 0;
      teach.textContent = text;
      if (text) addFx(null, 0.5, s => { teach.style.opacity = Math.min(1, s / 0.5); });
    }
    function smudge(x, y) {
      const g = el('g', {}, L.fx);
      el('ellipse', { class: 'gs-smudge', cx: x, cy: y, rx: 26, ry: 18 }, g);
      el('ellipse', { class: 'gs-smudge', cx: x + 9, cy: y - 5, rx: 16, ry: 11 }, g);
      addFx(g, 0.3, (s, k) => { g.style.opacity = 1 - k; });
    }
    function ripple(x, y, big) {
      if (RM) return;
      for (let i = 0; i < (big ? 4 : 3); i++) {
        const e = el('ellipse', { class: 'gs-ring', cx: x, cy: y, rx: 1, ry: 1 }, L.fx);
        const delay = i * 0.18, reach = big ? 1000 : 760;
        addFx(e, 1.4 + delay, s => {
          const k = clamp((s - delay) / 1.4, 0, 1), r = reach * (1 - (1 - k) ** 2);
          e.setAttribute('rx', f(Math.max(1, r))); e.setAttribute('ry', f(Math.max(1, r * 0.42)));
          e.style.opacity = s < delay ? 0 : (1 - k) * 0.8;
        });
      }
    }
    function thumbprint(x, y, scale) {
      const g = el('g', { transform: `translate(${f(x)} ${f(y)}) rotate(${(tapsHushed * 37) % 60 - 30}) scale(${scale})` }, L.ledger);
      el('ellipse', { class: 'gs-print', cx: 0, cy: 0, rx: 11, ry: 14 }, g);
      el('path', { class: 'gs-whorl', d: 'M-2 0a2 3 0 1 1 4 0M-5 1a5 6.5 0 1 1 10 0M-8 2a8 10 0 1 1 16 0' }, g);
      return g;
    }
    function tick(board) {
      const m = ledgerMarks[board], n = m.ticks++;
      const x = board * 120 + 12 + (n % 10) * 9, y = 457 + Math.floor(n / 10) * 14;
      el('path', { class: 'gs-tick', d: `M${x} ${y + 12}L${x + 4} ${y}` }, L.ledger);
    }
    function sigh() {
      sighUntil = T + 1.3; poseUntil = 0;
      word(526, 262, 'sigh.');
    }

    // ---- pests ----
    const occupied = site => pests.some(p => p.alive && p.site === site);
    function spawnSite(site, dur, mime) {
      if (occupied(site)) return spawnNext(dur);
      const [type, idx] = SITES[site];
      const p = { type, idx, site, dur, p: 0, born: T, alive: true, mime: mime && !taught[type], hold: 0 };
      if (type === 'sun') {
        p.node = el('g', { 'data-pest': 'sun' }, L.beams);
        p.beam = el('polygon', { class: 'gs-beam' }, p.node);
        p.rays = el('path', { class: 'gs-ray' }, p.node);
        p.spotEl = el('ellipse', { class: 'gs-spot', rx: 30, ry: 17 }, p.node);
        drapeTarget[idx] = OPEN; drapeRate[idx] = 2.2;
      } else if (type === 'rose') {
        p.node = el('g', { 'data-pest': 'rose' }, L.roses);
        p.stem = el('path', { class: 'gs-stem' }, p.node);
        p.leaves = el('path', { class: 'gs-leaf' }, p.node);
        p.bloom = el('g', {}, p.node);
        el('path', { class: 'gs-mass', d: 'M-7 4L0 1L7 4L3 9L0 5L-3 9Z' }, p.bloom);
        p.bloomShape = el('path', { class: 'gs-bloom' }, p.bloom);
        p.pts = [];
      } else if (type === 'band') {
        p.word = BAND_WORDS[bandWordI++ % BAND_WORDS.length];
        p.node = el('text', { class: 'gs-band', 'text-anchor': 'middle', 'data-pest': 'band' }, L.bands);
        p.node.textContent = p.word;
        p.jit = 0; p.jitT = 0;
      }
      pests.push(p);
      drawPest(p);
      return true;
    }
    function spawnNext(dur) {
      for (let n = 0; n < SEQ.length; n++) {
        const site = SEQ[(seqI + n) % SEQ.length];
        if (!occupied(site)) { seqI = (seqI + n + 1) % SEQ.length; return spawnSite(site, dur, false); }
      }
      return false;
    }
    function spawnTap(board, dur) {
      const visit = ledgerMarks[board].visits++;
      const x = BOARD_CX(board) + [0, -28, 28, -14, 14][visit % 5];
      const p = { type: 'tap', board, x, site: 'T' + board, dur, p: 0, born: T, alive: true };
      p.node = el('text', { class: 'gs-tap', x, y: 479, 'text-anchor': 'middle', 'data-pest': 'tap' }, L.taps);
      p.node.textContent = 'tap.';
      pests.push(p);
    }
    function spawnKnock() {
      const p = { type: 'knock', site: 'K', dur: 4, p: 0, born: T, alive: true };
      p.node = el('text', { class: 'gs-knock', 'text-anchor': 'middle', 'data-pest': 'knock' }, L.knock);
      p.node.textContent = 'KNOCK.';
      pests.push(p);
      drawPest(p);
    }
    function remove(p, life, update) {
      p.alive = false;
      pests = pests.filter(q => q !== p);
      if (gesture && gesture.pest === p) endGesture();
      if (life) addFx(p.node, life, update); else p.node.remove();
    }

    function roseGeom(p) {
      const v = VASES[p.idx], a = v.aim, c = { x: v.x + (a.x - v.x) * 0.12, y: v.y - 150 };
      const tmax = 0.16 + 0.84 * p.p, pts = [];
      for (let i = 0; i <= 18; i++) pts.push(quad(v, c, a, tmax * i / 18));
      p.pts = pts; p.tmax = tmax; p.curve = [v, c, a];
      return pts;
    }
    function sunGeom(p) {
      const w = WINS[p.idx];
      p.spot = { x: lerp(w.spot.x, FACE.x, p.p), y: lerp(w.spot.y, FACE.y, p.p) };
      return p.spot;
    }
    function bandPos(p) {
      const b = BANDS[p.idx], c = { x: lerp(b.x, b.ear.x, 0.55), y: b.y };
      return quad(b, c, b.ear, p.p);
    }
    function knockPos(p) {
      const k = ease(p.p);
      return { x: lerp(BOARD_CX(VAULT_BOARD), FACE.x + 10, k), y: lerp(506, FACE.y + 22, k) };
    }

    function drawPest(p) {
      const still = RM || halted || T < frozenUntil;
      if (p.type === 'sun') {
        const w = WINS[p.idx], s = sunGeom(p), ax = w.x, ay = WIN_BOT - 4;
        const dx = s.x - ax, dy = s.y - ay, len = Math.hypot(dx, dy) || 1, nx = -dy / len * 26, ny = dx / len * 26;
        let A = { x: s.x + nx, y: s.y + ny }, B = { x: s.x - nx, y: s.y - ny };
        if (A.x < B.x) [A, B] = [B, A];
        p.beam.setAttribute('points', `${ax - 30},${ay} ${ax + 30},${ay} ${f(A.x)},${f(A.y)} ${f(B.x)},${f(B.y)}`);
        let d = '';
        for (let i = 0; i < 5; i++) {
          const k = i / 4;
          d += `M${f(ax - 26 + 52 * k)} ${ay}L${f(lerp(B.x, A.x, k))} ${f(lerp(B.y, A.y, k))}`;
        }
        p.rays.setAttribute('d', d);
        if (!still) p.rays.style.strokeDashoffset = f(-T * 14);
        p.spotEl.setAttribute('cx', f(s.x)); p.spotEl.setAttribute('cy', f(s.y));
      } else if (p.type === 'rose') {
        const pts = roseGeom(p), tip = pts[pts.length - 1];
        p.stem.setAttribute('d', 'M' + pts.map(q => `${f(q.x)} ${f(q.y)}`).join('L'));
        const [v, c, a] = p.curve;
        let lv = '';
        for (const [t, side] of [[0.3, 1], [0.55, -1], [0.78, 1]]) {
          if (p.tmax < t + 0.05) continue;
          const q = quad(v, c, a, t), q2 = quad(v, c, a, t + 0.02);
          const tx = q2.x - q.x, ty = q2.y - q.y, tl = Math.hypot(tx, ty) || 1;
          const nx = -ty / tl * side, ny = tx / tl * side, ux = tx / tl, uy = ty / tl;
          const ex = q.x + nx * 16 + ux * 6, ey = q.y + ny * 16 + uy * 6;
          lv += `M${f(q.x)} ${f(q.y)}Q${f(q.x + nx * 4 + ux * 12)} ${f(q.y + ny * 4 + uy * 12)} ${f(ex)} ${f(ey)}Q${f(q.x + nx * 12 - ux * 3)} ${f(q.y + ny * 12 - uy * 3)} ${f(q.x)} ${f(q.y)}Z`;
        }
        p.leaves.setAttribute('d', lv || 'M0 0');
        const r = 6 + 9 * p.p, nod = still ? 0 : Math.sin(T * 5 + p.idx) * 6;
        p.bloom.setAttribute('transform', `translate(${f(tip.x)} ${f(tip.y)}) rotate(${f(nod)}) scale(${f(r / 10)})`);
        p.bloomShape.setAttribute('d',
          'M-10 0C-11 -7-5 -11 0 -10C6 -11 11 -6 10 0C11 6 5 10 0 9C-6 10-11 6-10 0Z' +
          'M-3 0A3 3 0 1 1 0 3M-6 -1A6 6 0 0 1 5 -4M6 1A6 6 0 0 1 -4 6');
      } else if (p.type === 'band') {
        const pos = bandPos(p), shrink = 1 - 0.72 * clamp(p.hold / 0.9, 0, 1);
        const fs = (30 + 40 * p.p) * shrink;
        p.node.setAttribute('x', f(pos.x)); p.node.setAttribute('y', f(pos.y));
        p.node.setAttribute('font-size', f(fs));
        if (!still && T - p.jitT > 0.09) { p.jitT = T; p.jit = (Math.sin(T * 91 + p.idx * 7) * 2.6); }
        if (still) p.jit = 0;
        p.node.setAttribute('transform', `rotate(${f(p.jit)} ${f(pos.x)} ${f(pos.y)})`);
      } else if (p.type === 'tap') {
        const k = clamp((p.p - 0.7) / 0.3, 0, 1), fade = clamp((T - p.born) / 0.25, 0, 1);
        const shiver = RM ? 0 : Math.sin(T * 40) * (p.p < 0.7 ? 2 : 0);
        p.node.style.opacity = fade * (1 - 0.85 * k);
        p.node.setAttribute('transform', `translate(0 ${f(k * 12)}) rotate(${f(shiver)} ${p.x} 474)`);
      } else if (p.type === 'knock') {
        const pos = knockPos(p);
        p.node.setAttribute('x', f(pos.x)); p.node.setAttribute('y', f(pos.y));
        p.node.setAttribute('font-size', f(64 + 30 * p.p));
        p.node.style.opacity = clamp((T - p.born) / 0.4, 0, 1);
      }
      if (p.node && p.type !== 'tap' && p.type !== 'knock') p.node.classList.toggle('gs-frozen', T < frozenUntil && !halted);
    }

    // ---- outcomes ----
    function hush(p, viaKnock, at) {
      if (!p.alive) return;
      const m = viaKnock ? 5 : mult, pts = VALUE[p.type] * m;
      score += pts; counts[p.type]++;
      if (!viaKnock) taught[p.type] = true;
      if (p.type === 'sun') {
        const w = WINS[p.idx];
        drapeTarget[p.idx] = 1; drapeRate[p.idx] = 6;
        word(w.x, WIN_BOT + 34, 'swish.', pts);
        remove(p, 0.3, (s, k) => { p.node.style.opacity = 1 - k; });
      } else if (p.type === 'rose') {
        const mid = at || p.pts[Math.floor(p.pts.length * 0.6)];
        word(mid.x, mid.y - 10, 'snip.', pts);
        remove(p, 0.7, (s, k) => {
          p.node.style.opacity = 1 - k;
          if (!RM) p.node.setAttribute('transform', `translate(0 ${f(60 * k * k)}) rotate(${f(8 * k)} ${VASES[p.idx].x} ${VASES[p.idx].y})`);
        });
      } else if (p.type === 'band') {
        const pos = bandPos(p);
        word(pos.x, pos.y - 6, 'plink.', pts);
        remove(p, 0.2, (s, k) => { p.node.style.opacity = 1 - k; });
      }
    }
    function reach(p) {
      crack = Math.min(6, crack + 1);
      mult = 1;
      poseUntil = T + 1.2; sighUntil = 0;
      smudge(FACE.x, FACE.y);
      if (p.type === 'sun') { drapeTarget[p.idx] = 1; drapeRate[p.idx] = 1; }
      remove(p, 0.3, (s, k) => { p.node.style.opacity = 1 - k; });
    }
    function hushTap(p) {
      const x = p.x, y = 472;
      score += VALUE.tap * mult;
      word(x, 436, 'hush.', VALUE.tap * mult);
      mult = Math.min(5, mult + 1);
      tapsHushed++;
      ledgerMarks[p.board].prints++;
      thumbprint(x, y, 1);
      ripple(x, y);
      frozenUntil = T + 2;
      crack = Math.max(0, crack - 1);
      sigh();
      remove(p);
    }
    function sinkTap(p) {
      tapsSpared++;
      mult = 1;
      tick(p.board);
      remove(p);
    }
    function hushKnock(p) {
      const pos = knockPos(p);
      tapsHushed++;
      score += 1000;
      word(pos.x, pos.y - 70, 'hush.', 1000);
      for (const q of [...pests]) if (q !== p && q.type !== 'tap') hush(q, true);
      thumbprint(BOARD_CX(VAULT_BOARD), 472, 1.45);
      ripple(pos.x, pos.y - 24, true);
      crack = Math.max(0, crack - 1);
      frozenUntil = T + 3;
      sigh();
      remove(p);
      endGame('hushed');
    }
    function knockReached(p) {
      tapsSpared++;
      knockSpared = true;
      p.alive = false;
      pests = pests.filter(q => q !== p);
      halted = true;                       // the pests stop, unhushed
      endPose = 'hidden';
      endGame('spared');
    }
    function endGame(how) {
      if (ended) return;
      ended = true; endT = T; outcome = how;
      if (gesture) endGesture();
      if (how === 'hushed') endPose = 'calm';
      setLine('');
      svg.style.cursor = 'default';
    }
    function finish() {
      if (doneSent) return;
      doneSent = true;
      const won = crack < 6;
      try {
        if (api.setFlag) {
          api.setFlag('tapsHushed', tapsHushed);
          api.setFlag('tapsSpared', tapsSpared);
          api.setFlag('knockSpared', knockSpared);
        }
      } catch (e) { /* the spine owns flags; never let it stop the chapter */ }
      if (api.done) api.done({
        won,
        score: {
          'sunbeams drawn': counts.sun,
          'roses nipped': counts.rose,
          'trumpets muffled': counts.band,
          'taps hushed': tapsHushed,
          'taps let be': tapsSpared,
        },
        note: outcome === 'spared' ? NOTE_SPARED : NOTE_HUSHED,
      });
    }

    // ---- the script ----
    function handle(ev) {
      if (ended && ev.k !== 'line') return;
      switch (ev.k) {
        case 'pest': spawnSite(ev.site, ev.dur, T < 45); break;
        case 'rush': spawnNext(ev.dur); break;
        case 'tap': spawnTap(ev.board, ev.dur); break;
        case 'door': doorTarget = ev.open ? 0 : 1; break;
        case 'lady': lady = { t0: T }; break;
        case 'line': if (!ended) setLine(ev.text); break;
        case 'crescendo': crescendo = true; lastSpawn = T; break;
        case 'knock': spawnKnock(); break;
      }
    }

    // ---- per-frame ----
    function step(dt) {
      while (si < script.length && script[si].t <= T) handle(script[si++]);
      const frozen = T < frozenUntil;
      for (const p of [...pests]) {
        if (!p.alive) continue;
        if (p.type === 'tap') {
          if (ended) continue;
          p.p += dt / p.dur;
          if (p.p >= 1) sinkTap(p);
        } else if (p.type === 'knock') {
          if (ended) continue;
          p.p = Math.min(1, p.p + dt / p.dur);
          if (p.p >= 1) knockReached(p);
        } else {
          const held = gesture && gesture.pest === p && p.type === 'band';
          if (p.type === 'band') {
            p.hold = held ? p.hold + dt : Math.max(0, p.hold - dt * 1.2);
            if (p.hold >= 0.9) { hush(p); continue; }
          }
          if (!frozen && !halted && !held && !(gesture && gesture.pest === p && p.type === 'sun')) {
            p.p += dt / p.dur;
            if (p.p >= 1) reach(p);
          }
        }
      }
      if (crescendo && !ended) {
        const live = pests.filter(p => p.type !== 'tap' && p.type !== 'knock').length;
        const target = T < 126 ? 3 : 4;
        if (live < target && T - lastSpawn >= 0.9 && spawnNext(5.5)) lastSpawn = T;
      }
      for (let i = 0; i < 3; i++) {
        if (gesture && gesture.pest && gesture.pest.type === 'sun' && gesture.pest.idx === i) continue;
        const d = drapeTarget[i] - drape[i];
        drape[i] += Math.sign(d) * Math.min(Math.abs(d), drapeRate[i] * dt);
      }
      const dd = doorTarget - door;
      door = RM ? doorTarget : door + Math.sign(dd) * Math.min(Math.abs(dd), dt / 0.6);
      crackSegs.forEach((s, i) => {
        const target = i < crack ? 1 : 0, d = target - s.shown;
        s.shown = RM ? target : s.shown + Math.sign(d) * Math.min(Math.abs(d), dt * 2.4);
      });
      for (const e of [...fx]) {
        const s = T - e.t0;
        e.update && e.update(s, clamp(s / e.life, 0, 1));
        if (s >= e.life) {
          fx = fx.filter(q => q !== e);
          if (e.node) e.node.remove();
          if (e.onEnd) e.onEnd();
        }
      }
      if (ended && !doneSent && T >= endT + 3) finish();
    }

    function render() {
      for (const p of pests) drawPest(p);
      winEls.forEach((w, i) => {
        const wd = WIN_W * drape[i];
        w.drape.setAttribute('width', f(wd));
        const x0 = WINS[i].x - 36;
        w.folds.setAttribute('d', wd > 8 ? [0.3, 0.55, 0.8].map(k => `M${f(x0 + wd * k)} 84V212`).join('') : '');
      });
      doorLeaf.setAttribute('transform', `translate(142 0) scale(${f(Math.max(0.001, door))} 1) translate(-142 0)`);
      crackSegs.forEach(s => { s.p.style.strokeDashoffset = f(s.len * (1 - s.shown)); s.fork.style.opacity = s.shown > 0.6 ? 1 : 0; });
      // the pale lady
      let ladyOn = false;
      if (lady) {
        const k = (T - lady.t0) / 7.4;
        if (k > 1 && door >= 0.999) { lady = null; ladyG.style.opacity = 0; }
        else {
          ladyOn = true;
          let x, op;
          const kk = clamp(k, 0, 1);
          if (RM) {
            const spots = [760, 470, 186], seg = Math.min(2, Math.floor(kk * 3)), local = kk * 3 - seg;
            x = spots[seg]; op = seg === 2 ? Math.min(1, local / 0.15) : Math.min(1, local / 0.15, (1 - local) / 0.15);
          } else {
            x = lerp(872, 182, kk); op = Math.min(1, (T - lady.t0) / 0.5);
          }
          const bob = RM ? 0 : Math.sin(T * 3) * 1.5;
          L.lady.setAttribute('transform', `translate(${f(x)} ${f(450 + bob)})`);
          ladyG.style.opacity = f(op * 0.9);
        }
      }
      // Roderick
      let pose = 'calm';
      if (endPose) pose = endPose;
      else if (T < poseUntil) pose = 'startled';
      else if (T < sighUntil) pose = 'calm';
      else if (ladyOn) pose = 'hidden';
      if (pose !== poseNow) {
        poses[poseNow].style.display = 'none';
        poses[pose].style.display = '';
        poseNow = pose;
      }
      // freeze: still pests; under reduced motion, a grey wash
      wash.style.opacity = RM && T < frozenUntil && !halted ? 0.35 : 0;
      // score
      const sm = '×' + mult, ss = score.toLocaleString('en-US');
      if (sm !== shownMult || ss !== shownScore) {
        scoreText.firstChild.textContent = sm;
        scoreText.lastChild.textContent = ss;
        shownMult = sm; shownScore = ss;
      }
      renderMime();
    }

    // ---- the inked hand: mimes each gesture once ----
    const hand = el('g', { style: 'display:none' }, L.mime);
    hand.innerHTML = HAND;
    const mimePath = el('path', { class: 'gs-mime-path', style: 'display:none' }, L.mime);
    const mimeRing = el('circle', { class: 'gs-mime-ring', r: 24, style: 'display:none' }, L.mime);
    function renderMime() {
      let m = null;
      if (!ended && T < 45) for (const p of pests) if (p.alive && p.mime && !taught[p.type] && (!m || p.born < m.born)) m = p;
      if (!m) { hand.style.display = mimePath.style.display = mimeRing.style.display = 'none'; return; }
      const c = ((T - m.born) % 2.4) / 2.4;
      let a, b, k = 0, op = 1, ring = 0;
      if (m.type === 'sun') {
        const w = WINS[m.idx];
        a = { x: w.x - 24, y: 152 }; b = { x: w.x + 30, y: 152 };
        k = c < 0.15 ? 0 : c < 0.65 ? ease((c - 0.15) / 0.5) : 1;
      } else if (m.type === 'rose') {
        const pts = m.pts.length ? m.pts : roseGeom(m), i = Math.floor(pts.length * 0.55), q = pts[i], q2 = pts[Math.min(pts.length - 1, i + 1)];
        const tx = q2.x - q.x, ty = q2.y - q.y, tl = Math.hypot(tx, ty) || 1;
        a = { x: q.x + ty / tl * 46, y: q.y - tx / tl * 46 }; b = { x: q.x - ty / tl * 46, y: q.y + tx / tl * 46 };
        k = c < 0.25 ? 0 : c < 0.45 ? ease((c - 0.25) / 0.2) : 1;
      } else {
        const bb = bbox(m.node);
        a = b = { x: bb.x + bb.width / 2, y: bb.y + bb.height * 0.6 };
        ring = c < 0.15 ? 0 : c < 0.75 ? (c - 0.15) / 0.6 : 1;
      }
      op = c < 0.1 ? c / 0.1 : c > 0.85 ? (1 - c) / 0.15 : 1;
      if (RM) { k = 0; op = 1; ring = 1; }
      const x = lerp(a.x, b.x, k), y = lerp(a.y, b.y, k);
      hand.style.display = '';
      hand.style.opacity = f(op);
      hand.setAttribute('transform', `translate(${f(x)} ${f(y)}) rotate(-22) scale(1.3)`);
      if (m.type === 'band') {
        mimePath.style.display = 'none';
        mimeRing.style.display = '';
        const C = 2 * Math.PI * 24;
        mimeRing.setAttribute('cx', f(a.x)); mimeRing.setAttribute('cy', f(a.y));
        mimeRing.style.strokeDasharray = `${f(C * ring)} ${f(C)}`;
        mimeRing.style.opacity = f(op);
      } else {
        mimeRing.style.display = 'none';
        mimePath.style.display = '';
        const ex = RM ? b.x : x, ey = RM ? b.y : y;
        const ang = Math.atan2(b.y - a.y, b.x - a.x);
        mimePath.setAttribute('d', `M${f(a.x)} ${f(a.y)}L${f(ex)} ${f(ey)}` + (RM || k > 0.95
          ? `M${f(b.x - 9 * Math.cos(ang - 0.5))} ${f(b.y - 9 * Math.sin(ang - 0.5))}L${f(b.x)} ${f(b.y)}L${f(b.x - 9 * Math.cos(ang + 0.5))} ${f(b.y - 9 * Math.sin(ang + 0.5))}` : ''));
        mimePath.style.opacity = f(op);
      }
    }

    // ---- input: pointerdown picks the pest beneath; only its gesture counts ----
    function bbox(node) {
      try { return node.getBBox(); } catch (e) { return { x: 0, y: 0, width: 0, height: 0 }; }
    }
    function toSvg(e) {
      const m = svg.getScreenCTM();
      if (!m) return { x: -1, y: -1 };
      const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
      return { x: pt.x, y: pt.y };
    }
    function pick(pt) {
      let best = null, bs = Infinity;
      const take = (p, s) => { if (s < bs) { bs = s; best = p; } };
      for (const p of pests) {
        if (!p.alive) continue;
        if (p.type === 'tap') {
          const cx = BOARD_CX(p.board);
          if (Math.abs(pt.x - cx) <= 60 && Math.abs(pt.y - 472) <= 45) take(p, Math.hypot(pt.x - p.x, pt.y - 474));
        } else if (p.type === 'knock') {
          const b = bbox(p.node), cx = b.x + b.width / 2, cy = b.y + b.height / 2;
          if (Math.abs(pt.x - cx) <= Math.max(100, b.width / 2 + 12) && Math.abs(pt.y - cy) <= Math.max(60, b.height / 2 + 12)) take(p, Math.hypot(pt.x - cx, pt.y - cy));
        } else if (p.type === 'band') {
          const b = bbox(p.node), pad = 22;
          if (pt.x >= b.x - pad && pt.x <= b.x + b.width + pad && pt.y >= b.y - pad && pt.y <= b.y + b.height + pad)
            take(p, 1000 + 0.5 * Math.hypot(pt.x - b.x - b.width / 2, pt.y - b.y - b.height / 2));
        } else if (p.type === 'rose') {
          const d = polyDist(pt, p.pts.length ? p.pts : roseGeom(p));
          if (d <= 44) take(p, 1000 + d);
        } else if (p.type === 'sun') {
          const w = WINS[p.idx];
          if (Math.abs(pt.x - w.x) <= 64 && pt.y >= 64 && pt.y <= 242) take(p, 1000 + 0.5 * Math.abs(pt.x - w.x));
          else {
            const d = distSeg(pt, { x: w.x, y: WIN_BOT }, sunGeom(p));
            if (d <= 30) take(p, 3000 + d);
          }
        }
      }
      return best;
    }
    const CURSOR = { sun: 'ew-resize', rose: 'crosshair', band: 'pointer', tap: 'pointer', knock: 'pointer' };

    function onDown(e) {
      if (ended || halted || gesture) return;
      if (e.button !== undefined && e.button > 0) return;
      const pt = toSvg(e), p = pick(pt);
      e.preventDefault();
      if (p && p.type === 'tap') return hushTap(p);
      if (p && p.type === 'knock') return hushKnock(p);
      try { svg.setPointerCapture(e.pointerId); } catch (err) { /* synthetic pointers */ }
      // On a pest: only its gesture counts. On bare paper: a free stroke, which snips any stem it cuts.
      gesture = { id: e.pointerId, pest: p, x0: pt.x, last: pt, len: 0, crossed: false, tp: [pt] };
      if (p && p.type === 'rose') gesture.crossed = polyDist(pt, p.pts) <= 12;
      if (!p || p.type === 'rose') gesture.trail = el('polyline', { class: 'gs-trail', points: `${f(pt.x)},${f(pt.y)}` }, L.fx);
    }
    function onMove(e) {
      const pt = toSvg(e);
      if (!gesture) {
        if (e.pointerType === 'mouse' && !ended) {
          const p = pick(pt);
          svg.style.cursor = p ? CURSOR[p.type] : 'default';
        }
        return;
      }
      if (e.pointerId !== gesture.id) return;
      const g = gesture, p = g.pest;
      if (!p) {
        g.len += Math.hypot(pt.x - g.last.x, pt.y - g.last.y);
        g.tp.push(pt);
        g.trail.setAttribute('points', g.tp.map(q => `${f(q.x)},${f(q.y)}`).join(' '));
        if (!g.cut) for (const r of pests) {
          if (!r.alive || r.type !== 'rose') continue;
          for (let i = 1; i < r.pts.length; i++) if (cross(g.last, pt, r.pts[i - 1], r.pts[i])) { g.cut = r; break; }
          if (g.cut) break;
        }
        if (g.cut && g.cut.alive && g.len >= 80) { const r = g.cut; endGesture(); hush(r, false, pt); return; }
        g.last = pt;
        return;
      }
      if (!p.alive) return endGesture();
      if (p.type === 'sun') {
        const dx = Math.abs(pt.x - g.x0);
        drape[p.idx] = drapeTarget[p.idx] = clamp(OPEN + dx / WIN_W, OPEN, 1);
        if (dx >= 0.6 * WIN_W) { endGesture(); hush(p); }
      } else if (p.type === 'rose') {
        if (!g.crossed) for (let i = 1; i < p.pts.length; i++) if (cross(g.last, pt, p.pts[i - 1], p.pts[i])) { g.crossed = true; break; }
        g.len += Math.hypot(pt.x - g.last.x, pt.y - g.last.y);
        g.tp.push(pt);
        g.trail.setAttribute('points', g.tp.map(q => `${f(q.x)},${f(q.y)}`).join(' '));
        if (g.crossed && g.len >= 80) { endGesture(); hush(p, false, pt); return; }
      }
      g.last = pt;
    }
    function endGesture() {
      const g = gesture;
      gesture = null;
      if (!g) return;
      if (g.pest && g.pest.type === 'sun' && g.pest.alive) { drapeTarget[g.pest.idx] = OPEN; drapeRate[g.pest.idx] = 3; }
      if (g.trail) { const t = g.trail; addFx(t, 0.4, (s, k) => { t.style.opacity = 1 - k; }); }
    }
    function onUp(e) {
      if (gesture && e.pointerId === gesture.id) endGesture();
    }
    svg.addEventListener('pointerdown', onDown);
    svg.addEventListener('pointermove', onMove);
    svg.addEventListener('pointerup', onUp);
    svg.addEventListener('pointercancel', onUp);
    svg.addEventListener('lostpointercapture', onUp);
    const noMenu = e => e.preventDefault();
    svg.addEventListener('contextmenu', noMenu);

    // ---- go ----
    setLine(SPARE);
    function frame(now) {
      raf = requestAnimationFrame(frame);
      if (last === null) last = now;
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000)) * SPEED;
      last = now;
      T += dt;
      step(dt);
      render();
    }
    render();
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      svg.removeEventListener('pointerdown', onDown);
      svg.removeEventListener('pointermove', onMove);
      svg.removeEventListener('pointerup', onUp);
      svg.removeEventListener('pointercancel', onUp);
      svg.removeEventListener('lostpointercapture', onUp);
      svg.removeEventListener('contextmenu', noMenu);
      fx = []; pests = []; gesture = null;
      root.remove();
    };
  },
};
