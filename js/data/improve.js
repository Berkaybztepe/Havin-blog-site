// Kendini gelistirme / kulturlenme oneri kutuphanesi.
// Her oneri bir "ne yapabilirim" onerisiyle birlikte gelir; kuru bir liste degil.

export const CATEGORIES = [
  { id: 'okuma',   label: 'okuma',        emoji: '📖' },
  { id: 'sanat',   label: 'sanat',        emoji: '🎨' },
  { id: 'muzik',   label: 'müzik',        emoji: '🎧' },
  { id: 'film',    label: 'film',         emoji: '🎬' },
  { id: 'zihin',   label: 'zihin',        emoji: '🧠' },
  { id: 'beden',   label: 'beden',        emoji: '🤍' },
  { id: 'sosyal',  label: 'sosyal',       emoji: '💌' },
  { id: 'beceri',  label: 'beceri',       emoji: '✂️' },
  { id: 'yalniz',  label: 'yalnız vakit', emoji: '🌙' },
  { id: 'dunya',   label: 'dünya',        emoji: '🗺️' },
];

export const SUGGESTIONS = [
  // okuma
  { c: 'okuma', t: 'Bir klasiğe küçük bir kapıdan gir', d: 'Kalın bir romanı baştan sona okumaya söz verme. Sadece ilk bölümü oku; devamı gelirse gelsin.' },
  { c: 'okuma', t: 'Şiir oku, anlamaya çalışma', d: 'Bir şiiri iki kez oku: bir kez sessizce, bir kez yüksek sesle. Anlamı sonra gelir, ses önce gelir.' },
  { c: 'okuma', t: 'Bir kitabı yarıda bırakma iznini kendine ver', d: 'Sevmediğin kitabı bırak. Okumayı sevmemek değil, o kitabı sevmemek söz konusu.' },
  { c: 'okuma', t: 'Alıntı defteri tut', d: 'Okurken altını çizdiğin cümleleri tek bir yere topla. Bir yıl sonra kendi zihninin haritası olur.' },
  { c: 'okuma', t: 'Bir denemeci keşfet', d: 'Roman yerine deneme oku. Kısa, kişisel ve bir oturuşta biten bir tür.' },
  { c: 'okuma', t: 'Sabah on sayfa', d: 'Telefona bakmadan önce on sayfa. Günün ilk sesi başkasının değil, bir kitabın olsun.' },
  { c: 'okuma', t: 'Başka bir ülkenin edebiyatına gir', d: 'Hiç okumadığın bir ülkeden bir yazar seç. Bir yere gitmeden oraya gitmenin yolu.' },

  // sanat
  { c: 'sanat', t: 'Bir tabloyu on dakika izle', d: 'İnternetten tek bir tablo aç ve on dakika bak. Sıkılmak sürecin parçası; ondan sonrası başlıyor.' },
  { c: 'sanat', t: 'Kötü çiz', d: 'İyi çizmeye çalışma. Önündeki bardağı çiz. Amaç sonuç değil, bakma biçimi.' },
  { c: 'sanat', t: 'Sanal müze turu yap', d: 'Büyük müzelerin çevrimiçi koleksiyonlarında gezin. Bir salonda takılıp kalmak serbest.' },
  { c: 'sanat', t: 'Kolaj yap', d: 'Eski dergileri kes, yapıştır. Elinle bir şey yapmak, zihnini susturmanın en hızlı yolu.' },
  { c: 'sanat', t: 'Bir sanat akımını öğren', d: 'Bir akım seç, üç eserine bak, neden öyle yaptıklarını oku. Bir hafta yeter.' },
  { c: 'sanat', t: 'Fotoğrafla günlük tut', d: 'Her gün tek bir fotoğraf çek. Güzel olmak zorunda değil, o günden olması yeterli.' },

  // muzik
  { c: 'muzik', t: 'Bir albümü baştan sona dinle', d: 'Karışık çalma listesi değil, tek bir albüm, sırasıyla. Sanatçının kurduğu sırayla dinlemek başka bir şey.' },
  { c: 'muzik', t: 'Kendine bir "şu an" listesi yap', d: 'Bu ayki hâlini anlatan on şarkı. Yıllar sonra bu liste bir fotoğraftan daha çok şey hatırlatır.' },
  { c: 'muzik', t: 'Hiç bilmediğin bir türe gir', d: 'Caz, klasik, bossa nova, folk... Bir tanesini seç ve bir hafta sadece onu dinle.' },
  { c: 'muzik', t: 'Enstrümantal çalış', d: 'Sözlü müzik dikkati böler. Çalışırken sözsüz dinlemeyi dene, farkı ölç.' },
  { c: 'muzik', t: 'Bir şarkının sözünü çevir', d: 'Sevdiğin yabancı bir şarkının sözlerini kendi cümlelerinle çevir. Hem dil hem duygu çalışması.' },

  // film
  { c: 'film', t: 'Yönetmen seç, film değil', d: 'Bir yönetmenin üç filmini arka arkaya izle. Tekrar eden şeyleri görmeye başlarsın.' },
  { c: 'film', t: 'Altyazıyla izle', d: 'Dublaj yerine altyazı. Oyuncunun sesi de oyunun yarısı.' },
  { c: 'film', t: 'Film sonrası üç cümle yaz', d: 'Puan verme. Sadece üç cümle: ne hissettim, ne kaldı, kime anlatırdım.' },
  { c: 'film', t: 'Eski bir filmi tekrar izle', d: 'Beş yıl önce izlediğin bir filmi tekrar izle. Film aynı, sen değilsin; asıl ölçüm bu.' },
  { c: 'film', t: 'Belgesel akşamı', d: 'Ayda bir akşamı belgesele ayır. Hiç ilgilenmediğin bir konu seç, asıl sürpriz orada.' },

  // zihin
  { c: 'zihin', t: 'Sabah sayfası yaz', d: 'Uyanınca, düşünmeden, üç sayfa yaz. Kimse okumayacak. Amaç kafanın içini boşaltmak.' },
  { c: 'zihin', t: 'Telefonsuz bir saat', d: 'Günde bir saat telefonu başka odaya koy. İlk gün zor, üçüncü gün rahatlatıcı.' },
  { c: 'zihin', t: 'Bir konuyu derinlemesine öğren', d: 'Rastgele on şey yerine tek bir konu seç ve bir ay onu takip et. Derinlik, genişlikten daha doyurucu.' },
  { c: 'zihin', t: 'Kendine bir soru sor ve cevabını yaz', d: '"Neden bu beni bu kadar rahatsız etti?" Cevabı yazmadan bulunmuyor.' },
  { c: 'zihin', t: 'Düşünce günlüğü', d: 'Seni zorlayan bir düşünceyi yaz, sonra altına: bu kesin mi, yoksa korku mu? İkisini ayırmak çoğu şeyi çözüyor.' },
  { c: 'zihin', t: 'Bir şeyi bitirmeden yenisine başlama', d: 'Bir hafta boyunca tek bir işi bitirmeye odaklan. Yarım işler zihinde yer kaplıyor.' },
  { c: 'zihin', t: 'Akşam üç iyi şey', d: 'Gün sonunda üç şey yaz. Büyük olmak zorunda değil; "kahve iyiydi" de sayılır.' },

  // beden
  { c: 'beden', t: 'Yürüyüşü egzersiz sayma', d: 'Hedefsiz yürü. Adım sayma, kalori hesaplama. Sadece yürümek de bedene iyi geliyor.' },
  { c: 'beden', t: 'Esneme rutini kur', d: 'Sabah beş dakika. Performans için değil, günün geri kalanını daha rahat geçirmek için.' },
  { c: 'beden', t: 'Uyku saatini sabitle', d: 'Kaç saat uyuduğundan çok, ne zaman uyuduğun önemli. Bir hafta aynı saatte yat.' },
  { c: 'beden', t: 'Su içmeyi bir alışkanlığa bağla', d: 'Her masaya oturduğunda bir bardak. Hatırlamaya değil, sıraya bağla.' },
  { c: 'beden', t: 'Aynada nötr durmayı dene', d: 'Ne övgü ne eleştiri. "Bu benim bedenim" demek, sevmek zorunda kalmadan barışmanın ilk adımı.' },
  { c: 'beden', t: 'Bedenin ne istediğini sor', d: 'Antrenman öncesi: bugün hangisi iyi gelir — zorlamak mı, yumuşatmak mı? İkisi de geçerli cevap.' },

  // sosyal
  { c: 'sosyal', t: 'Uzun bir mesaj yaz', d: 'Emoji değil, paragraf. Birine gerçekten ne düşündüğünü yaz.' },
  { c: 'sosyal', t: 'Eski bir arkadaşa yaz', d: 'Sebep uydurmana gerek yok. "Aklıma geldin" yeterli bir cümle.' },
  { c: 'sosyal', t: 'Bir sınır koy', d: 'Bu hafta bir şeye hayır de. Açıklama yapmadan hayır demeyi dene.' },
  { c: 'sosyal', t: 'Yüz yüze görüş', d: 'Ekran yerine bir kahve. Kısa da olsa, bedenli görüşmenin yerini hiçbir şey tutmuyor.' },
  { c: 'sosyal', t: 'Dinlemeyi dene', d: 'Bir konuşmada sadece dinle. Sırada ne söyleyeceğini düşünmeden dinlemek şaşırtıcı derecede zor.' },

  // beceri
  { c: 'beceri', t: 'Bir yemeği iyice öğren', d: 'Yirmi tarif değil, tek bir tarif. Ezberleyene kadar yap. Bir beceri böyle oturuyor.' },
  { c: 'beceri', t: 'Dikiş dik', d: 'Bir düğme, bir sökük. Kendi eşyanı onarabilmek beklenmedik bir güven veriyor.' },
  { c: 'beceri', t: 'El yazını geliştir', d: 'Günde beş dakika, aynı cümleyi yaz. Kendi el yazını sevmek küçük ama kalıcı bir zevk.' },
  { c: 'beceri', t: 'Bir dilde günde on kelime', d: 'Gramerle başlama. Kelimeyle başla. Konuşma isteği gramerden önce gelir.' },
  { c: 'beceri', t: 'Fotoğraf çekmeyi öğren', d: 'Işığı öğren, makineyi değil. Aynı objeyi günün üç farklı saatinde çek.' },
  { c: 'beceri', t: 'Bir şeyi kendin tamir et', d: 'Atmadan önce bir dene. Çoğu şey sandığından kolay düzeliyor.' },

  // yalniz vakit
  { c: 'yalniz', t: 'Tek başına kahveye git', d: 'Telefonsuz. Sadece otur ve izle. İlk on dakika garip, sonrası çok iyi.' },
  { c: 'yalniz', t: 'Tek başına sinemaya git', d: 'Kimseyle uyuşmak zorunda olmadan, istediğin filmi izle.' },
  { c: 'yalniz', t: 'Kendine akşam yemeği yap', d: 'Kendin için güzel bir sofra kur. Misafir gelmeyecek, yine de kur.' },
  { c: 'yalniz', t: 'Tek başına küçük bir gezi', d: 'Bir günlük bile olsa. Kendi temponda olmanın ne demek olduğunu hatırlatır.' },
  { c: 'yalniz', t: 'Hiçbir şey yapma', d: 'On beş dakika, plansız. Boşluğa dayanmak da öğrenilen bir şey.' },

  // dunya
  { c: 'dunya', t: 'Bir haberin arkasını oku', d: 'Başlığı değil, konuyu öğren. Bir konuyu üç farklı kaynaktan okumak farkı gösteriyor.' },
  { c: 'dunya', t: 'Bir dönemin tarihini öğren', d: 'Bir yüzyıl seç. Sadece o yüzyılı. Parçalı bilgi yerine bir bütün.' },
  { c: 'dunya', t: 'Haritaya bak', d: 'Adını duyduğun ama yerini bilmediğin bir ülkeyi haritada bul ve hakkında beş şey oku.' },
  { c: 'dunya', t: 'Bir mimarlık üslubu tanı', d: 'Sokakta yürürken binaları tanımak, şehri bambaşka bir yer yapıyor.' },
  { c: 'dunya', t: 'Bir bilim konusunu basitçe öğren', d: 'Anlayana kadar değil, merak edene kadar oku. Merak zaten gerisini getiriyor.' },
];

function seed(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return Math.abs(h);
}

/** Gun icinde sabit kalan gunun onerisi. */
export function dailySuggestion(dateISO) {
  return SUGGESTIONS[seed('improve|' + dateISO) % SUGGESTIONS.length];
}

/** Rastgele n oneri; istege bagli kategori suzgeci. */
export function pickSuggestions(n = 3, category = null, exclude = []) {
  const pool = SUGGESTIONS
    .filter((s) => !category || s.c === category)
    .filter((s) => !exclude.includes(s.t));
  const out = [];
  const used = new Set();
  const limit = Math.min(n, pool.length);
  while (out.length < limit) {
    const i = Math.floor(Math.random() * pool.length);
    if (used.has(i)) continue;
    used.add(i);
    out.push(pool[i]);
  }
  return out;
}

export const categoryOf = (id) => CATEGORIES.find((c) => c.id === id) || { label: id, emoji: '•' };
