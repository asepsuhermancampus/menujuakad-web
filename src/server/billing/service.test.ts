import { beforeEach, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
const state = vi.hoisted(() => ({
  session: vi.fn(),
  list: vi.fn(),
  get: vi.fn(),
  create: vi.fn(),
  review: vi.fn(),
  admin: vi.fn(),
  drafts: vi.fn(),
}));
vi.mock("@/server/authorization/session", () => ({ getVerifiedSession: state.session }));
vi.mock("./repository", () => ({
  listOwnedRequests: state.list,
  findOwnedRequest: state.get,
  createOwnedRequest: state.create,
  reviewRequest: state.review,
  listAdminRequests: state.admin,
  listOwnedDrafts: state.drafts,
}));
import {
  createCustomerTestRequest,
  getCustomerTestRequest,
  listCustomerTestRequests,
  listCustomerBillingDrafts,
  listAdminPaymentTests,
  reviewPaymentTest,
  requireBillingCustomer,
} from "./service";
beforeEach(() => {
  vi.resetAllMocks();
  state.session.mockResolvedValue({
    userId: "customer1",
    role: "CUSTOMER",
    expiresAt: Date.now() + 60000,
  });
});
it("requires verified customer for every billing read and QR access", async () => {
  state.session.mockResolvedValue(null);
  for (const query of [listCustomerTestRequests, listCustomerBillingDrafts, requireBillingCustomer])
    await expect(query()).rejects.toMatchObject({ status: 401 });
  expect(state.list).not.toHaveBeenCalled();
});
it("rejects expired session and superadmin at customer operation", async () => {
  state.session.mockResolvedValue({ userId: "customer1", role: "CUSTOMER", expiresAt: 0 });
  await expect(listCustomerTestRequests()).rejects.toMatchObject({ status: 401 });
  state.session.mockResolvedValue({
    userId: "admin",
    role: "SUPERADMIN",
    expiresAt: Date.now() + 60000,
  });
  await expect(requireBillingCustomer()).rejects.toMatchObject({ status: 403 });
});
it("customer cannot review or list admin data", async () => {
  await expect(reviewPaymentTest("test1", { status: "APPROVED_TEST" })).rejects.toMatchObject({
    status: 403,
  });
  await expect(listAdminPaymentTests()).rejects.toMatchObject({ status: 403 });
  expect(state.review).not.toHaveBeenCalled();
});
it("foreign request IDs use ownership and indistinguishable not-found", async () => {
  state.get.mockResolvedValue(null);
  await expect(getCustomerTestRequest("foreign")).rejects.toMatchObject({ status: 404 });
  expect(state.get).toHaveBeenCalledWith("customer1", "foreign");
});
it.each(["amountIdr", "userId", "status", "reviewedByUserId"])(
  "rejects client field %s",
  async (field) => {
    await expect(
      createCustomerTestRequest({
        invitationId: "draft1",
        packageSlug: "TEST_BASIC",
        [field]: "malicious",
      }),
    ).rejects.toMatchObject({ status: 400 });
    expect(state.create).not.toHaveBeenCalled();
  },
);
it("server selects positive integer IDR nominal and verified identity", async () => {
  state.create.mockResolvedValue({ id: "test1" });
  await createCustomerTestRequest({
    invitationId: "draft1",
    packageSlug: "TEST_BASIC",
    reference: "  deklarasi uji  ",
  });
  expect(state.create).toHaveBeenCalledWith("customer1", {
    invitationId: "draft1",
    packageSlug: "TEST_BASIC",
    amountIdr: 1000,
    reference: "deklarasi uji",
  });
});
it("rejects unknown package and reference beyond 160 characters", async () => {
  await expect(
    createCustomerTestRequest({ invitationId: "draft1", packageSlug: "COMMERCIAL" }),
  ).rejects.toMatchObject({ status: 400 });
  await expect(
    createCustomerTestRequest({
      invitationId: "draft1",
      packageSlug: "TEST_BASIC",
      reference: "x".repeat(161),
    }),
  ).rejects.toMatchObject({ status: 400 });
});
it("review status and reviewer always come from validated body and session", async () => {
  state.session.mockResolvedValue({
    userId: "admin1",
    role: "SUPERADMIN",
    expiresAt: Date.now() + 60000,
  });
  state.review.mockResolvedValue({ id: "test1", status: "APPROVED_TEST" });
  await reviewPaymentTest("test1", { status: "APPROVED_TEST" });
  expect(state.review).toHaveBeenCalledWith("admin1", "test1", "APPROVED_TEST");
  for (const input of [
    { status: "PAID" },
    { status: "REQUESTED" },
    { status: "REJECTED", reviewedByUserId: "other" },
  ])
    await expect(reviewPaymentTest("test1", input)).rejects.toMatchObject({ status: 400 });
});
it("database failure returns generic unavailable without provider detail", async () => {
  state.list.mockRejectedValue(new Error("private-connection-detail"));
  await expect(listCustomerTestRequests()).rejects.toMatchObject({
    status: 503,
    message: "Layanan data pengujian sedang tidak tersedia. Silakan coba lagi.",
  });
});
it.each([
  { packageSlug: "TEST_STANDARD", amountIdr: 2000 },
  { packageSlug: "TEST_PLUS", amountIdr: 3000 },
])("nominal package $packageSlug is server-authoritative", async ({ packageSlug, amountIdr }) => {
  await createCustomerTestRequest({ invitationId: "draft1", packageSlug });
  expect(state.create).toHaveBeenCalledWith("customer1", {
    invitationId: "draft1",
    packageSlug,
    amountIdr,
  });
});
it("malformed resource IDs and embedded control reference are rejected", async () => {
  await expect(getCustomerTestRequest("../foreign")).rejects.toMatchObject({ status: 404 });
  await expect(
    createCustomerTestRequest({
      invitationId: "draft1",
      packageSlug: "TEST_BASIC",
      reference: "a\u0000b",
    }),
  ).rejects.toMatchObject({ status: 400 });
  expect(state.get).not.toHaveBeenCalled();
  expect(state.create).not.toHaveBeenCalled();
});
