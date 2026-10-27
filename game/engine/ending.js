// The ending: the account lies on the tarn like the letter; each "say, rather:"
// writes itself beneath in red; the last stops on a blot. Then the stage turns
// over and the reflected house stands upright.

import { ACCOUNT, CHAPTERS, LAST } from './story.js';
import { md, esc, sleep, tapOrWait, reducedMotion } from './util.js';

const BLOT = `<svg class="blot" viewBox="0 0 40 30" aria-hidden="true"><path d="M20 3c6 0 7 5 11 6s7 5 4 9-2 9-8 9-8-3-12-2-10-1-11-6 3-6 2-10 8-6 14-6Z"/><circle cx="36" cy="5" r="1.6"/><circle cx="5" cy="25" r="1.1"/></svg>`;

const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const stop = s => /[.!?]$/.test(s) ? s : s + '.';

// Each played chapter gives its scripted row (number from the game's matching
// score; the game's own "say, rather" if it sent one, else the script's), then
// any other score the game glossed itself. Unplayed chapters give nothing.
export function accountRows(results, flags = {}) {
  const rows = [];
  for (const ch of CHAPTERS) {
    const r = results[ch.id];
    if (!r) continue;
    const row = ACCOUNT.rows.find(x => x.ch === ch.id);
    let used = null;
    if (row) {
      used = Object.keys(r.score).find(k => row.match.test(k)) || null;
      const n = used ? r.score[used] : row.n;
      rows.push({ label: row.label, value: `${n}.`, rather: stop((used && r.rather?.[used]) || row.rather(n, flags)) });
    }
    for (const [label, gloss] of Object.entries(r.rather || {})) {
      if (label !== used && label in r.score) rows.push({ label: cap(label), value: `${r.score[label]}.`, rather: stop(gloss) });
    }
  }
  for (const row of ACCOUNT.rows.filter(x => !x.ch)) rows.push({ label: row.label, value: `${row.n}.`, rather: row.rather(row.n, flags) });
  return rows;
}

async function write(el, text) {
  if (reducedMotion) { el.textContent = text; return; }
  for (let i = 1; i <= text.length; i++) { el.textContent = text.slice(0, i); await sleep(28); }
}

export async function account(stage, results, flags) {
  const rows = accountRows(results, flags);
  const sheet = document.createElement('div');
  sheet.className = 'account';
  sheet.innerHTML = `<div class="sheet">
    <h2 class="acc-title">${esc(ACCOUNT.title)}</h2>
    <ol class="acc-rows">
      ${rows.map(r => `<li><div class="acc-entry"><span>${esc(r.label)}</span><span class="dots"></span><span>${esc(r.value)}</span></div><div class="acc-rather" data-text="${esc(`${ACCOUNT.rather} ${r.rather}`)}"></div></li>`).join('')}
      <li class="acc-last"><div class="acc-entry"><span>${esc(ACCOUNT.last.label)}</span><span class="dots"></span><span>${esc(ACCOUNT.last.value)}</span></div><div class="acc-rather" data-text="${esc(ACCOUNT.rather)}"></div></li>
    </ol>
  </div>`;
  stage.append(sheet);
  await sleep(50);
  sheet.classList.add('on');
  await sleep(reducedMotion ? 100 : 900);
  const lines = [...sheet.querySelectorAll('.acc-rather')];
  for (const el of lines) { await write(el, el.dataset.text); await sleep(reducedMotion ? 0 : 260); }
  lines[lines.length - 1].insertAdjacentHTML('beforeend', BLOT);
  await sleep(600);
  sheet.insertAdjacentHTML('beforeend', '<div class="acc-more" aria-hidden="true">›</div>');
  await tapOrWait(sheet);
  sheet.classList.remove('on');
  await sleep(500);
  sheet.remove();
}

export async function lastCard(stage, map) {
  map.clearSky();
  map.flip(true);
  await sleep(reducedMotion ? 50 : 1700);
  const card = document.createElement('div');
  card.className = 'last';
  card.innerHTML = `
    <p class="last-above">${md(LAST.above)}</p>
    <p class="last-below">${md(LAST.below)}</p>
    <button class="again" type="button">${md(LAST.again)}</button>`;
  stage.append(card);
  await sleep(50);
  card.classList.add('on');
  return new Promise(resolve => card.querySelector('.again').addEventListener('click', resolve, { once: true }));
}
