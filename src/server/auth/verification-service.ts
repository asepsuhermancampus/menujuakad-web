import "server-only";
import { getPrisma } from "@/server/db/client";
import { equalHash } from "./proof-crypto";
import { normalizeEmail } from "./identifiers";
import type { AuthSession } from "./auth-service";
import { issueDeliveryProof, requireDelivery } from "./proof-delivery";
import { findProof, lockProof, consumeProof, proofPayloadSchema } from "./proof-repository";
import type { DeliveryProviders } from "../integrations/auth/providers";
import { publicDeliveryOutcome, type PublicDeliveryTiming } from "./public-delivery-timing";
import { accountTransaction, boundAccount } from "../account/account-repository";
import { AccountError, invalidProof } from "../account/errors";
export async function requestEmail(
  identifier: string,
  purpose: "register" | "verify",
  auth: AuthSession | undefined,
  browserHash: string,
  providers?: DeliveryProviders,
  timing?: PublicDeliveryTiming,
) {
  const target = normalizeEmail(identifier);
  const delivery = requireDelivery("email", providers);
  if (!auth) throw new AccountError(401, "SESSION_REQUIRED", "Silakan masuk kembali.");
  return publicDeliveryOutcome(async () => {
    const user = await accountTransaction(
      auth,
      async (_tx, s) => {
        if (s.user.email !== target)
          throw new AccountError(403, "FORBIDDEN", "Permintaan tidak diizinkan.");
        return s.user;
      },
      false,
    );
    const eligible = !user.emailVerifiedAt;
    await issueDeliveryProof({
      identifier: target,
      userId: eligible ? user.id : null,
      kind: purpose === "register" ? "email-register" : "email-verify",
      browserHash,
      sessionHash: auth.tokenHash,
      eligible,
      delivery,
      concealFailure: purpose === "register",
      timing,
    });
  }, timing);
}
export async function verifyEmail(token: string, auth?: AuthSession, browserHash?: string) {
  const proof = await findProof(token);
  if (!proof?.userId || proof.purpose !== "EMAIL_VERIFY") throw invalidProof();
  if (!auth || auth.userId !== proof.userId)
    throw new AccountError(401, "SESSION_REQUIRED", "Silakan masuk kembali.");
  return getPrisma().$transaction(async (tx) => {
    const session = await boundAccount(tx, auth, false);
    const current = await lockProof(tx, proof.id);
    const p = proofPayloadSchema.safeParse(current?.payload);
    const user = session.user;
    if (
      !current ||
      user.email !== current.identifier ||
      !p.success ||
      !["email-register", "email-verify"].includes(p.data.kind) ||
      p.data.delivery !== "accepted" ||
      p.data.sessionHash !== auth.tokenHash ||
      !browserHash ||
      !p.data.browserHash ||
      !equalHash(p.data.browserHash, browserHash)
    )
      throw invalidProof();
    await consumeProof(tx, current);
    await tx.user.update({ where: { id: user.id }, data: { emailVerifiedAt: new Date() } });
  });
}
