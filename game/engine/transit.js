// In and out of mini-games: an ink-edged iris closes on the room, an intertitle
// holds (tap, or its reading time), the iris opens. Reduced motion: a quick
// fade through ink.

import { svg, sleep, tween, md, tapOrWait, holdFor, ease, reducedMotion } from './util.js';

export class Transit {
  constructor(stage) {
    this.stage = stage;
    this.iris = svg('svg', { class: 'iris', 'aria-hidden': 'true' });
    this.iris.innerHTML = `
      <defs>
        <filter id="bleed" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency=".04" numOctaves="3" seed="3" result="n"/>
          <feDisplacementMap in="SourceGraphic" in2="n" scale="26" xChannelSelector="R" yChannelSelector="G"/>
        </filter>
        <mask id="hole" maskUnits="userSpaceOnUse" x="-50" y="-50" width="5000" height="5000">
          <rect x="-50" y="-50" width="5000" height="5000" fill="#fff"/>
          <circle id="iris-c" cx="0" cy="0" r="0" fill="#000" filter="url(#bleed)"/>
        </mask>
      </defs>
      <rect x="-50" y="-50" width="5000" height="5000" class="iris-ink" mask="url(#hole)"/>`;
    this.circle = this.iris.querySelector('#iris-c');
    this.card = document.createElement('div');
    this.card.className = 'intertitle';
    this.card.setAttribute('role', 'status');
    stage.append(this.iris, this.card);
    this.at = { x: 0, y: 0 };
  }
  get R() { const r = this.stage.getBoundingClientRect(); return Math.hypot(r.width, r.height) * 1.1; }

  async run(from, to, ms) {
    const c = this.circle;
    c.setAttribute('cx', this.at.x); c.setAttribute('cy', this.at.y);
    await tween(ms, k => c.setAttribute('r', from + (to - from) * ease(k)));
  }
  // cover the stage in ink, closing on a point (px within the stage)
  async close(at) {
    this.at = at || { x: this.stage.clientWidth / 2, y: this.stage.clientHeight / 2 };
    this.iris.classList.add('on');
    if (reducedMotion) { this.iris.classList.add('flat'); this.circle.setAttribute('r', 0); await sleep(130); return; }
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
  async title({ kicker = '', title = '', line = '', sealed = false }, hold) {
    this.card.innerHTML = `<div class="it-box${sealed ? ' sealed' : ''}">
      ${kicker ? `<div class="t-chapter">${md(kicker)}</div>` : ''}
      ${title ? `<div class="t-intertitle">${md(title)}</div>` : ''}
      ${line ? `<div class="t-card-line">${md(line)}</div>` : ''}
    </div>`;
    this.card.classList.add('on');
    await sleep(250);
    await tapOrWait(this.card, hold ?? holdFor(`${title} ${line}`));
    this.card.classList.remove('on');
    await sleep(200);
  }
}
