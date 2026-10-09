import { readFile, readdir } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { applyAuthMigrations, applyMultimethodMigration } from "./auth-multimethod-fixture";

const migration = "20261009002000_auth_sms_policy";
const migrations = new URL("../../prisma/migrations/", import.meta.url);

describe("kebijakan SMS OTP permanen PostgreSQL", () => {
  const db = new PGlite();
  let before: Record<string, unknown[]>;
  const snapshot = async () => {
    const tables = await db.query<{ name: string }>(
      `SELECT tablename AS name FROM pg_tables WHERE schemaname='public' ORDER BY tablename`,
    );
    const result: Record<string, unknown[]> = {};
    for (const { name } of tables.rows) {
      // Abaikan hanya kolom baru agar seluruh nilai dan relasi lama dibandingkan.
      result[name] = (
        await db.query(
          `SELECT to_jsonb(t) - 'smsOtpEnabled' AS record FROM "${name}" t ORDER BY to_jsonb(t)::text`,
        )
      ).rows;
    }
    return result;
  };
  beforeAll(async () => {
    await applyAuthMigrations(db, true);
    await applyMultimethodMigration(db);
    await db.exec(`INSERT INTO "User" ("id","email","phone","phoneVerifiedAt","role","updatedAt")
      VALUES ('verified','verified@example.test','+628123450001',now(),'CLIENT',now()),
      ('unverified',NULL,'+628123450002',NULL,'CLIENT',now()),
      ('google-only',NULL,NULL,NULL,'CLIENT',now());
      INSERT INTO "AuthCredential" VALUES ('verified','existing-password-hash');
      INSERT INTO "UserSession" ("id","userId","tokenHash","expiresAt")
        VALUES ('session','verified','existing-session-hash',now()+interval '1 day');
      INSERT INTO "AuthAccount" ("id","userId","provider","providerAccountId","updatedAt")
        VALUES ('account','google-only','google','existing-subject',now());
      INSERT INTO "AuthVerificationToken" ("id","userId","tokenHash","purpose","expiresAt")
        VALUES ('proof','verified','existing-proof-hash','PHONE_OTP',now()+interval '5 minutes');
      INSERT INTO "Template" ("id","name","slug","updatedAt") VALUES ('template','TEST','test',now());
      INSERT INTO "Invitation" ("id","ownerUserId","templateId","slug","title","updatedAt")
        VALUES ('invitation','verified','template','test','TEST',now());
      INSERT INTO "InvitationMember" ("id","invitationId","userId","role","updatedAt")
        VALUES ('member','invitation','verified','OWNER',now());
      INSERT INTO "PaymentTestRequest" ("id","invitationId","userId","amountIdr","packageSlug","updatedAt")
        VALUES ('payment','invitation','verified',1000,'test',now());`);
    before = await snapshot();
    await db.exec(await readFile(new URL(`${migration}/migration.sql`, migrations), "utf8"));
  }, 15000);
  afterAll(async () => {
    await db.close();
  });

  it("mempertahankan semua data/relasi lama dan default false tanpa mengaktifkan akun verified", async () => {
    expect(await snapshot()).toEqual(before);
    expect((await db.query(`SELECT "smsOtpEnabled" FROM "User"`)).rows).toEqual(
      Array.from({ length: 3 }, () => ({ smsOtpEnabled: false })),
    );
    await db.exec(
      `INSERT INTO "User" ("id","email","updatedAt") VALUES ('new','new@example.test',now())`,
    );
    expect((await db.query(`SELECT "smsOtpEnabled" FROM "User" WHERE "id"='new'`)).rows).toEqual([
      { smsOtpEnabled: false },
    ]);
    await expect(
      db.exec(`UPDATE "User" SET "smsOtpEnabled"=NULL WHERE "id"='new'`),
    ).rejects.toThrow();
  });

  it("CHECK menolak INSERT/UPDATE enabled tanpa nomor terverifikasi", async () => {
    await expect(
      db.exec(`INSERT INTO "User" ("id","smsOtpEnabled","updatedAt")
      VALUES ('invalid',true,now())`),
    ).rejects.toThrow("User_sms_otp_verified_check");
    for (const id of ["unverified", "google-only"])
      await expect(
        db.query(`UPDATE "User" SET "smsOtpEnabled"=true WHERE "id"=$1`, [id]),
      ).rejects.toThrow("User_sms_otp_verified_check");
    await db.exec(`UPDATE "User" SET "smsOtpEnabled"=true WHERE "id"='verified'`);
    expect(
      (await db.query(`SELECT "smsOtpEnabled" FROM "User" WHERE "id"='verified'`)).rows,
    ).toEqual([{ smsOtpEnabled: true }]);
  });

  it("unlink tanpa disable ditolak, rollback utuh dan unlink+disable atomik berhasil", async () => {
    await expect(
      db.exec(`UPDATE "User" SET "phoneVerifiedAt"=NULL WHERE "id"='verified'`),
    ).rejects.toThrow("User_sms_otp_verified_check");
    await expect(
      db.exec(`UPDATE "User" SET "phone"=NULL,"phoneVerifiedAt"=NULL WHERE "id"='verified'`),
    ).rejects.toThrow("User_sms_otp_verified_check");
    const unlink = `UPDATE "User" SET "phone"=NULL,"phoneVerifiedAt"=NULL,"smsOtpEnabled"=false WHERE "id"='verified'`;
    await db.exec(`BEGIN; ${unlink}; ROLLBACK;`);
    expect(
      (await db.query(`SELECT "smsOtpEnabled","phone" FROM "User" WHERE "id"='verified'`)).rows,
    ).toEqual([{ smsOtpEnabled: true, phone: "+628123450001" }]);
    await db.exec(`BEGIN; ${unlink}; COMMIT;`);
    expect(
      (
        await db.query(
          `SELECT "smsOtpEnabled","phone","phoneVerifiedAt" FROM "User" WHERE "id"='verified'`,
        )
      ).rows,
    ).toEqual([{ smsOtpEnabled: false, phone: null, phoneVerifiedAt: null }]);
  });

  it("kontrak inspect multimethod mencakup tujuh migrasi dan dua belas CHECK terkini", async () => {
    const source = await readFile(
      new URL("../../scripts/database/auth-preproduction-inspect.ts", import.meta.url),
      "utf8",
    );
    const listedMigrations = [...source.matchAll(/"(2026\d+_[a-z_]+)"/g)].map((match) => match[1]);
    expect(listedMigrations).toEqual(
      (await readdir(migrations)).filter((name) => name !== "migration_lock.toml").sort(),
    );
    expect(listedMigrations).toHaveLength(7);
    const checksBlock = source.slice(
      source.indexOf("const expectedChecks = ["),
      source.indexOf("    if (\n      checks.length"),
    );
    const listedChecks = [...checksBlock.matchAll(/"([A-Za-z0-9_]+)"/g)]
      .map((match) => match[1])
      .sort();
    const actualChecks = (
      await db.query<{ name: string }>(`SELECT conname AS name FROM pg_constraint
      WHERE contype='c' AND connamespace='public'::regnamespace ORDER BY conname`)
    ).rows.map((row) => row.name);
    expect(listedChecks).toEqual(actualChecks);
    expect(actualChecks).toHaveLength(12);
  });
});
