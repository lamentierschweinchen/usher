// Tarn: A Somewhat Childish Experiment (chapter I), both ways.
// Above (act one, api.mode 'sojourn'): spot the five differences between the house and its
// reflection, either half. The water runs early (the tree lies fallen there from the start, and
// falls above once found); the house cheats once (an earlier find unwinds, her gauze rim pulses
// beside it in the water); then a window lights red in the water only. Every press is recorded.
// Below (act two, api.mode 'burial'): below.js, "Before he looks".
// Spec: work/fullgame/MILESTONE-2.md §4 · Contract: work/design/CONTRACT.md · Voice: work/depth/VOICE.md
// On-screen strings carry their marks: V verbatim, R recut, N new; [uNN] is source/usher-1845.md.

import { C, CSS, WL, DIFFS, WINDOW, FALSE, scene, reflect, eyeD, herInEye, herRim, gameDefs,
  pick, onWindow, measure, kit, setVariant, fell } from './scene.js';
import { mountBelow } from './below.js';

const LINES = {
  teach: 'Scan more narrowly: five differences.',                       // R [u06] · N
  early: ['Not wrong.', 'Not yet.'],                                    // N
  dream: '<i>What</i> <span class="rom">must</span> <i>have been a dream.</i>',   // R [u06]
  note: 'The fabric gave little token of instability.',                 // R [u06]
  label: 'The house above, and the tarn returning it upside down',      // N
};
const WORDS = ['none', 'one', 'two', 'three', 'four', 'five'];
const ofFive = n => `${WORDS[n]} of five`;                                // N

// Where her rim shows in the water, beside the thing the house took back: feet, hanging head-down.
const RIM_AT = { smoke: [664, 534], portrait: [716, 466], door: [716, 398] };

function mountAbove(stage, api) {
  const rm = !!api.reducedMotion;
  const setFlag = (k, val) => { try { api.setFlag && api.setFlag(k, val); } catch (e) { console.error(e); } };
  let alive = true;
  const K = kit(null, () => alive, rm);
  const { later, cancel, mk, anim, fade, pen, unpen, kill } = K;

  // the game's clock, for the record
  const t0 = performance.now();
  const clock = () => Math.round((performance.now() - t0) / 10) / 100;
  const rec = (type, data = {}) => {
    if (api.mode === 'burial' || typeof api.record !== 'function') return;
    try { api.record(type, { t: clock(), ...data }); } catch (e) { /* the spine owns the save */ }
  };

  C.autoLace();                                   // phones: about half the lace (decided before any markup)
  const root = document.createElement('div');
  root.className = 'g-tarn' + (rm ? ' rm sh-still' : '');
  const slotsSvg = [0, 1, 2, 3, 4].map(i => `<g class="slot" transform="translate(${14 + i * 28} 14)">
      <circle class="f" r="10"/><circle class="r" r="10"/>
      <path class="sm" d="M-9.5 5.2C-5 10.6 5 11.4 12.6 6.4C13.6 5.8 13.4 7.4 12.4 8.2C5.4 13.6-5.6 13-10.4 6.6C-10.8 5.9-10 4.6-9.5 5.2ZM9.6 2.6C11.6 1.6 13.6 2.6 13.2 4.4C12.2 4.2 10.8 4 9.6 2.6Z"/>
      <g class="dr"><path d="M-1 6h4l-1.1 22h-1.8z"/><circle cx="1" cy="30.5" r="2.6"/></g></g>`).join('');
  root.innerHTML = `<style>${CSS}</style>
<svg class="tarn-svg" viewBox="0 0 960 640" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${LINES.label}">
  ${C.defs({ animate: false })}
  ${gameDefs()}
  ${C.backdrop('tarn', { h: WL })}
  <g class="above" style="color:var(--sh-cut)">${scene(FALSE, true)}</g>
  ${C.glass('tarn', { y: WL, h: 640 - WL })}
  <g class="water">${reflect({ smoke: 'off', tree: 'down', portrait: 'two', door: 'open' }, false)}</g>
  <g class="scripts"></g>
  <g class="rimfx" style="opacity:0"></g>
  <g class="lit" style="opacity:0"><path d="${eyeD()}" style="fill:var(--g-tarn-red)" filter="url(#sh-glow)"/></g>
  <g class="her" style="opacity:0">${herInEye('g-tarn-eye')}</g>
  <g class="marks"></g>
  <g class="strike" filter="url(#sh-rim)"></g>
  ${C.frame()}
</svg>
<div class="tarn-hud">
  <div class="tarn-line">${LINES.teach}</div>
  <svg class="tarn-rings" viewBox="0 0 186 40" aria-hidden="true">${slotsSvg}
    <g class="six" transform="translate(166 14)"><circle class="r6" r="10"/><path class="x" d="M-9-7.2L-7.2-9 9 7.2 7.2 9Z"/><path class="x x2" d="M9-7.2L7.2-9-9 7.2-7.2 9Z"/></g>
  </svg>
  <span class="vh" aria-live="polite"></span>
</div>`;
  stage.appendChild(root);

  const $ = s => root.querySelector(s);
  const svg = $('.tarn-svg'), above = $('.above'), marks = $('.marks'), strike = $('.strike'), scripts = $('.scripts');
  const halos = { above: { sky: $('.above .halos-sky'), face: $('.above .halos-face') },
    below: { sky: $('.water .halos-sky'), face: $('.water .halos-face') } };
  const lit = $('.lit'), her = $('.her'), six = $('.six'), live = $('.vh'), line = $('.tarn-line'), rimfx = $('.rimfx');
  const slotEls = [...root.querySelectorAll('.slot')];
  const slotState = ['empty', 'empty', 'empty', 'empty', 'empty'];
  let boxes = null;                                  // each state's whole cut, measured on first press

  // Both halves are the same place: the water's halo sits inside the returned (mirrored) house.
  // On the pale returned paper the halo burns amber, or it would vanish into it.
  const halo = (c, scale, layer, fill) => mk('ellipse', { class: 'halo', cx: c.cx, cy: c.cy,
    rx: (c.rx * 1.2 * scale).toFixed(1), ry: (c.ry * 1.2 * scale).toFixed(1), fill }, layer[c.at]);
  const loops = (c, ms, delay = 0, scale = 1, to = 0) => [
    pen(halo(c, scale, halos.above, 'url(#g-tarn-halo)'), ms, to, delay),
    pen(halo(c, scale, halos.below, 'url(#g-tarn-halo-w)'), ms, to, delay),
  ];
  const setSlot = (i, s) => {
    slotState[i] = s;
    slotEls[i].classList.remove('empty', 'full', 'smear', 'drip');
    slotEls[i].classList.add(s);
    // the count is said when the dots show it: at once when one empties, as a filling one lands
    const say = () => { live.textContent = ofFive(slotState.filter(x => x === 'full').length); };
    if (s === 'full') later(say, 360); else say();
  };
  const sayLine = html => { line.innerHTML = html; if (!rm) anim(line, [{ opacity: 0 }, { opacity: 1 }], { duration: 400 }); };

  // ---- state ----
  const diffs = DIFFS.map(d => ({ ...d, state: 'hidden', marks: [], slot: -1, n: 0 }));
  let phase = 'play';            // play → interlude → window → over
  let finds = 0, glances = 0;
  let cheatPending = false, cheatDone = false, cheated = null;
  let hinted = false, hintT = null, spotDrip = null;
  let litOn = false, sawHer = false, windowT = null, litAt = 0, doneCalled = false;

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
    // The re-cut detail hasn't set, and light runs from it.
    const a = cheated.drip;
    spotDrip = mk('g', { class: 'drip', filter: 'url(#g-tarn-cut)' }, above);
    const ln = mk('path', { class: 'drip-ln', d: C.taper([[a.x, a.y], [a.x + .4, a.y + 10], [a.x, a.y + 20]], 4, 2) }, spotDrip);
    const drop = mk('circle', { class: 'drip-dot', cx: a.x, cy: a.y + 22.5, r: 3.2 }, spotDrip);
    if (rm) anim(ln, [{ opacity: 0 }, { opacity: 1 }], { duration: 200 });
    else anim(ln, [{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], { duration: 1600, easing: 'ease-in' });
    if (!rm) anim(drop, [{ opacity: 0 }, { opacity: 1 }], { duration: 250, delay: 1500, fill: 'backwards' });
  }

  function find(d) {
    d.state = 'found';
    d.n = ++finds;
    d.slot = slotState.findIndex(s => s === 'empty');
    d.marks = loops(d.loop, 400);
    setSlot(d.slot, 'full');
    if (d.id === 'tree') later(fallAbove, 1500);
    if (finds === 4 && !cheatPending && !cheatDone) { cheatPending = true; later(cheat, 700); }
    checkComplete();
  }

  // Early: the water was right a moment early. The tree above falls; the find stays lit.
  function fallAbove() {
    rec('fall');
    fell(K, above, rm);
    K.script(LINES.early, 186, 456, scripts);
  }

  // Once, 700 ms after the fourth find: an earlier find unwinds, and the house matches the water.
  // Never the crack, never the tree. As it goes, her gauze rim pulses beside it in the water.
  function cheat() {
    cheatPending = false; cheatDone = true;
    const pool = diffs.filter(d => d.state === 'found' && d.id !== 'crack' && d.id !== 'tree' && d.n < 4).sort((a, b) => a.n - b.n);
    const t = pool.find(d => d.id === 'smoke') || pool[0];
    if (!t) { checkComplete(); return; }
    t.state = 'cheated'; cheated = t;
    rec('cheat', { id: t.id });
    t.marks.forEach(el => unpen(el, 1200)); t.marks = [];
    setSlot(t.slot, 'smear');
    setVariant(K, above, t.id, t.water, 1200, true);
    rimPulse(t.id);
    sayLine(LINES.dream);
    armHint();
  }
  function rimPulse(id) {
    const [x, y] = RIM_AT[id] || RIM_AT.smoke;
    rimfx.innerHTML = herRim(x, y, 1.5, true);
    if (rm) { rimfx.style.opacity = 1; later(() => { rimfx.style.opacity = 0; }, 900); return; }
    rimfx.style.opacity = 0;
    anim(rimfx, [{ opacity: 0 }, { opacity: 1, offset: .22 }, { opacity: 1, offset: .45 }, { opacity: 0 }], { duration: 1500, easing: 'ease-in-out' });
  }

  // Caught: double circle, the ring refills, the house puts it back and flinches.
  function caught(d) {
    d.state = 'found';
    setFlag('tarnCaught', hinted ? 'hinted' : 'unaided');
    d.marks.forEach(kill);
    d.marks = [...loops(d.loop, 380), ...loops(d.loop, 300, 320, 1.17)];
    setSlot(d.slot, 'full');
    setVariant(K, above, d.id, d.house, 350, false);
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
    phase = 'window'; litOn = true; litAt = clock();
    fade(lit, 1, 700);
    fade(her, 1, 900);
    windowT = later(lightOut, 5000);
  }
  function tapHer() {
    sawHer = true; cancel(windowT);
    six.classList.add('on');
    const ms = 380;
    loops(WINDOW.loop, ms, 0, 1, 45);          // your circle starts…
    later(() => { K.cross(WINDOW.loop, strike); six.classList.add('crossed'); }, ms + 60);   // …a cut-paper cross strikes it out
    later(lightOut, ms + 60 + 400);               // …the light dies
  }
  function lightOut() {
    if (!litOn) return;
    litOn = false; phase = 'over'; cancel(windowT);
    rec('window', { t: litAt, tapped: sawHer });
    fade(lit, 0, 700);
    fade(her, 0, 700);
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
        score: { 'differences found': 5, 'glances down': glances },   // N (labels stand)
        note: LINES.note,
      });
    } catch (e) { console.error(e); }
  }

  function tap(x, y) {
    if (phase === 'over') return;
    K.right();                                     // a tap rights the water's script
    const water = y > WL;
    if (water) glances++;
    const hy = water ? 680 - y : y;               // both halves are the same place
    const half = water ? 'below' : 'above';
    if (!boxes) boxes = measure(above);
    const under = pick(x, hy, boxes);              // whatever lies there, found or not
    if (phase !== 'play') {
      const win = phase === 'window' && onWindow(x, hy);
      if (win && litOn && !sawHer) { rec('tap', { x: +x.toFixed(1), hy: +hy.toFixed(1), half, hit: 'window', kind: 'window' }); tapHer(); return; }
      rec('tap', { x: +x.toFixed(1), hy: +hy.toFixed(1), half, hit: win ? 'window' : under ? under.d.id : null, kind: 'miss' });
      K.tick(x, y, marks);
      return;
    }
    const open = pick(x, hy, boxes, d => diffs.find(e => e.id === d.id).state !== 'found');
    const best = open && diffs.find(e => e.id === open.d.id);
    let kind = 'miss';
    if (best) { kind = best.state === 'cheated' ? 'catch' : 'find'; if (kind === 'catch') caught(best); else find(best); }
    else if (!under) K.tick(x, y, marks);
    rec('tap', { x: +x.toFixed(1), hy: +hy.toFixed(1), half, hit: best ? best.id : under ? under.d.id : null, kind });
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
  root.__tarn = () => ({ phase, finds, glances, cheated: cheated && cheated.id, hinted, sawHer, diffs: diffs.map(d => [d.id, d.state]) });

  return () => {
    alive = false;
    K.timers.forEach(clearTimeout); K.timers.clear();
    svg.removeEventListener('pointerdown', onDown);
    try { root.getAnimations({ subtree: true }).forEach(a => a.cancel()); } catch (e) { /* older engines */ }
    root.remove();
  };
}

export default {
  id: 'tarn',
  title: 'A Somewhat Childish Experiment',   // R [u05]
  ghost: { event: 'tap', min: 5 },
  // api.mode: 'sojourn' (act one, recording) or 'burial' (act two, before he looks). Absent means act one.
  mount(stage, api = {}) {
    return api.mode === 'burial' ? mountBelow(stage, api) : mountAbove(stage, api);
  },
};
