import { hashPassword } from "../../src/server/auth/password-crypto";
import type { SeedDatabase } from "./auth-seed-data";
import { customerJourneys, type CustomerJourney } from "./customer-journey-fixtures";
import {
  customerJourneyCreatedAt,
  validateCustomerJourneyManifest,
  type CustomerJourneyManifest,
} from "./customer-journey-manifest";
import {
  ensureJourneyTemplate,
  journeyReviewer,
  validateJourneyIdentity,
} from "./customer-journey-validation";
async function createInvitation(
  db: SeedDatabase,
  fixture: CustomerJourney,
  createdAt: string,
  reviewer: string | null,
) {
  const draft = fixture.invitation;
  if (!draft) return;
  await db.query(
    `INSERT INTO "Invitation" ("id","ownerUserId","templateId","slug","title","status","weddingDate","timezone","isPublished","createdAt","updatedAt") VALUES ($1,$2,$3,$4,$5,'DRAFT',$6::date,$7,false,$8,$8)`,
    [
      fixture.invitationId,
      fixture.userId,
      draft.templateId,
      draft.slug,
      draft.title,
      draft.weddingDate,
      draft.timezone,
      createdAt,
    ],
  );
  await db.query(
    `INSERT INTO "InvitationMember" ("id","invitationId","userId","role","createdAt","updatedAt") VALUES ($1,$2,$3,'OWNER',$4,$4)`,
    [`${fixture.invitationId}-owner`, fixture.invitationId, fixture.userId, createdAt],
  );
  if (fixture.couple) {
    const c = fixture.couple;
    await db.query(
      `INSERT INTO "CoupleProfile" ("id","invitationId","groomFullName","groomNickname","groomParents","groomBio","brideFullName","brideNickname","brideParents","brideBio","createdAt","updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$11)`,
      [
        `${fixture.invitationId}-couple`,
        fixture.invitationId,
        c.groomFullName,
        c.groomNickname,
        c.groomParents,
        c.groomBio,
        c.brideFullName,
        c.brideNickname,
        c.brideParents,
        c.brideBio,
        createdAt,
      ],
    );
  }
  for (const [order, section] of fixture.sections.entries())
    await db.query(
      `INSERT INTO "InvitationSection" ("id","invitationId","type","title","sortOrder","configJson","createdAt","updatedAt") VALUES ($1,$2,$3::"InvitationSectionType",$4,$5,$6::jsonb,$7,$7)`,
      [
        `${fixture.invitationId}-${section.type.toLowerCase()}`,
        fixture.invitationId,
        section.type,
        `TEST — ${section.type}`,
        order,
        JSON.stringify(section.config),
        createdAt,
      ],
    );
  if (fixture.payment) {
    const payment = fixture.payment;
    const reviewed = payment.status !== "REQUESTED";
    const reviewedAt = reviewed ? new Date(Date.parse(createdAt) + 3600000).toISOString() : null;
    await db.query(
      `INSERT INTO "PaymentTestRequest" ("id","invitationId","userId","amountIdr","packageSlug","status","reference","createdAt","updatedAt","reviewedAt","reviewedByUserId") VALUES ($1,$2,$3,$4,$5,$6::"PaymentTestStatus",$7,$8,$8,$9,$10)`,
      [
        `${fixture.invitationId}-payment`,
        fixture.invitationId,
        fixture.userId,
        payment.amountIdr,
        payment.packageSlug,
        payment.status,
        `TEST-JOURNEY-${fixture.sequence}`,
        createdAt,
        reviewedAt,
        reviewed ? reviewer : null,
      ],
    );
  }
}
/** Caller wajib satu transaksi; advisory lock bersama seed auth mencegah race template. */
export async function seedCustomerJourneys(db: SeedDatabase, input: CustomerJourneyManifest) {
  const manifest = validateCustomerJourneyManifest(input);
  await db.query("SELECT pg_advisory_xact_lock(20261008, 11)::text AS lock");
  await ensureJourneyTemplate(db);
  // Preflight seluruh cohort sebelum hashing: collision terakhir tidak menghabiskan hash akun lain.
  const existing = new Set<string>();
  for (const fixture of customerJourneys)
    if (await validateJourneyIdentity(db, fixture, manifest)) existing.add(fixture.userId);
  const reviewer = await journeyReviewer(db);
  let createdAccounts = 0,
    createdInvitations = 0,
    createdPayments = 0;
  for (const [index, fixture] of customerJourneys.entries()) {
    if (existing.has(fixture.userId)) continue;
    const account = manifest.accounts[index];
    const passwordHash = await hashPassword(account.password);
    const lastLoginAt = new Date(
      Date.parse(manifest.createdAt) - (index + 1) * 86400000,
    ).toISOString();
    await db.query(
      `INSERT INTO "User" ("id","email","name","phone","role","status","emailVerifiedAt","lastLoginAt","createdAt","updatedAt") VALUES ($1,$2,$3,$4,'CUSTOMER','ACTIVE',$5,$6,$7,$7)`,
      [
        fixture.userId,
        fixture.email,
        fixture.name,
        fixture.phone,
        fixture.verified ? lastLoginAt : null,
        lastLoginAt,
        customerJourneyCreatedAt(manifest),
      ],
    );
    await db.query(`INSERT INTO "AuthCredential" ("userId","passwordHash") VALUES ($1,$2)`, [
      fixture.userId,
      passwordHash,
    ]);
    await createInvitation(db, fixture, lastLoginAt, reviewer);
    createdAccounts++;
    if (fixture.invitation) createdInvitations++;
    if (fixture.payment) createdPayments++;
  }
  return {
    accounts: 30,
    createdAccounts,
    createdInvitations,
    createdPayments,
    skippedAccounts: existing.size,
  };
}
