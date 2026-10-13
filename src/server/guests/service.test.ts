import { beforeEach, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
const mocks = vi.hoisted(() => ({
  session: vi.fn(),
  list: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  archive: vi.fn(),
  bulk: vi.fn(),
  rsvp: vi.fn(),
}));
vi.mock("@/server/authorization/session", () => ({ getVerifiedSession: mocks.session }));
vi.mock("./repository", () => ({
  listOwnedGuests: mocks.list,
  createOwnedGuest: mocks.create,
  updateOwnedGuest: mocks.update,
  archiveOwnedGuest: mocks.archive,
  bulkCreateOwnedGuests: mocks.bulk,
  upsertOwnedRsvp: mocks.rsvp,
  normalizeIndonesianPhone: (raw: string | null) => raw,
}));
import {
  archiveGuest,
  bulkCreateGuests,
  createGuest,
  listGuests,
  updateGuest,
  updateRsvp,
} from "./service";
beforeEach(() => {
  vi.resetAllMocks();
  mocks.session.mockResolvedValue({
    userId: "owner1",
    role: "CLIENT",
    expiresAt: Date.now() + 100000,
  });
});
it("requires a verified CLIENT session for every guest operation", async () => {
  mocks.session.mockResolvedValue(null);
  await expect(listGuests("inv1")).rejects.toMatchObject({ status: 401 });
  expect(mocks.list).not.toHaveBeenCalled();
  mocks.session.mockResolvedValue({
    userId: "admin",
    role: "SUPERADMIN",
    expiresAt: Date.now() + 100000,
  });
  await expect(listGuests("inv1")).rejects.toMatchObject({ status: 403 });
});
it("scopes listing to the session user and the requested invitation", async () => {
  mocks.list.mockResolvedValue({ guests: [], summary: {} });
  await listGuests("inv1");
  expect(mocks.list).toHaveBeenCalledWith("owner1", "inv1");
});
it("rejects mass assignment on create before touching the repository", async () => {
  await expect(
    createGuest("inv1", { name: "Budi", invitationId: "other", status: "ARCHIVED" }),
  ).rejects.toMatchObject({ status: 400 });
  expect(mocks.create).not.toHaveBeenCalled();
});
it("creates a guest with session identity and validated defaults", async () => {
  mocks.create.mockResolvedValue({ id: "g1" });
  await createGuest("inv1", { name: "Budi" });
  const [userId, invitationId, input] = mocks.create.mock.calls[0];
  expect(userId).toBe("owner1");
  expect(invitationId).toBe("inv1");
  expect(input).toMatchObject({
    name: "Budi",
    phone: null,
    email: null,
    category: "OTHER",
    guestCountAllowed: 1,
  });
});
it("rejects invalid phone and over-limit seat allocation", async () => {
  await expect(createGuest("inv1", { name: "Budi", phone: "abc" })).rejects.toMatchObject({
    status: 400,
  });
  await expect(
    createGuest("inv1", { name: "Budi", guestCountAllowed: 11 }),
  ).rejects.toMatchObject({ status: 400 });
  expect(mocks.create).not.toHaveBeenCalled();
});
it("updates, archives, and bulk-imports with session ownership", async () => {
  mocks.update.mockResolvedValue({ id: "g1" });
  mocks.archive.mockResolvedValue(undefined);
  mocks.bulk.mockResolvedValue({ created: 2, skipped: 1 });
  await updateGuest("inv1", "g1", { name: "Budi Baru" });
  await archiveGuest("inv1", "g1");
  await bulkCreateGuests("inv1", { guests: [{ name: "A" }, { name: "B" }] });
  expect(mocks.update).toHaveBeenCalledWith("owner1", "inv1", "g1", { name: "Budi Baru" });
  expect(mocks.archive).toHaveBeenCalledWith("owner1", "inv1", "g1");
  expect(mocks.bulk.mock.calls[0][0]).toBe("owner1");
});
it("rejects bulk import over 500 rows and empty lists", async () => {
  await expect(bulkCreateGuests("inv1", { guests: [] })).rejects.toMatchObject({ status: 400 });
  const guests = Array.from({ length: 501 }, (_, index) => ({ name: `Tamu ${index}` }));
  await expect(bulkCreateGuests("inv1", { guests })).rejects.toMatchObject({ status: 400 });
  expect(mocks.bulk).not.toHaveBeenCalled();
});
it("records RSVP with validated status and count only", async () => {
  mocks.rsvp.mockResolvedValue({ id: "g1" });
  await updateRsvp("inv1", "g1", { status: "ATTENDING", guestCount: 2 });
  expect(mocks.rsvp).toHaveBeenCalledWith("owner1", "inv1", "g1", {
    status: "ATTENDING",
    guestCount: 2,
    phone: null,
    message: null,
  });
  await expect(updateRsvp("inv1", "g1", { status: "HADIR" })).rejects.toMatchObject({
    status: 400,
  });
  await expect(updateRsvp("inv1", "g1", { status: "ATTENDING", guestCount: 99 })).rejects.toMatchObject(
    { status: 400 },
  );
});
