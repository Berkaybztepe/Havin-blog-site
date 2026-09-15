// Destek kutuphanesi — yemek, beden ve zor anlar icin.
//
// Bu bolumun kurallari:
//   - Rakam vermez. Kalori, kilo, "telafi" onermez.
//   - Yargilamaz. "Yapmamaliydin" demez.
//   - Tani koymaz, doktor yerine gecmez.
//   - Kusursuzluk degil, devamlilik dili kullanir.
//   - Bir atagi "basarisizlik" olarak degil, bir bilgi olarak ele alir.

export const ENTRY_KINDS = [
  { id: 'his',    label: 'bir his',            emoji: '🤍' },
  { id: 'atak',   label: 'yeme atağı',         emoji: '🌊' },
  { id: 'beden',  label: 'bedenimle ilgili',   emoji: '🪞' },
  { id: 'yemek',  label: 'yemekle ilgili',     emoji: '🍋' },
  { id: 'iyi',    label: 'iyi giden bir şey',  emoji: '🌱' },
];

/** Atak sonrasi: once sakinlestir, sonra merak et. Asla once analiz etme. */
export const AFTER_BINGE = [
  'Şu an olan şey bir başarısızlık değil. Bedenin ya da zihnin bir şey istedi ve bunu bulabildiği tek yoldan söyledi.',
  'Telafi etmek zorunda değilsin. Bir sonraki öğünü atlamak, bu anı geri almaz; sadece bir sonraki atağı yaklaştırır.',
  'Şu an kendine kızmak çok anlaşılır. Ama kızgınlık bugüne kadar bu durumu hiç çözmedi — deneyimin de bunu söylüyor olabilir.',
  'Bu bir döngüyse, döngüyü kıran şey ceza değil, şefkat oluyor. Kulağa fazla yumuşak geliyor, biliyorum. Yine de böyle.',
  'Vücudun şu an bir şeyi sindiriyor. Yapman gereken tek şey yok. Oturmak yeterli.',
  'Bir şey yemiş olmak seni geri götürmedi. Sadece bir gün geçti, ve günler böyle de geçer.',
  'Bugün olan şeyi yarın düşünebilirsin. Şu an sadece rahatlamana izin ver.',
];

/** Atagin oncesine bakmak icin — sucluluk degil merak uyandiran sorular. */
export const CURIOSITY_PROMPTS = [
  'Bundan hemen önce ne oluyordu? Bir konuşma, bir mesaj, bir düşünce?',
  'Bugün yeterince yedin mi? Çoğu atak, gün içindeki bir eksikliğin peşinden gelir.',
  'Yorgun muydun? Yorgunluk, açlıkla çok benzer bir his yaratabiliyor.',
  'Yalnız mıydın? Bazen aradığımız şey yemek değil, eşlik.',
  'Canın sıkkın mıydı, yoksa bir şeyi mi bastırıyordun?',
  'Bugün kendine "yasak" koyduğun bir yiyecek var mıydı?',
  'Bu his nereden geliyor gibi hissettiriyor — mideden mi, göğüsten mi, kafadan mı?',
  'Eğer bu an bir şey söylemeye çalışsaydı, ne derdi?',
];

/** Beden noturlugu — sevmek zorunda birakmadan. */
export const BODY_NEUTRAL = [
  'Bedenini sevmek zorunda değilsin. Ona iyi davranmak, sevmeden de mümkün.',
  'Bugün bedeninden hoşlanmıyor olabilirsin. Bu, bedeninin kötü olduğu anlamına gelmiyor; sadece bugün böyle bakıyorsun.',
  'Aynadaki görüntü, günün saatine, ışığa ve ruh hâline göre değişiyor. Değişen şey sen değilsin.',
  'Bedenin bir vitrin değil. Seni bir yerden bir yere taşıyan, seni yaşatan şey.',
  'Bir bedende olmak bazen zor. Bunu hissetmek seni yüzeysel yapmaz.',
  'Bugün bedenin hakkında düşünmemeyi seçebilirsin. Bu da geçerli bir seçenek.',
  'Kendini bir başkasıyla kıyasladığın an, iki farklı hayatı tek bir fotoğrafla ölçüyorsun demektir.',
  'Bedeninin değişmesi gerekmiyor ki sen iyi bir gün geçiresin.',
];

/** Yemek konusunda genel, baskisiz hatirlaticilar. */
export const FOOD_REMINDERS = [
  'Yiyeceklerin iyi ya da kötü olması diye bir şey yok. Sadece yiyecekler var.',
  'Düzenli yemek, iradeden daha çok işe yarıyor. Aç kalmamak zaten yarısı.',
  'Bir öğünü kaçırdıysan, bir sonrakini normal ye. Ceza ya da telafi gerekmiyor.',
  'Canın çektiği şeyi yemek, kontrolü kaybetmek değil. Bazen tam tersi.',
  'Tabağını bitirmek zorunda değilsin. Bırakmak da bir seçim.',
  'Sosyal bir sofrada yediğin şeyi hesaplamamak, kendine verebileceğin küçük bir izin.',
  'Aynı yemeği iki gün üst üste yemek sıkıcı değil, pratik.',
  'Yemek sadece yakıt değil. Tat, hatıra ve eşlik de besliyor.',
];

/** Topraklanma ve regulasyon egzersizleri. */
export const GROUNDING = [
  {
    t: '5–4–3–2–1',
    d: 'Etrafında gördüğün 5 şeyi, duyduğun 4 sesi, dokunabildiğin 3 şeyi, aldığın 2 kokuyu ve 1 tadı say. Zihni şimdiye çeker.',
    min: 3,
  },
  {
    t: 'Uzun nefes verme',
    d: '4 sayarak al, 6 sayarak ver. Nefes vermeyi uzatmak bedeni sakinleştiren tarafı çalıştırır. Beş tur yeter.',
    min: 2,
  },
  {
    t: 'Soğuk su',
    d: 'Bileklerini soğuk suyun altına tut ya da yüzüne soğuk su çarp. Bedeni hızlı bir şekilde aşağı çeker.',
    min: 1,
  },
  {
    t: 'Ayaklarını hisset',
    d: 'Ayaklarını yere bas ve sadece zeminle temasını hisset. Otuz saniye. Dağılmış hissettiğinde toparlar.',
    min: 1,
  },
  {
    t: 'Adlandır',
    d: 'Hissettiğin şeyi tek kelimeyle adlandır: kaygı, yalnızlık, öfke, boşluk. Adı konan duygu küçülür.',
    min: 2,
  },
  {
    t: 'Kendine mektup',
    d: 'Bu durumu yaşayan sen değil de en sevdiğin arkadaşın olsaydı ona ne yazardın? Onu kendine yaz.',
    min: 8,
  },
  {
    t: 'On dakika ertele',
    d: 'Bir dürtü geldiğinde "hayır" deme, "on dakika sonra" de. Çoğu dürtü on dakikada şeklini değiştirir.',
    min: 10,
  },
  {
    t: 'Yürü',
    d: 'Dışarı çık ve mahalleyi bir tur dön. Ortamı değiştirmek düşünceyi de değiştiriyor.',
    min: 15,
  },
];

/** Iyi giden bir seyi kaydettiginde. */
export const CELEBRATE = [
  'Bunu buraya yazdığın iyi oldu. İyi giden şeyler yazılmazsa unutuluyor, kötüler kendiliğinden kalıyor.',
  'Bu küçük görünebilir ama bu tür şeyler birikiyor.',
  'Bunu başardığın günü, zor günlerde hatırlamak için buradasın.',
  'Böyle günler de senin. Sadece zor olanlar değil.',
];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

/**
 * Anahtar yokken kullanilan yerel destek yaniti.
 * Yapay zekanin yerini tutmaz ama bos birakmaz.
 */
export function localSupport(kind, text) {
  const lower = (text || '').toLocaleLowerCase('tr-TR');
  const parts = [];

  if (kind === 'atak') {
    parts.push(pick(AFTER_BINGE));
    parts.push('Hazır olduğunda, merak etmek için bir soru: ' + pick(CURIOSITY_PROMPTS));
    parts.push('Şimdi işe yarayabilir: ' + (() => { const g = pick(GROUNDING); return `${g.t} — ${g.d}`; })());
  } else if (kind === 'beden') {
    parts.push(pick(BODY_NEUTRAL));
    if (/ayna|kilo|şişman|göbek|kot|beden|tarttım/.test(lower)) {
      parts.push('Bugün ölçüye bakmamayı deneyebilirsin. Sayı, o gün nasıl hissedeceğini belirlemek zorunda değil.');
    }
    parts.push(pick(GROUNDING).d);
  } else if (kind === 'yemek') {
    parts.push(pick(FOOD_REMINDERS));
    parts.push('Yardımcı olabilir: ' + pick(CURIOSITY_PROMPTS));
  } else if (kind === 'iyi') {
    parts.push(pick(CELEBRATE));
  } else {
    parts.push('Yazdığın için iyi yaptın. Bir şeyi dışarı çıkarmak, onu taşınabilir hâle getiriyor.');
    parts.push('İstersen şunu dene: ' + (() => { const g = pick(GROUNDING); return `${g.t} — ${g.d}`; })());
  }

  // Agir isaretler varsa, vaaz vermeden tek bir cumle.
  if (/kusmak|kustum|çıkardım|aç kaldım|günlerdir yemedim|kendime zarar|yaşamak istemiyorum|intihar/.test(lower)) {
    parts.push('Bunu tek başına taşımak zorunda değilsin. Güvendiğin birine ya da bir uzmana söylemek, bu yükü hafifletebilir.');
  }

  return parts.join('\n\n');
}

export const randomGrounding = () => pick(GROUNDING);
export const randomBodyNeutral = () => pick(BODY_NEUTRAL);
export const randomFoodReminder = () => pick(FOOD_REMINDERS);
export const randomCuriosity = () => pick(CURIOSITY_PROMPTS);
