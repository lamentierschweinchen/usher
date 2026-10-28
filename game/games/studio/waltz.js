// Optional sound for the mirror studio: Roderick's waltz on a plucked (Karplus–Strong) string, and her wooden taps.
// Every cue is also seen. It starts only on a real tap (never before a user gesture) and closes with the game.
//
// Lifecycle (work/audio/LIFECYCLE-REVIEW.md): the music follows the game clock, never the audio clock.
// - start(): from a trusted input only. Creates the context once; resumes it whenever it isn't running.
// - schedule(T, speed): each frame. Nothing is queued unless the context is running. After any stall
//   (suspended context, interruption, hidden page) the queued voices are cut and the cursor re-anchors to T:
//   missed beats are skipped, never drained.
// - suspend() / resync(): page hidden / shown. Fades what is sounding, cancels what is queued, halts scheduling.
// - release(): the ending. Cancels queued notes and lets the ones already sounding ring out. No more music.
// - close(): disposal. Stops every voice and closes the context for good.
// `beat` is the waltz's beat in game seconds (60/86 in the studio).

const LOOKAHEAD = 0.12, LATE = 0.02, FADE = 0.06;
const BARS = [[65.41, [261.63, 329.63, 392.0]], [49.0, [246.94, 293.66, 349.23]], [49.0, [246.94, 293.66, 349.23]], [65.41, [261.63, 329.63, 392.0]]];

export function makeWaltz(enabled, beat, AC = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)) {
  let ctx = null, out = null, nextN = 0, wood = null;
  let held = false, stale = false, ended = false, closed = false;
  const cache = new Map(), voices = new Set();
  const running = () => !!ctx && ctx.state === 'running';

  function string(freq) {
    if (cache.has(freq)) return cache.get(freq);
    const sr = ctx.sampleRate, n = Math.floor(sr * 1.6), N = Math.max(2, Math.round(sr / freq));
    const buf = ctx.createBuffer(1, n, sr), d = buf.getChannelData(0);
    for (let i = 0; i < N; i++) d[i] = Math.random() * 2 - 1;
    d[N] = d[0] * 0.99;
    for (let i = N + 1; i < n; i++) d[i] = 0.4975 * (d[i - N] + d[i - N - 1]);
    cache.set(freq, buf);
    return buf;
  }
  function play(buf, when, gain, filterHz) {
    const s = ctx.createBufferSource(), g = ctx.createGain();
    s.buffer = buf; g.gain.value = gain;
    if (filterHz) { const bq = ctx.createBiquadFilter(); bq.type = 'bandpass'; bq.frequency.value = filterHz; bq.Q.value = 3; s.connect(bq); bq.connect(g); } else s.connect(g);
    g.connect(out);
    const v = { s, g, at: Math.max(ctx.currentTime, when) };
    voices.add(v);
    s.onended = () => voices.delete(v);
    s.start(v.at);
  }
  // cut voices: queued ones never sound; sounding ones fade over FADE (or are kept, with `keepSounding`)
  function cut(keepSounding) {
    if (!ctx) return voices.clear();
    const now = ctx.currentTime;
    for (const v of [...voices]) {
      if (v.fading) continue;
      try {
        if (v.at > now) { v.s.stop(); v.g.disconnect(); voices.delete(v); } else if (!keepSounding) {
          v.fading = true;
          v.g.gain.cancelScheduledValues(now);
          v.g.gain.setValueAtTime(v.g.gain.value, now);
          v.g.gain.linearRampToValueAtTime(0, now + FADE);
          v.s.stop(now + FADE);
        }
      } catch (e) { voices.delete(v); }
    }
  }

  return {
    start() {
      if (!enabled || closed || !AC) return;
      if (!ctx) {
        try { ctx = new AC(); out = ctx.createGain(); out.gain.value = 0.22; out.connect(ctx.destination); } catch (e) { ctx = null; return; }
      }
      if (ctx.state !== 'running') {
        stale = true;
        try { const p = ctx.resume(); if (p && p.catch) p.catch(() => {}); } catch (e) { /* retried on the next tap */ }
      }
    },
    schedule(T, speed) {
      if (!ctx || held || ended) return;
      if (!running()) { stale = true; return; }
      if (stale) { cut(false); stale = false; nextN = Math.ceil((T - LATE) / beat); }
      if (nextN * beat < T - LATE) nextN = Math.ceil((T - LATE) / beat);
      while (nextN * beat < T + LOOKAHEAD) {
        const when = ctx.currentTime + (nextN * beat - T) / speed, b = nextN % 3, [bass, chord] = BARS[Math.floor(nextN / 3) % 4];
        if (b === 0) play(string(bass), when, 0.9);
        else chord.forEach((fq, j) => play(string(fq), when + j * 0.014, b === 2 ? 0.34 : 0.2));
        nextN++;
      }
    },
    tap() {
      if (!running() || held || ended) return;     // an immediate cue: never queued for later
      if (!wood) {
        const sr = ctx.sampleRate, n = Math.floor(sr * 0.09);
        wood = ctx.createBuffer(1, n, sr);
        const d = wood.getChannelData(0);
        for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (sr * 0.012));
      }
      play(wood, ctx.currentTime, 1.4, 640);
    },
    suspend() { held = true; cut(false); },
    resync() { held = false; stale = true; },
    release() { ended = true; cut(true); },
    close() {
      closed = true;
      cut(false);
      voices.clear();
      try { if (ctx) ctx.close(); } catch (e) { /* already closed */ }
      ctx = null;
    },
    get voices() { return voices.size; },
  };
}
