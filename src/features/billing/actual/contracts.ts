/** DTO eksplisit untuk workspace aktual; tidak memakai fixture preview/provider. */
export type TestRequestStatus = "REQUESTED" | "APPROVED_TEST" | "REJECTED";
export type BillingDraft = Readonly<{ id: string; title: string }>;
export type TestRequestDto = Readonly<{
  id: string;
  invitationId: string;
  invitationTitle: string;
  packageSlug: string;
  amountIdr: number;
  status: TestRequestStatus;
  reference: string | null;
  createdAt: string;
  reviewedAt: string | null;
}>;
export type AdminTestRequestDto = TestRequestDto &
  Readonly<{
    customerEmail: string;
    reviewedByUserId: string | null;
  }>;
export const testStatusLabel: Record<TestRequestStatus, string> = {
  REQUESTED: "Menunggu review uji",
  APPROVED_TEST: "Persetujuan uji",
  REJECTED: "Permintaan uji ditolak",
};
export const qrisWarning =
  "QRIS statis untuk pengujian — pemindaian dapat memindahkan dana nyata. Tidak ada verifikasi otomatis Mayar.";
export function formatTestIdr(amountIdr: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amountIdr);
}
