# Menuju Akad — Aplikasi Web

Platform undangan pernikahan digital dengan alur pilih desain → isi data → personalisasi → preview → bayar → aktifkan → bagikan → kelola tamu dan RSVP.

Implementasi dilakukan bertahap mengikuti [master spec](../menujuakad-rancangan/MENUJU_AKAD_AGENT_MASTER_SPEC.txt). Status aktual dan langkah berikutnya berada di [catatan progres proyek](../menujuakad-rancangan/docs/00-progres-proyek.md). Saat ini aplikasi memiliki fondasi teknis dan beranda sementara; autentikasi, editor, pembayaran, dan deployment belum tersedia.

## Lokasi proyek dan sumber rancangan

- Implementasi dan Git aplikasi: `/home/ubuntu/menujuakad-web`.
- Rancangan produk, brief Stitch, dan aset sumber: `/home/ubuntu/menujuakad-rancangan`.
- [Design system lengkap](../menujuakad-rancangan/docs/design-system.md), [brief web aktif](../menujuakad-rancangan/docs/11-uiux-prompt-stitch-web.txt), dan [pustaka SVG](../menujuakad-rancangan/docs/12-uiux-aset-svg.txt) berada di folder rancangan.
- Master spec dan catatan progres memiliki satu sumber di folder rancangan; jangan membuat salinan yang diedit terpisah.
- Dua folder adalah repositori lokal terpisah. Git aplikasi mempertahankan seluruh riwayat, memakai branch `main`, dan menggunakan remote `origin` [menujuakad-web](https://github.com/asepsuhermancampus/menujuakad-web). Repositori rancangan bersifat lokal tanpa remote dan tidak ikut dalam push aplikasi.
- Untuk melanjutkan implementasi, buka folder `menujuakad-web`. Folder rancangan tidak dibutuhkan oleh runtime maupun build aplikasi.

Tautan relatif ke rancangan memerlukan kedua folder berdampingan. Jika meng-clone aplikasi saja, dokumen rancangan harus disediakan terpisah; aplikasi tetap dapat dibangun tanpa folder tersebut.

## Stack

Next.js 16 App Router, React 19, TypeScript strict, Prisma 7, adapter Neon/PostgreSQL, Zod, ESLint, Prettier, Vitest, dan Playwright. Versi persis dikunci melalui `package-lock.json`; gunakan Node.js 22.12+ pada jalur 22 LTS, atau Node.js 24+.

## Menjalankan lokal

```bash
cd /home/ubuntu/menujuakad-web
npm ci
cp .env.example .env
npm run db:generate
npm run dev
```

Buka `http://localhost:3000`. Beranda dan build dapat berjalan tanpa database. `/api/health/live` bernilai 200 ketika aplikasi hidup; `/api/health` bernilai 503 sampai koneksi database berhasil.

## Environment

| Variabel               | Penggunaan                                                                                                     |
| ---------------------- | -------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`         | URL PostgreSQL Neon pooled untuk runtime; sertakan SSL sesuai connection string Neon.                          |
| `DIRECT_URL`           | URL langsung Neon untuk CLI migrasi dan seed.                                                                  |
| `NEXT_PUBLIC_APP_URL`  | URL absolut aplikasi; gunakan `http://localhost:3000` saat lokal. Fallback metadata: `https://menujuakad.com`. |
| `AUTH_SECRET`          | Disiapkan untuk tahap autentikasi; belum dipakai.                                                              |
| `APP_HOSTNAME`         | Bind server standalone; default `127.0.0.1`, gunakan `0.0.0.0` untuk container di belakang proxy.              |
| `PORT`                 | Port server produksi; default `3000`.                                                                          |
| `MAYAR_API_KEY`        | Rahasia server untuk integrasi Mayar mendatang.                                                                |
| `MAYAR_API_BASE_URL`   | Endpoint resmi yang harus diverifikasi pada tahap pembayaran.                                                  |
| `MAYAR_WEBHOOK_SECRET` | Placeholder konfigurasi; kebutuhan persis mengikuti mekanisme verifikasi resmi Mayar.                          |

Isi rahasia melalui `.env` atau secret manager, bukan chat/dokumentasi. Jangan memakai prefix `NEXT_PUBLIC_` untuk rahasia.

## Database

Gunakan branch/database Neon pengembangan yang terpisah. Schema awal dan migrasi SQL sudah disiapkan; penerapan ke Neon memerlukan URL yang valid.

```bash
npm run db:validate
npm run db:generate
npm run db:deploy
npm run db:seed
```

`db:deploy` menerapkan migrasi yang sudah ditinjau. Untuk perubahan schema berikutnya di database pengembangan, gunakan `npm run db:migrate -- --name nama_perubahan`, lalu generate client secara eksplisit. Seed hanya menambah satu contoh template berstatus DRAFT, idempoten, dan ditolak ketika `NODE_ENV=production`. Detail: [database](docs/database.md).

## Pengujian dan build

```bash
npm run check
npx playwright install chromium
npm run test:e2e
npm run format:check
```

Playwright menjalankan server produksi lokal sementara pada `127.0.0.1:3107`, lalu menutupnya setelah pengujian. Jalankan build terlebih dahulu jika memakai `test:e2e` secara terpisah. Konfigurasinya sengaja mengosongkan `DATABASE_URL` untuk skenario aplikasi belum terhubung database.

```bash
npm run build
npm run start
```

Build menyalin aset publik dan static ke output standalone. `npm run start` menjalankan server standalone di localhost secara default; atur port lewat environment `PORT`, bukan flag `next start`.

## Stitch dan desain

Acuan visual aktif adalah proyek Stitch **MENUJU-AKAD-UIUX** (`12559574101879777472`), design system **Editorial Ivory & Gold**, dengan **Noto Serif + Manrope**, sesuai keputusan user pada 7 Oktober 2026. MCP berhasil membaca metadata proyek/design system dan daftar layar; inspeksi visual lengkap serta slicing belum dilakukan dan menunggu izin user. Figma V4 dan tipografi Cormorant disimpan sebagai riwayat. Integrasi desain hanya untuk konteks pengembangan, bukan dependency runtime. Snapshot token berada di folder rancangan; panduan pemetaan dan status desain: [design system](docs/design-system.md).

## Mayar

Integrasi belum diimplementasikan. Targetnya ialah adapter provider di `src/server/integrations/mayar`, perhitungan nominal dari database, webhook terverifikasi, dan pemrosesan idempoten. Redirect atau status dari browser tidak membuktikan pembayaran. Rencana: [pembayaran](docs/payment.md).

## Deployment

Build menggunakan output `standalone` agar dapat dikemas untuk VPS. Belum ada deployment, perubahan DNS, atau perubahan reverse proxy. Sebelum tahap produksi, inspeksi VPS yang sudah ada, gunakan proxy yang sesuai, terapkan migrasi terkontrol, dan verifikasi HTTPS serta `/api/health`. Rencana: [deployment](docs/deployment.md).
