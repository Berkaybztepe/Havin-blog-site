// A small nutrition table for manual entry (per 100 g, APPROXIMATE).
//
// These are not precise measurements, they are a rough reference. Brand,
// cooking method and portion size move these numbers easily. The point is
// that you don't have to type everything from scratch when there is no API key.
//
// The list keeps Turkish dishes (that is what gets eaten) with English names.

export const FOODS = [
  // breakfast
  { n: 'Egg (boiled)', k: 155, p: 13, c: 1.1, f: 11, unit: 'piece', g: 50 },
  { n: 'Egg (fried / omelette)', k: 196, p: 13, c: 1.5, f: 15, unit: 'piece', g: 60 },
  { n: 'White cheese (feta style)', k: 264, p: 17, c: 2, f: 21, unit: 'slice', g: 30 },
  { n: 'Kashkaval / yellow cheese', k: 330, p: 25, c: 2, f: 25, unit: 'slice', g: 25 },
  { n: 'Curd cheese (lor)', k: 98, p: 11, c: 3.4, f: 4.3, unit: 'portion', g: 100 },
  { n: 'Olives (black)', k: 145, p: 1, c: 6, f: 13, unit: 'piece', g: 4 },
  { n: 'Butter', k: 717, p: 0.9, c: 0.1, f: 81, unit: 'tsp', g: 8 },
  { n: 'Honey', k: 304, p: 0.3, c: 82, f: 0, unit: 'tsp', g: 10 },
  { n: 'Tahini', k: 595, p: 17, c: 21, f: 54, unit: 'tbsp', g: 15 },
  { n: 'Jam', k: 250, p: 0.4, c: 62, f: 0.1, unit: 'tsp', g: 12 },
  { n: 'Simit (sesame bread ring)', k: 310, p: 9, c: 57, f: 4.5, unit: 'piece', g: 100 },
  { n: 'White bread', k: 265, p: 9, c: 49, f: 3.2, unit: 'slice', g: 30 },
  { n: 'Wholewheat bread', k: 247, p: 13, c: 41, f: 3.4, unit: 'slice', g: 30 },

  // mains · meat & fish
  { n: 'Chicken breast (grilled)', k: 165, p: 31, c: 0, f: 3.6, unit: 'portion', g: 150 },
  { n: 'Chicken thigh (skinless)', k: 209, p: 26, c: 0, f: 11, unit: 'portion', g: 150 },
  { n: 'Beef mince (15% fat)', k: 250, p: 26, c: 0, f: 15, unit: 'portion', g: 120 },
  { n: 'Lamb chop', k: 294, p: 25, c: 0, f: 21, unit: 'piece', g: 80 },
  { n: 'Köfte (grilled meatball)', k: 240, p: 19, c: 5, f: 16, unit: 'piece', g: 40 },
  { n: 'Salmon', k: 208, p: 20, c: 0, f: 13, unit: 'portion', g: 130 },
  { n: 'Tuna (in water)', k: 116, p: 26, c: 0, f: 1, unit: 'can', g: 80 },
  { n: 'Anchovies (pan fried)', k: 210, p: 20, c: 5, f: 12, unit: 'portion', g: 120 },

  // pulses & grains
  { n: 'Lentil soup', k: 65, p: 3.2, c: 10, f: 1.6, unit: 'bowl', g: 250 },
  { n: 'White beans (cooked)', k: 125, p: 7.5, c: 20, f: 1.5, unit: 'portion', g: 200 },
  { n: 'Chickpeas (cooked)', k: 164, p: 8.9, c: 27, f: 2.6, unit: 'portion', g: 150 },
  { n: 'Rice pilaf', k: 150, p: 3, c: 30, f: 2.5, unit: 'portion', g: 150 },
  { n: 'Bulgur pilaf', k: 128, p: 3.8, c: 25, f: 1.5, unit: 'portion', g: 150 },
  { n: 'Pasta (cooked)', k: 158, p: 5.8, c: 31, f: 0.9, unit: 'portion', g: 180 },
  { n: 'Oats (dry)', k: 379, p: 13, c: 67, f: 6.5, unit: 'portion', g: 40 },
  { n: 'Quinoa (cooked)', k: 120, p: 4.4, c: 21, f: 1.9, unit: 'portion', g: 150 },

  // dairy
  { n: 'Milk (semi-skimmed)', k: 50, p: 3.4, c: 4.8, f: 1.8, unit: 'glass', g: 200 },
  { n: 'Yoghurt (full fat)', k: 61, p: 3.5, c: 4.7, f: 3.3, unit: 'bowl', g: 200 },
  { n: 'Strained yoghurt', k: 59, p: 10, c: 3.6, f: 0.4, unit: 'bowl', g: 150 },
  { n: 'Ayran', k: 37, p: 1.7, c: 2.9, f: 2, unit: 'glass', g: 200 },
  { n: 'Kefir', k: 41, p: 3.3, c: 4.5, f: 1, unit: 'glass', g: 200 },

  // vegetables
  { n: 'Tomato', k: 18, p: 0.9, c: 3.9, f: 0.2, unit: 'piece', g: 120 },
  { n: 'Cucumber', k: 15, p: 0.7, c: 3.6, f: 0.1, unit: 'piece', g: 100 },
  { n: 'Lettuce', k: 15, p: 1.4, c: 2.9, f: 0.2, unit: 'portion', g: 80 },
  { n: 'Broccoli (boiled)', k: 35, p: 2.4, c: 7, f: 0.4, unit: 'portion', g: 150 },
  { n: 'Potato (boiled)', k: 87, p: 1.9, c: 20, f: 0.1, unit: 'piece', g: 150 },
  { n: 'Chips / fries', k: 312, p: 3.4, c: 41, f: 15, unit: 'portion', g: 150 },
  { n: 'Spinach (cooked)', k: 23, p: 2.9, c: 3.6, f: 0.4, unit: 'portion', g: 150 },
  { n: 'Avocado', k: 160, p: 2, c: 9, f: 15, unit: 'piece', g: 150 },
  { n: 'Olive oil', k: 884, p: 0, c: 0, f: 100, unit: 'tbsp', g: 10 },

  // fruit
  { n: 'Apple', k: 52, p: 0.3, c: 14, f: 0.2, unit: 'piece', g: 180 },
  { n: 'Banana', k: 89, p: 1.1, c: 23, f: 0.3, unit: 'piece', g: 120 },
  { n: 'Orange', k: 47, p: 0.9, c: 12, f: 0.1, unit: 'piece', g: 150 },
  { n: 'Strawberries', k: 32, p: 0.7, c: 7.7, f: 0.3, unit: 'bowl', g: 150 },
  { n: 'Grapes', k: 69, p: 0.7, c: 18, f: 0.2, unit: 'bowl', g: 150 },
  { n: 'Watermelon', k: 30, p: 0.6, c: 7.6, f: 0.2, unit: 'slice', g: 200 },
  { n: 'Dried dates', k: 282, p: 2.5, c: 75, f: 0.4, unit: 'piece', g: 8 },

  // nuts
  { n: 'Walnuts', k: 654, p: 15, c: 14, f: 65, unit: 'piece', g: 5 },
  { n: 'Almonds', k: 579, p: 21, c: 22, f: 50, unit: 'handful', g: 25 },
  { n: 'Hazelnuts', k: 628, p: 15, c: 17, f: 61, unit: 'handful', g: 25 },
  { n: 'Peanut butter', k: 588, p: 25, c: 20, f: 50, unit: 'tbsp', g: 16 },

  // eating out / ready made
  { n: 'Döner (in bread)', k: 250, p: 14, c: 26, f: 10, unit: 'portion', g: 250 },
  { n: 'Lahmacun', k: 220, p: 10, c: 30, f: 7, unit: 'piece', g: 130 },
  { n: 'Pide (with mince)', k: 245, p: 11, c: 32, f: 8, unit: 'portion', g: 250 },
  { n: 'Pizza (margherita)', k: 266, p: 11, c: 33, f: 10, unit: 'slice', g: 100 },
  { n: 'Burger', k: 295, p: 17, c: 24, f: 14, unit: 'piece', g: 200 },
  { n: 'Mantı (with yoghurt)', k: 210, p: 8, c: 28, f: 7, unit: 'portion', g: 250 },
  { n: 'Menemen (eggs with peppers)', k: 118, p: 6, c: 5, f: 8, unit: 'portion', g: 250 },
  { n: 'Soup (ezogelin)', k: 70, p: 3, c: 11, f: 1.8, unit: 'bowl', g: 250 },

  // sweet & snacks
  { n: 'Dark chocolate (70%)', k: 598, p: 7.8, c: 46, f: 43, unit: 'square', g: 10 },
  { n: 'Milk chocolate', k: 535, p: 7.6, c: 59, f: 30, unit: 'square', g: 10 },
  { n: 'Baklava', k: 430, p: 6, c: 45, f: 25, unit: 'piece', g: 60 },
  { n: 'Rice pudding (sütlaç)', k: 143, p: 3.5, c: 24, f: 3.5, unit: 'bowl', g: 150 },
  { n: 'Ice cream', k: 207, p: 3.5, c: 24, f: 11, unit: 'scoop', g: 60 },
  { n: 'Biscuit', k: 460, p: 6, c: 70, f: 17, unit: 'piece', g: 12 },
  { n: 'Crisps', k: 536, p: 6.6, c: 53, f: 34, unit: 'pack', g: 35 },
  { n: 'Cake', k: 350, p: 5, c: 50, f: 14, unit: 'slice', g: 70 },

  // drinks
  { n: 'Tea (no sugar)', k: 1, p: 0, c: 0.2, f: 0, unit: 'glass', g: 200 },
  { n: 'Turkish coffee (plain)', k: 2, p: 0.1, c: 0.4, f: 0, unit: 'cup', g: 70 },
  { n: 'Latte', k: 55, p: 3, c: 5.3, f: 2.2, unit: 'cup', g: 250 },
  { n: 'Orange juice', k: 45, p: 0.7, c: 10, f: 0.2, unit: 'glass', g: 200 },
  { n: 'Cola', k: 42, p: 0, c: 10.6, f: 0, unit: 'can', g: 330 },
  { n: 'Sugar (cube)', k: 387, p: 0, c: 100, f: 0, unit: 'cube', g: 3 },
];

/** Search by name. */
export function searchFoods(q, limit = 10) {
  const needle = (q || '').toLowerCase().trim();
  if (!needle) return [];
  return FOODS
    .filter((f) => f.n.toLowerCase().includes(needle))
    .slice(0, limit);
}

/** Scale the nutrition values for a given weight in grams. */
export function scale(food, grams) {
  const r = (Number(grams) || 0) / 100;
  return {
    kcal: Math.round(food.k * r),
    protein: Math.round(food.p * r * 10) / 10,
    carbs: Math.round(food.c * r * 10) / 10,
    fat: Math.round(food.f * r * 10) / 10,
  };
}
