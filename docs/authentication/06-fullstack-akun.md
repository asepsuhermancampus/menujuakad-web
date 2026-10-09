# Implementasi akun dan pemulihan autentikasi

## Cakupan dan status

Checkpoint9 Oktober2026. Backend akun sendiri, pemulihan password, proof email/SMS, OTP login opt-in dan daftar/pencabutan sesi tersedia serta diuji lokal. Stack existing dipertahankan: Next16 App Router/runtime Node, TypeScript strict, Zod strict, scrypt existing, Prisma7 dan PostgreSQL/PGlite untuk transaksi lokal. Resend dan Twilio menggunakan fetch server-only; tidak menambah dependency.

Schema `User.smsOtpEnabled` beserta migration/grants dikerjakan worker data setelah ROOT menemukan gap kebijakan faktor. Worker06 menghubungkan flag aktual ke security DTO, pengubahan kebijakan dan core login. Tidak ada penyimpanan pengaturan faktor di proof sementara. Core Google, UI dan schema tidak diubah oleh worker06; perubahan core dibatasi integrasi OTP password, selection/recheck flag, respons202 dan pengujian terkait yang diizinkan ROOT.

Status terpisah: **rancangan tersedia, kode tersedia, teruji lokal; layanan/provider dan produksi belum terverifikasi.** Tidak membaca nilai `.env`, mengirim provider live, menjalankan migrasi/grants/seed aktif, commit/push/deploy atau mengganti konfigurasi VPS. Full suite/build/E2E/browser merupakan gate QA/ROOT, bukan hasil worker06.

## Struktur dan batas tanggung jawab

```text
src/server/account/
  account-input.ts         validasi strict mutasi akun
  account-dto.ts           profil/security/perangkat aman
  account-repository.ts    user/session lock, ownership, rotasi dan revocation
  account-service.ts       profil, reauth/password, faktor, unlink dan sesi
  contact-service.ts       pending contact dan konsumsi proof terverifikasi
  account-handlers.ts      boundary HTTP akun
  http.ts, errors.ts        CSRF context, throttle, cookie dan error aman
  account-*.test.ts         HTTP boundary dan transaksi Prisma/PGlite
src/server/auth/
  proof-crypto.ts           CSPRNG OTP dan HMAC terpisah per domain
  proof-repository.ts       payload whitelist, lock/consume/attempt atomik
  proof-delivery.ts         pending → accepted serta kompensasi provider
  public-delivery-timing.ts deadline minimum publik dan clock injectable
  recovery-service.ts      eligibility, forgot dan reset atomik
  verification-service.ts  proof email awal terikat sesi asal
  otp-service.ts           register/reset/login/resend purpose-bound
  otp-http.ts              cookie login-pending, tanpa sesi penuh
  recovery-handlers.ts     boundary HTTP pemulihan/verifikasi
  *-integration.test.ts    transaksi dan regresi lifecycle proof
src/server/integrations/auth/
  providers.ts             Resend/Twilio nyata, timeout dan receipt teredaksi
  providers.test.ts        konfigurasi absent/receipt/error provider
src/app/api/account/**/route.ts
src/app/api/auth/{forgot-password,reset-password,email,otp}/**/route.ts
```

Route hanya meneruskan request ke handler, runtime Node dan parameter dinamis Next16 berbentuk Promise. Modul server diberi `server-only`; DTO mengimpor type frontend saja. Service utama kurang dari300 baris; source rancangan dan dokumen lain tidak diduplikasi atau ditimpa.

## Kontrak endpoint final

Semua respons JSON `Cache-Control:no-store`; mutasi memakai exact Origin, CSRF browser-bound dan parser JSON streaming maksimal4096 byte. Input strict menolak privilege/field tambahan. Error aman400/401/403/404/409/429/503, tanpa hash/token/password/stack/provider payload.429 menyertakan Retry-After; cooldown resend60 detik mempunyai Retry-After60.

| Endpoint                                                            | Hasil dan batas izin                                                                                                                                                                                  |
| ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| POST `/api/auth/forgot-password`                                    | 202 pesan “Jika akun dapat dipulihkan, petunjuk akan dikirim.” Email tidak mengembalikan proof; phone mengembalikan challenge opaque setara untuk target eligible/unknown                             |
| POST `/api/auth/reset-password`                                     | Strict `{token,password}`; consume reset + hash baru + revoke seluruh sesi dan pending proof satu transaksi;200 redirect `/login`, tanpa auto-login                                                   |
| POST `/api/auth/email/request`                                      | Strict `{identifier,purpose:'register'                                                                                                                                                                | 'verify'}`; sesi ACTIVE pemilik email wajib; proof terikat **tokenHash sesi asal dan HMAC konteks browser**.202 generik, tanpa bearer token email |
| POST `/api/auth/email/verify`                                       | Strict `{token}`; sesi asal masih ACTIVE, konteks browser cocok dan email akun tetap sama; consume atomik, verified badge,200 redirect login. GET tidak consume                                       |
| POST `/api/auth/otp/request`                                        | Strict `{}`; sesi pemilik nomor existing, permintaan verifikasi awal;202 challenge opaque. Tidak menerima userId/purpose dari browser                                                                 |
| POST `/api/auth/otp/verify`                                         | Strict `{token,code}`; register→verified phone/redirect login; reset→proof reset600 detik; password-login→cookie sesi setelah seluruh proof valid                                                     |
| POST `/api/auth/otp/resend`                                         | Strict `{token}`; browser binding, cooldown dan budget target/IP; challenge/kode lama invalid. Subtype account memerlukan owner session, perubahan contact juga fresh reauth                          |
| GET/PATCH `/api/account/profile`                                    | Own-user DTO; PATCH hanya `{name}` trim1–100, sesi ACTIVE cukup sesuai ruling ROOT/kontrak UI; field identitas/peran ditolak                                                                          |
| GET/PATCH `/api/account/security`                                   | DTO aktual `smsOtpEnabled`, metode login, verified flags, freshness dan capabilities. PATCH strict boolean; reauth≤5 menit; enable memerlukan password, verified phone dan SMS ready                  |
| POST `/api/account/reauthenticate`                                  | Password akun sesi; throttle; recheck versi credential di bawah lock, rotasi token tanpa memperpanjang expiry; DTO batas5 menit                                                                       |
| POST `/api/account/password`                                        | Fresh reauth; password existing membutuhkan currentPassword benar. Menambah password memerlukan linked Google dan contact verified; revoke others + invalidate proof + rotate current atomik          |
| POST `/api/account/email/request`, `/email/verify`                  | Pending email baru; fresh reauth; request tidak mengembalikan bearer proof. Verifikasi user-bound/unique atomik; identitas lama tetap aktif sebelum proof valid                                       |
| POST `/api/account/phone/otp`, `/phone/verify`                      | Pending E.164; fresh reauth; browser/user/purpose binding dan attempts atomik; claim unique baru setelah kode valid                                                                                   |
| POST `/api/account/email/unlink`, `/phone/unlink`, `/google/unlink` | Fresh reauth dan last-method guard di bawah user lock; revoke others/rotate/invalidate proof. Phone unlink mematikan OTP dalam transaksi yang sama                                                    |
| GET `/api/account/sessions`                                         | Maks50 sesi aktif, metadata ISO dan label browser/OS kasar, tanpa tokenHash/IP/UA mentah; lastSeen diperbarui pada pembacaan daftar maksimal tiap5 menit                                              |
| DELETE `/api/account/sessions/{id}`                                 | Scoped user; missing/not-owned404 sama. Current boleh tanpa fresh reauth, cookie dibersihkan/redirect login; sesi lain memerlukan reauth                                                              |
| POST `/api/account/sessions/revoke-others`                          | Fresh reauth; revoke selain current dan rotate current atomik; DTO jumlah revoked                                                                                                                     |
| POST `/api/auth/login` existing                                     | Password dengan faktor opt-in:202 `data:{otpRequired,token,expiresIn:300,resendAfter:60}` + HttpOnly login-pending cookie; **tanpa sesi penuh** sampai verify. Akun lain tetap memakai jalur existing |

Ruling keamanan ROOT menguatkan kontrak PM untuk proof email awal: request register tidak anonim dan verify hanya pada sesi tepat yang meminta proof. Ini menutup praregistrasi email korban dengan password penyerang. Tidak membutuhkan fresh reauth untuk verifikasi awal sehingga TTL24 jam tidak dipotong menjadi5 menit; rotasi/logout/expiry sesi asal membatalkan kemampuan proof tersebut dan pengguna meminta proof baru. Perubahan contact melalui API akun tetap membutuhkan fresh reauth.

## Invariant dan transaksi

User row dikunci sebelum session/credential/account/proof sensitif. Sesi dibaca ulang menggunakan userId/sessionId/tokenHash, expiry absolut, revokedAt dan status/peran DB aktual. CLIENT/CUSTOMER/VENDOR/SUPERADMIN mengakses akun sendiri; tidak menerima target userId atau role dari browser. Rotasi memakai delete/create sesuai grants immutable tokenHash/expiry dan mempertahankan expiry asli.

Last-method guard menghitung linked Google atau password dengan minimal satu contact verified. Credential tidak dibiarkan kehilangan contact verified terakhir meskipun Google masih ada. Dua unlink paralel tidak dapat meninggalkan nol metode; request yang kehilangan sesi karena rotasi paralel juga ditolak. Contact change hanya mengklaim unique identifier setelah proof berhasil; tidak auto-link/merge berdasarkan email atau nomor.

Reset memerlukan contact yang **masih** verified/current dan credential existing. Google-only, suspended, contact unverified dan unknown mempunyai outcome publik generik. Proof reset lama yang identitasnya berubah ditolak; password/contact/policy changes menginvalidasi proof tertunda. Reset mempertahankan kebijakan OTP persisten dan mencabut seluruh sesi dalam transaksi yang sama.

OTP enam digit CSPRNG berumur5 menit, HMAC secret + challengeId + identifier + subtype, maksimal5 tebakan. Attempts salah dikomit melalui hasil kegagalan transaksi, bukan exception yang merollback hitungan. Conditional consume membatasi proof sekali pakai; purpose/user/browser tidak dipilih body. Email/reset acak32 byte, SHA256 disimpan; reset email15 menit, email verification24 jam, proof reset hasil OTP10 menit.

Password login dengan flag OTP true tidak menjalankan rotasi sesi penuh. Challenge terikat browser CSRF, cookie login-pending HttpOnly dan HMAC versi credential. Validasi OTP memeriksa ulang ACTIVE, flag, verified/current phone dan credential di bawah user lock sebelum menerbitkan sesi. Flag enable race diperiksa ulang di `rotatePasswordSession` sehingga jalur password-only ditolak. Enable/disable menginvalidasi proof dan mencabut sesi lain/merotasi current; login Google tetap metode alternatif sesuai kebijakan PM.

Throttle shared DB memakai helper HMAC existing. Send email/SMS berbagi scope per kanal:3/target/jam dan10/IP/jam termasuk recovery/contact/resend/OTP login. Login/reauth5/identifier per15 menit dan100/IP; security10/user per15 menit; OTP proof juga memiliki IP budget dan batas5/challenge; reset10/IP per15 menit. Keberhasilan reauth/OTP login mengurangi satu reservasi identifier saja dalam transaksi, tanpa menghapus kegagalan paralel atau budget IP.

## Delivery, privasi dan timing

Resend memerlukan RESEND_API_KEY + AUTH_EMAIL_FROM; Twilio memerlukan SID/token/from number sesuai capability existing. Config absent503 global sebelum lookup target; tidak ada fallback OTP console atau pengiriman palsu. Fetch menggunakan timeout≤10 detik, redirect error dan error teredaksi. Resend mengirim Idempotency-Key; Twilio Programmable Messaging tidak menjamin client idempotency, sehingga POST SMS tidak di-retry otomatis. Cooldown/proof persistent membatasi retry aplikasi; exactly-once delivery pada timeout jaringan tidak diklaim.

Proof disimpan pending dan belum dapat diverifikasi sebelum adapter menerima receipt. Karena payload immutable pada grants, transaksi mengganti row pending melalui delete/create dengan payload accepted setelah receipt. Jika provider/DB completion gagal, pending proof dikonsumsi/dibatalkan. Permintaan contact terautentikasi memberi503 saat delivery gagal; recovery publik/register memakai pesan generik tanpa klaim terkirim dan proof gagal tetap invalid.

Deadline minimum11 detik memakai monotonic clock: timeout provider10 detik + margin1 detik. Cabang `concealFailure` dipusatkan pada delivery sehingga forgot dan resend recovery, termasuk synthetic unknown dan provider failure, mengikuti floor yang sama. Helper timing juga membungkus request recovery; config missing/input/throttle tidak menunggu floor. Clock/wait injectable hanya dependency server pada test, tidak diterima body HTTP. Ini mengurangi oracle provider; bukan klaim latensi DB/jaringan menjadi konstan sempurna atau bukti timing di produksi. Pertimbangkan outbox dan observabilitas sebelum trafik tinggi; request masih menunggu deadline.

Bearer proof email hanya URL fragment canonical `/reset-password#token=…`, `/verify-email#token=…` atau `/account/security#token=…`, tidak JSON request-send. Token/kode/provider payload tidak dilog module ini. DTO frontend tepat mengikuti `ProfileDto`, `SecurityDto`, `SessionDto`; avatar hanya HTTPS googleusercontent tanpa credentials/port, deviceLabel tidak menampilkan user-agent mentah.

## Bukti pengujian dan handoff

TDD awal terlihat gagal pada fitur belum tersedia; regresi tambahan melihat kegagalan untuk Google-only tanpa linkage, faktor password-only bypass, OTP202 HTTP, resend exhausted, serta perbaikan terkait. Pengujian memakai Prisma asli dan seluruh migration lokal di PGlite, provider fixture terpisah dari adapter nyata. Tidak mengakses Neon aktif.

| Gate                                                                                       | Hasil                                                                                                                                                                                                           |
| ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Scoped auth/account/provider checkpoint sebelum perbaikan keamanan akhir                   | 22 file/244 test PASS,57,66 detik; bukan full suite dan bukan source final sesudah hardening email/timing                                                                                                       |
| Scoped final: account + recovery/timing/HTTP + core service/handler/integration + provider | 9 file/70 test PASS,27,15 detik; termasuk sesi/konteks browser asal email, strict logout/DELETE, resend timing, no session sebelum OTP, stale password, policy race, reset single-use dan last-method/ownership |
| `npx tsc --noEmit`                                                                         | PASS exit0 setelah source final                                                                                                                                                                                 |
| ESLint scoped semua source/test/route yang dikerjakan                                      | PASS exit0                                                                                                                                                                                                      |
| `git diff --check`                                                                         | PASS exit0 pada checkpoint final                                                                                                                                                                                |

Unique contact belum verified tetap dapat mereservasi identifier sesuai keputusan PM; pemulihan reservasi memerlukan prosedur administratif dengan proof kepemilikan, tanpa auto-merge/reclaim pada increment ini.

PGlite mempunyai satu koneksi terkelola; uji paralel membuktikan conditional writes/serialisasi terjadwal, bukan contention dua koneksi Neon independen. Provider tests memakai mock fetch/receipt dan integration fixture; tidak membuktikan delivery SMS/email, sender ownership atau konfigurasi provider live. Kesiapan penerapan schema/migration/grants target aktif, audit operasional terpusat, retensi cleanup proof/session, browser/final full suite/build/E2E, sandbox provider dan produksi tetap handoff ROOT/QA/DevOps. Tidak mengklaim backend bisnis lain atau readiness komersial selesai.

Dokumen ini satu file06 dengan satu H1. File01/02/04/05 existing tidak diulang; file03/08 sudah tersedia dan file07 dimiliki worker QA yang menyusul. Nomor yang masih dikerjakan worker lain tidak dibuat placeholder atau duplikat.
