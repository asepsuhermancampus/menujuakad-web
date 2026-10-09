import { readFile, readdir } from "node:fs/promises";
import type { PGlite } from "@electric-sql/pglite";
const migrations = new URL("../../prisma/migrations/", import.meta.url);
export async function applyAuthMigrations(db: PGlite, legacy = false) {
  for (const name of (await readdir(migrations)).sort()) {
    // Mode legacy berhenti sebelum migrasi multimethod dan penyederhanaan role.
    if (name === "migration_lock.toml") continue;
    if (legacy && (name.startsWith("20261009") || name.startsWith("20261010"))) continue;
    await db.exec(await readFile(new URL(`${name}/migration.sql`, migrations), "utf8"));
  }
}
export async function applyMultimethodMigration(db: PGlite) {
  // Termasuk penyederhanaan role agar hasil akhir sama dengan database produksi.
  for (const name of [
    "20261009000000_auth_roles",
    "20261009001000_auth_multimethod",
    "20261010000000_role_client_superadmin",
  ]) {
    await db.exec(await readFile(new URL(`${name}/migration.sql`, migrations), "utf8"));
  }
}
export async function inspectIdentityConflicts(db: PGlite) {
  return (
    await db.query(
      await readFile(
        new URL("../../scripts/database/auth-multimethod-preflight.sql", import.meta.url),
        "utf8",
      ),
    )
  ).rows;
}
