# Art critique

*2026-10-26. Live at 1280×800 and 390×844, plus `shots/`. § = LOOK.md.*

House, glass and light are right. What fails is laid on top: a glove, drawn rings, stray red, phone type.

## Per screen

**Title: fix.**
1. The shut façade returns as a dark slab in a pale frame. Drop the spine's `--lit-facade` panel so it returns as pale paper with dark windows, as in the board and the tarn game.
2. The hairline fissure is full length before chapter I. Use `map.fissure(0)`.

**Letter: ship.**
1. On a phone the blot covers "extra;". Pin it in the margin.

**Map: fix.**
1. The target marker is a pale cartoon glove, 90 units tall. It hides the guest in IV and is an arrow by another name (§5). Delete it. Raise the target room's `--lit-*` and rim its doorway with `.touch`; keep the hit pad.
2. On a phone the tall crop clips the horse and servant, and the guest is about 20 px tall. Move `horse` and `brink` 60 units right.

**Encounter: fix.**
1. On the causeway the guest's hat is inside the horse's head. Space those SPOTS at least 50 units apart.

**Iris: ship.**
1. Shut, it's a square black box and the lace proscenium vanishes. Stack `.iris` under the frame.

**Ending: fix.**
1. The red *Say, rather:* lines, which are the payoff, are 11 px on a laptop and 9 px on a phone. Set `.acc-rather` to at least 15 px.
2. On the last card the closing lines are loose italic over the pale house (§6). Put them on `C.banner` ribbons.

**Tarn: fix.**
1. Found marks are stroked ellipses: drawn, not cut (§2.1). Replace each with an unstroked lamp halo behind the cut.

**Door: fix.**
1. About eight full-red zigzags sit on the glass before anything is true. Draw unjoined stubs at 35% opacity; turn a stub full red once it joins.
2. The façade has lost its gable and spires and reads as a grid. Fix the library's roof and turrets on top.
3. The three-line teaching line sits on pale lilac. Put it on dark (§6).

**Studio: ship.**
1. *TAN-TAN-TARA.* has its own glow and covers Roderick's profile. Drop the glow and raise the word 60 units.

**Burial: fix.**
1. About eight red footprints in the glass break the one-truth rule (§9). Make them `--sh-return`.
2. The bearers are about 70 units tall, under the 96 minimum. Scale the cast 1.3×.

**Nights: fix.**
1. The blue *Unaccounted for* card with its curled corner reads as a sticky note. Use the lamp-lit slip card.

**Trist: fix.**
1. Lamp hairline rectangles box the vault and the inset like selection boxes. Delete them, or cut them as lace frames.
2. *…a death-cry.* overprints a grey duplicate on the guest's hat. Keep one, clear of his profile.

**Flight: fix.**
1. From frame one a translucent straight-edged slab covers the house and dulls the blood moon [u50] to maroon. Make the dark opaque cut paper entering from offstage, so the opening shows the moon behind the gable.

## Across the game

- **Phone:** each game letterboxes to about 374×249 px mid-screen, above an empty black dock. Banners and teaching lines come out at 10–12 px, scores at about 9 px. Under 600 px, scale game type ×1.5 and hide `#band-dock` during games.
- **The returned house:** the spine's is a dark slab, while the tarn and flight games use pale paper. Use the paper everywhere.
- **Red creep:** the door stubs and the burial footprints.
- **Drawn intrusions:** the glove, the rings, the boxes and the blue note.
- **Old-style zero** reads as a letter: "TAPS HUSHED o · ×1 · o". Write *none*.

## The three fixes that matter most

1. **Remove the map's glove; light the target room instead.** It's on every chapter, it covers the cast, and nothing in the game is less Reiniger.
2. **Make the phone readable.** Scale game type ×1.5 under 600 px and drop the empty dock under each game.
3. **One red truth per screen.** Thin the door stubs until they join, turn the burial footprints to light.
