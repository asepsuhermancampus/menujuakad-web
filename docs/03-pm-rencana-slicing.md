# Rencana Implementasi Slicing Stitch Menuju Akad

> **Untuk pelaksana:** gunakan skill superpowers:executing-plans untuk menjalankan tugas bertahap. Worker mengerjakan sendiri bagian yang ditugaskan dan tidak mendelegasikan. Checklist mencatat bukti hasil, bukan sekadar keberadaan halaman. Pelaksanaan slicing dan publikasi telah diizinkan user; tidak ada tahap meminta ulang izin slicing. Worker tidak melakukan commit.

**Tujuan:** menerapkan seluruh layar UI/UX Stitch yang tersedia sebagai frontend modular yang dapat ditinjau dan diuji, lalu menerbitkan lingkup publik yang lolos pemeriksaan ke `https://menujuakad.com` ketika akses VPS tersedia.

**Arsitektur:** satu modular monolith Next.js App Router berbasis domain. Rute publik memakai UI marketing yang bersumber dari desain terinspeksi; preview lintas peran memakai fixture sintetis. `/dashboard` dan `/admin` tetap menolak akses anonim melalui guard server sampai provider sesi nyata tersedia.

**Teknologi:** Next.js 16.3.8, React 19.3.0, TypeScript strict, CSS proyek, Prisma 7.10.0, Vitest 5.0.3, Playwright. Pertahankan lockfile; dependency baru hanya jika kebutuhan interaksi tidak dapat dipenuhi fondasi yang ada.

**Spesifikasi:** [master produk/teknis](../../menujuakad-rancangan/MENUJU_AKAD_AGENT_MASTER_SPEC.txt), [arsitektur](architecture.md), [inventaris UI/UX](01-uiux-inventaris.md), [manifest sumber](../../menujuakad-rancangan/docs/assets/stitch/manifest.json), [token resmi](../../menujuakad-rancangan/docs/design-system.md), [audit DevOps](02-devops-deployment.md). Pernyataan menunggu izin pada catatan historis master telah digantikan izin sesi terbaru yang dicatat dalam AGENTS dan progres bersama.

## Batas global dan keadaan awal

- Bahasa dokumen dan UI: Bahasa Indonesia. Nama kode mengikuti kebab-case dan pola repository yang sudah ada.
- `src/app` hanya routing, metadata, layout, boundary, komposisi; page <120 baris, komponen/hook <200, service <300. Mendekati 400 baris wajib evaluasi pemecahan berdasarkan tanggung jawab.
- UI → action/query → service → repository/provider. Slicing tidak membuat backend lengkap; tidak membuat migrasi/model/domain kosong yang belum diperlukan.
- Modul sesi, DB, rahasia, dan provider di `src/server`, diberi `server-only`. Server Component default; Client Component hanya untuk interaksi. Customer adalah peran pengguna, bukan sinonim Client Component.
- Semua operasi customer kelak wajib membership/ownership server, admin wajib SUPERADMIN terverifikasi. Guard layout tidak menggantikan guard setiap action/query.
- Environment aplikasi, Neon, provider auth, email/storage, dan Mayar belum tersedia/terhubung. Preview tidak membaca DB, tidak membuat order/payment, tidak melakukan OAuth, tidak mengirim email/WhatsApp, tidak memanggil webhook/mutasi asli.
- Uang integer IDR. Harga/kuota/QRIS fixture diberi label contoh; tidak dinyatakan harga resmi atau instrumen pembayaran. Tidak ada tombol yang menetapkan transaksi nyata menjadi PAID.
- Aktif: Editorial Ivory & Gold, Noto Serif display, Manrope UI/body. Floral asli hanya pada undangan/thumbnail/divider yang sesuai; panel kerja bersih. Gold/Taupe tidak dipakai sebagai teks kecil yang gagal kontras.
- Runtime/build tidak mengimpor folder rancangan. Salin hanya aset sah yang dipakai ke `public/`; tidak memakai screenshot seluruh halaman sebagai halaman React atau mengambil foto tanpa bukti hak pakai.
- Rahasia tidak masuk props, API, fixture, screenshot, log, `public/`, `NEXT_PUBLIC_*`, dokumentasi, commit atau push. `.env.example` hanya placeholder aman.
- Branch implementasi `feat/stitch-slicing`; fondasi terakhir memiliki 49 test dan enam E2E lulus. Angka ini baseline historis, bukan hasil slicing final. Worker tidak commit/push atau mengubah layanan existing.

## Bukti sumber dan kelengkapan

Snapshot 7 Oktober 2026: 64 desain, 53 kode unik, 62 screenshot resolusi penuh valid, **0 HTML desain valid**. HTML mengarah ke login Google dan bukan source Menuju Akad. Dari 44 layar inti brief, 42 memiliki metadata; CUS-05/06 belum ditemukan. Desktop CUS-01/02 hanya metadata; CUS-01 mobile/tablet tersedia. Inspeksi visual inventaris mencakup 16 sampel, bukan seluruh layar. Setiap layar baru harus dibuka referensinya sebelum implementasi atau diberi status rekonstruksi.

Satu kode dapat memiliki beberapa perangkat/state. Satu route dapat memuat beberapa kode, misalnya section editor atau cover/opened undangan. Semua 64 record harus mempunyai keputusan cakupan: implementasi, state/perangkat yang tercakup, referensi internal DS, atau gap sumber. Kelengkapan dinilai dari matriks itu, bukan menghitung 64 URL atau mengklaim 64 fitur aktif.

CUS-05/06 dan layar tanpa screenshot dapat dibuat sebagai pelengkap dengan primitive/kontrak domain, berlabel **rekonstruksi tanpa referensi visual terverifikasi** dalam laporan. Pekerjaan lain tetap berjalan; fidelity untuk layar tersebut tidak dinyatakan selesai. Layar master yang belum punya desain, seperti seluruh admin CRUD, tidak dianggap otomatis terslicing.

## Pembagian pemilik dan antarmuka

Tabel ini adalah kontrak pelaksanaan. Pemilik mengunci export sebelum konsumen mengintegrasikannya; jika bentuk kode perlu berbeda, perbarui kontrak dalam dokumen ini sebelum integrasi. Jangan menciptakan implementasi kedua untuk fungsi yang sudah dikerjakan pemilik lain.

| Pemilik       | Output dan tanggung jawab                                                                                                                                     | Konsumen                                         |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| UI/UX         | `docs/01-uiux-inventaris.md`, manifest/screenshot di rancangan; pemetaan code/state/perangkat dan mismatch                                                    | Seluruh pembuat UI dan QA                        |
| DevOps        | `docs/02-devops-deployment.md`, `deploy/Caddyfile`, `deploy/menujuakad@.service`, `deploy/scripts/package-standalone.sh`; inspeksi dan rilis sesuai akses sah | Root/rilis                                       |
| PM            | Dokumen ini; AGENTS dua folder, progres 00, changelog dua folder, `docs/deployment.md`                                                                        | Seluruh pelaksana                                |
| Security      | `src/server/authorization/{session,guards,redirect-policy}.ts`, kebijakan preview; `docs/04-security-akses.md`                                                | Routing fullstack dan QA                         |
| Data engineer | `src/features/design-preview/types.ts`, `data/screens.ts`, `data/fixtures.ts` serta fixture per domain kecil; `docs/05-data-engineer-kontrak.md`              | Fullstack, payment, business, QA                 |
| Fullstack     | Token/primitive, shell, routing, publik/auth, customer/editor, undangan/error, resolver view preview; `docs/06-fullstack-slicing.md`                          | Payment/business memakai fondasi; QA             |
| Payment       | `src/features/billing/components/customer/`, `components/admin/`, hook/schema presentasi; `docs/07-payment-ui.md`                                             | Fullstack mengomposisikan, QA menguji            |
| Business      | `src/features/{guests,rsvp,wishes,gifts,analytics}/components/`, hook/schema domain bila perlu; `docs/08-business-analyst-analytics.md`                       | Fullstack dan QA                                 |
| SEO           | Metadata, robots, sitemap, tinjauan copy legal/komersial; `docs/09-seo-content-publik.md`                                                                     | Fullstack/rilis                                  |
| QA            | Test akses/interaksi/E2E dan review visual; `docs/10-qa-validasi.md`                                                                                          | Root memutuskan kesiapan rilis berdasarkan bukti |

Nama dokumen 04–10 mengikuti tugas pemilik masing-masing; keberadaannya diperiksa saat integrasi, bukan dianggap selesai dari tabel. Root menyimpan ringkasan aplikasi pada dokumen 00; nomor 01–10 satu dokumen per nomor, tanpa file plan tambahan atau duplikasi master rancangan.

Kontrak server yang dikunci untuk worker security:

```ts
// src/server/authorization/session.ts
export type VerifiedSession = Readonly<{
  userId: string;
  role: "CUSTOMER" | "SUPERADMIN";
  expiresAt: number; // epoch milidetik
}>;
export function getVerifiedSession(): Promise<VerifiedSession | null>;
// src/server/authorization/guards.ts
export function requireCustomerSession(returnTo: string): Promise<VerifiedSession>;
export function requireSuperadminSession(returnTo: string): Promise<VerifiedSession>;
// src/server/authorization/redirect-policy.ts
export function buildSafeLoginRedirect(returnTo: string): string;
```

Sesi saat ini selalu tidak terverifikasi; tidak ada akun fixture/cookie/query yang boleh mengubahnya. Guard mengarahkan anonim ke `/login?next=<target-encoded>` dengan returnTo internal yang aman pada root `/dashboard` atau `/admin`; SUPERADMIN tidak diambil dari input browser. ReturnTo eksternal, protocol-relative, backslash, karakter kontrol, dan path login berulang ditolak; fallback `/dashboard`. Sesi customer tidak lolos admin. Modul murni kebijakan redirect diuji tanpa membuat provider auth palsu.

Kontrak fixture yang dituju (data engineer memiliki normalisasi final):

```ts
// src/features/design-preview/types.ts
export type PreviewAudience = "public" | "auth" | "customer" | "admin" | "invitation" | "reference";
export type PreviewScreen = Readonly<{
  id: string;
  code: string;
  title: string;
  audience: PreviewAudience;
  logicalRoute: string;
  state: string;
  sourceStatus: "screenshot" | "metadata-only" | "reconstruction";
}>;
// src/features/design-preview/data/screens.ts
export const previewScreens: readonly PreviewScreen[];
export function getPreviewScreen(code: string): PreviewScreen | undefined;
```

Semua export fixture domain berada di bawah design-preview; `data/fixtures.ts` hanya merangkum export aman dari file domain. Identitas synthetic konsisten, tanggal ISO, integer IDR, enum status terpisah dari label. View unknown tidak menjadi dynamic import/path file; daftar layar dan resolver view adalah whitelist. Tipe props domain mengikuti data engineer; pemilik UI tidak menduplikasi record Prisma/provider. Kontrak view: `DesignPreviewView({ screen }: { screen: PreviewScreen }): ReactNode`, di `src/features/design-preview/components/design-preview-view.tsx`, hanya mengomposisikan komponen domain dari map statis.

UI domain menerima DTO aman dan callback lokal opsional; contoh `GuestsView({ guests })`, `RsvpOverview({ responses })`, `PaymentCheckoutPreview({ order, payment })`, `AdminPaymentsPreview({ payments })`. Export/props final dicatat oleh pemilik pada dokumen domain sebelum wiring; kontrak ini tidak menjanjikan provider atau persistence. Perubahan lokal reset ketika reload; indikator harus berkata simulasi, bukan tersimpan di server.

## Pemetaan route dan file

| Kelompok sumber                   | Rute implementasi/review                                                                                                        | File/fitur utama dan keluaran                                                                                                                                                                                         |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PUB-01                            | `/`                                                                                                                             | Ubah `src/app/(public)/page.tsx`; pecah `features/marketing/components/` menjadi hero, featured templates, how-it-works, FAQ, CTA; header/footer publik bersama                                                       |
| PUB-02/03/04                      | `/templates`, `/templates/[slug]`, `/demo/[templateSlug]`                                                                       | Route `(public)` terkait; `features/templates/components/{template-catalog,template-detail}.tsx`; renderer demo undangan synthetic berlabel                                                                           |
| PUB-05–11                         | `/pricing`, `/how-it-works`, `/faq`, `/contact`, `/about`, `/terms`, `/privacy` mengikuti manifest                              | Route `(public)` terkait; komponen marketing per fungsi, legal copy terpisah; halaman master blog/detail/inspiration belum ada desain tidak diberi klaim fidelity                                                     |
| AUT-01–06                         | `/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email`, login state konflik                              | `(public)` route auth; `features/auth/components/` form spesifik; `components/shared/auth-shell.tsx`; hanya validasi/interaksi visual lokal                                                                           |
| CUS-01–04, ACC-01/02, SUP-01      | Review `/preview-ui/[code]`; `/dashboard` aktual menuju login                                                                   | `components/customer/customer-shell.tsx`; `features/invitations/components/customer/`, `features/auth/components/`, `features/notifications/components/`, `features/support/components/`; layout customer terlindungi |
| CUS-05/06 pelengkap               | Preview/settings undangan hanya rekonstruksi yang dicatat                                                                       | `features/invitations/components/customer/`; tidak dianggap desain Stitch ditemukan                                                                                                                                   |
| EDT-01–14 + varian galeri         | `/preview-ui/edt-01` sampai `edt-14`/state lokal; editor aktual terlindungi                                                     | `features/invitations/components/editor/{editor-shell,section-navigation,phone-preview,save-status}.tsx`, `panels/` dan `hooks/` per fungsi; section query whitelist                                                  |
| GST-01–06 + empty                 | `/preview-ui/gst-01` sampai `gst-06`/state lokal                                                                                | Fitur guests, rsvp, wishes, gifts, analytics; pembayaran hadiah tidak dijalankan                                                                                                                                      |
| CUS-07/08 + expired, ADM-01/02    | `/preview-ui/cus-07`, `cus-08`, `adm-01`, `adm-02`/state lokal; dashboard billing/admin aktual terlindungi                      | Fitur billing, customer/admin shell berbeda; tanpa Mayar/QRIS nyata/retry webhook asli                                                                                                                                |
| INV-01/02 + invalid/mobile/tablet | `/demo/[templateSlug]`, `/preview-ui/inv-01`, `/preview-ui/inv-02`; slug produksi tidak memuat data customer tanpa resolver sah | `features/invitations/components/invitation/` cover, section renderer, event, gallery, RSVP/gift visual; `components/invitation/` shell                                                                               |
| ERR-404/500, DS-01                | Boundary 404/error aktual; preview code ERR/DS                                                                                  | `src/app/{not-found,error,global-error,loading}.tsx`; UI error ringkas; component sheet internal preview noindex, tanpa telemetry/ETA fiktif                                                                          |
| Semua review                      | `/preview-ui`, `/preview-ui/[code]`                                                                                             | `src/app/(public)/preview-ui/{page,layout}.tsx`, `[code]/page.tsx`; badge tetap “Preview UI — data contoh, layanan belum aktif”, registry whitelist, metadata noindex                                                 |

Pemetaan PUB-05–11 harus mengambil logical_route per record manifest; tabel bukan alasan menukar kontak/harga menurut tebakan nomor kode. Detail canonical/rute stabil mengikuti master; route tambahan `/about`, `/terms`, `/privacy` mengikuti desain yang ditemukan. Prefix tambahan `preview-ui`, `about`, `terms`, `privacy`, `how-it-works` dimasukkan reserved slug saat resolver kelak dikerjakan. Jangan aktifkan catch-all slug atau custom domain untuk menampilkan fixture sebagai undangan customer asli.

## Fokus review dan pengujian lintas tugas

1. URL terlindungi dengan ID buatan/cookie role palsu tetap menolak anonim; tests tugas 1 dan 4 membuktikan tidak ada bypass lewat preview.
2. ReturnTo eksternal/encoded/backslash tidak membawa pengguna ke situs lain; test tugas 1 mencakup bentuk tersebut.
3. Nama pasangan panjang, rupiah besar, empty search, dan error kuota tetap terbaca pada 320 px/zoom 200%; test tugas 3–6 memeriksa reflow dan input tetap.
4. Tombol Google/checkout/publish/retry webhook tidak menandakan operasi provider berhasil; test tugas 4–6 membuktikan tidak ada mutasi/panggilan provider.
5. Screenshot valid tetapi HTML login atau sumber tanpa visual tidak menghasilkan klaim fidelity; tugas 0 dan 7 mewajibkan catatan per state/perangkat serta pembandingan visual eksplisit.

## Milestone dan tugas yang dapat diuji

Estimasi adalah effort teknik/review, bukan janji waktu respons layanan eksternal. S=0,5–1 hari kerja, M=1–2, L=2–4; estimasi total serial sekitar 14–25 hari kerja termasuk review, tergantung jumlah koreksi visual. Pembagian kerja dapat mengurangi waktu kalender tetapi tidak menghapus dependency. Akses SSH/provider berada di luar estimasi.

### M0 / Tugas 0 — Bekukan sumber dan izin (PM + UI/UX, S)

**Berkas:** dokumen ini, AGENTS dua folder, progres/changelog; inventaris dan manifest existing tetap milik UI/UX. **Dependency:** baseline repository dan snapshot tersedia. **Interface:** metadata `code/id/state/device/sourceStatus` dikonsumsi data/fullstack.

- [ ] Cocokkan 64 desain/53 kode/62 PNG/0 HTML dan gap CUS-05/06 terhadap manifest; catat referensi sebelum tiap screen dislicing.
- [ ] Simpan matriks record → komponen/route/state/perangkat di dokumen UI/UX/fullstack, termasuk DS sebagai referensi dan rekonstruksi.
- [ ] Pastikan AGENTS/progres berstatus izin slicing/publikasi aktif serta menyebut hambatan akses target tanpa menghentikan pekerjaan lokal.
- [ ] Periksa satu H1, section unik, tautan sumber, urutan nomor; jangan menyalin master/brief/aset seluruhnya.

**DoD M0:** sumber dan gap dapat ditelusuri; izin terbaru terbaca; belum mengklaim kode/provider/produksi selesai.

### M1 / Tugas 1 — Akses deny-by-default dan preview aman (Security, M)

**Berkas:** `src/server/authorization/{session,guards,redirect-policy}.ts`, `redirect-policy.test.ts`, `guards.test.ts`; `docs/04-security-akses.md`. **Dependency:** M0. **Interface:** export guard/session/redirect di atas, dikonsumsi layout protected.

- [ ] Tulis `rejects_external_return_to`, `rejects_protocol_relative_backslash_and_control`, `falls_back_for_login_loop`; assert hasil login redirect selalu origin-relative dan fallback `/dashboard`.
- [ ] Tulis `anonymous_customer_and_admin_are_denied`, `customer_cannot_pass_admin_guard`; jalankan test terfokus dan pastikan fail sebelum implementasi.
- [ ] Implementasikan sesi null server-only; guard tanpa fallback akun dummy, tidak mengambil role dari cookie/query; uji kembali hingga pass.
- [ ] Dokumentasikan preview whitelist/synthetic/no-provider serta guard tiap operasi terlindungi untuk integrasi berikutnya.

**DoD tugas 1:** unit kebijakan akses/redirect pass; tidak ada auth palsu atau klaim Google aktif.

### M1 / Tugas 2 — DTO, registry, dan fixture domain (Data engineer, M)

**Berkas:** `src/features/design-preview/types.ts`, `data/{screens,fixtures}.ts`, `data/{invitations,guests,billing,account}-fixtures.ts` sesuai kebutuhan, `data/fixtures.test.ts`; dokumen 05. **Dependency:** M0; paralel secara domain dengan tugas 1. **Interface:** PreviewScreen/registry dan DTO domain aman.

- [ ] Tulis test `fixtures_have_synthetic_identity_and_integer_idr`, `screen_codes_are_unique_and_views_whitelisted`, `maybe_is_not_pending`; jalankan untuk melihat fail sebelum menambah export.
- [ ] Normalisasi fixture per domain, tanggal ISO dan status stabil, tanpa rekening/NMID/email/telepon milik orang nyata atau QR pembayaran; pisahkan file sebelum besar.
- [ ] Isi registry layar termasuk state/perangkat alternatif serta sourceStatus nyata; kode tidak dikenal menghasilkan undefined.
- [ ] Jalankan `npm test -- src/features/design-preview/data/fixtures.test.ts`; harapkan pass dan dokumentasikan props yang dipakai UI.

**DoD M1:** guard dan kontrak fixture tersedia/teruji; provider tetap belum terhubung.

### M2 / Tugas 3 — Token, shell publik, dan halaman marketing (Fullstack + SEO, L)

**Berkas:** ubah `src/app/layout.tsx` dan `src/app/globals.css`, `src/components/ui/{button,input,card}.tsx`; tambah primitive yang dipakai, `components/shared/{public-header,public-footer}.tsx`, fitur marketing/templates dan route publik tabel; aset terpakai `public/`. **Test:** `tests/e2e/marketing.spec.ts`. **Dependency:** M0, registry tugas 2 untuk contoh katalog. **Interface:** section marketing props presentasi aman; shell reusable tanpa aturan billing.

- [ ] Buka PNG PUB per halaman, catat komposisi/varian yang benar-benar dilihat, map ke section kecil; gunakan token resmi bukan pengukuran CSS rekaan.
- [ ] Implementasikan token/font aktif dan shell; buat beranda lengkap komposisi terinspeksi, lalu katalog/detail/demo dan PUB lainnya dengan route tipis.
- [ ] Tambahkan katalog search/filter lokal, accordion FAQ, link CTA/menu mobile/keyboard yang dapat diuji. Harga berlabel contoh; jangan salin janji lifetime/unlimited, testimoni/statistik/kontak palsu.
- [ ] Uji `public_navigation_reaches_catalog_detail_demo`, `faq_keyboard_toggle`, `long_titles_and_prices_reflow`; viewport 320/390/768/1440, header/footer/link tidak buntu, body tidak overflow.
- [ ] Bandingkan screenshot render dengan referensi PUB desktop/mobile/tablet yang tersedia, catat aset/foto/typography mismatch; jalankan typecheck/lint dan test terfokus.

**DoD M2:** marketing frontend dapat ditinjau; interaksi, responsive dan referensi terbukti; copy contoh tidak disajikan sebagai keputusan bisnis.

### M3 / Tugas 4 — Auth visual, customer/editor/undangan/boundary (Fullstack, L+L)

**Berkas:** route auth, protected layout `src/app/(customer)/dashboard/layout.tsx`, `src/app/(admin)/admin/layout.tsx`, review routes/table di atas, `features/design-preview/components/{preview-banner,preview-index,design-preview-view}.tsx`; fitur invitations/auth/notifications/support serta shell. **Test:** `tests/e2e/access-preview.spec.ts`, `editor-preview.spec.ts`, `invitation-preview.spec.ts`. **Dependency:** M1, M2 shared primitive; payment/business view dapat diwiring setelah tugas 5/6. **Interface:** VerifiedSession guard, PreviewScreen registry, DTO fixture.

- [ ] Tulis E2E `anonymous_dashboard_admin_and_nested_routes_redirect`, `role_cookie_does_not_authenticate`, `preview_unknown_code_returns_404`; pastikan gagal sebelum routing baru.
- [ ] Terapkan guard actual dashboard/admin termasuk nested URL. Preview menjadi review publik noindex dengan badge contoh tetap terlihat; route tidak dikenal 404.
- [ ] Implementasikan enam form auth visual dengan label/error/password toggle; Google/sandi/email hanya menjelaskan layanan belum aktif dan tidak membuat sesi atau respons “email terkirim”. Jangan menampilkan ID/email akun nyata pada konflik publik.
- [ ] Implementasikan customer/wizard/profile/notifikasi/support synthetic; editor shell dan panel EDT-01–14 terpisah. Interaksi lokal: pilih section, ubah field, toggle, tambah/hapus/reorder contoh, state galeri kuota/error, checklist simulasi. “Tersimpan” harus jelas lokal/simulasi; tidak menandakan draft/publish server.
- [ ] Implementasikan cover/opened/token-invalid INV; invalid tidak menampilkan nama tamu. RSVP/gift hanya simulasi; demo lokal bukan slug customer live. Error/404 tanpa telemetry/ETA/sertifikasi rekaan.
- [ ] Uji `preview_has_visible_synthetic_label`, `editor_changes_only_local_preview`, `auth_submit_does_not_login`, `invalid_invitation_hides_guest`, `keyboard_dialog_returns_focus`; input tetap setelah error. Assert tidak ada request OAuth/Mayar/API mutasi saat klik.
- [ ] Uji reflow, menu editor mobile, reduced-motion dan sticky action; bandingkan state/perangkat terinspeksi. Rekonstruksi CUS desktop dan CUS-05/06 dicatat sebagai gap fidelity.

**DoD tugas 4:** layar dapat ditinjau tanpa membuka resource asli; actual private routes tetap denied; editor/auth/undangan tidak diklaim layanan aktif.

### M3 / Tugas 5 — Billing dan admin pembayaran presentasional (Payment, L)

**Berkas:** `src/features/billing/components/customer/{package-picker,payment-checkout-preview,qris-example,payment-status}.tsx`, `components/admin/{admin-payments-preview,webhook-reconciliation-preview}.tsx`, hook filter/status lokal jika dibutuhkan; dokumen 07. **Test:** `tests/e2e/payment-preview.spec.ts`; fungsi murni formatting/status domain diuji hanya bila berperilaku penting. **Dependency:** fixture tugas 2 + primitive/shell tugas 3/4. **Interface:** order/payment DTO integer IDR; callbacks lokal.

- [ ] Buka CUS-07/08 default/expired dan ADM-01/02; pecah ringkasan order, deadline, status, channel, tabel reconciliation tanpa duplikasi shell.
- [ ] Implementasikan pemilihan paket/filter status/lihat detail dan state expired; QR sebagai placeholder tidak dapat dibayar, label “Contoh desain — tidak untuk pembayaran”. Data Mayar sebagai konteks rencana, bukan gateway normal palsu.
- [ ] Tulis `checkout_cannot_create_payment_or_mark_paid`, `expired_preview_stays_expired_on_refresh`, `admin_retry_is_simulation_only`; assert tidak ada request provider/webhook/repository atau download invoice asli saat interaksi.
- [ ] Jalankan test dan inspeksi visual desktop/mobile; hapus klaim provider lain/ISO/PPN/nominal komersial tanpa sumber resmi.

**DoD tugas 5:** billing/admin UI presentasional teruji; order/payment/entitlement nyata belum aktif.

### M3 / Tugas 6 — Tamu, RSVP, ucapan, hadiah, analitik (Business, L)

**Berkas:** `features/guests/components/{guests-view,guest-import-preview}.tsx`, `hooks/use-guest-filters.ts`, `rsvp/components/rsvp-overview.tsx`, `wishes/components/wishes-view.tsx`, `gifts/components/gifts-view.tsx`, `analytics/components/analytics-overview.tsx`; dokumen 08. **Test:** `tests/e2e/business-preview.spec.ts`. **Dependency:** tugas 2/3; wiring oleh fullstack. **Interface:** fixture normalisasi, callback lokal, enum RSVP termasuk MAYBE/PENDING.

- [ ] Buka GST default/empty; implementasikan tabel desktop/list mobile, filter, empty search, input impor contoh/mapping validasi lokal, drawer detail, moderation/gift toggle lokal.
- [ ] Tulis `guest_filters_and_empty_results`, `import_invalid_row_preserves_input`, `maybe_and_pending_counts_are_separate`, `preview_rsvp_and_wishes_do_not_persist`; uji behavior, bukan snapshot JSX.
- [ ] Statistik dihitung dari fixture konsisten (68/120 dibulatkan 57%), bukan angka status yang berlawanan. CTA analitik membuka daftar terkait contoh; salin tautan hanya demo sah, tidak mengaku WhatsApp terkirim.
- [ ] Uji nominal/nama panjang/empty mobile, keyboard dan tidak ada request mutasi/automation/storage/payment; bandingkan screenshot sumber dan tulis batas integrasi.

**DoD M3:** seluruh kode/varian manifest dipetakan ke view atau gap transparan; interaksi synthetic teruji; proteksi actual private tetap berlaku.

### M4 / Tugas 7 — SEO, review mutu dan build final (SEO + QA, M+L)

**Berkas:** `src/config/site.ts`, `src/app/{robots,sitemap}.ts`, metadata route publik/preview/auth, copy legal di marketing; tests E2E di atas serta `tests/e2e/seo.spec.ts`; dokumen 09/10, routing/deployment/progres hasil aktual. **Dependency:** M2/M3 final. **Interface:** canonical `https://menujuakad.com`; preview/private/auth noindex, sitemap hanya URL publik nyata.

- [ ] Uji `preview_auth_and_private_are_noindex`, `sitemap_excludes_preview_and_fake_personal_urls`, canonical tidak localhost/guest-name/token; metadata dan copy tidak mengklaim checkout/SLA/Google aktif.
- [ ] Review file size/dependency/client-server boundary, rahasia/aset/fixture dan diff final; tidak memakai output audit secret lama sebagai bukti diff baru bersih.
- [ ] Jalankan berurutan `npm run db:validate`, `npm run typecheck`, `npm run lint`, `npm test`, `NEXT_PUBLIC_APP_URL=https://menujuakad.com npm run build`, lalu `npm run test:e2e`. Playwright memakai managed webServer existing, tidak proses background manual; Chromium hanya dipasang jika belum tersedia.
- [ ] Jalankan visual manual per kode/state dan viewport 320,390,480,768,1024,1280,1440,1600; no overflow, menu/link/dialog/focus/form, zoom 200%, reduced-motion, error/loading/empty benar. Simpan screenshot bukti dan daftar gap; responsive tambahan yang tidak punya sumber dinilai usability, bukan fidelity terbukti.
- [ ] Catat jumlah test baru/final, perintah/hasil/failures, layar belum cocok, hash/diff BUILD_ID. Gagal akses/panggilan provider/secret adalah blocker; gap source dicatat tanpa klaim selesai.

**DoD M4:** pemeriksaan final source yang benar lulus, seluruh coverage/mismatch dapat ditelusuri; build final berbeda dari artifact fondasi. Bukan full-product production-ready menurut seluruh kriteria master.

### M5 / Tugas 8 — Rilis domain, TLS, health, dan rollback (DevOps + Root, M setelah akses)

**Berkas:** `deploy/` existing dan `docs/deployment.md`, audit 02 serta hasil rilis. **Dependency:** M4 dan akses VPS target terverifikasi. **Interface:** artifact standalone final + checksum, app localhost, existing proxy; tidak memerlukan migrasi untuk preview statis.

- [ ] Pertahankan DNS A apex `172.104.187.4` dan www yang sudah benar. Audit menunjukkan HTTP404, HTTPS443/SSH22 timeout; IP keluar workspace `43.173.15.136` berbeda. Tidak menganggap mesin lokal target, tidak mengubah A/MX/mail/FTP untuk mengatasi SSH.
- [ ] Lanjutkan permintaan akses SSH yang sudah diajukan user: host/username/port/jalur/fingerprint/agent atau console aman. Jangan meminta ulang izin slicing/deploy; jangan menyimpan key/password dalam chat/dokumen/repo.
- [ ] Setelah akses: inspect layanan/ports/proxy/firewall/resource/domain/email/FTP target, backup konfigurasi dan identifikasi rollback nyata; reuse Caddy/Nginx existing, jangan pasang dua proxy. Pilih systemd standalone atau container sesuai hasil inspect, satu pola operasional.
- [ ] Kemas build final menggunakan `bash deploy/scripts/package-standalone.sh /tmp/menujuakad-RELEASE_ID.tar.gz`; catat SHA-256/BUILD_ID/versi Node. Upload release baru, probe kandidat localhost, validasi proxy, switch atomik dan reload hanya setelah kandidat sehat sesuai prosedur 02.
- [ ] Verifikasi HTTP → HTTPS, apex HTTPS200, www308 dengan path/query utuh, TLS SAN/issuer/expiry, aset, header, `/api/health/live`200 dan alur publik. Tanpa DB, `/api/health`503 `not_configured` adalah keterbatasan deklaratif; DB readiness200 wajib ketika fitur DB diaktifkan.
- [ ] Jika smoke gagal, pulihkan vhost/release sebelumnya atau backup pra-deploy pada rilis pertama; uji layanan lain tetap berjalan. Catat monitoring, checksum/konfigurasi backup, dan bukti verifikasi publik.

**DoD M5:** URL/domain/TLS/liveness rilis publik benar-benar terverifikasi dari luar; versi/artifact/rollback dapat ditelusuri. Auth/Neon/Mayar belum otomatis terhubung karena situs online.

## Register risiko dan batas integrasi

| Risiko                                                                | Probabilitas / dampak      | Mitigasi dan pemilik                                                                                                              |
| --------------------------------------------------------------------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| HTML Google login dianggap desain; screenshot/perangkat tidak lengkap | Tinggi / tinggi            | UI/UX+fullstack memakai sumber valid, buka referensi tiap layar, catat CUS-05/06 dan desktop CUS sebagai rekonstruksi             |
| Preview membuka dashboard/admin atau menjalankan mutasi asli          | Sedang / kritis            | Security guard deny-by-default, registry fixture whitelist, QA akses anonim/cookie/URL nested dan network assertions              |
| Harga/QR/statistik/layanan fixture disangka komersial nyata           | Tinggi / tinggi            | Payment+SEO label contoh, QR nonpayment, hapus SLA/sertifikasi/testimoni tanpa bukti                                              |
| Kontrak/berkas tumpang tindih lintas pemilik                          | Sedang / sedang            | PM map pemilik, export dikunci sebelum wiring, consumer mengimpor modul pemilik tanpa implementasi ulang                          |
| File/komponen universal membesar; tampilan desktop gagal mobile       | Sedang / tinggi            | Fullstack pecah domain/section/hooks, QA batas ukuran, reflow/long-input/keyboard/manual visual                                   |
| Akses SSH target belum ada, 443 timeout                               | Tinggi / blocker publikasi | DevOps terus persiapkan artifact lokal, dapatkan akses sah/inspect target; jangan deploy mesin salah                              |
| DNS apex juga menjadi tujuan mail/FTP                                 | Sedang / tinggi            | DevOps mempertahankan DNS existing, audit dependency sebelum perubahan target; backup/rollback proxy                              |
| Aset/foto/font eksternal tidak tersedia atau hak pakai tidak jelas    | Sedang / sedang            | Pakai SVG asli/aset sah, fallback terdokumentasi, cek font/build di environment final; jangan crop screenshot dianggap foto final |
| Tanpa Neon/auth dianggap seluruh produk siap produksi                 | Tinggi / tinggi            | PM/QA pisahkan status UI/kode/lokal/provider/prod, actual private denied, roadmap integrasi terpisah                              |

Backend berikutnya tetap memerlukan sesi nyata/OAuth/email, membership/ownership/IDOR, draft snapshot/autosave server, storage upload, guest token, persist RSVP/wishes, billing/order/entitlement, Mayar authenticity/idempotency/invoice/renewal, moderation/audit, resolver domain dan backup database. Semua itu bukan hasil yang dijanjikan increment slicing. Schema/migrasi produksi tidak diubah untuk membuat preview berfungsi.

## Pencatatan status dan handoff berikutnya

| Dimensi                | Kriteria bukti                               | Status pada penyusunan rencana                                                        |
| ---------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------- |
| Rancangan              | Metadata/PNG/token dan inspeksi per layar    | Snapshot tersedia; celah sumber/inspeksi tercatat                                     |
| Kode tersedia          | File komponen/route kontrak sudah nyata      | Fondasi existing; implementasi worker sedang berjalan, belum diverifikasi dokumen ini |
| Teruji lokal           | Pemeriksaan final + E2E + visual per cakupan | Baseline fondasi 49 test/6 E2E; hasil slicing final belum ada                         |
| Terhubung layanan      | DB/auth/provider/persistence terbukti        | Belum; environment/provider belum tersedia                                            |
| Terverifikasi produksi | Target/rilis/domain/TLS/health/smoke nyata   | Belum; SSH belum tersedia, HTTPS timeout pada audit                                   |

Urutan eksekusi: sumber → guard/fixture → token/marketing → view customer/editor/invitation + billing/business → wiring semua layar → SEO/QA final → rilis setelah akses. Akses VPS tidak menghalangi UI/QA lokal. PM memperbarui progres bersama dan changelog; pemilik domain menulis hasil/batas pada dokumen masing-masing, root menyelaraskan hasil aktual dan menyelesaikan rilis tanpa meminta ulang izin yang telah diberikan.

Validasi dokumen ini memeriksa path sumber, konsistensi nomor/nama, satu judul utama, section unik, tautan lokal yang sudah ada, dan whitespace/format. Dokumen sendiri tidak menjalankan build/test aplikasi, memasang dependency, mengubah kode produk, commit atau deploy.

## Review independen authorization dan kontrak data — 7 Oktober 2026

**Hasil terkini: I-01 ADDRESSED; I-02 ADDRESSED setelah re-review perbaikan round 1 pada commit `7735c2a`. Tidak ditemukan Important/Critical baru akibat perbaikan ini.** Authorization clean pada review awal tetap menjadi hasil snapshot `5b912d9`, tidak diuji ulang pada re-review data. Reviewer tidak mengubah source worker atau mengimplementasikan perbaikan.

Cakupan: source/test `src/server/authorization/`, DTO/registry/fixture `src/features/design-preview/`, master bagian lifecycle/RSVP, schema existing, rencana 03, [laporan security 04](04-security-akses.md) dan [laporan data final 05](05-data-engineer-kontrak.md). Snapshot authorization commit `5b912d9`; data final commit `d5f78a1`. Tidak meninjau ulang seluruh inventaris atau menjalankan build yang bersaing. Route/E2E/provider/deployment belum dinilai review ini.

### Temuan awal Important dan tindakan konkret

| ID   | Lokasi/bukti                                                                                                                                                                                                                                                                                                                                                                       | Dampak dan perbaikan sebelum downstream                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| I-01 | [guests-fixtures.ts](../src/features/design-preview/data/guests-fixtures.ts:3), pembentukan status baris 27, count baris 46 dan label baris 53 menggunakan `DECLINING`; master RSVP menetapkan `NOT_ATTENDING`, sesuai handoff UI/UX. Laporan 05 meneruskan nilai baru tanpa adapter.                                                                                              | Consumer filter/label dengan enum produk `NOT_ATTENDING` tidak menemukan 20 tamu yang menolak; lookup label menghasilkan undefined. Reproduksi reviewer: `NOT_ATTENDING=0`, `DECLINING=20`, label `NOT_ATTENDING=null`. Ubah nilai DTO/fixture/count/status-label menjadi `NOT_ATTENDING`, pertahankan nama properti ringkasan `declining` bila diperlukan, perbarui laporan 05 dan tambahkan assertion tepat 20 record NOT_ATTENDING serta label “Tidak hadir”. Jangan hanya mengganti teks label.                                                                                                                             |
| I-02 | [invitations-fixtures.ts](../src/features/design-preview/data/invitations-fixtures.ts:3) mengekspor `InvitationStatus = DRAFT \| PUBLISHED \| EXPIRED` dan memakainya pada DTO baris 27. Master/schema [InvitationStatus](../prisma/schema.prisma:20) memakai ACTIVE/PENDING_PAYMENT/EXPIRING_SOON/SUSPENDED/ARCHIVED, sedangkan publikasi mempunyai field `isPublished` terpisah. | Kontrak menggabungkan publikasi dengan lifecycle; UI yang dibangun memakai PUBLISHED kelak tidak mengenali ACTIVE dan tidak dapat membedakan masa aktif dari publikasi. Fixture sekarang DRAFT sehingga cacat ini belum terlihat di empat test. Gunakan nilai lifecycle produk pada kontrak (union aman yang konsisten tanpa import Prisma runtime), lalu status publikasi sebagai field/tipe presentasi terpisah bila diperlukan. Alternatif mapping wajib eksplisit, terdokumentasi dan diuji; jangan menganggap PUBLISHED alias otomatis ACTIVE. Tambahkan kasus ACTIVE tetapi belum published agar perbedaan tetap terjaga. |

Tabel di atas menyimpan bukti **sebelum perbaikan**, pada snapshot `d5f78a1`. Kedua temuan adalah ketidaksesuaian kontrak terhadap sumber produk, bukan kebocoran data/pembayaran riil. Pemilik data telah memperbaiki kontrak; hasil re-review terkini berada di bawah. Reviewer tidak menulis implementasi kedua.

### Hasil review yang sesuai kontrak

- Authorization: tiga modul memakai `server-only`; resolver produksi selalu null tanpa cookie/query/env/fixture login. Guard memeriksa role tepat, userId nonkosong, expiry integer aman dan lebih besar dari waktu sekarang; exception resolver tetap menghentikan akses. SUPERADMIN tidak otomatis menjadi customer.
- Redirect: allowlist root dashboard/admin, segment ASCII bersih, panjang maksimal 2048 dan kesamaan match penuh menolak newline terakhir, URL eksternal/protocol-relative/backslash/control/encoding/query/hash/traversal dan prefix palsu. Guard tidak menerima sesi dari caller. Tidak ditemukan Critical/Important pada modul authorization.
- Registry: Map statis dan 53 kode/64 varian; tidak ada dynamic import/filesystem/provider dari input. Metadata per record cocok dengan manifest setelah normalisasi DS-01 null menjadi “referensi internal”; CUS metadata-only/gap tetap jujur. Registry dibekukan, source URL/path lokal/HTML tidak diekspor.
- Fixture: identitas demo, email `.invalid`, referensi silang, tanggal ISO dan integer IDR konsisten pada kasus yang diperiksa. MAYBE/PENDING terpisah, 68/120 dibulatkan 57%; PAID hanya contoh, paymentInstrument/rekening/QR null. Tidak ada import server/auth/DB, fetch atau mutasi dalam scope source fixture. Konsumen tetap harus membuat state lokal sendiri, memasang badge/noindex, dan tidak mengubah fixture modul.

### Bukti validasi review awal dan batas kesimpulan

| Pemeriksaan baru                                                                                                            | Hasil                                                                                                                                                                                              |
| --------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm test -- src/server/authorization src/features/design-preview/data/fixtures.test.ts`                                    | 4 file, **129 test lulus** (125 authorization + 4 fixture), exit 0                                                                                                                                 |
| `./node_modules/.bin/eslint src/server/authorization src/features/design-preview/types.ts src/features/design-preview/data` | Exit 0; lint hanya cakupan review                                                                                                                                                                  |
| Pembandingan `tsx` atas seluruh record registry terhadap manifest                                                           | 64 record sesuai ID/code/title/route/state/device/status/dimensi/flag inspeksi setelah satu normalisasi DS-01 yang terdokumentasi; input code newline/control/path/encoding tidak menemukan screen |
| Reproduksi kontrak RSVP dengan nilai master                                                                                 | 0 record NOT_ATTENDING versus 20 DECLINING dan label NOT_ATTENDING undefined; membuktikan I-01 meskipun suite fixture lulus                                                                        |

Laporan 05 sudah tersedia dan dibaca; review tidak berhenti pada snapshot data sementara. Hasil pass menunjukkan perilaku yang diuji, bukan menghapus temuan kontrak yang test-nya belum mencakup nilai master. Tidak menjalankan typecheck/build/suite global/E2E pada tugas review ini; hasil worker sebelumnya tidak disebut sebagai pengujian reviewer. Integrasi private route, HTML/RSC denial, network no-provider, label preview, ownership backend, auth provider, artifact secret scan dan produksi tetap gate root/QA setelah source final terintegrasi.

### Re-review round 1 — I-01 dan I-02

Cakupan hanya diff `d5f78a1..7735c2a` pada guests/invitations fixture, test regresi dan laporan 05; tidak membuka kembali scope registry/authorization/UI/infrastruktur. Source aktual serta laporan 05 setelah perbaikan dibaca.

| Temuan | Verdict       | Bukti perbaikan dan verifikasi reviewer                                                                                                                                                                                                                                                                                                                                  |
| ------ | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| I-01   | **ADDRESSED** | `RsvpStatus`, pembentukan 20 tamu, count dan label kini memakai `NOT_ATTENDING`; field ringkasan `declining` tetap 20. Test `uses_product_rsvp_status_for_twenty_absent_guests` memeriksa tepat 20 record serta label “Tidak hadir”. Laporan 05 memakai enum produk yang sama.                                                                                           |
| I-02   | **ADDRESSED** | Union lifecycle lokal persis tujuh nilai schema: DRAFT, PENDING_PAYMENT, ACTIVE, EXPIRING_SOON, EXPIRED, SUSPENDED, ARCHIVED. PUBLISHED tidak lagi menjadi lifecycle; `isPublished` field boolean terpisah. Test `active_invitation_can_be_unpublished` memeriksa ACTIVE/isPublished=false dan fixture utama DRAFT/isPublished=false. Laporan 05 mencatat pemisahan ini. |

Pengujian baru reviewer: `npm test -- src/features/design-preview/data/fixtures.test.ts` **1 file/6 test lulus, exit 0**, pada 7 Oktober 2026 pukul 17.45 UTC+8. Pemeriksaan source terhadap schema mengonfirmasi ketujuh nilai lifecycle identik, termasuk **EXPIRED**. Pemeriksaan runtime `tsx` mengonfirmasi dua invitation mempunyai ID/slug unik, fixture utama tetap record pertama DRAFT, record kedua ACTIVE dan keduanya belum published. Penambahan fixture kedua tidak mengubah objek fixture utama atau membuat sesi/provider/publikasi riil.

**Temuan baru Important/Critical pada fix: tidak ada.** Ini menutup dua temuan kontrak dalam scope round 1; consumer fullstack/business tetap perlu memakai enum dan field publikasi terbaru saat integrasi. Tidak menjalankan global build/typecheck/E2E atau menilai consumer yang masih dikerjakan. Hasil ini tidak menyatakan auth/ownership/persistence/provider/produksi aktif.
