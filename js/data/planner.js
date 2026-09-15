// Gun plani sablonlari ve gorev kategorileri.

export const TASK_CATEGORIES = [
  { id: 'genel',   label: 'genel',       color: '#c9789f' },
  { id: 'okul',    label: 'okul/iş',     color: '#6f8fd0' },
  { id: 'kendime', label: 'kendime',     color: '#d98fb4' },
  { id: 'spor',    label: 'spor',        color: '#7fb98a' },
  { id: 'ev',      label: 'ev',          color: '#d3a45e' },
  { id: 'sosyal',  label: 'sosyal',      color: '#a98bd0' },
];

/** Gun iskeletleri. Kullanici begendigini goreve cevirir. */
export const DAY_TEMPLATES = [
  {
    id: 'dengeli', name: 'Dengeli gün',
    note: 'Ne çok boş ne çok dolu. Çoğu gün için iyi bir varsayılan.',
    blocks: [
      { time: '08:30', title: 'Sabah ritüeli — telefonsuz 20 dakika', cat: 'kendime' },
      { time: '09:30', title: 'Derin çalışma bloğu (90 dk)', cat: 'okul' },
      { time: '11:00', title: 'Mola — kısa yürüyüş', cat: 'kendime' },
      { time: '11:30', title: 'İkinci çalışma bloğu', cat: 'okul' },
      { time: '13:00', title: 'Öğle yemeği, masada değil', cat: 'genel' },
      { time: '15:00', title: 'Hafif işler / mailler', cat: 'okul' },
      { time: '17:30', title: 'Hareket', cat: 'spor' },
      { time: '20:00', title: 'Akşam kapanışı — yarını üç maddeyle yaz', cat: 'kendime' },
    ],
  },
  {
    id: 'yogun', name: 'Yoğun gün',
    note: 'Teslim tarihi olan günler için. Molaları silme — asıl işi onlar mümkün kılıyor.',
    blocks: [
      { time: '08:00', title: 'En zor işle başla (90 dk)', cat: 'okul' },
      { time: '09:45', title: 'Mola — 15 dk, ekransız', cat: 'kendime' },
      { time: '10:00', title: 'İkinci blok (90 dk)', cat: 'okul' },
      { time: '12:00', title: 'Yemek — gerçekten ara ver', cat: 'genel' },
      { time: '13:00', title: 'Üçüncü blok', cat: 'okul' },
      { time: '15:30', title: 'Mola — yürü', cat: 'kendime' },
      { time: '16:00', title: 'Toparlama ve gözden geçirme', cat: 'okul' },
      { time: '19:00', title: 'Kapat. Bugünlük yeter.', cat: 'kendime' },
    ],
  },
  {
    id: 'yavas', name: 'Yavaş gün',
    note: 'Yorgun ya da ağır hissettiğin günler. Hiçbir şey yapmamaktan iyi, kendini zorlamaktan güvenli.',
    blocks: [
      { time: '10:00', title: 'Yavaş uyan, acele etme', cat: 'kendime' },
      { time: '11:00', title: 'Tek bir küçük iş — sadece bir tane', cat: 'genel' },
      { time: '13:00', title: 'Düzgün bir öğün', cat: 'genel' },
      { time: '15:00', title: 'Esneme ya da kısa yürüyüş', cat: 'spor' },
      { time: '17:00', title: 'Sevdiğin bir şey — dizi, kitap, müzik', cat: 'kendime' },
      { time: '21:00', title: 'Erken yat', cat: 'kendime' },
    ],
  },
  {
    id: 'kendime', name: 'Kendime gün',
    note: 'Kimseye ait olmayan bir gün. Yılda birkaç kez gerekiyor.',
    blocks: [
      { time: '10:00', title: 'Telefonu uçak moduna al', cat: 'kendime' },
      { time: '11:00', title: 'Tek başına kahve', cat: 'kendime' },
      { time: '13:00', title: 'Kendine güzel bir yemek yap', cat: 'ev' },
      { time: '15:00', title: 'Bir şey oku ya da izle', cat: 'kendime' },
      { time: '18:00', title: 'Odanı topla, mum yak', cat: 'ev' },
      { time: '20:00', title: 'Günlük yaz', cat: 'kendime' },
    ],
  },
  {
    id: 'temizlik', name: 'Toparlanma günü',
    note: 'Ev, evrak, ertelenmiş işler. Hepsini bir güne toplamak, haftaya yaymaktan kolay.',
    blocks: [
      { time: '10:00', title: 'Çamaşır başlat', cat: 'ev' },
      { time: '10:30', title: 'Oda ve masa topla', cat: 'ev' },
      { time: '12:00', title: 'Ertelenen mesajlara dön', cat: 'sosyal' },
      { time: '14:00', title: 'Evrak / fatura / randevu', cat: 'genel' },
      { time: '16:00', title: 'Market', cat: 'ev' },
      { time: '18:00', title: 'Haftanın planını çıkar', cat: 'genel' },
    ],
  },
];

/** Kisa, tek satirlik gunluk oneriler — plan kurmadan da ise yarar. */
export const DAILY_NUDGES = [
  'Bugün en zor işi ilk saate al. Gerisi kolaylaşıyor.',
  'Üç maddeden fazla yazma. Üçü biterse bonus.',
  'Bir işi 25 dakikaya böl. Başlamak bitirmekten zor.',
  'Bugün bir şeyi listeden sil. Yapmamayı da seçebilirsin.',
  'Molayı planla, yoksa mola seni planlıyor.',
  'Akşam yarının üç maddesini yaz; sabah düşünmek zorunda kalma.',
  'Bir işi "mükemmel" değil "bitmiş" yapmayı hedefle.',
  'Bugün kimseye bir şey yetiştirmiyorsan, kendine yetiştir.',
  'Telefonu başka odaya koy. Sadece bir saat.',
  'Yapılmayanları taşı, suçluluğu taşıma.',
];

export const getTemplate = (id) => DAY_TEMPLATES.find((t) => t.id === id) || null;
export const categoryColor = (id) => (TASK_CATEGORIES.find((c) => c.id === id) || TASK_CATEGORIES[0]).color;

export function randomNudge() {
  return DAILY_NUDGES[Math.floor(Math.random() * DAILY_NUDGES.length)];
}
