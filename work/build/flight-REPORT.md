# Flight: build report

**Built:** `game/games/flight/game.js` plus the harness `index.html`. Colours, weights and veil alpha are `--g-flight-*` tokens.

**Play:** serve `game/`, open `/games/flight/`, hold the stage or Space to look back. Presets: none, spared, screw out, unexplained words, all three; reduced-motion and restart controls.

**Reads (all optional):** `tapsHushed`, `tapsSpared`/`knockSpared`, `burialScrewOut`, `nightsUnexplained`.
**Writes:** `flight: {madeline, looks, fell}`. Score labels: `times I turned to see`, `noises that caught up with me`, `ladies left on the causeway`.

**Tuning against spec:**
- Collapse runs at 10 px/s, not 14: only looking drowns you.
- Before she appears, it halts 22 px behind you; within 60 px it slows to 24 px/s.
- Her lead is 60 px, not 120; she waits for dark room behind you.

**Tested:** all four outcomes, reduced motion, phone and laptop widths; `done` fired once; no console errors.

**Known:** the 0.9 veil lets the house show through.
