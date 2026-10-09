import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { describe, expect, it } from "vitest";
import { getNeonSetupConfig } from "../../scripts/database/neon-config";
import { makeFoundationImportSql } from "../../scripts/database/export-sql";

const direct =
  "postgresql://owner:example-secret@ep-test.ap-southeast-1.aws.neon.tech/menujuakad?sslmode=require";
const pooled = direct.replace("ep-test.", "ep-test-pooler.");

describe("konfigurasi persiapan Neon", () => {
  it("menerima pooled/direct pada endpoint dan database yang sama", () => {
    expect(getNeonSetupConfig({ DATABASE_URL: pooled, DIRECT_URL: direct })).toEqual({
      runtimeUrl: pooled,
      migrationUrl: direct,
    });
  });

  it("mengizinkan role runtime berbeda dengan role migrasi", () => {
    expect(() =>
      getNeonSetupConfig({ DATABASE_URL: pooled.replace("owner:", "app:"), DIRECT_URL: direct }),
    ).not.toThrow();
  });

  it.each([
    { DATABASE_URL: pooled },
    { DATABASE_URL: direct, DIRECT_URL: direct },
    { DATABASE_URL: pooled, DIRECT_URL: pooled },
    { DATABASE_URL: pooled.replace("require", "disable"), DIRECT_URL: direct },
    { DATABASE_URL: pooled, DIRECT_URL: direct.replace("ep-test.", "ep-other.") },
    { DATABASE_URL: pooled, DIRECT_URL: direct.replace("/menujuakad?", "/other?") },
    { DATABASE_URL: pooled.replace(".neon.tech", ".neon.tech.example.test"), DIRECT_URL: direct },
    { DATABASE_URL: "invalid-example-secret", DIRECT_URL: direct },
  ])("menolak pasangan URL salah tanpa membocorkan nilai konfigurasi", (env) => {
    try {
      getNeonSetupConfig(env);
      throw new Error("Konfigurasi salah diterima");
    } catch (error) {
      expect((error as Error).message).not.toContain("example-secret");
      expect((error as Error).message).not.toBe("Konfigurasi salah diterima");
    }
  });
});

describe("SQL impor fondasi untuk database kosong", () => {
  it("membuat sembilan model dan menjaga constraint finansial", async () => {
    const db = new PGlite();
    try {
      const migration = await readFile(
        new URL("../../prisma/migrations/20261007000000_foundation/migration.sql", import.meta.url),
        "utf8",
      );
      await db.exec(makeFoundationImportSql(migration));
      const tables = await db.query("SELECT tablename FROM pg_tables WHERE schemaname='public'");
      expect(tables.rows).toHaveLength(9);
      await expect(
        db.exec(
          `INSERT INTO "Package" ("id","name","slug","price","durationDays","updatedAt") VALUES ('bad','bad','bad',-1,30,now())`,
        ),
      ).rejects.toThrow();
    } finally {
      await db.close();
    }
  }, 15000);

  it("menolak schema public berisi tabel tanpa merusak data existing", async () => {
    const db = new PGlite();
    try {
      await db.exec(
        "CREATE TABLE existing_data (id integer); INSERT INTO existing_data VALUES (1)",
      );
      const migration = await readFile(
        new URL("../../prisma/migrations/20261007000000_foundation/migration.sql", import.meta.url),
        "utf8",
      );
      await expect(db.exec(makeFoundationImportSql(migration))).rejects.toThrow(
        "schema public harus kosong",
      );
      await db.exec("ROLLBACK");
      expect((await db.query("SELECT id FROM existing_data")).rows).toEqual([{ id: 1 }]);
      expect(
        (await db.query("SELECT tablename FROM pg_tables WHERE schemaname='public'")).rows,
      ).toHaveLength(1);
    } finally {
      await db.close();
    }
  }, 15000);
});
