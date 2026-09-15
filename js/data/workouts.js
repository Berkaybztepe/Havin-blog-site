// Antrenman sablonlari ve hareket listesi.

export const SPLITS = [
  {
    id: 'fullbody', name: 'Tüm vücut · 3 gün',
    note: 'Yeni başlıyorsan ya da haftada üç günden fazla vakit ayıramıyorsan en verimlisi.',
    days: [
      { name: 'A günü', exercises: ['Squat', 'Şınav (veya dizden)', 'Ters kürek', 'Plank', 'Kalça köprüsü'] },
      { name: 'B günü', exercises: ['Romanian deadlift', 'Omuz press', 'Lat pulldown', 'Lunge', 'Karın çalışması'] },
      { name: 'C günü', exercises: ['Goblet squat', 'Dumbbell press', 'Tek kol kürek', 'Hip thrust', 'Side plank'] },
    ],
  },
  {
    id: 'upperlower', name: 'Üst / Alt · 4 gün',
    note: 'Haftada dört gün ayırabiliyorsan dengeli bir düzen.',
    days: [
      { name: 'Üst A', exercises: ['Bench press', 'Barfiks / Lat pulldown', 'Omuz press', 'Biceps curl', 'Triceps pushdown'] },
      { name: 'Alt A', exercises: ['Squat', 'Romanian deadlift', 'Leg press', 'Calf raise', 'Karın'] },
      { name: 'Üst B', exercises: ['Incline press', 'Kürek', 'Yan omuz', 'Face pull', 'Hammer curl'] },
      { name: 'Alt B', exercises: ['Hip thrust', 'Bulgarian split squat', 'Leg curl', 'Leg extension', 'Plank'] },
    ],
  },
  {
    id: 'ppl', name: 'Push / Pull / Legs · 6 gün',
    note: 'Deneyimliysen ve haftanın çoğunu ayırabiliyorsan.',
    days: [
      { name: 'Push', exercises: ['Bench press', 'Omuz press', 'Incline dumbbell', 'Yan omuz', 'Triceps'] },
      { name: 'Pull', exercises: ['Deadlift', 'Barfiks', 'Kürek', 'Face pull', 'Biceps'] },
      { name: 'Legs', exercises: ['Squat', 'Hip thrust', 'Leg curl', 'Leg extension', 'Calf raise'] },
    ],
  },
  {
    id: 'pilates', name: 'Pilates / Mat · 3-4 gün',
    note: 'Ağırlık yerine kontrol, nefes ve esneklik. Yorgun dönemlerde iyi geliyor.',
    days: [
      { name: 'Merkez', exercises: ['Hundred', 'Roll up', 'Single leg stretch', 'Criss cross', 'Teaser'] },
      { name: 'Alt vücut', exercises: ['Kalça köprüsü', 'Side leg series', 'Clamshell', 'Donkey kick', 'Swan'] },
      { name: 'Esneme', exercises: ['Cat-cow', 'Child pose', 'Hamstring stretch', 'Hip flexor stretch', 'Spine twist'] },
    ],
  },
  {
    id: 'yoga', name: 'Yoga · esnek',
    note: 'Performans değil, düzenleme. Ağır günlerde bedeni zorlamadan hareket ettirme yolu.',
    days: [
      { name: 'Sabah akışı', exercises: ['Güneşe selam A', 'Warrior II', 'Triangle', 'Tree', 'Savasana'] },
      { name: 'Akşam / yatıştırıcı', exercises: ['Child pose', 'Cat-cow', 'Pigeon', 'Legs up the wall', 'Savasana'] },
    ],
  },
  {
    id: 'ev', name: 'Evde · ekipmansız',
    note: 'Salona gidemediğin günler için. Hiç yapmamaktan iyi, ve çoğu zaman yeterli.',
    days: [
      { name: 'Tüm vücut', exercises: ['Squat', 'Şınav', 'Lunge', 'Plank', 'Glute bridge', 'Superman'] },
      { name: 'Kısa · 15 dk', exercises: ['Jumping jack', 'Air squat', 'Mountain climber', 'Plank', 'Esneme'] },
    ],
  },
];

/** Sik kullanilan hareketler — hizli ekleme icin oneri listesi. */
export const COMMON_EXERCISES = [
  'Squat', 'Goblet squat', 'Bulgarian split squat', 'Lunge', 'Leg press',
  'Romanian deadlift', 'Deadlift', 'Hip thrust', 'Kalça köprüsü', 'Leg curl', 'Leg extension',
  'Bench press', 'Incline press', 'Dumbbell press', 'Şınav', 'Omuz press', 'Yan omuz',
  'Barfiks', 'Lat pulldown', 'Kürek', 'Tek kol kürek', 'Face pull',
  'Biceps curl', 'Hammer curl', 'Triceps pushdown', 'Calf raise',
  'Plank', 'Side plank', 'Karın', 'Mountain climber', 'Koşu', 'Yürüyüş', 'Bisiklet', 'Yoga', 'Pilates',
];

export const getSplit = (id) => SPLITS.find((s) => s.id === id) || null;
