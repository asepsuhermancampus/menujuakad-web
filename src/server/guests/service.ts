import "server-only";
import { verifyWorkspaceRole } from "@/server/customer/access";
import { WorkspaceError, unavailable } from "@/server/invitations/errors";
import {
  bulkGuestSchema,
  createGuestSchema,
  updateGuestSchema,
  updateRsvpSchema,
} from "./input";
import * as repository from "./repository";

/*
 * Setiap operasi tamu dimulai dari sesi CLIENT terverifikasi; kepemilikan
 * undangan diperiksa lagi di repository. Tidak ada jalur lintas akun.
 */
async function customerOperation<T>(operation: (userId: string) => Promise<T>): Promise<T> {
  const session = await verifyWorkspaceRole("CLIENT");
  try {
    return await operation(session.userId);
  } catch (error) {
    unavailable(error);
  }
}

export const listGuests = (invitationId: string) =>
  customerOperation((userId) => repository.listOwnedGuests(userId, invitationId));

export function createGuest(invitationId: string, raw: unknown) {
  return customerOperation((userId) => {
    const input = createGuestSchema.safeParse(raw);
    if (!input.success) throw new WorkspaceError(400, "Data tamu tidak valid. Periksa nama dan kontak.");
    return repository.createOwnedGuest(userId, invitationId, input.data);
  });
}

export function updateGuest(invitationId: string, guestId: string, raw: unknown) {
  return customerOperation((userId) => {
    const input = updateGuestSchema.safeParse(raw);
    if (!input.success) throw new WorkspaceError(400, "Perubahan tamu tidak valid.");
    return repository.updateOwnedGuest(userId, invitationId, guestId, input.data);
  });
}

export const archiveGuest = (invitationId: string, guestId: string) =>
  customerOperation((userId) => repository.archiveOwnedGuest(userId, invitationId, guestId));

export function bulkCreateGuests(invitationId: string, raw: unknown) {
  return customerOperation((userId) => {
    const input = bulkGuestSchema.safeParse(raw);
    if (!input.success)
      throw new WorkspaceError(400, "Data impor tidak valid. Periksa format nama dan kategori.");
    return repository.bulkCreateOwnedGuests(userId, invitationId, input.data);
  });
}

export function updateRsvp(invitationId: string, guestId: string, raw: unknown) {
  return customerOperation((userId) => {
    const input = updateRsvpSchema.safeParse(raw);
    if (!input.success) throw new WorkspaceError(400, "Data RSVP tidak valid.");
    return repository.upsertOwnedRsvp(userId, invitationId, guestId, input.data);
  });
}
