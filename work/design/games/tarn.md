# Tarn: A Somewhat Childish Experiment

## 1. Pitch
A parlour spot-the-difference, house above, reflection below, that cheats: it takes back a find while you look away, and only the water never lies.

## 2. First ten seconds
The house at dusk over its upside-down twin. The only type: *Find the five differences.*, beside five empty rings. The only red: a zigzag crack up the reflected wall, absent above. Tap it: red circles ring both spots, a ring fills. Rule learned.

## 3. Loop and escalation
- **Honest (0:00–0:25).** Big finds, any order: the crack; chimney smoking above, cold below; tree standing above, fallen below; shutters and door shut above, open below. Misses leave a fading grey tick.
- **The cheat (0:25–0:50).** After the fourth find, an earlier circle unwinds, its ring empties to a red smear, and the house redraws that detail to match: the smoke stops. Re-tap it: the circle returns doubled, the house flinches, smoke resumes. Caught.
- **Looked back at (0:50–1:10).** Five rings full. In the water only, a window lights red; someone in it faces up. Tap her: your circle starts, an ink cross strikes it out, the light dies. Leave her: it dies in five seconds.

## 4. The trick
Players suspect the copy; here the house changes while you look away, and its fix is the lie: *there was never a difference.* Trust what you saw, not what it shows. Then it cheats once more, and wins: the find that matters doesn't count. Players leave glancing down first.

## 5. Choice and confession
- `api.setFlag`: `tarnCaught` ('unaided' or 'hinted'), `tarnGlancesDown` (water-half taps), `tarnSawHer` (tapped the window).
- `api.done({ won: true, score: { "differences found": 5, "glances down": n }, note: "Five of five. The house thanks you." })`
- Glosses: *glances down*: everyone does (the letter's P.S.); *differences found*: and one window you didn't count (if tapped: crossed out). STORY's "Seven" becomes "Five".

## 6. For connoisseurs
The narrator's cure, "a mere different arrangement of the particulars" [u02], made a parlour game. Only a "scrutinizing observer" sees the fissure [u06]. The cheating house is Roderick's sentient stones, alive in their "reduplication in the still waters" [u26]; it won't crack to hide the crack. The window: "eye-like" [u02], then "red-litten" [u25].

## 7. Build spec
- SVG 960×640, `.g-tarn`, waterline y=340. `drawHouse(states)`, plain shapes, called twice: false states above, true states mirrored below (`translate(0,680) scale(1,-1)`) in `--muted` over hatching.
- Diffs `{id, x, y, r, house, water}`, hit r ≥ 70 at (x,y) and (x,680−y): crack (430,200,r90), smoke (640,70), tree (150,230,r80), shutters (580,180), door (480,290).
- **Find:** red circle at both points (400 ms); a ring fills.
- **Cheat (once, 700 ms after find 4):** smoke if found earlier, else the earliest non-crack find. Unwind 1.2 s, ring to smear, house matches water.
- **Catch:** tap that spot: double circle, refill, restore house state, 4 px jolt.
- **Hint:** only the cheated spot left, 10 s idle: the smear drips.
- **Window:** 1 s after five; red rectangle, paper figure at (360,530). Tap: partial circle, ink X, light out; else out at 5 s. `api.done` 1.2 s later.
- **Reduced motion:** fades, no jolt, static drip.

**Don't build:** timer, penalties, worded hints, zoom, random layouts, a second unwind, ripples, the horse, the split (the flight's), dialogue or outro (the spine's; this window is STORY's tarn beat).

## 8. Risk
The unwind reads as a bug. Check: do three of five first-time phone players re-tap the cheated spot before the drip, saying "the house changed it"? If they say "glitch", ink the redrawn detail fresher.
