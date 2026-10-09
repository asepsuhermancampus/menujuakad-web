import "server-only";
import { z } from "zod";
import type { AuthVerificationToken, Prisma } from "@/generated/prisma/client";
import { getPrisma } from "@/server/db/client";
import { hashSessionToken } from "./session-crypto";
import { equalHash, otpHash } from "./proof-crypto";
import { invalidProof } from "../account/errors";
export const proofPayloadSchema = z
  .object({
    kind: z.enum([
      "reset",
      "email-register",
      "email-verify",
      "email-change",
      "phone-register",
      "phone-change",
      "phone-reset",
      "password-login",
    ]),
    delivery: z.enum(["pending", "accepted", "synthetic"]),
    browserHash: z.string().optional(),
    codeHash: z.string().optional(),
    sessionHash: z.string().optional(),
    credentialHash: z.string().optional(),
    next: z.string().optional(),
    budgetKeyHash: z
      .string()
      .regex(/^[a-f0-9]{64}$/)
      .optional(),
  })
  .strict();
export type ProofPayload = z.infer<typeof proofPayloadSchema>;
export const payloadOf = (proof: AuthVerificationToken) => proofPayloadSchema.parse(proof.payload);
export async function findProof(token: string) {
  return getPrisma().authVerificationToken.findUnique({
    where: { tokenHash: hashSessionToken(token) },
  });
}
export async function lockProof(tx: Prisma.TransactionClient, id: string) {
  await tx.$queryRaw`SELECT "id" FROM "AuthVerificationToken" WHERE "id"=${id} FOR UPDATE`;
  return tx.authVerificationToken.findUnique({ where: { id } });
}
export async function consumeProof(tx: Prisma.TransactionClient, proof: AuthVerificationToken) {
  const result = await tx.authVerificationToken.updateMany({
    where: {
      id: proof.id,
      purpose: proof.purpose,
      tokenHash: proof.tokenHash,
      userId: proof.userId,
      identifier: proof.identifier,
      consumedAt: null,
      expiresAt: { gt: new Date() },
    },
    data: { consumedAt: new Date() },
  });
  if (result.count !== 1) throw invalidProof();
}
/** Failure returns normally so attempts and exhaustion are committed instead of rolled back. */
export async function attemptOtp(
  tx: Prisma.TransactionClient,
  proof: AuthVerificationToken,
  code: string,
  browserHash: string,
  kinds: ProofPayload["kind"][],
) {
  const locked = await lockProof(tx, proof.id);
  if (
    !locked ||
    locked.consumedAt ||
    locked.expiresAt.getTime() <= Date.now() ||
    locked.attempts >= 5 ||
    locked.purpose !== "PHONE_OTP"
  )
    return null;
  const parsed = proofPayloadSchema.safeParse(locked.payload);
  if (!parsed.success) return null;
  const p = parsed.data;
  if (
    !kinds.includes(p.kind) ||
    p.delivery === "pending" ||
    !p.browserHash ||
    !equalHash(p.browserHash, browserHash)
  )
    return null;
  const attempt = await tx.authVerificationToken.updateMany({
    where: { id: locked.id, consumedAt: null, attempts: { lt: 5 }, expiresAt: { gt: new Date() } },
    data: { attempts: { increment: 1 } },
  });
  if (attempt.count !== 1) return null;
  const valid =
    p.delivery === "accepted" &&
    !!p.codeHash &&
    equalHash(p.codeHash, otpHash(locked.id, locked.identifier ?? "", p.kind, code));
  if (!valid) {
    if (locked.attempts >= 4)
      await tx.authVerificationToken.update({
        where: { id: locked.id },
        data: { consumedAt: new Date() },
      });
    return null;
  }
  await consumeProof(tx, locked);
  return { proof: locked, payload: p };
}
