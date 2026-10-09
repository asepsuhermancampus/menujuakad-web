import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it, expect } from "vitest";
import {
  ordersFixture,
  pendingOrderFixture,
  expiredOrderFixture,
  webhooksFixture,
} from "@/features/design-preview/data/fixtures";
import { PaymentCheckoutPreview } from "../components/customer/payment-checkout-preview";
import { PaymentOrderTable } from "../components/admin/payment-order-table";
import { WebhookDetailPanel } from "../components/admin/webhook-detail-panel";

describe("batas SSR UI pembayaran", () => {
  it("shows an expired banner and no usable payment instrument", () => {
    const html = renderToStaticMarkup(
      createElement(PaymentCheckoutPreview, { order: expiredOrderFixture, initialExpired: false }),
    );
    expect(html).toContain('data-checkout-status="EXPIRED"');
    expect(html).toContain("Sesi Pembayaran Kedaluwarsa (contoh)");
    expect(html).toContain("00:00");
    expect(html).toContain("Tidak ada kode untuk dipindai");
    expect(html).not.toMatch(/<canvas|<svg|<img|<form|https?:\/\//);
  });
  it("uses the deterministic fixture clock and never calls a provider", () => {
    const html = renderToStaticMarkup(
      createElement(PaymentCheckoutPreview, { order: pendingOrderFixture }),
    );
    expect(html).toContain("45:00");
    expect(html).toContain("15.00 WIB");
    expect(html).toContain('data-checkout-status="PENDING"');
    expect(html).not.toMatch(/<form|<canvas|<svg|<img/);
  });
  it("does not infer entitlement from paid examples", () => {
    const html = renderToStaticMarkup(
      createElement(PaymentOrderTable, { orders: ordersFixture, onSelect: () => undefined }),
    );
    expect(html.match(/Tidak diterbitkan oleh preview/g)).toHaveLength(4);
    expect(html).toContain("Dibayar (contoh)");
    expect(html).not.toContain("Terverifikasi");
  });
  it("explicitly whitelists webhook fields and ignores unexpected raw credentials", () => {
    const event = {
      ...webhooksFixture[0],
      signature: "SECRET_SIGNATURE_SENTINEL",
      token: "SECRET_TOKEN_SENTINEL",
      payload: { card: "SECRET_CARD_SENTINEL" },
    };
    const html = renderToStaticMarkup(
      createElement(WebhookDetailPanel, { event, onRetry: () => undefined }),
    );
    expect(html).toContain(event.id);
    expect(html).not.toContain("SECRET_");
    expect(html).toContain("Entitlement tidak diterbitkan oleh preview");
  });
});
