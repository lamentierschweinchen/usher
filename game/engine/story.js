// The script, from work/design/STORY.md. Lines are [speaker, text]; *italic*
// marks stage directions. Speaker '' is narration.
//
// Encounter fields: lines; enter {actor: spot} (fades in first); exit [actors]
// (fade out after); glide {actor: [from, to]} (Madeline crossing, unhurried);
// turn {actor: dir}; carry (when its chapter is sealed, play it at the start of
// the next one); skipIf(flags) (drop it, e.g. when a game has already told it).

export const TITLE = {
  above: 'A Sojourn of Some Weeks',                                                    // R [u03]
  below: 'A <tspan class="red">Burial</tspan> of Some Weeks',                         // R [u03]
};

// The letter, in Roderick's hand: Poe's sentences re-addressed [u03]. ~~struck~~ is his own ink
// (act one writes no red). The P.S. is in the water's script, unreadable here.
export const LETTER = {
  body: [
    'Acute bodily illness — a mental disorder which oppresses me —',                   // R [u03]
    'the approaching dissolution of a tenderly beloved ~~sister~~ —',                 // R [u14]
    'an earnest desire to see you, as my best, and indeed my only personal friend.',   // R [u03]
  ],
  sign: 'R. U.',                                                                      // R [u03]
  psMark: 'P.S.',                                                                     // N
  ps: 'Look not down within the tarn.',                                               // R [u05]
  go: 'Forthwith.',                                                                   // R [u03]: "no room for hesitation"
};

// The approach, and the fork on the causeway [u02, u03]
export const FORK = {
  approach: 'I know not how it was —',                                                // R [u02]
  rein: '*Rein in.*',                                                                 // R [u02]
  on: 'Nevertheless.',                                                                // V [u03]
  banner: 'Nevertheless, in this mansion of gloom I now proposed to myself a sojourn of some weeks.',   // V [u03]
  idle: 10000,
};
// The first look down, wherever it falls: the P.S. in the water, the right way up
export const PS = {
  line: 'Look not down within the tarn.',                                             // R [u05]
  law: 'Such is the paradoxical law.',                                                // R [u05]
};

export const CHAPTERS = [
  {
    id: 'tarn', ord: 'Chapter the First', num: 'I', title: 'A Somewhat Childish Experiment',   // N · R [u05]
    sub: 'upon the re-modelled and inverted images',                                  // R [u02]
    room: 'causeway', target: 'tarn',
    cast: { horse: 'horse', peasant: 'peasant' },
    // the door, then the brink
    encounters: [
      { enter: { servant: 'servant' }, turn: { servant: -1 }, lines: [['Servant', 'For some weeks, sir?'], ['You', 'A night or two.']] },   // R [u03] · N
      { turn: { guest: -1 }, lines: [['A peasant', 'Twins, the Ushers. One keeps the house. You’ll see the other.']], exit: ['servant', 'horse', 'peasant'] },   // N
      { turn: { guest: 1 }, lines: [['', 'Upon the mere house — upon the vacant eye-like windows —']] },   // R [u02]
    ],
    outro: 'I entered the Gothic archway of the hall.',                                // R [u07]
    // what the guest writes after the tarn: in ink if he tapped her window, else paler, m.
    account: { id: 'tarn', label: 'In the water, a figure:', value: 'without having noticed my presence.', hand: f => (f.tarnSawHer ? 'guest' : 'm') },   // N · R [u14]
    truth: null, tarn: 'One of the eye-like windows, lit.',                            // R [u02]
    stub: { line: 'Spot the differences between the house and its reflection.', score: { 'differences found': 5 } },
    hold: 4500,   // the game ends on the red window in the water: let it stay (a click goes on sooner)
    after: ['interlude1', 'stair', 'room'],   // between I and II: the hall, the stair, your room
  },
  {
    id: 'door', ord: 'Chapter the Second', num: 'II', title: 'A Mere Different Arrangement',
    room: 'door', target: 'door', prompt: 'Try the door.',
    intro: 'Every stone is sound, and none is where it belongs. A sensible man could fix that.',
    encounters: [
      // the physician has moved to the stair and the servant to your room (milestone 2)
      { enter: { valet: 'valet' }, turn: { guest: -1 }, lines: [['The valet, of stealthy step', '*(has been behind you some time. Says nothing, at length.)*']], exit: ['valet'] },
    ],
    outro: 'The last stone slides home. The door opens, very nearly by itself.',
    branch: f => (f.stonesAskew ?? 0) > 0 ? { rather: `${Cap(say(f.stonesAskew))} stones are still askew. She was in a hurry.` }
      : (f.doorHouseMoves ?? 0) > 0 ? { rather: `the house moved ${say(f.doorHouseMoves)} of them for you.` } : null,
    truth: 'face', tarn: 'The gap you kept pushing about, standing in the doorway. It has a face.',
    stub: { line: 'Slide the stones until the door will open.', score: { 'stones set': 8 } },
  },
  {
    id: 'studio', ord: 'Chapter the Third', num: 'III', title: 'The Cheerfulness of My Society',
    room: 'studio', target: 'studio', prompt: 'Sit with him.',
    intro: 'Roderick rises from the sofa, overjoyed, in a whisper.',
    cast: { roderick: ['sofaSit', 1, 'sit'], valet: ['hallValet', -1] },
    encounters: [
      { enter: { roderick: ['sofa', 1] }, lines: [['Roderick', 'You came! Is that wool? It’s terribly loud.'], ['You', 'It’s a coat, Roderick.']] },
      { lines: [['Roderick', 'It’s an incurable family evil. It’ll pass by Thursday.'], ['You', 'Then I’ll stay till Friday.']] },
      { glide: { madeline: ['galleryEast', 'galleryWest'] }, lines: [['Madeline', '*(passes slowly through, without having noticed you.)*'], ['Roderick', 'We don’t mention her. It tires her.']] },
    ],
    outro: 'Everything is hushed. Roderick thanks you, and goes on listening to it.',
    branch: (f, r) => (f.knockSpared || (f.tapsSpared ?? 0) > 0 || (r?.score?.['taps let be'] ?? 0) > 0) ? { line: 'Roderick heard it. He did not thank you.' } : null,
    truth: 'cellar', tarn: 'Madeline lying down on a long table in the cellar. Very neatly. A little early.',
    stub: { line: 'Hush the sunbeams, the roses, the brass band — before they reach him.', score: { 'taps hushed': 41 } },
    // the Account's row; her rewrite below prints under it
    account: { id: 'studio', label: 'Some alleviation of his malady:', value: (f, r) => `${say(Object.entries(r?.score || {}).find(([k]) => /hush/i.test(k))?.[1] ?? 41)}.` },   // R [u03]
  },
  {
    id: 'burial', ord: 'Chapter the Fourth', num: 'IV', title: 'A Harmless Precaution',
    room: 'vault', target: 'vault',
    intro: 'His sister is no more. You help with the arrangements; you’re good at arrangements.',
    cast: { roderick: ['hallEast', -1], valet: 'hallWest' },
    encounters: [
      { lines: [['Roderick', 'A fortnight in the vault. The doctors are so *eager*.'], ['You', 'I don’t feel at liberty to dispute it.']] },
      { enter: { physician: 'arch' }, lines: [['The physician', 'Might I just see her?'], ['The valet', '*(closes the door, in silence.)*']], exit: ['physician'] },
      { lines: [['You', 'She’s blushing.'], ['Roderick', 'It’s usual. In our family.']] },
    ],
    outro: 'Four screws home. The lid is flush, more or less.',
    branch: f => f.burialScrewOut ? { line: 'Three screws home. That’ll hold.' } : null,
    truth: 'lid', tarn: 'The lid, leaning against the vault wall like a borrowed umbrella.',
    stub: { line: 'Screw down the lid.', score: { 'screws turned': 4 } },
  },
  {
    id: 'nights', ord: 'Chapter the Fifth', num: 'V', title: 'The Seventh or Eighth Night',
    room: 'bedroom', target: 'bedroom', prompt: 'To bed.',
    intro: 'Your bed is directly over the vault. A coincidence, and you explain it as one.',
    encounters: [
      { enter: { roderick: ['landingEast', -1] }, lines: [['Roderick, roaming', 'Do you hear —'], ['You', 'The draperies, old man.']], exit: ['roderick'] },
      { glide: { valet: ['landingEast', 'stairTop'] }, lines: [['The valet’s stealthy step', '*(passes your door.)*'], ['Another, stealthier', '*(passes underneath.)*']] },
      { carry: true, enter: { roderick: ['landingEast', -1] }, walk: { roderick: 'chair' }, lines: [['Roderick, with a lamp', 'And you have not *seen* it? Stay. You shall.'], ['You', 'I’ll get my book.']] },
    ],
    outro: 'You run out of stamps before it runs out of noises.',
    branch: f => {
      const left = Array.isArray(f.nightsUnexplained) ? f.nightsUnexplained : [];
      return left.length ? { rather: `you left “${left[0]}” unexplained${left.length > 1 ? `, and ${say(left.length - 1)} more` : ''}.` } : null;
    },
    truth: 'stair', tarn: 'The iron door ajar, and someone on the stair, resting on every step.',
    stub: { line: 'Explain every noise away.', score: { 'noises explained': 12 } },
  },
  {
    id: 'trist', ord: 'Chapter the Sixth', num: 'VI', title: 'One of Your Favorite Romances',
    room: 'bedroom', target: 'bedroom', prompt: 'Read to him.',
    intro: 'You read aloud the silliest book in the house. You’re the hero. It’s wonderful.',
    // the romance's own exchanges (hermit, dragon, shield) belong to the trist game
    encounters: [],
    outro: 'Shield won. You look up, delighted. Roderick has turned his chair to face the door.',
    branch: f => f.tristLastBlow === 'gust' ? { rather: 'the last blow was the wind’s, not yours.' } : null,
    truth: 'doors', tarn: 'The dragon had her brother’s face. The doors of this room are already open.',
    stub: { line: 'Ethelred smashes a door, slays a dragon, wins a shield.', score: { 'dragons slain': 1, 'blows struck': 9 } },
  },
  {
    id: 'flight', ord: 'Chapter the Seventh', num: 'VII', title: 'A Thousand Waters',
    // the trist game plays Roderick's confession and her fall; on the map VII is
    // only the causeway, and the flight game starts at "I fled aghast" [u50]
    room: 'causeway', target: 'causeway', finale: true, go: true,
    cast: { servant: ['servantWait', 1], horse: ['horseWait', -1] },
    encounters: [
      { turn: { guest: -1 }, lines: [['Servant', 'It’s been some weeks, sir.'], ['You', 'It’s been *days*!']] },
    ],
    outro: 'A long tumultuous shouting, like a thousand waters. Then the tarn shuts, sullenly and silently, like a book.',
    branch: f => f.flight?.madeline === 'out' ? { rather: 'she rode off on your horse.' } : null,
    truth: 'whole', tarn: 'The House of Usher, upright and whole, every window lit. One of them is yours.',
    stub: { line: 'Run the causeway as the house comes apart.', score: { 'yards run': 212 } },
  },
];

// The confession: "An Account of My Sojourn", in ink, corrected in red.
// Zero is written "none": an old-style 0 reads as the letter o.
export const num = n => (n === 0 ? 'none' : String(n));
// and small numbers in prose are words
const WORDS = ['none', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
const TEENS = ['thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
export const say = n => n < 13 ? WORDS[n] ?? String(n) : n < 20 ? TEENS[n - 13]
  : n < 100 ? TENS[Math.floor(n / 10)] + (n % 10 ? `-${WORDS[n % 10]}` : '') : String(n);
const Cap = s => s.charAt(0).toUpperCase() + s.slice(1);
// n: the number used when a game reports nothing that matches.
export const ACCOUNT = {
  title: 'An Account of My Sojourn',
  rows: [
    { ch: 'tarn', label: 'Differences found', match: /differ/i, n: 5, rather: (n, f) => f.tarnSawHer ? 'one window, crossed out.' : 'one window uncounted.' },
    { ch: 'door', label: 'Stones set in order', match: /stone/i, n: 8, rather: () => 'the ninth was her.' },
    { ch: 'studio', label: 'Taps hushed', match: /taps? hush|hush/i, n: 41, rather: (n, f) => {
      const spared = f.tapsSpared ?? 0, knock = f.knockSpared ?? false;
      if (knock) return `she knocked ${n + spared} times, the last one loudest. You let it be.`;
      if (spared) return `she knocked ${n + spared} times. You let ${spared} be.`;
      return n ? `she knocked ${n} times.` : 'she knocked, and you heard none of it.';
    } },
    // a screw left out (the flag) is three, whatever else was counted
    { ch: 'burial', label: 'Screws turned', match: /screw/i, n: 4, adjust: (n, f) => (f.burialScrewOut ? Math.min(n, 3) : n), rather: (n, f) => (f.burialScrewOut ?? false) ? `${num(n)} in, ${num(n)} out. The fourth she never needed.` : `${num(n)} in, ${num(n)} out.` },
    { ch: 'nights', label: 'Noises explained', match: /nois|explain/i, n: 12, rather: (n, f) => {
      const left = Array.isArray(f.nightsUnexplained) ? f.nightsUnexplained : [];
      return left.length ? `${num(n)} of ${n + left.length + 1}. You left “${left[0]}” alone.` : `${num(n)} of ${n + 1}.`;
    } },
    // the trist's own "dragons slain" counts the brother (0 on the gust); the romance's dragon always dies
    { ch: 'trist', label: 'Dragons slain', fixed: true, n: 1, rather: (n, f) => (f.tristLastBlow ?? 'struck') === 'gust' ? 'brothers, none. It was the wind.' : 'brothers, one.' },
    { label: 'Days stayed', n: 9, rather: () => 'some weeks.' },
  ],
  last: { label: 'Cheerfulness of my society', value: 'considerable.' },
  rather: 'Say, rather:',
};

// ---- milestone 2: the Account and the first interlude. Marks: V verbatim, R recut, N new (under
// twelve words); [uNN] is the block in source/usher-1845.md. ----

export const ACCOUNT_HEAD = 'I know not how it was —';           // R [u02]
export const UNACCOUNTABLE = 'Unaccountable';                     // R [u32]

// The first interlude: A Mere Different Arrangement [u02], a toy theatre in the hall [u07].
export const INTERLUDE1 = {
  head: 'The hall',                                               // R [u07]
  drag: 'Drag a rod: a mere different arrangement.',              // N · R [u02]
  reach: 'It does not reach.',                                    // N
  tapRod: 'Tap a rod: nearer the lamp.',                          // N
  house: 'A wild inconsistency.',                                 // R [u06]
  second: 'Arrange it, or let it be.',                            // N
  // what the Account writes when a shadow explains her
  excuses: {
    chair: 'The gloomy furniture of the room.',                  // R [u32]
    drape: 'The dark and tattered draperies.',                   // R [u32]
    trophies: 'The phantasmagoric armorial trophies.',           // R [u07]
  },
  // the back page, when she's let be: Poe's sentence in two instalments
  fancy: [
    'There grew in my mind a strange fancy —',                    // R [u05]
    'a fancy so ridiculous, indeed, that I but mention it.',      // R [u05]
  ],
};

// I → II, after the hall: the stair [u07] and your room [u13]
export const STAIR = {
  head: 'The stair',                                                                  // R [u07]
  physician: ['The physician', 'Should the lady die, you will send for me? Before —'],   // N
  passed: ['', 'He accosted me with trepidation and passed on.'],                     // V [u07]
  look: 'Look down.',                                                                 // N
  wait: 6000,
  you: ['You', '*The cheerfulness of my society.*'],                                  // R [u03]
};
export const ROOM = {
  head: 'Your room',                                                                  // N
  servant: ['Servant', 'The family never venture forth, sir.'],                       // R [u13]
  you: ['You', 'Then how do they go?'],                                               // N
};

// The hinge: the Account as written, two lines more, and her first nick
export const HINGE = {
  looks: 'My somewhat childish experiment:',                                          // R [u05]
  society: 'Cheerfulness of my society:',                                             // R [u03]
  considerable: 'considerable.',                                                      // R [u03]
  on: 'Nevertheless.',                                                                // V [u03]
  title: 'A <span class="red">Burial</span> of Some Weeks',                            // R [u03]
  when: 'The evening of your arrival. Immediately beneath.',                          // R [u15, u29]
};
// Act two: her lines are the guest's own, cut; the head is struck and the tail is hers
export const BELOW = {
  first: { cut: 'I know not', tail: 'how it was.' },                                  // R [u02]
  look: 'Look down.',                                                                 // N
  sealed: 'Not yet.',                                                                 // N
  again: 'Look down, again.',                                                         // N
};
// The reveal before each game below: which line of the Account she nicks, and how many words
export const REVEALS = {
  tarn: { id: 'tarn', cut: 1 },                                                       // ~~without~~ having noticed my presence. R [u14]
};

export const LAST = {
  above: 'The tarn closed sullenly and silently over the House of Usher.',            // R [u50]
  below: 'The House of Usher closed sullenly and silently over the tarn.',            // R [u50]
  again: 'Nevertheless.',                                                             // V [u03]
};

// Small things the guest says on the map. Spine's own, not STORY's: keep them few.
export const REMARKS = {
  // while a target waits, the strip says where to go; a click on it goes there
  // (a chapter's own `prompt` is used for its game's target)
  prompt: {
    tarn: 'Look down.',                                                               // N
    hall: 'The hall.',                                                                // N
    door: 'The door, then.',
    studio: 'To the studio.',
    vault: 'Down to the vault.',
    bedroom: 'Up to your room.',
    causeway: 'Out. Now.',
  },
  // after an outro the strip invites a look at the tarn (until the player takes one)
  invite: 'Look not down within the tarn.',                                           // R [u05]
  leave: ['You', '*No room for hesitation.*'],                                        // R [u03]
  // act two
  belowPrompt: 'Under the studio.',                                                  // N
  sealedBelow: ['', 'Not yet.'],                                                     // N
  herPass: { again: 'Under the studio, again.' },                                    // N
  sealed: ch => ['', `*${ch.num}. ${ch.title}* — a chapter to come.`],
};
