import { previewContext } from "./fixture-context";

export type RsvpStatus = "ATTENDING" | "NOT_ATTENDING" | "MAYBE" | "PENDING";
export type GuestPreviewDto = Readonly<{
  id: string;
  invitationId: string;
  displayName: string;
  group: "FAMILY" | "FRIENDS" | "COLLEAGUES";
  rsvpStatus: RsvpStatus;
  partySize: number;
  deliveryStatus: "NOT_SENT" | "SENT_EXAMPLE";
  respondedAt: string | null;
}>;
export type RsvpSummaryDto = Readonly<{
  total: number;
  attending: number;
  declining: number;
  maybe: number;
  pending: number;
  attendanceRatePercent: number;
}>;

/** 120 identitas buatan, tanpa nomor telepon, email, guest token, atau tautan personal. */
export const guestsFixture: readonly GuestPreviewDto[] = Array.from({ length: 120 }, (_, index) => {
  const number = index + 1;
  const rsvpStatus: RsvpStatus =
    number <= 68
      ? "ATTENDING"
      : number <= 88
        ? "NOT_ATTENDING"
        : number <= 100
          ? "MAYBE"
          : "PENDING";
  return {
    id: `demo-guest-${String(number).padStart(3, "0")}`,
    invitationId: previewContext.invitationId,
    displayName: `Tamu Contoh ${String(number).padStart(3, "0")}`,
    group: number <= 40 ? "FAMILY" : number <= 80 ? "FRIENDS" : "COLLEAGUES",
    rsvpStatus,
    partySize: 1,
    deliveryStatus: rsvpStatus === "PENDING" ? "NOT_SENT" : "SENT_EXAMPLE",
    respondedAt: rsvpStatus === "PENDING" ? null : "2026-10-06T08:00:00.000Z",
  };
});
export const emptyGuestsFixture: readonly GuestPreviewDto[] = [];
const countStatus = (status: RsvpStatus) =>
  guestsFixture.filter((guest) => guest.rsvpStatus === status).length;
/** Denominator = tamu terdaftar, bukan jumlah respons atau jumlah pendamping. */
export const rsvpFixture: RsvpSummaryDto = {
  total: guestsFixture.length,
  attending: countStatus("ATTENDING"),
  declining: countStatus("NOT_ATTENDING"),
  maybe: countStatus("MAYBE"),
  pending: countStatus("PENDING"),
  attendanceRatePercent: Math.round((countStatus("ATTENDING") / guestsFixture.length) * 100),
};
export const rsvpStatusLabels: Readonly<Record<RsvpStatus, string>> = {
  ATTENDING: "Hadir",
  NOT_ATTENDING: "Tidak hadir",
  MAYBE: "Masih ragu",
  PENDING: "Belum menjawab",
};
export type GuestImportRowDto = Readonly<{
  rowNumber: number;
  displayName: string;
  group: GuestPreviewDto["group"];
  status: "VALID" | "DUPLICATE" | "INVALID";
  issue: string | null;
}>;
export const guestImportFixture: readonly GuestImportRowDto[] = [
  {
    rowNumber: 1,
    displayName: "Tamu Contoh Impor 001",
    group: "FAMILY",
    status: "VALID",
    issue: null,
  },
  {
    rowNumber: 2,
    displayName: "Tamu Contoh 001",
    group: "FAMILY",
    status: "DUPLICATE",
    issue: "Nama contoh sudah ada",
  },
  { rowNumber: 3, displayName: "", group: "FRIENDS", status: "INVALID", issue: "Nama wajib diisi" },
];
