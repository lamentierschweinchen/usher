# Nights · *The Seventh or Eighth Night*

**1. Pitch.** *Papers, Please* for the noises under your bed: check each against Poe's own excuses and stamp it EXPLAINED, until the third night, when the evidence starts agreeing with whatever you say.

**2. First ten seconds.** A slip slides under the bedroom door onto the desk: ***a rustle***, about the bed, low, 1:05; a squiggle stirs by the bed. Below, three cards; *The draperies* shows a drape. Tap it, tap the slip: THUNK, EXPLAINED. The one line: "Account for every noise."

**3. Loop and escalation.** Slips: kind, place, loudness, time. Cards: a gloss and limits.
- *The draperies*: curtains in a draught. Rustles, in this room, above the floor; needs wind.
- *The storm*: wind at the windows. Rattles, windows or roof; needs wind.
- *Roderick, roaming*: your host can't sleep either. Hurried steps, passage or stair.
- *Excited fancy* (night two): you imagined it. Anything faint.

Wrong stamps bounce, free, with a note: "The draperies don't reach below the floor." Ink: one impression fewer than the night's slips. Any slip can go on the back page, *Unaccounted for*, instead.

- **The first night** (4 slips): place and kind. The last, *a tap*, beneath the floor, faint, fits nothing.
- **The fourth or fifth night** (4): a new rule, "The storm paused from two until three." A faint rustle at 2:20 needs *Fancy*; so does a tap at 2:50. Explain the rustle and the pad is dry when the tap comes.
- **The seventh or eighth night** (5): the trick. *A grating*, *a scrape*, then *steps*, on the stair, slow, resting on every step. The back page reads like a route.

**4. The trick: it agrees with you.** On night three, lift any card and the slip's mismatched words fade, in the same ink, into ones that fit: *beneath the floor* becomes *about the bed*; *slow* becomes *hurried*. Nothing bounces; each stamp gets "Quite so." Two slips fit honestly; three need persuading. Afterwards persuaded slips return, borrowed words struck through, originals beside them in red: *say, rather:* beneath the floor.

**5. Choice and confession.**
- `api.setFlag('nights', [...])`: slips set aside, original words, in order: `["a tap, beneath the floor", "steps, on the stair"]`.
- `api.setFlag('nightsStair', 'unexplained' | cardId)`.
- `api.setFlag('nightsAgreed', k)`: persuaded stamps.
- `api.done({ won: true, score: { "noises explained": n, "unaccounted for": m, "saw reason": k }, note: "The evidence agreed with me throughout." })`. Ten of thirteen at most.

**6. For connoisseurs.** From Poe's one paragraph of nights [u32]: he "endeavored to believe" in the draperies; the sounds came "through the pauses of the storm"; "my excited fancy had deceived me" [u40]. Roderick's step is "hurried, unequal" [u31]; the step on the stair is hers [u48], and his "say, rather" is the reveal's grammar.

**7. Build spec.** One SVG, `.g-nights`. Room band (y 0–240); a mark pulses at each slip's place. Desk: slip (420×220, type ≥34), ink dots, back page at right. Cards along the bottom, ≥170×140. Tap a card to lift or lower it, the slip to stamp, the back page to set aside. Data: 13 slips; 4 cards, each with limits and `agree` values. Night three: lifting swaps failing fields to `agree` (300ms crossfade); lowering restores. Night card between nights (1.2s). After slip 13: red reveal, tap, flags, `done`. Reduced motion: instant swap.

**Don't build:** a timer, citations, drag, the vault or Madeline, random slips, a rulebook, audio.

**8. Risk.** Trick or bug? Does the player pause when night three's first slip changes? If testers call it a glitch, show "Quite so" as they change.
