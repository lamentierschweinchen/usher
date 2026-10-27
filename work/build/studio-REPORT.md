# Studio · Hush — build report

**Built:** `game/games/studio/game.js` (contract module) and `index.html` (harness). The spec's whole scripted timeline: intro with a mimed inked hand, rush with taps, lady crossing (1:15–1:23), crescendo, KNOCK at 2:15, then a 3s tableau. Every colour and weight is a CSS token (`--g-studio-*`); there are no colours in SVG attributes.

**Play:** serve `game/` (`python3 -m http.server 8102`), open `/games/studio/`. Restart, reduced-motion and speed controls. `?drive=1` adds a manual clock (`__advance(s)`) for automated tests.

**Emits:** flags `tapsHushed`, `tapsSpared`, `knockSpared`. Labels `sunbeams drawn`, `roses nipped`, `trumpets muffled`, `taps hushed`, `taps let be` (the knock counts as a tap). `won` = crack < 6.

**Known:** the shared browser pane was hidden, so rAF never ran. Tested by drive-clock bot runs (laptop and phone, mouse and touch, both endings): no errors, `done` once. Not yet played in real time. Strokes from bare paper also snip. Drawings are first-pass.
