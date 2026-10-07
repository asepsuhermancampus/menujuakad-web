import { rsvpFixture, type RsvpSummaryDto } from "./guests-fixtures";
import { giftsFixture } from "./gifts-fixtures";
import { wishesFixture } from "./wishes-fixtures";
import { previewContext } from "./fixture-context";

export type AnalyticsPreviewDto = Readonly<{
  invitationId: string;
  period: Readonly<{ from: string; to: string }>;
  pageViews: number;
  uniqueVisitors: number;
  rsvp: RsvpSummaryDto;
  visibleWishes: number;
  declaredEnvelopeAmountIdr: number;
  daily: readonly Readonly<{ date: string; pageViews: number; uniqueVisitors: number }>[];
  sources: readonly Readonly<{ label: string; visitors: number }>[];
}>;
const daily = [
  { date: "2026-10-01", pageViews: 35, uniqueVisitors: 21 },
  { date: "2026-10-02", pageViews: 48, uniqueVisitors: 28 },
  { date: "2026-10-03", pageViews: 64, uniqueVisitors: 35 },
  { date: "2026-10-04", pageViews: 42, uniqueVisitors: 24 },
  { date: "2026-10-05", pageViews: 77, uniqueVisitors: 40 },
  { date: "2026-10-06", pageViews: 96, uniqueVisitors: 47 },
  { date: "2026-10-07", pageViews: 58, uniqueVisitors: 32 },
] as const;
/** Pengunjung unik periode tidak dijumlah dari harian karena satu orang bisa kembali. */
export const analyticsFixture: AnalyticsPreviewDto = {
  invitationId: previewContext.invitationId,
  period: { from: "2026-10-01T00:00:00.000Z", to: previewContext.now },
  pageViews: daily.reduce((sum, day) => sum + day.pageViews, 0),
  uniqueVisitors: 180,
  rsvp: rsvpFixture,
  visibleWishes: wishesFixture.filter((wish) => wish.status === "VISIBLE").length,
  declaredEnvelopeAmountIdr: giftsFixture
    .filter((gift) => gift.kind === "ENVELOPE")
    .reduce((sum, gift) => sum + gift.amountIdr, 0),
  daily,
  sources: [
    { label: "Tautan langsung (contoh)", visitors: 110 },
    { label: "Media sosial (contoh)", visitors: 50 },
    { label: "Lainnya (contoh)", visitors: 20 },
  ],
};
