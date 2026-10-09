import "server-only";
import { getPrisma } from "@/server/db/client";
import type { AuthSession } from "./auth-service";
import { SESSION_MAX_AGE } from "./auth-service";
import { createSessionToken, hashSessionToken, isSessionToken } from "./session-crypto";
import { lockAuthUser } from "./transaction-lock";
import {
  findProof,
  attemptOtp,
  proofPayloadSchema,
  lockProof,
  consumeProof,
} from "./proof-repository";
import { issueDeliveryProof, requireDelivery } from "./proof-delivery";
import { equalHash, proofHmac } from "./proof-crypto";
import { resolvePostLoginRedirect } from "../authorization/redirect-policy";
import { isAuthRole } from "../authorization/roles";
import { AccountError, invalidProof } from "../account/errors";
import { otpInput } from "../account/contact-service";
import { parseInput } from "../account/account-input";
import type { DeliveryProviders } from "../integrations/auth/providers";
import type { PublicDeliveryTiming } from "./public-delivery-timing";
import type { MutationResult } from "../account/account-service";
export async function verifyOtp(input: unknown, browserHash: string): Promise<MutationResult> {
  const parsed = parseInput(otpInput, input);
  const proof = await findProof(parsed.token);
  if (!proof || proof.purpose !== "PHONE_OTP") throw invalidProof();
  const result = await getPrisma().$transaction(async (tx) => {
    if (proof.userId) await lockAuthUser(tx, proof.userId);
    const attempt = await attemptOtp(tx, proof, parsed.code, browserHash, [
      "phone-register",
      "phone-reset",
      "password-login",
    ]);
    if (!attempt?.proof.userId) return null;
    const { payload: p } = attempt;
    const user = await tx.user.findUnique({
      where: { id: proof.userId! },
      include: { credential: true },
    });
    if (
      !user ||
      user.status !== "ACTIVE" ||
      !isAuthRole(user.role) ||
      user.phone !== proof.identifier
    )
      return null;
    if (p.kind === "phone-register") {
      await tx.user.update({ where: { id: user.id }, data: { phoneVerifiedAt: new Date() } });
      return { redirectTo: "/login" };
    }
    if (!user.credential || !user.phoneVerifiedAt) return null;
    if (p.kind === "phone-reset") {
      const resetToken = createSessionToken();
      await tx.authVerificationToken.create({
        data: {
          userId: user.id,
          identifier: user.phone,
          tokenHash: hashSessionToken(resetToken),
          purpose: "PASSWORD_RESET",
          expiresAt: new Date(Date.now() + 600000),
          payload: { kind: "reset", delivery: "accepted" },
        },
      });
      return { data: { resetToken, expiresIn: 600 } };
    }
    if (
      !user.smsOtpEnabled ||
      !p.credentialHash ||
      !equalHash(p.credentialHash, proofHmac("credential", user.credential.passwordHash))
    )
      return null;
    if (p.budgetKeyHash)
      await tx.authLoginThrottle.updateMany({
        where: { keyHash: p.budgetKeyHash, failedAttempts: { gt: 0 } },
        data: { failedAttempts: { decrement: 1 } },
      });
    const token = createSessionToken(),
      expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000);
    if (p.sessionHash)
      await tx.userSession.deleteMany({ where: { userId: user.id, tokenHash: p.sessionHash } });
    await tx.userSession.create({
      data: {
        userId: user.id,
        tokenHash: hashSessionToken(token),
        expiresAt,
        reauthenticatedAt: new Date(),
      },
    });
    return {
      rotation: { token, expiresAt },
      redirectTo: resolvePostLoginRedirect(p.next, user.role),
    };
  });
  if (!result) throw invalidProof();
  return result;
}
export async function resendOtp(
  token: string,
  browserHash: string,
  providers?: DeliveryProviders,
  auth?: AuthSession,
  timing?: PublicDeliveryTiming,
) {
  const delivery = requireDelivery("phone", providers);
  if (!isSessionToken(token)) throw invalidProof();
  const proof = await findProof(token);
  const parsed = proofPayloadSchema.safeParse(proof?.payload);
  if (
    !proof ||
    proof.purpose !== "PHONE_OTP" ||
    !parsed.success ||
    !parsed.data.browserHash ||
    !equalHash(parsed.data.browserHash, browserHash)
  )
    throw invalidProof();
  const p = parsed.data;
  if (proof.createdAt.getTime() > Date.now() - 60000)
    throw new AccountError(429, "RESEND_COOLDOWN", "Tunggu sebelum meminta kode baru.");
  // Invalid recovery attempts produce a synthetic response; shared send budgets remain intact.
  const eligible = await getPrisma().$transaction(async (tx) => {
    if (proof.userId) await lockAuthUser(tx, proof.userId);
    const current = await lockProof(tx, proof.id);
    if (!current) return false;
    if (
      p.kind === "password-login" &&
      (current.consumedAt || current.expiresAt.getTime() <= Date.now())
    )
      return false;
    if (p.kind === "phone-change" || p.kind === "phone-register") {
      if (!auth || auth.userId !== proof.userId) throw new AccountError(401, "SESSION_REQUIRED");
      await accountTransactionCheck(tx, auth, p.kind === "phone-change");
    }
    if (!current.consumedAt && current.expiresAt.getTime() > Date.now())
      await consumeProof(tx, current);
    if (!proof.userId) return false;
    const user = await tx.user.findUnique({
      where: { id: proof.userId },
      include: { credential: true },
    });
    if (!user || user.status !== "ACTIVE") return false;
    if (p.kind === "phone-change") return true;
    if (user.phone !== proof.identifier) return false;
    if (p.kind === "phone-register") return true;
    return (
      !!user.credential &&
      !!user.phoneVerifiedAt &&
      (p.kind !== "password-login" ||
        (user.smsOtpEnabled &&
          !!p.credentialHash &&
          equalHash(p.credentialHash, proofHmac("credential", user.credential.passwordHash))))
    );
  });
  if (!proof.identifier) throw invalidProof();
  return issueDeliveryProof({
    identifier: proof.identifier,
    userId: eligible ? proof.userId : null,
    kind: p.kind,
    browserHash,
    eligible,
    delivery,
    credentialHash: p.credentialHash,
    sessionHash: p.sessionHash,
    next: p.next,
    concealFailure: p.kind === "phone-reset",
    timing,
    budgetKeyHash: p.budgetKeyHash,
  });
}
async function accountTransactionCheck(
  tx: Parameters<typeof lockAuthUser>[0],
  auth: AuthSession,
  fresh: boolean,
) {
  const { boundAccount } = await import("../account/account-repository");
  await boundAccount(tx, auth, fresh);
}
/** Handoff to core login: invoke only after password proof; this creates no full session. */
export async function beginPasswordOtpLogin(
  userId: string,
  expectedHash: string,
  browserHash: string,
  next?: string,
  oldSessionHash?: string,
  providers?: DeliveryProviders,
  budgetKeyHash?: string,
) {
  const delivery = requireDelivery("phone", providers);
  const user = await getPrisma().$transaction(async (tx) => {
    await lockAuthUser(tx, userId);
    const current = await tx.user.findUnique({
      where: { id: userId },
      include: { credential: true },
    });
    if (
      !current ||
      current.status !== "ACTIVE" ||
      !current.smsOtpEnabled ||
      !current.phone ||
      !current.phoneVerifiedAt ||
      current.credential?.passwordHash !== expectedHash
    )
      throw new AccountError(401, "INVALID_CREDENTIALS");
    return current;
  });
  return issueDeliveryProof({
    identifier: user.phone!,
    userId,
    kind: "password-login",
    browserHash,
    eligible: true,
    delivery,
    credentialHash: proofHmac("credential", expectedHash),
    sessionHash: oldSessionHash,
    budgetKeyHash,
    next,
  });
}
