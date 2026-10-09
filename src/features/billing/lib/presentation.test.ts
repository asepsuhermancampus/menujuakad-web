import { describe, expect, it } from "vitest";
import {
  pendingOrderFixture,
  expiredOrderFixture,
  ordersFixture,
  webhooksFixture,
  previewContext,
} from "@/features/design-preview/data/fixtures";
import {
  checkoutState,
  formatRemaining,
  orderMetrics,
  webhookMetrics,
  filterOrders,
  filterWebhooks,
  paginate,
  paymentStatusMessage,
} from "./presentation";

describe("checkout contoh tanpa kewenangan provider", () => {
  it("clamps past deadlines and preserves explicit expired status", () => {
    expect(checkoutState(pendingOrderFixture, previewContext.now)).toEqual({
      status: "PENDING",
      remainingSeconds: 2700,
    });
    expect(checkoutState(expiredOrderFixture, previewContext.now).remainingSeconds).toBe(0);
    expect(
      checkoutState(
        { ...expiredOrderFixture, expiresAt: "2030-01-01T00:00:00Z" },
        previewContext.now,
      ).status,
    ).toBe("EXPIRED");
    expect(checkoutState(pendingOrderFixture, pendingOrderFixture.expiresAt).status).toBe(
      "EXPIRED",
    );
    expect(formatRemaining(-5)).toBe("00:00");
    expect(formatRemaining(2700)).toBe("45:00");
  });
  it("rejects invalid time without a usable deadline", () => {
    expect(
      checkoutState({ ...pendingOrderFixture, expiresAt: "invalid" }, previewContext.now),
    ).toEqual({ status: "UNAVAILABLE", remainingSeconds: 0 });
    expect(checkoutState(pendingOrderFixture, "invalid").status).toBe("UNAVAILABLE");
    expect(formatRemaining(NaN)).toBe("00:00");
  });
  it("never turns paid or failed records into a payable pending state", () => {
    for (const status of ["PAID", "FAILED"] as const) {
      const order = { ...pendingOrderFixture, status };
      expect(checkoutState(order, previewContext.now, true).status).toBe(status);
      expect(checkoutState(order, previewContext.now).remainingSeconds).toBe(0);
    }
    expect(paymentStatusMessage("PAID")).toContain("Tidak menerbitkan entitlement");
  });
});

describe("synthetic monitoring", () => {
  it("counts paid value separately from all order totals", () => {
    expect(orderMetrics(ordersFixture)).toEqual({
      paidAmountIdr: 149000,
      paid: 1,
      pending: 1,
      review: 2,
    });
    expect(webhookMetrics(webhooksFixture)).toEqual({
      total: 3,
      processed: 1,
      duplicate: 1,
      failed: 1,
    });
  });
  it("combines status and case-insensitive search with safe empty results", () => {
    expect(filterOrders(ordersFixture, "PAID", "DEMO-ORDER")).toHaveLength(1);
    expect(filterOrders(ordersFixture, "PAID", "expired")).toHaveLength(0);
    expect(filterWebhooks(webhooksFixture, "FAILED", "order-failed")[0]?.id).toBe(
      "demo-webhook-03",
    );
    expect(filterWebhooks(webhooksFixture, "ALL", "missing")).toEqual([]);
  });
  it("clamps pagination after filtering or invalid page inputs", () => {
    expect(paginate(ordersFixture, 99, 2).page).toBe(2);
    expect(paginate([], 5, 2)).toEqual({ rows: [], page: 1, pages: 1, total: 0 });
    expect(paginate(ordersFixture, NaN, 2).page).toBe(1);
  });
});
