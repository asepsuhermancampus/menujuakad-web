import type {
  OrderPreviewDto,
  PaymentPreviewStatus,
  WebhookPreviewDto,
} from "@/features/design-preview/data/fixtures";
import { paymentStatusLabels } from "@/features/design-preview/data/fixtures";

export type CheckoutStatus = PaymentPreviewStatus | "UNAVAILABLE";
export function checkoutState(
  order: OrderPreviewDto,
  now: string,
  initialExpired = false,
): { status: CheckoutStatus; remainingSeconds: number } {
  // Terminal records cannot be reopened by the preview's state selector.
  if (order.status !== "PENDING") return { status: order.status, remainingSeconds: 0 };
  if (initialExpired) return { status: "EXPIRED", remainingSeconds: 0 };
  const deadline = Date.parse(order.expiresAt);
  const clock = Date.parse(now);
  if (!Number.isFinite(deadline) || !Number.isFinite(clock))
    return { status: "UNAVAILABLE", remainingSeconds: 0 };
  const remainingSeconds = Math.max(0, Math.floor((deadline - clock) / 1000));
  return { status: remainingSeconds > 0 ? "PENDING" : "EXPIRED", remainingSeconds };
}
export function formatRemaining(value: number): string {
  const seconds = Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}
export function formatIdr(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}
export function formatExampleTime(value: string): string {
  if (!Number.isFinite(Date.parse(value))) return "Waktu contoh tidak tersedia";
  return `${new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", dateStyle: "medium", timeStyle: "short" }).format(new Date(value))} WIB`;
}
export function paymentStatusMessage(status: CheckoutStatus): string {
  const label = status === "UNAVAILABLE" ? "Waktu tidak tersedia" : paymentStatusLabels[status];
  return `${label}. Status hanya data contoh. Tidak menerbitkan entitlement atau mengaktifkan undangan. Provider belum terhubung.`;
}
export function orderMetrics(orders: readonly OrderPreviewDto[]) {
  return {
    paidAmountIdr: orders
      .filter((o) => o.status === "PAID")
      .reduce((sum, o) => sum + o.amountIdr, 0),
    paid: orders.filter((o) => o.status === "PAID").length,
    pending: orders.filter((o) => o.status === "PENDING").length,
    review: orders.filter((o) => o.status === "FAILED" || o.status === "EXPIRED").length,
  };
}
export function webhookMetrics(events: readonly WebhookPreviewDto[]) {
  return {
    total: events.length,
    processed: events.filter((e) => e.status === "PROCESSED").length,
    duplicate: events.filter((e) => e.status === "DUPLICATE").length,
    failed: events.filter((e) => e.status === "FAILED").length,
  };
}
export function filterOrders(
  orders: readonly OrderPreviewDto[],
  status: PaymentPreviewStatus | "ALL",
  query: string,
) {
  const search = query.trim().toLowerCase();
  return orders.filter(
    (o) =>
      (status === "ALL" || o.status === status) &&
      `${o.id} ${o.invitationId} ${o.packageId}`.toLowerCase().includes(search),
  );
}
export function filterWebhooks(
  events: readonly WebhookPreviewDto[],
  status: WebhookPreviewDto["status"] | "ALL",
  query: string,
) {
  const search = query.trim().toLowerCase();
  return events.filter(
    (e) =>
      (status === "ALL" || e.status === status) &&
      `${e.id} ${e.orderId} ${e.eventType}`.toLowerCase().includes(search),
  );
}
export function paginate<T>(rows: readonly T[], requestedPage: number, requestedSize: number) {
  const size = Number.isFinite(requestedSize) ? Math.max(1, Math.floor(requestedSize)) : 2;
  const pages = Math.max(1, Math.ceil(rows.length / size));
  const page = Number.isFinite(requestedPage)
    ? Math.min(pages, Math.max(1, Math.floor(requestedPage)))
    : 1;
  return { rows: rows.slice((page - 1) * size, page * size), page, pages, total: rows.length };
}
export const webhookStatusLabels: Record<WebhookPreviewDto["status"], string> = {
  PROCESSED: "Diproses (contoh)",
  DUPLICATE: "Duplikat (contoh)",
  FAILED: "Gagal (contoh)",
};
