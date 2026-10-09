# Deployment VPS Menuju Akad

## Rilis responsif GST-01/GST-03 dan kontrol — 8 Oktober 2026

**Status fase 3: `preview-20261008-responsive` aktif dan smoke HTTPS produksi PASS pada 8 Oktober 2026, 06.14 UTC+8.** Produksi https://menujuakad.com memakai BUILD_ID **`mb6ybS2E4cGWPE7718LeW`**, container `menujuakad-web-1` healthy pada `127.0.0.1:3100`. Increment menyelaraskan mobile GST-01 sampai 767 px, grid empat kategori GST-03 mengikuti 4/2/1 kolom, serta target tab domain/selector varian minimal 48×48 px tanpa overflow. Rilis GST-01/CUS-07 di bawah merupakan riwayat dan image rollback terdekat. Scope tetap frontend/preview sintetis; auth, Mayar, persistence bisnis dan fidelity seluruh Stitch belum selesai. Neon preproduction baca terbatas dipertahankan melalui dua Compose.

### Identitas dan gate rilis responsif

- Artifact `/tmp/menujuakad-responsive-20261008/devops/release.tar.gz`, salinan `/srv/menujuakad/releases/preview-20261008-responsive/release.tar.gz`; SHA256 `92b380b9068cafdfee35f91d25cd8d75f78f2814c04e36c0a2e0bf05ac0927b0`. BUILD_ID cocok pada `.next`, standalone, artifact, kandidat dan container produksi.
- Image aktif `menujuakad-web:preview-20261008-responsive`, ID `sha256:8736708e2cd7c4d303dfe051ef2494dfb6c49c0521c7d39868e2c9de1e4e8337`. Context hanya `/srv/menujuakad/releases/preview-20261008-responsive/artifact`; base pinned `node:22-bookworm-slim@sha256:c3de60bf2f9dd0ac6370e6117950ff62d6e339527e7472301c9c78a017978392`, build Docker `--pull=false --network=none`. Tidak membangun ulang Next, mengubah source/tests, dependency, DB/schema, provider atau `.env` sumber pada task publikasi.
- Gate lokal: `npm run check` exit0, 243 unit/18 file dan build; regresi scoped 28/28. QA mengonfirmasi **full E2E 82/82 dalam satu run**, review tanpa Critical/Important, 28 capture/11 flow/8 guard dan empat capture native zoom 200% pada kandidat lokal. Bukti QA pada [dokumen10](10-qa-validasi.md); native zoom tidak diulang pada HTTPS produksi. Suite/check tersebut tidak dijalankan ulang oleh DevOps tanpa perubahan source.
- Preflight, sanitization dan build image pada [dokumen02](02-devops-deployment.md): hanya salinan `.next/standalone/.env` dihapus dengan Python unlink, source env tetap identik, package guard existing tidak dilonggarkan. Gitleaks source/standalone/static `--redact=100` exit0/nol temuan; allowlist standalone terbatas AND path+baris dua field preview mode internal manifest Next. Known-secret check 1.746 file internal menghasilkan nol kecocokan tanpa log nilai. Hasil ekstraksi cocok byte-per-file dan container produksi memastikan `/app/.env` tidak ada.
- Release root `0555`; runtime artifact read-only dengan execute bit yang diperlukan, metadata/archive/overlay/Dockerfile `0444`. `release.json` diperbarui atomik dengan status verified-production/timestamp/smoke; payload artifact tidak diubah. Pointer `/srv/menujuakad/deploy/release.env` root `0600` ditulis atomik **setelah** smoke HTTPS PASS pada 06.14.01 UTC+8.

### Smoke kandidat dan HTTPS produksi responsif

Browser kandidat isolated `http://127.0.0.1:3101` dijalankan ulang sebelum switch memakai artifact yang sama. Dua state GST-01 pada 701/767 px, GST-03 hingga 1440 px, kontrol dan keyboard ditambahkan pada smoke preflight. Setelah kandidat PASS, worker menginspeksi ulang image GST-01, backup/pointer, checksum Caddy dan kedua Compose, lalu mengganti hanya project produksi `menujuakad` dengan image eksplisit dan **Compose utama bersama overlay Neon**. Tidak reload Caddy, mengubah DNS atau melakukan migrasi/seed. Switch dimulai **06.12.48**, Compose healthy **06.12.55**, verifikasi selesai **06.14.01 UTC+8**. Downtime tidak diukur sehingga tidak diklaim zero downtime.

| Pemeriksaan browser                                                      | Kandidat localhost3101                                    | HTTPS menujuakad.com                                     |
| ------------------------------------------------------------------------ | --------------------------------------------------------- | -------------------------------------------------------- |
| GST-01 default/empty, 320/390/701/767/1440 px                            | 10 capture lulus                                          | 10 capture lulus                                         |
| GST-01/GST-03 responsif, 320/701/767/768/1024/1440 px                    | 12 capture lulus; grid 1/2/4 sesuai lebar                 | 12 capture lulus; grid 1/2/4 sesuai lebar                |
| CUS-07 harga, 768/769/800/1440 px dengan/tanpa sentuhan                  | 8 capture lulus; harga muat dalam kartu                   | 8 capture lulus; harga muat dalam kartu                  |
| Selector GST-01/CUS-08 dan kelima tab domain                             | 12 pemeriksaan kontrol ≥48×48, tanpa overflow dokumen/nav | Hasil sama, seluruh target dalam viewport                |
| Keyboard Tab/focus-visible/Enter pada 320 dan 767 px                     | 2 flow dan 2 capture lulus; navigasi Statistik berjalan   | Hasil sama; bukan pengujian kontras piksel/screen reader |
| Filter, pagination, tambah/reset/reload, empty/denominator nol           | 10 flow lokal lulus; tambahan di memori                   | 10 flow lokal lulus; tidak mempersistensi/mengirim tamu  |
| Guard dashboard/billing dan admin/payments dengan cookie role/sesi palsu | 4 route menuju login, konten private0                     | 4 route menuju login, konten private0                    |
| Pageerror, HTTP aset≥400, nonGET/HEAD dan provider request               | Semua array kosong; source hash tetap                     | Semua array kosong; source hash tetap                    |

Total per target **32 PNG**, **12 flow** termasuk keyboard, **4 guard**, **12 pemeriksaan kontrol**, dan **6 observasi breakpoint**. Preview noindex dan berlabel data contoh. Empat status Hadir/Tidak hadir/Masih ragu/Belum menjawab tetap berbeda; nilai fixture tidak diubah. GST-01 empty pada 701/767 menjaga ringkasan nol tanpa NaN/Infinity dan tambahan lokal memiliki kelima bidang berlabel. Capture/DOM ini bukan klaim fidelity piksel seluruh desain. ROOT melaporkan review tiga PNG produksi: GST-03 pada 768/1440 px dan GST-01 pada 767 px, dengan hasil scoped baik; ini inspeksi reviewer terpisah, bukan klaim inspeksi gambar worker.

Sembilan probe pascaswitch lulus: localhost3100 live/readiness200; HTTPS homepage/live/readiness200 dengan databaseok; HTTP apex308 dan HTTPS www308 ke HTTPS apex dengan path/query utuh; Breadwinner HTTPS302 ke `/login` dan HariKita nginx localhost8080 200. Curl memakai `--resolve`, Chromium memakai pemetaan host ke VPS43.173.15.136; **validasi TLS tetap aktif**, tanpa `-k`/ignoreHTTPSErrors. Pemeriksaan final resolver OS serta NS1/NS2 DomaiNesia kini menjawab43.173.15.136. Ini bukti resolver yang diperiksa, bukan semua jaringan pengguna.

### Pemulihan, monitoring dan bukti rilis responsif

Backup `/srv/menujuakad/backups/before-preview-20261008-responsive` root `0700`, kedua Compose/pointer GST-01/metadata sebelumnya root `0600`. Image rollback **`menujuakad-web:preview-20261008-gst01`**, ID `sha256:28a81588838d9f43e17172aa717b1949e93e97b73de618a5f8e6c97dafe28a2c`, BUILD_ID `gszjNXdxoHXetHRgCAn0g`; artifact/tag awal `preview-20261008` juga retained. Script `switch-responsive.py` menyiapkan rollback otomatis ke GST-01 memakai backup pointer dan dua Compose jika update, health atau smoke HTTPS gagal, lalu memverifikasi health/BUILD_ID dan memulihkan pointer. **Rollback tidak terpicu**, sehingga ini kesiapan pemulihan aplikasi, bukan uji restore DB.

Rollback manual jika ada kegagalan setelah rilis, setelah memeriksa konfigurasi yang mungkin berubah sejak backup:

```bash
sudo -n env MENUJUAKAD_IMAGE=menujuakad-web:preview-20261008-gst01 docker compose \
  --env-file /srv/menujuakad/backups/before-preview-20261008-responsive/release.env \
  --project-name menujuakad \
  -f /srv/menujuakad/deploy/compose.yaml \
  -f /srv/menujuakad/deploy/compose.neon.yaml \
  up -d --wait --wait-timeout 90 web
```

Setelah health/BUILD_ID/smoke HTTPS GST-01 PASS, pulihkan pointer dari backup melalui file sementara root0600 dan rename atomik. Jangan memakai Compose frontend saja, menimpa Caddy/domain lain atau melakukan rollback schema. Runtime `/etc/menujuakad/runtime.env` tetap root0600; batas customer/admin serta provider tetap existing.

Kandidat `menujuakad-responsive-candidate` dihentikan memakai Compose `down` setelah PASS; hanya container/network kandidat dihapus, tanpa image/volume prune. Port3101 kosong kembali. Caddy dan checksum dua Compose identik sebelum/sesudah: Caddy `2c44c0e564473872830ba19ae34404570da827aa296665befa15ab8ab83f6818`; utama `89db5bc3846946c09750bb57981fcbd541944201807ec95eb68f40e24c9856ac`; Neon `979188328c04bab41fd481164d717cc690136489096c7b0b44552a50caadac60`. MenujuAkad/HariKita app/DB healthy, command-center running; resource snapshot aplikasi sekitar127MiB dari limit768MiB, RAM tersedia1,9GiB, disk tersedia28GiB dan swap terpakai1,3GiB. Snapshot bukan profiling beban/kapasitas jangka panjang. Alert eksternal belum dipasang; monitor health, container restarts/RAM/disk/TLS melalui operasi existing.

Bukti privat `/tmp/menujuakad-responsive-20261008/devops/`: `candidate-smoke` dan `production-smoke` masing-masing report/32 PNG/snapshot ARIA; `candidate-release-smoke.log`/exit, `production-release-smoke.log`/exit, `production-compose-switch.log`/exit, `switch-report.json`, `switch-responsive.py`, `release-final.json`, `release-final-check.json`, `candidate-cleanup.log`/exit, resource/resolver/hash/permission final. Report smoke preflight awal tetap pada `candidate-smoke-preflight`; tidak menimpa rilis/artifact GST-01. Scan source final setelah konsolidasi dokumentasi: **snapshot source final diperiksa memakai Gitleaks8.30.1 `--redact=100`, rule default; log/JSON/exit pada `source-release-final-scan.*`. **Exit0/nol temuan** pada 289 file snapshot, setelah dokumentasi rilis disusun dan sebelum pembaruan PM berikutnya**.

Hasil aktual: frontend responsif scoped **terverifikasi produksi** pada artifact final. Source/tests/`.env` sumber tidak diubah selama publikasi; hanya dokumen deployment ini diperbarui, tanpa commit/push. Slicing/fidelity semua layar, sesi nyata, Mayar, backend/persistence bisnis, seluruh browser/state, audit kontras dan screen reader tetap terbuka; koneksi readiness Neon bukan bukti modul bisnis selesai.

## Rilis pembaruan GST-01/CUS-07 — 8 Oktober 2026

**Riwayat fase 2: `preview-20261008-gst01` aktif saat itu dan smoke produksi lulus pada 8 Oktober 2026, 03.32 UTC+8.** Container `menujuakad-web-1` healthy pada `127.0.0.1:3100`; Caddy existing tetap meneruskan traffic ke port tersebut. Scope rilis adalah empat ringkasan/tabel tamu GST-01 serta perbaikan harga paket CUS-07 pada tablet. Preview tetap sintetis dan noindex; auth/Mayar/persistence fitur belum aktif. Neon preproduction existing tetap terhubung dengan role runtime baca terbatas. Backend lengkap dan fidelity seluruh Stitch belum dinyatakan selesai.

### Gate, artifact dan identitas rilis

- ROOT mengonfirmasi gate `/tmp/menujuakad-qa-final-20261008`: `npm run check` exit0, 243 unit/18 file, build lulus; E2E final 54/54 lulus dalam 2,7 menit setelah konfigurasi khusus test diperbaiki. Hash source runtime dan BUILD_ID dicocokkan sebelum packaging; perubahan konfigurasi test tidak masuk build runtime.
- BUILD_ID: `gszjNXdxoHXetHRgCAn0g`, cocok pada `.next`, standalone, artifact, kandidat dan container produksi.
- Artifact: `/tmp/menujuakad-preview-20261008-gst01.tar.gz`, juga disimpan sebagai `/srv/menujuakad/releases/preview-20261008-gst01/release.tar.gz`; SHA256 `7494a0cbfa288dd66e57cdcb767f49f08df456d09344d8e4f144d477379e5bb7`.
- Image aktif: `menujuakad-web:preview-20261008-gst01`; ID `sha256:28a81588838d9f43e17172aa717b1949e93e97b73de618a5f8e6c97dafe28a2c`.
- Base pinned yang sudah tersedia lokal: `node:22-bookworm-slim@sha256:c3de60bf2f9dd0ac6370e6117950ff62d6e339527e7472301c9c78a017978392`. Docker build memakai `--pull=false --network=none`, [Dockerfile existing](../deploy/Dockerfile), context **hanya** `/srv/menujuakad/releases/preview-20261008-gst01/artifact`; tidak menjalankan ulang Next/Prisma/migrasi di image.
- Direktori release dimiliki root, `0555`; metadata `release.json`, `artifact.sha256`, `release.tar.gz`, Dockerfile snapshot dan overlay kandidat `0444`. Runtime artifact mempertahankan execute bit yang diperlukan tetapi tidak writable. Ini proteksi permission/aturan tanpa overwrite, bukan filesystem WORM. Metadata mencatat QA, checksum, base, waktu switch/verification dan identitas rollback.
- Pointer `/srv/menujuakad/deploy/release.env` ditulis atomik root `0600` **setelah** smoke produksi PASS. Tag/image/artifact lama dipertahankan; tidak ada commit/push pada increment DevOps ini.

### Temuan packaging dan perlindungan rahasia

Packaging langsung memakai [script existing](../deploy/scripts/package-standalone.sh) awalnya **ditolak** karena `.next/standalone/.env` ada (mode `0600`). Inspeksi source Next terpasang, `node_modules/next/dist/build/index.js` pada `writeStandaloneDirectory`, membuktikan build standalone menyalin `.env`/`.env.production` yang dimuat. Nilai environment tidak dicetak. Packaging ditahan sebelum tar/image dibuat.

Resolusi rilis memakai staging privat `/tmp/menujuakad-gst01-package-stage-0f_md2qz`: seluruh runtime disalin byte-identik dengan mengecualikan `.env`, `.env.*`, `id_rsa`, dan `id_ed25519`; script packaging existing disalin byte-identik ke staging dan dijalankan dari sana. Semua berkas runtime selain pengecualian dicocokkan SHA256. `.next` hasil QA dan source aplikasi tidak diubah. Paket diekstrak dan diperiksa lagi tanpa berkas environment/kunci privat. Probe di container kandidat maupun produksi membuktikan `/app/.env` tidak ada; Neon hanya berasal dari env_file runtime existing.

Gitleaks 8.30.1 `/tmp/menujuakad-security-tooseog1/gitleaks` dipakai dengan `--redact=100`. Source snapshot nonignored, artifact hasil ekstraksi dan static menghasilkan exit0/nol temuan. Allowlist `/tmp/menujuakad-gitleaks-build.toml` hanya berlaku pada artifact/standalone, terbatas field `previewModeSigningKey`/`previewModeEncryptionKey` di `prerender-manifest.json` dengan path+baris AND; source/static memakai default. Pembandingan nilai rahasia lokal secara internal terhadap seluruh artifact juga menghasilkan nol kecocokan, tanpa mencatat nilainya. Bukti source awal di `/tmp/menujuakad-gst01-audit-ds7rnn_d`; scan/pemeriksaan final di `/tmp/menujuakad-gst01-release-smoke`, bukan `public/` atau repository.

Batas audit: hasil Gitleaks saja tidak membuktikan semua secret terdeteksi dan tidak mengaudit DB/Git history/container environment. Temuan `.env` ini menunjukkan perlunya guard packaging eksplisit meski scan nol temuan. Perbaikan permanen alur staging/sanitization dalam tooling build masih pekerjaan berikutnya; deployment berikutnya wajib tetap menolak atau mengecualikan environment sebelum packaging, tidak melonggarkan guard/allowlist.

### Pemeriksaan kandidat dan produksi

Kandidat memakai project Docker terpisah `menujuakad-gst01-candidate`, port kosong `127.0.0.1:3101`, dua Compose existing serta overlay `services.web.ports: !override ["127.0.0.1:3101:3000"]`. `config --quiet`, `up -d --wait --wait-timeout 90`, health/liveness/readiness200 dan BUILD_ID cocok. User `node`, filesystem read-only, limit RAM768MiB/CPU1 dan env_file Neon dipertahankan. Tidak ada traffic Caddy yang diarahkan ke kandidat.

| Smoke browser                                             | Kandidat localhost3101                            | Produksi HTTPS apex                               |
| --------------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------- |
| GST-01 default/empty, viewport1440/390/320                | 6 kombinasi lulus                                 | 6 kombinasi lulus                                 |
| CUS-07, viewport768/769/800/1440, touch/non-touch         | 8 kombinasi lulus; seluruh harga di dalam kartu   | 8 kombinasi lulus; seluruh harga di dalam kartu   |
| Filter/pagination/summary, tambah contoh dan reset reload | 6 alur lokal lulus                                | 6 alur lokal lulus                                |
| Actual customer/admin dengan cookie peran/sesi palsu      | 4 route menuju login; konten private tidak muncul | 4 route menuju login; konten private tidak muncul |
| Breakpoint GST-01 700/701/767/768/1023/1024               | 6 pemeriksaan tanpa document overflow             | 6 pemeriksaan tanpa document overflow             |
| Error browser/HTTP aset, write/provider request           | Semua array kosong                                | Semua array kosong                                |

Browser memeriksa empat kartu; header tabel semantik lima kolom; lima label sel mobile terlihat; tombol pagination minimal48px; baseline `120` tamu/kursi, `100 / 120` pengiriman dan `57%` hadir. Tambah lokal mengubah `121`, `100 / 121`, `56%`; filter tidak mengubah denominator dan reload mengembalikan fixture. Varian empty menjaga nilai0 tanpa NaN/Infinity dan baris tambahan lokal memiliki lima sel berlabel. Semua interaksi lokal tersebut tidak menghasilkan POST/PUT/PATCH/DELETE atau panggilan provider.

ROOT melakukan review visual tersendiri pada tiga PNG **produksi**: GST-01 desktop1440/mobile390 dan CUS-07 tablet768; empat kartu, lima label mobile dan harga muat di kartu teramati. Worker DevOps memvalidasi DOM/geometri dan capture, bukan mengklaim review gambar ROOT sebagai inspeksi visual worker. Minor QA-FINAL-01, kartu GST-01 dua kolom pada701–767px yang belum konsisten dengan breakpoint mobile, tetap backlog nonblocking; bukan klaim fidelity seluruh layar selesai.

Produksi diganti menggunakan **project `menujuakad` dan kedua Compose aktif**, image baru eksplisit, `up -d --wait --wait-timeout 90 web`. Mulai switch03.31.18 dan seluruh verifikasi selesai03.32.05 UTC+8; tidak mengukur downtime, jadi tidak mengklaim zero downtime. Script `/tmp/menujuakad-gst01-release-smoke/switch-and-verify.py` menyiapkan rollback image lama bila start/post-smoke gagal; rollback tidak terpicu. Hasil `/tmp/menujuakad-gst01-release-smoke/switch-report.json`: PASS, rollback false.

Sembilan probe HTTP setelah switch lulus: localhost liveness/readiness200; HTTPS apex beranda/liveness/readiness200 (database ok); HTTP apex308 dan HTTPS www308 ke HTTPS apex dengan path/query utuh; Breadwinner HTTPS302 ke `/login` sesuai baseline; HariKita nginx localhost8080 200. TLS apex/www divalidasi tanpa `-k`. Bukti browser produksi ada di `production/browser-report.json`, log dan14 PNG terkait; kandidat pada `candidate/`. Artefak pengujian bersifat privat, fixture tidak berisi kontak tamu nyata.

Resolver OS masih mengembalikan `172.104.187.4`; request biasa melalui resolver itu HTTPS timeout/HTTP404. Probe HTTPS memakai `curl --resolve` dan browser memakai host-resolver rule menuju **VPS43.173.15.136**. Ini memverifikasi HTTPS/browser server produksi yang benar, bukan propagasi resolver OS atau semua jaringan pengguna. ROOT juga mengonfirmasi healthHTTPS/DBok, BUILD_ID dan empat kartu/noindex secara independen. Tidak mengubah DNS/cache resolver, Caddy, mail atau FTP.

Kandidat dihentikan dengan `docker compose --project-name menujuakad-gst01-candidate ... down`; hanya container/network kandidat dihapus, tanpa volume/image prune. Port3101 sudah kosong kembali. Pemeriksaan final: MenujuAkad image baru healthy; HariKita app/database healthy; command-center running; Caddy active. Dua Compose dan SHA Caddy sama dengan sebelum rilis. `/etc/menujuakad/runtime.env` tetap root0600, private guard tidak diubah, tidak ada migrasi/seed/provider/mutasi DB bisnis.

### Backup dan rollback konkret

Backup `/srv/menujuakad/backups/before-preview-20261008-gst01` tersedia root `0700`; `compose.yaml`, `compose.neon.yaml`, pointer `release.env` lama dan metadata `release.json` masing-masing `0600`. Tidak menyalin runtime secret atau konfigurasi domain lain. SHA256 Compose utama `89db5bc3846946c09750bb57981fcbd541944201807ec95eb68f40e24c9856ac`, overlay Neon `979188328c04bab41fd481164d717cc690136489096c7b0b44552a50caadac60`, Caddy `2c44c0e564473872830ba19ae34404570da827aa296665befa15ab8ab83f6818`; ketiganya identik sebelum/sesudah switch.

Rollback siap menggunakan `menujuakad-web:preview-20261008`, ID `sha256:2a16e51a7b310d414a434729155c10d40339635932d74ccd60047d61c0b746ec`, BUILD_ID `TvGWM-S79UXw-k7mIpG36`. Artifact lama `/tmp/menujuakad-preview-20261008.tar.gz` SHA256 `b10e6647b8d9943cad8f79b8d084c2906a4ccd1409585cec69daef3333fe3ce4` dan release `/srv/menujuakad/releases/preview-20261008` tetap tersedia. Image lama dan backup diverifikasi keberadaannya; rollback sesudah switch ini belum dieksekusi karena produksi lulus, sehingga ini kesiapan pemulihan aplikasi, bukan uji restore DB.

Jika health/alur utama gagal, inspeksi selisih konfigurasi sejak rilis, lalu jalankan rollback berikut dengan kedua Compose agar Neon tetap tersambung:

```bash
sudo -n env MENUJUAKAD_IMAGE=menujuakad-web:preview-20261008 docker compose \
  --env-file /srv/menujuakad/backups/before-preview-20261008-gst01/release.env \
  --project-name menujuakad \
  -f /srv/menujuakad/deploy/compose.yaml \
  -f /srv/menujuakad/deploy/compose.neon.yaml \
  up -d --wait --wait-timeout 90 web
sudo -n install -o root -g root -m 0600 \
  /srv/menujuakad/backups/before-preview-20261008-gst01/release.env \
  /srv/menujuakad/deploy/release.env
curl --fail --max-time 15 http://127.0.0.1:3100/api/health/live
curl --fail --max-time 15 http://127.0.0.1:3100/api/health
```

Lanjutkan smoke HTTPS/aset/preview/noindex/private denial serta cek Breadwinner/HariKita. Image eksplisit menang atas pointer, overlay Neon membaca secret existing. Jangan memakai Compose frontend saja untuk rollback image; jangan rollback schema/proxy atau menimpa perubahan layanan lain. Jika Compose sudah berubah, review selisih sebelum memulihkan backup. Monitoring memakai dua Compose dan pointer aktif; jangan mencetak environment, full inspect atau `compose config` tanpa `--quiet`.

## Konfigurasi database aktif — 8 Oktober 2026

Neon preproduction sudah terhubung melalui `/srv/menujuakad/deploy/compose.neon.yaml`, file runtime root0600 di `/etc/menujuakad/runtime.env` dan role baca terbatas `menujuakad_runtime_preproduction`. Baseline schema impor dan checksum terverifikasi; detail izin, rotasi owner dan batas backend pada [database](database.md). Gunakan dua berkas Compose pada update berikutnya agar DB tidak terlepas. Jangan mencetak hasil `compose config` tanpa `--quiet` atau env/container inspect penuh. Untuk rollback konfigurasi, Compose frontend tanpa overlay dapat dijalankan; frontend tetap hidup dan health DB kembali503. Ini bukan rollback schema/data.

## Izin, lingkup rilis dan status

**Frontend telah diterbitkan pada 8 Oktober 2026 di https://menujuakad.com.** User mengonfirmasi VPS yang menjalankan `breadwinner.my.id` sebagai server tujuan dan memprioritaskan pemeriksaan browser. Konfirmasi tersebut menggantikan asumsi audit 7 Oktober bahwa VPS tujuan harus mengikuti IP DNS lama `172.104.187.4`.

Container Docker `menujuakad-web-1` berjalan sehat pada VPS `43.173.15.136`, dengan port `127.0.0.1:3100` dan Caddy existing sebagai proxy. Vhost Breadwinner tetap utuh. HTTPS apex/www diterbitkan Let’s Encrypt; HTTP diarahkan ke HTTPS dan www ke apex. DNS authoritative kedua NS DomaiNesia, Cloudflare dan Google telah terpantau menunjuk IP baru; perubahan panel tidak dilakukan oleh agent karena akses panel tidak tersedia. Resolver lokal masih menyimpan IP lama pada pemeriksaan awal, sehingga propagasi cache dapat berlangsung hingga TTL lama empat jam.

Rilis ini memuat frontend publik dan `/preview-ui/*` sintetis berlabel/noindex. Customer/admin aktual tetap diarahkan ke login berdasarkan guard server. Neon `menujuakad-preproduction` kini terhubung dengan role runtime baca terbatas; auth, Mayar, storage dan persistence fitur belum aktif. Liveness `/api/health/live` dan readiness `/api/health` keduanya200. Hasil QA lokal terdahulu 227 unit/46 E2E tetap terpisah dari smoke deployment. Review fidelity seluruh Stitch masih terbuka; user memprioritaskan publikasi frontend agar dapat diperiksa langsung.

## Rilis Docker awal dan pemulihan

- Release: `preview-20261008`; BUILD_ID `TvGWM-S79UXw-k7mIpG36`.
- Artifact: `/tmp/menujuakad-preview-20261008.tar.gz`; SHA256 `b10e6647b8d9943cad8f79b8d084c2906a4ccd1409585cec69daef3333fe3ce4`.
- Image: `menujuakad-web:preview-20261008`; ID `sha256:2a16e51a7b310d414a434729155c10d40339635932d74ccd60047d61c0b746ec`.
- Base Node: `node:22-bookworm-slim@sha256:c3de60bf2f9dd0ac6370e6117950ff62d6e339527e7472301c9c78a017978392`.
- Artifact release dan metadata: `/srv/menujuakad/releases/preview-20261008`; konfigurasi operasional: `/srv/menujuakad/deploy`.
- Source konfigurasi: [Dockerfile](../deploy/Dockerfile), [Compose](../deploy/compose.yaml), [vhost HTTPS](../deploy/Caddyfile), [finalizer DNS](../deploy/scripts/finalize-domain.sh). Build Docker menggunakan direktori artifact sebagai context, tidak memasukkan repository/rancangan/environment layanan lain.
- Container memakai user `node`, filesystem read-only, cache sementara, capability dibuang, batas RAM768MiB/CPU1, restart policy, healthcheck dan rotasi log. Network/project Compose terpisah dari HariKita/command-center; port aplikasi tidak dibuka ke Internet.
- Backup pra-deploy: `/srv/menujuakad/backups/Caddyfile.before-preview-20261008`; backup transisi HTTPS: `Caddyfile.before-https`. File backup hanya dapat dibaca root.
- Timer systemd DNS telah mengaktifkan HTTPS setelah kedua nameserver sesuai dan dinonaktifkan otomatis setelah HTTPS/liveness publik lulus pada `2026-10-08T00:06:41+08:00`. Normalnya timer tidak perlu dijalankan ulang. Pembaruan sertifikat selanjutnya dikelola Caddy.
- Untuk rollback aplikasi berikutnya: pilih tag release tervalidasi sebelumnya, jalankan Compose utama **bersama overlay Neon** dengan `MENUJUAKAD_IMAGE=<tag>` dan `up -d --wait`, lalu smoke. Prosedur konkret pembaruan GST-01/CUS-07 berada pada section rilis di atas. Release pertama belum memiliki tag aplikasi sebelumnya; untuk mencabut rilis, pulihkan hanya vhost Menuju Akad setelah memeriksa perubahan Caddy terkini, validasi/reload, kemudian hentikan hanya project Compose `menujuakad`. Jangan menimpa perubahan domain lain yang ditambahkan setelah backup.
- Monitoring tersedia melalui `docker compose ps`, `docker compose logs --tail=100` dan `journalctl -u caddy`. Alert eksternal serta CI/CD otomatis belum dipasang. Jangan menjalankan migrasi/seed untuk rilis frontend ini.

Contoh pemeriksaan operasional:

```bash
sudo -n docker compose --env-file /srv/menujuakad/deploy/release.env \
  -f /srv/menujuakad/deploy/compose.yaml \
  -f /srv/menujuakad/deploy/compose.neon.yaml ps
curl --fail https://menujuakad.com/api/health/live
sudo systemctl is-active caddy
```

## DNS DomaiNesia setelah koreksi target

| Record               | Status terpantau 8 Oktober 2026                                 |
| -------------------- | --------------------------------------------------------------- |
| `@` A                | `43.173.15.136`                                                 |
| `www` CNAME          | `menujuakad.com.`                                               |
| AAAA                 | Tidak tersedia; VPS web memakai IPv4                            |
| MX                   | `0 menujuakad.com.`; belum diubah/diaudit sebagai layanan email |
| `mail` / `ftp` CNAME | Mengikuti apex; sekarang menuju VPS ini                         |

Tidak ada layanan email/FTP yang dipasang oleh deployment ini. Jika email/FTP sebelumnya digunakan pada server lama, pengelola DNS perlu mempertahankan endpoint layanan itu secara terpisah: misalnya A `mail` dan `ftp` ke IP penyedia lama yang terverifikasi, lalu MX ke hostname email yang benar. Jangan menyimpulkan layanan tersebut aktif hanya dari record default.

## Riwayat audit domain sebelum konfirmasi VPS

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

## Panduan umum workspace dan artifact

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

Playwright memakai managed webServer konfigurasi existing, tanpa proses background manual. Dependency/Chromium hanya disiapkan jika diperlukan. Inspeksi VPS lokal dan switch aktual dicatat pada section rilis GST-01/CUS-07; SSH tambahan tidak diperlukan karena target yang dikonfirmasi adalah mesin workspace ini.

## Health, keamanan dan kriteria publikasi

`/api/health/live` harus 200 pada kandidat dan URL publik; ini liveness proses. `/api/health` memerlukan database dan tetap 503/not_configured tanpa `DATABASE_URL`; jangan mengubah probe agar menyatakan DB siap. Kondisi itu didokumentasikan untuk rilis frontend tanpa data. Ketika fitur DB diaktifkan, readiness200, migrasi pengembangan teruji, backup/restore dan prosedur Prisma7 migrate deploy menjadi gate wajib.

Tidak mengekspos port aplikasi internal ke Internet. Header nosniff/referrer/frame/permissions diperiksa setelah proxy; HSTS hanya setelah cakupan HTTPS terbukti. Metadata preview/auth/private noindex tidak menggantikan otorisasi server. Resource customer/admin dan pembayaran tidak aktif berdasarkan fixture/cookie/query.

Setiap increment dinyatakan terverifikasi produksi hanya setelah domain HTTPS200, redirect HTTP/www, sertifikat, aset, liveness, interaksi dan proteksi route diuji pada artifact final. Release aktif `preview-20261008-responsive` menggantikan `preview-20261008-gst01`; kedua tag sebelumnya serta artifact/backup dipertahankan untuk rollback. Koneksi Neon serta status auth/Mayar tetap dicatat terpisah.
