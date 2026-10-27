# Brief: redesign the "nights" chapter of "A Sojourn of Some Weeks"

You are a mini-game designer (WarioWare, Rhythm Heaven, Professor Layton, A Little to the Left, Papers, Please, Zelda dungeons). Your job: take one chapter's game, meet the critic's challenge, and improve it **materially**, then write a spec a builder can produce in about 30 minutes. Lukas, a writer and artist, makes the calls. His words: "challenge each game and improve it materially before going to production — they should fit the overall mood, not be too shallow and be fun and intriguing on their own accord and not feel tedious."

## Read
1. `~/Documents/Usher/DECISIONS.md`: Lukas's calls. Poe is the frame, not the cage; delight for anyone, more for connoisseurs; the game plays the player.
2. `~/Documents/Usher/work/design/SPINE.md`: the whole game (an adventure through the house, a mini-game at each turn of the plot).
3. `~/Documents/Usher/work/design/CRITIQUE.md`: all of it, especially your chapter and **Across the run**.
4. `~/Documents/Usher/work/design/CONTRACT.md`: the technical contract (module shape, `api.done`, `api.setFlag`, 960×640 SVG, palette, no audio).
5. Your chapter's source idea: ~/Documents/Usher/work/story/01-narrator-v2.md (Merely Electrical Phenomena).
6. `~/Documents/Usher/source/usher-1845.md`: at least [u26], [u31]–[u32], [u36], [u40], [u45]; ideally the whole tale.
7. If they exist yet, `~/Documents/Usher/work/design/STORY.md` (script) and `LOOK.md` (visual language). Fit them.

## Your chapter: nights
**Where it sits:** Chapter 4: the nights in the guest bedroom, directly above the vault. (Sealed in the first slice; designed now so it can be built if time allows.)
**The critic's challenge:** Make it *Papers, Please*. Each noise has details (where, when, how loud); each excuse has limits ("the draperies" can't reach below the floor). Stamps are scarce, each night adds a rule, and the player picks what goes unexplained. Gloss every excuse in plain words.
**This chapter's own trick** (each chapter tricks the player differently): Pick your own (it must differ from the others: cheats, steers, rewards the wrong thing, follows, swaps who you are). Suggestion: it agrees with you.
**Its verb** (neighbours must not share an input): Inspect and stamp (judgment).
**Budget:** About 3 minutes for all the nights together.
**Confession choice:** the player chooses what goes unexplained; record it.

## Rules for every game
- Teach by doing, with at most one line of type. Hook within ten seconds. Minute two must differ from minute one.
- Big touch targets on a phone; mouse and touch both work. Ink on paper, red only for the truth. No audio (silence is fine).
- Fun and intriguing on its own, for someone who has never read Poe; a second layer for those who have.
- Small enough for one builder in about 30 minutes. Name what *not* to build.

## Deliver
`~/Documents/Usher/work/design/games/nights.md`, 600 words at most:
1. **Pitch:** one line (genre plus this chapter's trick).
2. **First ten seconds:** what's on screen and what the player does without being told.
3. **The loop and its escalation:** three beats, so it deepens instead of repeating.
4. **The trick:** exactly how it plays the player.
5. **The choice and the confession:** flags to `api.setFlag`, and score labels for `api.done` in the game's voice.
6. **For connoisseurs:** the Poe it bends.
7. **Build spec:** the elements, interactions, states and end condition, concretely. Then a short **don't build** list.
8. **Risk:** the one playtest check that tells us it works.

About 10 minutes. Write only that file. Reply with its path and the pitch line.
