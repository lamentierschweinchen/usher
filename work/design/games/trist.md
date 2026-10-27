# Trist: One of Your Favorite Romances

**1. Pitch.** A one-colour woodcut hack-and-slash where you draw every blow, until the page turns over: the blows were Madeline's, clawing out of the vault, and the dragon is her brother.

**2. First ten seconds.** Rain, a plank door, Ethelred swaying (the wine). Behind it: "Nobody's home!" A dotted arc loops from his mace to the door; one line of type: *Draw the blow.* You drag anywhere; he lunges along it. CRACK. Your stroke stays cut into the plank. Easy to miss: a red *crack*, upside down in the margin, came just before your blow.

**3. Loop and escalation** (draw; the neighbours tap and hold)
- *Door, 0:00–0:35, aim.* Six planks, two gouges each; three broken and he's through.
- *Dragon, to 1:20, timing.* Its tongue sweeps the floor every 2.4 s; as it retracts the head dips for 0.8 s. Strike early and it covers its ears: "Please. I'm very sensitive to noise." The second blow freezes mid-shriek.
- *Vault, to 2:30, rhythm.* The page turns over. You are Madeline, white on black, one red heart. Same stroke, but she moves only on her heartbeat; off-beat strokes leave a red scratch. Lid, iron door, archway, then five stairs as the heart quickens. Above, a cutaway: you, reading aloud; Roderick turning his chair to the door.

**4. The trick.** It swaps who you are, with your own hand. The coffin lid carries *your* door-strokes, re-cut in red. Each romance caption reprints, corrected in red: "~~made room in the plankings~~ *say, rather,* the rending of her coffin." The blow tally never resets; now it's scratched on the vault wall. At the top Roderick sits in the dragon's pose, hands over his ears. You've spent ninety seconds learning to strike him.

**5. Choice and confession.** At the threshold she reels (his sway, reused). Draw, and she falls upon her brother. Wait six seconds: the gust opens the doors, and she falls anyway.
- `api.setFlag('tristLastBlow', 'struck' | 'gust')`, `api.setFlag('tristBlows', n)`
- `api.done({ won: true, score: { "dragons slain": 1 | 0, "blows struck": n }, note })`, note "Who slayeth the dragon, the shield he shall win." or "It was the work of the rushing gust."
- Story fit: absorbs VII's opening; the flight starts at [u50].

**6. For connoisseurs.** Poe's coincidences [u39–47] run backwards: each echo precedes its blow; the book follows her. The corrections are [u48]'s "say, rather". The shield's legend [u42] is true of her. His drunken sway is her reeling [u49]. The gust is real [u49]: your blow changes only your score.

**7. Build spec.**
- `.g-trist`, one SVG 960×640: panel, caption, red margin, tally. Ink silhouettes, one hatch `<pattern>`.
- Pointer events, `touch-action:none`; strokes show as fading ink. On release he lunges along its x (max 260, 250 ms), mace at its angle. Under 12 px: poke.
- States: `door → dragon → flip → vault → threshold → end`. Door hit: the lunge reaches it; keep its polyline.
- Flip: scaleY 1→0, swap scene, 0→1 (700 ms; reduced motion: fade).
- Vault: fixed stations (two strokes per obstacle, one per stair); beat 1.1 s to 0.6 s, window ±220 ms; heart and border throb; after six misses any stroke counts.
- Threshold: six-second timer. Stroke: black panel, one white gouge (yours). Gust: white streaks. Then `api.done`.

**Don't build:** jumping, scrolling, physics, health, death or retry, buttons, pixel art, colour, audio, pathfinding.

**8. Risk.** At the turned page, ask a phone player: "Whose marks are on the lid?" If not "mine", replay their strokes onto the lid, one by one, before the climb.
