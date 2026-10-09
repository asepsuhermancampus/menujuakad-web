import { beforeEach, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
const mock = vi.hoisted(() => ({
  origin: vi.fn(),
  list: vi.fn(),
  get: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
}));
vi.mock("@/server/auth/request-policy", () => ({ assertTrustedOrigin: mock.origin }));
vi.mock("./service", () => ({
  listCustomerInvitations: mock.list,
  getCustomerInvitation: mock.get,
  createCustomerInvitation: mock.create,
  updateCustomerInvitation: mock.update,
  deleteCustomerInvitation: mock.remove,
}));
import { invitationCollection, invitationResource } from "./http";
import { WorkspaceError } from "./errors";
const req = (method: string, body: unknown = {}) =>
  new Request("https://menujuakad.com/api/customer/invitations", {
    method,
    headers: { "content-type": "application/json", origin: "https://menujuakad.com" },
    ...(method === "GET" ? {} : { body: JSON.stringify(body) }),
  });
beforeEach(() => {
  vi.resetAllMocks();
  mock.origin.mockReturnValue(true);
});
it("denies foreign origin before any write", async () => {
  mock.origin.mockReturnValue(false);
  expect((await invitationCollection(req("POST"))).status).toBe(403);
  expect(mock.create).not.toHaveBeenCalled();
});
it("rejects body exceeding bounded size", async () => {
  expect((await invitationCollection(req("POST", { text: "x".repeat(33000) }))).status).toBe(413);
  expect(mock.create).not.toHaveBeenCalled();
});
it("rejects invalid JSON and content type", async () => {
  expect(
    (
      await invitationCollection(
        new Request("https://menujuakad.com/api", { method: "POST", body: "oops" }),
      )
    ).status,
  ).toBe(400);
});
it("returns safe 503 without database exception", async () => {
  mock.list.mockRejectedValue(new Error("secret database URI"));
  const response = await invitationCollection(req("GET"));
  expect(response.status).toBe(503);
  expect(await response.text()).not.toContain("secret");
  expect(response.headers.get("cache-control")).toContain("no-store");
});
it.each([401, 403, 404, 409])("preserves denial status %s", async (status) => {
  mock.get.mockRejectedValue(new WorkspaceError(status, "Akses ditolak."));
  expect((await invitationResource(req("GET"), "guessed")).status).toBe(status);
});
it("passes only route ID and validated payload through mutation", async () => {
  mock.update.mockResolvedValue({ id: "draft", title: "Baru" });
  const response = await invitationResource(req("PATCH", { title: "Baru" }), "draft");
  expect(response.status).toBe(200);
  expect(mock.update).toHaveBeenCalledWith("draft", { title: "Baru" });
});
it("requires empty JSON on delete and emits 204", async () => {
  expect((await invitationResource(req("DELETE", { ownerUserId: "other" }), "draft")).status).toBe(
    400,
  );
  expect(mock.remove).not.toHaveBeenCalled();
  expect((await invitationResource(req("DELETE"), "draft")).status).toBe(204);
});
