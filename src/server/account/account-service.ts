import "server-only";
import type { AuthSession } from "../auth/auth-service";
import { hashPassword, verifyPassword } from "../auth/password-crypto";
import { getPrisma } from "@/server/db/client";
import { requireDelivery } from "../auth/proof-delivery";
import { AccountError } from "./errors";
import {
  accountTransaction,
  invalidateProofs,
  revokeOthers,
  rotateSession,
} from "./account-repository";
import { profileDto, securityDto, sessionDto } from "./account-dto";
import {
  emptyInput,
  profileInput,
  passwordInput,
  reauthInput,
  securityInput,
  parseInput,
} from "./account-input";
export type MutationResult = {
  data?: unknown;
  rotation?: { token: string; expiresAt: Date };
  clearSession?: boolean;
  redirectTo?: string;
};
export async function readAccount(auth: AuthSession, op: string) {
  return accountTransaction(
    auth,
    async (tx, session) => {
      if (op === "profile") return profileDto(session.user);
      if (op === "security")
        return securityDto(
          session.user,
          !!(await tx.authCredential.findUnique({ where: { userId: auth.userId } })),
          !!(await tx.authAccount.findUnique({
            where: { userId_provider: { userId: auth.userId, provider: "google" } },
          })),
          session.reauthenticatedAt,
        );
      if (op === "sessions") {
        if (!session.lastSeenAt || session.lastSeenAt.getTime() < Date.now() - 300000)
          await tx.userSession.update({
            where: { id: session.id },
            data: { lastSeenAt: new Date() },
          });
        const sessions = await tx.userSession.findMany({
          where: { userId: auth.userId, revokedAt: null, expiresAt: { gt: new Date() } },
          orderBy: { createdAt: "desc" },
          take: 50,
        });
        return { sessions: sessions.map((s) => sessionDto(s, session.id)) };
      }
      throw new AccountError(404, "NOT_FOUND");
    },
    false,
  );
}
export async function accountMutation(
  auth: AuthSession,
  op: string,
  input: unknown,
  id?: string,
  successfulKeyHash?: string,
): Promise<MutationResult> {
  if (op === "profile") {
    const data = parseInput(profileInput, input);
    return accountTransaction(
      auth,
      async (tx) => ({
        data: profileDto(await tx.user.update({ where: { id: auth.userId }, data })),
      }),
      false,
    );
  }
  if (op === "reauthenticate" || op === "password") {
    const parsed =
      op === "reauthenticate" ? parseInput(reauthInput, input) : parseInput(passwordInput, input);
    const credential = await getPrisma().authCredential.findUnique({
      where: { userId: auth.userId },
    });
    const current =
      op === "reauthenticate" ? parsed.password : parseInput(passwordInput, input).currentPassword;
    if (credential && (!current || !(await verifyPassword(current, credential.passwordHash))))
      throw new AccountError(401, "INVALID_CREDENTIALS", "Kata sandi tidak sesuai.");
    if (op === "reauthenticate" && !credential)
      throw new AccountError(401, "INVALID_CREDENTIALS", "Gunakan metode Google untuk konfirmasi.");
    const hash = op === "password" ? await hashPassword(parsed.password) : null;
    return accountTransaction(
      auth,
      async (tx, session) => {
        const latest = await tx.authCredential.findUnique({ where: { userId: auth.userId } });
        if (latest?.passwordHash !== credential?.passwordHash)
          throw new AccountError(401, "INVALID_CREDENTIALS", "Kata sandi telah berubah.");
        const now = new Date();
        if (op === "reauthenticate" && successfulKeyHash)
          await tx.authLoginThrottle.updateMany({
            where: { keyHash: successfulKeyHash, failedAttempts: { gt: 0 } },
            data: { failedAttempts: { decrement: 1 } },
          });
        if (hash) {
          if (
            !latest &&
            !(await tx.authAccount.findUnique({
              where: { userId_provider: { userId: auth.userId, provider: "google" } },
            }))
          )
            throw new AccountError(
              403,
              "GOOGLE_REAUTH_REQUIRED",
              "Konfirmasi melalui Google terlebih dahulu.",
            );
          if (!latest && !(session.user.emailVerifiedAt || session.user.phoneVerifiedAt))
            throw new AccountError(
              409,
              "VERIFIED_CONTACT_REQUIRED",
              "Verifikasi kontak terlebih dahulu.",
            );
          await tx.authCredential.upsert({
            where: { userId: auth.userId },
            create: { userId: auth.userId, passwordHash: hash },
            update: { passwordHash: hash },
          });
          await revokeOthers(tx, session);
          await invalidateProofs(tx, auth.userId);
        }
        return {
          data:
            op === "reauthenticate"
              ? { reauthenticatedUntil: new Date(now.getTime() + 300000).toISOString() }
              : undefined,
          rotation: await rotateSession(tx, session, now),
        };
      },
      op !== "reauthenticate",
    );
  }
  if (op === "security") {
    const data = parseInput(securityInput, input);
    return accountTransaction(auth, async (tx, s) => {
      const credential = await tx.authCredential.findUnique({ where: { userId: auth.userId } });
      if (data.smsOtpEnabled) {
        requireDelivery("phone");
        if (!credential || !s.user.phone || !s.user.phoneVerifiedAt)
          throw new AccountError(
            409,
            "OTP_REQUIREMENTS",
            "OTP membutuhkan kata sandi dan nomor terverifikasi.",
          );
      }
      const user = await tx.user.update({ where: { id: auth.userId }, data });
      const google = !!(await tx.authAccount.findUnique({
        where: { userId_provider: { userId: auth.userId, provider: "google" } },
      }));
      const result: MutationResult = {
        data: securityDto(user, !!credential, google, s.reauthenticatedAt),
      };
      if (s.user.smsOtpEnabled !== data.smsOtpEnabled) {
        await invalidateProofs(tx, auth.userId);
        await revokeOthers(tx, s);
        result.rotation = await rotateSession(tx, s);
      }
      return result;
    });
  }
  parseInput(emptyInput, input);
  return accountTransaction(
    auth,
    async (tx, s) => {
      if (op === "sessions/delete") {
        const target = await tx.userSession.findFirst({
          where: { id: id ?? "", userId: auth.userId },
        });
        if (!target) throw new AccountError(404, "NOT_FOUND", "Sesi tidak ditemukan.");
        if (target.id !== s.id) {
          if (
            !s.reauthenticatedAt ||
            s.reauthenticatedAt.getTime() > Date.now() ||
            s.reauthenticatedAt.getTime() <= Date.now() - 300000
          )
            throw new AccountError(403, "REAUTH_REQUIRED", "Konfirmasi identitas terlebih dahulu.");
        }
        await tx.userSession.delete({ where: { id: target.id } });
        return target.id === s.id ? { clearSession: true, redirectTo: "/login" } : {};
      }
      if (op === "sessions/revoke-others")
        return {
          data: { revoked: await revokeOthers(tx, s) },
          rotation: await rotateSession(tx, s),
        };
      if (!["google/unlink", "email/unlink", "phone/unlink"].includes(op))
        throw new AccountError(404, "NOT_FOUND");
      const credential = await tx.authCredential.findUnique({ where: { userId: auth.userId } });
      const google = await tx.authAccount.findUnique({
        where: { userId_provider: { userId: auth.userId, provider: "google" } },
      });
      const email = op === "email/unlink" ? null : s.user.emailVerifiedAt;
      const phone = op === "phone/unlink" ? null : s.user.phoneVerifiedAt;
      if (op !== "google/unlink" && credential && !email && !phone)
        throw new AccountError(
          409,
          "LAST_METHOD",
          "Pertahankan kontak terverifikasi untuk kata sandi.",
        );
      if (!(op !== "google/unlink" && google) && !(credential && (email || phone)))
        throw new AccountError(409, "LAST_METHOD", "Metode masuk terakhir tidak dapat dilepas.");
      if (op === "google/unlink")
        await tx.authAccount.deleteMany({ where: { userId: auth.userId, provider: "google" } });
      else
        await tx.user.update({
          where: { id: auth.userId },
          data:
            op === "email/unlink"
              ? { email: null, emailVerifiedAt: null }
              : { phone: null, phoneVerifiedAt: null, smsOtpEnabled: false },
        });
      await revokeOthers(tx, s);
      await invalidateProofs(tx, auth.userId);
      return { rotation: await rotateSession(tx, s) };
    },
    op !== "sessions/delete",
  );
}
