import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, realpath, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { makeFoundationImportSql } from "./export-sql";

const root = fileURLToPath(new URL("../../", import.meta.url));
const foundation = "20261007000000_foundation";

async function main() {
  const output = resolve(process.argv[2] || "/tmp/menujuakad-neon-import");
  await mkdir(output, { recursive: true });
  const physicalOutput = await realpath(output);
  const physicalRoot = await realpath(root);
  if (physicalOutput === physicalRoot || physicalOutput.startsWith(physicalRoot + "/")) {
    throw new Error("Simpan hasil ekspor di luar repository.");
  }
  const migrations = (await readdir(resolve(root, "prisma/migrations"), { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  if (migrations.length !== 1 || migrations[0] !== foundation) {
    throw new Error(
      "Ekspor ini khusus fondasi; gunakan Prisma migrate deploy untuk riwayat lebih lanjut.",
    );
  }
  const migration = await readFile(
    resolve(root, `prisma/migrations/${foundation}/migration.sql`),
    "utf8",
  );
  const sql = makeFoundationImportSql(migration);
  const manifest = {
    migration: foundation,
    migrationSha256: createHash("sha256").update(migration).digest("hex"),
    importSha256: createHash("sha256").update(sql).digest("hex"),
    scope: "Sembilan model fondasi, tanpa data customer/akun/harga/sesi/pembayaran",
  };
  await writeFile(resolve(output, "menujuakad-neon-foundation.sql"), sql, { flag: "wx" });
  await writeFile(resolve(output, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n", {
    flag: "wx",
  });
  await writeFile(
    resolve(output, "LEEME.md"),
    `# Impor Fondasi Menuju Akad ke Neon

Pilihan utama: isi DIRECT_URL ke branch pengembangan kosong lalu jalankan npm run db:deploy. Tidak perlu menjalankan SQL ini jika memilih migrasi Prisma.

Pilihan manual: di SQL Editor Neon pilih branch/database pengembangan yang kosong, tempel SELURUH menujuakad-neon-foundation.sql dan jalankan sekali. File memuat transaksi serta guard schema kosong. Bila query gagal, lakukan ROLLBACK sebelum mencoba ulang pada koneksi yang sama.

Setelah SQL manual selesai, verifikasi seluruh tabel/constraint, lalu dari repository yang sesuai jalankan:

    npx prisma migrate resolve --applied ${foundation}
    npx prisma migrate status
    npm run db:preflight:neon

DIRECT_URL dan DATABASE_URL harus menunjuk branch/database yang sama. Baseline hanya boleh dilakukan setelah hasil impor sesuai migrasi canonical; jangan menandai migrasi gagal/parsial sebagai applied. Jalankan db:seed hanya pada development; tidak ada akun atau harga komersial dalam paket ini. File ini tidak menghubungkan autentikasi atau backend bisnis.

Panduan lengkap: docs/database.md di aplikasi. Paket tidak memuat kredensial.
`,
    { flag: "wx" },
  );
  console.info(`Paket SQL Neon tersimpan: ${output}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Ekspor SQL gagal.");
  process.exitCode = 1;
});
