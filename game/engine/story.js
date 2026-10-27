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
    truth: 'window', tarn: 'A lit window, dark above. Someone in it looks down, as you did.',
    stub: { line: 'Spot the differences between the house and its reflection.', score: { 'differences found': 7 } },
  },
  {
    id: 'door', ord: 'Chapter the Second', num: 'II', title: 'A Mere Different Arrangement',
    room: 'door', target: 'door',
    intro: 'Every stone is sound, and none is where it belongs. A sensible man could fix that.',
    encounters: [
      { enter: { valet: 'valet' }, turn: { guest: -1 }, lines: [['The valet, of stealthy step', '*(has been behind you some time. Says nothing, at length.)*'], ['You', 'Good Lord.']] },
      { enter: { physician: 'physician' }, turn: { guest: 1, physician: -1 }, lines: [['The physician', 'If the sister dies, send for me. Before anyone does anything.'], ['You', 'What would anyone do?']], exit: ['physician'] },
      { enter: { servant: 'servantAway' }, lines: [['Servant', 'The family don’t use the door, sir.'], ['You', 'Then how do they get out?']], exit: ['servant', 'valet'] },
    ],
    outro: 'The last stone slides home. The door opens, very nearly by itself.',
    truth: 'face', tarn: 'The gap you kept pushing about, standing in the doorway. It has a face.',
    stub: { line: 'Slide the stones until the door will open.', score: { 'stones set': 8 } },
  },
  {
    id: 'studio', ord: 'Chapter the Third', num: 'III', title: 'The Cheerfulness of My Society',
    room: 'studio', target: 'studio',
    intro: 'Roderick rises from the sofa, overjoyed, in a whisper.',
    cast: { roderick: ['sofa', -1], valet: 'hallValet' },
    encounters: [
      { lines: [['Roderick', 'You came! Is that wool? It’s terribly loud.'], ['You', 'It’s a coat, Roderick.']] },
      { lines: [['Roderick', 'It’s an incurable family evil. It’ll pass by Thursday.'], ['You', 'Then I’ll stay till Friday.']] },
      { glide: { madeline: ['galleryEast', 'galleryWest'] }, lines: [['Madeline', '*(passes slowly through, without having noticed you.)*'], ['Roderick', 'We don’t mention her. It tires her.']] },
    ],
    outro: 'Everything is hushed. Roderick thanks you, and goes on listening to it.',
    truth: 'cellar', tarn: 'Madeline lying down on a long table in the cellar. Very neatly. A little early.',
    stub: { line: 'Hush the sunbeams, the roses, the brass band — before they reach him.', score: { 'taps hushed': 41 } },
  },
  {
    id: 'burial', ord: 'Chapter the Fourth', num: 'IV', title: 'A Harmless Precaution', sealed: true,
    room: 'vault', target: 'vault',
    intro: 'His sister is no more. You help with the arrangements; you’re good at arrangements.',
    cast: { roderick: ['hallEast', -1], valet: 'hallWest' },
    encounters: [
      { lines: [['Roderick', 'A fortnight in the vault. The doctors are so *eager*.'], ['You', 'I don’t feel at liberty to dispute it.']] },
      { enter: { physician: 'arch' }, lines: [['The physician', 'Might I just see her?'], ['The valet', '*(closes the door, in silence.)*']], exit: ['physician'] },
      { lines: [['You', 'She’s blushing.'], ['Roderick', 'It’s usual. In our family.']] },
    ],
    outro: 'Four screws home. The lid is flush, more or less.',
    truth: 'lid', tarn: 'The lid, leaning against the vault wall like a borrowed umbrella.',
    stub: { line: 'Screw down the lid.', score: { 'screws turned': 4 } },
  },
  {
    id: 'nights', ord: 'Chapter the Fifth', num: 'V', title: 'The Seventh or Eighth Night', sealed: true, night: true,
    room: 'bedroom', target: 'bedroom',
    intro: 'Your bed is directly over the vault. A coincidence, and you explain it as one.',
    encounters: [
      { enter: { roderick: ['landingEast', -1] }, lines: [['Roderick, roaming', 'Do you hear —'], ['You', 'The draperies, old man.']], exit: ['roderick'] },
      { glide: { valet: ['landingEast', 'stairTop'] }, lines: [['The valet’s stealthy step', '*(passes your door.)*'], ['Another, stealthier', '*(passes underneath.)*']] },
      { carry: true, enter: { roderick: ['landingEast', -1] }, walk: { roderick: 'chair' }, lines: [['Roderick, with a lamp', 'And you have not *seen* it? Stay. You shall.'], ['You', 'I’ll get my book.']] },
    ],
    outro: 'You run out of stamps before it runs out of noises.',
    truth: 'stair', tarn: 'The iron door ajar, and someone on the stair, resting on every step.',
    stub: { line: 'Explain every noise away.', score: { 'noises explained': 12 } },
  },
  {
    id: 'trist', ord: 'Chapter the Sixth', num: 'VI', title: 'One of Your Favorite Romances', night: true,
    room: 'bedroom', target: 'bedroom',
    intro: 'You read aloud the silliest book in the house. You’re the hero. It’s wonderful.',
    // the romance's own exchanges (hermit, dragon, shield) belong to the trist game
    encounters: [],
    outro: 'Shield won. You look up, delighted. Roderick has turned his chair to face the door.',
    truth: 'doors', tarn: 'The dragon had her brother’s face. The doors of this room are already open.',
    stub: { line: 'Ethelred smashes a door, slays a dragon, wins a shield.', score: { 'dragons slain': 1, 'blows struck': 9 } },
  },
  {
    id: 'flight', ord: 'Chapter the Seventh', num: 'VII', title: 'A Thousand Waters', night: true,
    room: 'bedroom', target: 'causeway', finale: true,
    // when the trist game has already played her arrival, the spine only bridges to the flight
    intro: f => f.tristLastBlow ? 'From that chamber, and from that mansion, you flee aghast.' : 'Roderick finally speaks. He’s been listening all along.',
    cast: f => f.tristLastBlow ? { roderick: ['chair', 1], madeline: ['fallen', -1] } : { roderick: ['chair', 1] },
    // if the trist game has already played her arrival (it sets tristLastBlow), don't tell it twice
    encounters: [
      { skipIf: f => f.tristLastBlow, lines: [['Roderick', 'I heard her days ago. I sent for you because you never hear anything.'], ['You', 'Oh, Roderick.']] },
      { skipIf: f => f.tristLastBlow, lines: [['Roderick', 'Madman! She now stands without the door!'], ['You', 'That’s only the wind.']] },
      { skipIf: f => f.tristLastBlow, enter: { madeline: ['threshold', -1] }, lines: [['The doors', '*(open. It is the wind.)*'], ['Madeline', '*(is there anyway.)*']] },
    ],
    outro: 'A long tumultuous shouting, like a thousand waters. Then the tarn shuts, sullenly and silently, like a book.',
    truth: 'whole', tarn: 'The House of Usher, upright and whole, every window lit. One of them is yours.',
    stub: { line: 'Run the causeway as the house comes apart.', score: { 'yards run': 212 } },
  },
];

// The confession: "An Account of My Sojourn", in ink, corrected in red.
// n: the number used when a game reports nothing that matches.
export const ACCOUNT = {
  title: 'An Account of My Sojourn',
  rows: [
    { ch: 'tarn', label: 'Differences found', match: /differ/i, n: 7, rather: () => 'one window uncounted.' },
    { ch: 'door', label: 'Stones set in order', match: /stone/i, n: 8, rather: () => 'the ninth was her.' },
    { ch: 'studio', label: 'Taps hushed', match: /taps? hush|hush/i, n: 41, rather: n => `she knocked ${n} times.` },
    { ch: 'burial', label: 'Screws turned', match: /screw/i, n: 4, rather: n => `${n} in, ${n} out.` },
    { ch: 'nights', label: 'Noises explained', match: /nois|explain/i, n: 12, rather: n => `${n} of ${n + 1}.` },
    { ch: 'trist', label: 'Dragons slain', match: /dragon/i, n: 1, rather: n => `brothers, ${n}.` },
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
  leave: ['You', 'Some weeks, he said. It has been an afternoon.'],
  sealed: ch => ['', `*${ch.num}. ${ch.title}* — a chapter to come.`],
};
