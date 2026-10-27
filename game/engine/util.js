export const NS = 'http://www.w3.org/2000/svg';
export const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const sleep = ms => new Promise(r => setTimeout(r, ms));
export const ease = k => k < .5 ? 2 * k * k : 1 - (2 - 2 * k) ** 2 / 2;

export function svg(tag, attrs = {}) {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

// step(k) for k 0→1 over ms; keeps time on a timer when frames stall
export function tween(ms, step) {
  return new Promise(done => {
    const t0 = performance.now();
    let over = false, last = t0, guard = 0;
    const tick = () => {
      if (over) return;
      last = performance.now();
      const k = Math.min(1, (last - t0) / ms);
      step(k);
      if (k >= 1) { over = true; clearInterval(guard); done(); }
    };
    requestAnimationFrame(function f() { tick(); if (!over) requestAnimationFrame(f); });
    guard = setInterval(() => { if (performance.now() - last > 120) tick(); }, 100);
  });
}

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
export const esc = s => String(s).replace(/[&<>"]/g, c => ESC[c]);

// *italic* → <i>, ~~struck~~ → <s>, __twice__ → double underline
export function md(s) {
  return String(s).replace(/[&<>"]/g, c => ESC[c])
    .replace(/~~([^~]+)~~/g, '<s>$1</s>')
    .replace(/__([^_]+)__/g, '<u>$1</u>')
    .replace(/\*([^*]+)\*/g, '<i>$1</i>');
}

// resolves on the first click/tap or key (Enter, Space, →) — or after ms, if given
export function tapOrWait(el, ms) {
  return new Promise(resolve => {
    let t = 0;
    const end = e => {
      if (e?.type === 'keydown' && !['Enter', ' ', 'ArrowRight'].includes(e.key)) return;
      e?.preventDefault?.();
      clearTimeout(t);
      el.removeEventListener('click', end);
      document.removeEventListener('keydown', end);
      resolve();
    };
    el.addEventListener('click', end);
    document.addEventListener('keydown', end);
    if (ms) t = setTimeout(end, ms);
  });
}

// reading time for a line, for intertitles that hold on their own
export const holdFor = text => Math.max(1800, String(text).split(/\s+/).length * 330);
