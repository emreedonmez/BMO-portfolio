# Emre's BMO Portfolio

Emre Dönmez'in Three.js ile hazırlanan etkileşimli 3D portfolyosu. Paylaşılan çizgi film karesi tam ekran arka plan olarak kullanılır; küçük BMO gerçek 3D modeldir. Model, görsel, font ve ekran yerel paketlenir. Üretimde dış CDN veya model servisi gerekmez.

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

- BMO'ya veya “Say hello to BMO” düğmesine tıklama: ekrana yaklaş.
- Sarı yön tuşu / klavye okları: seçimi değiştir veya metni kaydır.
- Kırmızı yuvarlak / Enter: seç.
- Yeşil yuvarlak / Escape: geri.
- Mavi üçgen / “The room”: odaya dön.
- Küçük mavi tuş / Sound: sesi aç veya kapat.
- Ekran menüsü fare ve dokunmayla da çalışır. Mobilde ek kontrol düğmeleri bulunur.
- Hareket azaltma tercihi açıkken kamera geçişi anında gerçekleşir.
- WebGL desteklenmezse metin portfolyosu açılır.

## Dosyalar

`src/scene.js`: düz renkli toon malzemeler, ince konturlar ve gövdeye yakın tuşlarla BMO geometrisi.

`src/bmo-layout.js`: ortak tuş düzlemi, model ölçüleri ve küçük BMO’nun sahne yerleşimi.

`public/treehouse-room.png`: kullanıcının verdiği oda görselinin değiştirilmemiş kopyası. Ekranı boşluk bırakmadan kaplar; farklı en-boy oranlarında kenarlar kırpılır.

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
```

Render kontrolleri Windows üzerinde Brave'in standart kurulum yolundaki izole bir headless test profiliyle çalışır; kullanıcının açık tarayıcısına bağlanmaz. Farklı bilgisayarda scriptlerdeki `executablePath` değerini kendi Chromium tarayıcınıza göre ayarlayın. `artifacts/` yerel test çıktılarıdır ve Git'e yüklenmez.

## Eski sürüme dönüş

Bu çizgi film sahnesinden önceki 3D diorama sürümü: `00b1e0f9-fd05-4fab-a09d-44802074a923`.

```sh
npx wrangler rollback 00b1e0f9-fd05-4fab-a09d-44802074a923
```

Cloudflare sürüm saklama süresine bağlıdır. Kalıcı kaynak yedeği `legacy/` ve masaüstündeki `Portfolio-Backups/Portfolio-before-BMO-2026-11-11.zip` içindedir. Eski siteyi bağımsız statik yayınlamak için `legacy/` içeriğini kullanın.

## Kaynaklar ve lisanslar

BMO modeli bu proje için geometri koduyla oluşturuldu; oda arka planı kullanıcının sağladığı çizimdir; araştırılan üçüncü taraf model dosyaları indirilmedi veya dağıtılmadı. BMO, Adventure Time karakteridir. Three.js ve font lisansları `public/` içinde korunmuştur.
