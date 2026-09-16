// Self-improvement / culture suggestion library.
// Every suggestion comes with a "what you could actually do" line —
// it is not meant to be a dry list.

export const CATEGORIES = [
  { id: 'reading', label: 'reading' },
  { id: 'art',     label: 'art' },
  { id: 'music',   label: 'music' },
  { id: 'film',    label: 'film' },
  { id: 'mind',    label: 'mind' },
  { id: 'body',    label: 'body' },
  { id: 'people',  label: 'people' },
  { id: 'skill',   label: 'skill' },
  { id: 'alone',   label: 'time alone' },
  { id: 'world',   label: 'world' },
];

export const SUGGESTIONS = [
  // reading
  { c: 'reading', t: 'Enter a classic through a small door', d: "Don't promise to read the whole thick novel. Read only the first chapter; if the rest comes, let it come." },
  { c: 'reading', t: 'Read poetry without trying to understand it', d: 'Read a poem twice: once silently, once out loud. The meaning comes later, the sound comes first.' },
  { c: 'reading', t: 'Let yourself abandon a book', d: 'Put down the book you are not enjoying. It is that book you dislike, not reading.' },
  { c: 'reading', t: 'Keep a quotes notebook', d: 'Collect the lines you underline in one place. In a year it becomes a map of your own mind.' },
  { c: 'reading', t: 'Find an essayist', d: 'Read essays instead of novels. Short, personal, and finished in one sitting.' },
  { c: 'reading', t: 'Ten pages in the morning', d: 'Ten pages before you touch your phone. Let the first voice of the day be a book, not somebody else.' },
  { c: 'reading', t: 'Read from another country', d: 'Pick a writer from a country you have never read. A way of going somewhere without going.' },

  // art
  { c: 'art', t: 'Look at one painting for ten minutes', d: 'Open a single painting and look at it for ten minutes. Getting bored is part of it; what comes after is the point.' },
  { c: 'art', t: 'Draw badly', d: "Don't try to draw well. Draw the glass in front of you. The aim is not the result, it is the way of looking." },
  { c: 'art', t: 'Wander an online museum', d: 'Browse the online collections of the big museums. Getting stuck in one room is allowed.' },
  { c: 'art', t: 'Make a collage', d: 'Cut up old magazines and glue them down. Making something with your hands is the fastest way to quiet your head.' },
  { c: 'art', t: 'Learn one art movement', d: 'Pick a movement, look at three works, read why they did it that way. A week is enough.' },
  { c: 'art', t: 'Keep a photo diary', d: 'One photo a day. It does not have to be beautiful, it just has to be from that day.' },

  // music
  { c: 'music', t: 'Listen to an album end to end', d: 'Not a shuffled playlist — one album, in order. Hearing it in the order the artist built is a different thing.' },
  { c: 'music', t: 'Make yourself a "right now" playlist', d: 'Ten songs that describe how you are this month. Years later this will bring back more than a photograph.' },
  { c: 'music', t: 'Go into a genre you know nothing about', d: 'Jazz, classical, bossa nova, folk. Pick one and listen only to that for a week.' },
  { c: 'music', t: 'Work to instrumentals', d: 'Music with words splits your attention. Try wordless while you work and measure the difference.' },
  { c: 'music', t: 'Translate a song', d: 'Take a song you love in another language and put the words into your own. Half language practice, half feeling.' },

  // film
  { c: 'film', t: 'Pick a director, not a film', d: 'Watch three films by one director back to back. You start seeing what repeats.' },
  { c: 'film', t: 'Watch with subtitles', d: "Subtitles over dubbing. The actor's voice is half the performance." },
  { c: 'film', t: 'Write three sentences after a film', d: 'No rating. Just three lines: what I felt, what stayed, who I would tell.' },
  { c: 'film', t: 'Rewatch an old favourite', d: 'Watch something you saw five years ago. The film is the same, you are not; that is the measurement.' },
  { c: 'film', t: 'Documentary night', d: 'Give one evening a month to a documentary. Pick a subject you have no interest in — that is where the surprise is.' },

  // mind
  { c: 'mind', t: 'Write morning pages', d: 'When you wake, without thinking, write three pages. Nobody will read them. The point is to empty your head.' },
  { c: 'mind', t: 'One hour without a phone', d: 'Put the phone in another room for an hour a day. Hard on day one, a relief by day three.' },
  { c: 'mind', t: 'Learn one thing deeply', d: 'Instead of ten things at random, pick one subject and follow it for a month. Depth is more filling than width.' },
  { c: 'mind', t: 'Ask yourself a question and write the answer', d: '"Why did that bother me so much?" The answer does not turn up until it is written.' },
  { c: 'mind', t: 'Keep a thought log', d: 'Write down a thought that presses on you, then under it: is this certain, or is it fear? Separating those two solves most of it.' },
  { c: 'mind', t: 'Finish one thing before starting another', d: 'For one week, focus on finishing a single task. Half-done things take up room in your head.' },
  { c: 'mind', t: 'Three good things at night', d: 'Write three things at the end of the day. They do not have to be big; "the coffee was good" counts.' },

  // body
  { c: 'body', t: "Don't count walking as exercise", d: 'Walk with no target. No step count, no calories. Just walking is good for the body too.' },
  { c: 'body', t: 'Build a stretching routine', d: 'Five minutes in the morning. Not for performance — so the rest of the day sits easier.' },
  { c: 'body', t: 'Fix your bedtime', d: 'When you sleep matters more than how long. Go to bed at the same time for a week.' },
  { c: 'body', t: 'Tie drinking water to a habit', d: 'A glass every time you sit down at a desk. Attach it to a sequence, not to remembering.' },
  { c: 'body', t: 'Practise standing neutral in the mirror', d: 'No praise, no criticism. Saying "this is my body" is the first step to peace without having to love it.' },
  { c: 'body', t: 'Ask your body what it wants', d: 'Before training: which would be good today — pushing, or softening? Both are valid answers.' },

  // people
  { c: 'people', t: 'Write a long message', d: 'Not an emoji, a paragraph. Tell someone what you actually think.' },
  { c: 'people', t: 'Write to an old friend', d: 'You do not need an excuse. "You came to mind" is a complete sentence.' },
  { c: 'people', t: 'Set one boundary', d: 'Say no to one thing this week. Try saying it without explaining yourself.' },
  { c: 'people', t: 'Meet in person', d: 'A coffee instead of a screen. Even briefly — nothing replaces being in the same room.' },
  { c: 'people', t: 'Try listening', d: 'In one conversation, only listen. Listening without planning your reply is surprisingly hard.' },

  // skill
  { c: 'skill', t: 'Learn one dish properly', d: 'Not twenty recipes — one. Make it until you know it by heart. That is how a skill settles.' },
  { c: 'skill', t: 'Sew something', d: 'A button, a split seam. Being able to repair your own things gives an unexpected kind of confidence.' },
  { c: 'skill', t: 'Improve your handwriting', d: 'Five minutes a day, the same sentence. Liking your own handwriting is a small, lasting pleasure.' },
  { c: 'skill', t: 'Ten words a day in a language', d: "Don't start with grammar. Start with words. The wish to speak comes before grammar does." },
  { c: 'skill', t: 'Learn to take photographs', d: 'Learn light, not the camera. Shoot the same object at three different hours.' },
  { c: 'skill', t: 'Repair something yourself', d: 'Try before you throw it away. Most things fix more easily than you think.' },

  // alone
  { c: 'alone', t: 'Go for coffee by yourself', d: 'No phone. Just sit and watch. The first ten minutes are strange, the rest is very good.' },
  { c: 'alone', t: 'Go to the cinema alone', d: 'Watch the film you want, without having to agree with anyone.' },
  { c: 'alone', t: 'Cook yourself dinner', d: 'Lay a proper table for yourself. Nobody is coming; lay it anyway.' },
  { c: 'alone', t: 'Take a small trip alone', d: 'Even for a day. It reminds you what being on your own pace feels like.' },
  { c: 'alone', t: 'Do nothing', d: 'Fifteen minutes, unplanned. Tolerating emptiness is also something you learn.' },

  // world
  { c: 'world', t: 'Read behind a headline', d: 'Learn the subject, not the headline. Reading one story in three sources shows you the difference.' },
  { c: 'world', t: 'Learn one period of history', d: 'Pick a century. Only that century. A whole thing instead of fragments.' },
  { c: 'world', t: 'Look at a map', d: 'Find a country you have heard of but cannot place, and read five things about it.' },
  { c: 'world', t: 'Learn one architectural style', d: 'Recognising buildings as you walk turns the city into a completely different place.' },
  { c: 'world', t: 'Learn a bit of science, simply', d: 'Read until you are curious, not until you understand. Curiosity brings the rest.' },
];

function seed(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return Math.abs(h);
}

/** The suggestion of the day, stable through the day. */
export function dailySuggestion(dateISO) {
  return SUGGESTIONS[seed('improve|' + dateISO) % SUGGESTIONS.length];
}

/** n random suggestions; optionally filtered by category. */
export function pickSuggestions(n = 3, category = null, exclude = []) {
  const pool = SUGGESTIONS
    .filter((s) => !category || s.c === category)
    .filter((s) => !exclude.includes(s.t));
  const out = [];
  const used = new Set();
  const limit = Math.min(n, pool.length);
  while (out.length < limit) {
    const i = Math.floor(Math.random() * pool.length);
    if (used.has(i)) continue;
    used.add(i);
    out.push(pool[i]);
  }
  return out;
}

export const categoryOf = (id) => CATEGORIES.find((c) => c.id === id) || { label: id };
