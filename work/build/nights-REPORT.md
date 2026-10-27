# Nights: build report

**Built:** `game/games/nights/game.js` and a harness at `index.html`. It follows the spec: 13 slips over three nights with 3, 3 and 4 ink, 4 excuse cards, wrong stamps bounce with a note, and a back page. On night three the slip agrees with any lifted card ("Quite so."). The reveal shows persuaded slips struck through with the truth in red, plus a red route through the room.

**Recut in Shadow Theatre (2026-10-26):** only the look changed. The rules, timings, hit areas, flags, score labels, `rather` and `done` are untouched.
- The room is cut from the shared library: `C.drape`, `C.lancet`, `C.fringe`, `C.curl` and `C.scallops`, plus the library's canopy bed cut again at this scale. It stands against the nights deep-blue light (`C.backdrop('nights')`), with a candle as its own lamp and violet on the passage and stair. The archway and stairwell under the floor are holes letting light through. Below the floor is the tarn's glass (`C.glass('nights')`), and `C.frame()` is drawn last.
- The slips and excuse cards are lamp-lit cards in cut frames with black type. The back page is lit by the moon. The stamp is a black ribbon with EXPLAINED cut out in lamplight. The emblems are cut paper, and Roderick is the library figure. Noises are curl sprays with tilted sound-words: black on the lit rooms, light through holes on the black beam and band.
- Touchables use the shared `.touch` lit edge. The lifted card and the armed slip show it, the back page shows it when it beckons, and phones get the faint rim.
- Night cards are an iris intertitle (`C.runIris`) on the same 320 ms / 1.2 s timing. The reveal sets paper type on black ribbons. Red is used only for the route, its words and *say, rather:*.
- Phones: below 620 px the type grows (card limits 17 → 23 units, labels 14 → 20, sound-words 21 → 28) and the card emblems step aside to make room. Reduced motion adds `.sh-still` and keeps the instant swaps.

**Play:** serve `game/` and open `/games/nights/`. Tap a card, then the slip; tap the back page to set a slip aside. Keys: 1–4, Enter, `a`. `?night=3` starts at night three; `?rm=1` is reduced motion.

**Emits:** `nightsUnexplained`, `nightsStair`, `nightsAgreed`. `done` scores `noises explained`, `unaccounted for` and `saw reason`, plus `note` and `rather`.

**Verified:** headless Chromium played start to finish by mouse at 1280, by touch at 390×844, and with reduced motion. Each run was compared against the pre-recut build from git HEAD, and the teaching lines, `done` result and flags were identical every time. `done` fired once, and there were no console errors or warnings. Shot: `work/build/shots/nights.png` (the reveal, 1280 wide).

**Known issues:** at 390 px the smallest type is still about 8–9 px, which the 3:2 stage forces. Only tested in Chromium.
