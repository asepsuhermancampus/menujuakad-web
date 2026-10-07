# Rencana Deployment VPS

## Status

Belum ada deployment, koneksi SSH baru, perubahan DNS, perubahan proxy, container aplikasi, atau migrasi produksi. Build `output: standalone`, penyalinan public/static assets, dan server standalone telah diuji lokal melalui Playwright; ini bukan bukti deployment.

`npm run build` menyiapkan output dan aset. `npm run start` membaca environment dan menjalankan server standalone dengan bind `127.0.0.1` secara default. Gunakan `APP_HOSTNAME=0.0.0.0` di dalam container yang hanya dapat diakses melalui proxy, dan atur `PORT` sesuai konfigurasi deployment.

## Direktori pengembangan

Workspace implementasi sekarang `/home/ubuntu/menujuakad-web`. Jalankan build dan persiapan artifact dari folder tersebut. Pemindahan lokal ini tidak mengubah konfigurasi service, VPS, DNS, atau path deployment produksi. Folder rancangan `../menujuakad-rancangan` tidak menjadi dependency runtime/build.

## Urutan tahap produksi

1. Audit VPS: OS, CPU/RAM/disk, Docker/Node, container/service aktif, port, firewall, proxy, penggunaan domain, dan DNS.
2. Reuse Nginx atau Caddy yang sudah digunakan; jangan membuat dua proxy berebut port 80/443.
3. Siapkan image aplikasi, environment secrets, dan penyimpanan media persisten/object storage.
4. Jalankan pemeriksaan kualitas dan build; siapkan image sebelumnya serta strategi rollback yang benar-benar tersedia.
5. Verifikasi backup/restore database; terapkan migrasi kompatibel sebelum menjalankan aplikasi yang membutuhkannya.
6. Jalankan aplikasi di jaringan internal atau bind localhost; arahkan traffic melalui proxy HTTPS.
7. Verifikasi `/api/health/live`, `/api/health`, HTTPS, redirect HTTP, canonical www, header keamanan, dan alur utama.
8. Pantau log tanpa password/API key/token/data keuangan pribadi.

## Domain target

Domain utama `https://menujuakad.com`. Rencana DNS dari master spec: A record `@` ke IPv4 VPS, CNAME `www` ke domain utama. AAAA hanya bila IPv6 sengaja dioperasikan. Record aktual harus diinspeksi sebelum perubahan dan tidak diasumsikan benar.

## Health dan keamanan

Liveness hanya menyatakan proses aplikasi hidup. Readiness `/api/health` memerlukan probe database berhasil. Tidak ada kredensial yang dimunculkan dalam respons. Header dasar nosniff, referrer policy, X-Frame-Options, dan Permissions-Policy ada di konfigurasi Next.js. CSP, HSTS HTTPS, rate limiting, observability, dan kebijakan embedding demo harus ditinjau ketika fitur/infrastruktur relevan tersedia.

Jangan mengklaim rollback database siap hanya karena migration SQL ada. Jangan menyimpan foto customer sebagai satu-satunya salinan di filesystem container.
