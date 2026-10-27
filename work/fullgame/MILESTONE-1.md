# Milestone 1: the studio, both ways

*Proves the core: act two is played against act one, and changes it.*

**Self-checked** against both critiques: a new verb, camera and opponent; idle means unheard; every rule shown before it bites.

## 1. Contract additions

- `api.mode`: `'sojourn'` or `'burial'`.
- `api.record(type, data)`, act one only. The spine appends `{type, t, ...data}` to `save.records[chapter]`. `t` is the game's clock if given; cap 4,000 events.
- `api.ghost`, act two only: `{events, synthetic}`, holding that chapter's record.
  - If the record is missing or thin (under 10 hushes), use the fixture `games/<id>/ghost.json` (a builder's real run); the game says once: *Someone did it for you.*
- `api.rewrite(label, text)`: her red correction to the Account row with that score label.
- **The save:** `localStorage['usher.save.v1']` = `{act, chapter, flags, results, records, rewrites}`, wrapped in try/catch. A refresh resumes at a chapter boundary.

## 2. The spine

- **Entry:** `?chapter=studio&through=studio`. No stub results, so the Account shows the studio row only.
- **Act-one fix:** the studio's outro branches on its result.
- **The turn:** the Account and last card as now. **Nevertheless.** no longer reloads; the ribbons fade, the stage stays turned, and an intertitle reads *A **Burial** of Some Weeks*.
- **The act-two map:** `mapMarkup(titles, {act:'burial'})`.
  - Above the water, the house upright as light: `C.returned(house, {transform:'none'})`. Below, the black house hangs upside down.
  - It matches the turned map, so the crossfade is invisible; hits stay the upright `ROOMS`.
  - Madeline, bright, walks from the vault. Only the studio is lit (*Under the studio.*); the rest are dim and give `REMARKS.sealed`.
- **Her pass on the Account:** after the mirror studio the sheet returns. On each rewritten row, the act-one red is struck through and her line writes beneath it, red and back-slanted (`.acc-rather.hers`). **Nevertheless.** returns to the letter; the map allows a replay.

## 3. The studio

### Act one records (game clock `T`)

| Event | Fields |
|---|---|
| `ptr` | `{t, x, y, down}`, every 100 ms |
| `gesture` | `{t0, t1, kind}` (drape, snip or hold) |
| `hush` | `{t, type, board, react}` |
| `reach` | `{t, type}` |
| `spare` | `{t, board}` |
| `knock` | `{t, result, react}` |

### Act two: the mirror studio

**On screen**
- **The vault from below:** black paper in copper light, Madeline in gauze.
- **The ceiling:** the eight `BOARD_CX` boards, at y 200–240.
- **Above them:** the studio upside down as `returned()` light (y 0–452 mapped to 200–0), with the recorded pests replaying. Your hand: the existing `HAND` cut, flipped, on its recorded path, its next second dotted ahead.
- **The beat:** Roderick strums the waltz; his arm and the boards pulse, brightest on beat three.
- **HUD:** `HEARD ○○○`.

**What she does:** she taps a board, and a red *tap.* lives 1.2 s. The waltz is 86 bpm in 3/4; the window on beat three is ±0.2 s.
- **Heard:** unhushed and on beat three. Roderick's head dips a notch.
- **Explained:** unhushed but off beat. *the house settling.*, in the guest's black italic.

**How your ghost answers**
- Inside a recorded gesture the hand is **busy** (no ring); otherwise it's **free**, and a faint ring shows it listening.
- A free hand within 240 units darts to her tap after your median act-one tap reaction time (clamped 0.35–1.2 s), thumbprints it, then rejoins its path.
- If you hushed no taps in act one, it never darts: *You never heard a thing.*
- A hush stills her for one bar, mirroring act one's freeze.

**Escalation**
1. **Learn (0:00–0:45).** The hand is slow and mostly free. Lines, in order: *Knock on the third beat.*, then *That's your hand. Wait till it's busy.*, then *He heard.*
2. **Complicate (0:45–1:50).** The rush keeps the hand busy: openings. At 1:15 the pale lady crosses above, though Madeline is down here; the hand usually stops and listens. **The third heard tap breaks the recording:** Roderick lifts his face, the dots tear, the hand stalls for two bars, then trails half a second behind its path.
3. **Turn (1:50–2:20).** Her one KNOCK: hold a board for a bar, release on beat three, and it rises for 3 s. A free hand within 360 units hushes it. If you hushed act one's knock, your hand slams down at the recorded time (radius 480), and the dots warn her.

**The end:** a 3-second tableau, then `done`.
- **The flags:** `setFlag('mirrorStudio', {heard, hushed, broke, knock})`.
- **`done`:** `{won: heard >= 3 || knock === 'heard', score: {'taps heard': heard}}`.

**The rewrite**, `api.rewrite('taps hushed', …)` (n is act one's count, k is taps heard):

| Outcome | Her line |
|---|---|
| KNOCK heard | *she knocked n+k+1 times. The last one he heard.* |
| k > 0 | *she knocked n+k times. He heard k.* |
| Nothing heard | *she knocked, and you hushed her twice.* |

**Sound**, optional (`engine/score.js`): a Karplus–Strong waltz and wooden taps, every cue also seen. **Reduced motion:** no darting; the beat is a still lamp change.

## 4. Who gets what

**A first-timer**, without Poe: protect a touchy man from noise; the red tap pays best. Then the house turns over: you're the woman under the floor, dodging a hand that moves as yours did.

**The literary player:** the epigraph's lute, played from below; Reissiger's waltz under Weber's name; "I dared not speak" [u48]; and the lady crossing [u14] while you're down here. Who, then?

## 5. Done means

- 10–12 minutes: the studio, the Account, the turn, the map, the mirror studio (twice) and her line.
- Lukas recognises his hand unprompted.
- A first-timer is heard within 45 seconds.
- An idle run gets the "nothing heard" line.
- A refresh resumes.
- It works on a phone in landscape.
- No console errors.
