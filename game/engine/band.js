// The dialogue band: one line at a time, in the tarn (docked under the stage on
// narrow screens). Advance on click, tap, Enter, Space or →.

import { md, esc } from './util.js';

export class Band {
  constructor(el) {
    this.el = el;
    this.resolve = null;
    // a click on a waiting line reads on; on an idle prompt it does the prompt's errand
    this.onIdle = null;
    el.addEventListener('click', e => { e.stopPropagation(); if (this.resolve) this.advance(); else this.onIdle?.(); });
    document.addEventListener('keydown', e => {
      if (!['Enter', ' ', 'ArrowRight'].includes(e.key) || e.target.closest?.('.hit, button')) return;
      if (this.resolve) { e.preventDefault(); this.advance(); }
      else if (this.onIdle && this.el.classList.contains('on')) { e.preventDefault(); this.onIdle(); }
    });
  }
  get waiting() { return !!this.resolve; }

  // glass: a line in the tarn's returned light; mirror: in the water's script (.sh-mirror), upside
  // down until righted; hand 'm': written without looking, paler, m. in the margin;
  // rather: a red correction beneath it (act two only: act one writes no red)
  // echo { cut, tail }: her line, the guest's own with its head struck in red and the tail in hers
  show([who, text], { glass = false, mirror = false, hand = '', echo = null, more = true, rather = '' } = {}) {
    const words = echo ? `<s class="band-cut">${esc(echo.cut)}</s> <span class="band-hers">${esc(echo.tail)}</span>`
      : mirror ? `<span class="sh-mirror">${md(text)}</span>` : md(text);
    this.el.innerHTML =
      (who ? `<span class="band-who">${md(who)}</span>` : '') +
      (hand === 'm' ? '<span class="band-m" aria-label="written without looking">m.</span>' : '') +
      `<span class="band-line${glass ? ' is-glass' : ''}${who ? '' : ' is-narration'}${hand === 'm' ? ' is-m' : ''}">${words}` +
      (rather ? `<span class="band-rather">Say, rather: ${md(rather)}</span>` : '') + `</span>` +
      (more ? '<span class="band-more" aria-hidden="true">›</span>' : '');
    this.el.classList.add('on');
  }
  // show a line and wait for the reader
  say(line, opts) {
    this.show(line, opts);
    return new Promise(r => { this.resolve = r; });
  }
  async lines(list, before) {
    for (let i = 0; i < list.length; i++) {
      before?.(i);
      await this.say(list[i]);
    }
  }
  // a fork: answers as buttons; resolves with the index taken, or null after `idle` ms untouched.
  // `strong`: the index drawn as the button (Nevertheless.), the other as a quiet italic.
  choose(choices, { idle = 0, strong = -1 } = {}) {
    const keep = this.onIdle;
    this.onIdle = null;
    this.el.innerHTML = `<span class="band-choices">${choices.map((c, i) =>
      `<button type="button" class="band-choice${i === strong ? ' is-strong' : ''}" data-i="${i}">${md(c)}</button>`).join('<span class="band-or" aria-hidden="true">·</span>')}</span>`;
    this.el.classList.add('on');
    return new Promise(resolve => {
      let t = 0;
      const end = i => {
        clearTimeout(t);
        this.el.removeEventListener('click', pick, true);
        this.onIdle = keep;
        this.clear();
        resolve(i);
      };
      const pick = e => {
        e.stopPropagation();
        const b = e.target.closest('.band-choice');
        if (b) end(+b.dataset.i);
      };
      this.el.addEventListener('click', pick, true);
      if (idle) t = setTimeout(() => end(null), idle);
    });
  }
  advance() {
    const r = this.resolve;
    if (!r) return;
    this.resolve = null;
    r();
  }
  clear() { this.el.classList.remove('on'); this.el.innerHTML = ''; }
}
