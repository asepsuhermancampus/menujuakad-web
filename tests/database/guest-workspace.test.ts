import { PGlite } from "@electric-sql/pglite";
import { beforeAll, afterAll, expect, it, vi } from "vitest";
import { PrismaClient } from "@/generated/prisma/client";
import { workspaceTestAdapter } from "./workspace-test-adapter";
import { applyAuthMigrations } from "./auth-multimethod-fixture";
vi.mock("server-only", () => ({}));
const state = vi.hoisted(() => ({ client: null as unknown }));
vi.mock("@/server/db/client", () => ({ getPrisma: () => state.client }));
import {
  archiveOwnedGuest,
  bulkCreateOwnedGuests,
  createOwnedGuest,
  listOwnedGuests,
  updateOwnedGuest,
  upsertOwnedRsvp,
} from "@/server/guests/repository";
import { createOwnedDraft } from "@/server/invitations/repository";

const db = new PGlite();
let client: PrismaClient;
let invitationId = "";
const template = "menujuakad-seed-preproduction-template";

beforeAll(async () => {
  await applyAuthMigrations(db);
  await db.exec(`INSERT INTO "User" ("id","email","role","updatedAt") VALUES
      ('customer1','customer01@menujuakad.test','CLIENT',now()),
      ('customer2','customer02@menujuakad.test','CLIENT',now());
    INSERT INTO "Template" ("id","name","slug","updatedAt")
      VALUES ('${template}','TEST Internal','seed-preproduction-internal',now());`);
  client = new PrismaClient({ adapter: workspaceTestAdapter(db) });
  state.client = client;
  const draft = await createOwnedDraft("customer1", {
    title: "Undangan Tamu",
    slug: "undangan-tamu-uji",
    templateId: template,
    weddingDate: "2027-03-03",
    timezone: "Asia/Jakarta",
  });
  invitationId = draft.id;
}, 20000);

afterAll(async () => {
  await client?.$disconnect();
  await db.close();
});

it("creates a guest with a unique personal token that is never an internal id", async () => {
  const guest = await createOwnedGuest("customer1", invitationId, {
    name: "Budi Santoso",
    phone: "081234567890",
    email: "budi@example.test",
    category: "FAMILY",
    guestCountAllowed: 2,
    notes: null,
  });
  expect(guest.id).toBeTruthy();
  expect(guest.name).toBe("Budi Santoso");
  expect(guest.guestCountAllowed).toBe(2);
  expect(guest.delivery.sent).toBe(false);
  const token = await client.guestInvitation.findFirst({
    where: { guestId: guest.id },
    select: { personalToken: true },
  });
  expect(token?.personalToken).toBeTruthy();
  /* Token acak 32 byte base64url = 43 karakter, bukan cuid/ID berurutan. */
  expect(token?.personalToken.length).toBeGreaterThanOrEqual(40);
  expect(token?.personalToken).not.toContain(guest.id);
});

it("scopes guest reads to the owning account only", async () => {
  const owned = await listOwnedGuests("customer1", invitationId);
  expect(owned.guests.length).toBeGreaterThanOrEqual(1);
  await expect(listOwnedGuests("customer2", invitationId)).rejects.toMatchObject({ status: 404 });
});

it("rejects guest writes from another account", async () => {
  const [guest] = (await listOwnedGuests("customer1", invitationId)).guests;
  await expect(
    updateOwnedGuest("customer2", invitationId, guest.id, { name: "Bukan Pemilik" }),
  ).rejects.toMatchObject({ status: 404 });
  await expect(archiveOwnedGuest("customer2", invitationId, guest.id)).rejects.toMatchObject({
    status: 404,
  });
  await expect(
    upsertOwnedRsvp("customer2", invitationId, guest.id, {
      status: "ATTENDING",
      guestCount: 1,
      phone: null,
      message: null,
    }),
  ).rejects.toMatchObject({ status: 404 });
});

it("persists edits and keeps one RSVP per guest with attendance capped by seat allocation", async () => {
  const [guest] = (await listOwnedGuests("customer1", invitationId)).guests;
  const updated = await updateOwnedGuest("customer1", invitationId, guest.id, {
    name: "Budi S.",
    category: "VIP",
  });
  expect(updated.name).toBe("Budi S.");
  expect(updated.category).toBe("VIP");
  const rsvp = await upsertOwnedRsvp("customer1", invitationId, guest.id, {
    status: "ATTENDING",
    guestCount: 2,
    phone: "081234567890",
    message: "Insya Allah hadir",
  });
  expect(rsvp.rsvp?.status).toBe("ATTENDING");
  expect(rsvp.rsvp?.guestCount).toBe(2);
  expect(rsvp.rsvp?.respondedAt).not.toBeNull();
  /* Ganti respons: tetap satu baris (upsert), bukan duplikat. */
  const changed = await upsertOwnedRsvp("customer1", invitationId, guest.id, {
    status: "MAYBE",
    guestCount: 1,
    phone: null,
    message: null,
  });
  expect(changed.rsvp?.status).toBe("MAYBE");
  const rows = await client.rsvpResponse.count({ where: { guestId: guest.id } });
  expect(rows).toBe(1);
  /* Jumlah hadir tidak boleh melebihi alokasi kursi tamu. */
  await expect(
    upsertOwnedRsvp("customer1", invitationId, guest.id, {
      status: "ATTENDING",
      guestCount: 3,
      phone: null,
      message: null,
    }),
  ).rejects.toMatchObject({ status: 400 });
});

it("bulk import skips duplicates inside the same invitation and reports counts", async () => {
  const result = await bulkCreateOwnedGuests("customer1", invitationId, {
    guests: [
      { name: "Budi S.", phone: null, category: "FAMILY", guestCountAllowed: 1 },
      { name: "Siti Aminah", phone: null, category: "FRIEND", guestCountAllowed: 3 },
      { name: "Rizky Pratama", phone: null, category: "WORK", guestCountAllowed: 1 },
    ],
  });
  expect(result).toEqual({ created: 2, skipped: 1 });
  const { guests, summary } = await listOwnedGuests("customer1", invitationId);
  expect(guests.length).toBe(3);
  expect(summary.registered).toBe(3);
  /* Kursi teralokasi = 2 (Budi) + 3 (Siti) + 1 (Rizky). */
  expect(summary.seats).toBe(6);
});

it("archives instead of deleting so RSVP history survives", async () => {
  const { guests } = await listOwnedGuests("customer1", invitationId);
  const target = guests.find((guest) => guest.name === "Rizky Pratama")!;
  await archiveOwnedGuest("customer1", invitationId, target.id);
  const after = await listOwnedGuests("customer1", invitationId);
  expect(after.guests.some((guest) => guest.id === target.id)).toBe(false);
  const row = await client.guest.findFirst({ where: { id: target.id }, select: { status: true } });
  expect(row?.status).toBe("ARCHIVED");
});

it("cascades guest deletion when the invitation itself is removed", async () => {
  const before = await client.guest.count({ where: { invitationId } });
  expect(before).toBeGreaterThan(0);
  await client.invitation.delete({ where: { id: invitationId } });
  const after = await client.guest.count({ where: { invitationId } });
  const tokens = await client.guestInvitation.count({ where: { invitationId } });
  const rsvps = await client.rsvpResponse.count({ where: { invitationId } });
  expect(after).toBe(0);
  expect(tokens).toBe(0);
  expect(rsvps).toBe(0);
});
