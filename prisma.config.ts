import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations", seed: "tsx prisma/seed.ts" },
  // Generate/validate dapat berjalan tanpa kredensial. Migrasi tetap memerlukan DIRECT_URL.
  datasource: process.env.DIRECT_URL ? { url: process.env.DIRECT_URL } : undefined,
});
