import { PGlite } from "@electric-sql/pglite";
import { describe, expect, it } from "vitest";
import {
  applyAuthMigrations,
  applyMultimethodMigration,
  inspectIdentityConflicts,
} from "./auth-multimethod-fixture";

describe("preflight identitas legacy tanpa merge/hapus", () => {
  it.each([
    {
      firstEmail: "first@example.test",
      secondEmail: "second@example.test",
      firstPhone: "0812 3456 7890",
      secondPhone: "+62-812-3456-7890",
      emailConflicts: 0,
      invalidPhones: 0,
      phoneConflicts: 1,
    },
    {
      firstEmail: "Same@example.test",
      secondEmail: "same@example.test",
      firstPhone: null,
      secondPhone: null,
      emailConflicts: 1,
      invalidPhones: 0,
      phoneConflicts: 0,
    },
    {
      firstEmail: "first@example.test",
      secondEmail: "second@example.test",
      firstPhone: "invalid/123",
      secondPhone: null,
      emailConflicts: 0,
      invalidPhones: 1,
      phoneConflicts: 0,
    },
    {
      firstEmail: " ",
      secondEmail: "second@example.test",
      firstPhone: null,
      secondPhone: null,
      emailConflicts: 0,
      invalidPhones: 0,
      phoneConflicts: 0,
    },
    {
      firstEmail: "first@example.test",
      secondEmail: "second@example.test",
      firstPhone: "",
      secondPhone: null,
      emailConflicts: 0,
      invalidPhones: 1,
      phoneConflicts: 0,
    },
  ])(
    "mendeteksi konflik sebelum normalisasi dan rollback seluruh migrasi: %j",
    async (fixture) => {
      const db = new PGlite();
      try {
        await applyAuthMigrations(db, true);
        await db.query(
          `INSERT INTO "User" ("id","email","phone","updatedAt") VALUES ('first',$1,$2,now()),('second',$3,$4,now())`,
          [fixture.firstEmail, fixture.firstPhone, fixture.secondEmail, fixture.secondPhone],
        );
        const before = (await db.query(`SELECT * FROM "User" ORDER BY "id"`)).rows;
        expect(await inspectIdentityConflicts(db)).toEqual([
          {
            invalid_emails: fixture.firstEmail.trim() === "" ? 1 : 0,
            email_conflicts: fixture.emailConflicts,
            invalid_phones: fixture.invalidPhones,
            phone_conflicts: fixture.phoneConflicts,
          },
        ]);
        await expect(applyMultimethodMigration(db)).rejects.toThrow("AUTH_PREFLIGHT_CONFLICT");
        await db.exec("ROLLBACK");
        expect((await db.query(`SELECT * FROM "User" ORDER BY "id"`)).rows).toEqual(before);
        expect(
          (
            await db.query(
              `SELECT table_name FROM information_schema.tables WHERE table_name='AuthAccount'`,
            )
          ).rows,
        ).toHaveLength(0);
        expect(
          (
            await db.query(
              `SELECT column_name FROM information_schema.columns WHERE table_name='User' AND column_name='phoneVerifiedAt'`,
            )
          ).rows,
        ).toHaveLength(0);
      } finally {
        await db.close();
      }
    },
    15000,
  );
  it("normalisasi format aman hanya setelah semua hitungan nol", async () => {
    const db = new PGlite();
    try {
      await applyAuthMigrations(db, true);
      await db.exec(
        `INSERT INTO "User" ("id","email","phone","updatedAt") VALUES ('id',' Format@Example.test ','62812.3456.7890',now()),('international','international@example.test','+1 (415) 555-2671',now());`,
      );
      expect(await inspectIdentityConflicts(db)).toEqual([
        { invalid_emails: 0, email_conflicts: 0, invalid_phones: 0, phone_conflicts: 0 },
      ]);
      await applyMultimethodMigration(db);
      expect((await db.query(`SELECT "email","phone" FROM "User" WHERE "id"='id'`)).rows).toEqual([
        { email: "format@example.test", phone: "+6281234567890" },
      ]);
      expect(
        (await db.query(`SELECT "phone" FROM "User" WHERE "id"='international'`)).rows,
      ).toEqual([{ phone: "+14155552671" }]);
    } finally {
      await db.close();
    }
  }, 15000);
});
