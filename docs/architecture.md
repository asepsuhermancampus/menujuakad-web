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
docs                            keputusan dan ingatan progres
```

Jalur dependency: route → UI fitur atau query/action → service → repository/integrasi → database/provider. UI tidak mengakses database atau Mayar. Modul runtime database memakai `server-only`; Prisma dibuat lazily agar build dan halaman publik tidak membutuhkan kredensial.

## Batas increment saat ini

Beranda merupakan halaman pengantar sementara, bukan implementasi website publik final dari Figma. Belum ada sesi, API mutasi customer, dashboard, editor, katalog siap pakai, atau pembayaran. Model awal tersedia sebagai fondasi; model billing dan entitlement ditambahkan ketika domain billing dimulai.

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

## Verifikasi dan keterbatasan

`npm run check` menggabungkan schema validation, typecheck, lint, unit test, dan build. Browser diperiksa melalui Playwright. Koneksi Neon, migrasi pada Neon, desain resmi Figma, dan produksi memerlukan verifikasi tersendiri; hasil lokal tidak menggantikannya. Status lengkap ada di [progres bersama](../../menujuakad-rancangan/docs/00-progres-proyek.md).
