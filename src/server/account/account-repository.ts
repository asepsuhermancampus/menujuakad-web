import "server-only";
import type { Prisma, User, UserSession } from "@/generated/prisma/client";
import { getPrisma } from "@/server/db/client";
import type { AuthSession } from "../auth/auth-service";
import { lockAuthUser } from "../auth/transaction-lock";
import { createSessionToken, hashSessionToken } from "../auth/session-crypto";
import { isAuthRole } from "../authorization/roles";
import { AccountError } from "./errors";
export type AccountTx = Prisma.TransactionClient;
export const recent = (at: Date | null) =>
  !!at && at.getTime() <= Date.now() && at.getTime() > Date.now() - 300000;
export async function boundAccount(tx: AccountTx, auth: AuthSession, fresh = true) {
  await lockAuthUser(tx, auth.userId);
  await tx.$queryRaw`SELECT "id" FROM "UserSession" WHERE "userId"=${auth.userId} AND "tokenHash"=${auth.tokenHash} FOR UPDATE`;
  const session = await tx.userSession.findUnique({
    where: { tokenHash: auth.tokenHash },
    include: { user: true },
  });
  if (
    !session ||
    session.id !== auth.sessionId ||
    session.userId !== auth.userId ||
    session.revokedAt ||
    session.expiresAt.getTime() <= Date.now() ||
    session.user.status !== "ACTIVE" ||
    !isAuthRole(session.user.role)
  )
    throw new AccountError(401, "SESSION_REQUIRED", "Silakan masuk kembali.");
  if (fresh && !recent(session.reauthenticatedAt))
    throw new AccountError(403, "REAUTH_REQUIRED", "Konfirmasi identitas terlebih dahulu.");
  return session;
}
export function accountTransaction<T>(
  auth: AuthSession,
  action: (tx: AccountTx, session: UserSession & { user: User }) => Promise<T>,
  fresh = true,
) {
  return getPrisma().$transaction(async (tx) => action(tx, await boundAccount(tx, auth, fresh)));
}
export async function revokeOthers(tx: AccountTx, session: UserSession) {
  return (
    await tx.userSession.updateMany({
      where: { userId: session.userId, id: { not: session.id }, revokedAt: null },
      data: { revokedAt: new Date() },
    })
  ).count;
}
export async function invalidateProofs(tx: AccountTx, userId: string) {
  await tx.authVerificationToken.updateMany({
    where: { userId, consumedAt: null },
    data: { consumedAt: new Date() },
  });
}
export async function rotateSession(
  tx: AccountTx,
  session: UserSession,
  reauthenticatedAt = session.reauthenticatedAt,
) {
  const token = createSessionToken();
  await tx.userSession.delete({ where: { id: session.id } });
  await tx.userSession.create({
    data: {
      userId: session.userId,
      tokenHash: hashSessionToken(token),
      expiresAt: session.expiresAt,
      reauthenticatedAt,
      lastSeenAt: session.lastSeenAt,
      userAgent: session.userAgent,
      ipHash: session.ipHash,
    },
  });
  return { token, expiresAt: session.expiresAt };
}
