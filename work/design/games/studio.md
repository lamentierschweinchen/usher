# Studio · Hush

**1. Pitch.** Gothic WarioWare for the most sensitive man alive: draw, snip and smother everything that hurts Roderick, while the game pays best of all for hushing the small red tap under the floor.

**2. First ten seconds.** Roderick on his sofa; windows, vases, floorboards over the black vault. One line: *Spare him everything.* A sunbeam creeps toward his face. An inked hand mimes pulling the drape; the player drags it shut: beam gone, *+10*.

**3. Loop and escalation.**
- **Introductions (0:00–0:45).** One pest at a time, each gesture mimed once. *Sunbeam*: drag the drape. *Rose*: swipe through the stem. *TAN-TARA*, a brass band in type: hold until it shrinks to *plink.* At 0:28 a tiny red *tap.* appears in the floor, unmimed. Tap it: a thumbprint blots it, a hush ripples out, every pest freezes, Roderick sighs, *+50*, multiplier up. The best thing in the room.
- **The rush (0:45–1:50).** Two or three pests at once, more than hands can manage: the freeze becomes survival, and players hunt the red, even under the band's letters. At 1:15 a pale lady crosses the room and the taps stop: the hardest eight seconds. As a door closes on her, a tap comes from the board nearest the vault.
- **The crescendo (1:50–2:30).** Everything at once; no taps; the crack behind Roderick nears the floor. Then **KNOCK.**, huge and red, rises toward him. Tap it: one hush takes the room. Or leave it.

**4. The trick.** It rewards the wrong thing. Points, multiplier, freeze and sigh all point at the red word; the rush makes it necessary; the lady's crossing makes you *wait for her to leave*. By the climax you want her knocking. Red is the truth throughout this game; here you score by blotting it out.

**5. Choice and confession.** A tap left alone sinks, leaves a red tick in its board and resets the multiplier; thumbprints stay too: the floor is a ledger. Sparing the **KNOCK** costs about a third of a good score: it reaches Roderick, the pests stop unhushed, and he buries his face.
- `api.setFlag`: `tapsHushed` (n), `tapsSpared` (n), `knockSpared` (bool).
- `api.done`: `won` = crack off the floor; labels `sunbeams drawn`, `roses nipped`, `trumpets muffled`, `taps hushed`, `taps let be`. Note, hushed: "Everything is hushed. Roderick thanks you, and goes on listening to it." Spared: "Roderick heard it. He did not thank you."

**6. For connoisseurs.** The pests are [u11]'s list; *plink.* is the epigraph's lute [u01]. The lady crosses "a remote portion" as Roderick hides his face [u14]. Poe's taps follow the burial; these precede it. He "dared not speak" for days [u48]: you are his silence, scored.

**7. Build spec.** One SVG, `.g-studio`. Eight floorboards 120×40, tap zones 120×90. Pests `{type, site, progress 0→1}`, paused while frozen; at 1 one reaches Roderick: hair up, crack +1 of 6, multiplier ×1. Pointerdown picks the pest beneath; only its gesture counts: drape, drag ≥60% of the window; rose, a stroke ≥80px across the stem; band, hold 900ms (shrinking while held); tap, pointerdown. Scores 10/10/20/50 × multiplier (cap ×5); a tap freezes 2s and heals the crack 1. Knock: 200×120, 4s, +1,000, every pest hushed at ×5. Scripted timeline: a pest per 5s; then per 2s, taps every 7s; then 3–4 constant; lady 1:15–1:23; knock 2:15; 3s tableau, flags, `done`. Roderick: three poses. Reduced motion: no ripple or jitter; freeze is a grey wash.

**Don't build:** audio, pinch (mice can't), food or garment pests, lives, random spawning, saved scores, Madeline interaction, multitouch.

**8. Risk.** After the lady leaves, does a first-timer's cursor go to the floor before the next tap? Then they want it. If not, lengthen the freeze or harden the rush.
