# Rencana Pembayaran Mayar

## Status

Belum ada API Mayar, QRIS, checkout, webhook, invoice, atau aktivasi paket yang diimplementasikan. Nama environment disiapkan tanpa nilai. Dokumentasi endpoint dan mekanisme verifikasi Mayar harus diperiksa kembali melalui sumber resmi ketika tahap pembayaran dimulai; jangan mengasumsikan nama header atau algoritme signature.

## Kontrak arsitektur

UI billing → order internal dari harga database → service pembayaran → adapter Mayar → konfirmasi provider → webhook terverifikasi → event idempoten → update payment/order → entitlement → invoice → notifikasi.

Provider ditempatkan di `src/server/integrations/mayar`; aturan pembayaran berada di service fitur. Runtime menggunakan API server, bukan MCP agent. Gift tamu merupakan konfigurasi/display rekening customer dan terpisah dari pembayaran paket Menuju Akad.

## Aturan wajib

- Nominal integer rupiah, subtotal/discount/fee/total disimpan terpisah.
- Harga, pemilik order, package, dan amount diperiksa server-side.
- Payment/order memakai status normalized: PENDING, PROCESSING, PAID, FAILED, EXPIRED, CANCELLED, REFUNDED.
- Redirect, parameter URL, screenshot, dan klaim browser tidak mengaktifkan undangan.
- Webhook memverifikasi authenticity berdasarkan dokumentasi resmi terkini, memeriksa identitas/nominal/currency, dan menyimpan event.
- Idempotency serta transaksi mencegah invoice, fulfillment, dan entitlement ganda, termasuk webhook konkuren.
- Percobaan ulang membuat payment attempt baru; status historis tidak dipalsukan.
- Invoice memakai snapshot; event, kegagalan, dan rekonsiliasi dapat diaudit tanpa log rahasia.
- UI QRIS menampilkan nominal, referensi, expiry, instruksi, status + teks, dan tindakan selanjutnya.

## Kriteria validasi tahap pembayaran

Pengujian harus mencakup mapping status, transisi yang tidak valid, amount mismatch, customer/order mismatch, signature tidak valid, webhook berulang dan konkuren, retry setelah expiry, fulfillment satu kali, serta sandbox Mayar. Baru tandai integrasi selesai setelah kode, webhook, test, dan verifikasi sandbox benar-benar berjalan.
