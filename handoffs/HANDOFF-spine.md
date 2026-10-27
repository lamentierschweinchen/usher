# Handoff: build the spine of "A Sojourn of Some Weeks"

You are the spine builder for **Usher**, a small browser game made from Edgar Allan Poe's "The Fall of the House of Usher" (1845 text, public domain) for a competition. Lukas, a writer and artist, makes the calls. A coordinator session briefs specialists, owns the project's records, and will relay design documents to you as they land. This file is your whole brief.

## Read first
1. `~/Documents/Usher/DECISIONS.md`: Lukas's calls in his words. They override everything else.
2. `~/Documents/Usher/work/design/SPINE.md`: the game: an adventure through the house with a different mini-game at each turn of the plot.
3. `~/Documents/Usher/work/design/CONTRACT.md`: the plug-in contract between you and the mini-game builders. Follow it exactly.
4. `~/Documents/Usher/source/usher-1845.md`: the whole tale. Read it.

Two more documents are being written in parallel and will appear soon: `work/design/STORY.md` (the storyteller's script: encounters, lines, chapter intros and outros, the ending) and `work/design/LOOK.md` (the art director's visual language). Build the skeleton now with placeholder text and a simple drawing; when each lands, adopt it. The coordinator will message you.

## The bar
Lukas wants to blow the room away: delightful for anyone, and more delightful for literary connoisseurs. A recognizable adventure within seconds, visually beautiful, wry, a little uncanny, a game that plays the player. Poe is the frame, not the cage. No generic horror, no jump scares, no walls of text.

## What you build
- **Title:** a letter from Roderick (a few agitated lines), then the approach to the house at dusk.
- **The map:** the house in cutaway, ink on paper, over its upside-down twin in the black tarn. Rooms: hall/door, studio, gallery and stair, guest bedroom, the vault directly beneath the bedroom, plus the causeway outside. The guest moves room to room (click or tap a room or door; a small figure walks). Keep it simple and handsome rather than clever.
- **Encounters:** short exchanges with the valet, the physician, Roderick, and Madeline crossing silently, in a compact dialogue strip (one or two lines at a time, advance on click). Never a wall of text.
- **The reflection:** between chapters, the tarn's reflection runs one step ahead of the house and shows what's really happening (a lid ajar, a figure on the stair). Make glancing down rewarding.
- **Chapter flow:** each turn of the plot opens a mini-game via the contract (`game/games/<id>/game.js`). Until a game exists, mount a stub: the chapter's title, one line, and a "win" link that calls `api.done` with a fake score. Chapters `burial` and `nights` stay sealed doors in this slice ("chapters to come").
- **The ending:** after `flight`, the scores from every chapter are read back as a confession, e.g. *taps hushed 41 · stones set 8 · Usher: 0*. One quiet, wry last card.
- **Plumbing:** shared CSS tokens and fonts per the contract, `api.state`/`api.setFlag`, `prefers-reduced-motion`, mouse and touch, laptop and phone widths. Optional: `?chapter=<id>` to jump to a chapter for testing.

## Tech
Static files in `~/Documents/Usher/game/`, no framework, no build step, no network requests. Copy `~/Documents/Usher/work/proto/fonts/` to `game/fonts/` (keep `OFL-IMFell.txt`). Optional art: Harry Clarke's 1919 Madeline plate (`~/Documents/Reading/projects/fall-of-the-house-of-usher/dist/clarke.jpg`, public domain) and Aubrey Beardsley's 1894 Usher drawing (`…/dist/beardsley.jpg`, CC0); if you use either, copy it to `game/art/` and credit it in `game/CREDITS.md`. Read-only access to the reading edition: change nothing there.

## Files you own
`game/index.html`, `game/style.css`, `game/engine/**`, `game/fonts/**`, `game/art/**`, `game/CREDITS.md`, and `work/build/SPINE-REPORT.md`.

## Must not touch
`game/games/**` (other builders own each game folder; you may only read them), `DECISIONS.md`, `STATE.md`, `AGENTS.md`, `briefs/`, `handoffs/`, `work/story/`, `work/concept/`, `work/design/`, `source/`, and the reading edition. No deploys, no GitHub Pages, no sharing links.

## Version history
**Don't commit or push.** Several builders share this checkout, so the coordinator commits everyone's work at checkpoints. Stage nothing.

## Verify
Serve `game/` with `python3 -m http.server` and play it start to end in a real browser (the Claude desktop app's built-in browser works), at laptop and phone widths, with no console errors.

## Report back
Write `work/build/SPINE-REPORT.md` (at most 200 words): what works, how to run it, what's stubbed, known issues. Update it as you go: the coordinator reads it. When the skeleton runs end to end with stubs, say so at the top of the report.
