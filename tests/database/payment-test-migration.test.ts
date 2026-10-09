import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { beforeAll, afterAll, describe, expect, it } from "vitest";

describe("migrasi permintaan QRIS pengujian tanpa entitlement", () => {
  const db = new PGlite();
  beforeAll(async () => {
    for (const name of [
      "20261007000000_foundation",
      "20261008000000_auth_preproduction",
      "20261008010000_payment_test",
    ]) {
      await db.exec(
        await readFile(
          new URL(`../../prisma/migrations/${name}/migration.sql`, import.meta.url),
          "utf8",
        ),
      );
    }
    await db.exec(`INSERT INTO "User" ("id","email","updatedAt") VALUES ('customer','customer@example.test',now()),('admin','admin@example.test',now());
      INSERT INTO "Template" ("id","name","slug","updatedAt") VALUES ('template','Test','test',now());
      INSERT INTO "Invitation" ("id","ownerUserId","templateId","slug","title","updatedAt") VALUES ('invitation','customer','template','test','Test',now());`);
  }, 15000);
  afterAll(async () => {
    await db.close();
  });
  it("menyimpan request amount integer IDR positif dengan default REQUESTED", async () => {
    await db.exec(
      `INSERT INTO "PaymentTestRequest" ("id","invitationId","userId","amountIdr","packageSlug","updatedAt") VALUES ('request','invitation','customer',1000,'test-noncommercial',now())`,
    );
    expect(
      (
        await db.query(
          `SELECT "status","amountIdr","reviewedAt","reviewedByUserId" FROM "PaymentTestRequest" WHERE "id"='request'`,
        )
      ).rows,
    ).toEqual([{ status: "REQUESTED", amountIdr: 1000, reviewedAt: null, reviewedByUserId: null }]);
  });
  it.each([0, -1])("CHECK menolak amountIdr %i", async (amount) => {
    await expect(
      db.query(
        `INSERT INTO "PaymentTestRequest" ("id","invitationId","userId","amountIdr","packageSlug","updatedAt") VALUES ($1,'invitation','customer',$2,'test',now())`,
        [`bad-${amount}`, amount],
      ),
    ).rejects.toThrow();
  });
  it("FK menolak invitation/user/reviewer tidak ada dan enum menolak PAID", async () => {
    for (const [invitation, user] of [
      ["missing", "customer"],
      ["invitation", "missing"],
    ]) {
      await expect(
        db.query(
          `INSERT INTO "PaymentTestRequest" ("id","invitationId","userId","amountIdr","packageSlug","updatedAt") VALUES ($1,$2,$3,1000,'test',now())`,
          [`bad-${invitation}-${user}`, invitation, user],
        ),
      ).rejects.toThrow();
    }
    await expect(
      db.exec(`UPDATE "PaymentTestRequest" SET "reviewedByUserId"='missing' WHERE "id"='request'`),
    ).rejects.toThrow();
    await expect(
      db.exec(`UPDATE "PaymentTestRequest" SET "status"='PAID' WHERE "id"='request'`),
    ).rejects.toThrow();
  });
  it("approval TEST tidak mengubah status/publikasi invitation", async () => {
    await db.exec(
      `UPDATE "PaymentTestRequest" SET "status"='APPROVED_TEST',"reviewedByUserId"='admin',"reviewedAt"=now() WHERE "id"='request'`,
    );
    expect((await db.query(`SELECT "status","isPublished" FROM "Invitation"`)).rows).toEqual([
      { status: "DRAFT", isPublished: false },
    ]);
    const indexes = (
      await db.query<{ indexname: string }>(
        `SELECT indexname FROM pg_indexes WHERE tablename='PaymentTestRequest'`,
      )
    ).rows.map((row) => row.indexname);
    expect(indexes).toContain("PaymentTestRequest_userId_createdAt_idx");
    expect(indexes).toContain("PaymentTestRequest_status_createdAt_idx");
  });
});
