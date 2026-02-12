# Zihin Duellosu

Iki kisilik, gercek zamanli sayi tahmin oyunu (Bulls & Cows). Her oyuncu 4 basamakli, tekrarsiz gizli bir sayi secer ve sirayla rakibinin sayisini tahmin etmeye calisir.

## Nasil Oynanir?

1. Her iki oyuncu 4 basamakli, tekrarsiz bir sayi belirler (ornek: 1234)
2. Sirayla rakibin sayisini tahmin edersiniz
3. Her tahminde **Bull** ve **Cow** sonucu alirsiniz:
   - **Bull**: Dogru rakam, dogru pozisyon
   - **Cow**: Dogru rakam, yanlis pozisyon
4. Rakibin sayisini ilk bulan oyuncu kazanir

## Proje Yapisi

```
zihin-duellosu/
├── app/          # React Native (Expo) mobil uygulama
├── server/       # Node.js + Socket.IO sunucu
├── shared/       # Ortak tipler ve oyun mantigi
└── package.json  # Root workspace yapilandirmasi
```

Proje **npm workspaces** ile monorepo olarak yapilandirilmistir. `shared` paketi hem `app` hem de `server` tarafindan kullanilir.

---

## Kurulum

### Gereksinimler

- **Node.js** (v18 veya ustu)
- **npm** (Node ile birlikte gelir)
- **Expo Go** uygulamasi (telefonunuza App Store / Play Store'dan indirin)
- **localtunnel** (npm ile global kurulur, asagida aciklanmistir)

### 1. Projeyi Klonlayin

```bash
git clone https://github.com/oransalih/zihin-duellosu.git
cd zihin-duellosu
```

### 2. Bagimliliklari Yukleyin

Root dizinde tek komutla tum paketlerin (app, server, shared) bagimliliklari yuklenir:

```bash
npm install
```

### 3. localtunnel Kurun

Iki farkli cihazin (farkli aglardaki telefonlar) birbirine baglanabilmesi icin sunucuyu internete acmaniz gerekir. Bunun icin **localtunnel** kullaniyoruz:

```bash
npm install -g localtunnel
```

---

## Calistirma

### Hizli Baslangic (Tek Komut)

Projeyi tek komutla ayaga kaldirmak icin:

```bash
./start.sh
```

Bu script otomatik olarak:
1. Sunucuyu baslatir
2. Tunnel acar
3. `socket.ts` dosyasindaki URL'yi gunceller
4. Expo'yu tunnel modunda baslatir

QR kodu ekranda cikar. Telefonunuzdaki **Expo Go** ile tarayin.

Durdurmak icin: `Ctrl+C`

---

### Manuel Calistirma (3 Terminal)

Scripti kullanmak istemezseniz, 3 ayri terminal acin:

**Terminal 1 - Sunucu:**

```bash
cd server
npm run dev
```

**Terminal 2 - Tunnel:**

```bash
npx localtunnel --port 3000
```

Cikan URL'yi kopyalayin (ornek: `https://brave-dogs-fly.loca.lt`).

**Terminal 3 - Uygulama:**

`app/src/services/socket.ts` dosyasindaki `SERVER_URL` degerini tunnel URL'si ile degistirin:

```typescript
const SERVER_URL = 'https://brave-dogs-fly.loca.lt'; // <-- kendi tunnel URL'niz
```

Sonra:

```bash
cd app
npx expo start --tunnel
```

### Oynamaya Baslayin!

1. Iki telefonda da uygulamayi acin
2. Bir oyuncu **"Oda Olustur"** tiklasin ve verilen kodu diger oyuncuya gondersin
3. Diger oyuncu **"Odaya Katil"** tiklasin ve kodu girsin
4. Veya ikisi de **"Hizli Eslesme"** tiklasin

> **Not:** Tunnel URL'si her yeni `lt` komutu calistirildiginda degisir. `start.sh` kullaniyorsaniz otomatik guncellenir. Manuel calistiriyorsaniz `socket.ts` dosyasini guncellemeyi unutmayin.

> **Not:** Tunnel sayfasinda "Reminder" uyarisi cikarsa, "Click to Continue" butonuna basip devam edin. Uygulama bu uyariyi otomatik olarak bypass eder (`bypass-tunnel-reminder` header'i ile).

---

## Paket Aciklamalari

### Root Bagimliliklar (`package.json`)

| Paket | Aciklama |
|-------|----------|
| `expo` | React Native uygulamalarini kolayca gelistirmek, derlemek ve dagitmak icin kullanilan framework. Native kod yazmadan iOS ve Android uygulamasi olusturmayi saglar. |
| `expo-dev-client` | Gelistirme sirasinda ozel bir Expo istemcisi olusturur. Standart Expo Go yerine kendi native modullerinizi iceren bir gelistirme ortami saglar. |
| `expo-linking` | Uygulama icinde ve disinda deep link (derin baglanti) yonetimini saglar. URL'ler uzerinden uygulamanin belirli ekranlarini acmayi mumkun kilar. |
| `react` | Kullanici arayuzu olusturmak icin kullanilan JavaScript kutuphanesi. Bilesenleri (component) tanimlamak, state yonetimi ve render dongusu icin temel kutuphanedir. |
| `react-native` | React ile mobil uygulama gelistirmeyi saglayan framework. JavaScript ile yazilir ama native iOS/Android bilesenlerine donusturulur. |
| `react-native-safe-area-context` | Telefonun guvenli alan sinirlarini (notch, status bar, home indicator) yonetir. Icerigin bu alanlarla cakismasini onler. |
| `react-native-screens` | Ekran gecislerini native seviyede optimize eder. React Navigation ile birlikte kullanilarak daha performansli sayfa gecisleri saglar. |

### App Bagimliliklari (`app/package.json`)

| Paket | Aciklama |
|-------|----------|
| `@bull-cow/shared` | Projenin kendi shared paketi. Oyun tipleri, dogrulama fonksiyonlari ve oyun mantigi hem app hem server tarafindan ortaklanir. |
| `@react-navigation/native` | React Native icin navigasyon (sayfa gecis) sistemi. Ekranlar arasi gecis, geri gitme ve navigasyon state yonetimi saglar. |
| `@react-navigation/native-stack` | Native stack navigator. Ekranlari ust uste yigar (stack) ve native animasyonlarla gecis yapar. StartScreen -> SetupScreen -> GameScreen -> ResultScreen akisini yonetir. |
| `expo-status-bar` | Telefonun ust kismindaki durum cubugunu (saat, pil, sinyal) kontrol eder. Renk ve gorunurluk ayarlari yapilamasini saglar. |
| `socket.io-client` | Socket.IO istemci kutuphanesi. Sunucu ile gercek zamanli, iki yonlu iletisim kurar. Oyun sirasinda tahminler, tur degisimleri ve sonuclarin anlik iletilmesini saglar. |
| `zustand` | Hafif ve basit state yonetim kutuphanesi. Oyun durumu (baglanti, eslesme, tahminler, sonuc) merkezi bir store'da tutulur. Redux'a alternatif, daha az kod ile ayni isi yapar. |

| Dev Paket | Aciklama |
|-----------|----------|
| `@types/react` | React icin TypeScript tip tanimlari. Otomatik tamamlama ve tip kontrolu saglar. |
| `typescript` | JavaScript'e statik tip sistemi ekleyen dil. Hatalari derleme zamaninda yakalar, kod kalitesini arttirir. |

### Server Bagimliliklari (`server/package.json`)

| Paket | Aciklama |
|-------|----------|
| `@bull-cow/shared` | Ortak oyun mantigi ve tipler. Sunucu tarafinda tahmin degerlendirme ve girdi dogrulama icin kullanilir. |
| `socket.io` | Socket.IO sunucu kutuphanesi. WebSocket tabanli gercek zamanli iletisim saglar. Oyuncu baglantilari, oda yonetimi, eslesme ve oyun olaylari bu kutuphane uzerinden yonetilir. |

| Dev Paket | Aciklama |
|-----------|----------|
| `@types/node` | Node.js icin TypeScript tip tanimlari. `http`, `process` gibi Node API'leri icin tip destegi saglar. |
| `tsx` | TypeScript dosyalarini dogrudan calistiran arac. Derleme adimi olmadan `.ts` dosyalarini node ile calistirir. `watch` moduyla dosya degisikliklerinde otomatik yeniden baslatma saglar. |
| `typescript` | TypeScript derleyicisi. |

### Shared Bagimliliklari (`shared/package.json`)

| Dev Paket | Aciklama |
|-----------|----------|
| `typescript` | TypeScript derleyicisi. Shared paketi sadece tip tanimlamalari ve saf fonksiyonlar icerir, calisma zamani bagimliligi yoktur. |
