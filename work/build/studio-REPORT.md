# Studio · Hush — build report

**Built:** `game/games/studio/game.js` (contract module), `index.html` (harness) and `ghost.json` (act two's fixture). The spec's whole scripted timeline: intro with a mimed hand, rush with taps, lady crossing (1:15–1:23), crescendo, KNOCK at 2:15, then a 3s tableau. Since 2026-10-27 it plays both ways (`api.mode`), for Milestone 1 (`work/fullgame/MILESTONE-1.md` §3).

## Milestone 1: the studio, both ways (2026-10-27)

**Act one records** (`api.mode` `'sojourn'` or absent). Play is unchanged: the engine was lifted whole into `core()`, and the eight-run equivalence below still matches the original. It calls `api.record(type, data)` with the game's clock as `t`:
- `ptr` `{t, x, y, down}`: every 100 ms of game time, once the pointer has been seen.
- `gesture` `{t0, t1, kind}`: `drape`, `snip` or `hold`, failed strokes included.
- `hush` `{t, pest, board, react, site}`: `react` is the time from the pest's appearance; via-knock hushes add `via:'knock'`.
- `reach` `{t, pest, site}`, `spare` `{t, board}`, and `knock` `{t, result: 'hushed'|'spared', react}`.
- **Deviation:** the pest's type is recorded as `pest`, not `type` as the table has it. The spine stores `{type, t, ...data}`, so a `type` field overwrites the event's own name, and a spine counting `type === 'hush'` would find none. Act two also reads the clobbered shape and the spine's `event` field.

**Act two: the mirror studio** (`api.mode === 'burial'`).
- **The stage:** the vault from below is black paper in copper light (light leaks through the board seams), with pillars and ribs, her coffin with its lid ajar, the copper-sheathed door and a cobweb fringe. Madeline is in gauze, gliding under the board she last knocked. The eight `BOARD_CX` boards form the ceiling at y 200–240. Above them, act one's studio replays as `returned()` light: its own engine, run in replay mode on act one's timings.
  - The replay applies the recorded hushes by site. Your tap hushes become the old freezes and sighs. Act one's knock ends the replay as it ended act one.
  - The lady crosses above at 1:15, bright.
- **The hand:** the `HAND` cut, flipped and in light, on your recorded path, with its next second dotted ahead.
  - It is busy inside a recorded gesture; otherwise free, with a faint ring of dots.
  - A free hand within 240 darts to her tap after your median act-one tap reaction (clamped 0.35–1.2 s; ×1.3 while she learns, capped at 1.15 s), thumbprints it, then rejoins its path.
  - Your recorded tap hushes also press their boards on their old timings.
  - A hush stills her for one bar (she dims). If act one hushed no taps, it never darts: *You never heard a thing.*
- **The beat:** Roderick's waltz is 86 bpm in 3/4. His arm strums and the board seams and light shafts pulse, brightest on beat three. Reduced motion holds a still lamp level per beat, and the arm doesn't move.
- **Her taps:** a red *tap.* lives 1.2 s.
  - **Heard** (unhushed, pressed within ±0.2 s of beat three): a red tick on the board, and Roderick's head dips a notch (2.5° each, up to 3).
  - **Explained** (off the beat): *the house settling.*, in black italic under the board.
- **The break:** the third heard tap breaks the recording. Roderick lifts his face, the dots scatter and fade, and the hand stalls for two bars, then trails 0.5 s behind its path.
- **The turn (1:50–2:20):**
  - Hold a board for a bar, and a ring of lamp dots fills; let go on beat three and her KNOCK rises for 3 s toward his face, in a black cut plaque.
  - A free hand within 360 darts at it. If act one hushed its knock, the hand slams down at that recorded time (radius 480), and a ring of large dots warns her in the second before.
  - Off-beat releases are only *the house settling.*
- **The lines,** in order: *Someone did it for you.* (fixture only), then *Knock on the third beat.*, then *That's your hand. Wait till it's busy.*, then *He heard.*
  - The turn adds *Hold a board a whole bar. Let go on three.*, so the rule is shown before it bites.
- **HUD:** `HEARD ○○○`, filling as he hears.
- **The end:** a 3-second tableau after the KNOCK resolves, or at 2:20 if she never knocks. Then:
  - `setFlag('mirrorStudio', {heard, hushed, broke, knock})` (knock is `'heard'`, `'hushed'` or `'none'`).
  - `api.rewrite('taps hushed', …)` with the table's three lines. n is `api.state.tapsHushed`, else the ghost's count; a count of 1 is written "once".
  - `done({won: heard >= 3 || knock === 'heard', score: {'taps heard': heard}})`.
- **Sound** (optional, local to the game, never load-bearing): a Karplus–Strong waltz on C–G7–G7–C, with wooden taps. It starts only on a real tap, so there's no autoplay warning, and closes with the game. `api.sound === false` turns it off.
- **Deviation, one switch:** the spec maps the studio's y 0–452 to 200–0, upside down. I kept it upright (`MIRROR_FLIP = false`, y 0–452 → 0–200) so act one's floor lies on her ceiling. Your recorded presses then land on the boards she knocks; flipped, they would sit at the top of the screen, away from her. Setting `MIRROR_FLIP = true` gives the spec's mapping.

**The ghost:** act two uses `api.ghost` when it has 10+ hushes. Otherwise it loads `ghost.json` itself (the spine's `GHOSTS` registry is still empty) and says *Someone did it for you.* once.

**`ghost.json`** is a real-time act-one run recorded through this harness (`?mode=sojourn`): trusted mouse input at a human pace, with reactions of 0.45–0.85 s, eased hand paths, a pause while the lady crosses and a ~14% chance of missing a tap. A scripted player drove it, because I can't play by hand. It has 1,560 events: 88 hushes, the knock hushed at 136.7 s, 78 gestures and 34 busy seconds. Its tap reactions are slow (median 2.0 s, clamped to 1.2), because the hand was often busy when a tap appeared. Lukas can replace it by playing the harness and pressing **Save ghost.json**.

**The harness:** an act switch (one records into a stub, saved to localStorage; two plays against that record), *act two plays the fixture*, reduced motion, speed, and *Save ghost.json*. URL options: `?mode=burial`, `&fixture=1`, `&drive=1` (manual clock for tests).

**Verified (2026-10-27):**
- **Act one:** eight bot playthroughs (all-hush, spare-then-idle, idle, mixed, each with and without reduced motion) match the original ink build plus the band lift. The record is well-formed.
- **Act two, in the harness at 1280 and 844×390, against a recorded run and the fixture:**
  - Heard taps, the break, a KNOCK heard and a KNOCK hushed by the hand.
  - An idle Madeline gets *she knocked, and you hushed her twice.*, `won: false`, knock `none`.
  - Reduced motion plays through.
- **In the spine:** act two mounts from a seeded `usher.save.v1` (act `burial` with a studio record) at 1280 and 844×390, with `synthetic: false`.
- **Console:** clean everywhere.
- **Shot:** `work/build/shots/studio-mirror.png`, at 1280: the rush, with your free hand and its dotted path, a sunbeam on Roderick, a red *tap.* on a far board, heard ticks and Madeline.

**Known (act two):**
- A player who hits beat three perfectly racks up heard taps quickly; ticks cap at ten per board.
- The studio above is squashed to 44% height, as a reflection; band words up there are flattened but legible.
- `root.__mirror()` exposes read-only state for tests.

**Recut into Shadow Theatre (2026-10-26), with the art critique's fixes.** The look changed; the game didn't. The timeline, timings, score values, gesture rules, flags, labels and `api.done` payload are unchanged. The one moved hit box is the band's: the word is drawn 60 units higher, and its touch box (its own box plus 22, as before) moves with it. Eight bot playthroughs (all-hush, spare-then-idle, idle, mixed; each with and without reduced motion) give identical results, flags and `done` on the recut and on the original ink build (commit be10c49) with only the three band-lift lines applied. Before the lift was added, they also matched the unmodified original. Side effect of the lift: the band word now starts just above the boards rather than over them, so it no longer hides taps at the start, and a press on the band no longer catches a hidden tap (the spec's "hunt the red, even under the band's letters" is weaker now).
- **Light:** `C.backdrop('studio')` ember, with a lamp glow and `sh-flicker`. A black valance with lace scallops and tassels, the library's draperies at both sides, `sh-grain` over the whole stage. `C.frame()` is drawn last.
- **Cuts from the library:** Roderick has three poses, all from `C.figure('roderick')`: calm is `sit` (head on FACE), startled is the standing figure with its arm hinged up 30°, and hidden is `recline` with the arm across his eyes (when the lady crosses, and in the spared ending). The lady is `madeline`, flipped, in gauze; she glides and never bobs, moved with `C.place`. Also from the library: the windows (`C.lancet`), the sofa, the door leaf (`C.door('arch')`) and the coffin.
- **Props cut in the same manner** (in `game.js`): pedestal urns with curl handles; roses (a tapered stem, hooked thorns, black leaves with lit veins, a lace-edged bloom with a spiral of light); curtains inside the lancets with a lace leading edge; the door frame; the crack as a tapered black cut down the lit wall, revealed one segment at a time; a pointing hand with a lace cuff.
- **Floor and vault:** black boards with copper seams and a lamp hairline. Thumbprints are copper whorls catching the lamp. Below the boards is glass (`C.glass('studio')`), with the vault arch and coffin coming back through it as light via `C.returned(…, {still:true})`.
- **Red, only for the truth:** the *tap.*, the ledger's ticks for taps let be, and the **KNOCK.**. The KNOCK is red light through letter holes in a black cut plaque, so it reads over the ember wall. The plaque has no glow at rest; it gains a lamp rim only as a touch state.
- **Touchable:** each live pest carries the library's `.touch`: the window (for a sunbeam), the rose, band words, taps and the knock. The game's own `pick()` decides which pest gets `.is-hot` on hover, so the rim always marks the pest a press would take. `.is-held` is set while dragging a curtain or holding the band. Phones get the faint rim at rest. Rims come off when a pest dies and at the end.
- **Type:** sound-words and band words are plain black cut type with no glow of their own. Band words take only the library's touch states: nothing at rest on desktop, a lamp rim on hover, and the faint rim on phones. The band is drawn 60 units above its path, clear of Roderick's profile. When the stage is under 600px wide, game type is ×1.5: teach 39, score 25.5, tap 33, words 33. Hit areas don't use these sizes. The mime hand and trail keep a lamp edge so they read over the lit lancets. The mime trail and band ring are rows of dots, with no arrows.
- **HUD:** lamp caps, bottom right, on the glass, `TAPS HUSHED n · ×m · score` as on the board. A zero is written NONE, because IM Fell's old-style zero reads as a letter.
- **Reduced motion:** `.sh-still` on the root, SVG animations paused, and the original's RM paths unchanged (no ripple or jitter; the lady fades between three places). The freeze becomes a dimming of the lamp.

**Play:** serve `game/` (`python3 -m http.server 8112`), open `/games/studio/`. The harness links `shared/shadow.css` and has restart, reduced-motion and speed controls. `?drive=1` adds a manual clock (`__advance(s)`) for automated tests. In the spine: `/index.html?chapter=studio&games=studio`.

**Emits (unchanged):** flags `tapsHushed`, `tapsSpared`, `knockSpared`. Labels `sunbeams drawn`, `roses nipped`, `trumpets muffled`, `taps hushed`, `taps let be` (the knock counts as a tap). `won` = crack < 6.

**Verified:** harness at 1280 (mouse) and 390 (touch, DPR 3), both endings, reduced motion on and off: no console errors and `done` fires once. A real-time (rAF) load ran without errors. The game mounted inside the spine at 1280 and 390 without errors. Screenshot: `work/build/shots/studio.png` (1280 viewport, the rush with three beams, a rose, the band and a red tap).

**For the lead artist / spine:** inside the spine, `returned()`'s shared mask `url(#sh-depth)` resolves to the 0×0 `#sh-defs` `<svg>`, and the masked content vanished; on the map the reflection looks unmasked (very bright). The studio works around this by re-pointing its own `returned()` output to a mask in its own `<svg>`. Other mini-games that use `returned()` will likely hit the same thing.

**Known:** strokes from bare paper also snip (as before). The mime hand fades in and out each cycle, so it looks ghostly for a moment.
