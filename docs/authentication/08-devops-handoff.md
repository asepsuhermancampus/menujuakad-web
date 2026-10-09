# Handoff DevOps autentikasi multimethod

## Lingkup, sumber dan status

Audit source lokal 9 Oktober 2026, dari `/home/ubuntu/menujuakad-web`. Sumber: AGENTS, role devops, dokumen01/02/03/04/05/06 autentikasi, deployment, package scripts, Prisma config/schema/migrations, runtime grants/inspection/preflight, auth config/capabilities/Google dan provider delivery. Tidak membaca nilai `.env`, memanggil provider, mengakses VPS, melakukan migrasi/seed/grants aktif, deploy, commit atau push. Perubahan terbatas pada dokumen ini dan placeholder kosong `.env.example`; source lain sedang dikerjakan paralel dan tidak diubah.

Kode core/Google/Resend/Twilio tersedia lokal. Audit ini tidak menjalankan build/unit/E2E maupun smoke layanan. Angka pengujian pada dokumen worker lain adalah bukti mereka, bukan pengujian DevOps ini. Gate QA final tidak ditunggu untuk menyelesaikan handoff.

Menurut checkpoint terbaru pada `../deployment.md`, release tercatat `preview-20261009-login`, BUILD_ID `_ZmqTJPa-Hip-SCzksj0f`; login produksi masih503 karena AUTH_SECRET belum tersedia. Neon tercatat baca terbatas. Status ini berasal dari catatan deployment, bukan inspeksi live baru. Bagian deployment lama yang masih menyebut release responsive aktif adalah riwayat, bukan pointer terbaru. Multimethod/schema/grants/provider belum dibuktikan pada target aktif.

## Arsitektur dan batas kepercayaan

```text
Browser HTTPS menujuakad.com
  → Caddy existing (TLS, canonical redirect)
  → localhost3100 → Docker web:3000 (Next16.3.8 / Node22)
      → auth service → Prisma7.10 / adapter Neon → DATABASE_URL pooled runtime
      → Google OAuth / Resend / Twilio (server only)
Operator terpisah → DIRECT_URL owner direct → Prisma migrate / grants / preflight
```

Compose utama `deploy/compose.yaml` dan overlay `deploy/compose.neon.yaml` wajib dipakai bersama. Overlay membaca `/etc/menujuakad/runtime.env`; komentar lama yang menyebut hanya DATABASE_URL perlu dipahami sebagai konfigurasi historis: rollout auth membutuhkan env auth/provider server di file privat yang sama melalui `env_file`. Jangan menambahkan DIRECT_URL owner ke container web. Caddy/Breadwinner/HariKita dan DNS/mail/FTP tidak menjadi target perubahan auth.

Container dibatasi RAM768MiB/CPU1, non-root, filesystem read-only, upstream localhost, healthcheck liveness. AUTH_TRUST_PROXY hanya opt-in setelah header proxy dan upstream privat diperiksa; source membaca IP terakhir X-Forwarded-For. Kosong/default memakai bucket IP bersama `shared-untrusted`, sehingga batas IP100 dapat dipakai bersama semua pengguna. Jangan membuka port3100 ke publik atau mengandalkan header IP dari klien langsung.

## Kontrak environment dan URL

Semua nilai di `.env.example` kosong. Rahasia disediakan operator melalui secret store/file server root0600, tidak melalui NEXT_PUBLIC, props, build arg, artifact, log, screenshot atau repository. AUTH_SECRET stabil antar kandidat/produksi; rotasi membutuhkan penilaian invalidasi CSRF, HMAC throttle/proof dan envelope OAuth yang masih berjalan. Sesi opaque memakai SHA256 di DB; rotasi secret sendiri bukan mekanisme revoke semua sesi.

| Nama | Kontrak source dan tindakan operator |
| --- | --- |
| DATABASE_URL | Neon pooled role runtime, bukan owner; TLS dan endpoint/database konsisten dengan direct |
| DIRECT_URL | Owner direct hanya tooling/migrasi, datasource pada prisma.config.ts |
| NEXT_PUBLIC_APP_URL | Publik: produksi `https://menujuakad.com`; local dev `http://localhost:3000`; build dan origin runtime harus sesuai |
| AUTH_SECRET | Wajib minimal32 karakter; hasil generator kriptografis, tidak dicetak pada runbook |
| AUTH_TRUST_PROXY | Hanya nilai literal `1` mengaktifkan kepercayaan proxy; kosong default false |
| GOOGLE_CLIENT_ID | Client Web Application, format `*.apps.googleusercontent.com` |
| GOOGLE_CLIENT_SECRET | Secret server, source minimal8 karakter; kelengkapan bukan bukti credential valid |
| GOOGLE_REDIRECT_URI | Wajib exact `${origin}/api/auth/google/callback`, tanpa trailing slash |
| RESEND_API_KEY | Source menerima format `re_…`; scope kirim pada domain pengirim sah |
| AUTH_EMAIL_FROM | Alamat pengirim valid, misalnya `Menuju Akad <auth@menujuakad.com>` setelah domain verified; contoh alamat bukan klaim mailbox/domain siap |
| TWILIO_ACCOUNT_SID | `AC` +32 hex |
| TWILIO_AUTH_TOKEN |32 hex, secret server |
| TWILIO_FROM_NUMBER | E.164, nomor sender sah dan dapat mengirim SMS Indonesia |

Google Console production: authorized JavaScript origin `https://menujuakad.com`, authorized redirect URI **`https://menujuakad.com/api/auth/google/callback`**. Development: origin `http://localhost:3000`, redirect **`http://localhost:3000/api/auth/google/callback`**, client terpisah bila diperlukan. `www` diarahkan ke apex; jangan memakai callback www atau URL kandidat localhost3101 sambil origin tetap produksi. Kandidat OAuth memerlukan host HTTPS terkontrol dan client/redirect yang sesuai; tidak mengubah callback production demi smoke kandidat. Consent screen/test users/publishing status serta quota harus diverifikasi operator, tidak disimpulkan dari env.

Endpoint Google start adalah POST `/api/auth/google/start`, intent login/link/reauthenticate; GET callback saja tidak cukup untuk membuat sesi. State browser-bound single-use, PKCE dan nonce wajib valid. Code/token/query callback jangan dicatat pada access log; audit redaksi proxy sebelum mengaktifkan Google. Jangan menyalakan access logging URL query mentah.

Resend mengirim ke `https://api.resend.com/emails`. Reset menggunakan **`https://menujuakad.com/reset-password#token=…`**, verifikasi signup **`https://menujuakad.com/verify-email#token=…`**, perubahan email **`https://menujuakad.com/account/security#token=…`**. Fragment tidak dikirim sebagai query HTTP; proof dikonsumsi POST eksplisit. Domain sender, SPF/DKIM dan kebijakan DMARC diverifikasi di layanan DNS email yang benar, tanpa mengubah MX default secara spekulatif.

Twilio memakai **Programmable Messaging**, URL `https://api.twilio.com/2010-04-01/Accounts/{sid}/Messages.json`, bukan Verify Service SID. Tidak ada env TWILIO_VERIFY_SERVICE_SID. Trial recipient restrictions, saldo, geo-permissions Indonesia, sender dan delivery harus diperiksa di sandbox. Adapter timeout10detik/no redirect; Twilio POST tidak otomatis retry karena tidak ada jaminan idempotency. Resend memakai Idempotency-Key. Receipt id/sid yang diterima hanya membuktikan provider menerima request; delivery webhook/status monitor belum menjadi bukti terimplementasi.

## Fail-closed, readiness dan capability

| Probe/kondisi | Arti sebenarnya |
| --- | --- |
| GET `/api/health/live`200 | Proses hidup; healthcheck Docker hanya ini |
| GET `/api/health`200 | Database probe tersedia; bukan schema auth lengkap atau DML/provider siap |
| GET `/api/auth/capabilities`200 | `{ok:true,data:{google,emailRecovery,smsOtp}}`; boolean berasal dari validasi format config, bukan network/Console/delivery |
| AUTH_SECRET/origin tidak valid | Capability semua false, CSRF/mutasi auth503; jangan membuat fallback login sintetis |
| Config provider hilang/invalid | Capability terkait false; endpoint yang memerlukan kanal menolak; UI menjelaskan unavailable |
| Provider outage sesudah config valid | Capability dapat tetap true; request sensitif gagal aman, tidak menerbitkan sesi/proof valid atas kegagalan delivery |
| Register/password dengan kanal unavailable | Signup/password masih dapat berjalan ketika schema/grants/core siap; kontak tetap unverified; recovery/link tidak boleh menganggapnya verified |

Recovery anti-enumeration dapat mengembalikan202 generik dan menyembunyikan kegagalan delivery; itu bukan bukti email terkirim. Proof pending/gagal tidak boleh memberi akses. OTP login202 bukan sesi penuh; dashboard harus tetap ditolak hingga kode valid. Login SMS yang sudah diwajibkan tidak boleh dilewati saat SMS unavailable. `User.smsOtpEnabled` sekarang permanen, BOOLEAN NOT NULL default false, dengan CHECK verified phone melalui migrasi `20261009002000_auth_sms_policy`; grants INSERT/UPDATE field tersedia lokal. Backend06 membaca flag aktual dan menegakkan login202 dengan pending cookie tanpa sesi penuh sampai OTP valid; enable memerlukan reauth, password, nomor verified dan konfigurasi SMS. Pengaturan tidak disimpan pada proof sementara. Persistensi/enforcement teruji lokal, sedangkan migrasi/grants/runtime/provider target aktif tetap belum diterapkan atau terverifikasi.

## Bukti lokal final dan konsekuensi operasional

Dokumen02 mencatat validasi/generate Prisma serta suite resume SMS5 file/37 test PASS: default false, CHECK verified phone, unlink+disable atomik, snapshot15 tabel dan hak runtime terpilih tanpa eskalasi. Dokumen06 mencatat backend final9 file/70 test PASS, typecheck dan scoped lint PASS. Dokumen03 melaporkan re-review scoped6 file/49 test PASS pada fix wave stabil: AUTH-01 exact sesi penerbit + HMAC konteks browser ditutup; AUTH-03 body strict/bounded logout dan DELETE ditutup; AUTH-02 minimum11 detik pada request/resend recovery dimitigasi, termasuk unknown synthetic dan provider failure. Semua merupakan bukti worker terkait; bukan run DevOps atau full gate QA.

Floor11 detik memakai monotonic clock dengan timeout provider10 detik + margin1 detik; input/config/throttle invalid tidak menunggu floor. Request masih menahan koneksi sampai deadline, sehingga ukur concurrency, pool, latensi dan kapasitas sebelum trafik tinggi. Provider/DB lambat dapat menghasilkan latensi lebih dari11 detik; mitigasi bukan bukti timing konstan produksi. No automatic retry Twilio tetap berlaku. Proof verifikasi email terikat exact sesi penerbit dan browser: membuka tautan dari sesi/browser berbeda harus ditolak; operator tidak boleh mengatasi penolakan dengan memindahkan proof atau menurunkan binding.

Routing canonical akun lintas peran `/account` dan `/account/security`; VENDOR landing `/vendor`. Dokumen04 final menambahkan empat alias exact di `next.config.ts`, temporary307 sebelum layout guard customer: `/dashboard/settings` dan `/dashboard/settings/profile` → `/account`, `/dashboard/settings/security` → `/account/security`, `/dashboard/account` → `/account`. Kontrak konfigurasi5 test PASS dan lint scoped PASS; browser/produksi tetap gate terpisah. Alias bukan wildcard dan bukan pemberian izin; guard canonical tetap wajib. Smoke rilis harus mencakup keempat alias lintas role serta pengguna tanpa sesi.

## Checklist kualitas sebelum integrasi

Perintah berikut adalah checklist untuk dijalankan ROOT/operator pada source final; **belum dijalankan dalam audit ini**. Tooling dapat memuat dotenv secara otomatis: pastikan environment sudah diarahkan ke sandbox aman sebelum perintah berinteraksi dengan DB. Generate/validate tidak membutuhkan credential; build bukan migrate.

```bash
npm run db:validate
npm run typecheck
npm run lint
npm test
NEXT_PUBLIC_APP_URL=https://menujuakad.com npm run build
npm run test:e2e
bash deploy/scripts/package-standalone.sh /tmp/menujuakad-auth-multimethod.tar.gz
```

Gunakan managed Playwright webServer existing dan Chromium jika belum tersedia; tidak membuat proses background manual. Catat source/diff, Node sesuai engines (22.12+ pada major22 atau24+), Prisma7.10, Next16.3.8, BUILD_ID, checksum artifact dan hasil QA. Scan source/artifact/static dengan secret scanner terpasang dengan redaksi; jangan memasukkan `.env`, DIRECT_URL atau secret provider ke artifact. Pipeline existing berupa script npm/manual; CI/CD otomatis belum dibuktikan terpasang. Urutannya lint/typecheck → unit/database → build → E2E/visual/security → artifact → staging → keputusan rilis.

## Rollout database bertahap

1. Inspect target database/role/history/checksum dan baseline. Target tooling preproduction existing harus `menujuakad-preproduction`; jangan memakai credential produksi untuk script opt-in preproduction. Database legacy fondasi9 tabel perlu migrasi auth/payment existing lebih dulu; baseline auth/payment13 tabel memakai mode inspection default. Tidak menganggap semua6 migrasi sudah diterapkan.
2. Snapshot Neon/PITR/branch sebelum perubahan, catat waktu/branch/database dan retention; uji restore ke sandbox terpisah, bukan menimpa aktif. Backup grants/role privilege metadata dan pointer/image/Compose terpisah; tidak menyimpan secret di laporan. Belum ada script snapshot/restore Neon otomatis dalam task ini. Tetapkan operator/RPO/RTO dan bukti restore sebelum operasi aktif.
3. Jalankan preflight hitungan dan inspect privilege read-only. Empat hitungan invalid_emails/email_conflicts/invalid_phones/phone_conflicts wajib0. Selesaikan konflik secara manual dengan bukti kepemilikan; jangan merge/hapus akun atau menandai contact verified tanpa bukti.
4. Rehearsal semua migrasi dan grants pada sandbox PostgreSQL/Neon dengan role owner/runtime terpisah, termasuk race dua koneksi. PGlite lokal tidak membuktikan contention Neon nyata.
5. `20261009000000_auth_roles` menambah CLIENT/VENDOR dan harus committed sebelum migrasi berikutnya. `20261009001000_auth_multimethod` transaksi sendiri, lock User SHARE ROW EXCLUSIVE, lock_timeout5s/statement_timeout60s, preflight ulang, normalisasi, email nullable, metadata sesi, tabel account/token, trigger registrasi. `20261009002000_auth_sms_policy` kemudian menambah flag SMS permanen default false dan CHECK `User_sms_otp_verified_check`, transaksi dengan lock_timeout5s/statement_timeout60s. Akun lama termasuk nomor verified tetap false; nomor unlink harus disertai disable flag atomik. Keberadaan credential dan reauth diperiksa layanan. Jangan membungkus ketiga file dalam satu transaksi SQL.
6. Terapkan lewat `npm run db:deploy` dengan DIRECT_URL owner pada environment tooling yang diverifikasi. Script menjalankan semua migrasi pending berurutan; enum, multimethod dan kebijakan SMS merupakan tiga stage internal, bukan pilihan flag per-file. Jangan memakai db:migrate, db push, seeder atau SQL migration manual untuk menyiasati history.
7. Sesudah schema lengkap, jalankan grants existing melalui owner. Script grants transaksi mencabut UPDATE luas/kolom privilege lama dan menetapkan hak terpilih. Trigger hanya menyasar nama runtime `menujuakad_runtime_preproduction`; rename role tanpa adaptasi trigger/grants adalah blocker.
8. Inspect sesudah migrasi lalu audit column privileges dan negative tests runtime. `--multimethod` memeriksa15 tabel/6 migrasi/12 CHECK dan checksum pada kontrak final, tetapi output has_table_privilege tidak cukup membuktikan hak UPDATE kolom. Pastikan runtime tidak superuser/owner/inheritance/schema CREATE; User boleh INSERT/UPDATE smsOtpEnabled sesuai grants final, tanpa UPDATE role/status/DELETE, session tanpa UPDATE ownership/hash/expiry, token tanpa UPDATE payload/purpose/hash. Grants file juga menyentuh DML invitation dan PaymentTestRequest; review cakupan ini sebelum penerapan, bukan menganggap grant auth saja.
9. Baru mulai kandidat source final dengan DATABASE_URL runtime, AUTH_SECRET dan provider bertahap; smoke password/role/session dulu, kemudian Google, email, SMS pada sandbox. Jangan memperluas izin runtime dengan DATABASE_URL owner.

Contoh command read-only/tooling (target dan opt-in wajib disediakan operator terlebih dulu; bukan instruksi untuk seed):

```bash
npm run db:preflight:neon -- --config-only
npx prisma migrate status
npx tsx scripts/database/auth-preproduction-inspect.ts
npx tsx scripts/database/prepare-auth-pg-env.ts
```

Inspect dan prepare env di atas memakai guard seed config walaupun tidak melakukan seed: NODE_ENV bukan production, SEED_ENVIRONMENT=preproduction dan SEED_CONFIRMATION=`menujuakad-preproduction:11-dummy-accounts`; guard juga mengunci nama database. File PostgreSQL `/tmp/menujuakad-auth-ops-20261008/pg-owner.env` dibuat0600 dengan O_EXCL/O_NOFOLLOW; existing file menyebabkan gagal, jangan menimpa/baca/cetak nilainya. `--runtime` menghasilkan file runtime terpisah. Jangan `source` file hasilnya: format KEY=value tidak memakai shell quoting. Bila memakai Python wrapper, parse sebagai data key/value dan pass lewat env ke subprocess tanpa shell/log. `psql` harus tersedia dan versinya kompatibel dengan target.

Dengan environment PG* owner sudah dimuat secara aman oleh operator:

```bash
psql -X -v ON_ERROR_STOP=1 -f scripts/database/auth-runtime-inspect.sql
psql -X -v ON_ERROR_STOP=1 -f scripts/database/auth-multimethod-preflight.sql
```

Hanya sesudah backup, rehearsal dan otorisasi operasi target:

```bash
npm run db:deploy
psql -X -v ON_ERROR_STOP=1 -f scripts/database/auth-runtime-grants.sql
npx tsx scripts/database/auth-preproduction-inspect.ts --multimethod
```

`db:preflight:neon` tanpa config-only memeriksa koneksi/fondasi9 model/checksum awal, bukan seluruh multimethod atau DML. Script inspection preproduction tidak dapat langsung dipakai untuk produksi bernama lain; diperlukan tooling setara yang diverifikasi sebelum rollout produksi.

## Kompatibilitas legacy dan pemulihan

**Jangan deploy aplikasi multimethod terhadap schema legacy.** Query admin/analytics/billing sekarang memakai role `IN ('CUSTOMER','CLIENT')`. PostgreSQL enum lama belum mengenal CLIENT, sehingga query dapat gagal `invalid input value for enum UserRole` walau semua akun masih CUSTOMER dan tidak ada registrasi baru. Prisma schema final juga membaca kolom/session/account baru yang tidak ada sebelum migrasi. CUSTOMER sebagai alias aplikasi hanya memberi kompatibilitas data, tidak memberi kompatibilitas schema. Migrasi enum saja juga belum cukup: source final membutuhkan smsOtpEnabled serta seluruh kolom/tabel multimethod dan grants final.

Jika migrasi kedua gagal sebelum commit, seluruh perubahan transaksi kedua rollback; enum migration pertama yang committed boleh tetap. Inspect Prisma failed migration/history dan penyebab konflik/timeout sebelum retry. `prisma migrate resolve --rolled-back 20261009001000_auth_multimethod` hanya setelah operator membuktikan transaksi benar-benar rollback dan history sesuai; jangan resolve --applied untuk menutupi kegagalan. Jika migrasi kebijakan SMS gagal, inspect rollback transaksi dan history migrasi tersebut dengan prosedur yang sama sebelum retry; jangan menandai applied tanpa bukti. Tidak ada down migration siap pakai.

Setelah schema commit, pemulihan utama adalah forward fix. Aplikasi lama mungkin menganggap email wajib/role hanya CUSTOMER/SUPERADMIN; sesudah akun phone-only/CLIENT/VENDOR dibuat, rollback image lama dapat mematahkan DTO/guard/query. Jangan mengembalikan email NOT NULL atau menghapus account/token/enum. Snapshot restore perlu maintenance/pause writes, rekonsiliasi data sejak snapshot dan endpoint/runtime menuju restore target, kemudian smoke serta dokumentasi kehilangan data sesuai RPO. Restore bukan zero-data-loss otomatis.

Image terakhir tercatat sebelum increment ini `menujuakad-web:preview-20261009-login`; hanya bisa menjadi rollback aplikasi setelah kompatibilitas DB dibuktikan, atau sebagai fallback publik fail-closed yang diuji. Template switch menggunakan kedua Compose dan image eksplisit:

```bash
sudo -n env MENUJUAKAD_IMAGE=menujuakad-web:RELEASE_VALIDATED docker compose \
  --env-file /srv/menujuakad/deploy/release.env \
  --project-name menujuakad \
  -f /srv/menujuakad/deploy/compose.yaml \
  -f /srv/menujuakad/deploy/compose.neon.yaml \
  up -d --wait --wait-timeout 90 web
```

Placeholder RELEASE_VALIDATED wajib diganti tag nyata dengan checksum/bukti QA sebelum eksekusi. Sebelum switch backup pointer/Compose metadata dan siapkan image rollback nyata; sesudah smoke sukses baru pointer diperbarui atomik. Jangan memakai contoh backup responsive historis sebagai rollback multimethod otomatis. Overlay tanpa Neon hanya fallback frontend DB503, bukan rollback auth/schema; jangan digunakan pada rilis auth normal. Tidak deploy atau menguji rollback dalam audit ini.

## Smoke login, sesi dan akses tanpa kebocoran

GET smoke publik yang aman setelah kandidat tersedia (tidak dijalankan worker):

```bash
curl --fail --max-time 15 https://menujuakad.com/api/health/live
curl --fail --max-time 15 https://menujuakad.com/api/health
curl --fail --max-time 15 https://menujuakad.com/api/auth/capabilities
curl --silent --output /dev/null --write-out '%{http_code}\n' https://menujuakad.com/account
```

Untuk transaksi nyata gunakan akun sintetis sandbox, Playwright existing dan secret runtime dari channel privat; jangan menulis password/token dalam argv curl, laporan, screenshot, trace/HAR atau console. GET csrf mengeluarkan token/cookie, sehingga tidak dijalankan dengan output mentah ke terminal laporan. Browser bootstrap CSRF → POST Origin exact + X-CSRF-Token + JSON; simpan hanya status dan assertion boolean aman. Cookie jar/storageState dan artefak sensitif harus privat/retensi terbatas; laporan tidak memuat cookie mentah.

- Config absent: csrf503, capability false, login/method unavailable tidak membuat sesi; private tetap ditolak. Config valid/schema/grants absent tetap gagal aman, bukan bypass.
- Wrong password401, invalid payload400, foreign/missing Origin/CSRF403, throttle429+Retry-After; tidak membedakan identifier existing lewat pesan/log. Jangan menembak throttle produksi untuk pengujian.
- Signup email/phone membuat CLIENT saja; privilege fields ditolak; contact unverified tidak boleh recovery/link. Legacy CUSTOMER login masih berfungsi; CLIENT→dashboard, VENDOR→vendor, SUPERADMIN→admin; akun sendiri `/account` dan `/account/security` lintas peran.
- Password login sukses menerbitkan opaque cookie `menujuakad_session`, HttpOnly/Secure production/SameSite=Lax/path `/`, TTL7hari. Token hash bukan token mentah di DB; cookie palsu/expired/revoked/suspended ditolak.
- Logout/revoke current menolak cookie lama; reset/password rotation mencabut sesi sesuai kontrak, list sesi tidak mengandung hash/IP/UA mentah. IDOR/role cross-access dan kepemilikan selalu diuji server.
- Google cancel/mismatch/expired/replay gagal; same email tidak auto-link, unlink metode terakhir ditolak; provider error tidak memberi sesi. Periksa nonce/audience/signature via test sandbox, tanpa log code/id_token.
- SMS OTP202 tidak membuka private; salah/replay/expired/resend invalidates old proof; recovery tidak auto-login setelah reset. Enabled SMS harus enforced server, bukan sekadar UI.
- Preview tetap sintetis/noindex tanpa DB/provider/mutasi nyata; periksa 320/390/768/1440px, keyboard/no-JS dan error503/429; provider live dinyatakan terverifikasi hanya dengan evidence terpisah.

## Monitoring dan keputusan penerbitan

Monitoring existing: Compose ps/log tail terbatas dan journalctl Caddy dengan redaksi; jangan full inspect environment atau compose config tanpa --quiet. Readiness/live setiap30–60detik, alarm usulan setelah3 kegagalan berurutan; auth503/provider timeout >5% selama5menit; disk tersisa <20%, RAM >80% limit berkelanjutan dan restart berulang. Ambang ini usulan, bukan alert terpasang. Monitor lonjakan429, login failure, OAuth error generik, delivery accepted versus delivery aktual, latency p95 dan expiry TLS; jangan memakai email/phone/IP/session/token sebagai label metric.

Retensi session/token/throttle serta cleanup expired perlu job terencana dan least privilege, belum ada bukti scheduler operasional auth dalam audit ini. Log application/provider aman tetap perlu verifikasi source final dan proxy; jangan menyimpulkan aman hanya karena adapter menampilkan pesan generik.

Gate siap rilis: QA source final, snapshot/restore dan RPO/RTO nyata, preflight0, migrasi/history/checksum lengkap, DML runtime/negative privileges teruji, kandidat healthy dan auth smoke berhasil, provider sandbox sesuai kanal yang diaktifkan, rollback kompatibel, backup konfigurasi/pointer dan browser HTTPS final. Capability true/health200 sendiri tidak memenuhi gate. Provider boleh tetap unavailable secara eksplisit; jangan memberi label Google/email/SMS live sebelum verifikasi. Status akhir audit ini: **handoff dan placeholder tersedia; integrasi layanan, rollout DB, validasi QA akhir dan produksi masih terbuka**.
