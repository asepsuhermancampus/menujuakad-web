import { previewContext } from "./fixture-context";

export type WishPreviewDto = Readonly<{
  id: string;
  invitationId: string;
  guestId: string;
  guestLabel: string;
  message: string;
  status: "VISIBLE" | "HIDDEN";
  createdAt: string;
}>;
export const wishesFixture: readonly WishPreviewDto[] = [
  {
    id: "demo-wish-01",
    invitationId: previewContext.invitationId,
    guestId: "demo-guest-001",
    guestLabel: "Tamu Contoh 001",
    message: "Semoga perjalanan bersama selalu dipenuhi kebaikan dan kebahagiaan.",
    status: "VISIBLE",
    createdAt: "2026-10-06T08:00:00.000Z",
  },
  {
    id: "demo-wish-02",
    invitationId: previewContext.invitationId,
    guestId: "demo-guest-002",
    guestLabel: "Tamu Contoh 002",
    message: "Selamat menempuh cerita baru. Doa terbaik untuk kalian.",
    status: "VISIBLE",
    createdAt: "2026-10-06T09:00:00.000Z",
  },
  {
    id: "demo-wish-03",
    invitationId: previewContext.invitationId,
    guestId: "demo-guest-003",
    guestLabel: "Tamu Contoh 003",
    message: "Ucapan contoh yang disembunyikan untuk pratinjau moderasi.",
    status: "HIDDEN",
    createdAt: "2026-10-06T10:00:00.000Z",
  },
];
