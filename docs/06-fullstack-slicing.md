# Slicing Fullstack Menuju Akad

Tanggal: 7 Oktober 2026. Lingkup worker: melanjutkan source parsial, mengimplementasikan UI frontend, route dan shell, tanpa commit/push atau deployment. Dokumen ini melengkapi [rencana 03](03-pm-rencana-slicing.md), bukan menggandakan master rancangan.

## Status dan batas klaim

Sebanyak 53 kode/64 varian telah mempunyai entry point pada `/preview-ui`. **43 kode/52 varian** memiliki komponen nyata dalam ownership fullstack. **10 kode/12 varian** billing/admin/business masih memakai `SpecialistPreviewPlaceholder` secara eksplisit; ini handoff yang diizinkan ROOT, bukan klaim bahwa seluruh platform sudah selesai. Specialist selanjutnya mengganti komponennya melalui resolver statis yang sama. Semua view noindex dan memakai data sintetis.

Marketing, katalog/detail/demo, enam layar auth, customer/wizard/detail, akun/notifikasi/dukungan, empat belas panel editor, cover/opened/invalid undangan, dua error view dan referensi komponen tersedia. Interaksi hanya state browser; reload atau navigasi ke route lain mereset draft. Database/provider/autentikasi/pembayaran/email/unggahan/publish belum terhubung. Produksi menujuakad.com belum diverifikasi oleh worker ini.

## Sumber dan keputusan visual

Stitch MENUJU-AKAD-UIUX (`12559574101879777472`), Editorial Ivory & Gold, Noto Serif + Manrope. Sumber berada pada rancangan, tidak diimpor runtime/build. Manifest 64 record/62 PNG/0 HTML valid diperiksa; HTML login Google tidak digunakan. Worker membuat contact sheet `/tmp/stitch-source-0.jpg` sampai `-7.jpg` dari PNG, tetapi `view_image` ditolak karena model worker tidak mendukung input gambar. **Tidak ada klaim inspeksi visual langsung oleh worker ini.** Komposisi memakai temuan [UI/UX 01](01-uiux-inventaris.md) dan [QA preflight 10](10-qa-validasi.md), yang terakhir diperiksa worker QA dengan viewer berfungsi. Screenshot browser yang dibuat E2E bukan bukti fidelity sampai QA membandingkannya.

CUS-01 desktop dan CUS-02 desktop bersumber metadata saja; layout dirangkai berdasarkan kontrak mobile/tablet dan primitive. CUS-05/06 tidak ditemukan; preview/pengaturan pelengkap ada dalam ringkasan undangan dengan label rekonstruksi. Tidak dibuat kode registry baru untuk kedua gap tersebut. Media foto sumber tidak memiliki original berlisensi yang tersedia; slot `InvitationMedia` memakai ilustrasi CSS/initials dan label foto belum disediakan. Template editorial landscape, botanical floral, minimal monogram dibedakan. Ini **rekonstruksi media**, bukan foto pasangan atau kecocokan piksel Stitch.

Tindak lanjut QA-PF-02/03/04: media per template dibedakan; phone editor menunjukkan section/field relevan (galeri menyebut komposisi sumber, bukan refleksi upload); keluarga shell berbeda; dashboard mobile bottom navigation; checkout tanpa sidebar. PUB-06 memakai enam langkah alternating, sedangkan ringkasan beranda tetap tiga. Wizard memakai lima langkah dan paper preview. Home tablet punya dua kartu paket contoh, mobile satu, desktop tidak menambahkan paket. Selektor varian memilih state/perangkat sumber; ukuran render tetap mengikuti viewport browser, bukan mengganti viewport pengguna.

## Struktur dan tanggung jawab

```text
src/app/
  (public)/            marketing, katalog/detail/demo, undangan contoh
  (auth)/              layout minimal dan lima entry point akun
  (dashboard)/         boundary customer server dan route terlindungi
  (admin)/             boundary superadmin server dan route terlindungi
  preview-ui/          galeri + dynamic route whitelist
  styles/              tokens, base, primitives, marketing, media, workspace,
                       customer shells, account, invitation
src/components/
  ui/                  primitive existing
  shared/              brand, public/auth shells, media/ornament
  customer/            sidebar, domain horizontal, account/support, checkout,
                       header dan bottom navigation
  admin/               shell superadmin
src/features/
  auth/                copy/config, hook validasi lokal, form
  templates/           katalog filter, card, detail
  marketing/           komponen per section/halaman
  invitations/         customer, editor, dokumen undangan; hooks dan aturan draft/kuota
  account/             profil/notifikasi dan hook interaksi
  support/             percakapan/tiket dan hook lokal
  design-preview/      data/DTO milik data engineer; resolver/galeri/banner
src/server/authorization/  guard milik security, dipakai tanpa perubahan
src/proxy.ts           penolakan path/varian asing sebelum streaming
public/fonts/          font lokal + lisensi dan SOURCES.txt
public/ornaments/      hanya aset SVG yang dipakai
```

Page tipis, JSX dipisahkan dari copy/config/validasi dan hook state yang kompleks. CSS global hanya import; stylesheet dipecah berdasarkan tanggung jawab. Worker tidak membuat API dummy, model atau migrasi baru. DTO/fixture dan authorization final milik worker lain dipakai tanpa diubah.

## Routing, izin dan kontrak integrasi

Publik: `/`, `/templates`, `/templates/[slug]`, `/demo/[templateSlug]`, `/pricing`, `/how-it-works`, `/faq`, `/contact`, `/about`, `/terms`, `/privacy`. Auth: `/login` (termasuk state konflik), `/register`, `/forgot-password`, `/reset-password`, `/verify-email`; form lokal tidak mengikuti `next` atau membuat sesi. Undangan: `/invitation/sarah-dimas-contoh` adalah whitelist sintetis berlabel belum terbit; slug lain 404. Template/demo hanya menerima tiga slug DTO yang terdaftar. Harga, legal dan kontak belum menjadi klaim komersial; teks draf/layanan belum aktif eksplisit.

`/dashboard/*` memanggil `requireCustomerSession`, `/admin/*` memanggil `requireSuperadminSession`, termasuk boundary dan catch-all page. Resolver null berarti selalu redirect ke login; fixture role bukan sesi. Operasi server/ownership belum dibuat dan tetap memerlukan guard sendiri saat backend ditambahkan.

`/preview-ui/[code]` memakai `getPreviewScreen` dan `resolveScreenVariant`. Kode asing, ID varian asing/silang dan varian ganda ditolak. Tidak ada dynamic import/filesystem path dari query. `src/proxy.ts` menolak alamat preview/template/demo/undangan yang tidak terdaftar dengan rewrite ke halaman 404 native sebelum loading/streaming Next mengirim status 200. Validasi page tetap ada sebagai lapisan komposisi. Prefix about/terms/privacy/preview-ui/how-it-works/fonts ditambahkan pada reserved slug agar resolver undangan masa depan tidak berbenturan.

Resolver ownership fullstack: `DesignPreviewView({ screen })`. Billing/business sementara melalui `SpecialistPreviewPlaceholder`. Ketika specialist selesai, CUS-07/08 dan ADM-01/02 diganti export terkunci dokumen 07; GST-01–06 diganti export dokumen 08. `CustomerPreviewLayout({ screen, children })` memilih sidebar untuk customer umum/GST-01 empty/GST-02–04; header/tab horizontal untuk GST-01 default/05/06; header+main tanpa sidebar untuk ACC/SUP; `CheckoutShell` untuk CUS-08. Resolver varian mengembalikan seluruh metadata layar dengan state sumber terpilih, sehingga empty/expired/gallery error/token-invalid dapat di-wire tepat.

## Interaksi dan adaptasi domain

Editor: perubahan cover, pasangan, cerita, acara, RSVP, musik, panduan, video, countdown, siaran, hashtag langsung mengubah draft lokal dan section preview. Save memvalidasi judul, angka rombongan dan HTTPS media; menyebut tersimpan lokal, bukan server. Galeri hanya menambah ilustrasi contoh; error dan kuota sumber terpisah. Pemakaian quota mempertahankan item sumber yang tidak dirender, ERROR tidak dihitung sebagai READY. Publish hanya simulasi pemeriksaan dan tidak mengubah lifecycle/isPublished.

Customer: search/status filter undangan; wizard lima tahap, paper preview dan validasi lokal; ringkasan memisahkan DRAFT/ACTIVE dari publikasi. Notifikasi mark-read/preferences lokal. Dukungan membuat tiket/balasan sintetis di memori, tidak mengirim kontak. Profil/provider/password/session UI tidak memberi akses backend. RSVP memakai enum NOT_ATTENDING/MAYBE/PENDING sesuai kontrak; form undangan lokal tidak menjadi guest record produksi.

Musik/video/live/filter tidak mengunduh, memutar atau menanam embed eksternal. Kontrol produksi (login Google, verifikasi, pembayaran, unggahan, publish) tidak mengaku sukses. Gallery preview phone adalah komposisi contoh sumber; item editor lokal tidak diproyeksikan sebagai media yang telah diunggah. Data lokal di editor reset saat pindah route; batas ini tertulis pada UI/report.

## Aset dan pemeriksaan publikasi

Tujuh TTF Noto Serif/Manrope existing dipertahankan dan checksum bytes dibandingkan URL Google Fonts asal pada CSS lokal terdahulu; semuanya identik. Lisensi SIL Open Font License dari repository Google Fonts resmi disimpan di `public/fonts/manrope-OFL.txt` dan `notoserif-OFL.txt`; sumber/checksum di SOURCES.txt. Tidak ada request font remote saat browser memakai halaman. Floral `ivory-bouquet.svg` identik aset floral05 pilihan user dari sumber rancangan; pemakaian authorized sesi bukan klaim audit hak cipta pihak ketiga. Foto/video/audio produksi belum disediakan, sehingga slot media tetap ilustrasi eksplisit.

Tidak menambahkan credential, .env, URL database/auth, API provider, token tamu, raw webhook, signature atau rekening produksi. Runtime tidak mengimpor folder rancangan. Diff source dan daftar public diperiksa; secret scan final artifact/riwayat dan verifikasi produksi tetap pekerjaan gate ROOT/QA/DevOps. Worker tidak menjalankan commit/push, migrasi, SSH, layanan OS atau deployment.

## Bukti validasi lokal

Gate awal source setelah refinemen shell/media/wizard pada 7 Oktober 2026 pukul 19.26–19.28 CST: `db:validate`, `typecheck`, `lint`, **209 unit test**, build, dan **18 E2E** seluruhnya lulus. Pipeline `/tmp/fullstack-final-*.log` memakai `set -e` dan mencapai akhir; exit code 0 diperiksa. E2E membuka 53 kode/64 varian pada desktop/mobile, noindex, 404 sebenarnya, guard anonim/cookie palsu, reset draft, kuota, token invalid, wizard, dukungan, validasi auth, dan viewport tablet. Screenshot home/editor disimpan pada `test-results/`; worker tidak membaca gambar itu secara visual.

RED/GREEN yang diamati: draft/variant 3 assertion gagal sebelum implementasi dan kemudian lulus; proxy 7 gagal/5 lulus sebelum whitelist dan 12 lulus sesudahnya; kuota 2 gagal kemudian lulus; reserved prefix enam gagal sebelum konfigurasi ditambah. E2E awal 10 lulus/4 gagal menemukan status HTTP 200 pada 404 streaming; proxy memperbaiki penyebab, seluruh 18 kasus kemudian lulus. Bukan menurunkan expected status untuk meluluskan test.

Sesudah review scoped QA meminta kontrol auth/cover/media tambahan, tiga regresi E2E baru benar-benar gagal pada source sebelumnya (missing recipient/provider/mode/style), lalu implementasi diperbaiki. Durasi countdown mempunyai dua regresi unit RED lalu GREEN, mencakup WIB/clock fixture, tanggal invalid dan zero-state. Suite unit saat refinemen terakhir pukul **19.35.04 CST: 211 lulus, 12 berkas**. Typecheck/lint terbaru lulus. Build dan enam E2E fokus kemudian lulus (**6/6**, 10,6 detik), dan seluruh E2E terintegrasi setelah kontrol tambahan lulus **24/24** sebelum koreksi submit tanpa JavaScript.

Gate **terakhir sesudah SEC-INT-01**, 7 Oktober 2026 pukul 19.42–19.44 CST, pipeline `set -e` exit **0**: `npm run db:validate` schema Prisma valid; `npm run typecheck` lulus; `npm run lint` **0 error/0 warning**; `npm test` **211 lulus/12 file**; `npm run build` lulus; `npm run test:e2e` **26 lulus (1,4 menit)** pada desktop/mobile. Log otoritatif terakhir `/tmp/fullstack-verified-{db,typecheck,lint,tests,build,e2e}.log`, bukan log diagnosis lama. Tabel route build memuat Proxy, auth/public/customer/admin/preview. Tidak menjalankan migrasi atau layanan produksi.

SEC-INT-01 ditutup pada source ownership fullstack melalui `LocalPreviewForm`, memakai snapshot SSR false/client true dari `useSyncExternalStore`: seluruh kontrol descendant fieldset disabled sampai handler lokal aktif. Handler wrapper selalu memanggil preventDefault sebelum callback konsumen. Form tidak mempunyai action/method atau fallback POST ke server. Auth, kontak, profil/password, dukungan, wizard dan RSVP undangan memakai wrapper yang sama; grep `<form` sekarang hanya menemukan komponen wrapper. Satu lint warning `aria-disabled` pada role form dibuang; disabled menggunakan semantik native fieldset.

Regresi tanpa JavaScript benar-benar RED sebelum perbaikan (input auth masih enabled), lalu GREEN pada kedua proyek browser. Sembilan path `/login`, `/register`, `/forgot-password`, `/reset-password`, `/contact`, `/preview-ui/acc-01`, `/preview-ui/sup-01`, `/preview-ui/cus-03`, `/preview-ui/inv-02` diperiksa: kontrol disabled, upaya fill sentinel sintetis ditolak, Enter tidak mengubah URL, query tetap kosong, tidak ada request URL/body yang membawa sentinel. Mode JavaScript aktif tetap berfungsi pada 24 skenario lainnya; no-mutation assertion pada alur aktif dan auth khusus tetap lulus. Ini membuktikan jalur yang diuji, bukan seluruh future backend/action. Specialist yang kelak menambah form preview wajib memakai wrapper yang sama, bukan form native default GET.

Ukuran source final: page maksimal 26 baris; komponen/hook berada di bawah 200 baris, stylesheet maksimal 369. Global CSS hanya import stylesheet per tanggung jawab. Source tetap diformat Prettier; `git diff --check` diperiksa. Pengujian tidak mengaktifkan database/provider/payment atau deployment. No-mutation assertion mencakup flow interaksi yang diuji, bukan klaim seluruh future action aman.

## Koreksi scoped QA dan gap fidelity tersisa

QA-FS-01: AUT-05 kini recipient `.invalid`, status menunggu, cooldown 60 detik **simulasi manual**, resend disabled hingga nol lalu kembali 60 dengan pesan email tidak dikirim. AUT-06 kini kartu Google/email dan CTA lokal berbeda tanpa menautkan akun/provider. Shared auth card, selector mode, standard form dan hook khusus dipisahkan.

QA-FS-03: EDT-02 tiga mode Type Focus/Portrait/Solid, typography Noto Serif/Manrope, overlay slider dan warna dasar; phone mengikuti mode/draft. Saved state disebut lokal/simulasi, bukan disimpan server. Portrait tetap media ilustrasi karena foto source belum disediakan.

QA-FS-04: EDT-09 mempunyai playlist ilustratif, waveform/player state lokal, volume/loop/perilaku dan disabled upload; tidak ada audio diputar. EDT-11 mempunyai provider/ratio/poster dan slot player tanpa embed. EDT-12 mempunyai tiga gaya, event/time input, calendar dan zero-state; phone menampilkan durasi hari/jam/menit/detik terhadap clock fixture, bukan tanggal yang disamarkan sebagai durasi. EDT-13 mempunyai platform/link/schedule/access contoh; setting tidak memberi keamanan resource nyata. EDT-14 tagar dan filter/thumbnail berada dalam dua section utama. Tidak menggunakan aset kosong sebagai alasan melewatkan struktur kontrol.

Gap fidelity yang tetap dicatat, bukan diklasifikasikan hanya sebagai keterbatasan media: PUB-02 katalog memakai tiga template DTO, belum delapan media source/pagination/concierge; PUB-03 belum section tabs/related designs; PUB-07 belum kategori FAQ/group concierge; PUB-08/09 sebagian service/quality/storytelling section lebih ringkas; PUB-10/11 draf legal lima section, bukan seluruh struktur legal source. CUS-03 belum semua family/nickname/order fields, CUS-04 belum semua collaborator/package/domain panels. ACC source stack/settings berbeda dengan panel selectable; SUP booking/FAQ belum lengkap. EDT default/saved/galeri dan publish mempertahankan komposisi inti dengan interaksi lokal, tetapi copy mikro, semua pilihan desain/spacing/modal tidak dinyatakan identik. ERR belum seluruh guide/telemetry structure, DS adalah subset primitive/reference. Ini memerlukan keputusan/review visual final ROOT/QA; route coverage tidak membuktikan fidelity penuh.

Review scoped QA dan Security bersifat independen baca-saja; koreksi di atas beserta SEC-INT-01 telah diimplementasikan dan diuji oleh worker, namun verdict review source ulang/visual final tetap milik reviewer. Media/template, shell per keluarga, phone section, wizard lima tahap dan six-step PUB-06 sudah ditinjau source dalam report10. QA browser wholebranch, keyboard/zoom200%, export specialist, secret/artifact serta rilis produksi tetap gate berikutnya setelah integrasi.

## Matriks per record sumber

Semua source record tercantum sekali. Status React tersedia berarti frontend ada dengan adaptasi dan belum menjadi klaim fidelity/layanan/produksi. Record berstatus handoff specialist hanya stub teridentifikasi, tidak dihitung sebagai slicing domain selesai.

| Kode    | ID record                          | Perangkat / state                             | Keputusan cakupan                                         |
| ------- | ---------------------------------- | --------------------------------------------- | --------------------------------------------------------- |
| ACC-01  | `fac73b6ed2f346b6a52cb1234a27f5cf` | DESKTOP / Default                             | React tersedia, adaptasi media/copy; visual final pending |
| ACC-02  | `c1f6fe8a7010482fa053e30ba9cd9ea4` | DESKTOP / Default                             | React tersedia, adaptasi media/copy; visual final pending |
| ADM-01  | `72c3e194242f46c5826dbf91aa321b62` | DESKTOP / Default                             | Handoff specialist, stub terbatas                         |
| ADM-02  | `2a62b424023f49a2b70102b70be5bbfc` | DESKTOP / Default                             | Handoff specialist, stub terbatas                         |
| AUT-01  | `9ea16663b63546ce8c103940421b91e5` | DESKTOP / Default                             | React tersedia, adaptasi media/copy; visual final pending |
| AUT-02  | `11072bac1e934f2d835e647905baeeea` | DESKTOP / Default                             | React tersedia, adaptasi media/copy; visual final pending |
| AUT-03  | `374086ceee4143008b05259a5f12e361` | DESKTOP / Default                             | React tersedia, adaptasi media/copy; visual final pending |
| AUT-04  | `795d0fa9d1114cf7bc9b0411d60805ef` | DESKTOP / Default                             | React tersedia, adaptasi media/copy; visual final pending |
| AUT-05  | `b260f70d419242e18e3d98b0ac5f86fe` | DESKTOP / Default                             | React tersedia, adaptasi media/copy; visual final pending |
| AUT-06  | `05b5cc0add9c473586bc1f0a8d3ca07e` | DESKTOP / Default                             | React tersedia, adaptasi media/copy; visual final pending |
| CUS-01  | `3f8be25ae0eb4ba9b5190d593d7a967a` | DESKTOP / Default                             | Rekonstruksi metadata-only                                |
| CUS-01  | `ef2b1181368f49fbad64c1e5e7fdc872` | MOBILE / Default                              | React tersedia, adaptasi media/copy; visual final pending |
| CUS-01  | `50b582012ab341c2bc18c37505e362af` | TABLET / Default                              | React tersedia, adaptasi media/copy; visual final pending |
| CUS-02  | `353a7f3c9fb94e26bfe66324ba2ea60f` | DESKTOP / Default                             | Rekonstruksi metadata-only                                |
| CUS-03  | `38f0c6505e6b4ea1bc675e961ac45904` | DESKTOP / Default                             | React tersedia, adaptasi media/copy; visual final pending |
| CUS-04  | `a99ec67bf64e431ab1506d1606879be1` | DESKTOP / Default                             | React tersedia, adaptasi media/copy; visual final pending |
| CUS-07  | `3ecacc9efc524ae2934bcb75337abf35` | DESKTOP / Default                             | Handoff specialist, stub terbatas                         |
| CUS-08  | `741bf2dc293243f29a02bea0b8546ed6` | DESKTOP / Expired                             | Handoff specialist, stub terbatas                         |
| CUS-08  | `b6693cee4ed7403c93340c99927c3e40` | DESKTOP / Default                             | Handoff specialist, stub terbatas                         |
| DS-01   | `2e2fbdb9fdbc4d55b2872cf9ba778967` | DESKTOP / Default                             | React tersedia, adaptasi media/copy; visual final pending |
| EDT-01  | `0e9cd9e451864d6fa1d8d37d3bdb8538` | DESKTOP / Default                             | React tersedia, adaptasi media/copy; visual final pending |
| EDT-02  | `1f8d5b98d59d48c490ac953f7a6a2372` | DESKTOP / Tersimpan                           | React tersedia, adaptasi media/copy; visual final pending |
| EDT-03  | `0bf6f59bc1784118b44a4bbe81af09b1` | DESKTOP / Default                             | React tersedia, adaptasi media/copy; visual final pending |
| EDT-04  | `5ae8ad59f59b46aeb178c81ef9689633` | DESKTOP / Default                             | React tersedia, adaptasi media/copy; visual final pending |
| EDT-05  | `25d9ae2373c64f11aa63633c4835dd57` | DESKTOP / Default                             | React tersedia, adaptasi media/copy; visual final pending |
| EDT-06  | `235eba55b0ff40b0a310fa46636c6e86` | DESKTOP / Default                             | React tersedia, adaptasi media/copy; visual final pending |
| EDT-06  | `862e4ca6eeb34361a1fb72051c845fbf` | DESKTOP / Error & Kuota                       | React tersedia, adaptasi media/copy; visual final pending |
| EDT-07  | `5ab1f365d6a94ad2a9d879e0f1a5c8b6` | DESKTOP / Default                             | React tersedia, adaptasi media/copy; visual final pending |
| EDT-08  | `8935f050b1084f6eac6f0a8ec0cebf98` | DESKTOP / Default                             | React tersedia, adaptasi media/copy; visual final pending |
| EDT-09  | `3e2017adb79a4fdbacef2dd908d154d5` | DESKTOP / Default                             | React tersedia, adaptasi media/copy; visual final pending |
| EDT-10  | `167c8c120891430ab562c7ce04da062d` | DESKTOP / Default                             | React tersedia, adaptasi media/copy; visual final pending |
| EDT-11  | `cddf768b744142cbbed3f23e4afddc9b` | DESKTOP / Default                             | React tersedia, adaptasi media/copy; visual final pending |
| EDT-12  | `7736a524ebe047cfb08732509b4e7be2` | DESKTOP / Default                             | React tersedia, adaptasi media/copy; visual final pending |
| EDT-13  | `d78ab1cff4b74934bf84c0fb432cfe48` | DESKTOP / Default                             | React tersedia, adaptasi media/copy; visual final pending |
| EDT-14  | `20ab6c6ba27f4c748e6e3c62d6f2a56e` | DESKTOP / Default                             | React tersedia, adaptasi media/copy; visual final pending |
| ERR-404 | `8e7a57f11275400095caed4dbbf9d908` | DESKTOP / Default                             | React tersedia, adaptasi media/copy; visual final pending |
| ERR-500 | `c6fa656ee220450ab292630757074568` | DESKTOP / Default                             | React tersedia, adaptasi media/copy; visual final pending |
| GST-01  | `11e96c32f956400f90704e16fc036017` | DESKTOP / Default                             | Handoff specialist, stub terbatas                         |
| GST-01  | `f51fb5404c334e16b7e0e3763ae4b56c` | DESKTOP / Empty State                         | Handoff specialist, stub terbatas                         |
| GST-02  | `10ecb8332e0144e7ac07ffd72c95afe1` | DESKTOP / Default                             | Handoff specialist, stub terbatas                         |
| GST-03  | `ddb8bf9d3d3e401db76339636c39d77e` | DESKTOP / Default                             | Handoff specialist, stub terbatas                         |
| GST-04  | `345e7dacfab047d6a76f85139b8ecbc8` | DESKTOP / Default                             | Handoff specialist, stub terbatas                         |
| GST-05  | `02ff2daf3d9d4ca5a5f4494c13bcf928` | DESKTOP / Default                             | Handoff specialist, stub terbatas                         |
| GST-06  | `45178a30b0b8412e80275ece5a60c27b` | DESKTOP / Default                             | Handoff specialist, stub terbatas                         |
| INV-01  | `a010041543c64da7b21ab86530aeb9eb` | DESKTOP / Token Tidak Valid                   | React tersedia, adaptasi media/copy; visual final pending |
| INV-01  | `c61ac7e0eb8a4cc3b0f1a534bc689347` | DESKTOP / Default (data contoh Sarah & Dimas) | React tersedia, adaptasi media/copy; visual final pending |
| INV-01  | `d94f30baf9a74d3dbb0a766f3b76ea1f` | MOBILE / Default (data contoh Sarah & Dimas)  | React tersedia, adaptasi media/copy; visual final pending |
| INV-02  | `8369d1d57ec24d4dae70a500cc7cfcc8` | DESKTOP / Default (data contoh Sarah & Dimas) | React tersedia, adaptasi media/copy; visual final pending |
| INV-02  | `3635f0fdbc14426d94d88987047d86fb` | MOBILE / Default (data contoh Sarah & Dimas)  | React tersedia, adaptasi media/copy; visual final pending |
| INV-02  | `73c6007c72ce4492a0b6db86e02e9f7e` | TABLET / Default (data contoh Sarah & Dimas)  | React tersedia, adaptasi media/copy; visual final pending |
| PUB-01  | `89b3b52f9ff94da78ba6973ea2c26599` | DESKTOP / Default                             | React tersedia, adaptasi media/copy; visual final pending |
| PUB-01  | `68f625d97b2f452b815d20dd85f5dedd` | MOBILE / Default                              | React tersedia, adaptasi media/copy; visual final pending |
| PUB-01  | `3e8ea0139228478789c62d016aeda74e` | TABLET / Default                              | React tersedia, adaptasi media/copy; visual final pending |
| PUB-02  | `108a4b40408144b197c44189be1117e8` | DESKTOP / Default                             | React tersedia, adaptasi media/copy; visual final pending |
| PUB-03  | `43976a8ca50b43e886d9d65e4ed7f46a` | DESKTOP / Serenade No. 1                      | React tersedia, adaptasi media/copy; visual final pending |
| PUB-04  | `fd3da5e5ad6443e9a1e3f36ddaa73214` | DESKTOP / Serenade No. 1                      | React tersedia, adaptasi media/copy; visual final pending |
| PUB-05  | `8052e6cb587f430aaaf2c65777ba4ac4` | DESKTOP / Default                             | React tersedia, adaptasi media/copy; visual final pending |
| PUB-06  | `259e20bf907f4af0a9bfbc16a866958f` | DESKTOP / Default                             | React tersedia, adaptasi media/copy; visual final pending |
| PUB-07  | `bfef156c33e44870ab4ce8945f178f1c` | DESKTOP / Default                             | React tersedia, adaptasi media/copy; visual final pending |
| PUB-08  | `12e0439bae264e05a54798cee8cc29f3` | DESKTOP / Default                             | React tersedia, adaptasi media/copy; visual final pending |
| PUB-09  | `3f93162cd56b42fab23cf00f4e27b067` | DESKTOP / Default                             | React tersedia, adaptasi media/copy; visual final pending |
| PUB-10  | `8a761fffb6614e2ba5afa55dc8eea882` | DESKTOP / Default                             | React tersedia, adaptasi media/copy; visual final pending |
| PUB-11  | `34796844c701435a9443cd85f8579d23` | DESKTOP / Default                             | React tersedia, adaptasi media/copy; visual final pending |
| SUP-01  | `ef0a0541dcf545a0b8a2c70783aab7ff` | DESKTOP / Default                             | React tersedia, adaptasi media/copy; visual final pending |

## Handoff berikutnya

ROOT melanjutkan specialist billing/business, wiring resolver, SEO/content metadata, review visual browser dengan model yang dapat membaca gambar, gate integrasi akhir, dan rilis VPS jika akses tujuan tersedia. Public preview ini belum membuktikan produk backend atau domain live.
