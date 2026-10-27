# Flight: build report

**Built:** `game/games/flight/game.js` plus the harness `index.html`. **Recut 2026-10-26 into Shadow Theatre** (LOOK.md); see the recut section below.

**Play:** serve `game/`, open `/games/flight/`, hold the stage or Space to look back. Presets: none, spared, screw out, unexplained words, all three; reduced-motion and restart controls.

**Reads (all optional):** `tapsHushed`, `tapsSpared`/`knockSpared`, `burialScrewOut`, `nightsUnexplained`.
**Writes:** `flight: {madeline, looks, fell}`. Score labels: `times I turned to see`, `noises that caught up with me`, `ladies left on the causeway`.

**Tuning against spec:**
- Collapse runs at 10 px/s, not 14: only looking drowns you.
- Before she appears, it halts 22 px behind you; within 60 px it slows to 24 px/s.
- Her lead is 60 px, not 120; she waits for dark room behind you.

## Recut: Shadow Theatre

**Changed the look, not the game.** `step()`, input, beats, `finish()`, all timings, flags, score labels, notes and `api.done` are byte-identical to git HEAD. Only drawing constants changed (horse position, the servant, the old hand-drawn fissure).

**From the shared library:** `C.autoLace()` first, then `C.defs()`, `C.backdrop('flight')` and `C.glass('flight')` with the water kept at y 440, and `C.moon()` setting behind the gable. The house is `C.house({mode:'facade'})` at 0.6, cropped by the proscenium. The guest, Madeline and the horse come from `C.figure` at 96 units tall. The reflection is `C.returned(..., {still:true})` with the flip moved to y 440. `C.frame()` is drawn last. Figures move with `C.place`, turn edge-on in 160 ms through their scale group, and lift an arm with `C.hinge`. No transform is set on any figure's outer `<g>`.

**Cut here in the same manner:**
- **Causeway stones:** each is a slab with an arch of light under it, a railing post with a knob, and its length of rail thread, all `currentColor`.
- **The dark behind you:** black paper at the same 0.9 alpha, with a scalloped, curled lace edge that travels with you.
- **Screw:** a lit hole with a slot.

**Light and red:** the blood moon is the chapter's light. The fissure is that moonlight through the house: red, glowing, and still widening while you gaze. The house's windows and door show the moon through them. In the tarn the house returns as light, the fissure is whole and red, and Madeline is bright, unrippled and glowing. Above water she is gauze at .42. She glides and never bobs. The truth words beside her stay red, set on a soft black ground so they read on the red sky.

**Legibility fixes (look only):**
- **Sound-words and followers:** black cut type on a dark sky disappears, so each is backlit with an ember glow (moonlight getting round the paper).
- **Type sizes:** words are 24/21/22 (were 22/19/20), still scaled up on phones by the existing `fs` factor.
- **Teaching line:** italic paper 26, top left, on the dark. Score is lamp caps 17, bottom right.
- **Clung words:** spaced a little wider.

**Deviations to flag:**
- **The gleam is no longer red.** It is now pale moonlight glancing along the glass, because LOOK §9 forbids red light. It keeps the same timing and cue.
- **No two-frame run.** The guest slides with `.sh-moving` (LOOK §7: no walk cycles).
- **The horse waits in the right wing.** At 96 units there is no room on the bank: it would merge with the guest standing at x 888. It faces the stage with head, neck and forelegs showing. When she takes it, it turns edge-on and leaves stage right.
- **The servant is offstage.** On the bank he and the horse cut as one blob. His closing line still plays.

**Verified** (served `game/` on 8116, headless Chromium with a scripted clock):
- All four outcomes (won/out, won/under, fell/out, fell/under) at 1280 and 390 wide, and with reduced motion. `done` fired exactly once each time, with no console errors.
- The same four scripted plays against git HEAD gave identical `done` results and flags at both widths.
- Phone tap gives a 0.4 s look, lace is 0.55 on phones, and `.sh-still` is set when reduced motion is on.

**Screenshot:** `work/build/shots/flight.png`: 1280 wide, preset "all", looking back at 20 s. Madeline is in gauze behind you with her red truths, the throng clings, and the house is split by the moon's fissure.

**Known:**
- **Frame rate:** the still ripple on the reflection (`sh-ripple-still`) reruns every frame because the cast moves. Headless software rendering drops from 120 fps (ink cut) to about 55, and the drop is all the ripple. Splitting the reflection into set and cast made it worse (40). Worth a check on a real phone in the spine. The lead artist could offer a cheaper still ripple if needed.
- **The 0.9 dark** still lets the house show faintly through, as before.
- **Phone word pile:** with many hushed taps, the clung pile is busy at phone width. The score carries the count.
