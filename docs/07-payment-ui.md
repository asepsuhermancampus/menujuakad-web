# Implementasi UI Pembayaran Menuju Akad

Tanggal: **8 Oktober 2026**. Status aktif: **workspace billing QRIS TEST dengan persistence Prisma tersedia dan teruji pada PostgreSQL PGlite lokal terisolasi**. Preview frontend historis tetap sintetis. Migrasi/grant/seed Neon aktif, build standalone, browser HTTPS dan produksi increment ini belum diverifikasi oleh worker Payment. Tidak melakukan deploy, seed, migrasi live, commit atau pembacaan berkas credential privat.

## Increment QRIS statis aktual

Otorisasi mengikuti kontrak [PM03](03-pm-rencana-slicing.md), [Security04](04-security-akses.md), [Data05](05-data-engineer-kontrak.md) dan [Fullstack06](06-fullstack-slicing.md). Memakai sesi login nyata existing, model `PaymentTestRequest` existing dan shell peran existing. Tidak mengubah auth, schema/migrasi/seed, catchall, layout, registry, preview atau file worker lain. Perubahan bersama hanya `next.config.ts` untuk tracing aset QRIS. Progres/changelog konsolidasi menjadi tugas ROOT.

### Perilaku customer, nominal dan status

- `/dashboard/billing` membaca maksimal100 request terbaru milik akun dari DB; empty state jujur tanpa fallback fixture.
- `/dashboard/billing/packages` membaca maksimal100 undangan **owner-only, CUSTOMER ACTIVE, DRAFT, isPublished=false**. Tanpa draft tersedia tautan membuat draft. Tiga pilihan server: `TEST_BASIC` Rp1.000, `TEST_STANDARD` Rp2.000, `TEST_PLUS` Rp3.000. Ini nominal pengujian, bukan harga/penawaran paket komersial, kuota, masa aktif atau entitlement.
- POST hanya menerima `{invitationId, packageSlug, reference?}`. `reference` trim, maksimal160 karakter, tanpa kontrol tersembunyi, merupakan deklarasi customer dan **bukan bukti pembayaran**. Body strict: nominal, userId, status, reviewer dan field ekstra ditolak. Nominal integer IDR dipilih service dari katalog server, bukan dari browser.
- `/dashboard/billing/checkout/[requestId]` memakai DTO DB owner-only. Request `REQUESTED` menampilkan QRIS dan instruksi nominal uji serta penjelasan review manual. React melakukan escaping judul/catatan. Request final menyembunyikan QRIS; permintaan baru membuat row baru dan menjaga riwayat, tanpa refund atau menghapus keputusan lama.
- Label `REQUESTED` = “Menunggu review uji”; `APPROVED_TEST` = **“Persetujuan uji”**; `REJECTED` = “Permintaan uji ditolak”. Tidak menulis PAID, invoice, status ACTIVE, publikasi, pembayaran komersial atau entitlement. Tidak polling provider atau memberi timer kedaluwarsa fiktif.
- Peringatan yang tampil pada form dan checkout: **“QRIS statis untuk pengujian — pemindaian dapat memindahkan dana nyata. Tidak ada verifikasi otomatis Mayar.”** Checklist pemahaman risiko membantu interaksi browser; pemeriksaan role/input/nominal tetap di server. Request sebelum scan tidak menyatakan transfer sudah terjadi. Jangan mengulang transfer hanya karena menunggu review.

### Persetujuan superadmin dan transaksi

`/admin/payments` membaca maksimal100 request terbaru, termasuk keputusan final, melalui sesi terverifikasi **SUPERADMIN**. Repository memeriksa User ACTIVE/SUPERADMIN lagi. DTO admin hanya field request terpilih, email customer dan ID reviewer; tanpa hash, token, raw provider, credential atau payload QRIS. Admin tidak mendapat QRIS aktual dari endpoint customer.

PATCH review hanya `{status:"APPROVED_TEST"|"REJECTED"}`. Identitas reviewer berasal dari sesi, waktu review berasal dari server. `updateMany WHERE id=? AND status=REQUESTED` menjadi transisi atomik; satu keputusan menang, pengulangan atau konflik ditolak409 tanpa overwrite. Lookup tidak ada404. Review hanya mengubah `PaymentTestRequest`, tanpa menulis `Invitation`, Package, invoice atau entitlement. Konfirmasi UI menjelaskan persetujuan uji tidak membuktikan dana diterima.

Pembuatan request memakai transaction-scoped advisory lock per customer (`billing-test:<userId>`) dan `FOR UPDATE OF Invitation` dengan filter pemilik/role/status aktif. Lock undangan menahan delete/publikasi bersamaan dan tidak mengubah row undangan. Di dalam transaksi: periksa DRAFT privat → cari pending → pakai ulang jika paket/nominal sama → conflict409 jika berbeda → hitung budget persisten → create REQUESTED. Reference pending tidak ditimpa pada submit ulang. Batas **20 row baru/customer/jam** dan **10 pending/customer**, dihitung dari DB di bawah lock; reuse pending tetap tersedia saat budget penuh. Browser memakai pengunci `useRef` dan tombol disabled, tetapi transaksi server tetap melindungi submit dari beberapa tab/proses. Sejarah request menjaga draft dari penghapusan melalui guard fullstack existing.

### Aset privat dan kontrak HTTP

Gambar `/home/uploads/photo_20261008_112154.jpg` diperiksa langsung melalui `view_image` pada increment ini, lalu **disalin tanpa edit/generate/decode** ke `assets/payment/testing-qris.jpg`, di luar `public/`. Ukuran **87.699 byte**. SHA-256 sumber dan salinan identik:

`850680e466e1010efc804be2676a602f1c6099067ff1fa3169955cdba7c9cbdd`

Alur aktual: browser → endpoint cookie-auth → guard/validasi → service → Prisma transaction → PostgreSQL. Untuk gambar: browser → GET protected → sesi CUSTOMER → stream JPEG aset privat. Tidak ada API Mayar, webhook, pengunggah bukti, rekonsiliasi atau refund otomatis. Foto QRIS bukan bukti pembayaran berhasil.

| Metode / endpoint                     | Kontrak dan batas                                                                                          |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| GET `/api/billing/test-requests`      | 200 `{requests:TestRequestDto[]}`, owner-only, maksimal100                                                 |
| POST `/api/billing/test-requests`     | JSON `{invitationId,packageSlug,reference?}`, 201 `{request}` termasuk reuse pending                       |
| GET `/api/billing/test-requests/[id]` | 200 `{request}` milik sesi; asing/tidak ada404 yang sama                                                   |
| PATCH `/api/admin/payment-tests/[id]` | SUPERADMIN; JSON `{status}`, 200 `{request}` dengan reviewer/waktu DB; keputusan final409                  |
| GET `/api/billing/testing-qris`       | CUSTOMER saja; 200 stream `image/jpeg` asli; anonymous401, admin403; tidak mengembalikan path file/payload |

Semua respons API `Cache-Control: private, no-store` dan `X-Content-Type-Options: nosniff`. Gambar menambah `Cross-Origin-Resource-Policy: same-origin`, `X-Robots-Tag: noindex, nofollow`, disposition inline dengan nama generik. Sesi divalidasi **sebelum** membuka aset. Gambar menggunakan URL API langsung tanpa optimizer/cache gambar publik. API GET hanya membaca dan tidak memutasi. Semua mutasi memeriksa `assertTrustedOrigin(request)`, content-type JSON dan body streaming maksimal **4096 byte**; body invalid400, terlalu besar413, Origin hilang/asing403. Sesi hilang/expired401, salah-role403, budget429 dan DB/asset failure503 dengan pesan umum tanpa exception, URI atau secret. Halaman aktual `force-dynamic`, metadata noindex/nofollow, guard page plus guard service, dan hanya konten section agar layout existing mempertahankan satu `<main id="main">`.

`next.config.ts` menambahkan hanya:

```ts
outputFileTracingIncludes: {
  "/api/billing/testing-qris": ["./assets/payment/testing-qris.jpg"],
}
```

Gate ROOT/QA setelah build final: jalankan `test -f .next/standalone/assets/payment/testing-qris.jpg`, `cmp assets/payment/testing-qris.jpg .next/standalone/assets/payment/testing-qris.jpg`, dan cek trace `.next/server/app/api/billing/testing-qris/route.js.nft.json` menyertakan aset. Container standalone harus memuat direktori assets tersebut. Browser anonymous/expired tidak menerima JPEG; browser customer menerima byte asli dengan no-store/nosniff. Halaman `/preview-ui/cus-07`, `/preview-ui/cus-08`, `/preview-ui/adm-01`, `/preview-ui/adm-02` tetap tidak mengambil QRIS aktual, DB, provider atau mutasi server. Verifikasi build/trace/container/browser ini **belum dijalankan worker**.

### Modul dan ekspor integrasi

| Lokasi                                                                                | Tanggung jawab                                                         |
| ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `src/server/billing/catalog.ts`, `validation.ts`, `dto.ts`                            | katalog nominal server, input strict, select/DTO aman                  |
| `src/server/billing/repository.ts`                                                    | query owner-only/admin, locking/budget/reuse, transisi review atomik   |
| `src/server/billing/service.ts`                                                       | sesi per operasi, validasi dan error layanan aman                      |
| `src/server/billing/http.ts`, `qris.ts`                                               | Origin/body/status/no-store, stream gambar privat                      |
| `src/features/billing/actual/contracts.ts`                                            | DTO presentasi dan label TEST tanpa import runtime server/fixture      |
| `actual/customer-views.tsx`, `admin-view.tsx`                                         | Server Component komposisi data aktual; berbeda dari komponen preview  |
| `actual/test-request-form.tsx`, `test-review-actions.tsx`, `use-billing-mutation.ts`  | interaksi browser, status gagal/sukses dan refresh setelah persist     |
| `actual/billing-actual.module.css`                                                    | styling billing aktual terisolasi; tidak mengubah stylesheet bersama   |
| `src/app/(dashboard)/dashboard/billing/**`, `src/app/(admin)/admin/payments/page.tsx` | empat concrete route mengungguli catchall, guard dan boundary existing |
| `src/app/api/billing/**`, `src/app/api/admin/payment-tests/[id]/route.ts`             | wrapper route nodejs/dynamic untuk handler billing                     |

Ekspor service untuk integrasi: `listCustomerTestRequests`, `listCustomerBillingDrafts`, `getCustomerTestRequest`, `createCustomerTestRequest`, `listAdminPaymentTests`, `reviewPaymentTest`, `requireBillingCustomer`. DTO `TestRequestDto` hanya `id,invitationId,invitationTitle,packageSlug,amountIdr,status,reference,createdAt,reviewedAt`; DTO admin menambah `customerEmail,reviewedByUserId`. Tidak menambahkan dependency, model atau migrasi. Komponen aktual terbesar185 baris; service52/repository142, setiap page kurang dari20 baris.

### Bukti validasi increment dan keterbatasan

- TDD awal menjalankan test sebelum modul baru tersedia: RED import/module belum tersedia untuk service, repository, HTTP dan view; sesudah implementasi assertion GREEN. Pengujian Prisma memakai ketiga SQL migration existing pada PGlite **lokal terisolasi**, bukan Neon live. Race test lokal memanggil operasi paralel; PGlite memakai satu koneksi serial, sehingga perilaku concurrency multi-koneksi Neon tetap menjadi gate integrasi.
- `npm test -- src/server/billing src/features/billing/actual src/features/billing/lib --maxWorkers=1`: **6 file / 50 test lulus**, 13,05detik;40 test baru aktual dan10 test preview existing. Mencakup sesi expired/salah-role, customer tidak bisa review, IDOR, mass assignment harga/status/userId, tiga nominal server, input/reference, no-entitlement, reuse, history/retry, conditional review, parallel double submit, hourly/pending budget, reviewer SUSPENDED, Origin,4096byte, respons error aman, JPEG byte-identical, SSR escaping/empty-state/satu-main dan pemisahan label TEST.
- Run sebelumnya saat tsc/lint/test bersama timeout setup PGlite15detik: satu suite gagal,11 test skip,39 lulus; bukan assertion bisnis gagal. Batas setup dinaikkan60detik dan rerun satu worker menghasilkan50/50 di atas. Perbaikan prop tombol yang tidak didukung serta metode PATCH pada test CSRF sudah diverifikasi ulang.
- `npx tsc --noEmit`: **exit0** pada pemeriksaan ulang12:22; tidak menggenerate/mengubah client schema. Run awal menemukan prop tombol billing lalu diperbaiki serta modul analitik worker lain yang masih belum tersedia saat itu.
- Scoped ESLint seluruh modul billing aktual, empat halaman, API dan `next.config.ts`: **exit0**. `cmp` sumber/salinan QRIS dan SHA-256 identik; `git diff --check` scoped **exit0**.
- Validasi final: `npm test -- --maxWorkers=2` **47 file / 430 test lulus**, 101,65detik, run12:24:23; `npx tsc --noEmit` dan scoped ESLint ulang **exit0**. Tidak mengklaim full build/E2E, fidelity piksel, trace standalone aktual, grant runtime, migrasi/seed Neon aktif, login di HTTPS atau produksi sudah terverifikasi. Tidak mengubah provider, melakukan transfer atau menandai pembayaran nyata berhasil. ROOT mengonsolidasikan progres/rilis setelah gate QA.

## Riwayat slicing frontend — 7 Oktober 2026

Tanggal: 7 Oktober 2026. **Status: source empat layar billing dan varian expired tersedia, wired ke preview, typecheck/lint/unit lulus; build/E2E/visual hasil render masih pending validasi terintegrasi.** Scope implementasi adalah frontend sintetis. Tidak melakukan commit, push, migrasi, transaksi, aktivasi paket, retry provider atau deployment.

## Sumber dan batas inspeksi

Dibaca: role payment-specialist, AGENTS, master spec, progres/changelog kedua folder, rencana 03, inventaris 01, kontrak 05, snapshot token dan `billing-fixtures.ts`. File 07 belum ada saat resume sehingga laporan ini dibuat tanpa mengulang deliverable sebelumnya. DTO billing sudah tersedia; tidak membuat ulang data atau schema.

Kelima PNG asli berikut diperiksa **individual melalui `view_image` sebelum implementasi** pada giliran implementer ini. Pemeriksaan langsung berhasil untuk CUS-07, CUS-08 default, CUS-08 expired, ADM-01 dan ADM-02. Audit awal pernah memakai decode/OCR karena viewer model sebelumnya tidak mendukung input gambar; keterbatasan audit awal tersebut sudah teratasi untuk inspeksi referensi. Pemeriksaan sumber belum menjadi bukti kesesuaian render React. Manifest rancangan tidak diubah dan screenshot halaman penuh tidak dipasang sebagai runtime asset.

| Kode/state     | ID Stitch                          | Dimensi PNG | Bukti audit                         |
| -------------- | ---------------------------------- | ----------- | ----------------------------------- |
| CUS-07 Default | `3ecacc9efc524ae2934bcb75337abf35` | 2560 × 7154 | Inspeksi visual individual berhasil |
| CUS-08 Default | `b6693cee4ed7403c93340c99927c3e40` | 2560 × 3234 | Inspeksi visual individual berhasil |
| CUS-08 Expired | `741bf2dc293243f29a02bea0b8546ed6` | 2560 × 2632 | Inspeksi visual individual berhasil |
| ADM-01 Default | `72c3e194242f46c5826dbf91aa321b62` | 2560 × 2946 | Inspeksi visual individual berhasil |
| ADM-02 Default | `2a62b424023f49a2b70102b70be5bbfc` | 2560 × 4094 | Inspeksi visual individual berhasil |

Sumber berada di [manifest rancangan](../../menujuakad-rancangan/docs/assets/stitch/manifest.json); nama PNG mengikuti `<code-lowercase>-<id>.png`. Tidak ada HTML desain valid; respons login Google tidak dipakai sebagai markup. Tidak memindahkan screenshot penuh ke runtime/public dan tidak mengubah flag `visual_inspected` manifest dari hasil OCR.

## Komposisi layar dan keputusan slicing

**CUS-07 Paket & Fitur.** Urutan teks menunjukkan breadcrumb/header undangan, sidebar customer, heading pilihan paket/masa aktif, penjelasan pembayaran, tiga kolom paket, matriks komparasi berkelompok, FAQ penerbitan, blok bantuan dan footer. Posisi label tiga paket pada y≈1136 masing-masing x≈660/1452/2077 mendukung komposisi tiga kolom setelah sidebar. Matriks fitur muncul setelah kartu, bukan digabung menjadi satu daftar panjang di dalam kartu. Screenshot menyebut Draf Eksplorasi gratis, Maharani Rp249.000 dan Royal Matrimony Rp499.000; label akses selamanya berdampingan dengan masa aktif 12 bulan. Tidak menganggapnya kebijakan komersial final.

**Implementasi tersedia:** `PackageSelectionPreview` dengan kartu reusable, highlight rekomendasi, selected state lokal, komparasi dan FAQ. Gunakan Essential/Signature/Premium dari fixture, harga contoh Rp99.000/Rp149.000/Rp249.000, kuota contoh 150/300/500 tamu dan 10/20/40 foto. Tombol “Pilih contoh paket” hanya mengubah pilihan/ringkasan lokal; tidak memberi entitlement atau menavigasi ke tagihan paket yang salah. Jika tautan checkout ditampilkan, jelaskan bahwa checkout ilustratif tetap memakai Signature; jangan meneruskan query harga/order baru atau mengklaim checkout mengikuti pilihan tanpa kontrak fixture yang konsisten.

**CUS-08 Default.** Dua kolom: pemilihan kanal, deadline, area QR dan instruksi di kiri; ringkasan paket/order/nominal di kanan. OCR menempatkan judul pembayaran x≈469 dan ringkasan x≈1595, sesuai inspeksi 01. Ada metode QRIS, VA, kartu, field promo dan tombol cek status. Sumber menyebut Rp249.000, waktu 14:56 menit, merchant/NMID, kupon diskon 0%, PPN11%, siap diterbitkan dan aktivasi ≤60 detik. Semua merupakan copy desain yang belum dibuktikan layanan.

**Implementasi tersedia:** pilihan metode berlabel “Contoh tampilan”; area instrumen berupa placeholder polos bertuliskan “Pembayaran belum aktif — tidak ada kode untuk dipindai”, tanpa pola QR yang bisa dipakai, tanpa NMID/rekening/payment URL dan tanpa salin/simpan QR. Ringkasan memakai `order.amountIdr`, nama paket dicari dari `packageId`; total tidak dihitung ulang dari copy screenshot. Promo visual dapat menampilkan pesan lokal “Validasi promo belum tersedia”, tanpa diskon fiktif. Tombol “Lihat status contoh” membaca DTO yang sama dan menampilkan pemberitahuan lokal; tidak menetapkan PAID, menjalankan polling, menghubungi gateway atau menyatakan undangan aktif.

**CUS-08 Expired.** Banner sesi berakhir di atas; metode/area QR di kiri, faktur dan total tagihan tertutup di kanan; timer 00:00:00, informasi jangan transfer, bantuan jika dana terpotong, tindakan kembali/ganti metode. Header ringkasan terdeteksi x≈1577 dan metode x≈148. Sumber expired menyebut Rp499.000 sehingga berbeda dari default Rp249.000 dan berbeda dari fixture Rp149.000. Ini dua referensi state, bukan bukti order yang sama berubah nominal.

**Implementasi tersedia:** expired order memakai fixture dedicated, label “Kedaluwarsa (contoh)”, placeholder instrumen nonaktif dan nominal DTO. Tombol “Lihat contoh checkout” dapat mengganti tampilan lokal dengan pending fixture yang sudah ada; teks harus menyatakan contoh lain, bukan menerbitkan ulang tagihan. Kembali paket menuju `/preview-ui/cus-07`; tidak menaut ke dashboard private sebagai alur preview. Tidak menampilkan bantuan WhatsApp/email fiktif atau jaminan saldo 100% sebagai layanan tersedia.

**ADM-01 Monitoring Pembayaran.** Shell SUPERADMIN berbeda dari customer; judul/breadcrumb, empat metric, filter/search, tabel order berstatus, aksi detail, pagination dan panel tautan rekonsiliasi. Sumber tabel mengandung provider, entitlement, metode, waktu, nominal, pasangan dan transaksi; hanya field yang ada pada DTO boleh ditampilkan sebagai data. Sumber menyebut Midtrans/Xendit, gateway normal, PAID terverifikasi, paket otomatis aktif, latensi120ms, sukses99.98%, TLS/ISO27001.

**Implementasi tersedia:** metric dihitung dari empat order contoh, satu per status; total PAID contoh Rp149.000, bukan total Rp596.000 dari seluruh order. Label “Nilai order dibayar (contoh)” tidak menyatakan settlement atau kas diterima. Filter status dan search ID; tabel detail menampilkan status contoh, nominal integer terformat, waktu contoh, packageId dan invitationId sintetis. Entitlement diganti “Tidak diterbitkan oleh preview” untuk seluruh baris, termasuk PAID. Provider “Belum terhubung”; jangan mengarang merchant/method/signature/verifiedAt dari DTO. Panel menuju `/preview-ui/adm-02`, tanpa sinkronisasi provider atau ekspor data personal.

**ADM-02 Rekonsiliasi Webhook.** Urutan OCR: header admin, judul/keterangan, aksi retry/ping, empat metric, filter, arsip event kiri dan panel inspeksi kanan, pagination, audit langkah/idempotensi. Label PAYLOAD x≈1797 y≈1435 dan PROCESSED x≈1038 y≈1648 mendukung panel kanan sejajar tabel event. Sumber menampilkan payload JSON mentah, signature/header, endpoint Midtrans, hash SHA-512, IP, latensi, audit mutasi PAID dan pemberian entitlement, polling5s serta klaim ISO.

**Implementasi tersedia:** `AdminWebhooksPreview` menampilkan tiga event sintetis PROCESSED/DUPLICATE/FAILED dari DTO; metric 3 total/1 diproses/1 duplikat/1 gagal. Panel detail menerima selected event dan hanya memperlihatkan ID, orderId, eventType, status, attempts, receivedAt, summary; tidak raw payload/signature/header/IP/token/server key. Panel berjudul “Detail event contoh”. Retry berupa “Simulasikan tampilan retry”: pesan lokal yang eksplisit tanpa request, tanpa mengganti FAILED menjadi PROCESSED atau menambah attempts yang lalu terkesan hasil provider. Tidak ada ping/stream/polling hidup. Status DUPLICATE tidak menambah total order paid/entitlement.

## Kontrak export dan batas file

Import DTO/fixture dari `@/features/design-preview/data/fixtures`. Komponen billing merupakan konten halaman; wrapper existing memberi `CustomerShell`/`AdminShell` serta banner/noindex preview. Billing tidak membuat routing/auth/session atau shell paralel. Empat export berikut dikunci sebagai antarmuka implementasi mendatang:

```tsx
// src/features/billing/components/customer/payment-checkout-preview.tsx
export function PaymentCheckoutPreview(props: {
  order: OrderPreviewDto;
  initialExpired?: boolean;
}): React.JSX.Element;
// src/features/billing/components/customer/package-selection-preview.tsx
export function PackageSelectionPreview(): React.JSX.Element;
// src/features/billing/components/admin/admin-payments-preview.tsx
export function AdminPaymentsPreview(): React.JSX.Element;
// src/features/billing/components/admin/admin-webhooks-preview.tsx
export function AdminWebhooksPreview(): React.JSX.Element;
```

`initialExpired` hanya memilih simulasi expired saat mount, tidak kewenangan pembayaran; order berstatus EXPIRED harus tetap expired meskipun flag false. Status PAID/FAILED tidak diubah menjadi pending oleh selector metode. Fixtures dibaca readonly; setiap interaksi lokal memakai state terpisah. Pemilihan record unknown menghasilkan empty state, bukan indexing tanpa guard.

| Direktori/file implementasi                                           | Tanggung jawab                                              |
| --------------------------------------------------------------------- | ----------------------------------------------------------- |
| `components/customer/package-selection-preview.tsx`                   | Komposisi pilihan paket, selected state dan komparasi       |
| `components/customer/package-card.tsx`                                | Presentasi satu DTO paket dan tombol pilihan                |
| `components/customer/payment-checkout-preview.tsx`                    | Komposisi status/metode/ringkasan, tanpa provider           |
| `components/customer/checkout-summary.tsx`                            | Order/package/nominal/waktu contoh                          |
| `components/customer/payment-method-choice.tsx`                       | Radio QRIS/VA/kartu ilustratif yang dapat dikeyboard        |
| `components/admin/admin-payments-preview.tsx`                         | Filter lokal, metric dan komposisi order table/detail       |
| `components/admin/admin-webhooks-preview.tsx`                         | Filter lokal, selected event dan detail aman                |
| `components/admin/payment-order-table.tsx`, `webhook-event-table.tsx` | Presentasi tabel/caption/status/aksi detail                 |
| `hooks/use-payment-preview.ts`                                        | Pilihan metode/pemberitahuan lokal dan flag expired preview |
| `lib/presentation.ts`, `lib/presentation.test.ts`                     | Formatter/selector status, deadline dan agregasi murni      |
| `styles.css`                                                          | CSS khusus domain, token shared dan reflow responsif        |

Jumlah file disesuaikan fungsi nyata; tidak membuat struktur kosong. Komponen/hook <200 baris; style/format dipisahkan agar halaman tidak menumpuk. CSS memakai token/font yang dibuat fullstack, selector namespace billing; tidak override globals/shell. State filter dan notifikasi diletakkan pada komponen/hook pemilik, bukan satu utility campuran.

Fullstack wiring: CUS-07→PackageSelectionPreview; CUS-08 default→PaymentCheckoutPreview dengan pendingOrderFixture; varian expired→expiredOrderFixture/initialExpired. ADM-01→AdminPaymentsPreview; ADM-02→AdminWebhooksPreview. Pembayaran hanya berada pada resolver whitelist preview. Routes aktual tetap memakai guard sesi server yang sudah tersedia. Tidak menggunakan `logicalRoute` sebagai link preview secara langsung.

## Status, nominal dan semantik waktu contoh

- `amountIdr` integer rupiah; formatter `Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 })`. Tidak memakai floating point, fee/pajak/diskon rekaan atau mencampur nominal screenshot.
- Jam acuan `previewContext.now = 2026-10-07T08:00:00.000Z`; label UI menyatakan “Jam contoh” dengan timezone eksplisit (misalnya WIB). Tidak memakai `Date.now()`/jam browser untuk mengklaim order provider aktif. Default pending berakhir 08:45 UTC sehingga sisa contoh **45:00**, bukan timer screenshot14:56. Expired fixture berakhir sehari sebelumnya, sisa **00:00**.
- Tidak perlu setInterval countdown produksi. Jika kelak animasi timer demonstrasi ditambahkan, harus dibatasi waktu lokal contoh dan tidak mengubah order/status/entitlement; tidak termasuk audit saat ini.
- PAID hanya record sintetis dengan paidAt contoh. Cek status/return URL/screenshot/tindakan user tidak menjadi bukti pembayaran. Status order tidak disamakan lifecycle undangan atau `isPublished`.
- FAILED/DUPLICATE webhook adalah status fixture, tanpa klaim HMAC valid, row lock, idempotency engine aktif atau provider retry sukses. `attempts` menampilkan snapshot saja.
- Tidak mengimplementasikan arsitektur provider/endpoint/orders database/invoice/refund dalam slicing. Alur produksi kelak UI→service server→Mayar→konfirmasi server terverifikasi→perubahan status idempoten; kontrak keamanan produk tetap mengacu master dan dokumen payment existing. Algoritma signature tidak disalin dari contoh Midtrans ke Mayar.

## Mismatch copy yang harus diperbaiki

| Sumber                                                                | Penyesuaian frontend                                                                    |
| --------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Nama/harga paket dan kuota antar-PNG berbeda                          | Pakai DTO billing tunggal dan label Harga contoh; jangan menyatakan harga resmi         |
| Seumur hidup, aktif12bulan, custom domain/gratis/concierge24/7        | Jangan menjanjikan layanan/masa aktif yang belum disahkan; gunakan fitur contoh DTO     |
| Checkout “resmi”, “siap diterbitkan”, instan≤60detik, pemulihan3menit | Ganti label preview dan pesan layanan belum aktif                                       |
| QR/merchant/NMID/rekening dan instruksi bayar                         | Placeholder noninstrumen, tanpa kode dapat dipindai/salin                               |
| Kupon0%, PPN11%, biaya kanal termasuk                                 | Tidak menghitung biaya/pajak dari desain; total dari order DTO                          |
| Admin Midtrans/Xendit terhubung, signature SHA512/ISO/latensi         | Provider belum terhubung, tidak klaim sertifikasi/status live, tidak menyalin signature |
| Akun/email/IP admin asli-terlihat dan Sarah/Dimas                     | Identitas sintetis yang tersedia; tidak mengulang data personal sumber                  |
| Entitlement aktif dari PAID contoh                                    | Selalu tidak diterbitkan oleh preview                                                   |

## Implementasi dan wiring final

- `src/features/billing/components/customer/` memuat `PackageSelectionPreview`, `PackageCard`, `PaymentCheckoutPreview`, `PaymentMethodChoice` dan `CheckoutSummary`. Kartu paket memakai tiga DTO, selected state lokal, matriks kuota/fitur, FAQ dan checkout Signature yang dinyatakan terpisah dari pilihan paket. Checkout mempunyai dua kolom, metode radio, jam deterministik, placeholder polos noninstrumen, promo message dan status inspection lokal. Expired menampilkan banner di atas kedua kolom, metode nonaktif, nominal/order expired dan tindakan meninjau contoh lain tanpa menerbitkan tagihan.
- `components/admin/` memuat `AdminPaymentsPreview`, `AdminWebhooksPreview`, tabel terpisah, kontrol metric/filter/pagination reusable serta panel detail event. Halaman order memakai 2 record per halaman untuk membuktikan pagination pada empat fixture; filter status dan search ID mengatur ulang pagination/selection. PAID sintetis tetap tanpa entitlement. Webhook memakai panel hitam ringkasan field aman, timeline ilustrasi, empty result dan retry message; status/attempts DTO tidak berubah.
- `hooks/use-payment-preview.ts` memisahkan metode/notifikasi/state checkout. `lib/presentation.ts` memuat fungsi murni untuk status/expiry, formatter IDR/waktu WIB, filtering, pagination dan metric. Terminal PAID/FAILED/EXPIRED dipertahankan; timestamp invalid menghasilkan UNAVAILABLE. Tidak ada fetch, action server, endpoint provider, polling atau mutation database pada source billing.
- `styles.css` menjadi entry point CSS domain; komposisi checkout berada pada `components/customer/checkout.css`, monitoring pada `components/admin/monitoring.css`. Pemecahan dilakukan ketika hasil format awal styles mendekati 423 baris. Token/font shared reused; tidak menggandakan shell atau memuat font/aset sumber dari folder rancangan. Selector semuanya bernamespace billing, responsif mengikuti layout satu kolom dan tabel scroll lokal.
- Wiring diizinkan ROOT dalam follow-up tugas ini: `features/design-preview/components/billing-preview-view.tsx` memakai whitelist statis CUS-07/08, ADM-01/02. CUS-08 state `Expired` memilih `expiredOrderFixture`; default memilih pending fixture, key berdasarkan ID varian. `design-preview-view.tsx` hanya mengganti slot billing, menyisakan GST dan routing existing. `src/app/globals.css` mengimpor entry stylesheet billing. CustomerPreviewLayout existing tetap memberi checkout tanpa sidebar; tidak membuat header checkout kedua. AdminShell existing dipakai tanpa perubahan.
- Tidak ada form billing yang melakukan submit; field search/filter/radio berupa kontrol lokal dan seluruh tombol mempunyai `type="button"`. Oleh karena itu LocalPreviewForm tidak diperlukan pada increment ini. Tidak menambah sesi/cookie/auth mock atau mengubah guard security.

## Validasi implementasi

| Pemeriksaan                             | Hasil                                                                                                                                                                                                                      |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TDD selector/presentation               | Modul belum ada menghasilkan import failure; stub kemudian menjalankan **6 test yang gagal pada assertion** (deadline, invalid time, terminal status, metric, filter, pagination). Implementasi membuat keenam test lulus. |
| `npm test -- src/features/billing/lib`  | **2 file / 10 test lulus**: enam aturan presentasi dan empat regression SSR safety.                                                                                                                                        |
| `npm run typecheck`                     | **Exit 0** setelah koreksi tipe selected event menjadi tipe union string/undefined; Prisma Client 7.10.0 generate, tanpa perubahan model/migrasi.                                                                          |
| Scoped ESLint billing/resolver/view/E2E | **Exit 0**, tanpa temuan.                                                                                                                                                                                                  |
| `npm test`                              | **14 file / 221 test lulus** pada source yang sudah wired.                                                                                                                                                                 |
| `git diff --check`                      | **Exit 0**.                                                                                                                                                                                                                |
| Ukuran source                           | Komponen terbesar **140 baris**, hook 19, presentation 97, entry resolver 32; seluruh komponen/hook <200. CSS entry 217, checkout 149, monitoring60.                                                                       |
| Browser test discovery                  | `tests/e2e/billing.spec.ts` memuat lima skenario; **10 kasus** desktop/mobile terdaftar. Ini discovery saja, **belum eksekusi browser**.                                                                                   |

SSR regression memeriksa banner expired/00:00, jam fixture pending45:00/15.00WIB, tidak ada QR SVG/canvas/img/form/instrumen pembayaran, empat order termasuk PAID tetap tanpa entitlement, serta panel webhook yang mengabaikan field ekstra signature/token/payload dengan sentinel rahasia. JSON panel hanya field yang diwhitelist secara eksplisit, bukan `JSON.stringify(event)` tanpa filter.

E2E yang disiapkan: pemilihan paket melalui keyboard, kanal bank dan status/promo tidak mengubah pending; varian expired tidak membuka order; pagination/filter/zero-result/detail admin; retry FAILED tetap status/attempts3; reflow320px. Interaksi utama menangkap request non-GET/HEAD dan URL provider untuk memastikan tidak ada transaksi/request Mayar/Midtrans/Xendit. Selector varian expired menggunakan ID sumber whitelist, tanpa bypass harga/order query.

**Belum dilakukan:** build produksi increment ini, eksekusi E2E, perbandingan screenshot render dengan kelima sumber, audit keyboard/zoom200% menyeluruh, koneksi Neon/auth/Mayar, deployment atau verifikasi domain. ROOT menginstruksikan agar tidak menjalankan build/E2E selama server QA memakai standalone lama; hasil fullstack sebelum billing tidak menjadi bukti validasi browser source billing ini.

## Penyesuaian visual dan batas fidelity

Hierarki sumber direalisasikan: tiga kartu paket + matriks + FAQ/bantuan; checkout dua kolom/ringkasan kanan; banner expired atas + placeholder nonaktif; admin empat metric/filter/tabel/pagination; webhook arsip kiri dan panel hitam/timeline kanan. Harga, nama/kuota paket, nominal order, jam, copy pembayaran/entitlement, dan detail webhook sengaja mengikuti DTO aman sehingga berbeda dari screenshot. Tampilan nominal/harga bukan penawaran komersial.

Matriks paket menyajikan kuota dan fitur DTO, bukan seluruh baris SLA/domain/sertifikasi/concierge yang belum tersedia. Ringkasan checkout tidak menampilkan gambar template asli (aset belum tersedia), pajak11%, diskon rekaan, rekening/NMID atau instruksi transfer. Tombol promo menghasilkan pesan tanpa input/form atau diskon; bantuan berupa informasi belum aktif. Admin tidak mempunyai CSV/export transaksi, date/gateway filter rekaan, latensi produksi, IP, verified-signature atau raw payload. Filter yang tersedia adalah status/searchID; retry/ping/sinkronisasi merupakan pesan lokal. Shell admin existing masih mempunyai sidebar, berbeda dari header fullwidth screenshot sumber; shell berada di luar ownership payment.

Dengan demikian **implementasi frontend lengkap untuk kontrak empat layar + satu varian tersedia**, sementara fidelity piksel/microcopy/control seluruh screenshot belum dapat diklaim. Penyesuaian tersebut dicatat untuk QA final dan tidak mengubah requirement provider/server-authoritative produksi. Root memperbarui progres/changelog dan melakukan review independen serta gate terintegrasi.

## Review ROOT dan validasi lanjutan — 7 Oktober 2026

Resume tidak mengulang implementasi billing. Build gabungan awal dan 221 unit lulus; E2E awal menemukan delapan kegagalan desktop/mobile pada selector status ambigu (output timer mempunyai role status) dan label filter select yang menyertakan teks opsi. ROOT memberi aria-label eksplisit pada kontrol search/status dan mempersempit locator notifikasi ke paragraf role status. Tidak menghapus assertion no-provider, expired atau entitlement. Build setelah integrasi GST/SEO serta 227 unit lulus; hasil browser final dicatat di dokumen QA 10. Penilaian fidelity PNG billing tetap belum dilakukan pada sesi resume karena viewer tidak mendukung gambar.
