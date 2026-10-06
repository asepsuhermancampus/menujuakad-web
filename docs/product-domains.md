# Domain Produk Menuju Akad

## Alur utama

Pilih desain → isi data → personalisasi → preview → bayar → aktifkan → bagikan → kelola tamu → pantau RSVP.

## Peta domain dan dependensi

| Domain                | Tanggung jawab                                                      | Dependency utama                                |
| --------------------- | ------------------------------------------------------------------- | ----------------------------------------------- |
| Auth                  | Identitas, sesi, verifikasi, pemulihan akun, RBAC                   | User, provider/email, izin server               |
| Templates             | Katalog, detail, demo, metadata fitur                               | Figma, Template                                 |
| Invitations           | Pembuatan, editor, preview, lifecycle, kolaborasi                   | Auth, template, profil, section                 |
| Content               | Event, story, gallery, musik/video                                  | Invitation, storage, validasi media             |
| Guests                | Daftar/import, token personal, share, open tracking                 | Invitation, ownership                           |
| RSVP/Wishes           | Kehadiran, guest count, ucapan dan moderasi                         | Guest token, rate limit, invitation visibility  |
| Gifts                 | Display rekening/QR/alamat customer                                 | Invitation, perlindungan data                   |
| Analytics             | Views dan insight yang dapat ditindaklanjuti                        | Event minim PII, agregasi                       |
| Billing/Payments      | Order, Mayar, QRIS, webhook, invoice, renewal                       | Auth, harga database, entitlement               |
| Notifications/Support | Pesan lifecycle dan tiket                                           | Auth, domain event                              |
| Admin                 | Pengelolaan, audit, monitoring, rekonsiliasi                        | SUPERADMIN server-side                          |
| Domains               | Slug bersih dan custom hostname                                     | Invitation publish/lifecycle, verifikasi domain |
| Premium opsional      | Check-in, seating, checklist/timeline, memory, referral, AI writing | Feature flag/entitlement sesuai fitur           |

Domain yang belum dikerjakan tidak dibuat sebagai folder kosong. Bagian opsional tetap berada dalam roadmap, bukan syarat menyelesaikan fondasi atau MVP pertama.
