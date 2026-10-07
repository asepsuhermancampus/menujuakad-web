import { previewContext } from "./fixture-context";

export type PackagePreviewDto = Readonly<{
  id: string;
  name: string;
  amountIdr: number;
  currency: "IDR";
  priceLabel: "Harga contoh";
  recommended: boolean;
  guestLimit: number;
  galleryLimit: number;
  features: readonly string[];
}>;
export type PaymentPreviewStatus = "PENDING" | "PAID" | "EXPIRED" | "FAILED";
export type OrderPreviewDto = Readonly<{
  id: string;
  accountId: string;
  invitationId: string;
  packageId: string;
  amountIdr: number;
  currency: "IDR";
  status: PaymentPreviewStatus;
  createdAt: string;
  expiresAt: string;
  paidAt: string | null;
  synthetic: true;
}>;
export type WebhookPreviewDto = Readonly<{
  id: string;
  orderId: string;
  eventType: "PAYMENT_PAID_EXAMPLE";
  status: "PROCESSED" | "DUPLICATE" | "FAILED";
  receivedAt: string;
  attempts: number;
  summary: string;
}>;
export type BillingPreviewDto = Readonly<{
  mode: "synthetic";
  label: string;
  paymentInstrument: null;
  packages: readonly PackagePreviewDto[];
  orders: readonly OrderPreviewDto[];
  webhooks: readonly WebhookPreviewDto[];
}>;

export const packagesFixture: readonly PackagePreviewDto[] = [
  {
    id: "demo-package-01",
    name: "Essential",
    amountIdr: 99000,
    currency: "IDR",
    priceLabel: "Harga contoh",
    recommended: false,
    guestLimit: 150,
    galleryLimit: 10,
    features: ["Template editorial", "RSVP dan ucapan", "10 foto contoh"],
  },
  {
    id: "demo-package-02",
    name: "Signature",
    amountIdr: 149000,
    currency: "IDR",
    priceLabel: "Harga contoh",
    recommended: true,
    guestLimit: 300,
    galleryLimit: 20,
    features: ["Pilihan template", "Analitik contoh", "20 foto contoh"],
  },
  {
    id: "demo-package-03",
    name: "Premium",
    amountIdr: 249000,
    currency: "IDR",
    priceLabel: "Harga contoh",
    recommended: false,
    guestLimit: 500,
    galleryLimit: 40,
    features: ["Seluruh komposisi contoh", "40 foto contoh", "Tata letak video contoh"],
  },
];
const exampleOrder = {
  accountId: previewContext.accountId,
  invitationId: previewContext.invitationId,
  packageId: "demo-package-02",
  amountIdr: 149000,
  currency: "IDR" as const,
  synthetic: true as const,
};
export const ordersFixture: readonly OrderPreviewDto[] = [
  {
    ...exampleOrder,
    id: "demo-order-pending",
    status: "PENDING",
    createdAt: "2026-10-07T07:45:00.000Z",
    expiresAt: "2026-10-07T08:45:00.000Z",
    paidAt: null,
  },
  {
    ...exampleOrder,
    id: "demo-order-expired",
    status: "EXPIRED",
    createdAt: "2026-10-06T07:00:00.000Z",
    expiresAt: "2026-10-06T08:00:00.000Z",
    paidAt: null,
  },
  {
    ...exampleOrder,
    id: "demo-order-paid",
    status: "PAID",
    createdAt: "2026-10-05T07:00:00.000Z",
    expiresAt: "2026-10-05T08:00:00.000Z",
    paidAt: "2026-10-05T07:10:00.000Z",
  },
  {
    ...exampleOrder,
    id: "demo-order-failed",
    status: "FAILED",
    createdAt: "2026-10-04T07:00:00.000Z",
    expiresAt: "2026-10-04T08:00:00.000Z",
    paidAt: null,
  },
];
export const webhooksFixture: readonly WebhookPreviewDto[] = [
  {
    id: "demo-webhook-01",
    orderId: "demo-order-paid",
    eventType: "PAYMENT_PAID_EXAMPLE",
    status: "PROCESSED",
    receivedAt: "2026-10-05T07:10:00.000Z",
    attempts: 1,
    summary: "Simulasi event; bukan verifikasi Mayar",
  },
  {
    id: "demo-webhook-02",
    orderId: "demo-order-paid",
    eventType: "PAYMENT_PAID_EXAMPLE",
    status: "DUPLICATE",
    receivedAt: "2026-10-05T07:11:00.000Z",
    attempts: 1,
    summary: "Contoh event duplikat; tidak mengubah entitlement",
  },
  {
    id: "demo-webhook-03",
    orderId: "demo-order-failed",
    eventType: "PAYMENT_PAID_EXAMPLE",
    status: "FAILED",
    receivedAt: "2026-10-04T07:10:00.000Z",
    attempts: 3,
    summary: "Contoh kegagalan rekonsiliasi; retry tidak menjalankan provider",
  },
];
export const billingFixture: BillingPreviewDto = {
  mode: "synthetic",
  label: "Harga dan transaksi contoh — pembayaran tidak aktif",
  paymentInstrument: null,
  packages: packagesFixture,
  orders: ordersFixture,
  webhooks: webhooksFixture,
};
export const pendingOrderFixture = ordersFixture[0];
export const expiredOrderFixture = ordersFixture[1];
export const paymentStatusLabels: Readonly<Record<PaymentPreviewStatus, string>> = {
  PENDING: "Menunggu (contoh)",
  PAID: "Dibayar (contoh)",
  EXPIRED: "Kedaluwarsa (contoh)",
  FAILED: "Gagal (contoh)",
};
