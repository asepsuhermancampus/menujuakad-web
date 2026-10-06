import "server-only";
import { getPrisma } from "@/server/db/client";
import { getDatabaseUrl } from "@/server/env";
import { checkHealth } from "./service";

export function getHealthReport() {
  return checkHealth({
    isDatabaseConfigured: () => Boolean(getDatabaseUrl()),
    async pingDatabase() {
      // Probe koneksi saja; tidak ada data pelanggan yang dibaca.
      await getPrisma().$queryRaw`SELECT 1`;
    },
  });
}
