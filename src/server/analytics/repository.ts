import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { getPrisma } from "@/server/db/client";
import { WorkspaceError } from "@/server/invitations/errors";
import type { AnalyticsGroups, AnalyticsWindow } from "./types";
export async function readOwnedAnalytics(
  userId: string,
  window: AnalyticsWindow,
): Promise<AnalyticsGroups> {
  const createdAt = { ...(window.from ? { gte: window.from } : {}), lte: window.to };
  const identity: Prisma.UserWhereInput = {
    id: userId,
    role: "CLIENT",
    status: "ACTIVE",
  };
  return getPrisma().$transaction(async (tx) => {
    const user = await tx.user.findFirst({ where: identity, select: { id: true } });
    if (!user) throw new WorkspaceError(403, "Akses ditolak.");
    // Agregasi seluruh cakupan, tanpa batas 100 row seperti daftar dashboard.
    const invitations = await tx.invitation.groupBy({
      by: ["status"],
      where: { ownerUserId: userId, owner: { is: identity }, createdAt },
      _count: { _all: true },
    });
    const payments = await tx.paymentTestRequest.groupBy({
      by: ["status"],
      where: {
        userId,
        user: { is: identity },
        invitation: { is: { ownerUserId: userId, owner: { is: identity } } },
        createdAt,
      },
      _count: { _all: true },
      _sum: { amountIdr: true },
    });
    return { invitations, payments };
  });
}
