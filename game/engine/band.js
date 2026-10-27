// The dialogue band: one line at a time, in the tarn (docked under the stage on
// narrow screens). Advance on click, tap, Enter, Space or →.

import { md } from './util.js';

export class Band {
  constructor(el) {
    this.el = el;
    this.resolve = null;
    el.addEventListener('click', e => { e.stopPropagation(); this.advance(); });
    document.addEventListener('keydown', e => {
      if (this.resolve && ['Enter', ' ', 'ArrowRight'].includes(e.key) && !e.target.closest?.('.hit')) {
        e.preventDefault(); this.advance();
      }
    });
  }
  get waiting() { return !!this.resolve; }

  show([who, text], { truth = false, more = true } = {}) {
    this.el.innerHTML =
      (who ? `<span class="band-who">${md(who)}</span>` : '') +
      `<span class="band-line${truth ? ' is-truth' : ''}${who ? '' : ' is-narration'}">${md(text)}</span>` +
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
  advance() {
    const r = this.resolve;
    if (!r) return;
    this.resolve = null;
    r();
  }
  clear() { this.el.classList.remove('on'); this.el.innerHTML = ''; }
}
