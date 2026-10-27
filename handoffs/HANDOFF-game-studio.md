# Handoff: build the "studio" mini-game (III. The Cheerfulness of My Society)

You are a game builder for **Usher** / *A Sojourn of Some Weeks*, a small browser adventure through Poe's House of Usher with a different mini-game at each turn of the plot, made for a competition. Lukas, a writer and artist, makes the calls. A coordinator session owns the project's records and git, and a separate spine builder is making the map and chapter flow that will mount your game. This file is your whole brief.

## Read first
1. `~/Documents/Usher/work/design/games/studio.md`: **your spec.** It was challenged by a critic and redesigned; build it faithfully, and where it's silent, choose what makes it more fun.
2. `~/Documents/Usher/work/design/CONTRACT.md`: the plug-in contract. Follow it exactly: ES module `game/games/studio/game.js` with `mount(stage, api)` returning a cleanup function, `api.done({won, score, note})` called once, `api.state` / `api.setFlag`, SVG `viewBox 0 0 960 640`, scoped styles under `.g-studio`.
3. `~/Documents/Usher/work/design/LOOK.md`: the visual language (ink on paper, toy theatre, the tarn as a negative, red only for the truth, IM Fell English, Gorey-style figures, motion rules), especially section 7, "Mini-games: one book".
4. `~/Documents/Usher/work/design/STORY.md`: the script and voice; use its lines for your chapter.
5. `~/Documents/Usher/DECISIONS.md`: Lukas's calls.
6. `~/Documents/Usher/source/usher-1845.md`: the tale, at least the passages your spec cites.

## The bar
Fun and intriguing on its own, for someone who has never read Poe; a second layer for those who have. Hook within ten seconds, no instruction screen, minute two different from minute one, never tedious. Beautiful in ink. Phone and laptop, mouse and touch, big targets. Silent (sound-words are type). Honour `api.reducedMotion`.

## Build
- `game/games/studio/game.js` (the module) and `game/games/studio/index.html` (a standalone dev harness that defines the CSS tokens and fonts from the contract, stubs `api`, mounts the game in a 3:2 stage, and shows the `done` result). Anything else your game needs goes in the same folder.
- Fonts are at `game/fonts/` (`../../fonts/` from your folder). No network requests, no libraries.
- Test: `cd ~/Documents/Usher/game && python3 -m http.server 8102`, then open `http://localhost:8102/games/studio/` in a real browser (the Claude desktop app's built-in browser works). Play it start to finish at laptop and phone widths; no console errors; `done` fires once with sensible scores and flags.
- Timebox: about 30 minutes. At about 20 minutes, stop adding and make the whole run clean.

## Files you own
`game/games/studio/**` and `work/build/studio-REPORT.md`. Nothing else.

## Must not touch
Anything outside those paths: other games' folders, the spine (`game/index.html`, `game/engine/`, `game/style.css`), `work/design/`, `DECISIONS.md`, `STATE.md`, `briefs/`, `handoffs/`, `source/`, the reading edition. No deploys or sharing links.

## Version history
**Don't commit or push.** Several builders share this checkout; the coordinator commits at checkpoints.

## Report back
Write `work/build/studio-REPORT.md` (at most 150 words): what's built, how to play it in the harness, the flags and score labels it emits, known issues. Then end your turn with a two-line summary.
