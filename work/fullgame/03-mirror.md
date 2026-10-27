# Blueprint 03: the mirror

## 1. Name and pitch

**A Sojourn of Some Weeks**, whose reflection is **A Burial of Some Weeks**. Spend an evening explaining away the House of Usher, then turn it over and play what you explained away, against yourself.

## 2. The shape: 84 minutes

- **Act one, *Sojourn*, the guest above (51):** letter 2, tarn 5, door 6, studio 6, burial 7, nights 7, trist 5, flight 4, house 6, Account 2, hinge 1.
- **Act two, *Burial*, Madeline below (33):** tarn 3, door 4, studio 4, burial 5, nights 5, trist 4, flight and ending 5, house 3.

Each chapter's three acts span the mirror: *learn* and *complicate* above, *turn* below, 8–12 minutes. Act one ends whole; then **Nevertheless.** turns the stage over, and the reflected house is the map.

## 3. Between chapters

**Above: look, then account.** Walk the cutaway; hold to tip the view into the tarn, where two or three things differ (a painted-out portrait, a door ajar, a lid). Pin one, then choose, in dialogue: **explain it** with an excuse card ("the draperies", "family custom") or **leave it unaccounted for**. Explained, the house mends to match and Roderick's guitar steadies; left, the water keeps it and Roderick tells you one true thing. Excuses you play become your hand at the nights.

**Below: knock, and be explained.** Madeline walks the reflected house. Each excuse you played is a thing in her way (a nailed drape, a set stone, a screw); each difference you left is an opening. She knocks; above, your act-one self answers with the excuse you used. She hunts the gaps in your alibis.

**In act two, the guest is your recorded self.**

## 4. Truth and deceit

Each witness lies one consistent way:
- **Your Account** counts truly and names falsely: every number right, every noun an excuse.
- **The house above** edits only what you aren't looking at (the smoke stops while you find the shutters); look back and it's caught. Some edits were hers.
- **The tarn** is true about everyone but whoever is looking, whom it flatters. It inverts (under the floor shows above it) and ripples (look twice at one spot and two details swap).
- **Roderick** says only true things, never the important one. **The physician** tells the truth with a face the house lights for lying. **The valet** never speaks; his candle stands where something happened.
- **The scores** count what you did for the house.

The trap: house and tarn are one witness ("reduplication" [u26]); only the water and a person agreeing proves anything.

**Red now means "not so."** It marks a contradiction (the fissure is the house disagreeing with itself), never who's right. Above, red is the water's hand; below, Madeline's, correcting the water too.

## 5. The mystery

From minute one: the P.S. is in another hand, and flips the right way round as you read it; portraits hang in pairs, one face painted out.

Act one assembles the custom: the Ushers keep the direct line [u04] by laying one twin per generation in the vault for a fortnight. Roderick admits it only if you've left enough unaccounted for.

Act two reveals the rest: the fortnight is a shift. The buried twin keeps the house in the water, then climbs up as the other goes down; the house stands on the swap. Its one rule: the lid is never screwed ("the yet unscrewed lid" [u30]). You screwed it; act one's best burial score is the crime. And the P.S. was hers: Roderick sent for you because you never hear anything, Madeline because you always look.

Left open: did Roderick fear her, or going down?

## 6. Characters

- **The guest:** you speak for him in excuses; his last, the gust [u49], is true and useless.
- **Roderick:** the relationship is his speaking guitar. Excuses keep it in tune (comfort); unexplained things make him falter and talk (candour). Comfort eases act one and hardens act two.
- **Madeline:** silent above; below, she writes in mirror-hand on the glass, as dry as you.
- **The physician:** looks the villain; is the custom's honest witness.
- **The valet:** the same profile in both houses. He serves whoever is upstairs.

## 7. The seven chapters, grown up

Nothing advances without the player; idling costs something visible. The stake above is always act two: every hush, stamp and screw becomes her wall.
- **I Tarn.** Five differences; the off-gaze cheat; a sixth, your own flattering reflection: claim it or not. *Turn:* at her window she redraws the house to make you look twice: the cheat you caught was hers.
- **II Door.** Still until you move; three façades; idle 15 seconds and the house moves, setting a stone wrong; the last forces whole house or her route. *Turn:* she is the gap; your old self chases her with stones.
- **III Studio.** Taps fall on the guitar's third beat; before the KNOCK, Roderick asks, "You'd tell me if you heard anything?" Idle, and he flees. *Turn:* under the floor, she taps against your old hushes.
- **IV Burial.** Rule shown first; let the physician look or not; four screws and a door to leave by. *Turn:* carried in the coffin, push to bear yourself or kick to call him; back out each screw you turned.
- **V Nights.** Kept whole ("Quite so."); "Do you hear —" becomes a slip you may stamp. *Turn:* Papers, Please from the smuggler's side: she writes slips your cards can't stamp.
- **VI Trist.** Draw the blows; the echoes come first; you may close the book ("Go on."). The page doesn't turn. *Turn:* now it does: her climb, your strokes on her lid, no mercy rule.
- **VII Flight.** Three stretches; sink and the stretch restarts. *Turn:* her causeway under the water, the house falling upward.

## 8. The mirror act

Same art, flipped: `returned()` already draws every scene as light on glass; each game gets a `mirror` mode reading `api.ghost`, the act-one log. It reveals the swap, the screws, the P.S. and who carried the coffin. Replayed, act one shows her edits in gauze.

## 9. Endings

- **The Fall** (Poe's): she reaches her brother's door. Default.
- **The Horse:** three or more differences left unaccounted open a way past his door; she takes your horse.
- **The Swap:** candour high and her studio knock heard: Roderick goes down himself. The house stands both ways up; you ride off none the wiser.
- **A Burial of Some Weeks:** you looked down every interlude and left the fourth screw out; your recorded glance meets her eye, and the guest goes down instead. Her Account closes: *Guests: one. Say, rather: some weeks.*

## 10. Music and sound

Optional Web Audio, every cue also seen. Roderick's guitar, a Karplus–Strong string, speaks his lines' contour; its tuning is your relationship. The map plays Von Weber's "last waltz" (really Reissiger's) in 3/4; below, inverted and backwards. "The Haunted Palace" gains a stanza per chapter; V and VI are sung at the hinge. The nights stay silent: silence is the field you search.

## 11. Build plan

**Reuse:** spine, map, cut library, the last card's turn, the Account, all seven games, extended. **New:** `api.record()` and `api.ghost`; `mirror` modes; pin-and-excuse; dialogue choices; `engine/score.js`; saves; branched outros.

**First milestone, one day:** studio, hinge, mirror studio. Record the hushes, turn the house over, tap from under the floor against your own replay; the taps line turns red in her hand. Twelve minutes of Lukas playing against himself.

## 12. The risk

Act two feels like a rerun, after an ending. Guard: each act-two chapter opens on a reveal, never a tutorial. Test: at the hinge, do players go on, and does someone say "that's me"? An idle act one makes a weak ghost; the house fills its gaps.

## 13. A sample moment

After the burial you look down. In the water three figures carry the coffin down the stair: Roderick at the head, Madeline at the foot carrying herself, and you, tall and gallant, in the middle. The Account says *Bearers: two.* The water is true about everyone but whoever is looking, so the lie is you. "You've got the heavy end?" "I thought you had."

In act two you lie in the coffin. Roderick takes the head; at the foot, bare feet, yours now. Ahead, the guest walks with a torch, narrating. The line rewrites itself in her hand: *Bearers: two. Say, rather: we two alone. He held the lamp.*
