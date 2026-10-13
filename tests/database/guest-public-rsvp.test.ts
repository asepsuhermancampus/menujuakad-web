import { PGlite } from "@electric-sql/pglite";
import { beforeAll, afterAll, expect, it, vi } from "vitest";
import { PrismaClient } from "@/generated/prisma/client";
import { workspaceTestAdapter } from "./workspace-test-adapter";
import { applyAuthMigrations } from "./auth-multimethod-fixture";
vi.mock("server-only", () => ({}));
const state = vi.hoisted(() => ({ client: null as unknown }));
vi.mock("@/server/db/client", () => ({ getPrisma: () => state.client }));
import { createOwnedGuest } from "@/server/guests/repository";
import { getPublicRsvpContext, submitPublicRsvp } from "@/server/guests/public-repository";
import { createOwnedDraft } from "@/server/invitations/repository";

const db = new PGlite();
let client: PrismaClient;
let invitationId = "";
let publishedInvitationId = "";
let token = "";
const template = "menujuakad-seed-preproduction-template";

beforeAll(async () => {
  await applyAuthMigrations(db);
  await db.exec(`INSERT INTO "User" ("id","email","role","updatedAt") VALUES
      ('customer1','customer01@menujuakad.test','CLIENT',now());
    INSERT INTO "Template" ("id","name","slug","updatedAt")
      VALUES ('${template}','TEST Internal','seed-preproduction-internal',now());`);
  client = new PrismaClient({ adapter: workspaceTestAdapter(db) });
  state.client = client;
  const draft = await createOwnedDraft("customer1", {
    title: "Undangan RSVP Publik",
    slug: "undangan-rsvp-publik-uji",
    templateId: template,
    weddingDate: "2027-05-05",
    timezone: "Asia/Jakarta",
  });
  invitationId = draft.id;
  const published = await createOwnedDraft("customer1", {
    title: "Undangan Terbit",
    slug: "undangan-terbit-uji",
    templateId: template,
    weddingDate: "2027-06-06",
    timezone: "Asia/Jakarta",
  });
  publishedInvitationId = published.id;
  await client.invitation.update({
    where: { id: publishedInvitationId },
    data: { isPublished: true, status: "ACTIVE", publishedAt: new Date() },
  });
  const guest = await createOwnedGuest("customer1", publishedInvitationId, {
    name: "Budi Santoso",
    phone: "081234567890",
    email: null,
    category: "FAMILY",
    guestCountAllowed: 2,
    notes: "Catatan privat pemilik",
  });
  const row = await client.guestInvitation.findFirst({
    where: { guestId: guest.id },
    select: { personalToken: true },
  });
  token = row!.personalToken;
}, 20000);

afterAll(async () => {
  await client?.$disconnect();
  await db.close();
});

it("rejects unknown, malformed, and unpublished-invitation tokens with 404", async () => {
  await expect(getPublicRsvpContext("t".repeat(43))).rejects.toMatchObject({ status: 404 });
  /* Tamu di undangan yang BELUM terbit tidak bisa membuka halaman RSVP. */
  const draftGuest = await createOwnedGuest("customer1", invitationId, {
    name: "Tamu Draft",
    phone: null,
    email: null,
    category: "OTHER",
    guestCountAllowed: 1,
    notes: null,
  });
  const draftToken = (
    await client.guestInvitation.findFirst({
      where: { guestId: draftGuest.id },
      select: { personalToken: true },
    })
  )!.personalToken;
  await expect(getPublicRsvpContext(draftToken)).rejects.toMatchObject({ status: 404 });
});

it("returns a minimal public context without owner notes or contact leaks", async () => {
  const context = await getPublicRsvpContext(token);
  expect(context).toMatchObject({
    guestName: "Budi Santoso",
    invitationTitle: "Undangan Terbit",
    weddingDate: "2027-06-06",
    guestCountAllowed: 2,
    rsvp: null,
  });
  expect(JSON.stringify(context)).not.toContain("Catatan privat");
  /* Membuka tautan mencatat openedAt/lastOpenedAt, bukan sentAt. */
  const row = await client.guestInvitation.findFirst({
    where: { personalToken: token },
    select: { openedAt: true, lastOpenedAt: true, sentAt: true },
  });
  expect(row?.openedAt).not.toBeNull();
  expect(row?.lastOpenedAt).not.toBeNull();
  expect(row?.sentAt).toBeNull();
});

it("records a guest response and keeps exactly one row on change", async () => {
  const created = await submitPublicRsvp(token, {
    status: "ATTENDING",
    guestCount: 2,
    phone: "081234567890",
    message: "Insya Allah hadir",
  });
  expect(created).toMatchObject({ status: "ATTENDING", guestCount: 2 });
  const changed = await submitPublicRsvp(token, {
    status: "NOT_ATTENDING",
    guestCount: 0,
    phone: null,
    message: null,
  });
  expect(changed).toMatchObject({ status: "NOT_ATTENDING", guestCount: 0 });
  const guestId = (
    await client.guestInvitation.findFirst({
      where: { personalToken: token },
      select: { guestId: true },
    })
  )!.guestId;
  expect(await client.rsvpResponse.count({ where: { guestId } })).toBe(1);
  const context = await getPublicRsvpContext(token);
  expect(context.rsvp).toMatchObject({ status: "NOT_ATTENDING", guestCount: 0 });
});

it("caps attendance at the seat allocation and zeroes count for non-attendance", async () => {
  await expect(
    submitPublicRsvp(token, {
      status: "ATTENDING",
      guestCount: 3,
      phone: null,
      message: null,
    }),
  ).rejects.toMatchObject({ status: 400 });
  await submitPublicRsvp(token, { status: "MAYBE", guestCount: 2, phone: null, message: null });
  const guestId = (
    await client.guestInvitation.findFirst({
      where: { personalToken: token },
      select: { guestId: true },
    })
  )!.guestId;
  const row = await client.rsvpResponse.findUnique({
    where: { guestId },
    select: { guestCount: true, status: true },
  });
  expect(row).toMatchObject({ status: "MAYBE", guestCount: 0 });
});

it("owner sees the public response through the guarded owner list", async () => {
  const { guests, summary } = await (
    await import("@/server/guests/repository")
  ).listOwnedGuests("customer1", publishedInvitationId);
  expect(guests.length).toBe(1);
  expect(summary.responded).toBe(1);
  expect(summary.maybe).toBe(1);
});

it("stops serving the link once the guest is archived", async () => {
  const guestId = (
    await client.guestInvitation.findFirst({
      where: { personalToken: token },
      select: { guestId: true },
    })
  )!.guestId;
  await client.guest.update({ where: { id: guestId }, data: { status: "ARCHIVED" } });
  await expect(getPublicRsvpContext(token)).rejects.toMatchObject({ status: 404 });
  await expect(
    submitPublicRsvp(token, { status: "ATTENDING", guestCount: 1, phone: null, message: null }),
  ).rejects.toMatchObject({ status: 404 });
});
