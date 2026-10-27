# Brief: recut the "flight" mini-game in Shadow Theatre

Lukas, a writer and artist who makes the calls, chose the **Shadow Theatre** look for *A Sojourn of Some Weeks*: "with a great amount of care in the design and cuts, this is beautiful, spooky, and on-theme." The `flight` game already works (mechanics, timing, flags, `api.done`), but it's drawn in an older ink-line style. Your job is to recut it, with care, so it looks like it was cut by the same hand as everything else, while keeping its own character and light.

## Read
1. `~/Documents/Usher/work/design/LOOK.md`: the Shadow Theatre direction. Follow it exactly: cut, never drawn; no outlines; identity by profile; lace edges; this chapter's light; the tarn as glass; touchable things with a lit edge; red only for the truth.
2. `~/Documents/Usher/game/shared/index.html` (open it through a local server) and `game/shared/cuts.js` and `game/shared/shadow.css`: the shared cut library. **Use its figures and structures**; don't hand-draw your own Roderick, Madeline, house or coffin. If you need a prop the library lacks, cut it in the same manner inside your folder.
3. `~/Documents/Usher/work/look/shadow-theatre/index.html`: the board Lukas chose, which is the bar.
4. Your game: `~/Documents/Usher/game/games/flight/game.js`, its spec `work/design/games/flight.md`, and its report `work/build/flight-REPORT.md`.
5. `~/Documents/Usher/work/design/CONTRACT.md`.

## Rules
- **Change the look, not the game.** Keep the mechanics, timings, hit areas (or enlarge them), flags, score labels, `rather`, and `api.done` behaviour exactly as they are. If a mechanic depends on legibility the silhouettes would lose (for example, which thing is touchable, or text size on phones), fix the legibility, not the mechanic.
- Import shared cuts from `../../shared/cuts.js` and link `../../shared/shadow.css` from your harness; the spine will also load `shadow.css`. Keep styles scoped under `.g-flight`.
- Phones matter: silhouettes and text must read at 390px wide.
- Honour reduced motion.

## Verify
Serve `~/Documents/Usher/game` (`python3 -m http.server 8116`, in the background), play your harness start to finish at 1280 and 390 widths, with no console errors, and take a screenshot of the key moment of your game at 1280 wide into `~/Documents/Usher/work/build/shots/flight.png`. Headless Chrome is fine if the shared browser pane is busy.

## Own and don't touch
You own `game/games/flight/**`, `work/build/shots/flight.png` and your report `work/build/flight-REPORT.md` (update it). Touch nothing else. Don't commit or push.

About 20 minutes. Reply with a two-line summary and the screenshot path.

## Notes from the lead artist (follow them)
1. Every cut takes its colour from a wrapper: cuts use `fill="currentColor"`, so wrap them in `style="color:var(--sh-cut)"`. `returned()` swaps the lit variables so the tarn shows the house as a negative.
2. Put `C.defs()` once in each `<svg>`; draw `C.frame()` last. All shared ids start with `sh-`.
3. Call `C.autoLace()` before building any markup (lace density is decided at generation; generation is seeded).
4. Never put a `transform` on a figure's outer `<g>`. Put state classes there (`.touch`, `.is-held`, `.sh-moving`); move with `C.place(el, x, y)`; turn arms and jaws with `C.hinge(el, '.sh-arm', deg)`.
5. Map coordinates match the spine's rooms (house x 280–680, water y 368).
6. In mini-games use `returned(..., {still:true})`; the animated ripple is for the map only.
7. Your chapter's light: `C.backdrop('<chapter>')` and `.sky-<chapter>` in `shadow.css`. LOOK.md has the table and a section for builders.
