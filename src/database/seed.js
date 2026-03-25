const db = require('./db');

const words = [
  // DIFFICULTY 1 — Year 3
  { base: 'go',      past: 'went',     participle: 'gone',      progressive: 'going',      diff: 1, year: 3 },
  { base: 'be',      past: 'was/were', participle: 'been',      progressive: 'being',      diff: 1, year: 3 },
  { base: 'have',    past: 'had',      participle: 'had',       progressive: 'having',     diff: 1, year: 3 },
  { base: 'do',      past: 'did',      participle: 'done',      progressive: 'doing',      diff: 1, year: 3 },
  { base: 'say',     past: 'said',     participle: 'said',      progressive: 'saying',     diff: 1, year: 3 },
  { base: 'come',    past: 'came',     participle: 'come',      progressive: 'coming',     diff: 1, year: 3 },
  { base: 'run',     past: 'ran',      participle: 'run',       progressive: 'running',    diff: 1, year: 3 },
  { base: 'see',     past: 'saw',      participle: 'seen',      progressive: 'seeing',     diff: 1, year: 3 },
  { base: 'get',     past: 'got',      participle: 'got',       progressive: 'getting',    diff: 1, year: 3 },
  { base: 'make',    past: 'made',     participle: 'made',      progressive: 'making',     diff: 1, year: 3 },
  { base: 'take',    past: 'took',     participle: 'taken',     progressive: 'taking',     diff: 1, year: 3 },
  { base: 'eat',     past: 'ate',      participle: 'eaten',     progressive: 'eating',     diff: 1, year: 3 },
  { base: 'give',    past: 'gave',     participle: 'given',     progressive: 'giving',     diff: 1, year: 3 },
  { base: 'find',    past: 'found',    participle: 'found',     progressive: 'finding',    diff: 1, year: 3 },
  { base: 'know',    past: 'knew',     participle: 'known',     progressive: 'knowing',    diff: 1, year: 3 },
  { base: 'think',   past: 'thought',  participle: 'thought',   progressive: 'thinking',   diff: 1, year: 3 },
  { base: 'tell',    past: 'told',     participle: 'told',      progressive: 'telling',    diff: 1, year: 3 },
  { base: 'put',     past: 'put',      participle: 'put',       progressive: 'putting',    diff: 1, year: 3 },
  { base: 'let',     past: 'let',      participle: 'let',       progressive: 'letting',    diff: 1, year: 3 },

  // DIFFICULTY 2 — Year 4
  { base: 'grow',    past: 'grew',     participle: 'grown',     progressive: 'growing',    diff: 2, year: 4 },
  { base: 'draw',    past: 'drew',     participle: 'drawn',     progressive: 'drawing',    diff: 2, year: 4 },
  { base: 'throw',   past: 'threw',    participle: 'thrown',    progressive: 'throwing',   diff: 2, year: 4 },
  { base: 'fly',     past: 'flew',     participle: 'flown',     progressive: 'flying',     diff: 2, year: 4 },
  { base: 'blow',    past: 'blew',     participle: 'blown',     progressive: 'blowing',    diff: 2, year: 4 },
  { base: 'swim',    past: 'swam',     participle: 'swum',      progressive: 'swimming',   diff: 2, year: 4 },
  { base: 'sing',    past: 'sang',     participle: 'sung',      progressive: 'singing',    diff: 2, year: 4 },
  { base: 'ring',    past: 'rang',     participle: 'rung',      progressive: 'ringing',    diff: 2, year: 4 },
  { base: 'drink',   past: 'drank',    participle: 'drunk',     progressive: 'drinking',   diff: 2, year: 4 },
  { base: 'begin',   past: 'began',    participle: 'begun',     progressive: 'beginning',  diff: 2, year: 4 },
  { base: 'bring',   past: 'brought',  participle: 'brought',   progressive: 'bringing',   diff: 2, year: 4 },
  { base: 'buy',     past: 'bought',   participle: 'bought',    progressive: 'buying',     diff: 2, year: 4 },
  { base: 'catch',   past: 'caught',   participle: 'caught',    progressive: 'catching',   diff: 2, year: 4 },
  { base: 'teach',   past: 'taught',   participle: 'taught',    progressive: 'teaching',   diff: 2, year: 4 },
  { base: 'fight',   past: 'fought',   participle: 'fought',    progressive: 'fighting',   diff: 2, year: 4 },
  { base: 'sit',     past: 'sat',      participle: 'sat',       progressive: 'sitting',    diff: 2, year: 4 },
  { base: 'stand',   past: 'stood',    participle: 'stood',     progressive: 'standing',   diff: 2, year: 4 },
  { base: 'leave',   past: 'left',     participle: 'left',      progressive: 'leaving',    diff: 2, year: 4 },
  { base: 'meet',    past: 'met',      participle: 'met',       progressive: 'meeting',    diff: 2, year: 4 },
  { base: 'hold',    past: 'held',     participle: 'held',      progressive: 'holding',    diff: 2, year: 4 },
  { base: 'feel',    past: 'felt',     participle: 'felt',      progressive: 'feeling',    diff: 2, year: 4 },
  { base: 'keep',    past: 'kept',     participle: 'kept',      progressive: 'keeping',    diff: 2, year: 4 },
  { base: 'sleep',   past: 'slept',    participle: 'slept',     progressive: 'sleeping',   diff: 2, year: 4 },
  { base: 'sweep',   past: 'swept',    participle: 'swept',     progressive: 'sweeping',   diff: 2, year: 4 },
  { base: 'hear',    past: 'heard',    participle: 'heard',     progressive: 'hearing',    diff: 2, year: 4 },
  { base: 'send',    past: 'sent',     participle: 'sent',      progressive: 'sending',    diff: 2, year: 4 },
  { base: 'spend',   past: 'spent',    participle: 'spent',     progressive: 'spending',   diff: 2, year: 4 },
  { base: 'build',   past: 'built',    participle: 'built',     progressive: 'building',   diff: 2, year: 4 },
  { base: 'win',     past: 'won',      participle: 'won',       progressive: 'winning',    diff: 2, year: 4 },
  { base: 'lose',    past: 'lost',     participle: 'lost',      progressive: 'losing',     diff: 2, year: 4 },
  { base: 'sell',    past: 'sold',     participle: 'sold',      progressive: 'selling',    diff: 2, year: 4 },
  { base: 'read',    past: 'read',     participle: 'read',      progressive: 'reading',    diff: 2, year: 4 },

  // DIFFICULTY 3 — Year 5-6
  { base: 'speak',   past: 'spoke',    participle: 'spoken',    progressive: 'speaking',   diff: 3, year: 5 },
  { base: 'break',   past: 'broke',    participle: 'broken',    progressive: 'breaking',   diff: 3, year: 5 },
  { base: 'wake',    past: 'woke',     participle: 'woken',     progressive: 'waking',     diff: 3, year: 5 },
  { base: 'choose',  past: 'chose',    participle: 'chosen',    progressive: 'choosing',   diff: 3, year: 5 },
  { base: 'steal',   past: 'stole',    participle: 'stolen',    progressive: 'stealing',   diff: 3, year: 5 },
  { base: 'freeze',  past: 'froze',    participle: 'frozen',    progressive: 'freezing',   diff: 3, year: 5 },
  { base: 'write',   past: 'wrote',    participle: 'written',   progressive: 'writing',    diff: 3, year: 5 },
  { base: 'bite',    past: 'bit',      participle: 'bitten',    progressive: 'biting',     diff: 3, year: 5 },
  { base: 'ride',    past: 'rode',     participle: 'ridden',    progressive: 'riding',     diff: 3, year: 5 },
  { base: 'hide',    past: 'hid',      participle: 'hidden',    progressive: 'hiding',     diff: 3, year: 5 },
  { base: 'drive',   past: 'drove',    participle: 'driven',    progressive: 'driving',    diff: 3, year: 5 },
  { base: 'rise',    past: 'rose',     participle: 'risen',     progressive: 'rising',     diff: 3, year: 6 },
  { base: 'shrink',  past: 'shrank',   participle: 'shrunk',    progressive: 'shrinking',  diff: 3, year: 5 },
  { base: 'spring',  past: 'sprang',   participle: 'sprung',    progressive: 'springing',  diff: 3, year: 5 },
  { base: 'sting',   past: 'stung',    participle: 'stung',     progressive: 'stinging',   diff: 3, year: 5 },
  { base: 'swing',   past: 'swung',    participle: 'swung',     progressive: 'swinging',   diff: 3, year: 5 },
  { base: 'fling',   past: 'flung',    participle: 'flung',     progressive: 'flinging',   diff: 3, year: 5 },
  { base: 'fall',    past: 'fell',     participle: 'fallen',    progressive: 'falling',    diff: 3, year: 5 },
  { base: 'shake',   past: 'shook',    participle: 'shaken',    progressive: 'shaking',    diff: 3, year: 5 },
  { base: 'wear',    past: 'wore',     participle: 'worn',      progressive: 'wearing',    diff: 3, year: 5 },
  { base: 'tear',    past: 'tore',     participle: 'torn',      progressive: 'tearing',    diff: 3, year: 5 },
  { base: 'shine',   past: 'shone',    participle: 'shone',     progressive: 'shining',    diff: 3, year: 5 },
  { base: 'shoot',   past: 'shot',     participle: 'shot',      progressive: 'shooting',   diff: 3, year: 5 },
  { base: 'dig',     past: 'dug',      participle: 'dug',       progressive: 'digging',    diff: 3, year: 5 },
  { base: 'hang',    past: 'hung',     participle: 'hung',      progressive: 'hanging',    diff: 3, year: 5 },
  { base: 'stick',   past: 'stuck',    participle: 'stuck',     progressive: 'sticking',   diff: 3, year: 5 },
  { base: 'spin',    past: 'spun',     participle: 'spun',      progressive: 'spinning',   diff: 3, year: 6 },
  { base: 'lead',    past: 'led',      participle: 'led',       progressive: 'leading',    diff: 3, year: 6 },
  { base: 'feed',    past: 'fed',      participle: 'fed',       progressive: 'feeding',    diff: 3, year: 6 },
  { base: 'bleed',   past: 'bled',     participle: 'bled',      progressive: 'bleeding',   diff: 3, year: 6 },
  { base: 'deal',    past: 'dealt',    participle: 'dealt',     progressive: 'dealing',    diff: 3, year: 6 },
  { base: 'mean',    past: 'meant',    participle: 'meant',     progressive: 'meaning',    diff: 3, year: 6 },
  { base: 'dream',   past: 'dreamt',   participle: 'dreamt',    progressive: 'dreaming',   diff: 3, year: 6 },
];

const stmt = db.prepare(`
  INSERT OR IGNORE INTO words
    (base_form, past_simple, past_participle, present_participle, difficulty, year_group)
  VALUES (?, ?, ?, ?, ?, ?)
`);

words.forEach(w => {
  stmt.run(w.base, w.past, w.participle, w.progressive, w.diff, w.year);
});

stmt.finalize(() => {
  const byDiff = { 1: 0, 2: 0, 3: 0 };
  words.forEach(w => byDiff[w.diff]++);

  console.log(`✅ Seeded ${words.length} KS2 irregular verbs`);
  console.log(`   Difficulty 1 (Year 3): ${byDiff[1]} verbs`);
  console.log(`   Difficulty 2 (Year 4): ${byDiff[2]} verbs`);
  console.log(`   Difficulty 3 (Year 5-6): ${byDiff[3]} verbs`);
  db.close();
});