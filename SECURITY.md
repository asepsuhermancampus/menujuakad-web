# Kebijakan Keamanan — menuju-akad

Dokumen ini mencatat kebijakan dependency, override keamanan yang aktif, dan advisory
yang diterima secara sadar (accepted risk) agar kontributor dan agent tidak salah
menafsirkan hasil `npm audit`.

Terakhir diperbarui: **14 Oktober 2026**

## Aturan dependency

- Audit rutin dengan `npm audit`; untuk melihat paparan produksi saja gunakan
  `npm audit --omit=dev` (saat ini **0 vulnerabilities**).
- **Jangan menjalankan `npm audit fix --force` di repo ini.** npm menyarankan downgrade
  `eslint-config-next` ke 14.x dan `prisma` ke 6.x — keduanya breaking change yang
  merusak project (Next 16 / Prisma 7) dan tidak menyelesaikan advisory yang ada.
- Perbaikan dependency dilakukan melalui blok `overrides` di `package.json`, lalu
  `npm install`, lalu validasi: `npm run db:validate`, `npm run typecheck`,
  `npm run lint`, `npm test`.
- Verifikasi supply chain: `npm audit signatures` (signature registry + attestation).

## Override keamanan aktif

| Paket | Dipaksa ke | Menutup | Alasan |
| --- | --- | --- | --- |
| `mysql2` | `^3.24.6` | GHSA-3f6p-5ww8-9rcr, GHSA-rgwj-5xj2-c3m3 (high) | `prisma@7.10.0` memin `3.15.3` yang rentan |
| `deepmerge-ts` | `^8.0.2` | GHSA-ggr8-5vv4-36mx (CVE-2026-40345, high) | `@prisma/config@7.10.0` memin `7.1.5` yang rentan; patch tersedia mulai `8.0.0` |

Catatan: keduanya hanya dipakai Prisma CLI (bukan runtime aplikasi). Project ini
memakai PostgreSQL/Neon, bukan MySQL; `mysql2` tidak pernah ter-load saat runtime.

## Advisory yang diterima sadar (belum ada patch upstream)

### `braces` <= 3.0.3 — GHSA-vfj7-8cjw-p6xm (CVE-2026-93687, high)

- **Rantai**: `eslint-config-next` → `@next/eslint-plugin-next` → `fast-glob` → `micromatch` → `braces`.
- **Status upstream**: tidak ada versi `braces` yang sudah dipatch — `3.0.3` adalah rilis
  terbaru dan seluruh versi terdampak (lihat issue micromatch/braces#84). Tidak ada
  target upgrade/override yang tersedia.
- **Kenapa diterima**:
  - Hanya dependency **dev** (ESLint). Tidak masuk bundle produksi —
    `npm audit --omit=dev` bersih.
  - Trigger membutuhkan *glob pattern* bersarang ekstrem yang dikendalikan penyerang;
    pattern di repo ini statis dan ditulis developer, bukan berasal dari input pengguna.
- **Tindak lanjut**: pantau rilis patch `braces`. Setelah tersedia, tambahkan `overrides`
  atau upgrade rantai `eslint-config-next`. Jangan menyelesaikannya dengan
  `npm audit fix --force` (akan merusak project, lihat aturan di atas).

## Hasil verifikasi terakhir (14 Oktober 2026)

- `npm audit --omit=dev`: 0 vulnerabilities; `npm audit`: 5 high, seluruhnya rantai
  `braces` dev-only di atas.
- `npm audit signatures`: 536/536 paket terverifikasi signature registry; 150 dengan attestation.
- Seluruh `resolved` di `package-lock.json` menunjuk ke `registry.npmjs.org`.
- Paket dengan install script (semuanya resmi): `@prisma/engines`, `prisma`, `esbuild`,
  `unrs-resolver`.

## Melaporkan masalah

Laporkan temuan keamanan secara privat ke pemilik repo
(`github.com/asepsuhermancampus`) — jangan membuka issue publik yang memuat detail
eksploitasi. Jangan pernah menuliskan kredensial/rahasia di issue, PR, atau log;
`.env` tidak pernah di-commit ke Git.
