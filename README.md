# Orbivida

Çok dilli (en, es, pt, de, fr), kaynak doğrulamalı biyografi sitesi. Marka adı yalnızca
`NEXT_PUBLIC_SITE_NAME` ayarında geçer; değiştirmek için kod değiştirmek gerekmez.

## Nasıl çalışır

- **İçerik repoda dosya olarak durur.** Her kişi bir klasör: `content/people/<id>/person.json`
  (kaynaklar ve doğrulanmış bilgiler) ve her dil için `<dil>.md` (makale). Veritabanı yok.
- **Her push = yayın.** `main` dalına gelen her push GitHub Actions ile siteyi yeniden derler ve
  Cloudflare Pages'e yükler. Site tamamen statik HTML: hızlı, ucuz (Cloudflare Pages ücretsiz planı
  reklamlı siteye izin verir), sunucu bakımı yok.
- **Kalite kapısı.** Yayındaki her makale her derlemede denetlenir (`src/lib/quality.ts`). Geçemeyen
  makale siteye girmez; diğer makaleler yayına devam eder.
- **Düzelt ve tekrar denetle.** Geçemeyen makaleleri Claude API yeniden yazar (kaynakları açarak,
  yeni kaynak bularak), tekrar denetlenir, en fazla 3 deneme. Hâlâ geçmeyen makale `review` durumuna
  alınır ve panelde ⚑ bayrağıyla sana gösterilir.
- **Planlı yayın.** Onaylı makaleler `npm run schedule -- --per-day 3` ile günlere dağıtılır; her
  sabah 05:00 UTC çalışan derleme o günün makalelerini yayına alır.
- **İndeksleme.** Sitemap her derlemede gerçek `lastmod` tarihleriyle yeniden üretilir, hreflang
  sadece yayında olan dil sürümlerini bağlar, değişen sayfalar IndexNow ile Bing/Yandex'e bildirilir.
  Ayrıntı: [docs/operations.md](docs/operations.md).

## Kalite kapısı neyi engeller

Yayına çıkmak için bir dil sürümünün tek başına şunları geçmesi gerekir:

| Konu | Kural |
| --- | --- |
| İnsan onayı | `reviewer` (editors.json'daki gerçek bir editör) ve `author` zorunlu |
| Thin content | En az 300 kelime (önem derecesine göre daha fazlası önerilir), en az 3 bölüm, 25+ kelimelik özet |
| Kaynak | Kişide en az 2 kaynak, metinde en az 2 farklı kaynağa atıf, en az bir birincil kaynak (resmî profil, federasyon, ödül kurumu, şirket, kitap, röportaj), her ~300 kelimede bir atıf |
| Doğrulanmış bilgi | Doğum tarihi, uyruk, servet gibi her bilgi `person.json`'da kaynak id'siyle |
| İnsansı yazım | 5 dilde klişe/AI kalıbı listesi, cümle ritmi tekdüzeliği, tekrarlayan cümle başları, em dash yoğunluğu, "not only... but also" vb. Stil puanı 6 ve üstü yayını engeller |
| Şablon tekrarı | Aynı dildeki iki makale %30'dan fazla örtüşürse ikisi de engellenir |
| Yüksek risk | `risk: high` makale tam doğrulama (`reviewedAt`) olmadan çıkmaz, otomatik düzeltme sonrası tekrar insan onayı ister |
| E-E-A-T | Yazar ve editörün o dilde biyografisi olmalı; her sayfada yazar, onaylayan, son kontrol tarihi ve kaynak listesi görünür |

Ayrıca: 3'ten az biyografisi olan kategori sayfaları noindex ve sitemap dışı, boş kategoriler hiç
üretilmez, arama sayfası indekslenmez.

## Komutlar

```bash
npm install
npm run admin        # yerel yönetim paneli: http://127.0.0.1:3000/admin
npm run check        # kalite raporu
npm run revise       # düzelt ve tekrar denetle döngüsü (ANTHROPIC_API_KEY gerekir)
npm run schedule -- --per-day 3
npm run new -- "Ad Soyad" athletes en,es,pt,de,fr
npm run readiness    # AdSense başvuru öncesi kontrol listesi
npm test && npm run typecheck
npm run build        # statik site -> out/
```

Yönetim paneli sadece senin bilgisayarında (`next dev`) çalışır ve dosyaları doğrudan düzenler;
yayın sitesinde panel yoktur, bu yüzden giriş/şifre derdi ve saldırı yüzeyi de yoktur. Panelde
yaptığın değişiklikleri commit edip pushladığında yayına çıkar.

## Klasörler

```
content/            içerik (kategoriler, editörler, kişiler)
docs/               stil rehberi ve işletim notları
prompts/            araştırma, taslak, yerelleştirme, doğrulama, düzeltme prompt'ları
scripts/            kalite kapısı, düzeltme döngüsü, planlama, IndexNow, hazırlık listesi
src/app/[locale]/   herkese açık site
src/app/admin/      yerel yönetim paneli (*.admin.tsx, sadece geliştirme modunda)
src/lib/            içerik okuma, şema, kalite, stil, SEO
tests/              birim testleri ve test için kurgusal içerik
```
