# Brief: a style board for one visual direction

Lukas, a writer and artist who makes the calls, wants to *see* overall design directions before we commit, "as they'll be somewhat difficult to change and should have a common feel (even if the individual games can have their own unique character)". Three art directors each make one style board, for one direction. He'll pick by looking, so the board is the pitch: make it beautiful.

## The game
*A Sojourn of Some Weeks*: a small browser adventure from Poe's "The Fall of the House of Usher". The map is the house in cutaway standing over its upside-down twin in the black tarn. You walk room to room, meet people, and each turn of the plot opens a different mini-game. Wry, bookish, a little uncanny; delight for anyone, more for connoisseurs. Red always means *what really happened*.

## Read
- `~/Documents/Usher/work/design/LOOK.md`: the current art direction (direction 1 below). Even if yours differs, reuse its layout logic: the 960×640 frame, the cutaway rooms, the tarn reflection with an unrippled red truth layer.
- `~/Documents/Usher/work/design/SPINE.md`, `~/Documents/Usher/work/design/STORY.md` (for lines and the title).
- `~/Documents/Usher/work/design/games/studio.md` and `trist.md` (the two mini-games your board shows).
- `~/Documents/Usher/source/usher-1845.md` [u02], [u06], [u08], [u09], [u14], [u29], [u49], [u50] at least.

## Your direction
**3. Tinted Film.** Silent cinema, and specifically Jean Epstein's 1928 *La Chute de la maison Usher*: monochrome images with film grain, vignette, a faint flicker and gate weave; whole scenes tinted by mood (amber for lamplit interiors, blue for night, rose for the Trist), as tinted prints were; intertitles in ornamented Art Nouveau frames; iris-in and iris-out between scenes; billowing drapes and long corridors. Figures are soft, high-contrast silhouettes, the house a dark engraving-like mass. The tarn is a black mirror with a silver sheen. Red, rare, is the truth.

## Deliver
One self-contained page: `~/Documents/Usher/work/look/tinted-film/index.html`. No network: fonts from `../../proto/fonts/` (IM Fell English, OFL), everything else drawn in inline SVG and CSS. Laid out as a board about 1440px wide (it may stack on narrow screens):
1. **The hero:** the map screen at 960×640: house cutaway over the tarn, the guest figure in a room, Madeline faint somewhere (bright in the water), the fissure, and the dialogue strip with one STORY line.
2. **Two mini-game frames** at half size, same frame and family, each with its own character: *studio* (Roderick on the sofa, a sunbeam, a rose, *TAN-TARA*, the small red *tap.* in the floor) and *trist* (the hermit's door, or the page turned over to the vault).
3. **The title card:** "A Sojourn of Some Weeks", and in its reflection *A Burial of Some Weeks*, with the changed word in red.
4. **Palette and type:** swatches with hex values, and a type specimen with the roles.
5. **Three lines:** the idea; why it fits Usher; the risk.

Static is fine; a slow ripple or flicker is welcome if cheap. Quality over completeness: the hero frame matters most.

About 12 minutes. Write only inside `work/look/tinted-film/`. Don't commit. Reply with the path and the three lines.
