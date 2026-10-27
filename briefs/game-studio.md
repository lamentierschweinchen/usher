# Brief: redesign the "studio" chapter of "A Sojourn of Some Weeks"

You are a mini-game designer (WarioWare, Rhythm Heaven, Professor Layton, A Little to the Left, Papers, Please, Zelda dungeons). Your job: take one chapter's game, meet the critic's challenge, and improve it **materially**, then write a spec a builder can produce in about 30 minutes. Lukas, a writer and artist, makes the calls. His words: "challenge each game and improve it materially before going to production — they should fit the overall mood, not be too shallow and be fun and intriguing on their own accord and not feel tedious."

## Read
1. `~/Documents/Usher/DECISIONS.md`: Lukas's calls. Poe is the frame, not the cage; delight for anyone, more for connoisseurs; the game plays the player.
2. `~/Documents/Usher/work/design/SPINE.md`: the whole game (an adventure through the house, a mini-game at each turn of the plot).
3. `~/Documents/Usher/work/design/CRITIQUE.md`: all of it, especially your chapter and **Across the run**.
4. `~/Documents/Usher/work/design/CONTRACT.md`: the technical contract (module shape, `api.done`, `api.setFlag`, 960×640 SVG, palette, no audio).
5. Your chapter's source idea: ~/Documents/Usher/work/concept/05-genre-mashup.md (Hush).
6. `~/Documents/Usher/source/usher-1845.md`: at least [u08]–[u16], [u11] especially, [u48]; ideally the whole tale.
7. If they exist yet, `~/Documents/Usher/work/design/STORY.md` (script) and `LOOK.md` (visual language). Fit them.

## Your chapter: studio
**Where it sits:** Chapter 2: Roderick's studio. Madeline crosses the room; a tap comes from below.
**The critic's challenge:** Give each pest its own gesture (draw the drape, pinch the rose, hold the band), and make hushing her tap the game's most rewarding act. The player must *want* to do it.
**This chapter's own trick** (each chapter tricks the player differently): It rewards the wrong thing.
**Its verb** (neighbours must not share an input): A different gesture per pest (drag, pinch or hold, swipe, tap): a WarioWare medley, not one tap in eight costumes.
**Budget:** About 2.5 minutes, with a climax.
**Confession choice:** the player can spare the tap (leave it unhushed) at a real cost to their score; set a flag either way.

## Rules for every game
- Teach by doing, with at most one line of type. Hook within ten seconds. Minute two must differ from minute one.
- Big touch targets on a phone; mouse and touch both work. Ink on paper, red only for the truth. No audio (silence is fine).
- Fun and intriguing on its own, for someone who has never read Poe; a second layer for those who have.
- Small enough for one builder in about 30 minutes. Name what *not* to build.

## Deliver
`~/Documents/Usher/work/design/games/studio.md`, 600 words at most:
1. **Pitch:** one line (genre plus this chapter's trick).
2. **First ten seconds:** what's on screen and what the player does without being told.
3. **The loop and its escalation:** three beats, so it deepens instead of repeating.
4. **The trick:** exactly how it plays the player.
5. **The choice and the confession:** flags to `api.setFlag`, and score labels for `api.done` in the game's voice.
6. **For connoisseurs:** the Poe it bends.
7. **Build spec:** the elements, interactions, states and end condition, concretely. Then a short **don't build** list.
8. **Risk:** the one playtest check that tells us it works.

About 10 minutes. Write only that file. Reply with its path and the pitch line.
