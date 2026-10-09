# Analitik Customer Actual dan Kontrak UI Tamu

## Analitik actual preproduction — 8 Oktober 2026

**Status:** kode tersedia dan 16 pengujian analitik lokal lulus. Agregasi Prisma berjalan pada PostgreSQL PGlite terisolasi; integrasi Neon runtime, pemeriksaan browser, build akhir dan produksi increment ini belum diverifikasi worker. Tidak ada seed, migrasi, penulisan DB live, perubahan auth/billing/layout/fixture, build penuh, E2E atau commit dalam tugas ini. Catatan slicing tanggal 7 Oktober di bawah adalah riwayat preview; batas auth-null/persistence-pending historis tidak menggantikan kontrak actual terbaru pada dokumen03–06.

### Route, export dan batas akses

- Concrete route `/dashboard/analytics` mengungguli catchall existing; `force-dynamic`, Server Component tipis, satu section di dalam main shell fullstack. Guard customer di page dan `verifyWorkspaceRole("CUSTOMER")` pada setiap pemanggilan query memverifikasi sesi DB ulang. Superadmin, anonim dan sesi kedaluwarsa ditolak; userId tidak berasal dari query/browser.
- `src/server/analytics/query.ts`: `getCustomerAnalytics(raw)` adalah entry point terlindungi, mengembalikan `CustomerAnalyticsDto`, bukan row pribadi. Tidak ada API HTTP tambahan atau mutasi; kebutuhan halaman tercakup query server.
- `input.ts`: `analyticsInputSchema`, strict Zod object hanya `{period?: "all" | "7d" | "30d"}`. Default `all`. Field asing, array/repetisi period dan nilai lain ditolak400 melalui boundary data nyata; tidak memakai fixture saat invalid/backend gagal.
- `repository.ts`: `readOwnedAnalytics(userId, window)` internal, mengecek User ACTIVE/CUSTOMER dan melakukan groupBy seluruh record, tanpa limit100/pagination. Undangan memfilter ownerUserId dan owner ACTIVE/CUSTOMER; permintaan memfilter requester userId, requester ACTIVE/CUSTOMER dan invitation.ownerUserId yang sama. Relasi FK saja tidak dianggap bukti ownership. Repository langsung tetap menolak identitas admin/nonaktif/hilang403.
- `service.ts`: `analyticsWindow(period, now?)` untuk batas waktu; `summarizeAnalytics(window, groups)` untuk DTO angka. `types.ts` berisi kontrak window/groups/DTO server. Enum pembayaran diambil dari generated Prisma, tanpa menduplikasi pricing atau aturan transisi billing.
- `src/features/analytics/components/customer-analytics-view.tsx`: `CustomerAnalyticsView({data})`, Server Component presentasi. Filter memakai link GET dengan label Indonesia, aria-current dan target minimal48px. Empty state berasal dari hitungan DB dan memberi jalan membuat draft/mengganti periode. Error DB menggunakan `workspaceView` existing dan pesan503 umum; tidak membocorkan detail koneksi.
- Semua lima modul server memakai `server-only`. DTO hanya periode/batas UTC, hitungan dan nominal agregat; tanpa nama/email, id pemilik/undangan, referensi pembayaran, credential, token/session, reviewer atau rahasia provider. Tidak memakai cache lintas request. Transaksi baca mengelompokkan operasi; tidak mengklaim snapshot repeatable-read atau event historis.

### Definisi metrik yang benar-benar tersedia

| Metrik                                             | Definisi dan penggunaan                                                                                                                 |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Total undangan                                     | Semua Invitation milik pengguna dengan createdAt dalam periode; mengetahui cakupan akun.                                                |
| Draft                                              | Subset status terkini DRAFT; membantu prioritas penyuntingan. Bukan bukti publikasi atau jumlah draft privat.                           |
| Status lain                                        | Total dikurangi DRAFT, termasuk seluruh status enum lainnya; tidak disamakan dengan undangan aktif/berbayar.                            |
| Permintaan pembayaran uji                          | Jumlah PaymentTestRequest milik pengguna dan undangan miliknya berdasarkan createdAt permintaan; tanpa filter waktu pembuatan undangan. |
| Menunggu review                                    | Status terkini REQUESTED, jumlah dan sum amountIdr. Membantu membuka riwayat billing.                                                   |
| Disetujui untuk pengujian                          | Status terkini APPROVED_TEST, jumlah dan sum amountIdr. Bukan PAID, pendapatan, penerimaan dana bank atau entitlement.                  |
| Ditolak                                            | Status terkini REJECTED, jumlah dan sum amountIdr.                                                                                      |
| Total nominal diajukan                             | Sum amountIdr semua tiga status; beberapa permintaan untuk undangan sama dihitung masing-masing. Bukan harga katalog atau omzet.        |
| Tamu/RSVP, tayangan/unik, konversi/tingkat respons | **Belum tersedia**, bukan0: model/instrumentasi belum tersedia untuk query actual ini.                                                  |

`all` berarti sejak awal sampai waktu query. `7d`/`30d` berarti tepat7/30 ×24jam mundur dari waktu query dalam UTC, bukan hari kalender Asia/Jakarta. Batas awal dan akhir inklusif (`gte`/`lte`); record satu milidetik sebelum awal/sesudah akhir dikecualikan. DTO mengirim ISO UTC batas aktual dan UI menjelaskan createdAt; status memakai keadaan terkini record tersebut, bukan perubahan status selama periode atau waktu reviewedAt. Tidak menjumlah pengunjung unik harian, memakai fixturevisitor atau mengirim telemetry. Angka count/sum wajib nonnegatif dan `Number.isSafeInteger`, termasuk hasil penjumlahan antarkelompok; nominal di luar rentang aman gagal503, bukan dibulatkan. Sum IDR dapat melebihi integer32bit satu row selama masih aman dalam JavaScript.

### Cakupan journey dan keterbatasan produk

| Tahap                                   | Status berdasarkan source/handoff yang tersedia                                                                                         |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Login customer/superadmin               | Auth DB dan sesi terverifikasi tersedia pada Security04; bukti live/browser dikonsolidasikan QA/ROOT.                                   |
| Membuat/menyunting draft                | CRUD, editor dan section-save DB nyata tersedia serta teruji lokal pada Fullstack06.                                                    |
| Analitik akun                           | Increment ini membaca agregat undangan/permintaan uji nyata; belum diuji pada Neon/produksi oleh worker.                                |
| QRIS pengujian/review                   | Model TEST tersedia, billing dimiliki worker Payment; persetujuan manual bukan transaksi bank terverifikasi.                            |
| Tamu, RSVP publik, ucapan/hadiah publik | Persistence/domain publik belum tersedia; GST tetap preview sintetis. Konfigurasi RSVP tersimpan tidak berarti respons publik diterima. |
| Support, storage, notifikasi            | Layanan aktual belum tersedia pada workspace.                                                                                           |
| Pembayaran komersial Mayar              | Pending integrasi provider/verifikasi server; tidak ada revenue/LTV/CAC/conversion actual atau target buatan.                           |

Preview `/preview-ui/gst-06`, komponen `analytics-preview.tsx` dan fixture statistik tetap terpisah dan tidak diubah. Route actual bukan slicing grafik pengunjung GST-06: keterbatasan pengukuran ditampilkan eksplisit. Telemetry/funnel/growth yang belum diinstrumentasikan tetap usulan historis, tidak diklaim berjalan.

### Bukti verifikasi increment analitik

- `npx vitest run src/server/analytics`: **16/16 PASS**, dua berkas. Enam kasus repository memakai migrasi fondasi/PaymentTestRequest existing, Prisma asli dan PGlite; mencakup cross-owner, requester/owner mismatch, ACTIVE/CUSTOMER defense, kosong, dua batas waktu inklusif, exclusion1ms/future, semua waktu dan integer aggregate4294967294IDR untuk dua APPROVED_TEST. Sepuluh kasus query/service mencakup anonymous/admin/expired denial, strict input, agregasi/status kosong, PII-safe DTO tanpa PAID/revenue, fractional/negative/unsafe nominal serta outage tanpa fallback.
- `npx tsc --noEmit`: **PASS** pada source workspace saat pemeriksaan; generated client existing dipakai tanpa perubahan schema.
- `npx eslint` pada modul analitik, view dan page: **PASS**; scoped Prettier dan `git diff --check`: **PASS**. Daftar dokumen01–10 berurutan dan tidak ada file laporan duplikat.
- Regresi `npm test -- --maxWorkers=2`: **428 PASS / 2 FAIL dari430**,47berkas. Dua kegagalan adalah timeout15000ms pada `auth-runtime-grants.test.ts` kasus grant minimal dan `auth-seed.test.ts` kasus collision admin/rollback; bukan assertion analitik. `npx vitest run tests/database/auth-runtime-grants.test.ts tests/database/auth-seed.test.ts --maxWorkers=1`: rerun serial **22/22 PASS** (84,64detik), tanpa mengubah test auth. Hasil ini tidak diubah menjadi klaim suite penuh430 lulus dalam satu run. Build/E2E/visual/Neon/produksi tetap gate integrasi QA/ROOT; worker tidak mengklaimnya lulus.

Riwayat audit preview — 7 Oktober 2026. **Status: audit metadata/kontrak selesai; implementasi pending followup koordinator.** Worker tidak mengubah source, route, fixture, database, provider, deployment, progres bersama atau Git. Fullstack sedang mengerjakan fondasi. Dokumen ini menetapkan kontrak untuk integrasi berikutnya, bukan menyatakan keenam view telah tersedia.

## Sumber dan batas inspeksi

Dibaca: role `business-analyst.md`, AGENTS, master spec bagian GuestInvitation/RSVP/Wish/GiftMethod/AnalyticsEvent dan bagian 47–48, progres/changelog kedua folder, rencana PM 03, inventaris UI/UX 01, kontrak data 05, manifest Stitch dan source DTO/fixture aktual.

Manifest proyek `12559574101879777472` mencatat tujuh PNG GST valid: enam default dan satu empty state. Semua GST berperangkat DESKTOP. Tidak ada state sumber tersendiri bernama sent/terkirim; `SENT_EXAMPLE` merupakan status fixture, bukan screenshot tambahan yang ditemukan. Sumber HTML tidak valid menurut manifest; tidak digunakan.

**Batas visual worker ini:** contact sheet PNG dibuat di `/tmp/menujuakad-business-contact.png`, tetapi pemanggilan viewer ditolak dengan `view_image is not allowed because you do not support image inputs`. Karena itu, audit ini tidak mengklaim inspeksi visual baru pada GST-02–06 maupun empty state. Inspeksi GST-01 dari inventaris 01 merupakan bukti sebelumnya: header undangan, navigasi domain, empat metrik, filter, bulk action, tabel kontak/link/tindakan. Letak, warna, susunan detail pada layar lainnya harus dibuka oleh implementer/QA dengan viewer yang berfungsi sebelum klaim fidelity. Tidak menebak komposisi dari nomor kode.

## Pemetaan sumber yang terverifikasi

Prefix route produksi pada tabel: `/dashboard/invitations/[invitationId]`. Route ini kelak tetap terlindungi sesi/ownership; tautan review memakai `/preview-ui/gst-0N`.

| Kode   | Judul persis manifest                   | Sufiks route     | State dan ID screenshot                         | Dimensi PNG |
| ------ | --------------------------------------- | ---------------- | ----------------------------------------------- | ----------- |
| GST-01 | GST-01 — Manajemen Tamu — Default       | `/guests`        | Default: `11e96c32f956400f90704e16fc036017`     | 2560 × 2048 |
| GST-01 | GST-01 — Manajemen Tamu — Empty State   | `/guests`        | Empty State: `f51fb5404c334e16b7e0e3763ae4b56c` | 2560 × 3442 |
| GST-02 | GST-02 — Impor Tamu — Default           | `/guests/import` | Default: `10ecb8332e0144e7ac07ffd72c95afe1`     | 2560 × 3422 |
| GST-03 | GST-03 — Ringkasan RSVP — Default       | `/rsvp`          | Default: `ddb8bf9d3d3e401db76339636c39d77e`     | 2560 × 5038 |
| GST-04 | GST-04 — Buku Doa & Ucapan — Default    | `/wishes`        | Default: `345e7dacfab047d6a76f85139b8ecbc8`     | 2560 × 4530 |
| GST-05 | GST-05 — Hadiah & Amplop — Default      | `/gifts`         | Default: `02ff2daf3d9d4ca5a5f4494c13bcf928`     | 2560 × 4252 |
| GST-06 | GST-06 — Analitik & Sirkulasi — Default | `/analytics`     | Default: `45178a30b0b8412e80275ece5a60c27b`     | 2560 × 4192 |

PNG sumber berada di rancangan `docs/assets/stitch/gst-0N-<id>.png`. Jalur tersebut hanya sumber inspeksi; runtime/build tidak mengimpor rancangan, menyalin seluruh screenshot ke halaman web, atau menggunakan raster halaman sebagai pengganti komponen React.

## Export dan ownership untuk followup implementasi

DTO diimpor dengan `import type` dari `@/features/design-preview/data/fixtures`. Array props readonly; state interaktif membuat salinan lokal. View tidak membuat shell kedua, sesi, route, query produksi atau service server. Customer shell/navigasi dan wiring resolver dimiliki fullstack; banner data contoh/noindex tetap dipasang pada preview. Komponen domain juga menyatakan aksi lokal agar tidak bergantung hanya pada banner.

| File dan export yang dikunci                                                 | Props                                                                                                                                                            | Tanggung jawab                                                                                     |
| ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `src/features/guests/components/guests-view.tsx`: `GuestsView`               | `{ guests: readonly GuestPreviewDto[] }`                                                                                                                         | GST-01 default/empty, pencarian, filter grup/RSVP/pengiriman, tambah lokal, detail, export contoh  |
| `src/features/guests/components/guest-import-preview.tsx`: `GuestImportView` | `{ rows: readonly GuestImportRowDto[] }`                                                                                                                         | GST-02, contoh input/mapping/validasi dan hasil simulasi lokal                                     |
| `src/features/rsvp/components/rsvp-overview.tsx`: `RsvpOverview`             | `{ guests: readonly GuestPreviewDto[]; summary: RsvpSummaryDto }`                                                                                                | GST-03, empat status terpisah, prop summary sebagai baseline konsisten, detail respons dari guests |
| `src/features/wishes/components/wishes-view.tsx`: `WishesView`               | `{ wishes: readonly WishPreviewDto[] }`                                                                                                                          | GST-04, daftar/pencarian/status dan sembunyikan/tampilkan lokal                                    |
| `src/features/gifts/components/gifts-view.tsx`: `GiftsView`                  | `{ gifts: readonly GiftPreviewDto[]; settings: Readonly<{ enabled: boolean; bankLabel: string; accountNumber: null; shippingAddress: null; paymentQr: null }> }` | GST-05, ringkasan deklarasi, jenis hadiah, toggle contoh tanpa rekening/QR nyata                   |
| `src/features/analytics/components/analytics-overview.tsx`: `AnalyticsView`  | `{ analytics: AnalyticsPreviewDto }`                                                                                                                             | GST-06, metrik periode, tren harian, sumber dan CTA ke preview terkait                             |

Export bernama di atas menjadi entry point; tidak perlu barrel universal atau komponen bercabang seluruh domain. Field tambahan tidak mengubah DTO sumber. Callback provider tidak ditambahkan pada props.

Ownership lanjutan hanya direktori `components/`, `hooks/`, `lib/` dan test domain di lima fitur tersebut, serta dokumen ini. Modul yang direncanakan ketika dibutuhkan:

- Guests: `guest-filters.tsx`, `guest-list.tsx`, `guest-add-form.tsx`, `guest-detail.tsx`; `hooks/use-guest-filters.ts`, `hooks/use-guest-preview.ts`; `lib/guest-summary.ts`, `lib/guest-csv.ts`, `lib/guest-import.ts`.
- RSVP: komponen kartu status/tabel respons; helper agregasi memakai guest-summary yang sama bila benar-benar identik.
- Wishes: daftar/card terpisah dan `hooks/use-wish-moderation.ts` untuk status lokal.
- Gifts: summary/declaration-list/settings; toggle enabled lokal tanpa mengubah nominal/status.
- Analytics: metric-grid/daily-chart/source-list; helper periode/label tanggal hanya bila digunakan. Grafik mempunyai tabel angka/label aksesibel; tidak hanya dekorasi.

Hanya pecah bagian dengan tanggung jawab nyata; page tipis, komponen/hook <200 baris ditargetkan. Tidak menyentuh `src/app`, fixture/registry data engineer, guard, shell, token/CSS global fullstack atau billing payment. Jika fondasi visual bersama belum mendukung kebutuhan, catat kebutuhan bagi pemiliknya sebelum integrasi. Test E2E `tests/e2e/business-preview.spec.ts` dikerjakan setelah wiring melalui koordinasi agar tidak bertabrakan dengan fullstack/QA.

## Interaksi lokal yang dapat dipercaya

**Tamu:** tabel desktop dan list mobile menampilkan nama contoh, grup, RSVP, jumlah orang, dan status distribusi contoh. Fixture tidak memiliki email/nomor/token; kolom kontak dari sumber tidak diisi kontak palsu yang terlihat riil. Search dan filter dapat digabung; tombol reset membedakan daftar kosong asli dari hasil pencarian kosong. Filter mempunyai empat status RSVP. Filter terkirim hanya membaca `SENT_EXAMPLE`, berlabel “Status terkirim contoh”, tanpa mengklaim WA/email sudah dikirim.

Tambah lokal memvalidasi nama contoh wajib, grup allowlist, jumlah orang integer minimal 1; ID lokal bukan ID DB. Konfirmasi berbunyi “Ditambahkan untuk sesi pratinjau; hilang saat muat ulang.” Hindari input kontak nyata. Detail/selection/bulk preview tidak memberi token personal. Tautan yang disalin hanya route demo umum yang sah (`/demo/...`) jika route itu benar-benar tersedia; jangan menciptakan tautan tamu individual dari ID sintetis. Tidak ada `wa.me`, email, request kirim atau bukti delivered palsu.

Export menggunakan CSV lokal dari data sintetis yang sedang difilter, label dan nama berkas contoh jelas. Escape delimiter, newline, quote dan formula spreadsheet berawalan `=`, `+`, `-`, `@` atau kontrol sebelum export; revoke Object URL setelah download. Blob bukan upload/persistence. Export tidak menyertakan token, alamat, email/telepon atau record lain di luar props.

**Impor:** fixture tiga baris VALID/DUPLICATE/INVALID tersedia. Tampilkan pratinjau mapping nama/grup dan pesan per baris. Fase ini dapat memakai input teks contoh/mapping lokal; tidak menyediakan unggah kontak riil atau parsing XLSX yang tidak ada. Simulasi validasi tidak otomatis sukses untuk input invalid. Input tetap utuh saat gagal; duplikat tidak dihitung sebagai berhasil; jumlah hasil sama dengan baris valid yang diterima. Tombol menerapkan hanya hasil contoh lokal, bukan menulis ke daftar/server. Jika list dan impor terpisah route, jangan mengaku perubahan sudah masuk ke daftar route lain tanpa state bersama; tampilkan hasil lokal di halaman impor.

**RSVP:** filter/detail respons lokal, tanpa kemampuan mengonfirmasi tamu sebagai sesi nyata. Tidak hadir, masih ragu, belum menjawab tetap berbeda. CTA pengingat membuka daftar contoh belum menjawab, bukan mengirim pesan. Reload mengembalikan fixture awal.

**Ucapan:** toggle VISIBLE/HIDDEN hanya state lokal; label “Disembunyikan pada pratinjau”. Pencarian/filter menjaga status dan hitungan lokal konsisten. Tidak menghapus ucapan nyata. Master mempunyai APPROVED/PENDING/HIDDEN/REJECTED; DTO VISIBLE/HIDDEN adalah proyeksi tampilan contoh, bukan enum persistensi baru. Backend kelak memetakan APPROVED → VISIBLE dengan aturan moderasi server.

**Hadiah:** pisahkan ENVELOPE dan PHYSICAL. Toggle konfigurasi hanya contoh enabled; rekening/alamat/QR tetap null. Status DECLARED ditampilkan “Dilaporkan (contoh, belum diverifikasi)”. Tidak ada konfirmasi transfer, bank payout, saldo, fee, mark-paid atau receipt. Hadiah fisik nominal 0 bukan nilai finansial. Jelaskan ringkasan “Total nominal amplop yang dilaporkan”, bukan pendapatan/uang diterima.

**Analitik:** periode awal mengikuti fixture tetap 1–7 Oktober 2026; pilihan periode hanya melakukan filter bucket harian yang tersedia. Jangan mengarang pengunjung unik periode baru dengan penjumlahan harian. Jika subset dipilih, tampilkan pageViews subset dan tandai uniqueVisitors periode penuh/tidak tersedia untuk subset. CTA RSVP/ucapan/hadiah membuka whitelist GST sesuai kode. Tidak membuat fetch, beacon, cookie tracking, localStorage atau telemetry produksi.

## Semantik metrik dan sumber server kelak

| Metrik                         | Nilai fixture dan perhitungan               | Makna dan keputusan                                                                     |
| ------------------------------ | ------------------------------------------- | --------------------------------------------------------------------------------------- |
| Tamu terdaftar                 | 120 guest record                            | Denominator coverage; bukan otomatis jumlah orang ketika partySize >1                   |
| Hadir/tidak hadir/ragu/pending | 68 / 20 / 12 / 20                           | Total 120; empat status eksklusif; pending untuk prioritas pengingat                    |
| Tingkat hadir                  | `round(68 / 120 × 100)` = 57%               | Denominator seluruh tamu; koreksi angka 56% historis screenshot                         |
| Tingkat respons                | `(68+20+12)/120` = 83,33%                   | MAYBE sudah merespons; bukan pending; bukan persentase pasti hadir                      |
| Perkiraan orang hadir          | Sum partySize guest ATTENDING = 68          | Semua partySize fixture 1; jangan menggeneralisasi guestCount=personCount               |
| Ucapan terlihat                | VISIBLE 2, HIDDEN 1                         | Ringkasan berubah bersama moderasi lokal di view; fixture analytics tetap snapshot awal |
| Amplop deklarasi               | 250.000 + 150.000 = 400.000 IDR             | Integer rupiah; 2 amplop, 1 hadiah fisik, semua DECLARED; bukan uang diterima           |
| Tayangan                       | 420 = sum tujuh daily.pageViews             | Tayangan berulang mungkin; tren untuk memahami distribusi kunjungan                     |
| Pengunjung unik periode        | 180                                         | Himpunan unik periode; bukan sum unique harian yang dapat tumpang tindih                |
| Sumber kunjungan               | 110 langsung + 50 sosial + 20 lainnya = 180 | Partisi contoh periode; bukan attribution produksi atau conversion revenue              |

Hitungan filter daftar tidak menggantikan total dataset tanpa label “Hasil filter”. View menerima summary yang konsisten dengan guests; agregasi setelah tambah lokal dihitung dari state baru tanpa memutasi fixture. `summary` RSVP dan snapshot analytics tidak otomatis mengikuti state view lain; beri konteks “Ringkasan data contoh” agar tidak menyatakan sinkronisasi global/persistence.

Backend kelak menggunakan query scoped invitation owner/membership, agregasi RSVP terakhir per guest, validasi guestCount, dan moderated wish dari status server. Personalized opens bukan metrik `SENT_EXAMPLE`. Gifts berasal dari deklarasi atau konfigurasi customer; status diterima membutuhkan sumber verifikasi yang belum ada. Analytics memerlukan deduplikasi periode, zona waktu bucket dan consent/retention yang ditentukan; tidak boleh menurunkan identitas dari nama tamu.

Taksonomi kandidat ketika integrasi benar-benar dikerjakan: `guest_added`, `guest_import_validated`, `guest_exported`, `rsvp_responded`, `wish_visibility_changed`, `gift_declared`, `invitation_opened`. Properti minimum berupa invitation reference opaque, event timestamp, mode, status/count yang diperlukan; tanpa nama, pesan ucapan, kontak, token URL, rekening, alamat atau nominal gift individual dalam telemetry umum. **Tidak ada event yang dikirim pada slicing ini.** Target funnel, North Star, monetisasi atau SLA baru tidak ditetapkan tanpa keputusan produk dan data nyata.

## Validasi audit dan pekerjaan tersisa

Verifikasi file aktual dilakukan melalui pembacaan source DTO/fixture dan script manifest: tujuh record GST, enam kode unik, judul/route yang tercantum, semua screenshot valid dan tanpa sent-state khusus. Semantik fixture 120/68/20/12/20, partySize 1, VISIBLE 2, amplop integer 400.000 IDR, pageViews 420 dan uniqueVisitors 180 diperiksa dari source. Tidak menjalankan test/build aplikasi pada audit dokumentasi; implementer aktif sehingga hasil global saat ini tidak diklaim oleh worker ini.

Followup implementasi wajib melakukan inspeksi PNG dengan viewer yang berfungsi, kemudian test perilaku: gabungan filter/reset/empty, MAYBE terpisah PENDING, input impor invalid dipertahankan, duplikat tidak ditambahkan, hitungan RSVP setelah tambah lokal, CSV formula escaping, moderasi tanpa persistence, subset analitik tidak menjumlah unique, dan hadiah tidak dapat menjadi received/paid. E2E perlu memeriksa keyboard, mobile overflow, tanpa request provider/mutation, reload reset dan route preview whitelist/noindex. Inspeksi visual semua GST/state belum selesai; terhubung layanan dan verifikasi produksi belum tersedia.

Pemeriksaan daftar dokumen: 01–05, 07 dan 08 tersedia saat audit; 06 masih milik fullstack yang aktif, sehingga worker tidak membuat penggantinya atau mengubah nomor.

Asumsi scope: audit kontrak saja sesuai tugas ROOT; tidak membuat source sebelum followup. Layar GST-01 telah pernah diperiksa worker UI/UX, tetapi worker ini tidak menandai manifest `visual_inspected` karena tidak ada inspeksi visual baru yang berhasil.

## Implementasi lanjutan setelah resume — 7 Oktober 2026

ROOT mengganti slot GST-01–06 dan varian Empty GST-01 dengan komponen domain guests/wishes/gifts/analytics. Resolver business memakai whitelist enam kode; guard aktual customer/admin tetap terpisah. Manajemen tamu menyediakan kombinasi search/status/grup, pagination 10 record, tambah identitas sintetis otomatis serta CSV lokal dengan perlindungan formula spreadsheet. Impor memakai teks `nama;grup`, memvalidasi panjang nama/grup/kolom, mendeteksi duplikat existing maupun antarbari, menambahkan baris valid lokal dan mempertahankan input invalid. Impor dan manajemen adalah state contoh terpisah, tidak mengklaim sinkronisasi.

RSVP dihitung dari DTO (120/68/20/12/20), denominator tamu; tambah lokal memperbarui ringkasan di layar manajemen. Moderasi ucapan toggle VISIBLE/HIDDEN tanpa persistence. Gift selalu DECLARED; nominal amplop 400.000 IDR bukan uang diterima, hadiah fisik tanpa taksiran. Toggle tampilan hadiah tidak menghasilkan rekening/alamat/QR. Analitik memakai pageViews 420 dan uniqueVisitors 180 periode penuh; subset tiga hari menghitung pageViews saja dan menampilkan unique tidak tersedia. Tidak ada telemetry/provider.

Batas kesesuaian: PNG tersedia dan contact sheet lokal dibuat, tetapi `view_image` menolak karena model sesi tidak mendukung image input. Implementasi memakai handoff tekstual audit, **belum dibandingkan visual dengan sumber**. GST ini increment fungsional dasar, bukan seluruh detail Stitch selesai: tidak ada upload CSV file/parser RFC4180, kontak/link tamu, grafik donut lengkap, alur pengiriman, export gambar/report atau cross-screen state. Detail presentasi sumber tetap pekerjaan review visual berikutnya.

Unit perilaku guests empat kasus lulus; gate gabungan 227 test/schema/typecheck/lint/build lulus. Bukti E2E final dicatat pada dokumen QA 10. Komponen terbesar 152 baris; presentasi dan fungsi validasi/agregasi/CSV terpisah. Runtime tidak membaca aset folder rancangan.
