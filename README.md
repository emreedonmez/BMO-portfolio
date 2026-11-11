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

- Odada basılı tutup sürükleme: yatayda sınırsız 360° dönüş, yukarı/aşağı bakış. Tek parmakla da çalışır.
- Fare tekerleği / iki parmakla açma-kapama: yakınlaşma ve uzaklaşma.
- Odada klavye okları: açıyı değiştir; Home / “Home view”: ilk görünümü geri getir.
- BMO'ya veya “Meet BMO” düğmesine tıklama: ekrana yaklaş.
- Portfolyo açıkken sarı yön tuşu / klavye okları: seçimi değiştir veya metni kaydır.
- Kırmızı yuvarlak / Enter: seç.
- Yeşil yuvarlak / Escape: geri.
- Mavi üçgen / “Room”: odaya dön.
- Küçük mavi tuş / Sound: sesi aç veya kapat.
- Ekran menüsü fare ve dokunmayla da çalışır. Mobilde ek kontrol düğmeleri bulunur.
- “Room” ile dönünce gezdiğiniz açı ve yakınlık korunur. Kamera mobilyaların üzerinden geçerek seçilen uzaklığı korur.
- Portfolyo içindeki metinler parmakla kaydırılır; oda sürüklemesi bu sırada devre dışıdır. Yatay telefonda ekran odaklı yakınlaşma kullanılır.
- Hareket azaltma tercihi açıkken kamera geçişi anında gerçekleşir.
- WebGL desteklenmezse metin portfolyosu açılır.

## Dosyalar

`src/scene.js`: düz renkli toon malzemeler, ince konturlar ve gövdeye yakın tuşlarla BMO geometrisi.

`src/bmo-layout.js`: ortak tuş düzlemi, model ölçüleri ve küçük BMO’nun sahne yerleşimi.

`src/room.js`: gerçek 3D oda, özel cel shader, vektör ahşap damarları, kıvrımlı mobilyalar ve gramofon.

`references/treehouse-room.png`: yalnızca tasarım referansı; üretim klasörüne kopyalanmaz ve site tarafından yüklenmez.

`src/main.js`: kamera, raycast tuşlar, ses ve CSS3D ekran.

`src/navigation.js`: ekran boyutuna uygun yakın kamera ve BMO'nun içinden geçmeyen küresel kamera yolu.

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
node scripts/orbit-check.mjs
```

Render kontrolleri Windows üzerinde Brave'in standart kurulum yolundaki izole bir headless test profiliyle çalışır; kullanıcının açık tarayıcısına bağlanmaz. Farklı bilgisayarda scriptlerdeki `executablePath` değerini kendi Chromium tarayıcınıza göre ayarlayın. `artifacts/` yerel test çıktılarıdır ve Git'e yüklenmez.

Telefon, tablet, yatay ekran, masaüstü ve geniş ekran boyutları; gerçek pointer/touch olaylarıyla sürükleme, pinch, iptal ve metin kaydırma kontrol edilir. Bunlar tarayıcı emülasyonudur; fiziksel telefonun kare hızı, Safari adres çubuğu ve donanım dokunma hissi ölçülmemiştir.

## Eski sürüme dönüş

360° gezintiden hemen önce beğenilen tam 3D oda: Cloudflare `3cf52e69-45b6-4d22-a81b-657d83f304ab`, Git etiketi `checkpoint-before-360-v1.2.0`, kaynak commit `0e0b8b61038498fae5a6c8aa7a56560dd9a645ee`.

```sh
npx wrangler rollback 3cf52e69-45b6-4d22-a81b-657d83f304ab
```

Windows'ta aynı işlem için `RESTORE_BEFORE_360.cmd` hazırdır. Cloudflare sürüm saklama süresine bağlıdır. Kalıcı tam yedek: masaüstünde `Portfolio-Backups/BMO-before-360-v1.2.0-2026-11-11.zip`. Bu ZIP'i ayrı klasöre açıp `DEPLOY_WINDOWS.cmd` çalıştırarak da önceki tam sürümü tekrar yayınlayabilirsiniz.

Daha eski, resimli oda sürümü `v1.1.0-cartoon` etiketinde; ilk retro konsol sitesi `legacy/` ve `Portfolio-Backups/Portfolio-before-BMO-2026-11-11.zip` içinde korunur.

## Kaynaklar ve lisanslar

BMO modeli bu proje için geometri koduyla oluşturuldu; oda da bu proje için geometri, shader ve vektör çizgileriyle modellenmiştir; araştırılan üçüncü taraf model dosyaları indirilmedi veya dağıtılmadı. BMO, Adventure Time karakteridir. Three.js ve font lisansları `public/` içinde korunmuştur.
