import "dotenv/config";
import { constants } from "node:fs";
import { open } from "node:fs/promises";
import { join } from "node:path";
import { getAuthSeedConfig } from "./auth-seed-config";
import { ensurePrivateDirectory } from "./auth-seed-manifest";

async function main() {
  const config = getAuthSeedConfig(process.env);
  const runtime = process.argv.includes("--runtime");
  const url = new URL(runtime ? config.runtimeUrl : config.migrationUrl);
  const values = {
    PGHOST: url.hostname,
    PGPORT: url.port || "5432",
    PGDATABASE: decodeURIComponent(url.pathname.slice(1)),
    PGUSER: decodeURIComponent(url.username),
    PGPASSWORD: decodeURIComponent(url.password),
    PGSSLMODE: url.searchParams.get("sslmode")!,
    PGCHANNELBINDING: url.searchParams.get("channel_binding") || "prefer",
  };
  if (Object.values(values).some((value) => /[\r\n\0]/.test(value)))
    throw new Error("Nilai env tidak valid");
  const directory = await ensurePrivateDirectory("/tmp/menujuakad-auth-ops-20261008");
  const target = join(directory, runtime ? "pg-runtime.env" : "pg-owner.env");
  const file = await open(
    target,
    constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY | constants.O_NOFOLLOW,
    0o600,
  );
  try {
    await file.writeFile(
      Object.entries(values)
        .map(([key, value]) => `${key}=${value}`)
        .join("\n") + "\n",
    );
    await file.sync();
  } finally {
    await file.close();
  }
  console.info(
    "File env PostgreSQL privat0600 disiapkan di direktori ops; tidak ada nilai credential yang dicetak.",
  );
}
main().catch(() => {
  console.error(
    "Persiapan env PostgreSQL gagal; periksa opt-in, direktori privat dan file existing. Tidak menimpa file.",
  );
  process.exitCode = 1;
});
