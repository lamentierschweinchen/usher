# VII · Flight: A Thousand Waters

## 1. Pitch
Grandmother's Footsteps on a sinking causeway: everything you silenced follows you out, and freezes only while you look back, which is when the house falls fastest.

## 2. First ten seconds
You're already running right across the causeway towards a servant holding your horse. Everything behind you is under an ink veil. A red gleam shoots along the path, and one line appears: *Hold anywhere to look back.* You hold, and the guest turns. The house is split by a red, moonlit fissure, and a word, *tap.*, is frozen mid-hop, closer than you expected. You look again later, and it's nearer.

## 3. Loop and escalation
**Hold:** you stand, the followers freeze, and stones drop fast. **Release:** you run, the followers gain, and stones drop slowly. Splash rings show through the veil.
1. **The tap:** one follower teaches the rule.
2. **The throng:** the door spills the house's noises: *crack, rip, shriek, clang*, and whatever you hushed. A word that reaches you clings to your coat and slows you. If you hold long enough, the collapse swallows the frozen words, and nearly you.
3. **Her:** a white figure steps out of the falling dust. She is the one thing that doesn't freeze, so players look harder.

## 4. The trick
It remembers. The chase is your scorecard: each hushed tap returns as a *tap.* Each mercy walks beside her instead, in red. On the bank you're safe, and she's still walking. She was never chasing you. Your look is the only thing that speeds the fall, and the veil hides her. To save her, stand in the dark and don't turn round.

## 5. Choice and confession
**Reads** (all optional; the coordinator aligns the keys):
- `studio.spared`: if false, 1 to 5 *tap.* followers (`tapsHushed`/10, default 3). If true, none, and a red *tap.* walks with her.
- `burial.screwOut`: a screw shows in a middle stone, and the collapse stalls there for 5 s.
- `nights.unexplained` (string): that word walks with her, in red.

**Writes** `api.setFlag('flight', {madeline:'out'|'under', looks, fell})`.

**`api.done`**: `won: !fell`. Score labels, with suggested glosses:
- `times I turned to see`: *and each time it fell faster.*
- `noises that caught up with me`: *every one I'd hushed.*
- `ladies left on the causeway` (0 or 1): *my friend's sister.* / *she took the horse.*

Note when she gets out: "She took my horse. 'It's been some weeks, ma'am,' said the servant."

## 6. For connoisseurs
- "I turned to see whence a gleam so unusual could have issued" [u50]: the tarn's *look down*, turned round.
- "While I gazed, this fissure rapidly widened": timing becomes cause.
- "The vast house and its shadows were alone behind me": every look disproves this.
- The Haunted Palace's "hideous throng" rushes out through the pale door [u25].
- Orpheus, reversed: Poe's Madeline dies on the threshold, and ours may take your horse.

## 7. Build spec
- **Stage:** one SVG, 960×640, root `.g-flight`, using 1-D x positions.
  - Tarn below y 440, with 24 stones from x 150 to 880.
  - House at the left, with a red fissure.
  - Servant and horse at the right.
- **Guest:** two-frame run, flipped while looking. Speed 24 px/s, minus 3 for each clinging word (floor 12).
- **Veil:** black at 0.9, from x 0 to guest − 40. It fades over 150 ms while held.
- **Input:** pointer down and up on the stage, or Space. A tap counts as a 0.4 s look.
- **Followers:** IM Fell italic text. They move at 34 px/s, or 0 while looked at, and cling within 12 px.
- **Collapse:** starts at x 150 and moves at 14 px/s, or 60 px/s while looking. Stones drop with splash rings, and anything behind the collapse sinks.
- **Beats:** start at guest x 330 and 600, each marked by a red gleam. Madeline spawns 120 px ahead of the collapse and walks at 26 px/s.
- **End:** at x 880, looking still works. When she arrives or sinks, or after 12 s, a forced look plays: the house splits and sinks behind a waterline clip. If the collapse reaches the guest, he sinks.
- **Reduced motion:** fades.

**Don't build:** scrolling, steering, rain, Roderick, a retry screen, audio or collapse physics.

## 8. Risk
After one run, ask: "What does looking back do?" If players can't name both effects, the rule is unreadable. Exaggerate the crawl and splashes while held.
