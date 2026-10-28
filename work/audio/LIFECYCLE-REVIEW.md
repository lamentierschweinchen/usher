# Audio lifecycle review: fixes and tests (2026-10-28)

The Usher coordinator's answer to the composer team's `INTEGRATION-REVIEW.md` (read from Lukas's local sound studio; nothing copied from it). It covers the mirror studio's audio and input only.

**Unchanged:**
- The bible's five calls; the default stays on after the first trusted board tap.
- Plot, text, audience and deployment.
- The 86 bpm, beat-three ±0.2 s contract.

No composer assets entered the repo.

## What changed

- **`game/games/studio/waltz.js`** (new): `makeWaltz(enabled, beat, AC?)`, moved out of `game.js` so it can be tested in Node. Same sound, same gains: bass 0.9 on one, chords 0.2 on two and 0.34 on three. It adds a lifecycle in the shape the audit proposes for `score.js`:
  - **`start()`** is the unlock, called only from a trusted pointerdown.
    - It creates the context once.
    - It calls `resume()` whenever the context isn't running, so every later tap retries.
  - **`schedule(T, speed)`** queues nothing unless the context is `running`.
    - After any stall (suspended, interrupted, or hidden), it cuts the voices queued before the stall.
    - It then re-anchors the cursor to the current `T`. Missed beats are skipped, never drained.
  - **`tap()`** is immediate. It is dropped if the context isn't running, never played late.
  - **`suspend()` / `resync()`** pair with the page hiding and returning:
    - Queued voices are cancelled.
    - Sounding voices fade over 60 ms.
    - Scheduling halts until `resync()`.
  - **`release()`** is the ending.
    - Queued notes are cancelled.
    - Notes already sounding ring out into the 3 s tableau (at most 1.6 s, the string's length). This tail is intentional.
    - Nothing more is scheduled.
  - **`close()`** stops every voice and closes the context for good. A late `start()` can't reopen it.
  - **Voice tracking.** Every source is kept with its start time and removed `onended`. `voices` exposes the count.
- **`game/games/studio/game.js`**, mirror studio only:
  - It imports the module and passes `BEAT`.
  - It doesn't schedule in the frame that reaches the ending.
  - `endMirror()` calls `release()`.
  - A `visibilitychange` listener calls `suspend()`/`resync()` and is removed on teardown.
  - `pointercancel` gets its own handler, which abandons the hold; only `pointerup` can launch the KNOCK.
  - `__mirror()` also reports `hold` and `voices`, for tests.
- **Act one is unchanged.** Its `pointercancel` already just ends the gesture, which is correct.

## Findings

| # | Audit finding | Reproduced? | Fix | Regression |
|---|---|---|---|---|
| 1 | A suspended context piles up voices; no `resume()` | Yes: 35 voices inside 147.8 ms, 0 resume calls (unchanged code, Node VM) | Schedule only while running; `start()` resumes; re-anchor on recovery | `tests/studio-waltz.test.mjs`, tests 1–3 |
| 2 | Hidden page: a queued beat sounds while hidden, then its visual beat gets none | Yes: beat two queued at audio 0.09767; back at T = 0.65, no note for T = 0.6977 | `visibilitychange` → `suspend()`/`resync()`; the cursor re-anchors | test 4 (the audit's exact case), test 5 (fade) |
| 3 | End and mute can't stop voices; one schedule after the ending | Yes, by reading: `play()` kept no handles; the frame scheduled after `step()` ended | Voice tracking; `release()` at the ending; `close()` stops all; no schedule once `ending` | tests 6, 8 |
| 4 | Decode and codec duties | Not applicable yet: no assets are loaded | Deferred to `score.js` integration (see below) | none |
| 5 | `pointercancel` can launch a charged KNOCK | Yes: the self-test fails on the old binding (`knock=hushed` after a cancel) | Separate `onCancel` abandons the hold | `game/games/studio/selftest.html` |

## How to run the checks

```bash
node --test tests/*.test.mjs
```

**The Node tests: 10 of 10 pass.**
- The AudioContext double has a hand-set clock and state.
- Besides the findings above, they check the beat-three accent gains, sound-off, and a dropped tap while suspended.

**The browser self-test:** serve `game/` and open http://localhost:8300/games/studio/selftest.html.
- It drives the mirror studio on a manual clock with synthetic pointers, so no audio starts.
- It charges a hold in the turn and cancels it on beat three: no KNOCK.
- Then it charges again and releases on beat three: KNOCK.
- It prints PASS/FAIL and sets `window.__selftest`.
- **Result:** PASS on the fix, and FAIL with `pointercancel` temporarily rebound to `onUp`. That rebinding was reverted.

**The live check** (Chromium browser pane, the harness at `?mode=burial&fixture=1`, speed 1):
- A real click on a board started the waltz (1–4 voices).
- A simulated hidden page dropped it to 0 voices within 250 ms.
- On return it resumed (3, then 6 voices) on the game clock. `T` didn't jump while hidden.
- The console stayed clean.
- The full entry, `/?chapter=studio&through=studio`, loads clean and resolves `waltz.js`.

## Not done, and why

- **Mute.** There is no mute yet. Its default and placement wait on Lukas's call 5. When it comes, it goes in `score.js` and cuts voices the same way `suspend()` does (the mechanism exists).
- **Decode, codec, late assets, and leaving during loading.** These belong to `score.js` when the first reviewed delivery arrives. The studio's only async work today is the ghost fetch, which already ignores a late completion after teardown (`dead`).
- **Resume without a tap.** Returning to the page doesn't call `resume()`, per the audit's contract that unlocking is a trusted-input operation. If a browser suspended the context while hidden, the next board tap resumes it.
- **Listening.** I haven't listened on a phone speaker, on headphones, or in Safari or iOS. Nobody has heard the beat-three agreement at speed 1 by ear. Those are acceptance checks 2–3 in the audit and belong to the in-game listening review.
- **Keyboard.** There is no keyboard sound control; it arrives with the mute.

## For integration readiness

The lifecycle in `waltz.js` is the contract `score.js` should keep: `start`, `schedule`, `tap`, `suspend`, `resync`, `release`, `close`, mapped to the audit's `unlock`, `update`, `cue`, `suspend`, `resync` and `dispose`. When a scoped delivery arrives, `score.js` takes this shape and adds:
- decoded-file onsets,
- a bounded synth fallback,
- an epoch per chapter run,
- the mute.

Then the studio swaps `makeWaltz` for `api.score`.
