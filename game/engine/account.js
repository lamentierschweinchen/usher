// The Account: what the guest writes, "within the compass of merely written words" [u17].
// A front page in his ink, with paler m. lines where he wrote without looking; a back page,
// Unaccountable [u32], on darker paper. In act two her echo strikes the head of a line in red
// and re-inks the tail in place, in her back-slanted red, ending on a full stop. Act one writes
// no red: red is hers alone.
//
// The save keeps it as { front: [{ id, label, value, hand, cut }], back: [{ id, text, hand }] };
// `hand` is 'guest', 'm' or 'hers'; `cut` is how many words of `value` her echo strikes (all of
// them: she kept nothing).

import { ACCOUNT_HEAD, UNACCOUNTABLE } from './story.js';
import { esc, sleep, tapOrWait, reducedMotion } from './util.js';

export const emptyAccount = () => ({ front: [], back: [] });

// write a line into the account (a front line has `value`; a back line has `text`); same id replaces
export function enter(acc, line) {
  const list = 'text' in line ? acc.back : acc.front;
  const i = list.findIndex(l => l.id === line.id);
  const l = { hand: 'guest', ...line };
  if (i >= 0) list[i] = { ...list[i], ...l }; else list.push(l);
  return l;
}
export const find = (acc, id) => acc.front.find(l => l.id === id) || acc.back.find(l => l.id === id);

// a run of words, each its own span, so her echo can strike and re-ink them in place. `cut`: the
// first words already struck by her, the rest already hers (an echo made earlier)
const words = s => String(s).split(/\s+/).filter(Boolean);
const wordSpans = (s, cut = null) => {
  let ws = words(s);
  // an echo made earlier: her tail ends on a full stop, as nick() leaves it
  if (cut != null && cut < ws.length) {
    if (/^[—–-]$/.test(ws[ws.length - 1])) ws = ws.slice(0, -1);
    if (ws.length > cut && !/[.!?]$/.test(ws[ws.length - 1])) ws[ws.length - 1] = ws[ws.length - 1].replace(/[,;:—–-]+$/, '') + '.';
  }
  return ws.map((w, i) => `<span class="w${cut == null ? '' : i < cut ? ' struck' : ' hers'}">${esc(w)}</span>`).join(' ');
};
const margin = hand => (hand === 'm' ? '<span class="acc-m" aria-label="written without looking">m.</span>' : '');

function frontLine(l) {
  const cut = l.cut ?? null;
  return `<li class="acc-line hand-${l.hand}${cut != null ? ' nicked' : ''}" data-id="${esc(l.id)}">${margin(l.hand)}` +
    (l.label ? `<span class="acc-label">${wordSpans(l.label, l.whole ? 1e3 : null)}</span> ` : '') +
    `<span class="acc-value">${wordSpans(l.value || '', cut)}</span></li>`;
}
const backLine = l => `<li class="acc-line hand-${l.hand}" data-id="${esc(l.id)}">${margin(l.hand)}<span class="acc-value">${wordSpans(l.text)}</span></li>`;

// ---- the slip: one line, top right, for 2.5 s, while the game goes on ----
export async function slip(host, line) {
  const el = document.createElement('div');
  el.className = `acc-slip hand-${line.hand || 'guest'}`;
  el.setAttribute('role', 'status');
  el.innerHTML = margin(line.hand) + (line.label ? `<span class="acc-label">${esc(line.label)}</span> ` : '') + `<span>${esc(line.value ?? line.text ?? '')}</span>`;
  host.append(el);
  await sleep(30);
  el.classList.add('on');
  await sleep(2500);
  el.classList.remove('on');
  await sleep(400);
  el.remove();
}

// ---- the sheet: the account as written, at the hinge and at a reveal ----
// opts.write: lines to write now with the pen (front lines, in order), after the sheet appears
// opts.echo: [{ id: 'head' | lineId, cut }] her strikes, after that
// opts.wait: false to return { el, close } without waiting for a tap
export async function sheet(host, acc, { write = [], echo = [], wait = true, head = true, before } = {}) {
  const el = document.createElement('div');
  el.className = 'account2';
  const back = acc.back.length ? `<section class="acc-back"><h3 class="acc-back-title">${esc(UNACCOUNTABLE)}</h3><ol>${acc.back.map(backLine).join('')}</ol></section>` : '';
  el.innerHTML = `<div class="acc-paper">
    ${head ? `<h2 class="acc-head" data-id="head">${wordSpans(ACCOUNT_HEAD, acc.headCut ?? null)}</h2>` : ''}
    <ol class="acc-front">${acc.front.map(frontLine).join('')}</ol>
    ${back}
  </div>`;
  host.append(el);
  fit(el, host, write);
  await sleep(40);
  el.classList.add('on');
  await sleep(reducedMotion ? 80 : 700);
  for (const l of write) {
    enter(acc, l);
    el.querySelector('.acc-front').insertAdjacentHTML('beforeend', frontLine({ ...l, label: l.label, value: '' }));
    const li = el.querySelector(`.acc-front [data-id="${CSS.escape(l.id)}"] .acc-value`);
    await pen(li, l.value || '');
    await sleep(reducedMotion ? 0 : 350);
  }
  await before?.(el);
  for (const e of echo) await nick(el, acc, e);
  if (!wait) return { el, close: () => closeSheet(el) };
  el.insertAdjacentHTML('beforeend', '<div class="acc-more" aria-hidden="true">›</div>');
  await tapOrWait(el);
  await closeSheet(el);
}
async function closeSheet(el) { el.classList.remove('on'); await sleep(450); el.remove(); }

// the pen: a value written word by word (her rewrites too, in her hand)
export async function pen(span, text) {
  span.innerHTML = '';
  for (const w of words(text)) {
    span.insertAdjacentHTML('beforeend', `${span.childElementCount ? ' ' : ''}<span class="w">${esc(w)}</span>`);
    await sleep(reducedMotion ? 0 : 60 + w.length * 22);
  }
}

// her echo on one line: the head struck in red, the tail re-inked in place in her back-slanted red,
// ending on a full stop. cut === every word: she keeps nothing. whole: the label goes too (the hinge).
export async function nick(el, acc, { id, cut, whole = false }) {
  const row = el.querySelector(`[data-id="${CSS.escape(id)}"]`);
  if (!row) return;
  if (whole) for (const w of row.querySelectorAll('.acc-label .w')) { w.classList.add('struck'); await sleep(reducedMotion ? 0 : 120); }
  const ws = [...row.querySelectorAll(id === 'head' ? '.w' : '.acc-value .w')];
  const n = Math.min(cut, ws.length);
  row.classList.add('nicked');
  for (const w of ws.slice(0, n)) { w.classList.add('struck'); await sleep(reducedMotion ? 0 : 160); }
  const tail = ws.slice(n);
  if (tail.length) {
    // the tail ends on a full stop: his dash or comma becomes her period
    const last = tail[tail.length - 1];
    if (/^[—–-]$/.test(last.textContent)) { last.remove(); tail.pop(); }
    const end = tail[tail.length - 1];
    if (end && !/[.!?]$/.test(end.textContent)) end.textContent = end.textContent.replace(/[,;:—–-]+$/, '') + '.';
    for (const w of tail) { w.classList.add('hers'); await sleep(reducedMotion ? 0 : 140); }
  }
  if (id !== 'head') {
    const line = acc.front.find(l => l.id === id);
    if (line) { line.cut = n; if (whole) line.whole = true; }
  } else acc.headCut = n;
}

// size the paper to the stage: measured with every line to come written out
function fit(el, host, write) {
  const paper = el.querySelector('.acc-paper');
  const probe = write.map(l => frontLine(l)).join('');
  const front = el.querySelector('.acc-front');
  front.insertAdjacentHTML('beforeend', probe);
  const room = host.clientHeight * .9;
  const floor = Math.min(innerWidth, innerHeight) < 600 ? 15 : 12;
  let size = parseFloat(getComputedStyle(paper).fontSize);
  while (paper.scrollHeight > room && size > floor) { size -= .5; paper.style.fontSize = `${size}px`; }
  for (const l of write) front.querySelector(`[data-id="${CSS.escape(l.id)}"]`)?.remove();
}
