import type { SeedDatabase } from "./auth-seed-data";
import type { CustomerJourney } from "./customer-journey-fixtures";
import { journeyTemplate } from "./customer-journey-fixtures";
import {
  customerJourneyCreatedAt,
  type CustomerJourneyManifest,
} from "./customer-journey-manifest";
/** Kontrol identitas saja: kolom konten/status/kemajuan tidak menjadi syarat seed ulang. */
async function identity(
  db: SeedDatabase,
  table: string,
  where: string,
  parameters: unknown[],
  expected: Record<string, string>,
) {
  const rows = (
    await db.query<Record<string, unknown>>(`SELECT * FROM "${table}" WHERE ${where}`, parameters)
  ).rows;
  if (
    rows.length > 1 ||
    rows.some((row) => Object.entries(expected).some(([key, value]) => row[key] !== value))
  )
    throw new Error(`Seed collision ${table}; tidak ada data existing yang diubah.`);
  return rows[0];
}
export async function validateJourneyIdentity(
  db: SeedDatabase,
  fixture: CustomerJourney,
  manifest: CustomerJourneyManifest,
) {
  const user = await identity(
    db,
    "User",
    '"id"=$1 OR lower("email")=lower($2)',
    [fixture.userId, fixture.email],
    { id: fixture.userId, email: fixture.email, role: "CUSTOMER" },
  );
  if (user) {
    const credential = (
      await db.query(`SELECT "userId" FROM "AuthCredential" WHERE "userId"=$1`, [fixture.userId])
    ).rows;
    // Timestamp manifest menjadi penanda instance; password yang diganti customer tetap sah.
    if (
      new Date(user.createdAt as string | Date).toISOString() !==
        customerJourneyCreatedAt(manifest) ||
      credential.length !== 1
    )
      throw new Error(
        "Seed collision manifest/credential; pemulihan harus dilakukan secara eksplisit.",
      );
  }
  const invitation = await identity(
    db,
    "Invitation",
    '"id"=$1 OR "slug"=$2',
    [fixture.invitationId, fixture.invitation?.slug ?? `reserved-journey-${fixture.sequence}`],
    { id: fixture.invitationId, ownerUserId: fixture.userId, templateId: journeyTemplate.id },
  );
  if (invitation && (!fixture.invitation || !user))
    throw new Error("Seed collision invitation tanpa identitas cohort.");
  await identity(
    db,
    "InvitationMember",
    '"id"=$1 OR ("invitationId"=$2 AND "userId"=$3)',
    [`${fixture.invitationId}-owner`, fixture.invitationId, fixture.userId],
    {
      id: `${fixture.invitationId}-owner`,
      invitationId: fixture.invitationId,
      userId: fixture.userId,
    },
  );
  await identity(
    db,
    "CoupleProfile",
    '"id"=$1 OR "invitationId"=$2',
    [`${fixture.invitationId}-couple`, fixture.invitationId],
    { id: `${fixture.invitationId}-couple`, invitationId: fixture.invitationId },
  );
  for (const type of ["cover", "event", "story", "rsvp"])
    await identity(db, "InvitationSection", '"id"=$1', [`${fixture.invitationId}-${type}`], {
      id: `${fixture.invitationId}-${type}`,
      invitationId: fixture.invitationId,
    });
  await identity(db, "PaymentTestRequest", '"id"=$1', [`${fixture.invitationId}-payment`], {
    id: `${fixture.invitationId}-payment`,
    invitationId: fixture.invitationId,
    userId: fixture.userId,
  });
  return Boolean(user);
}
export async function ensureJourneyTemplate(db: SeedDatabase) {
  const template = await identity(
    db,
    "Template",
    '"id"=$1 OR "slug"=$2',
    [journeyTemplate.id, journeyTemplate.slug],
    { id: journeyTemplate.id, slug: journeyTemplate.slug, status: "DRAFT" },
  );
  if (template) return;
  await db.query(
    `INSERT INTO "Template" ("id","name","slug","description","category","status","updatedAt") VALUES ($1,'TEST — Template Internal Preproduction',$2,'Data sintetis pengujian; bukan katalog atau penawaran komersial.','internal-test','DRAFT',now())`,
    [journeyTemplate.id, journeyTemplate.slug],
  );
}
export async function journeyReviewer(db: SeedDatabase): Promise<string | null> {
  const rows = (
    await db.query<{ id: string; role: string; status: string }>(
      `SELECT "id","role","status" FROM "User" WHERE "email"='admin@menujuakad.test'`,
    )
  ).rows;
  const admin = rows[0];
  return admin?.role === "SUPERADMIN" && admin.status === "ACTIVE" && admin.id ? admin.id : null;
}
