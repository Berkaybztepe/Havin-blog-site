// Elle giris icin kucuk bir besin tablosu (100 g basina, YAKLASIK degerler).
//
// Bunlar kesin olcum degil, kaba referans. Marka, pisirme yontemi ve porsiyon
// farkliliklari bu sayilari rahatlikla degistirir. Amac, anahtarsiz kullanirken
// sifirdan yazmak zorunda kalmamak.

export const FOODS = [
  // kahvaltilik
  { n: 'Yumurta (haşlanmış)', k: 155, p: 13, c: 1.1, f: 11, unit: 'adet', g: 50 },
  { n: 'Yumurta (omlet, yağda)', k: 196, p: 13, c: 1.5, f: 15, unit: 'adet', g: 60 },
  { n: 'Beyaz peynir', k: 264, p: 17, c: 2, f: 21, unit: 'dilim', g: 30 },
  { n: 'Kaşar peyniri', k: 330, p: 25, c: 2, f: 25, unit: 'dilim', g: 25 },
  { n: 'Lor peyniri', k: 98, p: 11, c: 3.4, f: 4.3, unit: 'porsiyon', g: 100 },
  { n: 'Zeytin (siyah)', k: 145, p: 1, c: 6, f: 13, unit: 'adet', g: 4 },
  { n: 'Tereyağı', k: 717, p: 0.9, c: 0.1, f: 81, unit: 'tatlı kaşığı', g: 8 },
  { n: 'Bal', k: 304, p: 0.3, c: 82, f: 0, unit: 'tatlı kaşığı', g: 10 },
  { n: 'Tahin', k: 595, p: 17, c: 21, f: 54, unit: 'yemek kaşığı', g: 15 },
  { n: 'Reçel', k: 250, p: 0.4, c: 62, f: 0.1, unit: 'tatlı kaşığı', g: 12 },
  { n: 'Simit', k: 310, p: 9, c: 57, f: 4.5, unit: 'adet', g: 100 },
  { n: 'Beyaz ekmek', k: 265, p: 9, c: 49, f: 3.2, unit: 'dilim', g: 30 },
  { n: 'Tam buğday ekmeği', k: 247, p: 13, c: 41, f: 3.4, unit: 'dilim', g: 30 },

  // ana yemek · et
  { n: 'Tavuk göğsü (ızgara)', k: 165, p: 31, c: 0, f: 3.6, unit: 'porsiyon', g: 150 },
  { n: 'Tavuk but (derisiz)', k: 209, p: 26, c: 0, f: 11, unit: 'porsiyon', g: 150 },
  { n: 'Dana kıyma (%15 yağ)', k: 250, p: 26, c: 0, f: 15, unit: 'porsiyon', g: 120 },
  { n: 'Kuzu pirzola', k: 294, p: 25, c: 0, f: 21, unit: 'adet', g: 80 },
  { n: 'Köfte (ızgara)', k: 240, p: 19, c: 5, f: 16, unit: 'adet', g: 40 },
  { n: 'Somon', k: 208, p: 20, c: 0, f: 13, unit: 'porsiyon', g: 130 },
  { n: 'Ton balığı (suda)', k: 116, p: 26, c: 0, f: 1, unit: 'kutu', g: 80 },
  { n: 'Hamsi (tava)', k: 210, p: 20, c: 5, f: 12, unit: 'porsiyon', g: 120 },

  // bakliyat & tahil
  { n: 'Mercimek çorbası', k: 65, p: 3.2, c: 10, f: 1.6, unit: 'kâse', g: 250 },
  { n: 'Kuru fasulye (pişmiş)', k: 125, p: 7.5, c: 20, f: 1.5, unit: 'porsiyon', g: 200 },
  { n: 'Nohut (pişmiş)', k: 164, p: 8.9, c: 27, f: 2.6, unit: 'porsiyon', g: 150 },
  { n: 'Pirinç pilavı', k: 150, p: 3, c: 30, f: 2.5, unit: 'porsiyon', g: 150 },
  { n: 'Bulgur pilavı', k: 128, p: 3.8, c: 25, f: 1.5, unit: 'porsiyon', g: 150 },
  { n: 'Makarna (pişmiş)', k: 158, p: 5.8, c: 31, f: 0.9, unit: 'porsiyon', g: 180 },
  { n: 'Yulaf ezmesi (kuru)', k: 379, p: 13, c: 67, f: 6.5, unit: 'porsiyon', g: 40 },
  { n: 'Kinoa (pişmiş)', k: 120, p: 4.4, c: 21, f: 1.9, unit: 'porsiyon', g: 150 },

  // sut urunleri
  { n: 'Süt (yarım yağlı)', k: 50, p: 3.4, c: 4.8, f: 1.8, unit: 'bardak', g: 200 },
  { n: 'Yoğurt (yağlı)', k: 61, p: 3.5, c: 4.7, f: 3.3, unit: 'kâse', g: 200 },
  { n: 'Süzme yoğurt', k: 59, p: 10, c: 3.6, f: 0.4, unit: 'kâse', g: 150 },
  { n: 'Ayran', k: 37, p: 1.7, c: 2.9, f: 2, unit: 'bardak', g: 200 },
  { n: 'Kefir', k: 41, p: 3.3, c: 4.5, f: 1, unit: 'bardak', g: 200 },

  // sebze
  { n: 'Domates', k: 18, p: 0.9, c: 3.9, f: 0.2, unit: 'adet', g: 120 },
  { n: 'Salatalık', k: 15, p: 0.7, c: 3.6, f: 0.1, unit: 'adet', g: 100 },
  { n: 'Marul', k: 15, p: 1.4, c: 2.9, f: 0.2, unit: 'porsiyon', g: 80 },
  { n: 'Brokoli (haşlanmış)', k: 35, p: 2.4, c: 7, f: 0.4, unit: 'porsiyon', g: 150 },
  { n: 'Patates (haşlanmış)', k: 87, p: 1.9, c: 20, f: 0.1, unit: 'adet', g: 150 },
  { n: 'Patates kızartması', k: 312, p: 3.4, c: 41, f: 15, unit: 'porsiyon', g: 150 },
  { n: 'Ispanak (pişmiş)', k: 23, p: 2.9, c: 3.6, f: 0.4, unit: 'porsiyon', g: 150 },
  { n: 'Avokado', k: 160, p: 2, c: 9, f: 15, unit: 'adet', g: 150 },
  { n: 'Zeytinyağı', k: 884, p: 0, c: 0, f: 100, unit: 'yemek kaşığı', g: 10 },

  // meyve
  { n: 'Elma', k: 52, p: 0.3, c: 14, f: 0.2, unit: 'adet', g: 180 },
  { n: 'Muz', k: 89, p: 1.1, c: 23, f: 0.3, unit: 'adet', g: 120 },
  { n: 'Portakal', k: 47, p: 0.9, c: 12, f: 0.1, unit: 'adet', g: 150 },
  { n: 'Çilek', k: 32, p: 0.7, c: 7.7, f: 0.3, unit: 'kâse', g: 150 },
  { n: 'Üzüm', k: 69, p: 0.7, c: 18, f: 0.2, unit: 'kâse', g: 150 },
  { n: 'Karpuz', k: 30, p: 0.6, c: 7.6, f: 0.2, unit: 'dilim', g: 200 },
  { n: 'Kuru hurma', k: 282, p: 2.5, c: 75, f: 0.4, unit: 'adet', g: 8 },

  // kuruyemis
  { n: 'Ceviz', k: 654, p: 15, c: 14, f: 65, unit: 'adet', g: 5 },
  { n: 'Badem', k: 579, p: 21, c: 22, f: 50, unit: 'avuç', g: 25 },
  { n: 'Fındık', k: 628, p: 15, c: 17, f: 61, unit: 'avuç', g: 25 },
  { n: 'Fıstık ezmesi', k: 588, p: 25, c: 20, f: 50, unit: 'yemek kaşığı', g: 16 },

  // disarida / hazir
  { n: 'Döner (ekmek arası)', k: 250, p: 14, c: 26, f: 10, unit: 'porsiyon', g: 250 },
  { n: 'Lahmacun', k: 220, p: 10, c: 30, f: 7, unit: 'adet', g: 130 },
  { n: 'Pide (kıymalı)', k: 245, p: 11, c: 32, f: 8, unit: 'porsiyon', g: 250 },
  { n: 'Pizza (margarita)', k: 266, p: 11, c: 33, f: 10, unit: 'dilim', g: 100 },
  { n: 'Hamburger', k: 295, p: 17, c: 24, f: 14, unit: 'adet', g: 200 },
  { n: 'Mantı (yoğurtlu)', k: 210, p: 8, c: 28, f: 7, unit: 'porsiyon', g: 250 },
  { n: 'Menemen', k: 118, p: 6, c: 5, f: 8, unit: 'porsiyon', g: 250 },
  { n: 'Çorba (ezogelin)', k: 70, p: 3, c: 11, f: 1.8, unit: 'kâse', g: 250 },

  // tatli & atistirmalik
  { n: 'Bitter çikolata (%70)', k: 598, p: 7.8, c: 46, f: 43, unit: 'kare', g: 10 },
  { n: 'Sütlü çikolata', k: 535, p: 7.6, c: 59, f: 30, unit: 'kare', g: 10 },
  { n: 'Baklava', k: 430, p: 6, c: 45, f: 25, unit: 'dilim', g: 60 },
  { n: 'Sütlaç', k: 143, p: 3.5, c: 24, f: 3.5, unit: 'kâse', g: 150 },
  { n: 'Dondurma', k: 207, p: 3.5, c: 24, f: 11, unit: 'top', g: 60 },
  { n: 'Bisküvi', k: 460, p: 6, c: 70, f: 17, unit: 'adet', g: 12 },
  { n: 'Cips', k: 536, p: 6.6, c: 53, f: 34, unit: 'paket', g: 35 },
  { n: 'Kek (dilim)', k: 350, p: 5, c: 50, f: 14, unit: 'dilim', g: 70 },

  // icecek
  { n: 'Çay (şekersiz)', k: 1, p: 0, c: 0.2, f: 0, unit: 'bardak', g: 200 },
  { n: 'Türk kahvesi (sade)', k: 2, p: 0.1, c: 0.4, f: 0, unit: 'fincan', g: 70 },
  { n: 'Latte (sütlü)', k: 55, p: 3, c: 5.3, f: 2.2, unit: 'bardak', g: 250 },
  { n: 'Portakal suyu', k: 45, p: 0.7, c: 10, f: 0.2, unit: 'bardak', g: 200 },
  { n: 'Kola', k: 42, p: 0, c: 10.6, f: 0, unit: 'kutu', g: 330 },
  { n: 'Şeker (küp)', k: 387, p: 0, c: 100, f: 0, unit: 'küp', g: 3 },
];

/** Isimle arama; Turkce buyuk/kucuk harfe dikkat ederek. */
export function searchFoods(q, limit = 10) {
  const needle = (q || '').toLocaleLowerCase('tr-TR').trim();
  if (!needle) return [];
  return FOODS
    .filter((f) => f.n.toLocaleLowerCase('tr-TR').includes(needle))
    .slice(0, limit);
}

/** Verilen gram icin besin degerlerini hesaplar. */
export function scale(food, grams) {
  const r = (Number(grams) || 0) / 100;
  return {
    kcal: Math.round(food.k * r),
    protein: Math.round(food.p * r * 10) / 10,
    carbs: Math.round(food.c * r * 10) / 10,
    fat: Math.round(food.f * r * 10) / 10,
  };
}
