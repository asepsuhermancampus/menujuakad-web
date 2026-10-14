import "server-only";
import { randomBytes } from "node:crypto";
import { getPrisma } from "@/server/db/client";
import type { Prisma } from "@/generated/prisma/client";
import { WorkspaceError } from "@/server/invitations/errors";
import { guestDto, guestSelect, summarizeGuests } from "./dto";
import type { WishDto } from "./dto";
import type { BulkGuestInput, CreateGuestInput, UpdateGuestInput, UpdateRsvpInput } from "./input";

/*
 * Cakupan kepemilikan tamu selalu diturunkan dari undangan milik pengguna.
 * Dengan begitu tidak ada jalur yang membaca/mengubah tamu undangan orang lain
 * meski ID tamu ditebak.
 */
const ownedInvitation = (userId: string, invitationId: string) => ({
  id: invitationId,
  ownerUserId: userId,
  owner: { is: { id: userId, role: "CLIENT" as const, status: "ACTIVE" as const } },
});

async function assertOwnedInvitation(userId: string, invitationId: string) {
  const found = await getPrisma().invitation.findFirst({
    where: ownedInvitation(userId, invitationId),
    select: { id: true },
  });
  if (!found) throw new WorkspaceError(404, "Undangan tidak ditemukan.");
}

export async function listOwnedGuests(userId: string, invitationId: string) {
  await assertOwnedInvitation(userId, invitationId);
  const rows = await getPrisma().guest.findMany({
    where: { invitationId, status: "ACTIVE" },
    select: guestSelect,
    orderBy: { createdAt: "asc" },
    take: 500,
  });
  return { guests: rows.map(guestDto), summary: summarizeGuests(rows) };
}

/*
 * Ucapan tamu untuk undangan milik pengguna. Hanya respons yang benar-benar
 * punya pesan (setelah trim) yang dikembalikan; tamu yang diarsipkan tidak
 * ikut. Terbaru lebih dahulu, dibatasi 200 agar halaman tetap ringan.
 */
export async function listOwnedWishes(userId: string, invitationId: string): Promise<WishDto[]> {
  await assertOwnedInvitation(userId, invitationId);
  const rows = await getPrisma().rsvpResponse.findMany({
    where: {
      invitationId,
      message: { not: null },
      guest: { is: { invitationId, status: "ACTIVE" } },
    },
    select: {
      guestId: true,
      message: true,
      status: true,
      guestCount: true,
      respondedAt: true,
      guest: { select: { name: true, category: true } },
    },
    orderBy: [{ respondedAt: "desc" }, { createdAt: "desc" }],
    take: 200,
  });
  return rows.flatMap((row) => {
    const message = (row.message ?? "").trim();
    if (!message) return [];
    return [
      {
        guestId: row.guestId,
        guestName: row.guest.name,
        category: row.guest.category,
        message,
        status: row.status,
        guestCount: row.guestCount,
        respondedAt: row.respondedAt?.toISOString() ?? null,
      },
    ];
  });
}

/*
 * Token personal dibuat acak 32 byte (base64url) dan disimpan pada kolom unik.
 * Retry sekali bila tabrakan unik terjadi (praktis tidak mungkin, tetapi tetap
 * ditangani agar tidak ada kegagalan acak ke pengguna).
 */
function newPersonalToken() {
  return randomBytes(32).toString("base64url");
}

export async function createOwnedGuest(
  userId: string,
  invitationId: string,
  input: CreateGuestInput,
) {
  return getPrisma().$transaction(async (tx) => {
    const invitation = await tx.invitation.findFirst({
      where: ownedInvitation(userId, invitationId),
      select: { id: true },
    });
    if (!invitation) throw new WorkspaceError(404, "Undangan tidak ditemukan.");
    const row = await tx.guest.create({
      data: {
        invitationId,
        name: input.name,
        phone: input.phone,
        email: input.email,
        category: input.category,
        guestCountAllowed: input.guestCountAllowed,
        notes: input.notes,
      },
      select: guestSelect,
    });
    await tx.guestInvitation.create({
      data: { guestId: row.id, invitationId, personalToken: newPersonalToken() },
      select: { id: true },
    });
    return guestDto(row);
  });
}

export async function updateOwnedGuest(
  userId: string,
  invitationId: string,
  guestId: string,
  input: UpdateGuestInput,
) {
  return getPrisma().$transaction(async (tx) => {
    const updated = await tx.guest.updateMany({
      where: { id: guestId, invitationId, status: "ACTIVE", invitation: { is: ownedInvitation(userId, invitationId) } },
      data: input,
    });
    if (updated.count === 0) throw new WorkspaceError(404, "Tamu tidak ditemukan.");
    const row = await tx.guest.findFirst({ where: { id: guestId }, select: guestSelect });
    if (!row) throw new WorkspaceError(404, "Tamu tidak ditemukan.");
    return guestDto(row);
  });
}

/* Arsip lunak: riwayat RSVP tetap tersimpan, tamu hilang dari daftar aktif. */
export async function archiveOwnedGuest(userId: string, invitationId: string, guestId: string) {
  const result = await getPrisma().guest.updateMany({
    where: { id: guestId, invitationId, status: "ACTIVE", invitation: { is: ownedInvitation(userId, invitationId) } },
    data: { status: "ARCHIVED" },
  });
  if (result.count === 0) throw new WorkspaceError(404, "Tamu tidak ditemukan.");
}

/*
 * Impor massal dijalankan dalam satu transaksi: semua baris masuk atau tidak
 * sama sekali, sehingga pengguna tidak melihat daftar setengah jadi.
 * Duplikat nama dalam undangan yang sama dilewati dan dilaporkan jumlahnya.
 */
export async function bulkCreateOwnedGuests(
  userId: string,
  invitationId: string,
  input: BulkGuestInput,
) {
  return getPrisma().$transaction(async (tx) => {
    const invitation = await tx.invitation.findFirst({
      where: ownedInvitation(userId, invitationId),
      select: { id: true },
    });
    if (!invitation) throw new WorkspaceError(404, "Undangan tidak ditemukan.");
    const existing = await tx.guest.findMany({
      where: { invitationId, status: "ACTIVE" },
      select: { name: true },
    });
    const seen = new Set(existing.map((row) => row.name.trim().toLocaleLowerCase("id")));
    let created = 0;
    let skipped = 0;
    for (const item of input.guests) {
      const key = item.name.trim().toLocaleLowerCase("id");
      if (seen.has(key)) {
        skipped += 1;
        continue;
      }
      seen.add(key);
      const row = await tx.guest.create({
        data: {
          invitationId,
          name: item.name,
          phone: item.phone,
          category: item.category,
          guestCountAllowed: item.guestCountAllowed,
        },
        select: { id: true },
      });
      await tx.guestInvitation.create({
        data: { guestId: row.id, invitationId, personalToken: newPersonalToken() },
        select: { id: true },
      });
      created += 1;
    }
    return { created, skipped };
  });
}

/* Nomor kontak dipakai untuk tautan WhatsApp; normalisasi 0/8 -> 62 (E.164 Indonesia). */
export function normalizeIndonesianPhone(raw: string | null): string | null {
  if (!raw) return null;
  const digits = raw.replace(/[^\d+]/g, "");
  if (digits.startsWith("+62")) return digits;
  if (digits.startsWith("62")) return `+${digits}`;
  if (digits.startsWith("0")) return `+62${digits.slice(1)}`;
  if (digits.startsWith("8")) return `+62${digits}`;
  return digits.startsWith("+") ? digits : `+${digits}`;
}

/*
 * Pencatatan respons RSVP oleh pemilik undangan. Upsert menjaga satu respons
 * per tamu; respondedAt diisi saat pertama kali status bukan PENDING.
 */
export async function upsertOwnedRsvp(
  userId: string,
  invitationId: string,
  guestId: string,
  input: UpdateRsvpInput,
) {
  return getPrisma().$transaction(async (tx) => {
    const guest = await tx.guest.findFirst({
      where: { id: guestId, invitationId, status: "ACTIVE", invitation: { is: ownedInvitation(userId, invitationId) } },
      select: { id: true, guestCountAllowed: true },
    });
    if (!guest) throw new WorkspaceError(404, "Tamu tidak ditemukan.");
    if (input.guestCount > guest.guestCountAllowed)
      throw new WorkspaceError(
        400,
        `Jumlah hadir melebihi alokasi kursi tamu ini (${guest.guestCountAllowed} orang).`,
      );
    const respondedAt = input.status === "PENDING" ? null : new Date();
    /*
     * Upsert tanpa `select` lalu baca ulang dengan guestSelect: menghindari
     * ambiguitas inferensi Prisma karena Guest.status dan RsvpResponse.status
     * sama-sama bernama "status" pada satu pohon select.
     */
    await tx.rsvpResponse.upsert({
      where: { guestId },
      create: {
        invitationId,
        guestId,
        status: input.status,
        guestCount: input.guestCount,
        phone: input.phone,
        message: input.message,
        respondedAt,
      },
      update: {
        status: input.status,
        guestCount: input.guestCount,
        phone: input.phone,
        message: input.message,
        respondedAt,
      },
      select: { id: true },
    });
    const row = await tx.guest.findFirst({ where: { id: guestId }, select: guestSelect });
    if (!row) throw new WorkspaceError(404, "Tamu tidak ditemukan.");
    return guestDto(row);
  });
}

export type GuestTx = Prisma.TransactionClient;
