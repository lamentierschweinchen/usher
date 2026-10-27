# Burial: build report

**Built:** `game/games/burial/game.js` (contract module, SVG 960×640) and `index.html` (harness: Restart, reduced-motion toggle or `?rm=1`, flag/`done` log). The full spec runs: footsteps three beats behind, a physician who hunts by ear, catches, the copper hurry and lift, *two* struck in red, the lid, four screws (the last takes 720°), the red sliver, Roderick at the door, one *pat.* behind it. The rules are pure exported functions (`beat`, `simulate`). Both spec routes pass; straight routes and hiding get caught.

**Play:** `cd game && python3 -m http.server 8113`, open `/games/burial/`.

**Emits:** `burialScrewOut`, `burialGlimpses`; `done({won:true, score:{bearers:2, "screws turned":3|4, "the physician's glimpses":n}, note})`, once.

## Recut in Shadow Theatre (2026-10-26)

The look changed; the game didn't. Rules, words, timings, node positions, hit areas, flags, score labels and `done` are untouched. Lines 9–165 of `game.js` are byte-identical to the ink build, and `simulate` gives identical logs on the spec routes.

- **The stair** is one sheet of black paper (`--sh-cut`) with the corridors, stairwells and vault cut out of it onto the chapter's cold copper light (`C.backdrop('burial')`), lit warmer at the door you came down by. Lace sits only where paper meets light: fringe on the ceilings, scallops on the floors, crockets on the copper archway's spandrels. The stair flights, gallery portraits (empty frames as cut thread) and hatchments are cut in this folder in the library's manner.
- **The cast is the library's.** The guest and Roderick carry a `C.coffin` between them, and the physician holds `{lamp:true}`. The bearers turn edge-on with the way they walk (my wrapper, never the figure's `<g>`), and Roderick's arm is hinged back to the handle (`C.hinge`). The vault's door is `C.door('iron')`, the way down is `C.door('arch')`, and the lid scene has the library's lying Madeline and Roderick.
- **Madeline is the only pale cut.** Her footsteps (you, three beats ago) and the third pair of feet under the coffin are bare feet cut in gauze. In the glass band they print as returned light (`--sh-return`).
- **Red, one truth per screen:** *two* struck through on the stair; her blush and the lid's sliver at the lid. The footprints and the last *pat.* are returned light (art critique). The lid's lace holes are set in past the sliver band, so a flush lid shows no red.
- **The rule, taught before the first catch** (experience critique): the first *pat.* always lands on beat 3, and the earliest catch is beat 6. On that first *pat.* the physician turns and raises his lamp toward the echo, not toward you. The gauze footsteps catch his lamp's rim, and one line plays: *He listens for the steps behind you.* It's a puppet gesture only: his lit rooms, route and the rules are unchanged (`LINES.ear` is the only new word). The hints after a catch remain.
- **The physician's lamp** is light behind the paper: a cone and a pool at each node he lights, a flare when he catches you, and a line of black cut dots to where he's going.
- **Touchable things:** neighbouring places show a lit slot in the floor (light through a cut) that pulses, and brightens on hover or focus. The coffin (tap to wait), the screws and Roderick take the shared `.touch` rim (always faint on phones), with `aria-disabled` when inactive. The lid is held with `.is-held`. Legibility fix: a black lid over a black coffin was invisible, so while it's off it keeps a soft lamp rim even at rest.
- **Type:** the teaching line is italic paper on the black roof. Dialogue is paper on a black ribbon with lamp hairlines and the speaker in rose caps. The score is lamp caps, bottom right. Sound-words are black cut type on light; on the black lid they are cut out of it as lamplight (*creak.*). *GRATE.*, *thud.* and *tk.* sit on the light above the lid's edge. The end *pat.* is red on the shut iron door. *leave* sits above the door arch so it clears the score on phones. A zero score is written *none* (an old-style 0 reads as a letter).
- **Phones (stage under 600 px):** all game type is ×1.5, including sound-words. The dialogue ribbon spans the stage, at the top, or over the glass while the bearers are upstairs or at the lid, so it never covers them. On the top landings the teaching line waits over the glass, because there it would hide their heads.
- **Glass band** (y 560–608): `C.glass('burial')` with the bearers and physician returned as light (`returned(…, {still:true})`), and the red prints on it.
- **Iris:** `C.irisD`, with the same 0.7 s close and 0.9 s open and no bleed. Reduced motion keeps the ~250 ms fade through black; the root takes `.sh-still`.
- **Harness:** links `../../shared/shadow.css`, on a dark ground. The old ink frame overlay is gone because the game draws `C.frame()` last.

**Cast size:** scaled 1.3× after the art critique: the bearers are about 90 units tall (the physician 70), with rooms raised to 98 high, the left stair and galleries widened to x 84 so the pair stands whole at A3, R1 and R7, and the teaching line moved up onto the roof. That is as tall as the node grid allows, since floors are 115–150 apart and the top landing sits under the teaching line, so it's just under LOOK's 96. Doorway Roderick is 4.2×. Hit areas are unchanged (nodes r 55, screws r 62).

**Checked:** served `game/` on :8113 and played the harness start to finish with real mouse and touch input in headless Chrome. At 1280 I played both endings: caught once then the door, and four screws. At 390 wide (touch emulation) I played the door and four-screw endings, the latter with reduced motion. There were no console messages, `done` fired once each time with the flags set, and the rule simulation matches the ink build. Screenshot of the key moment (the lift in the copper archway: gauze feet under the coffin, *two* struck): `work/build/shots/burial.png`.

**Known:** the hints after each catch remain. Not committed (per brief).
