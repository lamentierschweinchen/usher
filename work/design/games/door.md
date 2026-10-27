# Door

**Pitch:** A sliding-stone puzzle played from the hole: you think you're mending the house; you're walking her to the door.

## First ten seconds
The façade, wrong: a cornice halfway down, the doorway walled up, a black hole at top centre. Below, the grey tarn holds the house upside down, cracked in red; in the hole's reflection stands a pale, faceless figure, upright. One line: *A mere different arrangement of the particulars.* At 1.5 s the house moves itself: she steps along the crack; a stone grinds home. The player drags the hole, or her.

## Loop and escalation
1. **Mending (to 0:40).** Each step sends a stone home. Off the crack, a stone only shudders and the crack flares: she walks only on the crack.
2. **Both halves (to 1:10).** Two plain stones both fit; only the water shows one branch is a stub. The façade says what belongs, the water where she may go.
3. **The crack grows.** A crack runs from her straight to the walled door; she turns toward it. Short: two steps, house crooked. Long: four, house whole.

## The trick
The arrangement was never the goal: the door opens the instant she reaches it. The house steers: it moves first, moves whenever you hesitate (the fastest way), and grows the shortcut. Perfectionists get a whole façade and the same ending: as the door opens, their route shows red on the house. It was the fissure.

## Choice and confession
- `api.setFlag`: `doorRoute` ('long'|'short'), `stonesAskew` (0|4), `doorHouseMoves` (n).
- `api.done({ won: true, score: { "stones set in order": 8|4, "times the house lent a hand": n } })`; note "Every stone in its place." / "Near enough. It opened anyway." Red: *the ninth was her* / *she was in a hurry*; *she did.*

## For connoisseurs
- [u02] The narrator's cure, "a mere different arrangement", taken literally.
- [u06] The zigzag fissure: you draw it, walking her. In [u50] the house splits along it.
- [u26] The stones think by "collocation" and "reduplication in the still waters": rearrange them and the house moves.
- [u49] Poe ends with her at the door; we begin there.

## Build spec
- **Stage.** SVG 960×640, `.g-door`. Grid 5×3, cells 120×90 from (180,50); index = row×5+col. Tarn below y=320, `--ink` at 0.35. Reflection: same stones flipped about y=320, opacity 0.6.
- **Stones.** cL/cR, attic, oculus, tall, crest, small, plain.
  HOME `[cL,attic,oculus,attic,cR, plain,tall,crest,tall,plain, plain,small,DOOR,small,plain]`
  START `[cL,attic,—,oculus,attic, plain,crest,tall,plain,cR, plain,tall,small,small,plain]`
- **Crack** (water only, `--red`, jagged): 2-3, 3-4, 4-9, 9-8, 8-7, 7-6, 6-11, 11-12; stubs 1-2, 9-14, 5-6. When the hole first reaches 8, draw in 8-13, 13-12.
- **Her.** Paper shroud, ~40×76, faceless, upright, at the hole's mirrored cell.
- **Drag.** Grab the hole's or her cell (+24); other stones shudder. Past 0.55 cell on the dominant axis (vertical inverted in water), try that neighbour. Edge: stone slides 140 ms, stroke continues. None: shudder, crack flares. The walked path thickens.
- **House moves.** At 1.5 s and after 7 s idle: lean, then step along the shortest crack path to 12 (ties: forward).
- **End.** Hole reaches 12: black arch, panels thrown back, her in it; walked edges fade in on the façade. Hold 1.8 s, `api.done`.
- **reducedMotion:** no slides or draw-in.

**Don't build:** moving stones directly; random scrambles; counters, timers, hints, win screen; undo button; ripples; her face (the tarn card shows it); moon or sinking.

## Risk
Ask a first-time phone player, after the door opens, "What did you just do?" It works if they answer "took her to the door", not "fixed the wall".
