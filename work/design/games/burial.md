# Burial · We Two Alone

**1. Pitch.** Turn-based stealth with a coffin: carry Madeline past a physician who hunts by ear, while footsteps walk your exact route three beats behind, until they aren't behind you.

**2. First ten seconds.** A cutaway down to the vault. You and Roderick hold the coffin; the doorway beside you pulses. Top left: *We two alone bore it to its rest.* Tap: you shuffle one landing. Third tap: *pat.*, in the empty chamber behind you.

**3. Loop and escalation.**
- **Stair (0:00–0:15).** Tap a neighbouring ring to move, the coffin to wait. The footsteps are you, three beats ago: stop and they stop.
- **Gallery (0:15–1:00).** The physician guards the stair down with his lamp. Each *pat.* draws him, the shortest way. Hide, and your footsteps lead him to you; feint, or go the long way round, and they lead him off.
- **Copper (1:00–1:10).** The floor rings: *PAT.* The footsteps hurry: two beats behind, one, none. A third pair of feet under the coffin, which lifts. Roderick: "You've got the heavy end?" You: "I thought you had." *Two* is struck through.

**4. The trick: it follows you.** A tail you can't shake becomes your proudest trick, then breaks its rule and helps carry. You weren't using the footsteps; you were showing them the way down, and so back up.

**5. Choice and confession.** Close-up: the lid askew, her smile, the blush in red. Drag the lid home; a red sliver stays. Twist four screws; each narrows it; the last always turns stiffly. After three, Roderick waits at the door: leave, or finish.
- `api.setFlag('burialScrewOut', bool)`, `api.setFlag('burialGlimpses', n)`.
- `api.done({won:true, score:{'bearers':2, 'screws turned':3|4, "the physician's glimpses":n}, note})`: STORY's Out line, or "Three screws home. That'll hold."

**6. For connoisseurs.** "We two alone bore it to its rest" [u29]: the game counts three. The physician's "low cunning" [u07] excuses the home vault [u28]; he only asks to see her. The echo is the house's "reduplication" [u26] in time. Her step on the stair [u48] takes your route.

**7. Build spec.** `.g-burial`, SVG 960×640, LOOK.md defs. Nodes, hit radius 55:
- A1–A3 y110, x 620 (start), 390, 160. Ring R1–R7: 160,225; 390,225; 620,225; 820,290; 620,355; 390,355; 160,355. S 820,430. C1–C3 y505, x 700, 520, 340. V 130,505.
- Edges A1–A2–A3–R1; R1…R7–R1; R4–S–C1–C2–C3–V. Stairwell flat ink. Band y560–608: ink, `#ripple`; each *pat.* prints a bare footprint there in tarn-red.
- **Beat:** you act; check caught; footsteps step to `hist[len−1−delay]` (*pat.* if moved); physician acts; check caught.
- **Physician** hears R1–R7, S. `guard` at S, lamp on R4; `go` to newest *pat.*, a node a beat by BFS (odd ring, no ties), lamp ahead; `look` on arrival, neighbours lit one beat; `return`. Hatched lamp; dotted line to target.
- **Caught:** smudge, "Might I just see her?" / "No." Back to R1, history cleared, glimpses +1.
- **Copper:** delay −1 a beat; no catching. At V, *GRATE.*; iris to the lid.
- **Lid:** snaps within 30px. Screws: pointer capture, clockwise angle; 360° seats, 720° the last; tap = 90°. Sliver (4 − seated) × 3px.
- **End:** door or fourth screw; one *pat.* behind the shut door; flags; `done`.
- **Verified** from R1: `w R7 R6 R5 R4 S C1` and `R7 R1 R2 w R3 R4 S C1` pass; straight either way is caught.
- Reduced motion: no tweens or lift.

**Don't build:** real-time movement, Roderick as a token, a second guard, audio, timers, failure.

**8. Risk.** Caught once hiding, does a first-timer feint or go the long way, unprompted? If not, bolden the dotted line.
