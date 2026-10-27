# A Sojourn of Some Weeks: experience critique

*Played 27 October 2026, letter to "Nevertheless.", in headless Chromium at 1280×800 with real mouse input, then at 390×844. Documents and tale read afterwards.*

**Method.** My controls run at agent speed, so I played the studio twice: once idle, once with a human-paced reflex loop (about 420 ms reaction). Where I stalled, I read the code for the rule; each stall is listed below. Nothing blocked me outright, I never needed `?chapter=`, and there were no console errors.

## Ratings

| | General | Connoisseur | Why |
|---|---|---|---|
| Story | 6 | 8 | Clear and funny, and the twist (she takes your horse) lands; the arcs live in captions you click past. |
| Gameplay, overall | 6 | 6 | Seven genres, two excellent; most end as you learn them, and three play themselves. |
| · tarn | 7 | 7 | A clean spot-the-difference with a real trick (the house cheats), badly signalled. |
| · door | 4 | 6 | A lovely idea that reads as a slide puzzle and ends after three moves. |
| · studio | 6 | 6 | Four distinct gestures and a hidden priority (the red tap), but an idle player passes. |
| · burial | 7 | 8 | A real lure puzzle; the bare feet under the coffin are the game's best image. |
| · nights | 8 | 9 | Papers, Please with slips that rewrite themselves ("Quite so."). The high point. |
| · trist | 7 | 8 | The page-turn reveal is superb; the heartbeat climb's mercy rule empties it. |
| · flight | 4 | 6 | One gorgeous look back, then it's over in about 20 seconds. |
| Creativity and originality | 8 | 9 | Every mechanic is a line of the tale taken literally. |
| Art and visual design | 8 | 8 | Cohesive cut-paper theatre and the mirror motif; the map is static and the labels small. |
| Writing and wit | 8 | 9 | "Is that wool? It's terribly loud." Dry, exact, consistently funny. |
| Mystery and intrigue | 4 | 6 | The pull is "what's the next toy?" The tarn's truths sit behind an unprompted click. |
| Literary depth | 6 | 8 | The titles, the reversed echo, the gust, twin burials: rewarding, never required. |
| Pacing and flow | 5 | 5 | The same rhythm seven times (captions, card, game, caption); chapters run 1 to 5 minutes. |
| Onboarding and clarity | 5 | 5 | The one-line prompts mostly work; the door, the burial rule, the tarn counter and the threshold don't. |
| Cohesion | 7 | 8 | The motifs and the confession make seven toys one game; the spine itself has no play. |
| Technical polish | 7 | 7 | Stable, but there's no save, outros contradict outcomes, and the ledger clips. |
| **Overall** | **6.5** | **8** | A witty, beautiful 24-minute gallery that isn't yet a game you want to solve. |

## What a first-time player meets

- **The mystery is hidden.** The tarn's six truths ("Madeline lying down on a long table in the cellar. Very neatly. A little early.") appear only if you click the water while a room prompt waits. Nothing asks you to, and I missed every one.
- **Outros contradict play.** I left the studio idle. The card said "Roderick heard it. He did not thank you." The map then said "Everything is hushed. Roderick thanks you." I left three screws, and the map said "Four screws home." Intended or not, it reads as a bug, and it steals the confession's irony.
- **Games play themselves.** The door opened on my third move, because the house moves whenever you pause for 7 seconds. The studio and the flight pass whether you act or not. The heartbeat forgives everything after six misses. My threshold stroke didn't register, so the gust chose for me. A minute after I'd killed the dragon, the ledger said "Dragons slain: none."
- **Signals.** After the tarn cheats, five dots look lit while the text says "4 of five". The burial's rule arrives only after you're caught.
- **Craft.** The ledger's heading clips at 1280×800; a refresh loses everything; in portrait, the games letterbox and the nights cards clip. Roderick's key line, "I sent for you because you never hear anything", flashes past while you're drawing on the beat.
- **Genuinely good.** The self-rewriting slip and the red route to your door. "You've got the heavy end?" "I thought you had." The Trist turning over. Your unaccounted-for noises chasing you. The confession.

## Before Lukas's first playthrough (each under an hour)

1. **Prompt the tarn.** After each outro, pulse the water and change the prompt to "Look down, then to the studio." Play the first glance automatically.
2. **Branch the outros on flags** (studio hushed or spared, three screws or four, struck or gust), or print the mismatch in red under "say, rather:" so the lie reads as deliberate.
3. **Let the door be a puzzle first.** Keep the house still until the player's first move and raise the idle to 15 seconds. Then hold the open door, with her in it, for 3 seconds: "It opened. You hadn't finished."
4. **Fix the signals.** Make the tarn counter match the dots, and empty the cheated dot visibly. Show the burial hint before the first catch. Let any stroke in the doorway count at the threshold, with a visible cue.
5. **Save and fit.** Keep the chapter and flags in sessionStorage so a refresh resumes, and scale the ledger to the stage.

## To become a fully-fledged game (ranked)

1. **Make the tarn the engine.** Let the player search the house between chapters for clues that show only in the water, and fill in the Account themselves before the house corrects it.
2. **Consequences you can see.** What you hush, explain and screw down should change later chapters and the ending. The flags exist: surface them, and add three or four endings.
3. **Give the cast choices.** Turn the nights verb into dialogue: you choose the explanation ("The draperies, old man") and people react. Let the physician be trusted.
4. **Three acts per chapter** (learn, complicate, turn) over 8–12 minutes, where failure costs something. The flight should be the climax its spec describes, not an epilogue.
5. **Score and replay.** A silent-film piano score you can make, scored around silence in the studio and the nights; then a second pass with the red corrections running live.

## Playtime

| Chapter | My run (incl. tool latency) | First-time player, playing properly |
|---|---|---|
| Letter and arrival | 0:40 | 1:00 |
| I · tarn | 2:10 | 2:30 |
| II · door, with talk | 2:10 | 2:00 |
| III · studio, with talk | 3:30 | 3:15 |
| IV · burial, with talk | 5:10 | 5:00 |
| V · nights, with talk | 3:45 | 4:30 |
| VI · trist | 3:30 | 3:30 |
| VII · flight and ending | 2:20 | 2:30 |
| **Total** | **≈23 min** | **≈24 min (20–30)** |

Map walking and encounters account for about 3 minutes of that.

**Ideal: about 90 minutes, one evening.** The tale reads in about 40. Twice that gives each chapter 8–12 minutes to escalate, plus 20–25 minutes of house to investigate. Shorter, and the confession has little to confess; past two hours, the one joke (the man who explains everything away) wears thin.

## The single most important note

Make the player look down. The game's best idea, a tarn that shows the truth one step ahead, sits behind an unprompted click, so the 24 minutes play as seven well-dressed tutorials joined by captions. Give the water a reason to be read and a consequence for reading it, and the mystery, the cohesion and the confession all get stronger at once.
