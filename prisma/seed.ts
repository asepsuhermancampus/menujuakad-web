import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";

async function seed() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Seed contoh hanya untuk database pengembangan.");
  }

  const connectionString = process.env.DIRECT_URL;
  if (!connectionString) throw new Error("Isi DIRECT_URL sebelum menjalankan seed.");

  const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString }) });

  try {
    await prisma.template.upsert({
      where: { slug: "botanical-development" },
      update: {},
      create: {
        name: "Botanical — Contoh Pengembangan",
        slug: "botanical-development",
        description: "Data contoh internal. Bukan template katalog yang siap diterbitkan.",
        category: "botanical",
        status: "DRAFT",
      },
    });
    console.info("Seed selesai: satu template DRAFT, tanpa akun atau harga paket buatan.");
  } finally {
    await prisma.$disconnect();
  }
}

seed().catch(() => {
  console.error("Seed gagal. Periksa DIRECT_URL, migrasi, dan environment pengembangan.");
  process.exitCode = 1;
});
