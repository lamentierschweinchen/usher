# Usher — agent notes

A small browser game from Poe's "The Fall of the House of Usher". Lukas makes the calls; a coordinator session briefs specialists.

Read first: `STATE.md` (where we are), `DECISIONS.md` (Lukas's calls), then `briefs/00-founding-brief.md`.

- Source text: `source/usher-1845.md`, exported from Lukas's reading edition (~/Documents/Reading/projects/fall-of-the-house-of-usher). Public domain. Cite by block id, e.g. [u48].
- History: public GitHub repo `lamentierschweinchen/usher` (approved by Lukas 2026-10-26). Push completed checkpoints to `main`. Anything here is public: no secrets, no private material. Sharing the game or any other deploy is a separate call of Lukas's.
- Test build (Lukas, 2026-11-05): https://lamentierschweinchen.github.io/usher/ , public but unannounced and `noindex`. It's published from `game/` only by hand: `gh workflow run pages.yml`. Pushing to `main` publishes nothing.
- Specialists write to `work/`, never to `DECISIONS.md` or `STATE.md` (the coordinator owns those).
- Don't modify the reading edition; read from it only.
- Preview servers listen on loopback only: `python3 -m http.server <port> --bind 127.0.0.1` (work/audio/LOOPBACK-RECEIPT.md).
