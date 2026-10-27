# Brief: rate the whole experience of *A Sojourn of Some Weeks*

You are a seasoned games critic who also reviews literary fiction: you've written about narrative indies (Inscryption, Gorogoa, Return of the Obra Dinn, Florence, Papers, Please, Thank Goodness You're Here!) and you know Poe. Lukas, a writer and artist who makes the calls, made this game from "The Fall of the House of Usher" with a team of agents, for a competition whose deadline has passed. He now wants to build it into "a fully-fledged game full of intrigue, wit, and fun", and he wants an honest verdict first. Don't be kind; be precise.

## Play it, really
- Serve the game: `cd ~/Documents/Usher/game && python3 -m http.server <free port>` (run it in the background), then open `http://localhost:<port>/`.
- **Play the whole thing as a player would**, from the letter to the last card, with real clicks, drags and holds. Use the Claude desktop app's built-in browser if it's free, or a headless Chromium. A Playwright install exists read-only at `/Users/ls/Documents/Down the Drain/node_modules/playwright`; don't modify that project. Keep any scripts in your own private folder: `/private/tmp/claude-501/-Users-ls-Documents-usher/60956e46-c61c-45ff-a991-fe99d74c0154/scratchpad/experience-critic/`. Other agents share the scratchpad.
- **Time it:** record how long each chapter takes for a first-time player who plays properly (not a bot speed-run), including the map walking and encounters.
- Look at it on a phone width too (390×844), briefly.
- If a chapter blocks you, note exactly where, use `?chapter=<id>` to continue, and count the block as a finding.
- Only after playing, read for context: `~/Documents/Usher/DECISIONS.md` (Lukas's calls), `work/design/SPINE.md`, `work/design/STORY.md`, `work/design/games/*.md`, and the tale itself (`~/Documents/Usher/source/usher-1845.md`), so you can judge the connoisseur layer.

## Rate (1–10, with a one-line reason each)
Story · Gameplay (overall, then each of the seven chapter games: tarn, door, studio, burial, nights, trist, flight) · Creativity and originality · Art and visual design · Writing and wit · Mystery and intrigue (does something pull you forward?) · Literary depth (what a Poe reader gets) · Pacing and flow · Onboarding and clarity · Cohesion (one game, or seven toys on a map?) · Technical polish · **Overall**.

Rate it twice where the answer differs: once as **a general player** and once as **a literary connoisseur**.

## Then
- **Before Lukas's first playthrough:** the five fixes that would most change his first impression, each concrete enough to do in under an hour.
- **To become a fully-fledged game:** the five biggest moves (structure, mystery, characters, systems, music or sound, endings, replay), ranked.
- **Playtime:** measured now, chapter by chapter; and what you'd consider ideal for this game, and why.

## Deliver
`~/Documents/Usher/work/review/EXPERIENCE-CRITIQUE.md`, 1,200 words at most, ratings in a table. Touch nothing else. Don't commit. Take as long as playing properly needs, about 40 minutes. Reply with the path, the overall scores (general and connoisseur), and your single most important note.
