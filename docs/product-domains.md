# Domain Produk Menuju Akad

## Alur utama

Pilih desain → isi data → personalisasi → preview → bayar → aktifkan → bagikan → kelola tamu → pantau RSVP.

Alur perencanaan (ditambahkan 10 Oktober 2026): buat workspace → tentukan target dana → susun anggaran → catat pengeluaran → jalankan tugas dan rundown → kelola vendor/seserahan/dokumen → pantau hari-H.

## Peta domain dan dependensi

| Domain                | Tanggung jawab                                                  | Dependency utama                                |
| --------------------- | --------------------------------------------------------------- | ----------------------------------------------- |
| Auth                  | Identitas, sesi, verifikasi, pemulihan akun, RBAC               | User, provider/email, izin server               |
| Templates             | Katalog, detail, demo, metadata fitur                           | Figma, Template                                 |
| Invitations           | Pembuatan, editor, preview, lifecycle, kolaborasi               | Auth, template, profil, section                 |
| Content               | Event, story, gallery, musik/video                              | Invitation, storage, validasi media             |
| Guests                | Daftar/import, token personal, share, open tracking             | Invitation, ownership                           |
| RSVP/Wishes           | Kehadiran, guest count, ucapan dan moderasi                     | Guest token, rate limit, invitation visibility  |
| Gifts                 | Display rekening/QR/alamat customer                             | Invitation, perlindungan data                   |
| Analytics             | Views dan insight yang dapat ditindaklanjuti                    | Event minim PII, agregasi                       |
| Billing/Payments      | Order, Mayar, QRIS, webhook, invoice, renewal                   | Auth, harga database, entitlement               |
| Notifications/Support | Pesan lifecycle dan tiket                                       | Auth, domain event                              |
| Admin                 | Pengelolaan, audit, monitoring, rekonsiliasi                    | SUPERADMIN server-side                          |
| Domains               | Slug bersih dan custom hostname                                 | Invitation publish/lifecycle, verifikasi domain |
| Planner/Workspace     | Workspace pasangan, onboarding, undangan anggota, konteks acara | Auth, PlannerWorkspace, maks 2 anggota          |
| Planner/Finance       | Tabungan, transfer, kategori anggaran, pengeluaran              | PlannerWorkspace, integer IDR, rekening         |
| Planner/Work          | Tugas, rundown, vendor dan status pembayaran vendor             | PlannerWorkspace, event context                 |
| Planner/Preparation   | Seserahan, persyaratan nikah, lamaran, moodboard                | PlannerWorkspace, storage lampiran (belum ada)  |
| Planner/Products      | Wedding Kit (katalog produk digital) dan riwayat pembelian      | PlannerWorkspace, billing                       |
| Admin Operations      | Kelola pengguna, upgrade, konten, QRIS/rekening, audit          | SUPERADMIN, AdminAuditLog, ContentSection       |
| Premium opsional      | Check-in, seating, memory, referral, AI writing                 | Feature flag/entitlement sesuai fitur           |

Domain yang belum dikerjakan tidak dibuat sebagai folder kosong. Bagian opsional tetap berada dalam roadmap, bukan syarat menyelesaikan fondasi atau MVP pertama.

## Status domain perencanaan (10 Oktober 2026)

Schema Prisma dan UI sudah tersedia untuk seluruh domain planner, tetapi **belum ada backend
penyimpanan**: layar memakai fixture sintetis berlabel dan route-nya dijaga oleh guard sesi yang
sama. Urutan pengaktifan yang disarankan: PlannerWorkspace + onboarding → tabungan/anggaran/
pengeluaran (paling berdampak dan paling mudah diuji) → tugas/rundown → vendor/seserahan/
persyaratan → lamaran/moodboard → wedding kit (butuh billing) → admin operations (butuh audit
trail dan kebijakan retensi).

Batas yang tidak boleh dilanggar saat mengaktifkan: kepemilikan workspace diperiksa di server,
nominal selalu integer IDR, aksi admin destruktif wajib audit, dan marketplace vendor/moodboard
tidak boleh mengklaim vendor atau foto pihak ketiga tanpa perjanjian.
