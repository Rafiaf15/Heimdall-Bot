# Polis Bot (Discord.js)

Bot Discord.js untuk memfilter kata negatif dari file JSON, menghapus pesan, dan memberi warning ke user.

## Setup

1. Install dependency:
   npm install
2. Salin env template lalu isi token:
   copy .env.example .env
3. Jalankan bot:
   npm start

## Validasi

- Cek format config:
  npm run check:config
- Jalankan test moderasi dasar:
  npm test
- Jalankan keduanya:
  npm run validate:bot

## Struktur

- src/index.js: listener Discord dan alur moderasi
- src/moderation.js: exact token matching
- data/negative-words.json: daftar kata negatif per bahasa/kategori
- test/moderation.test.js: test engine moderasi
- .github/hooks/discord-moderation-validation.json: hook validasi otomatis
