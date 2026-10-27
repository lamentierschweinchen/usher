# Spine report

**Act one plays start to end; milestone 1's loop runs.** Headless Chrome at 1280×800 and 844×390 (landscape), with stubs, plus all seven real games: no console errors.

**Run:** `cd game && python3 -m http.server 8790`. Milestone: `?chapter=studio&through=studio`. Also `?games=none` stubs, `?debug` skips.

**Milestone §1–2, done:**
- Save in `localStorage['usher.save.v1']` (guarded; old save migrated). Refresh resumes a plain run or a `through` entry, act two included.
- `api.mode`, `api.record` (act one, capped 4,000), `api.ghost` (act two; fixture if under 10 hushes), `api.rewrite`.
- **Nevertheless.** fades the ribbons; *A **Burial** of Some Weeks*; the act-two map: the turned world, light house above (studio lit, rest sealed), black house below, Madeline walking from the vault.
- Her pass: act-one red struck, her back-slanted red line beneath; then **Nevertheless.** (letter) or the studio again.

**For the studio builder:** records are `{type, t, ...data}` plus `event`, the recorded name, since a `hush`'s own `type` (the pest) wins. Add `'studio'` to `GHOSTS` in `engine/registry.js` when `ghost.json` lands.

**Known:** at 10:41 `games/studio/game.js` had no exports (mid-rewrite), so the loop was checked with my two-way stub.
