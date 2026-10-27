# Flight: A Thousand Waters

## 1. Pitch
Grandmother's Footsteps on a sinking causeway: everything you silenced follows you out, and freezes only while you look back, which is when the house falls fastest.

## 2. First ten seconds
Already running towards your horse; behind you, an ink veil. A red gleam shoots past; one line: *Hold anywhere to look back.* Hold: you turn, the house is split by a red fissure, and *tap.* is frozen mid-hop, too close. Next look, closer.

## 3. Loop and escalation
**Hold:** you stand, followers freeze, stones drop fast. **Release:** you run, followers gain, stones drop slowly.
1. **The tap:** one follower teaches the rule.
2. **The throng:** the house's noises pour out: *crack, rip, shriek, clang*, and whatever you hushed. Words that reach you cling and slow you. Hold long enough and the collapse swallows frozen words, and nearly you.
3. **Her:** a white figure who doesn't freeze when watched. Players look harder.

## 4. The trick
It remembers. The chase is your scorecard: each hushed tap returns as *tap.*; each mercy walks beside her, in red. Safe on the bank, you see nothing; she's still walking. She never chased you. Only your look speeds the fall. To save her, stand in the dark and don't turn round.

## 5. Choice and confession
**Reads** (optional; coordinator aligns keys):
- `studio.spared`: false gives 1–5 *tap.* followers (`tapsHushed`/10, default 3); true gives a red *tap.* beside her.
- `burial.screwOut`: a screw pins a middle stone; the collapse stalls there 5 s.
- `nights.unexplained`: that word walks beside her, in red.

**Writes** `api.setFlag('flight', {madeline:'out'|'under', looks, fell})`.

**`api.done`** (`won: !fell`), glosses suggested:
- `times I turned to see`: *and each time it fell faster.*
- `noises that caught up with me`: *every one I'd hushed.*
- `ladies left on the causeway`: *my friend's sister.* / *she took the horse.*

Note if she's out: "She took my horse. 'It's been some weeks, ma'am,' said the servant."

## 6. For connoisseurs
- "I turned to see" [u50]: the tarn's *look down*, turned round.
- "While I gazed, this fissure rapidly widened": timing becomes cause.
- "Alone behind me": every look disproves it.
- The Haunted Palace's "hideous throng" pours out the pale door [u25].
- Orpheus, reversed. Poe's Madeline dies on the threshold; ours may take your horse.

## 7. Build spec
- **Stage:** SVG 960×640, root `.g-flight`, 1-D x positions. Tarn below y 440; 24 stones, x 150–880; house left with red fissure; servant and horse right.
- **Guest:** two-frame run, flipped when looking. 24 px/s, −3 per clinging word (floor 12).
- **Veil:** black 0.9, x 0 to guest−40; fades in 150 ms while held.
- **Input:** hold the stage (pointer) or Space; a tap is a 0.4 s look.
- **Followers:** IM Fell italic text, 34 px/s, 0 while looked at; cling within 12 px.
- **Collapse:** from x 150, 14 px/s, 60 px/s while looking. Stones drop; splash rings show through the veil; anything behind sinks.
- **Beats:** at guest x 330 and 600, each with a red gleam. Madeline spawns 120 px ahead of the collapse, 26 px/s.
- **End:** at x 880 looking still works. When she arrives or sinks (or after 12 s), a forced look: the house splits and sinks behind a waterline clip. Caught by the collapse, he sinks.
- **Reduced motion:** fades.

**Don't build:** scrolling, steering, rain, Roderick, retry screens, audio, collapse physics.

## 8. Risk
After one run, ask "What does looking back do?" Players must name both effects; if not, exaggerate the crawl and splashes.
