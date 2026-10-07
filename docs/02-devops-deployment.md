# Audit DevOps dan Deployment Menuju Akad

## Kesimpulan dan batas pekerjaan

Audit baca-saja pada **7 Oktober 2026, sekitar 17.13–17.15 WITA / UTC+8** menemukan DNS publik menujuakad.com sesuai catatan user. Target DNS **172.104.187.4 berbeda dari IP keluar workspace 43.173.15.136**. Tidak ada bukti bahwa Caddy workspace merupakan proxy VPS target. HTTP target merespons 404; koneksi HTTPS dan SSH port 22 mengalami timeout dari workspace. Username, port SSH yang sesungguhnya, host fingerprint, serta akses terotorisasi ke target belum tersedia.

**Status: deployment terhambat akses VPS dan menunggu gate kode/pengujian dari ROOT.** User telah mengizinkan hasil slicing ditampilkan pada menujuakad.com; tahap worker ini hanya audit dan persiapan. ROOT meminta informasi akses kepada user. Tidak ada login SSH, perubahan DNS, publikasi, migrasi, pemasangan dependency, perubahan proxy, restart layanan, commit, atau pengiriman Telegram. Prosedur dan konfigurasi berikut belum dijalankan di VPS.

Panduan awal proyek masih memuat status brainstorming. Instruksi sesi terbaru menjadi dasar izin audit/persiapan ini; pengujian fondasi lama tidak dianggap pengujian increment slicing baru. Worker hanya menulis dokumen ini dan berkas di `deploy/`; progres/changelog serta dokumen deployment bersama dikonsolidasikan ROOT.

## DNS authoritative dan dampaknya

Query langsung `dig @ns1.domainesia.net` dan `dig @ns2.domainesia.net`, dengan timeout 3 detik dan satu percobaan, memperoleh flag **aa** dan jawaban konsisten. NS publik: `ns1.domainesia.net`, `ns2.domainesia.net`. SOA serial saat audit: `2026100701`; TTL NS 43.200 detik. IP yang dijawab nameserver pada audit: ns1 `172.104.178.251` / `36.50.77.54`; ns2 `139.162.241.138` / `45.33.9.238`.

| Nama   | Tipe  | Hasil authoritative                     | TTL                | Penilaian                                                  |
| ------ | ----- | --------------------------------------- | ------------------ | ---------------------------------------------------------- |
| `@`    | A     | `172.104.187.4`                         | 14.400             | Sesuai catatan user; identitas server perlu dikonfirmasi   |
| `@`    | AAAA  | Tidak ada, NOERROR/NODATA               | SOA negatif 86.400 | Tidak ada routing IPv6 publik untuk apex                   |
| `www`  | CNAME | `menujuakad.com.`                       | 14.400             | Resolusi A berakhir pada IPv4 yang sama                    |
| `www`  | AAAA  | CNAME lalu apex tanpa AAAA              | —                  | Tidak ada target IPv6 dari rantai ini                      |
| `@`    | CAA   | Tidak ada, NOERROR/NODATA               | SOA negatif 86.400 | Tidak ada pembatas penerbit sertifikat lewat CAA pada apex |
| `@`    | MX    | Prioritas `0`, target `menujuakad.com.` | 14.400             | Menunjuk server apex; layanan email belum diperiksa        |
| `mail` | CNAME | `menujuakad.com.`                       | 14.400             | Alias, bukan bukti SMTP/IMAP tersedia                      |
| `ftp`  | CNAME | `menujuakad.com.`                       | 14.400             | Alias, bukan bukti FTP tersedia                            |

TTL dari resolver rekursif dapat lebih kecil karena cache; A authoritative tetap 14.400 detik, yaitu empat jam. MX, mail, dan ftp tidak diperlukan Next.js dan **jangan dihapus atau diarahkan ulang demi web**. Karena ketiganya bergantung pada apex, perubahan A apex akan turut memindahkan tujuan email/FTP. Pilihan aman saat ini adalah mempertahankan DNS dan mendapatkan akses VPS yang dituju, lalu memeriksa layanan existing. Jika target akhirnya berbeda, audit email/FTP dan rancang perubahan DNS tersendiri sebelum mengubah A.

Tidak perlu menambah AAAA sebelum IPv6, firewall, listener, dan TLS benar-benar dioperasikan. Tidak adanya CAA bukan kesalahan; penambahan CAA bersifat opsional setelah CA proxy existing diketahui. Query CAA lanjutan pada parent diperlukan bila validasi penerbit sertifikat menemukan hambatan. Akses panel DomaiNesia belum digunakan atau terverifikasi; hasil di atas diperoleh lewat DNS publik.

## HTTP, HTTPS, dan sertifikat target

Probe menggunakan `curl --noproxy '*'`, batas connect 5 detik, total 12 detik; pemeriksaan socket langsung ke IPv4 menggunakan timeout 5 detik. Tidak memakai kredensial.

| Probe                                          | Hasil                                                                      |
| ---------------------------------------------- | -------------------------------------------------------------------------- |
| `http://menujuakad.com/`                       | HTTP/1.1 404 Not Found; Content-Type text/html; tidak ada Location         |
| `http://www.menujuakad.com/`                   | HTTP/1.1 404 Not Found; tidak ada redirect canonical                       |
| TCP 80 ke `172.104.187.4`, Host menujuakad.com | Terhubung; HEAD menghasilkan 404 yang sama                                 |
| Body HTTP apex                                 | Judul `404 Not Found`; tidak memberi identitas software server             |
| `https://menujuakad.com/`                      | Timeout connect 443; bukan error validasi sertifikat                       |
| `https://www.menujuakad.com/`                  | Timeout connect 443                                                        |
| TCP/TLS 443 langsung                           | Timeout sebelum handshake; issuer, SAN, masa berlaku tidak dapat diperiksa |
| TCP 22 langsung                                | Timeout; banner SSH dan port akses sebenarnya tidak diketahui              |

Header `Server` tidak tersedia. Tidak dapat menyatakan software target adalah Nginx/Caddy, sertifikat ada/tidak ada, server kosong, atau penyebab timeout adalah firewall tertentu. Respons 404 menunjukkan ada responder HTTP di jalur target; tidak membuktikan aplikasi lama tidak dipakai. Jangan mengganti default vhost sebelum inspect konfigurasi target.

Untuk deployment, port TCP 80 dan 443 harus dapat diakses dari Internet melalui proxy existing. Caddy umumnya memakai 80 untuk redirect serta ACME HTTP-01 dan 443 untuk HTTPS/TLS-ALPN-01. DNS-01 hanya dipilih jika memang terkonfigurasi; tidak diasumsikan tersedia. Firewall/cloud security group target belum diketahui. Port aplikasi 3100/3101 cukup localhost; jangan dibuka ke Internet.

Canonical yang disiapkan: HTTPS apex `https://menujuakad.com`, HTTP → HTTPS, dan `https://www.menujuakad.com/<path>?<query>` → `https://menujuakad.com/<path>?<query>` dengan 308. HTTPS www tetap memerlukan sertifikat yang mencakup www agar redirect dapat terjadi setelah handshake. Belum ada bukti redirect ini aktif sekarang.

## Inventaris workspace, bukan inventaris VPS target

| Aspek                   | Temuan lokal                                                                                                                                                           |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Identitas               | Host `VM-0-151-ubuntu`, user `ubuntu`; eth0 `10.11.0.151/22`, gateway `10.11.0.1`                                                                                      |
| IP keluar               | Dua layanan independen, api.ipify.org dan ifconfig.me, menjawab `43.173.15.136`                                                                                        |
| IP Docker               | `172.17.0.1`, `172.18.0.1`, `172.19.0.1`; tidak ada `172.104.187.4` pada interface                                                                                     |
| Sistem                  | Ubuntu 24.04.4 LTS; 2 CPU; RAM 3.659 MiB, available sekitar 2.077 MiB; swap terpakai sekitar 1.001 MiB                                                                 |
| Disk                    | Root 59 GiB; 27 GiB terpakai; 31 GiB tersedia                                                                                                                          |
| Runtime                 | Node `v22.23.1`, Docker server `29.8.2`, Caddy `v2.11.4`                                                                                                               |
| Proxy                   | `caddy.service` aktif sebagai user caddy; `/etc/caddy/Caddyfile`; port 80/443 sudah terpakai, admin hanya `127.0.0.1:2019`                                             |
| Vhost Caddy terinspeksi | `breadwinner.my.id`, `www.breadwinner.my.id`; upstream localhost 8799 dan 9898                                                                                         |
| Container existing      | Command center pada 9898; HariKita app internal 3000, Nginx pada host 8080, PostgreSQL 16 internal 5432                                                                |
| Layanan existing        | SSH, Docker, Caddy, fail2ban, figma-ai, vpsbot dan layanan OS; tidak diubah                                                                                            |
| Firewall lokal          | UFW tidak terpasang; chain INPUT IPv4/IPv6 menunjukkan policy ACCEPT; ada nftables/fail2ban. Ini bukan audit lengkap firewall/cloud dan tidak berlaku untuk VPS target |
| Port kandidat           | 3100/3101 tidak ada pada snapshot listener lokal; tetap wajib dicek ulang di target                                                                                    |

Perbedaan IP keluar dan vhost menunjukkan workspace bukan target yang dapat diasumsikan. NAT/forwarding eksternal belum diaudit, sehingga kepemilikan atau topologi target tidak disimpulkan dari IP keluar saja. Seluruh layanan dan proxy lokal tersebut dipertahankan.

## Akses dan informasi yang masih diperlukan

`/home/ubuntu/.ssh` hanya memuat `authorized_keys` kosong; tidak ada config, known_hosts, id_rsa atau id_ed25519. `SSH_AUTH_SOCK` tidak tersedia dan `ssh-add -l` tidak dapat terhubung ke agent. Daftar nama berkas `/root/.ssh` hanya menunjukkan authorized_keys; tidak ada key/config outbound standar. Tidak membaca isi kunci/password/token maupun environment aplikasi/layanan lain.

`/etc/ssh/ssh_config` tidak memberikan alias/username/IdentityFile target. Dokumen proyek yang diperiksa tidak menyimpan SSH target. Tidak mencoba menebak username atau mencoba login berulang. `authorized_keys` mengatur login masuk, bukan bukti kredensial keluar. Riwayat Telegram VPS tidak memberikan izin mengambil kredensial layanan tersebut untuk SSH dan tidak digunakan.

Agar deployment dapat dilanjutkan, ROOT perlu:

1. Konfirmasi `172.104.187.4` memang VPS tujuan atau tentukan host tujuan yang sah.
2. Username, port SSH, jalur akses/allowlist/VPN bila diperlukan, serta fingerprint host yang diverifikasi dari panel/console pemilik.
3. Key melalui kanal aman/SSH agent, atau console provider yang terotorisasi; jangan menyimpan private key/password di chat, repo atau dokumen.
4. Hak operasional yang cukup untuk inspect service/proxy/firewall serta menambahkan service aplikasi secara terpisah.
5. Inventaris VPS target: OS, Node/Docker, disk/RAM, listeners, firewall/provider security group, vhost apex/www, email/FTP, dan backup konfigurasi existing.

Jangan menonaktifkan host-key checking. Tidak ada koneksi SSH yang terbukti siap dari sesi ini. Tidak ada `.env` aplikasi; hanya `.env.example` dengan nama variabel dan placeholder kosong.

## Arsitektur deployment bersyarat

```text
DNS DomaiNesia → 172.104.187.4 (identitas/akses belum terverifikasi)
  → proxy existing VPS: HTTPS 443 / redirect 80
  → 127.0.0.1:3100 atau :3101
  → systemd menujuakad@<release-id>: Next.js standalone
  → Neon hanya saat fitur/database dikonfigurasi
```

Disiapkan alternatif ringan **systemd + standalone** supaya tidak menambahkan proxy/container lain. Syarat: VPS target punya systemd dan `/usr/bin/node` versi kompatibel (`>=22.12 <23` atau `>=24`). Pemilihan ini belum merupakan hasil audit VPS target. Jika target memakai Nginx, gunakan vhost Nginx existing dengan upstream yang sama; template Caddy tidak boleh dipaksakan. Jika target standar operasionalnya Docker, susun konfigurasi container setelah inspect; jangan menambah dua model operasional bersamaan.

Berkas yang tersedia:

- [Template unit systemd](../deploy/menujuakad@.service): satu instance per release; secrets di luar repo, bind localhost, pembatas filesystem, jurnal, restart terbatas.
- [Template vhost Caddy](../deploy/Caddyfile): apex reverse proxy 3100, canonical www; **bukan pengganti Caddyfile utama**.
- [Pembungkus artifact](../deploy/scripts/package-standalone.sh): hanya mengemas standalone lokal; menolak berkas `.env`/key SSH standar dan symlink keluar artifact; tidak login, upload, start atau publish.

Build saat ini memakai Next.js `16.3.8` dan `output: standalone`; script build menyalin `public` serta `.next/static` ke standalone. Template menjalankan `server.js` langsung, sehingga unit menetapkan `HOSTNAME=127.0.0.1`; `APP_HOSTNAME` pada script npm start tidak dipakai unit ini. Buat `.next/cache` sebelum start; izin tambahan untuk ISR harus ditinjau ketika fitur tersebut dibuat. Jangan menyalin repo/dependency dev/env secara keseluruhan ke release.

## Pipeline dan gate sebelum publish

Urutan: review diff/secrets → db:validate → typecheck → lint → unit/integration test → build → browser/visual → artifact + checksum → inspect VPS → backup → start kandidat localhost → health/smoke → switch proxy → verifikasi publik → monitoring.

```bash
npm run db:validate
npm run typecheck
npm run lint
npm test
NEXT_PUBLIC_APP_URL=https://menujuakad.com npm run build
npm run test:e2e
bash deploy/scripts/package-standalone.sh /tmp/menujuakad-RELEASE_ID.tar.gz
```

ROOT wajib menjalankan gate tersebut untuk **source slicing final**, mencatat hash commit/diff, BUILD_ID, versi Node, checksum artifact, serta hasil desktop/mobile. Build fondasi `.next/standalone` yang ditemukan bertimestamp sekitar 15.30 UTC+8 bukan bukti slicing baru siap. Worker tidak menjalankan ulang product test/build atau memasang dependency. Tidak ada CI/CD otomatis/SSH secrets yang dibuat; prosedur manual ini adalah draft operasional.

`NEXT_PUBLIC_APP_URL` merupakan nilai publik yang masuk build; jangan mengandalkan mengganti env runtime untuk mengganti asset/client bundle lama. Migrations produksi tidak diperlukan untuk slicing statis. Bila nantinya diperlukan: backup/restore database teruji, migrasi kompatibel diuji pada database pengembangan, dan hanya Prisma migrate deploy dengan konfigurasi versi 7 yang sesuai. Jangan menjalankan db push atau seed produksi untuk menerbitkan halaman publik.

## Environment dan penyiapan runtime

Direktori rencana pada **VPS target terverifikasi**:

```text
/opt/menujuakad/releases/<release-id>/       standalone immutable
/opt/menujuakad/current                     symlink rilis yang lolos smoke
/etc/menujuakad/runtime.env                 rahasia bersama, root:root 0600
/etc/menujuakad/releases/<release-id>.env    PORT=3100 atau PORT=3101, 0600
/etc/caddy/menujuakad-sites/<release-id>.caddy  vhost dengan port rilis
/etc/caddy/menujuakad-active.caddy           symlink vhost aktif
/var/backups/menujuakad/<timestamp>/         backup root-only
```

Buat user sistem `menujuakad` tanpa login hanya jika belum ada. Release root:menujuakad, mode direktori 0750 dan file minimal dapat dibaca grup, tanpa hak tulis grup. Cache release dimiliki menujuakad. Unit EnvironmentFile dibaca systemd root; tidak perlu menjadikan secret dapat dibaca semua user. Shared env dan env per rilis tidak boleh override HOSTNAME/NODE_ENV/NEXT_TELEMETRY_DISABLED; per-rilis hanya PORT.

| Variabel                            | Kebutuhan dan penempatan                                  |
| ----------------------------------- | --------------------------------------------------------- |
| NODE_ENV, HOSTNAME                  | Unit: production dan 127.0.0.1                            |
| PORT                                | File per rilis, 3100/3101 setelah cek konflik             |
| NEXT_PUBLIC_APP_URL                 | Nilai publik build `https://menujuakad.com`               |
| DATABASE_URL                        | Secret runtime pooled Neon, hanya jika DB digunakan       |
| DIRECT_URL                          | Secret job migrasi, tidak perlu runtime publik            |
| AUTH_SECRET                         | Saat autentikasi dikerjakan dan kontraknya ditetapkan     |
| MAYAR_API_KEY, MAYAR_WEBHOOK_SECRET | Saat billing/integrasi server diaktifkan                  |
| MAYAR_API_BASE_URL                  | Sesuai kontrak integrasi; bukan untuk UI                  |
| Storage/email                       | Belum diimplementasikan; jangan membuat kredensial fiktif |

Penerbitan slicing statis dapat tanpa DB apabila ROOT menetapkan lingkup publik saja. `/api/health/live` tetap harus 200; `/api/health` **akan 503/not_configured tanpa DATABASE_URL**. Dokumentasikan kondisi ini, jangan mengubah probe agar mengaku DB siap. Ketika operasi DB diaktifkan, readiness 200 menjadi gate wajib. Halaman terlindungi/pembayaran tidak dinyatakan aktif hanya karena layout tersedia.

## Backup, rilis kandidat, switch atomik, dan rollback

Langkah di bagian ini adalah **instruksi tahap berikutnya, belum dieksekusi**. Semua path/port disesuaikan sesudah inspect target. Jangan gunakan path release milik aplikasi lain.

1. Sebelum perubahan, catat service/vhost/port target dan pilih port kosong 3100 atau 3101 dengan `ss -ltnp`. Ambil snapshot/backup konfigurasi yang benar-benar dapat dipulihkan. Simpan direktori backup mode 0700, root-only; catat release/upstream sebelumnya. Untuk deployment pertama belum ada release aplikasi lama: rollback adalah konfigurasi proxy pra-deploy dan stop kandidat.
2. Backup konkret: gunakan `install -d -m 0700 /var/backups/menujuakad/<timestamp>`, lalu `cp -a /etc/caddy <backup>/caddy` jika Caddy target terkonfirmasi. Salin unit/konfigurasi Menuju Akad sebelumnya bila ada, serta simpan artifact release lama dan checksum. Backup secrets, bila perlu, hanya dalam lokasi root-only/enkripsi di luar repo; jangan mencetak isinya. Backup state TLS `/var/lib/caddy` secara aman bila termasuk rencana pemulihan server. Jika proxy Nginx, backup konfigurasi Nginx dan state TLS yang relevan sebagai gantinya.
3. Unggah artifact yang lolos gate melalui koneksi terotorisasi; cocokkan SHA-256 sebelum ekstraksi. Buat **direktori release baru**, ekstrak dengan `tar --no-same-owner`, periksa struktur `server.js`, `public`, `.next/static`, `.next/BUILD_ID`. Jangan ekstrak menimpa release aktif. Owner root:menujuakad, hak akses baca/traverse grup dan tanpa tulis grup; buat cache writable menujuakad. Disk harus cukup untuk kandidat + rilis lama + backup.
4. Pasang template unit setelah inspect Node path; buat shared env/per-rilis aman dan jalankan `systemd-analyze verify`. Jalankan daemon-reload hanya saat unit sudah siap, lalu `systemctl start menujuakad@<release-id>`. Jangan mengganti service/proxy existing. Probe kandidat langsung localhost: `/`, `/api/health/live`, aset CSS/font/gambar, dan readiness menurut lingkup DB. Jika gagal, stop kandidat; traffic existing belum berpindah.
5. Siapkan vhost immutable `/etc/caddy/menujuakad-sites/<release-id>.caddy` dengan port kandidat. Hindari deklarasi domain ganda; saat pemasangan pertama, tambahkan **satu** import `/etc/caddy/menujuakad-active.caddy` pada Caddyfile existing yang sudah dibackup. Jangan menyalin template sebagai Caddyfile utama. Validasi konfigurasi gabungan tanpa mengganti layanan/domain lain.
6. Switch symlink di filesystem yang sama, lalu validasi dan reload Caddy secara graceful. Symlink sementara harus belum ada; `ln -s` sengaja tanpa opsi force. Contoh sesudah variable release-id/path diisi dan kandidat terbukti sehat:

   ```bash
   ln -s "/etc/caddy/menujuakad-sites/$release_id.caddy" /etc/caddy/menujuakad-active.caddy.next
   mv -T /etc/caddy/menujuakad-active.caddy.next /etc/caddy/menujuakad-active.caddy
   caddy validate --adapter caddyfile --config /etc/caddy/Caddyfile
   systemctl reload caddy
   ```

   Penggantian symlink atomik di disk; perubahan traffic terjadi saat konfigurasi valid diterapkan melalui reload. Jika validasi/reload gagal, kembalikan symlink sebelumnya dan jangan menganggap rilis live. Jika deployment pertama belum punya symlink sebelumnya, pulihkan Caddyfile pra-deploy yang dibackup. Sertifikat awal dapat memerlukan waktu dan membuka dependency ACME; sertakan verifikasi TLS sebelum menyatakan berhasil.

7. Setelah smoke HTTPS apex/www dan aplikasi lama berhasil, update `/opt/menujuakad/current` memakai symlink sementara + `mv -T` yang sama. Pertahankan rilis lama berjalan selama observasi singkat supaya rollback tidak menunggu boot. Jika reboot terjadi, pastikan hanya rilis terpilih yang enable; tidak mengubah service lama sampai kandidat valid. Selanjutnya stop/disable hanya instance Menuju Akad lama dan simpan artifact/config-nya.
8. Bila smoke produksi gagal: arahkan symlink active kembali ke vhost release sebelumnya, validasi lalu reload; verifikasi HTTPS/health dan aplikasi lain. Jika service lama sudah stop, start dahulu dan probe localhost. Kembalikan current, stop/disable hanya kandidat. Tidak mematikan Caddy/HariKita/command center, tidak mengganti A/MX, dan tidak menghapus release/backup. Rollback pertama memakai backup proxy asli, bukan rilis lama fiktif.

Blue/green ini tidak menjamin request yang sedang berjalan atau Server Action lintas versi tetap kompatibel; keep rilis lama selama observasi, gunakan perubahan kompatibel dan tinjau cache/asset version ketika fitur dinamis ditambah. Rollback aplikasi tidak membatalkan migrasi DB. Restore database harus memiliki prosedur terpisah dan diuji; utamakan migrasi expand/contract.

## Verifikasi publik, monitoring, dan pemulihan

Sesudah switch, periksa tanpa mematikan validasi TLS: apex HTTPS 200, HTTP → HTTPS, www 308 dengan path/query terjaga, sertifikat SAN apex/www/issuer/expiry, health, aset build, responsive/interaksi utama, header nosniff/referrer/frame/permissions, serta layanan domain existing. HSTS baru diputuskan setelah HTTPS seluruh lingkup domain terbukti stabil; template tidak otomatis menyertakan includeSubDomains/preload.

Rencana monitoring: systemd/journald untuk lifecycle aplikasi; akses/error proxy menggunakan format yang tidak mencetak authorization/token/query sensitif. External HTTPS/liveness tiap menit: alert sesudah tiga kegagalan berturut-turut; TLS expiry kurang dari 14 hari; disk lebih dari 80%; available RAM di bawah 15% selama lima menit; restart proses lebih dari tiga kali/10 menit; 5xx lebih dari 1% selama lima menit setelah volume request memadai. Tool external yang dapat dipilih setelah akses tersedia: Uptime Kuma pada deployment terpisah yang tidak konflik port, atau layanan uptime existing. Jangan memasangnya pada audit ini atau membuat notifikasi Telegram tanpa instruksi.

Simpan minimal dua artifact release tervalidasi, checksum, unit/vhost, pointer rilis, hasil smoke dan backup proxy. Salinan off-host terenkripsi serta prosedur pemulihan dari console provider dibutuhkan untuk kehilangan VPS. Untuk Neon, verifikasi retensi/PITR atau logical backup dan lakukan restore drill sebelum fitur data aktif; belum ada backup/restore DB teruji pada audit ini. Media customer kelak memakai object storage dengan kebijakan retensi; cache/artifact rilis bukan backup media.

## Hasil validasi dan langkah berikutnya

- Query DNS rekursif dan kedua NS authoritative selesai; record utama konsisten. Probe HTTP/cert/TCP terikat timeout; HTTPS/SSH belum terjangkau dari sesi ini.
- Pemeriksaan lokal baca-saja selesai: runtime, listeners, vhost, nama container, resource, firewall terbatas, serta keberadaan berkas SSH/env. Tidak membaca nilai rahasia.
- `bash -n deploy/scripts/package-standalone.sh`, `systemd-analyze verify deploy/menujuakad@.service`, dan `caddy adapt --adapter caddyfile --config deploy/Caddyfile` lulus. Systemd memberi warning path PIDFile legacy pada layanan existing tat_agent; bukan kesalahan unit baru dan tidak diubah.
- Konfigurasi belum di-install/start/reload di mesin mana pun. Validasi parser tidak membuktikan koneksi DB, sertifikat, layanan systemd berjalan, atau production deployment.
- Pembungkus artifact berhasil mengemas standalone fondasi lokal ke `/tmp/menujuakad-devops-audit-20261007-standalone.tar.gz`, SHA-256 `a84b8834d62ee1037befc94da9c683be66d4f0fce3314dad44fd61bf455918f3`. Struktur dan nama berkas environment/kunci dalam archive diperiksa; tidak ditemukan. Artifact ini bukan build slicing final dan tidak diunggah atau dipakai publish.
- Langkah berikutnya: ROOT menerima identitas/akses VPS, menuntaskan slicing dan gate pengujian, lalu melanjutkan audit target serta rencana proxy sesuai server sebenarnya. Sampai itu selesai, **kode persiapan tersedia; produksi belum terverifikasi**.
