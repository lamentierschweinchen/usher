# Look: Shadow Theatre

*Lead artist, 2026-10-26. Units: viewBox 960×640. Shapes: `game/shared/cuts.js`; tokens and classes: `game/shared/shadow.css`; specimen: `game/shared/index.html`. Layout logic from `LOOK-ink-and-tarn.md`.*

After Lotte Reiniger's *Prince Achmed* (1926). Everything solid is black cut paper: house, trees, people, furniture, sound-words. Colour lives only in the light behind it. The tarn is dark coloured glass where the cuts come back as light. **Red always means what really happened.**

## 1. Tokens

```css
--sh-cut:#0b0809;                                                                   /* paper */
--sh-lamp:#f7d894; --sh-amber:#e6a256; --sh-rose:#a2646e; --sh-violet:#5b4170; --sh-zenith:#241a34;
--sh-ember:#cf8752; --sh-copper:#b97a4c; --sh-blue:#2f4a80; --sh-lilac:#a796bf;   /* light */
--sh-glass:#13122a; --sh-return:#f3dba2; --sh-red:#e0392b;                         /* water, truth */
--sh-paper:#ede2cb; --sh-gauze:#f6ead2; --sh-speaker:#d79a6a;                       /* type, Madeline */
```
The spine's old `--paper/--ink/--red` stay until the spine is recut; don't draw with them.

## 2. Cutting rules

1. **Cut, never drawn.** Filled silhouettes only: no outlines, hatching, or gradients on paper. A stroke is allowed only as cut thread (railings, chains, an empty portrait frame).
2. **Identity by profile.** No faces. The guest: top hat, trailing scarf. Roderick: tall, gown, floating lace hair [u09]. Valet: tiptoe, candle. Physician: squat, bag, hooked nose. Servant: stooped. Ethelred: plume, mace. If a cut fails on any light, fix the profile.
3. **Lace at the edges.** Filigree only where paper meets light: fringes, crockets, sedges, hair, plumes; every branch ends in a curl. Masses stay calm.
4. **Light through holes.** Windows, door gaps, the fissure's hairline, the physician's one eye, a flame, the player's Trist strokes: any colour is light through a cut.
5. **Madeline is the only pale cut:** gauze at 0.42 above water, bright in it.
6. **Lace density.** Call `C.autoLace()` at mount: phones and coarse pointers get about half (`setLace(.55)`), fewer, larger curls, no hole under 3 units (1.5 on desktop). Outlines never change.
7. **Minimum sizes.** Map figures 40 tall; mini-game figures 96+; nothing to recognise under 24. Touch targets 64+ on the short side (pad the hit area, not the cut).

## 3. Light per chapter

Sky top to horizon, a low halo, glass beneath: `C.backdrop(ch)`, `C.glass(ch)`, `.sky-<ch>` for HTML. The light darkens as the story goes.

| chapter | light | horizon |
|---|---|---|
| tarn | dusk amber | `#f4cf86` |
| door | violet | `#d9b3b0` |
| studio | ember | `#eab062` |
| burial | cold copper | `#b97a4c` |
| nights | deep blue | `#4b6896` |
| trist | rain-night; **vault** after the page turns | `#a796bf` → `#3a2622` |
| flight | blood moon [u50] | `#5e2219` + `C.moon()` |

Rooms keep their own lamps (gallery amber, stair violet, studio ember…), retintable via `--lit-gal`, `--lit-studio` etc.

## 4. The tarn is glass

House 280–680, rooms per `engine/drawing.js ROOMS`, water at y 368, `FLIP = matrix(1 0 0 -.85 0 680.8)`. `C.returned(scene, {truth})` repeats the scene flipped, rippled and fading: its variables turn paper into light and lit rooms into dark glass, a negative. Truths share the flip but not ripple or fade: red, or bright gauze. The fissure is whole and red in the water from the start; above, a hairline of light grows a segment per chapter (`house({crack:n})`).

```js
svg.innerHTML = C.defs() + C.backdrop('tarn') + `<g style="color:var(--sh-cut)">${scene}</g>` + C.glass('tarn')
  + C.returned(scene, { truth: C.truthFissure() + C.figure('madeline', {x:479, y:311, scale:.93, flip:true, faint:false, attrs:'filter="url(#sh-glow)"'}) })
  + C.banner({ speaker:'Roderick', line:'“You came!…”', portrait:C.cameo(104, 598) }) + C.frame();
```

## 5. Touchable

A lit edge where the lamp gets round the paper. `.touch` goes on the figure's outer `<g>`, never a scaled one.
- **Rest:** nothing; on phones (`hover:none`) a faint rim always.
- **Hover/focus:** lamp rim, lifted 2 units. **Press:** hard white edge, back on the screen.
- **Held** (`.is-held`, dragging): lifted, shadow softening. **Disabled:** `aria-disabled`, no rim.

Never red, arrows, or a glow of the cut's own.

## 6. Type on light

Never loose on a pale sky.
- Titles and intertitles above water: black on a lit card (`C.card`).
- Dialogue: paper on the black ribbon over glass (`C.banner`); speaker rose caps 12, line 21.
- Iris intertitle: lamp on black between hairline lamp rules.
- Teaching line: italic 26, paper, top left, on dark. Score: lamp caps 17, bottom right.
- Sound-words are cut type: black above water, red only as a truth; lowercase with a stop (*tap.*), capitals for the loudest (KNOCK.); tilt ≤4°.

IM Fell English, regular and italic only.

## 7. Puppet motion

Sticks and hinges, not animation. Figures slide; `.sh-moving` adds a 1.5-unit bob per 0.5 s; no walk cycles; Madeline glides, never bobs. Turn by flipping edge-on (`scaleX` 1→0→−1, 160 ms). `.sh-arm`/`.sh-jaw` turn on hinges ≤30° (`C.hinge`); heads nod ≤8°. `.sh-sway` for Ethelred's wine and Madeline's reeling. Never squash, stretch or bounce. Walk 90/s, Madeline 30/s, ripple 14 s.

Reduced motion (`.sh-still` on the game root, or the media query): no bob, sway, flicker or ripple; figures fade between places; the iris becomes a 250 ms fade through black.

## 8. The iris

A black stage with a lace-edged round hole (`C.irisD`) closes on the room (0.7 s), the intertitle holds (tap, or 1.8 s), it opens (0.9 s). Eased; no bleed, no blur. `C.runIris(path, cx, cy, from, to, ms)`.

## 9. Red, exactly

Only: the tarn's truths and fissure; one truth per mini-game (the studio's *tap.*, the Trist's upside-down *crack.* and Madeline's heart, the lid's sliver); the flight's blood-red moon [u50]; the confession's *say, rather:*; the changed word in the title's reflection, *A Burial of Some Weeks* (confirmed: Lukas picked the board that has it). Never UI, hovers, touch states, eyes, blood, the title itself, or any light. It is the one colour on the glass, not behind it.

## 10. For builders

- Import `../../shared/cuts.js`, link `../../shared/shadow.css`. `C.defs()` once per `<svg>` (ids prefixed `sh-`); `C.frame()` last.
- Cuts take `color`: wrap in `style="color:var(--sh-cut)"`; `returned()` recolours the tarn.
- `figure(name, {x, y, scale, flip, pose…})`: feet at (x, y), facing right, 40 tall at scale 1. Poses: Roderick `stand|sit|recline`; Madeline `stand|lie`, `{heart}`; physician `{lamp}`; Ethelred `{shield}`. Move with `C.place(el, x, y)`.
- New silhouettes come from the cut library, never drawn in a game: ask the lead artist.
