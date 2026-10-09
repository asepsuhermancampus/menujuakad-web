import {
  mkdtemp,
  readFile,
  readdir,
  stat,
  chmod,
  symlink,
  link,
  writeFile,
  unlink,
  rmdir,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { describe, expect, it, vi } from "vitest";
import { getAuthSeedConfig } from "../../scripts/database/auth-seed-config";
import { withAuthSeedManifest } from "../../scripts/database/auth-seed-manifest";
import { seedAuthPreproduction } from "../../scripts/database/auth-seed-data";
import { verifyPassword } from "../../src/server/auth/password-crypto";

const direct =
  "postgresql://owner:synthetic-config-secret@ep-test.us-east-2.aws.neon.tech/menujuakad-preproduction?sslmode=require";
const env = {
  NODE_ENV: "development",
  SEED_ENVIRONMENT: "preproduction",
  SEED_CONFIRMATION: "menujuakad-preproduction:11-dummy-accounts",
  DATABASE_URL: direct.replace("ep-test.", "ep-test-pooler."),
  DIRECT_URL: direct,
};

async function database() {
  const db = new PGlite();
  // Seluruh migrasi diterapkan agar enum UserRole sama dengan produksi (CLIENT/SUPERADMIN).
  for (const name of (await readdir(new URL("../../prisma/migrations/", import.meta.url)))
    .filter((name) => name !== "migration_lock.toml")
    .sort()) {
    await db.exec(
      await readFile(
        new URL(`../../prisma/migrations/${name}/migration.sql`, import.meta.url),
        "utf8",
      ),
    );
  }
  return db;
}
async function privateDirectory() {
  return mkdtemp(join(tmpdir(), "menujuakad-auth-seed-test-"));
}
async function cleanup(directory: string) {
  for (const file of ["credentials.json", ".seed.lock"]) {
    await unlink(join(directory, file)).catch(() => {});
  }
  await rmdir(directory);
}

describe("opt-in seed auth preproduction", () => {
  it("menerima hanya explicit preproduction paired Neon target", () => {
    expect(getAuthSeedConfig(env).migrationUrl).toBe(direct);
  });
  it.each([
    { NODE_ENV: "production" },
    { SEED_ENVIRONMENT: undefined },
    { SEED_ENVIRONMENT: "production" },
    { SEED_CONFIRMATION: undefined },
    { DIRECT_URL: direct + "&host=other.example.test" },
    { DIRECT_URL: direct + "&sslmode=disable" },
    { DIRECT_URL: direct.replace("ep-test.", "ep-other.") },
    { DIRECT_URL: direct.replace("menujuakad-preproduction", "production") },
    {
      DATABASE_URL: env.DATABASE_URL.replace("menujuakad-preproduction", "production"),
      DIRECT_URL: direct.replace("menujuakad-preproduction", "production"),
    },
  ])("menolak target/opt-in salah tanpa rahasia error", (override) => {
    let message = "";
    try {
      getAuthSeedConfig({ ...env, ...override });
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message.length).toBeGreaterThan(0);
    expect(message.includes("synthetic-config-secret")).toBe(false);
  });
});

describe("manifest credential privat", () => {
  it("membuat 11 password unik >=20 karakter, directory0700/file0600, rerun byte-stable", async () => {
    const directory = await privateDirectory();
    const info = vi.spyOn(console, "info");
    const error = vi.spyOn(console, "error");
    try {
      await withAuthSeedManifest(directory, async (manifest) => {
        expect(manifest.environment).toBe("preproduction");
        expect(manifest.accounts).toHaveLength(11);
        expect(new Set(manifest.accounts.map((account) => account.password)).size).toBe(11);
        expect(manifest.accounts.every((account) => account.password.length >= 20)).toBe(true);
      });
      const before = await readFile(join(directory, "credentials.json"), "utf8");
      await withAuthSeedManifest(directory, async () => {});
      expect(await readFile(join(directory, "credentials.json"), "utf8")).toBe(before);
      expect((await stat(directory)).mode & 0o777).toBe(0o700);
      expect((await stat(join(directory, "credentials.json"))).mode & 0o777).toBe(0o600);
      expect(info).not.toHaveBeenCalled();
      expect(error).not.toHaveBeenCalled();
    } finally {
      info.mockRestore();
      error.mockRestore();
      await cleanup(directory);
    }
  });
  it("menolak manifest dalam repo, directory terbuka, symlink dan file terbuka", async () => {
    await expect(withAuthSeedManifest(process.cwd(), async () => {})).rejects.toThrow();
    const directory = await privateDirectory();
    const link = directory + "-symlink";
    try {
      await chmod(directory, 0o755);
      await expect(withAuthSeedManifest(directory, async () => {})).rejects.toThrow();
      await chmod(directory, 0o700);
      await symlink(directory, link);
      await expect(withAuthSeedManifest(link, async () => {})).rejects.toThrow();
      await withAuthSeedManifest(directory, async () => {});
      await chmod(join(directory, "credentials.json"), 0o644);
      await expect(withAuthSeedManifest(directory, async () => {})).rejects.toThrow();
    } finally {
      await unlink(link).catch(() => {});
      await cleanup(directory);
    }
  });

  it("membuat directory baru privat serta menolak credential symlink/hardlink", async () => {
    const parent = await privateDirectory();
    const directory = join(parent, "new-private");
    const external = join(parent, "external.json");
    try {
      await withAuthSeedManifest(directory, async () => {});
      expect((await stat(directory)).mode & 0o777).toBe(0o700);
      await link(join(directory, "credentials.json"), external);
      await expect(withAuthSeedManifest(directory, async () => {})).rejects.toThrow("hardlink");
      await unlink(external);
      await unlink(join(directory, "credentials.json"));
      await writeFile(external, "private data", { mode: 0o600 });
      await symlink(external, join(directory, "credentials.json"));
      await expect(withAuthSeedManifest(directory, async () => {})).rejects.toThrow();
    } finally {
      await unlink(external).catch(() => {});
      await cleanup(directory);
      await rmdir(parent);
    }
  });
  it("menolak manifest cacat tanpa mencetak kontennya dan serialisasi seed konkuren", async () => {
    const directory = await privateDirectory();
    try {
      await writeFile(join(directory, "credentials.json"), "private malformed content", {
        mode: 0o600,
      });
      await expect(withAuthSeedManifest(directory, async () => {})).rejects.toThrow("Manifest");
      await unlink(join(directory, "credentials.json"));
      await withAuthSeedManifest(directory, async () => {
        await expect(withAuthSeedManifest(directory, async () => {})).rejects.toThrow(
          "sedang dipakai",
        );
      });
    } finally {
      await cleanup(directory);
    }
  });
});

describe("seed database tanpa takeover atau reset credential", () => {
  it("initial seed tepat 1 admin/10 customer/10 draft, hash-only; rerun menjaga data/credential", async () => {
    const db = await database();
    const directory = await privateDirectory();
    try {
      await db.exec(
        `INSERT INTO "Template" ("id","name","slug","updatedAt") VALUES ('old-template','Existing Botanical','botanical-development',now());`,
      );
      await withAuthSeedManifest(directory, async (manifest) => {
        await db.transaction((tx) => seedAuthPreproduction(tx, manifest));
        const users = (
          await db.query<{ role: string; status: string }>(`SELECT "role","status" FROM "User"`)
        ).rows;
        expect(users.filter((user) => user.role === "SUPERADMIN")).toHaveLength(1);
        expect(users.filter((user) => user.role === "CLIENT")).toHaveLength(10);
        expect(users.every((user) => user.status === "ACTIVE")).toBe(true);
        const credentials = (
          await db.query<{ userId: string; passwordHash: string }>(
            `SELECT * FROM "AuthCredential" ORDER BY "userId"`,
          )
        ).rows;
        expect(credentials).toHaveLength(11);
        for (const account of manifest.accounts) {
          const hash = credentials.find((row) => row.userId === account.userId)?.passwordHash;
          expect(typeof hash).toBe("string");
          expect(await verifyPassword(account.password, hash!)).toBe(true);
        }
        const invitations = (
          await db.query<{ slug: string; status: string; isPublished: boolean }>(
            `SELECT "slug","status","isPublished" FROM "Invitation"`,
          )
        ).rows;
        expect(invitations).toHaveLength(10);
        expect(
          invitations.every((row) => row.status === "DRAFT" && row.isPublished === false),
        ).toBe(true);
        expect((await db.query(`SELECT * FROM "CoupleProfile"`)).rows).toHaveLength(10);
        expect((await db.query(`SELECT * FROM "InvitationSection"`)).rows).toHaveLength(30);
        expect((await db.query(`SELECT * FROM "Package"`)).rows).toHaveLength(0);
        expect((await db.query(`SELECT * FROM "PaymentTestRequest"`)).rows).toHaveLength(0);
        await db.exec(
          `UPDATE "Invitation" SET "title"='Edited title' WHERE "slug"='seed-customer-01';
           UPDATE "CoupleProfile" SET "groomNickname"='Edited groom' WHERE "invitationId"=(SELECT "id" FROM "Invitation" WHERE "slug"='seed-customer-01');
           UPDATE "InvitationSection" SET "configJson"='{"heading":"Edited heading"}' WHERE "type"='COVER' AND "invitationId"=(SELECT "id" FROM "Invitation" WHERE "slug"='seed-customer-01')`,
        );
        await db.transaction((tx) => seedAuthPreproduction(tx, manifest));
        expect((await db.query(`SELECT * FROM "AuthCredential" ORDER BY "userId"`)).rows).toEqual(
          credentials,
        );
        expect(
          (await db.query(`SELECT "title" FROM "Invitation" WHERE "slug"='seed-customer-01'`)).rows,
        ).toEqual([{ title: "Edited title" }]);
        expect(
          (
            await db.query(
              `SELECT "groomNickname" FROM "CoupleProfile" WHERE "invitationId"=(SELECT "id" FROM "Invitation" WHERE "slug"='seed-customer-01')`,
            )
          ).rows,
        ).toEqual([{ groomNickname: "Edited groom" }]);
        expect(
          (
            await db.query(
              `SELECT "configJson" FROM "InvitationSection" WHERE "type"='COVER' AND "invitationId"=(SELECT "id" FROM "Invitation" WHERE "slug"='seed-customer-01')`,
            )
          ).rows,
        ).toEqual([{ configJson: { heading: "Edited heading" } }]);
        expect(
          (await db.query(`SELECT "name" FROM "Template" WHERE "id"='old-template'`)).rows,
        ).toEqual([{ name: "Existing Botanical" }]);
        expect((await db.query(`SELECT * FROM "User"`)).rows).toHaveLength(11);
        expect((await db.query(`SELECT * FROM "InvitationSection"`)).rows).toHaveLength(30);
      });
    } finally {
      await db.close();
      await cleanup(directory);
    }
  }, 30000);
  it.each(["admin@menujuakad.test", "customer01@menujuakad.test"])(
    "menolak collision email existing %s dan rollback seluruh seed",
    async (email) => {
      const db = await database();
      const directory = await privateDirectory();
      try {
        await db.query(
          `INSERT INTO "User" ("id","email","name","updatedAt") VALUES ('unrelated',$1,'Unrelated existing',now())`,
          [email],
        );
        await withAuthSeedManifest(directory, async (manifest) => {
          await expect(db.transaction((tx) => seedAuthPreproduction(tx, manifest))).rejects.toThrow(
            "collision",
          );
        });
        expect((await db.query(`SELECT "id","email","role","name" FROM "User"`)).rows).toEqual([
          { id: "unrelated", email, role: "CLIENT", name: "Unrelated existing" },
        ]);
        expect((await db.query(`SELECT * FROM "AuthCredential"`)).rows).toHaveLength(0);
        expect((await db.query(`SELECT * FROM "Template"`)).rows).toHaveLength(0);
      } finally {
        await db.close();
        await cleanup(directory);
      }
    },
    15000,
  );
  it("manifest yang diganti tidak mengambil alih account existing atau mengubah password", async () => {
    const db = await database();
    const directory = await privateDirectory();
    try {
      await withAuthSeedManifest(directory, async (manifest) => {
        await db.transaction((tx) => seedAuthPreproduction(tx, manifest));
        const before = (await db.query(`SELECT * FROM "AuthCredential" ORDER BY "userId"`)).rows;
        manifest.accounts[0].password = "wrong-but-long-password-12345";
        await expect(db.transaction((tx) => seedAuthPreproduction(tx, manifest))).rejects.toThrow(
          "collision",
        );
        expect((await db.query(`SELECT * FROM "AuthCredential" ORDER BY "userId"`)).rows).toEqual(
          before,
        );
      });
    } finally {
      await db.close();
      await cleanup(directory);
    }
  }, 20000);

  it("collision slug milik user lain rollback akun baru dan tidak memindah owner", async () => {
    const db = await database();
    const directory = await privateDirectory();
    try {
      await db.exec(`INSERT INTO "User" ("id","email","updatedAt") VALUES ('unrelated','unrelated@example.test',now());
        INSERT INTO "Template" ("id","name","slug","updatedAt") VALUES ('unrelated-template','Existing','existing',now());
        INSERT INTO "Invitation" ("id","ownerUserId","templateId","slug","title","updatedAt") VALUES ('unrelated-invitation','unrelated','unrelated-template','seed-customer-10','Existing',now());`);
      await withAuthSeedManifest(directory, async (manifest) => {
        await expect(db.transaction((tx) => seedAuthPreproduction(tx, manifest))).rejects.toThrow(
          "collision slug",
        );
      });
      expect((await db.query(`SELECT "id" FROM "User"`)).rows).toEqual([{ id: "unrelated" }]);
      expect((await db.query(`SELECT "ownerUserId" FROM "Invitation"`)).rows).toEqual([
        { ownerUserId: "unrelated" },
      ]);
      expect((await db.query(`SELECT * FROM "AuthCredential"`)).rows).toHaveLength(0);
    } finally {
      await db.close();
      await cleanup(directory);
    }
  }, 20000);
  it("slug/template collision unrelated menolak transaksi tanpa perubahan existing", async () => {
    const db = await database();
    const directory = await privateDirectory();
    try {
      await db.exec(
        `INSERT INTO "Template" ("id","name","slug","updatedAt") VALUES ('unrelated','Unrelated','seed-preproduction-internal',now());`,
      );
      await withAuthSeedManifest(directory, async (manifest) => {
        await expect(db.transaction((tx) => seedAuthPreproduction(tx, manifest))).rejects.toThrow(
          "collision",
        );
      });
      expect((await db.query(`SELECT * FROM "User"`)).rows).toHaveLength(0);
      expect((await db.query(`SELECT "name" FROM "Template"`)).rows).toEqual([
        { name: "Unrelated" },
      ]);
    } finally {
      await db.close();
      await cleanup(directory);
    }
  }, 15000);
});
