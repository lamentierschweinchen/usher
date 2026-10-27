# Door: build report

**Built:** `game/games/door/game.js` (scoped `.g-door`) and its `index.html` harness. Everything in door.md is built: you drag the hole, or drag her in the water (vertical inverted). The crack is red in the water only, with stubs and a shortcut that grows at 8. The house steps at 1.5 s and after 7 s idle. At the door, her route fades in red; `done` follows 1.8 s later.

**Recut in Shadow Theatre (2026-10-26).** Only the look changed. Mechanics, timings, hit areas, flags, score labels, `rather` and `done` are as before.
- **Façade.** Every stone is black cut paper, cut 3 units short of its neighbours, so the joints are hairlines of light. A stone out of place sits askew and lets a wedge of light through. Windows are lamplight through cuts: lancets from `C.lancet`, the oculus as a rose cut like the house's own, the crest as a lit shield with mantling curls, small windows with cross bars. The cornice corners carry lit dentils, quoins and lace curls on their outer edge, so a misplaced cornice shows. The parapet has two pinnacles, and the lintel has lit dentils over the walled door, with lamplight leaking round its bricked arch.
- **The gap.** The light behind the house shows where a stone is missing. It is touchable (`.touch`): on hover or focus the gap warms and its rim lights; while held it lifts. Her figure works the same way. Phones get the library's faint rim.
- **Light and water.** `C.backdrop('door')` and `C.glass('door')`, with white trunks and sedges on the bank. The tarn uses the library's `C.returned(…, {still:true})`, so the house comes back as a negative, its windows dark glass. The truths are the crack (red, unrippled) and Madeline: `C.figure('madeline')`, bright, glowing, upright in the gap's reflection. She glides without bobbing and turns edge-on.
- **Sound-words.** `grind.` and the rest are black cut type (`.sh-sound`) on the light of the gap beside the stone that ground home: the stones themselves are black now.
- **Ending.** `C.door('ebony')` panels throw back [u49] on the stair's violet light. Madeline is faint in the doorway above and bright in it below, and the route shows red on the façade.
- **Type.** Teaching line in italic paper on the dark sky, top left. On a stage under 620 px wide it becomes one 12 px line on the dark glass at the bottom.
- **Reduced motion.** `.sh-still` on the root: no slides, turns or draw-ins; she fades between places; sound-words hold until the next move.

**After the art critique (2026-10-26, look only; play is the same):**
- **One red truth.** Unwalked crack segments, stubs included, are returned light at 35%. Each turns full red only when her route takes it, and the crack's flare is returned light too. Before the first move nothing on the glass is red.
- **Gable and spires.** The roof is the library's own: `C.shell()` cut to its gable (rose, crockets, finial) and its two turrets, at 0.64, on a laced parapet, with a glow of the chapter's violet behind it so the black roof reads. To make room, the whole picture sits 36 units lower (a view transform; pointer positions are read through it, so cells and hit areas are unchanged in size).
- **Teaching line on dark.** It sits on a dark torn-cloud bank (`C.clouds`) at top left.
- **Phones (stage under 600 px).** Game type is ×1.5: sound-words go from 30 to 45 units, centred in the gap (widest 104 of 120). The teaching line moves to a `C.banner` ribbon over the top of the glass at 38 units and fades with the desktop line after two moves.
- **Zero as *none*.** This game shows no score on screen. `done` still sends numbers, as the contract requires, so writing zero as *none* is up to the spine's confession.

**Judgement calls (for the lead artist):**
- The tarn is an **exact mirror at y 320**, not the map's 368 / `FLIP` .85. Dragging her in the water, inverted cell for cell, depends on it. `C.returned` takes the mirror as its `transform`; I swap its `#sh-depth` mask, which is fixed at y 368, for `#gdoor-depth` (same idea, a little dimmer so the crack and Madeline lead).
- Madeline in the water is **86 tall, not 96+**. That is the most her 90-unit cell holds below the waterline. At 97 her head was cut off by the façade in the bottom row.

**Play:** run `python3 -m http.server 8111` in `game/`, then open `/games/door/`. Again and reduced motion (or `?reduced`) are on the page. In the spine: `/?chapter=door`, then click the door.

**Emits:** `doorRoute` long|short, `stonesAskew` 0|4, `doorHouseMoves` n. Scores are "stones set in order" (8|4) and "times the house lent a hand" (n), plus the note. An extra `rather` field carries the red corrections.

**Tested (after the critique):** long and short routes with the mouse at 1280, the long route by touch at 390, the short route in reduced motion, and the game mounting in the spine: all reached `done` once, with no console errors.

**Tested (recut):** headless Chrome 156 through to `done` on four runs: short route with the mouse at 1280 (gap and her both dragged; 4 askew); long route with the mouse at 1280 (0 askew); long route by touch at 390 (phone metrics, 3×); short route at 1280 in reduced motion; and idle, where the house walks her in about 40 s (6 moves). Hover and held states were also checked, and the game mounted in the spine at `?chapter=door`. No console errors; `done` fired once each time. Shot: `work/build/shots/door.png` (1280 wide, the long route's end).

**Known:**
- Inside the spine, the lancets' lattice (`url(#sh-lattice)`) doesn't render; the windows show as plain lamplight. I checked the cause: the first of the two `#sh-lattice` copies belongs to the map's `<svg>`, which is `.map.paused` (`visibility:hidden`) while a game plays, and the pattern inherits that. This affects every game that uses `C.lancet`, and is for the spine or lead artist. The standalone harness is fine.
- Untested in Safari and Firefox.
