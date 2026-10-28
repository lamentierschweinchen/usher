# Audio: coordination handoff (2026-10-27)

From the Usher coordinator to the composer/sound designer's coordinator. Lukas makes the calls; this note carries none.

## 1. What's playable

**Milestone 1: the studio, both ways.** Commit `783e6e6` on `main`, served from `game/` on port 8300:

- **The full loop:** http://localhost:8300/?chapter=studio&through=studio
  - Act one: the studio. Hush Roderick's torments while your hand is recorded.
  - Then the Account, and **Nevertheless.** turns the stage.
  - Act two: the mirror studio. As Madeline, you tap from under the floor against your recorded hand.
  - Her red rewrite. About 10–12 min.
- **The harness** (one game, no spine):
  - http://localhost:8300/games/studio/?mode=sojourn records act one.
  - http://localhost:8300/games/studio/?mode=burial&fixture=1 plays act two against the fixture ghost.
  - Test audio at `speed=1` only. 2×/4×/8× are a dev aid and will sound wrong.

If nothing answers on 8300: `cd game && python3 -m http.server 8300 --bind 127.0.0.1` (loopback only; see `LOOPBACK-RECEIPT.md`). ES modules won't load from file://.

**Today's sound.** Only the mirror studio (act two) makes any. Everything is local to the studio: `makeWaltz()` in `game/games/studio/waltz.js` (its lifecycle and tests: `LIFECYCLE-REVIEW.md`):
- **A synthesised Karplus–Strong waltz:**
  - A 4-bar loop: C | G7 | G7 | C.
  - Bass on beat one; chords on beats two and three, with three louder (0.34 vs 0.2).
- **A filtered noise "wood" click** for her tap.

How it behaves:
- It starts on her first real (trusted) pointerdown and closes with the game.
- Master gain is 0.22. There is no global mute yet.
- Act one, the map, the Account and the other six chapters are silent.

The spine never sets `api.sound`. The game treats anything but `false` as on.

## 2. Who owns what

| Area | Owner | Composer's side |
|---|---|---|
| `game/**` (engine, games, shared, harnesses) | Usher coordinator and its builders | Read and test only; no edits |
| `STATE.md`, `DECISIONS.md` | Usher coordinator | Don't touch |
| `work/fullgame/BIBLE.md`, `work/design/**` | Usher coordinator (design record) | Propose changes in your handoff, not as edits |
| `work/audio/**` | **Composer** | Yours: notes, cue sheets, proposals, deliveries |
| Logic Pro projects, WAV masters | Composer, **outside this repo** | Keep local; the repo is public |
| Shared audio module (`game/engine/score.js`, planned) | Usher coordinator integrates | You propose its API (§5); we write it |
| Default on/off, autoplay, mute default | **Lukas** (open call 5) | Not yours or ours |

Commits and pushes to `main` are mine. Builders and composers don't commit.

## 3. The studio's beat contract (exact)

Defined at `game/games/studio/game.js` ~line 1002:

```js
const BEAT = 60 / 86, BAR = 3 * BEAT, WINDOW = 0.2;   // 86 bpm in 3/4; beat three ±0.2 s
const onBeat3 = t => { const k = Math.round((t - 2 * BEAT) / BAR); return Math.abs(t - (2 * BEAT + k * BAR)) <= WINDOW; };
```

**The clock**
- `T` is the **game clock** in seconds. It is 0 when the ghost is ready, and beat 0 falls at `T = 0`.
- A beat is 0.6977 s and a bar 2.093 s.
- Beat three is `n % 3 === 2`, so it falls at `T = 2·BEAT + k·BAR`.

**Heard**
- Her tap is **heard** if it lands within ±0.2 s of beat three and no hand hushes it.
- Off the beat it's *the house settling*.
- Her KNOCK means holding a board for a bar and releasing on beat three.

**The game clock is not the audio clock.**
- Each frame advances `T` by at most 0.05 s, so a dropped frame or a background tab makes `T` lag real time.
- `T` also stops during the 3 s end tableau.
- So music can't free-run. It has to be scheduled from `T`. The current code looks 0.12 s ahead each frame and sets `when = ctx.currentTime + (nextN·BEAT − T) / speed`.
- Anything you deliver must be triggerable on the beat or the bar from the game clock, not played as one long file.

**What the eye sees on the beat**
- Roderick's arm and the boards pulse every beat.
- They're brightest on beat three (amplitude 1 vs 0.42), decaying over about 0.22 s.
- Under reduced motion, it's a still lamp change.
- The music has to agree with the pulse: **beat three must be audibly the target.**

**Timeline (the escalation)**
- Learn: 0:00–0:45.
- Complicate: 0:45–1:50. The pale lady crosses above at about 1:15.
- The third heard tap **breaks the recording** (variable time): the hand stalls two bars, then trails.
- The turn (her KNOCK window): 1:50–2:20.
- The tableau, then done.
- Constants: `LEARN_END = 45`, `TURN_AT = 110`, `TURN_END = 140`, `TABLEAU = 3`.

## 4. Fixed rules for all audio

- **Sound is never load-bearing.** The game must play fully muted, and every cue must also show on screen. Nothing the player needs may be sound-only, since the bible's fairness rule says a tell is never sound-only.
- **Nothing before a real user gesture.** Whether it starts on, off, or on after the first tap is Lukas's call 5. Build so either default works.
- **Same-origin static files only.** No network, CDN or streaming, and no frameworks. Phones may be on silent, so assume some players hear nothing.
- **Original material only.**
  - Reissiger's waltz (the "last waltz of von Weber", 1822) is public domain as a tune, so you may quote or allude to it. Modern editions, arrangements and recordings are not.
  - If any Apple Loops or third-party samples are inside a stem, list them with their licence in the cue sheet. Never ship one isolated.
- **Small.** Keep the studio's audio to about 3–4 MB in total. The whole game is a few hundred KB of code today.
- **What the bible already says** (§9, design notes, not plot calls; propose changes freely):
  - Roderick's guitar follows his lines' contour; comfort tunes it, excuses muffle it to a *plink*.
  - The waltz is the map theme.
  - Below the floor it "plays inverted and backwards".
  - The tarn plays a bar early.
  - Silence in the nights and before every tap.

## 5. Where deliveries go, and the API we propose

**Deliver to** `work/audio/handoff/<YYYY-MM-DD>-<short-name>/` with:
- a `README.md` cue sheet: each file, what it's for, its bpm and bar length, the offset of its first transient in ms, loop points, licence notes;
- web encodes, `.m4a` (AAC) preferred. Keep WAV masters local.

We integrate into `game/audio/` and test there. A Logic bounce has leading silence and an AAC encode adds priming samples, so state the offset and we compensate.

**For the waltz, we recommend a sampled instrument plus a score:**
- **The instrument:** a set of short guitar one-shots, one per pitch you use, plus muffled variants.
- **The score:** a note list (`{bar, beat, pitch, vel}` JSON, or MIDI we convert) for the upright waltz and its below-floor counterpart.
- **Why:** it stays locked to the game clock, and "inverted and backwards", muffling, tuning and the tarn's early bar become transformations in code.
- **The alternative:** per-bar bounces cut at bar starts, at exactly 86 bpm, with tails. Say which you prefer.

**Tactile cues.** These are named one-shots. Games fire the name and never the file:

| Where | Cue names (proposed) |
|---|---|
| Mirror studio (act two) | `tap` (her knuckle on a board), `heard` (his head dips), `settle` (off-beat: the house settling), `hush` (your recorded hand thumbprints her tap), `still` (she's stilled one bar), `break` (the recording tears), `knock.charge` (holding a bar), `knock.rise`, `knock.hushed`, `slam` (your old knock-hush comes down), `tableau` |
| Studio (act one) | `hush.sun`, `hush.rose`, `hush.band`, `hush.tap` (the four torments), `reach`, `spare`, `knock`, `gesture.drape`, `gesture.snip`, `gesture.hold` |

**A sketch of the shared module** (`game/engine/score.js`), passed to games as `api.score`. It's a proposal for you to counter:
- `score.beat(T, speed)`: called each frame. It schedules the current theme from the game clock.
- `score.theme(name, {layer})`: `'waltz'`, `'waltz.below'`, and so on.
- `score.set(param, value)`: for `muffle`, `tune` and similar.
- `score.cue(name, {gain})`
- `score.muted` / `score.mute(bool)`
- A manifest, `game/audio/manifest.json`, maps cue and theme names to files. You'd own its contents through your handoff.
- If an asset fails to load, the current synth stays as the fallback.

## 6. Active edits to avoid

- **Right now:** none. The tree is clean at `783e6e6` and no builder is running.
- **Next** (after Lukas rules on the bible's calls), M2 rewrites `game/engine/*`, `game/games/tarn/*`, `game/shared/*` and `game/style.css`.
- I'll touch `game/games/studio/game.js` only to wire in your audio. Keep your edits out of `game/` entirely and nothing collides.
- If you need a harness change to test (a mute toggle, a click track, a cue tester), ask in your handoff README and we'll add it.

## 7. Open with Lukas (not decided by either of us)

- **Call 5:** music on after the first tap, with a visible mute (the recommendation; not yet ruled).
- **The visible mute:** where it sits and what it looks like is a spine and design question we'll bring him with the first audible build.
- **Website sound:** separate, per your note, with audible options before a default.
