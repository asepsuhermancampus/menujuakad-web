// Menerapkan grant runtime terbatas ke Neon memakai role owner (DIRECT_URL).
// Sumber SQL: scripts/database/auth-runtime-grants.sql (BEGIN/COMMIT internal).
import { readFileSync } from "node:fs";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../../src/generated/prisma/client";

const url = process.env.DIRECT_URL;
if (!url) throw new Error("DIRECT_URL belum di-set.");

const sql = readFileSync("scripts/database/auth-runtime-grants.sql", "utf8");
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: url }) });

try {
  await prisma.$executeRawUnsafe(sql);
  console.log("Grant runtime diterapkan tanpa error.");
} finally {
  await prisma.$disconnect();
}
