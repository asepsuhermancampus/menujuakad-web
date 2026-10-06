import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

describe("integritas migrasi awal PostgreSQL terisolasi", () => {
  const db = new PGlite();

  beforeAll(async () => {
    const migration = await readFile(
      new URL("../../prisma/migrations/20261007000000_foundation/migration.sql", import.meta.url),
      "utf8",
    );
    await db.exec(migration);
    await db.exec(`
      INSERT INTO "User" ("id", "email", "updatedAt")
        VALUES ('owner', 'owner@example.test', now());
      INSERT INTO "Template" ("id", "name", "slug", "updatedAt")
        VALUES ('template', 'Template Uji', 'template-uji', now());
    `);
  }, 15_000);

  afterAll(async () => {
    await db.close();
  });

  async function addInvitation(id: string, slug: string) {
    return db.query(
      `INSERT INTO "Invitation" ("id", "ownerUserId", "templateId", "slug", "title", "updatedAt")
       VALUES ($1, 'owner', 'template', $2, 'Undangan Uji', now())`,
      [id, slug],
    );
  }

  it("menolak collision slug global meskipun ID undangan berbeda", async () => {
    await addInvitation("first", "rani-dimas");
    await expect(addInvitation("second", "rani-dimas")).rejects.toThrow();
  });

  it("menjaga owner dan template yang masih direferensikan", async () => {
    await addInvitation("protected", "nisa-rafi");
    await expect(db.query(`DELETE FROM "User" WHERE "id" = 'owner'`)).rejects.toThrow();
    await expect(db.query(`DELETE FROM "Template" WHERE "id" = 'template'`)).rejects.toThrow();
  });

  it("mencegah membership ganda dalam satu undangan", async () => {
    await addInvitation("collaboration", "intan-bayu");
    await db.query(`
      INSERT INTO "InvitationMember" ("id", "invitationId", "userId", "role", "updatedAt")
      VALUES ('member-1', 'collaboration', 'owner', 'OWNER', now())
    `);
    await expect(
      db.query(`
      INSERT INTO "InvitationMember" ("id", "invitationId", "userId", "role", "updatedAt")
      VALUES ('member-2', 'collaboration', 'owner', 'EDITOR', now())
    `),
    ).rejects.toThrow();
  });

  it.each([
    { price: -1, duration: 30, currency: "IDR" },
    { price: 149000, duration: 0, currency: "IDR" },
    { price: 149000, duration: 30, currency: "USD" },
  ])("menolak paket yang melanggar batas finansial: %j", async ({ price, duration, currency }) => {
    await expect(
      db.query(
        `INSERT INTO "Package" ("id", "name", "slug", "price", "durationDays", "currency", "updatedAt")
       VALUES ($1, 'Paket Uji', $1, $2, $3, $4, now())`,
        [`invalid-${price}-${duration}-${currency}`, price, duration, currency],
      ),
    ).rejects.toThrow();
  });

  it("menyimpan nominal rupiah valid tanpa pecahan floating point", async () => {
    await db.query(`
      INSERT INTO "Package" ("id", "name", "slug", "price", "durationDays", "updatedAt")
      VALUES ('valid-package', 'Paket Uji', 'paket-uji', 149000, 30, now())
    `);
    const result = await db.query<{ price: number; currency: string }>(
      `SELECT "price", "currency" FROM "Package" WHERE "id" = 'valid-package'`,
    );
    expect(result.rows).toEqual([{ price: 149000, currency: "IDR" }]);
  });
});
