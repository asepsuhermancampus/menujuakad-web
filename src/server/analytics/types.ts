import "server-only";
import type { InvitationStatus, PaymentTestStatus } from "@/generated/prisma/client";
import type { AnalyticsPeriod } from "./input";
export type AnalyticsWindow = Readonly<{ period: AnalyticsPeriod; from: Date | null; to: Date }>;
export type AnalyticsGroups = {
  invitations: { status: InvitationStatus; _count: { _all: number } }[];
  payments: {
    status: PaymentTestStatus;
    _count: { _all: number };
    _sum: { amountIdr: number | null };
  }[];
};
export type CustomerAnalyticsDto = Readonly<{
  period: AnalyticsPeriod;
  fromUtc: string | null;
  toUtc: string;
  invitations: { total: number; draft: number; other: number };
  paymentTests: {
    total: number;
    amountIdr: number;
    byStatus: Record<PaymentTestStatus, { count: number; amountIdr: number }>;
  };
}>;
