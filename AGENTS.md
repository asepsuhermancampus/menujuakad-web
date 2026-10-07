# Panduan Agent — Implementasi Menuju Akad

## Konteks dan sumber kebenaran

- Komunikasi dan dokumentasi menggunakan Bahasa Indonesia.
- Proyek implementasi aktif berada di `/home/ubuntu/menujuakad-web`. Folder `/home/ubuntu/menujuakad-rancangan` menyimpan rancangan, brief, aset sumber, dan ingatan proyek. Jangan menganggap `MenujuAkad.com` atau `HariKita-Web` sebagai folder proyek ini; keduanya disebut pada panduan global, bukan target pekerjaan ini.
- Baca `../menujuakad-rancangan/MENUJU_AKAD_AGENT_MASTER_SPEC.txt` sebagai spesifikasi teknis dan produk utama. Jangan mengubahnya tanpa kebutuhan yang jelas.
- Acuan visual aktif adalah proyek Stitch `MENUJU-AKAD-UIUX` (`12559574101879777472`), design system Editorial Ivory & Gold, dengan Noto Serif untuk display dan Manrope untuk UI/body, sesuai keputusan user 7 Oktober 2026. Snapshot token berada di `../menujuakad-rancangan/docs/design-system.md`. Figma V4 dan Cormorant adalah riwayat; jangan mengarang hasil inspeksi desain. User telah memberikan izin eksplisit pada 7 Oktober 2026 untuk melanjutkan slicing seluruh UI/UX Stitch yang tersedia dan publikasi ke `menujuakad.com`; izin ini menggantikan batas brainstorming sebelumnya. Cakupan aktif adalah frontend slicing, preview sintetis, pengujian dan rilis publik, bukan backend lengkap. Rencana pelaksanaan berada di `docs/03-pm-rencana-slicing.md`.
- Panduan role tersedia di `/home/ubuntu/.dev-tools/app-dev-template/roles/`.

## Protokol memulai dan melanjutkan

1. Baca `../menujuakad-rancangan/docs/00-progres-proyek.md`, `CHANGELOG.md`, `../menujuakad-rancangan/CHANGELOG.md`, dan dokumentasi terkait sebelum mengubah kode.
2. Periksa daftar file, konten yang sudah ada, serta status Git jika repository sudah diinisialisasi.
3. Kerjakan langkah pertama yang belum selesai pada daftar progres. Jangan mengulang scaffold atau membuat dokumen duplikat.
4. Buat satu increment yang dapat diuji. Kebutuhan layanan eksternal tidak menghalangi pekerjaan mandiri yang relevan.
5. Setelah validasi, perbarui progres, hasil pengujian, hambatan, keputusan, dan langkah berikutnya dalam dokumen yang sama.
6. Jangan menandai fitur selesai hanya karena tampilannya ada. Bedakan kode tersedia, teruji lokal, terhubung layanan, dan terverifikasi produksi.

## Batas folder dan dokumentasi

- Jalankan perintah aplikasi dari `/home/ubuntu/menujuakad-web`. Jangan membuat scaffold ulang.
- Master spec, dokumen bernomor 00–12, seluruh brief Stitch, design system lengkap, dan aset sumber tetap di `../menujuakad-rancangan`. Jangan menduplikasi sumber tersebut.
- Perbarui progres bersama di `../menujuakad-rancangan/docs/00-progres-proyek.md`. Catat perubahan aplikasi pada `CHANGELOG.md` di folder ini; perubahan rancangan pada `../menujuakad-rancangan/CHANGELOG.md`.
- Dokumentasi teknis aplikasi berada di `docs/`; `docs/design-system.md` menjadi panduan handoff menuju sumber rancangan.
- Git aplikasi mempertahankan riwayat sebelumnya; remote `origin` kini `https://github.com/asepsuhermancampus/menujuakad-web.git`, dengan branch utama `main`. Folder rancangan memiliki repositori lokal sendiri tanpa remote. Jangan menganggap rancangan eksternal ikut dalam commit aplikasi.
- Tautan antarfolder hanya untuk dokumentasi; kode runtime dan build tidak boleh mengimpor berkas dari folder rancangan. Salin hanya aset yang benar-benar dipakai ke `public/` saat implementasi fiturnya.

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

## Standar pengembangan yang ditegaskan user — 7 Oktober 2026

- Terapkan standar senior engineer dengan mempertimbangkan arsitektur, UI/UX, keamanan, database, pembayaran, QA, dan operasional sesuai domain yang dikerjakan. Sebutan role tidak berarti review atau pengujian sudah dilakukan.
- Satu modul memiliki satu tanggung jawab. Pisahkan presentasi, interaksi/hook, validasi, aturan bisnis, akses data, dan integrasi. Saat fitur berkembang, ekstrak bagian yang memiliki fungsi jelas; jangan terus menumpuk revisi di satu file.
- Gunakan kembali primitive, layout, dan logika domain yang benar-benar sama. Hindari komponen universal dengan banyak flag, utility campuran, ketergantungan melingkar, serta pemecahan file yang tidak memberi batas tanggung jawab berguna.
- Pisahkan area publik, customer, dan superadmin: routing, shell/navigation, komponen khusus peran, serta entry point action/query. Aturan bisnis yang sama dapat dibagi melalui service domain; akses customer dan SUPERADMIN tetap diverifikasi di server pada setiap operasi terlindungi.
- Bedakan customer sebagai peran pengguna dari Client Component sebagai mode eksekusi React. Gunakan Server Component secara default dan tempatkan `use client` pada komponen interaktif yang memerlukannya; hook UI tidak mengakses rahasia atau repository.
- Konfigurasi publik berada di `src/config`, konfigurasi rahasia di modul server yang tervalidasi. Jangan mengirim rahasia melalui `NEXT_PUBLIC_*`, props, respons API, log, dokumentasi, fixture, screenshot, `public/`, commit, atau push. `.env.example` hanya memuat nama variabel dan placeholder aman; periksa diff yang akan dipublikasikan.
- Nama file mengikuti konvensi yang sudah ada; dokumentasi Bahasa Indonesia menjelaskan tanggung jawab modul, kontrak input/output, batas izin, cara menjalankan, hasil validasi, dan keterbatasan. Komentar menjelaskan alasan keputusan yang tidak jelas dari kode.
- Catat hasil dan status terpisah: rancangan, kode tersedia, teruji lokal, terhubung layanan, terverifikasi produksi. Ikuti usulan struktur dan pembagian fungsi dalam `docs/architecture.md` setelah disetujui user.
- Instruksi aktif: slicing frontend seluruh layar UI/UX Stitch yang tersedia serta publikasi `menujuakad.com` sudah diizinkan user. Jangan meminta izin slicing ulang. Pertahankan scaffold dan dependency existing; tambah hanya yang diperlukan cakupan ini. Neon/auth/Mayar belum tersedia; jangan mengklaim backend atau integrasi aktif.
- Rute aktual `/dashboard` dan `/admin` wajib menolak/redirect login sampai sesi terverifikasi nyata tersedia. `/preview-ui/*` boleh menampilkan UI lintas peran hanya dengan whitelist fixture sintetis, label data contoh dan noindex; tanpa akses DB/provider/mutasi asli. Form Google/auth visual, harga contoh dan QRIS tidak dianggap autentikasi atau pembayaran komersial nyata.
- Deployment menunggu hasil build/test/visual final dan akses VPS tujuan terverifikasi yang sudah diminta; ini hambatan akses, bukan izin yang belum diberikan. DNS apex `172.104.187.4` dan www sudah sesuai audit; workspace ber-IP keluar `43.173.15.136` tidak boleh diasumsikan VPS target. Layanan/proxy/DNS existing hanya diubah setelah inspeksi, backup dan rencana pemulihan.

## Larangan dan konsistensi output

- Jangan menjalankan `codex exec` dalam terminal.
- Jangan menggunakan `rm -f`, `nohup`, proses background dengan `&`, atau `pkill`.
- Delegasi hanya jika diizinkan instruksi sesi. Worker tidak boleh menggunakan tool collaboration atau membuat worker lain.
- Ikuti nama file yang ditetapkan master spec. Dokumen tambahan bernomor menggunakan nomor berurutan tanpa duplikat.
- Satu dokumen memiliki satu judul utama; jangan menumpuk revisi atau section berulang.
