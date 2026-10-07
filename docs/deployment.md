# Deployment VPS Menuju Akad

## Izin, lingkup rilis dan status

User telah memberikan izin eksplisit pada 7 Oktober 2026 untuk slicing UI/UX Stitch yang tersedia dan publikasi `https://menujuakad.com`. Persiapan dan rilis dilanjutkan sesuai [rencana PM](03-pm-rencana-slicing.md), tanpa meminta ulang izin slicing/deploy. [Audit DevOps dan prosedur rinci](02-devops-deployment.md) menjadi sumber bukti jaringan/target, backup, artifact, proxy dan rollback.

Belum ada deployment, login SSH target, perubahan DNS/proxy, service produksi aplikasi atau migrasi produksi. Template persiapan di `deploy/` tersedia dan diperiksa parser, belum dipasang/start/reload. Build standalone fondasi yang pernah lulus lokal bukan artifact slicing final. Akses VPS telah diminta; identitas/username/port/jalur/fingerprint/key melalui kanal aman masih diperlukan.

Rilis pertama adalah frontend publik dan review `/preview-ui/*` sintetis berlabel/noindex. `/dashboard` dan `/admin` aktual wajib deny/redirect login sampai sesi nyata tersedia. Google/auth, Neon, Mayar, QRIS, order, invoice, RSVP server, storage dan persistence belum aktif; harga/QR preview bukan komersial atau pembayaran riil. Situs online tidak membuktikan seluruh produk production-ready.

## Domain, DNS dan target

| Pemeriksaan 7 Oktober 2026 | Hasil audit                                                                                 |
| -------------------------- | ------------------------------------------------------------------------------------------- |
| A apex menujuakad.com      | `172.104.187.4`, konsisten resolver/authoritative                                           |
| www                        | Mengarah ke apex dengan benar                                                               |
| HTTP apex/www              | 404, belum redirect canonical                                                               |
| HTTPS/TCP443 target        | Timeout sebelum handshake; sertifikat belum dapat diverifikasi                              |
| SSH/TCP22 target           | Timeout; login/port akses sebenarnya belum terverifikasi                                    |
| Workspace lokal            | IP keluar `43.173.15.136`, berbeda dari target DNS; bukan VPS tujuan yang boleh diasumsikan |

Pertahankan DNS yang sudah sesuai. Record MX/mail/FTP bergantung pada apex; jangan mengubah A/MX/mail/FTP untuk memudahkan web. Tidak perlu AAAA sebelum IPv6 sengaja dioperasikan. Bila target berbeda berdasarkan konfirmasi pemilik, audit dampak email/FTP dan rencana DNS terlebih dahulu. Jangan menerapkan konfigurasi Menuju Akad pada proxy lokal/layanan lain karena SSH target belum ada.

Canonical target HTTPS apex. HTTP → HTTPS dan HTTPS www → HTTPS apex dengan 308, path/query tetap utuh; TLS www harus valid sebelum redirect. Hasil ini adalah target pemeriksaan, belum kondisi live.

## Workspace dan artifact

Jalankan aplikasi dari `/home/ubuntu/menujuakad-web` pada branch `feat/stitch-slicing`. Rancangan `../menujuakad-rancangan` bukan dependency runtime/build. `npm run build` menghasilkan standalone dan menyalin `public`/`.next/static`; `npm run start` default bind localhost. Build URL publik memakai `NEXT_PUBLIC_APP_URL=https://menujuakad.com`; nilai ini bukan rahasia.

Persiapan tersedia: [unit systemd](../deploy/menujuakad@.service), [vhost Caddy](../deploy/Caddyfile), [pembungkus artifact](../deploy/scripts/package-standalone.sh). Template Caddy adalah vhost tambahan, bukan pengganti konfigurasi utama. Systemd standalone hanya dipakai jika inspect target membuktikan runtime/operasional cocok; reuse Nginx atau pola container jika itu sistem existing. Jangan menambah proxy kedua yang berebut 80/443.

Tidak menyalin environment, repository lengkap, kunci, dependency dev atau folder rancangan ke artifact. Rahasia runtime disediakan di luar repository dengan permission terbatas; frontend statis tidak memerlukan DB/provider. Node harus mengikuti `package.json`; artifact final mencatat versi Node, BUILD_ID, checksum dan source/diff yang diuji.

## Urutan penerbitan dan pemulihan

1. Integrasikan source slicing final; review secret/diff/fixture/aset, jalankan db:validate, typecheck, lint, test, build dan E2E/visual sesuai rencana PM. Hasil harus dari source final, bukan baseline 49 test/enam E2E fondasi.
2. Siapkan artifact standalone dan checksum dengan script packaging existing; worker tidak commit/push. Root menata source rilis sesuai lingkup otorisasi yang sudah diberikan.
3. Sesudah akses target sah tersedia, inspect OS/runtime/resource/service/ports/proxy/firewall/domain/mail/FTP dan akses provider. Jangan menebak host/user atau menonaktifkan host-key checking.
4. Backup proxy/unit/pointer release dan identifikasi rollback nyata sebelum perubahan. Pertahankan aplikasi existing. Pilih port kosong kandidat localhost, unggah artifact ke release baru dan cocokkan checksum.
5. Start kandidat dan probe localhost sebelum traffic berpindah; validasi konfigurasi proxy gabungan lalu switch atomik dan reload sesuai prosedur audit 02. Deploy frontend tidak membutuhkan migrasi/seed baru.
6. Verifikasi publik HTTP/HTTPS/apex/www/TLS/aset/header/health dan alur utama, termasuk private denial serta label preview. Jika gagal, pulihkan pointer/config sebelumnya; rilis pertama memakai backup pra-deploy. Jangan menghapus backup/layanan lain.
7. Catat artifact/release/hasil smoke, monitoring lifecycle/log tanpa rahasia, dua artifact tervalidasi bila tersedia, serta prosedur pemulihan. Jangan mengklaim backup/restore DB siap sebelum diuji.

Perintah kualitas/artifact dijalankan berurutan dari workspace:

```bash
npm run db:validate
npm run typecheck
npm run lint
npm test
NEXT_PUBLIC_APP_URL=https://menujuakad.com npm run build
npm run test:e2e
bash deploy/scripts/package-standalone.sh /tmp/menujuakad-RELEASE_ID.tar.gz
```

Playwright memakai managed webServer konfigurasi existing, tanpa proses background manual. Dependency/Chromium hanya disiapkan jika diperlukan. SSH, inspeksi target dan switch produksi belum dijalankan pada increment dokumentasi ini.

## Health, keamanan dan kriteria publikasi

`/api/health/live` harus 200 pada kandidat dan URL publik; ini liveness proses. `/api/health` memerlukan database dan tetap 503/not_configured tanpa `DATABASE_URL`; jangan mengubah probe agar menyatakan DB siap. Kondisi itu didokumentasikan untuk rilis frontend tanpa data. Ketika fitur DB diaktifkan, readiness200, migrasi pengembangan teruji, backup/restore dan prosedur Prisma7 migrate deploy menjadi gate wajib.

Tidak mengekspos port aplikasi internal ke Internet. Header nosniff/referrer/frame/permissions diperiksa setelah proxy; HSTS hanya setelah cakupan HTTPS terbukti. Metadata preview/auth/private noindex tidak menggantikan otorisasi server. Resource customer/admin dan pembayaran tidak aktif berdasarkan fixture/cookie/query.

Rilis dinyatakan terverifikasi produksi hanya setelah domain HTTPS200, redirect HTTP/www, sertifikat, aset, liveness, interaksi dan proteksi route diuji dari luar pada artifact final. Sampai akses target dan pemeriksaan itu selesai, statusnya **persiapan tersedia; publikasi belum terverifikasi**. Integrasi Neon/auth/Mayar tetap dicatat terpisah.
