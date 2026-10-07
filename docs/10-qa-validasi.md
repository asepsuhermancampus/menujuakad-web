# QA Slicing — Preflight Visual dan Kontrak Validasi

Tanggal: 7 Oktober 2026. Status: **preflight sumber selesai; hasil slicing belum mendapat persetujuan QA final**. Worker hanya membaca source dan menulis laporan ini. Tidak mengubah source, fixture, manifest, pengujian, layanan, Git atau deployment. Implementasi fullstack masih aktif saat pemeriksaan; temuan source merupakan snapshot sementara.

## Bukti dan batas pemeriksaan

AGENTS, role `qa.md`, inventaris 01, rencana 03, kontrak data 05, audit payment 07 dan business 08 diperiksa. Manifest Stitch `12559574101879777472` memuat 64 varian/53 kode, 62 PNG valid dan dua metadata-only. **Viewer berfungsi pada worker QA ini.** Seluruh 62 PNG ditampilkan melalui 11 contact sheet turunan lokal `/tmp/menujuakad-qa-0.png` sampai `-10.png`, masing-masing maksimum enam referensi. Contact sheet mempertahankan seluruh tinggi PNG tanpa cropping; ukuran kecil membatasi keterbacaan copy mikro. Pembacaan komposisi semua 62 gambar sah, tetapi bukan inspeksi setiap pixel atau bukti fidelity hasil React.

GST-01 default/empty, GST-02, GST-03, GST-04, GST-05 dan GST-06 juga dibuka satu per satu dengan `view_image`, sehingga detail prioritas business dapat dibaca. Payment/admin diperiksa pada contact sheet dengan komposisi dan label besar terbaca. Layar undangan terbuka dan design system sangat panjang; order section terlihat, copy mikro tidak diverifikasi lengkap. Screenshot aplikasi/browser **belum diperiksa**. Tidak menjalankan build/test global ketika implementation aktif. Jumlah baseline historis bukan hasil QA increment ini.

CUS-01 desktop (`3f8be25ae0eb4ba9b5190d593d7a967a`) dan CUS-02 desktop (`353a7f3c9fb94e26bfe66324ba2ea60f`) tidak mempunyai PNG valid. CUS-05/06 tidak ditemukan. Tidak mengklaim visual empat gap ini. HTML semua sumber tidak valid karena halaman login Google. Angka piksel raster bukan CSS breakpoint.

## Kontrak visual lintas fitur

Canvas ivory hangat, header putih/ivory, garis tipis taupe, kartu putih dengan border halus; tipografi judul serif besar, body sans, teks kecil sekunder abu-taupe, gold dipakai pada kicker/garis/selection, CTA utama hitam. Konten kerja bukan dekorasi floral berulang. Radius panel relatif kecil; badge status pill. Heading, ruang antarsection, hierarki nominal/statistik dan kontras hitam/ivory lebih dominan daripada warna aksen. Tetap gunakan Noto Serif/Manrope sesuai keputusan proyek meski bentuk raster tidak membuktikan nama font.

Sumber mempunyai beberapa shell berbeda: GST-01 default/05/06 memakai header horizontal + breadcrumb/tab domain; GST-01 empty/02/03/04 dan CUS-04 memakai sidebar; EDT memakai header + navigasi bagian kiri + panel tengah + preview ponsel kanan; checkout memakai header sederhana tanpa sidebar. Jangan menambah sidebar global pada checkout atau mengganti seluruh variasi shell dengan satu layout tanpa mencatat adaptasi. Navigation aktif mempunyai underline atau panel gold ringan. Mobile CUS-01 memakai bottom navigation empat item; tablet memakai header compact/menu, bukan sidebar desktop penuh.

## Prioritas business — kontrak yang dapat langsung diimplementasikan

| Sumber | Komposisi dan urutan yang terlihat | Adaptasi frontend sintetis yang wajib jujur |
| --- | --- | --- |
| GST-01 default | Header horizontal brand/breadcrumb/pasangan/status/pratinjau; tab Tamu/RSVP/Ucapan/Hadiah/Statistik; kicker dan heading; empat metrik Total Tamu, Pax, Distribusi, RSVP; panel search/grup/status/import/export/tambah; chip RSVP/reset; bulk action; tabel checkbox/nama-grup/pax/sesi/RSVP/link/tindakan. PNG berakhir di bagian awal tabel; jangan mengarang footer yang tak terlihat. | Fixture tidak punya telepon/link personal: pertahankan struktur dengan placeholder eksplisit, bukan kontak/token palsu. Tambahkan filter MAYBE yang tidak terlihat di chip sumber tetapi diperlukan semantik kontrak. Angka 68/120 dibulatkan 57%, bukan 56% raster. |
| GST-01 empty | Sidebar identitas pasangan dan menu; heading + dua CTA kanan; kartu empty besar dengan ikon amplop, heading centered, deskripsi; dua kartu Impor Spreadsheet/Tambah Satu per Satu; strip tips; **metrik nol di bawah empty**, kemudian footer. Ada artefak teks `IT_PUSH_UPS` melintang pada raster. | Jangan menyalin artefak generator. Empty dataset berbeda dari no-result search; CTA tambah/import tetap ada. Kuota/kapasitas sumber merupakan contoh, bukan kontrak paket. |
| GST-02 | Sidebar; breadcrumb/back; heading; stepper **empat langkah**, langkah 2 pemetaan aktif; dua kolom: file summary + enam mapping + pilihan duplikat kiri, status validasi + tabel lima baris preview + privacy note kanan; footer aksi batal/lanjut. | File chooser nyata belum scope: input contoh aman/mapping lokal. Bedakan VALID/DUPLICATE/INVALID, jangan tampilkan semua valid. Enam field kontak/sapaan/sesi sumber dapat berupa placeholder label; jangan menambah PII ke fixture demi fidelity. |
| GST-03 | Sidebar; breadcrumb/status; tab + export/reminder; heading + terakhir sinkron; empat metrik; dua kartu distribusi sesi akad/resepsi; dua kartu catatan alergi/aksesibilitas; tabel respons terbaru/filter; footer. | DTO belum memuat sesi, alergi, kapasitas atau logistik: tampilkan struktur ilustrasi **data belum tersedia pada contoh** jika dipertahankan, jangan membuat rekomendasi catering medis/angka baru. Empat status fixture menggantikan angka raster; MAYBE terpisah PENDING. |
| GST-04 | Sidebar; breadcrumb/tab; heading dan toggle moderasi kanan; empat metrik received/public/pending/pinned; layout 2 kolom: chip/search + kartu ucapan panjang kiri, live guest preview + export kenangan + etika moderasi kanan; pagination bawah. Kartu pending gold outline, public green badge, pesan quote serif, actions bawah. | Fixture hanya VISIBLE/HIDDEN: pending/pinned jangan diberi angka palsu; sebut belum dimodelkan atau tambah state presentasi yang jelas lokal. Toggle hide/show harus memperbarui count dan guest preview lokal. Jangan mengklaim PDF tersedia jika hanya CSV/text export. |
| GST-05 | Header horizontal/tab; heading + log/save; toggle enabled + dua preference checkboxes; dua kolom rekening/QR/alamat/card tambah kiri dan **phone preview** + etika kanan; footer. | Ini terutama konfigurasi kanal hadiah, bukan dashboard saldo. DTO rekening/alamat/QR null: kartu placeholder struktur dan preview aman lebih sesuai daripada mengisi bank palsu. Deklarasi hadiah dapat menjadi section tambahan, tetapi catat adaptasi; tidak menggantikan seluruh source setting dengan transaksi. |
| GST-06 | Header horizontal/breadcrumb/tab; heading + date range; empat metrik; layout 2 kolom distribusi waktu kiri/funnel kanan; dua kartu platform/interaksi favorit kiri, recommendation reminder kanan; tabel aktivitas akses terbaru; footer. | DTO hanya bucket harian/sumber: tampilkan grafik aktual angka contoh beserta tabel aksesibel; label platform/funnel/log belum tersedia jika tak dimodelkan. Raster grafik waktu tampak kosong dengan marker; jangan meniru grafik tanpa data sebagai analitik aktif. Jangan menjumlah unique harian. |

## Prioritas payment dan admin

| Sumber | Kontrak komposisi terlihat | Batas perilaku |
| --- | --- | --- |
| CUS-07 | Sidebar, breadcrumb/header, judul terpusat “Pilih Paket Penerbitan & Masa Aktif”; dua kartu paket dengan recommended gold, harga serif besar, feature list dan CTA; tabel perbandingan penuh; tiga FAQ pembayaran; notice dan footer. | Dua paket DTO saja cukup. Harga/keterbatasan contoh jelas; pilih paket tidak mengaktifkan entitlement. |
| CUS-08 default | Header sederhana; breadcrumb; heading/payment step; dua kolom payment utama kiri + ringkasan pesanan kanan; timer; radio metode; blok QR + nominal/guidance; VA/kartu collapsed; CTA cek status; summary template/paket/item/promo/total. | QR nyata dilarang: placeholder dekoratif tidak dapat dipindai. Timer fixture tetap/demo, cek status tidak menandai PAID. Promo hanya state lokal, integer IDR konsisten. |
| CUS-08 expired | Header sederhana + breadcrumb; banner merah expired **di atas kedua kolom**; panel QR expired/00:00 kiri, buat tagihan ulang + ganti metode; invoice kanan dengan expired timestamp/nominal, support card. | State harus tampak berbeda secara isi dan visual, bukan hanya judul. Tidak ada QR aktif/retry provider. |
| ADM-01 | Header console/admin/status gateway; breadcrumb/heading dengan sync/export; empat metrik; search gateway/status/metode/tanggal; tabel transaksi/pasangan/paket/nominal/metode/status provider/entitlement/aksi; strip webhook menuju ADM-02; footer ringkas. | Status provider dan entitlement kolom terpisah. Harga contoh, detail synthetic, tidak menyatakan gateway benar-benar connected. |
| ADM-02 | Header console/tab payments-webhook; heading, ping/replay CTA; empat metrik total/processed/ignored/failed; filter; dua kolom event table kiri + selected payload/log timeline kanan; footer. Payload panel mempunyai blok code hitam. | Sanitized synthetic detail tanpa signature/raw credential. DUPLICATE/FAILED terpisah; replay hanya hasil lokal ilustrasi, tidak retry provider. |

## Kontrak sampel dan varian fullstack

| Kelompok | Komposisi yang terlihat dan penanda berbeda |
| --- | --- |
| PUB-01 | Desktop hero dua kolom teks kiri/paper preview foto kanan, tiga desain, tiga langkah, fitur, FAQ, CTA, footer. Mobile hero stacked + dua CTA fullwidth, katalog stacked, langkah stacked, satu paket, FAQ, CTA dan footer. Tablet hero tetap dua kolom, dua template, tiga langkah, **dua kartu paket sebelum FAQ**. Perangkat source berbeda section; jangan mengklaim pixel match ketiganya dengan satu subset. |
| PUB-02/03/04 | Katalog search/filter + grid delapan contoh tampak, pagination + concierge; detail template paper preview besar kiri/detail fitur-paket-CTA kanan + preview section tabs + related designs; demo merupakan dokumen undangan panjang berpusat, bukan katalog. |
| PUB-05/06/07 | Harga tiga tier dan comparison panjang; cara kerja **enam langkah berselang teks/ilustrasi UI**, comparison metode, CTA; FAQ search/chip kategori + accordion dikelompokkan, concierge. |
| PUB-08/09 | Kontak dua kolom kanal resmi/form + tiga service cards; about manifesto centered + tiga nilai + storytelling foto/editorial + tiga kualitas + CTA. Nomor/jam/sertifikasi sumber tidak boleh menjadi klaim produksi tanpa dasar. |
| PUB-10/11 | Heading + metadata kebijakan; sidebar daftar isi, dokumen panjang kanan; privasi mempunyai callout/retention/token section dan consent statement. Isi legal harus ditinjau, bukan dianggap sah dari raster. |
| AUT-01–06 | Kartu centered pada ivory, header/footer minimal. Login/register Google + separator + form; forgot satu email; reset dua sandi + token status; verify email address/status + resend disabled/countdown; konflik metode provider utama/manual + dua CTA, bukan login generik. Badge valid/verifikasi hanya visual contoh. |
| CUS-01/03/04 | Mobile dashboard heading + next action + 3 stats + invitation + activity + notice + bottomnav; tablet next action lebar + stats + invitation + activities. Wizard stepper 5 + kartu nama pasangan 2 kolom, urutan nama, paper preview dan prev/next; detail sidebar + completion checklist kiri/phone preview kanan + domain + collaborator + paket. |
| ACC-01/02 | Account header horizontal + inner settings nav kiri/stack profil-password-linked sessions kanan; notifications heading/tab/list kiri, active communication toggles + concierge kanan. Jangan meratakan semua section menjadi satu form pendek. |
| SUP-01 | Header horizontal; hero bantuan/CTA; 3 cards open/completed/concierge; dua kolom ticket list/filter kiri dan booking + FAQ kanan. |
| EDT-01–08 | Editor tiga kolom. Cover default kontrol layout/sapaan/teks; saved cover pilihan tiga visual + typography + slider overlay preview gelap. Couple dua profil + phone; love timeline editor + phone; event cards dengan date/time/zone/location + phone; gallery quota/dropzone/file rows + mosaic preview; error gallery red failed list/quota/dropzone/toast/file grid. RSVP deadline/quota/form + phone. Publish **beralih** ke checklist kiri + paper/package/checkbox/CTA kanan, bukan editor identik. |
| EDT-09–14 | Musik toggle/player/waveform/playlist/upload/behavior; dress code swatches/text + protocol; video provider/input/ratio + wide player preview/settings; countdown toggle/acuan event/3 style cards/preview/zero state/calendar; livestream provider/link/time/access + preview; hashtag form/filter Instagram/url/thumbnail kiri + phone kanan. |
| INV-01/02 | Cover desktop paper card berpusat, foto landscape, tanggal/lokasi, recipient card/CTA; cover mobile foto portrait tinggi + recipient/CTA. Invalid token: centered framed notice + langkah verifikasi/dua CTA tanpa identitas pasangan. Opened desktop/mobile/tablet dokumen panjang: intro/photo/quote, pasangan, acara, gallery, RSVP & wishes, gift, penutup; pasangan/acara side-by-side pada desktop/tablet, stacked mobile. |
| ERR/DS | 404 angka besar di pusat + dua CTA dan guide; 500 maintenance centered + telemetry panel/progress/retry/support; DS lembar panjang token/typography/button/input/status/cards/reference. Telemetry/sertifikasi sumber menjadi ilustrasi, bukan health aktif. |

## Temuan source sementara yang actionable

| ID | Tingkat | Bukti snapshot source | Tindak lanjut pemilik |
| --- | --- | --- | --- |
| QA-PF-01 | Important | `design-preview-view.tsx` masih memakai `SpecialistPreviewPlaceholder` pada GST/CUS-07/08/ADM. | Payment/business mengganti placeholder setelah followup; QA final harus membuka semua resolver varian. Ini pekerjaan pending yang diketahui, bukan bug release yang telah terjadi. |
| QA-PF-02 | Important | `home-overview.tsx`, `template-card.tsx`, `editor-preview.tsx`, `invitation-view.tsx` memakai FloralArt yang sama; sumber menampilkan foto pasangan/paper dan komposisi berbeda per template. | Fullstack: bedakan representasi template dan media slot/ratio, hindari bouquet sama mendominasi setiap card/phone. Asset belum berlisensi boleh tetap placeholder, tetapi dokumentasikan **rekonstruksi media**, jangan fidelity penuh. |
| QA-PF-03 | Important | Editor preview hanya title/subtitle/tanggal + FloralArt untuk seluruh section, sedangkan source phone menampilkan section couple/events/gallery/RSVP. | Preview harus berubah berdasarkan section dan field relevan, atau label secara eksplisit sebagai pratinjau sampul saja. Kode berubah bukan bukti “live preview seluruh editor”. |
| QA-PF-04 | Important | `CustomerShell` memberi sidebar universal, sedangkan source GST-01 default/05/06, ACC dan checkout memiliki shell lain; CSS mobile menjadi top scrolling nav, source CUS-01 bottom navigation. | Shell variants berdasarkan keluarga yang nyata; mobile dashboard perlu bottomnav atau dokumentasi adaptasi. Bukan membuat komponen universal banyak flag. |
| QA-PF-05 | Important | Sumber GST-05 adalah rekening/kanal + phone preview; audit business juga merencanakan declaration-list. | Pertahankan setting/preview sebagai section utama; tambahan deklarasi dipisah dan tercatat. Jangan menyebut semua hadiah UI sesuai Stitch jika hanya daftar nominal. |
| QA-PF-06 | Important | Sumber mempunyai angka/PII/klaim komersial/logistik lebih banyak daripada DTO aman. | Gunakan DTO sebagai data contoh; section yang kekurangan data boleh placeholder berlabel. Fidelity visual tidak membenarkan menyalin rekening, nomor, payload, alamat, fake TLS/ISO/gateway-connected ke klaim produksi. |

Belum ada Critical defect produksi yang diverifikasi oleh worker ini karena tidak menjalankan aplikasi terintegrasi. Tetap ada gate Critical: kebocoran rahasia, bypass `/admin`/`dashboard`, QR pembayaran riil dalam demo atau mutation provider dari preview akan memblokir rilis jika ditemukan pada QA final.

## Test case utama untuk QA final

Seluruh baris di bawah **belum dijalankan dalam preflight ini**.

| ID | Skenario dan langkah | Expected |
| --- | --- | --- |
| QA-01 | Buka `/admin/payments`, `/dashboard`, nested route anonim; coba query role=SUPERADMIN. | Redirect login server; fixture/query tidak memberi akses. |
| QA-02 | Buka preview kode unknown/traversal; pilih ID varian dari kode lain. | 404/penolakan allowlist; tidak dynamic import/path file atau berubah role sesi. |
| QA-03 | Buka 53 kode dan state explicit (empty/expired/error/token-invalid/saved), 390/768/1440px. | Tidak placeholder specialist tersisa; noindex/banner, isi berbeda per state, tidak overflow halaman. Gap source diberi label rekonstruksi. |
| QA-04 | Search nama unmatched, gabungkan group/status, reset; empty source variant. | No-result berbeda empty asli; counts konsisten; reset mengembalikan fixture; MAYBE terpisah PENDING. |
| QA-05 | Impor input invalid/duplicate, apply preview lalu reload. | Input gagal tetap ada; valid saja dihitung; tidak kontak/server write; reload reset. |
| QA-06 | Ubah wishes visibility, hadiah toggle, period analytics subset. | Local counts/preview konsisten; gift bukan PAID/received; unique subset tidak dibuat dengan sum harian. |
| QA-07 | Expired checkout lalu retry/cek status; admin replay FAILED/DUPLICATE. | State expired tetap tanpa QR aktif; hasil lokal jelas, tidak provider call/entitlement. |
| QA-08 | Ubah field editor title/section, save, pindah/reload. | State dan copy menjelaskan batas lokal; preview relevan/berlabel; publish tidak membuat URL publik nyata. |
| QA-09 | Tab/Enter/Escape pada form/filter/accordion/navigation; zoom 200%. | Focus terlihat, label/form error aksesibel, urutan logis, tidak kehilangan CTA; tombol icon memiliki accessible name. |
| QA-10 | Export synthetic CSV dengan nama `=1+1`, quote/newline/delimiter. | Formula escaped, kolom aman, URL Blob revoked, tidak PII/token. |
| QA-11 | Network inspect semua preview/form submit/publish/cek pembayaran. | Tidak OAuth/email/Mayar/DB/WA/beacon/mutation asli; form menampilkan hasil contoh. |
| QA-12 | Public links/canonical/robots/sitemap; auth/preview invitation privacy. | Canonical apex menujuakad.com; hanya halaman sah dalam sitemap, preview/auth noindex; tidak claim commercial readiness. |

## Acceptance criteria dan regresi

Slicing tersedia: seluruh 53 kode memiliki komponen domain nyata dan seluruh varian memiliki keputusan cakupan. UI local teruji: db:validate/typecheck/lint/test/build/E2E selesai pada source terintegrasi, visual browser dibandingkan kontrak di atas. Terhubung layanan: tidak dianggap selesai oleh pekerjaan ini. Produksi: hanya setelah deployment pada VPS tujuan, HTTPS/apex/www dan health diperiksa nyata.

- [ ] Build/typecheck/lint/unit/security checks akhir dengan timestamp dan hasil nyata.
- [ ] E2E setelah build, keyboard/responsive dan inspect network.
- [ ] Screenshot browser source samples, section order dan state dibandingkan.
- [ ] Diff secret/public asset/link/license diperiksa sebelum push.
- [ ] Placeholder pending/route guard/noindex/payment mode benar.
- [ ] Deployment/HTTPS/rollback dilaporkan terpisah dari QA lokal.

## Lampiran sumber yang benar-benar tampil

Semua baris valid berikut diperiksa **komposisi via contact sheet**, kecuali GST yang juga diperbesar individual. Tautan menunjuk PNG asli; ID berada dalam nama file. Tidak memperbarui flag `visualInspected` registry milik data engineer. Gambar turunan hanya artefak sementara `/tmp`, bukan aset runtime.

| Kode | State/perangkat | PNG sumber | Tingkat inspeksi |
| --- | --- | --- | --- |
| ACC-01 | Default / DESKTOP | [PNG](../../menujuakad-rancangan/docs/assets/stitch/acc-01-fac73b6ed2f346b6a52cb1234a27f5cf.png) | Contact sheet; copy mikro belum lengkap |
| ACC-02 | Default / DESKTOP | [PNG](../../menujuakad-rancangan/docs/assets/stitch/acc-02-c1f6fe8a7010482fa053e30ba9cd9ea4.png) | Contact sheet; copy mikro belum lengkap |
| ADM-01 | Default / DESKTOP | [PNG](../../menujuakad-rancangan/docs/assets/stitch/adm-01-72c3e194242f46c5826dbf91aa321b62.png) | Contact sheet; copy mikro belum lengkap |
| ADM-02 | Default / DESKTOP | [PNG](../../menujuakad-rancangan/docs/assets/stitch/adm-02-2a62b424023f49a2b70102b70be5bbfc.png) | Contact sheet; copy mikro belum lengkap |
| AUT-01 | Default / DESKTOP | [PNG](../../menujuakad-rancangan/docs/assets/stitch/aut-01-9ea16663b63546ce8c103940421b91e5.png) | Contact sheet; copy mikro belum lengkap |
| AUT-02 | Default / DESKTOP | [PNG](../../menujuakad-rancangan/docs/assets/stitch/aut-02-11072bac1e934f2d835e647905baeeea.png) | Contact sheet; copy mikro belum lengkap |
| AUT-03 | Default / DESKTOP | [PNG](../../menujuakad-rancangan/docs/assets/stitch/aut-03-374086ceee4143008b05259a5f12e361.png) | Contact sheet; copy mikro belum lengkap |
| AUT-04 | Default / DESKTOP | [PNG](../../menujuakad-rancangan/docs/assets/stitch/aut-04-795d0fa9d1114cf7bc9b0411d60805ef.png) | Contact sheet; copy mikro belum lengkap |
| AUT-05 | Default / DESKTOP | [PNG](../../menujuakad-rancangan/docs/assets/stitch/aut-05-b260f70d419242e18e3d98b0ac5f86fe.png) | Contact sheet; copy mikro belum lengkap |
| AUT-06 | Default / DESKTOP | [PNG](../../menujuakad-rancangan/docs/assets/stitch/aut-06-05b5cc0add9c473586bc1f0a8d3ca07e.png) | Contact sheet; copy mikro belum lengkap |
| CUS-01 | Default / MOBILE | [PNG](../../menujuakad-rancangan/docs/assets/stitch/cus-01-ef2b1181368f49fbad64c1e5e7fdc872.png) | Contact sheet; copy mikro belum lengkap |
| CUS-01 | Default / TABLET | [PNG](../../menujuakad-rancangan/docs/assets/stitch/cus-01-50b582012ab341c2bc18c37505e362af.png) | Contact sheet; copy mikro belum lengkap |
| CUS-03 | Default / DESKTOP | [PNG](../../menujuakad-rancangan/docs/assets/stitch/cus-03-38f0c6505e6b4ea1bc675e961ac45904.png) | Contact sheet; copy mikro belum lengkap |
| CUS-04 | Default / DESKTOP | [PNG](../../menujuakad-rancangan/docs/assets/stitch/cus-04-a99ec67bf64e431ab1506d1606879be1.png) | Contact sheet; copy mikro belum lengkap |
| CUS-07 | Default / DESKTOP | [PNG](../../menujuakad-rancangan/docs/assets/stitch/cus-07-3ecacc9efc524ae2934bcb75337abf35.png) | Contact sheet; copy mikro belum lengkap |
| CUS-08 | Expired / DESKTOP | [PNG](../../menujuakad-rancangan/docs/assets/stitch/cus-08-741bf2dc293243f29a02bea0b8546ed6.png) | Contact sheet; copy mikro belum lengkap |
| CUS-08 | Default / DESKTOP | [PNG](../../menujuakad-rancangan/docs/assets/stitch/cus-08-b6693cee4ed7403c93340c99927c3e40.png) | Contact sheet; copy mikro belum lengkap |
| DS-01 | Default / DESKTOP | [PNG](../../menujuakad-rancangan/docs/assets/stitch/ds-01-2e2fbdb9fdbc4d55b2872cf9ba778967.png) | Contact sheet; copy mikro belum lengkap |
| EDT-01 | Default / DESKTOP | [PNG](../../menujuakad-rancangan/docs/assets/stitch/edt-01-0e9cd9e451864d6fa1d8d37d3bdb8538.png) | Contact sheet; copy mikro belum lengkap |
| EDT-02 | Tersimpan / DESKTOP | [PNG](../../menujuakad-rancangan/docs/assets/stitch/edt-02-1f8d5b98d59d48c490ac953f7a6a2372.png) | Contact sheet; copy mikro belum lengkap |
| EDT-03 | Default / DESKTOP | [PNG](../../menujuakad-rancangan/docs/assets/stitch/edt-03-0bf6f59bc1784118b44a4bbe81af09b1.png) | Contact sheet; copy mikro belum lengkap |
| EDT-04 | Default / DESKTOP | [PNG](../../menujuakad-rancangan/docs/assets/stitch/edt-04-5ae8ad59f59b46aeb178c81ef9689633.png) | Contact sheet; copy mikro belum lengkap |
| EDT-05 | Default / DESKTOP | [PNG](../../menujuakad-rancangan/docs/assets/stitch/edt-05-25d9ae2373c64f11aa63633c4835dd57.png) | Contact sheet; copy mikro belum lengkap |
| EDT-06 | Default / DESKTOP | [PNG](../../menujuakad-rancangan/docs/assets/stitch/edt-06-235eba55b0ff40b0a310fa46636c6e86.png) | Contact sheet; copy mikro belum lengkap |
| EDT-06 | Error & Kuota / DESKTOP | [PNG](../../menujuakad-rancangan/docs/assets/stitch/edt-06-862e4ca6eeb34361a1fb72051c845fbf.png) | Contact sheet; copy mikro belum lengkap |
| EDT-07 | Default / DESKTOP | [PNG](../../menujuakad-rancangan/docs/assets/stitch/edt-07-5ab1f365d6a94ad2a9d879e0f1a5c8b6.png) | Contact sheet; copy mikro belum lengkap |
| EDT-08 | Default / DESKTOP | [PNG](../../menujuakad-rancangan/docs/assets/stitch/edt-08-8935f050b1084f6eac6f0a8ec0cebf98.png) | Contact sheet; copy mikro belum lengkap |
| EDT-09 | Default / DESKTOP | [PNG](../../menujuakad-rancangan/docs/assets/stitch/edt-09-3e2017adb79a4fdbacef2dd908d154d5.png) | Contact sheet; copy mikro belum lengkap |
| EDT-10 | Default / DESKTOP | [PNG](../../menujuakad-rancangan/docs/assets/stitch/edt-10-167c8c120891430ab562c7ce04da062d.png) | Contact sheet; copy mikro belum lengkap |
| EDT-11 | Default / DESKTOP | [PNG](../../menujuakad-rancangan/docs/assets/stitch/edt-11-cddf768b744142cbbed3f23e4afddc9b.png) | Contact sheet; copy mikro belum lengkap |
| EDT-12 | Default / DESKTOP | [PNG](../../menujuakad-rancangan/docs/assets/stitch/edt-12-7736a524ebe047cfb08732509b4e7be2.png) | Contact sheet; copy mikro belum lengkap |
| EDT-13 | Default / DESKTOP | [PNG](../../menujuakad-rancangan/docs/assets/stitch/edt-13-d78ab1cff4b74934bf84c0fb432cfe48.png) | Contact sheet; copy mikro belum lengkap |
| EDT-14 | Default / DESKTOP | [PNG](../../menujuakad-rancangan/docs/assets/stitch/edt-14-20ab6c6ba27f4c748e6e3c62d6f2a56e.png) | Contact sheet; copy mikro belum lengkap |
| ERR-404 | Default / DESKTOP | [PNG](../../menujuakad-rancangan/docs/assets/stitch/err-404-8e7a57f11275400095caed4dbbf9d908.png) | Contact sheet; copy mikro belum lengkap |
| ERR-500 | Default / DESKTOP | [PNG](../../menujuakad-rancangan/docs/assets/stitch/err-500-c6fa656ee220450ab292630757074568.png) | Contact sheet; copy mikro belum lengkap |
| GST-01 | Default / DESKTOP | [PNG](../../menujuakad-rancangan/docs/assets/stitch/gst-01-11e96c32f956400f90704e16fc036017.png) | Individual + contact sheet |
| GST-01 | Empty State / DESKTOP | [PNG](../../menujuakad-rancangan/docs/assets/stitch/gst-01-f51fb5404c334e16b7e0e3763ae4b56c.png) | Individual + contact sheet |
| GST-02 | Default / DESKTOP | [PNG](../../menujuakad-rancangan/docs/assets/stitch/gst-02-10ecb8332e0144e7ac07ffd72c95afe1.png) | Individual + contact sheet |
| GST-03 | Default / DESKTOP | [PNG](../../menujuakad-rancangan/docs/assets/stitch/gst-03-ddb8bf9d3d3e401db76339636c39d77e.png) | Individual + contact sheet |
| GST-04 | Default / DESKTOP | [PNG](../../menujuakad-rancangan/docs/assets/stitch/gst-04-345e7dacfab047d6a76f85139b8ecbc8.png) | Individual + contact sheet |
| GST-05 | Default / DESKTOP | [PNG](../../menujuakad-rancangan/docs/assets/stitch/gst-05-02ff2daf3d9d4ca5a5f4494c13bcf928.png) | Individual + contact sheet |
| GST-06 | Default / DESKTOP | [PNG](../../menujuakad-rancangan/docs/assets/stitch/gst-06-45178a30b0b8412e80275ece5a60c27b.png) | Individual + contact sheet |
| INV-01 | Token Tidak Valid / DESKTOP | [PNG](../../menujuakad-rancangan/docs/assets/stitch/inv-01-a010041543c64da7b21ab86530aeb9eb.png) | Contact sheet; copy mikro belum lengkap |
| INV-01 | Default (data contoh Sarah & Dimas) / DESKTOP | [PNG](../../menujuakad-rancangan/docs/assets/stitch/inv-01-c61ac7e0eb8a4cc3b0f1a534bc689347.png) | Contact sheet; copy mikro belum lengkap |
| INV-01 | Default (data contoh Sarah & Dimas) / MOBILE | [PNG](../../menujuakad-rancangan/docs/assets/stitch/inv-01-d94f30baf9a74d3dbb0a766f3b76ea1f.png) | Contact sheet; copy mikro belum lengkap |
| INV-02 | Default (data contoh Sarah & Dimas) / DESKTOP | [PNG](../../menujuakad-rancangan/docs/assets/stitch/inv-02-8369d1d57ec24d4dae70a500cc7cfcc8.png) | Contact sheet; copy mikro belum lengkap |
| INV-02 | Default (data contoh Sarah & Dimas) / MOBILE | [PNG](../../menujuakad-rancangan/docs/assets/stitch/inv-02-3635f0fdbc14426d94d88987047d86fb.png) | Contact sheet; copy mikro belum lengkap |
| INV-02 | Default (data contoh Sarah & Dimas) / TABLET | [PNG](../../menujuakad-rancangan/docs/assets/stitch/inv-02-73c6007c72ce4492a0b6db86e02e9f7e.png) | Contact sheet; copy mikro belum lengkap |
| PUB-01 | Default / DESKTOP | [PNG](../../menujuakad-rancangan/docs/assets/stitch/pub-01-89b3b52f9ff94da78ba6973ea2c26599.png) | Contact sheet; copy mikro belum lengkap |
| PUB-01 | Default / MOBILE | [PNG](../../menujuakad-rancangan/docs/assets/stitch/pub-01-68f625d97b2f452b815d20dd85f5dedd.png) | Contact sheet; copy mikro belum lengkap |
| PUB-01 | Default / TABLET | [PNG](../../menujuakad-rancangan/docs/assets/stitch/pub-01-3e8ea0139228478789c62d016aeda74e.png) | Contact sheet; copy mikro belum lengkap |
| PUB-02 | Default / DESKTOP | [PNG](../../menujuakad-rancangan/docs/assets/stitch/pub-02-108a4b40408144b197c44189be1117e8.png) | Contact sheet; copy mikro belum lengkap |
| PUB-03 | Serenade No. 1 / DESKTOP | [PNG](../../menujuakad-rancangan/docs/assets/stitch/pub-03-43976a8ca50b43e886d9d65e4ed7f46a.png) | Contact sheet; copy mikro belum lengkap |
| PUB-04 | Serenade No. 1 / DESKTOP | [PNG](../../menujuakad-rancangan/docs/assets/stitch/pub-04-fd3da5e5ad6443e9a1e3f36ddaa73214.png) | Contact sheet; copy mikro belum lengkap |
| PUB-05 | Default / DESKTOP | [PNG](../../menujuakad-rancangan/docs/assets/stitch/pub-05-8052e6cb587f430aaaf2c65777ba4ac4.png) | Contact sheet; copy mikro belum lengkap |
| PUB-06 | Default / DESKTOP | [PNG](../../menujuakad-rancangan/docs/assets/stitch/pub-06-259e20bf907f4af0a9bfbc16a866958f.png) | Contact sheet; copy mikro belum lengkap |
| PUB-07 | Default / DESKTOP | [PNG](../../menujuakad-rancangan/docs/assets/stitch/pub-07-bfef156c33e44870ab4ce8945f178f1c.png) | Contact sheet; copy mikro belum lengkap |
| PUB-08 | Default / DESKTOP | [PNG](../../menujuakad-rancangan/docs/assets/stitch/pub-08-12e0439bae264e05a54798cee8cc29f3.png) | Contact sheet; copy mikro belum lengkap |
| PUB-09 | Default / DESKTOP | [PNG](../../menujuakad-rancangan/docs/assets/stitch/pub-09-3f93162cd56b42fab23cf00f4e27b067.png) | Contact sheet; copy mikro belum lengkap |
| PUB-10 | Default / DESKTOP | [PNG](../../menujuakad-rancangan/docs/assets/stitch/pub-10-8a761fffb6614e2ba5afa55dc8eea882.png) | Contact sheet; copy mikro belum lengkap |
| PUB-11 | Default / DESKTOP | [PNG](../../menujuakad-rancangan/docs/assets/stitch/pub-11-34796844c701435a9443cd85f8579d23.png) | Contact sheet; copy mikro belum lengkap |
| SUP-01 | Default / DESKTOP | [PNG](../../menujuakad-rancangan/docs/assets/stitch/sup-01-ef0a0541dcf545a0b8a2c70783aab7ff.png) | Contact sheet; copy mikro belum lengkap |

Asumsi tugas: preflight readonly sesuai instruksi ROOT, bukan implementasi atau QA release final. Laporan ini diteruskan pada file yang sama ketika implementasi lengkap; jangan membuat laporan QA bernomor baru. Nomor 06/09 milik worker terkait belum tersedia saat preflight dan tidak dibuat oleh QA.
