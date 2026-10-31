# Milestone 2: the opening, the shadows, and the tarn both ways

*Proves three things before they spread: the game speaks as Poe, the shadow stage works under a thumb, and the tarn turns over. The path: minutes 0–12 of act one, the hinge, the tarn below.*

**Self-checked** against two critics:
- **First-timer** ("nine rules in four minutes; I thought it was a bug"): the tarn now teaches only *early*, and the vanity moved to the stair. Each gesture is taught when it's first needed. The second sighting is shorter and says *let it be* aloud.
- **Senior designer** ("a rule you can miss isn't taught"): the house's rodless move happens in every branch, and the trophies are the excuse that never reaches. Below, the first edit he'd see goes free once.

Marks: **V** a whole sentence of Poe's; **R** recut (cut at his joints, re-addressed, or one word changed); **N** new, under twelve words.

## 1. Contract additions

1. **A game declares its ghost:** `export default { id, title, mount, ghost: { event: 'tap', min: 5 } }`. With fewer than `min` events of that name, the spine uses `games/<id>/ghost.json` if `GHOSTS` lists it, else the thin record; either way it's `synthetic: true`. Undeclared means `{ event: 'hush', min: 10 }`, so the studio is unchanged.
2. **Flags:**
   - `causeway`: `'reined'|'nevertheless'|'idle'`
   - `excuses`: `[{ id: 'furniture'|'draperies'|'trophies', hand: 'guest'|'m', sighting }]` (later, the nights' hand of cards)
   - `unaccountable`: `[{ sighting }]`
   - `stairLooked`: boolean
   - `tarnBelow`: `{ given, glimpsed, twice, seen }`

   The tarn's three flags stand.
3. **The save** gains `account: { front: [{ id, label, value, hand, cut }], back: [{ id, text, hand }] }`. `hand` is `'guest'`, `'m'` or `'hers'`. `cut` is how many words of `value` her echo strikes; all of them means she kept nothing. A missing `account` starts empty.
4. **Shared, read-only for games:** `shared/arrangement.js` (§3) and `.sh-mirror` in `shared/shadow.css` (§2). The spine builder owns both.

Unchanged: `api.mode`, `record`, `ghost`, and `rewrite` (the studio's). Each act-two turn's reveal is scripted in `story.js`; a player-driven `api.echo` waits for the act-two map.

## 2. The spine

**Entry:** `?through=tarn` plays from the letter. *Through* now ends act one at the next chapter's threshold. `?chapter=tarn&through=tarn` starts at the brink, and `?scene=interlude1|stair|hinge` mounts one scene. M1's path still plays.

**The water's script** (`.sh-mirror`) is flipped top to bottom, like the title's reflection, and rights itself in 400 ms on a tap or after two seconds. The water never writes in red; red is hers.

| ≈ | Scene | On screen | Mark |
|---|---|---|---|
| 0:10 | The letter, Roderick's hand | *Acute bodily illness — a mental disorder which oppresses me —* | R [u03] |
| | | *the approaching dissolution of a tenderly beloved ~~sister~~ —* | R [u14] |
| | | *an earnest desire to see you, as my best, and indeed my only personal friend.* *R. U.* | R [u03] |
| | | P.S., in the water's script, unreadable here: *Look not down within the tarn.* | R [u05] |
| | | One button, with "no room for hesitation": **Forthwith.** | R [u03] |
| 0:40 | Approach | *I know not how it was —* | R [u02] |
| 0:50 | The causeway, a fork | *Rein in.* · **Nevertheless.** | R [u02] · V [u03] |
| | **Nevertheless.** | *Nevertheless, in this mansion of gloom I now proposed to myself a sojourn of some weeks.* The horse walks on. | V [u03] |
| | *Rein in.* | The horse halts over the water and the guest looks down (the first look), then goes on. | |
| | Neither, for 10 s | The horse walks on, and the sentence writes itself, paler, marked *m.* | |
| | The first look down, wherever it falls | In the water, the P.S. the right way up: *Look not down within the tarn.* A tap, or two seconds: *Such is the paradoxical law.* **Mirror is taught.** | R [u05] ×2 |
| 1:30 | The door | Servant: "For some weeks, sir?" You: "A night or two." A peasant: "Twins, the Ushers. One keeps the house. You'll see the other." | R [u03] · N · N |
| 2:00 | The brink | *Upon the mere house — upon the vacant eye-like windows —* The strip: *Look down.* | R [u02] |
| 2:15 | Card I | *A Somewhat Childish Experiment*; beneath it, *upon the re-modelled and inverted images* | R [u05] · R [u02] |
| 2:20 | I. The tarn | §4. **Early is taught.** The note on the ink: *The fabric gave little token of instability.* | R [u06] |
| 6:05 | The Account appears | The guest writes *In the water, a figure:* without having noticed my presence. It's in ink if he tapped her window, else paler, *m.* | N · R [u14] |
| 6:10 | Outro | *I entered the Gothic archway of the hall.* The strip's invite, after this and every outro: *Look not down within the tarn.* A look now: *One of the eye-like windows, lit.* | R [u07] · R [u05] · R [u02] |
| 6:30 | The hall | The first interlude, §3. | |
| 8:30 | The stair | The map leans in on the stair and its reflection. The valet holds his lamp low, and the physician's shadow climbs the wall at twice his height. The physician: "Should the lady die, you will send for me? Before —" Then: *He accosted me with trepidation and passed on.* | N · V [u07] |
| | | The strip: *Look down.* In the water the physician is small and lit from above, and the guest a third taller, hat straight. You: "*The cheerfulness of my society.*" (after six seconds if he doesn't look). **Flattery is taught.** | R [u03] |
| 9:30 | Your room | The valet sets the lamp down, silent. The servant, with your bag: "The family never venture forth, sir." You: "Then how do they go?" | R [u13] · N |
| 10:00 | **The hinge interrupts** | The Account as written (*Unaccountable* below it, if it has anything). Two lines write themselves: *My somewhat childish experiment:* (every look down, in words), then *Cheerfulness of my society:* considerable. | R [u05] · R [u03] |
| | | Before a tap, her nick falls before *considerable* and the whole line is struck: the one time she keeps nothing. The stage turns by itself, and on the turned side her button reads **Nevertheless.** Then the intertitle: *A **Burial** of Some Weeks* · *The evening of your arrival. Immediately beneath.* | V [u03] · R [u15, u29] |
| 11:00 | The act-two map | Her first line, in the band, echoes the Account's head: ~~*I know not*~~ *how it was.* The strip: *Look down.* Sealed rooms: *Not yet.* | R [u02] · N |
| | **The reveal** | After card I, below: the sheet with the tarn's line. Her nick falls after *without*: ~~*without*~~ *having noticed my presence.*, the tail re-inked in her red. Then §4. | R [u14] |
| | Her way on | No sheet, because nobody writes. Back on the map, the band offers **Nevertheless.** (to the letter) · *Look down, again.* | V · N |

**What changes in the code:**
- **`story.js`:** every string above, each marked `// V|R|N [uNN]`. Act one writes no red; the tarn's `branch` goes. The door's old encounters move (the physician to the stair, the servant to your room) and the valet's "Good Lord." is cut. `REMARKS.leave` becomes You: "*No room for hesitation.*" R [u03]. New tables: `FORK`, `PS`, `INTERLUDE1`, `STAIR`, `ROOM`, `HINGE`, `REVEALS`.
- **`account.js`** (new): the Account. Its head line is the approach's *I know not how it was —*. It has a front page and a back page, *Unaccountable* [u32], on darker paper. The guest's lines are in ink; *m.* lines are paler, with an italic *m.* in the margin. Her echo strikes the head in red, nicks the cut, and re-inks the tail in place in her back-slanted red, ending on a full stop. During play a **slip** shows one line at top right for 2.5 s; the full **sheet** comes at the hinge and the reveal. `ending.js` moves onto it, and M1's studio rewrite still prints under its row, now labelled *Some alleviation of his malady:*.
- **`band.js`:** `choose([a, b], { idle })`, for the fork and her way on.
- **`main.js`:** the letter, the fork, the first look, the slip, and the scenes between I and II. The hinge replaces M1's turn on both paths, and the last card's ribbons wait for the fall. `below()` lights every chapter with a game below; the reveal plays before it; `herPass` runs only after a `rewrite`.
- **`map.js`:** `zoom('stair')`, about 1.9× (the portrait crop too); reflections set apart in `#cast-below`; the physician's wall shadow via `castShadow`; the water's lines in `.sh-mirror`.
- **`mount.js`:** the ghost rule. `tarn` joins `GHOSTS` only when `ghost.json` lands, because a 404 is a console error. The stub records taps, so act two runs on `?games=none`.

## 3. The first interlude: A Mere Different Arrangement

*The narrator's own theory, that "a mere different arrangement of the particulars of the scene" might undo its sorrow [u02], played as a toy theatre in the hall [u07]. Six later scenes reuse this stage.*

The spine mounts it in the game layer: iris in and out, no title card, running head *The hall*, two minutes. Code: `engine/interlude.js` on `shared/arrangement.js`.

**The stage** (960 × 640):
- **The wall**, y 0–400: lit from the lamp below, dark in the corners, with a dim doorway at the left (x 30–130). Shadows stand on its foot.
- **The floor**, "the ebon blackness of the floors" [u07], has two grooves cut as hairlines of light: the **back** groove, by the wall, at y 505 (rods x 200–760), and the **front** groove, by the lamp, at y 590 (rods x 330–630).
- **The lamp**, the valet's, at (480, 622). Every shadow is its piece scaled about P (480, 700): ×1.55 and sharp (blur 1.5) from the back; ×2.7 and soft (blur 9, opacity .82) from the front. One formula: nearer the lamp is larger and less distinct.

**The pieces**, each a cut on a rod with a lamp-lit stud at its foot:

| Piece | Size | From the back | From the front | The Account writes |
|---|---|---|---|---|
| high-backed chair | 84 × 110 | never her head | covers sighting 1 | *The gloomy furniture of the room.* R [u32] |
| drape on a cross-bar | 104 × 150 | never her head | covers either, huge and blurred | *The dark and tattered draperies.* R [u32] |
| shield and lances, cut with lace | 96 × 120 | never | never: light shows through | *The phantasmagoric armorial trophies.* R [u07] |

They start on the back groove: the chair at x 260, the trophies at 480, the drape at 700.

**Her:** Madeline's cut as a shadow that nothing here casts, with a gauze rim (1.5 units, `--sh-gauze`). She has no rod. Her rim shows only where the piece being tried fails to cover her: the rim is the feedback. Sighting 1: 120 × 270, at x 640. Sighting 2: 160 × 360, in from the doorway to x 430.

**Gestures**, the same for touch and mouse (pointer events, `touch-action: none`, one pointer):
- **Drag a rod** along its groove; rods on one groove stay 110 units apart. Gain is 1:1 at the back and 0.6 at the front. On release, a piece covering 80% of her eases up to 15 units to cover her.
- **Tap a rod:** it moves to the other groove (250 ms).
- **Tap her:** let it be.
- A tap moves less than 8 px and lifts within 600 ms; anything else is a drag.
- **Targets:** each rod's hit area is its cut and rod padded to at least 120 × 200 units, front pieces on top. Hers is her box padded by 24, above y 400 only. 120 units is 45 px on an upright phone (a 359 px stage) and about 70 px in landscape. Studs keep a faint rim on phones; a mouse hover rims a piece. Keyboard: Tab, ←/→ for 30 units, Enter to tap.

**The one teaching gesture:** if nothing is touched for three seconds, a pale glove drags the chair's rod 90 units right, once. Every other lesson is a line, on first need.

**Explained:** one piece's shadow covers 44 of her 48 sample points, all six at her head included, for 0.6 s. Two shadows together explain nothing.

| When | What happens | Line, top left |
|---|---|---|
| 0:00 | The valet sets his lamp down and goes. | *Drag a rod: a mere different arrangement.* N · R [u02] |
| after the first drag, or at 8 s | Her shadow, where no one stands. | |
| a piece covers part of her for 0.8 s | Her rim shows what's left. | *It does not reach.* N |
| no tap 2 s later | The nearest stud pulses. | *Tap a rod: nearer the lamp.* N |
| explained | The slip writes the piece's line, in ink. | |
| she's tapped | The back page takes Poe's sentence in two instalments: *There grew in my mind a strange fancy —* then *a fancy so ridiculous, indeed, that I but mention it.* | R [u05] |
| 12 s uncovered, no touch | **m.** The guest's pale hand moves the piece nearest her under her and taps it forward. If it can't reach (the trophies), **the evidence bends**: her shadow narrows into the lace and her rim goes out. The slip writes the line paler, *m.* | |
| settled | **The house.** She walks out through the doorway. If explained, the excuse's shadow goes with her while its rod stands still, and the piece casts a fresh one. If let be, the house slides the nearest shadow over her as she goes, rod unmoved, and nobody writes it. | *A wild inconsistency.* R [u06] |
| ~1:05 | Sighting 2: she's larger, and only the drape, from the front, covers her. Her rim pulses once, which shows she can be touched. m. comes at 8 s. | *Arrange it, or let it be.* N |
| settled | The valet takes his lamp. Every shadow goes with the light except hers, which stays 1.5 s longer, cast by nothing. | |

**Recorded for act two** (`records.interlude1`): every move as `{ t, id, x, groove, by: 'player'|'guest'|'house' }`, each sighting's outcome and arrangement, and the kept shadows. Act two will stand her on what you cast and wall her in where you kept excuses (below, light is floor). That's deferred.

**Reduced motion:** groove changes, the house, her walks and the hands all cut, with a 200 ms fade; the glove becomes a still dotted arrow.

**`arrangement.js`** (its shape, not its signatures): a stage built from `{ lamp, P, wallFoot, grooves, pieces }`; moves and toggles made `by` player, guest or house; `cover(id, samples)`; `keep(id)`, a shadow without a rod; `hand()`; `record()`; `castShadow(markup, P, k, blur)`. The lamp can move (II will need it); a *below* rendering is deferred. `shared/arrangement.html` is its phone test page. New cuts in `cuts.js`: the chair, the trophies, the drape on a bar, the rod and stud, a glove (cut after the studio's hand, which stays where it is), and `figure(…, { shadow: true, rim: true })`.

## 4. The tarn, both ways

### Above: what changes

1. **Portraits replace the shutters.** The window at (608, 187) grows to 44 × 56. Above, it holds one profile (Roderick's floating hair); in the water, two.
2. **Early.** The water shows the tree fallen from the start. 1.5 s after the tree is found, in either half, the tree above falls, and beneath it, in the water's script: *Not wrong. Not yet.* N. The find stays lit, and the cheat never takes the tree.
3. **The cheat**, as built, but as the smoke stops her gauze rim pulses once beside the chimney in the water, and the line reads *What* must *have been a dream.* R [u06].
4. **Either half counts**, across the whole cut in both states.
5. **Lines:** the teaching line *Scan more narrowly: five differences.* R [u06] · N; the note *The fabric gave little token of instability.* R [u06]. ("Five of five. The house thanks you." isn't Poe's, and VOICE cut it.)
6. **Records**, on the game's clock: `tap { t, x, hy, half, hit, kind }` for every press (kind is find, catch, miss or window); `cheat`; `fall`; `window { tapped }`. The module declares `ghost: { event: 'tap', min: 5 }`.

Her red window (red because it's hers), the flags and the score labels stand. The tarn writes nothing in the Account; the spine does.

### Below: three ways it could turn

- **A. Before he looks** (the pick). She makes the differences you found, just ahead of your recorded gaze and never under it; then she makes you look twice.
- **B. Be seen.** She runs from window to window to stand where your recorded glances fall. *Lost:* it's the studio's verb below (make your recorded self notice), twice running.
- **C. One house.** She finds no differences and stops the smoke once. *Lost:* it's a viewing scene with one act, a reveal with no next move.

A wins because only there does she author what you found, and it hands her act one's tells (the house editing, the rim).

### Below: Before he looks (about two minutes)

**On screen:** the act-one scene turned over (y → 680 − y). Her house stands upright as light above the line; his black house hangs beneath; Madeline is on her bank at top left. **His gaze** is a lamp ring of radius 100, shown in both halves at once. It glides from each recorded tap to the next, arriving at its recorded time, with the next 1.5 s dotted ahead.

**Her verb:** tap a thing in her house to change it: the smoke stops, the tree falls, a second portrait hangs, the door opens. A change holds four seconds, then her house puts it back unless he has found it. The crack is there already, red, and always found.

**His finds:** at each recorded tap, a changed thing lights in both halves and stays lit: one *given*. An unchanged one gets his pinprick, and nothing is given.

**Not while he looks:** a change made inside his ring doesn't take. Her rim pulses, and his own line returns in his black italic: *What* must *have been a dream.* The first time, it takes anyway: *He nearly saw.* N.

1. **Learn (0:00–0:30).** His first two looks run at two-thirds speed. *Before he looks.* N
2. **Complicate (0:30–1:20).** His own pace, misses and all.
3. **Turn: the cheat.** At his recorded cheat, a rod rises from her side into his chimney: *So he will look twice.* N. If she taps it while his ring is elsewhere, his smoke stops and his recorded catch lands. He looked twice, and it was her.
4. **The window.** She taps her eye-like window to light it. If he tapped it in act one, his ring arrives at that time; if it's lit, he sees her, and his cross strikes her out as it did then. If he never tapped it, his ring never comes, and the light goes out after five seconds.

**The end:** `done` 1.2 s later: `{ won: given >= 3, score: { 'differences given': given } }`, with the note *I regarded her with an utter astonishment not unmingled with dread.* R [u14] if seen, else *Disappeared.* R [u14]. `setFlag('tarnBelow', …)`. There's no `rewrite`, because the reveal has already struck her line. **The ghost** is his own taps if there are five or more, else `ghost.json`, with *Another guest looked, before you.* N shown once. **Reduced motion:** the ring steps from tap to tap, and the changes and pulses are cuts.

## 5. Who gets what

**A first-timer,** without Poe: a friend's letter with a P.S. you can't read until the water reads it to you, and it says don't look. *Rein in* makes you look. The water is right a moment early, and a find unwinds as a pale edge flickers. In a toy theatre you hide a woman's shadow behind a chair, and the house carries your excuse off with her. On the stair the water shows you taller. Then the house turns over, the diary loses one word, and you are her, making the differences your earlier self is about to find. The cheat was you.

**The Poe reader:** the letter is Poe's own sentences, re-addressed, with one word struck. *Rein in* is "I reined my horse to the precipitous brink" [u02]: stopping is looking. [u02]'s theory becomes a stage, its excuses his own from the seventh night [u32]. And *without having noticed my presence* [u14], Poe's one glimpse of her, is cut to its tail by the woman it described.

## 6. Two packages

**A. The spine** owns `game/engine/**`, `index.html`, `style.css` and `game/shared/**`. In order:
1. **First:** the ghost rule in `mount.js`, `?through=tarn` and `?scene=`, the save's `account`, and the stub's taps. Tell B when the ghost rule is in.
2. `arrangement.js`, the cuts and `arrangement.html`, **tested by touch on a phone before anything is built on them.** This is the milestone's risk.
3. `account.js`, then `interlude.js`.
4. `story.js` and the opening; then the stair and your room.
5. The hinge, the act-two map, the reveal and her way on. Add `tarn` to `GHOSTS` when B's `ghost.json` lands.

Needs from B: the tarn's `ghost` declaration, records and note. Until they land, use `?games=none`.

**B. The tarn** owns `game/games/tarn/**`: `game.js` in both modes; `index.html`, a harness with `?mode=burial`, `?ghost=fixture|own` (own meaning the harness's last act-one run), reduced motion, and a log of flags and `done`; and a new `ghost.json`. In order: above (§4); `ghost.json` from a real run; below; a phone pass. Needs from A: the ghost rule, and `.sh-mirror` (use a local copy with the same look until it lands). B cuts its portraits and rod in its own file and doesn't edit `shared/`.

## 7. Done means

- Serve `game/` on 8300 (loopback). `/?through=tarn` plays the letter through her way on, and **Nevertheless.** returns to the letter. M1's path still plays.
- It completes with a mouse at 1280 × 800 and by touch at 844 × 390, 667 × 375 and upright 390 × 844, with no console errors or 404s. It completes with reduced motion on, and nothing glides. A refresh resumes before the tarn, before the interlude and in act two.
- `arrangement.html`, by touch at 390 wide: twenty taps make twenty groove changes, and twenty drags make none. Every rod is caught on the first try, ten times in ten.
- `?scene=interlude1`: each branch writes the right line in the right hand and sets the right flag. The branches: the chair, the drape, let be twice, idle twice, and the trophies under m. The house's rodless move shows in every one.
- The tarn harness: the tree falls after it's found, the rim pulses at the cheat, and below runs on the fixture and on a fresh act-one run.
- **Voice:** every on-screen string in `story.js`, `interlude.js` and `tarn/game.js` carries `// V|R|N [uNN]`, and none but the letter and the banner runs over twelve words.
- **The proof:** someone who has never seen it plays minutes 0–12 and the tarn below on a phone, unhelped. Asked "What did the shadows do?", they say the shadows hid her and grew nearer the lamp, and they name a shadow that moved by itself. After the reveal they say something like "she saw me first."

**Deferred:** the interlude below (her floor and knock), the echo as her verb and the act-two map, the Sleepwalker, Roderick's echo, the endings' use of these flags, the studio's rewrite as an echo, and all sound.

## For Lukas

**The fissure is red in the water.** Under *red is hers alone*, either it's hers (the crack she keeps open, which the blood moon later shines through) or it turns ember like the rest of the light. I'd make it hers, but it's plot, so it's your call.

## Coordinator's notes (31 October)

- **Reviewed and accepted** as the build spec. The contract additions in §1 are now in `work/design/CONTRACT.md`.
- **The fissure:** hers, red in the water (Lukas agreed, 31 Oct), and **subtle**: a faint hairline, noticed when you look, never a bold zigzag. Full visual polish comes near the end.
- **The proof in §7** (a first-timer on a phone, unhelped) is run by the coordinator with Lukas, not by the builders. Builders run every other check.
- **If `arrangement.html` misses a rod on an upright phone,** enlarge the hit areas before building anything on them; 45 px is the floor, not the target.
- **Builders don't commit.** The coordinator checkpoints. Preview servers listen on loopback only.
