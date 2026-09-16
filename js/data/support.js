// Support library — for food, body and hard moments.
//
// Rules for this section:
//   - No numbers. Never mentions calories, weight, or "making up for it".
//   - No judgement. Never says "you shouldn't have".
//   - No diagnosis. It does not stand in for a doctor.
//   - Language of continuing, not of perfection.
//   - Treats an episode as information, not as failure.

export const ENTRY_KINDS = [
  { id: 'feeling', label: 'a feeling' },
  { id: 'binge',   label: 'a binge' },
  { id: 'body',    label: 'something about my body' },
  { id: 'food',    label: 'something about food' },
  { id: 'good',    label: 'something that went well' },
];

/** After an episode: settle first, get curious later. Never analyse first. */
export const AFTER_BINGE = [
  'What just happened is not a failure. Your body or your mind wanted something and said so the only way it could.',
  "You don't have to make up for it. Skipping the next meal won't undo this moment; it only brings the next episode closer.",
  'Being angry at yourself right now makes complete sense. But anger has never once solved this — your own experience probably says so too.',
  'If this is a loop, what breaks the loop is gentleness, not punishment. I know that sounds too soft. It is still true.',
  'Your body is digesting something right now. There is nothing you need to do. Sitting is enough.',
  'Eating something did not set you back. A day passed, and days pass like this sometimes.',
  'You can think about what happened tomorrow. For now, just let yourself settle.',
];

/** Looking at what came before — questions that invite curiosity, not guilt. */
export const CURIOSITY_PROMPTS = [
  'What was happening right before this? A conversation, a message, a thought?',
  'Did you eat enough today? Most episodes follow a gap earlier in the day.',
  'Were you tired? Tiredness can feel almost exactly like hunger.',
  'Were you alone? Sometimes what we are reaching for is company, not food.',
  'Were you low, or were you pushing something down?',
  'Was there a food you had put off-limits today?',
  'Where does this feeling sit — in your stomach, your chest, or your head?',
  'If this moment were trying to say something, what would it say?',
];

/** Body neutrality — without demanding that you love it. */
export const BODY_NEUTRAL = [
  'You do not have to love your body. Treating it well is possible without that.',
  "You might not like your body today. That doesn't mean your body is bad; it means that's how you're looking at it today.",
  'What you see in the mirror shifts with the hour, the light and your mood. The thing that shifts is not you.',
  'Your body is not a display case. It is the thing carrying you from one place to another.',
  'Being in a body is hard sometimes. Feeling that does not make you shallow.',
  'You can choose not to think about your body today. That is a valid option too.',
  'The moment you compare yourself to someone else, you are measuring two whole lives with one photograph.',
  'Your body does not have to change for you to have a good day.',
];

/** General, pressure-free reminders about food. */
export const FOOD_REMINDERS = [
  'There is no such thing as good food and bad food. There is just food.',
  'Eating regularly works better than willpower. Not being hungry is already half of it.',
  'If you missed a meal, eat the next one normally. No punishment, no making up for it.',
  'Eating what you are craving is not losing control. Sometimes it is the opposite.',
  'You do not have to finish your plate. Stopping is a choice too.',
  'Not counting what you ate at a table full of people is a small permission you can give yourself.',
  'Eating the same meal two days running is not boring, it is practical.',
  'Food is not only fuel. Taste, memory and company feed you too.',
];

/** Grounding and regulation exercises. */
export const GROUNDING = [
  {
    t: '5–4–3–2–1',
    d: 'Name 5 things you can see, 4 you can hear, 3 you can touch, 2 you can smell and 1 you can taste. It pulls the mind into now.',
    min: 3,
  },
  {
    t: 'Long exhale',
    d: 'In for 4, out for 6. Lengthening the exhale switches on the part of the body that calms you down. Five rounds is enough.',
    min: 2,
  },
  {
    t: 'Cold water',
    d: 'Run cold water over your wrists, or splash your face. It brings the body down quickly.',
    min: 1,
  },
  {
    t: 'Feel your feet',
    d: 'Put your feet on the floor and feel only where they touch it. Thirty seconds. It gathers you when you feel scattered.',
    min: 1,
  },
  {
    t: 'Name it',
    d: 'Give the feeling one word: anxiety, loneliness, anger, emptiness. A named feeling gets smaller.',
    min: 2,
  },
  {
    t: 'A letter to yourself',
    d: 'If your closest friend were in this exact situation, what would you write to them? Write that to yourself.',
    min: 8,
  },
  {
    t: 'Ten minute delay',
    d: 'When an urge arrives, do not say no — say "in ten minutes". Most urges change shape in ten minutes.',
    min: 10,
  },
  {
    t: 'Walk',
    d: 'Go outside and go once around the block. Changing the room changes the thought.',
    min: 15,
  },
];

/** When you log something that went well. */
export const CELEBRATE = [
  'Good that you wrote this down. Good things go missing if they are not recorded; the bad ones stay on their own.',
  'This might look small, but these are the things that add up.',
  'You are here so you can remember this day on a hard one.',
  'Days like this are yours too. Not only the difficult ones.',
];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

/**
 * The local support response, used when no API key is set.
 * It does not replace the AI, but it never leaves you with nothing.
 */
export function localSupport(kind, text) {
  const lower = (text || '').toLowerCase();
  const parts = [];

  if (kind === 'binge') {
    parts.push(pick(AFTER_BINGE));
    parts.push('When you are ready, one question to be curious about: ' + pick(CURIOSITY_PROMPTS));
    parts.push('This might help right now: ' + (() => { const g = pick(GROUNDING); return `${g.t} — ${g.d}`; })());
  } else if (kind === 'body') {
    parts.push(pick(BODY_NEUTRAL));
    if (/mirror|weight|weigh|fat|belly|jeans|scale/.test(lower)) {
      parts.push('You could try not checking any measurement today. A number does not get to decide how you feel.');
    }
    parts.push(pick(GROUNDING).d);
  } else if (kind === 'food') {
    parts.push(pick(FOOD_REMINDERS));
    parts.push('This might help: ' + pick(CURIOSITY_PROMPTS));
  } else if (kind === 'good') {
    parts.push(pick(CELEBRATE));
  } else {
    parts.push('Good that you wrote it. Putting something outside of you makes it carryable.');
    parts.push('If you want, try this: ' + (() => { const g = pick(GROUNDING); return `${g.t} — ${g.d}`; })());
  }

  // If there are heavier signals, one sentence — without preaching.
  if (/throw(ing)? up|threw up|purge|starv|haven'?t eaten|hurt myself|self harm|kill myself|suicid|don'?t want to live/.test(lower)) {
    parts.push('You do not have to carry this alone. Telling someone you trust, or a professional, could take some of the weight off.');
  }

  return parts.join('\n\n');
}

export const randomGrounding = () => pick(GROUNDING);
export const randomBodyNeutral = () => pick(BODY_NEUTRAL);
export const randomFoodReminder = () => pick(FOOD_REMINDERS);
export const randomCuriosity = () => pick(CURIOSITY_PROMPTS);
