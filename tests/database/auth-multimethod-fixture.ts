import { readFile, readdir } from "node:fs/promises";
import type { PGlite } from "@electric-sql/pglite";
const migrations = new URL("../../prisma/migrations/", import.meta.url);
export async function applyAuthMigrations(db: PGlite, legacy = false) {
  for (const name of (await readdir(migrations)).sort()) {
    if (name === "migration_lock.toml" || (legacy && name.startsWith("20261009"))) continue;
    await db.exec(await readFile(new URL(`${name}/migration.sql`, migrations), "utf8"));
  }
}
export async function applyMultimethodMigration(db: PGlite) {
  for (const name of ["20261009000000_auth_roles", "20261009001000_auth_multimethod"]) {
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
