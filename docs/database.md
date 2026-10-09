# Database Menuju Akad

## Neon preproduction terhubung — 8 Oktober 2026

Database `menujuakad-preproduction` pada endpoint user di AWS Ohio (`us-east-2`) sudah terhubung ke rilis frontend publik. URL direct diturunkan dari endpoint pooled yang sama tanpa `-pooler`, lalu kedua koneksi diverifikasi. Tidak memindahkan region atau mengganti database user.

- Hasil impor: sembilan tabel ada; Prisma migrate diff kosong/exit0; empat CHECK harga/durasi/currency/usageCount cocok. Baseline `20261007000000_foundation` dicatat sekali dengan `prisma migrate resolve`; migrate status up-to-date dan preflight memverifikasi checksum. Tidak mengulang CREATE TABLE, reset, seed, mengubah data bisnis atau menjalankan migrasi destruktif.
- Memperbaiki preflight metadata dengan `table_name::text`; tipe PostgreSQL `name` sebelumnya ditolak deserializer Prisma. Probe live sebelum koreksi gagal pada metadata; setelah cast seluruh preflight lulus.
- Runtime memakai role baru `menujuakad_runtime_preproduction` dengan password acak server, CONNECT/USAGE/SELECT hanya sembilan tabel fondasi. Tidak memiliki INSERT/CREATE schema, SUPERUSER, CREATEDB, CREATEROLE, REPLICATION atau BYPASSRLS. Izin tulis dan akses model baru ditambahkan sesuai kebutuhan saat fitur backend teruji, bukan membuka seluruh izin sekarang.
- Pooled runtime URL berada di `/etc/menujuakad/runtime.env` root0600 dalam direktori root0700; overlay Compose sudah dipasang. `.env` lokal privat0600/diabaikan Git memuat pooled role runtime dan DIRECT_URL owner untuk tooling. Container tidak memuat DIRECT_URL dan tetap menggunakan image frontend `preview-20261008`. Pembaruan layanan harus memakai dua berkas Compose dan `--env-file /srv/menujuakad/deploy/release.env` seperti panduan di bawah.
- `/api/health` publik200 dengan database `ok`; liveness200,12smoke browser desktop/mobile lulus, guard dashboard/admin tetap login,239unit/17file dan typecheck/lint lulus. Runtime source tidak diubah sehingga tidak rebuild/redeploy image. Breadwinner200 dan container HariKita tetap sehat.
- Password owner sempat diberikan melalui chat. Agent tidak mencatat nilainya pada source/dokumen/log dan belum mengubah password owner karena dapat dipakai konsumen lain. Pengelola perlu reset password `neondb_owner` di Neon dan memperbarui **DIRECT_URL** pada `.env` melalui editor server, bukan chat. Password role runtime dibuat terpisah dan tidak dikirim di chat, sehingga reset owner tidak perlu mengganti koneksi runtime ini. Pemindaian secret aktif pada seluruh tracked/untracked source nonignored menemukan nol kecocokan; duplikat staging runtime dihapus.
- Restore database/backup data bisnis belum diuji. Ini koneksi preproduction untuk frontend preview; auth/sesi, CRUD/editor persistence, storage, email dan Mayar belum diaktifkan. `GET /api/health` tetap probe SELECT1; status200 tidak menggantikan pemeriksaan izin/schema/integrasi fitur.

## Persiapan backend dan Neon — 8 Oktober 2026

User mengizinkan persiapan backend setelah frontend diterbitkan. Increment ini menyiapkan impor database, pemeriksaan koneksi dan rencana integrasi; tidak membuka rute private atau mengaktifkan provider tanpa sesi terverifikasi. Sembilan model fondasi dan migrasi existing dipertahankan. SQL adalah struktur awal database, bukan seluruh backend/platform dan tidak memuat data fixture/customer/harga komersial.

Tool baru:

| Perintah / berkas                            | Tanggung jawab dan batas                                                                                                                                                                    |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run db:export:neon`                     | Menghasilkan SQL transaksi + manifest checksum + petunjuk ke `/tmp/menujuakad-neon-import`; tanpa koneksi DB/kredensial. Khusus satu migrasi fondasi; menolak overwrite dan output di repo. |
| `npm run db:preflight:neon -- --config-only` | Memvalidasi format Neon, SSL wajib, pooled/direct dan endpoint/database sama; tanpa query.                                                                                                  |
| `npm run db:preflight:neon`                  | Probe read-only pooled dan direct; direct memeriksa sembilan tabel dan checksum riwayat fondasi. Tidak membuktikan seluruh migrasi masa depan/schema drift atau auth bisnis siap.           |
| `deploy/compose.neon.yaml`                   | Overlay aktif untuk membaca hanya pooled `DATABASE_URL` role runtime dari file privat di luar repo.                                                                                         |

Paket yang telah dibuat: `/tmp/menujuakad-neon-import/menujuakad-neon-foundation.sql`, `manifest.json`, `LEEME.md`; arsip `/tmp/menujuakad-neon-import.tar.gz`. Migration SHA256 `791ede2bc7c01c4e9358dd050b64dc7ff15a016cc297c2bd58c775435208fed7`; SQL import SHA256 `365f9fbb9fa3a6c384888b4154922232b0154b1a0c6e3aabfb0ae91efed3a68d`. Tidak mengubah migrasi canonical demi impor manual.

## Pengaturan yang dilakukan di Neon

1. Buat project **menujuakad**. Pilih **AWS Asia Pacific (Singapore)** sebagai pilihan awal kawasan Asia, dan versi PostgreSQL default yang didukung Neon. Ukur latensi koneksi dari VPS ketika endpoint tersedia sebelum mengunci keputusan operasional jangka panjang.
2. Aktifkan **Postgres database**. Neon Auth, Data API, Functions dan AI Gateway tidak diperlukan oleh fondasi Prisma ini. Neon Auth bukan sesi aplikasi yang otomatis terhubung.
3. Gunakan database **menujuakad** atau default **neondb**; nama tidak wajib diganti selama kedua URL menunjuk database yang sama. Role owner bawaan dapat dipakai untuk migrasi awal branch pengembangan. Role runtime dengan izin terbatas disiapkan sebelum operasi customer nyata; hak runtime hanya sesuai tabel/operasi yang dibutuhkan. Jangan mengubah ownership default sekarang tanpa kebutuhan.
4. Pertahankan branch default sebagai calon produksi. Buat branch **development** dari parent yang masih kosong, dan kerjakan migrasi awal di branch development. Setelah produksi berisi data pribadi, jangan mengkloning datanya ke pengembangan tanpa kebutuhan dan pengamanan; gunakan branch schema-only atau data sintetis sesuai fasilitas Neon.
5. Pada **Connect**, pilih branch development, database dan role yang benar. Salin URL dengan **Connection pooling ON** ke `DATABASE_URL`; salin URL dengan pooling **OFF** ke `DIRECT_URL`. Host runtime mengandung `-pooler`; direct tidak. Pertahankan `sslmode=require` dan parameter lain yang diberikan Neon, termasuk `channel_binding=require` bila ada.
6. Simpan kedua nilai hanya dalam `.env` lokal yang diabaikan Git dan permission terbatas. Jangan menempelkan connection string ke chat atau dokumentasi. Isi `.env.example` tidak memuat nilai rahasia. Environment development dan produksi memakai URL branch masing-masing, tidak berbagi target secara tidak sengaja.
7. Untuk pengembangan, mulai dari compute kecil sesuai paket dan scale-to-zero bila tersedia. Pantau cold-start terhadap timeout aplikasi lima detik; jangan menganggap autosuspend cocok untuk seluruh traffic produksi tanpa pengujian. Atur batas pengeluaran/history restore sesuai paket; uji pemulihan sebelum menyimpan data produksi penting. Fasilitas dan batas berbeda menurut plan Neon.
8. Jika memakai IP Allow pada plan yang mendukungnya, izinkan IP egress VPS **43.173.15.136** dan lokasi migrasi yang sah. Tidak perlu membuka PostgreSQL pada VPS atau menambahkan record DNS baru ke DomaiNesia untuk koneksi Neon.

## Pilihan utama: migrasi Prisma

Tidak perlu upload SQL jika memakai jalur ini. Prisma menerapkan struktur sekaligus mencatat `_prisma_migrations`, sehingga pemeliharaan berikutnya lebih mudah.

Dari `/home/ubuntu/menujuakad-web`, setelah `.env` diisi untuk **development**:

```bash
npm run db:validate
npm run db:preflight:neon -- --config-only
npm run db:deploy
npx prisma migrate status
npm run db:preflight:neon
npm run db:seed
npm run db:seed
```

Seed hanya satu template DRAFT internal. Jalankan dua kali untuk memeriksa idempotensi ketika koneksi nyata tersedia; jangan seed produksi. `db:deploy` pada branch kosong lebih tepat daripada `db push` karena riwayat migrasi existing sudah tersedia. Tidak ada reset database atau migrasi destruktif yang diperlukan.

## Alternatif: impor SQL melalui Neon SQL Editor

Jalur ini ditujukan jika user ingin membuat tabel dari browser:

1. Pilih project, **branch development** dan database target kosong di **Postgres database → SQL Editor**.
2. Buka `menujuakad-neon-foundation.sql`, tempel **seluruh isi** dan klik **Run** sekali. Tidak perlu membuat tabel satu per satu. Jangan memakai bantuan AI untuk mengubah SQL migrasi tanpa review. File sudah memuat transaksi dan menolak public schema yang mempunyai tabel/enum; bila query gagal pada koneksi yang sama, jalankan `ROLLBACK` sebelum mencoba ulang.
3. Pastikan sembilan tabel muncul pada Tables. Lakukan pemeriksaan schema read-only dari repository dengan URL direct ke target yang sama:

```bash
npm run db:preflight:neon -- --config-only
npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --exit-code
```

Diff harus kosong/exit0. Diff Prisma tidak memeriksa semua fitur SQL seperti CHECK; pastikan empat constraint berikut ada dengan query read-only SQL Editor:

```sql
SELECT conname
FROM pg_constraint
WHERE conname IN (
  'Package_price_nonnegative', 'Package_duration_positive',
  'Package_currency_idr', 'Template_usageCount_nonnegative'
)
ORDER BY conname;
```

Empat baris harus muncul. Setelah hasil sesuai, baseline riwayat fondasi yang sudah diterapkan:

```bash
npx prisma migrate resolve --applied 20261007000000_foundation
npx prisma migrate status
npm run db:preflight:neon
```

`migrate resolve` mencatat riwayat, tidak menjalankan ulang CREATE TABLE. Jangan baseline migrasi yang gagal/parsial. Jangan menjalankan SQL manual lalu `db:deploy` tanpa baseline; Prisma akan menganggap migrasi belum diterapkan. Untuk perubahan schema berikutnya, selalu gunakan migrasi Prisma dari repository, bukan mengedit tabel produksi langsung di editor.

Untuk ekspor ulang, pilih folder baru agar paket existing tidak ditimpa:

```bash
npm run db:export:neon -- /tmp/menujuakad-neon-import-lanjutan
```

Untuk database PostgreSQL existing yang sudah berisi data nyata, jalurnya berbeda: audit lalu `pg_dump`/`pg_restore` melalui direct URL. Tidak ada database bisnis existing yang telah ditemukan untuk dipindahkan pada increment ini.

## Menghubungkan Neon ke container setelah validasi

Overlay telah diterapkan untuk database preproduction user. Untuk environment produksi komersial berikutnya, validasi branch development lebih dahulu, kemudian terapkan migrasi yang sama ke branch produksi dengan URL produksi yang diverifikasi dan strategi pemulihan. Hindari membuat produksi sebagai kloning branch yang telah di-seed dengan data development.

Di VPS, simpan **hanya DATABASE_URL pooled produksi** pada `/etc/menujuakad/runtime.env` dengan pemilik root dan permission0600. `DIRECT_URL`, kredensial OAuth dan provider lain mempunyai penyimpanan server terpisah sesuai domain; direct URL tidak dikirim ke browser atau dimasukkan ke image. CLI migrasi tetap dijalankan dari environment migrasi aman, bukan container runtime yang tidak membawa Prisma CLI.

Overlay dipasang dan dijalankan sesudah file rahasia tersedia:

```bash
sudo install -d -m 0700 /etc/menujuakad
sudo install -m 0644 deploy/compose.neon.yaml /srv/menujuakad/deploy/compose.neon.yaml
sudo docker compose --env-file /srv/menujuakad/deploy/release.env \
  -f /srv/menujuakad/deploy/compose.yaml \
  -f /srv/menujuakad/deploy/compose.neon.yaml config --quiet
sudo docker compose --env-file /srv/menujuakad/deploy/release.env \
  -f /srv/menujuakad/deploy/compose.yaml \
  -f /srv/menujuakad/deploy/compose.neon.yaml up -d --wait
```

`install -d` tidak membuat file runtime; pengelola memasukkan nilai melalui editor/kanal aman. Jangan menjalankan `docker compose config` tanpa `--quiet` atau mencetak environment/container inspect lengkap karena dapat menampilkan secret. Gunakan kedua berkas Compose yang sama pada pembaruan berikutnya agar konfigurasi DB tetap dipakai. Rollback konfigurasi DB memakai Compose frontend existing tanpa overlay, lalu validasi layanan; ini tidak mengembalikan perubahan data/schema.

Setelah query nyata berhasil, `/api/health` dapat200. Endpoint health aplikasi saat ini hanya melakukan SELECT1, jadi tetap jalankan preflight/migrate status untuk pemeriksaan schema. Menghubungkan DB tidak mengaktifkan Google/login atau membuka dashboard/admin; guard sesi tetap fail-closed.

## Urutan implementasi backend sesudah koneksi

| Urutan | Increment dan batas selesai                                                                                                                                                                                                  |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1      | Neon development/produksi, migrasi tercatat, preflight dan pemulihan teruji; runtime env terhubung.                                                                                                                          |
| 2      | Auth Google, akun/sesi terverifikasi, status user dan role dari server; model auth/sesi mengikuti provider yang dipilih. OAuth client/callback, AUTH_SECRET dan email provider untuk alur email dipersiapkan pada tahap ini. |
| 3      | Query katalog/paket dan CRUD undangan draft; ownership/membership diperiksa server, slug collision ditangani transaksi/constraint.                                                                                           |
| 4      | Persist editor, profil/section/acara/media; schema validasi, autosave/conflict dan storage terpisah.                                                                                                                         |
| 5      | Tamu, RSVP, ucapan dan hadiah deklaratif; token undangan, pembatasan abuse dan izin moderasi.                                                                                                                                |
| 6      | Mayar order/payment/webhook/invoice; nominal integer IDR, verifikasi provider server dan idempotensi sebelum aktivasi undangan.                                                                                              |
| 7      | Admin, support, analytics/audit dan operasional sesuai fitur; SUPERADMIN diverifikasi setiap operasi.                                                                                                                        |

Tabel domain tambahan dibuat bersamaan dengan fitur yang memakainya. Jangan mengimpor seluruh fixture preview menjadi data produksi atau mengklaim sembilan tabel fondasi sebagai schema platform lengkap. Media/foto bukan BLOB database default; storage object dipersiapkan terpisah. Sebelum auth/provider dipilih, callback dan format model sesi belum dikunci; jangan menebak bahwa menyalakan Neon Auth langsung menggantikan auth aplikasi.

## Hasil validasi dan pekerjaan terbuka

- Schema Prisma valid; typecheck/lint dan build produksi lulus. Suite239unit/17file lulus, termasuk12kasus persiapan Neon. SQL hasil ekspor membuat sembilan tabel dan mempertahankan constraint keuangan pada PostgreSQL terisolasi PGlite; schema public berisi tabel ditolak dan datanya tetap utuh.
- CLI tanpa environment menolak dengan pesan nama variabel, bukan URL. Config-only memakai URL sintetis lulus tanpa koneksi. Ekspor ulang menolak overwrite, dan checksum SQL cocok dengan manifest. Overlay Compose tervalidasi dengan `--no-env-resolution --quiet`; file runtime rahasia belum tersedia dan overlay belum diterapkan.
- Koneksi/baseline/preflight Neon nyata sekarang lulus sesuai status terbaru di awal dokumen; tidak menjalankan seed. Role runtime preproduction terbatas baca. Restore/backups, role/DML produksi, auth/OAuth/email/storage/Mayar, API domain dan schema lanjutan tetap pekerjaan increment berikutnya.
- Source runtime/route UI tidak berubah, sehingga E2E UI tidak diulang untuk tooling ini. Rilis Docker frontend existing tetap sehat; `.next` build lokal baru bukan deployment backend.

## Referensi resmi saat persiapan

Dibaca 8 Oktober 2026:

- [Proyek Neon](https://neon.com/docs/manage/projects)
- [Region Neon](https://neon.com/docs/introduction/regions)
- [Branching](https://neon.com/docs/introduction/branching)
- [Pooled dan direct](https://neon.com/docs/connect/connection-pooling)
- [SQL Editor](https://neon.com/docs/get-started/query-with-neon-sql-editor)
- [Baseline Prisma 7](https://www.prisma.io/docs/orm/prisma-migrate/workflows/baselining)
- [pg_dump/pg_restore](https://neon.com/docs/import/import-from-postgres)

## Konfigurasi Prisma 7 dan Neon

Schema berada di `prisma/schema.prisma`; generator `prisma-client` menulis ke `src/generated/prisma`. `prisma.config.ts` mengatur schema, direktori migrasi, seed, dan `DIRECT_URL`. URL datasource tidak ditulis di schema dengan format Prisma 6.

Runtime memakai `DATABASE_URL` pooled melalui `@prisma/adapter-neon`; singleton lazily dibuat di `src/server/db/client.ts`. Pool dibatasi lima koneksi dengan timeout koneksi/query lima detik. Setel nilai ini kembali sesuai kapasitas Neon dan pola beban ketika traffic nyata tersedia.

Generate, format, validate, dan build dapat berjalan tanpa URL. Perintah migrasi dan seed memerlukan `DIRECT_URL` yang nyata. Jangan menggunakan placeholder untuk berpura-pura koneksi tersedia.

Referensi resmi yang diperiksa saat fondasi:

- https://www.prisma.io/docs/orm/overview/databases/neon
- https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7

## Model awal

| Model             | Tanggung jawab dan constraint utama                                                                                   |
| ----------------- | --------------------------------------------------------------------------------------------------------------------- |
| User              | Akun, email/phone opsional unique, role CLIENT/SUPERADMIN, status ACTIVE/SUSPENDED. Auth multimethod aktif.           |
| Template          | Slug unique, status DRAFT/PUBLISHED/HIDDEN/ARCHIVED, metadata visual opsional.                                        |
| TemplateFeature   | Primary key gabungan template + featureKey.                                                                           |
| Package           | Slug unique, harga integer IDR, durasi, status; belum ada harga komersial yang di-seed.                               |
| PackageFeature    | Primary key gabungan paket + featureKey.                                                                              |
| Invitation        | Owner, template, slug global unique, status, tanggal pernikahan, timezone, masa aktif dan publikasi.                  |
| InvitationMember  | Satu membership per invitation + user; role OWNER/EDITOR/VIEWER. Undangan kolaborasi melalui email ditambahkan nanti. |
| CoupleProfile     | Profil mempelai 1:1 per invitation.                                                                                   |
| InvitationSection | Konfigurasi presentasi JSON dan urutan bagian per invitation.                                                         |

Tanggal pernikahan memakai `Date`; timestamp memakai `Timestamptz(3)`. Default timezone undangan `Asia/Jakarta` tetap dapat dikonfigurasi. Relasi owner dan template memakai `Restrict` agar penghapusan tidak menghapus undangan diam-diam. Child configuration memakai `Cascade` untuk konsistensi bila penghapusan undangan kelak memang diotorisasi; lifecycle normal menggunakan status arsip.

## Indeks dan integritas

- Email user dan slug memiliki unique index otomatis; tidak ditambah index duplikat.
- `Invitation(ownerUserId, createdAt)` mendukung daftar undangan akun berurutan waktu.
- `Invitation(status, expiresAt)` mendukung pemeriksaan lifecycle/expiry.
- `InvitationMember(userId)` mendukung pencarian undangan kolaborator.
- `InvitationSection(invitationId, sortOrder)` mendukung pembacaan editor terurut.
- Migrasi awal menambahkan check harga tidak negatif, currency IDR, durasi positif, dan usageCount template tidak negatif. Check SQL harus dipertahankan pada migrasi berikutnya karena tidak dinyatakan langsung dalam schema Prisma.

Layanan auth nanti menormalisasi email secara konsisten dan menangani collision. Layanan undangan memakai validasi slug terpusat serta unique constraint database; tidak boleh hanya melakukan check lalu insert tanpa menangani konflik.

## Migrasi dan seed

Migrasi awal dihasilkan dari empty schema untuk **database proyek baru**, bukan baseline untuk database lain yang sudah berisi tabel. Jangan menerapkannya ke `HariKita-Web` atau database aktif tanpa audit.

```bash
npm run db:validate
npm run db:generate
npm run db:deploy
npm run db:seed
```

Seed menambah satu template pengembangan berstatus DRAFT, tidak membuat user/password/harga paket, dan tidak menimpa data existing saat dijalankan ulang. Seed ditolak pada `NODE_ENV=production`.

SQL migrasi awal sudah dijalankan pada PostgreSQL terisolasi PGlite melalui integration test. Unique slug, foreign key yang melindungi owner/template, membership unik, constraint harga/currency/durasi, dan penyimpanan nominal integer telah diuji. Ini tidak menggantikan pengujian adapter/koneksi Neon.

Belum ada migrasi yang diterapkan ke Neon. Saat URL branch pengembangan tersedia: verifikasi target → deploy migrasi → seed dua kali untuk memeriksa idempotensi → probe health → catat hasil. Jangan menandai koneksi selesai sebelum query nyata berhasil.

## Penyederhanaan role menjadi CLIENT dan SUPERADMIN — 10 Oktober 2026

Tujuh migrasi sudah diterapkan ke Neon `menujuakad-preproduction` (`migrate status` up to date, `migrate diff` tanpa drift). Migrasi terakhir `20261010000000_role_client_superadmin` menyederhanakan `UserRole` menjadi **hanya `CLIENT` dan `SUPERADMIN`**:

- `CUSTOMER` dan `CLIENT` digabung menjadi `CLIENT`; `VENDOR` dihapus karena tidak dipakai. Default kolom tetap `CLIENT`.
- PostgreSQL tidak mendukung `ALTER TYPE ... DROP VALUE`, sehingga migrasi membuat ulang tipe enum dan memindahkan kolom melalui kolom sementara bertipe teks (bukan `ALTER TYPE` in-place). Pemetaan bersifat aditif: tidak ada baris atau relasi bisnis yang dihapus.
- Migrasi juga membuat ulang fungsi/trigger `auth_guard_runtime_registration`, karena keduanya merujuk nama tipe lama. Trigger tetap menolak `SUPERADMIN` dari role runtime.
- **Pelajaran penting:** `ALTER TABLE ... DROP COLUMN` dan `DROP TYPE` **menghapus grant kolom** di PostgreSQL. Setelah migrasi ini grant runtime harus **diterapkan ulang** (`scripts/database/apply-auth-grants.ts`), jika tidak login akan gagal dengan `permission denied for table User`. Jalankan verifikasi `scripts/database/verify-auth-runtime-grants.ts` sesudah setiap migrasi yang menyentuh kolom `User`.
- Image lama yang masih memakai `role IN ('CUSTOMER','CLIENT')` **tidak kompatibel** dengan enum baru (`invalid input value for enum "UserRole": "CUSTOMER"`). Migrasi enum wajib diikuti penerbitan image baru; rilis `preview-20261010-roles` melakukannya.
- Rute `/vendor` dihapus total (bukan dialihkan) dan tidak lagi menjadi target redirect yang sah. Halaman `/account` serta `/account/security` tetap berlaku untuk kedua role.

## Ekspansi per domain

Tahap auth menambahkan model provider/sesi yang diperlukan; editor menambahkan Event, StoryItem, MediaAsset; tamu menambahkan Guest, GuestInvitation, RsvpResponse, Wish, GuestPhoto; gift dan analytics menambahkan GiftMethod/AnalyticsEvent. Billing menambahkan Order, OrderItem, Payment, PaymentWebhookEvent, Invoice, Refund, Entitlement, Coupon dan redemption. Selanjutnya Notification, Support, Referral, AuditLog, CustomDomain, FeatureFlag dan SystemSetting sesuai kebutuhan.

Data pribadi tidak dimasukkan ke analytics tanpa kebutuhan. Financial history dan invoice memakai snapshot; perubahan finansial diutamakan append-only. Migrasi produksi membutuhkan backup/restore yang telah diuji dan strategi perubahan kompatibel.
