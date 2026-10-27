// Tarn: A Somewhat Childish Experiment (chapter I).
// Spot the difference between the house and its reflection. The house cheats once
// (an earlier find unwinds while you look away); catch it. Then a window lights in
// the water only, and the find that matters doesn't count.
// Spec: work/design/games/tarn.md · Contract: work/design/CONTRACT.md · Look: work/design/LOOK.md

const NS = 'http://www.w3.org/2000/svg';
const WL = 340;                                   // waterline
const MIRROR = 'translate(0 680) scale(1 -1)';    // y' = 680 - y

// Every colour, weight and texture is a token, so a change of visual direction is a swap.
const CSS = `
.g-tarn{
  --g-tarn-sky:var(--paper);
  --g-tarn-water:var(--ink);
  --g-tarn-water-hatch:var(--muted);
  --g-tarn-line-above:var(--ink);
  --g-tarn-line-below:var(--paper);
  --g-tarn-ground-above:var(--paper);
  --g-tarn-ground-below:var(--ink);
  --g-tarn-truth:color-mix(in srgb,var(--red),var(--paper) 35%);
  --g-tarn-mark:var(--red);
  --g-tarn-mark-below:var(--g-tarn-truth);
  --g-tarn-miss:var(--muted);
  --g-tarn-miss-below:var(--rule);
  --g-tarn-type:var(--ink);
  --g-tarn-ring:var(--ink);
  --g-tarn-ring-spare:var(--muted);
  --g-tarn-smear:var(--red);
  --g-tarn-her:var(--paper);
  --g-tarn-her-edge:var(--ink);
  --g-tarn-mask:#fff;
  --g-tarn-depth-top:.92;
  --g-tarn-depth-bottom:.5;
  --g-tarn-contour:2;
  --g-tarn-fine:1.1;
  --g-tarn-hatch:.8;
  --g-tarn-fresh:3.4;
  --g-tarn-fresh-fine:2.2;
  --g-tarn-mark-w:3.2;
  --g-tarn-truth-w:3;
  position:relative;width:100%;height:100%;aspect-ratio:3/2;overflow:hidden;
  container-type:inline-size;background:var(--g-tarn-sky);color:var(--g-tarn-type);
  font-family:var(--serif);-webkit-tap-highlight-color:transparent;
  user-select:none;-webkit-user-select:none;-webkit-touch-callout:none}
.g-tarn .tarn-svg{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:manipulation;cursor:pointer}
.g-tarn .sky{fill:var(--g-tarn-sky)}
.g-tarn .water{fill:var(--g-tarn-water)}
.g-tarn .water-hatch{fill:url(#tarn-water)}
.g-tarn .hx-water{stroke:var(--g-tarn-water-hatch);stroke-width:var(--g-tarn-hatch);stroke-linecap:round;fill:none}
.g-tarn .hx-above{stroke:var(--g-tarn-line-above);stroke-width:var(--g-tarn-hatch);stroke-linecap:round;fill:none}
.g-tarn .hx-below{stroke:var(--g-tarn-line-below);stroke-width:var(--g-tarn-hatch);stroke-linecap:round;fill:none;opacity:.55}
.g-tarn .deep-a{stop-color:var(--g-tarn-mask);stop-opacity:var(--g-tarn-depth-top)}
.g-tarn .deep-b{stop-color:var(--g-tarn-mask);stop-opacity:var(--g-tarn-depth-bottom)}
.g-tarn .above{color:var(--g-tarn-line-above);--ground:var(--g-tarn-ground-above);--hatch:url(#tarn-hatch-above);--hatch-h:url(#tarn-hatch-h-above)}
.g-tarn .below{color:var(--g-tarn-line-below);--ground:var(--g-tarn-ground-below);--hatch:url(#tarn-hatch-below);--hatch-h:url(#tarn-hatch-h-below)}
.g-tarn .ln{fill:none;stroke:currentColor;stroke-width:var(--g-tarn-contour);stroke-linecap:round;stroke-linejoin:round}
.g-tarn .ln.fine{stroke-width:var(--g-tarn-fine)}
.g-tarn .mass{fill:currentColor}
.g-tarn .wall{fill:var(--ground);stroke:currentColor;stroke-width:var(--g-tarn-contour);stroke-linejoin:round}
.g-tarn .win{fill:var(--ground);stroke:currentColor;stroke-width:1.4}
.g-tarn .above .win{fill:currentColor}
.g-tarn .shade{fill:var(--hatch)}
.g-tarn .hills{fill:var(--hatch-h)}
.g-tarn .smoke{stroke-width:2.4}
.g-tarn .fresh .ln,.g-tarn .fresh .wall,.g-tarn .fresh .smoke{stroke-width:var(--g-tarn-fresh)}
.g-tarn .fresh .ln.fine{stroke-width:var(--g-tarn-fresh-fine)}
.g-tarn .wisp{animation:g-tarn-wisp 4.2s linear infinite;opacity:0}
.g-tarn .wisp.w2{animation-delay:-1.4s}
.g-tarn .wisp.w3{animation-delay:-2.8s}
@keyframes g-tarn-wisp{0%{opacity:0;transform:translate(0,0)}14%{opacity:.95}70%{opacity:.5}100%{opacity:0;transform:translate(10px,-34px)}}
.g-tarn.rm .wisp{animation:none}
.g-tarn.rm .wisp.w1{opacity:.9}
.g-tarn.rm .wisp.w2{opacity:.55;transform:translate(5px,-16px)}
.g-tarn.rm .wisp.w3{opacity:.25;transform:translate(9px,-30px)}
.g-tarn .crack{fill:none;stroke:var(--g-tarn-truth);stroke-width:var(--g-tarn-truth-w);stroke-linecap:round;stroke-linejoin:round}
.g-tarn .crack.fine{stroke-width:calc(var(--g-tarn-truth-w) * .55)}
.g-tarn .lit{fill:var(--g-tarn-truth);stroke:var(--g-tarn-line-below);stroke-width:1}
.g-tarn .her-body{fill:var(--g-tarn-her);stroke:var(--g-tarn-her-edge);stroke-width:.6}
.g-tarn .her-hair{fill:none;stroke:var(--g-tarn-her);stroke-width:.9;stroke-linecap:round}
.g-tarn .marks{pointer-events:none}
.g-tarn .mk{fill:none;stroke-width:var(--g-tarn-mark-w);stroke-linecap:round;stroke-linejoin:round}
.g-tarn .mk-a{stroke:var(--g-tarn-mark)}
.g-tarn .mk-b{stroke:var(--g-tarn-mark-below)}
.g-tarn .xa{fill:none;stroke:var(--g-tarn-line-above);stroke-width:3.4;stroke-linecap:round}
.g-tarn .xhalo{fill:none;stroke:var(--g-tarn-ground-above);stroke-width:8;stroke-linecap:round}
.g-tarn .xb{fill:none;stroke:var(--g-tarn-line-below);stroke-width:3;stroke-linecap:round}
.g-tarn .tick{fill:none;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}
.g-tarn .tick-a{stroke:var(--g-tarn-miss)}
.g-tarn .tick-b{stroke:var(--g-tarn-miss-below)}
.g-tarn .tarn-hud{position:absolute;left:5%;top:4.2%;pointer-events:none;line-height:1;font-size:max(12px,2.75cqw)}
.g-tarn .tarn-line{font-style:italic;white-space:nowrap;color:var(--g-tarn-type)}
.g-tarn .tarn-rings{display:block;height:1.5em;width:calc(1.5em * 186 / 40);margin-top:.3em;overflow:visible}
.g-tarn .slot .r{fill:none;stroke:var(--g-tarn-ring);stroke-width:1.5}
.g-tarn .slot .f{fill:var(--g-tarn-ring);transform:scale(0);transform-box:fill-box;transform-origin:center;transition:transform .35s ease-out}
.g-tarn .slot.full .f{transform:scale(1)}
.g-tarn .slot.smear .f{transition-duration:1.2s}
.g-tarn .slot .sm{fill:var(--g-tarn-smear);opacity:0;transition:opacity .3s}
.g-tarn .slot.smear .sm{opacity:.92;transition:opacity 1.2s ease-in}
.g-tarn .slot .dr{opacity:0;transition:opacity .3s}
.g-tarn .slot.drip .dr{opacity:1;transition:none}
.g-tarn .slot .dr path{fill:none;stroke:var(--g-tarn-smear);stroke-width:2.2;stroke-linecap:round;stroke-dasharray:22;stroke-dashoffset:22;transition:stroke-dashoffset 1.6s ease-in}
.g-tarn .slot .dr circle{fill:var(--g-tarn-smear);opacity:0;transition:opacity .3s ease-in 1.45s}
.g-tarn .slot.drip .dr path{stroke-dashoffset:0}
.g-tarn .slot.drip .dr circle{opacity:1}
.g-tarn.rm .slot .f{transform:none;opacity:0;transition:opacity .3s}
.g-tarn.rm .slot.full .f{opacity:1}
.g-tarn.rm .slot .dr path,.g-tarn.rm .slot .dr circle{transition:none}
.g-tarn .six{opacity:0;transition:opacity .4s}
.g-tarn .six.on{opacity:1}
.g-tarn .six .r6{fill:none;stroke:var(--g-tarn-ring-spare);stroke-width:1.3}
.g-tarn .six .x{fill:none;stroke:var(--g-tarn-ring);stroke-width:2;stroke-linecap:round;stroke-dasharray:23;stroke-dashoffset:23;transition:stroke-dashoffset .18s ease-in}
.g-tarn .six .x2{transition-delay:.19s}
.g-tarn .six.crossed .x{stroke-dashoffset:0}
.g-tarn .vh{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
`;

// The five differences, in house coordinates (the water copy sits at y' = 680 - y).
// hits: tap circles (r >= 70 at the spec's points, plus a helper where the drawing reaches further).
// loop: the hand-drawn circle. house/water: the false (above) and true (below) states.
const DIFFS = [
  { id: 'crack', hits: [{ x: 430, y: 200, r: 90 }, { x: 434, y: 300, r: 55 }],
    loop: { cx: 438, cy: 238, rx: 44, ry: 108 } },
  { id: 'smoke', hits: [{ x: 640, y: 70, r: 70 }], loop: { cx: 644, cy: 80, rx: 46, ry: 36 },
    house: 'on', water: 'off', drip: { x: 646, y: 87 } },
  { id: 'tree', hits: [{ x: 150, y: 230, r: 90 }, { x: 98, y: 300, r: 50 }],
    loop: { cx: 146, cy: 224, rx: 72, ry: 92 }, house: 'up', water: 'down', drip: { x: 151, y: 272 } },
  { id: 'shutters', hits: [{ x: 580, y: 180, r: 70 }], loop: { cx: 592, cy: 181, rx: 38, ry: 42 },
    house: 'shut', water: 'open', drip: { x: 572, y: 209 } },
  { id: 'door', hits: [{ x: 480, y: 290, r: 70 }], loop: { cx: 480, cy: 286, rx: 42, ry: 52 },
    house: 'shut', water: 'open', drip: { x: 511, y: 262 } },
];
const WINDOW = { x: 360, y: 151, r: 70, loop: { cx: 360, cy: 151, rx: 42, ry: 50 } };

const scallops = (x0, x1, y) => {
  let d = `M${x0} ${y}`;
  for (let x = x0; x < x1; x += 8) d += 'q4 4.5 8 0';
  return d;
};
const sedge = (x, y, n, h) => {
  let d = '';
  for (let i = 0; i < n; i++) {
    const dx = (i - (n - 1) / 2) * 3.4, hh = h * (0.72 + 0.28 * Math.cos(i * 1.7));
    d += `M${(x + dx * 0.4).toFixed(1)} ${y}Q${(x + dx * 0.9).toFixed(1)} ${(y - hh * 0.6).toFixed(1)} ${(x + dx * 1.9).toFixed(1)} ${(y - hh).toFixed(1)}`;
  }
  return `<path class="ln fine" d="${d}"/>`;
};

// The house, drawn twice: false states above in ink, true states below in the water.
// Every variant of each difference is drawn; the inactive one is transparent, so the
// house can redraw a detail by cross-fading.
function drawHouse(st) {
  const v = (id, val, body) =>
    `<g data-d="${id}" data-v="${val}"${st[id] === val ? '' : ' style="opacity:0"'}>${body}</g>`;
  const lancet = (x, top, bottom, w) =>
    `M${x - w} ${bottom}V${top + 22}Q${x - w} ${top + 6} ${x} ${top}Q${x + w} ${top + 6} ${x + w} ${top + 22}V${bottom}Z`;
  return `
  <path class="hills" d="M0 340V296L40 292 78 288 112 291 150 284 188 289 226 283 262 290 300 293V340ZM716 340V290L752 284 790 287 832 280 872 286 912 282 960 287V340Z"/>
  <path class="mass" d="M0 340V322C46 318 98 300 150 298C204 296 254 312 308 328V340Z"/>
  <path class="mass" d="M704 340V331C770 324 860 326 960 331V340Z"/>
  ${sedge(262, 318, 7, 24)}${sedge(290, 323, 5, 17)}${sedge(738, 329, 6, 22)}${sedge(772, 328, 7, 27)}${sedge(814, 328, 5, 16)}

  <rect class="wall" x="404" y="172" width="152" height="152"/>
  <path class="mass" d="M394 175L480 110L566 175Z"/>
  <path class="ln fine" d="${scallops(408, 548, 177)}"/>
  <circle class="ln" cx="480" cy="206" r="17"/><circle class="win" cx="480" cy="206" r="11"/>
  <path class="ln" d="M447 324V270Q450 244 480 235Q510 244 513 270V324"/>
  ${v('door', 'shut', `<path class="wall" d="M456 324V272Q458 252 480 244Q502 252 504 272V324Z"/>
    <path class="ln fine" d="M468 249V324M480 244V324M492 249V324M456 278H504M456 306H504"/>
    <circle class="ln fine" cx="488" cy="292" r="3.4"/>`)}
  ${v('door', 'open', `<path class="win" d="M456 324V272Q458 252 480 244Q502 252 504 272V324Z"/>
    <path class="wall" d="M456 272L438 261V331L456 324Z"/>
    <path class="ln fine" d="M447 268V327M440 290L455 292"/>`)}

  <rect class="wall" x="316" y="118" width="88" height="206"/>
  <rect class="shade" x="392" y="120" width="11" height="203"/>
  <path class="mass" d="M306 121L360 80L414 121Z"/>
  <path class="win" d="${lancet(360, 122, 180, 17)}"/>
  <path class="win" d="${lancet(360, 238, 288, 13)}"/>

  <rect class="wall" x="556" y="144" width="160" height="180"/>
  <rect class="shade" x="557" y="146" width="158" height="9"/>
  <rect class="wall" x="630" y="84" width="22" height="24"/>
  <path class="mass" d="M548 147L582 106H690L724 147Z"/>
  <rect class="mass" x="625" y="78" width="32" height="8"/>
  <path class="ln fine" d="${scallops(560, 712, 150)}"/>
  <path class="win" d="${lancet(676, 154, 205, 12)}"/>
  <path class="win" d="${lancet(592, 244, 294, 12)}"/>
  <path class="win" d="${lancet(676, 244, 294, 12)}"/>
  ${v('shutters', 'shut', `<path class="wall" d="${lancet(592, 152, 206, 13)}"/>
    <path class="ln fine" d="M592 153V206M582 174H602M581 182H603M581 190H603M581 198H603"/>`)}
  ${v('shutters', 'open', `<path class="win" d="${lancet(592, 154, 205, 12)}"/>
    <path class="wall" d="M579 160L565 165V211L579 206Z"/><path class="wall" d="M605 160L619 165V211L605 206Z"/>
    <path class="ln fine" d="M567 176L577 173M567 185L577 182M567 194L577 191M607 173L617 176M607 182L617 185M607 191L617 194"/>`)}
  ${v('smoke', 'on', `<path class="ln smoke" d="M641 77c-3-3 3-6 0-10"/>
    <path class="ln smoke wisp w1" d="M641 74c-6-6 6-11 0-17s6-11 0-17"/>
    <path class="ln smoke wisp w2" d="M644 72c-5-6 6-10 0-16s5-10 0-15"/>
    <path class="ln smoke wisp w3" d="M639 73c-6-5 5-11-1-16s6-10 0-16"/>`)}
  ${v('smoke', 'off', `<path class="ln" d="M630 108V86H652V108M625 78H657"/>`)}

  <rect class="mass" x="300" y="324" width="424" height="16"/>

  ${v('tree', 'up', `<path class="wall" d="M140 300C143 268 145 236 146 204C146 186 144 170 141 156L146 155C149 168 151 182 152 196C158 178 168 164 182 152L185 156C172 170 162 186 157 210C156 244 158 272 162 300Z"/>
    <path class="ln" d="M146 214C134 200 120 190 106 168M150 236C162 226 176 222 196 204M141 158C136 148 134 140 136 132M182 152C188 144 196 140 204 140"/>
    <path class="ln fine" d="M120 190C112 186 104 184 96 186M106 168C102 160 102 152 104 146M176 222C184 222 192 226 198 232M196 204C200 196 206 192 212 190"/>`)}
  ${v('tree', 'down', `<path class="wall" d="M140 300C142 290 143 280 143 270L148 276 151 266 155 274 158 268C159 280 160 290 162 300Z"/>
    <path class="wall" d="M141 292L62 309 59 302 139 285Z"/>
    <path class="ln" d="M110 293C106 284 100 278 92 272M84 302C78 292 76 284 74 276M124 290C128 282 134 278 140 276"/>
    <path class="ln fine" d="M74 276C70 272 66 270 61 270M92 272C88 266 88 262 90 258"/>`)}
  `;
}

const FALSE = { smoke: 'on', tree: 'up', shutters: 'shut', door: 'shut' };
const TRUE = { smoke: 'off', tree: 'down', shutters: 'open', door: 'open' };

// A pen loop: one turn and a little more, slightly spiralled, slightly uneven.
function loopPath(cx, cy, rx, ry) {
  const n = 60, start = -1.9 + (Math.random() - 0.5) * 0.6, wob = Math.random() * 6.28, turn = 1.09;
  let d = '';
  for (let i = 0; i <= n; i++) {
    const t = i / n, a = start + t * turn * 2 * Math.PI;
    const k = 1 + 0.03 * Math.sin(3 * a + wob) + 0.06 * (t - 0.5);
    d += (i ? 'L' : 'M') + (cx + rx * k * Math.cos(a)).toFixed(1) + ' ' + (cy + ry * k * Math.sin(a)).toFixed(1);
  }
  return d;
}

export default {
  id: 'tarn',
  title: 'A Somewhat Childish Experiment',
  mount(stage, api = {}) {
    const rm = !!api.reducedMotion;
    const setFlag = (k, val) => { try { api.setFlag && api.setFlag(k, val); } catch (e) { console.error(e); } };
    let alive = true;
    const timers = new Set();
    const later = (fn, ms) => {
      const t = setTimeout(() => { timers.delete(t); if (alive) fn(); }, ms);
      timers.add(t);
      return t;
    };
    const cancel = t => { if (t) { clearTimeout(t); timers.delete(t); } };

    const root = document.createElement('div');
    root.className = 'g-tarn' + (rm ? ' rm' : '');
    const slotsSvg = [0, 1, 2, 3, 4].map(i => `<g class="slot" transform="translate(${14 + i * 28} 14)">
        <circle class="f" r="10"/><circle class="r" r="10"/>
        <path class="sm" d="M-10 2.5C-8-3-2-6.5 4-6C9-5.5 11-1.5 8.5 1.5C6 4.5 1 3.5-3 6.5C-6 9-10.5 7-10 2.5Z"/>
        <g class="dr"><path d="M1 6V28"/><circle cx="1" cy="30.5" r="2.6"/></g></g>`).join('');
    root.innerHTML = `<style>${CSS}</style>
<svg class="tarn-svg" viewBox="0 0 960 640" preserveAspectRatio="xMidYMid meet" role="img"
     aria-label="A house above a black tarn, and its upside-down reflection in the water">
  <defs>
    <pattern id="tarn-hatch-above" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line class="hx-above" x1="0" y1="0" x2="0" y2="5"/></pattern>
    <pattern id="tarn-hatch-below" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line class="hx-below" x1="0" y1="0" x2="0" y2="5"/></pattern>
    <pattern id="tarn-hatch-h-above" width="9" height="4" patternUnits="userSpaceOnUse"><path class="hx-above" d="M0 2h6.5"/></pattern>
    <pattern id="tarn-hatch-h-below" width="9" height="4" patternUnits="userSpaceOnUse"><path class="hx-below" d="M0 2h6.5"/></pattern>
    <pattern id="tarn-water" width="26" height="11" patternUnits="userSpaceOnUse"><path class="hx-water" d="M0 3h11M14 8.5h8"/></pattern>
    <linearGradient id="tarn-deep" x1="0" y1="0" x2="0" y2="1"><stop class="deep-a" offset="0"/><stop class="deep-b" offset="1"/></linearGradient>
    <mask id="tarn-depth" maskUnits="userSpaceOnUse" x="0" y="${WL}" width="960" height="${640 - WL}">
      <rect x="0" y="${WL}" width="960" height="${640 - WL}" fill="url(#tarn-deep)"/>
    </mask>
  </defs>
  <rect class="sky" width="960" height="640"/>
  <g class="above">${drawHouse(FALSE)}</g>
  <rect class="water" x="0" y="${WL}" width="960" height="${640 - WL}"/>
  <rect class="water-hatch" x="0" y="${WL}" width="960" height="${640 - WL}"/>
  <g mask="url(#tarn-depth)"><g class="below" transform="${MIRROR}">${drawHouse(TRUE)}</g></g>
  <g class="truth" transform="${MIRROR}">
    <path class="crack" d="M446 136L438 158 448 178 436 202 444 228 434 252 440 274 432 300 437 316 428 340"/>
    <path class="crack fine" d="M436 202L426 210 420 222M440 274L451 283"/>
    <path class="lit" d="M343 180V144Q343 128 360 122Q377 128 377 144V180Z" style="opacity:0"/>
  </g>
  <g class="her" style="opacity:0">
    <path class="her-body" d="M355.5 518C352 529 350 538 348.5 547H371.5C370 538 368 529 364.5 518C362.5 516 357.5 516 355.5 518Z"/>
    <path class="her-hair" d="M356 508C353.5 513 353.5 520 355 527M364 508C366.5 513 366.5 520 365 527"/>
    <ellipse class="her-body" cx="360" cy="510" rx="4.2" ry="5" transform="rotate(-14 360 510)"/>
  </g>
  <g class="marks"></g>
</svg>
<div class="tarn-hud">
  <div class="tarn-line">Find the five differences.</div>
  <svg class="tarn-rings" viewBox="0 0 186 40" aria-hidden="true">${slotsSvg}
    <g class="six" transform="translate(166 14)"><circle class="r6" r="10"/><path class="x" d="M-8-8L8 8"/><path class="x x2" d="M8-8L-8 8"/></g>
  </svg>
  <span class="vh" aria-live="polite"></span>
</div>`;
    stage.appendChild(root);

    const $ = s => root.querySelector(s);
    const svg = $('.tarn-svg'), above = $('.above'), marks = $('.marks');
    const lit = $('.lit'), her = $('.her'), six = $('.six'), live = $('.vh');
    const slotEls = [...root.querySelectorAll('.slot')];
    const slotState = ['empty', 'empty', 'empty', 'empty', 'empty'];

    const mk = (tag, attrs, parent) => {
      const e = document.createElementNS(NS, tag);
      for (const k in attrs) e.setAttribute(k, attrs[k]);
      if (parent) parent.appendChild(e);
      return e;
    };
    const anim = (el, frames, opts) => { try { return el.animate(frames, opts); } catch (e) { return null; } };
    const fade = (el, to, ms) => {
      const from = parseFloat(getComputedStyle(el).opacity);
      el.style.opacity = to;
      if (from !== to) anim(el, [{ opacity: from }, { opacity: to }], { duration: ms, easing: 'ease-in-out' });
    };
    // Pen stroke: offset 102 is hidden, 0 is whole; anything between is a partial stroke.
    const pen = (el, ms, to = 0, delay = 0) => {
      el.setAttribute('pathLength', '100');
      el.style.strokeDasharray = '100 120';
      el.style.strokeDashoffset = to;
      if (rm) anim(el, [{ opacity: 0 }, { opacity: 1 }], { duration: 260, delay, fill: 'backwards' });
      else anim(el, [{ strokeDashoffset: 102 }, { strokeDashoffset: to }],
        { duration: ms, delay, easing: 'cubic-bezier(.45,0,.25,1)', fill: 'backwards' });
      return el;
    };
    const unpen = (el, ms) => {
      el.getAnimations().forEach(a => a.cancel());
      const a = rm ? anim(el, [{ opacity: 1 }, { opacity: 0 }], { duration: ms, fill: 'forwards' })
        : anim(el, [{ strokeDashoffset: 0 }, { strokeDashoffset: 102 }], { duration: ms, easing: 'cubic-bezier(.5,0,.6,1)', fill: 'forwards' });
      if (a) a.onfinish = () => el.remove(); else el.remove();
    };
    const kill = el => { el.getAnimations().forEach(a => a.cancel()); el.remove(); };
    const loops = (c, ms, delay = 0, scale = 1, to = 0) => [
      pen(mk('path', { class: 'mk mk-a', d: loopPath(c.cx, c.cy, c.rx * scale, c.ry * scale) }, marks), ms, to, delay),
      pen(mk('path', { class: 'mk mk-b', d: loopPath(c.cx, 680 - c.cy, c.rx * scale, c.ry * scale) }, marks), ms, to, delay),
    ];
    const tick = (x, y) => {
      const p = mk('path', { class: 'tick ' + (y > WL ? 'tick-b' : 'tick-a'), d: `M${(x - 7).toFixed(1)} ${(y - 1).toFixed(1)}l4.5 5.5 10-12` }, marks);
      const a = anim(p, [{ opacity: 0.9 }, { opacity: 0 }], { duration: 1400, easing: 'ease-in', fill: 'forwards' });
      if (a) a.onfinish = () => p.remove(); else later(() => p.remove(), 1400);
    };
    const setSlot = (i, s) => {
      slotState[i] = s;
      slotEls[i].classList.remove('empty', 'full', 'smear', 'drip');
      slotEls[i].classList.add(s);
      live.textContent = `${slotState.filter(x => x === 'full').length} of five`;
    };
    const setVariant = (id, val, ms, fresh) => {
      above.querySelectorAll(`[data-d="${id}"]`).forEach(g => {
        const on = g.dataset.v === val;
        g.classList.toggle('fresh', !!fresh && on);
        fade(g, on ? 1 : 0, ms);
      });
    };

    // ---- state ----
    const diffs = DIFFS.map(d => ({ ...d, state: 'hidden', marks: [], slot: -1, n: 0 }));
    let phase = 'play';            // play → interlude → window → over
    let finds = 0, glances = 0;
    let cheatPending = false, cheatDone = false, cheated = null;
    let hinted = false, hintT = null, spotDrip = null;
    let litOn = false, sawHer = false, windowT = null, doneCalled = false;

    function armHint() {
      cancel(hintT); hintT = null;
      if (!cheated || hinted || phase !== 'play') return;
      if (diffs.some(d => d.state === 'hidden')) return;      // only the cheated spot left
      hintT = later(showHint, 10000);
    }
    function showHint() {
      if (!cheated) return;
      hinted = true;
      slotEls[cheated.slot].classList.add('drip');
      // The redrawn detail is fresh ink, and it runs.
      const a = cheated.drip;
      spotDrip = mk('g', {}, above);
      const line = mk('path', { class: 'ln', d: `M${a.x} ${a.y}v20` }, spotDrip);
      const drop = mk('circle', { class: 'mass', cx: a.x, cy: a.y + 22.5, r: 3 }, spotDrip);
      pen(line, 1600);
      if (!rm) anim(drop, [{ opacity: 0 }, { opacity: 1 }], { duration: 250, delay: 1500, fill: 'backwards' });
    }

    function find(d) {
      d.state = 'found';
      d.n = ++finds;
      d.slot = slotState.findIndex(s => s === 'empty');
      d.marks = loops(d.loop, 400);
      setSlot(d.slot, 'full');
      if (finds === 4 && !cheatPending && !cheatDone) { cheatPending = true; later(cheat, 700); }
      checkComplete();
    }

    // Once, 700 ms after the fourth find: an earlier find unwinds, and the house matches the water.
    function cheat() {
      cheatPending = false; cheatDone = true;
      const pool = diffs.filter(d => d.state === 'found' && d.id !== 'crack' && d.n < 4).sort((a, b) => a.n - b.n);
      const t = pool.find(d => d.id === 'smoke') || pool[0];
      if (!t) { checkComplete(); return; }
      t.state = 'cheated'; cheated = t;
      t.marks.forEach(el => unpen(el, 1200)); t.marks = [];
      setSlot(t.slot, 'smear');
      setVariant(t.id, t.water, 1200, true);
      armHint();
    }

    // Caught: double circle, the ring refills, the house puts it back and flinches.
    function caught(d) {
      d.state = 'found';
      setFlag('tarnCaught', hinted ? 'hinted' : 'unaided');
      d.marks.forEach(kill);
      d.marks = [...loops(d.loop, 380), ...loops(d.loop, 300, 320, 1.17)];
      setSlot(d.slot, 'full');
      setVariant(d.id, d.house, 350, false);
      if (spotDrip) { const s = spotDrip; spotDrip = null; fade(s, 0, 300); later(() => s.remove(), 320); }
      cheated = null; cancel(hintT);
      if (!rm) anim(above, [{ transform: 'translate(0px,0px)' }, { transform: 'translate(4px,0px)' },
        { transform: 'translate(-2px,0px)' }, { transform: 'translate(0px,0px)' }], { duration: 240, easing: 'ease-out' });
      checkComplete();
    }

    function checkComplete() {
      if (phase === 'play' && cheatDone && !cheatPending && diffs.every(d => d.state === 'found')) {
        phase = 'interlude';
        later(startWindow, 1000);
      }
    }

    // Looked back at: in the water only, a window lights; someone in it faces up.
    function startWindow() {
      phase = 'window'; litOn = true;
      fade(lit, 1, rm ? 250 : 700);
      fade(her, 1, rm ? 250 : 900);
      windowT = later(lightOut, 5000);
    }
    function tapHer() {
      sawHer = true; cancel(windowT);
      six.classList.add('on');
      const ms = 380;
      loops(WINDOW.loop, ms, 0, 1, 45);          // your circle starts…
      later(() => {                                // …an ink cross strikes it out
        const c = WINDOW.loop;
        [[c.cx - 32, c.cy - 42, c.cx + 32, c.cy + 42], [c.cx + 32, c.cy - 42, c.cx - 32, c.cy + 42]].forEach(([x1, y1, x2, y2], i) => {
          for (const below of [false, true]) {
            const a = below ? 680 - y1 : y1, b = below ? 680 - y2 : y2;
            const d = `M${x1} ${a}Q${(x1 + x2) / 2 + 4} ${(a + b) / 2 - 3} ${x2} ${b}`;
            if (!below) pen(mk('path', { class: 'xhalo', d }, marks), 170, 0, i * 190);
            pen(mk('path', { class: below ? 'xb' : 'xa', d }, marks), 170, 0, i * 190);
          }
        });
        six.classList.add('crossed');
      }, ms + 60);
      later(lightOut, ms + 60 + 400);               // …the light dies
    }
    function lightOut() {
      if (!litOn) return;
      litOn = false; phase = 'over'; cancel(windowT);
      fade(lit, 0, rm ? 250 : 700);
      fade(her, 0, rm ? 250 : 700);
      setFlag('tarnSawHer', sawHer);
      setFlag('tarnGlancesDown', glances);
      later(finish, 1200);
    }
    function finish() {
      if (doneCalled) return;
      doneCalled = true;
      try {
        api.done && api.done({
          won: true,
          score: { 'differences found': 5, 'glances down': glances },
          note: 'Five of five. The house thanks you.',
        });
      } catch (e) { console.error(e); }
    }

    function tap(x, y) {
      if (phase === 'over') return;
      const water = y > WL;
      if (water) glances++;
      const hy = water ? 680 - y : y;               // both halves are the same place
      if (phase === 'window') {
        if (litOn && !sawHer && Math.hypot(x - WINDOW.x, hy - WINDOW.y) <= WINDOW.r) tapHer();
        else tick(x, y);
        return;
      }
      let best = null, bestK = Infinity, onFound = false;
      for (const d of diffs) {
        for (const h of d.hits) {
          const k = Math.hypot(x - h.x, hy - h.y) / h.r;
          if (k > 1) continue;
          if (d.state === 'found') { onFound = true; continue; }
          if (k < bestK) { best = d; bestK = k; }
        }
      }
      if (phase === 'play' && best) {
        if (best.state === 'cheated') caught(best); else find(best);
      } else if (!onFound) tick(x, y);
      armHint();
    }

    const onDown = e => {
      if (!alive || !e.isPrimary || (e.pointerType === 'mouse' && e.button !== 0)) return;
      const m = svg.getScreenCTM();
      if (!m) return;
      const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
      if (p.x < 0 || p.x > 960 || p.y < 0 || p.y > 640) return;
      e.preventDefault();
      tap(p.x, p.y);
    };
    svg.addEventListener('pointerdown', onDown);

    return () => {
      alive = false;
      timers.forEach(clearTimeout); timers.clear();
      svg.removeEventListener('pointerdown', onDown);
      try { root.getAnimations({ subtree: true }).forEach(a => a.cancel()); } catch (e) { /* older engines */ }
      root.remove();
    };
  },
};
