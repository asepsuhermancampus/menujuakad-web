# Seeder 30 Customer Dummy Menuju Akad

## Cakupan dan status

Seeder mandiri menambahkan **30 customer sintetis** pada cohort `journey01@menujuakad.test` sampai `journey30@menujuakad.test`. Sebelas akun auth seed lama tetap memakai implementasi dan manifest lama. Tidak ada perubahan schema, migrasi, routing, UI, konfigurasi runtime, atau seed lama.

**Kode tersedia; pengujian lokal sedang difinalisasi. Belum diterapkan ke Neon atau produksi.** Data sampai pembayaran selesai diwakili **APPROVED_TEST**, yaitu review pembayaran uji; bukan pembayaran komersial, entitlement, invoice, atau undangan aktif. Tidak ada panggilan Mayar, pemindahan dana, sesi login, atau token autentikasi dari seeder.

## Distribusi dan contoh akun

| Tahap | Akun | Jumlah | Data awal |
| --- | --- | ---: | --- |
| LOGIN_ONLY | journey01–journey06 | 6 | Credential dan riwayat login sintetis; nama/telepon kosong; tanpa undangan |
| PROFILE_ONLY | journey07–journey12 | 6 | Nama customer TEST; tanpa undangan |
| TEMPLATE_SELECTED | journey13–journey18 | 6 | Template internal dan slug privat; tanpa pasangan atau section |
| EDITOR_PARTIAL | journey19–journey24 | 6 | Draft, pasangan sebagian, sampul; variasi acara/cerita |
| PAYMENT_REQUESTED | journey25–journey27 | 3 | Editor lengkap; permintaan pembayaran uji REQUESTED |
| PAYMENT_APPROVED_TEST | journey28–journey29 | 2 | Editor lengkap; review uji APPROVED_TEST |
| PAYMENT_REJECTED | journey30 | 1 | Editor lengkap; review uji REJECTED |

Hasil seed awal: **30 User, 30 AuthCredential, 18 Invitation, 18 InvitationMember OWNER, 12 CoupleProfile, 35 InvitationSection, 6 PaymentTestRequest**. Template internal dapat dibuat satu kali apabila belum tersedia. Semua undangan **DRAFT, isPublished=false**, tanpa publishedAt atau tanggal aktivasi. Katalog pembayaran mengikuti server: `TEST_BASIC` Rp1.000, `TEST_STANDARD` Rp2.000, `TEST_PLUS` Rp3.000; masing-masing muncul dua kali.

Nama pasangan, judul, alamat, venue, cerita, dan referensi pembayaran diberi penanda TEST/contoh. Semua telepon null sehingga tidak meniru kontak nyata. Dua puluh akun memiliki emailVerifiedAt sintetis, sepuluh belum terverifikasi; status awal semua ACTIVE. lastLoginAt merupakan contoh historis, bukan bukti login nyata. Waktu pembuatan sintetis cohort adalah timestamp manifest dikurangi 60 hari; waktu login bervariasi 1–30 hari sebelum timestamp manifest. Acara bervariasi Januari–Juni 2027 dengan zona Asia/Jakarta, Asia/Makassar, Asia/Jayapura. Field JSON mengikuti schema strict editor yang tersedia.

## Tanggung jawab modul dan kontrak

- `scripts/database/seed-customer-journeys.ts`: entry point CLI, dry run default, guard sebelum koneksi, transaksi dan output ringkas tanpa rahasia.
- `scripts/database/customer-journey-config.ts`: opt-in dan validasi pasangan URL Neon; target wajib database `menujuakad-preproduction`.
- `scripts/database/customer-journey-fixtures.ts`: dataset serta distribusi; ID deterministik cohort dan slug unik.
- `scripts/database/customer-journey-manifest.ts`: manifest credential acak, validasi identitas dan penyimpanan privat; memakai `ensurePrivateDirectory` existing tanpa memodifikasinya.
- `scripts/database/customer-journey-validation.ts`: collision, provenance manifest, ownership/referensi dan reviewer existing.
- `scripts/database/customer-journey-data.ts`: insert fixture melalui kontrak `SeedDatabase.query` existing. Pemanggil **wajib** memberi satu transaksi. Password memakai scrypt modul auth yang sama; hash dibuat berurutan untuk membatasi penggunaan memori.
- `tests/database/customer-journey-guards.test.ts` dan `customer-journey-seed.test.ts`: pengujian CLI, filesystem, target dan PostgreSQL melalui PGlite dengan tiga migrasi existing.

Input apply berupa environment yang tervalidasi, manifest privat serta transaksi database. Output hanya ringkasan created/skipped; tidak mengembalikan credential melalui CLI. Status review menggunakan `admin@menujuakad.test` hanya jika existing SUPERADMIN ACTIVE dengan ID valid. Jika tidak tersedia, reviewedByUserId null; reviewedAt masih penanda fixture sintetis, bukan tindakan operator nyata. Seeder tidak membuat admin tambahan.

## Cara menjalankan

Dari `/home/ubuntu/menujuakad-web`, preview jumlah dan distribusi tanpa environment credential, koneksi database, atau file manifest:

```bash
node --import tsx scripts/database/seed-customer-journeys.ts
node --import tsx scripts/database/seed-customer-journeys.ts --dry-run
```

Untuk operator yang nanti menerapkan seed, sediakan `DATABASE_URL` pooled dan `DIRECT_URL` direct melalui environment privat yang sudah dikelola. Kedua URL harus host Neon pada endpoint yang sama, path persis `/menujuakad-preproduction`, SSL require/verify-full, tanpa fragment/parameter pengganti target/parameter duplikat. CLI tidak otomatis membaca `.env`.

```bash
NODE_ENV=development \
SEED_ENVIRONMENT=preproduction \
SEED_CONFIRMATION=menujuakad-preproduction:30-customer-journeys \
node --import tsx scripts/database/seed-customer-journeys.ts --apply
```

`NODE_ENV=production` selalu ditolak pada apply. Opsi tidak dikenal ditolak. DB harus sudah memiliki migrasi fondasi, auth preproduction dan payment test; seeder tidak melakukan migrasi atau mengubah grants. Gunakan koneksi direct operator yang mempunyai izin insert tabel terkait, bukan role runtime baca terbatas.

Credential untuk login tersimpan **hanya** pada `/tmp/menujuakad-customer-journeys-preproduction/credentials.json`, directory mode0700, file mode0600 dan pemilik proses yang menjalankan seed. Password random unik per akun, 24 byte/32 karakter base64url. Manifest bukan berkas aplikasi, public asset, atau sumber dokumentasi; jangan salin/push, cetak, atau memasukkan isinya ke screenshot. Direktori `/tmp` dapat dibersihkan oleh sistem: operator perlu menyimpan backup privat manifest bila akun harus bertahan. Pengamanan menolak symlink, hardlink, ukuran >32768 byte, izin terlalu terbuka, pemilik lain, JSON cacat, identitas akun yang berubah, password lemah/duplikat, dan lokasi di repository.

## Idempotensi, rollback dan kualitas data

Apply mengambil advisory transaction lock yang sama dengan seed auth untuk menghindari race template internal. Lock file privat menolak proses lokal yang memakai manifest bersamaan. Manifest di-fsync sebelum transaksi supaya kegagalan DB bisa diulang dengan credential yang sama.

Semua collision template, email, user ID, slug, ID child dan payment diperiksa sebelum hashing. Collision melempar error sehingga **transaksi seluruh cohort rollback**, termasuk template yang baru dibuat. Seeder memeriksa referensi owner/template/member/couple/section/payment, tanpa mengambil alih row existing.

Akun cohort existing harus cocok ID/email/peran CUSTOMER, memiliki credential, serta timestamp User.createdAt sesuai instance manifest. Ini menolak manifest yang hilang lalu dibuat ulang, sambil **mengizinkan customer mengganti password**. Password existing tidak di-hash ulang atau dibandingkan dengan password lama. User.createdAt berfungsi sebagai provenance immutable; modifikasi administratif pada field itu memerlukan inspeksi/manual recovery.

Saat akun sudah ada, seluruh journey dilewati: nama, status, password, konten, slug, section, review dan kemajuan tidak ditimpa; child yang dihapus tidak dibuat kembali. Dataset merupakan baseline awal, bukan mekanisme reset. Jika manifest hilang, jangan mencoba reset melalui rerun: pulihkan backup privat manifest atau lakukan prosedur recovery akun terpisah. Pesan error CLI selalu generik agar error provider/URL/password tidak bocor.

Tidak dibutuhkan index atau migrasi tambahan: unique User.email, Invitation.slug, CoupleProfile.invitationId, InvitationMember(invitationId,userId), serta primary key existing dipakai untuk collision dan relasi. Data ini tidak melengkapi modul bisnis yang belum ada. Tahap seed tidak menjadi enum baru di database; tahap awal dipetakan dari manifest fixture dan row terkait, sedangkan kondisi actual dapat berubah setelah customer berinteraksi.

## Bukti pengujian dan keterbatasan

Tahap RED dijalankan sebelum implementasi: modul belum tersedia, lalu stub eksplisit menghasilkan kegagalan fitur yang belum diimplementasikan. Iterasi awal mengungkap kesalahan insert timestamp AuthCredential (tabel existing hanya userId/passwordHash), diperbaiki sesuai migrasi tanpa mengubah schema. Iterasi berikutnya memperlihatkan pengujian recovery manifest mencoba memperoleh lock secara nested; pengujian dipindahkan setelah lock pertama dilepas. Tidak ada error atau credential provider yang dicetak.

Hasil final akan dicatat setelah focused tests, regresi seed lama, seluruh unit suite, TypeScript tanpa generate, dan lint file baru selesai. Build/E2E, migrate deploy, seed Neon dan deployment tidak dijalankan agar tidak mengganggu pekerjaan routing/UI yang berjalan.
