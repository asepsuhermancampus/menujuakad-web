# Implementasi core autentikasi

## Cakupan dan audit

9 Oktober 2026. Core memakai fondasi existing: scrypt N32768/r8/p1, token opaque acak256 bit dengan SHA256 di `UserSession`, cookie `menujuakad_session` HttpOnly/SameSite=Lax/Secure produksi, dan expiry absolut7 hari. Tidak mengganti dengan Auth.js. Library `google-auth-library` ditambahkan untuk verifikasi ID token Google; Prisma7/adapter Neon dipertahankan. Perubahan schema/migration/grants dikerjakan worker02, bukan worker core. UI dikerjakan worker05, recovery/account dikerjakan worker06.

Gap existing yang diperbaiki: identifier hanya email, registrasi belum nyata, role hanya CUSTOMER/SUPERADMIN, revocation timestamp tidak diperiksa, rotasi login terdiri dari dua operasi terpisah, belum ada CSRF browser proof atau identity/OAuth state. Query customer, billing dan analytics kini menerima CLIENT/CUSTOMER sekaligus tetap mengecek ownership/status. Identitas workspace memuat email nullable dan phone; DTO billing tanpa email memakai label “Email belum ditambahkan”, bukan email sintetis. Query admin fixture menerima kedua role customer dan mempertahankan email nyata yang disaring allowlist.

Ruling sesi ROOT mengungguli path lama PM01: CLIENT/CUSTOMER → `/dashboard`, VENDOR → `/vendor`, SUPERADMIN → `/admin`; akun sendiri lintas role berada di `/account` dan `/account/security`. OTP login opt-in di luar scope. `next` hanya path allowlist lokal dan role yang sesuai; akun sendiri dibolehkan untuk semua role. VENDOR tidak lolos guard/query customer atau SUPERADMIN.

## Modul dan batas keamanan

- `src/server/auth/request-policy.ts`, `identifiers.ts`, `csrf.ts`, `capabilities.ts`, `auth-http.ts`: konfigurasi tervalidasi, parser JSON streaming maksimum4096 byte, schema strict, normalisasi identifier, exact configured Origin/Fetch Metadata, signed browser-bound CSRF, rate keys HMAC, respons aman/no-store dan pengaturan cookie.
- `auth-service.ts`, `auth-repository.ts`, `session-crypto.ts`, `transaction-lock.ts`: verifikasi password/sesi, user lock, throttle SQL, dan rotasi sesi. Setelah scrypt, hash credential/status/role diperiksa kembali di transaksi user lock; reset/password change paralel tidak boleh menerbitkan sesi dari password lama. Sesi expired/revoked/suspended ditolak pada setiap resolusi; tidak memaksa login baru setiap halaman.
- `registration-service.ts`, `registration-handler.ts`: register email/telepon + password12–256 karakter/maks1024 byte, nama1–100; hanya CLIENT/ACTIVE. User, credential dan sesi dibuat atomik. Unique conflict generik; field privilege/tambahan ditolak. Phone-only tidak diberi email palsu; contact tetap belum verified, login password tetap dapat dipakai tanpa provider SMS.
- `oauth-state.ts`: state/browser/verifier/nonce acak; hash state dan browser disimpan, verifier/nonce serta binding intent/user/session disegel AES256-GCM dengan key domain terpisah dari AUTH_SECRET. State berumur5 menit, dikonsumsi melalui conditional UPDATE atomik sebelum exchange/validasi lanjutan. Binding mismatch/provider cancellation membakar attempt; replay ditolak.
- `google-provider.ts`: authorization code + PKCE S256, `OAuth2Client.getToken` dan `verifyIdToken`; verifikasi signature/JWKS oleh library, exact audience, issuer Google, subject nonempty, expiry/iat, email_verified=true, email valid dan nonce server. Timeout provider10 detik, retry dimatikan. Token provider hanya di memori; tidak masuk DB/URL/log. Avatar hanya URL HTTPS googleusercontent.com/subdomain tanpa credentials/port.
- `google-service.ts`, `google-repository.ts`, `google-handlers.ts`: subject Google unique merupakan identitas utama. Subject existing tetap masuk owner yang sama meskipun email Google berubah. Akun baru CLIENT dibuat atomik; email existing tidak auto-merge/link. Link membutuhkan sesi asal yang persis sama dan reauth≤5 menit, diperiksa sebelum exchange dan kembali di transaksi user/session lock. Subject milik user lain atau provider yang sudah berbeda ditolak. Google reauth hanya subject linked milik owner sesi; tidak membuat akun atau menimpa subject.
- `src/server/authorization/{roles,session,guards,redirect-policy}.ts`, `src/server/customer/*`, repository invitations/analytics/billing/admin: RBAC dan DTO kompatibel nullable email.

Google reauth mengganti sesi dengan delete/create dan mempertahankan expiry absolut serta metadata. Link juga mengganti sesi current, revoke sesi lainnya, dan mengonsumsi proof user yang masih tertunda dalam transaksi yang sama. Google start memakai prompt Google terdokumentasi `select_account`, ditambah max_age0 untuk intent reauth; tidak mengklaim Google selalu mendukung/mengembalikan auth_time. Proof aplikasi adalah pertukaran code baru + nonce/state browser/session + subject linked.

## Kontrak HTTP final

Semua JSON no-store. Error aman `{ok:false,code,error}`;400 invalid input,401 credential/sesi invalid,403 Origin/CSRF/proof,409 konflik signup/metode,429 throttle dengan Retry-After900,503 konfigurasi/provider/database unavailable. Login lama mempertahankan bentuk field `{email,password,next?}`, tetapi wajib CSRF seperti klien baru. Tepat salah satu email atau identifier; keduanya ditolak.

| Endpoint | Input dan hasil |
| --- | --- |
| GET `/api/auth/capabilities` | `{ok:true,data:{google:boolean,emailRecovery:boolean,smsOtp:boolean}}`; hanya readiness konfigurasi, tanpa secrets/URL provider. Semua false jika konfigurasi auth wajib invalid. |
| GET `/api/auth/csrf` | `{ok:true,data:{csrfToken}}` + cookie browser HttpOnly. Reuse cookie valid untuk bootstrap paralel; expiry signed30 menit. Cross-origin/Fetch Metadata asing ditolak. |
| POST `/api/auth/register` | Strict `{name,identifier,password}`;201 + session cookie + `{ok:true,redirectTo:'/dashboard',data:{verificationRequired:true,channel:'email'|'sms',verificationAvailable:boolean}}`. Tidak mengklaim email/SMS sudah dikirim. |
| POST `/api/auth/login` | `{identifier,password,next?}` atau legacy `{email,password,next?}`;200 `{ok:true,redirectTo}` + session cookie. Login password existing tetap menerima panjang1–256/maks1024 byte. |
| POST `/api/auth/logout` | Idempotent revoke cookie sesi saat ini;200 `{ok:true,redirectTo:'/login'}` + clear cookie. Kegagalan DB503, tidak mengklaim logout sukses. |
| POST `/api/auth/google/start` | Strict `{intent:'login'|'link'|'reauthenticate',next?}`;200 `{ok:true,redirectTo:<GoogleURL server>}` + browser binding cookie5 menit. Missing Google config503. |
| GET `/api/auth/google/callback` | Consume state, verifikasi binding/proof, transaksi identity/session;303 ke path lokal canonical. Error hanya kode allowlist `google_failed`, `google_conflict`, `session_required`, `reauth_required`, `rate_limited`, `google_unavailable`. Tidak meneruskan code/state/provider error mentah. No-store/no-referrer; cookie OAuth dibersihkan. |

Seluruh mutasi core memerlukan exact Origin + header `X-CSRF-Token`. Token CSRF tidak memuat sesi; cookie CSRF dibersihkan setelah login/signup/logout/link/reauth sehingga klien bootstrap ulang sebelum mutasi berikutnya. Callback Google dikecualikan dari Origin/CSRF biasa dan memakai proof OAuth sendiri.

Throttle persistent DB/HMAC, reservasi IP dahulu: login5/identifier+100/IP per15 menit; register3/identifier+5/IP perjam (IP sengaja konservatif satu jam); Google start dan callback20/identifier+20/IP per15 menit dengan namespace berbeda. Proxy header diabaikan kecuali AUTH_TRUST_PROXY=1 dari upstream privat yang terkontrol. Fallback IP bersama konservatif tanpa header peer terpercaya. Identifier budget login hanya mengurangi satu reservasi sukses; tidak menghapus kegagalan paralel atau budget IP.

## Exports bersama untuk worker account

Kontrak berikut sudah tersedia, bukan skeleton. Semua modul berisi `server-only` kecuali password crypto yang juga dipakai tooling private.

| Modul | Export/tipe |
| --- | --- |
| `request-policy.ts` | `AuthConfig={origin:string,secret:string,trustProxy:boolean}`; `getAuthConfig()` throws bila invalid; `requireSameOrigin(request,config):void`; `readBoundedJson(request):Promise<unknown>`; `readLoginInput(request)`; `ThrottleKey={keyHash:string,limit:number,windowSeconds?:number}`. |
| `request-policy.ts` | `getScopedThrottleKeys(scope,identifier,request,config,limits?:{identifier?:number,ip?:number,windowSeconds?:number}):ThrottleKey[]` → identifier lalu IP; default5/100/900 detik; namespace masuk HMAC. `getThrottleKeys` dan `assertTrustedOrigin` legacy tetap tersedia; mutasi akun harus memakai requireCsrf, bukan hanya origin helper legacy. |
| `identifiers.ts` | `normalizeIdentifier(value:string):{kind:'email'|'phone',value:string}`; `normalizeEmail`, `normalizePhone`; `newPasswordSchema`, `loginPasswordSchema`. Email trim/lowercase; telepon08/628/+628 →E.164, nomor internasional wajib +E.164; parsing sintaktis bukan bukti kepemilikan. |
| `csrf.ts` | `requireCsrf(request,config?:AuthConfig):void`; `issueCsrf(config?:AuthConfig,existingCookie?:string):{token:string,cookie:string}`; `CSRF_COOKIE`, `csrfCookieOptions()`. |
| `session-crypto.ts` | `hashSessionToken(token:string):string` (SHA256 hex); `createSessionToken():string` (random32 bytes/base64url); `isSessionToken(value:unknown):value is string`. |
| `auth-service.ts` | `getAuthSession(request):Promise<AuthSession|null>`; `verifySessionToken(token:string|undefined)`; `AuthSession={userId,role,expiresAt,sessionId,tokenHash,reauthenticatedAt,user:{id,role,status}}`. expiresAt epoch ms; reauthenticatedAt Date/null. Config/DB failure throws agar API consumer mengembalikan503; missing/invalid/revoked cookie menghasilkan null. `SESSION_COOKIE`, `SESSION_MAX_AGE`, `sessionCookieOptions`, `revokeSessionToken`. |
| `transaction-lock.ts` | `lockAuthUser(tx:Prisma.TransactionClient,userId:string):Promise<void>` (SELECT User FOR UPDATE); `lockAuthIdentifier(tx,identifier)` advisory transaction lock untuk identitas belum mempunyai row. User lock dahulu, lalu session/credential/account; session row sensitif juga perlu FOR UPDATE bila revoke dapat terjadi paralel. |
| `auth-repository.ts` | `reserveLoginAttempt(keys):Promise<boolean>`; false sebelum hashing/provider. `releaseSuccessfulEmailAttempt(keyHash)` mengurangi satu reservasi; gunakan untuk login/reauth sukses saja. `rotatePasswordSession(data,expectedHash,oldTokenHash?)` helper internal login. |
| `auth-http.ts` | `authJson`, `authError`, `authUnavailable`, `mutationAuthConfig(request,config?)` → AuthConfig/NextResponse; `requestSessionToken`, `setSessionCookie(response,{token,expiresAt})`, `clearCsrf(response)`. setSessionCookie juga clear CSRF. |
| `capabilities.ts` | `getAuthCapabilities():{google,emailRecovery,smsOtp}`; `getGoogleConfig()` throws bila incomplete/invalid. |
| `authorization/guards.ts` | `requireCustomerSession`, `requireSuperadminSession`, `requireVendorSession`, `requireAccountSession`; `VerifiedSession` legacy kompatibel dengan metadata sesi tambahan optional. |

Worker06 menangani forgot/reset, password reauth, profil, password/contact verification/unlink, OTP dan sesi API; core tidak memasang dummy endpoint untuk mengklaim fitur-fitur itu selesai. Mutasi worker06 harus re-read sesi terikat/tokenHash sesudah user lock, verify ACTIVE/reauth expiry, consume purpose-bound proof atomik, dan delete/create untuk rotasi karena grants tokenHash/expiresAt immutable.

## Konfigurasi dan pengujian

Env Google: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI wajib persis origin canonical + `/api/auth/google/callback`. Email: RESEND_API_KEY dan AUTH_EMAIL_FROM. SMS: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER; memakai Programmable Messaging, bukan Verify Service. AUTH_SECRET minimal32 karakter dan NEXT_PUBLIC_APP_URL canonical wajib untuk auth. Capability hanya memeriksa konfigurasi; tidak membuktikan delivery/Google Console atau DML runtime.

Pengujian bermakna memakai Vitest dan Prisma asli di PGlite dengan migrations lokal lengkap. `core-integration.test.ts` membuktikan phone-only signup/unverified contact, hash sesi, rotasi, duplicate signup paralel, stale password version, privilege rejection, dan CLIENT domain/VENDOR+SUPERADMIN isolation. `oauth-integration.test.ts` membuktikan envelope encrypted, state concurrent single-use/browser mismatch/expiry/provider cancel, Google auto signup/existing subject/no email merge, exact session linking, revoked session, stale reauth, serta token rotation/subject ownership. `google-provider.test.ts` memakai mock boundary google-auth-library untuk claims/signature failure; `google-handlers.test.ts` memakai mock service untuk respons HTTP/cookie/redirection aman. Mock provider bukan bukti Google nyata.

Hasil gate terarah/final akan dicatat di bawah sebelum penutupan file. PGlite menyediakan PostgreSQL lokal nyata, tetapi concurrency terjadwalnya tidak menggantikan pengujian dua koneksi pada Neon/PostgreSQL sandbox.

## Batas dan handoff

Kode core tersedia; provider Google/email/SMS tidak dihubungkan atau dipanggil live. Tidak migrate/seed/grants pada DB aktif, deploy/push/VPS, atau mengambil/menampilkan nilai .env. Audit log operasional/retensi proof dan sesi, readiness DML runtime, pengujian Google Console/sandbox, serta QA browser lintas frontend/account memerlukan increment integrasi berikutnya. Dokumen sumber/master/progres/changelog tidak diubah oleh worker ini.

## Perbaikan QA-01: alias akun lintas peran

9 Oktober 2026. Temuan awal QA-01 pada `07-qa-validasi.md` dikoreksi melalui `redirects()` di `next.config.ts`. Redirect Next.js diperiksa sebelum filesystem/page, sehingga empat URL lama dialihkan sebelum `src/app/(dashboard)/dashboard/layout.tsx` menjalankan guard customer. Setiap aturan memakai path exact, destination lokal dan `permanent:false` (HTTP307), tanpa syarat cookie/role maupun wildcard.

| Rute lama | Rute canonical |
| --- | --- |
| `/dashboard/settings` | `/account` |
| `/dashboard/settings/profile` | `/account` |
| `/dashboard/settings/security` | `/account/security` |
| `/dashboard/account` | `/account` |

Rute canonical tetap memakai `requireAccountSession` pada `src/app/(account)/account/layout.tsx`: akun sendiri tersedia untuk CLIENT/CUSTOMER, VENDOR dan SUPERADMIN setelah sesi terverifikasi. Pengalihan URL bukan pemberian akses; pengguna tanpa sesi tetap ditangani guard canonical. Landing role tetap CLIENT/CUSTOMER → `/dashboard`, VENDOR → `/vendor`, SUPERADMIN → `/admin`, dengan kontrak core final pada `src/server/authorization/redirect-policy.ts`, `roles.ts` dan `guards.ts`. Guard domain customer/admin/vendor serta service autentikasi tidak diubah. Redirect dalam catch-all lama tetap tersedia sebagai fallback; konfigurasi baru mengatasi urutan layout yang sebelumnya menolak noncustomer sebelum redirect tersebut tercapai.

Regresi kontrak baru `src/config/account-route-aliases.test.ts` membaca konfigurasi Next.js asli dan memeriksa empat destination canonical, redirect sementara tanpa syarat role/cookie, serta cakupan hanya empat sumber exact agar workspace dan rute canonical tidak ikut dialihkan. Run sebelum perbaikan: **5/5 gagal** karena `redirects()` belum tersedia. Run setelah perbaikan `npx vitest run src/config/account-route-aliases.test.ts`: **1 file, 5/5 PASS**, exit0 (166ms). `npx eslint next.config.ts src/config/account-route-aliases.test.ts`: **PASS**, exit0.

Status: kode tersedia dan kontrak konfigurasi teruji lokal. Browser lintas role, full suite, typecheck/build/E2E dan produksi belum diverifikasi ulang dalam increment ini; gate menyeluruh dimiliki QA. Tidak menjalankan Prisma generate, migrasi, provider live, commit/push atau deploy. Dokumentasi ini mencatat perbaikan scoped tanpa mengganti laporan gate QA.
