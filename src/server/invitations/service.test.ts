import { beforeEach, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
const mocks = vi.hoisted(() => ({
  session: vi.fn(),
  list: vi.fn(),
  get: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
  templates: vi.fn(),
}));
vi.mock("@/server/authorization/session", () => ({ getVerifiedSession: mocks.session }));
vi.mock("./repository", () => ({
  listOwnedInvitations: mocks.list,
  findOwnedInvitation: mocks.get,
  createOwnedDraft: mocks.create,
  updateOwnedDraft: mocks.update,
  deleteOwnedDraft: mocks.remove,
  listDraftTemplates: mocks.templates,
}));
import {
  listCustomerInvitations,
  getCustomerInvitation,
  createCustomerInvitation,
  updateCustomerInvitation,
  deleteCustomerInvitation,
} from "./service";
beforeEach(() => {
  vi.resetAllMocks();
  mocks.session.mockResolvedValue({
    userId: "owner1",
    role: "CLIENT",
    expiresAt: Date.now() + 100000,
  });
});
it("requires current verified session for every query", async () => {
  mocks.session.mockResolvedValue(null);
  await expect(listCustomerInvitations()).rejects.toMatchObject({ status: 401 });
  expect(mocks.list).not.toHaveBeenCalled();
});
it("rejects superadmin as customer and expired sessions", async () => {
  mocks.session.mockResolvedValue({
    userId: "admin",
    role: "SUPERADMIN",
    expiresAt: Date.now() + 100000,
  });
  await expect(listCustomerInvitations()).rejects.toMatchObject({ status: 403 });
  mocks.session.mockResolvedValue({ userId: "owner1", role: "CLIENT", expiresAt: 0 });
  await expect(listCustomerInvitations()).rejects.toMatchObject({ status: 401 });
});
it("scopes guessed ID lookup to actual user without revealing owner", async () => {
  mocks.get.mockResolvedValue(null);
  await expect(getCustomerInvitation("foreign-id")).rejects.toMatchObject({ status: 404 });
  expect(mocks.get).toHaveBeenCalledWith("owner1", "foreign-id");
});
it("rejects mass assignment before create", async () => {
  await expect(
    createCustomerInvitation({
      title: "Undangan",
      slug: "undangan-uji",
      templateId: "template",
      ownerUserId: "other",
    }),
  ).rejects.toMatchObject({ status: 400 });
  expect(mocks.create).not.toHaveBeenCalled();
});
it("creates draft only with session identity", async () => {
  mocks.create.mockResolvedValue({ id: "new" });
  await createCustomerInvitation({
    title: "Undangan",
    slug: "undangan-uji",
    templateId: "template",
    weddingDate: null,
    timezone: "Asia/Jakarta",
  });
  expect(mocks.create.mock.calls[0][0]).toBe("owner1");
});
it("updates and deletes use session ownership", async () => {
  mocks.update.mockResolvedValue({ id: "draft" });
  mocks.remove.mockResolvedValue(undefined);
  await updateCustomerInvitation("draft", { title: "Baru" });
  await deleteCustomerInvitation("draft");
  expect(mocks.update).toHaveBeenCalledWith("owner1", "draft", { title: "Baru" });
  expect(mocks.remove).toHaveBeenCalledWith("owner1", "draft");
});
