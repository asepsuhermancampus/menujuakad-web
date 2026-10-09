// READ ONLY: preflight data auth sebelum migrasi; hanya mencetak hitungan, tanpa PII/hash.
// Jalankan dari root repo: npx tsx scripts/database/preflight-auth-readonly.ts
import { readFileSync } from "node:fs";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../../src/generated/prisma/client";

const url = process.env.DIRECT_URL;
if (!url) throw new Error("DIRECT_URL belum di-set.");

const sql = readFileSync("scripts/database/auth-multimethod-preflight.sql", "utf8");
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: url }) });
const bigintSafe = (_k: string, v: unknown) => (typeof v === "bigint" ? Number(v) : v);

const conflicts = await prisma.$queryRawUnsafe(sql);
console.log("preflight konflik:", JSON.stringify(conflicts, bigintSafe));

const counts = await prisma.$queryRawUnsafe(
  'SELECT (SELECT count(*) FROM "User")::int AS users, (SELECT count(*) FROM "Invitation")::int AS invitations, (SELECT count(*) FROM "Package")::int AS packages, (SELECT count(*) FROM "Template")::int AS templates',
);
console.log("jumlah data:", JSON.stringify(counts, bigintSafe));

const applied = await prisma.$queryRawUnsafe<{ migration_name: string }[]>(
  "SELECT migration_name FROM _prisma_migrations ORDER BY finished_at",
);
console.log("migrasi tercatat:", applied.map((r) => r.migration_name).join(", "));

await prisma.$disconnect();
