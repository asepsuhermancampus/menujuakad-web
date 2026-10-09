import "server-only";
import { z } from "zod";
import { getPrisma } from "@/server/db/client";
import { hashPassword } from "./password-crypto";
import { newPasswordSchema, normalizeIdentifier } from "./identifiers";
import { isSessionToken } from "./session-crypto";
import { lockAuthUser } from "./transaction-lock";
import { consumeProof, findProof, lockProof, proofPayloadSchema } from "./proof-repository";
import { invalidateProofs } from "../account/account-repository";
import { parseInput } from "../account/account-input";
import { invalidProof } from "../account/errors";
import { issueDeliveryProof, requireDelivery } from "./proof-delivery";
import { publicDeliveryOutcome, type PublicDeliveryTiming } from "./public-delivery-timing";
import type { DeliveryProviders } from "../integrations/auth/providers";
export const recoveryMessage = "Jika akun dapat dipulihkan, petunjuk akan dikirim.";
const resetInput = z
  .object({ token: z.string().refine(isSessionToken), password: newPasswordSchema })
  .strict();
export async function resetPassword(input: unknown) {
  const parsed = parseInput(resetInput, input);
  const proof = await findProof(parsed.token);
  if (!proof?.userId || proof.purpose !== "PASSWORD_RESET") throw invalidProof();
  const hash = await hashPassword(parsed.password);
  await getPrisma().$transaction(async (tx) => {
    await lockAuthUser(tx, proof.userId!);
    const user = await tx.user.findUnique({
      where: { id: proof.userId! },
      include: { credential: true },
    });
    const current = await lockProof(tx, proof.id);
    const payload = proofPayloadSchema.safeParse(current?.payload);
    if (
      !current ||
      !payload.success ||
      payload.data.kind !== "reset" ||
      payload.data.delivery !== "accepted" ||
      !user?.credential ||
      user.status !== "ACTIVE" ||
      !(
        (user.email === current.identifier && user.emailVerifiedAt) ||
        (user.phone === current.identifier && user.phoneVerifiedAt)
      )
    )
      throw invalidProof();
    await consumeProof(tx, current);
    await tx.authCredential.update({ where: { userId: user.id }, data: { passwordHash: hash } });
    await tx.userSession.updateMany({
      where: { userId: user.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    await invalidateProofs(tx, user.id);
  });
}
export async function requestRecovery(
  identifier: string,
  browserHash: string,
  providers?: DeliveryProviders,
  timing?: PublicDeliveryTiming,
) {
  const target = normalizeIdentifier(identifier);
  const delivery = requireDelivery(target.kind, providers);
  return publicDeliveryOutcome(async () => {
    const user = await getPrisma().user.findUnique({
      where: target.kind === "email" ? { email: target.value } : { phone: target.value },
      include: { credential: true },
    });
    const eligible =
      !!user?.credential &&
      user.status === "ACTIVE" &&
      (target.kind === "email" ? !!user.emailVerifiedAt : !!user.phoneVerifiedAt);
    const challenge = await issueDeliveryProof({
      identifier: target.value,
      userId: eligible ? user!.id : null,
      kind: target.kind === "email" ? "reset" : "phone-reset",
      browserHash,
      eligible,
      delivery,
      concealFailure: true,
      timing,
    });
    return target.kind === "phone"
      ? { message: recoveryMessage, ...challenge }
      : { message: recoveryMessage };
  }, timing);
}
