// Mounting a chapter's mini-game through the plug-in contract
// (work/design/CONTRACT.md). A game is an ES module at games/<id>/game.js whose
// default export has mount(stage, api) → cleanup.

import * as C from '../shared/cuts.js';
import { LIVE } from './registry.js';
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
export function mount(game, ch, stage, flags) {
  stage.replaceChildren();
  stage.className = 'game-stage';
  let cleanup = null, finished = false, settle;
  const result = new Promise(r => { settle = r; });
  const api = {
    done(r) {
      if (finished) { console.warn(`${ch.id}: api.done called more than once; ignored.`); return; }
      finished = true;
      settle(normalise(r));
    },
    state: Object.freeze({ ...flags }),
    setFlag(key, value) { flags[key] = value; },
    reducedMotion,
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
      const light = C.LIGHT[ch.id] ? ch.id : 'tarn';
      root.innerHTML = C.defs({ animate: false }) + C.backdrop(light, { h: 540 }) + C.glass(light, { y: 540, h: 100 }) +
        `<text class="sh-teach" x="44" y="76">${esc(ch.stub.line)}</text>` +
        C.card({ text: ch.title, x: 180, y: 214, w: 600, h: 92, size: 36 }) +
        `<text class="g-stub-line" x="480" y="362" text-anchor="middle">A game to come, in games/${ch.id}/.</text>
        <a class="g-stub-win" href="#" role="button"><text x="480" y="430" text-anchor="middle">win</text></a>
        <text class="sh-score" x="912" y="600" text-anchor="end">${esc(Object.entries(ch.stub.score).map(([k, v]) => `${k} ${v}`).join(' · ').toUpperCase())}</text>`;
      const win = root.querySelector('.g-stub-win');
      const go = e => {
        e.preventDefault();
        win.removeEventListener('click', go);
        win.classList.add('spent');
        api.done({ won: true, score: { ...ch.stub.score }, note: '' });
      };
      win.addEventListener('click', go);
      stage.append(root);
      return () => win.removeEventListener('click', go);
    },
  };
}
