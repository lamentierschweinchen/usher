# Studio · Hush — build report

**Built:** `game/games/studio/game.js` (contract module) and `index.html` (harness). The spec's whole scripted timeline: intro with a mimed hand, rush with taps, lady crossing (1:15–1:23), crescendo, KNOCK at 2:15, then a 3s tableau.

**Recut into Shadow Theatre (2026-10-26).** The look changed; the game didn't. The timeline, every hit area, timing, score value, flag, label and `api.done` payload are unchanged. Eight bot playthroughs (all-hush, spare-then-idle, idle, mixed; each with and without reduced motion) give identical results, flags and `done` on git HEAD and on the recut.
- **Light:** `C.backdrop('studio')` ember, with a lamp glow and `sh-flicker`. A black valance with lace scallops and tassels, the library's draperies at both sides, `sh-grain` over the whole stage. `C.frame()` is drawn last.
- **Cuts from the library:** Roderick has three poses, all from `C.figure('roderick')`: calm is `sit` (head on FACE), startled is the standing figure with its arm hinged up 30°, and hidden is `recline` with the arm across his eyes (when the lady crosses, and in the spared ending). The lady is `madeline`, flipped, in gauze; she glides and never bobs, moved with `C.place`. Also from the library: the windows (`C.lancet`), the sofa, the door leaf (`C.door('arch')`) and the coffin.
- **Props cut in the same manner** (in `game.js`): pedestal urns with curl handles; roses (a tapered stem, hooked thorns, black leaves with lit veins, a lace-edged bloom with a spiral of light); curtains inside the lancets with a lace leading edge; the door frame; the crack as a tapered black cut down the lit wall, revealed one segment at a time; a pointing hand with a lace cuff.
- **Floor and vault:** black boards with copper seams and a lamp hairline. Thumbprints are copper whorls catching the lamp. Below the boards is glass (`C.glass('studio')`), with the vault arch and coffin coming back through it as light via `C.returned(…, {still:true})`.
- **Red, only for the truth:** the *tap.*, the ledger's ticks for taps let be, and the **KNOCK.**. The KNOCK is red light through letter holes in a black cut plaque, so it reads over the ember wall.
- **Touchable:** each live pest carries the library's `.touch`: the window (for a sunbeam), the rose, band words, taps and the knock. The game's own `pick()` decides which pest gets `.is-hot` on hover, so the rim always marks the pest a press would take. `.is-held` is set while dragging a curtain or holding the band. Phones get the faint rim at rest. Rims come off when a pest dies and at the end.
- **Legibility:** sound-words, band words and the hand are black cut type with a lamp edge, so they read where they cross the black floor and furniture. When the stage is under 640px wide, teach, score, tap and sound-word type grows: teach 34 (from 26), score 28 (from 17), tap 28, words 30. Hit areas don't use these sizes. The mime trail and band ring are rows of dots, with no arrows.
- **HUD:** lamp caps, bottom right, on the glass, `TAPS HUSHED n · ×m · score` as on the board.
- **Reduced motion:** `.sh-still` on the root, SVG animations paused, and the original's RM paths unchanged (no ripple or jitter; the lady fades between three places). The freeze becomes a dimming of the lamp.

**Play:** serve `game/` (`python3 -m http.server 8112`), open `/games/studio/`. The harness links `shared/shadow.css` and has restart, reduced-motion and speed controls. `?drive=1` adds a manual clock (`__advance(s)`) for automated tests. In the spine: `/index.html?chapter=studio&games=studio`.

**Emits (unchanged):** flags `tapsHushed`, `tapsSpared`, `knockSpared`. Labels `sunbeams drawn`, `roses nipped`, `trumpets muffled`, `taps hushed`, `taps let be` (the knock counts as a tap). `won` = crack < 6.

**Verified:** harness at 1280 (mouse) and 390 (touch, DPR 3), both endings, reduced motion on and off: no console errors and `done` fires once. A real-time (rAF) load ran without errors. The game mounted inside the spine at 1280 and 390 without errors. Screenshot: `work/build/shots/studio.png` (1280 viewport, the rush with three beams, a rose, the band and a red tap).

**For the lead artist / spine:** inside the spine, `returned()`'s shared mask `url(#sh-depth)` resolves to the 0×0 `#sh-defs` `<svg>`, and the masked content vanished; on the map the reflection looks unmasked (very bright). The studio works around this by re-pointing its own `returned()` output to a mask in its own `<svg>`. Other mini-games that use `returned()` will likely hit the same thing.

**Known:** strokes from bare paper also snip (as before). The mime hand fades in and out each cycle, so it looks ghostly for a moment.
