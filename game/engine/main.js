// The spine: letter → approach → seven chapters → the account → the last card →
// Nevertheless. turns the stage over into act two, A Burial of Some Weeks.
// ?chapter=<id> starts at that chapter (earlier ones count as played with stub
// scores); ?chapter=ending goes straight to the end; &through=<id> ends act one
// after that chapter, with no stub scores (the milestone: ?chapter=studio&through=studio).

import { CHAPTERS, LETTER, TITLE, REMARKS } from './story.js';
import { MapView, SPOTS, ROOM_NODE } from './map.js';
import { sharedDefs } from './drawing.js';
import { Band } from './band.js';
import { Transit } from './transit.js';
import { loadGame, loadGhost, mount } from './mount.js';
import { account, herPass, lastCard } from './ending.js';
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
  act: 'sojourn', flags: { glances: 0 }, results: {}, records: {}, rewrites: {}, below: {},
  truth: null, tarnLine: '', carried: [], mode: 'map', invite: '',
};

// ---- the save: a refresh resumes at a chapter boundary; "Nevertheless." at the very end forgets.
// localStorage['usher.save.v1'] = {act, chapter, flags, results, records, rewrites, …}. A save
// remembers the URL it was started from, so a test entry (?chapter=…) resumes only itself.
const SAVE = 'usher.save.v1', OLD = 'usher.sojourn.v1';
function save(chapter) {
  try {
    localStorage.setItem(SAVE, JSON.stringify({
      act: S.act, chapter, flags: S.flags, results: S.results, records: S.records, rewrites: S.rewrites,
      below: S.below, truth: S.truth, tarnLine: S.tarnLine, carried: S.carried, entry: location.search,
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
    if (v.act === 'sojourn' && v.chapter === CHAPTERS[0].id) return null;   // nothing to resume yet
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
  if (!S.tarnLine) return;
  await band.say(['', S.tarnLine], { glass: true });
  band.clear();
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
async function actFor(ch) {
  if (S.act === 'burial') {
    return {
      mode: 'burial',
      ghost: await loadGhost(ch, S.records[ch.id] || []),
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
  const act = await actFor(ch);
  if (S.act === 'burial') await transit.title({ kicker: `${ch.ord}, below`, title: ch.title }, 1800);
  else await transit.title({ kicker: ch.ord, title: ch.title }, 1800);
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
    band.show(['', outro], { more: false, rather: branch.rather });
    await map.collapse();
    map.face('guest', 1);
    await sleep(600);
    band.clear();
    return;
  }
  if (note) await transit.title({ line: note });
  await transit.open(where(ch.target));
  await band.say(['', outro], { rather: branch.rather });
  band.clear();
  // and the water stirs, in case anyone is looking
  S.invite = REMARKS.invite[CHAPTERS.indexOf(ch) % REMARKS.invite.length];
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
  await play(ch, index);
}

// ---- the opening: the letter on the map at dusk, then the approach
async function letter() {
  const el = document.getElementById('letter');
  el.innerHTML = `<div class="sheet letter-sheet">
    ${LETTER.body.map(p => `<p>${md(p)}</p>`).join('')}
    <p class="sign">${md(LETTER.sign)}</p>
    <p class="ps">${md(LETTER.ps)}</p>
    <svg class="blot" viewBox="0 0 40 30" aria-hidden="true"><path d="M20 3c6 0 7 5 11 6s7 5 4 9-2 9-8 9-8-3-12-2-10-1-11-6 3-6 2-10 8-6 14-6Z"/><circle cx="36" cy="5" r="1.6"/></svg>
  </div>`;
  el.hidden = false;
  await sleep(30);
  el.classList.add('on');
  await tapOrWait(el);
  el.classList.add('off');
  await sleep(reducedMotion ? 100 : 900);
  el.hidden = true;
}

async function approach() {
  map.put('guest', 'off', 1);
  map.put('horse', [-40, 336], -1);
  map.face('horse', 1);
  await sleep(reducedMotion ? 0 : 700);
  const horse = map.travel('horse', [[56, 334], [150, 350], SPOTS.horse]).then(() => map.face('horse', -1));
  await sleep(reducedMotion ? 0 : 500);
  await map.walkTo('guest', 'brink');
  await horse;
}

async function ending() {
  frame.classList.add('ending');
  heading(null);
  map.point(null);
  map.moonSet();
  await account(stage, S.results, S.flags);
  map.title(false);
  // the tarn's house, upright and whole, every window lit: as at the flight's end, and as act two opens
  map.truth('whole');
  const card = await lastCard(stage, map);
  // Nevertheless.: the ribbons fade, the stage stays turned, and the house is read the other way
  card.classList.remove('on');
  await sleep(reducedMotion ? 100 : 1200);
  card.remove();
  await turnOver();
  await below();
}

// ---- act two: A Burial of Some Weeks. The milestone opens the studio only.
async function turnOver() {
  S.act = 'burial';
  await transit.title({ html: 'A <span class="red">Burial</span> of Some Weeks', during: enterBelow }, 2600);
}
function enterBelow() {
  S.act = 'burial';
  S.invite = '';
  frame.classList.remove('ending');
  document.querySelector('.running span').textContent = 'A Burial of Some Weeks';
  map.setAct('burial');
  layout();
}
async function below() {
  const studio = CHAPTERS.find(c => c.id === 'studio');
  const open = { ...studio, below: REMARKS.belowPrompt };
  for (;;) {
    save('studio');
    heading({ num: 'III', title: 'Under the studio' });
    map.put('her', [372, 361], 1);
    map.point('studio');
    await explore(['studio'], open);
    map.point(null);
    await play(studio, CHAPTERS.indexOf(studio));
    save('studio');
    if (await herPass(stage, S.results, S.flags, S.rewrites) === 'again') continue;
    forget();
    location.href = location.pathname;
    return;
  }
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
  });
  map.truth(S.truth); map.fissure(index); map.light(CHAPTERS[index]?.id || 'flight'); map.title(false);
  if (index > 1) map.setFacade(true);
  if (index > 3) map.coffin(true);
  if (index > 5) fallen();
  const ch = CHAPTERS[index];
  if (ch) map.put('guest', node(ch.room) || 'brink', 1);
}

async function main() {
  layout();
  const params = new URLSearchParams(location.search);
  // ?sealed=none opens any chapter marked sealed in story.js
  if (params.get('sealed') === 'none') for (const c of CHAPTERS) c.sealed = false;
  const want = params.get('chapter');
  // jumping to a sealed chapter opens it, so its game can be tried inside the spine
  const target = CHAPTERS.find(c => c.id === want);
  if (target) target.sealed = false;
  const through = params.get('through');
  const last = through ? Math.max(0, CHAPTERS.findIndex(c => c.id === through)) : CHAPTERS.length - 1;
  let start = 0;
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
    jumpTo(start, saved, { stubs: false });
  } else if (want) {
    start = want === 'ending' ? CHAPTERS.length : Math.max(0, CHAPTERS.findIndex(c => c.id === want));
    jumpTo(start, null, { stubs: !through });
  } else {
    map.truth(null);
    map.fissure(0);
    map.light('tarn');
    await letter();
    await approach();
  }
  for (let i = start; i <= last; i++) {
    const ch = CHAPTERS[i];
    save(ch.id);
    if (ch.sealed) await sealed(ch, i);
    else await chapter(ch, i, { arrived: i === start });
  }
  save('ending');
  await ending();
}

main().catch(err => { console.error(err); });
