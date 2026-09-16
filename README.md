# from within

Kişisel, **şifreli**, tek kişilik bir günlük. Sade, sessiz, yazının öne çıktığı bir defter.

> Uygulamanın arayüzü İngilizce; bu README senin için Türkçe.

Hem **Android uygulaması (APK)** hem de tarayıcıda çalışan bir site olarak kullanılabilir.

---

## Ne var içinde

| Bölüm | Ne yapar |
|---|---|
| **Günlük** (diary) | Yazılar; personal / academic / deep / scribbles kategorileri. Her yazı için ayrı yazı tipi (el yazısı dahil), boyut, renk, hizalama. **Yazıya bir şarkı iliştirme** (aşağıda), fotoğraf (yükle, sürükle-bırak ya da yapıştır), çıkartma, metin içine video gömme. Arama ve etiketler. |
| **Profilim** | Fotoğraf, kendini tanıtma alanları, gelişim alanları, 57 kültürlenme önerisi, pinleyip üzerine not alabildiğin pano. |
| **Olumlama** | 46 Türkçe olumlama — ruh hâline göre seçiliyor. Kendi YouTube listeni kurarsın. Günlük "küçük tören" önerileri. |
| **Pano** | Serbest yerleşimli mood board: fotoğraf, 18 çıkartma ve not kâğıtları; parmakla sürükle, boyutlandır, döndür. |
| **Planlayıcı** | Hafta görünümü, saatli görevler, gün notu, 5 hazır gün şablonu. |
| **Beden & Mutfak** | Antrenman programı ve geçmişi; öğün kaydı, kalori/makro, 76 besinlik tablo; duygu & destek alanı. |
| **Ayarlar** | 7 tema, yazı tipi/boyut/renk, kenar sütunu widget'ları, API anahtarı, otomatik kilit, yedekleme. |

### Görünüm

Varsayılan tema **sade**: sıcak kâğıt zemin, saç teli kenarlıklar, gölge yok, bol boşluk.
Gövde yazısı **Inter**, başlıklar **Newsreader**. Uygulamada hiç emoji yok: ruh hâlleri
sessiz birer **renk noktası** ve kelimeyle gösteriliyor, o günün rengi mini takvimde de
görünüyor.

Ayarlar → görünüm'den değiştirebileceklerin: 7 tema (sade · krem dantel · toskana · kiraz ·
koyu toile · gece · 2000'ler), gövde ve başlık yazı tipi, yazı boyutu, yazı rengi, vurgu rengi.
Her günlük yazısı ayrıca kendi yazı tipini, boyutunu ve rengini taşıyabiliyor — el yazısı
fontları bunun için duruyor.

### Yazıya şarkı iliştirme

Bir yazıyı bir şarkıyla anlatmak istediğinde: yazarken **"♪ add a song for this entry"**
düğmesine bas, YouTube bağlantısını yapıştır. Şarkı yazının en üstünde bir kart olarak
görünür; **üstüne dokununca çalar.** Çalma listesi de olur.

Kart kapalı başlar — yani her yazıyı açtığında boş yere YouTube'a istek gitmez, ancak sen
dokunduğunda yüklenir.

Metnin ortasına video gömmek istersen, editördeki **song** düğmesi bunu yapar.
Bir YouTube bağlantısını doğrudan yazının içine yapıştırırsan, hangisini istediğini sorar.

### Fotoğraf ekleme

Üç yolu var: editördeki **photo** düğmesi, dosyayı **yazı alanına sürükleyip bırakmak**,
ya da panodaki bir görseli **doğrudan yapıştırmak** (ekran görüntüsü için pratik).

### Nazik mod
Mutfak bölümünde tek dokunuşla tüm rakamlar gizlenir; sadece ne yediğin ve nasıl hissettiğin kalır.
Hiçbir yerde hedef, limit ya da "aştın" uyarısı yok. Destek metinleri kalori, kilo, telafi ya da
diyet dili kullanmaz. Burası bir doktor değil; zorlanma uzun sürerse bir uzmana danışmak iyi gelir.

---

## Kurulum

### Android uygulaması (önerilen)

1. `android/out/from-within.apk` dosyasını telefona/tablete indir.
2. Aç. Android "bilinmeyen kaynak" diye soracak → izin ver.
3. Kur ve aç.

Android 5.0 ve üstü çalışır.

### Tarayıcıda (GitHub Pages)

1. GitHub'da: **Settings → Pages → Source: Deploy from a branch**, dal `claude/personal-blog-site-9x1dfs`, klasör `/ (root)`.
2. Verilen adresi aç.
3. Telefonda **"Ana ekrana ekle"** de — bu önemli, aşağıda anlatıyorum.

> **Dosyaya çift tıklayarak açma.** `file://` ile açıldığında tarayıcılar
> şifrelemeyi ve veri depolamayı kısıtlıyor; veri kaybedersin. Uygulamayı ya APK olarak
> ya da bir adres üzerinden kullan. Kendi bilgisayarında denemek için:
> `python3 -m http.server 8000` ve `http://localhost:8000`.

---

## Gizlilik — ne korur, ne korumaz

Şifren PBKDF2-SHA256 (600.000 tur) ile bir anahtara dönüşür; o anahtar, verini şifreleyen
asıl anahtarı sarar. Her yazı, her fotoğraf ayrı ayrı AES-GCM ile şifrelenir.

**Korur:**
- Veri bu cihazdan hiç çıkmıyor. Bu depoyu ya da site adresini gören biri günlüğünü göremez.
- Cihazını ele geçiren ya da tarayıcı verilerini kopyalayan biri, şifreni bilmeden hiçbir şey okuyamaz.

**Korumaz:**
- **Günlük açıkken cihazını eline alan biri her şeyi okur.** Otomatik kilit bu yüzden var (Ayarlar'dan süresini değiştir).
- Cihazındaki zararlı yazılım ya da tarayıcı eklentisi.
- Tahmin edilebilir bir şifre. Uzun bir parola kullan — 4 kelimelik bir cümle, 8 karakterlik karışık bir şifreden çok daha güçlü.
- **Yapay zeka özellikleri.** Fotoğraf analizi ya da duygusal destek istediğinde, o metin/fotoğraf o an şifresiz olarak Anthropic sunucusuna gider.

**Şifreni unutursan:** kurulumda verilen **kurtarma kodu** tek yol. Onu da kaybedersen veri geri gelmez — bende de bir kopyası yok.

---

## Yedekleme — bunu atlamayın

Veri **yalnızca** o cihazda. Telefon değişirse, uygulama silinirse ya da tarayıcı verileri
temizlenirse günlük gider.

- **Ayarlar → Yedek al** şifreli bir `.havin.json` dosyası üretir.
- Yeni bir cihazda: uygulamayı aç → **"zaten bir yedeğim var"** → dosyayı seç → eski şifrenle gir.
- Cihazlar arasında taşımanın yolu da budur; otomatik senkron yok.

---

## Yapay zeka (isteğe bağlı)

Anahtar **olmadan da her şey çalışır** — öğün değerlerini elle girersin, destek ve öneriler
uygulamanın kendi kütüphanesinden gelir.

Anahtar eklersen şunlar açılır:
- Yemek fotoğrafından kalori, makro ve öne çıkan mikro besin tahmini
- Duygu & destek bölümünde kişiye özel karşılık
- Gün planı önerisi ve kişiye özel gelişim önerileri

Anahtarı [console.anthropic.com](https://console.anthropic.com) adresinden alıp
**Ayarlar → Yapay zeka**'ya yapıştır. Şifreli olarak cihazında saklanır. Kullanım sana
faturalanır — Console'dan düşük bir aylık limit koymanı öneririm.

---

## Geliştirici notları

Derleme adımı yok, npm yok, framework yok. Düz HTML + CSS + ES modülleri.

```
index.html            uygulama kabuğu
sw.js                 servis çalışanı (yalnızca web sürümü)
css/                  tokens · base · layout · components · views
assets/fonts/         11 yazı tipi, kendi sunucumuzda (Türkçe glifleri doğrulandı)
js/core/              crypto · store · repo · session · router · look · backup · dom
js/lib/               idb · sanitize · image
js/data/              Türkçe içerik kütüphaneleri
js/ai/                Claude API istemcisi ve özellikler
js/views/             bölümler
js/widgets/           kenar sütunu
android/              APK sarmalayıcı + build.sh
```

**Depolama mimarisi:** her yazı/öğün/gün ayrı şifreli kayıt, her fotoğraf ayrı şifreli ikili
kayıt olarak IndexedDB'de. Liste ekranları tek bir küçük "dizin" kaydını çözerek çizilir.
Böylece kaydetme maliyeti, geçmiş büyüdükçe artmıyor.

### APK'yi yeniden üretmek

```bash
sudo apt-get install aapt apksigner android-sdk-build-tools android-sdk-platform-23 zipalign
# dalvik-dx (Maven Central):
curl -o /opt/androidtools/dalvik-dx.jar \
  https://repo1.maven.org/maven2/com/jakewharton/android/repackaged/dalvik-dx/16.0.1/dalvik-dx-16.0.1.jar

./android/build.sh          # -> android/out/from-within.apk
```

APK, uygulamayı `file://` yerine `https://havin.local/` sanal adresinden sunar
(WebView `file://` kaynaklarında IndexedDB ve WebCrypto'yu kısıtlıyor).

> **İmza anahtarı:** `android/havin-release.keystore` depoda duruyor. Android, bir uygulamanın
> güncellenebilmesi için her sürümün aynı anahtarla imzalanmasını şart koşuyor; anahtar
> kaybolursa yeni sürümü kurmak için eskisini silmek, yani **günlük verisini kaybetmek** gerekir.
> Depoyu herkese açık yaparsan bu anahtarı değiştirmek isteyebilirsin — o zaman güncellemeden
> önce mutlaka yedek al.
