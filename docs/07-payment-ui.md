# Audit dan Kontrak UI Pembayaran Menuju Akad

Tanggal: 7 Oktober 2026. **Status: audit sumber dan kontrak komponen tersedia; implementasi pending giliran ROOT.** Scope worker ini hanya laporan 07. Tidak mengubah source saat fullstack aktif, tidak melakukan commit, migrasi, transaksi, aktivasi paket, retry webhook atau deployment.

## Sumber dan batas inspeksi

Dibaca: role payment-specialist, AGENTS, master spec, progres/changelog kedua folder, rencana 03, inventaris 01, kontrak 05, snapshot token dan `billing-fixtures.ts`. File 07 belum ada saat resume sehingga laporan ini dibuat tanpa mengulang deliverable sebelumnya. DTO billing sudah tersedia; tidak membuat ulang data atau schema.

Kelima PNG di manifest berhasil didekode dan dimensinya cocok. Pemanggilan `view_image` ditolak karena model worker tidak mendukung input gambar. Sebagai pengganti parsial, Tesseract 5.3.4 dijalankan lokal terhadap PNG penuh; ekstraksi teks dan koordinat selesai pada seluruh sumber. Binary/dependency OCR hanya diekstrak ke `/tmp/menujuakad-payment-ocr`, tanpa instalasi global atau perubahan dependency aplikasi. PNG asli tidak diubah. **Audit ini bukan inspeksi visual langsung atau bukti fidelity**; komposisi di bawah diperoleh dari posisi teks OCR, ditambah hasil inspeksi langsung worker UI/UX untuk CUS-08 default dan ADM-01. OCR dapat salah membaca karakter/ikon dan tidak membuktikan font, spacing atau warna hasil render. QA perlu membandingkan tampilan akhir dengan PNG menggunakan penampil yang mendukung gambar.

| Kode/state     | ID Stitch                          | Dimensi PNG | Bukti audit                                                      |
| -------------- | ---------------------------------- | ----------- | ---------------------------------------------------------------- |
| CUS-07 Default | `3ecacc9efc524ae2934bcb75337abf35` | 2560 × 7154 | Decode/OCR/posisi teks; visual langsung belum                    |
| CUS-08 Default | `b6693cee4ed7403c93340c99927c3e40` | 2560 × 3234 | Decode/OCR; komposisi langsung sebelumnya tercatat inventaris 01 |
| CUS-08 Expired | `741bf2dc293243f29a02bea0b8546ed6` | 2560 × 2632 | Decode/OCR/posisi teks; visual langsung belum                    |
| ADM-01 Default | `72c3e194242f46c5826dbf91aa321b62` | 2560 × 2946 | Decode/OCR; komposisi langsung sebelumnya tercatat inventaris 01 |
| ADM-02 Default | `2a62b424023f49a2b70102b70be5bbfc` | 2560 × 4094 | Decode/OCR/posisi teks; visual langsung belum                    |

Sumber berada di [manifest rancangan](../../menujuakad-rancangan/docs/assets/stitch/manifest.json); nama PNG mengikuti `<code-lowercase>-<id>.png`. Tidak ada HTML desain valid; respons login Google tidak dipakai sebagai markup. Tidak memindahkan screenshot penuh ke runtime/public dan tidak mengubah flag `visual_inspected` manifest dari hasil OCR.

## Komposisi layar dan keputusan slicing

**CUS-07 Paket & Fitur.** Urutan teks menunjukkan breadcrumb/header undangan, sidebar customer, heading pilihan paket/masa aktif, penjelasan pembayaran, tiga kolom paket, matriks komparasi berkelompok, FAQ penerbitan, blok bantuan dan footer. Posisi label tiga paket pada y≈1136 masing-masing x≈660/1452/2077 mendukung komposisi tiga kolom setelah sidebar. Matriks fitur muncul setelah kartu, bukan digabung menjadi satu daftar panjang di dalam kartu. Screenshot menyebut Draf Eksplorasi gratis, Maharani Rp249.000 dan Royal Matrimony Rp499.000; label akses selamanya berdampingan dengan masa aktif 12 bulan. Tidak menganggapnya kebijakan komersial final.

Implementasi mendatang: `PackageSelectionPreview` dengan kartu reusable, highlight rekomendasi, selected state lokal, komparasi dan FAQ. Gunakan Essential/Signature/Premium dari fixture, harga contoh Rp99.000/Rp149.000/Rp249.000, kuota contoh 150/300/500 tamu dan 10/20/40 foto. Tombol “Pilih contoh paket” hanya mengubah pilihan/ringkasan lokal; tidak memberi entitlement atau menavigasi ke tagihan paket yang salah. Jika tautan checkout ditampilkan, jelaskan bahwa checkout ilustratif tetap memakai Signature; jangan meneruskan query harga/order baru atau mengklaim checkout mengikuti pilihan tanpa kontrak fixture yang konsisten.

**CUS-08 Default.** Dua kolom: pemilihan kanal, deadline, area QR dan instruksi di kiri; ringkasan paket/order/nominal di kanan. OCR menempatkan judul pembayaran x≈469 dan ringkasan x≈1595, sesuai inspeksi 01. Ada metode QRIS, VA, kartu, field promo dan tombol cek status. Sumber menyebut Rp249.000, waktu 14:56 menit, merchant/NMID, kupon diskon 0%, PPN11%, siap diterbitkan dan aktivasi ≤60 detik. Semua merupakan copy desain yang belum dibuktikan layanan.

Implementasi mendatang: pilihan metode berlabel “Contoh tampilan”; area instrumen berupa placeholder polos bertuliskan “Pembayaran belum aktif — tidak ada kode untuk dipindai”, tanpa pola QR yang bisa dipakai, tanpa NMID/rekening/payment URL dan tanpa salin/simpan QR. Ringkasan memakai `order.amountIdr`, nama paket dicari dari `packageId`; total tidak dihitung ulang dari copy screenshot. Promo visual dapat menampilkan pesan lokal “Validasi promo belum tersedia”, tanpa diskon fiktif. Tombol “Lihat status contoh” membaca DTO yang sama dan menampilkan pemberitahuan lokal; tidak menetapkan PAID, menjalankan polling, menghubungi gateway atau menyatakan undangan aktif.

**CUS-08 Expired.** Banner sesi berakhir di atas; metode/area QR di kiri, faktur dan total tagihan tertutup di kanan; timer 00:00:00, informasi jangan transfer, bantuan jika dana terpotong, tindakan kembali/ganti metode. Header ringkasan terdeteksi x≈1577 dan metode x≈148. Sumber expired menyebut Rp499.000 sehingga berbeda dari default Rp249.000 dan berbeda dari fixture Rp149.000. Ini dua referensi state, bukan bukti order yang sama berubah nominal.

Implementasi mendatang: expired order memakai fixture dedicated, label “Kedaluwarsa (contoh)”, placeholder instrumen nonaktif dan nominal DTO. Tombol “Lihat contoh checkout” dapat mengganti tampilan lokal dengan pending fixture yang sudah ada; teks harus menyatakan contoh lain, bukan menerbitkan ulang tagihan. Kembali paket menuju `/preview-ui/cus-07`; tidak menaut ke dashboard private sebagai alur preview. Tidak menampilkan bantuan WhatsApp/email fiktif atau jaminan saldo 100% sebagai layanan tersedia.

**ADM-01 Monitoring Pembayaran.** Shell SUPERADMIN berbeda dari customer; judul/breadcrumb, empat metric, filter/search, tabel order berstatus, aksi detail, pagination dan panel tautan rekonsiliasi. Sumber tabel mengandung provider, entitlement, metode, waktu, nominal, pasangan dan transaksi; hanya field yang ada pada DTO boleh ditampilkan sebagai data. Sumber menyebut Midtrans/Xendit, gateway normal, PAID terverifikasi, paket otomatis aktif, latensi120ms, sukses99.98%, TLS/ISO27001.

Implementasi mendatang: metric dihitung dari empat order contoh, satu per status; total PAID contoh Rp149.000, bukan total Rp596.000 dari seluruh order. Label “Nilai order dibayar (contoh)” tidak menyatakan settlement atau kas diterima. Filter status dan search ID; tabel detail menampilkan status contoh, nominal integer terformat, waktu contoh, packageId dan invitationId sintetis. Entitlement diganti “Tidak diterbitkan oleh preview” untuk seluruh baris, termasuk PAID. Provider “Belum terhubung”; jangan mengarang merchant/method/signature/verifiedAt dari DTO. Panel menuju `/preview-ui/adm-02`, tanpa sinkronisasi provider atau ekspor data personal.

**ADM-02 Rekonsiliasi Webhook.** Urutan OCR: header admin, judul/keterangan, aksi retry/ping, empat metric, filter, arsip event kiri dan panel inspeksi kanan, pagination, audit langkah/idempotensi. Label PAYLOAD x≈1797 y≈1435 dan PROCESSED x≈1038 y≈1648 mendukung panel kanan sejajar tabel event. Sumber menampilkan payload JSON mentah, signature/header, endpoint Midtrans, hash SHA-512, IP, latensi, audit mutasi PAID dan pemberian entitlement, polling5s serta klaim ISO.

Implementasi mendatang: `AdminWebhooksPreview` menampilkan tiga event sintetis PROCESSED/DUPLICATE/FAILED dari DTO; metric 3 total/1 diproses/1 duplikat/1 gagal. Panel detail menerima selected event dan hanya memperlihatkan ID, orderId, eventType, status, attempts, receivedAt, summary; tidak raw payload/signature/header/IP/token/server key. Panel berjudul “Detail event contoh”. Retry berupa “Simulasikan tampilan retry”: pesan lokal yang eksplisit tanpa request, tanpa mengganti FAILED menjadi PROCESSED atau menambah attempts yang lalu terkesan hasil provider. Tidak ada ping/stream/polling hidup. Status DUPLICATE tidak menambah total order paid/entitlement.

## Kontrak export dan batas file

Import DTO/fixture dari `@/features/design-preview/data/fixtures`. Komponen billing merupakan konten halaman; fullstack memberi `CustomerShell`/`AdminShell` serta banner/noindex preview. Billing tidak membuat routing/auth/session atau shell paralel. Empat export berikut dikunci sebagai antarmuka implementasi mendatang:

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

| Direktori/file mendatang                                              | Tanggung jawab                                              |
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
| `presentation.ts`, `presentation.test.ts`                             | Formatter/selector status, deadline dan agregasi murni      |
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

## Rencana pengujian implementasi

Pengujian ini **belum dijalankan** karena source billing belum dibuat dan worker tidak mengambil ownership fullstack. Hanya decode/OCR/schema DTO serta konsistensi path dokumen diperiksa pada audit.

1. Unit selector: status EXPIRED dan deadline lewat tidak pernah tampil aktif; `initialExpired=false` tidak menghidupkan order expired; PAID/FAILED tetap semantik record. Timestamp invalid menghasilkan state tidak dapat dihitung tanpa NaN/timer negatif.
2. Unit agregasi: filter status/search menghasilkan ID yang tepat; nilai PAID contoh hanya149000, bukan penjumlahan semua order; metric event3/1/1/1; duplikat tidak menambah settlement/entitlement.
3. UI/browser: pilihan metode keyboard/focus, pilihan paket/ringkasan lokal, empty search, detail event aman; tombol cek status tidak mengubah PAID, retry tidak mengubah status/attempts provider.
4. Capture request browser: setelah halaman siap, aksi pilih/cek/retry tidak POST/fetch/payment/ping/polling provider, tidak perubahan session/storage entitlement. RSC/navigasi internal dibedakan dari request provider.
5. DOM/content: label data/harga/jam contoh tetap terlihat; tidak ada QR SVG/canvas/IMG instrumen, rekening/NMID/link bayar/signature/payload token; PAID baris menyatakan contoh dan entitlement tidak diterbitkan.
6. Responsif320px/keyboard/zoom200%: kartu stack, ringkasan reflow, tabel mempunyai container horizontal berlabel bila perlu; tidak body overflow atau aksi detail yang hilang. Bandingkan kelima state dengan sumber melalui penampil gambar yang berfungsi; catat adaptasi harga/copy secara sengaja.
7. Setelah source integrated: typecheck/lint/test/build/E2E yang relevan; pemeriksaan route dashboard/admin tetap denied dan preview noindex tetap tugas integrasi security/fullstack/QA. Tidak menyatakan produksi verified sebelum deployment/probe nyata.

## Handoff dan langkah berikutnya

Audit ini menuntaskan kontrak laporan 07. **Implementasi billing, unit/UI tests dan fidelity final masih pending followup ROOT** setelah implementer fullstack selesai; jangan membaca status laporan sebagai source sudah tersedia. Tidak ada backend/auth/Mayar aktif maupun pembayaran/entitlement/produksi terverifikasi. Shared progres/changelog tetap diperbarui koordinator, bukan worker scope laporan ini.
