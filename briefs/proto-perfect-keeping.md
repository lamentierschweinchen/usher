# Prototype brief: "Perfect Keeping" — a silent foley game

## Why this exists
Lukas (writer, artist; he makes the calls) read our story options and couldn't picture what the player *does*, or why they'd be hooked. Words won't answer that, but a clickable first few minutes will. You are a game designer who prototypes: solve the loop by building it.

## The project
A small browser game from Poe's "The Fall of the House of Usher", for a competition. The whole window is about 2.5 hours, and the build that follows this will be a 5–8 minute slice. Lukas wants to blow the room away: mysterious, exciting, fun, delightful, wry and witty. Register: bookish, wry, a little uncanny; no generic horror, no cheap jump scares.

## Read first (all of it, briskly)
- `~/Documents/Usher/source/usher-1845.md`: the full tale. Use Poe's words verbatim; cite [uNN] in your notes.
- `~/Documents/Usher/work/story/03-house-v2.md`: the direction you're prototyping.
- `~/Documents/Usher/DECISIONS.md`: Lukas's calls in his words, especially the top entry.

## Lukas's notes on this direction (verbatim)
> "this relies on brilliant sound rendering? if so, it's a nonstarter unless you have a great idea on how to produce them (or we use a silent film vibe but that changes the setup and gameplay here)"
> "i also don't really understand so clearly what the player does here. how do i interact with this? how does it catch me? how does it keep me?"
> "i think a game that constantly tricks you and plays you as much as you play it, is very interesting."
> "the games should be delightful and gain in delight through the depth of the understanding of the text itself but not rely on people knowing the story to get the joke. they may even read the book through the story (but we can deceive them if they think they know everything just because they know the book)"

## Your job
Make "Perfect Keeping" a **silent** game, like a silent film: every sound is a *word* (Poe's own sound vocabulary, such as *rattled*, *rustled*, *grating*, *a stealthy step*), set in type and moving through a drawn cross-section of the house. No audio at all. The player is the house, a vain aesthete in stone, and its craft is foley: collect sound-words by poking the house, then set them into the guest's readings aloud where the noises belong. Make that verb instantly legible without instructions, and satisfying, even funny, in the first 20 seconds (a wrong fit should be as delightful as a right one). Then let the house be played: a word you never caught, in another hand, rising from below.

Decide the moment-to-moment interaction yourself, and make it irresistible. You may depart from the v2 doc wherever the play gets better; say where in your notes.

## Build
- One self-contained file: `~/Documents/Usher/work/proto/perfect-keeping/index.html`, with inline CSS, JS and SVG, no frameworks, no network. Fonts: `../fonts/im-fell-normal.woff2` and `../fonts/im-fell-italic.woff2` (IM Fell English, OFL; already there).
- Palette (from Lukas's reading edition): paper `#f2eee5`, ink `#29272a`, muted `#625d5a`, rule `#cbc3b8`, accent red `#7a3939`, used sparingly. Works on a phone and a laptop (tap and click; dragging is optional, tapping is enough).
- Scope: the opening (the hook and the verb, about 1 minute), one short reading the house scores, then the first Mad Trist noise at full strength [u39–u40], plus the first sign of a word you didn't catch. Stub the rest with a single "— the slice continues —" line. Quality over coverage.
- Check it: at least run the inline script through `node --check` (extract it to a temp file in `/private/tmp/claude-501/-Users-ls-Documents-usher/60956e46-c61c-45ff-a991-fe99d74c0154/scratchpad/`) and walk every state by reading your own code.

## Also deliver
`~/Documents/Usher/work/proto/perfect-keeping/NOTES.md`, 200 words at most: what the player does, second by second, for the first minute; the hook in one line; how it plays the player; what's faked or stubbed.

## Limits
Time-box: about 20 minutes. Touch nothing outside `work/proto/perfect-keeping/`. Don't commit or push. When you're done, reply with the two paths and the hook in one line.
