# Handoff Design System Menuju Akad

## Sumber rancangan

[Sumber design system lengkap](../../menujuakad-rancangan/docs/design-system.md) berada di folder rancangan. Dokumen ini hanya menjelaskan pemakaiannya pada implementasi; token dan riwayat desain tidak diduplikasi di sini.

## Tema aktif: Luminous Aura Minimal — "Horizon Modern Style" (10 Oktober 2026)

User me-refactor seluruh proyek Stitch `MENUJU-AKAD-UIUX` ke tema baru pada 10 Oktober 2026. Seluruh **51 layar** kini berjudul "— Horizon Modern Style" dan memakai design system **Luminous Aura Minimal** (`assets/843c886398d54e628035654c638f4515`, versi 1). Design system **Editorial Ivory & Gold** dan font **Noto Serif + Manrope** adalah riwayat; jangan dipakai untuk pekerjaan baru.

Ringkasan perubahan tema:

| Aspek         | Sebelum (Ivory & Gold)               | Sesudah (Luminous Aura Minimal)                    |
| ------------- | ------------------------------------ | -------------------------------------------------- |
| Font          | Noto Serif (display) + Manrope (UI)  | **Plus Jakarta Sans** (satu keluarga, 400–800)     |
| Primary       | Gold `#C5A46D`                       | **Violet `#5F3ADD`** (hover `#7857F8`)             |
| Secondary     | —                                    | **Peach `#FD8863`**                                |
| Tertiary      | —                                    | **Sky `#2676C8`**                                  |
| Canvas        | Ivory `#F8F6F1`                      | **Lavender `#FAF8FF`**                             |
| Teks          | Black `#171717` / Charcoal `#292929` | **Slate `#131B2E`** / `#484555`                    |
| Border        | Warm Beige `#E5DED3`                 | **`#DAE2FD` / `#C9C4D8`**                          |
| Radius tombol | 6px                                  | **999px (pill)**                                   |
| Radius kartu  | 10px                                 | **24px** (panel besar 32px, modal 40px)            |
| Depth         | Shadow tunggal ringan                | **Shadow berlapis tint violet** + frosted glass    |
| Dekorasi      | Floral opsional terbatas             | **Aura mesh gradients** (lavender/dawn/sky radial) |
| Ikon          | Lucide outline                       | Material Symbols Outlined (di sumber Stitch)       |

Karakter brand baru: _quiet luxury, intentional stillness, structured confidence_ — kanvas breathable, tipografi immaculate, frosted glass plane, aura glow kromatik. Larangan lama tetap berlaku: tanpa foil metalik, wreath botanikal, glitter, atau script calligraphy.

## Status implementasi

Token dan primitives di `src/app/styles/` sudah dipindahkan ke Luminous Aura Minimal:

- `tokens.css` — lima @font-face Plus Jakarta Sans (TTF lokal + lisensi OFL di `public/fonts/`), palet lengkap, radius baru, shadow berlapis, frosted-glass, dan tiga aura gradient.
- `base.css` — satu keluarga font untuk heading/body, weight 600 untuk heading dengan tracking rapat, aura mesh di `body`, focus ring violet.
- `primitives.css` — tombol pill (primary violet, secondary frosted glass), kartu radius 24px, input radius 14px dengan focus halo violet, badge pill.

Nama variabel lama (`--color-gold`, `--color-paper`, `--color-ink`, `--font-editorial`, dst.) **dipertahankan sebagai alias semantik** sehingga seluruh komponen existing ikut berpindah tema tanpa menyentuh setiap file. Artinya `var(--color-gold)` kini bernilai violet; jangan mengandalkan namanya untuk menebak warnanya.

Media foto/video/audio belum tersedia sebagai aset final dan memakai ilustrasi/placeholder berlabel. Viewer fullstack tidak mendukung gambar; handoff tekstual UI/UX/QA dipakai. Ini tidak membuktikan seluruh React identik dengan Stitch.

Slicing/publikasi sudah diizinkan; hasil aktual dan langkah berikutnya berada pada [rencana PM](03-pm-rencana-slicing.md) serta [progres bersama](../../menujuakad-rancangan/docs/00-progres-proyek.md). Token/font lokal tersedia tidak menyatakan auth/DB/payment/provider atau produksi aktif.

## Sumber slicing terpilih: Stitch — 10 Oktober 2026

Sumber aktif **MENUJU-AKAD-UIUX**, project ID `12559574101879777472`, design system **Luminous Aura Minimal**, `assets/843c886398d54e628035654c638f4515`, versi `1`.

Snapshot 10 Oktober 2026: **56 layar**, terdiri atas 51 layar berjudul "Horizon Modern Style" (44 layar inti lama + 12 section editor EDT-09…20 yang baru digambar), 3 varian state INV-02, satu modal ADM-02, dan satu lampiran gambar. Rentang kode yang tersedia: PUB-01…05, AUT-01…06, CUS-01…08, EDT-01…20, GST-01…06, INV-01…02, ACC-01…02, SUP-01, ADM-01…02. HTML tiap layar dapat diunduh dari `htmlCode.downloadUrl` dan memuat konfigurasi Tailwind lengkap (palet + radius + font) sebagai acuan implementasi.

Yang **belum** ada di Stitch dan menjadi target gelombang berikutnya: 17 layar modul perencanaan (PLN-01…17) dan 7 layar admin operasional (ADM-03…09) — seluruhnya sudah ditulis pada `../menujuakad-rancangan/docs/13-uiux-prompt-stitch-gelombang2.txt` yang kini diselaraskan ke Luminous Aura Minimal.

User telah memberi izin eksplisit melanjutkan slicing seluruh UI/UX yang tersedia dan publikasi menujuakad.com. Form auth hanya visual sampai provider nyata tersedia; actual customer/admin tetap denied. Preview lintas peran menggunakan fixture sintetis berlabel/noindex tanpa DB/provider/mutasi asli.

## Penggunaan aset

Folder rancangan hanya menjadi sumber untuk pengembangan. Saat suatu aset benar-benar dipakai, salin aset tersebut ke `public/` aplikasi dan referensikan dari sana. Runtime, build, dan deployment tidak boleh bergantung pada folder rancangan di luar repository aplikasi. Jangan menyalin seluruh koleksi atau brief XML ke runtime.

Status, keputusan, dan langkah berikutnya dicatat pada [progres bersama](../../menujuakad-rancangan/docs/00-progres-proyek.md).
