import { PGlite } from "@electric-sql/pglite";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

// Uji migrasi penyederhanaan role pada PostgreSQL terisolasi (PGlite): menerapkan
// seluruh migrasi berurutan, lalu memverifikasi pemetaan CUSTOMER/VENDOR -> CLIENT,
// penolakan nilai enum lama, dan trigger registrasi runtime yang dibuat ulang.
const migrationsDir = fileURLToPath(new URL("../../prisma/migrations/", import.meta.url));
const target = "20261010000000_role_client_superadmin";

describe("penyederhanaan UserRole menjadi CLIENT + SUPERADMIN", () => {
  const db = new PGlite();

  beforeAll(async () => {
    const names = readdirSync(migrationsDir)
      .filter((name) => name !== "migration_lock.toml")
      .sort();
    for (const name of names) {
      if (name === target) continue;
      await db.exec(readFileSync(join(migrationsDir, name, "migration.sql"), "utf8"));
    }
    await db.exec(`
      INSERT INTO "User" ("id","email","role","status","updatedAt") VALUES
        ('legacy-customer','customer@example.test','CUSTOMER','ACTIVE',now()),
        ('legacy-vendor','vendor@example.test','VENDOR','ACTIVE',now()),
        ('legacy-admin','admin@example.test','SUPERADMIN','ACTIVE',now()),
        ('legacy-client','client@example.test','CLIENT','ACTIVE',now());
    `);
    await db.exec(readFileSync(join(migrationsDir, target, "migration.sql"), "utf8"));
  }, 30000);

  afterAll(async () => {
    await db.close();
  });

  it("menyisakan hanya CLIENT dan SUPERADMIN pada tipe enum", async () => {
    const values = (
      await db.query<{ v: string }>(
        `SELECT e.enumlabel::text AS v FROM pg_enum e JOIN pg_type t ON t.oid=e.enumtypid
         WHERE t.typname='UserRole' ORDER BY e.enumsortorder`,
      )
    ).rows.map((row) => row.v);
    expect(values).toEqual(["CLIENT", "SUPERADMIN"]);
  });

  it("memetakan CUSTOMER dan VENDOR menjadi CLIENT tanpa menghapus akun", async () => {
    const rows = (
      await db.query<{ id: string; role: string }>(
        `SELECT "id","role"::text AS role FROM "User" ORDER BY "id"`,
      )
    ).rows;
    expect(rows).toEqual([
      { id: "legacy-admin", role: "SUPERADMIN" },
      { id: "legacy-client", role: "CLIENT" },
      { id: "legacy-customer", role: "CLIENT" },
      { id: "legacy-vendor", role: "CLIENT" },
    ]);
  });

  it("menetapkan default CLIENT dan menolak nilai enum lama", async () => {
    const defaultRole = (
      await db.query<{ d: string }>(
        `SELECT column_default AS d FROM information_schema.columns
         WHERE table_name='User' AND column_name='role'`,
      )
    ).rows[0].d;
    expect(defaultRole).toContain("CLIENT");
    await expect(
      db.exec(
        `INSERT INTO "User" ("id","email","role","status","updatedAt")
         VALUES ('bad','bad@example.test','VENDOR','ACTIVE',now())`,
      ),
    ).rejects.toThrow();
  });

  it("membuat ulang trigger registrasi runtime dengan perilaku yang sama", async () => {
    const triggers = (
      await db.query<{ c: number }>(
        `SELECT count(*)::int AS c FROM pg_trigger WHERE tgname='User_runtime_registration_guard'`,
      )
    ).rows[0].c;
    const functions = (
      await db.query<{ c: number }>(
        `SELECT count(*)::int AS c FROM pg_proc WHERE proname='auth_guard_runtime_registration'`,
      )
    ).rows[0].c;
    expect(triggers).toBe(1);
    expect(functions).toBe(1);

    await db.exec(
      `CREATE ROLE menujuakad_runtime_preproduction NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
       GRANT INSERT ON "User" TO menujuakad_runtime_preproduction;`,
    );

    // Role runtime tidak boleh membuat SUPERADMIN.
    await expect(
      (async () => {
        await db.exec(`SET ROLE menujuakad_runtime_preproduction;`);
        try {
          await db.exec(
            `INSERT INTO "User" ("id","email","role","status","updatedAt")
             VALUES ('rt-admin','rt-admin@example.test','SUPERADMIN','ACTIVE',now())`,
          );
        } finally {
          await db.exec(`RESET ROLE;`);
        }
      })(),
    ).rejects.toThrow(/AUTH_REGISTRATION_ROLE_FORBIDDEN/);

    // Role runtime tetap boleh membuat CLIENT/ACTIVE.
    await db.exec(`SET ROLE menujuakad_runtime_preproduction;`);
    await db.exec(
      `INSERT INTO "User" ("id","email","role","status","updatedAt")
       VALUES ('rt-client','rt-client@example.test','CLIENT','ACTIVE',now())`,
    );
    await db.exec(`RESET ROLE;`);
    const created = (
      await db.query<{ role: string }>(
        `SELECT "role"::text AS role FROM "User" WHERE "id"='rt-client'`,
      )
    ).rows;
    expect(created).toEqual([{ role: "CLIENT" }]);
  });
});
