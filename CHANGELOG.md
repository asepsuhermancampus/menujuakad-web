# Changelog Implementasi Menuju Akad

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
