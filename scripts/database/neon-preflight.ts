import "dotenv/config";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../../src/generated/prisma/client";
import { getNeonSetupConfig } from "./neon-config";

const models = [
  "User",
  "Template",
  "TemplateFeature",
  "Package",
  "PackageFeature",
  "Invitation",
  "InvitationMember",
  "CoupleProfile",
  "InvitationSection",
];
const foundation = "20261007000000_foundation";

async function main() {
  let config;
  try {
    config = getNeonSetupConfig(process.env);
  } catch (error) {
    console.error((error as Error).message);
    process.exitCode = 1;
    return;
  }
  if (process.argv.includes("--config-only")) {
    console.info(
      "Konfigurasi pooled/direct, SSL, endpoint dan database konsisten. Belum menguji koneksi atau schema.",
    );
    return;
  }
  const runtime = new PrismaClient({
    adapter: new PrismaNeon({
      connectionString: config.runtimeUrl,
      max: 1,
      connectionTimeoutMillis: 5000,
      query_timeout: 5000,
    }),
  });
  const migrations = new PrismaClient({
    adapter: new PrismaNeon({
      connectionString: config.migrationUrl,
      max: 1,
      connectionTimeoutMillis: 5000,
      query_timeout: 5000,
    }),
  });
  try {
    await runtime.$queryRaw`SELECT 1`;
    await migrations.$queryRaw`SELECT 1`;
    const tables = await migrations.$queryRaw<{ table_name: string }[]>`
      -- Prisma raw query tidak mendukung tipe PostgreSQL name tanpa cast.
      SELECT table_name::text AS table_name FROM information_schema.tables
      WHERE table_schema='public' AND table_type='BASE TABLE'
    `;
    const available = new Set(tables.map((table) => table.table_name));
    if (models.some((model) => !available.has(model))) {
      throw new Error(
        "Schema fondasi belum lengkap: jalankan db:deploy pada target yang sudah diverifikasi.",
      );
    }
    if (!available.has("_prisma_migrations")) {
      throw new Error(
        "SQL sudah tersedia tetapi riwayat Prisma belum ada: verifikasi impor dan baseline sesuai docs/database.md.",
      );
    }
    const records = await migrations.$queryRaw<
      { checksum: string; finished_at: Date | null; rolled_back_at: Date | null }[]
    >`
      SELECT checksum, finished_at, rolled_back_at FROM public._prisma_migrations
      WHERE migration_name=${foundation}
    `;
    const migration = await readFile(
      new URL(`../../prisma/migrations/${foundation}/migration.sql`, import.meta.url),
    );
    const checksum = createHash("sha256").update(migration).digest("hex");
    if (
      !records.some(
        (record) => record.finished_at && !record.rolled_back_at && record.checksum === checksum,
      )
    ) {
      throw new Error(
        "Riwayat fondasi/checksum belum sesuai; inspect dengan prisma migrate status sebelum melanjutkan.",
      );
    }
    console.info(
      "Neon terhubung: pooled/direct konsisten, sembilan tabel dan checksum migrasi fondasi terverifikasi. Tidak ada mutasi atau data pelanggan yang dibaca.",
    );
  } catch (error) {
    const safe =
      error instanceof Error &&
      /^(Schema fondasi|SQL sudah tersedia|Riwayat fondasi)/.test(error.message);
    console.error(
      safe
        ? (error as Error).message
        : "Probe Neon gagal. Periksa kredensial, TLS, jaringan dan migrasi; detail provider tidak dicetak.",
    );
    process.exitCode = 1;
  } finally {
    await Promise.allSettled([runtime.$disconnect(), migrations.$disconnect()]);
  }
}

main().catch(() => {
  console.error("Persiapan Neon gagal; detail rahasia tidak dicetak.");
  process.exitCode = 1;
});
