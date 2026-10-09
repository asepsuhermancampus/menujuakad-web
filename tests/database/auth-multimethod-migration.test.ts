import { PGlite } from "@electric-sql/pglite";
import { beforeAll, afterAll, describe, expect, it } from "vitest";
import { applyAuthMigrations, applyMultimethodMigration } from "./auth-multimethod-fixture";

describe("identitas autentikasi multimethod PostgreSQL", () => {
  const db = new PGlite();
  beforeAll(async () => {
    await applyAuthMigrations(db, true);
    await db.exec(`INSERT INTO "User" ("id","email","phone","updatedAt") VALUES ('legacy',' Legacy@Example.test ','0812-3456-7890',now());
      INSERT INTO "AuthCredential" VALUES ('legacy','existing-password-hash');
      INSERT INTO "UserSession" ("id","userId","tokenHash","expiresAt") VALUES ('legacy-session','legacy','existing-session-hash',now()+interval '1 day');
      INSERT INTO "AuthLoginThrottle" VALUES ('legacy-throttle',2,now(),NULL);
      INSERT INTO "Template" ("id","name","slug","updatedAt") VALUES ('template','Existing','existing',now());
      INSERT INTO "Invitation" ("id","ownerUserId","templateId","slug","title","updatedAt") VALUES ('invitation','legacy','template','existing','Existing',now());
      INSERT INTO "InvitationMember" ("id","invitationId","userId","role","updatedAt") VALUES ('member','invitation','legacy','OWNER',now());
      INSERT INTO "PaymentTestRequest" ("id","invitationId","userId","amountIdr","packageSlug","updatedAt") VALUES ('payment','invitation','legacy',1000,'test',now());`);
    await applyMultimethodMigration(db);
  }, 15000);
  afterAll(async () => {
    await db.close();
  });

  it("normalisasi identitas mempertahankan CUSTOMER, hash dan semua relasi bisnis", async () => {
    expect(
      (
        await db.query(
          `SELECT "email","phone","role","phoneVerifiedAt" FROM "User" WHERE "id"='legacy'`,
        )
      ).rows,
    ).toEqual([
      {
        email: "legacy@example.test",
        phone: "+6281234567890",
        role: "CUSTOMER",
        phoneVerifiedAt: null,
      },
    ]);
    expect((await db.query(`SELECT "passwordHash" FROM "AuthCredential"`)).rows).toEqual([
      { passwordHash: "existing-password-hash" },
    ]);
    expect(
      (await db.query(`SELECT "tokenHash","reauthenticatedAt","revokedAt" FROM "UserSession"`))
        .rows,
    ).toEqual([{ tokenHash: "existing-session-hash", reauthenticatedAt: null, revokedAt: null }]);
    for (const table of [
      "Invitation",
      "InvitationMember",
      "PaymentTestRequest",
      "AuthLoginThrottle",
    ])
      expect((await db.query(`SELECT count(*)::int AS count FROM "${table}"`)).rows).toEqual([
        { count: 1 },
      ]);
    await expect(db.exec(`DELETE FROM "User" WHERE "id"='legacy'`)).rejects.toThrow();
  });
  it("default CLIENT, phone-only/email-only signup dan role VENDOR/SUPERADMIN valid", async () => {
    await db.exec(`INSERT INTO "User" ("id","phone","updatedAt") VALUES ('phone-only','+6281234567891',now()),('second-phone','+6281234567892',now());
      INSERT INTO "User" ("id","email","updatedAt") VALUES ('email-only','email@example.test',now());
      INSERT INTO "User" ("id","role","updatedAt") VALUES ('vendor','VENDOR',now()),('admin','SUPERADMIN',now());`);
    expect(
      (
        await db.query(
          `SELECT "role","email","phoneVerifiedAt" FROM "User" WHERE "id"='phone-only'`,
        )
      ).rows,
    ).toEqual([{ role: "CLIENT", email: null, phoneVerifiedAt: null }]);
    expect((await db.query(`SELECT "phone" FROM "User" WHERE "id"='email-only'`)).rows).toEqual([
      { phone: null },
    ]);
  });
  it.each(["081234567890", "+012345", "not-a-phone", "+1234567890123456"])(
    "menolak phone bukan E164: %s",
    async (phone) => {
      await expect(
        db.query(`UPDATE "User" SET "phone"=$1 WHERE "id"='second-phone'`, [phone]),
      ).rejects.toThrow();
    },
  );
  it("identitas unique dan verified phone membutuhkan nomor", async () => {
    await expect(
      db.exec(`UPDATE "User" SET "phone"='+6281234567891' WHERE "id"='second-phone'`),
    ).rejects.toThrow();
    await expect(
      db.exec(`UPDATE "User" SET "email"='email@example.test' WHERE "id"='phone-only'`),
    ).rejects.toThrow();
    await expect(
      db.exec(`UPDATE "User" SET "email"='EMAIL@example.test' WHERE "id"='phone-only'`),
    ).rejects.toThrow();
    await expect(
      db.exec(`UPDATE "User" SET "phoneVerifiedAt"=now() WHERE "id"='email-only'`),
    ).rejects.toThrow();
    await db.exec(`UPDATE "User" SET "phoneVerifiedAt"=now() WHERE "id"='phone-only'`);
  });
  it("Google subject immutable unique global, satu Google per user, metadata email tidak memicu merge", async () => {
    await db.exec(
      `INSERT INTO "AuthAccount" ("id","userId","provider","providerAccountId","email","updatedAt") VALUES ('google','legacy','google','subject-one','email@example.test',now());`,
    );
    for (const [id, user, subject] of [
      ["duplicate-sub", "phone-only", "subject-one"],
      ["duplicate-owner", "legacy", "subject-two"],
      ["bad-fk", "missing", "subject-two"],
    ])
      await expect(
        db.query(
          `INSERT INTO "AuthAccount" ("id","userId","provider","providerAccountId","updatedAt") VALUES ($1,$2,'google',$3,now())`,
          [id, user, subject],
        ),
      ).rejects.toThrow();
    expect(
      (await db.query(`SELECT "userId","emailVerified" FROM "AuthAccount" WHERE "id"='google'`))
        .rows,
    ).toEqual([{ userId: "legacy", emailVerified: false }]);
  });
  it("token unique/FK/attempts, nullable owner untuk OAuth sebelum signup", async () => {
    await db.exec(
      `INSERT INTO "AuthVerificationToken" ("id","tokenHash","purpose","expiresAt") VALUES ('oauth','opaque-hash','OAUTH_STATE',now()+interval '5 minutes');`,
    );
    await expect(
      db.exec(
        `INSERT INTO "AuthVerificationToken" ("id","tokenHash","purpose","expiresAt") VALUES ('dup','opaque-hash','PASSWORD_RESET',now())`,
      ),
    ).rejects.toThrow();
    await expect(
      db.exec(`UPDATE "AuthVerificationToken" SET "attempts"=-1 WHERE "id"='oauth'`),
    ).rejects.toThrow();
    await expect(
      db.exec(`UPDATE "AuthVerificationToken" SET "userId"='missing' WHERE "id"='oauth'`),
    ).rejects.toThrow();
    expect(
      (
        await db.query(
          `SELECT "userId","identifier","payload","attempts" FROM "AuthVerificationToken" WHERE "id"='oauth'`,
        )
      ).rows,
    ).toEqual([{ userId: null, identifier: null, payload: null, attempts: 0 }]);
  });
  it("dua permintaan consume hanya satu berhasil; expired/wrong-purpose tidak dikonsumsi", async () => {
    await db.exec(
      `INSERT INTO "AuthVerificationToken" ("id","tokenHash","purpose","userId","identifier","expiresAt") VALUES ('reset','reset-hash','PASSWORD_RESET','legacy','legacy@example.test',now()+interval '5 minutes'),('expired','expired-hash','PASSWORD_RESET','legacy','legacy@example.test',now()-interval '1 minute');`,
    );
    const consume = (hash: string, purpose = "PASSWORD_RESET") =>
      db.query(
        `UPDATE "AuthVerificationToken" SET "consumedAt"=now() WHERE "tokenHash"=$1 AND "purpose"=$2 AND "userId"='legacy' AND "identifier"='legacy@example.test' AND "consumedAt" IS NULL AND "expiresAt">now() RETURNING "id"`,
        [hash, purpose],
      );
    expect((await consume("reset-hash", "PHONE_OTP")).rows).toHaveLength(0);
    const results = await Promise.all([consume("reset-hash"), consume("reset-hash")]);
    expect(results.map((result) => result.rows.length).sort()).toEqual([0, 1]);
    expect((await consume("expired-hash")).rows).toHaveLength(0);
  });
  it("rollback menjaga password/token/session; commit reset mengubah semuanya atomik", async () => {
    await db.exec(
      `INSERT INTO "AuthVerificationToken" ("id","tokenHash","purpose","userId","expiresAt") VALUES ('atomic','atomic-hash','PASSWORD_RESET','legacy',now()+interval '5 minutes');`,
    );
    const update = `SELECT "id" FROM "User" WHERE "id"='legacy' FOR UPDATE;
      UPDATE "AuthVerificationToken" SET "consumedAt"=now() WHERE "id"='atomic' AND "consumedAt" IS NULL;
      UPDATE "AuthCredential" SET "passwordHash"='replacement-hash' WHERE "userId"='legacy';
      UPDATE "UserSession" SET "revokedAt"=now() WHERE "userId"='legacy';`;
    await db.exec(`BEGIN; ${update} ROLLBACK;`);
    expect((await db.query(`SELECT "passwordHash" FROM "AuthCredential"`)).rows).toEqual([
      { passwordHash: "existing-password-hash" },
    ]);
    expect(
      (await db.query(`SELECT "consumedAt" FROM "AuthVerificationToken" WHERE "id"='atomic'`)).rows,
    ).toEqual([{ consumedAt: null }]);
    expect(
      (await db.query(`SELECT "revokedAt" FROM "UserSession" WHERE "id"='legacy-session'`)).rows,
    ).toEqual([{ revokedAt: null }]);
    await db.exec(`BEGIN; ${update} COMMIT;`);
    expect((await db.query(`SELECT "passwordHash" FROM "AuthCredential"`)).rows).toEqual([
      { passwordHash: "replacement-hash" },
    ]);
    expect(
      (
        await db.query(
          `SELECT "consumedAt" IS NOT NULL AS consumed FROM "AuthVerificationToken" WHERE "id"='atomic'`,
        )
      ).rows,
    ).toEqual([{ consumed: true }]);
    expect(
      (
        await db.query(
          `SELECT "revokedAt" IS NOT NULL AS revoked FROM "UserSession" WHERE "id"='legacy-session'`,
        )
      ).rows,
    ).toEqual([{ revoked: true }]);
  });
  it("FK cascade menghapus identitas/token user yang dihapus tanpa mengubah user lain", async () => {
    await db.exec(`INSERT INTO "AuthAccount" ("id","userId","provider","providerAccountId","updatedAt") VALUES ('delete-account','second-phone','google','delete-sub',now());
      INSERT INTO "AuthVerificationToken" ("id","tokenHash","purpose","userId","expiresAt") VALUES ('delete-token','delete-hash','PHONE_OTP','second-phone',now());
      DELETE FROM "User" WHERE "id"='second-phone';`);
    expect(
      (await db.query(`SELECT "id" FROM "AuthAccount" WHERE "id"='delete-account'`)).rows,
    ).toHaveLength(0);
    expect(
      (await db.query(`SELECT "id" FROM "AuthVerificationToken" WHERE "id"='delete-token'`)).rows,
    ).toHaveLength(0);
    expect(
      (await db.query(`SELECT "id" FROM "AuthAccount" WHERE "id"='google'`)).rows,
    ).toHaveLength(1);
  });
});
