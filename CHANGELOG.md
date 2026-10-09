# Changelog Implementasi Menuju Akad

## Login bersih tanpa banyak teks — 2026-10-09

- **Instruksi user:** halaman login dibuat lebih clean, lebih nyaman, dan mudah dipahami tanpa banyak teks.
- **Halaman `/login` nyata dirampingkan:** `login-form.tsx` ditulis ulang menjadi satu kartu fokus (`auth-card-compact`, maks 400 px) — judul "Masuk", satu baris subteks, dua kolom (email + kata sandi), opsi "Tampilkan kata sandi", satu tombol. Blok panjang (notice, tombol Google nonaktif, divider ganda) dihapus; status akun uji diringkas jadi satu baris kaki kartu.
- **Kontrak keamanan dipertahankan:** form tetap `POST /api/auth/login` dengan `autoComplete="username"`/`"current-password"`, tombol submit `disabled` sampai JavaScript siap (fallback aman tanpa JS), pesan galat generik dari `useLogin` tanpa membocorkan status akun. Unit test `login-form.test.ts` mengunci kontrak ini.
- **Shell auth disederhanakan:** `auth-shell.tsx` kini hanya merek di atas + catatan hukum ringkas di bawah (tautan "Kembali ke beranda" ganda dan tautan "Pratinjau UI" dihapus dari footer). Halaman auth lain (register/reset/verify) tetap simulasi dengan copy yang lebih jelas bahwa form tidak mengirim data.
- **Preview diselaraskan:** AUT-01 di `/preview-ui/aut-01` kini berjudul "Simulasi Masuk Akun" dengan label "Tampilan contoh", konsisten dengan halaman nyata; copy pratinjau auth diperjelas agar tidak disalahartikan sebagai pendaftaran/verifikasi nyata.
- **Validasi:** `npm run db:validate`, `npm run typecheck`, `npm run lint`, **445 unit/50 file** (naik dari 435/48), `npm run build` (BUILD_ID `SxcUv--UX6lOSOExh63O2`, build ulang gate rilis 9 Oktober: `DYX2i0_2CR-6SHWz6IlyK`) lulus. **E2E 106/106 lulus dalam satu run** (termasuk test form login nyata tanpa JavaScript yang baru). Verifikasi browser: desktop + 390 px tanpa overflow, submit kredensial salah menampilkan pesan generik dan tombol pulih, redirect guard `/dashboard` → `/login?next=…` tetap bekerja.
- Gate rilis 9 Oktober 2026: seluruh check diulang pada source yang sama sebelum commit (`npm run check` exit 0, 445 unit, build `DYX2i0_2CR-6SHWz6IlyK`, E2E 106/106).
- **Commit & deploy 9 Oktober 2026:** commit `18cd096` (276 file, termasuk auth preproduction, routing resmi, Preview Studio, login bersih) di-push ke branch `feat/stitch-slicing`. Build rilis ulang dengan `NEXT_PUBLIC_APP_URL=https://menujuakad.com` → BUILD_ID `_ZmqTJPa-Hip-SCzksj0f`, artifact SHA256 `cae0726314bb03821ba5f9d7c06016896ede5a13109b09f73e06ad557600e90c`, image `menujuakad-web:preview-20261009-login`. Switch produksi PASS pada 11.10.33 UTC+8 (percobaan pertama di-rollback otomatis karena bug skrip probe, bukan aplikasi; percobaan kedua bersih). Smoke HTTPS produksi PASS: 11 flow, 4 guard, 2 keyboard, 12 responsif, 15 screenshot; sebelas probe HTTP lulus; POST login menjawab 503 fail-safe (`AUTH_SECRET` runtime belum di-set, sesuai kontrak). Detail pada [dokumen02](docs/02-devops-deployment.md) dan `docs/deployment.md`.

## Pemasangan routing resmi — 2026-10-08

- **Masalah:** seluruh komponen hanya hidup di `/preview-ui`, sehingga routing aplikasi sulit diperiksa karena halaman resmi masih `PendingFeature` (hanya tautan ke pratinjau). **Solusi:** komponen dipasang pada route resmi di URL sebenarnya.
- **Route publik baru:** `/blog` dan `/blog/[slug]` dengan whitelist artikel `blog-articles.ts` (3 artikel contoh). `generateStaticParams` + `dynamicParams = false` sehingga hanya slug terdaftar yang dirender dan slug asing benar-benar **404** (bukan 200 dengan konten 404). Tautan "Blog" ditambahkan ke navigasi utama, `seo.ts`, dan `sitemap.ts` (kini 13 URL).
- **Komponen workspace dipasang di route resmi:** `/dashboard/guests`, `/dashboard/rsvp`, `/dashboard/wishes`, `/dashboard/gifts`, `/dashboard/notifications`, `/dashboard/support` kini merender UI penuh (bukan halaman handoff). Tab undangan `guests`/`rsvp`/`wishes`/`gifts` juga memakai komponen nyata. `/admin/payments` dan `/admin/webhooks` memakai `BillingPreviewView`.
- **Batas yang dipertahankan:** komponen baru dibungkus `PreviewOnlyFeature` yang menampilkan label "Data contoh · belum tersimpan", menjelaskan fixture sintetis, dan menautkan kode sumber desain. Tidak ada penyimpanan/DB/provider baru; `PendingFeature` tetap untuk fitur tanpa UI (analitik undangan).
- **Guard terverifikasi:** 11 route workspace menolak akses tanpa sesi dan mengarah ke `/login?next=…`; cookie/parameter identitas palsu juga ditolak (diuji E2E).
- **Validasi:** `npm run typecheck`, `npm run lint`, **435 unit/48 file**, `npm run build` lulus (3 artikel blog ter-prerender statis). **E2E 106/106 lulus** dalam satu run — 94 sebelumnya + **12 test baru** `routing.spec.ts` (akses publik, 404 slug asing, tautan nav, penolakan 11 route terlindungi, cookie palsu, sitemap).
- Belum commit/push/deploy.

## Preview Studio: penggabungan 63 pratinjau — 2026-10-08

- **Masalah:** 63 halaman pratinjau + galeri 63 kartu besar terlalu banyak dan sulit dinavigasi. **Solusi:** galeri digabung menjadi **Preview Studio** — satu halaman berkelompok, dengan daftar ringkas dan navigasi antar-layar.
- **Galeri baru:** 63 kartu besar diganti **daftar baris** dalam 11 kelompok domain (Halaman Publik, Autentikasi, Dashboard Customer, Editor Undangan, Manajemen Tamu, Undangan Tampil, Akun, Dukungan, Superadmin, Error, Referensi Desain). Setiap kelompok menampilkan jumlah layar/varian dan dapat diringkas. Pencarian (kode/nama) dan filter area tetap tersedia. Tautan varian ringkas (D/M/T) tetap membuka varian perangkat.
- **Navigasi antar-layar:** banner pratinjau kini menampilkan **prev/next dalam domain yang sama** dengan posisi (`EDT 15/20`), sehingga pengguna dapat berjalan antar layar tanpa kembali ke studio.
- **Kompatibilitas:** seluruh route `/preview-ui/{code}` dan `?variant=` tetap sama; 32 tautan lama di kode/test tidak berubah. Nama "Galeri UI" diganti "Preview Studio" di banner, admin shell, dan test.
- **Aksesibilitas:** navigasi memakai tautan native (bukan ARIA tablist), tombol ringkas memakai `aria-expanded`, dan seluruh kontrol tetap dapat dijangkau keyboard. Reflow 320/390px tanpa overflow (terukur 0px).
- **Validasi:** `npm run typecheck`, `npm run lint`, **435 unit/48 file**, `npm run build` lulus. **E2E 94/94 lulus** dalam satu run — 84 test lama + **10 test baru** `preview-studio.spec.ts` yang mengunci pengelompokan (11 domain/63 baris), pencarian, filter, ringkas/buka kelompok, navigasi prev/next, dan reflow 320/390px.
- Belum commit/push/deploy.

## Slicing 8 screen baru Stitch (EDT-15..20, PUB-12/13) — 2026-10-08

- User memperbarui Stitch dengan **8 screen baru**; slicing dan registry aplikasi disesuaikan. Registry kini **63 kode / 74 varian** (sebelumnya 55/66).
- **EDT-15..20 (editor)**: enam section editor baru — Lokasi & Peta Digital, Ayat Suci & Mukadimah, Susunan Acara & Rundown, Protokol Acara & Info Tambahan, Kontak Narahubung & Concierge, Kolofon & Kredit Desain. `EditorSection`/`EditorPreviewDto`/`EditorDraft` diperluas, panel baru di `editor-extended-panels.tsx` (menerima `fixture` untuk data terstruktur rundown/kontak), nav editor bertambah 6 entri, dan pratinjau ponsel menampilkan konten per section.
- **PUB-12/13 (publik)**: halaman Blog & Panduan dan Detail Artikel dengan komponen `BlogOverview`/`BlogDetail`; semua konten fixture editorial sintetis berlabel contoh, tanpa CMS atau feed eksternal.
- **Manifest rancangan** diperbarui: 75 record / 74 screen / 63 kode unik; 8 record baru ditandai `screenshot_status: download_blocked_google_login` dengan URL sumber tersimpan untuk unduhan ulang.
- **Batasan jujur:** seluruh 8 URL screenshot baru masih mengalihkan ke login Google (diverifikasi ulang via urllib pada 8 Oktober, termasuk percobaan `=s0`, redirect target, dan proxy gambar). Slicing memakai metadata + design system; `visual_inspected: false` untuk kedelapan record. Tidak ada klaim fidelity visual.
- **Validasi:** `npm run typecheck`, `npm run lint`, **435 unit/48 file**, `npm run build` (BUILD_ID `l8LkMv-GxU7tCNGYEUD1U`) lulus. **E2E 84/84 lulus** dalam satu run. Delapan halaman baru HTTP 200, heading sesuai, dan tanpa overflow pada 1440/390px. Label contoh/noindex tetap dipertahankan.
- Belum commit/push/deploy.

## Penutupan gap slicing, perbaikan bug tablet, dan E2E hijau penuh — 2026-10-08

- Menutup gap fidelity yang tersisa dari audit sebelumnya dan memperbaiki dua bug nyata yang ditemukan saat verifikasi.
- **Bug overflow tablet 768–1023px (nyata):** `.workspace-layout` tetap memakai sidebar 210px sehingga konten customer/guest bergeser dan halaman melebar 32px pada 768px. Ditambahkan breakpoint tablet yang mengubah nav menjadi baris horizontal dapat digulir; overflow **0px** terukur pada 701/767/768/1023/1024px untuk GST-03.
- **Test GST-03 diperbarui mengikuti sumber Stitch:** komponen sudah memakai hierarki sumber (Total Respons Masuk 100/120, Total Hadir Pasti 68, Konfirmasi Berhalangan 20, Belum Menjawab 20) plus blok `RsvpSessionCards`/`RsvpNeedsCards`/`RsvpLatestConfirmations`; test lama masih mengharapkan struktur 4-kategori sehingga gagal. Assertion kini memverifikasi hierarki sumber + blok MAYBE terpisah (`Masih ragu: 12 undangan`) tanpa menurunkan cakupan.
- **Test form inert disesuaikan:** `/login` sudah menjadi form auth nyata sejak increment auth preproduction, jadi tidak lagi termasuk daftar form inert. Test tetap memverifikasi seluruh form contoh/simulasi inert tanpa JavaScript dan tidak membocorkan nilai lewat URL/body, ditambah satu test baru untuk form login nyata tanpa JavaScript.
- **DS-01 dilengkapi:** halaman referensi kini memuat 11 warna inti + 5 pasang warna status + 12 baris skala tipografi + skala radius + skala spasi dari snapshot design system resmi. Tanpa overflow pada 1440/390px.
- **Verifikasi state:** seluruh varian berdesain Stitch berfungsi — GST-01 Empty State (0 tamu), CUS-08 Expired, EDT-06 Error & Kuota, INV-01 Token Tidak Valid, EDT-02 Tersimpan. State tanpa desain Stitch tidak dikarang, sesuai aturan proyek.
- **Gap CUS-01/CUS-02 desktop tetap terbuka:** URL screenshot dari Stitch MCP selalu mengembalikan halaman login Google (diverifikasi ulang via curl dan browser pada 8 Oktober). Tidak ada sesi login Google di lingkungan ini; perlu login manual user untuk mengambil visual desktop tersebut.
- **Validasi:** `npm run typecheck`, `npm run lint`, **435 unit/48 file**, dan `npm run build` (BUILD_ID `58Ka1_c6fffjM96P1tX5e`) lulus. **E2E 84/84 lulus dalam satu run (3,5 menit)** — pertama kali tanpa kegagalan; sebelumnya selalu 10 gagal pre-existing. Seluruh 55 halaman preview HTTP 200 tanpa placeholder.
- Belum commit/push/deploy; state loading/offline/paid dan gelombang lanjutan brief 11 tetap terbuka karena belum punya desain Stitch.

## Polish elegan dan motion halus seluruh halaman — 2026-10-08

- Menghaluskan UI agar terasa lebih elegan dan tidak kaku pada semua halaman publik, customer, editor, dan undangan. Perubahan tetap **hanya CSS**; tidak ada `.tsx`/`.ts` yang diubah dan tidak ada logika auth/billing/DB/flow yang tersentuh.
- **Motion system baru** di `tokens.css`: easing `cubic-bezier(0.22,1,0.36,1)`, durasi 150/240/400 ms, serta skala line-height/tracking. Semua animasi otomatis nonaktif di `prefers-reduced-motion`.
- **Header kaca buram** (`position: sticky` + `backdrop-filter: blur(12px) saturate(1.4)`) dengan fallback solid; navigasi diberi garis emas yang tumbuh saat hover.
- **Micro-interaction**: tombol terangkat 1 px saat hover dengan shadow Stitch, kartu terangkat 2 px + border emas, kartu template terangkat 3 px dengan zoom gambar halus, tab/pill berubah warna lembut, input border menggelap saat hover + ring fokus 3 px, FAQ berubah latar saat hover/terbuka.
- **Tipografi refined**: `-webkit-font-smoothing: antialiased`, `text-rendering: optimizeLegibility`, line-height relaks 1.75 untuk paragraf, heading memakai tracking token, eyebrow tetap 12 px/600 tracking 0.08em.
- **Daftar fitur kartu**: tanda centang emas `✓` sebagai penanda; harga di kartu memakai Noto Serif 30 px dengan `tabular-nums`.
- **Rhythm section** memakai `clamp(56px, 8vw, 96px)` dan hero `clamp(72px, 10vw, 128px)` sehingga napas halaman menyesuaikan lebar layar; hero-notes diberi titik emas sebagai pemisah.
- **Animasi masuk** `rise-in` (opacity + 12 px) untuk elemen hero/section-heading/CTA dengan jeda bertahap 80 ms; dimatikan pada `prefers-reduced-motion`.
- Verifikasi: `npm run typecheck`, `npm run lint`, **435 unit/48 file**, dan `npm run build` lulus. E2E **72 lulus/10 gagal** — identik dengan baseline (kegagalan pre-existing GST-03 dan form inert, bukan regresi). Aksesibilitas **4/4 lulus** (desktop+mobile). Delapan viewport 390/768 px tanpa overflow. Computed style: header `sticky` + `blur(12px) saturate(1.4)`, animasi `rise-in 0.4s cubic-bezier(0.22,1,0.36,1)`, input focus border Ink + shadow 3 px, nav underline Gold `rgb(197,164,109)`.
- Belum commit/push/deploy; fidelity seluruh layar dan backlog GST-03 tetap terbuka.

## Refactor token UI/UX ke Editorial Ivory & Gold — 2026-10-08

- Menyelaraskan lapisan token/style 17 file CSS ke design system Stitch `MENUJU-AKAD-UIUX` tanpa menyentuh logika auth, billing, database, atau alur aplikasi. Tidak ada file `.tsx`/`.ts` yang diubah.
- `tokens.css`: menambah token resmi (paper/background/beige/ink-soft/taupe/accent-soft/primary-deep/primary-soft/status/surface-container), skala radius (control 4, button 6, card 10, modal 16, pill 999), shadow rest/hover, spasi, dan layer. `--color-muted` dipertahankan gelap (5,38:1) agar teks kecil tetap lolos AA; `--color-taupe` (3,55:1) khusus teks besar/ikon/border sesuai aturan kontras design system.
- `primitives.css`: tombol primary hover Charcoal, tombol secondary kini Gold `#C5A46D` + teks Black + hover `#B8945D`, varian outline/ghost baru, kartu radius 10 px + shadow Stitch, input border Taupe, badge pill uppercase 12 px tracking 0.08em, tab aktif Ink.
- `base.css`: fokus 2 px offset 3 px, eyebrow 12 px/600 tracking 0.08em warna primary-deep, skala heading mengikuti Stitch.
- Menghapus 40+ warna non-token di 10 file (marketing, workspace, editor-controls, invitation, invitation-media, account, customer-shells, billing, guests, dua CSS module) dan menggantinya dengan `var(--…)`; nilai turunan hanya untuk kebutuhan kontras.
- Verifikasi: `npm run typecheck`, `npm run lint`, **435 unit/48 file**, dan `npm run build` lulus. E2E **72 lulus/10 gagal** — identik dengan baseline sebelum refactor (kegagalan pre-existing pada struktur GST-03 dan form login aktif, dibuktikan dengan menjalankan test yang sama memakai CSS original). Computed style browser terverifikasi: primary `rgb(23,23,23)`/teks `rgb(248,246,241)`, secondary Gold `rgb(197,164,109)`, kartu radius 10 px + shadow `0 4px 20px rgba(23,23,23,0.05)`, fokus 2 px/3 px, input border Taupe `rgb(138,129,118)`. Delapan viewport 390/768 px tanpa overflow. Aksesibilitas specialist 2/2 lulus.
- Tidak ada perubahan fixture, DTO, routing, guard, schema, auth, atau provider. Belum commit/push/deploy; fidelity seluruh layar dan backlog GST-03 tetap terbuka.

## Audit kelengkapan frontend dan produk — 2026-10-08

- Memeriksa spesifikasi/kode, Stitch dan browser publik; memperbarui inventaris/progres tanpa perubahan runtime/rilis.
- CUS-05/06 kini tersedia di Stitch 66 desain/55 kode; kedua PNG valid telah dilihat, tetapi route preview masih404. Registry lokal tetap 53 kode/64 varian; manifest canonical belum disinkronkan.
- Mencatat backlog fidelity GST-03, auth/persistence/Mayar, konten dan operasional. Build masih menyalin `.env` ke standalone; guard packaging menolak, sanitization otomatis belum tersedia.
- `npm run check` lulus 243 unit/18 file/build. E2E awal terhenti 143 setelah 17 hasil lulus; rerun PTY82/82 lulus,2,8 menit. Smoke HTTPS scoped health/databaseok, private menuju login dan GST-03 noindex/reflow lulus. Tidak commit/push/deploy.

## Increment responsif GST-01/GST-03 dan kontrol — 2026-10-08

- Mengoreksi QA-FINAL-01: GST-01 pada 701–767 px kini memakai ringkasan satu kolom dan kartu tamu berlabel. Empat kategori GST-03 tersusun satu kolom mobile, dua kolom tablet 768–1023 px dan empat kolom desktop ≥1024 px. Kelima tab domain serta selector varian GST-01/CUS-08 memenuhi target minimal 48×48 px; tab membungkus pada layar kecil tanpa memperlebar halaman.
- Perubahan modular terbatas pada empat source: `src/features/guests/styles.css`, `src/features/guests/components/rsvp-preview.tsx`, `src/app/styles/customer-shells.css` dan `src/app/styles/workspace.css`, dengan satu spec regresi baru `tests/e2e/responsive-guests.spec.ts`. Grid domain digunakan kembali; fixture, empat status RSVP, link native, guard dan kontrak provider tetap. Handoff dan review tersedia pada `docs/01-uiux-inventaris.md`, `docs/06-fullstack-slicing.md` dan `docs/10-qa-validasi.md`.
- Bukti RED/GREEN fullstack: run awal 20 gagal/8 lulus, run kontrol tambahan 12 gagal; sesudah koreksi seluruh 28 regresi scoped lulus. `npm run check` exit 0 mencakup Prisma/typecheck/lint, **243 unit/18 file** dan build. BUILD_ID final **`mb6ybS2E4cGWPE7718LeW`**, cocok pada kandidat dan produksi. QA memakai build tersebut tanpa rebuild dan menyelesaikan `npm run test:e2e`: **82/82 lulus dalam satu run**, 9 file, desktop/mobile, 3,4 menit.
- Browser QA meliputi **28 capture geometri, 11 flow dan 8 guard**, dengan nol failures/pageerrors/request mutasi/provider/HTTP error pada laporan akhir. Bukti merupakan hasil gabungan run awal dan followup terbatas: harness sempat memilih nilai Default CUS-08 yang sudah aktif, lalu diperbaiki agar memilih opsi lain melalui keyboard nyata. Kegagalan awal diarsipkan, assertion tetap dan source/tests tidak diubah. Delapan belas observasi Tab nyata memverifikasi fokus; cookie role/session palsu tetap diarahkan ke login dan preview tetap berlabel/noindex.
- Native zoom **200%** terverifikasi ulang pada GST-01 default/empty, GST-03 dan CUS-08 melalui Chromium/Xvfb/XTest: empat capture tanpa overflow, innerWidth 1440→720 dan DPR 1→2, CSSzoom tetap 1. Folder `/tmp/menujuakad-responsive-20261008/qa/` menyimpan log/exit, laporan browser, source hash serta total **34 PNG** termasuk dua pergantian varian dan empat native zoom. Sampel visual UI/UX/QA/ROOT mengonfirmasi perubahan scoped; bukan fidelity seluruh layar.
- **Rilis `preview-20261008-responsive` aktif dan PASS produksi pada 8 Oktober 2026, 06:14:48 UTC+8.** BUILD_ID **`mb6ybS2E4cGWPE7718LeW`**; SHA256 artifact **`92b380b9068cafdfee35f91d25cd8d75f78f2814c04e36c0a2e0bf05ac0927b0`**. Identitas cocok pada standalone/artifact/kandidat/container produksi. Rilis ini menggantikan GST-01/CUS-07 sebelumnya; hasil dan prosedur aktual tersedia pada `docs/deployment.md` serta `devops/switch-report.json` dan `release-final-check.json` di `/tmp/menujuakad-responsive-20261008/`.
- Smoke DevOps kandidat dan HTTPS produksi **masing-masing 32 capture, 12 flow dan 4 guard** lulus, disertai 12 pemeriksaan kontrol dan dua flow keyboard pada 320/767 px. Failures/pageerrors/HTTP error/request mutasi/provider seluruhnya kosong, source hash tetap. **QA-FINAL-01 teratasi dalam scope produksi**: GST-01 default/empty 701/767 px, GST-03 grid 1/2/4 kolom, target tab domain/selector ≥48×48 tanpa overflow, guard menuju login dan preview berlabel/noindex. Harga CUS-07 pada 768/769 px dan viewport tambahan tetap muat. Bukti DevOps per lingkungan terpisah dari 28 capture/11 flow/8 guard QA lokal; native zoom 200% empat halaman tetap hasil lokal dan tidak diulang di produksi.
- **Dua Compose utama + overlay Neon dipertahankan**, liveness/readiness lokal dan HTTPS200/databaseok, HTTP apex/www308 serta probe Breadwinner/HariKita lulus tanpa perubahan Caddy/DNS/DB. Pointer rilis ditulis atomik root0600 setelah smoke PASS. Image/artifact GST-01 dan tag awal dipertahankan; backup `/srv/menujuakad/backups/before-preview-20261008-responsive` root0700 tersedia. Rollback otomatis disiapkan tetapi tidak terpicu; hanya kandidat terisolasi dihentikan dan port3101 kosong kembali. Scan source final DevOps sebelum sinkronisasi PM: 289 file, Gitleaks `--redact=100` exit0/nol temuan; bukan audit keamanan menyeluruh.
- Fidelity penuh GST-03 masih terbuka, termasuk blok sesi/logistik pada sumber Stitch; empat kategori preview merupakan adaptasi domain yang eksplisit. Data tetap fixture sintetis, auth/Mayar/persistence backend bisnis belum aktif. Gate frontend dan koneksi Neon tidak menyatakan fitur bisnis selesai; PM hanya memperbarui changelog ini tanpa menjalankan ulang gate, build, layanan, deployment atau operasi Git.

## Audit browser dan increment GST-01/CUS-07 — 2026-10-08

- Audit UI/UX awal mencatat 20 capture GST-01–06/CUS-07–08 desktop/mobile beserta varian empty/expired. Reviewer ROOT berhasil melihat sumber/capture GST-01 dan mengonfirmasi gap empat kartu sumber versus tiga kartu produksi serta tabel polos; batas inspeksi ada di `docs/01-uiux-inventaris.md`.
- Riwayat baseline sebelum koreksi: 239 unit/17 file, build dan 46/46 E2E lokal lulus; 39/40 kombinasi browser produksi tanpa overflow. QA-PROD-01 menemukan overflow harga CUS-07 sebesar 11 px pada768. Zoom native200% lulus untuk sepuluh kode baseline melalui Chromium/Xvfb; tidak dijalankan ulang pada increment baru dan bukan bukti fidelity seluruh layar.
- Mengoreksi GST-01 dengan empat kartu ringkasan berbasis fixture, label grup Indonesia, badge RSVP/pengiriman contoh, kartu mobile berlabel dan pagination48px; menyesuaikan breakpoint paket CUS-07. Gate final pada `docs/10-qa-validasi.md`: schema/typecheck/lint, **243 unit/18 file**, build dan **54/54 E2E dalam satu run (2,7 menit)** lulus; BUILD_ID `gszjNXdxoHXetHRgCAn0g`. Koreksi harness hanya mengeluarkan opsi worker dari preset devices pada describe; assertion keamanan/geometri tetap dipertahankan.
- Rilis **`preview-20261008-gst01` aktif**. ROOT memeriksa image/BUILD_ID baru dan health HTTPS200/databaseok, mempertahankan dua Compose beserta overlay Neon, backup serta tag lama untuk rollback. Gitleaks source/standalone/static bersih dengan allowlist sempit field manifest internal Next.js; bukan audit keamanan menyeluruh.
- Smoke kandidat dan produksi masing-masing lulus **14 capture, enam flow sintetis dan empat navigasi guard**; failures/pageerrors/writes/providers/httpErrors seluruhnya kosong. Bukti `/tmp/menujuakad-gst01-release-smoke/{candidate,production}/browser-report.json` mengonfirmasi empat kartu GST-01, preview noindex, guard menuju login serta seluruh nominal CUS-07 di dalam kartu pada768/769/800/1440px dengan/tanpa sentuhan. QA-PROD-01 teratasi dalam scope produksi tersebut; GET HTTPS terpisah ROOT juga mengonfirmasi empat kartu/noindex.
- **QA-FINAL-01 masih backlog minor:** GST-01 pada701–767px memakai ringkasan dua kolom dan tabel desktop, belum konsisten dengan handoff mobile<768; tanpa overflow terukur. Fidelity seluruh layar, browser/state lain serta gap GST/selector/tab di luar increment tetap terbuka.
- Neon preproduction tetap terhubung dengan runtime baca terbatas. Auth, pembayaran Mayar dan persistence fitur belum aktif; interaksi preview memakai fixture sintetis. Gate dan rilis frontend ini tidak menyatakan backend bisnis selesai.

## Koneksi Neon preproduction — 2026-10-08

- Memverifikasi sembilan tabel impor, diff schema kosong serta empat CHECK, kemudian mencatat baseline Prisma dan memeriksa migrate status/checksum.
- Memperbaiki cast metadata PostgreSQL name→text pada preflight berdasarkan kegagalan live; probe pooled/direct sekarang lulus. Typecheck/lint dan239unit lulus.
- Membuat role runtime baca terbatas, memasang secret root0600 dan overlay Compose; readiness/liveness publik200 dan12smoke browser lulus. Image/frontend dan layanan Breadwinner/HariKita dipertahankan.
- Password owner yang diberikan lewat chat perlu direset pengelola; nilainya tidak dicatat. Runtime memakai password terpisah yang dibuat server. Auth/CRUD/pembayaran serta restore bisnis belum aktif/teruji.

## Menunggu URL koneksi hasil impor Neon — 2026-10-08

- User melaporkan impor SQL selesai. Pemeriksaan server tidak menemukan DATABASE_URL/DIRECT_URL; health publik masih database not_configured.
- Menyiapkan `.env` privat0600 dengan variabel kosong dan memverifikasi Git mengabaikannya. Nilai dimasukkan melalui editor server; tidak meminta secret di chat.
- Alur lanjutan adalah verifikasi schema hasil impor, baseline Prisma dan aktivasi overlay runtime setelah kredensial/branch sah tersedia. Container/frontend existing tetap sehat; belum ada operasi Neon nyata.

## Persiapan backend dan impor Neon — 2026-10-08

- Mempertahankan sembilan model/migrasi fondasi dan adapter Neon Prisma7. Menambahkan ekspor SQL transaksi dengan guard schema kosong dan manifest checksum, validasi pooled/direct/SSL/branch, serta preflight read-only koneksi/schema/riwayat migrasi.
- Menyiapkan overlay Compose Neon yang membaca pooled runtime URL dari file rahasia di luar repo; belum diterapkan ke container publik. DIRECT_URL hanya digunakan tooling migrasi/preflight.
- Memperbarui panduan database dengan project/region/branch/role/Connect, pilihan migrasi Prisma atau SQL Editor+baseline, penyimpanan environment, pemulihan dan urutan backend. Menambahkan nama variabel Google tanpa nilai; provider auth belum dipilih/diimplementasikan.
- Schema/typecheck/lint,239unit/17file dan build lulus. Dua belas pengujian baru mencakup pasangan URL salah/redaksi, impor sembilan tabel/constraint dan penolakan target berisi data. CLI menolak overwrite paket dan environment kosong; config-only bekerja tanpa koneksi. Validasi overlay hanya parser dengan resolusi env_file dimatikan, bukan bukti file runtime tersedia.
- SQL/petunjuk/manifest berada di `/tmp/menujuakad-neon-import`, dengan arsip `/tmp/menujuakad-neon-import.tar.gz`; ekspor tanpa data/secret. Koneksi/migrasi/seed Neon nyata belum dilakukan karena kredensial belum tersedia. Auth/provider/private resource belum diaktifkan; frontend Docker existing tetap sehat.

## Publikasi frontend di VPS Breadwinner — 2026-10-08

- Menerapkan release Docker terpisah `preview-20261008` dari artifact standalone yang sudah diuji, upstream localhost3100, user nonroot, filesystem read-only dan healthcheck.
- Menambahkan vhost Menuju Akad ke Caddy setelah backup/validasi; konfigurasi dan layanan Breadwinner/HariKita dipertahankan. HTTPS apex/www Let’s Encrypt dan redirect308 aktif; DNS authoritative terpantau menuju43.173.15.136 setelah koreksi target oleh user. Agent tidak mengubah panel DNS.
- Finalizer DNS systemd mengaktifkan HTTPS dan berhenti otomatis setelah pemeriksaan HTTPS/liveness publik lulus. Detail release/rollback/monitoring pada deployment02 dan deployment.md.
- Smoke HTTPS rilis lulus28pemeriksaan desktop/mobile termasuk aset, preview noindex, guard login dan interaksi lokal; beranda diperiksa lewat screenshot. Cakupan tetap frontend/preview sintetis; auth/database/payment belum aktif. Readiness503 memang diharapkan tanpa database.

## Resume gate rilis — 2026-10-07

- Mempertahankan implementasi sebelumnya dan menyelesaikan gate gabungan: schema/typecheck/lint, 227 unit test, build produksi serta 46/46 E2E desktop/mobile lulus dalam satu run.
- Audit Gitleaks source, artifact standalone dan static tidak menemukan secret; pengecualian server hanya key preview Next.js yang dihasilkan build. Batas audit dan aksesibilitas dicatat pada QA/keamanan existing.
- Visual masih terhambat viewer; TCP22/443 VPS tujuan timeout. Belum deploy, commit/push atau menghubungkan auth/Neon/Mayar.

## Audit prarilis lanjutan — 2026-10-07

- Menambahkan empat pemeriksaan E2E aksesibilitas billing/GST: fokus/nama kontrol/outline dan reflow720px dengan teks200%, lulus desktop/mobile; browser zoom native dan fidelity gambar belum terverifikasi.
- Memeriksa Gitleaks riwayat/source/standalone. Dua key internal preview-mode Next.js diberi pengecualian tepat field manifest; scan ulang bersih.
- Run E2E44/46 dan rerun mobile terisolasi3/3 lulus; proses lain memakai port/output bersama, tanpa mengubah/menghentikannya. Bukti dan batas dicatat di QA10.
- Runtime tidak berubah; artifact/build227unit sebelumnya tetap. VPS22/443 timeout, deployment belum tersedia.

## Resume integrasi frontend — 2026-10-07

- Mempertahankan billing yang sudah tersedia; memperbaiki label aksesibel filter admin dan selector notifikasi dalam pengujian browser.
- Mengganti enam kode GST/sebuah varian empty dengan UI sintetis modular: filter/pagination/tambah/CSV tamu, validasi impor, RSVP, moderasi ucapan, gift DECLARED dan analitik periode. CSV melindungi formula; impor menolak duplikat dan menjaga input invalid.
- Menambahkan canonical publik per route, origin SEO apex tetap, robots/sitemap whitelist, metadata template dan copy batas preview. Auth/private/preview/draf tetap noindex; guard tidak dibuka.
- Gate lokal: schema/typecheck/lint, 227 unit dan build lulus. Hasil browser final tersedia pada docs/10-qa-validasi.md. Fidelity GST/billing belum diperiksa melalui gambar karena viewer sesi tidak mendukung image input; detail Stitch masih memerlukan review.
- Belum menghubungkan auth/Neon/Mayar atau deploy VPS. Tidak membuat ulang scaffold atau dokumen bernomor.

## Checkpoint UI, review dan gate final — 2026-10-07

- Menyelaraskan status PM/progres/handoff dengan laporan pemilik: 43 kode/52 varian UI fullstack tersedia; 10 kode/12 varian billing/admin/business masih stub pada resolver snapshot, meskipun entry preview 53 kode/64 varian ada.
- Mencatat gate awal 209 unit test/18 E2E dan refinemen terlapor 211 unit test/typecheck/lint, tanpa menjadikannya gate source final. QA-FS-01/03/04 serta SEC-INT-01 masih fix round 1/re-review; specialist, implementasi SEO/copy dan QA wholebranch/fidelity masih terbuka.
- Memperbarui status Noto Serif/Manrope lokal, lisensi/checksum dan token/styles sesuai report06. QA melihat komposisi 62 PNG; viewer fullstack tidak mendukung gambar dan memakai handoff tekstual. Media/section rekonstruksi bukan fidelity penuh.
- Izin slicing/publikasi tetap aktif; auth/Neon/Mayar/provider belum terhubung dan akses SSH target/produksi belum terverifikasi. Checkpoint hanya dokumen: tanpa kode, dependency, master spec/aset, test/build produk baru, Git atau deployment.

## Izin slicing, rencana frontend dan status rilis — 2026-10-07

- Mencatat izin eksplisit user untuk melanjutkan slicing seluruh UI/UX Stitch yang tersedia serta publikasi menujuakad.com; status aktif menunggu izin digantikan, riwayat brainstorming tetap dipertahankan.
- Menambahkan `docs/03-pm-rencana-slicing.md` dengan milestone/task, path/kontrak antar domain, dependency/estimasi, pengujian, DoD dan risiko. Preview lintas peran hanya sintetis; actual dashboard/admin tetap deny-by-default hingga sesi nyata tersedia. Scope frontend tidak menyatakan Neon/auth/Mayar/backend aktif.
- Menyelaraskan AGENTS, progres bersama, deployment dan handoff design system dua folder dengan inventaris 64 desain/62 PNG/0 HTML valid, gap CUS-05/06, serta audit DNS/akses. DNS sudah sesuai; SSH/HTTPS target timeout dan akses target telah diminta. Tidak mengubah DNS/VPS/layanan existing.
- Validasi increment PM hanya dokumen/path/tautan/format/whitespace; tidak menjalankan test/build produk baru, memasang dependency, mengubah kode produk, commit atau deploy. Baseline fondasi bukan hasil slicing final.

## Sumber visual Stitch dipilih — 2026-10-07

- Menetapkan Stitch MENUJU-AKAD-UIUX sebagai acuan visual aktif sesuai keputusan user; Noto Serif menggantikan Cormorant untuk display, Manrope tetap untuk UI/body.
- Menyelaraskan panduan agent, README, handoff desain, dan rujukan arsitektur dengan sumber rancangan yang diperbarui. Snapshot token penuh tetap di folder rancangan, bukan diduplikasi pada aplikasi.
- Sinkronisasi hanya dokumentasi. Pemilihan sumber desain belum menjadi izin slicing; font, CSS, komponen, dependency, dan runtime aplikasi belum diubah.
- Validasi dokumentasi lintas folder: snapshot token cocok dengan metadata MCP, 41 berkas historis/aset tetap identik, 46 tautan lokal valid pada 10 dokumen tanpa duplikasi judul/section, serta format dan whitespace diperiksa. Pengujian runtime tidak dijalankan ulang untuk perubahan dokumentasi ini.

## Brainstorming dan standar pengembangan — 2026-10-07

- Menyimpan arahan user tentang clean code, komponen reusable, pemisahan fungsi/UI/logika/server dan peran customer/superadmin, konfigurasi tertib, dokumentasi, serta perlindungan secret pada AGENTS.md.
- Menambahkan usulan struktur dan pembagian tanggung jawab lintas disiplin pada dokumentasi arsitektur yang sudah ada; memperbarui handoff dengan status MCP Stitch MENUJU-AKAD-UIUX serta perbedaan tipografi yang perlu diperiksa.
- Tahap ini hanya dokumentasi/brainstorming. Slicing dan perubahan kode produk menunggu persetujuan eksplisit user; belum ada konfigurasi enforcement, pengujian aplikasi baru, atau deployment.
- Validasi dokumen: enam berkas masing-masing memiliki satu judul utama dan section tanpa duplikasi; 10 tautan lokal valid, nomor dokumen rancangan 00–12 tetap lengkap, dan whitespace diperiksa. Format dokumen aplikasi diperiksa dengan Prettier.

## Repository aplikasi baru — 2026-10-07

- Mengarahkan remote `origin` ke `https://github.com/asepsuhermancampus/menujuakad-web.git` sesuai instruksi user, mempertahankan riwayat commit dan branch `main` yang melacak `origin/main`.
- Memperbarui README dan panduan agent agar sesi berikutnya memakai repository baru serta mempertahankan rancangan sebagai sumber terpisah.
- Validasi dokumentasi: format Prettier dan pemeriksaan whitespace lulus, 15 tautan lokal valid, master spec dan audit yang dipindahkan identik dengan versi Git sebelumnya, serta progres rancangan tersedia. Kode aplikasi tidak berubah; pengujian aplikasi tidak dijalankan ulang pada increment ini.

## Referensi folder rancangan — 2026-10-07

- Folder rancangan kini `/home/ubuntu/menujuakad-rancangan`; pengembangan aplikasi tetap dari `/home/ubuntu/menujuakad-web`.
- Menyesuaikan README, panduan agent, dokumentasi, dan tautan lintas folder. Kode, master spec, aset, dan konfigurasi Git tetap utuh.
- Validasi perubahan ini memeriksa keutuhan berkas, tautan lokal, urutan dokumen, dan format; tidak ada build atau pengujian aplikasi baru.

## Pemisahan workspace — 2026-10-07

- Memindahkan fondasi Next.js, Prisma, pengujian, konfigurasi, dependency, dan artifact lokal ke `/home/ubuntu/menujuakad-web` tanpa mengubah kode fitur.
- Mempertahankan folder `.git`, riwayat dua commit, branch, remote, dan seluruh perubahan lokal aplikasi. Berkas rancangan yang sebelumnya tracked tetap tersedia di folder rancangan; penghapusannya dari working tree aplikasi merupakan bagian pemisahan, bukan kehilangan data.
- Menyimpan dokumentasi teknis di `docs/` dan memperbarui README serta AGENTS dengan path implementasi dan tautan menuju rancangan.
- Master spec, progres bersama, audit historis, brief, design system lengkap, dan aset sumber tetap di `../menujuakad-rancangan`. Runtime dan build aplikasi tidak mengakses folder rancangan.
- [Riwayat lengkap sebelum pemisahan](../menujuakad-rancangan/CHANGELOG.md) tetap dipertahankan pada sumber aslinya.
- Validasi dari lokasi baru lulus: schema Prisma, typecheck, lint, 49 unit/integration test, build produksi, dan enam pengujian browser desktop/mobile. Checksum 96 berkas sumber/aset identik, HEAD/konfigurasi Git aplikasi tetap, serta urutan dokumen dan 39 tautan lokal valid.
- Belum ada commit, push, perubahan remote GitHub, migrasi database layanan, atau deployment.
