import "server-only";
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
  const user = await database.user.findUnique({
    where: { email },
    select: { id: true, role: true, status: true },
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
    select: { expiresAt: true, user: { select: { id: true, status: true, role: true } } },
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
