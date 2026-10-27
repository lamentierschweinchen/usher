# Tarn: build report

**Built:** `game/games/tarn/game.js` (contract module, SVG 960×640, waterline 340) and `index.html` (harness with Restart, a reduced-motion toggle or `?rm=1`, and a flag/`done` log). The full spec runs: five finds, one cheat 700 ms after find 4 (smoke, else the earliest non-crack find), the catch with a double circle and 4 px flinch, the 10 s idle drip hint, and the red window in the water (tap it to cross it out, or it goes dark at 5 s). `done` follows 1.2 s after the light goes out.

**Play:** `cd game && python3 -m http.server 8100`, open `/games/tarn/`.

**Emits:** `tarnCaught` ('unaided'|'hinted'), `tarnSawHer`, `tarnGlancesDown`; `done({won:true, score:{"differences found":5,"glances down":n}, note:"Five of five. The house thanks you."})`. Fires once.

**Known:** all colours and weights are `--g-tarn-*` tokens. A tap on the dark window above also counts as seeing her. The drawing isn't final until the look is picked.
