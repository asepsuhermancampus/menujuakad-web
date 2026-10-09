import { customerJourneys, journeyDistribution } from "./customer-journey-fixtures";
async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0 || (args.length === 1 && args[0] === "--dry-run")) {
    console.info(
      `DRY RUN — ${customerJourneys.length} customer sintetis; 18 DRAFT privat; 6 pembayaran uji. Tanpa koneksi atau manifest credential.`,
    );
    console.info(JSON.stringify(journeyDistribution));
    return;
  }
  if (args.length !== 1 || args[0] !== "--apply") throw new Error("Argumen tidak dikenal.");
  // Tidak membaca .env atau mengimpor adapter database pada dry run.
  const { getCustomerJourneyConfig } = await import("./customer-journey-config");
  const config = getCustomerJourneyConfig(process.env);
  const { withCustomerJourneyManifest } = await import("./customer-journey-manifest");
  const { seedCustomerJourneys } = await import("./customer-journey-data");
  const { PrismaNeon } = await import("@prisma/adapter-neon");
  const { PrismaClient } = await import("../../src/generated/prisma/client");
  const prisma = new PrismaClient({
    adapter: new PrismaNeon({ connectionString: config.migrationUrl }),
  });
  try {
    const summary = await withCustomerJourneyManifest(config.directory, (manifest) =>
      prisma.$transaction(
        (transaction) =>
          seedCustomerJourneys(
            {
              query: async <Row>(sql: string, parameters: unknown[] = []) => ({
                rows: await transaction.$queryRawUnsafe<Row[]>(sql, ...parameters),
              }),
            },
            manifest,
          ),
        { timeout: 120000, maxWait: 10000 },
      ),
    );
    console.info(
      `Seed customer selesai: ${summary.createdAccounts} akun, ${summary.createdInvitations} draft, ${summary.createdPayments} pembayaran uji baru; ${summary.skippedAccounts} akun dilewati. Credential hanya dalam manifest privat luar repository.`,
    );
  } finally {
    await prisma.$disconnect();
  }
}
main().catch(() => {
  console.error(
    "Seed customer gagal. Periksa opt-in, target preproduction, migrasi, collision dan izin manifest secara privat.",
  );
  process.exitCode = 1;
});
