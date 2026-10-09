import "server-only";
import { verifyWorkspaceRole } from "@/server/customer/access";
import { unavailable } from "@/server/invitations/errors";
import { readTestUsers, readTestInvitations } from "./repository";
async function query<T>(page: number, read: (userId: string, page: number) => Promise<T>) {
  const session = await verifyWorkspaceRole("SUPERADMIN");
  const bounded = Number.isSafeInteger(page) ? Math.max(1, Math.min(page, 10000)) : 1;
  try {
    return await read(session.userId, bounded);
  } catch (error) {
    unavailable(error);
  }
}
export const getAdminUsers = (page = 1) => query(page, readTestUsers);
export const getAdminInvitations = (page = 1) => query(page, readTestInvitations);
