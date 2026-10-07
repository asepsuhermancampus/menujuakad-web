# Handoff Design System Menuju Akad

## Sumber rancangan

[Sumber design system lengkap](../../menujuakad-rancangan/docs/design-system.md) berada di folder rancangan. Dokumen ini hanya menjelaskan pemakaiannya pada implementasi; token dan riwayat desain tidak diduplikasi di sini.

Gunakan [brief web aktif](../../menujuakad-rancangan/docs/11-uiux-prompt-stitch-web.txt), [pustaka SVG](../../menujuakad-rancangan/docs/12-uiux-aset-svg.txt), dan `../../menujuakad-rancangan/docs/assets/ivory-gold/` sebagai bahan handoff. Arahan aktif adalah Stitch **Editorial Ivory & Gold**, dengan **Noto Serif** untuk display dan **Manrope** untuk UI/body. Snapshot token lengkap berada pada sumber design system rancangan. Brief tema sebelumnya dan pratinjau Cormorant merupakan riwayat.

## Status implementasi

Slicing frontend telah diizinkan user dan sedang dikerjakan mengikuti [rencana PM](03-pm-rencana-slicing.md). Fondasi existing bukan bukti seluruh token/font/komponen sudah diterapkan; hasil kode, pemeriksaan lokal, integrasi provider dan produksi dicatat terpisah pada [progres bersama](../../menujuakad-rancangan/docs/00-progres-proyek.md). Dokumen handoff ini tidak menyatakan implementasi atau fidelity final selesai.

## Sumber slicing terpilih: Stitch — 7 Oktober 2026

Sumber aktif tetap **MENUJU-AKAD-UIUX**, project ID `12559574101879777472`, design system **Editorial Ivory & Gold**, `assets/45753e5cf13241a99242f6592f667257`, versi `1`. Snapshot terbaru memuat **64 desain/varian, 53 kode unik, 62 PNG resolusi penuh valid dan 0 HTML desain valid**, seperti [inventaris UI/UX](01-uiux-inventaris.md) dan [manifest sumber](../../menujuakad-rancangan/docs/assets/stitch/manifest.json). Respons HTML adalah login Google, bukan markup Menuju Akad. Gunakan PNG valid dan token, bukan halaman login.

Dari 44 kode inti brief, 42 memiliki metadata; CUS-05/06 belum ditemukan. Desktop CUS-01/02 hanya metadata; CUS-01 mobile/tablet tersedia. Inspeksi inventaris 16 sampel tidak membuktikan seluruh state/perangkat telah ditinjau. Pelaksana membuka sumber setiap layar dan mencatat rekonstruksi/gap sebelum mengklaim fidelity.

User telah memberi izin eksplisit melanjutkan slicing seluruh UI/UX yang tersedia dan publikasi menujuakad.com, menggantikan batas brainstorming sebelumnya. Noto Serif display dan Manrope UI/body adalah keputusan aktif. Form auth hanya visual sampai provider nyata tersedia; actual customer/admin tetap denied. Preview lintas peran menggunakan fixture sintetis berlabel/noindex tanpa DB/provider/mutasi asli. Akses VPS dan pemeriksaan final masih diperlukan untuk membuktikan publikasi.

Perbandingan visual dilakukan pada render aplikasi terhadap screenshot valid serta token resmi; metadata/snapshot tidak membuktikan aksesibilitas atau font runtime. Figma V4 tetap riwayat dengan context/screenshot belum berhasil diakses karena kuota Starter; tidak menghalangi sumber Stitch aktif. [Arsitektur aplikasi](architecture.md) menjelaskan batas modul, bukan bukti semua modul selesai.

## Penggunaan aset

Folder rancangan hanya menjadi sumber untuk pengembangan. Saat suatu aset benar-benar dipakai, salin aset tersebut ke `public/` aplikasi dan referensikan dari sana. Runtime, build, dan deployment tidak boleh bergantung pada folder rancangan di luar repository aplikasi. Jangan menyalin seluruh koleksi atau brief XML ke runtime.

Status, keputusan, dan langkah berikutnya dicatat pada [progres bersama](../../menujuakad-rancangan/docs/00-progres-proyek.md).
