import { beforeEach, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
const state = vi.hoisted(() => ({ session: null as unknown, rows: vi.fn() }));
vi.mock("@/server/authorization/session", () => ({
  getVerifiedSession: async () => state.session,
}));
vi.mock("./repository", () => ({ readOwnedAnalytics: state.rows }));
import { getCustomerAnalytics } from "./query";
import { analyticsInputSchema } from "./input";
beforeEach(() => {
  state.session = { userId: "owner", role: "CLIENT", expiresAt: Date.now() + 60000 };
  state.rows.mockReset();
  state.rows.mockResolvedValue({ invitations: [], payments: [] });
});
it.each([
  null,
  { userId: "admin", role: "SUPERADMIN", expiresAt: Date.now() + 60000 },
  { userId: "owner", role: "CLIENT", expiresAt: 1 },
])("denies absent, wrong-role and expired sessions before reading data", async (session) => {
  state.session = session;
  await expect(getCustomerAnalytics({})).rejects.toMatchObject({
    status: session && session.role === "SUPERADMIN" ? 403 : 401,
  });
  expect(state.rows).not.toHaveBeenCalled();
});
it("rejects unknown fields, repeated and unsupported periods without accepting owner ID", async () => {
  for (const value of [
    { period: "today" },
    { userId: "foreign" },
    { period: ["7d", "30d"] },
    { period: "7d", revenue: true },
  ]) {
    expect(analyticsInputSchema.safeParse(value).success).toBe(false);
    await expect(getCustomerAnalytics(value)).rejects.toMatchObject({ status: 400 });
  }
  expect(state.rows).not.toHaveBeenCalled();
});
it("returns genuine empty aggregates and no PII, paid or revenue metric", async () => {
  const dto = await getCustomerAnalytics({});
  expect(dto.invitations).toEqual({ total: 0, draft: 0, other: 0 });
  expect(dto.paymentTests.total).toBe(0);
  expect(dto.paymentTests.amountIdr).toBe(0);
  expect(dto.paymentTests.byStatus.APPROVED_TEST).toEqual({ count: 0, amountIdr: 0 });
  expect(JSON.stringify(dto)).not.toMatch(/owner|email|password|token|revenue|PAID/);
  expect(state.rows.mock.calls[0][0]).toBe("owner");
});
it("aggregates test status counts and integer nominal only", async () => {
  state.rows.mockResolvedValue({
    invitations: [
      { status: "DRAFT", _count: { _all: 2 } },
      { status: "ARCHIVED", _count: { _all: 1 } },
    ],
    payments: [
      { status: "APPROVED_TEST", _count: { _all: 2 }, _sum: { amountIdr: 4294967294 } },
      { status: "REQUESTED", _count: { _all: 1 }, _sum: { amountIdr: 1000 } },
    ],
  });
  const dto = await getCustomerAnalytics({ period: "30d" });
  expect(dto.invitations).toEqual({ total: 3, draft: 2, other: 1 });
  expect(dto.paymentTests.amountIdr).toBe(4294968294);
  expect(dto.paymentTests.byStatus.REJECTED).toEqual({ count: 0, amountIdr: 0 });
});
it.each([1.5, -1, Number.MAX_SAFE_INTEGER + 1])(
  "fails closed for invalid/unsafe aggregate %s",
  async (amountIdr) => {
    state.rows.mockResolvedValue({
      invitations: [],
      payments: [{ status: "REQUESTED", _count: { _all: 1 }, _sum: { amountIdr } }],
    });
    await expect(getCustomerAnalytics({})).rejects.toMatchObject({ status: 503 });
  },
);
it("fails closed for DB outages without fixture fallback or secret leakage", async () => {
  state.rows.mockRejectedValue(new Error("PRIVATE DATABASE CONNECTION"));
  await expect(getCustomerAnalytics({})).rejects.toMatchObject({
    status: 503,
    message: "Layanan data sedang tidak tersedia. Silakan coba lagi.",
  });
});
