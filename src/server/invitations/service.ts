import "server-only";
import { verifyWorkspaceRole } from "@/server/customer/access";
import { createInvitationSchema, updateInvitationSchema } from "./input";
import { WorkspaceError, unavailable } from "./errors";
import * as repository from "./repository";
async function customerOperation<T>(operation: (userId: string) => Promise<T>): Promise<T> {
  const session = await verifyWorkspaceRole("CUSTOMER");
  try {
    return await operation(session.userId);
  } catch (error) {
    unavailable(error);
  }
}
export const listCustomerInvitations = () => customerOperation(repository.listOwnedInvitations);
export const listCustomerTemplates = () => customerOperation(() => repository.listDraftTemplates());
export function getCustomerInvitation(id: string) {
  return customerOperation(async (userId) => {
    const row = await repository.findOwnedInvitation(userId, id);
    if (!row) throw new WorkspaceError(404, "Undangan tidak ditemukan.");
    return row;
  });
}
export function createCustomerInvitation(raw: unknown) {
  return customerOperation((userId) => {
    const input = createInvitationSchema.safeParse(raw);
    if (!input.success)
      throw new WorkspaceError(
        400,
        "Data undangan tidak valid. Periksa judul, alamat dan tanggal.",
      );
    return repository.createOwnedDraft(userId, input.data);
  });
}
export function updateCustomerInvitation(id: string, raw: unknown) {
  return customerOperation((userId) => {
    const input = updateInvitationSchema.safeParse(raw);
    if (!input.success)
      throw new WorkspaceError(400, "Data editor tidak valid. Periksa isian yang didukung.");
    return repository.updateOwnedDraft(userId, id, input.data);
  });
}
export const deleteCustomerInvitation = (id: string) =>
  customerOperation((userId) => repository.deleteOwnedDraft(userId, id));
