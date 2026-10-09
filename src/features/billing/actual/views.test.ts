import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
const state = vi.hoisted(() => ({ list: vi.fn(), drafts: vi.fn(), get: vi.fn(), admin: vi.fn() }));
vi.mock("@/server/billing/service", () => ({
  listCustomerTestRequests: state.list,
  listCustomerBillingDrafts: state.drafts,
  getCustomerTestRequest: state.get,
  listAdminPaymentTests: state.admin,
}));
vi.mock("./test-request-form", () => ({
  TestRequestForm: () => createElement("p", null, "Form permintaan uji"),
}));
vi.mock("./test-review-actions", () => ({
  TestReviewActions: () => createElement("p", null, "Review manual uji"),
}));
import { CustomerBillingView, TestingPackagesView, TestingCheckoutView } from "./customer-views";
import { AdminPaymentTestsView } from "./admin-view";
const record = {
  id: "test1",
  invitationId: "draft1",
  invitationTitle: "Undangan Akun Uji",
  amountIdr: 1000,
  packageSlug: "TEST_BASIC",
  status: "REQUESTED",
  reference: "<script>invalid</script>",
  createdAt: "2026-10-08T04:00:00.000Z",
  reviewedAt: null,
};
beforeEach(() => {
  vi.resetAllMocks();
  state.list.mockResolvedValue([record]);
  state.drafts.mockResolvedValue([{ id: "draft1", title: "Undangan Akun Uji" }]);
  state.get.mockResolvedValue(record);
  state.admin.mockResolvedValue([
    { ...record, customerEmail: "uji@example.test", reviewedByUserId: null },
  ]);
});
it("billing actual renders persisted records and empty state without nested main or fixture", async () => {
  const html = renderToStaticMarkup(await CustomerBillingView());
  expect(html).toContain("Undangan Akun Uji");
  expect(html).toContain("checkout/test1");
  expect(html).not.toContain("<main");
  expect(html).not.toContain("Sarah");
  expect(html).not.toContain("<script>");
  state.list.mockResolvedValue([]);
  expect(renderToStaticMarkup(await CustomerBillingView())).toContain("Belum ada permintaan uji");
});
it("package selection uses owned DB drafts and truthful empty state", async () => {
  expect(renderToStaticMarkup(await TestingPackagesView())).toContain("Form permintaan uji");
  state.drafts.mockResolvedValue([]);
  expect(renderToStaticMarkup(await TestingPackagesView())).toContain(
    "Buat draft privat terlebih dahulu",
  );
});
it("pending checkout displays protected QR and real-funds warning with no provider claims", async () => {
  const html = renderToStaticMarkup(await TestingCheckoutView({ id: "test1" }));
  expect(html).toContain("/api/billing/testing-qris");
  expect(html).toContain("pemindaian dapat memindahkan dana nyata");
  expect(html).toContain("Tidak ada verifikasi otomatis Mayar");
  expect(html).not.toContain("<script>");
  expect(html).not.toContain("<main");
});
it("approved checkout says persetujuan uji and hides QR payment prompt", async () => {
  state.get.mockResolvedValue({
    ...record,
    status: "APPROVED_TEST",
    reviewedAt: "2026-10-08T04:05:00.000Z",
  });
  const html = renderToStaticMarkup(await TestingCheckoutView({ id: "test1" }));
  expect(html).toContain("Persetujuan uji");
  expect(html).not.toContain("/api/billing/testing-qris");
  expect(html).not.toContain("Pembayaran lunas");
  expect(html).toContain("tidak mengaktifkan undangan");
});
it("admin review uses actual request data and treats reference as declaration only", async () => {
  const html = renderToStaticMarkup(await AdminPaymentTestsView());
  expect(html).toContain("uji@example.test");
  expect(html).toContain("deklarasi customer");
  expect(html).toContain("Review manual uji");
  expect(html).not.toContain("<script>");
  expect(html).not.toContain("<main");
  expect(html).not.toContain("Gateway normal");
});
