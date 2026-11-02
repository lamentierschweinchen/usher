// The spine: the letter → the approach and the fork → seven chapters, with the scenes between
// them → the hinge: the Account, her first nick, and the stage turns itself over into act two,
// A Burial of Some Weeks: the act-two map, a reveal before each game below, and her way on.
// ?chapter=<id> starts at that chapter (earlier ones count as played with stub scores);
// ?chapter=ending goes straight to the hinge; &through=<id> ends act one at the next chapter's
// threshold, with no stub scores (milestone 2: ?through=tarn; milestone 1: ?chapter=studio&through=studio).
// ?scene=interlude1|stair|room|hinge mounts one scene.

import { CHAPTERS, LETTER, TITLE, REMARKS, INTERLUDE1, FORK, PS, STAIR, ROOM, HINGE, BELOW, REVEALS, say } from './story.js';
import { interlude1 } from './interlude.js';
import { sheet as accountSheet, enter, find, slip } from './account.js';
import { MapView, SPOTS, ROOM_NODE } from './map.js';
import { sharedDefs } from './drawing.js';
import { Band } from './band.js';
import { Transit } from './transit.js';
import { loadGame, loadGhost, mount } from './mount.js';
import { herPass } from './ending.js';
import { BELOW as BELOW_GAMES } from './registry.js';
import * as C from '../shared/cuts.js';
import { md, svg, sleep, tapOrWait, reducedMotion } from './util.js';
import { frame as laceFrame } from '../shared/cuts.js';

// the shared sh- defs go in first, before anything refers to them
const defsEl = document.getElementById('sh-defs');
defsEl.innerHTML = sharedDefs();
const frame = document.getElementById('frame');
const stage = document.getElementById('stage');
const map = new MapView(document.getElementById('map'), TITLE, defsEl);
const band = new Band(document.getElementById('band'));
const transit = new Transit(stage);
// one lace proscenium over everything on the stage, map and games alike, so it stays when the iris shuts
const proscenium = svg('svg', { class: 'proscenium', 'aria-hidden': 'true' });
stage.append(proscenium);
const turn = document.getElementById('turn');
turn.addEventListener('click', () => { turn.hidden = true; });
const gameLayer = document.getElementById('game');
const gameStage = document.getElementById('game-stage');
const running = document.getElementById('running-chapter');

const S = {
  act: 'sojourn', flags: { glances: 0, looks: 0 }, results: {}, records: {}, rewrites: {}, below: {},
  account: { front: [], back: [] },
  truth: null, tarnLine: '', carried: [], mode: 'map', invite: '',
};

// ---- the save: a refresh resumes at a chapter boundary; "Nevertheless." at the very end forgets.
// localStorage['usher.save.v1'] = {act, chapter, flags, results, records, rewrites, …}. A save
// remembers the URL it was started from, so a test entry (?chapter=…) resumes only itself.
const SAVE = 'usher.save.v1', OLD = 'usher.sojourn.v1';
// `scene`: one of the scenes that follow a chapter (the interlude, the stair, your room), if
// the save falls between chapters
function save(chapter, scene = null) {
  try {
    localStorage.setItem(SAVE, JSON.stringify({
      act: S.act, chapter, scene, flags: S.flags, results: S.results, records: S.records, rewrites: S.rewrites,
      account: S.account, below: S.below, truth: S.truth, tarnLine: S.tarnLine, carried: S.carried, entry: location.search,
    }));
  } catch { /* private mode or full: play on without it */ }
}
function restore() {
  try {
    let v = JSON.parse(localStorage.getItem(SAVE) || 'null');
    const old = JSON.parse(sessionStorage.getItem(OLD) || 'null');
    if (!v && old && Number.isInteger(old.index)) {
      // the act-one save that lived in sessionStorage moves here
      v = { act: 'sojourn', chapter: CHAPTERS[old.index]?.id || 'ending', flags: old.flags, results: old.results, records: {}, rewrites: {},
        truth: old.truth, tarnLine: old.tarnLine, carried: old.carried, entry: '' };
      localStorage.setItem(SAVE, JSON.stringify(v));
    }
    sessionStorage.removeItem(OLD);
    if (!v || !['sojourn', 'burial'].includes(v.act) || (v.entry || '') !== location.search) return null;
    return v;
  } catch { return null; }
}
function forget() { try { localStorage.removeItem(SAVE); sessionStorage.removeItem(OLD); } catch { /* nothing to forget */ } }
const INSIDE = ['gallery', 'bedroom', 'hall', 'stair', 'studio', 'vault'];

// ---- layout: a 3:2 stage; on a narrow portrait phone the map takes a taller crop
const narrow = matchMedia('(max-width: 599px)');
const portrait = matchMedia('(max-width: 599px) and (orientation: portrait)');
function layout() {
  const tall = portrait.matches && S.mode === 'map';
  frame.classList.toggle('tall', tall);
  frame.classList.toggle('playing', S.mode === 'game');
  map.setTall(tall);
  drawFrame();
  const dock = document.getElementById('band-dock');
  if (narrow.matches) { if (band.el.parentNode !== dock) dock.append(band.el); }
  else if (band.el.parentNode !== stage) stage.insertBefore(band.el, transit.iris);
  frame.classList.toggle('docked', narrow.matches);
}
// the proscenium is cut in stage units: 960 across, or the portrait crop's 576
let framed = '';
function drawFrame() {
  const w = frame.classList.contains('tall') ? 576 : 960;
  const h = Math.round(w * (stage.clientHeight / stage.clientWidth || 2 / 3));
  if (framed === `${w}x${h}`) return;
  framed = `${w}x${h}`;
  proscenium.setAttribute('viewBox', `0 0 ${w} ${h}`);
  proscenium.innerHTML = laceFrame({ w, h });
}
narrow.addEventListener('change', layout);
portrait.addEventListener('change', () => { layout(); if (!portrait.matches) turn.hidden = true; });
new ResizeObserver(drawFrame).observe(stage);

// ---- input: taps on the map advance the band, or go to the room
let handler = null;
map.onPick = room => {
  if (band.waiting) return band.advance();
  if (map.walking) return map.hurry();
  handler?.(room);
};
map.el.addEventListener('click', () => { if (band.waiting) band.advance(); else if (map.walking) map.hurry(); });

const node = room => ROOM_NODE[room];
function where(room) { return map.screenPoint(map.roomPoint(room), stage); }

// wait until the player picks one of `goals`; walk them there (the tarn is looked at, not walked to)
function explore(goals, ch) {
  return new Promise(resolve => {
    let busy = false;
    // one target: the strip names it, and a click on the strip goes there
    const goal = goals.length === 1 ? goals[0] : null;
    const words = goal && (ch?.below || (map.guestRoom() === goal && ch?.prompt) || REMARKS.prompt[goal]);
    // after an outro the strip also invites a look at the tarn, until the player takes one
    const prompt = () => {
      const line = [S.invite, words].filter(Boolean).join(' ');
      if (line) band.show(['', line], { more: !!words }); else band.clear();
    };
    const done = room => { handler = null; band.onIdle = null; band.clear(); resolve(room); };
    band.onIdle = words ? () => handler?.(goal) : null;
    prompt();
    handler = async room => {
      if (busy) return;
      busy = true;
      try {
        // act two: only the open room goes anywhere; the dim ones are sealed
        if (map.act === 'burial' && !goals.includes(room)) { await band.say(REMARKS.sealedBelow); prompt(); return; }
        if (room === 'tarn' && !goals.includes('tarn')) { await glance(ch); prompt(); return; }
        if (room === 'tarn') return done(room);
        if (!map.open && INSIDE.includes(room)) return;
        if (map.open && room === 'door') room = 'hall';
        if (map.open && (room === 'causeway' || room === 'bank') && !goals.includes('causeway')) {
          await band.say(REMARKS.leave); prompt(); return;
        }
        await map.walkTo(map.walker, node(room), ch?.finale && room === 'causeway' ? 200 : undefined);
        if (goals.includes(room)) return done(room);
        const burial = CHAPTERS.find(c => c.id === 'burial');
        if (room === 'vault' && burial.sealed) { await band.say(REMARKS.sealed(burial)); prompt(); }
      } finally { busy = false; }
    };
  });
}

// a look at the tarn: what the water shows now. Reflections are not sworn statements,
// so the line comes in the tarn's own returned light, not in red.
async function glance() {
  S.flags.glances++;
  S.invite = '';
  if (await lookDown()) return;
  if (!S.tarnLine) return;
  await water(S.tarnLine);
  band.clear();
}

// a line in the water's script: upside down, righted in 400 ms by a tap or after two seconds;
// then it waits to be read
async function water(line) {
  band.show(['', line], { glass: true, mirror: true, more: false });
  await tapOrSoon(2000);
  band.el.querySelector('.sh-mirror')?.classList.add('righted');
  // the tap that righted it shouldn't also read it away
  await sleep(400);
  band.el.insertAdjacentHTML('beforeend', '<span class="band-more" aria-hidden="true">›</span>');
  await new Promise(r => { band.resolve = r; });
}

// every look down counts (the hinge writes them up). The first, wherever it falls, reads the
// letter's P.S. in the water: upside down, righted by a tap or two seconds. Mirror is taught.
async function lookDown() {
  S.flags.looks = (S.flags.looks || 0) + 1;
  if (S.flags.firstLook) return false;
  S.flags.firstLook = true;
  await water(PS.line);
  await band.say(['', PS.law], { glass: true });
  band.clear();
  return true;
}
// resolves on any tap or key anywhere, or after ms
function tapOrSoon(ms) {
  return new Promise(resolve => {
    const t = setTimeout(end, ms);
    function end() {
      clearTimeout(t);
      document.removeEventListener('pointerdown', end, true);
      document.removeEventListener('keydown', end, true);
      resolve();
    }
    setTimeout(() => {
      document.addEventListener('pointerdown', end, true);
      document.addEventListener('keydown', end, true);
    }, 150);
  });
}

// the trist ends with her fallen upon her brother; the bedroom shows it
function fallen() {
  map.put('roderick', 'fallenUnder', 1, 'recline');
  map.put('madeline', 'fallen', 1, 'lie');
}

function heading(ch) { running.innerHTML = ch ? `${ch.num} · ${md(ch.title)}` : ''; }

// a cast entry is a spot, or [spot, facing, pose]
function placeCast(cast = {}) {
  if (typeof cast === 'function') cast = cast(S.flags);
  for (const [id, spot] of Object.entries(cast)) {
    const [s, dir, pose] = Array.isArray(spot) ? spot : [spot, 1];
    map.put(id, s, dir, pose);
  }
}

async function encounter(e) {
  if (e.skipIf?.(S.flags)) return;
  for (const [id, spot] of Object.entries(e.enter || {})) {
    const [s, dir, pose] = Array.isArray(spot) ? spot : [spot, 1];
    map.put(id, s, dir, pose);
  }
  for (const [id, dir] of Object.entries(e.turn || {})) map.face(id, dir);
  const moving = [];
  for (const [id, to] of Object.entries(e.walk || {})) moving.push(map.travel(id, [SPOTS[to]]));
  for (const [id, [from, to]] of Object.entries(e.glide || {})) {
    moving.push(map.glide(id, from, to).then(() => map.hide(id)));
  }
  if (moving.length && e.walk) await Promise.all(moving);
  await band.lines(e.lines);
  for (const id of e.exit || []) map.hide(id);
}

// ---- a chapter's game: iris in, title card, the game, iris out, the outro card
// what a game gets for its act: act one records its moves; act two gets that record as a ghost
// and may rewrite her line on the Account
async function actFor(ch, game) {
  if (S.act === 'burial') {
    return {
      mode: 'burial',
      ghost: await loadGhost(ch, S.records[ch.id] || [], game.ghost),
      rewrite: (label, text) => { (S.rewrites[ch.id] ||= {})[label] = text; },
    };
  }
  const list = S.records[ch.id] = [];
  const t0 = performance.now();
  return {
    mode: 'sojourn',
    record(type, data) {
      if (list.length >= 4000) return;
      // {type, t, ...data} as the contract has it (a game's own `type` field wins), and `event`
      // always keeps the name it was recorded under
      list.push({ type, t: +((performance.now() - t0) / 1000).toFixed(2), ...data, event: type });
    },
  };
}

async function play(ch, index) {
  const at = where(ch.target);
  map.point(null);
  band.clear();
  await transit.close(at);
  const game = await loadGame(ch);
  const act = await actFor(ch, game);
  if (S.act === 'burial') {
    await transit.title({ kicker: `${ch.ord}, below`, title: ch.title }, 1800);
    await reveal(ch);
  } else await transit.title({ kicker: ch.ord, title: ch.title, line: ch.sub || '' }, ch.sub ? 2600 : 1800);
  // the tarn moves on while the player is away (act one)
  if (S.act === 'sojourn') { S.truth = ch.truth; S.tarnLine = ch.tarn; S.invite = ''; map.truth(ch.truth); map.fissure(index + 1); }
  if (index === 0) map.title(false);
  S.mode = 'game'; layout(); map.pause();
  // on an upright phone, one small card under the stage: never in the way, gone on a tap or a turn
  turn.hidden = !portrait.matches;
  gameLayer.hidden = false;
  const { result, teardown } = mount(game, ch, gameStage, S.flags, act);
  await transit.open();
  const r = await result;
  await hold(ch.hold);
  await transit.close();
  teardown();
  turn.hidden = true;
  gameLayer.hidden = true;
  S.mode = 'map'; layout(); map.resume();
  if (S.act === 'burial') { S.below[ch.id] = r; await transit.open(where(ch.target)); return r; }
  S.results[ch.id] = r;
  await after(ch, r);
  return r;
}

// what changes on the map at a chapter's end (done under ink)
// let a game's last frame stay a while after done; past the first second a click goes on
async function hold(ms) {
  if (!ms) return;
  let armed = false;   // the game's own last click shouldn't skip the hold, and later clicks stay with the spine
  const stop = e => { if (armed) { e.stopPropagation(); e.preventDefault(); } };
  gameLayer.addEventListener('click', stop, true);
  await sleep(1000);
  armed = true;
  await Promise.race([sleep(ms - 1000), new Promise(r => gameLayer.addEventListener('click', r, { once: true, capture: true }))]);
  gameLayer.removeEventListener('click', stop, true);
}

// after a game: under ink, the game's own epitaph if it wrote one; back on the map, the chapter's outro
async function after(ch, r) {
  // the outro answers to what the player did: a matching line, or the confident one
  // with the truth of it beneath, in red, as the guest's own correction
  // act one writes no red: a branch's `rather` waits for act two
  const branch = ch.branch?.(S.flags, r) || {};
  const outro = branch.line || ch.outro;
  const note = r.note && r.note.trim() !== outro ? r.note : '';
  if (ch.id === 'door') { map.flyFacade(); map.put('guest', 'hall', 1); }
  if (ch.id === 'studio') map.hideAll(['guest', 'valet']);
  if (ch.id === 'burial') map.coffin(true);
  if (ch.id === 'trist') fallen();
  if (ch.finale) {
    map.hideAll(['guest']); map.put('guest', 'brink', -1);
    if (note) await transit.title({ line: note });
    await transit.open(where('causeway'));
    band.show(['', outro], { more: false });
    await map.collapse();
    map.face('guest', 1);
    await sleep(600);
    band.clear();
    return;
  }
  if (note) await transit.title({ line: note });
  await transit.open(where(ch.target));
  // what the guest writes of it: one line on a slip, in ink, or paler, m.
  if (ch.account) {
    const a = ch.account;
    const value = typeof a.value === 'function' ? a.value(S.flags, r) : a.value;
    slip(stage, enter(S.account, { id: a.id, label: a.label, value, hand: a.hand?.(S.flags) || 'guest' }));
  }
  await band.say(['', outro]);
  band.clear();
  // and the water stirs, in case anyone is looking; the strip asks him not to
  S.invite = REMARKS.invite;
  map.stir();
}

// a sealed chapter: walk to its door, read that it is to come; the tarn tells it anyway
async function sealed(ch, index) {
  if (map.guestRoom() !== ch.room) {
    map.point(ch.room);
    await explore([ch.room], ch);
  }
  map.point(null);
  await transit.close(where(ch.room));
  await transit.title({ kicker: ch.ord, title: ch.title, line: 'A chapter to come.', sealed: true }, 2600);
  S.truth = ch.truth; S.tarnLine = ch.tarn; S.invite = ''; map.truth(ch.truth); map.fissure(index + 1);
  if (ch.id === 'burial') map.coffin(true);
  map.light(ch.id);
  S.carried.push(...ch.encounters.filter(e => e.carry));
  await transit.open(where(ch.room));
}

async function chapter(ch, index, { arrived = false } = {}) {
  heading(ch);
  map.title(false);
  map.light(ch.id);
  placeCast(ch.cast);
  if (!arrived && map.guestRoom() !== ch.room) {
    map.point(ch.room);
    await explore([ch.room], ch);
    map.point(null);
  }
  for (const e of S.carried.splice(0)) await encounter(e);
  const intro = typeof ch.intro === 'function' ? ch.intro(S.flags) : ch.intro;
  if (intro) await band.say(['', intro]);
  for (const e of ch.encounters) await encounter(e);
  band.clear();
  if (!ch.go) {
    map.point(ch.target);
    await explore([ch.target], ch);
  }
  if (ch.target === 'tarn' && S.act === 'sojourn') await lookDown();
  await play(ch, index);
}

// ---- the opening: the letter on the map at dusk, then the approach
// Roderick's hand; the P.S. in the water's script, unreadable here; one button, no room for hesitation
async function letter() {
  const el = document.getElementById('letter');
  el.innerHTML = `<div class="sheet letter-sheet">
    ${LETTER.body.map(p => `<p>${md(p)}</p>`).join('')}
    <p class="sign">${md(LETTER.sign)}</p>
    <p class="ps">${md(LETTER.psMark)} <span class="sh-mirror still">${md(LETTER.ps)}</span></p>
    <svg class="blot" viewBox="0 0 40 30" aria-hidden="true"><path d="M20 3c6 0 7 5 11 6s7 5 4 9-2 9-8 9-8-3-12-2-10-1-11-6 3-6 2-10 8-6 14-6Z"/><circle cx="36" cy="5" r="1.6"/></svg>
    <button class="letter-go" type="button">${md(LETTER.go)}</button>
  </div>`;
  el.hidden = false;
  await sleep(30);
  el.classList.add('on');
  const go = el.querySelector('.letter-go');
  go.focus({ preventScroll: true });
  await new Promise(r => go.addEventListener('click', r, { once: true }));
  el.classList.add('off');
  await sleep(reducedMotion ? 100 : 900);
  el.hidden = true;
}

// the approach, and the fork where the causeway rises over the water: Rein in. (and look down) ·
// Nevertheless. · or neither, and the sentence writes itself, paler, m.
async function approach() {
  map.put('guest', 'off', 1);
  map.put('horse', [-40, 336], -1);
  map.face('horse', 1);
  band.show(['', FORK.approach], { more: false });
  await sleep(reducedMotion ? 0 : 700);
  const horse = map.travel('horse', [[56, 334], [116, 347]]);
  await sleep(reducedMotion ? 0 : 500);
  await map.walkTo('guest', 'cwStart');
  await horse;
  const pick = await band.choose([FORK.rein, FORK.on], { idle: FORK.idle, strong: 1 });
  S.flags.causeway = pick === 0 ? 'reined' : pick === 1 ? 'nevertheless' : 'idle';
  // rein in: the horse halts over the water, and he looks down
  if (pick === 0) await lookDown();
  const said = pick === 0 ? null : band.say(['', FORK.banner], { hand: pick === null ? 'm' : '' });
  const on = map.travel('horse', [SPOTS.horse]).then(() => map.face('horse', -1));
  await map.walkTo('guest', 'brink');
  await on;
  await said;
  band.clear();
}

async function ending() {
  await hinge();
  await below();
}

// ---- the hinge interrupts: the Account as written, two lines more, her first nick (she keeps
// nothing), and the stage turns by itself. On the turned side her button: Nevertheless.
async function hinge() {
  frame.classList.add('ending');
  heading(null);
  map.point(null);
  band.clear();
  S.invite = '';
  const write = [
    { id: 'looks', label: HINGE.looks, value: `${say(S.flags.looks || 0)}.`, hand: 'guest' },
    { id: 'society', label: HINGE.society, value: HINGE.considerable, hand: 'guest' },
  ];
  await accountSheet(stage, S.account, { write, echo: [{ id: 'society', cut: 1, whole: true }] });
  map.title(false);
  map.truth('whole');
  map.clearSky();
  map.hideLabel();
  map.flip(true);
  await sleep(reducedMotion ? 50 : 1700);
  const on = document.createElement('button');
  on.type = 'button';
  on.className = 'again hinge-on';
  on.innerHTML = md(HINGE.on);
  stage.append(on);
  on.focus({ preventScroll: true });
  await new Promise(r => on.addEventListener('click', r, { once: true }));
  on.remove();
  await transit.title({ html: HINGE.title, line: HINGE.when, during: enterBelow }, 3600);
}
function enterBelow() {
  S.act = 'burial';
  S.invite = '';
  frame.classList.remove('ending');
  document.querySelector('.running span').textContent = 'A Burial of Some Weeks';
  map.setAct('burial');
  layout();
}

// ---- act two: the act-one map turned over. Every chapter played above that has a game below
// is lit; the rest are sealed (Not yet.). Her first line echoes the Account's head.
async function below() {
  for (;;) {
    const open = CHAPTERS.filter(c => BELOW_GAMES.includes(c.id) && S.results[c.id]);
    if (!open.length) open.push(CHAPTERS.find(c => c.id === 'studio'));
    save(open[0].id);
    heading(null);
    map.put('her', [372, 361], 1);
    if (!S.flags.herFirst) {
      S.flags.herFirst = true;
      save(open[0].id);
      // her first line, in the band: the Account's head, its head struck. The Account keeps it.
      S.account.headCut = BELOW.first.cut.split(' ').length;
      await band.say(['', ''], { echo: BELOW.first });
      band.clear();
    }
    // the first not yet played below, else the first
    const next = open.find(c => !S.below[c.id]) || open[0];
    map.point(next.target);
    const room = await explore(open.map(c => c.target), { ...next, below: BELOW.look });
    map.point(null);
    const ch = open.find(c => c.target === room) || next;
    heading({ num: ch.num, title: ch.title });
    await play(ch, CHAPTERS.indexOf(ch));
    // her pass on the Account, only where she rewrote a line
    const by = S.rewrites[ch.id];
    if (by && Object.keys(by).length) await herPass(stage, S.account, { [ch.id]: by });
    save(ch.id);
    // her way on: no sheet, because nobody writes
    const way = await band.choose([HINGE.on, ch.id === 'tarn' ? BELOW.again : REMARKS.herPass.again], { strong: 0 });
    if (way === 0) { forget(); location.href = location.pathname + letterSearch(); return; }
  }
}
// Nevertheless. goes back to the letter: the same entry, less any jump into the middle
function letterSearch() {
  const p = new URLSearchParams(location.search);
  p.delete('chapter'); p.delete('scene');
  const q = p.toString();
  return q ? `?${q}` : '';
}

// the reveal, after card I below: the Account's line for this chapter, nicked by her
async function reveal(ch) {
  const rv = REVEALS[ch.id];
  const line = rv && find(S.account, rv.id);
  if (!line || line.cut != null) return;
  await accountSheet(stage, S.account, { echo: [rv] });
}

// ---- set the house as it would be on reaching chapter `index` (for ?chapter=)
// set the house as it would be on reaching chapter `index`: from a save, or with stub scores (?chapter=)
function jumpTo(index, saved, { stubs = true } = {}) {
  for (let i = 0; i < index; i++) {
    const c = CHAPTERS[i];
    if (!c.sealed && stubs) S.results[c.id] = { won: true, score: { ...c.stub.score }, note: '' };
    S.carried = c.sealed ? [...S.carried, ...c.encounters.filter(e => e.carry)] : [];
    S.truth = c.truth;
  }
  S.tarnLine = CHAPTERS[index - 1]?.tarn || '';
  if (saved) Object.assign(S, {
    flags: { glances: 0, ...saved.flags }, results: saved.results || {}, records: saved.records || {}, rewrites: saved.rewrites || {},
    below: saved.below || {}, truth: saved.truth ?? S.truth, tarnLine: saved.tarnLine ?? S.tarnLine, carried: saved.carried || [],
    account: { front: [], back: [], ...saved.account },
  });
  map.truth(S.truth); map.fissure(index); map.light(CHAPTERS[index]?.id || 'flight'); map.title(false);
  if (index > 1) map.setFacade(true);
  if (index > 3) map.coffin(true);
  if (index > 5) fallen();
  const ch = CHAPTERS[index];
  if (ch) map.put('guest', node(ch.room) || 'brink', 1);
}

// ---- the scenes that follow a chapter (story.js `after`) and stand-alone ones (?scene=); each
// registers itself here and runs on the map or in the game layer. scene.alone() sets the house
// as it would be when the scene comes, runs it, and shows the Account (a test entry).
const SCENES = {};

// a scene in the game layer: iris in on a room, no title card, the running head named for the room
async function inLayer(room, head, run) {
  const at = where(room);
  map.point(null);
  band.clear();
  await transit.close(at);
  running.textContent = head;
  S.mode = 'game'; layout(); map.pause();
  gameLayer.hidden = false;
  const done = run();
  await transit.open();
  await done;
  await transit.close();
  gameStage.replaceChildren();
  gameLayer.hidden = true;
  S.mode = 'map'; layout(); map.resume();
  await transit.open(at);
}

// I → II: the hall, A Mere Different Arrangement (engine/interlude.js). The door gives, and the
// strip keeps the outro's invite (a look now finds one of the eye-like windows lit) until he goes in.
SCENES.interlude1 = async () => {
  if (map.guestRoom() !== 'hall') {
    map.flyFacade();
    map.point('hall');
    await explore(['hall']);
    map.point(null);
  }
  await inLayer('hall', INTERLUDE1.head, () => interlude1({
    host: gameStage, slipHost: stage, acc: S.account, flags: S.flags,
    record: r => { S.records.interlude1 = r; },
  }));
};
SCENES.interlude1.alone = async () => {
  afterTarn();
  await SCENES.interlude1();
  await accountSheet(stage, S.account, { head: true });
};

// I → II, on the map: the stair, where the map leans in [u07]
SCENES.stair = async () => {
  running.textContent = STAIR.head;
  map.point(null);
  band.clear();
  map.setFacade(true);
  map.hideAll(['guest']);
  map.put('guest', 'hall', 1);
  // the valet holds his lamp low at the stair's foot; the physician on the stair, and on the stair's
  // wall his shadow at twice his height
  map.put('valet', [452, 338], 1);
  C.hinge(map.actors.valet.fig, '.sh-arm', -38);
  map.put('physician', [470, 318], -1);
  map.wallShadow('physician', [462, 330], 2);
  await map.travel('guest', [[418, 338]]);
  await map.zoom('stair');
  await band.lines([STAIR.physician, STAIR.passed]);
  // the strip: Look down. In the water the physician is small and lit from above, and the guest a third taller
  const looked = await offerLook(STAIR.look, STAIR.wait);
  S.flags.stairLooked = looked;
  if (looked) { S.flags.looks = (S.flags.looks || 0) + 1; map.flatter({ physician: .62, guest: 1.33 }); }
  await band.say(STAIR.you);
  band.clear();
  map.flatter(null);
  map.wallShadow(null);
  // and he passes on
  await map.travel('physician', [[511, 284]]);
  map.hide('physician');
  await map.zoom(null);
};
SCENES.stair.alone = async () => { afterTarn(); await SCENES.stair(); await accountSheet(stage, S.account); };

// the strip offers a look down for `ms`: a tap on it or on the water takes it
function offerLook(line, ms) {
  return new Promise(resolve => {
    const end = v => { clearTimeout(t); handler = null; band.onIdle = null; band.clear(); resolve(v); };
    const t = setTimeout(() => end(false), ms);
    band.show(['', line]);
    band.onIdle = () => end(true);
    handler = room => { if (room === 'tarn') end(true); };
  });
}

// your room: the valet sets the lamp down, silent; the servant, with your bag [u13]
SCENES.room = async () => {
  running.textContent = ROOM.head;
  map.point(null);
  band.clear();
  map.setFacade(true);
  map.hideAll(['guest']);
  map.put('valet', [404, 278], -1);
  map.put('servant', [326, 278], 1);
  await map.walkTo('guest', 'bedroom');
  C.hinge(map.actors.valet.fig, '.sh-arm', -70);
  await band.lines([ROOM.servant, ROOM.you]);
  band.clear();
  map.hideAll(['guest']);
};
SCENES.room.alone = async () => { afterTarn(); await SCENES.room(); await accountSheet(stage, S.account); };

// the hinge alone: as after your room, with the tarn's line written (m.) and two looks down
SCENES.hinge = hinge;
SCENES.hinge.alone = async () => {
  afterTarn();
  map.put('guest', 'bedroom', 1);
  const tarn = CHAPTERS[0];
  S.results.tarn = { won: true, score: { ...tarn.stub.score }, note: '' };
  S.flags.looks = 2;
  enter(S.account, { id: tarn.account.id, label: tarn.account.label, value: tarn.account.value, hand: 'm' });
  await ending();
};

// the house as the tarn leaves it: you've entered the Gothic archway of the hall [u07]
function afterTarn() {
  map.title(false); map.light('tarn'); map.fissure(1);
  map.setFacade(true);
  map.put('guest', 'hall', 1);
}

// test entries (?scene=, ?debug) can read the state
if (/[?&](scene|debug)\b/.test(location.search)) window.usher = S;

async function main() {
  layout();
  const params = new URLSearchParams(location.search);
  // ?sealed=none opens any chapter marked sealed in story.js
  if (params.get('sealed') === 'none') for (const c of CHAPTERS) c.sealed = false;
  const want = params.get('chapter');
  // jumping to a sealed chapter opens it, so its game can be tried inside the spine
  const target = CHAPTERS.find(c => c.id === want);
  if (target) target.sealed = false;
  // ?scene=<id>: that one scene, set as it would be when it comes (a test entry)
  const only = params.get('scene');
  if (only && SCENES[only]) return SCENES[only].alone();
  // ?through=<id>: act one ends at the next chapter's threshold, after the scenes that follow <id>
  const through = params.get('through');
  const last = through ? Math.max(0, CHAPTERS.findIndex(c => c.id === through)) : CHAPTERS.length - 1;
  let start = 0, resumeScene = null;
  // saves resume a plain run or a through-entry; a bare ?chapter= jump is a test and starts clean
  const saved = (!want || through) ? restore() : null;
  if (saved?.act === 'burial') {
    // resume below: the act-two map, as it was left
    jumpTo(CHAPTERS.length, saved, { stubs: false });
    enterBelow();
    return below();
  }
  if (saved) {
    start = saved.chapter === 'ending' ? last + 1 : Math.max(0, CHAPTERS.findIndex(c => c.id === saved.chapter));
    resumeScene = saved.scene || null;
    jumpTo(start, saved, { stubs: false });
    if (resumeScene) map.fissure(start + 1);
  } else if (want) {
    start = want === 'ending' ? CHAPTERS.length : Math.max(0, CHAPTERS.findIndex(c => c.id === want));
    jumpTo(start, null, { stubs: !through });
  } else {
    await opening();
  }
  for (let i = start; i <= last; i++) {
    const ch = CHAPTERS[i];
    const between = resumeScene && i === start;   // resumed after this chapter's game
    if (!between) {
      save(ch.id);
      if (ch.sealed) await sealed(ch, i);
      else await chapter(ch, i, { arrived: i === start });
    }
    const scenes = (ch.after || []).filter(id => SCENES[id]);
    for (const id of scenes.slice(between ? Math.max(0, scenes.indexOf(resumeScene)) : 0)) {
      save(ch.id, id);
      await SCENES[id]();
    }
    // until II is recut for milestone 3, the house shuts again for its door
    if (scenes.length && i < last && CHAPTERS[i + 1].id === 'door') { map.setFacade(false); map.put('guest', 'brink', 1); running.textContent = ''; }
  }
  save('ending');
  await ending();
}

// the opening: the letter, then the approach (milestone 2 grows this into the fork and the first look)
async function opening() {
  map.truth(null);
  map.fissure(0);
  map.light('tarn');
  await letter();
  await approach();
}

main().catch(err => { console.error(err); });
