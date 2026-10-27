# Tarn: build report

**Built:** `game/games/tarn/game.js` (contract module, SVG 960×640, waterline 340) and `index.html` (harness with Restart, a reduced-motion toggle or `?rm=1`, and a flag/`done` log). The full spec runs: five finds, one cheat 700 ms after find 4 (smoke, else the earliest non-crack find), the catch with a double circle and 4 px flinch, the 10 s idle drip hint, and the red window in the water (tap it to cross it out, or it goes dark at 5 s). `done` follows 1.2 s after the light goes out.

**Play:** `cd game && python3 -m http.server 8110`, open `/games/tarn/`.

**Emits:** `tarnCaught` ('unaided'|'hinted'), `tarnSawHer`, `tarnGlancesDown`; `done({won:true, score:{"differences found":5,"glances down":n}, note:"Five of five. The house thanks you."})`. Fires once. No `rather` (none before either).

**Known:** a tap on the window above also counts as seeing her.

## Recut: Shadow Theatre (2026-10-26)

The look changed; the game didn't. Mechanics, timings, flags, score labels, `done`, the waterline (340) and the mirror (y' = 680 − y) are as they were. The state machine is untouched, apart from where marks are drawn. Screenshot: `work/build/shots/tarn.png` (1280 wide: five found, the cheat caught, the eye open red in the water).

**From the library (`../../shared/cuts.js`, `shadow.css`):** `C.house({mode:'facade', crack:0})` (no hairline above: "the crack is only in the water"), its eye-like windows and arch door; `C.tree` (white trunk, seed 44) standing above and uprooted below; `C.sedges`, `C.shore`; `C.backdrop('tarn')` and `C.glass('tarn')`; `C.returned(…, {still:true, transform: the game's mirror})` with `C.truthFissure()` as the truth; Madeline (`faint:false`, `.touch`); `C.defs()` once and `C.frame()` last; `C.autoLace()` at mount; `.sh-still` with reduced motion. The house stands at `translate(20 −28)`: map x positions, nudged right so the teaching line clears the left spire, with its base on this game's waterline.

**Cut here, in the same manner:** the chimney and its smoke (black curls rising and fading; held still under reduced motion); the shuttered window over the eye at (608,186), with louvres as light through slits, shut above and folded open in the water; the arch door at 40×62 (the library's door, larger so it reads on a phone), plus its open state; the opened red eye.

**Marks (after the art critique):** nothing is stroked. A find is an unstroked lamp halo glowing behind its cut, in both halves. Tree and smoke glow in the sky behind the whole cut; door, shutters, crack and window glow behind the detail on the façade, so the crack's halo is a column of light up the shut front. In the water the halo sits inside the returned house and burns amber, because a pale halo vanishes on the pale reflection. The cheat shrinks the halo out; the catch brings back two, one wider; tapping her lights hers only halfway. The house's cross is two tapered black paper strips with a lamp rim (`sh-rim`). Misses are pinpricks of light that fade. The hint's drip is a tapered ribbon of lamplight. The shutter louvres are filled slits. The HUD rings are holes: dim when empty, lamp-bright when found, an ember smear when taken back, and a lilac sixth crossed with black paper.

**Decisions and departures (all about look or legibility):**
- **Red only for the truth:** the fissure and the red window. The spec's red circles and "red smear" are now lamp circles and an ember smear (LOOK §9: never UI).
- **The red window** is the eye-like window at (350,186). In the water it opens wider (45×72) and lights red, so she reads as a profile (Madeline's own cut, bust, crisp, no blur) and not as a blob. Above it stays as it was.
- **Hits:** the spec's circles are all kept. Helpers were added where the cuts reach further (fissure, standing crown, fallen crown, the shutters' and door's centres, the eye). The window test went from one circle to any of two. Nothing shrank.
- **Depth:** the library's `#sh-depth` mask starts at y 368 and fades to .08. The game uses its own `#g-tarn-depth` (340, .92 → .44), swapped into `returned()`'s output, so the cold chimney at the bottom of the glass still reads.
- `--lit-door` is darkened in the tarn (it isn't one of `returned()`'s variables), so the door is a true negative.
- The cheated, re-cut detail gets `sh-rim-soft` (fresh paper catching the light) in place of thicker ink; the hint's drip is lamplight running from it.
- **Experience-critique fixes:**
  - **The cheated dot visibly empties.** The moment the house takes a find back, its hole drops at once to darker than empty, and an ember streak is wiped out under it, with no lit disc left. The spoken count ("3 of five", in the live region) matches the lit dots at every moment: it updates at once when a dot empties, and as a filling dot lands.
  - **Door taps no longer go to the crack.** My crack helper circle reached into the door's arch top, and the crack's tall halo glowed over the door, so a real door find looked like nothing happened. The helper is trimmed (504,196 r44; the spec's own circles are unchanged), and the crack's halo now sits above the door. Measured in the game: 24 of 24 door taps register as the door (six points, both halves, before and after the crack is found), and the fissure above the door still finds the crack.
- **Phones (stage under 600 px):** game type is ×1.5 (teaching line `max(18px, 3.9cqw)`), wrapped to two lines top left; the rings move to the top right, clear of the spire and the tree; the fissure thickens. The game writes no numbers on screen, so the *none*-for-zero rule has nothing to change here; `score` values stay numeric for the spine.

**Checked** (again after the critique pass, with identical results): served `game/` on 8110 and played start to finish in headless Chrome. At 1280 (mouse): unaided, sawHer true, 4 glances. At 390×844 (touch, DPR 2): hinted after the 10 s drip. At 1280 with reduced motion: left her, so sawHer false, 3 glances. Each run: one `done`, flags as above, no console errors.

**For the art critic:** the bust in the eye is small on a phone (the eye is about 17×27 px). It reads as a pale someone in a red window, not as a face, and with no faces in this look that is the intent. The left bank's reflection is a broad pale block, the same as on the map.
