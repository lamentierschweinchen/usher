# Plug-in contract: spine ⇄ mini-games

Every builder codes against this. The coordinator owns this file; ask before changing it.

## Layout
```
game/
  index.html          spine: title, map, encounters, chapter flow, ending   (spine builder)
  style.css           shared tokens and spine styles                        (spine builder)
  engine/*.js         spine code                                            (spine builder)
  fonts/              IM Fell English + OFL text                            (spine builder)
  shared/             cut library: silhouettes, lace, backdrops, tokens      (lead artist)
  games/<id>/game.js  one mini-game, an ES module                           (that game's builder)
  games/<id>/index.html  standalone dev harness for that game               (that game's builder)
  games/<id>/*         any other files that game needs                       (that game's builder)
```
Chapter ids: `tarn`, `door`, `studio`, `burial`, `nights`, `trist`, `flight`.

Serve with `python3 -m http.server` from `game/` (ES modules don't load from `file://`).

## The module
```js
// game/games/<id>/game.js
export default {
  id: 'door',
  title: 'The Door',
  mount(stage, api) {
    // build everything inside `stage` (an empty <div> the spine sizes and clears)
    // ...
    return () => { /* cleanup: timers, listeners */ };
  }
};
```

## `api` (provided by the spine; the dev harness stubs it)
- `api.done(result)`: call exactly once when the chapter ends. `result = { won: true|false, score: { "<label>": number, ... }, note: "optional one-line epitaph" }`. Score labels are read back in the ending's confession, e.g. `{ "taps hushed": 41 }`, so word them in the game's voice. Optional: `rather: { "<label>": "red correction" }`, the confession's *say, rather:* line for that score; the spine falls back to its own glosses when absent.
- `api.state`: a read-only object of flags from earlier chapters (e.g. `state.tapsHushed`). Never require a flag; always have a default.
- `api.setFlag(key, value)`: write a flag for later chapters.
- `api.reducedMotion`: boolean. Honour it.

## Look (shared)
- **Direction: Shadow Theatre** (Lukas, 2026-10-26). Follow `work/design/LOOK.md` and build every figure, house and prop from `game/shared/` (import `../../shared/cuts.js`, link `../../shared/shadow.css`), so the whole game is cut by one hand.
- Render into an SVG with `viewBox="0 0 960 640"` (or a canvas scaled to the stage) so the game scales from phone to laptop. The stage keeps a 3:2 box.
- CSS custom properties, defined by the spine and also by each dev harness: `--paper:#f2eee5; --ink:#29272a; --muted:#625d5a; --rule:#cbc3b8; --red:#7a3939; --serif:'IM Fell English', Georgia, serif;`. Fonts at `../../fonts/im-fell-normal.woff2` and `im-fell-italic.woff2` relative to a game's folder.
- Ink on paper. Red only for emphasis and the tarn's truth.
- No audio unless synthesized in code and optional; never load-bearing. No network requests.
- Mouse and touch. No instructions screen: teach by doing, in a line of type at most.
- Scope each style to the game's own root class (`.g-<id>`) so games can't break the spine.

## Flags registry (canonical keys; set with `api.setFlag`, read from `api.state` with defaults)
| Chapter | Key | Value |
|---|---|---|
| tarn | `tarnCaught` | `'unaided'` \| `'hinted'` |
| tarn | `tarnGlancesDown` | number |
| tarn | `tarnSawHer` | boolean |
| door | `doorRoute` | `'long'` \| `'short'` |
| door | `stonesAskew` | number (0 or 4) |
| door | `doorHouseMoves` | number |
| studio | `tapsHushed`, `tapsSpared` | numbers |
| studio | `knockSpared` | boolean |
| burial | `burialScrewOut` | boolean (a screw left out; the flight reads it) |
| burial | `burialGlimpses` | number (times the physician got a look) |
| nights | `nightsUnexplained` | array of strings, the noises left unexplained in their original words (the nights spec calls this `nights`; use this key) |
| nights | `nightsStair` | `'unexplained'` or the excuse id used on her step |
| nights | `nightsAgreed` | number |
| trist | `tristLastBlow` | `'struck'` \| `'gust'` |
| trist | `tristBlows` | number |
| flight | `flight` | `{ madeline: 'out' \| 'under', looks: number, fell: boolean }` |

"Spared" in the flight means `tapsSpared > 0 || knockSpared`.
