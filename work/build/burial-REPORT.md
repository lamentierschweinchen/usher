# Burial: build report

**Built:** `game/games/burial/game.js` (contract module, SVG 960×640) and `index.html` (harness: Restart, reduced-motion toggle or `?rm=1`, flag/`done` log). The full spec runs: footsteps three beats behind, a physician who hunts by ear, catches, the copper hurry and lift, *two* struck in red, the lid, four screws (the last takes 720°), the red sliver, Roderick at the door, one *pat.* behind it. The rules are pure exported functions (`beat`, `simulate`). Both spec routes pass; straight routes and hiding get caught.

**Play:** `cd game && python3 -m http.server 8103`, open `/games/burial/`.

**Emits:** `burialScrewOut`, `burialGlimpses`; `done({won:true, score:{bearers:2, "screws turned":3|4, "the physician's glimpses":n}, note})`, once.

**Known:** I added escalating hints after each catch. The drawing is placeholder until the shared cuts arrive; every colour is a `--g-burial-*` token.
