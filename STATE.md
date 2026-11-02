# State — 2026-11-02

**Direction: the Mirror**, about 80 minutes. Act one *A Sojourn of Some Weeks* (about 52 min), the hinge, act two *A Burial of Some Weeks* (about 28 min). The bible is work/fullgame/BIBLE.md (it overrides earlier docs); the settled journey is work/fullgame/JOURNEY.html; the depth round (work/depth/) overrides the bible where they disagree: Poe's voice as Cut-outs, Madeline's echo, red hers alone, the shadow mechanism, and three game changes.

**Now:**
- **Milestone 1 is playable:** http://localhost:8300/?chapter=studio&through=studio (serve `game/` on 8300). The studio, the Account, the turn, the act-two map, the mirror studio against your recorded hand, and her red rewrite.
- The bible folds in the first-timer review: act one is about 52 min, act two about 28, and the hinge interrupts.
- **Audio:** at Lukas's request a composer/sound designer is starting under another coordinator. Handoff: work/audio/COORDINATION-HANDOFF.md. They deliver to `work/audio/handoff/`; we integrate into `game/`. Their audit's lifecycle and input faults are fixed and tested (work/audio/LIFECYCLE-REVIEW.md). Lukas rejected their first delivery; a new 1:45 character-led cue is a private audition, not for integration or publication until he accepts the direction, and the studio will need its own clock-aligned arrangement. Sound defaults unchanged. Preview servers are loopback-only (work/audio/LOOPBACK-RECEIPT.md).

**Settled 31 Oct:** the journey (work/fullgame/JOURNEY.html) is the dramaturgy, and its seven calls stand as recommended (DECISIONS.md). New standing asks: dialogue and narration in Poe's own language; every recurring element earns its depth or goes; wordplay leans on Poe (double meanings, perhaps palindromes); the shadow cut-outs become a mechanism in at least one game, ideally several; games must prove themselves; the sleepwalking-shadow maze is in the back pocket.

**M2 is built and committed (2 Nov):** package B, the tarn both ways (4d9f563), and package A, the opening in Poe's voice, the hall's shadow stage, the stair, the hinge and the reveal (fb49fb2). Play it at http://127.0.0.1:8300/?through=tarn. Open: the first-timer proof on a phone (the preview server is loopback-only, so a phone needs Lukas's word for a temporary LAN exception); the tarn can drop its local copy of the water's script now that `.sh-mirror` is shared; chapters II–VII still carry old, unmarked strings until their milestones.

**Rules:** builders don't commit; the coordinator checkpoints to public `main`, github.com/lamentierschweinchen/usher.
