# Door: build report

**Built:** `game/games/door/game.js` (scoped `.g-door`, colours via tokens and classes only) and its `index.html` harness. Everything in door.md is built: you drag the hole, or drag her in the water (vertical inverted). The crack is red in the water only, with stubs and a shortcut that grows at 8. The house steps at 1.5 s and after 7 s idle. At the door, her route fades in red; `done` follows 1.8 s later.

**Play:** run `python3 -m http.server 8101` in `game/`, then open `/games/door/`. Again and reduced motion (or `?reduced`) are on the page.

**Emits:** `doorRoute` long|short, `stonesAskew` 0|4, `doorHouseMoves` n. Scores are "stones set in order" (8|4) and "times the house lent a hand" (n), plus the note. An extra `rather` field carries the red corrections.

**Tested:** headless Chromium, mouse and touch, laptop and phone, plus idle with reduced motion. No errors; `done` fired once each time.

**Known:** untested in Safari and Firefox.
