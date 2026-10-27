# Tarn: A Somewhat Childish Experiment

## 1. Pitch
A parlour spot-the-difference, house above, reflection below, that cheats: it takes back a find while you look away, and only the water never lies.

## 2. First ten seconds
One ink drawing: the house at dusk, its upside-down twin in hatched water. Top left, the only type: *Find the five differences.* and five empty rings. The only red is a zigzag crack up the reflected wall; above, the wall is clean. The player taps it. A red circle draws round both spots; a ring fills. Rule learned.

## 3. Loop and escalation
- **Honest (0:00–0:25).** Big finds, any order: the crack; chimney smoke above, cold below; dead tree standing above, fallen below; shutters shut above, open below; door shut above, ajar below. Misses leave a fading grey tick.
- **The cheat (0:25–0:50).** Just after the fourth find, an earlier circle unwinds, its ring empties to a red smear, and the house redraws that detail to match the water: the smoke stops. Tap the spot again: the circle returns doubled, the house flinches, its smoke resumes. Caught.
- **Looked back at (0:50–1:10).** Five rings full. In the water only, a window dark above lights red; someone in it faces up. Tap her: your circle starts, an ink cross strikes it through, the light goes out. Leave her: it goes out after five seconds.

## 4. The trick
Players suspect the copy. Here the water never changes; the house does, while you look elsewhere, and its fix is the lie: *there was never a difference.* To finish, trust what you saw over what the house shows. Then it cheats once more and wins: the find that matters doesn't count. Players leave glancing down first.

## 5. Choice and confession
- `api.setFlag`: `tarnCaught` ('unaided' or 'hinted'), `tarnGlancesDown` (water-half taps), `tarnSawHer` (tapped the window).
- `api.done({ won: true, score: { "differences found": 5, "glances down": n }, note: "Five of five. The house thanks you." })`
- Glosses: *glances down*, say, rather: everyone does (the letter's P.S.). *Differences found*, say, rather: and one window you didn't count (or, if she was tapped, crossed out). STORY's "Seven" becomes "Five".

## 6. For connoisseurs
The narrator's cure, "a mere different arrangement of the particulars" [u02], becomes a parlour game. Only a "scrutinizing observer" sees the fissure [u06]; only the water admits it. The self-correcting house is Roderick's sentient stones, alive in their "reduplication in the still waters" [u26]. It never cheats the crack: it won't crack to hide one. The window: "vacant and eye-like" [u02] turned "red-litten" [u25].

## 7. Build spec
- SVG 960×640, root `.g-tarn`, waterline y=340. `drawHouse(states)` from plain shapes. Call twice: false states above; true states mirrored below (`translate(0,680) scale(1,-1)`), in `--muted` over ink hatching.
- Diffs `{id, x, y, r, house, water}`, hit radius ≥ 70, tested at (x,y) and (x,680−y): crack (430,200,r90), smoke (640,70), tree (150,230,r80), shutters (580,180), door (480,290).
- **Find:** red circle at both points (400 ms draw); a ring fills.
- **Cheat (once, 700 ms after find 4):** smoke if found earlier, else the earliest non-crack find. Unwind 1.2 s, ring to smear, house state set to the water's.
- **Catch:** tap that spot: double circle, refill, restore house state, 4 px jolt.
- **Hint:** only the cheated spot left, 10 s idle: the smear drips.
- **Window:** 1 s after five; red rectangle, paper figure at (360,530). Tap: partial circle, ink X, light out; else out at 5 s. `api.done` 1.2 s later.
- **Reduced motion:** fades, no jolt, static drip.

**Don't build:** timer, pop-ups, penalties, worded hints, zoom, random layouts, a second unwind, ripples, the horse, the house splitting (the flight's), dialogue or outro (the spine's; this window is STORY's tarn beat, so the spine needn't repeat it).

## 8. Risk
The unwind reads as a bug. Check: of five first-time phone players, do three re-tap the cheated spot before the drip and say "the house changed it"? If they say "glitch", redraw the detail in heavier, fresher ink.
