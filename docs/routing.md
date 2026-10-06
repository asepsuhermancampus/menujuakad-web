# Routing Menuju Akad

## Rute yang sudah tersedia

| Method/rute            | Perilaku                                                                                                       |
| ---------------------- | -------------------------------------------------------------------------------------------------------------- |
| `GET /`                | Beranda pengantar sementara dalam route group `(public)`.                                                      |
| `GET /api/health/live` | Liveness aplikasi, 200 tanpa bergantung database.                                                              |
| `GET /api/health`      | Kesiapan aplikasi + probe database; 200 jika berhasil, 503 jika konfigurasi belum tersedia atau koneksi gagal. |
| Rute lain              | Boundary 404; belum ada dashboard/auth/undangan publik yang aktif.                                             |

Respons kesehatan tidak dicache dan tidak menampilkan URL koneksi atau detail exception. Liveness bukan bukti database siap.

## Rute target, belum diimplementasikan

- Publik: `/templates`, `/templates/[slug]`, `/demo/[templateSlug]`, `/pricing`, `/faq`, `/blog`, `/blog/[slug]`, `/inspiration`, `/contact`.
- Auth: `/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email`.
- Customer: `/dashboard`, `/dashboard/invitations`, `/dashboard/invitations/new`, `/dashboard/invitations/[invitationId]`, lalu `editor`, `preview`, `guests`, `rsvp`, `wishes`, `gifts`, `analytics`, dan `settings`.
- Billing: `/dashboard/billing/packages`, `checkout/[orderId]`, `payment/[paymentId]`, `transactions`, `transactions/[transactionId]`, `invoices/[invoiceId]`, `renew/[invitationId]`.
- Akun dan dukungan: `/dashboard/notifications`, `/dashboard/profile`, `/dashboard/settings`, `/dashboard/support`, `/dashboard/support/[ticketId]`.
- Undangan: `/invitation/[slug]`, dengan resolver URL publik `/{slug}` setelah domain undangan tersedia.
- Admin: `/admin`, `customers`, `customers/[id]`, `invitations`, `invitations/[id]`, `templates`, `templates/[id]`, `packages`, `orders`, `transactions`, `transactions/[id]`, `payments`, `payments/[id]`, `qris`, `webhooks`, `coupons`, `content`, `blog`, `analytics`, `support`, `moderation`, `audit-logs`, `system`, `system/health`, `system/features`, `settings`.
- Webhook: `POST /api/webhooks/mayar`.

Nama lengkap dan cakupan rute mengikuti bagian 5–8, 41, dan 51 master spec. Semua customer/admin route memerlukan auth server sebelum diaktifkan.

## Slug dan custom domain

`src/config/routes.ts` menyimpan daftar reserved slug tunggal, termasuk semua prefix publik/customer/admin, `verify-email`, API, `_next`, serta path aset dan metadata. `invitationSlugSchema` menerima 3–80 karakter huruf kecil/angka dipisahkan tanda hubung tunggal. Schema menolak nama reserved, traversal, spasi, dan format berbahaya.

Resolver URL belum diaktifkan agar rute publik tidak ditelan catch-all. Untuk Next.js 16, evaluasi `proxy.ts` atau routing yang setara pada tahap resolver. Custom hostname, verifikasi kepemilikan domain, serta SSL ditambahkan melalui entitas `CustomDomain` setelah kebutuhan fiturnya siap. Jangan mempercayai hostname tanpa pemetaan domain terverifikasi.
