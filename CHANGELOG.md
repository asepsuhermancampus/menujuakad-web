# Changelog Implementasi Menuju Akad

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
