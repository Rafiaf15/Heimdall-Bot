# Polis Bot (Discord.js)

🛡️ Heimdall - The All-Seeing Guardian
Heimdall adalah bot moderasi Discord berbasis Node.js yang dirancang untuk menjaga integritas percakapan di dalam server. Terinspirasi dari sang penjaga gerbang Asgard, bot ini bekerja secara real-time untuk menyaring kata-kata negatif, konten toxic, dan menjaga komunitas tetap aman melalui sistem filter yang cerdas.

🚀 Fitur Utama
Real-time Profanity Filter: Mendeteksi dan menghapus pesan yang mengandung kata-kata kasar (Indonesia, Inggris, & Slang) secara instan.

Privacy-First Warnings: Memberikan peringatan kepada pelanggar secara halus tanpa mengganggu estetika channel utama.

Highly Configurable: Mendukung kustomisasi daftar kata terlarang, pengecualian channel (EXEMPT_CHANNELS), dan pengecualian peran (EXEMPT_ROLES).

Unit Tested: Logika pemfilteran divalidasi menggunakan node:test untuk memastikan akurasi deteksi (menghindari false positives).

Developer Friendly: Dibangun dengan discord.js v14 dan arsitektur kode yang bersih.

🛠️ Tech Stack
Runtime: Node.js

Library: discord.js

Testing: Native Node.js Test Runner

Environment: Dotenv for secure configuration

📋 Prasyarat
Sebelum menjalankan Heimdall, pastikan kamu memiliki:

Node.js v18.x atau lebih tinggi.

Discord Bot Token (didapat dari Discord Developer Portal).

Message Content Intent yang sudah diaktifkan di dashboard Discord.

## Setup

1. Install dependency:
   npm install
2. Salin env template lalu isi token:
   copy .env.example .env
3. Jalankan bot:
   npm start

## Persetujuan Channel Moderasi

Moderasi tidak langsung aktif di semua channel. Admin/moderator harus memilih channel yang diizinkan:


 Izin default command: Manage Server. Anda juga bisa menambah role approver via APPROVER_ROLE_IDS di .env.

## Validasi

  npm run check:config
  npm test
  npm run validate:bot

## Struktur

- src/index.js: listener Discord dan alur moderasi
- src/moderation.js: exact token matching
- src/guild-settings.js: penyimpanan channel moderasi per server
- data/negative-words.json: daftar kata negatif per bahasa/kategori
- data/guild-settings.json: daftar channel moderasi per guild
- test/moderation.test.js: test engine moderasi
- .github/hooks/discord-moderation-validation.json: hook validasi otomatis
