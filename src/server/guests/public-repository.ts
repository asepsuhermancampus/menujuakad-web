import "server-only";
import { getPrisma } from "@/server/db/client";
import { WorkspaceError } from "@/server/invitations/errors";
import type { PublicRsvpInput } from "./public-input";

/*
 * Jalur publik (tanpa sesi): hanya bisa disentuh lewat token personal yang
 * cocok persis. Token adalah kapabilitas acak 32 byte; tidak ada pencarian
 * berdasarkan nama/ID dan tidak ada operasi lintas undangan.
 *
 * `openedAt` diisi saat tamu pertama membuka tautan; `lastOpenedAt` selalu
 * diperbarui. `sentAt` sengaja tidak diubah di sini karena berarti "sudah
 * dikirim" (bukti pengiriman, bukan bukti dibuka).
 *
 * Respons yang dikembalikan ke jalur publik sengaja minimal (status, jumlah,
 * waktu) — catatan privat pemilik dan kontak tamu tidak pernah ikut.
 */

/* Satu query: token -> konteks tamu + undangan + respons yang sudah ada. */
async function findByToken(personalToken: string) {
  const row = await getPrisma().guestInvitation.findUnique({
    where: { personalToken },
    select: {
      openedAt: true,
      guest: {
        select: {
          id: true,
          name: true,
          guestCountAllowed: true,
          status: true,
          rsvpResponse: {
            select: { status: true, guestCount: true, message: true, respondedAt: true },
          },
          invitation: {
            select: { id: true, title: true, weddingDate: true, isPublished: true },
          },
        },
      },
    },
  });
  if (!row || row.guest.status !== "ACTIVE") return null;
  /* Undangan yang belum diterbitkan tidak boleh menerima RSVP publik. */
  if (!row.guest.invitation.isPublished) return null;
  return row;
}

export async function getPublicRsvpContext(personalToken: string) {
  const row = await findByToken(personalToken);
  if (!row)
    throw new WorkspaceError(404, "Tautan undangan tidak ditemukan atau sudah tidak berlaku.");
  const guest = row.guest;
  /* Tandai dibuka; kegagalan pencatatan tidak boleh menggagalkan halaman. */
  await getPrisma()
    .guestInvitation.update({
      where: { personalToken },
      data: { openedAt: row.openedAt ?? new Date(), lastOpenedAt: new Date() },
      select: { id: true },
    })
    .catch(() => undefined);
  return {
    guestName: guest.name,
    invitationTitle: guest.invitation.title,
    weddingDate: guest.invitation.weddingDate?.toISOString().slice(0, 10) ?? null,
    guestCountAllowed: guest.guestCountAllowed,
    rsvp: guest.rsvpResponse
      ? {
          status: guest.rsvpResponse.status,
          guestCount: guest.rsvpResponse.guestCount,
          message: guest.rsvpResponse.message,
          respondedAt: guest.rsvpResponse.respondedAt?.toISOString() ?? null,
        }
      : null,
  };
}

/*
 * Tamu mengirim/mengganti responsnya. Semua nilai identitas (guestId,
 * invitationId) diambil dari token di server; body tidak bisa menimpanya.
 * Jumlah hadir dibatasi alokasi kursi tamu.
 */
export async function submitPublicRsvp(personalToken: string, input: PublicRsvpInput) {
  const row = await findByToken(personalToken);
  if (!row)
    throw new WorkspaceError(404, "Tautan undangan tidak ditemukan atau sudah tidak berlaku.");
  const guest = row.guest;
  if (input.status === "ATTENDING" && input.guestCount > guest.guestCountAllowed)
    throw new WorkspaceError(
      400,
      `Jumlah hadir melebihi alokasi kursi untuk tamu ini (${guest.guestCountAllowed} orang).`,
    );
  const respondedAt = new Date();
  await getPrisma().$transaction(async (tx) => {
    await tx.rsvpResponse.upsert({
      where: { guestId: guest.id },
      create: {
        invitationId: guest.invitation.id,
        guestId: guest.id,
        status: input.status,
        guestCount: input.status === "ATTENDING" ? input.guestCount : 0,
        phone: input.phone,
        message: input.message,
        respondedAt,
      },
      update: {
        status: input.status,
        guestCount: input.status === "ATTENDING" ? input.guestCount : 0,
        phone: input.phone,
        message: input.message,
        respondedAt,
      },
      select: { id: true },
    });
    await tx.guestInvitation.update({
      where: { personalToken },
      data: { lastOpenedAt: respondedAt },
      select: { id: true },
    });
  });
  return {
    status: input.status,
    guestCount: input.status === "ATTENDING" ? input.guestCount : 0,
    respondedAt: respondedAt.toISOString(),
  };
}
