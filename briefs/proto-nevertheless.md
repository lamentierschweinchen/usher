# Prototype brief: "Nevertheless" — the book that plays you

## Why this exists
Lukas (writer, artist; he makes the calls) read our story options and couldn't picture what the player *does*, or why they'd be hooked. Words won't answer that, but a clickable first few minutes will. You are a game designer who prototypes: solve the loop by building it.

## The project
A small browser game from Poe's "The Fall of the House of Usher", for a competition. The whole window is about 2.5 hours, and the build that follows this will be a 5–8 minute slice. Lukas wants to blow the room away: mysterious, exciting, fun, delightful, wry and witty. Register: bookish, wry, a little uncanny; no generic horror, no cheap jump scares.

## Read first (all of it, briskly)
- `~/Documents/Usher/source/usher-1845.md`: the full tale. Use Poe's words verbatim; cite [uNN] in your notes.
- `~/Documents/Usher/work/story/04-reader-v2.md`: the direction you're prototyping.
- `~/Documents/Usher/DECISIONS.md`: Lukas's calls in his words, especially the top entry.

## Lukas's notes on this direction (verbatim)
> "pretty unclear to me what i do here as the player. what's the genre? i think a game that constantly tricks you and plays you as much as you play it, is very interesting. but i don't know if that's what it is."
> "the games should be delightful and gain in delight through the depth of the understanding of the text itself but not rely on people knowing the story to get the joke. they may even read the book through the story (but we can deceive them if they think they know everything just because they know the book)"

## Your job
Push "Nevertheless" all the way to **a book that plays you as much as you play it.** The genre is legible at a glance: an old numbered gamebook, with "turn to 14". The book has opinions. It refuses, anticipates, notices which choices you take, answers back in Poe's own sentences, and gets you to *want* things. Then, on the stormy night, it hands you a romance (the "Mad Trist") whose brave choices finally work, and your heroics turn out to be breaking something open under the floor. Deceive the player who thinks they know the tale. Delight the one who doesn't.

Decide the moment-to-moment interaction yourself, and make it irresistible in the first 20 seconds. You may depart from the v2 doc wherever the play gets better; say where in your notes.

## Build
- One self-contained file: `~/Documents/Usher/work/proto/nevertheless/index.html`, with inline CSS and JS, no frameworks, no network. Fonts: `../fonts/im-fell-normal.woff2` and `../fonts/im-fell-italic.woff2` (IM Fell English, OFL; already there).
- Palette (from Lukas's reading edition): paper `#f2eee5`, ink `#29272a`, muted `#625d5a`, rule `#cbc3b8`, accent red `#7a3939`, used sparingly. Works on a phone and a laptop.
- **Silent.** No audio at all. Sounds, if any, are words on the page.
- Scope: the opening (the hook and the rule, about 1–2 minutes), then one Mad Trist exchange at full strength: a brave choice that works, and something answering from beneath the page. Stub the rest with a single "— the slice continues —" line. Quality over coverage.
- Check it: at least run the inline script through `node --check` (extract it to a temp file in `/private/tmp/claude-501/-Users-ls-Documents-usher/60956e46-c61c-45ff-a991-fe99d74c0154/scratchpad/`) and walk every link and section by reading your own code.

## Also deliver
`~/Documents/Usher/work/proto/nevertheless/NOTES.md`, 200 words at most: what the player does, second by second, for the first minute; the hook in one line; how it plays the player; what's faked or stubbed.

## Limits
Time-box: about 20 minutes. Touch nothing outside `work/proto/nevertheless/`. Don't commit or push. When you're done, reply with the two paths and the hook in one line.
