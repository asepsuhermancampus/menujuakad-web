import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { describe, expect, it } from "vitest";
import { PrismaClient } from "../../src/generated/prisma/client";
import { workspaceTestAdapter } from "./workspace-test-adapter";
import { applyAuthMigrations } from "./auth-multimethod-fixture";

describe("grant runtime auth/CRUD minimal", () => {
  it("hak per kolom mendukung multimethod tanpa eskalasi role/status", async () => {
    const db = new PGlite();
    try {
      await applyAuthMigrations(db);
      await db.exec(`CREATE ROLE menujuakad_runtime_preproduction NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
        REVOKE CREATE ON SCHEMA public FROM PUBLIC;
        GRANT USAGE ON SCHEMA public TO menujuakad_runtime_preproduction;
        GRANT SELECT ON TABLE "User","Template","TemplateFeature","Package","PackageFeature","Invitation","InvitationMember","CoupleProfile","InvitationSection" TO menujuakad_runtime_preproduction;`);
      // Simulasi grant lama terlalu luas: skrip wajib mencabut hak tersebut.
      await db.exec(`GRANT UPDATE ("role", "status") ON TABLE "User" TO menujuakad_runtime_preproduction;
        GRANT UPDATE ON TABLE "UserSession" TO menujuakad_runtime_preproduction;`);
      await db.exec(
        await readFile(
          new URL("../../scripts/database/auth-runtime-grants.sql", import.meta.url),
          "utf8",
        ),
      );
      const privilege = async (table: string, permission: string) =>
        (
          await db.query<{ allowed: boolean }>(
            `SELECT has_table_privilege('menujuakad_runtime_preproduction',$1,$2) AS allowed`,
            [table, permission],
          )
        ).rows[0].allowed;
      for (const table of ['"User"', '"Template"', '"Package"', '"InvitationMember"']) {
        expect(await privilege(table, "SELECT")).toBe(true);
        for (const permission of ["INSERT", "UPDATE", "DELETE"])
          expect(await privilege(table, permission)).toBe(false);
      }
      for (const table of ['"Invitation"', '"CoupleProfile"', '"InvitationSection"']) {
        for (const permission of ["SELECT", "INSERT", "UPDATE", "DELETE"])
          expect(await privilege(table, permission)).toBe(true);
      }
      expect(await privilege('"UserSession"', "INSERT")).toBe(true);
      expect(await privilege('"UserSession"', "DELETE")).toBe(true);
      expect(await privilege('"UserSession"', "UPDATE")).toBe(false);
      expect(await privilege('"AuthCredential"', "INSERT")).toBe(true);
      expect(await privilege('"AuthCredential"', "UPDATE")).toBe(false);
      expect(await privilege('"AuthAccount"', "INSERT")).toBe(true);
      expect(await privilege('"AuthAccount"', "UPDATE")).toBe(false);
      expect(await privilege('"AuthVerificationToken"', "INSERT")).toBe(true);
      expect(await privilege('"AuthVerificationToken"', "UPDATE")).toBe(false);
      expect(await privilege('"AuthLoginThrottle"', "UPDATE")).toBe(true);
      expect(await privilege('"AuthLoginThrottle"', "DELETE")).toBe(false);
      expect(await privilege('"PaymentTestRequest"', "INSERT")).toBe(true);
      expect(await privilege('"PaymentTestRequest"', "UPDATE")).toBe(true);
      expect(await privilege('"PaymentTestRequest"', "DELETE")).toBe(false);
      const columnPrivilege = async (table: string, column: string, permission: string) =>
        (
          await db.query<{ allowed: boolean }>(
            `SELECT has_column_privilege('menujuakad_runtime_preproduction',$1,$2,$3) AS allowed`,
            [table, column, permission],
          )
        ).rows[0].allowed;
      for (const column of ["role", "status", "id", "createdAt"])
        expect(await columnPrivilege('"User"', column, "UPDATE")).toBe(false);
      for (const column of ["email", "phone", "emailVerifiedAt", "phoneVerifiedAt"])
        expect(await columnPrivilege('"User"', column, "UPDATE")).toBe(true);
      for (const permission of ["INSERT", "UPDATE"])
        expect(await columnPrivilege('"User"', "smsOtpEnabled", permission)).toBe(true);
      expect(await columnPrivilege('"AuthCredential"', "passwordHash", "UPDATE")).toBe(true);
      expect(await columnPrivilege('"AuthCredential"', "userId", "UPDATE")).toBe(false);
      for (const column of ["userId", "tokenHash", "expiresAt"])
        expect(await columnPrivilege('"UserSession"', column, "UPDATE")).toBe(false);
      for (const column of ["reauthenticatedAt", "lastSeenAt", "revokedAt"])
        expect(await columnPrivilege('"UserSession"', column, "UPDATE")).toBe(true);
      for (const column of ["userId", "provider", "providerAccountId"])
        expect(await columnPrivilege('"AuthAccount"', column, "UPDATE")).toBe(false);
      for (const column of ["userId", "purpose", "tokenHash", "payload", "expiresAt"])
        expect(await columnPrivilege('"AuthVerificationToken"', column, "UPDATE")).toBe(false);
      expect(await columnPrivilege('"AuthVerificationToken"', "consumedAt", "UPDATE")).toBe(true);
      expect(await columnPrivilege('"AuthVerificationToken"', "attempts", "UPDATE")).toBe(true);
      await db.exec("SET ROLE menujuakad_runtime_preproduction");
      const prisma = new PrismaClient({ adapter: workspaceTestAdapter(db) });
      try {
        // Prisma mengirim default role/status di INSERT; trigger membatasi nilainya.
        const user = await prisma.user.create({ data: { email: "synthetic@example.test" } });
        expect(user.role).toBe("CLIENT");
        expect(user.status).toBe("ACTIVE");
        expect(user.smsOtpEnabled).toBe(false);
        await expect(prisma.user.create({ data: { role: "SUPERADMIN" } })).rejects.toThrow();
        await expect(prisma.user.create({ data: { role: "VENDOR" } })).rejects.toThrow();
        await expect(prisma.user.create({ data: { status: "SUSPENDED" } })).rejects.toThrow();
        await expect(
          prisma.user.update({ where: { id: user.id }, data: { role: "SUPERADMIN" } }),
        ).rejects.toThrow();
        await prisma.user.update({ where: { id: user.id }, data: { phone: "+6281234567890" } });
        await expect(
          prisma.user.update({ where: { id: user.id }, data: { smsOtpEnabled: true } }),
        ).rejects.toThrow();
        await prisma.user.update({
          where: { id: user.id },
          data: { phoneVerifiedAt: new Date(), smsOtpEnabled: true },
        });
        await expect(
          prisma.user.update({
            where: { id: user.id },
            data: { phone: null, phoneVerifiedAt: null },
          }),
        ).rejects.toThrow();
        const unlinked = await prisma.user.update({
          where: { id: user.id },
          data: { phone: null, phoneVerifiedAt: null, smsOtpEnabled: false },
        });
        expect(unlinked.smsOtpEnabled).toBe(false);
        const account = await prisma.authAccount.create({
          data: { userId: user.id, provider: "google", providerAccountId: "synthetic-subject" },
        });
        await expect(
          prisma.authAccount.update({
            where: { id: account.id },
            data: { providerAccountId: "changed" },
          }),
        ).rejects.toThrow();
        const token = await prisma.authVerificationToken.create({
          data: {
            purpose: "OAUTH_STATE",
            tokenHash: "synthetic-hash",
            expiresAt: new Date(Date.now() + 60000),
          },
        });
        await prisma.authVerificationToken.update({
          where: { id: token.id },
          data: { consumedAt: new Date(), attempts: { increment: 1 } },
        });
      } finally {
        await prisma.$disconnect();
        await db.exec("RESET ROLE");
      }
      await db.exec(
        await readFile(
          new URL("../../scripts/database/auth-runtime-inspect.sql", import.meta.url),
          "utf8",
        ),
      );
      expect(
        (
          await db.query<{ allowed: boolean }>(
            `SELECT has_schema_privilege('menujuakad_runtime_preproduction','public','CREATE') AS allowed`,
          )
        ).rows[0].allowed,
      ).toBe(false);
    } finally {
      await db.close();
    }
  }, 15000);
  it("menolak role runtime dengan inheritance atau CREATE schema", async () => {
    const db = new PGlite();
    try {
      await db.exec(`CREATE ROLE menujuakad_runtime_preproduction NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
        CREATE ROLE inherited_owner;
        GRANT inherited_owner TO menujuakad_runtime_preproduction;
        REVOKE CREATE ON SCHEMA public FROM PUBLIC;`);
      const grants = await readFile(
        new URL("../../scripts/database/auth-runtime-grants.sql", import.meta.url),
        "utf8",
      );
      await expect(db.exec(grants)).rejects.toThrow("inheritance/ownership/DDL");
      await db.exec(`ROLLBACK; REVOKE inherited_owner FROM menujuakad_runtime_preproduction;
        GRANT CREATE ON SCHEMA public TO menujuakad_runtime_preproduction;`);
      await expect(db.exec(grants)).rejects.toThrow("inheritance/ownership/DDL");
      await db.exec("ROLLBACK");
    } finally {
      await db.close();
    }
  }, 15000);
  it("menolak role runtime yang tidak tersedia", async () => {
    const db = new PGlite();
    try {
      await expect(
        db.exec(
          await readFile(
            new URL("../../scripts/database/auth-runtime-grants.sql", import.meta.url),
            "utf8",
          ),
        ),
      ).rejects.toThrow("Role runtime preproduction");
      await db.exec("ROLLBACK");
    } finally {
      await db.close();
    }
  }, 15000);
});
