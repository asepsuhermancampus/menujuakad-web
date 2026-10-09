import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

describe("migrasi auth additive dari fondasi existing", () => {
  const db = new PGlite();
  beforeAll(async () => {
    await db.exec(
      await readFile(
        new URL("../../prisma/migrations/20261007000000_foundation/migration.sql", import.meta.url),
        "utf8",
      ),
    );
    await db.exec(`INSERT INTO "User" ("id","email","updatedAt") VALUES ('existing','existing@example.test',now());
      INSERT INTO "Template" ("id","name","slug","updatedAt") VALUES ('botanical','Botanical existing','botanical-development',now());
      INSERT INTO "Package" ("id","name","slug","price","durationDays","updatedAt") VALUES ('existing-package','Existing','existing',149000,30,now());`);
    const checksBefore = (
      await db.query(
        "SELECT conname FROM pg_constraint WHERE contype='c' AND connamespace='public'::regnamespace ORDER BY conname",
      )
    ).rows;
    await db.exec(
      await readFile(
        new URL(
          "../../prisma/migrations/20261008000000_auth_preproduction/migration.sql",
          import.meta.url,
        ),
        "utf8",
      ),
    );
    expect(
      (
        await db.query(
          "SELECT conname FROM pg_constraint WHERE contype='c' AND connamespace='public'::regnamespace ORDER BY conname",
        )
      ).rows,
    ).toEqual(checksBefore);
  }, 15000);
  afterAll(async () => {
    await db.close();
  });

  it("mempertahankan row dan empat CHECK fondasi setelah 9 → 12 tabel", async () => {
    expect(
      (await db.query("SELECT tablename FROM pg_tables WHERE schemaname='public'")).rows,
    ).toHaveLength(12);
    expect((await db.query(`SELECT "email" FROM "User" WHERE "id"='existing'`)).rows).toEqual([
      { email: "existing@example.test" },
    ]);
    expect((await db.query(`SELECT "slug" FROM "Template"`)).rows).toEqual([
      { slug: "botanical-development" },
    ]);
    expect(
      (
        await db.query(
          "SELECT conname FROM pg_constraint WHERE contype='c' AND connamespace='public'::regnamespace",
        )
      ).rows,
    ).toHaveLength(4);
    await expect(
      db.exec(
        `INSERT INTO "Package" ("id","name","slug","price","durationDays","updatedAt") VALUES ('bad','Bad','bad',-1,30,now())`,
      ),
    ).rejects.toThrow();
    await expect(
      db.exec(`UPDATE "Template" SET "usageCount"=-1 WHERE "id"='botanical'`),
    ).rejects.toThrow();
  });
  it("credential PK/FK menolak duplikat dan user tidak ada", async () => {
    await db.exec(`INSERT INTO "AuthCredential" VALUES ('existing','hash-only')`);
    await expect(
      db.exec(`INSERT INTO "AuthCredential" VALUES ('existing','replacement')`),
    ).rejects.toThrow();
    await expect(
      db.exec(`INSERT INTO "AuthCredential" VALUES ('unknown','hash')`),
    ).rejects.toThrow();
  });
  it("session token unik dan FK user enforced", async () => {
    await db.exec(
      `INSERT INTO "UserSession" ("id","userId","tokenHash","expiresAt") VALUES ('s1','existing','token-hash',now()+interval '7 days')`,
    );
    await expect(
      db.exec(
        `INSERT INTO "UserSession" ("id","userId","tokenHash","expiresAt") VALUES ('s2','existing','token-hash',now())`,
      ),
    ).rejects.toThrow();
    await expect(
      db.exec(
        `INSERT INTO "UserSession" ("id","userId","tokenHash","expiresAt") VALUES ('s3','unknown','other-hash',now())`,
      ),
    ).rejects.toThrow();
  });
  it("timestamp auth memakai timestamptz precision 3 dan indeks user/expiry tersedia", async () => {
    const columns = (
      await db.query<{ data_type: string; datetime_precision: number }>(
        `SELECT data_type,datetime_precision FROM information_schema.columns WHERE table_name IN ('UserSession','AuthLoginThrottle') AND column_name IN ('expiresAt','createdAt','windowStartsAt','blockedUntil')`,
      )
    ).rows;
    expect(columns).toHaveLength(4);
    expect(
      columns.every(
        (column) =>
          column.data_type === "timestamp with time zone" && column.datetime_precision === 3,
      ),
    ).toBe(true);
    const indexes = (
      await db.query<{ indexname: string }>(
        `SELECT indexname FROM pg_indexes WHERE tablename='UserSession'`,
      )
    ).rows.map((row) => row.indexname);
    expect(indexes).toContain("UserSession_userId_idx");
    expect(indexes).toContain("UserSession_expiresAt_idx");
  });
  it("throttle persisten key unik serta nullable blockedUntil", async () => {
    await db.exec(
      `INSERT INTO "AuthLoginThrottle" ("keyHash","failedAttempts","windowStartsAt") VALUES ('hashed-key',1,now()); UPDATE "AuthLoginThrottle" SET "failedAttempts"="failedAttempts"+1 WHERE "keyHash"='hashed-key'`,
    );
    expect(
      (await db.query(`SELECT "failedAttempts","blockedUntil" FROM "AuthLoginThrottle"`)).rows,
    ).toEqual([{ failedAttempts: 2, blockedUntil: null }]);
    await expect(
      db.exec(
        `INSERT INTO "AuthLoginThrottle" ("keyHash","failedAttempts","windowStartsAt") VALUES ('hashed-key',0,now())`,
      ),
    ).rejects.toThrow();
  });
});
