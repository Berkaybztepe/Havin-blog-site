// Affirmation library.
//
// Tone note: this does not say "today will be amazing!". Some days are bad,
// and saying so is its own kind of affirmation. Every line is tagged with a
// mood; pick a heavy day and you get lines that fit a heavy day.
//
// Moods carry a quiet colour instead of an emoji — the colour also tints the
// day in the little calendar.

export const MOODS = [
  { id: 'good',    label: 'good',     color: '#7f9a6d' },
  { id: 'calm',    label: 'calm',     color: '#7d9aa8' },
  { id: 'tired',   label: 'tired',    color: '#8e8595' },
  { id: 'heavy',   label: 'heavy',    color: '#6b7280' },
  { id: 'angry',   label: 'angry',    color: '#b06a52' },
  { id: 'empty',   label: 'empty',    color: '#a8a199' },
  { id: 'hopeful', label: 'hopeful',  color: '#a3894e' },
];

export const AFFIRMATIONS = [
  // --- calm / everyday ---
  { t: 'Noticing small things counts as getting something done today.', m: ['calm', 'good'] },
  { t: "I'm not in a hurry. Life doesn't owe me a deadline.", m: ['calm', 'tired'] },
  { t: 'Being kind to myself is not spoiling myself. It is looking after myself.', m: ['calm', 'heavy'] },
  { t: "Getting through today is enough. I don't have to get through every day at once.", m: ['calm', 'tired'] },
  { t: 'A quiet day is still a day that was lived.', m: ['calm', 'empty'] },
  { t: 'Doing something slowly is not the same as doing it badly.', m: ['calm'] },
  { t: 'I have a life I do not have to justify to anyone.', m: ['calm', 'angry'] },
  { t: 'Today, breathing and drinking a glass of water is already a kind of care.', m: ['calm', 'tired'] },

  // --- tired ---
  { t: 'My tiredness is not laziness. It comes from carrying things.', m: ['tired', 'heavy'] },
  { t: 'Rest is not something to be earned. It is something I need.', m: ['tired'] },
  { t: 'I did a little today. A little is still an amount.', m: ['tired', 'heavy'] },
  { t: 'The days I do not push myself still belong to me.', m: ['tired'] },
  { t: 'When I am running on empty, I need softness, not a plan.', m: ['tired', 'heavy'] },
  { t: 'Sleeping is not running away. It is putting myself back together.', m: ['tired'] },

  // --- heavy / bad day ---
  { t: 'Today is bad. That does not mean my life is bad.', m: ['heavy'] },
  { t: 'I do not have to feel good. Staying here is enough.', m: ['heavy', 'empty'] },
  { t: 'Crying is not falling apart. It is letting something out.', m: ['heavy'] },
  { t: 'This feeling is weather. It is not permanent, it is just how it is right now.', m: ['heavy', 'empty'] },
  { t: 'This can be a day where I do not have to look fine for anyone.', m: ['heavy', 'tired'] },
  { t: 'Even on my worst day I do not have to be my own enemy.', m: ['heavy'] },
  { t: 'What I cannot solve right now may not weigh the same tomorrow.', m: ['heavy', 'hopeful'] },
  { t: 'Feeling something is not the same as being it.', m: ['heavy', 'empty'] },
  { t: 'I only just got through today. Getting through is a skill too.', m: ['heavy', 'tired'] },

  // --- empty / disconnected ---
  { t: 'The days I feel nothing are still my days.', m: ['empty'] },
  { t: 'Not being able to find myself does not mean I have lost myself.', m: ['empty'] },
  { t: 'Not feeling like I belong somewhere is not the same as belonging nowhere.', m: ['empty', 'heavy'] },
  { t: 'Emptiness is also a place. I can sit in it for a while.', m: ['empty'] },
  { t: "I don't fully know who I am yet, and that is what the middle of the road looks like.", m: ['empty', 'hopeful'] },

  // --- angry ---
  { t: 'My anger is not a malfunction. It is news that a line was crossed.', m: ['angry'] },
  { t: 'I do not have to be understanding with everyone. Sometimes I am just angry.', m: ['angry'] },
  { t: 'Saying no does not make me a bad person.', m: ['angry', 'calm'] },
  { t: 'I do not have to grow in a room that makes me smaller.', m: ['angry', 'hopeful'] },
  { t: 'My anger is telling me what matters to me. I am listening.', m: ['angry'] },

  // --- good, without the sugar ---
  { t: 'Today was good, and I think that is worth writing down.', m: ['good'] },
  { t: 'Feeling good is real too. The bad is not the only real thing.', m: ['good', 'hopeful'] },
  { t: 'I am someone who can enjoy my own company.', m: ['good', 'calm'] },
  { t: 'I wore something I liked today, and it turned into a small ceremony.', m: ['good'] },
  { t: 'I can be glad about things without making them smaller first.', m: ['good'] },

  // --- hopeful / growth ---
  { t: 'I do not have to be flawless. Continuing is enough.', m: ['hopeful', 'heavy'] },
  { t: 'I am still learning, and that is not the same as being behind.', m: ['hopeful', 'empty'] },
  { t: 'Getting to know myself is not an arrival. It is a long introduction.', m: ['hopeful', 'empty'] },
  { t: 'The small step I took today is adding up somewhere no one can see.', m: ['hopeful'] },
  { t: 'Changing is not a betrayal of who I used to be.', m: ['hopeful'] },
  { t: 'I do not have to decide what I think of myself on my worst day.', m: ['hopeful', 'heavy'] },
  { t: 'I am slowly starting to resemble the life I want.', m: ['hopeful', 'good'] },
  { t: 'I am not late. I am on my own clock.', m: ['hopeful', 'empty'] },
];

/** Small ceremonies for romanticising the day. */
export const RITUALS = [
  'Drink one cup of tea without looking at your phone. Just drink it.',
  'Listen to one song all the way through today, doing nothing else.',
  'Look out of the window for five minutes. Do nothing.',
  'Light a candle and read a single page while it burns.',
  'Take your headphones out on a walk and listen to the street instead.',
  'Plate something you eat today properly. Just for yourself.',
  'Look at an old photo of yourself and thank that day.',
  'Write one sentence. Only one. If more comes, fine. If not, also fine.',
  'Make your bed and look at the room for a minute afterwards.',
  'Say one small thing to someone today without expecting anything back.',
  'Hold your hands under warm water and feel only that.',
  'Buy yourself a flower. No reason required.',
  'Dim the lights, turn on a lamp, and meet the evening like that.',
  'Spray a scent you love and notice where you are when you do.',
  'Sum up today in one word and write that word down somewhere.',
  'Leave your phone in another room before you start a film.',
  'If it is raining, open the window and let the smell in.',
  'Say "you did well today" out loud to yourself. It will feel strange. Say it anyway.',
];

/** Ready-made YouTube searches. We deliberately store searches, not fixed
 *  video ids: videos get deleted, a search always works. */
export const YT_SEARCHES = [
  { label: 'romanticising your life', q: 'romanticizing your life aesthetic' },
  { label: 'slow morning', q: 'slow morning routine aesthetic' },
  { label: 'affirmations', q: 'daily affirmations for women calm' },
  { label: 'lofi for studying', q: 'lofi hip hop radio study beats' },
  { label: 'tuscan autumn', q: 'tuscan autumn aesthetic playlist' },
  { label: '2000s nostalgia', q: '2000s throwback playlist nostalgia' },
  { label: 'rain sounds', q: 'rain sounds for sleep 3 hours' },
  { label: 'coming back to yourself', q: 'that girl self care reset routine' },
  { label: 'music for reading', q: 'classical music for reading calm' },
  { label: 'for heavy days', q: 'comfort music for bad days playlist' },
];

// --- selection --------------------------------------------------------------
// The affirmation of the day stays put through the day, so it is seeded
// from the date rather than picked at random on every render.
function seedFromString(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return Math.abs(h);
}

export function affirmationsForMood(mood) {
  if (!mood) return AFFIRMATIONS;
  const hit = AFFIRMATIONS.filter((a) => a.m.includes(mood));
  return hit.length ? hit : AFFIRMATIONS;
}

export function dailyAffirmation(dateISO, mood) {
  const pool = affirmationsForMood(mood);
  return pool[seedFromString(dateISO + '|' + (mood || '')) % pool.length];
}

export function dailyRitual(dateISO) {
  return RITUALS[seedFromString('ritual|' + dateISO) % RITUALS.length];
}

export function randomAffirmation(mood, exceptText) {
  const pool = affirmationsForMood(mood).filter((a) => a.t !== exceptText);
  return pool[Math.floor(Math.random() * pool.length)] || AFFIRMATIONS[0];
}

export const moodById = (id) => MOODS.find((m) => m.id === id) || null;
