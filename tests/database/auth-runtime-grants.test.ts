import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { describe, expect, it } from "vitest";

describe("grant runtime auth/CRUD minimal", () => {
  it("menambah hanya operasi implemented, tanpa DDL/credential-write/user-write", async () => {
    const db = new PGlite();
    try {
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
      await db.exec(`CREATE ROLE menujuakad_runtime_preproduction NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
        REVOKE CREATE ON SCHEMA public FROM PUBLIC;
        GRANT USAGE ON SCHEMA public TO menujuakad_runtime_preproduction;
        GRANT SELECT ON TABLE "User","Template","TemplateFeature","Package","PackageFeature","Invitation","InvitationMember","CoupleProfile","InvitationSection" TO menujuakad_runtime_preproduction;`);
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
      for (const table of [
        '"User"',
        '"AuthCredential"',
        '"Template"',
        '"Package"',
        '"InvitationMember"',
      ]) {
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
      expect(await privilege('"AuthLoginThrottle"', "UPDATE")).toBe(true);
      expect(await privilege('"AuthLoginThrottle"', "DELETE")).toBe(false);
      expect(await privilege('"PaymentTestRequest"', "INSERT")).toBe(true);
      expect(await privilege('"PaymentTestRequest"', "UPDATE")).toBe(true);
      expect(await privilege('"PaymentTestRequest"', "DELETE")).toBe(false);
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
