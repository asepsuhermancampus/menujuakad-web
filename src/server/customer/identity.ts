import "server-only";
import { getPrisma } from "@/server/db/client";
import { verifyWorkspaceRole } from "./access";
import { WorkspaceError, unavailable } from "@/server/invitations/errors";
export async function getWorkspaceIdentity(role: "CUSTOMER" | "SUPERADMIN") {
  const session = await verifyWorkspaceRole(role);
  try {
    const user = await getPrisma().user.findFirst({
      where: {
        id: session.userId,
        role: role === "CUSTOMER" ? { in: ["CUSTOMER", "CLIENT"] } : role,
        status: "ACTIVE",
      },
      select: { name: true, email: true, phone: true },
    });
    if (!user) throw new WorkspaceError(403, "Akses ditolak.");
    return user;
  } catch (error) {
    unavailable(error);
  }
}
export type WorkspaceIdentity = {
  name: string | null;
  email: string | null;
  phone?: string | null;
};
