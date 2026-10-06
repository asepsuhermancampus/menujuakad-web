# Progres dan Ingatan Proyek Menuju Akad

## Cara melanjutkan sesi berikutnya

Baca file ini, `AGENTS.md`, `CHANGELOG.md`, dan bagian master spec yang terkait. Periksa file aktual sebelum bekerja. Lanjutkan task pertama yang belum selesai; jangan membuat ulang fondasi. Dokumen ini menjadi ingatan persisten di proyek dan harus diperbarui setiap increment. Tidak ada rahasia yang boleh disimpan di sini.

## Konteks tetap

- Workspace aktif: `/home/ubuntu/menujuakad`.
- Sumber utama: `MENUJU_AKAD_AGENT_MASTER_SPEC.txt` v1.0.
- Produk: undangan pernikahan digital premium, modular monolith Next.js App Router + TypeScript, Prisma/PostgreSQL Neon, Mayar, VPS `menujuakad.com`.
- Bahasa komunikasi, dokumen, dan UI: Bahasa Indonesia.
- Visual: ivory, olive/botanical, editorial; desain Figma terverifikasi mengungguli tampilan sementara.
- Cakupan jangka panjang tetap mencakup website publik, template, dashboard, editor, tamu/RSVP/ucapan/gift/analytics, billing/payment/QRIS/webhook/invoice/renewal, support, admin, resolver domain, dan produksi.

## Keputusan implementasi

- Repository awal kosong selain spesifikasi; dibuat scaffold baru tanpa mengubah `HariKita-Web`.
- Next.js 16.3.8, React 19.3.0, Prisma/client/adapter Neon 7.10.0; versi terkunci di lockfile. Prisma v8 release candidate tidak dipakai.
- Prisma 7 menggunakan `prisma.config.ts` dan adapter runtime Neon. Generate/validate/build tidak memerlukan database; migrasi nyata memerlukan DIRECT_URL.
- Model awal terbatas sembilan model inti; domain tambahan muncul bersama fitur masing-masing.
- Seed hanya template DRAFT internal, tanpa akun demo atau harga komersial buatan.
- Beranda hanya pengantar sementara. Belum dianggap selesai terhadap Figma, dan metadata sementara noindex.
- Belum ada route dashboard/admin atau mutasi customer sebelum auth tersedia.
- `/api/health/live` memeriksa liveness; `/api/health` mengembalikan 503 sampai database siap.

## Tahap aktif

Fondasi tahap pertama selesai dan tervalidasi lokal. Integrasi Neon dan desain Figma tetap terbuka sebagai pekerjaan tahap berikutnya.

- [x] Audit repository dan pelajari master spec.
- [x] Scaffold Next.js App Router, TypeScript, lint, format, Vitest, Playwright.
- [x] Panduan agent dan dokumentasi arsitektur/progres.
- [x] Primitive Button/Input/Card, ornamen SVG, beranda sementara, loading/error/404.
- [x] Schema Prisma 7 dan singleton adapter Neon.
- [x] Seed pengembangan idempoten berstatus DRAFT.
- [x] Validasi slug reserved dan endpoint health.
- [x] Migrasi SQL awal dibuat, dijalankan pada PostgreSQL terisolasi PGlite, dan diuji integritasnya.
- [x] Schema validation, typecheck, lint, 49 unit/integration test, production build lulus.
- [x] Enam pengujian browser desktop/mobile lulus dan screenshot lokal diperiksa.
- [x] Server standalone berjalan dengan public/static assets; default bind localhost.
- [ ] URL Neon tersedia, koneksi dan migrasi pengembangan terverifikasi.
- [ ] URL Figma tersedia, context/screenshot desain diperiksa.

## Roadmap berurutan

| Tahap | Target                                                                          | Status        |
| ----- | ------------------------------------------------------------------------------- | ------------- |
| 01    | Audit, panduan, docs, scaffold, primitive, schema, testing                      | Selesai lokal |
| 02    | Neon pengembangan, migrasi/seed nyata; auth + sesi + RBAC + ownership           | Belum mulai   |
| 03    | Inspeksi Figma, token/aset resmi, website publik + katalog/detail/demo template | Belum mulai   |
| 04    | Customer dashboard + pembuatan invitation                                       | Belum mulai   |
| 05    | Editor modular + autosave/preview + event/story/media                           | Belum mulai   |
| 06    | Guest management + token personal + RSVP + wishes                               | Belum mulai   |
| 07    | Gift configuration + analytics berorientasi tindakan                            | Belum mulai   |
| 08    | Billing, order, entitlement, coupon dan transisi status                         | Belum mulai   |
| 09    | Mayar + QRIS + webhook authenticity/idempotency + invoice + renewal             | Belum mulai   |
| 10    | Notifications + support + audit                                                 | Belum mulai   |
| 11    | Admin + monitoring pembayaran/rekonsiliasi/moderasi                             | Belum mulai   |
| 12    | Slug resolver + persiapan custom domain                                         | Belum mulai   |
| 13    | Audit VPS, deployment reproducible, migrasi produksi, DNS/HTTPS/health          | Belum mulai   |
| 14    | Verifikasi produksi, review arsitektur, docs final                              | Belum mulai   |

Fitur opsional premium tetap backlog: referral, favorite/comparison/quiz, AI writing, WhatsApp automation, QR check-in, seating, checklist/timeline, live streaming, guest photo/guestbook, dan memory mode. Skills proyek yang diminta bagian 73 master spec ditambahkan bertahap sesuai domain menggunakan panduan skill-creator; belum dibuat pada increment fondasi ini.

## Input eksternal dan batas verifikasi

- Figma MCP tersedia dan identitas akun diverifikasi; URL desain belum tersedia. Tidak ada hasil inspeksi desain yang diklaim.
- `.env.example` tersedia, tetapi DATABASE_URL/DIRECT_URL nyata belum diberikan dalam proyek. Jangan mencetak nilainya jika tersedia nanti.
- Metode auth/provider/email belum ditentukan. Pilih implementasi yang aman dan dokumentasikan sebelum membuat model provider.
- Paket/harga bisnis resmi belum tersedia; jangan mengarang harga penjualan.
- Kredensial sandbox Mayar dan mekanisme webhook resmi diperiksa pada tahap pembayaran.
- VPS/reverse proxy/DNS belum diaudit atau diubah. Remote Git sudah diatur; statusnya tercatat di bawah.

## Status Git dan publikasi repository

- Repository lokal telah diinisialisasi sesuai instruksi user.
- Branch aktif: `main`.
- Remote `origin`: `https://github.com/asepsuhermancampus/menujuakad.git`.
- Commit pertama: `3cb24f2`, pesan `first commit`, hanya berisi `README.md` sesuai perintah user.
- Identitas commit lokal: `asepsuhermancampus`, alamat noreply GitHub akun tersebut.
- Seluruh source fondasi, spesifikasi, migrasi, pengujian, konfigurasi, dan catatan progres disertakan dalam publikasi proyek atas instruksi user "unggah semuanya".
- Environment rahasia, node_modules, generated client Prisma, hasil build, log, dan hasil pengujian browser dikecualikan melalui `.gitignore`; `.env.example` tanpa nilai disertakan agar setup dapat diulang.
- `git push -u origin main` berhasil setelah autentikasi GitHub; branch lokal kini melacak `origin/main`.
- Publikasi README awal telah diverifikasi pada commit `3cb24f286feb9f87a4f30306cc2c1a0f0e7b3c66`; source fondasi ditambahkan melalui commit berikutnya.
- GitHub CLI resmi v2.102.0 telah dipasang di `/home/ubuntu/.local/share/menujuakad-tools/v2.102.0/bin/gh`; checksum unduhan telah diverifikasi.
- Login GitHub melalui browser berhasil dan akun `asepsuhermancampus` terverifikasi. Credential helper GitHub CLI diatur khusus repository ini; file kredensial dibatasi dengan permission 0600. Jangan menyimpan kode login atau token pada dokumen ini.
- Git init, first commit, dan push README telah selesai. Jangan mengulangnya. Pengembangan berikutnya menggunakan commit baru pada repository yang sama; verifikasi hash remote dan status working tree setelah setiap publikasi.

## Hasil pemeriksaan terakhir

Tanggal increment dan pemeriksaan: 7 Oktober 2026.

| Pemeriksaan            | Hasil                                                                                                                                                    |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run db:validate`  | Lulus; schema Prisma 7 valid.                                                                                                                            |
| `npm run typecheck`    | Lulus; generated client dan TypeScript strict.                                                                                                           |
| `npm run lint`         | Lulus tanpa error/warning ESLint.                                                                                                                        |
| `npm test`             | 49 test lulus pada 3 file; meliputi reserved slug, input tidak aman, health failure, SQL migration, slug collision, FK/membership, dan constraint paket. |
| `npm run build`        | Lulus; route `/`, 404, health, dan liveness dibangun. Aset disalin untuk standalone.                                                                     |
| `npm run test:e2e`     | 6 test lulus pada desktop Chromium dan Pixel 7; keyboard, responsive overflow, tautan, 404, health 200/503, header, dan ornamen SVG.                     |
| `npm run format:check` | Lulus.                                                                                                                                                   |
| Inspeksi visual        | Screenshot desktop dan mobile diperiksa; tampilan sementara terbaca dan tidak overflow. Belum dibandingkan dengan Figma.                                 |
| Neon/Mayar/produksi    | Belum diverifikasi dan belum diaktifkan.                                                                                                                 |

Migrasi SQL diuji dengan PostgreSQL WASM PGlite dalam proses test; hasil tersebut tidak menyatakan koneksi Neon terverifikasi. Schema engine CLI memerlukan datasource dalam konfigurasi untuk operasi diff; saat membuat SQL awal dari schema saja dipakai URL lokal nonaktif pada command tersebut, tanpa query ke layanan/database. Tidak ada URL buatan yang disimpan sebagai koneksi aplikasi.

## Langkah pertama ketika dilanjutkan

Kerjakan tahap 02: audit environment tanpa membuka rahasia, gunakan branch Neon pengembangan untuk migrasi dan seed bila URL sudah tersedia, lalu implementasikan auth/sesi dan pemeriksaan izin server beserta test IDOR. Jika input Neon belum tersedia, lanjutkan bagian auth yang dapat dikerjakan dan catat kebutuhan verifikasi eksternal; jangan mengulang tahap 01. Jika URL Figma tersedia, inspeksi desain dapat dilakukan sebelum tahap website publik dimulai.
