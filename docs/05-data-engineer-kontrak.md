# Kontrak Data, Auth dan Seed Preproduction Menuju Akad

Tanggal: 8 Oktober 2026. **Rancangan dan kode tersedia; migrasi/seed diuji lokal pada PGlite. Belum diterapkan atau di-seed ke Neon aktif.** Worker Data Engineer mempertahankan perubahan working tree existing dan hanya mengubah schema, migrasi additive, tooling database, pengujian database serta dokumen ini. Build, API/UI/auth, perubahan layanan, commit dan deploy bukan hasil pekerjaan ini.

## Kontrak increment dan sumber

Kontrak aktif mengikuti bagian awal [rencana PM](03-pm-rencana-slicing.md), [database](database.md), schema Prisma 7 dan instruksi ROOT terbaru. Hash password memakai helper asli `src/server/auth/password-crypto.ts`: scrypt `N=32768,r=8,p=1,maxmem=64 MiB`, salt16 byte dan key64 byte. Keputusan ini menggantikan angka16384 historis pada kontrak PM. Token sesi opaque milik modul Security: random32 byte base64url43; database hanya menyimpan SHA256 hex64. Seed tidak membuat token atau sesi.

Fondasi sembilan model dan empat CHECK tetap utuh. Daftar lengkap kolom model fondasi tetap menjadi satu sumber pada [schema](../prisma/schema.prisma); dokumen ini menjelaskan delta auth/QRIS pengujian. DTO/fixture preview historis di bagian akhir tetap terpisah dari data akun DB dan tidak digunakan sebagai sumber dashboard actual.

## Skema auth dan QRIS pengujian

| Model                | Kolom, tipe dan constraint                                                                                                                                                                                                                                                                                                                                                | Relasi dan batas                                                                                                                                                                                                               |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `AuthCredential`     | `userId TEXT` PK, `passwordHash TEXT NOT NULL`                                                                                                                                                                                                                                                                                                                            | `User.id` FK, satu-ke-satu; delete User cascade credential. User mempunyai `credential?`. Tidak ada plaintext password.                                                                                                        |
| `UserSession`        | `id TEXT` PK/default cuid di Prisma, `userId TEXT NOT NULL`, `tokenHash TEXT NOT NULL UNIQUE`, `expiresAt TIMESTAMPTZ(3) NOT NULL`, `createdAt TIMESTAMPTZ(3) DEFAULT CURRENT_TIMESTAMP`                                                                                                                                                                                  | FK User, cascade; User mempunyai `sessions[]`. Cuid dihasilkan Prisma, bukan default SQL. Revokasi berupa delete row, expiry diperiksa server.                                                                                 |
| `AuthLoginThrottle`  | `keyHash TEXT` PK, `failedAttempts INTEGER NOT NULL`, `windowStartsAt TIMESTAMPTZ(3) NOT NULL`, `blockedUntil TIMESTAMPTZ(3) NULL`                                                                                                                                                                                                                                        | Counter tersimpan di DB; key dihash dari input normalisasi oleh modul auth. Atomisitas upsert/reservasi ditangani repository auth, bukan seed.                                                                                 |
| `PaymentTestRequest` | `id TEXT` PK/default cuid Prisma; `invitationId,userId,packageSlug TEXT NOT NULL`; `amountIdr INTEGER NOT NULL CHECK >0`; `status PaymentTestStatus DEFAULT REQUESTED`; `reference TEXT NULL`; `createdAt TIMESTAMPTZ(3) DEFAULT CURRENT_TIMESTAMP`; `updatedAt TIMESTAMPTZ(3) NOT NULL`/Prisma updatedAt; `reviewedAt TIMESTAMPTZ(3) NULL`; `reviewedByUserId TEXT NULL` | FK Invitation cascade, requester User restrict, reviewer User set-null. User: `paymentTestRequests` relation `PaymentTestRequester`, `paymentsTestReviewed` relation `PaymentTestReviewer`; Invitation: `paymentTestRequests`. |

`PaymentTestStatus` hanya `REQUESTED`, `APPROVED_TEST`, `REJECTED`. Tidak ada PAID, provider payment, invoice, entitlement atau trigger aktivasi undangan. `packageSlug` label paket pengujian, tanpa FK/penawaran komersial. Batas input `reference`, validasi nominal, role reviewer, ownership undangan dan transisi status merupakan kewajiban API/service Payment. FK user/undangan masing-masing tidak menggantikan pemeriksaan ownership server. Persetujuan TEST tidak mengubah `Invitation.status/isPublished`.

## Indeks dan izin runtime

| Indeks                              | Query yang dilayani                                                                    |
| ----------------------------------- | -------------------------------------------------------------------------------------- |
| Credential PK userId                | Lookup credential untuk user hasil normalisasi email; constraint satu credential/user. |
| Session tokenHash unique            | Resolver cookie-hash dan revokasi satu token; collision ditolak.                       |
| Session userId                      | Pencarian/revokasi sesi user pada operasi account.                                     |
| Session expiresAt                   | Pembersihan sesi expired tanpa scan seluruh tabel.                                     |
| Throttle keyHash PK                 | Upsert/reservasi counter atomik per account/IP hash.                                   |
| PaymentTestRequest userId,createdAt | Daftar request pengujian customer menurut waktu.                                       |
| PaymentTestRequest status,createdAt | Antrian admin REQUESTED menurut waktu.                                                 |

[SQL grants](../scripts/database/auth-runtime-grants.sql) menambah hanya izin berikut untuk role existing `menujuakad_runtime_preproduction`. Izin SELECT sembilan tabel baseline tetap berlaku. Script menolak role yang tidak ada atau mempunyai SUPERUSER/CREATEDB/CREATEROLE/REPLICATION/BYPASSRLS; DevOps tetap harus menginspeksi ownership, membership dan grant existing sebelum mengeksekusi.

| Tabel                                                            | Grant tambahan                                                                                                                                          |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AuthCredential                                                   | SELECT                                                                                                                                                  |
| UserSession                                                      | SELECT, INSERT, DELETE; tanpa UPDATE karena repository saat handoff tidak memakainya.                                                                   |
| AuthLoginThrottle                                                | SELECT, INSERT, UPDATE; tanpa DELETE.                                                                                                                   |
| Invitation, CoupleProfile, InvitationSection                     | SELECT, INSERT, UPDATE, DELETE untuk CRUD draft terotorisasi.                                                                                           |
| PaymentTestRequest                                               | SELECT, INSERT, UPDATE; tanpa DELETE.                                                                                                                   |
| User, Template, Package, InvitationMember dan tabel fondasi lain | Tidak ditambah DML; role/status/password User tidak dapat ditulis runtime. Tidak ada update lastLoginAt karena repository saat ini tidak memerlukannya. |

Tidak ada ALTER/CREATE/schema-owner/default grants luas. Grant DML bersama bukan izin aplikasi lintas akun: setiap query/mutasi wajib melewati sesi ACTIVE serta ownership/SUPERADMIN yang diverifikasi server. Jika implementasi berikutnya membutuhkan operasi tambahan, inspect pemakaian repository dan uji grant sebelum menambahnya.

## Migrasi dan strategi pemulihan

Urutan canonical:

1. `20261007000000_foundation` existing, tidak diedit; SHA256 `791ede2bc7c01c4e9358dd050b64dc7ff15a016cc297c2bd58c775435208fed7`.
2. `20261008000000_auth_preproduction`; SHA256 `744da2c126249c88e80d6df68bab7948ef63e12b452c3c8fbd3eaae9230ccde6`; hanya tiga tabel auth, indeks dan FK.
3. `20261008010000_payment_test`; SHA256 `bdb70f5fc2b076d1e072de9530f657b45fe2d46940c734044b711badc7b9cca5`; satu enum/tabel QRIS TEST, dua indeks, tiga FK dan CHECK nominal positif.

Schema bergerak 9 →12 →13 model aplikasi, di luar `_prisma_migrations`. Empat CHECK baseline tetap ada; total sesudah dua migrasi additive lima CHECK. PGlite menguji fondasi →auth dengan row User/Template/Package existing dan membandingkan CHECK sebelum/sesudah; pengujian payment menerapkan ketiga migrasi sesuai urutan. Prisma Client7.10.0 dihasilkan setelah pengujian migrasi lulus.

Live hanya memakai `prisma migrate deploy` sesudah QA, inspeksi target/baseline/checksum, backup dan rehearsal restore. Tidak memakai migrate reset, db push, impor fondasi ulang atau resolve ulang. Rollback aplikasi memakai image lama sambil mempertahankan schema additive. Kegagalan migrasi/write ditangani dengan inspeksi dan perbaikan maju atau recovery tervalidasi; jangan DROP tabel sebagai rollback rutin atau restore menimpa write baru tanpa rekonsiliasi.

## Seed aman dan kualitas data

Entrypoint baru: `npx tsx scripts/database/seed-auth-preproduction.ts`. Seed DRAFT botanical existing di `prisma/seed.ts` tetap terpisah dan tidak diubah.

Seed auth wajib `SEED_ENVIRONMENT=preproduction`, `SEED_CONFIRMATION=menujuakad-preproduction:11-dummy-accounts`, `NODE_ENV` bukan production; nama DB tepat `menujuakad-preproduction`. `DATABASE_URL` pooled dan `DIRECT_URL` direct wajib Neon/TLS serta endpoint/database sama; user/password role boleh berbeda. Parameter URL hanya `sslmode`/`channel_binding` tunggal, tanpa fragment/override host/database/credential. Guard dijalankan sebelum koneksi, manifest atau write.

- Initial seed membuat `admin@menujuakad.test` SUPERADMIN ACTIVE dan `customer01@menujuakad.test` sampai `customer10@menujuakad.test` CUSTOMER ACTIVE. Nama diberi penanda TEST.
- Setiap account memperoleh password berbeda dari random24 byte/base64url32 karakter, disimpan sebagai hash scrypt saja di DB. Manifest account mencatat userId UUID milik seed untuk identifikasi aman; ID User adalah String dan tidak mensyaratkan cuid.
- Manifest tetap `/tmp/menujuakad-auth-preprod-20261008/credentials.json`, di luar repo; direktori0700/file0600 milik proses. Bentuk `{environment:'preproduction',accounts:[{email,role,password,userId}],createdAt}`. Tidak mencetak password, hash, URL atau exception provider. Tolak symlink, hardlink, file/direktori terbuka, manifest cacat/duplikat, lokasi di repo dan parent symlink.
- Manifest dibuat eksklusif dan fsync sebelum transaksi DB sehingga kegagalan transaksi dapat diulang dengan credential sama. Manifest existing dibaca, tidak ditimpa. Lock file privat menserialisasi proses lokal; advisory transaction lock menserialisasi seed pada DB. Lock sisa crash memerlukan inspeksi proses dan state privat sebelum dihapus.
- Semua write berada dalam satu transaksi. Rerun memerlukan email persis, userId, role, ACTIVE dan password yang cocok dengan credential existing; password/role/status/email tidak direset. Email collision diperiksa case-insensitive, termasuk akun existing tanpa credential. Manifest hilang/diganti tidak menjadi izin mengambil alih akun existing; pulihkan manifest privat atau lakukan prosedur recovery terpisah yang ditinjau.
- Satu template `seed-preproduction-internal` DRAFT, internal-test; `botanical-development` existing tidak diubah. Setiap customer initial mempunyai satu DRAFT `seed-customer-01`…`seed-customer-10`, belum published, pasangan/nama/alamat sintetis, tanggal2027-01-17 dan section COVER/COUPLE/EVENT dengan config `synthetic:true`. Collision slug/template/owner membatalkan seluruh transaksi. Rerun mempertahankan judul/config/profile yang sudah diedit.
- Seed tidak membuat Package, PaymentTestRequest, sesi, paid/invoice/entitlement atau data publik; nominal/harga komersial tidak ditebak. Bila operator menghapus draft seed lalu rerun, draft yang hilang dibuat kembali; seed bukan sinkronisasi/reset konten existing.

Pipeline: pasangan URL terverifikasi → manifest privat/planned IDs → hash helper Security → transaksi+advisory lock → User/AuthCredential + template/draft/profile/section sintetis → ringkasan count aman. Password manifest untuk operator/QA saja; browser/screenshots/trace/log/repo/runtime container tidak boleh memuat file ini. User email/nama merupakan PII walau data seed sintetis; auth hash dan backup tetap data sensitif. Retensi sesi expired dan throttle lama memerlukan job terpisah, belum dijalankan oleh tooling ini.

## Runbook DevOps sesudah gate QA

**Status:** seluruh perintah berikut adalah handoff, belum dieksekusi ke Neon oleh worker. `pg_dump` dan `pg_restore` tidak ditemukan pada PATH lokal; backup atau restore point belum dibuktikan. Gunakan client PostgreSQL dari container terkelola sesuai versi server atau mekanisme branch/restore Neon yang benar-benar tersedia. Jangan lanjut apply tanpa hasil rehearsal terisolasi yang tersimpan privat.

Jalankan dari `/home/ubuntu/menujuakad-web` pada host/operator yang sudah memiliki `.env` privat berisi pasangan URL owner/runtime existing. Jangan menyalin `.env` ke image atau menaruh URL pada argumen shell. Siapkan tools Docker/akses owner yang benar, sumber schema final setelah worker lain berhenti, dan folder output kosong untuk operasi pertama:

```sh
umask 077
export NODE_ENV=development
export SEED_ENVIRONMENT=preproduction
export SEED_CONFIRMATION=menujuakad-preproduction:11-dummy-accounts
npm run db:preflight:neon
npx tsx scripts/database/prepare-auth-pg-env.ts
npx tsx scripts/database/prepare-auth-pg-env.ts --runtime
npx tsx scripts/database/auth-preproduction-inspect.ts --before-auth > /tmp/menujuakad-auth-ops-20261008/before.json
```

`prepare-auth-pg-env.ts` menghasilkan `pg-owner.env`/`pg-runtime.env` privat0600 dari URL tervalidasi tanpa mencetak nilainya dan menolak overwrite. Inspect sebelum apply mengharapkan sembilan tabel/empat CHECK/checksum baseline. Baca `serverMajor` di `before.json` lalu set `task_pg_image` ke image client PostgreSQL yang kompatibel, misalnya `postgres:17` hanya jika versi server17. Jangan menyalin hasil env ke dokumen. Inspeksi grant/membership/ownership runtime existing dan metadata migrasi sebelum migrasi; izin yang lebih luas dari baseline perlu ditangani DevOps.

```sh
export task_pg_image=postgres:17
export task_ops_dir=/tmp/menujuakad-auth-ops-20261008
docker run --rm --user "$(id -u):$(id -g)" --env-file "$task_ops_dir/pg-owner.env" --volume "$PWD/scripts/database:/sql:ro" "$task_pg_image" psql --no-psqlrc --set ON_ERROR_STOP=1 --file /sql/auth-runtime-inspect.sql > "$task_ops_dir/before-runtime-permissions.txt"
docker run --rm --user "$(id -u):$(id -g)" --env-file "$task_ops_dir/pg-owner.env" --volume "$task_ops_dir:/backup" "$task_pg_image" pg_dump --format=custom --file=/backup/before-auth.dump
chmod 600 "$task_ops_dir/before-auth.dump"
sha256sum "$task_ops_dir/before-auth.dump" > "$task_ops_dir/backup.sha256"
docker run --rm --user "$(id -u):$(id -g)" --volume "$task_ops_dir:/backup:ro" "$task_pg_image" pg_restore --list /backup/before-auth.dump > "$task_ops_dir/backup-contents.txt"
```

List arsip tidak membuktikan restore. Siapkan branch/database **kosong dan terisolasi** untuk rehearsal, lalu buat `pg-restore.env` secara privat0600 melalui editor, berisi PGHOST/PGPORT/PGDATABASE/PGUSER/PGPASSWORD/PGSSLMODE dari target isolasi. Verifikasi pasangan PGHOST/PGDATABASE bukan pasangan target active melalui metadata yang disanitasi; branch isolasi boleh memakai nama database sama jika endpoint berbeda; file ini **bukan** `pg-owner.env` atau `pg-runtime.env`. Restore harus memakai environment rehearsal ini:

```sh
export task_restore_database=menujuakad-restore-rehearsal
docker run --rm --user "$(id -u):$(id -g)" --env-file "$task_ops_dir/pg-restore.env" --volume "$task_ops_dir:/backup:ro" "$task_pg_image" pg_restore --exit-on-error --no-owner --no-privileges --dbname "$task_restore_database" /backup/before-auth.dump
```

`task_restore_database` wajib nama database isolasi yang telah diverifikasi sama dengan PGDATABASE rehearsal, bukan nama live. Sesudah restore, bandingkan schema/tabel/count/checksum `_prisma_migrations`/empat CHECK dengan metadata before pada target rehearsal memakai psql atau inspector terpisah. Uji login/CRUD pada kandidat terisolasi sesudah migrasi rehearsal menurut gate QA. Simpan target, waktu, checksum dan hasil recovery privat; bila target/tool/recovery gagal, hentikan apply live.

Sesudah QA dan rehearsal PASS, jalankan additive deploy/inspeksi/seed/grant:

```sh
npm run db:deploy
npx tsx scripts/database/auth-preproduction-inspect.ts > "$task_ops_dir/after-migrations.json"
npx tsx scripts/database/seed-auth-preproduction.ts
npx tsx scripts/database/seed-auth-preproduction.ts
npx tsx scripts/database/auth-preproduction-inspect.ts > "$task_ops_dir/after-seed.json"
docker run --rm --user "$(id -u):$(id -g)" --env-file "$task_ops_dir/pg-owner.env" --volume "$PWD/scripts/database:/sql:ro" "$task_pg_image" psql --no-psqlrc --set ON_ERROR_STOP=1 --file /sql/auth-runtime-grants.sql
npx tsx scripts/database/auth-preproduction-inspect.ts > "$task_ops_dir/after-grants.json"
npx prisma migrate status
```

Inspect final mengharapkan13 tabel/lima CHECK/tiga checksum migrasi, lalu report count seed admin1/customer10/draft10 dan tabel grant runtime. Periksa output counts, hash-stability rerun melalui pemeriksaan privat dan grant sesuai tabel di atas. Jalankan smoke menggunakan `DATABASE_URL` pooled runtime nyata untuk login dua role/logout/throttle/customer-owned CRUD+reload/IDOR/admin/QRIS TEST; inspect owner saja tidak membuktikan operasi runtime berhasil. Deployment tetap dua Compose existing dan owner DIRECT_URL tidak masuk container. Hapus salinan env tooling setelah kebutuhan recovery selesai dengan prosedur aman; simpan credential manifest/backup di tempat privat dengan retensi yang disepakati.

## Bukti validasi dan batas hasil

Hasil worker pada kandidat source saat pemeriksaan 8 Oktober 2026:

- `npm run db:validate` PASS; `npx prisma generate` PASS, client7.10.0 siap memakai keempat model baru. Fondasi checksum tetap identik.
- `npx tsc --noEmit` PASS dan ESLint scoped seluruh tooling/tests data PASS. Format Prettier scoped serta whitespace/tautan/struktur dokumen PASS; satu judul utama dan nomor dokumen01–10 existing tetap berurutan.
- Final `npm test`: **358/358 kasus, 36/36 berkas PASS**, exit0, log privat lokal `/tmp/menujuakad-auth-data-final-unit.log`. Source worker lain sudah bertambah pada run final; 317/31 sebelumnya merupakan checkpoint, bukan jumlah final.
- Bagian database berisi **52 kasus/7 berkas**: foundation7, Neon setup12, auth migration5, auth seed20, CLI refusal1, runtime grants2, payment TEST migration5. Scoped rerun terakhir seed/grants **22/22 PASS** juga membuktikan judul/profile/config yang diedit tetap utuh pada rerun.
- PK/FK, token unik, timestamp/index, CHECK baseline, nominal TEST positif, collision email case-insensitive/manifest/slug/template, atomic rollback, idempotensi, production refusal, parameter URL override/duplikat, mode0700/0600, symlink/hardlink/lock dan output CLI tanpa URL/password diuji lokal.
- Review mandiri memeriksa batas transaksi, penyimpanan manifest sebelum write, error generik, hash helper tunggal, grant minimal dan pemisahan fixture. Ini bukan review independen QA/domain atau bukti driver Neon live.
- Worker tidak menjalankan build/E2E/deploy, migrasi atau seed live. Direktori operasional `/tmp/menujuakad-auth-preprod-20261008` dan `/tmp/menujuakad-auth-ops-20261008` belum dibuat; manifest uji berada dalam direktori temporer terisolasi dan dibersihkan. `pg_dump`/`pg_restore` tidak ada pada PATH; backup/restore belum terjadi.

Status terpisah: **rancangan tersedia; kode tersedia; teruji lokal pada PostgreSQL PGlite; fondasi Neon existing sudah terhubung menurut baseline ROOT, model auth/QRIS baru belum diterapkan; verifikasi produksi increment ini belum dilakukan.** Pengujian lokal tidak membuktikan driver Neon/izin runtime live, backup/restore nyata, alur browser, layanan provider atau rilis produksi. ROOT menyelaraskan progres/changelog shared, DevOps menerapkan runbook sesudah QA; tidak ada commit worker.

## Registry dan fixture preview sintetis — riwayat 7 Oktober 2026

Status increment historis 7 Oktober 2026. **Status: DTO, registry dan fixture sintetis tersedia serta teruji lokal.** Lingkup worker hanya `src/features/design-preview/types.ts`, `src/features/design-preview/data/*` dan dokumen ini. Tidak ada perubahan database, migrasi, sesi, provider, route, deployment, commit atau push.

### Sumber, keputusan dan kelengkapan

Role data engineer, AGENTS aplikasi, master spec, progres/changelog kedua folder, rencana PM 03 dan inventaris UI/UX 01 dibaca. Metadata diambil dari manifest Stitch proyek `12559574101879777472`, snapshot 2026-10-07; pembacaan ini bukan inspeksi visual tambahan. Lampiran prompt TXT tidak dimasukkan sebagai layar.

- `screenRecords`: **64 record varian sumber**, masing-masing ID unik; 62 berstatus `screenshot`, dua `metadata-only`.
- `previewScreens`: **53 kode unik**, setiap kode mempunyai satu varian utama dan daftar `variants` lengkap. Total panjang daftar varian tetap 64, bukan 64 route produk.
- Metadata-only: desktop CUS-01 dan CUS-02. CUS-01 memilih referensi tablet yang valid sebagai varian utama; desktop tetap tersimpan dan tidak diberi status screenshot. CUS-02 tetap metadata-only.
- Pemilihan utama berurutan: screenshot valid, state berawalan `Default`, kemudian desktop/tablet/mobile. INV-01 utama bukan state token tidak valid; CUS-08 utama bukan state expired. Urutan asli varian dalam satu kode dipertahankan.
- CUS-05/06 belum ditemukan; dicatat di `previewSourceGaps` dan **tidak** dimasukkan whitelist sumber. Bila UI pelengkap dibuat kemudian, statusnya harus `reconstruction`, dengan keputusan integrasi eksplisit dan pengujian sendiri.
- PUB-05 adalah `/pricing`, PUB-06 `/how-it-works`, PUB-07 `/faq`, PUB-08 `/contact`, PUB-09 `/about`, PUB-10 `/terms`, PUB-11 `/privacy`. ERR mempunyai logical route boundary; DS mempunyai `referensi internal`, keduanya bukan URL produksi.

Snapshot metadata aplikasi disimpan per prefix di `data/sources/{acc,adm,aut,cus,ds,edt,err,gst,inv,pub,sup}.ts`. File ini hanya berisi ID/kode/judul/rute/state/perangkat/dimensi/status/flag inspeksi. URL download, source token, path screenshot lokal dan HTML tidak disalin. Runtime/build tidak membaca folder rancangan; sumber PNG tetap di rancangan untuk inspeksi pelaksana UI.

### Antarmuka registry yang dikunci

Import metadata dari `@/features/design-preview/data/screens`; import tipe dari `@/features/design-preview/types`.

```ts
export type PreviewAudience = "public" | "auth" | "customer" | "admin" | "invitation" | "reference";
export type PreviewDevice = "DESKTOP" | "MOBILE" | "TABLET";
export type PreviewSourceStatus = "screenshot" | "metadata-only" | "reconstruction";

// PreviewScreenVariant bersifat readonly:
// id, code, title, audience, logicalRoute, state, device, sourceStatus,
// width, height (number), visualInspected (boolean).
export type PreviewScreen = PreviewScreenVariant &
  Readonly<{
    variants: readonly PreviewScreenVariant[];
  }>;

export const screenRecords: readonly PreviewScreenVariant[];
export const previewScreens: readonly PreviewScreen[];
export function getPreviewScreen(code: string): PreviewScreen | undefined;
export function getPreviewVariant(id: string): PreviewScreenVariant | undefined;
```

`getPreviewScreen` menerima kode ASCII persis seperti `PUB-01` atau `pub-01`; tidak trim, tidak decode URL, tidak membangun nama file/dynamic import dan tidak menerima query/path. `__proto__`, `constructor`, kode unknown, traversal dan kode dengan query menghasilkan `undefined`. Penyimpanan memakai Map, bukan lookup properti objek dari input user. `getPreviewVariant` hanya menemukan ID snapshot yang terdaftar. Resolver varian tidak menjalankan provider maupun memuat aset.

`previewScreens`, `screenRecords`, metadata record, screen utama dan daftar varian dibekukan agar UI tidak mengubah registry. `audience` hanya kategori UI; tidak memberikan hak customer atau SUPERADMIN. `logicalRoute` merupakan handoff dokumentasi, bukan target yang aman untuk navigasi preview. Pelaksana wajib membuat tautan ke `/preview-ui/<code>` dan memilih view melalui map statis. Untuk selector state/perangkat, pastikan ID hasil `getPreviewVariant` mempunyai `code` yang sama dengan screen aktif sebelum komposisi.

Kontrak komposisi fullstack tetap `DesignPreviewView({ screen }: { screen: PreviewScreen })`; field lama rencana PM dipertahankan dan metadata tambahan tidak merusak consumer minimal.

### Export fixture dan props untuk pelaksana UI

Import fixture/DTO aman dari barrel **`@/features/design-preview/data/fixtures`**. Barrel 10 baris; tidak mempunyai logika bisnis, import server, fetch atau mutation. Record readonly TypeScript; komponen interaktif membuat salinan state lokal dan tidak mengubah fixture modul.

| Export nilai                                                                    | Tipe/field utama                                                                                                                                        | Konsumen dan tanggung jawab                                                                                                              |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `previewContext`                                                                | mode `synthetic`, label, `invitationId`, `accountId`, `now` ISO tetap                                                                                   | Banner dan waktu contoh deterministik; bukan sesi atau jam produksi                                                                      |
| `templatesFixture`                                                              | `readonly TemplatePreviewDto[]`: id, slug, name, category, description, colors, featured                                                                | Katalog/detail/demo; warna bukan URL foto atau aset berlisensi                                                                           |
| `invitationFixture`, `activeUnpublishedInvitationFixture`, `invitationsFixture` | `InvitationPreviewDto`: id, slug, title, partnerOne/Two, status, isPublished, templateId, eventDate, updatedAt, guestLabel, events, story               | Overview, wizard, cover/opened undangan contoh; status utama DRAFT; daftar contoh memuat DRAFT dan ACTIVE, keduanya belum dipublikasikan |
| `editorFixture`, `galleryErrorFixture`                                          | `EditorPreviewDto`: invitationId, saveState, cover, gallery, galleryQuota, rsvp, music, dressCode, video, countdown, liveStream, hashtag, publishChecks | Semua section editor; galeri error/kuota adalah state ilustratif terpisah                                                                |
| `editorSections`                                                                | daftar id `EditorSection` dan label                                                                                                                     | Navigasi 13 section; EDT-01 shell, EDT-02–14 section; query `publish-check` konsisten sumber                                             |
| `guestsFixture`, `emptyGuestsFixture`                                           | `readonly GuestPreviewDto[]`: id, invitationId, displayName, group, rsvpStatus, partySize, deliveryStatus, respondedAt                                  | Tabel/filter tamu dan empty state; tidak punya nomor/email/token tamu                                                                    |
| `guestImportFixture`                                                            | `readonly GuestImportRowDto[]`: rowNumber, displayName, group, status, issue                                                                            | Tiga baris VALID/DUPLICATE/INVALID untuk preview impor lokal                                                                             |
| `rsvpFixture`, `rsvpStatusLabels`                                               | `RsvpSummaryDto`; label enum ATTENDING/NOT_ATTENDING/MAYBE/PENDING                                                                                      | Ringkasan RSVP; ragu bukan belum menjawab                                                                                                |
| `wishesFixture`                                                                 | `readonly WishPreviewDto[]`: id, invitationId, guestId/Label, message, VISIBLE/HIDDEN, createdAt                                                        | Buku doa dan contoh moderasi lokal                                                                                                       |
| `giftsFixture`, `giftSettingsFixture`                                           | `readonly GiftPreviewDto[]`; konfigurasi enabled=false, accountNumber/shippingAddress/paymentQr=null                                                    | Amplop/hadiah; DECLARED adalah laporan contoh, bukan transfer bank terverifikasi                                                         |
| `analyticsFixture`                                                              | `AnalyticsPreviewDto`: invitationId, period, pageViews, uniqueVisitors, rsvp, visibleWishes, declaredEnvelopeAmountIdr, daily, sources                  | Grafik dan statistik contoh dengan satu semantik per indikator                                                                           |
| `packagesFixture`                                                               | `readonly PackagePreviewDto[]`: id, name, amountIdr, IDR, priceLabel, recommended, guestLimit, galleryLimit, features                                   | Pilihan paket; semua harga dan kuota contoh, belum keputusan komersial                                                                   |
| `ordersFixture`, `pendingOrderFixture`, `expiredOrderFixture`                   | `OrderPreviewDto`: id, accountId, invitationId, packageId, amountIdr, currency, status, createdAt, expiresAt, paidAt, synthetic=true                    | Checkout default/expired dan monitoring admin; waktu tetap, bukan instrumen payment                                                      |
| `webhooksFixture`                                                               | `readonly WebhookPreviewDto[]`: id, orderId, eventType, status, receivedAt, attempts, summary                                                           | Rekonsiliasi contoh PROCESSED/DUPLICATE/FAILED; tidak ada payload/signature/endpoint nyata                                               |
| `billingFixture`, `paymentStatusLabels`                                         | `BillingPreviewDto`: mode, label, paymentInstrument=null, packages, orders, webhooks                                                                    | Container billing; PAID hanya visual transaksi sintetis dan tidak memberi entitlement                                                    |
| `accountFixture`                                                                | `AccountPreviewDto`: id, displayName, email, authMethodLabel, emailVerified=false, avatarInitials                                                       | Profil/login visual; email `.invalid`, tidak membentuk VerifiedSession                                                                   |
| `notificationsFixture`, `notificationPreferencesFixture`                        | `NotificationPreviewDto[]`; preferensi boolean                                                                                                          | Inbox/preferensi lokal; tidak mengirim email atau notifikasi asli                                                                        |
| `supportFixture`                                                                | `readonly SupportTicketPreviewDto[]`: id, subject, category, status, createdAt, updatedAt, messages                                                     | Tiket OPEN/IN_PROGRESS dan balasan fiktif; form hanya state UI                                                                           |

Contoh props yang konsisten untuk komponen domain:

```ts
import type {
  GuestPreviewDto,
  OrderPreviewDto,
  AnalyticsPreviewDto,
} from "@/features/design-preview/data/fixtures";

type GuestsProps = { guests: readonly GuestPreviewDto[] };
type CheckoutProps = { order: OrderPreviewDto };
type AnalyticsProps = { analytics: AnalyticsPreviewDto };
```

Callback interaksi dimiliki UI, bersifat lokal dan tidak menambahkan handler provider ke DTO. UI menerima array readonly, mencetak label contoh, dan memformat nominal/tanggal untuk Bahasa Indonesia pada layer presentasi. Placeholder media tidak diubah menjadi URL arbitrary atau akun bank yang dapat dipakai pembayaran.

### Semantik, konsistensi dan privasi

- Semua ID fixture berawalan `demo-`; referensi invitation/account/guest/package/order antarfile konsisten. Nama tamu bernomor `Tamu Contoh 001`–`120`; akun `Akun Contoh`, email `akun@example.invalid`. Nama pasangan memiliki penanda Contoh; venue/alamat hanya label ilustratif.
- Nominal berupa integer IDR dalam rupiah, bukan floating point atau nominal terformat. Harga contoh Essential/Signature/Premium 99.000/149.000/249.000 rupiah; seluruh order contoh memakai Signature 149.000. Gift fisik nominal 0, bukan nilai taksiran transaksi.
- Tanggal waktu memakai ISO 8601 UTC; tanggal kisah dan bucket harian memakai ISO kalender `YYYY-MM-DD`. Waktu acuan 2026-10-07T08:00:00.000Z agar screenshot/test stabil. Checkout yang ditampilkan default harus memakai waktu contoh tersebut, bukan menyatakan tagihan nyata masih aktif menurut jam browser.
- Lifecycle undangan mengikuti `prisma/schema.prisma`: **DRAFT, PENDING_PAYMENT, ACTIVE, EXPIRING_SOON, EXPIRED, SUSPENDED, ARCHIVED**. EXPIRED ada di schema dan tetap berarti lifecycle, bukan publikasi. DTO mendefinisikan union lokal tanpa import Prisma runtime. **PUBLISHED bukan InvitationStatus**; publikasi adalah boolean `isPublished` terpisah. Fixture utama DRAFT/isPublished=false; `activeUnpublishedInvitationFixture` ACTIVE/isPublished=false membuktikan aktif tidak otomatis terbit. Enum RSVP final **ATTENDING, NOT_ATTENDING, MAYBE, PENDING**; field agregasi `rsvpFixture.declining` tetap berisi jumlah NOT_ATTENDING.
- Tamu 120: ATTENDING 68, NOT_ATTENDING 20, MAYBE 12, PENDING 20. Persentase hadir **57%**, pembulatan 68/120, bukan 68 dibagi hanya tamu yang telah menjawab. `partySize` seluruh fixture 1 agar hitungan orang dan guest record tidak bertentangan; dukungan party lebih besar kelak memerlukan indikator terpisah.
- Statistik RSVP dihitung dari `guestsFixture`, jumlah ucapan terlihat dari status VISIBLE, total amplop yang dilaporkan dari ENVELOPE. Nilainya 2 ucapan terlihat dan 400.000 rupiah **deklarasi contoh**, bukan uang diterima.
- Analitik pageViews 420 adalah jumlah bucket harian; uniqueVisitors periode 180 merupakan himpunan periode contoh, bukan penjumlahan unique harian. Sumber 110+50+20=180; kunjungan harian dapat bertumpang tindih antarhari. Data bukan hasil telemetry produksi.
- `SENT_EXAMPLE` tidak berarti WhatsApp/email terkirim. Event webhook `PAYMENT_PAID_EXAMPLE`, status PAID dan timestamp paidAt adalah contoh visual, bukan bukti Mayar. Tidak ada QRIS, rekening, NMID, token/link pembayaran, raw webhook payload, password, cookie, session atau kredensial provider.
- Tidak ada perubahan Prisma/model/index/pipeline persistensi. Untuk cakupan ini, alur data adalah metadata sumber → snapshot statis aplikasi → registry whitelist/DTO sintetis → UI presentasional. Normalisasi preview tidak menjadi rancangan ulang schema produksi; ownership dan guard operasi kelak tetap tanggung jawab server.

### Validasi dan batas hasil

Siklus pengujian awal: import modul belum ada gagal; setelah export skeleton tersedia, empat test benar-benar gagal pada registry kosong, status sumber kosong, identitas kosong dan ringkasan RSVP kosong. Implementasi membuat keempatnya lulus, tanpa mock provider. Koreksi review menambah dua test yang sebelumnya gagal: tidak ada 20 NOT_ATTENDING dan belum ada ACTIVE dengan isPublished=false; keduanya kemudian lulus.

| Pemeriksaan                                                                        | Hasil                                                                                                             |
| ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `npm test -- src/features/design-preview/data/fixtures.test.ts`                    | 1 file, **6 test lulus** setelah koreksi review I01/I02                                                           |
| `npm run typecheck`                                                                | Prisma Client 7.10.0 ter-generate, TypeScript **exit 0**                                                          |
| `npx eslint src/features/design-preview/types.ts src/features/design-preview/data` | **exit 0**, tidak ada temuan                                                                                      |
| `npm test`                                                                         | **7 file, 180 test lulus** setelah koreksi review I01/I02; termasuk perubahan security worker yang sudah tersedia |
| Ukuran file                                                                        | `types.ts` 37, registry 111, barrel 10; file terbesar 185 baris (source EDT); seluruh file ownership <200 baris   |

Test menangkap hilangnya whitelist, lookup prototype/path/query, kehilangan varian, klaim screenshot palsu, default expired/token tidak valid, referensi fixture putus, ID duplikat, nominal noninteger/tanggal tidak valid, penggabungan MAYBE dengan PENDING, perubahan 20 tamu NOT_ATTENDING/label Tidak hadir, dan asumsi bahwa lifecycle ACTIVE selalu dipublikasikan. Review I01/I02 selesai diperbaiki; belum ada build/inspeksi visual baru pada increment koreksi ini.

**Belum diuji worker ini:** build/E2E/visual semua layar/deployment; instruksi task tidak menjalankan build. Tidak ada koneksi Neon/auth/Mayar atau verifikasi produksi. Fullstack mengintegrasikan resolver statis dan label/noindex preview; payment/business memakai DTO ini; QA menguji UI dan akses pada hasil integrasi. Progres/changelog lintas ownership diperbarui koordinator berdasarkan laporan ini.
