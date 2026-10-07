# Audit dan Kontrak UI Tamu, RSVP, Ucapan, Hadiah, Analitik

Tanggal: 7 Oktober 2026. **Status: audit metadata/kontrak selesai; implementasi pending followup koordinator.** Worker tidak mengubah source, route, fixture, database, provider, deployment, progres bersama atau Git. Fullstack sedang mengerjakan fondasi. Dokumen ini menetapkan kontrak untuk integrasi berikutnya, bukan menyatakan keenam view telah tersedia.

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
