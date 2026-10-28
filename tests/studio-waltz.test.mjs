// Regressions for the mirror studio's waltz lifecycle (work/audio/LIFECYCLE-REVIEW.md).
// Run: node --test tests/*.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { makeWaltz } from '../game/games/studio/waltz.js';

const BEAT = 60 / 86, BAR = 3 * BEAT;

// A small AudioContext double: a hand-set clock and state, and every source it starts.
function fakeAudio(state = 'running') {
  const sources = [], gains = [];
  let resumes = 0, closed = false;
  const param = v => ({ value: v, ramps: [], setValueAtTime() {}, cancelScheduledValues() {}, linearRampToValueAtTime(x, t) { this.ramps.push([x, t]); } });
  const node = () => ({ connected: true, connect() {}, disconnect() { this.connected = false; } });
  const ctx = {
    state, currentTime: 0, sampleRate: 8000, destination: node(),
    createBuffer: (c, n) => { const d = new Float32Array(n); return { getChannelData: () => d }; },
    createGain() { const g = { ...node(), gain: param(1) }; gains.push(g); return g; },
    createBiquadFilter: () => ({ ...node(), frequency: param(0), Q: param(0), type: '' }),
    createBufferSource() {
      const s = { ...node(), buffer: null, at: null, stopAt: null, onended: null };
      s.start = w => { s.at = w; sources.push(s); };
      s.stop = (w = 0) => { s.stopAt = w; };
      s.gainNode = null;
      return s;
    },
    listeners: [],
    addEventListener(type, fn) { if (type === 'statechange') this.listeners.push(fn); },
    setState(st) { this.state = st; for (const fn of this.listeners) fn(); },
    resume() { resumes++; return Promise.resolve(); },
    close() { closed = true; return Promise.resolve(); },
  };
  function AC() { return ctx; }
  // a source is audible if it starts and isn't stopped at or before its start
  const audible = () => sources.filter(s => s.stopAt === null || s.stopAt > s.at);
  return { ctx, AC, sources, gains, audible, resumes: () => resumes, closed: () => closed };
}
const run = (w, t0, t1, fps = 60) => { let T = t0; for (; T <= t1; T += 1 / fps) w.schedule(T, 1); return T; };

test('a suspended context queues nothing, and start() asks it to resume every time', () => {
  const A = fakeAudio('suspended');
  const w = makeWaltz(true, BEAT, A.AC);
  w.start();
  run(w, 0, 10);
  assert.equal(A.sources.length, 0, 'no voices while suspended (was 35, all inside 148 ms)');
  assert.equal(A.resumes(), 1);
  w.start();
  assert.equal(A.resumes(), 2, 'a later tap retries the resume');
});

test('on resuming, the cursor re-anchors to the game clock: missed beats are skipped, not drained', () => {
  const A = fakeAudio('suspended');
  const w = makeWaltz(true, BEAT, A.AC);
  w.start();
  run(w, 0, 10.4);
  A.ctx.state = 'running'; A.ctx.currentTime = 4;
  const T = 15 * BEAT - 0.05;                        // T ≈ 10.41, with beat 15 due in 0.05 s
  w.schedule(T, 1);
  const beats = new Set(A.sources.map(s => Math.round(((s.at - 4) + T) / BEAT)));
  assert.ok(A.sources.length > 0 && A.sources.length <= 3, `at most one beat queued, got ${A.sources.length} voices`);
  assert.deepEqual([...beats], [15], 'only the beat that is due');
  for (const s of A.sources) assert.ok(Math.abs(s.at - 4.05) < 0.05, 'on time against the resumed clock');
});

test('an interruption seen by a frame cancels the queued beat before the clock resumes', () => {
  const A = fakeAudio('running');
  const w = makeWaltz(true, BEAT, A.AC);
  w.start();
  w.schedule(0.60, 1);                               // beat two, queued at audio ≈ .09767
  const queued = A.sources.slice();
  assert.ok(queued.length > 0);
  A.ctx.currentTime = 0.09;
  A.ctx.state = 'interrupted';                       // no statechange: only the next frame sees it
  w.schedule(0.61, 1);
  A.ctx.state = 'running'; A.ctx.currentTime = 0.2;  // the clock runs on before the first resumed frame
  for (const s of queued) assert.ok(s.stopAt !== null && s.stopAt <= s.at, 'cancelled while interrupted, never sounds');
  w.schedule(0.62, 1);
  const again = A.audible().filter(s => s.at >= 0.2);
  assert.ok(again.length > 0, 'the first resumed frame queues the beat again');
  for (const s of again) assert.ok(Math.abs((s.at - 0.2) - (BEAT - 0.62)) < 0.05, 'on the game clock');
});

test('an interruption with no frame at all (statechange) cancels the queued beat', () => {
  const A = fakeAudio('running');
  const w = makeWaltz(true, BEAT, A.AC);
  w.start();
  w.schedule(0.60, 1);
  const queued = A.sources.filter(s => s.at > 0.09);
  assert.ok(queued.length > 0);
  A.ctx.currentTime = 0.09;
  A.ctx.setState('interrupted');                     // between frames: no schedule() call follows
  A.ctx.setState('running');
  A.ctx.currentTime = 0.2;                           // past the old note's time, still no frame
  for (const s of queued) assert.ok(s.stopAt !== null && s.stopAt <= s.at, 'cancelled on the state change');
});

test('closing fires a statechange that is ignored', () => {
  const A = fakeAudio('running');
  const w = makeWaltz(true, BEAT, A.AC);
  w.start();
  w.close();
  assert.doesNotThrow(() => A.ctx.setState('closed'));
});

test('hidden page: suspend cancels the queued beat, and resync plays it on the game clock', () => {
  const A = fakeAudio('running');
  const w = makeWaltz(true, BEAT, A.AC);
  w.start();
  w.schedule(0.60, 1);                               // beat two (T = .6977) queued at audio ≈ .0977
  const beat2 = A.sources.filter(s => Math.abs(s.at - (BEAT - 0.6)) < 0.03);
  assert.ok(beat2.length > 0);
  w.suspend();                                       // the page hides
  for (const s of beat2) assert.ok(s.stopAt <= s.at, 'the queued beat never sounds while hidden');
  A.ctx.currentTime = 5;                             // five seconds hidden; the game clock is frozen
  w.schedule(0.62, 1);
  assert.equal(A.audible().filter(s => s.at >= 5).length, 0, 'nothing is scheduled while hidden');
  w.resync();                                        // the page returns
  w.schedule(0.65, 1);
  const again = A.audible().filter(s => s.at >= 5);
  assert.ok(again.length > 0, 'the visual beat at T = .6977 gets its note');
  for (const s of again) assert.ok(Math.abs((s.at - 5) - (BEAT - 0.65)) < 0.05, 'and on time');
});

test('suspend fades what is already sounding instead of cutting it dead', () => {
  const A = fakeAudio('running');
  const w = makeWaltz(true, BEAT, A.AC);
  w.start();
  w.schedule(0, 1);                                  // beat one, starting now
  A.ctx.currentTime = 0.05;
  const sounding = A.sources.filter(s => s.at <= 0.05);
  assert.ok(sounding.length > 0);
  w.suspend();
  for (const s of sounding) assert.ok(s.stopAt > 0.05 && s.stopAt <= 0.12, 'stopped after a short fade');
});

test('the ending: queued notes are cancelled, sounding ones ring, and no more music is scheduled', () => {
  const A = fakeAudio('running');
  const w = makeWaltz(true, BEAT, A.AC);
  w.start();
  w.schedule(2 * BEAT - 0.05, 1);                    // beat three is queued 0.05 s ahead
  A.ctx.currentTime = 0.01;
  const queued = A.sources.filter(s => s.at > 0.01), ringing = A.sources.filter(s => s.at <= 0.01);
  w.release();
  for (const s of queued) assert.ok(s.stopAt <= s.at);
  for (const s of ringing) assert.equal(s.stopAt, null, 'left to ring into the tableau');
  const n = A.sources.length;
  run(w, 2 * BEAT, 2 * BEAT + 3 * BAR);
  w.tap();
  assert.equal(A.sources.length, n, 'nothing new after the ending');
});

test('a tap while the context is not running is dropped, never played late', () => {
  const A = fakeAudio('suspended');
  const w = makeWaltz(true, BEAT, A.AC);
  w.start();
  w.tap();
  assert.equal(A.sources.length, 0);
  A.ctx.state = 'running';
  w.tap();
  assert.equal(A.sources.length, 1);
});

test('close stops every voice, closes the context, and nothing restarts it', () => {
  const A = fakeAudio('running');
  const w = makeWaltz(true, BEAT, A.AC);
  w.start();
  w.schedule(0, 1);
  A.ctx.currentTime = 0.01;
  w.close();
  assert.ok(A.closed());
  assert.equal(w.voices, 0);
  const n = A.sources.length;
  w.start(); w.schedule(1, 1); w.tap();
  assert.equal(A.sources.length, n);
});

test('the beat-three accent is unchanged: chords louder on three than on two', () => {
  const A = fakeAudio('running');
  const w = makeWaltz(true, BEAT, A.AC);
  w.start();
  w.schedule(0, 1); w.schedule(BEAT - 0.1, 1); w.schedule(2 * BEAT - 0.1, 1);
  assert.deepEqual(A.gains.slice(1).map(g => g.gain.value), [0.9, 0.2, 0.2, 0.2, 0.34, 0.34, 0.34]);
});

test('sound off: nothing is created', () => {
  const A = fakeAudio('running');
  let made = 0;
  const w = makeWaltz(false, BEAT, function () { made++; return A.ctx; });
  w.start(); w.schedule(1, 1); w.tap();
  assert.equal(made, 0);
});
