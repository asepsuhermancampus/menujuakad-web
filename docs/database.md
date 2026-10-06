# Database Menuju Akad

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
| User              | Akun, email unique, role CUSTOMER/SUPERADMIN, status ACTIVE/SUSPENDED. Auth belum diimplementasikan.                  |
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

## Ekspansi per domain

Tahap auth menambahkan model provider/sesi yang diperlukan; editor menambahkan Event, StoryItem, MediaAsset; tamu menambahkan Guest, GuestInvitation, RsvpResponse, Wish, GuestPhoto; gift dan analytics menambahkan GiftMethod/AnalyticsEvent. Billing menambahkan Order, OrderItem, Payment, PaymentWebhookEvent, Invoice, Refund, Entitlement, Coupon dan redemption. Selanjutnya Notification, Support, Referral, AuditLog, CustomDomain, FeatureFlag dan SystemSetting sesuai kebutuhan.

Data pribadi tidak dimasukkan ke analytics tanpa kebutuhan. Financial history dan invoice memakai snapshot; perubahan finansial diutamakan append-only. Migrasi produksi membutuhkan backup/restore yang telah diuji dan strategi perubahan kompatibel.
