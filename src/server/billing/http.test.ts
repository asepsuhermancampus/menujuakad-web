import { beforeEach, expect, it, vi } from "vitest";
import { WorkspaceError } from "@/server/invitations/errors";
vi.mock("server-only", () => ({}));
const state = vi.hoisted(() => ({
  origin: vi.fn(),
  create: vi.fn(),
  list: vi.fn(),
  get: vi.fn(),
  review: vi.fn(),
  customer: vi.fn(),
}));
vi.mock("@/server/auth/request-policy", () => ({ assertTrustedOrigin: state.origin }));
vi.mock("./service", () => ({
  createCustomerTestRequest: state.create,
  listCustomerTestRequests: state.list,
  getCustomerTestRequest: state.get,
  reviewPaymentTest: state.review,
  requireBillingCustomer: state.customer,
}));
import { billingCollection, billingResource, adminPaymentReview } from "./http";
import { testingQrisResponse } from "./qris";
const request = (
  method = "POST",
  body = "{}",
  headers: Record<string, string> = { "Content-Type": "application/json" },
) =>
  new Request("https://menujuakad.test/api/billing/test-requests", {
    method,
    ...(method === "GET" ? {} : { body }),
    headers,
  });
beforeEach(() => {
  vi.resetAllMocks();
  state.origin.mockReturnValue(true);
  state.list.mockResolvedValue([]);
  state.create.mockResolvedValue({ id: "test1" });
  state.get.mockResolvedValue({ id: "test1" });
  state.review.mockResolvedValue({ status: "APPROVED_TEST" });
  state.customer.mockResolvedValue({
    userId: "customer1",
    role: "CLIENT",
    expiresAt: Date.now() + 60000,
  });
});
it.each([
  { handler: billingCollection, method: "POST" },
  { handler: (req: Request) => adminPaymentReview(req, "test1"), method: "PATCH" },
])("strict Origin protects all mutations", async ({ handler, method }) => {
  state.origin.mockReturnValue(false);
  expect((await handler(request(method))).status).toBe(403);
  expect(state.create).not.toHaveBeenCalled();
  expect(state.review).not.toHaveBeenCalled();
});
it("rejects body beyond 4096 bytes, invalid JSON and wrong content type", async () => {
  expect((await billingCollection(request("POST", "x".repeat(4097)))).status).toBe(413);
  expect((await billingCollection(request("POST", "{"))).status).toBe(400);
  expect(
    (await billingCollection(request("POST", "{}", { "Content-Type": "text/plain" }))).status,
  ).toBe(400);
  expect(state.create).not.toHaveBeenCalled();
});
it("GET only reads with private no-store and never invokes mutation", async () => {
  const response = await billingCollection(request("GET"));
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ requests: [] });
  expect(response.headers.get("Cache-Control")).toBe("private, no-store");
  expect(state.create).not.toHaveBeenCalled();
  expect(state.origin).not.toHaveBeenCalled();
});
it("maps unauthenticated and foreign lookup to safe denial", async () => {
  state.get.mockRejectedValue(new WorkspaceError(404, "Permintaan uji tidak ditemukan."));
  expect((await billingResource("foreign")).status).toBe(404);
  state.list.mockRejectedValue(new WorkspaceError(401, "Silakan masuk kembali."));
  expect((await billingCollection(request("GET"))).status).toBe(401);
});
it("successful create and review return database result without paid implication", async () => {
  const response = await billingCollection(
    request("POST", '{"invitationId":"draft","packageSlug":"TEST_BASIC"}'),
  );
  expect(response.status).toBe(201);
  expect(await response.json()).toEqual({ request: { id: "test1" } });
  const review = await adminPaymentReview(request("PATCH", '{"status":"APPROVED_TEST"}'), "test1");
  expect(await review.json()).toEqual({ request: { status: "APPROVED_TEST" } });
});
it("unexpected errors never expose private database details", async () => {
  state.list.mockRejectedValue(new Error("private-uri-secret"));
  const response = await billingCollection(request("GET"));
  expect(response.status).toBe(503);
  expect(await response.text()).not.toContain("private-uri-secret");
});
it("QRIS image denies anonymous and wrong role with no-store", async () => {
  state.customer.mockRejectedValue(new WorkspaceError(401, "Silakan masuk kembali."));
  const denied = await testingQrisResponse();
  expect(denied.status).toBe(401);
  expect(denied.headers.get("Content-Type")).toContain("application/json");
  state.customer.mockRejectedValue(new WorkspaceError(403, "Akses ditolak."));
  expect((await testingQrisResponse()).status).toBe(403);
});
it("authenticated JPEG is byte-identical to private asset, no-store and nosniff", async () => {
  const response = await testingQrisResponse();
  expect(response.status).toBe(200);
  expect(response.headers.get("Content-Type")).toBe("image/jpeg");
  expect(response.headers.get("Cache-Control")).toBe("private, no-store");
  expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
  const { readFile } = await import("node:fs/promises");
  expect(Buffer.from(await response.arrayBuffer())).toEqual(
    await readFile("assets/payment/testing-qris.jpg"),
  );
});
