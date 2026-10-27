// In and out of mini-games: a lace-edged iris (the cut library's) closes on the
// room, an intertitle holds (tap, or its reading time), the iris opens.
// Reduced motion: a quick fade through black.

import { irisD } from '../shared/cuts.js';
import { svg, sleep, tween, md, tapOrWait, holdFor, ease, reducedMotion } from './util.js';

export class Transit {
  constructor(stage) {
    this.stage = stage;
    this.iris = svg('svg', { class: 'iris', 'aria-hidden': 'true' });
    this.iris.innerHTML = '<path class="sh-iris" fill-rule="evenodd"/>';
    this.hole = this.iris.firstChild;
    this.card = document.createElement('div');
    this.card.className = 'intertitle';
    this.card.setAttribute('role', 'status');
    stage.append(this.iris, this.card);
    this.at = { x: 0, y: 0 };
  }
  get R() { return Math.hypot(this.stage.clientWidth, this.stage.clientHeight) * 1.1; }

  // the hole, drawn in the stage's own px so it stays round on any shape of stage
  draw(r) {
    const { clientWidth: w, clientHeight: h } = this.stage;
    this.hole.setAttribute('d', irisD(this.at.x, this.at.y, Math.max(0, r), { w, h }));
  }
  async run(from, to, ms) {
    await tween(ms, k => this.draw(from + (to - from) * ease(k)));
  }
  // cover the stage in ink, closing on a point (px within the stage)
  async close(at) {
    this.at = at || { x: this.stage.clientWidth / 2, y: this.stage.clientHeight / 2 };
    this.iris.classList.add('on');
    if (reducedMotion) { this.iris.classList.add('flat'); this.draw(0); await sleep(130); return; }
    this.iris.classList.remove('flat');
    await this.run(this.R, 0, 700);
  }
  async open(at) {
    if (at) this.at = at;
    if (reducedMotion) { this.iris.classList.add('fadeout'); await sleep(130); this.iris.classList.remove('on', 'fadeout', 'flat'); return; }
    await this.run(0, this.R, 900);
    this.iris.classList.remove('on');
  }

  // an intertitle on the ink; resolves on tap or after its reading time
  // html: a title already marked up (the red word of A Burial of Some Weeks);
  // during: runs once the card covers the stage, to change what lies beneath it
  async title({ kicker = '', title = '', html = '', line = '', sealed = false, during }, hold) {
    this.card.innerHTML = `<div class="it-box${sealed ? ' sealed' : ''}">
      ${kicker ? `<div class="t-chapter">${md(kicker)}</div>` : ''}
      ${title || html ? `<div class="t-intertitle">${html || md(title)}</div>` : ''}
      ${line ? `<div class="t-card-line">${md(line)}</div>` : ''}
    </div>`;
    this.card.classList.add('on');
    await sleep(250);
    during?.();
    await tapOrWait(this.card, hold ?? holdFor(`${title} ${line}`));
    this.card.classList.remove('on');
    await sleep(200);
  }
}
