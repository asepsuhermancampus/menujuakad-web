# Panduan Agent — Menuju Akad

## Konteks dan sumber kebenaran

- Komunikasi dan dokumentasi menggunakan Bahasa Indonesia.
- Proyek aktif berada di `/home/ubuntu/menujuakad`. Jangan menganggap `MenujuAkad.com` atau `HariKita-Web` sebagai folder proyek ini; keduanya disebut pada panduan global, bukan target pekerjaan ini.
- Baca `MENUJU_AKAD_AGENT_MASTER_SPEC.txt` sebagai spesifikasi teknis dan produk utama. Jangan mengubahnya tanpa kebutuhan yang jelas.
- Desain Figma yang relevan menjadi acuan visual setelah frame benar-benar dapat diakses. Jangan mengarang hasil inspeksi Figma.
- Panduan role tersedia di `/home/ubuntu/.dev-tools/app-dev-template/roles/`.

## Protokol memulai dan melanjutkan

1. Baca `docs/00-progres-proyek.md`, `CHANGELOG.md`, dan dokumentasi terkait sebelum mengubah kode.
2. Periksa daftar file, konten yang sudah ada, serta status Git jika repository sudah diinisialisasi.
3. Kerjakan langkah pertama yang belum selesai pada daftar progres. Jangan mengulang scaffold atau membuat dokumen duplikat.
4. Buat satu increment yang dapat diuji. Kebutuhan layanan eksternal tidak menghalangi pekerjaan mandiri yang relevan.
5. Setelah validasi, perbarui progres, hasil pengujian, hambatan, keputusan, dan langkah berikutnya dalam dokumen yang sama.
6. Jangan menandai fitur selesai hanya karena tampilannya ada. Bedakan kode tersedia, teruji lokal, terhubung layanan, dan terverifikasi produksi.

## Arsitektur dan kualitas

- Next.js App Router, TypeScript strict, modular monolith berbasis fitur.
- `src/app` hanya routing, metadata, layout, boundary, dan komposisi halaman.
- UI → action/query → service → repository/integrasi → database/provider.
- Kode database, rahasia, dan provider berada di `src/server`, diberi `server-only`.
- Page ditargetkan kurang dari 120 baris, komponen/hook kurang dari 200, service kurang dari 300. Evaluasi pemecahan jika file mendekati 400 baris.
- Prisma **7**: URL migrasi berada di `prisma.config.ts`; runtime memakai adapter Neon dan `DATABASE_URL` pooled. Jangan mencampur konfigurasi v6/v7/v8.
- Tambahkan model dan direktori ketika domainnya dikerjakan, bukan seluruh struktur kosong sekaligus.
- Semua resource customer memerlukan pemeriksaan kepemilikan/membership di server; admin memerlukan SUPERADMIN dari sesi terverifikasi.
- Pembayaran hanya dipercaya setelah verifikasi provider di server. Nominal uang berupa integer IDR; webhook harus idempoten.
- Jangan menyimpan kredensial dalam kode, log, dokumentasi, atau ingatan proyek. `.env` diabaikan Git.
- Jangan menjalankan migrasi destruktif, `prisma db push` produksi, atau mengganti konfigurasi VPS tanpa inspeksi dan strategi pemulihan yang nyata.

## Validasi

- Jalankan pemeriksaan yang relevan: `npm run db:validate`, `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`.
- Untuk perubahan alur UI penting, jalankan `npm run test:e2e` setelah build dan lakukan inspeksi visual. Chromium perlu diinstal melalui `npx playwright install chromium`.
- Perubahan database memerlukan pemeriksaan migrasi dan pengujian terhadap database pengembangan sebelum penerapan ke layanan aktif.
- Catat keterbatasan validasi eksternal secara jujur; Figma tools tersedia tidak berarti desain tertentu sudah dibaca.

## Larangan dan konsistensi output

- Jangan menjalankan `codex exec` dalam terminal.
- Jangan menggunakan `rm -f`, `nohup`, proses background dengan `&`, atau `pkill`.
- Delegasi hanya jika diizinkan instruksi sesi. Worker tidak boleh menggunakan tool collaboration atau membuat worker lain.
- Ikuti nama file yang ditetapkan master spec. Dokumen tambahan bernomor menggunakan nomor berurutan tanpa duplikat.
- Satu dokumen memiliki satu judul utama; jangan menumpuk revisi atau section berulang.
