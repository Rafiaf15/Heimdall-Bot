---
name: Generate Negative Words by Language
description: "Generate daftar kata negatif per kategori bahasa untuk moderation bot Discord, siap dipakai di JSON config."
argument-hint: "Contoh: Bahasa Indonesia + English, kategori: harassment, insult, profanity, maksimal 30 kata per kategori."
agent: "agent"
---
Buat daftar kata negatif untuk moderasi Discord dalam format JSON yang kompatibel dengan [data/negative-words.json](../../data/negative-words.json).

Input user:
- Bahasa target
- Kategori per bahasa
- Jumlah kata per kategori
- Tingkat sensitivitas (ringan/sedang/ketat)

Aturan output:
1. Kembalikan hanya JSON valid.
2. Struktur wajib:
   {
     "defaultLanguage": "<kode_bahasa>",
     "languages": {
       "<kode_bahasa>": {
         "<kategori>": ["kata1", "kata2"]
       }
     }
   }
3. Hindari frasa multi-kata; prioritaskan token tunggal agar cocok dengan exact matching.
4. Hindari duplikasi kata lintas kategori.
5. Jangan masukkan kata yang ambigu dan terlalu umum.
