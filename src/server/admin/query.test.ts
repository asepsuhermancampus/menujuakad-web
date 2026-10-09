import { beforeEach, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
const mock = vi.hoisted(() => ({ session: vi.fn(), users: vi.fn(), invitations: vi.fn() }));
vi.mock("@/server/authorization/session", () => ({ getVerifiedSession: mock.session }));
vi.mock("./repository", () => ({
  readTestUsers: mock.users,
  readTestInvitations: mock.invitations,
}));
import { getAdminUsers, getAdminInvitations } from "./query";
beforeEach(() => {
  vi.resetAllMocks();
  mock.session.mockResolvedValue({
    userId: "admin",
    role: "SUPERADMIN",
    expiresAt: Date.now() + 100000,
  });
  mock.users.mockResolvedValue([]);
  mock.invitations.mockResolvedValue([]);
});
it("customer cannot list accounts", async () => {
  mock.session.mockResolvedValue({
    userId: "customer",
    role: "CUSTOMER",
    expiresAt: Date.now() + 100000,
  });
  await expect(getAdminUsers(1)).rejects.toMatchObject({ status: 403 });
  expect(mock.users).not.toHaveBeenCalled();
});
it("rechecks session for both admin queries", async () => {
  await getAdminUsers(1);
  mock.session.mockResolvedValue(null);
  await expect(getAdminInvitations(1)).rejects.toMatchObject({ status: 401 });
});
it("bounds pagination and never leaks unexpected DB errors", async () => {
  await getAdminUsers(99999999);
  expect(mock.users).toHaveBeenCalledWith("admin", 10000);
  mock.invitations.mockRejectedValue(new Error("private"));
  await expect(getAdminInvitations(1)).rejects.toMatchObject({ status: 503 });
});
