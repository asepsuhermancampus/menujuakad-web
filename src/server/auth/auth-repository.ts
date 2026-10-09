import "server-only";
import { normalizeIdentifier } from "./identifiers";
import { lockAuthUser } from "./transaction-lock";
import { isAuthRole } from "../authorization/roles";
import { getPrisma } from "@/server/db/client";
import type { ThrottleKey } from "./request-policy";
import { throttleReservation } from "./throttle-query";
export async function reserveLoginAttempt(keys: ThrottleKey[]): Promise<boolean> {
  const database = getPrisma();
  // Scope order is always IP then email. A blocked IP cannot allocate arbitrary email rows.
  // Both scopes are reserved in one transaction; HMAC scope prefixes keep keyspaces disjoint.
  return database.$transaction(async (tx) => {
    for (const key of [...keys].reverse()) {
      const rows = await tx.$queryRaw<{ blocked: boolean }[]>(throttleReservation(key));
      if (!rows[0] || rows[0].blocked) return false;
    }
    return true;
  });
}
export async function findCredential(email: string) {
  const database = getPrisma();
  const identifier = normalizeIdentifier(email);
  const user = await database.user.findUnique({
    where: identifier.kind === "email" ? { email: identifier.value } : { phone: identifier.value },
    select: {
      id: true,
      role: true,
      status: true,
      smsOtpEnabled: true,
      phone: true,
      phoneVerifiedAt: true,
    },
  });
  if (!user) return null;
  const credential = await database.authCredential.findUnique({
    where: { userId: user.id },
    select: { passwordHash: true },
  });
  return credential ? { passwordHash: credential.passwordHash, user } : null;
}
export function findSession(tokenHash: string) {
  return getPrisma().userSession.findUnique({
    where: { tokenHash },
    select: {
      id: true,
      tokenHash: true,
      revokedAt: true,
      reauthenticatedAt: true,
      expiresAt: true,
      user: { select: { id: true, status: true, role: true } },
    },
  });
}
export async function createSession(data: {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}): Promise<void> {
  await getPrisma().userSession.create({ data });
}
export async function deleteSession(tokenHash: string): Promise<void> {
  await getPrisma().userSession.deleteMany({ where: { tokenHash } });
}

export async function releaseSuccessfulEmailAttempt(keyHash: string): Promise<void> {
  // Release only this successful reservation, preserving concurrent failures and IP budget.
  await getPrisma().authLoginThrottle.updateMany({
    where: { keyHash, failedAttempts: { gt: 0 } },
    data: { failedAttempts: { decrement: 1 } },
  });
}

/** Recheck password version after expensive verification, serialize against reset/password edits. */
export async function rotatePasswordSession(
  data: { userId: string; tokenHash: string; expiresAt: Date; reauthenticatedAt: Date },
  expectedHash: string,
  oldTokenHash?: string,
) {
  return getPrisma().$transaction(async (tx) => {
    await lockAuthUser(tx, data.userId);
    const credential = await tx.authCredential.findUnique({
      where: { userId: data.userId },
      select: { passwordHash: true },
    });
    const user = await tx.user.findUnique({
      where: { id: data.userId },
      select: { id: true, role: true, status: true, smsOtpEnabled: true },
    });
    if (
      !user ||
      user.status !== "ACTIVE" ||
      !isAuthRole(user.role) ||
      user.smsOtpEnabled ||
      credential?.passwordHash !== expectedHash
    )
      return null;
    if (oldTokenHash) await tx.userSession.deleteMany({ where: { tokenHash: oldTokenHash } });
    await tx.userSession.create({ data });
    return user;
  });
}
