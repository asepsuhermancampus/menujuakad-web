import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../../src/generated/prisma/client";
import { getAuthSeedConfig } from "./auth-seed-config";
import { seedAuthPreproduction } from "./auth-seed-data";
import { withAuthSeedManifest } from "./auth-seed-manifest";

async function main() {
  const config = getAuthSeedConfig(process.env);
  const prisma = new PrismaClient({
    adapter: new PrismaNeon({ connectionString: config.migrationUrl }),
  });
  try {
    const summary = await withAuthSeedManifest(config.directory, (manifest) =>
      prisma.$transaction(
        (transaction) =>
          seedAuthPreproduction(
            {
              query: async <Row>(sql: string, parameters: unknown[] = []) => ({
                rows: await transaction.$queryRawUnsafe<Row[]>(sql, ...parameters),
              }),
            },
            manifest,
          ),
        { timeout: 60_000, maxWait: 10_000 },
      ),
    );
    console.info(
      `Seed auth preproduction selesai: ${summary.accounts} akun terverifikasi; ${summary.createdAccounts} akun dan ${summary.createdDrafts} DRAFT baru. Credential hanya di file privat luar repository.`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(() => {
  // Jangan meneruskan error provider karena dapat memuat URL/parameter/query rahasia.
  console.error(
    "Seed auth gagal. Periksa opt-in, pasangan URL preproduction, migrasi, collision dan izin manifest secara privat.",
  );
  process.exitCode = 1;
});
