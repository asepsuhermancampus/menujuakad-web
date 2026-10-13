import "server-only";
import type { Prisma } from "@/generated/prisma/client";

/*
 * DTO tamu: bentuk yang dikirim ke UI. `rsvp` dinormalisasi menjadi objek
 * ringkas (status + jumlah hadir) agar UI tidak perlu tahu bentuk baris DB.
 */
export const guestSelect = {
  id: true,
  name: true,
  phone: true,
  email: true,
  category: true,
  guestCountAllowed: true,
  notes: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  rsvpResponse: { select: { status: true, guestCount: true, respondedAt: true } },
  guestInvitation: { select: { personalToken: true, sentAt: true, openedAt: true } },
} satisfies Prisma.GuestSelect;

type GuestRecord = Prisma.GuestGetPayload<{ select: typeof guestSelect }>;

export function guestDto(row: GuestRecord) {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    category: row.category,
    guestCountAllowed: row.guestCountAllowed,
    notes: row.notes,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    rsvp: row.rsvpResponse
      ? {
          status: row.rsvpResponse.status,
          guestCount: row.rsvpResponse.guestCount,
          respondedAt: row.rsvpResponse.respondedAt?.toISOString() ?? null,
        }
      : null,
    /* Token personal tidak dikirim ke klien; hanya status pengiriman. */
    delivery: {
      sent: Boolean(row.guestInvitation?.sentAt),
      opened: Boolean(row.guestInvitation?.openedAt),
    },
  };
}

export type GuestDto = ReturnType<typeof guestDto>;

/*
 * Ringkasan mengikuti kartu ringkasan GST-01: terdaftar, kursi teralokasi,
 * respons per status, dan tingkat kehadiran. Semua angka dihitung dari baris
 * nyata, bukan fixture.
 */
export function summarizeGuests(rows: GuestRecord[]) {
  const count = (status: string) => rows.filter((row) => row.rsvpResponse?.status === status).length;
  const seats = rows.reduce((total, row) => total + row.guestCountAllowed, 0);
  const attendingSeats = rows
    .filter((row) => row.rsvpResponse?.status === "ATTENDING")
    .reduce((total, row) => total + (row.rsvpResponse?.guestCount ?? 0), 0);
  const responded = rows.filter((row) => row.rsvpResponse?.respondedAt).length;
  return {
    registered: rows.length,
    seats,
    attending: count("ATTENDING"),
    declining: count("NOT_ATTENDING"),
    maybe: count("MAYBE"),
    pending: count("PENDING") + rows.filter((row) => !row.rsvpResponse).length,
    attendingSeats,
    responded,
    attendanceRatePercent: rows.length ? Math.round((count("ATTENDING") / rows.length) * 100) : 0,
  };
}

export type GuestSummaryDto = ReturnType<typeof summarizeGuests>;
