# Trist: build report

**Built:** `game/games/trist/game.js` and `index.html` (harness). Door (aim, break three planks) → dragon (strike in the dip) → freeze mid-shriek, shield falls → page flip → vault: your door-gouges re-cut red on the lid, then 11 strokes on the heartbeat (off-beat strokes leave red scratches) → threshold.

**Play:** serve `game/` on port 8105 and open `/games/trist/`. To get the gust ending, don't draw at the threshold for six seconds. `?rm=1` turns on reduced motion.

**Emits:** `tristLastBlow` `'struck'|'gust'`, `tristBlows` n; score `"dragons slain"` 1|0, `"blows struck"` n (every stroke).

**Checked:** headless Chromium, mouse and touch, laptop and phone sizes: both endings work, `done` fires once, no console errors.

**Known:** type is about 7 px at portrait width. The dragon's belly reads as a hole; polish waits for the visual-direction pick. I didn't build LOOK §7.9's red sampler dragon, because the spec says one-colour woodcut.
