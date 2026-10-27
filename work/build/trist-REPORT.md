# Trist: build report

**Built:** `game/games/trist/game.js` and `index.html` (harness). Door (aim, break three planks) → dragon (strike in the dip) → freeze mid-shriek, shield falls → page flip → vault: your door-gouges re-cut red on the coffin, then 11 strokes on the heartbeat (off-beat strokes leave red scratches) → threshold.

**Recut in Shadow Theatre (2026-10-26).** Only the look changed; the mechanics are the same.
- **Cuts from the library:** Ethelred, the dragon, Madeline (gauze, bright, red heart), Roderick seated, the reader (guest), the coffin, the iron and ebony doors, the tree, sedges, fringes, the backdrops, glass, `returned()`, banner and frame. `C.autoLace()` runs before the markup. Figures move with `C.place` and `C.hinge`, sway on `.sh-pose`, and turn edge-on in 160 ms. Nothing transforms a figure's outer `<g>`.
- **Props cut here in the same manner:** the hermit's hut and planks, the arcade, shield, tongue, the dragon's raised paws, the chair and footstool, the book, the lamp, the vault walls, the coppered arch and bars, and the stair.
- **Light:** rain-night at the door, with your strokes cut through the planks as light. The hall is the "palace of gold", a lamp-lit room behind a black arcade. After the page turns it's the vault light, with the room's lamp spilling down the stair.
- **Glass:** the romance comes back in the glass as a live `<use>` inside `returned(..., {still:true})`. Red truths stay unrippled: her upside-down echoes, Madeline's heart, your door strokes re-cut on the coffin, the "say, rather" corrections, Roderick's lines and the off-beat scratches.
- **Phones:** under a 640 px stage the type scales up (teach 40, caption 30, speech 32 or 27, sound-words ×1.38) and rewraps. Under a `<use>` clone class rules don't paint, so everything inside the reflected scene is styled inline.

**Changed to fit the look (worth knowing):**
- The mace still points at your stroke's angle, so Ethelred's arm hinge turns past LOOK's 30°. That angle is part of the spec's aim mechanic.
- The library dragon is a single cut. It slides, sinks behind the floor and nods up to 8° so that its head follows the old path. Timing windows and reach are untouched.
- Madeline's cut has no arm, so she leans into each blow.
- The library coffin is a side view, so your replayed strokes go on its side. On the lid station she heaves the lid up at the head end.
- Sound-words and speech moved to stay on light. "TORE ALL ASUNDER." is set as two lines.

**Play:** serve `game/` (`python3 -m http.server 8115`) and open `/games/trist/`. To get the gust ending, don't draw at the threshold for six seconds. `?rm=1` turns on reduced motion. In the spine it plays at `/?chapter=trist`, entered by tapping the bedroom.

**Emits (unchanged):** `tristLastBlow` `'struck'|'gust'`, `tristBlows` n; score `"dragons slain"` 1|0, `"blows struck"` n (every stroke).

**Checked:** headless Chromium (Playwright), scripted play from start to finish:
- At 1280: struck ending, gust ending with reduced motion.
- At 390 (touch, mobile): both endings.
- In the spine: the game mounts.
- `done` fires once and there are no console errors.
- The same script on git HEAD's ink-line build hits every phase at the same blow counts and gives identical flags, scores and notes.

Shot: `work/build/shots/trist.png` shows the page turned. Your door strokes are cut red into her coffin, she's white at the iron door, and the book is corrected in red.

**Known:** the hut's black wall comes back in the glass as a large pale block. The paws-over-ears pose and Roderick's hand to his ear are small at phone size; the dialogue carries those beats.
