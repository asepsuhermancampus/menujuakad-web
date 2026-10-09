import "server-only";
import { NextRequest } from "next/server";
import { isAuthRole } from "../authorization/roles";
import { getAuthConfig } from "./request-policy";
import { hashSessionToken, createSessionToken, isSessionToken } from "./session-crypto";
import { verifyPassword } from "./password-crypto";
import * as repository from "./auth-repository";
import type { ThrottleKey } from "./request-policy";
import type { VerifiedSession } from "../authorization/session";
import { resolvePostLoginRedirect } from "../authorization/redirect-policy";
export const SESSION_COOKIE = "menujuakad_session";
export const SESSION_MAX_AGE = 7 * 24 * 60 * 60;

// A fixed valid scrypt payload keeps unknown-account verification equally expensive.
const dummyHash = `scrypt$32768$8$1$${Buffer.alloc(16).toString("base64url")}$${Buffer.alloc(64).toString("base64url")}`;

export const sessionCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_MAX_AGE,
});
export async function verifySessionToken(token: string | undefined): Promise<AuthSession | null> {
  if (!token || !isSessionToken(token)) return null;
  const record = await repository.findSession(hashSessionToken(token));
  if (
    !record ||
    record.revokedAt ||
    record.expiresAt.getTime() <= Date.now() ||
    record.user.status !== "ACTIVE" ||
    !isAuthRole(record.user.role)
  )
    return null;
  return {
    userId: record.user.id,
    role: record.user.role,
    expiresAt: record.expiresAt.getTime(),
    sessionId: record.id,
    tokenHash: hashSessionToken(token),
    reauthenticatedAt: record.reauthenticatedAt,
    user: record.user,
  };
}
export async function revokeSessionToken(token: string | undefined): Promise<void> {
  if (token && isSessionToken(token)) await repository.deleteSession(hashSessionToken(token));
}
export type LoginResult =
  | { ok: false; code?: "RATE_LIMITED" }
  | { ok: true; token: string; expiresAt: Date; redirectTo: string; otpRequired?: false }
  | {
      ok: true;
      otpRequired: true;
      challenge: { token: string; expiresIn: number; resendAfter: number };
    };
export async function loginWithPassword(
  input: { email?: string; identifier?: string; password: string; next?: string },
  keys: ThrottleKey[],
  oldToken: string | undefined,
  context?: {
    browserHash: string;
    providers?: import("../integrations/auth/providers").DeliveryProviders;
    otpSendKeys?: (phone: string) => ThrottleKey[];
  },
): Promise<LoginResult> {
  if (!(await repository.reserveLoginAttempt(keys))) return { ok: false, code: "RATE_LIMITED" };
  const record = await repository.findCredential(input.identifier ?? input.email ?? "");
  const matches = await verifyPassword(input.password, record?.passwordHash ?? dummyHash);
  if (!record || !matches || record.user.status !== "ACTIVE" || !isAuthRole(record.user.role))
    return { ok: false };
  if (record.user.smsOtpEnabled) {
    if (!context?.browserHash) throw new Error("Konteks OTP tidak tersedia.");
    if (
      context.otpSendKeys &&
      !(await repository.reserveLoginAttempt(context.otpSendKeys(record.user.phone ?? "")))
    )
      return { ok: false, code: "RATE_LIMITED" };
    const { beginPasswordOtpLogin } = await import("./otp-service");
    const challenge = await beginPasswordOtpLogin(
      record.user.id,
      record.passwordHash,
      context.browserHash,
      input.next,
      isSessionToken(oldToken) ? hashSessionToken(oldToken) : undefined,
      context.providers,
      keys[0]?.keyHash,
    );
    return { ok: true, otpRequired: true, challenge };
  }
  const token = createSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000);
  const user = await repository.rotatePasswordSession(
    {
      userId: record.user.id,
      tokenHash: hashSessionToken(token),
      expiresAt,
      reauthenticatedAt: new Date(),
    },
    record.passwordHash,
    isSessionToken(oldToken) ? hashSessionToken(oldToken) : undefined,
  );
  if (!user) return { ok: false };
  if (keys[0]) await repository.releaseSuccessfulEmailAttempt(keys[0].keyHash);
  return {
    ok: true,
    token,
    expiresAt,
    redirectTo: resolvePostLoginRedirect(input.next, user.role),
  };
}

export type AuthSession = VerifiedSession &
  Readonly<{
    sessionId: string;
    tokenHash: string;
    reauthenticatedAt: Date | null;
    user: { id: string; role: VerifiedSession["role"]; status: string };
  }>;
export async function getAuthSession(request: Request): Promise<AuthSession | null> {
  getAuthConfig();
  return verifySessionToken(
    new NextRequest(request.url, { headers: request.headers }).cookies.get(SESSION_COOKIE)?.value,
  );
}
