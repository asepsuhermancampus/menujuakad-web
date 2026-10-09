# Slicing Fullstack Menuju Akad

## Workspace actual preproduction — 8 Oktober 2026

**Status terbaru:** kode workspace customer/superadmin dan API CRUD draft tersedia serta teruji pada database PostgreSQL lokal terisolasi. Identitas dan undangan workspace dibaca melalui Prisma dari database runtime, tanpa fixture/fallback Sarah–Dimas. Integrasi Neon live, browser HTTPS, build akhir dan produksi increment ini belum diverifikasi oleh worker. Bagian setelah increment ini adalah riwayat slicing frontend; klaim auth selalu null dan persistence belum tersedia pada riwayat tidak menggambarkan source terbaru.

Lingkup mengikuti kontrak [PM03](03-pm-rencana-slicing.md) dan [Security04](04-security-akses.md). Mempertahankan branch dirty serta perubahan worker lain. Tidak mengubah auth, schema, seed, generated client, registry/preview, billing, aset, konfigurasi bersama, dependency, deployment atau commit. Tidak membaca file credential privat, menjalankan migrasi/seed atau menulis database live. Progres bersama dan changelog dikonsolidasikan ROOT setelah gate integrasi.

### Perilaku customer dan superadmin yang tersedia

- `/dashboard` membaca ringkasan undangan milik akun dari DB; angka menampilkan dataset dibatasi 100, bukan total analitik seluruh platform. Header menampilkan nama/email DB. Keluar memakai POST auth nyata, memeriksa `response.ok`, kemudian menuju login dan refresh; kompatibel dengan respons logout 200 JSON aktual.
- `/dashboard/invitations`, `/dashboard/invitations/new`, `/dashboard/invitations/[id]`, serta tab `editor`, `preview`, `settings` berjalan dengan DTO DB. Buat draft memerlukan template internal seed `menujuakad-seed-preproduction-template` / `seed-preproduction-internal`, berstatus DRAFT. Template tidak tersedia menampilkan kegagalan nyata; tidak diganti fixture atau template komersial.
- Editor menyimpan manual teks cover, profil pasangan, satu acara, kisah dan konfigurasi RSVP. Pengaturan menyimpan judul, tanggal pernikahan, slug dan zona waktu Indonesia (Jakarta/Makassar/Jayapura). API PATCH yang sama menjadi endpoint penyimpanan sections terstruktur; tidak memerlukan endpoint JSON bebas. Reload membaca data persisten. Native input/date/time dan field maxlength membantu input, sementara Zod server tetap menjadi otoritas validasi.
- Preview privat membaca hasil DB dengan React escaping teks; tidak menerbitkan slug atau mengaktifkan entitlement. RSVP yang disimpan hanya konfigurasi; penerimaan RSVP publik, upload/media/storage, autosave dan snapshot publikasi belum aktif. Hapus draft menggunakan konfirmasi lokal lalu mutasi server; draft dengan riwayat PaymentTestRequest ditolak409 agar riwayat QRIS tidak hilang. Draft tanpa riwayat menghapus couple/sections secara cascade.
- `/admin`, `/admin/users`, `/admin/invitations` membaca DTO aman. Daftar akun dibatasi tepat whitelist `admin@menujuakad.test`, `customer01@menujuakad.test` sampai `customer10@menujuakad.test`; undangan hanya pemilik whitelist customer. Pagination 25 row/halaman, page 1–10000. Ringkasan menyebut halaman pertama, bukan jumlah global. Tidak mengambil hash, session, provider secret atau isi credential.
- Navigation memakai route peran nyata. Akun customer read-only menampilkan identitas DB. Tamu, RSVP publik, ucapan, hadiah, notifikasi, support dan log webhook menampilkan status layanan belum aktif serta tautan eksplisit ke preview sintetis yang terpisah. Tab tamu/RSVP/ucapan/hadiah/analitik per undangan memeriksa kepemilikan sebelum boundary. Route yang tidak masuk whitelist menghasilkan 404 setelah guard.
- Shell `CustomerWorkspaceShell` dan `AdminWorkspaceShell` diekspor di lokasi sesuai task, digunakan layout actual, dan memiliki satu `<main id="main">`; page/view tidak membuat nested main. Boundary kegagalan identitas layout tetap memiliki main sendiri, sedangkan error data page berupa section. Dua route `not-found.tsx` privat menggunakan section agar root fallback tidak menambah nested main pada 404. Semua enam layout/page/catchall private dan API customer menetapkan `force-dynamic`. Tidak ada cache shared identity/data.
- Billing dan analitik actual mempunyai pemilik worker lain. Navigation menyediakan `/dashboard/billing`, `/dashboard/billing/packages`, `/dashboard/analytics`, `/admin/payments`; concrete route milik mereka mengungguli catchall. Worker ini tidak mengimpor modul pending atau mengubah berkas tersebut. QRIS test tidak diperlakukan sebagai publikasi/pembayaran komersial.

### Batas izin, validasi dan transaksi

Setiap service customer/admin memanggil `getVerifiedSession()` ulang melalui `verifyWorkspaceRole`; guard layout bukan pengganti pemeriksaan operasi. Repository customer membatasi **owner-only**, termasuk `ownerUserId` bersama `User ACTIVE/CUSTOMER` pada lookup, list dan mutation. Membership EDITOR/VIEWER belum diberi izin pada CRUD increment ini. ID undangan customer lain menghasilkan 404 yang sama dengan ID tidak ada. Repository admin memeriksa user ACTIVE/SUPERADMIN lagi sebelum setiap query daftar.

POST/PATCH/DELETE memeriksa `assertTrustedOrigin`, JSON content-type, body streaming maksimal **32768 byte**, dan skema strict. Client tidak boleh menetapkan pemilik, peran, status, published flag, template arbitrary, atau JSON sections arbitrary. Slug memakai helper existing (reserved path, format, 3–80 karakter); constraint unik DB tetap otoritatif dan collision P2002 menjadi 409 aman. Tanggal kalender mustahil, waktu di luar 00:00–23:59, timezone yang tidak didukung dan field asing ditolak 400. DELETE hanya menerima JSON `{}`.

Update/delete hanya DRAFT dengan `isPublished=false`. Guarded UPDATE di transaksi memfilter owner/status dan mengunci row undangan sampai transaksi selesai; couple upsert dan penggantian empat section berjalan di transaksi yang sama. DELETE menaikkan lock row menjadi FOR UPDATE, sehingga penambahan FK PaymentTestRequest menunggu transaksi; count riwayat dijalankan sebelum delete. Riwayat pengujian tetap dipertahankan meski schema memiliki ON DELETE CASCADE. Section yang tidak dikirim tidak berubah. Input config memiliki kontrak per tipe, tidak menjadi mass assignment JSON. Failure transaksi dibatalkan; response tidak mengklaim tersimpan. DB exception dikonversi menjadi 503 aman tanpa detail koneksi dan tanpa fixture; denial 401/403/404 serta state conflict409 tetap dibedakan. Respons API memuat `Cache-Control: private, no-store`.

### Struktur increment, teknologi dan endpoint

Stack existing dipertahankan: Next.js App Router/Server Component untuk routing privat dan query; TypeScript strict untuk DTO; Zod untuk batas input; Prisma7/PostgreSQL untuk persistence transactional; Vitest plus PGlite untuk pengujian tanpa write Neon live. Tidak menambah dependency.

```text
src/server/
  customer/access.ts, identity.ts       verifikasi per operasi, identitas aman
  invitations/input.ts, dto.ts          skema typed, select dan DTO privat
  invitations/repository.ts             query owner-only, transaksi CRUD draft
  invitations/service.ts                sesi, validasi, aturan error domain
  invitations/errors.ts, http.ts        HTTP aman, Origin, batas body, no-store
  admin/repository.ts, query.ts          whitelist, SUPERADMIN, select/pagination
src/features/workspace/
  editor-payload.ts                     payload form whitelist
  use-workspace-mutation.ts             fetch mutasi, status sukses/gagal/refresh
  components/                          form create/editor/settings/delete,
                                       preview privat, view customer/admin,
                                       boundary layanan dan logout
src/components/customer/customer-workspace-shell.tsx
src/components/admin/admin-workspace-shell.tsx
src/app/(dashboard)/dashboard/           layout, page, [...path]/page, not-found
src/app/(admin)/admin/                   layout, page, [...path]/page, not-found
src/app/api/customer/invitations/        route.ts, [id]/route.ts
```

| Metode dan endpoint                     | Kontrak                                                                                               |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| GET `/api/customer/invitations`         | `{ invitations: InvitationDto[] }`, maksimal100 undangan milik sesi                                   |
| POST `/api/customer/invitations`        | `{title,slug,templateId,weddingDate?,timezone?}`; 201 `{invitation}` draft privat                     |
| GET `/api/customer/invitations/[id]`    | 200 `{invitation}` owner-only; asing/tidak ada404                                                     |
| PATCH `/api/customer/invitations/[id]`  | subset nonkosong `{title?,slug?,weddingDate?,timezone?,couple?,sections?}` strict; 200 `{invitation}` |
| DELETE `/api/customer/invitations/[id]` | JSON `{}`, hanya draft belum published; 204 setelah transaksi berhasil                                |

Tidak ada endpoint admin baru pada task ini; Server Component memakai query terverifikasi. Ekspor integrasi: `listCustomerInvitations`, `getCustomerInvitation`, `listCustomerTemplates`, `createCustomerInvitation`, `updateCustomerInvitation`, `deleteCustomerInvitation`, `getWorkspaceIdentity`, `getAdminUsers`, `getAdminInvitations`.

Schema tidak diubah: `User` → `Invitation.ownerUserId`, `Template` → `Invitation.templateId`; `Invitation` → satu `CoupleProfile` dan banyak `InvitationSection`; `InvitationMember` tetap ada tetapi tidak diberi akses baru. Auth/session berasal dari worker Security/Data. Handoff grant minimum workspace ke DevOps: SELECT User/Template; SELECT/INSERT/UPDATE/DELETE Invitation, CoupleProfile, InvitationSection. Tambahkan SELECT PaymentTestRequest untuk count riwayat sebelum delete. Tidak membutuhkan UPDATE User/role/credential atau akses provider. DevOps wajib menilai grant/payment/cascade bersama pemilik data sebelum penerapan live.

### Bukti pengujian increment dan gate yang tersisa

- RED awal input/service dan HTTP/admin berupa import modul yang belum tersedia, kemudian GREEN. Regresi tambahan riwayat QRIS melalui RED assertion nyata: delete semula resolved dan menghapus riwayat, kemudian GREEN menolak409 dan mempertahankan kedua row. Ini bukan klaim seluruh fitur melalui RED assertion murni.
- **51 test /8 file lulus** pada run12:08UTC+8 sesudah perubahan final tests: input12, service6, HTTP10, admin3, payload2, shell4, boundary2, integration PostgreSQL12. Pengujian integrasi memakai **PrismaClient asli** melalui adapter khusus test pada PGlite terisolasi dengan migrasi fondasi dan pembayaran uji existing, bukan mock state atau database live.
- Integrasi membuktikan create/read/update/delete, reread metadata/couple/4section, partial section mempertahankan section lain dan tidak menambah duplikat, cascade saat delete, cross-owner404/no mutation, status ACTIVE/PENDING_PAYMENT/ARCHIVED/SUSPENDED ditolak, DRAFT published ditolak, user suspended/admin tidak dapat create customer draft, slug collision rollback, serta failure penulisan section lewat trigger DB membatalkan metadata/section sebelumnya.
- Admin integration menguji whitelist, select tanpa credential/sesi, penolakan customer dan SUPERADMIN yang disuspend. HTTP menguji Origin, bodylimit, invalidJSON/type, denial/status409 dan503 tanpa detail private/no-store. Shell render menguji satu main, identitas DB props dan link actual. Payload mengabaikan hidden owner/published field. Boundary error layout/page dan render not-found di shell juga diperiksa agar main tidak bersarang.
- **`npm test` seluruh proyek:** snapshot11:59UTC+8 lulus365/365,38file. Run12:05UTC+8 sesudah guard riwayat QRIS mencatat364lulus/2gagal,38file,exit1 (69,48detik): `fixtures.test.ts > screen_codes_are_unique_and_views_whitelisted` mengharapkan55kode tetapi registry53; `fixtures.test.ts > mempertahankan perangkat/state sumber tanpa mengklaim screenshot yang hilang` mengharapkan64screenshot tetapi62. Registry/preview milik worker UIUX dan tidak diubah worker ini. **Rerun terbaru12:09UTC+8 lulus371/371test,40file,exit0 (69,60detik)** setelah integrasi preview berubah; dua kegagalan sebelumnya tidak muncul lagi. Penambahan link paket setelah snapshot diverifikasi TypeScript serta enam test shell/boundary. Tidak menyamakan hasil unit snapshot ini dengan build/browser/grantlive gate final semua worker.
- `npx tsc --noEmit` dan ESLint berkas task ini lulus setelah memperbaiki tiga pelanggaran children-prop pada test shell. Prettier scoped dan `git diff --check` lulus. Komponen terbesar127baris, repository145baris, service43baris; page actual maksimal64baris.
- **Belum dilakukan worker:** full build, E2E actualauth/HTTPS, inspeksi visual/fidelity, grantruntime, migration/seed/write Neon, deployment atau verifikasi produksi. Cookie Secure produksi/origin exact tidak dilonggarkan. ROOT/QA menguji login/logout dua peran, CRUD browser/reload, cross-owner API, role/status perubahan, backend503, noindex/cache, serta integrasi billing/analytics; DevOps menerapkan layanan setelah gate.

## Riwayat baseline frontend sebelum workspace actual

Tanggal: 7 Oktober 2026. Lingkup worker: melanjutkan source parsial, mengimplementasikan UI frontend, route dan shell, tanpa commit/push atau deployment. Dokumen ini melengkapi [rencana 03](03-pm-rencana-slicing.md), bukan menggandakan master rancangan.

## Status dan batas klaim

Sebanyak 53 kode/64 varian telah mempunyai entry point pada `/preview-ui`. **43 kode/52 varian** memiliki komponen nyata dalam ownership fullstack. **10 kode/12 varian** billing/admin/business masih memakai `SpecialistPreviewPlaceholder` secara eksplisit; ini handoff yang diizinkan ROOT, bukan klaim bahwa seluruh platform sudah selesai. Specialist selanjutnya mengganti komponennya melalui resolver statis yang sama. Semua view noindex dan memakai data sintetis.

Marketing, katalog/detail/demo, enam layar auth, customer/wizard/detail, akun/notifikasi/dukungan, empat belas panel editor, cover/opened/invalid undangan, dua error view dan referensi komponen tersedia. Interaksi hanya state browser; reload atau navigasi ke route lain mereset draft. Database/provider/autentikasi/pembayaran/email/unggahan/publish belum terhubung. Produksi menujuakad.com belum diverifikasi oleh worker ini.

## Sumber dan keputusan visual

Stitch MENUJU-AKAD-UIUX (`12559574101879777472`), Editorial Ivory & Gold, Noto Serif + Manrope. Sumber berada pada rancangan, tidak diimpor runtime/build. Manifest 64 record/62 PNG/0 HTML valid diperiksa; HTML login Google tidak digunakan. Worker membuat contact sheet `/tmp/stitch-source-0.jpg` sampai `-7.jpg` dari PNG, tetapi `view_image` ditolak karena model worker tidak mendukung input gambar. **Tidak ada klaim inspeksi visual langsung oleh worker ini.** Komposisi memakai temuan [UI/UX 01](01-uiux-inventaris.md) dan [QA preflight 10](10-qa-validasi.md), yang terakhir diperiksa worker QA dengan viewer berfungsi. Screenshot browser yang dibuat E2E bukan bukti fidelity sampai QA membandingkannya.

CUS-01 desktop dan CUS-02 desktop bersumber metadata saja; layout dirangkai berdasarkan kontrak mobile/tablet dan primitive. CUS-05/06 tidak ditemukan; preview/pengaturan pelengkap ada dalam ringkasan undangan dengan label rekonstruksi. Tidak dibuat kode registry baru untuk kedua gap tersebut. Media foto sumber tidak memiliki original berlisensi yang tersedia; slot `InvitationMedia` memakai ilustrasi CSS/initials dan label foto belum disediakan. Template editorial landscape, botanical floral, minimal monogram dibedakan. Ini **rekonstruksi media**, bukan foto pasangan atau kecocokan piksel Stitch.

Tindak lanjut QA-PF-02/03/04: media per template dibedakan; phone editor menunjukkan section/field relevan (galeri menyebut komposisi sumber, bukan refleksi upload); keluarga shell berbeda; dashboard mobile bottom navigation; checkout tanpa sidebar. PUB-06 memakai enam langkah alternating, sedangkan ringkasan beranda tetap tiga. Wizard memakai lima langkah dan paper preview. Home tablet punya dua kartu paket contoh, mobile satu, desktop tidak menambahkan paket. Selektor varian memilih state/perangkat sumber; ukuran render tetap mengikuti viewport browser, bukan mengganti viewport pengguna.

## Struktur dan tanggung jawab

```text
src/app/
  (public)/            marketing, katalog/detail/demo, undangan contoh
  (auth)/              layout minimal dan lima entry point akun
  (dashboard)/         boundary customer server dan route terlindungi
  (admin)/             boundary superadmin server dan route terlindungi
  preview-ui/          galeri + dynamic route whitelist
  styles/              tokens, base, primitives, marketing, media, workspace,
                       customer shells, account, invitation
src/components/
  ui/                  primitive existing
  shared/              brand, public/auth shells, media/ornament
  customer/            sidebar, domain horizontal, account/support, checkout,
                       header dan bottom navigation
  admin/               shell superadmin
src/features/
  auth/                copy/config, hook validasi lokal, form
  templates/           katalog filter, card, detail
  marketing/           komponen per section/halaman
  invitations/         customer, editor, dokumen undangan; hooks dan aturan draft/kuota
  account/             profil/notifikasi dan hook interaksi
  support/             percakapan/tiket dan hook lokal
  design-preview/      data/DTO milik data engineer; resolver/galeri/banner
src/server/authorization/  guard milik security, dipakai tanpa perubahan
src/proxy.ts           penolakan path/varian asing sebelum streaming
public/fonts/          font lokal + lisensi dan SOURCES.txt
public/ornaments/      hanya aset SVG yang dipakai
```

Page tipis, JSX dipisahkan dari copy/config/validasi dan hook state yang kompleks. CSS global hanya import; stylesheet dipecah berdasarkan tanggung jawab. Worker tidak membuat API dummy, model atau migrasi baru. DTO/fixture dan authorization final milik worker lain dipakai tanpa diubah.

## Routing, izin dan kontrak integrasi

Publik: `/`, `/templates`, `/templates/[slug]`, `/demo/[templateSlug]`, `/pricing`, `/how-it-works`, `/faq`, `/contact`, `/about`, `/terms`, `/privacy`. Auth: `/login` (termasuk state konflik), `/register`, `/forgot-password`, `/reset-password`, `/verify-email`; form lokal tidak mengikuti `next` atau membuat sesi. Undangan: `/invitation/sarah-dimas-contoh` adalah whitelist sintetis berlabel belum terbit; slug lain 404. Template/demo hanya menerima tiga slug DTO yang terdaftar. Harga, legal dan kontak belum menjadi klaim komersial; teks draf/layanan belum aktif eksplisit.

`/dashboard/*` memanggil `requireCustomerSession`, `/admin/*` memanggil `requireSuperadminSession`, termasuk boundary dan catch-all page. Resolver null berarti selalu redirect ke login; fixture role bukan sesi. Operasi server/ownership belum dibuat dan tetap memerlukan guard sendiri saat backend ditambahkan.

`/preview-ui/[code]` memakai `getPreviewScreen` dan `resolveScreenVariant`. Kode asing, ID varian asing/silang dan varian ganda ditolak. Tidak ada dynamic import/filesystem path dari query. `src/proxy.ts` menolak alamat preview/template/demo/undangan yang tidak terdaftar dengan rewrite ke halaman 404 native sebelum loading/streaming Next mengirim status 200. Validasi page tetap ada sebagai lapisan komposisi. Prefix about/terms/privacy/preview-ui/how-it-works/fonts ditambahkan pada reserved slug agar resolver undangan masa depan tidak berbenturan.

Resolver ownership fullstack: `DesignPreviewView({ screen })`. Billing/business sementara melalui `SpecialistPreviewPlaceholder`. Ketika specialist selesai, CUS-07/08 dan ADM-01/02 diganti export terkunci dokumen 07; GST-01–06 diganti export dokumen 08. `CustomerPreviewLayout({ screen, children })` memilih sidebar untuk customer umum/GST-01 empty/GST-02–04; header/tab horizontal untuk GST-01 default/05/06; header+main tanpa sidebar untuk ACC/SUP; `CheckoutShell` untuk CUS-08. Resolver varian mengembalikan seluruh metadata layar dengan state sumber terpilih, sehingga empty/expired/gallery error/token-invalid dapat di-wire tepat.

## Interaksi dan adaptasi domain

Editor: perubahan cover, pasangan, cerita, acara, RSVP, musik, panduan, video, countdown, siaran, hashtag langsung mengubah draft lokal dan section preview. Save memvalidasi judul, angka rombongan dan HTTPS media; menyebut tersimpan lokal, bukan server. Galeri hanya menambah ilustrasi contoh; error dan kuota sumber terpisah. Pemakaian quota mempertahankan item sumber yang tidak dirender, ERROR tidak dihitung sebagai READY. Publish hanya simulasi pemeriksaan dan tidak mengubah lifecycle/isPublished.

Customer: search/status filter undangan; wizard lima tahap, paper preview dan validasi lokal; ringkasan memisahkan DRAFT/ACTIVE dari publikasi. Notifikasi mark-read/preferences lokal. Dukungan membuat tiket/balasan sintetis di memori, tidak mengirim kontak. Profil/provider/password/session UI tidak memberi akses backend. RSVP memakai enum NOT_ATTENDING/MAYBE/PENDING sesuai kontrak; form undangan lokal tidak menjadi guest record produksi.

Musik/video/live/filter tidak mengunduh, memutar atau menanam embed eksternal. Kontrol produksi (login Google, verifikasi, pembayaran, unggahan, publish) tidak mengaku sukses. Gallery preview phone adalah komposisi contoh sumber; item editor lokal tidak diproyeksikan sebagai media yang telah diunggah. Data lokal di editor reset saat pindah route; batas ini tertulis pada UI/report.

## Aset dan pemeriksaan publikasi

Tujuh TTF Noto Serif/Manrope existing dipertahankan dan checksum bytes dibandingkan URL Google Fonts asal pada CSS lokal terdahulu; semuanya identik. Lisensi SIL Open Font License dari repository Google Fonts resmi disimpan di `public/fonts/manrope-OFL.txt` dan `notoserif-OFL.txt`; sumber/checksum di SOURCES.txt. Tidak ada request font remote saat browser memakai halaman. Floral `ivory-bouquet.svg` identik aset floral05 pilihan user dari sumber rancangan; pemakaian authorized sesi bukan klaim audit hak cipta pihak ketiga. Foto/video/audio produksi belum disediakan, sehingga slot media tetap ilustrasi eksplisit.

Tidak menambahkan credential, .env, URL database/auth, API provider, token tamu, raw webhook, signature atau rekening produksi. Runtime tidak mengimpor folder rancangan. Diff source dan daftar public diperiksa; secret scan final artifact/riwayat dan verifikasi produksi tetap pekerjaan gate ROOT/QA/DevOps. Worker tidak menjalankan commit/push, migrasi, SSH, layanan OS atau deployment.

## Bukti validasi lokal

Gate awal source setelah refinemen shell/media/wizard pada 7 Oktober 2026 pukul 19.26–19.28 CST: `db:validate`, `typecheck`, `lint`, **209 unit test**, build, dan **18 E2E** seluruhnya lulus. Pipeline `/tmp/fullstack-final-*.log` memakai `set -e` dan mencapai akhir; exit code 0 diperiksa. E2E membuka 53 kode/64 varian pada desktop/mobile, noindex, 404 sebenarnya, guard anonim/cookie palsu, reset draft, kuota, token invalid, wizard, dukungan, validasi auth, dan viewport tablet. Screenshot home/editor disimpan pada `test-results/`; worker tidak membaca gambar itu secara visual.

RED/GREEN yang diamati: draft/variant 3 assertion gagal sebelum implementasi dan kemudian lulus; proxy 7 gagal/5 lulus sebelum whitelist dan 12 lulus sesudahnya; kuota 2 gagal kemudian lulus; reserved prefix enam gagal sebelum konfigurasi ditambah. E2E awal 10 lulus/4 gagal menemukan status HTTP 200 pada 404 streaming; proxy memperbaiki penyebab, seluruh 18 kasus kemudian lulus. Bukan menurunkan expected status untuk meluluskan test.

Sesudah review scoped QA meminta kontrol auth/cover/media tambahan, tiga regresi E2E baru benar-benar gagal pada source sebelumnya (missing recipient/provider/mode/style), lalu implementasi diperbaiki. Durasi countdown mempunyai dua regresi unit RED lalu GREEN, mencakup WIB/clock fixture, tanggal invalid dan zero-state. Suite unit saat refinemen terakhir pukul **19.35.04 CST: 211 lulus, 12 berkas**. Typecheck/lint terbaru lulus. Build dan enam E2E fokus kemudian lulus (**6/6**, 10,6 detik), dan seluruh E2E terintegrasi setelah kontrol tambahan lulus **24/24** sebelum koreksi submit tanpa JavaScript.

Gate **terakhir sesudah SEC-INT-01**, 7 Oktober 2026 pukul 19.42–19.44 CST, pipeline `set -e` exit **0**: `npm run db:validate` schema Prisma valid; `npm run typecheck` lulus; `npm run lint` **0 error/0 warning**; `npm test` **211 lulus/12 file**; `npm run build` lulus; `npm run test:e2e` **26 lulus (1,4 menit)** pada desktop/mobile. Log otoritatif terakhir `/tmp/fullstack-verified-{db,typecheck,lint,tests,build,e2e}.log`, bukan log diagnosis lama. Tabel route build memuat Proxy, auth/public/customer/admin/preview. Tidak menjalankan migrasi atau layanan produksi.

SEC-INT-01 ditutup pada source ownership fullstack melalui `LocalPreviewForm`, memakai snapshot SSR false/client true dari `useSyncExternalStore`: seluruh kontrol descendant fieldset disabled sampai handler lokal aktif. Handler wrapper selalu memanggil preventDefault sebelum callback konsumen. Form tidak mempunyai action/method atau fallback POST ke server. Auth, kontak, profil/password, dukungan, wizard dan RSVP undangan memakai wrapper yang sama; grep `<form` sekarang hanya menemukan komponen wrapper. Satu lint warning `aria-disabled` pada role form dibuang; disabled menggunakan semantik native fieldset.

Regresi tanpa JavaScript benar-benar RED sebelum perbaikan (input auth masih enabled), lalu GREEN pada kedua proyek browser. Sembilan path `/login`, `/register`, `/forgot-password`, `/reset-password`, `/contact`, `/preview-ui/acc-01`, `/preview-ui/sup-01`, `/preview-ui/cus-03`, `/preview-ui/inv-02` diperiksa: kontrol disabled, upaya fill sentinel sintetis ditolak, Enter tidak mengubah URL, query tetap kosong, tidak ada request URL/body yang membawa sentinel. Mode JavaScript aktif tetap berfungsi pada 24 skenario lainnya; no-mutation assertion pada alur aktif dan auth khusus tetap lulus. Ini membuktikan jalur yang diuji, bukan seluruh future backend/action. Specialist yang kelak menambah form preview wajib memakai wrapper yang sama, bukan form native default GET.

Ukuran source final: page maksimal 26 baris; komponen/hook berada di bawah 200 baris, stylesheet maksimal 369. Global CSS hanya import stylesheet per tanggung jawab. Source tetap diformat Prettier; `git diff --check` diperiksa. Pengujian tidak mengaktifkan database/provider/payment atau deployment. No-mutation assertion mencakup flow interaksi yang diuji, bukan klaim seluruh future action aman.

## Koreksi scoped QA dan gap fidelity tersisa

QA-FS-01: AUT-05 kini recipient `.invalid`, status menunggu, cooldown 60 detik **simulasi manual**, resend disabled hingga nol lalu kembali 60 dengan pesan email tidak dikirim. AUT-06 kini kartu Google/email dan CTA lokal berbeda tanpa menautkan akun/provider. Shared auth card, selector mode, standard form dan hook khusus dipisahkan.

QA-FS-03: EDT-02 tiga mode Type Focus/Portrait/Solid, typography Noto Serif/Manrope, overlay slider dan warna dasar; phone mengikuti mode/draft. Saved state disebut lokal/simulasi, bukan disimpan server. Portrait tetap media ilustrasi karena foto source belum disediakan.

QA-FS-04: EDT-09 mempunyai playlist ilustratif, waveform/player state lokal, volume/loop/perilaku dan disabled upload; tidak ada audio diputar. EDT-11 mempunyai provider/ratio/poster dan slot player tanpa embed. EDT-12 mempunyai tiga gaya, event/time input, calendar dan zero-state; phone menampilkan durasi hari/jam/menit/detik terhadap clock fixture, bukan tanggal yang disamarkan sebagai durasi. EDT-13 mempunyai platform/link/schedule/access contoh; setting tidak memberi keamanan resource nyata. EDT-14 tagar dan filter/thumbnail berada dalam dua section utama. Tidak menggunakan aset kosong sebagai alasan melewatkan struktur kontrol.

Gap fidelity yang tetap dicatat, bukan diklasifikasikan hanya sebagai keterbatasan media: PUB-02 katalog memakai tiga template DTO, belum delapan media source/pagination/concierge; PUB-03 belum section tabs/related designs; PUB-07 belum kategori FAQ/group concierge; PUB-08/09 sebagian service/quality/storytelling section lebih ringkas; PUB-10/11 draf legal lima section, bukan seluruh struktur legal source. CUS-03 belum semua family/nickname/order fields, CUS-04 belum semua collaborator/package/domain panels. ACC source stack/settings berbeda dengan panel selectable; SUP booking/FAQ belum lengkap. EDT default/saved/galeri dan publish mempertahankan komposisi inti dengan interaksi lokal, tetapi copy mikro, semua pilihan desain/spacing/modal tidak dinyatakan identik. ERR belum seluruh guide/telemetry structure, DS adalah subset primitive/reference. Ini memerlukan keputusan/review visual final ROOT/QA; route coverage tidak membuktikan fidelity penuh.

Review scoped QA dan Security bersifat independen baca-saja; koreksi di atas beserta SEC-INT-01 telah diimplementasikan dan diuji oleh worker, namun verdict review source ulang/visual final tetap milik reviewer. Media/template, shell per keluarga, phone section, wizard lima tahap dan six-step PUB-06 sudah ditinjau source dalam report10. QA browser wholebranch, keyboard/zoom200%, export specialist, secret/artifact serta rilis produksi tetap gate berikutnya setelah integrasi.

## Matriks per record sumber

Semua source record tercantum sekali. Status React tersedia berarti frontend ada dengan adaptasi dan belum menjadi klaim fidelity/layanan/produksi. Record berstatus handoff specialist hanya stub teridentifikasi, tidak dihitung sebagai slicing domain selesai.

| Kode    | ID record                          | Perangkat / state                             | Keputusan cakupan                                         |
| ------- | ---------------------------------- | --------------------------------------------- | --------------------------------------------------------- |
| ACC-01  | `fac73b6ed2f346b6a52cb1234a27f5cf` | DESKTOP / Default                             | React tersedia, adaptasi media/copy; visual final pending |
| ACC-02  | `c1f6fe8a7010482fa053e30ba9cd9ea4` | DESKTOP / Default                             | React tersedia, adaptasi media/copy; visual final pending |
| ADM-01  | `72c3e194242f46c5826dbf91aa321b62` | DESKTOP / Default                             | Handoff specialist, stub terbatas                         |
| ADM-02  | `2a62b424023f49a2b70102b70be5bbfc` | DESKTOP / Default                             | Handoff specialist, stub terbatas                         |
| AUT-01  | `9ea16663b63546ce8c103940421b91e5` | DESKTOP / Default                             | React tersedia, adaptasi media/copy; visual final pending |
| AUT-02  | `11072bac1e934f2d835e647905baeeea` | DESKTOP / Default                             | React tersedia, adaptasi media/copy; visual final pending |
| AUT-03  | `374086ceee4143008b05259a5f12e361` | DESKTOP / Default                             | React tersedia, adaptasi media/copy; visual final pending |
| AUT-04  | `795d0fa9d1114cf7bc9b0411d60805ef` | DESKTOP / Default                             | React tersedia, adaptasi media/copy; visual final pending |
| AUT-05  | `b260f70d419242e18e3d98b0ac5f86fe` | DESKTOP / Default                             | React tersedia, adaptasi media/copy; visual final pending |
| AUT-06  | `05b5cc0add9c473586bc1f0a8d3ca07e` | DESKTOP / Default                             | React tersedia, adaptasi media/copy; visual final pending |
| CUS-01  | `3f8be25ae0eb4ba9b5190d593d7a967a` | DESKTOP / Default                             | Rekonstruksi metadata-only                                |
| CUS-01  | `ef2b1181368f49fbad64c1e5e7fdc872` | MOBILE / Default                              | React tersedia, adaptasi media/copy; visual final pending |
| CUS-01  | `50b582012ab341c2bc18c37505e362af` | TABLET / Default                              | React tersedia, adaptasi media/copy; visual final pending |
| CUS-02  | `353a7f3c9fb94e26bfe66324ba2ea60f` | DESKTOP / Default                             | Rekonstruksi metadata-only                                |
| CUS-03  | `38f0c6505e6b4ea1bc675e961ac45904` | DESKTOP / Default                             | React tersedia, adaptasi media/copy; visual final pending |
| CUS-04  | `a99ec67bf64e431ab1506d1606879be1` | DESKTOP / Default                             | React tersedia, adaptasi media/copy; visual final pending |
| CUS-07  | `3ecacc9efc524ae2934bcb75337abf35` | DESKTOP / Default                             | Handoff specialist, stub terbatas                         |
| CUS-08  | `741bf2dc293243f29a02bea0b8546ed6` | DESKTOP / Expired                             | Handoff specialist, stub terbatas                         |
| CUS-08  | `b6693cee4ed7403c93340c99927c3e40` | DESKTOP / Default                             | Handoff specialist, stub terbatas                         |
| DS-01   | `2e2fbdb9fdbc4d55b2872cf9ba778967` | DESKTOP / Default                             | React tersedia, adaptasi media/copy; visual final pending |
| EDT-01  | `0e9cd9e451864d6fa1d8d37d3bdb8538` | DESKTOP / Default                             | React tersedia, adaptasi media/copy; visual final pending |
| EDT-02  | `1f8d5b98d59d48c490ac953f7a6a2372` | DESKTOP / Tersimpan                           | React tersedia, adaptasi media/copy; visual final pending |
| EDT-03  | `0bf6f59bc1784118b44a4bbe81af09b1` | DESKTOP / Default                             | React tersedia, adaptasi media/copy; visual final pending |
| EDT-04  | `5ae8ad59f59b46aeb178c81ef9689633` | DESKTOP / Default                             | React tersedia, adaptasi media/copy; visual final pending |
| EDT-05  | `25d9ae2373c64f11aa63633c4835dd57` | DESKTOP / Default                             | React tersedia, adaptasi media/copy; visual final pending |
| EDT-06  | `235eba55b0ff40b0a310fa46636c6e86` | DESKTOP / Default                             | React tersedia, adaptasi media/copy; visual final pending |
| EDT-06  | `862e4ca6eeb34361a1fb72051c845fbf` | DESKTOP / Error & Kuota                       | React tersedia, adaptasi media/copy; visual final pending |
| EDT-07  | `5ab1f365d6a94ad2a9d879e0f1a5c8b6` | DESKTOP / Default                             | React tersedia, adaptasi media/copy; visual final pending |
| EDT-08  | `8935f050b1084f6eac6f0a8ec0cebf98` | DESKTOP / Default                             | React tersedia, adaptasi media/copy; visual final pending |
| EDT-09  | `3e2017adb79a4fdbacef2dd908d154d5` | DESKTOP / Default                             | React tersedia, adaptasi media/copy; visual final pending |
| EDT-10  | `167c8c120891430ab562c7ce04da062d` | DESKTOP / Default                             | React tersedia, adaptasi media/copy; visual final pending |
| EDT-11  | `cddf768b744142cbbed3f23e4afddc9b` | DESKTOP / Default                             | React tersedia, adaptasi media/copy; visual final pending |
| EDT-12  | `7736a524ebe047cfb08732509b4e7be2` | DESKTOP / Default                             | React tersedia, adaptasi media/copy; visual final pending |
| EDT-13  | `d78ab1cff4b74934bf84c0fb432cfe48` | DESKTOP / Default                             | React tersedia, adaptasi media/copy; visual final pending |
| EDT-14  | `20ab6c6ba27f4c748e6e3c62d6f2a56e` | DESKTOP / Default                             | React tersedia, adaptasi media/copy; visual final pending |
| ERR-404 | `8e7a57f11275400095caed4dbbf9d908` | DESKTOP / Default                             | React tersedia, adaptasi media/copy; visual final pending |
| ERR-500 | `c6fa656ee220450ab292630757074568` | DESKTOP / Default                             | React tersedia, adaptasi media/copy; visual final pending |
| GST-01  | `11e96c32f956400f90704e16fc036017` | DESKTOP / Default                             | Handoff specialist, stub terbatas                         |
| GST-01  | `f51fb5404c334e16b7e0e3763ae4b56c` | DESKTOP / Empty State                         | Handoff specialist, stub terbatas                         |
| GST-02  | `10ecb8332e0144e7ac07ffd72c95afe1` | DESKTOP / Default                             | Handoff specialist, stub terbatas                         |
| GST-03  | `ddb8bf9d3d3e401db76339636c39d77e` | DESKTOP / Default                             | Handoff specialist, stub terbatas                         |
| GST-04  | `345e7dacfab047d6a76f85139b8ecbc8` | DESKTOP / Default                             | Handoff specialist, stub terbatas                         |
| GST-05  | `02ff2daf3d9d4ca5a5f4494c13bcf928` | DESKTOP / Default                             | Handoff specialist, stub terbatas                         |
| GST-06  | `45178a30b0b8412e80275ece5a60c27b` | DESKTOP / Default                             | Handoff specialist, stub terbatas                         |
| INV-01  | `a010041543c64da7b21ab86530aeb9eb` | DESKTOP / Token Tidak Valid                   | React tersedia, adaptasi media/copy; visual final pending |
| INV-01  | `c61ac7e0eb8a4cc3b0f1a534bc689347` | DESKTOP / Default (data contoh Sarah & Dimas) | React tersedia, adaptasi media/copy; visual final pending |
| INV-01  | `d94f30baf9a74d3dbb0a766f3b76ea1f` | MOBILE / Default (data contoh Sarah & Dimas)  | React tersedia, adaptasi media/copy; visual final pending |
| INV-02  | `8369d1d57ec24d4dae70a500cc7cfcc8` | DESKTOP / Default (data contoh Sarah & Dimas) | React tersedia, adaptasi media/copy; visual final pending |
| INV-02  | `3635f0fdbc14426d94d88987047d86fb` | MOBILE / Default (data contoh Sarah & Dimas)  | React tersedia, adaptasi media/copy; visual final pending |
| INV-02  | `73c6007c72ce4492a0b6db86e02e9f7e` | TABLET / Default (data contoh Sarah & Dimas)  | React tersedia, adaptasi media/copy; visual final pending |
| PUB-01  | `89b3b52f9ff94da78ba6973ea2c26599` | DESKTOP / Default                             | React tersedia, adaptasi media/copy; visual final pending |
| PUB-01  | `68f625d97b2f452b815d20dd85f5dedd` | MOBILE / Default                              | React tersedia, adaptasi media/copy; visual final pending |
| PUB-01  | `3e8ea0139228478789c62d016aeda74e` | TABLET / Default                              | React tersedia, adaptasi media/copy; visual final pending |
| PUB-02  | `108a4b40408144b197c44189be1117e8` | DESKTOP / Default                             | React tersedia, adaptasi media/copy; visual final pending |
| PUB-03  | `43976a8ca50b43e886d9d65e4ed7f46a` | DESKTOP / Serenade No. 1                      | React tersedia, adaptasi media/copy; visual final pending |
| PUB-04  | `fd3da5e5ad6443e9a1e3f36ddaa73214` | DESKTOP / Serenade No. 1                      | React tersedia, adaptasi media/copy; visual final pending |
| PUB-05  | `8052e6cb587f430aaaf2c65777ba4ac4` | DESKTOP / Default                             | React tersedia, adaptasi media/copy; visual final pending |
| PUB-06  | `259e20bf907f4af0a9bfbc16a866958f` | DESKTOP / Default                             | React tersedia, adaptasi media/copy; visual final pending |
| PUB-07  | `bfef156c33e44870ab4ce8945f178f1c` | DESKTOP / Default                             | React tersedia, adaptasi media/copy; visual final pending |
| PUB-08  | `12e0439bae264e05a54798cee8cc29f3` | DESKTOP / Default                             | React tersedia, adaptasi media/copy; visual final pending |
| PUB-09  | `3f93162cd56b42fab23cf00f4e27b067` | DESKTOP / Default                             | React tersedia, adaptasi media/copy; visual final pending |
| PUB-10  | `8a761fffb6614e2ba5afa55dc8eea882` | DESKTOP / Default                             | React tersedia, adaptasi media/copy; visual final pending |
| PUB-11  | `34796844c701435a9443cd85f8579d23` | DESKTOP / Default                             | React tersedia, adaptasi media/copy; visual final pending |
| SUP-01  | `ef0a0541dcf545a0b8a2c70783aab7ff` | DESKTOP / Default                             | React tersedia, adaptasi media/copy; visual final pending |

## Handoff berikutnya

ROOT melanjutkan specialist billing/business, wiring resolver, SEO/content metadata, review visual browser dengan model yang dapat membaca gambar, gate integrasi akhir, dan rilis VPS jika akses tujuan tersedia. Public preview ini belum membuktikan produk backend atau domain live.

## Increment GST-01 dan reflow paket — 8 Oktober 2026

Increment ini melanjutkan [audit UI/UX 01](01-uiux-inventaris.md), khusus GST-01 dan temuan tambahan QA-PROD-01 CUS-07 yang diberikan ROOT. Fondasi, impor CSV, fixture dan navigasi yang tersedia dipertahankan. Tidak ada scaffold, dependency, kontak tamu, token personal, WhatsApp, provider atau backend nyata baru. Dokumen ini satu-satunya dokumen yang diubah worker; progres, changelog, QA, inventaris dan deployment tetap menjadi tanggung jawab pemilik masing-masing.

### Kontrak dan tanggung jawab modul increment

- `src/features/guests/lib/guest-preview.ts`: `summarizeGuests` menerima daftar `GuestPreviewDto` readonly, menghitung total tamu, `seats=sum(partySize)`, `sent=count(SENT_EXAMPLE)`, persentase pengiriman dan empat status RSVP. Denominator persentase adalah seluruh tamu; pembulatan integer konsisten, daftar kosong menghasilkan nol. Pencarian, filter dan pagination tidak mengubah denominator ringkasan.
- `src/features/guests/components/guest-summary-cards.tsx`: komponen presentasi empat kartu terpisah, menerima hasil agregasi. Nilai bukan salinan PNG: fixture saat ini menghasilkan 120 tamu, 120 kursi, 100/120 ilustrasi terkirim (83%), 68 hadir (57%), 20 tidak hadir, 12 masih ragu dan 20 belum menjawab. RSVP MAYBE/PENDING tetap berbeda.
- `src/features/guests/lib/guest-labels.ts`: pemetaan grup ke Keluarga, Teman dan Rekan kerja digunakan tabel serta select filter; nilai internal DTO/filter tetap sama.
- `src/features/guests/components/guest-table.tsx`: label grup Indonesia, badge RSVP dengan teks, kursi aktual per DTO dan status pengiriman ilustratif. Desktop memakai tabel lima kolom; mobile menampilkan setiap baris sebagai kartu dengan kelima label terlihat. Satu DOM/data source, role tabel eksplisit untuk perubahan display CSS, header tetap tersedia bagi pembaca layar. Label visual mobile memakai `aria-hidden` agar tidak menggandakan nama sel aksesibel.
- `src/features/guests/components/guest-management-preview.tsx`: tetap mengelola state/filter/tambah/CSV/pagination/reset lokal; memakai komponen ringkasan. Kedua tombol pagination memakai `button secondary` dan target 48 px.
- `src/features/guests/styles.css`: selector guest scoped, grid empat kolom desktop ≥1024 px, dua pada 768–1023 px dan satu pada ≤767 px setelah resume responsif berikut. Transformasi tabel mobile hanya `.guest-table`; grid yang sama sekarang dipakai GST-03. GST-02 serta tabel hadiah tidak diubah.

Seluruh operasi tetap preview sintetis. Tambah tamu disimpan di memori komponen dan reset saat reload; CSV tetap hanya data contoh tanpa kontak/token/tautan personal. Tidak menambah akses database, sesi private, mutasi server atau pengiriman nyata. Boundary customer/admin existing tidak diubah.

### Koreksi tambahan CUS-07 dari bukti QA

Bukti `/tmp/menujuakad-qa-resume-20261008/overflow-diagnosis.json`, skrip diagnosis dan laporan final QA dibaca sebelum mengubah CSS. Pada 768 px, dokumen melebar menjadi 779 px: teks harga `Rp 249.000` dengan spasi tak terputus dan font 32 px melampaui kartu tiga kolom; teks tabel komparasi terpisah sudah dibatasi scroll container. QA juga mereproduksi 769 px pada desktop tanpa sentuhan; bug tidak diklaim khusus perangkat sentuh. Hipotesis browser satu kolom mengembalikan lebar dokumen ke 768 px.

`src/features/billing/styles.css` kini memberi kartu paket `min-width:0` serta `overflow-wrap:anywhere`, dan memakai satu kolom paket pada ≤1023 px, sebelum breakpoint lama 767 px. Perubahan scoped terhadap kartu/grid paket, tanpa mengubah nominal, order, checkout, tabel, provider atau autentikasi. Hasil browser kode baru masih menunggu QA final; diagnosis hipotesis bukan bukti source baru sudah lulus produksi.

### Regresi dan hasil validasi increment

TDD agregasi diuji RED terlebih dahulu: tiga regresi gagal karena field seats/sent/deliveryRatePercent belum tersedia. Sesudah implementasi, ketiganya GREEN. Input uji memiliki partySize 3/2/1, status pengiriman yang sengaja berbeda dari status RSVP, denominator kosong, serta tambahan lokal pending yang menaikkan tamu/kursi tanpa menaikkan pengiriman. Regresi render tabel juga gagal sebelum koreksi grup/kursi, lalu lulus; assertion final memeriksa isi hasil render, bukan class atau seluruh markup persis.

| Pemeriksaan worker                     | Hasil                                                                                                             |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `npm test -- src/features/guests`      | 2 file, 8 test lulus                                                                                              |
| `npm test` pada source increment       | 18 file, 243 test lulus; dijalankan ulang setelah label mobile dibuat eksplisit                                   |
| `npm run typecheck`                    | Lulus; Prisma generate/TypeScript exit 0                                                                          |
| `npm run lint`                         | Lulus; exit 0 tanpa keluaran error                                                                                |
| Format berkas increment dan whitespace | Diperiksa dengan Prettier serta `git diff --check`                                                                |
| `npm run build`, `npm run test:e2e`    | Tidak dijalankan worker sesuai instruksi ROOT; QA final menjadi pemilik build/browser                             |
| Viewer sumber dan capture GST-01       | Dua panggilan `view_image` ditolak karena model tidak mendukung input gambar; tidak ada klaim pembandingan piksel |

Regresi E2E baru tersedia di `tests/e2e/business.spec.ts`: empat kartu berbasis daftar penuh saat filter, perubahan total/kursi/pengiriman/RSVP setelah tambah lokal dan reset reload, empty tanpa NaN/Infinity, lima label/isi mobile terlihat, lebar sel/halaman serta target pagination 48 px. `tests/e2e/billing.spec.ts` menambahkan konteks desktop tanpa sentuhan dan Pixel 7 dengan sentuhan, DPR 1, lebar 768/769/800 px; pemeriksaan mencakup lebar dokumen, posisi teks harga terhadap kartu, dan pilihan paket tetap lokal. E2E baru belum dijalankan oleh worker.

Sumber yang diminta: `../menujuakad-rancangan/docs/assets/stitch/gst-01-11e96c32f956400f90704e16fc036017.png` dan `/tmp/menujuakad-uiux-resume-20261008/gst-01-1440.png`. Worker mengandalkan audit DOM/CSS dan handoff reviewer karena viewer ditolak. Source tersedia dan unit/typecheck/lint teruji lokal; build, browser final, fidelity visual serta publikasi increment belum diklaim. Status grid GST-03, tab shell dan selector varian dilanjutkan pada resume responsif berikut; fidelity layar lain tetap terbuka.

### Resume responsif GST-01/GST-03 dan kontrol — 8 Oktober 2026

Scope ini menutup kode koreksi QA-FINAL-01 pada 701–767 px, grid empat kategori GST-03 (UIUX-08-GST-01), dan target sentuh tab domain/selector varian (UIUX-08-CONTROL-01). Source uncommitted sebelumnya dipertahankan. Worker membaca role fullstack, AGENTS, progres bersama, changelog dua folder, master spec, token resmi serta handoff UI/UX/QA/rencana sebelum edit. Tidak mengubah angka, fixture, dependency, scaffold, guard, auth, database, provider, changelog atau progres. Tidak commit, push atau deploy.

| Berkas increment                                  | Tanggung jawab dan perubahan                                                                                                                                                               |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/features/guests/styles.css`                  | Batas mobile `.guest-summary` dan kartu berlabel `.guest-table` dari 700 menjadi 767 px; tablet tetap 768–1023 dan desktop ≥1024. Breakpoint filter existing tidak diubah.                 |
| `src/features/guests/components/rsvp-preview.tsx` | Empat kategori RSVP memakai grid feature `.guest-summary`; hadir, tidak hadir, ragu dan pending tetap terpisah dengan nilai existing. Tidak mengubah tabel respons atau agregasi.          |
| `src/app/styles/customer-shells.css`              | Kelima tab domain minimal 48×48 px, isi tengah, serta wrap; semua tab terlihat pada 320 px tanpa geser horizontal. Link, aria-current dan indikator focus-visible existing tetap tersedia. |
| `src/app/styles/workspace.css`                    | Selector minimal 48×48 px; label dapat menyusut dan lebarnya dibatasi container, selector maksimum `min(300px, 100%)` dan tetap penuh pada mobile.                                         |
| `tests/e2e/responsive-guests.spec.ts`             | Regresi browser geometri/layout, label mobile, empat status/nilai, target sentuh, overflow dan urutan fokus keyboard.                                                                      |
| `docs/06-fullstack-slicing.md`                    | Konsolidasi hasil dan handoff increment ini dalam dokumen existing.                                                                                                                        |

Regresi baru memiliki 14 skenario, dijalankan pada proyek Desktop Chrome dan Pixel 7: total 28 pemeriksaan. GST-01 dan GST-03 masing-masing diuji pada 701/767/768/1024 px; expected grid 1/1/2/4 kolom. GST-01 memeriksa kelima label mobile dan bidang berada dalam viewport; tablet/desktop tetap tabel. GST-03 memeriksa empat kategori dan nilai fixture 68/20/12/20, tanpa menggabungkan MAYBE/PENDING. Kontrol diuji pada 320/701/767/768/1024 px untuk selector GST-01/CUS-08 dan kelima tab domain: minimal 48×48, batas viewport, nav tidak perlu scroll horizontal, dokumen tidak melebar. Skenario keyboard 320 px menggunakan Tab sesungguhnya, memeriksa selector lalu kelima tab, pseudo-state focus-visible/outline, dan Enter pada Statistik menuju GST-06. Ini pemeriksaan DOM/browser, bukan bukti kontras visual atau screen reader fisik.

| Pemeriksaan/command                                                                  | Bukti hasil dan log                                                                                                                                                                                                                                                                              |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Baseline `npm run build` sebelum source fix                                          | Exit 0; `baseline-build.log`, BUILD_ID `-fsKdequzGk7TN5C5abOj` pada `baseline-build-id.txt`.                                                                                                                                                                                                     |
| RED `npm run test:e2e -- tests/e2e/responsive-guests.spec.ts --workers=2`            | Exit 1; **20 gagal/8 lulus** dalam 44,2 s, `red-e2e.log`. GST-01 701/767 masih dua kolom, GST-03 768 masih tiga dan 1024 kartu keempat turun, selector hanya 40 px. Kegagalan assertion, bukan error koleksi/server.                                                                             |
| RED kontrol `npm run test:e2e -- tests/e2e/responsive-guests.spec.ts --grep 'Kontrol | keyboard' --workers=2`                                                                                                                                                                                                                                                                           | Exit 1; **12 gagal**, `red-controls-e2e.log`. Assertion ukuran dibuat soft agar pemeriksaan seluruh kontrol tetap berlangsung: Tamu 41 px, RSVP 40 px, tab terakhir melampaui 320 px (tepi kanan 358), nav perlu scroll. Source belum diubah pada kedua run RED. |
| GREEN `npm run check`                                                                | Exit 0; Prisma validate 7.10.0, typecheck, lint, **243 unit/18 file** dan build lulus. `check.log`/`check-exit.txt`.                                                                                                                                                                             |
| GREEN `npm run test:e2e -- tests/e2e/responsive-guests.spec.ts --workers=2`          | Exit 0; **28/28 lulus dalam 36,2 s** dalam satu run, `green-e2e.log`/`green-exit.txt`. Desktop Chrome dan Pixel 7 masing-masing 14 lulus; test/assertion tidak dihapus atau dilonggarkan sesudah source fix.                                                                                     |
| Format, whitespace dan review worker                                                 | Prettier enam berkas serta `git diff --check` lulus. Diff terhadap snapshot sebelum task hanya empat source di tabel, satu spec baru dan dokumen ini; review mandiri memeriksa scope, urutan breakpoint, reuse grid, link/fokus dan pembatasan width. Review mandiri bukan review independen QA. |
| BUILD_ID final                                                                       | `mb6ybS2E4cGWPE7718LeW`; `build-id.txt` cocok dengan `.next/BUILD_ID` setelah check dan E2E. Ini kandidat lokal, belum BUILD_ID produksi baru.                                                                                                                                                   |

Peringatan NO_COLOR/FORCE_COLOR pada Playwright berasal dari harness dan muncul di baseline serta GREEN; tidak dianggap kegagalan aplikasi. Test server port 3107 sudah berhenti sesudah run scoped.

Log dan backup source sebelum edit berada di `/tmp/menujuakad-responsive-20261008/fullstack/`; diff terhadap snapshot awal pada `increment.diff`. Playwright mengelola server `npm run start` port 3107 dengan database dinonaktifkan melalui environment test dan menghentikannya sesudah run; worker tidak membuat server latar sendiri. Fixture tetap sintetis/noindex. Build/check tidak memakai data backend untuk pengujian ini.

**Batas handoff:** source dan regresi scoped tersedia; status akhir lokal dilaporkan pada tabel validasi. Full E2E menjadi tugas QA sesudah worker selesai, bukan klaim run scoped ini. Inspeksi gambar/pembandingan Stitch dilakukan QA/ROOT; viewer tidak dipanggil pada resume ini, sehingga tidak ada klaim visual baru. Native zoom 200%, fidelity semua layar/state, auth/Mayar/backend dan publikasi perubahan ini belum diverifikasi. Tidak ada perubahan VPS/layanan/database produksi; produksi masih increment sebelumnya sampai rilis berikutnya.
