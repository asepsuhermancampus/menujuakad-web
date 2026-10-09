import "server-only";
import { getPrisma } from "../db/client";
import { lockAuthIdentifier, lockAuthUser } from "./transaction-lock";
import type { OAuthState } from "./oauth-state";
import type { VerifiedGoogleIdentity } from "./google-provider";
import { GoogleFlowError } from "./google-errors";
import { isAuthRole } from "../authorization/roles";
import { resolvePostLoginRedirect } from "../authorization/redirect-policy";
import { createSessionToken, hashSessionToken } from "./session-crypto";
import { SESSION_MAX_AGE } from "./auth-service";
import type { Prisma } from "@/generated/prisma/client";
export function isRecentAuthentication(at: Date | null | undefined): boolean {
  const now = Date.now();
  return !!at && at.getTime() <= now && at.getTime() > now - 300000;
}
async function boundSession(tx: Prisma.TransactionClient, state: OAuthState) {
  if (!state.userId || !state.sessionHash)
    throw new GoogleFlowError("SESSION_REQUIRED", "/account/security");
  await lockAuthUser(tx, state.userId);
  await tx.$queryRaw`SELECT "id" FROM "UserSession" WHERE "tokenHash"=${state.sessionHash} AND "userId"=${state.userId} FOR UPDATE`;
  const session = await tx.userSession.findUnique({
    where: { tokenHash: state.sessionHash },
    include: { user: true },
  });
  if (
    !session ||
    session.userId !== state.userId ||
    session.revokedAt ||
    session.expiresAt.getTime() <= Date.now() ||
    session.user.status !== "ACTIVE" ||
    !isAuthRole(session.user.role)
  )
    throw new GoogleFlowError("SESSION_REQUIRED", "/account/security");
  if (state.intent === "link" && !isRecentAuthentication(session.reauthenticatedAt))
    throw new GoogleFlowError("REAUTH_REQUIRED", "/account/security");
  return session;
}
export async function persistGoogleIdentity(
  identity: VerifiedGoogleIdentity,
  state: OAuthState,
  currentTokenHash?: string,
) {
  try {
    return await getPrisma().$transaction(async (tx) => {
      await lockAuthIdentifier(tx, `google:${identity.subject}`);
      const accountWhere = {
        provider_providerAccountId: { provider: "google", providerAccountId: identity.subject },
      };
      if (state.intent !== "login") {
        const session = await boundSession(tx, state);
        const existing = await tx.authAccount.findUnique({ where: accountWhere });
        if (state.intent === "reauthenticate") {
          if (!existing || existing.userId !== session.userId)
            throw new GoogleFlowError("GOOGLE_FAILED", "/account/security");
        } else {
          if (existing && existing.userId !== session.userId)
            throw new GoogleFlowError("GOOGLE_CONFLICT", "/account/security");
          const linked = await tx.authAccount.findUnique({
            where: { userId_provider: { userId: session.userId, provider: "google" } },
          });
          if (linked && linked.providerAccountId !== identity.subject)
            throw new GoogleFlowError("GOOGLE_CONFLICT", "/account/security");
          if (!existing)
            await tx.authAccount.create({
              data: {
                userId: session.userId,
                provider: "google",
                providerAccountId: identity.subject,
                email: identity.email,
                emailVerified: true,
              },
            });
        }
        const now = new Date();
        if (state.intent === "link") {
          await tx.userSession.updateMany({
            where: { userId: session.userId, id: { not: session.id }, revokedAt: null },
            data: { revokedAt: now },
          });
          await tx.authVerificationToken.updateMany({
            where: { userId: session.userId, consumedAt: null },
            data: { consumedAt: now },
          });
        }
        // Replace instead of UPDATE immutable tokenHash; preserve absolute expiry/metadata.
        const token = createSessionToken();
        await tx.userSession.delete({ where: { id: session.id } });
        await tx.userSession.create({
          data: {
            userId: session.userId,
            tokenHash: hashSessionToken(token),
            expiresAt: session.expiresAt,
            reauthenticatedAt: now,
            lastSeenAt: session.lastSeenAt,
            userAgent: session.userAgent,
            ipHash: session.ipHash,
          },
        });
        return { redirectTo: "/account/security", token, expiresAt: session.expiresAt };
      }
      let account = await tx.authAccount.findUnique({ where: accountWhere });
      let user;
      if (account) {
        await lockAuthUser(tx, account.userId);
        // Unlink and account status changes are serialized through the user row.
        account = await tx.authAccount.findUnique({ where: accountWhere });
        if (!account) throw new GoogleFlowError("GOOGLE_FAILED");
        user = await tx.user.findUnique({ where: { id: account.userId } });
      } else {
        await lockAuthIdentifier(tx, `email:${identity.email}`);
        if (await tx.user.findUnique({ where: { email: identity.email }, select: { id: true } }))
          throw new GoogleFlowError("GOOGLE_CONFLICT");
        user = await tx.user.create({
          data: {
            name: identity.name,
            email: identity.email,
            emailVerifiedAt: new Date(),
            avatarUrl: identity.avatarUrl,
            role: "CLIENT",
            status: "ACTIVE",
          },
        });
        await tx.authAccount.create({
          data: {
            userId: user.id,
            provider: "google",
            providerAccountId: identity.subject,
            email: identity.email,
            emailVerified: true,
          },
        });
      }
      if (!user || user.status !== "ACTIVE" || !isAuthRole(user.role))
        throw new GoogleFlowError("GOOGLE_FAILED");
      const token = createSessionToken();
      const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000);
      if (currentTokenHash)
        await tx.userSession.deleteMany({ where: { tokenHash: currentTokenHash } });
      await tx.userSession.create({
        data: {
          userId: user.id,
          tokenHash: hashSessionToken(token),
          expiresAt,
          reauthenticatedAt: new Date(),
        },
      });
      return { token, expiresAt, redirectTo: resolvePostLoginRedirect(state.next, user.role) };
    });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002")
      throw new GoogleFlowError(
        "GOOGLE_CONFLICT",
        state.intent === "login" ? "/login" : "/account/security",
      );
    throw error;
  }
}
