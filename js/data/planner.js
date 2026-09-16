// Day plan templates and task categories.

export const TASK_CATEGORIES = [
  { id: 'general', label: 'general', color: '#8d8378' },
  { id: 'work',    label: 'work/study', color: '#6f8fd0' },
  { id: 'me',      label: 'for me', color: '#a2624a' },
  { id: 'move',    label: 'movement', color: '#7fb98a' },
  { id: 'home',    label: 'home', color: '#d3a45e' },
  { id: 'people',  label: 'people', color: '#a98bd0' },
];

/** Day skeletons. You turn the blocks you like into tasks. */
export const DAY_TEMPLATES = [
  {
    id: 'balanced', name: 'Balanced day',
    note: 'Not too empty, not too full. A good default for most days.',
    blocks: [
      { time: '08:30', title: 'Morning ritual — 20 minutes without a phone', cat: 'me' },
      { time: '09:30', title: 'Deep work block (90 min)', cat: 'work' },
      { time: '11:00', title: 'Break — short walk', cat: 'me' },
      { time: '11:30', title: 'Second work block', cat: 'work' },
      { time: '13:00', title: 'Lunch, away from the desk', cat: 'general' },
      { time: '15:00', title: 'Light tasks / messages', cat: 'work' },
      { time: '17:30', title: 'Movement', cat: 'move' },
      { time: '20:00', title: 'Close the day — write tomorrow in three lines', cat: 'me' },
    ],
  },
  {
    id: 'heavy', name: 'Busy day',
    note: "For days with a deadline. Don't delete the breaks — they are what make the work possible.",
    blocks: [
      { time: '08:00', title: 'Start with the hardest thing (90 min)', cat: 'work' },
      { time: '09:45', title: 'Break — 15 min, no screen', cat: 'me' },
      { time: '10:00', title: 'Second block (90 min)', cat: 'work' },
      { time: '12:00', title: 'Food — actually stop', cat: 'general' },
      { time: '13:00', title: 'Third block', cat: 'work' },
      { time: '15:30', title: 'Break — walk', cat: 'me' },
      { time: '16:00', title: 'Tidy up and review', cat: 'work' },
      { time: '19:00', title: 'Close. That is enough for today.', cat: 'me' },
    ],
  },
  {
    id: 'slow', name: 'Slow day',
    note: 'For tired or heavy days. Better than doing nothing, safer than pushing yourself.',
    blocks: [
      { time: '10:00', title: 'Wake slowly, no rush', cat: 'me' },
      { time: '11:00', title: 'One small task — only one', cat: 'general' },
      { time: '13:00', title: 'A proper meal', cat: 'general' },
      { time: '15:00', title: 'Stretch or a short walk', cat: 'move' },
      { time: '17:00', title: 'Something you love — a show, a book, music', cat: 'me' },
      { time: '21:00', title: 'Early night', cat: 'me' },
    ],
  },
  {
    id: 'myday', name: 'A day for me',
    note: 'A day that belongs to nobody else. Needed a few times a year.',
    blocks: [
      { time: '10:00', title: 'Put the phone on airplane mode', cat: 'me' },
      { time: '11:00', title: 'Coffee alone', cat: 'me' },
      { time: '13:00', title: 'Cook yourself something good', cat: 'home' },
      { time: '15:00', title: 'Read or watch something', cat: 'me' },
      { time: '18:00', title: 'Tidy your room, light a candle', cat: 'home' },
      { time: '20:00', title: 'Write in your diary', cat: 'me' },
    ],
  },
  {
    id: 'reset', name: 'Reset day',
    note: 'Home, paperwork, the things you put off. Easier in one day than spread across a week.',
    blocks: [
      { time: '10:00', title: 'Start the laundry', cat: 'home' },
      { time: '10:30', title: 'Tidy the room and the desk', cat: 'home' },
      { time: '12:00', title: 'Reply to the messages you postponed', cat: 'people' },
      { time: '14:00', title: 'Paperwork / bills / appointments', cat: 'general' },
      { time: '16:00', title: 'Groceries', cat: 'home' },
      { time: '18:00', title: 'Lay out the week', cat: 'general' },
    ],
  },
];

/** Short one-line nudges — useful without building a whole plan. */
export const DAILY_NUDGES = [
  'Put the hardest thing in the first hour today. The rest gets easier.',
  "Don't write more than three items. If all three get done, that's a bonus.",
  'Cut a task into 25 minutes. Starting is harder than finishing.',
  'Delete something from the list today. Not doing it is also a choice.',
  'Plan the break, or the break plans you.',
  "Write tomorrow's three lines tonight, so you don't have to think in the morning.",
  'Aim for "done", not "perfect".',
  'If you are not delivering to anyone today, deliver to yourself.',
  'Put the phone in another room. Just for an hour.',
  'Carry over the undone things, not the guilt.',
];

export const getTemplate = (id) => DAY_TEMPLATES.find((t) => t.id === id) || null;
export const categoryColor = (id) => (TASK_CATEGORIES.find((c) => c.id === id) || TASK_CATEGORIES[0]).color;

export function randomNudge() {
  return DAILY_NUDGES[Math.floor(Math.random() * DAILY_NUDGES.length)];
}
