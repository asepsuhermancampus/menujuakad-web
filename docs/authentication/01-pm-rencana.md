# Rencana implementasi autentikasi Menuju Akad

## Mandat dan status dokumen

Tanggal audit: 9 Oktober 2026. Dokumen ini menjadi kontrak kerja PM, fullstack, UI dan QA untuk implementasi autentikasi lengkap yang sudah diperintahkan user: Google otomatis daftar/masuk, email atau telepon dengan kata sandi, pemulihan, OTP SMS kondisional, profil dan keamanan, pengaitan metode terverifikasi, sesi dan logout, CSRF, pembatasan percobaan, serta CLIENT/VENDOR/SUPERADMIN. Tidak ada permintaan persetujuan implementasi ulang. Deploy, push, perubahan VPS dan migrasi database aktif berada di luar tugas ini.

Status dokumen: **rencana disinkronkan dengan kode dan bukti lokal setelah resume**. Kontrak model, backend autentikasi/akun, UI dan migrasi lokal tersedia. PM menyelaraskan dokumentasi existing; tidak menjalankan full gate, migrasi aktif, provider live atau rilis. Bukti di bawah berasal dari dokumen pemilik masing-masing, bukan pengujian ulang oleh PM.

Sumber yang diperiksa: `AGENTS.md`, role `pm.md`, master spec `../../../menujuakad-rancangan/MENUJU_AKAD_AGENT_MASTER_SPEC.txt`, progres bersama, kedua changelog, `../architecture.md`, `../database.md`, schema Prisma, auth/service/repository/policy, guards, redirect, halaman auth, akun dan identitas customer existing. Arahan sesi memperluas cakupan backend yang pada catatan AGENTS/progres sebelumnya masih frontend saja. Master spec tetap sumber arsitektur; CLIENT/VENDOR merupakan tambahan instruksi aktif, CUSTOMER tetap alias kompatibilitas. Acuan UI: Editorial Ivory & Gold, Noto Serif + Manrope; dokumen ini tidak mengklaim inspeksi visual Stitch baru.

## Checkpoint resume autentikasi — 9 Oktober 2026

| Dimensi | Status aktual dan bukti |
| --- | --- |
| Rancangan | Keputusan implementasi sudah berlaku; tidak memerlukan approval ulang. Dokumen01 ini menyelaraskan kontrak source04/06, UI05, data02, security03, QA07 dan handoff08 |
| Kode tersedia | Signup/login identifier, Google, recovery/verifikasi, CSRF/throttle, RBAC, profil/security/sesi dan OTP persisten tersedia; preview tetap sintetis |
| Data lokal | [Data02](02-data-engineer-database.md):15 tabel,6 migrasi/12 CHECK; Prisma validate/generate PASS; resume SMS5 file/37 test PASS; schema/grants target aktif belum diterapkan |
| Backend lokal | [Backend06](06-fullstack-akun.md): scoped final9 file/70 test PASS, typecheck/scoped lint PASS; tidak membuktikan provider nyata |
| Security lokal | [Security03](03-security-audit.md):6 file/49 test PASS; AUTH-01 exact sesi/browser dan AUTH-03 strict body ditutup; AUTH-02 floor11 detik dimitigasi dengan residual |
| Routing lokal | [Core04](04-fullstack-autentikasi.md): empat alias exact307 sebelum layout customer;5 test konfigurasi PASS; canonical tetap server-guard |
| QA sementara | [QA07](07-qa-validasi.md): baseline600/600 test dalam70 file PASS serta build baseline PASS; alias berubah setelah baseline, final rebuild/E2E masih pending, run140 kasus sedang berjalan. QA-02 overflow `/register`320→326px dan720px teks200%→732px menunggu UI fix/rerun. Bukan gate final seluruh source |
| Terhubung layanan | Neon fondasi preproduction pernah terhubung; multimethod DML/grants, Google Console, Resend dan Twilio live belum diverifikasi. Capability boolean hanya kesiapan konfigurasi |
| Produksi | Rilis terakhir tercatat `preview-20261009-login`, login503 fail-closed karena AUTH_SECRET runtime absent pada checkpoint tersebut. Increment multimethod belum deploy/di-smoke; status produksi tidak diperiksa ulang PM |

Audit fondasi sebelumnya mengidentifikasi email wajib, role CUSTOMER-only dan form simulasi. Itu kondisi historis sebelum increment, bukan gap kode saat ini. Hash scrypt, opaque DB session7 hari dan cookie HttpOnly existing dipertahankan. Angka445 unit/106 E2E milik rilis login historis dan tidak digunakan untuk menyatakan increment ini selesai.

## Keputusan domain, identitas dan peran

1. Pendaftaran publik selalu CLIENT. Body dengan `role`, `status`, `userId`, `emailVerifiedAt` atau field privilege lain ditolak. VENDOR dan SUPERADMIN hanya diprovisikan melalui tooling/admin sah dengan audit; tidak ada dropdown pendaftaran role dan tidak ada API promosi publik pada increment ini.
2. CUSTOMER tidak dihapus/dikonversi massal. `isClientRole(role)` menerima CLIENT/CUSTOMER. `VerifiedSession` membaca role/status aktual user dari DB pada setiap request; cookie/DTO bukan sumber RBAC. Customer resource tetap memerlukan ownership/membership. SUPERADMIN tidak otomatis masuk guard customer.
3. Default redirect CLIENT/CUSTOMER ke `/dashboard`, SUPERADMIN ke `/admin`, VENDOR ke `/vendor`. Akun sendiri canonical `/account` dan `/account/security` tersedia bagi seluruh role ACTIVE bersesi sah. `/vendor` adalah landing akun, bukan dashboard bisnis vendor lengkap; akses VENDOR ke undangan/admin ditolak. `next` hanya path lokal allowlist yang diperbolehkan role; `/account` dan `/account/security` dimasukkan eksplisit untuk semua role. Ditolak: URL absolut, `//`, backslash, control character, traversal dan decoding berulang.
4. Identifier email: trim/lowercase, maksimum254 karakter, tanpa normalisasi titik/plus Gmail. Telepon: parser Indonesia `08…`/`628…`/`+628…` ke E.164; format internasional lain wajib E.164 valid. Uniqueness database menangani race; normalized phone adalah identitas, bukan display string.
5. Kata sandi baru/diubah:12–256 karakter, maksimum1024 byte UTF-8; tanpa aturan wajib simbol/kapital. Tidak di-trim. Login lama tetap menerima1–256 karakter supaya hash existing kompatibel. Konfirmasi password adalah validasi UI; service tidak menerima field confirmation.
6. Google mengidentifikasi user dengan `sub`, bukan email. Login identity yang sudah terhubung tidak memerlukan kecocokan ulang email terkini Google untuk identitas; user suspended selalu ditolak. User Google baru membutuhkan `email_verified=true` dan email valid, dibuat CLIENT dalam satu transaksi dengan identity. Verified email dapat dicatat pada saat pendaftaran baru.
7. **Tidak auto-link berdasarkan email.** Jika Google belum terhubung tetapi email sama dengan akun existing, hentikan dengan pesan aman: “Masuk dengan metode yang sudah digunakan, lalu hubungkan Google di Pengaturan.” Jangan memindahkan identity/password/role atau menggabungkan akun. Unique conflict paralel tidak menghasilkan akun ganda.
8. Linking membutuhkan sesi aktif, reautentikasi maksimal5 menit dan proof kepemilikan metode baru. Google subject sudah milik akun lain selalu ditolak. Unlink memerlukan reauth dan masih ada metode login sah lain: Google lain tidak diasumsikan, password harus disertai minimal satu identifier terverifikasi. Tidak boleh melepas metode terakhir atau contact terakhir yang dipakai credential.
9. Email/telepon baru berada pada challenge pending; tidak mengganti identitas lama sebelum proof terverifikasi dan transaksi unique sukses. PATCH profil hanya nama; pengubahan contact melalui endpoint verifikasi, bukan PATCH mass-assignment. Avatar existing/Google hanya DTO tampilan dengan URL HTTPS provider tervalidasi; upload avatar bukan cakupan auth ini.
10. Registrasi email atau telepon/password tetap dapat membuat akun CLIENT dan sesi/login password walau provider pengiriman belum tersedia. Contact tersebut tetap belum terverifikasi; kepemilikan akun credential tidak sama dengan bukti kepemilikan email/nomor. Bila SMS tersedia, tawarkan OTP setelah signup; bila tidak, tandai nomor belum terverifikasi tanpa menghalangi login. Contact unverified tidak eligible untuk recovery, proof linking, atau metode cadangan terverifikasi saat unlink. Provider pengiriman tetap fail-closed503 saat operasinya diminta, tanpa “OTP/email terkirim” palsu. Unique nomor belum verified dapat mereservasi nomor orang lain: batasi signup, audit dan sediakan pemulihan administratif setelah proof kepemilikan terverifikasi; jangan auto-assign atau merge nomor yang sudah ada.

## Kontrak HTTP bersama

Semua endpoint di bawah memakai runtime Node dan service `server-only`. Respons JSON `Cache-Control: no-store`; body dibatasi4096 byte dan schema strict. Error aman: `{ok:false,error:string,code:string,fields?:Record<string,string>}` tanpa stack, user existence, raw token/hash/provider payload. Respons sukses kompatibel login lama: `{ok:true,redirectTo?:string,data?:T}`. `redirectTo` Google eksternal hanya dari endpoint start yang menghasilkan URL server ke host Google; hasil login biasa selalu path lokal.

Status bersama:400 input salah/token invalid atau kedaluwarsa,401 kredensial/sesi tidak sah,403 origin/CSRF/peran,409 konflik metode/perubahan terautentikasi,429 throttle dengan `Retry-After`,503 database/provider/config tidak siap. Error recovery memakai pesan generik; beda status hanya karena bentuk input, konfigurasi global dan batas percobaan, bukan keberadaan akun. UI tidak merender provider error mentah.

CSRF: `GET /api/auth/csrf` menerbitkan `{ok:true,data:{csrfToken}}` dan cookie konteks CSRF pendek HttpOnly, SameSite=Lax, Secure produksi; token signed/random browser-bound, diperiksa timing-safe melalui `X-CSRF-Token` dan exact Origin pada semua POST/PATCH/DELETE termasuk login/start/logout. Tidak menerima Origin hilang/asing. Periksa Fetch Metadata bila tersedia; CORS kredensial lintas origin tidak dibuka. Rotasi setelah login/reauth/reset penting. Endpoint csrf hanya same-origin, no-store dan tidak membolehkan membaca token dari situs asing. Callback Google GET dikecualikan dari Origin/CSRF mutasi browser biasa tetapi wajib OAuth state/browser binding/PKCE/nonce; tidak ada mutasi lewat GET lain.

Payload login email lama tetap didukung dengan aturan CSRF terbaru; backward compatibility mengacu field dan hasil, bukan mengecualikan keamanan untuk klien lama. Tepat satu dari `identifier` atau `email`; kedua field sekaligus ditolak400. Cookie sesi/token login tidak pernah berada pada JSON, localStorage atau query URL.

## API autentikasi dan pemulihan

| Method dan path | Input | Sukses dan perilaku |
| --- | --- | --- |
| GET `/api/auth/capabilities` | — | 200 `{ok:true,data:{google:boolean,emailRecovery:boolean,smsOtp:boolean}}`; boolean hanya readiness konfigurasi global, tanpa key/URL provider. `emailRecovery=true` juga menandakan kanal verifikasi email siap |
| GET `/api/auth/csrf` | — | 200 token CSRF browser-bound seperti kontrak bersama |
| POST `/api/auth/register` | `{name,identifier,password}` | 201 `{ok:true,redirectTo:"/dashboard",data:{verificationRequired:true,channel:"email"|"sms",verificationAvailable:boolean}}` dan cookie sesi akun baru; contact masih unverified. Pengiriman verifikasi melalui endpoint terpisah, supaya kegagalan SMS/email tidak membuat signup unusable. Akun duplikat mendapat error generik aman, tanpa detail metode/owner; throttle sebelum lookup/hash |
| POST `/api/auth/login` | `{identifier,password,next?}` atau `{email,password,next?}` lama | 200 `{ok:true,redirectTo}` dan Set-Cookie. Bila OTP login diaktifkan untuk akun:202 `{ok:true,data:{otpRequired:true,token,expiresIn:300,resendAfter:60}}`, hanya cookie login-pending HttpOnly, cookie sesi penuh dibersihkan; tidak ada akses dashboard sebelum OTP |
| POST `/api/auth/logout` | JSON strict `{}`; body wajib, bounded4096 byte | 200 `{ok:true,redirectTo:"/login"}`; hapus sesi saat ini/cookie; anonim tetap idempoten, DB gagal503 |
| POST `/api/auth/google/start` | `{intent:"login"|"link"|"reauthenticate",next?}` | 200 `{ok:true,redirectTo:<URL Google server>}`; link/reauth memerlukan sesi, link memerlukan reauth terbaru. Tambahan intent reauthenticate memungkinkan akun Google-only membuktikan ulang tanpa password |
| GET `/api/auth/google/callback` | query `code,state` atau error provider | 303 ke path aman; sukses login/registrasi menerbitkan sesi; link/reauth kembali settings/security. Error memakai kode allowlist tanpa email/code/token pada redirect; state dikonsumsi walau gagal |
| POST `/api/auth/forgot-password` | `{identifier}` | 202 `{ok:true,data:{message:"Jika akun dapat dipulihkan, petunjuk akan dikirim."}}` untuk ada/tidak ada/suspended/tidak eligible. Email reset link, phone OTP bila SMS tersedia; phone memakai respons token challenge sintetis setara untuk unknown account. Tidak mengubah credential pada tahap request |
| POST `/api/auth/reset-password` | `{token,password}` | 200 `{ok:true,redirectTo:"/login"}`; consume proof reset single-use, ganti hash dan revoke seluruh sesi dalam transaksi. Tidak auto-login. Token untuk endpoint ini adalah proof reset, bukan challenge OTP mentah |
| POST `/api/auth/email/request` | `{identifier,purpose:"register"|"verify"}` | 202 pesan generik; resend dibatasi, invalidate token lama; kedua purpose memerlukan sesi ACTIVE pemilik identifier; proof terikat exact hash sesi penerbit dan HMAC konteks browser, termasuk signup register; tidak memerlukan fresh reauth untuk verifikasi contact awal |
| POST `/api/auth/email/verify` | `{token}` | 200 `{ok:true,redirectTo:"/login"}` untuk register; wajib exact sesi penerbit masih sah dan browser yang sama, bukan anonim atau sekadar userId sama. Fresh reauth tidak diwajibkan untuk verifikasi awal; consume proof+verifikasi contact atomik. GET halaman verify hanya render UI; scanner link tidak boleh mengonsumsi proof |
| POST `/api/auth/otp/verify` | `{token,code}` | 200 sesuai purpose yang disimpan server: register→`redirectTo:"/login"`; password login→cookie sesi + redirect aman; reset→`data:{resetToken,expiresIn:600}`. Purpose/user/identifier tidak dapat ditentukan body |
| POST `/api/auth/otp/resend` | `{token}` | 202 challenge baru serta `resendAfter:60`; token/kode lama invalid. Unknown/expired mendapat pesan generik; reset unknown flow memakai challenge sintetis setara |

Recovery hanya menggunakan contact terverifikasi untuk akun credential yang sah. Google-only tidak mendapatkan password baru lewat endpoint forgot; pengguna masuk Google kemudian menambah password melalui settings setelah reauth dan verified identifier. Dengan SMS tidak tersedia, phone recovery memberi503 global sebelum lookup; UI menawarkan metode lain. Tidak memakai SMS palsu/dev console sebagai keberhasilan provider.

Email reset link memakai origin canonical server `/reset-password#token=…`; hash fragment dibaca hook, dihapus dengan history.replaceState lalu dikirim POST. Bila integrasi provider memerlukan query token, segera hapus dari address bar, gunakan Referrer-Policy=no-referrer, jangan analytics/script pihak ketiga atau mencatat URL token. Endpoint forgot tidak mengembalikan token reset/email mentah. Challenge token OTP acak bukan OTP dan hanya berguna dengan kode + browser/purpose binding; proof reset dalam JSON hanya setelah OTP valid, berumur pendek, tidak disimpan permanen browser.

## API akun, proof dan sesi

Seluruh API akun memerlukan user ACTIVE dengan sesi DB sah; lintas CLIENT/CUSTOMER/VENDOR/SUPERADMIN hanya untuk akun sendiri. Tidak ada input target `userId`. Kontak lama tidak dibuka atau dilepas sebelum proof baru berhasil.

| Method dan path | Input | Output/perilaku |
| --- | --- | --- |
| GET `/api/account/profile` | — | 200 `data:{id,name,email:string|null,phone:string|null,avatarUrl:string|null,role,emailVerified:boolean,phoneVerified:boolean}`; data akun sendiri saja |
| PATCH `/api/account/profile` | `{name}`;1–100 karakter trim | 200 DTO profil terbaru. Email/phone/avatar/role/status tidak diterima |
| GET `/api/account/security` | — | 200 `data:{hasPassword,googleLinked,emailVerified,phoneVerified,smsOtpEnabled,reauthenticatedUntil,capabilities}`. Metadata email Google boleh masked; tidak ada sub/access token/hash/state |
| POST `/api/account/reauthenticate` | `{password}` | 200 `data:{reauthenticatedUntil:<ISO>}`; verifikasi password akun sesi, throttle; rotate session/token. Google-only gunakan start intent reauthenticate dan callback subject milik akun sama |
| POST `/api/account/password` | `{currentPassword?,password}` | 200 `{ok:true}`; jika hasPassword wajib password saat ini benar; jika belum ada, wajib reauth Google terbaru dan identifier verified. Ganti/menambah credential, revoke sesi lain, rotate sesi saat ini atomik |
| POST `/api/account/google/unlink` | `{}` | 200 `{ok:true}`; reauth≤5 menit, last-method guard, unlink atomik, revoke sesi lain; account tetap sama |
| POST `/api/account/email/request` | `{email}` | 202 pesan verifikasi dikirim, require recent reauth; challenge bound user/new email. Email lama tetap aktif; konflik dijelaskan generik |
| POST `/api/account/email/verify` | `{token}` | 200 DTO profil; sesi akun sama + reauth terbaru, consume proof dan unique-contact update atomik; revoke sesi lain bila identifier berubah |
| POST `/api/account/phone/otp` | `{phone}` | 202 `data:{token,expiresIn:300,resendAfter:60}`; require recent reauth, SMS ready, E.164; token challenge terikat user dan nomor baru, bukan login OTP |
| POST `/api/account/phone/verify` | `{token,code}` | 200 DTO profil; sesi owner + reauth terbaru, claim nomor/phoneVerifiedAt atomik; kode/purpose salah tidak mengubah profil |
| POST `/api/account/phone/unlink` | `{}` | 200 `{ok:true}`; reauth + minimal metode login/contact verified lain; SMS OTP dimatikan secara atomik bila phone dihapus |
| POST `/api/account/email/unlink` | `{}` | 200 `{ok:true}`; reauth + minimal metode login/contact verified lain; tidak menghapus email jika credential tidak mempunyai identifier verified lain |
| PATCH `/api/account/security` | `{smsOtpEnabled:boolean}` | 200 security DTO; enable membutuhkan SMS ready, credential password, verified phone dan reauth; disable juga reauth. Provider absent tidak mengubah flag diam-diam |
| GET `/api/account/sessions` | — | 200 `data:{sessions:[{id,current,createdAt,lastSeenAt,expiresAt,deviceLabel}]}`; metadata safe, maksimum50/pagination bila perlu; tidak ada tokenHash/IP mentah/user-agent mentah |
| DELETE `/api/account/sessions/{id}` | Body tidak ada atau JSON strict `{}`; jika ada dibatasi4096 byte | 200 `{ok:true}`; query scoped user; unknown/not-owned404 dengan pesan sama; hapus current juga clear cookie/redirect login. Sesi lain require recent reauth |
| POST `/api/account/sessions/revoke-others` | `{}` | 200 `{ok:true,data:{revoked:number}}`; require reauth, revoke selain sesi current dalam transaksi; current tetap berlaku dengan token baru |

`deviceLabel` hanya informasi perangkat dari user-agent yang disanitasi dan dipotong, bukan bukti perangkat terpercaya. `lastSeenAt` diupdate terbatas, misalnya maksimum tiap5 menit. Sesi7 hari absolute expiry; pembuktian ulang/rotasi tidak memperpanjang tanpa batas. OTP login sebagai faktor tambahan bersifat opt-in melalui settings, bukan syarat diam-diam untuk akun lama. Jika faktor SMS akun enabled tetapi provider tidak tersedia, login password gagal503 tanpa melewati faktor; metode Google linked merupakan metode login alternatif sesuai kebijakan akun, bukan bukti OTP berhasil.

## OAuth Google dan transaksi proof

Gunakan `google-auth-library` di adapter server untuk authorization URL, pertukaran code dan verifikasi ID token. Tidak membawa client secret/provider token ke Client Component. Callback URI exact canonical `${NEXT_PUBLIC_APP_URL}/api/auth/google/callback`, origin tervalidasi dan allowlist Google Console; scope `openid email profile`, tanpa kebutuhan akses offline/refresh token.

Setiap start membuat random state32 byte, nonce32 byte, PKCE verifier43–128 karakter dan challengeS256, cookie attempt HttpOnly/Secure/SameSite=Lax expiry10 menit. Database menyimpan hash state, hash browser binding, nonce hash, intent, safe return path, expiry dan user/session asal untuk link/reauth. Verifier harus tersedia bagi server untuk exchange: simpan encrypted-at-rest atau di cookie tersegel terautentikasi; hash verifier saja tidak cukup. Jangan mencatat authorization code/verifier/ID token. Satu browser boleh memiliki attempt terbatas; attempt lama invalidate atau namespace bound dengan jelas.

Callback membuktikan state equality + expiry + cookie binding, consume attempt single-use atomik, exchange code dengan verifier dan redirect URI exact. `verifyIdToken` memvalidasi signature/audience/issuer/expiry, kemudian nonce serta sub/email_verified diperiksa eksplisit. Reject issuer/aud/nonce/sub kosong, token expired, code reuse, user suspended, link session berubah, subject milik user berbeda dan config/provider gagal. State/nonce wajib pada login, link dan reauth. Provider error membatalkan attempt/cookie, menghasilkan pesan user ringkas, tidak membuat sesi.

Identity lookup `(GOOGLE,sub)` dan pembuatan user+identity+sesi dilakukan dengan unique constraint dan transaksi; conflict handling tidak memakai check-then-insert saja. Linking menyelesaikan proof identity dan menambah identity pada user asal tanpa membuat user baru atau mempromosikan role. Login mengganti sesi browser lama; reauth merotasi sesi dan menetapkan fresh-auth pada DB, bukan boolean browser.

Email/reset: token acak minimal32 byte, hash SHA256; expires15 menit untuk reset,24 jam untuk email verify. OTP enam digit CSPRNG, berlaku5 menit, maksimal5 attempts; simpan HMAC kode dengan secret dan challenge ID untuk mencegah brute force offline atas hash kode pendek. Pending challenge memiliki tujuan, target normalized, user/pending user, browser binding, expiry, consumedAt/attempts. Proof tidak dapat dipakai lintas purpose atau akun.

Consume dilakukan dalam transaksi kondisional `consumedAt IS NULL AND expiresAt>now`; OTP attempts naik atomik, batas tidak bisa dilampaui lewat concurrency. Reset consume+password write+session revocation satu transaksi. Password change, identifier swap, unlink last-method dan phone claim memerlukan lock/serializable/conditional writes dengan retry terukur sehingga dua request paralel tidak menyisakan nol metode. DB rollback tidak boleh membuat token reusable setelah password berubah.

Pengiriman provider memakai timeout≤10 detik dan error teredaksi. Challenge tidak dinyatakan delivered sebelum adapter memberi receipt accepted; delivery gagal membatalkan pending proof atau mencatat delivery gagal yang tidak dapat diverifikasi. Resend mengganti kode/proof lama. Provider tidak dikonfigurasi adalah503 global; provider gagal tidak diterjemahkan menjadi keberhasilan palsu. Pengiriman dan DB bukan transaksi distributed: simpan status pending/delivery, lakukan kompensasi invalidation serta idempotency key pada Resend. Twilio Programmable Messaging tidak otomatis retry POST; receipt accepted bukan bukti delivery dan exactly-once tidak dijamin.

## Modul dan interface implementasi

Pertahankan boundary existing; route hanya parsing/request policy/response/cookie. Schema/UI DTO aman berada pada fitur, bisnis/provider/DB pada server. Target page<120, komponen/hook<200, service<300 baris; pemecahan mengikuti tanggung jawab.

| Path aktual | Tanggung jawab dan kontrak |
| --- | --- |
| `src/features/auth/types/auth-contracts.ts`, `lib/`, `hooks/` | DTO aman, normalization UI, parsing login202, token transient dan request CSRF; validasi server tetap otoritas |
| `src/features/auth/components/` | Form login/register/recovery/reset/verifikasi/OTP/Google nyata, terpisah dari preview |
| `src/features/account/types/account-contracts.ts`, `components/`, `hooks/use-account-resource.ts` | DTO profil/security/sesi dan UI akun sendiri; refresh dari server sesudah mutasi |
| `src/server/auth/{auth-service,registration-service,recovery-service,verification-service,google-service,otp-service}.ts` | Lifecycle auth/proof sesuai domain; browser/sesi/purpose binding dan enforcement faktor |
| `src/server/auth/{auth-repository,google-repository,proof-repository}.ts` | Query, locking, conditional consume dan transaksi identitas/proof/sesi |
| `src/server/auth/{request-policy,csrf,capabilities,auth-http,otp-http,public-delivery-timing}.ts` | HTTP strict/bounded, Origin/CSRF, konfigurasi aman, cookie dan minimum timing publik |
| `src/server/account/{account-service,contact-service,account-repository,account-handlers,account-input,account-dto,http}.ts` | Own-account, reauth, password/contact/last-method, OTP policy dan sessions; tanpa target userId browser |
| `src/server/integrations/auth/` | Google/Resend/Twilio server-only, timeout/redaksi; tanpa fake success |
| `src/server/authorization/`, `src/server/customer/` | Role/status DB dan ownership; CLIENT/CUSTOMER kompatibel, VENDOR/admin terpisah |
| `src/app/api/auth/`, `src/app/api/account/` | Boundary HTTP Node/no-store; bisnis tetap service |
| `src/app/(auth)/` | Routing resmi dan metadata noindex/no-referrer; form nyata |
| `src/app/(account)/account/`, `src/app/(vendor)/vendor/page.tsx` | Canonical own-account lintas role, security dan landing VENDOR dengan guard server |
| `next.config.ts` | Empat redirect alias akun exact307 sebelum guard layout customer |

Interface kebutuhan domain (nama fungsi/export aktual mengikuti dokumen04/06): `loginWithPassword({identifier,password,next},context)`, `registerClient(input,context)`, `beginGoogle({intent,next},context)`, `completeGoogle(query,context)`, `requestRecovery({identifier},context)`, `resetPassword({token,password},context)`, `verifyChallenge({token,code},context)`, `getProfile(session)`, `updateProfile(session,{name})`, `reauthenticate(session,proof)`, `updatePassword(session,input)`, `unlinkMethod(session,method)`, `listSessions(session)`, `revokeSession(session,id)`. `context` memuat verified session opsional, current session ID, browser binding dan throttle keys hasil boundary, bukan user/role dari browser. Login result discriminated union `authenticated | otp-required | denied | unavailable` supaya202 tidak diperlakukan sukses sesi penuh.

Adapter: `GoogleProvider.exchangeAndVerify({code,verifier,nonce,redirectUri}):Promise<{subject,email,emailVerified,name?,avatarUrl?}>`; `EmailProvider.sendVerification/sendPasswordReset({recipient,url,idempotencyKey}):Promise<{accepted:true,receiptId}>`; `SmsProvider.sendOtp({phone,code,idempotencyKey}):Promise<{accepted:true,receiptId}>`. Provider diinject/mock pada unit test; factory produksi melempar unavailable bila config kurang. Tidak menyimpan access/refresh token Google karena tidak diperlukan scope auth.

Worker data telah menyediakan kontrak lokal enum CLIENT/VENDOR sambil mempertahankan CUSTOMER, nullable unique email, normalized unique phone dan verifiedAt, identity unique, proof purpose/hash/expiry/use/attempt/delivery, OAuth attempt/browser binding, metadata/fresh-auth/revocation sesi serta scope throttle. Kontrak aktual sudah tersedia pada `02-data-engineer-database.md`: `AuthAccount` identity, `AuthVerificationToken` purpose EMAIL_VERIFY/PHONE_OTP/PASSWORD_RESET/ACCOUNT_LINK/OAUTH_STATE dengan payload metadata aman, `UserSession.reauthenticatedAt/lastSeenAt/revokedAt/userAgent/ipHash`, serta `AuthLoginThrottle` existing; scope baru diwakili namespace keyHash. OTP membedakan alur register/login/reset/contact melalui subtype payload yang ditetapkan server, bukan purpose body. Delivery/browser binding/PKCE envelope memakai payload dengan validasi service, bukan menambah tabel tanpa kebutuhan. FK/cascade, index expiry, constraint minimal contact dan transactional API harus konsisten. Nama kolom/model final mengikuti schema worker data; fullstack mencocokkan DTO/service terhadap migrasi aktual sebelum merge, bukan membuat tabel atau dokumen PM baru. Tidak melakukan migrasi live pada tahap ini.

Environment server: pertahankan AUTH_SECRET, GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET, DATABASE_URL; callback dihitung dari origin canonical. Adapter yang ditetapkan: Resend email (`RESEND_API_KEY`, `AUTH_EMAIL_FROM`) dan Twilio SMS (`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`); kunci OTP HMAC memakai derivasi AUTH_SECRET atau key server terpisah. Pemeriksaan availability ROOT tanpa membaca/mencetak nilai menyatakan DATABASE_URL/DIRECT_URL lokal tersedia, sedangkan AUTH_SECRET, pair Google, Resend dan Twilio belum diisi. Provider nyata belum dapat diuji; mock harus diberi status lokal saja. `.env.example` hanya nama/placeholder aman. AUTH_TRUST_PROXY opt-in dan hanya Caddy/private upstream tervalidasi. OAuth readiness perlu pair client ID+secret+origin; email/SMS readiness memerlukan konfigurasi penuh, bukan satu flag UI.

## Alur UI dan kriteria pengalaman

- `/login`: pertahankan kartu ringkas; tombol Google bila capability siap, identifier “Email atau nomor telepon”, password/show toggle, lupa sandi, tautan daftar. Field identifier type=text/autoComplete=username, password=current-password. Error generik;429 memakai countdown Retry-After;503 jelas layanan belum tersedia. Login OTP membuka panel kode, tidak berpindah ke dashboard sebelum sesi terbit.
- `/register`: nama, email atau telepon, password baru, persetujuan kebijakan yang nyata, pilihan Google. Sukses password membuat akun/sesi dan menawarkan verifikasi; email menampilkan pesan umum, phone menampilkan OTP bila SMS tersedia. Kanal pengiriman absent dinonaktifkan dengan alasan singkat, signup/login password tetap tersedia dengan contact belum terverifikasi. Tidak ada role picker atau tautan vendor/admin provisioning.
- `/forgot-password`: satu identifier dan pesan selesai generik. Telepon memakai challenge OTP bila SMS tersedia; email tidak memperlihatkan keberadaan akun. Invalid format ditandai inline tanpa request. Tidak menampilkan token atau fallback OTP developer.
- `/reset-password`: token transient, password baru+konfirmasi; sukses ke login, expired/reused mengarahkan meminta link baru. Tidak consume lewat render/GET; hapus token URL sebelum request berikutnya. Noindex/no-referrer.
- `/verify-email`: button verify menggunakan POST; state processing/success/expired dan resend. Link scanner/render awal tidak melakukan verifikasi otomatis.
- `/dashboard`: tetap server-guard CLIENT/CUSTOMER dan data domain existing; frontend preview fixture tidak berubah menjadi persistence bisnis hanya karena login berhasil.
- `/account`: semua role ACTIVE bersesi sah dapat membuka akun sendiri. Nama editable, email/phone nullable dengan badge verified/pending, contact change memerlukan reauth+proof. Alias exact `/dashboard/settings`, `/dashboard/settings/profile`, `/dashboard/account` → `/account` dengan307 sebelum layout customer; canonical tetap memeriksa sesi. Parent route/shell tidak boleh menampilkan menu/domain customer kepada VENDOR/SUPERADMIN.
- `/account/security` (alias exact `/dashboard/settings/security` → canonical dengan307): password/set password, Google link/unlink, email/phone verification/unlink, SMS OTP toggle kondisional, sesi/perangkat/revoke others. Reauth dialog sebelum mutasi sensitif; Google-only diarahkan proof Google. Tombol melepas metode terakhir disabled dan server tetap menolak request paksa.
- `/preview-ui/*`: fixture sintetis/noindex/label contoh; tidak memanggil API auth/email/SMS/provider atau DB; path/settings simulasi tetap terpisah.

Verifikasi email signup awal membutuhkan exact sesi penerbit + browser yang sama, termasuk pada tombol request/resend; bukan alur anonim dan tidak mensyaratkan fresh reauth. Perubahan contact private pada `/account/security` tetap membutuhkan fresh reauth≤5 menit saat request/consume. Sesi pengguna yang sama dari browser/perangkat lain tidak boleh menggantikan sesi penerbit.

Semua form state idle/pending/success/error/expired/rate-limited/provider-unavailable, double-submit dicegah, error memakai aria-live/role alert, label dan fokus keyboard jelas. Jangan memasukkan token/provider detail ke copy produk. Periksa320/390/768/1440px, reflow200%, reduced-motion dan tab order; ulangi pembuktian browser karena route auth sekarang berubah dari simulasi menjadi operasi nyata.

## Rate limiting, audit dan abuse

Batas awal merupakan konfigurasi server, bukan janji permanen produk. Shared DB limiter harus bekerja lintas instance; reservasi atomik sebelum scrypt/provider. Identifier/IP disimpan sebagai HMAC dengan namespace endpoint/purpose, tidak PII plaintext. Proxy spoofing tidak boleh memberi key baru; fallback untrusted shared key konservatif dipertahankan.

| Alur | Batas awal | Perilaku |
| --- | --- | --- |
| Password login/reauth |5 gagal per identifier/15 menit;100 request/IP/15 menit | Dummy hash unknown credential;429 generic; keberhasilan tidak mereset kegagalan paralel/IP budget |
| Register |5 request/IP/15 menit,3/identifier/jam | Tahan pembuatan akun/provider spam; duplicate outcome aman |
| Forgot/verifikasi contact |3 pengiriman/identifier/jam;10/IP/jam |202 generik setelah diterima; resend minimum60 detik |
| OAuth start/callback |20/IP/15 menit + attempt browser terbatas | Tidak membuat state tanpa batas; callback invalid ikut dihitung |
| OTP send/verify |3 kirim/target/jam;10/IP/jam;5 tebakan/challenge | Cooldown60 detik; invalidate attempt habis; resends tidak mereset budget target/IP |
| Reset token |10 request/IP/15 menit + proof single-use | Invalid proof generik; valid consume atomik |
| Mutasi security |10/user/15 menit | Reauth/freshness wajib;409 last-method/unique tanpa detail akun lain |

Audit event server minimum: login success/failure, OTP exhausted, recovery requested/completed, reauth, contact verified/changed, provider linked/unlinked, password changed, sessions revoked dan role provisioning administratif. Log berisi request/event ID, actor ID jika sah, outcome dan timestamp; tidak mencatat password, code, token, cookie, URL recovery, email/phone lengkap atau payload provider. Retensi/cleanup proof/throttle/session expired dibuat terjadwal pada tahap operasional; tidak memakai timer background tak terkelola di route.

## Milestone, task, estimasi dan Definition of Done

Estimasi berikut adalah **estimasi historis perencanaan**, bukan waktu kerja aktual atau janji kalender resume. Estimasi hari kerja efektif untuk satu engineer, mencakup review lokal; total9–15 hari, provider/DB provisioning dapat menambah kalender. Ukuran S≤0,5 hari/M0,5–1/L1–2. Milestone tidak menggantikan instruksi eksekusi aktif; pekerjaan mandiri tidak ditunda menunggu provider live.

| Milestone | Task/output terverifikasi | Estimasi | Dependency | Definition of Done |
| --- | --- | --- | --- | --- |
| M1 Fondasi data/kontrak | Data: enum/contact/identity/proof/session/throttle; fullstack: schema request, DTO, config/capabilities/CSRF, role guards dan email lama |2–3 hari/L | Schema worker data; audit ini | Prisma generate/validate; constraint/migration diuji DB dev; CLIENT+CUSTOMER kompatibel, VENDOR/SUPERADMIN tidak masuk domain customer; missing config fail-closed; tidak migrasi live |
| M2 Password/register/recovery | Identifier login, register email/phone, verifikasi, forgot/reset, OTP challenge/resend dan batas attempts |2–4 hari/L | M1; adapter email/SMS interface | Unit/integration success/unknown/suspended/expiry/reuse/race; password reset revoke semua sesi; absent provider503; no token/email enumeration; hash existing lulus |
| M3 OAuth Google | Authorization code state/PKCE/nonce, callback verified, auto create CLIENT, conflict-safe no auto-link, link/reauth flow |1,5–2,5 hari/L | M1; google-auth-library | Verifikasi issuer/aud/expiry/nonce/sub dan browser binding; replay/concurrent conflict/session switching ditolak; mock/provider sandbox terpisah; user lama role tidak berubah |
| M4 Akun dan sesi | Profile/security API, password set/change, contacts verified swap/unlink, last-method guard, list/revoke sessions, OTP opt-in |1,5–2,5 hari/L | M2/M3 | IDOR/session ownership diuji; fresh reauth; mutasi atomik concurrent; last-method tidak bisa bypass; password/contact change revoke others |
| M5 UI/gate/handoff | Route resmi nyata, settings lintas role, preview inert, meaningful unit/DB/E2E, browser, docs/env handoff |2–2,5 hari/L | M2–M4 | Check/build/E2E satu run hijau; desktop/mobile/keyboards/no-JS aman; no secrets/PII token URL; status kode/lokal/provider/produksi terpisah |

Status milestone aktual: M1 kode/schema/grants lokal tersedia dan scoped data lulus, target aktif pending; M2/M3/M4 kode tersedia dengan bukti scoped lokal, provider sandbox/dua koneksi nyata pending; M5 UI/handoff tersedia, QA baseline600 test+build PASS, final rebuild/E2E/inspeksi browser pending. Tidak satu pun status ini menyatakan rollout layanan/produksi selesai.

Pembagian output sesi: core auth/Google/signup/role dan helper bersama dikerjakan backend04; UI05; recovery/account/security/session dikerjakan backend06; security03 audit final; QA07; DevOps08 handoff. PM01 menyelaraskan dokumen ini dan ingatan existing; data02 menangani schema/migration. Backend04 dan06 menyepakati helper CSRF, cookie, crypto, throttle dan repository sebelum keduanya mengubah file bersama.

Urutan dependensi: data contract → foundation/guards/CSRF → password dan OAuth → account security/sessions → integrasi UI/gate. Komponen UI/DTO bisa disiapkan setelah kontrak tanpa provider nyata. Migrasi dan layanan live/push/deploy bukan output milestone worker PM; ROOT mengintegrasikan pekerjaan; checkpoint sementara sudah diselaraskan di progres/changelog existing, dan hasil gate final diperbarui pada berkas yang sama.

## Matriks penerimaan QA

| ID | Skenario | Hasil wajib |
| --- | --- | --- |
| AUTH-01 | Email payload lama, identifier email/phone normalized, password lama | Login kompatibel, role/status server, sesi baru; unverified phone dapat login password tetapi tidak menjadi proof kepemilikan/recovery/linking |
| AUTH-02 | Unknown/password salah/suspended/throttled | Error generik, dummy verification, tidak ada session;429 pada batas konfigurasi |
| AUTH-03 | Public register dengan role/field privilege; concurrent duplicate | Field privilege400; hanya CLIENT; unique atomik, tidak akun ganda |
| AUTH-04 | Register/email verify/phone proof expiry, reuse, user/purpose mismatch | Signup/password login tetap tersedia tanpa provider; contact belum verified; request/verify awal bukan anonim, exact sesi penerbit+browser wajib walau user sama dan tanpa fresh reauth; wrong/expired/reused proof ditolak, operasi pengiriman absent503 |
| AUTH-05 | Google baru/existing subject/email conflict | Auto-create CLIENT; existing user sama; conflict tidak auto-link atau ganti role |
| AUTH-06 | OAuth forged state/cookie, PKCE/nonce/aud/issuer salah, expired token/replay | Tidak ada akun/sesi/link; error aman dan attempt tidak reusable |
| AUTH-07 | Link Google akun berbeda, callback setelah logout/session berganti | Ditolak; linking tidak memindahkan identity; bukti sesi asal wajib |
| AUTH-08 | Forgot known/unknown/Google-only/suspended; email/SMS gagal | Recovery/request/resend generik dengan minimum11 detik pada cabang delivery valid, termasuk synthetic unknown/provider failure; invalid input/config/throttle tidak menunggu floor; residual latency>11 detik/biaya koneksi tetap ada, bukan timing konstan produksi; no raw reset token/fake provider success |
| AUTH-09 | Dua reset paralel satu token | Tepat satu sukses; password+consume+revocation atomik; seluruh sesi lama mati |
| AUTH-10 | OTP banyak tebakan/resend/concurrent request | Maks5/challenge, cooldown/budget global; kode lama invalid; login-pending tidak akses private |
| AUTH-11 | CLIENT/CUSTOMER/VENDOR/SUPERADMIN settings dan domain role lain | Canonical `/account`/`/account/security` own-account semua role; empat alias exact307 sebelum guard layout; VENDOR→`/vendor`; customer domain CLIENT/CUSTOMER saja; admin SUPERADMIN saja |
| AUTH-12 | Arbitrary user/session ID, role pada PATCH, unlink terakhir paralel |403/404/400 aman; tidak IDOR/role escalation; minimal satu metode tetap ada |
| AUTH-13 | CSRF absent/tampered, Origin missing/foreign, proxy spoof, body oversized | Request ditolak sebelum side effect; logout strict JSON `{}` dan DELETE tanpa body atau strict `{}`, body invalid/field tambahan/oversize ditolak; callback memakai exception OAuth terbatas |
| AUTH-14 | Password change/contact swap/revoke others/logout/current delete | Sesi terpilih tidak berlaku lagi pada request berikutnya; cookie clear/rotate benar |
| AUTH-15 | Malicious next external/encoded traversal/role-other path | Redirect hanya allowlist role; tidak open redirect |
| AUTH-16 | Browser auth/sesi/UI provider unavailable dan no-JS | Form tidak bocorkan password/token ke URL; states jelas, keyboard/reflow; preview tidak mengirim request auth/provider |
| AUTH-17 | DB write permission kurang/config missing/build tanpa secret |503 fail-closed; build/public route tetap berjalan; readiness DB bukan klaim auth/provider aktif |

Verifikasi fullstack: `npm run db:validate`, `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`; setelah build `npm run test:e2e` dan inspeksi browser. Uji DB development/transaksi concurrency terpisah dari mock unit. Google/email/SMS sandbox hanya bila credential tersedia melalui kanal server aman; test mock tidak membuktikan delivery atau konfigurasi Console. Tidak mencatat login nyata/OTP/token pada screenshot atau report. Gate dijalankan terhadap source final yang sama, tanpa melemahkan assertion guard.

## Risiko, mitigasi dan batas penyelesaian

| Risiko | Probabilitas | Dampak | Mitigasi/output pembuktian |
| --- | --- | --- | --- |
| CUSTOMER literal tersebar membuat CLIENT terkunci | Tinggi | Tinggi | Audit guards/service/query/identity/seed/redirect/DTO; tests alias end-to-end |
| Settings semua role tertahan parent layout customer | Tinggi | Sedang | Canonical di route group account terpisah + empat alias exact307 sebelum layout; scoped config5 PASS, browser final tiap role tetap gate |
| Nullable email mematahkan UI/query existing | Tinggi | Sedang | DTO nullable, fallback nama/phone; audit `.email`/getWorkspaceIdentity; no synthetic email |
| Auto-link email mengambil alih akun | Sedang | Kritis | Identity subject authoritative, explicit linking + recent proof, conflict test |
| Race reset/contact/unlink atau budget OTP | Sedang | Kritis | Constraints, conditional consume, transactional locks/retry; concurrent integration tests |
| SMS biaya/abuse dan provider offline | Tinggi | Tinggi | HMAC limits before send, cooldown/idempotency; capability safe, fail-closed, alternatif Google/email |
| Provider config/OAuth Console/runtime DML belum siap | Tinggi | Tinggi | Kode/mock diuji mandiri, checklist env/permissions dan sandbox terpisah; tidak klaim produksi |
| Recovery bocorkan existence/PII atau token URL | Sedang | Tinggi | Respons generik, floor11 detik teruji scoped dengan residual latensi/koneksi; no-referrer, transient token, redacted logs, no analytics recovery |
| Preview mengirim kredensial/OTP nyata | Sedang | Tinggi | Hook/components preview terpisah; E2E intercept memastikan nol request provider |
| Scope vendor berubah menjadi domain bisnis baru | Sedang | Sedang | Provisioning administratif, own-account lintas role; vendor CRUD/marketplace di luar auth |

Penyelesaian harus dilaporkan dalam lima status terpisah: **rancangan** (dokumen ini), **kode tersedia** (source final), **teruji lokal** (scoped PASS dan baseline QA; gate final/DB dua koneksi/browser masih pending), **terhubung layanan** (Google/email/SMS+DB DML nyata terbukti), **terverifikasi produksi** (rilis dan smoke target nyata). Provider/env yang tidak tersedia tidak menghentikan implementasi dan pengujian lokal relevan, tetapi status layanan/produksi tetap terbuka. Migrasi, credential provisioning, deploy dan push belum dilakukan oleh pekerja PM.
