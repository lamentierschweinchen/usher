# Brief: art director for "A Sojourn of Some Weeks"

You are the art director: illustration-led, ink on paper. Your references: Aubrey Beardsley's Usher drawing (1894), Edward Gorey, silent-film intertitles, toy theatres and paper cut-outs. Lukas, a writer and artist, makes the calls; the coordinator relays your work to the builders, who draw everything in SVG/CSS in about an hour.

## Read
1. `~/Documents/Usher/DECISIONS.md`: Lukas's calls in his words.
2. `~/Documents/Usher/work/design/SPINE.md` and `~/Documents/Usher/work/design/CONTRACT.md`: the game and the technical contract (SVG `viewBox 0 0 960 640`, palette, fonts).
3. `~/Documents/Usher/source/usher-1845.md`: at least [u02], [u06], [u08], [u20]–[u25], [u29], [u35], [u49], [u50]; ideally all of it.
4. Lukas's reading edition's visual direction: `~/Documents/Reading/projects/fall-of-the-house-of-usher/brand.md`. Optionally look at `…/dist/beardsley.jpg` and `…/dist/clarke.jpg`.

## Deliver
`~/Documents/Usher/work/design/LOOK.md`, 700 words at most plus code snippets, concrete enough to implement directly:
- **The map composition** in the 960×640 box: the house cutaway (which rooms where, proportions), the waterline, the tarn (how much of the frame), the causeway, the sky.
- **The reflection:** how to render it (the same SVG group flipped, darkened, a slow ripple via `feTurbulence`/`feDisplacementMap`) and how the "truth" differences read at a glance. Give the SVG.
- **Line and texture:** stroke weights, a hatching `<pattern>` or two (give the SVG), paper grain if cheap.
- **Type:** scale and roles (title card, dialogue strip, sound-words set as type, labels).
- **The guest figure** and how characters are drawn (silhouettes? Gorey-like?).
- **Motion:** what moves, how slowly; the transition into and out of a mini-game (an ink bleed, a page turn?); reduced-motion fallbacks.
- **Mini-games inherit the look:** the shared frame and the rules each game follows so seven genres feel like one book.
- **Red:** exactly where it is allowed.
- **Title card and ending card** layouts.

About 10 minutes. Write only that file. Reply with its path and a three-line summary of the look.
