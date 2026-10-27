# Nights: build report

**Built:** `game/games/nights/game.js` and a harness at `index.html`. It follows the spec: 13 slips over three nights with 3, 3 and 4 ink, 4 excuse cards, wrong stamps bounce with a note, and a back page. On night three the slip agrees with any lifted card ("Quite so."). The reveal shows persuaded slips struck through with the truth in red, plus a red route through the room. Colours are tokens and classes only.

**Play:** serve `game/` on port 8104 and open `/games/nights/`. Tap a card, then the slip; tap the back page to set aside. Keys: 1–4, Enter, `a`. `?night=3` starts at night three; `?rm=1` is reduced motion.

**Emits:** `nightsUnexplained`, `nightsStair`, `nightsAgreed`. `done` scores `noises explained`, `unaccounted for` and `saw reason`, plus `note` and `rather`.

**Known issues:** on an upright phone the card text is tiny. Only tested in Chromium.
