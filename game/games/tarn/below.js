// Tarn below (act two, api.mode 'burial'): Before he looks. Spec: work/fullgame/MILESTONE-2.md §4.
// The act-one scene turned over (y → 680 − y): her house stands upright as light above the line,
// his black house hangs beneath, Madeline on her bank at the left. His recorded gaze is a lamp
// ring, in both halves, gliding from each recorded press to the next and arriving on time, with
// the next 1.5 s dotted ahead. Her verb: change a thing in her house before he looks (never under
// his ring). His look lights what she changed: one given. Then the cheat was hers, and the window.

import { C, CSS, WL, BYID, FALSE, WINDOW, scene, reflect, eyeD, herInEye, herRim, rodCut, gameDefs,
  pick, onWindow, measure, kit, setVariant, fell } from './scene.js';

const LINES = {
  other: 'Another guest looked, before you.',                                   // N
  before: 'Before he looks.',                                                    // N
  nearly: 'He nearly saw.',                                                      // N
  dream: '<i>What</i> <span class="rom">must</span> <i>have been a dream.</i>',  // R [u06]
  twice: 'So he will look twice.',                                               // N
  seen: 'I regarded her with an utter astonishment not unmingled with dread.',   // R [u14] (the note)
  gone: 'Disappeared.',                                                          // R [u14] (the note)
  label: 'The tarn turned over: her house above, his hanging beneath',  // N
};
const WORDS = ['none', 'one', 'two', 'three', 'four', 'five'];
const givenSay = n => `${WORDS[n] || n} given`;                                   // N

const CHANGES = ['smoke', 'tree', 'portrait', 'door'];   // the crack is there already, red, and always found
const R = 100;          // his gaze
const HOLD = 4;         // seconds a change holds before her house puts it back
const START = { x: 480, y: 110 };
// Her rod: from her side (the stud) through the line into his thing. Screen coordinates.
const ROD = { smoke: { x: 634, y0: 78, y1: 594 }, portrait: { x: 608, y0: 146, y1: 504 }, door: { x: 500, y0: 240, y1: 418 } };
// Her rim, beside the thing, upright in her own house (where act one's water showed it hanging).
const RIM_AT = { smoke: [664, 146], portrait: [716, 214], door: [716, 282] };

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;
const ease = k => (k < .5 ? 2 * k * k : 1 - (2 - 2 * k) ** 2 / 2);
const num = v => typeof v === 'number' && isFinite(v);
const kindOf = e => e && (e.event || e.type);      // the spine keeps the recorded name in `event`

// His act one, laid on our clock. Looks are his presses before the window; their arrival times
// keep his pace (gaps held between 0.35 and 6 s), the first two at two-thirds speed.
export function plan(events) {
  const ev = (Array.isArray(events) ? events : []).filter(e => e && typeof e === 'object');
  const taps = ev.filter(e => kindOf(e) === 'tap' && num(e.t) && num(e.x) && num(e.hy)).sort((a, b) => a.t - b.t);
  const win = ev.find(e => kindOf(e) === 'window' && num(e.t)) || null;
  const cheat = ev.find(e => kindOf(e) === 'cheat' && num(e.t)) || null;
  const wtap = taps.find(e => e.kind === 'window') || null;
  const looks = taps.filter(e => e.kind !== 'window' && (!win || e.t < win.t));
  const LEAD = 1.2;
  let pa = LEAD, pt = 0;
  const A = looks.map((e, i) => {
    pa += clamp(e.t - pt, i === 0 ? 2.4 : .35, 6) * (i < 2 ? 1.5 : 1);
    pt = e.t;
    return pa;
  });
  const toA = t => {
    if (!looks.length) return LEAD + clamp(t, 0, 6);
    if (t <= looks[0].t) return LEAD + (A[0] - LEAD) * Math.max(0, t) / (looks[0].t || 1);
    for (let i = 1; i < looks.length; i++) if (t <= looks[i].t) {
      const a = looks[i - 1], b = looks[i];
      return A[i - 1] + (A[i] - A[i - 1]) * (t - a.t) / ((b.t - a.t) || 1);
    }
    return A[A.length - 1] + Math.min(t - looks[looks.length - 1].t, 6);
  };
  // the cheat: her rod rises at his recorded cheat; his catch comes at least 3.2 s later
  let rod = null;
  if (cheat) {
    const ci = looks.findIndex(e => e.kind === 'catch' && e.t > cheat.t);
    const id = ROD[cheat.id] ? cheat.id : ci >= 0 && ROD[looks[ci].hit] ? looks[ci].hit : 'smoke';
    const at = toA(cheat.t);
    if (ci >= 0 && A[ci] - at < 3.2) { const d = 3.2 - (A[ci] - at); for (let j = ci; j < A.length; j++) A[j] += d; }
    rod = { id, at, catchI: ci };
  }
  const lastA = A.length ? A[A.length - 1] : LEAD;
  const W0 = Math.max(win ? toA(win.t) : lastA + 1, lastA + .8);
  const Aw = wtap ? Math.max(toA(wtap.t), W0 + 3.2) : null;
  // the ring's path: dwell at a look, then glide to the next, arriving on time
  const segs = [];
  let prev = START, prevA = 0;
  looks.forEach((e, i) => {
    const g = clamp((A[i] - prevA) * .55, .3, i < 2 ? 1.8 : 1.2);
    segs.push({ x0: prev.x, y0: prev.y, x1: e.x, y1: e.hy, d: A[i] - g, a: A[i] });
    prev = { x: e.x, y: e.hy }; prevA = A[i];
  });
  if (Aw != null) segs.push({ x0: prev.x, y0: prev.y, x1: 350, y1: 186, d: Aw - 2.2, a: Aw });
  return { looks, A, rod, W0, Aw, segs, cheat, wtap, win };
}
function gazeAt(P, T, step) {
  const S = P.segs;
  if (!S.length) return START;
  if (T < S[0].d) return { x: S[0].x0, y: S[0].y0 };
  let s = S[0];
  for (const q of S) { if (q.d <= T) s = q; else break; }
  if (T >= s.a) return { x: s.x1, y: s.y1 };
  const k = (T - s.d) / (s.a - s.d);
  if (step) return k < .5 ? { x: s.x0, y: s.y0 } : { x: s.x1, y: s.y1 };
  const e = ease(k);
  return { x: lerp(s.x0, s.x1, e), y: lerp(s.y0, s.y1, e) };
}

export function mountBelow(stage, api = {}) {
  const rm = !!api.reducedMotion;
  const speed = clamp(+api.speed || 1, .25, 16);      // the harness's fast-forward; the spine never sets it
  const setFlag = (k, val) => { try { api.setFlag && api.setFlag(k, val); } catch (e) { console.error(e); } };
  let alive = true;
  const K = kit(null, () => alive, rm);
  const { later, mk, anim, fade, pen, unpen, kill } = K;

  C.autoLace();
  const root = document.createElement('div');
  root.className = 'g-tarn g-tarn-below' + (rm ? ' rm sh-still' : '');
  const dots = n => Array.from({ length: n }, () => '<circle r="3.4" style="opacity:0"/>').join('');
  root.innerHTML = `<style>${CSS}</style>
<svg class="tarn-svg" viewBox="0 0 960 640" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${LINES.label}">
  ${C.defs({ animate: false })}
  ${gameDefs()}
  <g class="world" transform="translate(0 680) scale(1 -1)">
    ${C.backdrop('tarn', { h: WL })}
    <g class="his" style="color:var(--sh-cut)">${scene(FALSE, true)}</g>
    ${C.glass('tarn', { y: WL, h: 680 - WL })}
    <g class="hers">${reflect(FALSE, true, 'g-tarn-depth2')}</g>
  </g>
  <g class="rimfx" style="opacity:0"></g>
  <g class="cue" style="opacity:0"><path d="${eyeD(-308)}" style="fill:var(--g-tarn-red)" filter="url(#sh-glow)"/></g>
  <g class="lit" style="opacity:0"><path d="${eyeD(-308)}" style="fill:var(--g-tarn-red)" filter="url(#sh-glow)"/></g>
  <g class="her" style="opacity:0">${herInEye('g-tarn-eye2', -308)}</g>
  <g class="bank-her">
    <g style="opacity:.82">${C.figure('madeline', { x: 46, y: 297, scale: 2, faint: false, attrs: 'style="--gauze:#f6ead2"' })}</g>
    <g class="bank-rim" style="opacity:0">${herRim(46, 297, 2, false)}</g>
  </g>
  <g class="rods"></g>
  <g class="gaze">
    <g clip-path="url(#g-tarn-upper)"><circle class="ring ring-a" r="${R}" fill="url(#g-tarn-ring)" cx="${START.x}" cy="${START.y}"/><g class="dots dots-a" style="fill:var(--sh-lamp)">${dots(10)}</g></g>
    <g clip-path="url(#g-tarn-lower)"><circle class="ring ring-b" r="${R}" fill="url(#g-tarn-ring)" cx="${START.x}" cy="${680 - START.y}"/><g class="dots dots-b" style="fill:var(--sh-lamp)">${dots(10)}</g></g>
  </g>
  <g class="marks"></g>
  <g class="strike" filter="url(#sh-rim)"></g>
  ${C.frame()}
</svg>
<div class="tarn-hud"><div class="tarn-line off"></div><span class="vh" aria-live="polite"></span></div>
<div class="his-slip"></div>`;
  stage.appendChild(root);

  const $ = s => root.querySelector(s);
  const svg = $('.tarn-svg'), his = $('.his'), hers = $('.hers'), marks = $('.marks'), strike = $('.strike');
  const halos = { his: { sky: $('.his .halos-sky'), face: $('.his .halos-face') }, hers: { sky: $('.hers .halos-sky'), face: $('.hers .halos-face') } };
  const ringA = $('.ring-a'), ringB = $('.ring-b'), gaze = $('.gaze');
  const dotsA = [...root.querySelectorAll('.dots-a circle')], dotsB = [...root.querySelectorAll('.dots-b circle')];
  const line = $('.tarn-line'), slipEl = $('.his-slip'), live = $('.vh');
  const cue = $('.cue'), lit = $('.lit'), herEl = $('.her'), bankHer = $('.bank-her'), bankRim = $('.bank-rim'), rimfx = $('.rimfx'), rods = $('.rods');
  let boxes = measure(his);
  // the dotted path stays visible on a small screen: about 2.5 px a dot at least
  { const m = svg.getScreenCTM(), k = (m && Math.hypot(m.a, m.b)) || 1, r = Math.max(3.4, 2.5 / k).toFixed(1);
    [...dotsA, ...dotsB].forEach(c => c.setAttribute('r', r)); }

  // ---- lines: the game's, top left; his, on a slip of lamplight ----
  let lineT = null, slipT = null;
  const say = (html, ms) => {
    K.cancel(lineT); lineT = null;
    line.innerHTML = html; line.classList.remove('off');
    if (!rm) anim(line, [{ opacity: 0 }, { opacity: 1 }], { duration: 400 });
    live.textContent = line.textContent;
    if (ms) lineT = later(() => line.classList.add('off'), ms);
  };
  const quiet = () => { K.cancel(lineT); lineT = null; line.classList.add('off'); };
  const slip = (html, ms = 2600) => {
    K.cancel(slipT);
    slipEl.innerHTML = html; slipEl.classList.add('on');
    live.textContent = slipEl.textContent;
    slipT = later(() => slipEl.classList.remove('on'), ms);
  };

  // ---- light: his halo (lamp, his black house) and hers (amber, her pale house) ----
  const halo = (c, scale, layer, fill) => mk('ellipse', { class: 'halo', cx: c.cx, cy: c.cy,
    rx: (c.rx * 1.2 * scale).toFixed(1), ry: (c.ry * 1.2 * scale).toFixed(1), fill }, layer[c.at]);
  const loops = (c, ms, delay = 0, scale = 1, to = 0) => [
    pen(halo(c, scale, halos.his, 'url(#g-tarn-halo)'), ms, to, delay),
    pen(halo(c, scale, halos.hers, 'url(#g-tarn-halo-w)'), ms, to, delay),
  ];
  const pinBoth = (x, hy) => { K.tick(x, hy, marks); K.tick(x, 680 - hy, marks); };
  const pulse = (el, ms = 1500) => {
    if (rm) { el.style.opacity = 1; later(() => { el.style.opacity = 0; }, 700); return; }
    el.style.opacity = 0;
    anim(el, [{ opacity: 0 }, { opacity: 1, offset: .22 }, { opacity: 1, offset: .45 }, { opacity: 0 }], { duration: ms, easing: 'ease-in-out' });
  };

  // ---- state ----
  let P = null, synthetic = false, ready = false;
  let T = 0, last = null, raf = 0, lastFrame = 0;
  let li = 0, phase = 'wait';                       // wait → play → window → out → end
  const changed = {}, holdUntil = {}, given = new Set(), lights = {};
  let crackLit = false, glimpsed = 0, free = true, twice = false, seen = false;
  let rod = null;                                   // { id, g, shaft, up, pushed }
  let lit0 = false, litAt = null, wlooked = false, deadline = null, beforeOff = false, doneCalled = false;

  // ---- the ghost: his own act one, or the fixture (a builder's real run) when it's missing or thin ----
  const tapsIn = ev => (Array.isArray(ev) ? ev.filter(e => kindOf(e) === 'tap').length : 0);
  const ghost = api.ghost && Array.isArray(api.ghost.events) ? api.ghost : null;
  function begin(events, synth) {
    if (!alive || ready) return;
    P = plan(events);
    synthetic = synth; ready = true; phase = 'play';
    T = synthetic ? -2.4 : 0;
    if (synthetic) { say(LINES.other); later(() => { if (phase === 'play') say(LINES.before); }, 2600 / speed); }
    else say(LINES.before);
  }
  if (ghost && tapsIn(ghost.events) >= 5) begin(ghost.events, !!ghost.synthetic);
  else {
    let url = 'ghost.json';
    try { url = new URL('./ghost.json', import.meta.url).href; } catch (e) { /* relative */ }
    fetch(url).then(r => (r.ok ? r.json() : Promise.reject(new Error('ghost ' + r.status))))
      .then(j => begin(Array.isArray(j) ? j : j.events, true))
      .catch(() => begin(ghost ? ghost.events : [], true));
  }

  const thingAt = e => (typeof e.hit === 'string' && BYID[e.hit] ? e.hit : (pick(e.x, e.hy, boxes) || { d: {} }).d.id || null);
  const gazeNow = () => gazeAt(P, T, rm);
  const inRing = c => {
    if (phase !== 'play') return false;
    const g = gazeNow();
    return Math.hypot(c.cx - g.x, c.cy - g.y) <= R;
  };

  // ---- her verb: change a thing before he looks; never while he looks ----
  function tryEdit(c, act) {
    if (!inRing(c)) { act(); return; }
    glimpsed++;
    pulse(bankRim);
    if (free) { free = false; act(); say(LINES.nearly, 2600); }       // the first one goes free
    else slip(LINES.dream);
  }
  function change(id) {
    changed[id] = true; holdUntil[id] = T + HOLD;
    if (id === 'tree') fell(K, hers, rm);
    else setVariant(K, hers, id, BYID[id].water, 300, false);
  }
  function putBack(id) {                           // the house: no rod, no rim
    changed[id] = false;
    setVariant(K, hers, id, BYID[id].house, 450, false);
  }

  // ---- his looks ----
  function look(i) {
    const e = P.looks[i];
    const id = thingAt(e);
    if (rod && P.rod.catchI === i) { catchLands(id, e); return; }
    plainLook(id, e);
  }
  function plainLook(id, e) {
    if (id === 'crack') {
      if (!crackLit) { crackLit = true; lights.crack = loops(BYID.crack.loop, 400); }
      return;
    }
    if (CHANGES.includes(id)) {
      if (given.has(id)) return;                   // already lit
      if (changed[id]) { give(id); return; }
    }
    pinBoth(e.x, e.hy);
  }
  function give(id) {
    given.add(id); changed[id] = false;
    lights[id] = loops(BYID[id].loop, 400);
    live.textContent = givenSay(given.size);
    if (id === 'tree') later(() => fell(K, his, rm), 1500);     // his house: the water was early
  }

  // ---- the cheat: her rod rises into his house; pushed, his thing matches hers ----
  function raiseRod() {
    const r = ROD[P.rod.id];
    const g = mk('g', {}, rods);
    g.innerHTML = rodCut(r.x, r.y0, r.y1);
    const shaft = g.querySelector('.rod-shaft'), dir = Math.sign(r.y1 - r.y0) || 1;
    const len = k => shaft.setAttribute('transform', `translate(${r.x} ${r.y0}) scale(1 ${(dir * Math.max(.001, k)).toFixed(3)})`);
    rod = { id: P.rod.id, g, len, up: true, pushed: false };
    if (rm) len(1);
    else { len(0); anim(g, [{ opacity: 0 }, { opacity: 1 }], { duration: 300 }); K.tween(650, k => len(1 - (1 - k) ** 3)); }
    say(LINES.twice);
  }
  function lowerRod() {
    if (!rod || !rod.up) return;
    rod.up = false;
    const { g, len } = rod;
    if (rm) { g.remove(); return; }
    K.tween(450, k => len(1 - k * k), () => g.remove());
  }
  // the stud is caught within 24 px of its centre on any screen (38 units at least), the shaft within 16 px
  const pxPerUnit = () => { const m = svg.getScreenCTM(); return (m && Math.hypot(m.a, m.b)) || 1; };
  const onRod = (x, y) => {
    if (!rod || !rod.up || rod.pushed) return false;
    const r = ROD[rod.id], k = pxPerUnit();
    return Math.hypot(x - r.x, y - r.y0) <= Math.max(38, 24 / k) ||
      (Math.abs(x - r.x) <= Math.max(18, 16 / k) && y >= Math.min(r.y0, r.y1) && y <= Math.max(r.y0, r.y1));
  };
  function pushRod() {
    rod.pushed = true;
    const id = rod.id, d = BYID[id];
    if (!rm) K.tween(260, k => rod && rod.len(1 + .04 * Math.sin(k * Math.PI)));
    setVariant(K, his, id, d.water, rm ? 200 : 900, true);        // his thing now matches hers…
    if (lights[id]) { lights[id].forEach(el => unpen(el, 1000)); lights[id] = null; }   // …and his find unwinds
    const [x, y] = RIM_AT[id] || RIM_AT.smoke;
    rimfx.innerHTML = herRim(x, y, 1.5, false);
    pulse(rimfx);
    later(lowerRod, 700);
    quiet();
  }
  function catchLands(id, e) {
    const pushed = rod.pushed;
    lowerRod();
    if (!pushed) { plainLook(id, e); return; }
    // he looked twice, and it was her: the double circle, and his house puts it back and flinches
    twice = true;
    const d = BYID[rod.id];
    if (lights[rod.id]) lights[rod.id].forEach(kill);
    lights[rod.id] = [...loops(d.loop, 380), ...loops(d.loop, 300, 320, 1.17)];
    setVariant(K, his, rod.id, d.house, 350, false);
    if (!given.has(rod.id)) {
      given.add(rod.id); changed[rod.id] = false;
      setVariant(K, hers, rod.id, d.water, 300, false);
      live.textContent = givenSay(given.size);
    }
    if (!rm) anim(his, [{ transform: 'translate(0px,0px)' }, { transform: 'translate(4px,0px)' },
      { transform: 'translate(-2px,0px)' }, { transform: 'translate(0px,0px)' }], { duration: 240, easing: 'ease-out' });
  }

  // ---- the window: she lights it; if he looked at it in act one, he comes, and sees her ----
  let cueAnim = null;
  function openWindow() {
    phase = 'window';
    lowerRod();
    if (rm) cue.style.opacity = .3;
    else cueAnim = anim(cue, [{ opacity: .08 }, { opacity: .38 }, { opacity: .08 }], { duration: 2400, iterations: Infinity, easing: 'ease-in-out' });
    if (P.Aw == null) ringDim(true);
  }
  function light() {
    lit0 = true; litAt = T;
    if (cueAnim) cueAnim.cancel();
    cue.style.opacity = 0;
    fade(lit, 1, 700); fade(herEl, 1, 900); fade(bankHer, 0, 700);
  }
  function windowLook() {
    wlooked = true;
    if (lit0 && !seen) {
      seen = true;
      loops(WINDOW.loop, 380, 0, 1, 45);
      later(() => K.cross(WINDOW.loop, strike), 440);
      later(lightOut, 900);
    } else {
      pinBoth(350, 186);
      deadline = T + 4;
    }
  }
  function lightOut() {
    if (phase === 'out' || phase === 'end') return;
    phase = 'out';
    if (cueAnim) cueAnim.cancel();
    cue.style.opacity = 0;
    fade(lit, 0, 700); fade(herEl, 0, 700);
    ringDim(true);
    end();
  }
  function end() {
    phase = 'end';
    later(finish, 1200);
  }
  function finish() {
    if (doneCalled) return;
    doneCalled = true;
    const n = given.size;
    setFlag('tarnBelow', { given: n, glimpsed, twice, seen });
    try {
      api.done && api.done({ won: n >= 3, score: { 'differences given': n }, note: seen ? LINES.seen : LINES.gone });   // N (label)
    } catch (e) { console.error(e); }
  }
  let dim = false;
  function ringDim(on) {
    if (dim === on) return;
    dim = on;
    fade(gaze, on ? .35 : 1, 600);
  }

  // ---- the clock ----
  function step() {
    while (li < P.looks.length && T >= P.A[li]) look(li++);
    if (!beforeOff && P.looks.length > 1 && T >= P.A[1] + 2) { beforeOff = true; if (line.textContent === LINES.before) quiet(); }
    if (P.rod && !rod && T >= P.rod.at && phase === 'play') raiseRod();
    if (rod && rod.up && !rod.pushed && P.rod.catchI < 0 && T >= P.rod.at + 10) lowerRod();
    for (const id of CHANGES) if (changed[id] && !given.has(id) && T >= holdUntil[id]) putBack(id);
    if (phase === 'play' && li >= P.looks.length && T >= P.W0) openWindow();
    if (phase === 'window') {
      if (P.Aw != null && !wlooked && T >= P.Aw) windowLook();
      if (P.Aw == null) {
        if (lit0 && T >= litAt + 5) lightOut();
        else if (!lit0 && T >= P.W0 + 8) { ringDim(true); end(); }
      } else if (wlooked && !seen) {
        if (lit0 && T >= litAt + 5) lightOut();
        else if (!lit0 && T >= deadline) end();
      }
    }
  }
  function draw() {
    const g = gazeNow();
    ringA.setAttribute('cx', g.x.toFixed(1)); ringA.setAttribute('cy', g.y.toFixed(1));
    ringB.setAttribute('cx', g.x.toFixed(1)); ringB.setAttribute('cy', (680 - g.y).toFixed(1));
    const show = phase === 'play' || (phase === 'window' && P.Aw != null && !wlooked);
    for (let k = 0; k < dotsA.length; k++) {
      const p = rm ? gazeAt(P, T + 1.5, true) : gazeAt(P, T + .15 * (k + 1), false);
      let on = show && Math.hypot(p.x - g.x, p.y - g.y) > 6, x = p.x, y = p.y;
      if (rm) { const a = k / dotsA.length * Math.PI * 2; x += Math.cos(a) * R * .9; y += Math.sin(a) * R * .9; }
      const o = on ? (rm ? .6 : .85 - k * .07) : 0;
      dotsA[k].setAttribute('cx', x.toFixed(1)); dotsA[k].setAttribute('cy', y.toFixed(1)); dotsA[k].style.opacity = o;
      dotsB[k].setAttribute('cx', x.toFixed(1)); dotsB[k].setAttribute('cy', (680 - y).toFixed(1)); dotsB[k].style.opacity = o;
    }
  }
  function frame(now) {
    if (!alive) return;
    raf = requestAnimationFrame(frame);
    tickAt(now);
  }
  // Nothing left for her to give (every look still to come falls on nothing of hers, and her rod
  // is spent): he hurries through his own misses, so she isn't left watching a replay.
  function slack() {
    if (phase !== 'play') return false;
    if (P.rod && (!rod || (rod.up && !rod.pushed))) return false;
    for (let j = li; j < P.looks.length; j++) { const id = thingAt(P.looks[j]); if (CHANGES.includes(id) && !given.has(id)) return false; }
    return true;
  }
  function tickAt(now) {
    lastFrame = performance.now();
    if (!ready || phase === 'end' && doneCalled) { last = now; if (ready) draw(); return; }
    const dt = last == null ? 0 : Math.min(.1, Math.max(0, now - last) / 1000);
    last = now;
    T += dt * speed * (slack() ? 2.5 : 1);
    step();
    draw();
  }
  raf = requestAnimationFrame(frame);
  // frames stall in a hidden pane: a slow timer keeps the clock honest (0.1 s at most per tick)
  const guard = setInterval(() => { if (alive && performance.now() - lastFrame > 250) tickAt(performance.now()); }, 100);

  // ---- her presses ----
  function press(x, y) {
    if (!ready || phase === 'out' || phase === 'end') return;
    const hy = y > WL ? 680 - y : y;               // both halves are the same place
    if (phase === 'window') { if (!lit0 && onWindow(x, hy)) light(); return; }
    if (onRod(x, y)) { tryEdit(BYID[rod.id].loop, pushRod); return; }
    if (!boxes || !Object.keys(boxes).length) boxes = measure(his);
    const p = pick(x, hy, boxes, d => CHANGES.includes(d.id));
    if (!p) return;
    const id = p.d.id;
    if (given.has(id) || changed[id]) return;
    tryEdit(BYID[id].loop, () => change(id));
  }
  const onDown = e => {
    if (!alive || !e.isPrimary || (e.pointerType === 'mouse' && e.button !== 0)) return;
    const m = svg.getScreenCTM();
    if (!m) return;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    if (p.x < 0 || p.x > 960 || p.y < 0 || p.y > 640) return;
    e.preventDefault();
    press(p.x, p.y);
  };
  svg.addEventListener('pointerdown', onDown);
  root.__below = () => ({ T: +T.toFixed(2), phase, ready, synthetic, li, given: [...given], changed: { ...changed }, glimpsed, twice, seen, lit: lit0,
    gaze: P && gazeNow(), rod: rod && { id: rod.id, up: rod.up, pushed: rod.pushed },
    plan: P && { looks: P.looks.map((e, i) => ({ A: +P.A[i].toFixed(2), x: e.x, hy: e.hy, kind: e.kind, id: thingAt(e) })), rod: P.rod, W0: P.W0, Aw: P.Aw } });

  return () => {
    alive = false;
    cancelAnimationFrame(raf); clearInterval(guard);
    K.timers.forEach(clearTimeout); K.timers.clear();
    svg.removeEventListener('pointerdown', onDown);
    try { root.getAnimations({ subtree: true }).forEach(a => a.cancel()); } catch (e) { /* older engines */ }
    root.remove();
  };
}
