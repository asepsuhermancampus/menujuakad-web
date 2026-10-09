import "server-only";
import type { Prisma } from "@/generated/prisma/client";
/** User row always comes before credential/account/session rows in sensitive operations. */
export async function lockAuthUser(tx: Prisma.TransactionClient, userId: string): Promise<void> {
  await tx.$queryRaw`SELECT "id" FROM "User" WHERE "id"=${userId} FOR UPDATE`;
}
/** Protect identities without a User row; unique constraints are still authoritative. */
export async function lockAuthIdentifier(
  tx: Prisma.TransactionClient,
  identifier: string,
): Promise<void> {
  await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtextextended(${`auth:${identifier}`},0))::text`;
}
