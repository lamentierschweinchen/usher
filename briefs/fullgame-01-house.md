# Brief: a blueprint for the full game of *A Sojourn of Some Weeks* (Mystery designer: the house)

## Where we are
Lukas, a writer and artist who makes the calls, made a small browser game from Poe's "The Fall of the House of Usher" with a team of agents. It works: a cutaway map of the house over its reflection in the tarn, in a cut-paper Shadow Theatre look, with seven chapters, each a different familiar game that tricks you differently (tarn: spot-the-difference that cheats; door: sliding puzzle played from the hole; studio: whack-a-mole for Roderick; burial: stealth carry; nights: Papers, Please for the noises under your bed; trist: woodcut quest that turns into Madeline's escape; flight: look back as the house sinks), and an ending that reads your scores back as a confession. A critic played it: about 24 minutes, 6.5/10 for a general player and 8/10 for a literary connoisseur. The verdict: witty, beautiful, original, but seven toys on a map, with no mystery pulling you forward, thin characters, invisible choices, and games that play themselves.

Now there is no deadline. Lukas wants "a fully-fledged game full of intrigue, wit, and fun", about 75–90 minutes, one evening.

## Lukas's latest calls (verbatim, binding)
> "I disagree that only the water should 'tell the truth', that's too easy and becomes predictable. it shouldn't always be clear what is true and the deceit should be delightful. you can lean on the water but it's fluid and reflections can be tricky."
> "i like the idea of the mirror!"

"The mirror" is the coordinator's proposal: after the ending, the title's reflection, *A Burial of Some Weeks*, becomes a second act, played from the tarn as Madeline, in the upside-down house, with every chapter's trick turned inside out. Every blueprint must include a version of it.

## Read (all of it) and play
1. `~/Documents/Usher/DECISIONS.md`: every call Lukas has made, in his words. Delight for anyone, more for connoisseurs; Poe is the frame, not the cage; the game plays the player; silence or music we can make; Shadow Theatre.
2. `~/Documents/Usher/source/usher-1845.md`: the whole tale.
3. `~/Documents/Usher/work/design/` (`SPINE.md`, `STORY.md`, `LOOK.md`, `CONTRACT.md`, `games/*.md`): what exists.
4. `~/Documents/Usher/work/review/EXPERIENCE-CRITIQUE.md` and `COORDINATOR-TAKE.md`.
5. **Play the current game** for at least the first two chapters and the ending: serve `~/Documents/Usher/game` with `python3 -m http.server <free port>` in the background and open it (`?chapter=<id>` jumps, `?debug` adds a skip). Use headless Chromium if the shared browser pane is busy (a Playwright install is at `/Users/ls/Documents/Down the Drain/node_modules/playwright`, read-only). Keep scratch files in `…/scratchpad/fullgame-house/` (the scratchpad is shared).

## Your lens
You design investigation games: Return of the Obra Dinn, Outer Wilds, Her Story, Paradise Killer, The Case of the Golden Idol. **Your backbone: the house is the game.** Between chapters, the player investigates the cutaway house and its reflection: rooms that change, objects and portraits to inspect, the library, Roderick's paintings, the paired portraits with one face painted out. A family secret is assembled across the evening. The chapters are the set pieces where the investigation is tested.

Two other designers are writing blueprints from other lenses in parallel. Commit to yours; a later round will have you critique theirs.

## Deliver
`~/Documents/Usher/work/fullgame/01-house.md`, 1,400 words at most:
1. **Name and one-line pitch.**
2. **The shape:** acts and chapters, with minutes, adding up to 75–90.
3. **What the player does between chapters**, minute to minute: the verb that makes the house a game.
4. **The truth and deceit system:** who and what testifies (the guest's account, the house above, the tarn, the characters, the games' own scores), how each lies, and how a player can, with wit and attention, see through it. The water leans true but ripples, inverts and flatters. Say exactly what red means now. Make the deceit delightful and fair, never arbitrary.
5. **The mystery:** the family secret (the Ushers' "direct line", the twins) or a better one; what the player learns when, and the reveal.
6. **Characters and arcs:** the guest, Roderick, Madeline, the physician, the valet; how the player's relationship with Roderick is felt and changed.
7. **The seven chapters, grown up:** for each, how it becomes 8–12 minutes with three acts (learn, complicate, turn), real stakes, and choices the player knows they're making. Fix "plays itself". Keep what the critic loved (nights, burial's feet, trist's turn).
8. **The mirror act:** how *A Burial of Some Weeks* plays, how it reuses the art and games, and what it reveals that the first act couldn't.
9. **Endings:** three or four, and what earns each.
10. **Music and sound:** what a score we can make in code (Roderick's speaking guitar, Von Weber's "last waltz", "The Haunted Palace") does for play.
11. **Build plan:** reuse versus new, and a first milestone (what we build first so Lukas can feel the new game within a day).
12. **The risk.**
13. **A sample moment** (at most 150 words) of delightful deceit, as the player would meet it.

Concrete beats over adjectives. One committed blueprint, no menus. About 25 minutes. Write only that file; don't commit. Reply with the path and a three-line summary.
