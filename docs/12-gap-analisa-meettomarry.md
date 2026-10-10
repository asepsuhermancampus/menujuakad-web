# Gap Analysis & Rencana Implementasi — Modul Perencanaan (Benchmark Meet to Marry)

## Ringkasan keputusan

User (10 Oktober 2026) meminta seluruh menu Meet to Marry yang belum ada di Menuju Akad
diterapkan, beserta prompt Stitch untuk desainnya. Dokumen ini mencatat hasil perbandingan,
keputusan produk, urutan implementasi, dan batas kejujuran status.

Sumber benchmark: `../meettomarry-analysis/LAPORAN_LENGKAP_MEET_TO_MARRY.md` (analisa statis
`app-meettomarry.com`, 7 Oktober 2026). Benchmark adalah **wedding planner**; Menuju Akad adalah
**platform undangan digital**. Penambahan modul di bawah mengubah positioning menjadi
platform pernikahan all-in-one, sesuai keputusan user.

## Hasil perbandingan

### Dashboard client — 14 menu benchmark yang belum ada

| #   | Modul benchmark                                  | Keputusan                       | Kode fitur                   |
| --- | ------------------------------------------------ | ------------------------------- | ---------------------------- |
| 1   | Tabungan (multi rekening, target dana, transfer) | Terapkan                        | `savings`                    |
| 2   | Budgeting (kategori, alokasi, budget vs aktual)  | Terapkan                        | `budget`                     |
| 3   | Pengeluaran (auto potong saldo & aktual)         | Terapkan                        | `expenses`                   |
| 4   | Tugas (checklist, PIC, deadline, progress)       | Terapkan                        | `tasks`                      |
| 5   | Rundown (timeline per jam, export)               | Terapkan                        | `rundown`                    |
| 6   | Vendor (CRUD + tracking pembayaran)              | Terapkan                        | `vendors`                    |
| 7   | Marketplace vendor (518 lokasi, filter budget)   | Terapkan sebagai katalog contoh | `vendors`                    |
| 8   | Seserahan (item, harga, status, link beli)       | Terapkan                        | `seserahan`                  |
| 9   | Lamaran (workspace terpisah)                     | Terapkan sebagai eventType      | `engagement`                 |
| 10  | Persyaratan Nikah (checklist dokumen + upload)   | Terapkan                        | `requirements`               |
| 11  | Moodboard (board, pencarian, simpan)             | Terapkan sebagai papan contoh   | `moodboard`                  |
| 12  | Wedding Kit (katalog produk digital)             | Terapkan sebagai katalog contoh | `wedding-kit`                |
| 13  | Invite pasangan (2 akun per workspace)           | Terapkan                        | `couple-invite`              |
| 14  | Onboarding wizard + Pengumuman                   | Terapkan                        | `onboarding`, `announcement` |

### Dashboard superadmin — 6 menu benchmark yang belum ada

| #   | Modul benchmark                                      | Keputusan | Catatan                                                  |
| --- | ---------------------------------------------------- | --------- | -------------------------------------------------------- |
| 1   | Kelola user penuh (hapus, aktivasi lifetime, bulk)   | Terapkan  | Wajib audit trail                                        |
| 2   | Approve upgrade + email                              | Terapkan  | Tanpa provider email nyata: antrian + tanda "siap kirim" |
| 3   | Reset akses (kembali unpaid)                         | Terapkan  | Wajib audit trail                                        |
| 4   | Kelola konten (brand/landing/pricing/FAQ/pengumuman) | Terapkan  | Publikasi eksplisit                                      |
| 5   | Kelola QRIS & rekening                               | Terapkan  | QR contoh diberi label                                   |
| 6   | Preview landing draft                                | Terapkan  | Tanpa indeks, khusus superadmin                          |

## Keputusan produk yang mengikat

1. **Event type**: setiap modul perencanaan mendukung `WEDDING` dan `ENGAGEMENT`. Lamaran
   bukan aplikasi terpisah, tetapi konteks `eventType` yang difilter di semua modul.
2. **Workspace pasangan**: `WeddingWorkspace` menjadi pemilik data perencanaan. Undangan
   tetap milik `Invitation` dengan `ownerUserId`; workspace menautkan maksimal 2 anggota.
3. **Uang**: integer IDR, konsisten dengan schema existing. Tidak ada float.
4. **Batas kejujuran**: modul baru dibangun bertahap dengan status eksplisit —
   `kode tersedia` → `teruji lokal` → `terhubung layanan` → `terverifikasi produksi`.
   Selama backend belum aktif, UI memakai pola `PreviewOnlyFeature` dengan fixture sintetis.
5. **Keamanan**: semua resource customer diperiksa kepemilikan di server; aksi admin wajib
   sesi SUPERADMIN terverifikasi + audit trail untuk aksi destruktif.
6. **Marketplace vendor & moodboard**: katalog contoh dengan data sintetis; pencarian nyata
   menunggu sumber data pihak ketiga dan keputusan komersial.
7. **Wedding Kit**: katalog + alur order contoh; pembayaran nyata menunggu Mayar.

## Urutan implementasi (increment)

| Increment | Isi                                                                       | Dependency    |
| --------- | ------------------------------------------------------------------------- | ------------- |
| P1        | Schema perencanaan (workspace, savings, budget, expenses, tasks, rundown) | -             |
| P2        | UI Tabungan + Budgeting + Pengeluaran                                     | P1            |
| P3        | UI Tugas + Rundown                                                        | P1            |
| P4        | Vendor + marketplace contoh                                               | P1            |
| P5        | Seserahan + Persyaratan Nikah                                             | P1            |
| P6        | Lamaran (eventType switch) + Onboarding + Invite pasangan                 | P1            |
| P7        | Moodboard + Wedding Kit (katalog contoh)                                  | P1            |
| P8        | Pengumuman + admin konten                                                 | -             |
| P9        | Admin: kelola user penuh, approve upgrade, reset akses, QRIS/rekening     | auth existing |
| P10       | Validasi penuh (typecheck/lint/test/build/E2E) + dokumentasi              | semua         |

Setiap increment selesai dengan validasi dan pembaruan progres; tidak ada klaim fitur selesai
hanya karena UI tampil.

## Batas yang tidak boleh dilanggar

- Tidak menambah provider (email, storage, payment) tanpa konfigurasi dan verifikasi nyata.
- Tidak menyimpan kredensial atau data PII sintetis berlebihan di fixture.
- Tidak mencampur konfigurasi Prisma v6/v7.
- Tidak menghapus atau mengubah data produksi tanpa strategi pemulihan.
- Aksi destruktif admin wajib konfirmasi + audit trail.

## Referensi desain

Prompt Stitch gelombang 2 untuk seluruh modul baru: lihat
`../menujuakad-rancangan/docs/13-uiux-prompt-stitch-gelombang2.txt`. Prompt memakai RULESET
Ivory & Gold aktif (Noto Serif + Manrope, token `docs/design-system.md`) tanpa menambah warna,
font, atau dekorasi baru.
