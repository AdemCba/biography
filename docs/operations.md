# İşletim notları

## İlk kurulum (bir kez)

1. **Domain:** orbivida.com'u satın al (2026-10-26 itibarıyla kayıtlı görünmüyordu, satın almadan
   kesin değil).
2. **Cloudflare Pages:** Cloudflare hesabında `orbivida` adlı bir Pages projesi oluştur ve domaini bağla.
   "Edit Cloudflare Workers/Pages" yetkili bir API token oluştur.
3. **GitHub ayarları** (repo > Settings > Secrets and variables > Actions):
   - Secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `ANTHROPIC_API_KEY` (düzeltme döngüsü
     için), `INDEXNOW_KEY` (32 karakterlik rastgele hex, ör. `openssl rand -hex 16`).
   - Variables: `SITE_URL` (https://www.orbivida.com), `CONTACT_EMAIL`, `ENABLED_LOCALES`
     (en,es,pt,de,fr), sonradan `ADSENSE_CLIENT`, `GA_ID`, `GOOGLE_SITE_VERIFICATION`.
4. **Google Search Console:** domain mülkü ekle (DNS TXT kaydıyla doğrulama en kolayı) ve
   `https://www.orbivida.com/sitemap.xml` adresini bir kez gönder. Bundan sonra link göndermene gerek yok.
5. **Bing Webmaster Tools:** Search Console'dan içe aktar. IndexNow bildirimleri buraya da düşer.
6. **Editör bilgisi:** `content/editors.json` içindeki yer tutucuyu gerçek ad, kısa özgeçmiş ve
   profil linkleriyle değiştir, her yayın dili için bir biyografi ekle. Bu, E-E-A-T için en güçlü sinyal.

## Bir biyografinin yolu

1. `npm run new -- "Ad Soyad" kategori en,es,...` veya panelde "Yeni kişi" (durum: idea)
2. Araştırma: `prompts/01-research.md` ile kaynaklar ve doğrulanmış bilgiler `person.json`'a (research)
3. Taslak: `prompts/02-draft.md` (draft). Diğer diller `prompts/03-localize.md` ile ayrı ayrı yazılır,
   çeviri yapılmaz.
4. Doğrulama: `prompts/04-fact-check.md` (review)
5. Panelde oku, düzelt, "Onayla" (approved, reviewer + reviewedAt yazılır)
6. `npm run schedule` veya panelde "Yayına al" (published + publishedAt), commit, push
7. Push sonrası Actions: düzeltme döngüsü, kalite raporu, derleme, yükleme, IndexNow

Panelde "Bakım" sekmesi: kalite kapısından düşen, kontrol tarihi (`reviewBy`) geçmiş, servet bilgisi
12 aydan eski veya düzeltme döngüsünün bayrakladığı makaleleri listeler.

## İndeksleme nasıl olur

- Google yeni sayfaları sitemap'ten ve iç linklerden bulur. Sitemap her derlemede yeniden üretilir,
  her URL'nin `lastmod` değeri makalenin gerçek güncelleme tarihidir (değişmeyen sayfanın tarihi
  oynatılmaz, Google buna güvenmeyi bırakır).
- Her biyografi ana sayfadan, kategoriden, ilgili kişilerden ve editör sayfasından link alır;
  metin içinde `[Ad](person:id)` ile diğer biyografilere bağlantı verilir.
- Bing, Yandex, Seznam, Naver: her yayından sonra yeni/değişen URL'ler IndexNow ile bildirilir
  (canlı sitemap ile yeni sitemap karşılaştırılır).
- Google Indexing API kullanılmaz: Google onu sadece iş ilanı ve canlı yayın sayfalarına izin veriyor.
- Yeni bir sayfanın hızlı görünmesi gerekiyorsa Search Console'daki "URL denetimi > Dizine eklenmesini
  iste" elle kullanılabilir, ama rutin iş için gerekmez.

## AdSense

Başvurudan önce `npm run readiness` (veya panelde "AdSense hazırlığı") yeşil olmalı:
gerçek domain ve iletişim adresi, gerçek editör bilgisi, her dilde yeterli sayıda yayında biyografi
(kendi eşiğimiz 15; Google bir sayı açıklamıyor), kalite kapısından düşen yayın yok.

- Hakkında, Editoryal politika, Gizlilik, Şartlar ve İletişim sayfaları 5 dilde hazır.
- `ads.txt` publisher id ayarlanınca otomatik dolar.
- Rıza yönetimi: AdSense > Gizlilik ve mesajlaşma bölümünden Google'ın sertifikalı GDPR mesajını
  (AB/EEA, İngiltere, İsviçre) aç. Site, rıza alınana kadar bu bölgelerde reklam ve analitik
  depolamayı kapalı tutan Consent Mode varsayılanlarını zaten gönderiyor.
- Reklamlar makalenin ikinci bölümünden önce ve sayfa sonunda; yükseklik önceden ayrıldığı için
  sayfa kaymaz (CLS). Yayın id'si ayarlanmadan hiçbir reklam alanı görünmez.

## Maliyet (aylık, tahmini)

- Cloudflare Pages: 0 $ (statik site, reklam kullanımı serbest)
- Domain: ~1 $ (yıllık ~10-12 $)
- Claude API (düzeltme döngüsü ve taslaklar): kullanım kadar, `REVISE_LIMIT` ile sınırlanır
