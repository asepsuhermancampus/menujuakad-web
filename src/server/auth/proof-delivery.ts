import "server-only";
import { randomUUID } from "node:crypto";
import { getPrisma } from "@/server/db/client";
import { createDeliveryProviders, type DeliveryProviders } from "../integrations/auth/providers";
import { createSessionToken, hashSessionToken } from "./session-crypto";
import { createOtp, otpHash } from "./proof-crypto";
import { getAuthConfig } from "./request-policy";
import { lockAuthIdentifier, lockAuthUser } from "./transaction-lock";
import { AccountError, unavailable } from "../account/errors";
import { publicDeliveryOutcome, type PublicDeliveryTiming } from "./public-delivery-timing";
import type { ProofPayload } from "./proof-repository";
export function requireDelivery(
  kind: "email" | "phone",
  providers: DeliveryProviders = createDeliveryProviders(),
) {
  if (!(kind === "email" ? providers.email.available : providers.sms.available))
    throw unavailable();
  return providers;
}
export type DeliveryProofInput = {
  identifier: string;
  userId: string | null;
  kind: ProofPayload["kind"];
  browserHash?: string;
  eligible: boolean;
  delivery: DeliveryProviders;
  credentialHash?: string;
  sessionHash?: string;
  next?: string;
  budgetKeyHash?: string;
  concealFailure?: boolean;
  timing?: PublicDeliveryTiming;
};
export async function issueDeliveryProof(input: DeliveryProofInput) {
  const sms = input.kind.startsWith("phone-") || input.kind === "password-login";
  requireDelivery(sms ? "phone" : "email", input.delivery);
  return input.concealFailure
    ? publicDeliveryOutcome(() => persistAndDeliverProof(input), input.timing)
    : persistAndDeliverProof(input);
}
async function persistAndDeliverProof(input: DeliveryProofInput) {
  const sms = input.kind.startsWith("phone-") || input.kind === "password-login";
  requireDelivery(sms ? "phone" : "email", input.delivery);
  const token = createSessionToken(),
    id = randomUUID(),
    code = sms ? createOtp() : undefined;
  const now = new Date();
  const purpose = sms
    ? "PHONE_OTP"
    : input.kind === "reset"
      ? "PASSWORD_RESET"
      : input.kind === "email-change"
        ? "ACCOUNT_LINK"
        : "EMAIL_VERIFY";
  const payload: ProofPayload = {
    kind: input.kind,
    delivery: input.eligible ? "pending" : "synthetic",
    ...(input.browserHash ? { browserHash: input.browserHash } : {}),
    ...(code ? { codeHash: otpHash(id, input.identifier, input.kind, code) } : {}),
    ...(input.credentialHash ? { credentialHash: input.credentialHash } : {}),
    ...(input.sessionHash ? { sessionHash: input.sessionHash } : {}),
    ...(input.next ? { next: input.next } : {}),
    ...(input.budgetKeyHash ? { budgetKeyHash: input.budgetKeyHash } : {}),
  };
  const data = {
    id,
    tokenHash: hashSessionToken(token),
    purpose,
    userId: input.userId,
    identifier: input.identifier,
    payload,
    expiresAt: new Date(
      now.getTime() + (sms ? 300000 : input.kind === "reset" ? 900000 : 86400000),
    ),
    createdAt: now,
  };
  await getPrisma().$transaction(async (tx) => {
    if (input.userId) await lockAuthUser(tx, input.userId);
    await lockAuthIdentifier(tx, `proof:${purpose}:${input.identifier}`);
    const previous = await tx.authVerificationToken.findFirst({
      where: {
        purpose,
        identifier: input.identifier,
        createdAt: { gt: new Date(now.getTime() - 60000) },
      },
      orderBy: { createdAt: "desc" },
    });
    if (previous)
      throw new AccountError(429, "RESEND_COOLDOWN", "Tunggu sebelum meminta bukti baru.");
    await tx.authVerificationToken.updateMany({
      where: { purpose, identifier: input.identifier, consumedAt: null },
      data: { consumedAt: now },
    });
    if (input.kind === "password-login" && input.sessionHash)
      await tx.userSession.deleteMany({ where: { tokenHash: input.sessionHash } });
    await tx.authVerificationToken.create({ data });
  });
  if (input.eligible) {
    try {
      if (sms)
        await input.delivery.sms.send({ phone: input.identifier, code: code!, idempotencyKey: id });
      else {
        const path =
          input.kind === "reset"
            ? "/reset-password"
            : input.kind === "email-change"
              ? "/account/security"
              : "/verify-email";
        await input.delivery.email.send({
          recipient: input.identifier,
          url: `${getAuthConfig().origin}${path}#token=${token}`,
          kind: input.kind === "reset" ? "reset" : "verify",
          idempotencyKey: id,
        });
      }
      // Payload is immutable under runtime grants. Replace a still-pending row only after acceptance.
      await getPrisma().$transaction(async (tx) => {
        if (input.userId) await lockAuthUser(tx, input.userId);
        await tx.$queryRaw`SELECT "id" FROM "AuthVerificationToken" WHERE "id"=${id} FOR UPDATE`;
        const pending = await tx.authVerificationToken.findUnique({ where: { id } });
        if (!pending || pending.consumedAt) throw unavailable();
        await tx.authVerificationToken.delete({ where: { id } });
        await tx.authVerificationToken.create({
          data: { ...data, payload: { ...payload, delivery: "accepted" } },
        });
      });
    } catch {
      await getPrisma().authVerificationToken.updateMany({
        where: { id, consumedAt: null },
        data: { consumedAt: new Date() },
      });
      if (!input.concealFailure) throw unavailable();
    }
  }
  return { token, expiresIn: sms ? 300 : input.kind === "reset" ? 900 : 86400, resendAfter: 60 };
}
