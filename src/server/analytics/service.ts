import "server-only";
import { PaymentTestStatus } from "@/generated/prisma/enums";
import type { AnalyticsPeriod } from "./input";
import type { AnalyticsGroups, AnalyticsWindow, CustomerAnalyticsDto } from "./types";
export function analyticsWindow(period: AnalyticsPeriod, now = new Date()): AnalyticsWindow {
  const to = new Date(now);
  const days = period === "7d" ? 7 : period === "30d" ? 30 : null;
  return { period, from: days === null ? null : new Date(to.getTime() - days * 86400000), to };
}
function safeInteger(value: number): number {
  if (!Number.isSafeInteger(value) || value < 0) throw new Error("Agregasi di luar rentang aman.");
  return value;
}
export function summarizeAnalytics(
  window: AnalyticsWindow,
  groups: AnalyticsGroups,
): CustomerAnalyticsDto {
  const invitations = { total: 0, draft: 0, other: 0 };
  for (const row of groups.invitations) {
    const count = safeInteger(row._count._all);
    invitations.total = safeInteger(invitations.total + count);
    if (row.status === "DRAFT") invitations.draft = safeInteger(invitations.draft + count);
    else invitations.other = safeInteger(invitations.other + count);
  }
  const byStatus = Object.fromEntries(
    Object.values(PaymentTestStatus).map((status) => [status, { count: 0, amountIdr: 0 }]),
  ) as CustomerAnalyticsDto["paymentTests"]["byStatus"];
  const paymentTests = { total: 0, amountIdr: 0, byStatus };
  for (const row of groups.payments) {
    const count = safeInteger(row._count._all);
    const amountIdr = safeInteger(row._sum.amountIdr ?? 0);
    byStatus[row.status] = { count, amountIdr };
    paymentTests.total = safeInteger(paymentTests.total + count);
    paymentTests.amountIdr = safeInteger(paymentTests.amountIdr + amountIdr);
  }
  return {
    period: window.period,
    fromUtc: window.from?.toISOString() ?? null,
    toUtc: window.to.toISOString(),
    invitations,
    paymentTests,
  };
}
