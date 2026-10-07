import { previewContext } from "./fixture-context";

/** DECLARED = laporan pengirim sintetis, tidak membuktikan transfer bank diterima. */
export type GiftPreviewDto = Readonly<{
  id: string;
  invitationId: string;
  guestId: string;
  guestLabel: string;
  kind: "ENVELOPE" | "PHYSICAL";
  amountIdr: number;
  currency: "IDR";
  status: "DECLARED";
  note: string;
  createdAt: string;
}>;
export const giftsFixture: readonly GiftPreviewDto[] = [
  {
    id: "demo-gift-01",
    invitationId: previewContext.invitationId,
    guestId: "demo-guest-001",
    guestLabel: "Tamu Contoh 001",
    kind: "ENVELOPE",
    amountIdr: 250000,
    currency: "IDR",
    status: "DECLARED",
    note: "Laporan amplop contoh; tidak diverifikasi bank",
    createdAt: "2026-10-06T08:05:00.000Z",
  },
  {
    id: "demo-gift-02",
    invitationId: previewContext.invitationId,
    guestId: "demo-guest-002",
    guestLabel: "Tamu Contoh 002",
    kind: "ENVELOPE",
    amountIdr: 150000,
    currency: "IDR",
    status: "DECLARED",
    note: "Laporan amplop contoh; tidak diverifikasi bank",
    createdAt: "2026-10-06T09:05:00.000Z",
  },
  {
    id: "demo-gift-03",
    invitationId: previewContext.invitationId,
    guestId: "demo-guest-003",
    guestLabel: "Tamu Contoh 003",
    kind: "PHYSICAL",
    amountIdr: 0,
    currency: "IDR",
    status: "DECLARED",
    note: "Hadiah fisik contoh tanpa taksiran uang",
    createdAt: "2026-10-06T10:05:00.000Z",
  },
];
export const giftSettingsFixture = {
  enabled: false,
  bankLabel: "Rekening contoh tidak tersedia",
  accountNumber: null,
  shippingAddress: null,
  paymentQr: null,
} as const;
