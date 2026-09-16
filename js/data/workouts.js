// Training templates and exercise list.

export const SPLITS = [
  {
    id: 'fullbody', name: 'Full body · 3 days',
    note: 'If you are starting out, or cannot give it more than three days a week, this gets the most out of them.',
    days: [
      { name: 'Day A', exercises: ['Squat', 'Push-up (or from knees)', 'Inverted row', 'Plank', 'Glute bridge'] },
      { name: 'Day B', exercises: ['Romanian deadlift', 'Shoulder press', 'Lat pulldown', 'Lunge', 'Core work'] },
      { name: 'Day C', exercises: ['Goblet squat', 'Dumbbell press', 'Single-arm row', 'Hip thrust', 'Side plank'] },
    ],
  },
  {
    id: 'upperlower', name: 'Upper / Lower · 4 days',
    note: 'A balanced split if you can give it four days a week.',
    days: [
      { name: 'Upper A', exercises: ['Bench press', 'Pull-up / lat pulldown', 'Shoulder press', 'Biceps curl', 'Triceps pushdown'] },
      { name: 'Lower A', exercises: ['Squat', 'Romanian deadlift', 'Leg press', 'Calf raise', 'Core'] },
      { name: 'Upper B', exercises: ['Incline press', 'Row', 'Lateral raise', 'Face pull', 'Hammer curl'] },
      { name: 'Lower B', exercises: ['Hip thrust', 'Bulgarian split squat', 'Leg curl', 'Leg extension', 'Plank'] },
    ],
  },
  {
    id: 'ppl', name: 'Push / Pull / Legs · 6 days',
    note: 'If you are experienced and can give it most of the week.',
    days: [
      { name: 'Push', exercises: ['Bench press', 'Shoulder press', 'Incline dumbbell', 'Lateral raise', 'Triceps'] },
      { name: 'Pull', exercises: ['Deadlift', 'Pull-up', 'Row', 'Face pull', 'Biceps'] },
      { name: 'Legs', exercises: ['Squat', 'Hip thrust', 'Leg curl', 'Leg extension', 'Calf raise'] },
    ],
  },
  {
    id: 'pilates', name: 'Pilates / Mat · 3-4 days',
    note: 'Control, breath and mobility instead of load. Good in tired stretches.',
    days: [
      { name: 'Centre', exercises: ['Hundred', 'Roll up', 'Single leg stretch', 'Criss cross', 'Teaser'] },
      { name: 'Lower body', exercises: ['Glute bridge', 'Side leg series', 'Clamshell', 'Donkey kick', 'Swan'] },
      { name: 'Stretch', exercises: ['Cat-cow', 'Child pose', 'Hamstring stretch', 'Hip flexor stretch', 'Spine twist'] },
    ],
  },
  {
    id: 'yoga', name: 'Yoga · flexible',
    note: 'Regulation, not performance. A way to move on heavy days without pushing the body.',
    days: [
      { name: 'Morning flow', exercises: ['Sun salutation A', 'Warrior II', 'Triangle', 'Tree', 'Savasana'] },
      { name: 'Evening / calming', exercises: ['Child pose', 'Cat-cow', 'Pigeon', 'Legs up the wall', 'Savasana'] },
    ],
  },
  {
    id: 'home', name: 'At home · no equipment',
    note: 'For the days you cannot get to a gym. Better than nothing, and usually enough.',
    days: [
      { name: 'Full body', exercises: ['Squat', 'Push-up', 'Lunge', 'Plank', 'Glute bridge', 'Superman'] },
      { name: 'Short · 15 min', exercises: ['Jumping jack', 'Air squat', 'Mountain climber', 'Plank', 'Stretch'] },
    ],
  },
];

/** Frequently used movements — suggestions for quick entry. */
export const COMMON_EXERCISES = [
  'Squat', 'Goblet squat', 'Bulgarian split squat', 'Lunge', 'Leg press',
  'Romanian deadlift', 'Deadlift', 'Hip thrust', 'Glute bridge', 'Leg curl', 'Leg extension',
  'Bench press', 'Incline press', 'Dumbbell press', 'Push-up', 'Shoulder press', 'Lateral raise',
  'Pull-up', 'Lat pulldown', 'Row', 'Single-arm row', 'Face pull',
  'Biceps curl', 'Hammer curl', 'Triceps pushdown', 'Calf raise',
  'Plank', 'Side plank', 'Core', 'Mountain climber', 'Running', 'Walking', 'Cycling', 'Yoga', 'Pilates',
];

export const getSplit = (id) => SPLITS.find((s) => s.id === id) || null;
