import "dotenv/config";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../../src/generated/prisma/client";
import { getAuthSeedConfig } from "./auth-seed-config";

const migrationNames = [
  "20261007000000_foundation",
  "20261008000000_auth_preproduction",
  "20261008010000_payment_test",
];

async function main() {
  const config = getAuthSeedConfig(process.env);
  const before = process.argv.includes("--before-auth");
  const db = new PrismaClient({
    adapter: new PrismaNeon({
      connectionString: config.migrationUrl,
      max: 1,
      connectionTimeoutMillis: 5000,
      query_timeout: 5000,
    }),
  });
  try {
    const metadata = await db.$queryRaw<{ database: string; serverMajor: number }[]>`
      SELECT current_database()::text AS database, current_setting('server_version_num')::int / 10000 AS "serverMajor"
    `;
    const tables = await db.$queryRaw<{ name: string }[]>`
      SELECT tablename::text AS name FROM pg_tables WHERE schemaname='public' AND tablename<>'_prisma_migrations' ORDER BY tablename
    `;
    if (tables.length !== (before ? 9 : 13)) throw new Error("Table count salah");
    const records = await db.$queryRaw<
      {
        migration_name: string;
        checksum: string;
        finished_at: Date | null;
        rolled_back_at: Date | null;
      }[]
    >`
      SELECT migration_name,checksum,finished_at,rolled_back_at FROM public._prisma_migrations ORDER BY migration_name
    `;
    for (const name of before ? migrationNames.slice(0, 1) : migrationNames) {
      const sql = await readFile(
        new URL(`../../prisma/migrations/${name}/migration.sql`, import.meta.url),
      );
      const checksum = createHash("sha256").update(sql).digest("hex");
      const active = records.filter(
        (record) => record.migration_name === name && !record.rolled_back_at,
      );
      if (active.length !== 1 || !active[0].finished_at || active[0].checksum !== checksum)
        throw new Error("Checksum/history salah");
    }
    if (records.some((record) => !record.finished_at && !record.rolled_back_at))
      throw new Error("Migrasi belum selesai");
    const checks = await db.$queryRaw<{ name: string; definition: string }[]>`
      SELECT conname::text AS name, pg_get_constraintdef(oid)::text AS definition FROM pg_constraint
      WHERE contype='c' AND connamespace='public'::regnamespace ORDER BY conname
    `;
    const expectedChecks = [
      "Package_price_nonnegative",
      "Package_duration_positive",
      "Package_currency_idr",
      "Template_usageCount_nonnegative",
      ...(before ? [] : ["PaymentTestRequest_amountIdr_positive"]),
    ];
    if (
      checks.length !== expectedChecks.length ||
      expectedChecks.some((name) => !checks.some((check) => check.name === name))
    )
      throw new Error("CHECK count/nama salah");
    const runtimePrivileges = await db.$queryRaw<
      { table: string; select: boolean; insert: boolean; update: boolean; delete: boolean }[]
    >`
      SELECT tablename::text AS "table",
        has_table_privilege('menujuakad_runtime_preproduction', format('%I.%I',schemaname,tablename),'SELECT') AS "select",
        has_table_privilege('menujuakad_runtime_preproduction', format('%I.%I',schemaname,tablename),'INSERT') AS "insert",
        has_table_privilege('menujuakad_runtime_preproduction', format('%I.%I',schemaname,tablename),'UPDATE') AS "update",
        has_table_privilege('menujuakad_runtime_preproduction', format('%I.%I',schemaname,tablename),'DELETE') AS "delete"
      FROM pg_tables WHERE schemaname='public' AND tablename<>'_prisma_migrations' ORDER BY tablename
    `;
    let seedCounts;
    if (!before) {
      seedCounts = await db.$queryRaw<{ admins: number; customers: number; drafts: number }[]>`
        SELECT
          (SELECT count(*)::int FROM "User" WHERE email='admin@menujuakad.test' AND role='SUPERADMIN' AND status='ACTIVE') AS admins,
          (SELECT count(*)::int FROM "User" WHERE email ~ '^customer(0[1-9]|10)@menujuakad[.]test$' AND role='CUSTOMER' AND status='ACTIVE') AS customers,
          (SELECT count(*)::int FROM "Invitation" WHERE slug ~ '^seed-customer-(0[1-9]|10)$' AND status='DRAFT' AND NOT "isPublished") AS drafts
      `;
    }
    console.info(
      JSON.stringify(
        {
          mode: before ? "before-auth" : "after-migrations",
          metadata,
          tables: tables.map((table) => table.name),
          migrations: records.map((record) => ({
            name: record.migration_name,
            finished: !!record.finished_at,
            rolledBack: !!record.rolled_back_at,
          })),
          checks,
          runtimePrivileges,
          seedCounts,
        },
        null,
        2,
      ),
    );
  } finally {
    await db.$disconnect();
  }
}
main().catch(() => {
  console.error(
    "Inspection auth preproduction gagal; detail provider/credential/data pengguna tidak dicetak.",
  );
  process.exitCode = 1;
});
