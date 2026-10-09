import { randomUUID } from "node:crypto";
import { hashPassword, verifyPassword } from "../../src/server/auth/password-crypto";
import {
  validateAuthSeedManifest,
  type AuthSeedManifest,
  type SeedAccount,
} from "./auth-seed-manifest";

export interface SeedDatabase {
  query<Row = Record<string, unknown>>(
    sql: string,
    parameters?: unknown[],
  ): Promise<{ rows: Row[] }>;
}

const templateId = "menujuakad-seed-preproduction-template";
const templateSlug = "seed-preproduction-internal";

async function ensureTemplate(db: SeedDatabase) {
  const existing = (
    await db.query<{ id: string; status: string }>(
      `SELECT "id","status" FROM "Template" WHERE "slug"=$1 OR "id"=$2`,
      [templateSlug, templateId],
    )
  ).rows;
  if (existing.length) {
    if (existing.length !== 1 || existing[0].id !== templateId || existing[0].status !== "DRAFT") {
      throw new Error("Seed collision template; tidak ada data existing yang diubah.");
    }
    return;
  }
  await db.query(
    `INSERT INTO "Template" ("id","name","slug","description","category","status","updatedAt")
    VALUES ($1,'TEST — Template Internal Preproduction',$2,'Data sintetis pengujian; bukan katalog atau penawaran komersial.','internal-test','DRAFT',now())`,
    [templateId, templateSlug],
  );
}

async function ensureAccount(db: SeedDatabase, account: SeedAccount) {
  const existing = (
    await db.query<{
      id: string;
      email: string;
      role: string;
      status: string;
      passwordHash: string | null;
    }>(
      `SELECT u."id",u."email",u."role",u."status",c."passwordHash" FROM "User" u
     LEFT JOIN "AuthCredential" c ON c."userId"=u."id"
     WHERE lower(u."email")=lower($1) OR u."id"=$2 FOR UPDATE OF u`,
      [account.email, account.userId],
    )
  ).rows;
  if (existing.length) {
    const user = existing[0];
    if (
      existing.length !== 1 ||
      user.id !== account.userId ||
      user.email !== account.email ||
      user.role !== account.role ||
      user.status !== "ACTIVE" ||
      !user.passwordHash ||
      !(await verifyPassword(account.password, user.passwordHash))
    ) {
      throw new Error("Seed collision account; credential/status/role existing tidak diubah.");
    }
    return false;
  }
  const passwordHash = await hashPassword(account.password);
  await db.query(
    `INSERT INTO "User" ("id","email","name","role","status","updatedAt")
    VALUES ($1,$2,$3,$4::"UserRole",'ACTIVE',now())`,
    [
      account.userId,
      account.email,
      account.role === "SUPERADMIN"
        ? "TEST — Admin Preproduction"
        : `TEST — Customer ${account.email.slice(8, 10)}`,
      account.role,
    ],
  );
  await db.query(`INSERT INTO "AuthCredential" ("userId","passwordHash") VALUES ($1,$2)`, [
    account.userId,
    passwordHash,
  ]);
  return true;
}

async function ensureDraft(db: SeedDatabase, account: SeedAccount) {
  const sequence = account.email.slice(8, 10);
  const slug = `seed-customer-${sequence}`;
  const existing = (
    await db.query<{ ownerUserId: string; templateId: string }>(
      `SELECT "ownerUserId","templateId" FROM "Invitation" WHERE "slug"=$1`,
      [slug],
    )
  ).rows;
  if (existing.length) {
    if (existing[0].ownerUserId !== account.userId || existing[0].templateId !== templateId) {
      throw new Error("Seed collision slug; undangan existing tidak diubah.");
    }
    return false;
  }
  const id = randomUUID();
  await db.query(
    `INSERT INTO "Invitation" ("id","ownerUserId","templateId","slug","title","status","weddingDate","isPublished","updatedAt")
    VALUES ($1,$2,$3,$4,$5,'DRAFT','2027-01-17',false,now())`,
    [id, account.userId, templateId, slug, `TEST — Undangan Customer ${sequence}`],
  );
  await db.query(
    `INSERT INTO "CoupleProfile" ("id","invitationId","groomFullName","groomNickname","brideFullName","brideNickname","updatedAt")
    VALUES ($1,$2,$3,'Calon A',$4,'Calon B',now())`,
    [randomUUID(), id, `Calon A Contoh ${sequence}`, `Calon B Contoh ${sequence}`],
  );
  const sections = [
    {
      type: "COVER",
      title: "Sampul Contoh",
      config: {
        synthetic: true,
        heading: "Undangan Pengujian",
        partnerOne: `Calon A ${sequence}`,
        partnerTwo: `Calon B ${sequence}`,
        eventDate: "2027-01-17",
      },
    },
    {
      type: "COUPLE",
      title: "Pasangan Contoh",
      config: {
        synthetic: true,
        groomName: `Calon A Contoh ${sequence}`,
        brideName: `Calon B Contoh ${sequence}`,
      },
    },
    {
      type: "EVENT",
      title: "Acara Contoh",
      config: {
        synthetic: true,
        name: "Akad Contoh",
        date: "2027-01-17",
        time: "09:00",
        timezone: "Asia/Jakarta",
        location: "Lokasi sintetis pengujian",
        address: "Alamat contoh; bukan acara nyata.",
      },
    },
  ];
  for (const [sortOrder, section] of sections.entries()) {
    await db.query(
      `INSERT INTO "InvitationSection" ("id","invitationId","type","title","sortOrder","configJson","updatedAt")
      VALUES ($1,$2,$3::"InvitationSectionType",$4,$5,$6::jsonb,now())`,
      [randomUUID(), id, section.type, section.title, sortOrder, JSON.stringify(section.config)],
    );
  }
  return true;
}

/** Caller wajib transaksi tunggal: collision akhir rollback seluruh write awal. */
export async function seedAuthPreproduction(db: SeedDatabase, input: AuthSeedManifest) {
  const manifest = validateAuthSeedManifest(input);
  await db.query("SELECT pg_advisory_xact_lock(20261008, 11)::text AS lock");
  await ensureTemplate(db);
  let createdAccounts = 0;
  let createdDrafts = 0;
  for (const account of manifest.accounts) {
    if (await ensureAccount(db, account)) createdAccounts++;
    if (account.role === "CUSTOMER" && (await ensureDraft(db, account))) createdDrafts++;
  }
  return { accounts: 11, createdAccounts, createdDrafts };
}
