# Validasi QA autentikasi dan akun

## Status pemeriksaan

9 Oktober 2026. **Gate final LULUS.** Setelah fixwave UI QA-02, gate diulang penuh pada source final dan semuanya hijau: `prisma validate` exit0; `tsc --noEmit` exit0; `eslint .` exit0; unit/integrasi **606/606 lulus dalam71 file** (138,89 detik Vitest); build final exit0 BUILD_ID `Qt-A2nlN0Q3skYY1vYgN3`; **E2E 140/140 lulus dalam satu run** (4,3 menit, workers2, project desktop+mobile; `.last-run.json` = `passed`). Timeout keyboard specialist 34,2 detik pada run sebelumnya terdiagnosis sebagai contention beban (bukan bug produk) dan hilang pada run final. QA-02 (overflow `/register`) tertutup dan terverifikasi browser pada source final. Seluruh konfigurasi DB/provider dikosongkan untuk command gate; tidak ada perubahan backend/UI, `.env`, migrasi aktif, commit, push atau deploy oleh QA.

Riwayat run pada hari yang sama: baseline unit/integrasi600/600 dalam70 file (141,12 detik Vitest,141,68 detik command); build baseline exit0 dalam40,96 detik BUILD_ID `KQcQjyF3bNON1aNagaZjG`; setelah routing alias berubah, final typecheck/lint/new5unit/build exit0 BUILD_ID `rQkQKq-vt_Tz8bUiDIKz2`. Run E2E satu-run pertama (`rQkQKq-vt_Tz8bUiDIKz2`) berakhir 137 passed/3 failed seluruhnya pada QA-02; run kedua (`Qt-A2nlN0Q3skYY1vYgN3`) berakhir 139 passed/1 failed (timeout keyboard specialist); run final ketiga pada source yang sama berakhir **140/140 PASS**.

## Temuan inspeksi yang perlu keputusan pemilik

**QA-01 — Alias akun lama tidak lintas peran (deviasi ditemukan; perbaikan owner tersedia dan TERVERIFIKASI pada build final).** `src/app/(dashboard)/dashboard/layout.tsx` memanggil `requireCustomerSession('/dashboard')`; catch-all `dashboard/[...path]/page.tsx` juga memanggil guard customer sebelum redirect alias. Akibatnya VENDOR/SUPERADMIN yang sudah bersesi valid dan membuka `/dashboard/settings`, `/dashboard/settings/profile`, `/dashboard/settings/security` atau `/dashboard/account` akan ditolak menuju login sebelum mencapai akun sendiri. PM01 meminta settings lintas role; source aktual menyediakan entry canonical `/account` dan `/account/security` lintas role serta `/vendor` khusus VENDOR. Ini tidak membuka akses tanpa izin, tetapi tautan lama bagi role noncustomer tidak berfungsi sesuai kontrak. Reproduksi berbasis inspeksi source; browser autentikasi VENDOR/SUPERADMIN belum diuji dengan DB/provider live. ROOT/pemilik backend menentukan redirect alias sebelum shell customer. Owner menambahkan empat redirect exact307 pada next.config sebelum layoutcustomer; QA menambahkan assertion307+canonical guard anonim, dan pada run E2E final `auth-qa-gate.spec.ts` test "empat alias akun melakukan redirect307 sebelum guard customer" **LULUS** pada build `Qt-A2nlN0Q3skYY1vYgN3` untuk desktop dan mobile. Verifikasi browser ber-sesi VENDOR/SUPERADMIN live tetap terbuka (butuh DB/provider).

## Bukti persiapan

- `npx vitest run src/features/auth/components/real-auth-forms.test.ts src/server/authorization/guards.test.ts src/server/authorization/redirect-policy.test.ts`: 3 file/143 test PASS, 1,40 detik; preparatory, bukan full gate.
- No-JS login diperbarui dari selector email lama menjadi `name=identifier`, menambah assertion disabled dan autocomplete username tanpa melemahkan pemeriksaan URL.
- Reset simulasi diuji pada `/preview-ui/aut-04`; reset resmi tanpa proof tidak merender field. Test baru memeriksa fragment/no-JS tidak memicu POST.
- `tests/e2e/auth-qa-gate.spec.ts` menambah screenshot lima route auth pada320/390/768/1440, reflow/reduced motion, keyboard, request API nyata config missing, alias guard, reflow teks200% dan preview auth inert. Belum dijalankan terhadap build final pada checkpoint ini.

## Bug reflow ditemukan pada E2E final

**QA-02 — /register melebar di320px dan teks200% (Medium; DITUTUP pada build final).** Run desktop `auth-qa-gate.spec.ts:5` gagal: document.scrollWidth326 pada viewport320 (expected≤320). Test kedua `auth-qa-gate.spec.ts:167` gagal pada /register dengan viewport720 dan injeksi font200%. Kontrak viewport dan pembesaran teks dipertahankan, tidak dilonggarkan atau diskip. Snapshot menunjukkan checkbox persetujuan mempunyai text node serta dua Link sibling sebagai child `label.check`; CSS primitive membuat label flex tanpa wrapping. Diagnosis bounding-box25kombinasi memastikan hanya /register overflow:320→326px dan720teks200%→732px. Child field/grid semuanya melebar mengikuti min-content281px/543px; label.check persetujuan flex-nowrap dengan beberapa text/Link sibling adalah sumber min-content. UIowner membungkus teks consent menjadi satu span `auth-consent` min-width0/wrappable, checkbox `flex-shrink:0`, dan memberi grid child min-width0 tanpa overflow:hidden. Pada run E2E final build `Qt-A2nlN0Q3skYY1vYgN3`, kedua test (`auth-qa-gate.spec.ts:5` dan `:167`) **LULUS** pada desktop dan mobile; screenshot register320 dan login390 diperiksa. Bukti diagnosis lama di `/tmp/menujuakad-qa-gate/reflow-diagnostics.json` dan `/tmp/menujuakad-qa-diagnostic-register-320.png`; bukti final di `/tmp/menujuakad-qa-auth-*` (40 screenshot) dan `/tmp/menujuakad-qa-gate/qa-final-summary.json`.

## Interupsi runner browser

Proses managed E2E berakhir exit143 setelah baris test85 tanpa summary Playwright:82 PASS,3 FAIL reflow,55 belum dijalankan; bukan140 selesai. Penyebab signal belum terkonfirmasi. Source snapshot tidak berubah selama run. QA memeriksa port3107 dan membersihkan hanya PID webServer milik run sendiri sebelum run berikutnya dengan workers2 agar durasi lebih pendek; assertion/retry tidak dilonggarkan. Run-run selanjutnya kemudian diselesaikan sampai tuntas (lihat riwayat pada Status pemeriksaan).

## Checkpoint fixwave UI

OwnerUI membungkus teks persetujuan dalam span.auth-consent, min-width0/wrapping dan checkbox tidak mengecil; CSS tanpa overflow:hidden. SSR regresi pada test existing tersedia; UIowner melaporkan48 test/5file PASS. Source berubah pada tiga berkas UI setelah build rQkQKq-vt_Tz8bUiDIKz2; full run140 dengan workers2 dijalankan ulang pada artifact final dan menutup QA-02. Rebuild sesudah source stabil dilakukan dan 140 test diulang penuh sampai PASS.

## Checkpoint browser sesudah patch

Build finalUI `Qt-A2nlN0Q3skYY1vYgN3` exit0 (35,43detik). Gate final ulang Prisma/typecheck/lint dan53 scopedUI+alias lulus. Desktop auth matrix320/390/768/1440 reduced-motion serta teks200% PASS; screenshot register320 dan login390 telah diperiksa dan field/tombol/consent berada di dalam kartu. Ditemukan satu timeout34,2detik pada existing specialist keyboard test (batasdefault30detik) pada run kedua, bersamaan npmtest fullROOT dan Chromium2worker. Diagnosis: scoped reproduction tanpa beban **PASS dalam9,9detik** dan run final workers2 **PASS**, sehingga disimpulkan contention beban, bukan bug produk; assertion accessibility tidak diubah.

## Hasil akhir run final — 9 Oktober 2026

Gate final pada source/build `Qt-A2nlN0Q3skYY1vYgN3` (BUILD_ID sinkron dengan source; tidak ada file src/tests/next.config yang lebih baru):

- `prisma validate` exit0; `tsc --noEmit` exit0; `eslint .` exit0.
- Unit/integrasi: **606/606 PASS dalam71 file** (138,89detik Vitest).
- E2E: **140/140 PASS dalam satu run** (4,3menit, workers2, desktop+mobile, `.last-run.json`=`passed`). Termasuk kedua test QA-02, keyboard specialist, reflow teks200%, empat alias307, no-JS no-mutation, API fail-closed503, preview auth inert, dan seluruh suite lain.
- Bukti: `/tmp/menujuakad-qa-gate/qa-final-summary.json`, `e2e-final-140-last-run.json`, 40 screenshot `/tmp/menujuakad-qa-auth-*`.
- Batas yang tetap terbuka: verifikasi browser ber-sesi VENDOR/SUPERADMIN dengan DB/provider live, penerapan migrasi/grants ke Neon aktif, provider Google/Resend/Twilio live, dan deploy produksi. Gate ini membuktikan kode lokal teruji pada build final, bukan kesiapan produksi.
