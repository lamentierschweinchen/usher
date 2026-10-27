// The script, from work/design/STORY.md. Lines are [speaker, text]; *italic*
// marks stage directions. Speaker '' is narration.
//
// Encounter fields: lines; enter {actor: spot} (fades in first); exit [actors]
// (fade out after); glide {actor: [from, to]} (Madeline crossing, unhurried);
// turn {actor: dir}; carry (when its chapter is sealed, play it at the start of
// the next one); skipIf(flags) (drop it, e.g. when a game has already told it).

export const TITLE = {
  above: 'A Sojourn of Some Weeks',
  below: 'A <tspan class="red">Burial</tspan> of Some Weeks',
};

export const LETTER = {
  // ~~struck~~ and __underlined twice__ render in Roderick's agitated hand
  body: [
    'My dear old friend — come. I am ill: the senses. Light cuts. Roses shout. Bring *nothing that rings*. Bring your cheerfulness; you always had extra.',
    'My sister is ~~dying~~ ~~quiet~~ resting. The house is well. The house is __very__ well. Come within the fortnight.',
  ],
  sign: 'Your best, your only, R.U.',
  ps: 'P.S. Don’t look in the tarn. Everyone does.',
};

export const CHAPTERS = [
  {
    id: 'tarn', ord: 'Chapter the First', num: 'I', title: 'A Somewhat Childish Experiment',
    room: 'causeway', target: 'tarn',
    intro: 'The house regards you with vacant, eye-like windows. You regard it back. Someone has to.',
    cast: { horse: 'horse', peasant: 'peasant' },
    encounters: [
      { enter: { servant: 'servant' }, turn: { servant: -1 }, lines: [['Servant', 'Shall I stable him for some weeks, sir?'], ['You', 'A night or two.']] },
      { turn: { guest: -1 }, lines: [['A peasant', 'The House of Usher, sir: the stones or the family?'], ['You', 'Is there a difference?']] },
      { lines: [['Your horse', '*(will not look in the water.)*'], ['You', 'Sensible animal.']], exit: ['servant', 'horse', 'peasant'], turn: { guest: 1 } },
    ],
    outro: 'All differences accounted for. The crack is only in the water, and you aren’t staying in the water.',
    branch: f => f.tarnSawHer ? { rather: 'you saw someone in that window, and crossed her out.' } : null,
    // the tarn game ends on the lit window in the water, so the map's tarn doesn't repeat it
    truth: null, tarn: 'A lit window, dark above. Someone in it looks down, as you did.',
    stub: { line: 'Spot the differences between the house and its reflection.', score: { 'differences found': 5 } },
    hold: 4500,   // the game ends on the red window in the water: let it stay (a click goes on sooner)
  },
  {
    id: 'door', ord: 'Chapter the Second', num: 'II', title: 'A Mere Different Arrangement',
    room: 'door', target: 'door', prompt: 'Try the door.',
    intro: 'Every stone is sound, and none is where it belongs. A sensible man could fix that.',
    encounters: [
      { enter: { valet: 'valet' }, turn: { guest: -1 }, lines: [['The valet, of stealthy step', '*(has been behind you some time. Says nothing, at length.)*'], ['You', 'Good Lord.']] },
      { enter: { physician: 'physician' }, turn: { guest: 1, physician: -1 }, lines: [['The physician', 'If the sister dies, send for me. Before anyone does anything.'], ['You', 'What would anyone do?']], exit: ['physician'] },
      { enter: { servant: 'servantAway' }, lines: [['Servant', 'The family don’t use the door, sir.'], ['You', 'Then how do they get out?']], exit: ['servant', 'valet'] },
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
export const say = n => WORDS[n] ?? String(n);
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

export const LAST = {
  above: 'The tarn closed sullenly and silently over the House of Usher.',
  below: 'The House of Usher closed sullenly and silently over the tarn.',
  again: 'Nevertheless.',
};

// Small things the guest says on the map. Spine's own, not STORY's: keep them few.
export const REMARKS = {
  // while a target waits, the strip says where to go; a click on it goes there
  // (a chapter's own `prompt` is used for its game's target)
  prompt: {
    tarn: 'Look down. Everyone does.',
    door: 'The door, then.',
    studio: 'To the studio.',
    vault: 'Down to the vault.',
    bedroom: 'Up to your room.',
    causeway: 'Out. Now.',
  },
  // after an outro the strip invites a look at the tarn (until the player takes one)
  invite: [
    'The tarn has something to say about that.',
    'The water seems to have its own view.',
    'The tarn is unconvinced.',
    'Something stirs in the tarn. A fish, surely.',
    'The tarn would like a word.',
    'The water is doing that thing again.',
  ],
  leave: ['You', 'Some weeks, he said. It has been an afternoon.'],
  // act two
  belowPrompt: 'Under the studio.',
  sealedBelow: ['', '*Not yet. The rest of the house is still asleep.*'],
  herPass: { again: 'Under the studio, again.' },
  sealed: ch => ['', `*${ch.num}. ${ch.title}* — a chapter to come.`],
};
