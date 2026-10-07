# Arsitektur Menuju Akad

## Keputusan fondasi

Aplikasi menggunakan satu Next.js App Router dengan modular monolith berbasis fitur, TypeScript strict, dan PostgreSQL Neon melalui Prisma 7. Folder proyek baru tidak memiliki kode lama untuk dimigrasikan. Workspace `HariKita-Web` merupakan proyek terpisah dan tidak diubah.

```text
src/app                         routing, metadata, boundary, komposisi
src/features/marketing          presentasi beranda sementara
src/features/invitations        validasi slug; domain bertambah bertahap
src/components/ui               komponen visual netral
src/components/shared           komponen bersama tanpa aturan bisnis
src/config                      metadata dan rute yang dilindungi
src/server/db                   singleton Prisma + adapter Neon
src/server/health               query probe dan service kesiapan
src/generated/prisma            client hasil generate; diabaikan Git
prisma                          schema, seed, migrasi SQL
tests/e2e                       pengujian browser desktop dan mobile
docs                            dokumentasi teknis; progres di folder rancangan
```

Jalur dependency: route → UI fitur atau query/action → service → repository/integrasi → database/provider. UI tidak mengakses database atau Mayar. Modul runtime database memakai `server-only`; Prisma dibuat lazily agar build dan halaman publik tidak membutuhkan kredensial.

## Batas increment saat ini

Beranda merupakan halaman pengantar sementara, bukan implementasi website publik final dari sumber Stitch yang dipilih. Belum ada sesi, API mutasi customer, dashboard, editor, katalog siap pakai, atau pembayaran. Model awal tersedia sebagai fondasi; model billing dan entitlement ditambahkan ketika domain billing dimulai.

Schema awal memiliki `User`, `Template`, `TemplateFeature`, `Package`, `PackageFeature`, `Invitation`, `InvitationMember`, `CoupleProfile`, dan `InvitationSection`. Penyimpanan uang memakai integer rupiah. `User` belum memiliki kredensial/provider model karena strategi autentikasi akan dipilih pada increment berikutnya.

## Prinsip implementasi berikutnya

- Page tipis dan komponen kecil; pecah tanggung jawab sebelum file menjadi besar.
- Server adalah sumber identitas, izin, harga, dan konfirmasi pembayaran.
- Penambahan invitation harus memvalidasi slug dan memeriksa unique constraint untuk mengatasi race condition.
- Kepemilikan dan membership diperiksa di service/query server, bukan sekadar menyembunyikan tombol.
- JSON hanya untuk konfigurasi presentasi; tamu, RSVP, transaksi, dan entitlement tetap relasional.
- Kode provider terpisah dari domain dan UI. Event webhook disimpan dan diproses idempoten.
- Jangan menambahkan direktori kosong, monorepo, atau microservice tanpa kebutuhan.

## Lokasi repository

Kode dan dokumentasi teknis berada di `/home/ubuntu/menujuakad-web`. Master spec, brief, aset sumber, dan progres bersama berada di `/home/ubuntu/menujuakad-rancangan`. Pembagian ini hanya mengatur workspace pengembangan; aplikasi tetap modular monolith dengan satu `package.json`, tanpa perubahan struktur internal `src/` atau dependensi runtime lintas folder.

## Brainstorming struktur sebelum slicing — 7 Oktober 2026

User meminta struktur yang mudah dipelihara, komponen reusable, pemisahan UI dan logika sesuai fungsi, pemisahan customer/superadmin, konfigurasi tertib, dokumentasi jelas, serta perlindungan secret. Bagian ini adalah **usulan untuk ditinjau**, bukan bukti struktur target sudah dibangun atau izin slicing. Instruksi saat ini hanya brainstorming dan menyimpan ingatan; implementasi menunggu persetujuan eksplisit user.

Fondasi yang diperiksa sudah memisahkan route, UI fitur, primitive, konfigurasi, validasi slug, dan server health/database. Pengembangan berikutnya mempertahankan pola tersebut. Cakupan ini membahas standar struktur; implementasi tiap domain produk tetap dipecah menjadi increment yang dapat diuji.

### Pilihan pendekatan

| Pilihan                                                                      | Kelebihan                                                                               | Konsekuensi                                                                                 |
| ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Modular monolith berbasis domain, dengan presentasi/entry point khusus peran | Konsisten dengan fondasi dan master spec; komponen, service, dan izin punya batas jelas | Perlu disiplin dependency dan review tiap fitur; direkomendasikan                           |
| Semua kode dikelompokkan menurut peran customer/superadmin                   | Mudah menemukan seluruh layar suatu peran                                               | Domain, schema, dan logika yang sama berpotensi diduplikasi                                 |
| Frontend customer dan superadmin menjadi aplikasi terpisah                   | Siklus deploy masing-masing dapat mandiri                                               | Menambah konfigurasi, autentikasi, dan operasional; kebutuhan saat ini belum membenarkannya |

### Struktur target dan kepemilikan modul

Struktur berikut menggambarkan pola, bukan daftar folder yang harus dibuat sekaligus. Hanya buat file dan folder ketika dipakai fitur yang disetujui. Nama `(admin)` dan URL `/admin` tetap mengikuti master spec; aksesnya khusus role SUPERADMIN.

```text
src/
  app/
    (public)/                         halaman publik dan auth
    (customer)/dashboard/             komposisi halaman customer
    (admin)/admin/                    komposisi halaman superadmin
    invitation/                      halaman undangan tamu
    api/                             boundary HTTP dan webhook
    globals.css                      token, reset, dan style dasar
  components/
    ui/                              primitive netral: button, input, dialog
    shared/                          pola lintas fitur tanpa aturan bisnis
    customer/                        shell/navigation customer
    admin/                           shell/navigation superadmin
    invitation/                      shell presentasi undangan tamu
  features/
    marketing/                       section halaman publik
    invitations/                     domain undangan yang sudah dimulai
    <domain>/
      components/                    presentasi dan komposisi fitur
        customer/                    UI domain khusus customer, jika diperlukan
        admin/                       UI domain khusus superadmin, jika diperlukan
      hooks/                         interaksi, state, autosave, debounce
      schemas/                       validasi input yang aman dibagi
      types/                         kontrak UI dan DTO aman
      constants/                     opsi dan konfigurasi presentasi domain
      utils/                         fungsi murni domain
  server/
    auth/                            sesi dan pemeriksaan identitas/peran
    <domain>/
      customer/                      action/query untuk customer
      admin/                         action/query khusus SUPERADMIN
      services/                      aturan bisnis dan pemeriksaan izin resource
      repositories/                  query database terlingkup izin
    integrations/                    adapter provider eksternal
    db/                              client Prisma dan adapter Neon
    env.ts                           konfigurasi rahasia tervalidasi
  config/                            konfigurasi publik situs/routing
  generated/                         hasil generate, tidak di-commit
```

Nama domain mengikuti master spec, misalnya templates, invitations, guests, billing, payments, dan support. UI editor dikelompokkan dalam fitur invitations berdasarkan shell, panel, dan section yang dikerjakan. Nama file memakai kebab-case seperti fondasi; komponen memakai PascalCase dan fungsi/hook memakai nama yang menjelaskan tugasnya. Jangan membuat `utils.ts` atau `config.ts` global sebagai penampung semua domain.

Kode UI hanya mengimpor kontrak/schema aman dan komponen domain yang diperlukan. Kode server yang menggunakan sesi, rahasia, database, atau provider memakai `server-only`; action yang diakses browser melalui mekanisme Server Action memakai boundary `use server` dan memanggil modul server tersebut. Jangan membuat barrel export yang mencampur modul client dan server. Service tidak bergantung pada React; repository tidak mengatur tampilan atau pesan form. Akses antar-domain melalui kontrak yang jelas, bukan impor file internal secara acak.

### Pemecahan halaman dan interaksi

Page menyusun section dan memanggil query yang relevan. Contoh beranda: header/footer publik yang reusable, hero, pilihan template, langkah penggunaan, dan CTA menjadi komponen sesuai bagian yang benar-benar ada pada desain. Data presentasi berulang dapat menjadi konfigurasi lokal; harga komersial dan status akun berasal dari server.

Editor dipisah menjadi shell, navigation section, panel/form per bagian, preview, dan indikator penyimpanan. Hook autosave mengatur debounce, status, dan respons konflik; aturan validasi berada pada schema; pemuatan dan penyimpanan melalui query/action; izin, perubahan lifecycle, dan transaksi berada pada service. Komponen preview yang juga dipakai undangan tamu menerima kontrak presentasi aman, bukan objek Prisma atau rahasia provider. Tidak semua layar/editor dipaksakan ke satu komponen dengan banyak boolean.

Server Component menjadi default. Client Component digunakan pada form, modal, filter, toggle, upload, atau editor yang membutuhkan interaksi browser. Customer adalah peran pengguna, sedangkan client/server adalah batas eksekusi; superadmin juga dapat memiliki Client Component. Style lokal komponen mengikuti pendekatan CSS proyek saat fitur dikerjakan; jangan menumpuk seluruh style layar ke `globals.css` atau membawa script/CDN hasil ekspor ke runtime tanpa evaluasi.

Target ukuran tetap mengikuti master spec: page kurang dari 120 baris, komponen/hook kurang dari 200, service kurang dari 300. Mendekati 400 baris wajib dievaluasi pemecahannya. Batas ini membantu review; komponen dipecah menurut tanggung jawab, bukan semata-mata jumlah baris atau setiap elemen JSX. Reuse dilakukan ketika perilaku dan kontraknya memang sama.

### Izin, konfigurasi, dan keamanan

Customer hanya dapat membaca/mengubah resource miliknya atau resource dengan membership sah. Superadmin memerlukan sesi terverifikasi dengan role SUPERADMIN. Shell, menu tersembunyi, route group, serta redirect layout tidak menggantikan pemeriksaan action/query dan service. Input `userId`, role, harga, atau invitationId dari browser bukan bukti izin; query database dibatasi oleh konteks identitas yang diverifikasi server. Service bersama tidak boleh menjadi jalur melewati kebijakan peran.

Rahasia hanya berada di environment/server; hanya konfigurasi yang benar-benar publik boleh memakai `NEXT_PUBLIC_*`. Props dan respons memakai DTO minimum, tidak mengekspor record pengguna/payment mentah. Log disanitasi, fixture memakai data sintetis, dan aset/screenshot yang dipublikasikan diperiksa. Sebelum commit/push, periksa daftar staged, `.gitignore`, placeholder `.env.example`, dan jalankan pemindaian secret yang sesuai. Jika ditemukan kredensial, hentikan publikasi dan lakukan pemulihan sesuai bukti kebocoran. `.gitignore` tidak menggantikan pemeriksaan isi dan riwayat.

Prisma 7, integer IDR, verifikasi provider server, idempotensi webhook, dan pemisahan environment tetap berlaku. UI checkout yang terslicing tidak membuktikan pembayaran bekerja. URL migrasi berada di `prisma.config.ts`; runtime Neon memakai pooled `DATABASE_URL`. Konfigurasi provider, environment, dan fitur disentralisasi pada domain yang tepat tanpa membuat satu file konfigurasi raksasa.

### Pemeriksaan dari tiap disiplin

| Disiplin             | Tanggung jawab saat domain dikerjakan                                                                        |
| -------------------- | ------------------------------------------------------------------------------------------------------------ |
| Arsitektur/fullstack | Batas modul, kontrak dependency, ukuran file, error handling, dan reuse                                      |
| UI/UX                | Kesesuaian screenshot, token, responsive layout, state, keyboard, dan aksesibilitas                          |
| Security             | Sesi/RBAC, ownership, validasi input, redaksi data, dan secret                                               |
| Data engineer        | Query terlingkup, constraint/index, transaksi, migrasi, dan model data                                       |
| Payment specialist   | Nominal server, authenticity provider, idempotensi, dan transisi pembayaran                                  |
| QA                   | Skenario berhasil/gagal, regresi, IDOR, dan pengujian interaksi utama                                        |
| DevOps               | Konfigurasi environment, validasi sebelum publish, build, dan kesiapan rollback ketika deployment dikerjakan |

Tabel ini membagi tanggung jawab peninjauan; belum berarti semua review atau pengujian tersebut telah dilakukan. Delegasi mengikuti izin sesi dan aturan worker yang berlaku.

### Tahapan setelah izin diberikan

1. Perbarui inventaris Stitch karena daftar layarnya berubah selama generasi. Catat screen ID, URL target, peran, state, dan ketersediaan varian responsive. Jumlah layar termasuk varian state, bukan jumlah fitur selesai.
2. Inspeksi screenshot dan HTML layar yang dipilih; cocokkan dengan token resmi, sumber aset, dan perilaku master spec. HTML hasil generasi menjadi referensi pemecahan komponen, tidak ditempel sebagai satu file aplikasi.
   Sumber visual yang dipilih user adalah Stitch MENUJU-AKAD-UIUX, Editorial Ivory & Gold, dengan Noto Serif + Manrope; snapshot token ada di design system rancangan. Figma V4/Cormorant merupakan riwayat. Persetujuan sumber desain tidak menggantikan izin slicing.
3. Sepakati lingkup increment pertama beserta kondisi selesai dan rencana pelaksanaannya. Rekomendasi awal: fondasi token/primitive yang dipakai dan satu halaman publik yang desainnya telah diperiksa. Area terlindungi diaktifkan setelah sesi/izin server tersedia; kebutuhan ini dipenuhi sebagai pekerjaan auth tersendiri sesuai roadmap.
4. Terapkan increment, tinjau struktur dan keamanan, lalu jalankan pemeriksaan yang relevan. Alur UI penting memerlukan build, Playwright, dan perbandingan visual desktop/mobile. State loading/empty/error/disabled ditinjau sesuai fungsi halaman; data contoh tidak dianggap layanan terhubung.
5. Perbarui dokumen teknis terkait, progres, changelog, hasil validasi, dan hambatan sebelum berpindah increment. Dokumentasi menjelaskan tanggung jawab, input/output, izin, cara menjalankan, serta alasan keputusan; komentar kode fokus pada alasan yang tidak jelas dari implementasi.

Usulan penguat kualitas pada tahap implementasi: aturan lint ukuran/kompleksitas dan batas impor, pemeriksaan format/typecheck, pengujian perilaku domain dan akses, serta pemindaian secret sebelum publikasi. Konfigurasi dan ambang otomatis disesuaikan dengan repo saat diimplementasikan; belum dibuat pada brainstorming ini.

## Verifikasi dan keterbatasan

`npm run check` menggabungkan schema validation, typecheck, lint, unit test, dan build. Browser diperiksa melalui Playwright. Koneksi Neon, migrasi pada Neon, kesesuaian visual dengan sumber Stitch yang dipilih, dan produksi memerlukan verifikasi tersendiri; hasil lokal tidak menggantikannya. Status lengkap ada di [progres bersama](../../menujuakad-rancangan/docs/00-progres-proyek.md).
