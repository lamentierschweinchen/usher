# Handoff: build the playable slice

You are the builder for **Usher**, a small browser game made from Edgar Allan Poe's "The Fall of the House of Usher" (1845 text, public domain) for a competition. Lukas, a writer and artist, makes the calls; a coordinator session briefs specialists and owns the project's records. This file is your whole brief.

## Read first
1. This file, all of it.
2. `~/Documents/Usher/DECISIONS.md`: Lukas's calls in his words. They override anything else.
3. The concept you're building: {CONCEPT_FILE}.
4. `~/Documents/Usher/source/usher-1845.md`: the whole tale (about 7,400 words). Read it; every line of in-game text should be worthy of it.

## The bar
Lukas wants to blow the room away. The game should be delightful for anyone and *more* delightful for literary connoisseurs. It should be recognizable as a genre within seconds and visually beautiful. It should be wry, a little uncanny, and play the player as much as they play it. Poe is the frame, not the cage: being unfaithful can be the joke. No generic horror, no cheap jump scares, no reading blocks of text and making choices. Sound is never load-bearing (silence is fine; any audio must be synthesized in code and optional).

## The game
{CONCEPT_SUMMARY}

## Scope: about 60 minutes
- One finished, playable slice from first screen to ending. Finished beats complete: it must start, catch you, turn, and end, with nothing broken on the way.
- Polish where the eye lands: the drawing of the house, its reflection, the first 20 seconds, the twist, the ending.
- Timebox: at roughly 40 minutes, stop adding and make the whole run clean end to end.

## Tech
- A static site in `~/Documents/Usher/game/`: `index.html` plus, if you want, `style.css` and `game.js`. No framework, no build step, no network requests, no trackers.
- Draw in SVG and/or canvas. Ink on paper. Palette from Lukas's reading edition: paper `#f2eee5`, ink `#29272a`, muted `#625d5a`, rule `#cbc3b8`, accent red `#7a3939` (sparingly).
- Type: IM Fell English (OFL). Copy `~/Documents/Usher/work/proto/fonts/` to `game/fonts/`, including `OFL-IMFell.txt`.
- Optional art: Harry Clarke's 1919 Madeline plate (`~/Documents/Reading/projects/fall-of-the-house-of-usher/dist/clarke.jpg`, public domain) and Aubrey Beardsley's 1894 Usher drawing (`…/dist/beardsley.jpg`, CC0, the Met). If you use either, copy it into `game/art/` and credit it in `game/CREDITS.md`. Read-only access to the reading edition: change nothing there.
- Works with mouse and touch, at laptop and phone widths. Respect `prefers-reduced-motion`.

## Files you own
`game/**` and `work/build/REPORT.md`. Nothing else.

## Must not touch
`DECISIONS.md`, `STATE.md`, `AGENTS.md`, `briefs/`, `handoffs/`, `work/story/`, `work/concept/`, `source/`, and the reading edition. No deploys, no GitHub Pages, no sharing links. Publishing the game is Lukas's call.

## Verify
Run it in a real browser (in the Claude desktop app, open `game/index.html` with the built-in browser, or `python3 -m http.server` from `game/`). Play it start to end at laptop and phone widths. Check the console for errors. Fix what you find.

## Version history
The repo is `~/Documents/Usher`, branch `main`, remote `origin` = github.com/lamentierschweinchen/usher (public; Lukas approved it). Commit working checkpoints about every 20 minutes with descriptive messages ending in your Co-Authored-By line, push to `origin main`, and confirm `git ls-remote origin main` matches your HEAD. Stage only your own files.

## Report back
Write `work/build/REPORT.md` (at most 250 words): what's built, how to play it, what's stubbed or cut, known issues, and the final commit SHA with push status. Commit and push it too. Then tell Lukas in two lines that it's ready, and where.
