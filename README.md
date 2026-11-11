# Emre's BMO Portfolio

Emre Dönmez'in Three.js ile hazırlanan etkileşimli 3D portfolyosu. Tamamen yerel paketlenen model, oda, font ve ekran. Üretimde dış CDN veya model servisi gerekmez.

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

`src/scene.js`: kodla oluşturulmuş BMO ve oda geometrileri, ışık, dokular.

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

Yenilemeden önceki Cloudflare sürümü: `b5e648f8-dd3e-4172-bb04-5150a8062b48`.

```sh
npx wrangler rollback b5e648f8-dd3e-4172-bb04-5150a8062b48
```

Cloudflare sürüm saklama süresine bağlıdır. Kalıcı kaynak yedeği `legacy/` ve masaüstündeki `Portfolio-Backups/Portfolio-before-BMO-2026-11-11.zip` içindedir. Eski siteyi bağımsız statik yayınlamak için `legacy/` içeriğini kullanın.

## Kaynaklar ve lisanslar

Model ve oda bu proje için geometri koduyla oluşturuldu; araştırılan üçüncü taraf model dosyaları indirilmedi veya dağıtılmadı. BMO, Adventure Time karakteridir. Three.js ve font lisansları `public/` içinde korunmuştur.
