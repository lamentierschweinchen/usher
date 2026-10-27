// The ending: the account lies on the tarn like the letter; each "say, rather:"
// writes itself beneath in red; the last stops on a blot. Then the stage turns
// over and the reflected house stands upright.

import * as C from '../shared/cuts.js';
import { ACCOUNT, CHAPTERS, LAST, REMARKS, num } from './story.js';
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
      used = row.fixed ? null : Object.keys(r.score).find(k => row.match.test(k)) || null;
      const n = (row.adjust || (x => x))(used ? r.score[used] : row.n, flags);
      rows.push({ ch: ch.id, key: used, label: row.label, value: `${num(n)}.`, rather: stop((used && r.rather?.[used]) || row.rather(n, flags)) });
    }
    for (const [label, gloss] of Object.entries(r.rather || {})) {
      if (label !== used && label in r.score) rows.push({ ch: ch.id, key: label, label: cap(label), value: `${num(r.score[label])}.`, rather: stop(gloss) });
    }
  }
  for (const row of ACCOUNT.rows.filter(x => !x.ch)) rows.push({ label: row.label, value: `${num(row.n)}.`, rather: row.rather(row.n, flags) });
  return rows;
}

// size the account to the stage: measured with every correction written out, the type
// steps down until the whole card fits (never under 15px on a phone, where it may scroll instead)
function fit(card, stage, lines) {
  for (const el of lines) el.textContent = el.dataset.text + ' ●';
  const room = stage.clientHeight * .92;
  const floor = Math.min(innerWidth, innerHeight) < 600 ? 15 : 12;
  let size = parseFloat(getComputedStyle(card).fontSize);
  while (card.scrollHeight > room && size > floor) { size -= .5; card.style.fontSize = `${size}px`; }
  for (const el of lines) el.textContent = '';
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
  const lines = [...sheet.querySelectorAll('.acc-rather')];
  fit(sheet.querySelector('.sheet'), stage, lines);
  await sleep(50);
  sheet.classList.add('on');
  await sleep(reducedMotion ? 100 : 900);
  for (const el of lines) {
    el.scrollIntoView({ block: 'nearest' });   // on a small screen the sheet scrolls with the pen
    await write(el, el.dataset.text);
    await sleep(reducedMotion ? 0 : 260);
  }
  lines[lines.length - 1].insertAdjacentHTML('beforeend', BLOT);
  lines[lines.length - 1].scrollIntoView({ block: 'nearest' });
  await sleep(600);
  sheet.insertAdjacentHTML('beforeend', '<div class="acc-more" aria-hidden="true">›</div>');
  await tapOrWait(sheet);
  sheet.classList.remove('on');
  await sleep(500);
  sheet.remove();
}

// a closing line on the library's black ribbon; wrapped so the type stays legible
function ribbon(text, cx, y, w) {
  const per = Math.max(18, Math.floor((w - 60) / 10.2));   // characters per row at 21 units
  const rows = [];
  for (const word of text.split(' ')) {
    const last = rows[rows.length - 1];
    if (last && (last + ' ' + word).length <= per) rows[rows.length - 1] = last + ' ' + word; else rows.push(word);
  }
  const h = 22 + rows.length * 26;
  return C.banner({ x: cx - w / 2, y, w, h, line: '' }) +
    rows.map((r, i) => `<text class="last-line" x="${cx}" y="${y + 33 + i * 26}" text-anchor="middle">${esc(r)}</text>`).join('');
}

export async function lastCard(stage, map) {
  map.clearSky();
  map.flip(true);
  await sleep(reducedMotion ? 50 : 1700);
  // drawn in units small enough that the ribbons' 21-unit type is at least 15px
  const W = Math.round(Math.min(960, stage.clientWidth * 21 / 15)), H = Math.round(W * stage.clientHeight / stage.clientWidth);
  const w = Math.min(W - 70, 820);
  const card = document.createElement('div');
  card.className = 'last';
  card.innerHTML = `<svg class="last-ribbons" viewBox="0 0 ${W} ${H}" aria-hidden="true">
      ${ribbon(LAST.above, W / 2, Math.round(H * .045), w)}
      ${ribbon(LAST.below, W / 2, Math.round(H * .5), w)}
    </svg>
    <p class="sr-only">${md(LAST.above)} ${md(LAST.below)}</p>
    <button class="again" type="button">${md(LAST.again)}</button>`;
  stage.append(card);
  await sleep(50);
  card.classList.add('on');
  // resolves with the card on "Nevertheless.", for the turn into act two
  return new Promise(resolve => card.querySelector('.again').addEventListener('click', () => resolve(card), { once: true }));
}

// Her pass on the Account, after a chapter below: the account as written, and on each row
// she rewrote, the act-one red struck through and her back-slanted red line beneath.
// Resolves 'again' (back under the studio) or 'nevertheless' (back to the letter).
export async function herPass(stage, results, flags, rewrites = {}) {
  const rows = accountRows(results, flags);
  const sheet = document.createElement('div');
  sheet.className = 'account';
  sheet.innerHTML = `<div class="sheet">
    <h2 class="acc-title">${esc(ACCOUNT.title)}</h2>
    <ol class="acc-rows">
      ${rows.map(r => {
        const hers = r.key && rewrites[r.ch]?.[r.key];
        return `<li><div class="acc-entry"><span>${esc(r.label)}</span><span class="dots"></span><span>${esc(r.value)}</span></div>` +
          `<div class="acc-rather">${esc(`${ACCOUNT.rather} ${r.rather}`)}</div>` +
          (hers ? `<div class="acc-rather hers" data-text="${esc(`${ACCOUNT.rather} ${stop(hers)}`)}"></div>` : '') + '</li>';
      }).join('')}
      <li class="acc-last"><div class="acc-entry"><span>${esc(ACCOUNT.last.label)}</span><span class="dots"></span><span>${esc(ACCOUNT.last.value)}</span></div><div class="acc-rather">${esc(ACCOUNT.rather)}${BLOT}</div></li>
    </ol>
    <div class="acc-choices">
      <button class="acc-nevertheless" type="button" data-choice="nevertheless">${md(LAST.again)}</button>
      <button class="acc-replay" type="button" data-choice="again">${esc(REMARKS.herPass.again)}</button>
    </div>
  </div>`;
  stage.append(sheet);
  const hers = [...sheet.querySelectorAll('.acc-rather.hers')];
  fit(sheet.querySelector('.sheet'), stage, hers);
  await sleep(50);
  sheet.classList.add('on');
  await sleep(reducedMotion ? 100 : 900);
  // the choices work at once, even while her pen is still moving
  const chosen = new Promise(resolve => {
    for (const b of sheet.querySelectorAll('[data-choice]')) b.addEventListener('click', () => resolve(b.dataset.choice), { once: true });
  });
  let picked = false;
  chosen.then(() => { picked = true; });
  for (const el of hers) {
    if (picked) break;
    el.previousElementSibling.classList.add('struck');
    el.scrollIntoView({ block: 'nearest' });
    await sleep(reducedMotion ? 0 : 500);
    await write(el, el.dataset.text);
  }
  const choice = await chosen;
  sheet.classList.remove('on');
  await sleep(500);
  sheet.remove();
  return choice;
}
