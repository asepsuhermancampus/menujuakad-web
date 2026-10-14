import "server-only";
import type { Prisma } from "@/generated/prisma/client";

/*
 * DTO tamu: bentuk yang dikirim ke UI. `rsvp` dinormalisasi menjadi objek
 * ringkas (status + jumlah hadir) agar UI tidak perlu tahu bentuk baris DB.
 * `personalToken` ikut karena hanya pemilik undangan yang menerima DTO ini
 * (rute customer ber-guard) dan pemilik memang harus dapat membagikan ulang
 * tautan RSVP personal tamunya. Jalur publik tidak memakai DTO ini.
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
  guestInvitation: {
    select: { personalToken: true, sentAt: true, openedAt: true, lastOpenedAt: true },
  },
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
    /*
     * Tautan RSVP personal dibutuhkan pemilik untuk dibagikan ulang. Hanya
     * rute customer ber-guard yang menerima DTO ini; jalur publik memakai
     * payload minimal sendiri.
     */
    personalToken: row.guestInvitation?.personalToken ?? null,
    /* Status pengiriman/pembukaan tautan oleh tamu. */
    delivery: {
      sent: Boolean(row.guestInvitation?.sentAt),
      opened: Boolean(row.guestInvitation?.openedAt),
      lastOpenedAt: row.guestInvitation?.lastOpenedAt?.toISOString() ?? null,
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

/*
 * Ucapan/doa yang tersimpan bersama respons tamu (`RsvpResponse.message`).
 * Skema belum punya kolom visibilitas, jadi daftar ini hanya-baca: tidak ada
 * tindakan menyembunyikan/menghapus yang bisa diklaim.
 */
export type WishDto = {
  guestId: string;
  guestName: string;
  category: GuestDto["category"];
  message: string;
  status: NonNullable<GuestDto["rsvp"]>["status"];
  guestCount: number;
  respondedAt: string | null;
};
