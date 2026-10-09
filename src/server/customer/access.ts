import "server-only";
import { isClientRole } from "../authorization/roles";
import { getVerifiedSession } from "@/server/authorization/session";
import { WorkspaceError } from "@/server/invitations/errors";
import type { VerifiedSession } from "@/server/authorization/session";
export async function verifyWorkspaceRole(role: VerifiedSession["role"]) {
  const session = await getVerifiedSession();
  if (
    !session ||
    !Number.isSafeInteger(session.expiresAt) ||
    session.expiresAt <= Date.now() ||
    !session.userId
  )
    throw new WorkspaceError(401, "Silakan masuk kembali.");
  if (role === "CLIENT" ? !isClientRole(session.role) : session.role !== role)
    throw new WorkspaceError(403, "Akses ditolak.");
  return session;
}
