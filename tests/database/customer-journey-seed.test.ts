import { readFile, readdir, mkdtemp, unlink, rmdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { sectionSchemas, createInvitationSchema } from "../../src/server/invitations/input";
import { testingPackages } from "../../src/server/billing/catalog";
import { journeyReviewer } from "../../scripts/database/customer-journey-validation";
import { hashPassword, verifyPassword } from "../../src/server/auth/password-crypto";
import { customerJourneys } from "../../scripts/database/customer-journey-fixtures";
import { withCustomerJourneyManifest } from "../../scripts/database/customer-journey-manifest";
import { seedCustomerJourneys } from "../../scripts/database/customer-journey-data";
async function database() {
  const db = new PGlite();
  // Seluruh migrasi diterapkan agar enum UserRole sama dengan produksi (CLIENT/SUPERADMIN).
  for (const name of (await readdir(new URL("../../prisma/migrations/", import.meta.url)))
    .filter((name) => name !== "migration_lock.toml")
    .sort())
    await db.exec(
      await readFile(
        new URL(`../../prisma/migrations/${name}/migration.sql`, import.meta.url),
        "utf8",
      ),
    );
  return db;
}
async function cleanup(directory: string) {
  await unlink(join(directory, "credentials.json")).catch(() => {});
  await rmdir(directory);
}
describe("30 customer journey fixtures PostgreSQL nyata", () => {
  it("reviewer hanya admin seed aktif; tanpa admin valid menggunakan null", async () => {
    const db = await database();
    try {
      expect(await journeyReviewer(db)).toBeNull();
      await db.exec(
        `INSERT INTO "User" ("id","email","role","updatedAt") VALUES ('reviewer','admin@menujuakad.test','CLIENT',now())`,
      );
      expect(await journeyReviewer(db)).toBeNull();
      await db.exec(`UPDATE "User" SET "role"='SUPERADMIN',"status"='SUSPENDED'`);
      expect(await journeyReviewer(db)).toBeNull();
      await db.exec(`UPDATE "User" SET "status"='ACTIVE'`);
      expect(await journeyReviewer(db)).toBe("reviewer");
    } finally {
      await db.close();
    }
  }, 15000);
  it("30 customer/18 draft/6 pembayaran uji; DTO-compatible, no session; rerun tidak menimpa edit/status/password atau menghidupkan child terhapus", async () => {
    const db = await database();
    const directory = await mkdtemp(join(tmpdir(), "customer-journey-db-"));
    try {
      await db.exec(
        `INSERT INTO "User" ("id","email","role","updatedAt") VALUES ('existing-admin','admin@menujuakad.test','SUPERADMIN',now());`,
      );
      await withCustomerJourneyManifest(directory, async (manifest) => {
        expect(await db.transaction((tx) => seedCustomerJourneys(tx, manifest))).toMatchObject({
          createdAccounts: 30,
          createdInvitations: 18,
          createdPayments: 6,
        });
        const users = (
          await db.query<{ role: string; name: string | null; lastLoginAt: Date }>(
            `SELECT * FROM "User" WHERE "role"='CLIENT'`,
          )
        ).rows;
        expect(users).toHaveLength(30);
        expect(users.every((u) => u.lastLoginAt && (!u.name || u.name.startsWith("TEST")))).toBe(
          true,
        );
        const credentials = (
          await db.query<{ userId: string; passwordHash: string }>(
            `SELECT * FROM "AuthCredential" ORDER BY "userId"`,
          )
        ).rows;
        expect(credentials).toHaveLength(30);
        for (const account of [manifest.accounts[0], manifest.accounts[29]])
          expect(
            await verifyPassword(
              account.password,
              credentials.find((c) => c.userId === account.userId)!.passwordHash,
            ),
          ).toBe(true);
        expect(
          (
            await db.query(
              `SELECT * FROM "Invitation" WHERE "status"!='DRAFT' OR "isPublished"=true`,
            )
          ).rows,
        ).toHaveLength(0);
        expect((await db.query(`SELECT * FROM "Invitation"`)).rows).toHaveLength(18);
        expect(
          (await db.query(`SELECT * FROM "InvitationMember" WHERE "role"='OWNER'`)).rows,
        ).toHaveLength(18);
        expect((await db.query(`SELECT * FROM "CoupleProfile"`)).rows).toHaveLength(12);
        expect(
          (
            await db.query(
              `SELECT "status",count(*)::int AS count FROM "PaymentTestRequest" GROUP BY "status" ORDER BY "status"`,
            )
          ).rows,
        ).toEqual([
          { status: "REQUESTED", count: 3 },
          { status: "APPROVED_TEST", count: 2 },
          { status: "REJECTED", count: 1 },
        ]);
        expect(
          (
            await db.query(
              `SELECT * FROM "PaymentTestRequest" WHERE "reviewedAt" IS NOT NULL AND "reviewedByUserId"!='existing-admin'`,
            )
          ).rows,
        ).toHaveLength(0);
        const payments = (
          await db.query<{ packageSlug: string; amountIdr: number }>(
            `SELECT "packageSlug","amountIdr" FROM "PaymentTestRequest"`,
          )
        ).rows;
        for (const payment of payments)
          expect(testingPackages.find((p) => p.slug === payment.packageSlug)?.amountIdr).toBe(
            payment.amountIdr,
          );
        expect(
          (await db.query(`SELECT * FROM "User" WHERE "lastLoginAt"<"createdAt"`)).rows,
        ).toHaveLength(0);
        expect(
          (
            await db.query(
              `SELECT * FROM "User" WHERE "role"='CLIENT' AND "emailVerifiedAt" IS NULL`,
            )
          ).rows,
        ).toHaveLength(10);
        expect(
          (await db.query(`SELECT * FROM "User" WHERE "role"='CLIENT' AND "name" IS NULL`)).rows,
        ).toHaveLength(6);
        for (const table of ["UserSession", "Package"])
          expect((await db.query(`SELECT * FROM "${table}"`)).rows).toHaveLength(0);
        for (const row of (
          await db.query<{ type: string; configJson: unknown }>(
            `SELECT "type","configJson" FROM "InvitationSection"`,
          )
        ).rows)
          expect(
            sectionSchemas[row.type.toLowerCase() as keyof typeof sectionSchemas].safeParse(
              row.configJson,
            ).success,
          ).toBe(true);
        for (const fixture of customerJourneys.filter((f) => f.invitation))
          expect(createInvitationSchema.safeParse(fixture.invitation).success).toBe(true);
        const f = customerJourneys[24];
        const newHash = await hashPassword("CustomerChangedPassword123!");
        await db.query(`UPDATE "AuthCredential" SET "passwordHash"=$1 WHERE "userId"=$2`, [
          newHash,
          f.userId,
        ]);
        await db.query(
          `UPDATE "User" SET "name"='Edited customer',"status"='SUSPENDED' WHERE "id"=$1`,
          [f.userId],
        );
        await db.query(
          `UPDATE "Invitation" SET "title"='Edited draft',"slug"='edited-slug' WHERE "id"=$1`,
          [f.invitationId],
        );
        await db.query(`UPDATE "PaymentTestRequest" SET "status"='REJECTED' WHERE "userId"=$1`, [
          f.userId,
        ]);
        await db.query(`DELETE FROM "CoupleProfile" WHERE "invitationId"=$1`, [f.invitationId]);
        await db.query(`DELETE FROM "InvitationSection" WHERE "invitationId"=$1`, [f.invitationId]);
        const tables = [
          "User",
          "AuthCredential",
          "Invitation",
          "InvitationMember",
          "CoupleProfile",
          "InvitationSection",
          "PaymentTestRequest",
        ];
        const snapshots = await Promise.all(
          tables.map(async (t) => (await db.query(`SELECT * FROM "${t}" ORDER BY 1`)).rows),
        );
        expect(await db.transaction((tx) => seedCustomerJourneys(tx, manifest))).toMatchObject({
          createdAccounts: 0,
          createdInvitations: 0,
          createdPayments: 0,
        });
        for (const [i, t] of tables.entries())
          expect((await db.query(`SELECT * FROM "${t}" ORDER BY 1`)).rows).toEqual(snapshots[i]);
      });
      // Kehilangan manifest tidak boleh diam-diam menerima password baru.
      await unlink(join(directory, "credentials.json"));
      await withCustomerJourneyManifest(directory, async (regenerated) => {
        await expect(db.transaction((tx) => seedCustomerJourneys(tx, regenerated))).rejects.toThrow(
          "collision",
        );
      });
    } finally {
      await db.close();
      await cleanup(directory);
    }
  }, 60000);
  it.each(["email", "slug", "id", "child", "template"])(
    "collision %s rollback seluruh transaksi",
    async (kind) => {
      const db = await database();
      const directory = await mkdtemp(join(tmpdir(), "customer-journey-collision-"));
      try {
        const last = customerJourneys[29];
        await db.query(`INSERT INTO "User" ("id","email","updatedAt") VALUES ($1,$2,now())`, [
          kind === "id" ? last.userId : "outsider",
          kind === "email" ? last.email : "outside@example.test",
        ]);
        if (kind === "template")
          await db.exec(
            `INSERT INTO "Template" ("id","name","slug","updatedAt") VALUES ('outsider-template','Existing','seed-preproduction-internal',now())`,
          );
        if (kind === "slug" || kind === "child") {
          await db.exec(
            `INSERT INTO "Template" ("id","name","slug","updatedAt") VALUES ('outside-template','Existing','outside-template',now())`,
          );
          await db.query(
            `INSERT INTO "Invitation" ("id","ownerUserId","templateId","slug","title","updatedAt") VALUES ('outside-invitation','outsider','outside-template',$1,'Existing',now())`,
            [kind === "slug" ? last.invitation!.slug : "outside-slug"],
          );
          if (kind === "child")
            await db.query(
              `INSERT INTO "InvitationSection" ("id","invitationId","type","sortOrder","updatedAt") VALUES ($1,'outside-invitation','COVER',0,now())`,
              [`${last.invitationId}-cover`],
            );
        }
        const before = (await db.query(`SELECT * FROM "User" ORDER BY 1`)).rows;
        const templates = (await db.query(`SELECT * FROM "Template" ORDER BY 1`)).rows;
        await withCustomerJourneyManifest(directory, async (manifest) => {
          await expect(db.transaction((tx) => seedCustomerJourneys(tx, manifest))).rejects.toThrow(
            "collision",
          );
        });
        expect((await db.query(`SELECT * FROM "User" ORDER BY 1`)).rows).toEqual(before);
        expect((await db.query(`SELECT * FROM "AuthCredential"`)).rows).toHaveLength(0);
        expect((await db.query(`SELECT * FROM "Template" ORDER BY 1`)).rows).toEqual(templates);
      } finally {
        await db.close();
        await cleanup(directory);
      }
    },
    15000,
  );
});
