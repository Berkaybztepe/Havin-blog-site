// Olumlama kutuphanesi.
//
// Ton notu: burasi "bugun harika olacak!" demez. Bazi gunler kotudur ve
// kotu olduklarini soylemek de bir olumlamadir. Her olumlamanin bir ruh hali
// etiketi var; agir bir gun secildiginde agir gune yakisan sozler gelir.

export const MOODS = [
  { id: 'iyi',    label: 'iyiyim',        emoji: '🎀' },
  { id: 'sakin',  label: 'sakinim',       emoji: '🕊️' },
  { id: 'yorgun', label: 'yorgunum',      emoji: '🌙' },
  { id: 'agir',   label: 'ağırım',        emoji: '🌧️' },
  { id: 'kizgin', label: 'kızgınım',      emoji: '🔥' },
  { id: 'bosluk', label: 'boşluktayım',   emoji: '🫧' },
  { id: 'umutlu', label: 'umutluyum',     emoji: '🌱' },
];

export const AFFIRMATIONS = [
  // --- sakin / gundelik ---
  { t: 'Bugün küçük şeyleri fark etmek de bir başarı sayılır.', m: ['sakin', 'iyi'] },
  { t: 'Acelem yok. Hayat beni bir yere yetiştirmek zorunda değil.', m: ['sakin', 'yorgun'] },
  { t: 'Kendime iyi davranmak, kendimi şımartmak değil; kendime sahip çıkmak.', m: ['sakin', 'agir'] },
  { t: 'Bugünü kurtarmam yeterli. Her günü kurtarmak zorunda değilim.', m: ['sakin', 'yorgun'] },
  { t: 'Sessiz bir gün de yaşanmış bir gündür.', m: ['sakin', 'bosluk'] },
  { t: 'Bir şeyi yavaş yapmak, onu kötü yapmak demek değil.', m: ['sakin'] },
  { t: 'Kimseye kanıtlamak zorunda olmadığım bir hayatım var.', m: ['sakin', 'kizgin'] },
  { t: 'Bugün sadece nefes almak ve bir bardak su içmek bile bir bakım biçimi.', m: ['sakin', 'yorgun'] },

  // --- yorgun ---
  { t: 'Yorgunluğum tembellik değil. Bir şeyleri taşımaktan geliyor.', m: ['yorgun', 'agir'] },
  { t: 'Dinlenmek, hak edilmesi gereken bir şey değil. İhtiyaç.', m: ['yorgun'] },
  { t: 'Bugün az yaptım. Az da bir miktardır.', m: ['yorgun', 'agir'] },
  { t: 'Kendimi zorlamadığım günler de bana ait.', m: ['yorgun'] },
  { t: 'Enerjim bitmişse, plan değil; şefkat lazım.', m: ['yorgun', 'agir'] },
  { t: 'Uyumak, kaçmak değil. Toparlanmak.', m: ['yorgun'] },

  // --- agir / kotu gun ---
  { t: 'Bugün kötü. Bu, hayatımın kötü olduğu anlamına gelmiyor.', m: ['agir'] },
  { t: 'İyi hissetmek zorunda değilim. Sadece burada kalmam yeterli.', m: ['agir', 'bosluk'] },
  { t: 'Ağlamak bir çöküş değil, bir boşalma.', m: ['agir'] },
  { t: 'Bu duygu da bir hava durumu. Kalıcı değil, sadece şu an böyle.', m: ['agir', 'bosluk'] },
  { t: 'Kimseye iyi görünmek zorunda olmadığım bir gün olabilir.', m: ['agir', 'yorgun'] },
  { t: 'En kötü günümde bile kendime düşman olmak zorunda değilim.', m: ['agir'] },
  { t: 'Şu an çözemediğim şey, yarın da aynı ağırlıkta olmayabilir.', m: ['agir', 'umutlu'] },
  { t: 'Bir şeyi hissetmek, onunla aynı şey olmak değil.', m: ['agir', 'bosluk'] },
  { t: 'Bugün sadece idare ettim. İdare etmek de bir beceridir.', m: ['agir', 'yorgun'] },

  // --- bosluk / kopukluk ---
  { t: 'Hiçbir şey hissetmediğim günler de benim günlerim.', m: ['bosluk'] },
  { t: 'Kendimi bulamadığım zamanlar, kendimi kaybettiğim anlamına gelmiyor.', m: ['bosluk'] },
  { t: 'Bir yere ait hissetmemek, hiçbir yere ait olmamak değil.', m: ['bosluk', 'agir'] },
  { t: 'Boşluk da bir yer. Orada bir süre durabilirim.', m: ['bosluk'] },
  { t: 'Kim olduğumu tam bilmiyorum ve bu, yolun ortasında olmanın normal hâli.', m: ['bosluk', 'umutlu'] },

  // --- kizgin ---
  { t: 'Kızgınlığım bir arıza değil, bir sınır ihlalinin haberi.', m: ['kizgin'] },
  { t: 'Herkese anlayışlı olmak zorunda değilim. Bazen sadece kızgınım.', m: ['kizgin'] },
  { t: 'Hayır demek, kötü biri olmak değil.', m: ['kizgin', 'sakin'] },
  { t: 'Beni küçülten bir odada büyümek zorunda değilim.', m: ['kizgin', 'umutlu'] },
  { t: 'Öfkem bana neyin önemli olduğunu söylüyor. Dinliyorum.', m: ['kizgin'] },

  // --- iyi / neseli ama abartisiz ---
  { t: 'Bugün güzel geçti ve bunu yazmaya değer buluyorum.', m: ['iyi'] },
  { t: 'İyi hissetmek de gerçek. Sadece kötü olan gerçek değil.', m: ['iyi', 'umutlu'] },
  { t: 'Kendimle iyi vakit geçirebilen biriyim.', m: ['iyi', 'sakin'] },
  { t: 'Bugün kendime yakıştırdığım şeyi giydim ve bu küçük bir tören oldu.', m: ['iyi'] },
  { t: 'Sevindiğim şeyleri küçümsemeden sevinebilirim.', m: ['iyi'] },

  // --- umutlu / gelisim ---
  { t: 'Kusursuz olmak zorunda değilim, sadece devam etmem yeterli.', m: ['umutlu', 'agir'] },
  { t: 'Hâlâ öğreniyorum ve bu, geri kalmış olmak değil.', m: ['umutlu', 'bosluk'] },
  { t: 'Kendimi tanımak bir varış değil, uzun bir tanışma.', m: ['umutlu', 'bosluk'] },
  { t: 'Bugün attığım küçük adım, kimsenin görmediği yerde birikiyor.', m: ['umutlu'] },
  { t: 'Değişmek, eski hâlime ihanet etmek değil.', m: ['umutlu'] },
  { t: 'Kendime dair fikrimi, en kötü günümde vermek zorunda değilim.', m: ['umutlu', 'agir'] },
  { t: 'İstediğim hayata yavaş yavaş benziyorum.', m: ['umutlu', 'iyi'] },
  { t: 'Geç kalmış değilim. Kendi saatimdeyim.', m: ['umutlu', 'bosluk'] },
];

/** Hayati romantize etmek icin kucuk torenler. */
export const RITUALS = [
  'Bir bardak çayı, telefona bakmadan, sadece içmek için iç.',
  'Bugün bir şarkıyı sonuna kadar, başka bir şey yapmadan dinle.',
  'Pencereden dışarıya beş dakika bak. Hiçbir şey yapma.',
  'Bir mum yak ve yanarken tek bir sayfa oku.',
  'Yürürken kulaklığı çıkar ve sokağın sesini dinle.',
  'Bugün yediğin bir şeyin tabağını güzel hazırla. Sadece kendin için.',
  'Eski bir fotoğrafına bak ve o güne teşekkür et.',
  'Bir cümle yaz. Sadece bir cümle. Devamı gelmezse gelmesin.',
  'Yatağını topla ve odanın hâline bir dakika bak.',
  'Bugün birine, karşılık beklemeden küçük bir şey söyle.',
  'Elini sıcak suyun altında tut ve sadece onu hisset.',
  'Kendine bir çiçek al. Sebep gerekmez.',
  'Odanın ışığını kıs, lambayı yak ve akşamı böyle karşıla.',
  'Sevdiğin bir kokuyu sık ve o an nerede olduğunu fark et.',
  'Bugünü tek kelimeyle özetle ve o kelimeyi bir yere yaz.',
  'Bir filme başlarken telefonu başka odaya bırak.',
  'Yağmur varsa camı aç ve kokusunu içeri al.',
  'Kendine yüksek sesle "bugün iyi iş çıkardın" de. Tuhaf gelecek, yine de de.',
];

/** Hazir YouTube arama kisayollari. Sabit video kimligi tutmuyoruz:
 *  zamanla silinen videolar yerine arama her zaman calisir. */
export const YT_SEARCHES = [
  { label: 'hayatı romantize etme', q: 'romanticizing your life aesthetic' },
  { label: 'sabah rutini · sakin', q: 'slow morning routine aesthetic' },
  { label: 'olumlamalar · kadın', q: 'daily affirmations for women calm' },
  { label: 'lofi · çalışma', q: 'lofi hip hop radio study beats' },
  { label: 'toskana sonbaharı', q: 'tuscan autumn aesthetic playlist' },
  { label: '2000ler nostalji', q: '2000s throwback playlist nostalgia' },
  { label: 'yağmur sesi', q: 'rain sounds for sleep 3 hours' },
  { label: 'kendine dönme', q: 'that girl self care reset routine' },
  { label: 'kitap okuma müziği', q: 'classical music for reading calm' },
  { label: 'ağır günler için', q: 'comfort music for bad days playlist' },
];

// --- secim mantigi ---------------------------------------------------------
// Gunun olumlamasi gun icinde sabit kalsin diye tarihten tohumlu secim.
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
