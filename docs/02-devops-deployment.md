# Audit DevOps dan Deployment Menuju Akad

## Rilis login dan auth preproduction — 9 Oktober 2026

**Checkpoint 11.10 UTC+8: rilis `preview-20261009-login` aktif di produksi, smoke HTTPS PASS.** Produksi https://menujuakad.com memakai BUILD_ID `_ZmqTJPa-Hip-SCzksj0f`, container `menujuakad-web-1` healthy pada `127.0.0.1:3100`. Increment membawa halaman `/login` bersih, auth preproduction (API login/logout, guard fail-closed), routing resmi, Preview Studio, dan 8 screen Stitch baru; commit `18cd096` (276 file) sudah di-push ke GitHub. `AUTH_SECRET` belum di-set di runtime sehingga POST login menjawab 503 fail-safe. Detail penuh, identitas rilis, probe dan rollback pada [deployment](deployment.md).

### Ringkasan operasional rilis login

- Artifact SHA256 `cae0726314bb03821ba5f9d7c06016896ede5a13109b09f73e06ad557600e90c`; image `menujuakad-web:preview-20261009-login` ID `sha256:0557ccadba3ba242ccf88bf5cabf4aac6b600aed5d0f1a0fdadda19d27cacb13`; rollback terdekat `preview-20261008-responsive` (BUILD_ID `mb6ybS2E4cGWPE7718LeW`).
- Switch 11.09.49–11.09.55, verifikasi selesai 11.10.33; pointer `/srv/menujuakad/deploy/release.env` root0600 diperbarui atomik setelah PASS. Percobaan pertama 11.09.12 di-rollback otomatis karena bug skrip probe (bukan aplikasi), lalu percobaan kedua bersih; bukti di `/tmp/menujuakad-login-20261009/devops/`.
- Sebelas probe HTTP lulus; smoke browser HTTPS produksi 11 flow/4 guard/2 keyboard/12 responsif/15 screenshot PASS dengan validasi TLS aktif; Caddy dan dua Compose checksum identik sebelum/sesudah.
- Kandidat `menujuakad-login-candidate` dihentikan via Compose `down` setelah PASS; port3101 kosong; MenujuAkad/HariKita/command-center tetap sehat.
- **Belum:** `AUTH_SECRET` runtime, migrasi/seed Neon (11 akun + 30 customer journey), auth nyata, Mayar, persistence bisnis. QR asli tetap harus dilayani melalui endpoint terlindungi.

## Persiapan auth dan QRIS TEST — 8 Oktober 2026

**Checkpoint operasional 12.32 UTC+8: backup dan restore DB PASS; sanitizer build siap. Migrasi/seed/build final/deploy auth belum dijalankan; menunggu gate QA final yang dikonfirmasi ROOT.** Rilis publik tetap `preview-20261008-responsive`, BUILD_ID `mb6ybS2E4cGWPE7718LeW`, container healthy dan HTTPS readiness200. Worker tidak melakukan reset/commit/push. Bagian rilis preview di bawah adalah riwayat, bukan bukti auth terbaru.

### Backup, inspeksi dan pemulihan terisolasi

- Neon `menujuakad-preproduction` terverifikasi PostgreSQL **18**, sembilan tabel domain, empat CHECK dan satu migrasi foundation finished tanpa rollback. Semua tabel domain kosong. Checksum foundation tetap `791ede2bc7c01c4e9358dd050b64dc7ff15a016cc297c2bd58c775435208fed7`.
- Role `menujuakad_runtime_preproduction` bukan superuser/createdb/createrole/replication/bypassrls, tidak memiliki membership tambahan, schema atau object, USAGE public tersedia, CREATE public ditolak. DIRECT_URL owner tidak ada dalam container layanan aktif.
- Client kompatibel `postgres:18-bookworm`, digest `sha256:afc7e2d441324c0388fa80c3d24f733b4194a4eb7f47dd8ee2b08eb1a24a647c`. Dump custom SHA256 `fedc6bbf3b7c683a709a58c6832a578ef36a8a02799e81ad84d31fee6eb9011c` berhasil dibuat dan benar-benar di-restore memakai `pg_restore --exit-on-error --no-owner --no-privileges`.
- Rehearsal menggunakan container `menujuakad-auth-restore-20261008`, database `menujuakad_restore_rehearsal`, network none, tanpa published port, volume terpisah, RAM384MiB/CPU0,5. Tabel, definisi empat CHECK, checksum/finished migrasi dan jumlah baris sembilan tabel **identik** dengan sumber. Tidak ada restore menimpa Neon/HariKita.
- Backup privat permanen `/srv/menujuakad/backups/before-auth-test-20261008` root0700: dump, metadata perbandingan, laporan restore, kedua Compose, pointer release, salinan runtime env dan Caddy masing-masing0600. Bukti kerja `/tmp/menujuakad-auth-ops-20261008`0700, berkas0600. Env tooling owner/runtime tidak masuk repo/image/dokumen.
- Hash Caddy `2c44c0e564473872830ba19ae34404570da827aa296665befa15ab8ab83f6818`; Compose utama `89db5bc3846946c09750bb57981fcbd541944201807ec95eb68f40e24c9856ac`, Neon `979188328c04bab41fd481164d717cc690136489096c7b0b44552a50caadac60`. Breadwinner/HariKita/command-center tetap berjalan. Backup tidak menjadi izin rollback schema setelah ada write baru.

### Perbaikan pengemasan dan gate berikutnya

`[prepare-standalone.mjs](../scripts/prepare-standalone.mjs)` kini membersihkan `.env`/`.env.*` secara rekursif di salinan standalone sebelum dan sesudah penyalinan aset. Penghapusan memakai unlink sehingga tautan environment dibuang tanpa menyentuh target/sumber. Root build/standalone harus direktori asli; symlink keluar standalone ditolak sebelum copy. Package guard existing tidak diubah dan tetap menolak environment yang diperkenalkan ulang. Tidak menjalankan build final selama writer lain aktif.

Pengujian regresi RED membuktikan dua kasus bocor pada implementasi lama; sesudah fix **5/5 PASS**, termasuk idempotensi, sumber env byte identik, salinan aset, env-symlink, root/external symlink dan penolakan package guard. ESLint/Prettier scoped PASS. Unit seluruh proyek sedang diperiksa; hasil final belum diklaim pada checkpoint ini.

Urutan berikutnya setelah ROOT mengonfirmasi QA: build/source gate final → migrate deploy additive → inspect13 tabel/5 CHECK/3 checksum → seed dua kali dan persist manifest privat root0600 → grants runtime minimal → artifact scan/hash/BUILD_ID → kandidat → switch kedua Compose → smoke browser HTTPS semua11akun dan QRIS TEST. AUTH_SECRET disiapkan privat tanpa nilai dalam log; AUTH_TRUST_PROXY hanya boleh1 setelah perilaku proxy terverifikasi. QR asli harus dilayani melalui endpoint terlindungi, bukan `public/`. Provider pembayaran/entitlement/publish tetap di luar hasil TEST. Tidak ada transfer dana.

## Publikasi pada VPS Breadwinner — 8 Oktober 2026

Status audit lama di bawah merupakan riwayat. Berdasarkan konfirmasi user, target aktual adalah VPS Breadwinner `43.173.15.136`; frontend Docker `preview-20261008` sudah berjalan sehat dan vhost ditambahkan ke Caddy existing setelah backup serta validasi. DNS kedua NS DomaiNesia dan resolver Cloudflare/Google sekarang cocok. Agent tidak mengoperasikan panel DNS; pembaruan record terpantau selama sesi. HTTPS Let’s Encrypt apex/www, redirect308, liveness200 dan Breadwinner200 lulus. Detail artifact, batas rilis, monitoring dan rollback pada [deployment](deployment.md). Resolver VPS masih memiliki cache IP lama; smoke publik menggunakan DoH, browser Chromium memakai pemetaan IP authoritative tanpa mengabaikan validasi sertifikat. Timer finalizer telah berhenti otomatis setelah verifikasi HTTPS pada00.06UTC+8. Tidak menghubungkan provider/database atau melakukan migrasi.

## Kandidat responsif — preflight dan persiapan 8 Oktober 2026

**Status: kandidat terisolasi sehat; traffic publik belum dipindahkan.** Target terkonfirmasi tetap VPS Breadwinner `43.173.15.136`, mesin workspace ini. Worker melanjutkan task DevOps setelah increment fullstack selesai, membaca role DevOps, AGENTS dan [deployment existing](deployment.md). Pada task ini tidak mengubah source/tests, tidak menjalankan build Next, commit/push, DNS, migrasi/seed, proxy atau layanan existing. Satu-satunya dokumen repository yang diubah adalah dokumen ini. Kandidat Docker tetap berjalan terkelola untuk QA/coordinator; switch memerlukan gate QA final dan instruksi coordinator berikutnya.

### Bukti preflight dan identitas kandidat

- Produksi tetap `menujuakad-web:preview-20261008-gst01`, container `menujuakad-web-1`, healthy pada localhost3100; BUILD_ID `gszjNXdxoHXetHRgCAn0g`. Image rollback tersedia dengan ID `sha256:28a81588838d9f43e17172aa717b1949e93e97b73de618a5f8e6c97dafe28a2c`. Tag awal `preview-20261008` juga dipertahankan; tidak prune/remove image.
- Kandidat: `menujuakad-web:preview-20261008-responsive`, image ID `sha256:8736708e2cd7c4d303dfe051ef2494dfb6c49c0521c7d39868e2c9de1e4e8337`. Project `menujuakad-responsive-candidate`, container `menujuakad-responsive-candidate-web-1`; endpoint **http://127.0.0.1:3101**. Port3101 kosong saat preflight dan hanya di-bind localhost; tidak diarahkan Caddy.
- BUILD_ID kandidat `mb6ybS2E4cGWPE7718LeW` sama dengan `.next`, standalone, artifact hasil ekstraksi dan runtime container. Build/check fullstack exit0 dengan243unit;28regresi scoped lulus. ROOT kemudian mengonfirmasi **gate QA PASS** pada dokumen10: full E2E82/82 dalam satu run, composite28capture/11flow/8guard tanpa error dan native zoom200% empat capture lulus, tanpa temuan Critical/Important. Worker ini tidak mengulang suite/zoom atau mengklaim hasil QA sebagai inspeksinya sendiri; kandidat READY untuk tahap switch oleh coordinator berikutnya.
- Artifact `/tmp/menujuakad-responsive-20261008/devops/release.tar.gz`, salinan `/srv/menujuakad/releases/preview-20261008-responsive/release.tar.gz`; SHA256 `92b380b9068cafdfee35f91d25cd8d75f78f2814c04e36c0a2e0bf05ac0927b0`. Release baru root `0555`, metadata/archive/snapshot Dockerfile/overlay `0444`. Runtime artifact read-only dengan execute bit yang diperlukan; bukan jaminan WORM.
- Build context **hanya** `/srv/menujuakad/releases/preview-20261008-responsive/artifact`, bukan repository/rancangan/runtime env. Docker memakai [Dockerfile existing](../deploy/Dockerfile), base `node:22-bookworm-slim@sha256:c3de60bf2f9dd0ac6370e6117950ff62d6e339527e7472301c9c78a017978392`, `--pull=false --network=none`; exit0, tidak fetch base atau menjalankan Next/Prisma kembali.
- Docker29.8.2/Compose5.5.1; Caddy active dan validasi exit0. Preflight RAM tersedia sekitar1,5GiB, swap terpakai1,3GiB, disk kosong28GiB. Kandidat mempertahankan batas768MiB/1CPU/pids256, usernode, read-only, tmpfs cache, capabilitydrop dan no-new-privileges existing; tidak menambah batas layanan lain.
- Enam probe preflight lulus: localhost3100 live/readiness200, HTTPS apex live/readiness200 dengan `--resolve`43.173.15.136 dan validasi sertifikat aktif, Breadwinner302 dan HariKita8080 200. Health kandidat live/readiness200, checks application/databaseok. Source runtime/auth/provider tidak berubah dan health DB bukan bukti backend bisnis aktif.

Checksum sebelum persiapan: Caddy `2c44c0e564473872830ba19ae34404570da827aa296665befa15ab8ab83f6818`, Compose utama `89db5bc3846946c09750bb57981fcbd541944201807ec95eb68f40e24c9856ac`, overlay Neon `979188328c04bab41fd481164d717cc690136489096c7b0b44552a50caadac60`. Nilai ini dicocokkan kembali sebelum handoff; tidak ada Caddy reload/switch. Port3107/3117 milik QA yang sedang berjalan saat preflight tidak disentuh.

### Sanitization, pemindaian dan backup

Build Next existing menyalin `.env` ke standalone. Worker menghapus **hanya salinan** `.next/standalone/.env` lewat `Path.unlink()` Python sebelum packaging; byte dan permission `.env` sumber diperiksa tetap identik tanpa mencetak nilainya. Guard [package existing](../deploy/scripts/package-standalone.sh) tetap utuh: menolak env/private-key/symlink keluar, memeriksa server dan melarang overwrite artifact. Script tersebut dipakai langsung tanpa modifikasi, setelah sanitization; setiap file hasil ekstraksi dicocokkan SHA256 dengan standalone dan BUILD_ID diverifikasi. Container memastikan `/app/.env` tidak ada; secret Neon berasal dari env_file root0600 existing.

Gitleaks8.30.1 `--redact=100`: snapshot seluruh source tracked/untracked nonignored, standalone, dan static masing-masing exit0/nol temuan. Source/static memakai rule default. Allowlist standalone disalin byte-identik dari konfigurasi existing: **AND** path `prerender-manifest.json` dan baris persis field previewModeSigningKey/previewModeEncryptionKey hex internal Next; tidak mengecualikan generic-api-key global. Known-secret check internal terhadap1746file standalone/static menemukan0file cocok dan0berkas env/private key terlarang; membaca `.env` source dan env runtime secara internal tanpa mencetak/log nilai. Hasil scan memiliki batas rule/cakupan, bukan jaminan semua rahasia terdeteksi.

Backup baru **`/srv/menujuakad/backups/before-preview-20261008-responsive`**, root0700, berisi `compose.yaml`, `compose.neon.yaml`, pointer `release.env` GST-01 dan metadata rilis sebelumnya, seluruhnya root0600. Tidak menyalin secret runtime atau menimpa folder rilis/backup sebelumnya. Runtime `/etc/menujuakad/runtime.env` tetap root0600. Update maupun rollback wajib memakai **dua Compose** aktif; overlay kandidat ketiga hanya mengganti ports dengan `!override` ke localhost3101, tanpa mengganti env_file, security atau resource.

### Smoke kandidat dan gate switch berikutnya

Smoke kandidat exit0: **24 capture** (6GST-01 default/empty, 8CUS-07, 10GST-01/GST-03 responsif), **6 flow lokal**, **4 guard actual**, **10 pemeriksaan kontrol** dan 6observasi breakpoint. Semua flow PASS; nol pageerror/HTTPaset≥400/request mutasi/provider/failure, source hashes tetap identik. Tambahan responsif membuktikan GST-01 mobile701/767 berlabel, GST-03grid1/2/4 sesuai viewport, empat status tetap terpisah, selector/tab≥48×48 dan tidak overflow320. BUILD_ID/sha/config/pointer cocok pada pemeriksaan final; produksi tetap GST-01, kandidat sehat tetap berjalan. Bukti `candidate-smoke/browser-report.json`, 24PNG, `candidate-smoke.log`/exit serta `final-consistency.json`; worker tidak mengklaim inspeksi piksel PNG.

Script scratch `/tmp/menujuakad-responsive-20261008/devops/capture-responsive.cjs` mengadaptasi capture rilis GST-01 existing tanpa menimpanya. Mendukung `RELEASE_SMOKE_BASE` dan `RELEASE_SMOKE_DIR` agar dapat dipakai ulang untuk HTTPS produksi setelah switch; `RELEASE_SMOKE_RESOLVE=1` mengaktifkan Chromium `--host-resolver-rules` untuk43.173.15.136 jika resolver lokal stale. Opsi produksi ini disiapkan, belum dijalankan pada task preflight. Tidak menonaktifkan verifikasi TLS. Scope mencakup capture GST-01 default/empty320/390/1440, harga CUS-07 tablet768/769/800/desktop1440 dengan/tanpa sentuhan, flow lokal dan reload, private denial dengan cookie palsu, serta tambahan GST-01/GST-03 pada320/701/767/768/1024 dan selector/tab48px tanpa overflow. Review visual masih tanggung jawab ROOT/QA.

**Tahap berikutnya setelah coordinator menyatakan gate QA final READY:** cocokkan BUILD_ID/diff/hasil QA dan smoke kandidat; update hanya project produksi `menujuakad` memakai image eksplisit responsif dan kedua Compose existing pada localhost3100 (`up -d --wait --wait-timeout 90 web`). Caddy tetap upstream3100 sehingga tidak perlu reload/DNS. Verifikasi health/live/DB, BUILD_ID, aset, label/noindex, private guard, layout701/767, GST-03grid4/2/1, target48, redirectHTTP/www/path/query/TLS, serta Breadwinner/HariKita. Baru setelah PASS tulis pointer release secara atomik root0600 dan metadata verifikasi, lalu hentikan hanya project kandidat. Jangan menyatakan zero downtime tanpa pengukuran. Tahap switch/pointer ini **belum dijalankan** pada task preflight.

Rollback konkret apabila update atau smoke publik gagal, dengan image GST-01 retained dan backup pointer baru:

```bash
sudo -n env MENUJUAKAD_IMAGE=menujuakad-web:preview-20261008-gst01 docker compose \
  --env-file /srv/menujuakad/backups/before-preview-20261008-responsive/release.env \
  --project-name menujuakad \
  -f /srv/menujuakad/deploy/compose.yaml \
  -f /srv/menujuakad/deploy/compose.neon.yaml \
  up -d --wait --wait-timeout 90 web
```

Cocokkan BUILD_ID GST-01, health live/readiness serta smoke HTTPS, kemudian pulihkan pointer backup bila pointer sudah berubah. Jika konfigurasi operasi berubah sejak backup, review diff sebelum pemulihan; jangan menimpa Caddy/domain lain atau melakukan rollback schema. Backup/image diverifikasi ada; rollback belum dieksekusi karena traffic belum dipindahkan, sehingga ini kesiapan pemulihan aplikasi, bukan uji restore DB.

Bukti privat di `/tmp/menujuakad-responsive-20261008/devops/`: `preflight.json` dan log sanitasi, `*-scan.json`/log/exit, `known-secret-check.json`, `package.log`, `release-prepared.json`, `docker-build-command.json`/log/exit, `candidate-image-id.txt`, `candidate-config`/`candidate-start` log/exit, `candidate-ready.json`, capture/report/log smoke, dan hasil final konsistensi konfigurasi. File source/tests serta `.next/BUILD_ID` tetap hasil QA; tidak membangun ulang. Laporan ini tidak mengubah status produksi pada dokumen deployment/changelog/progres, yang menjadi tugas tahap rilis berikutnya.

## Kesimpulan dan batas pekerjaan

Audit baca-saja pada **7 Oktober 2026, sekitar 17.13–17.15 WITA / UTC+8** menemukan DNS publik menujuakad.com sesuai catatan user. Target DNS **172.104.187.4 berbeda dari IP keluar workspace 43.173.15.136**. Tidak ada bukti bahwa Caddy workspace merupakan proxy VPS target. HTTP target merespons 404; koneksi HTTPS dan SSH port 22 mengalami timeout dari workspace. Username, port SSH yang sesungguhnya, host fingerprint, serta akses terotorisasi ke target belum tersedia.

**Status: deployment terhambat akses VPS dan menunggu gate kode/pengujian dari ROOT.** User telah mengizinkan hasil slicing ditampilkan pada menujuakad.com; tahap worker ini hanya audit dan persiapan. ROOT meminta informasi akses kepada user. Tidak ada login SSH, perubahan DNS, publikasi, migrasi, pemasangan dependency, perubahan proxy, restart layanan, commit, atau pengiriman Telegram. Prosedur dan konfigurasi berikut belum dijalankan di VPS.

Panduan proyek terbaru sudah mencatat izin slicing seluruh frontend dan publikasi domain; batas brainstorming sebelumnya merupakan riwayat. Pengujian fondasi lama tidak dianggap pengujian increment slicing baru. Pada audit awal worker menulis dokumen ini dan template `deploy/`. Pada followup 19.29 UTC+8 worker hanya memperbarui dokumen ini: source, template, artifact serta layanan tetap tidak diubah; progres/changelog dan dokumen deployment bersama dikonsolidasikan ROOT.

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

ROOT wajib menjalankan gate tersebut untuk **source slicing final**, mencatat hash commit/diff, BUILD_ID, versi Node, checksum artifact, serta hasil desktop/mobile. Artifact fondasi 15.30 UTC+8 pada audit awal bukan rilis slicing. Saat followup ditemukan snapshot standalone baru 19.26.38 UTC+8, tetapi source masih berubah dan QA belum final, sehingga keberadaan snapshot itu juga belum menjadi gate rilis. Worker tidak menjalankan ulang product test/build atau memasang dependency. Tidak ada CI/CD otomatis/SSH secrets yang dibuat; prosedur manual ini adalah draft operasional.

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
5. Siapkan vhost immutable `/etc/caddy/menujuakad-sites/<release-id>.caddy` dengan port kandidat. Hindari deklarasi domain ganda. Pada pemasangan pertama, buat symlink active ke vhost kandidat terlebih dahulu agar target import ada, lalu tambahkan **satu** import `/etc/caddy/menujuakad-active.caddy` pada Caddyfile existing yang sudah dibackup. Jangan menyalin template sebagai Caddyfile utama. Validasi konfigurasi gabungan sebelum reload, tanpa mengganti layanan/domain lain. Untuk rilis berikutnya import sudah ada; pointer active diganti pada langkah 6.
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

## Audit kompatibilitas frontend dan artifact — followup 19.29 UTC+8

Followup 7 Oktober 2026 ini hanya membaca source/sistem/artifact serta memvalidasi konfigurasi lokal. Tidak mengulang DNS, HTTP/HTTPS, koneksi SSH atau pencarian kredensial. Akses target belum tersedia sesuai status ROOT; username/user sistem/proxy/runtime VPS target belum dapat diverifikasi. Tidak menjalankan build, npm start, packaging, ekstraksi, migration atau service reload/restart. Semua template deploy dipertahankan tanpa perubahan.

### Temuan source dan aset saat ini

- CSS `src/app/styles/tokens.css` memakai tujuh font TTF lokal: Manrope 400/500/600/700 dan Noto Serif 400/500/600. Ketujuh file ada dalam `public/fonts` dan snapshot standalone. Satu CSS build juga memuat URL font lokal; tidak memuat fonts.googleapis.com/fonts.gstatic.com. Salinan lisensi OFL dan SOURCES.txt ikut dalam public. Pemeriksaan ini tidak melakukan request font remote maupun inspeksi browser.
- `scripts/prepare-standalone.mjs` menyalin public dan `.next/static`; perbandingan SHA-256 snapshot menemukan **12 file public dan 26 file static identik**, tanpa file hilang atau berbeda. Public termasuk font/lisensi serta ornamen SVG. Kode runtime tidak mengimpor sumber dari folder rancangan.
- Frontend fitur/komponen tidak mengimpor DB/provider/server dan tidak memiliki fetch provider pada pencarian source saat audit. `src/proxy.ts` memakai fixture/registry whitelist untuk penolakan URL contoh asing; proxy ini memerlukan runtime Next, sehingga hasil build bukan export HTML yang cukup disajikan file-server saja.
- Modul DB/env/health-query dan authorization memakai marker `server-only`. Layout dan page customer/admin memanggil guard; resolver sesi saat ini selalu null, sehingga `/dashboard` dan `/admin` seharusnya redirect login, bukan menggunakan sesi preview. `/preview-ui` memakai whitelist varian, banner data contoh dan metadata noindex. Ini hasil inspeksi source, bukan pengujian HTTP/RSC baru oleh worker.
- Aplikasi publik/preview tidak memerlukan koneksi DB. Prisma client dibuat lazy; `/api/health` tidak memanggil ping DB jika DATABASE_URL tidak ada. Kontrak expected: `/api/health/live` **200/ok**, `/api/health` **503/not_ready**, database `not_configured`. Tampilkan kondisi ini sebagai batas rilis frontend, bukan kegagalan proses atau bukti Neon terhubung. Jangan memasukkan DB/provider demo atau melakukan migrasi/seed untuk membuat indikator hijau.

### Struktur dan batas portabilitas snapshot standalone

Snapshot dibaca 19.29 UTC+8; `server.js`, BUILD_ID, public dan static bertimestamp **19.26.38 UTC+8**. Struktur wajib tersedia dan `node --check .next/standalone/server.js` lulus. Fullstack masih melakukan perbaikan; BUILD_ID ini belum dinyatakan rilis final, dan worker tidak mengemasnya.

Ada satu symlink `.next/node_modules/@prisma/client-2c3a283f134fdcb6` → `../../../node_modules/@prisma/client`; target berada **di dalam standalone** dan tidak dangling. Tar default mempertahankan symlink ini; jangan mengemas hanya server.js atau menghapus subtree node_modules. Tidak ditemukan nama file `.env`/`.env.*` selain contoh maupun id_rsa/id_ed25519 dalam snapshot; pemeriksaan nama tidak membaca nilainya dan tidak menggantikan content secret scan.

Native dependency yang tertrace: sharp `0.35.5`, binding `.node` Linux **x64** untuk glibc/musl, serta libvips `1.3.4` dengan `libvips-cpp.so.8.18.7`. Workspace x86_64, glibc 2.39. **Artifact bukan paket lintas arsitektur universal**: cocokkan Linux/x64, libc, versi OS dan Node di target; bila target ARM atau platform berbeda, buat ulang artifact dalam environment yang cocok setelah gate. Keberadaan varian glibc dan musl bukan bukti keduanya sudah diuji. Tidak menjalankan native module, ldd, container atau image optimizer pada followup.

Next 16.3.8 tersedia dalam trace. Prisma client 7.10.0 dan symlink internal tersedia; adapter Neon/server-only/dotenv tidak punya root package tersendiri pada trace, sehingga dapat sudah dibundle oleh Next dan tidak otomatis berarti artifact rusak. Direct `server.js` memakai output terkompilasi dan env systemd; tidak memanggil `scripts/start.mjs` atau dotenv CLI. Tidak menjalankan npm install/npm ci pada VPS untuk melengkapi artifact tanpa bukti dependensi hilang.

Prerender manifest snapshot berisi 14 route dan tidak mempunyai `initialRevalidateSeconds` numerik. Next/Image dipakai ornamen/floral SVG lokal. Izin `.next/cache` sudah menjadi ReadWritePaths template; kebutuhan write ISR di `.next/server` ditinjau ulang bila fitur revalidate/gambar dinamis ditambahkan. Jangan membuat seluruh release writable hanya untuk menghindari pemeriksaan cache.

### Temuan operasional yang perlu ditutup sebelum penerapan

| ID    | Status                               | Bukti dan tindakan sebelum rilis                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ----- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DO-01 | Terhambat akses                      | Host DNS telah diaudit sebelumnya, tetapi username/port/fingerprint/akses dan inventaris target belum tersedia. Caddy lokal breadwinner bukan target deployment. Pilihan systemd/Caddy tetap bersyarat.                                                                                                                                                                                                                                                                                                                            |
| DO-02 | Gate final belum selesai             | Source fullstack berubah dan laporan 06 masih PENDING ketika dibaca; laporan QA 10 memuat NEEDS_CHANGES/temuan Important. Worker tidak mengulang atau mengklaim test/build/E2E implementer. Tunggu source final, verdict QA dan log exit code lengkap ROOT sebelum membuat artifact rilis.                                                                                                                                                                                                                                         |
| DO-03 | File env wajib walau tanpa DB        | Kedua EnvironmentFile pada unit tidak memakai awalan opsional `-`. Buat `/etc/menujuakad/runtime.env` root:root 0600 **kosong atau hanya konfigurasi aman yang diperlukan**, serta file per-rilis berisi PORT sebelum start. File hilang membuat start gagal. Jangan membuat credential fiktif. EnvironmentFile dapat override Environment=, sehingga forbid HOSTNAME/NODE_ENV/NEXT_TELEMETRY_DISABLED pada file tersebut; bind localhost wajib dicek setelah start.                                                               |
| DO-04 | Script packaging belum mengikat gate | Script hanya memeriksa struktur/nama file/symlink dan syntax server.js; belum membandingkan source hash/diff/BUILD_ID dengan hasil test atau mendeteksi build berubah selama tar. Jalankan setelah build final selesai dengan source dan `.next` stabil, catat hash/diff/BUILD_ID/checksum; jangan memakai artifact sementara QA.                                                                                                                                                                                                  |
| DO-05 | Pemeriksaan secret terbatas          | Filter script hanya basename `.env*`, id_rsa, id_ed25519 berupa regular file; tidak mengenali semua nama private key/token atau secret embedded dalam JS/assets, dan symlink internal yang bernama env tidak ditolak oleh filter regular file. Lakukan content scan artifact final serta pemeriksaan symlink/nama file tersendiri sebelum upload. Hasil scan nama snapshot ini bukan klaim seluruh artifact bebas secret.                                                                                                          |
| DO-06 | Output/cleanup belum atomik          | Script menulis tar langsung ke tujuan dan mengikuti umask caller; kegagalan dapat meninggalkan file parsial, kemudian script menolak tujuan yang sudah ada. Gunakan direktori artifact privat, `umask 077`, nama baru per rilis; verifikasi gzip/tar dan checksum sesudah packaging. Penambahan staging file + rename dan cleanup terarah dapat dilakukan pada task deploy berikutnya, bukan audit source aktif ini. Jangan upload file parsial, menghapus nama acak atau memakai rm -f.                                           |
| DO-07 | Mode/template bukan instalasi        | Mode lokal script 0755 dan template 0664 hanya workspace. Saat terapkan, install unit/vhost root:root 0644, env root:root 0600, backup dir 0700; user menujuakad harus dibuat/ diverifikasi terpisah. Cache writable hanya bagi user aplikasi, release root:menujuakad tanpa tulis grup. User SSH tidak diasumsikan root maupun ubuntu.                                                                                                                                                                                            |
| DO-08 | Urutan first-deploy/rollback         | Import Caddy memerlukan target symlink yang sudah ada; urutan first-deploy pada prosedur di atas telah diperjelas. Simpan config lengkap/pointer/artifact/checksum sebelum edit, verifikasi backup dapat dibaca root, dan lindungi perubahan vhost existing dari overwrite concurrent. Pilih release-id terbatas huruf/angka/titik/underscore/hyphen tanpa slash/control dan nama baru untuk pointer `.next`; konfirmasi port kosong di target. Restore pertama memakai konfigurasi pra-deploy, bukan release lama yang belum ada. |

DO-04 sampai DO-06 adalah batas persiapan yang harus ditutup melalui prosedur/verifikasi artifact final; bukan alasan menjalankan packaging sekarang. Template tidak perlu diubah selama fullstack aktif. Backup TLS/secret tetap privat di luar repo; snapshot `/etc/caddy` saja tidak dianggap backup database, seluruh filesystem atau state TLS `/var/lib/caddy`.

### Validasi baru dan verdict followup

`bash -n deploy/scripts/package-standalone.sh` exit 0; `caddy validate --adapter caddyfile --config deploy/Caddyfile` exit 0 / **Valid configuration**; `systemd-analyze verify deploy/menujuakad@.service` exit 0. Caddy validasi lokal memprovision sementara dalam proses validasi lalu berhenti; tidak mengikat port, reload daemon, menerbitkan sertifikat live atau mengubah `/etc/caddy/Caddyfile`. Warning legacy PIDFile tat_agent berasal dari unit existing yang tidak diubah. `node --check` server standalone exit 0. Seluruh hasil ini hanya parser/struktur, bukan start/runtime smoke atau verifikasi VPS.

**Verdict: kompatibilitas source/struktur dasar tersedia; artifact final dan deployment target masih PENDING.** Tidak ada packaging/start/build baru pada followup. ROOT melanjutkan penutupan QA, gate source final, pemeriksaan artifact/native/platform/secrets dan audit target setelah akses tersedia. Migrasi produksi tidak termasuk kebutuhan rilis frontend sekarang.

## Hasil validasi dan langkah berikutnya

- Query DNS rekursif dan kedua NS authoritative selesai; record utama konsisten. Probe HTTP/cert/TCP terikat timeout; HTTPS/SSH belum terjangkau dari sesi ini.
- Pemeriksaan lokal baca-saja selesai: runtime, listeners, vhost, nama container, resource, firewall terbatas, serta keberadaan berkas SSH/env. Tidak membaca nilai rahasia.
- `bash -n deploy/scripts/package-standalone.sh`, `systemd-analyze verify deploy/menujuakad@.service`, dan `caddy adapt --adapter caddyfile --config deploy/Caddyfile` lulus. Systemd memberi warning path PIDFile legacy pada layanan existing tat_agent; bukan kesalahan unit baru dan tidak diubah.
- Konfigurasi belum di-install/start/reload di mesin mana pun. Validasi parser tidak membuktikan koneksi DB, sertifikat, layanan systemd berjalan, atau production deployment.
- Pembungkus artifact berhasil mengemas standalone fondasi lokal ke `/tmp/menujuakad-devops-audit-20261007-standalone.tar.gz`, SHA-256 `a84b8834d62ee1037befc94da9c683be66d4f0fce3314dad44fd61bf455918f3`. Struktur dan nama berkas environment/kunci dalam archive diperiksa; tidak ditemukan. Artifact ini bukan build slicing final dan tidak diunggah atau dipakai publish.
- Langkah berikutnya: ROOT menerima identitas/akses VPS, menuntaskan slicing dan gate pengujian, lalu melanjutkan audit target serta rencana proxy sesuai server sebenarnya. Sampai itu selesai, **kode persiapan tersedia; produksi belum terverifikasi**.

## Probe dan build resume — 7 Oktober 2026

ROOT menjalankan build terintegrasi billing/GST/SEO setelah227 unit/schema/typecheck/lint lulus.42 skenario browser mempunyai hasil lulus dari run40/42 dan rerun dua SEO. Probe TCP target172.104.187.4 port22/443 dengan timeout5detik kembali TimeoutError. Tidak ada login/inspeksi/penerapan target atau perubahan DNS/proxy. Gate visual/content secret scan dan akses sah tetap diperlukan sebelum publikasi; izin user sudah tersedia.

Artifact lokal resume: `/tmp/menujuakad-resume-20261007-2319.tar.gz`, SHA-256 `c5be01436cbd989f6486ae44225a3232bcbcfb15b061fa157a4e7881f18bd314`. Script packaging menolak berkas environment/kunci dan symlink keluar, serta memeriksa sintaks server. Belum diunggah/dijalankan. Pemeriksaan pola rahasia terbatas source domain baru menghasilkan nol temuan; ini tidak menggantikan content scan artifact/repository lengkap.

## Audit rahasia lanjutan — 7 Oktober 2026

Gitleaks8.30.1 memeriksa sepuluh commit (1,39MB), snapshot seluruh file tracked/untracked nonignored (826KB) serta standalone (4,94MB). Riwayat dan snapshot source tidak mempunyai temuan. Scan default standalone memberi dua temuan generic-api-key pada previewModeSigningKey/previewModeEncryptionKey di prerender-manifest.json. Field ini key internal Next.js hasil build, bukan kredensial provider; tidak dicetak nilainya atau dipindahkan ke public. Scan ulang bersih dengan allowlist AND yang dibatasi nama file manifest dan baris tepat dua field hex itu. Tidak memakai pengecualian global generic-api-key. Konfigurasi audit sementara /tmp/menujuakad-gitleaks-build.toml; hasil ini mengikuti cakupan/rule Gitleaks, bukan jaminan absolut.

Artifact SHA256 tetap c5be01436cbd989f6486ae44225a3232bcbcfb15b061fa157a4e7881f18bd314. Akses target belum tersedia: folder SSH lokal tidak mempunyai config/kunci klien, hanya authorized_keys kosong. Tidak menebak username, menonaktifkan host-key verification atau mengubah layanan/DNS.
