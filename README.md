# Emre's BMO Portfolio

Emre Dönmez'in Three.js ile hazırlanan etkileşimli 3D portfolyosu. Oda ve BMO aynı gerçek 3D sahne içinde çizilir. Koltuk, gramofon, ağaçlar, masa, pencere ve eşyalar ayrı geometrilerdir; oda arka plan resmi kullanılmaz. Beğenilen BMO modeli aynen korunmuştur. Geometri, malzeme, font ve ekran yerel paketlenir. Üretimde dış CDN veya model servisi gerekmez.

## Bilgisayarda açma

Node.js 22 veya üzeri gereklidir. Bu klasörde:

```sh
npm ci
npm run dev
```

Gösterilen localhost adresini açın. HTML dosyasına çift tıklayarak açmayın; JavaScript modülleri HTTP/HTTPS ister.

## Cloudflare'a aktarım

```sh
npx wrangler login
npm run deploy
```

`wrangler.jsonc`, mevcut `emreedonmez` Worker'ını ve `emreedonmez.com` / `www.emreedonmez.com` custom domainlerini kullanır. `npm run deploy` önce üretim dosyalarını `dist` içinde oluşturur, sonra Wrangler ile yükler. Gizli anahtar veya OAuth tokenı bu projede saklanmaz. Hosting hesabında oturum açmak gerekir.

Başka bir statik host için yalnızca `dist` içeriğini web köküne yükleyin. Kaynak dosyaları, `legacy`, testler ve belgeler public asset klasörünün dışındadır.

## Kontroller

- BMO'ya veya “Meet BMO” düğmesine tıklama: ekrana yaklaş.
- Sarı yön tuşu / klavye okları: seçimi değiştir veya metni kaydır.
- Kırmızı yuvarlak / Enter: seç.
- Yeşil yuvarlak / Escape: geri.
- Mavi üçgen / “Room”: odaya dön.
- Küçük mavi tuş / Sound: sesi aç veya kapat.
- Ekran menüsü fare ve dokunmayla da çalışır. Mobilde ek kontrol düğmeleri bulunur.
- Hareket azaltma tercihi açıkken kamera geçişi anında gerçekleşir.
- WebGL desteklenmezse metin portfolyosu açılır.

## Dosyalar

`src/scene.js`: düz renkli toon malzemeler, ince konturlar ve gövdeye yakın tuşlarla BMO geometrisi.

`src/bmo-layout.js`: ortak tuş düzlemi, model ölçüleri ve küçük BMO’nun sahne yerleşimi.

`src/room.js`: gerçek 3D oda, özel cel shader, vektör ahşap damarları, kıvrımlı mobilyalar ve gramofon.

`references/treehouse-room.png`: yalnızca tasarım referansı; üretim klasörüne kopyalanmaz ve site tarafından yüklenmez.

`src/main.js`: kamera, raycast tuşlar, ses ve CSS3D ekran.

`src/content.js` / `src/portfolio.js`: gerçek içerik ve menü yönetimi.

`public/ozgecmis.pdf`: sağlanan özgeçmişin değiştirilmemiş kopyası.

`legacy/`: önceki retro konsol sitesinin korunmuş dosyaları.

`DESIGN.md`: tasarım kararları ve araştırma kaynakları.

## Kontrol

```sh
npm run check
npm test
npm run build
# Ayrı terminalde npm run dev açıkken:
node scripts/render-check.mjs
node scripts/model-check.mjs
node scripts/room-check.mjs
```

Render kontrolleri Windows üzerinde Brave'in standart kurulum yolundaki izole bir headless test profiliyle çalışır; kullanıcının açık tarayıcısına bağlanmaz. Farklı bilgisayarda scriptlerdeki `executablePath` değerini kendi Chromium tarayıcınıza göre ayarlayın. `artifacts/` yerel test çıktılarıdır ve Git'e yüklenmez.

## Eski sürüme dönüş

Bu tam 3D odadan önceki, onaylı BMO ve resimli arka plan sürümü: `c3af8809-db94-4fab-96bc-3732d47aebbc`.

```sh
npx wrangler rollback c3af8809-db94-4fab-96bc-3732d47aebbc
```

Cloudflare sürüm saklama süresine bağlıdır. Kalıcı kaynak yedeği `legacy/` ve masaüstündeki `Portfolio-Backups/Portfolio-before-BMO-2026-11-11.zip` içindedir. Eski siteyi bağımsız statik yayınlamak için `legacy/` içeriğini kullanın.

## Kaynaklar ve lisanslar

BMO modeli bu proje için geometri koduyla oluşturuldu; oda da bu proje için geometri, shader ve vektör çizgileriyle modellenmiştir; araştırılan üçüncü taraf model dosyaları indirilmedi veya dağıtılmadı. BMO, Adventure Time karakteridir. Three.js ve font lisansları `public/` içinde korunmuştur.
