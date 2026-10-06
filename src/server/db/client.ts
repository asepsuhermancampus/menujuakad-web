import "server-only";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@/generated/prisma/client";
import { getDatabaseUrl } from "@/server/env";

const globalForPrisma = globalThis as unknown as { menujuAkadPrisma?: PrismaClient };

export function getPrisma(): PrismaClient {
  if (globalForPrisma.menujuAkadPrisma) return globalForPrisma.menujuAkadPrisma;

  const connectionString = getDatabaseUrl();
  if (!connectionString) throw new Error("Koneksi database belum dikonfigurasi.");

  const adapter = new PrismaNeon({
    connectionString,
    connectionTimeoutMillis: 5_000,
    query_timeout: 5_000,
    max: 5,
  });
  const client = new PrismaClient({ adapter });
  globalForPrisma.menujuAkadPrisma = client;
  return client;
}
