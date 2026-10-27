// Mounting a chapter's mini-game through the plug-in contract
// (work/design/CONTRACT.md). A game is an ES module at games/<id>/game.js whose
// default export has mount(stage, api) → cleanup.

import * as C from '../shared/cuts.js';
import { LIVE, GHOSTS } from './registry.js';
import { esc, reducedMotion } from './util.js';

const param = new URLSearchParams(location.search).get('games');
const wanted = id =>
  param === 'all' ? true : param === 'none' ? false : param ? param.split(',').includes(id) : LIVE.includes(id);

export async function loadGame(ch) {
  if (wanted(ch.id)) {
    try {
      const mod = await import(`../games/${ch.id}/game.js`);
      if (mod?.default?.mount) return mod.default;
      console.warn(`games/${ch.id}/game.js has no default export with mount(); using the stub.`);
    } catch (err) {
      console.warn(`games/${ch.id}/game.js did not load; using the stub.`, err);
    }
  }
  return stub(ch);
}

function normalise(r = {}) {
  const score = {}, rather = {};
  for (const [k, v] of Object.entries(r.score || {})) if (Number.isFinite(+v)) score[k] = +v;
  for (const [k, v] of Object.entries(r.rather || {})) if (typeof v === 'string' && v) rather[k] = v;
  return { won: r.won !== false, score, rather, note: typeof r.note === 'string' ? r.note : '' };
}

// ?debug adds a quiet "skip" under each game that ends it with the stub's scores
const debug = new URLSearchParams(location.search).has('debug');

// Mount `game` into the empty `stage`. Returns { result, teardown }:
// result resolves with the normalised outcome when the game calls api.done;
// teardown runs the game's cleanup and clears the stage (call it under ink).
// Act two's ghost: the chapter's act-one record, or the builder's fixture run if the
// record is missing or thin (under 10 hushes), marked synthetic.
const MIN_HUSHES = 10;
export async function loadGhost(ch, record = []) {
  if (record.filter(e => (e.event || e.type) === 'hush').length >= MIN_HUSHES) return { events: record, synthetic: false };
  if (GHOSTS.includes(ch.id)) {
    try {
      const r = await fetch(`games/${ch.id}/ghost.json`);
      if (r.ok) { const j = await r.json(); return { events: Array.isArray(j) ? j : j.events || [], synthetic: true }; }
    } catch (err) { console.warn(`${ch.id}: ghost.json did not load.`, err); }
  }
  return { events: record, synthetic: true };
}

// `act`: { mode, record(type, data), ghost, rewrite(label, text) } from the spine (see CONTRACT.md, act two)
export function mount(game, ch, stage, flags, act = {}) {
  stage.replaceChildren();
  stage.className = 'game-stage';
  let cleanup = null, finished = false, settle;
  const result = new Promise(r => { settle = r; });
  const mode = act.mode || 'sojourn';
  const api = {
    done(r) {
      if (finished) { console.warn(`${ch.id}: api.done called more than once; ignored.`); return; }
      finished = true;
      settle(normalise(r));
    },
    state: Object.freeze({ ...flags }),
    setFlag(key, value) { flags[key] = value; },
    reducedMotion,
    mode,
    // act one only: a timed event for act two's ghost
    record(type, data = {}) { if (mode === 'sojourn' && !finished) act.record?.(type, data); },
    // act two only: the chapter's act-one record
    ghost: mode === 'burial' ? Object.freeze(act.ghost || { events: [], synthetic: true }) : null,
    // her red correction to the Account row with this score label
    rewrite(label, text) { if (typeof label === 'string' && typeof text === 'string') act.rewrite?.(label, text); },
  };
  try {
    cleanup = game.mount(stage, api);
  } catch (err) {
    console.warn(`${ch.id}: mount() threw; using the stub.`, err);
    stage.replaceChildren();
    cleanup = stub(ch).mount(stage, api);
  }
  let skip = null;
  if (debug) {
    skip = document.createElement('button');
    skip.className = 'debug-skip';
    skip.type = 'button';
    skip.textContent = 'skip ›';
    skip.addEventListener('click', () => api.done({ won: true, score: { ...ch.stub.score } }));
    stage.parentNode.append(skip);
  }
  const teardown = () => {
    skip?.remove();
    try { if (typeof cleanup === 'function') cleanup(); }
    catch (err) { console.warn(`${ch.id}: cleanup threw.`, err); }
    stage.replaceChildren();
    stage.className = 'game-stage';
  };
  return { result, teardown };
}

// A stand-in until the real game lands: the chapter's title, one line, a "win".
export function stub(ch) {
  return {
    id: ch.id,
    title: ch.title,
    mount(stage, api) {
      const root = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      root.setAttribute('viewBox', '0 0 960 640');
      root.setAttribute('class', 'g-stub');
      const below = api.mode === 'burial';
      const light = below ? 'vault' : C.LIGHT[ch.id] ? ch.id : 'tarn';
      const line = below
        ? `Below: your ${api.ghost.events.length} recorded moves${api.ghost.synthetic ? ' (someone else’s)' : ''} play above her.`
        : `A game to come, in games/${ch.id}/.`;
      root.innerHTML = C.backdrop(light, { h: 540 }) + C.glass(light, { y: 540, h: 100 }) +
        `<text class="sh-teach" x="44" y="76">${esc(below ? 'Knock on the third beat.' : ch.stub.line)}</text>` +
        C.card({ text: ch.title, x: 180, y: 214, w: 600, h: 92, size: 36 }) +
        `<text class="g-stub-line" x="480" y="362" text-anchor="middle">${esc(line)}</text>
        <a class="g-stub-win" href="#" role="button"><text x="480" y="430" text-anchor="middle">win</text></a>
        <text class="sh-score" x="912" y="600" text-anchor="end">${esc(Object.entries(ch.stub.score).map(([k, v]) => `${k} ${v === 0 ? 'none' : v}`).join(' · ').toUpperCase())}</text>`;
      const win = root.querySelector('.g-stub-win');
      // act one: a few recorded moves, as a game would record them
      if (!below) for (let i = 0; i < 12; i++) api.record('hush', { t: 2 + i * 4.5, type: i % 4 ? 'sun' : 'tap', board: i % 8, react: .6 });
      const go = e => {
        e.preventDefault();
        win.removeEventListener('click', go);
        win.classList.add('spent');
        if (below) {
          // act two: her pass, as a mirror game would rewrite it (taps heard: 2)
          const n = api.state.tapsHushed ?? ch.stub.score['taps hushed'] ?? 0, k = 2;
          api.rewrite('taps hushed', `she knocked ${n + k} times. He heard ${k}.`);
          api.done({ won: true, score: { 'taps heard': k }, note: '' });
        } else api.done({ won: true, score: { ...ch.stub.score }, note: '' });
      };
      win.addEventListener('click', go);
      stage.append(root);
      return () => win.removeEventListener('click', go);
    },
  };
}
