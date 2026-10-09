# Handoff Design System Menuju Akad

## Sumber rancangan

[Sumber design system lengkap](../../menujuakad-rancangan/docs/design-system.md) berada di folder rancangan. Dokumen ini hanya menjelaskan pemakaiannya pada implementasi; token dan riwayat desain tidak diduplikasi di sini.

Gunakan [brief web aktif](../../menujuakad-rancangan/docs/11-uiux-prompt-stitch-web.txt), [pustaka SVG](../../menujuakad-rancangan/docs/12-uiux-aset-svg.txt), dan `../../menujuakad-rancangan/docs/assets/ivory-gold/` sebagai bahan handoff. Arahan aktif adalah Stitch **Editorial Ivory & Gold**, dengan **Noto Serif** untuk display dan **Manrope** untuk UI/body. Snapshot token lengkap berada pada sumber design system rancangan. Brief tema sebelumnya dan pratinjau Cormorant merupakan riwayat.

## Status implementasi

Menurut [laporan fullstack 06](06-fullstack-slicing.md), Noto Serif dan Manrope kini berupa tujuh TTF lokal beserta lisensi/checksum; token/styles dipetakan ke Editorial Ivory & Gold. CSS dibagi per tanggung jawab. Floral yang dipakai berasal dari aset pilihan user; media foto/video/audio belum tersedia sebagai aset final dan memakai ilustrasi/placeholder berlabel. Kode UI nyata mencakup **43 kode/52 varian**; **10 kode/12 varian** specialist masih stub pada resolver snapshot checkpoint.

Gate awal fullstack 209 unit test/18 E2E lulus; refinemen terakhir melaporkan 211 unit test/typecheck/lint. Fix QA-FS-01/03/04 dan SEC-INT-01, integrasi specialist, SEO serta gate/visual final masih berjalan. Viewer fullstack tidak mendukung gambar; handoff tekstual UI/UX/QA dipakai, sementara QA melihat komposisi seluruh 62 PNG melalui contact sheet. Ini tidak membuktikan seluruh React identik dengan Stitch.

Slicing/publikasi sudah diizinkan; hasil aktual dan langkah berikutnya berada pada [rencana PM](03-pm-rencana-slicing.md) serta [progres bersama](../../menujuakad-rancangan/docs/00-progres-proyek.md). Token/font lokal tersedia tidak menyatakan auth/DB/payment/provider atau produksi aktif.

## Sumber slicing terpilih: Stitch — 7 Oktober 2026

Sumber aktif tetap **MENUJU-AKAD-UIUX**, project ID `12559574101879777472`, design system **Editorial Ivory & Gold**, `assets/45753e5cf13241a99242f6592f667257`, versi `1`. Snapshot terbaru memuat **64 desain/varian, 53 kode unik, 62 PNG resolusi penuh valid dan 0 HTML desain valid**, seperti [inventaris UI/UX](01-uiux-inventaris.md) dan [manifest sumber](../../menujuakad-rancangan/docs/assets/stitch/manifest.json). Respons HTML adalah login Google, bukan markup Menuju Akad. Gunakan PNG valid dan token, bukan halaman login.

Dari 44 kode inti brief, 42 memiliki metadata; CUS-05/06 belum ditemukan. Desktop CUS-01/02 hanya metadata; CUS-01 mobile/tablet tersedia. Inventaris UI/UX membaca 16 sampel; QA kemudian melihat komposisi seluruh 62 PNG melalui contact sheet, dengan keterbatasan copy mikro. Fidelity hasil React semua state/perangkat belum terverifikasi. Pelaksana membuka sumber setiap layar dan mencatat rekonstruksi/gap sebelum mengklaim fidelity.

User telah memberi izin eksplisit melanjutkan slicing seluruh UI/UX yang tersedia dan publikasi menujuakad.com, menggantikan batas brainstorming sebelumnya. Noto Serif display dan Manrope UI/body adalah keputusan aktif. Form auth hanya visual sampai provider nyata tersedia; actual customer/admin tetap denied. Preview lintas peran menggunakan fixture sintetis berlabel/noindex tanpa DB/provider/mutasi asli. Akses VPS dan pemeriksaan final masih diperlukan untuk membuktikan publikasi.

Perbandingan visual dilakukan pada render aplikasi terhadap screenshot valid serta token resmi; metadata/snapshot tidak membuktikan aksesibilitas atau fidelity final; ketersediaan font lokal dilaporkan report06 dan render final tetap diperiksa. Figma V4 tetap riwayat dengan context/screenshot belum berhasil diakses karena kuota Starter; tidak menghalangi sumber Stitch aktif. [Arsitektur aplikasi](architecture.md) menjelaskan batas modul, bukan bukti semua modul selesai.

## Penggunaan aset

Folder rancangan hanya menjadi sumber untuk pengembangan. Saat suatu aset benar-benar dipakai, salin aset tersebut ke `public/` aplikasi dan referensikan dari sana. Runtime, build, dan deployment tidak boleh bergantung pada folder rancangan di luar repository aplikasi. Jangan menyalin seluruh koleksi atau brief XML ke runtime.

Status, keputusan, dan langkah berikutnya dicatat pada [progres bersama](../../menujuakad-rancangan/docs/00-progres-proyek.md).
