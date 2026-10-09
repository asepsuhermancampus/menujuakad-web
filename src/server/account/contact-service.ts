import "server-only";
import { z } from "zod";
import { reserveLoginAttempt } from "../auth/auth-repository";
import type { ThrottleKey } from "../auth/request-policy";
import type { AuthSession } from "../auth/auth-service";
import { normalizeEmail, normalizePhone } from "../auth/identifiers";
import { isSessionToken } from "../auth/session-crypto";
import {
  findProof,
  lockProof,
  consumeProof,
  attemptOtp,
  proofPayloadSchema,
} from "../auth/proof-repository";
import { issueDeliveryProof, requireDelivery } from "../auth/proof-delivery";
import { lockAuthIdentifier } from "../auth/transaction-lock";
import type { DeliveryProviders } from "../integrations/auth/providers";
import { AccountError, invalidProof } from "./errors";
import { parseInput } from "./account-input";
import {
  accountTransaction,
  invalidateProofs,
  revokeOthers,
  rotateSession,
} from "./account-repository";
import { profileDto } from "./account-dto";
import type { MutationResult } from "./account-service";
const tokenInput = z.object({ token: z.string().refine(isSessionToken) }).strict();
export const otpInput = z
  .object({ token: z.string().refine(isSessionToken), code: z.string().regex(/^\d{6}$/) })
  .strict();
export async function requestAccountContact(
  auth: AuthSession,
  kind: "email" | "phone",
  value: string,
  browserHash: string,
  providers?: DeliveryProviders,
) {
  const identifier = kind === "email" ? normalizeEmail(value) : normalizePhone(value);
  const delivery = requireDelivery(kind, providers);
  await accountTransaction(auth, async (tx) => {
    const owner = await tx.user.findUnique({
      where: kind === "email" ? { email: identifier } : { phone: identifier },
    });
    if (owner && owner.id !== auth.userId)
      throw new AccountError(409, "CONTACT_CONFLICT", "Kontak tidak dapat digunakan.");
  });
  return issueDeliveryProof({
    identifier,
    userId: auth.userId,
    kind: kind === "email" ? "email-change" : "phone-change",
    browserHash,
    eligible: true,
    delivery,
  });
}
export async function verifyAccountContact(
  auth: AuthSession,
  kind: "email" | "phone",
  input: unknown,
  browserHash: string,
): Promise<MutationResult> {
  const parsed: { token: string; code?: string } =
    kind === "email" ? parseInput(tokenInput, input) : parseInput(otpInput, input);
  const proof = await findProof(parsed.token);
  if (
    !proof ||
    proof.userId !== auth.userId ||
    proof.purpose !== (kind === "email" ? "ACCOUNT_LINK" : "PHONE_OTP")
  )
    throw invalidProof();
  try {
    const result = await accountTransaction(auth, async (tx, s) => {
      if (kind === "phone") {
        const valid = await attemptOtp(tx, proof, parsed.code ?? "", browserHash, ["phone-change"]);
        if (!valid) return null;
      } else {
        const current = await lockProof(tx, proof.id);
        const payload = proofPayloadSchema.safeParse(current?.payload);
        if (
          !current ||
          !payload.success ||
          payload.data.kind !== "email-change" ||
          payload.data.delivery !== "accepted"
        )
          throw invalidProof();
        await consumeProof(tx, current);
      }
      if (!proof.identifier) throw invalidProof();
      await lockAuthIdentifier(tx, `${kind}:${proof.identifier}`);
      const owner = await tx.user.findUnique({
        where: kind === "email" ? { email: proof.identifier } : { phone: proof.identifier },
      });
      if (owner && owner.id !== auth.userId)
        throw new AccountError(409, "CONTACT_CONFLICT", "Kontak tidak dapat digunakan.");
      const changed = (kind === "email" ? s.user.email : s.user.phone) !== proof.identifier;
      const user = await tx.user.update({
        where: { id: auth.userId },
        data:
          kind === "email"
            ? { email: proof.identifier, emailVerifiedAt: new Date() }
            : { phone: proof.identifier, phoneVerifiedAt: new Date() },
      });
      await invalidateProofs(tx, auth.userId);
      if (changed) {
        await revokeOthers(tx, s);
        return { data: profileDto(user), rotation: await rotateSession(tx, s) };
      }
      return { data: profileDto(user) };
    });
    if (!result) throw invalidProof();
    return result;
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002")
      throw new AccountError(409, "CONTACT_CONFLICT", "Kontak tidak dapat digunakan.");
    throw error;
  }
}
export async function requestPhoneVerification(
  auth: AuthSession,
  browserHash: string,
  providers?: DeliveryProviders,
  sendKeys?: (phone: string) => ThrottleKey[],
) {
  const delivery = requireDelivery("phone", providers);
  const user = await accountTransaction(auth, async (_tx, s) => s.user, false);
  if (!user.phone) throw new AccountError(400, "INVALID_INPUT");
  if (sendKeys && !(await reserveLoginAttempt(sendKeys(user.phone))))
    throw new AccountError(429, "RATE_LIMITED", "Terlalu banyak percobaan. Coba lagi nanti.");
  return issueDeliveryProof({
    identifier: user.phone,
    userId: user.id,
    kind: "phone-register",
    browserHash,
    eligible: true,
    delivery,
  });
}
