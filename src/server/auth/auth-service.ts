import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { verifyPassword } from "./password-crypto";
import * as repository from "./auth-repository";
import type { ThrottleKey } from "./request-policy";
import type { VerifiedSession } from "../authorization/session";
import { resolvePostLoginRedirect } from "../authorization/redirect-policy";
export const SESSION_COOKIE = "menujuakad_session";
export const SESSION_MAX_AGE = 7 * 24 * 60 * 60;
const tokenPattern = /^[A-Za-z0-9_-]{43}$/;
// A fixed valid scrypt payload keeps unknown-account verification equally expensive.
const dummyHash = `scrypt$32768$8$1$${Buffer.alloc(16).toString("base64url")}$${Buffer.alloc(64).toString("base64url")}`;
const tokenHash = (token: string) => createHash("sha256").update(token).digest("hex");
export const sessionCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_MAX_AGE,
});
export async function verifySessionToken(
  token: string | undefined,
): Promise<VerifiedSession | null> {
  if (!token || !tokenPattern.test(token)) return null;
  const record = await repository.findSession(tokenHash(token));
  if (
    !record ||
    record.expiresAt.getTime() <= Date.now() ||
    record.user.status !== "ACTIVE" ||
    !["CUSTOMER", "SUPERADMIN"].includes(record.user.role)
  )
    return null;
  return { userId: record.user.id, role: record.user.role, expiresAt: record.expiresAt.getTime() };
}
export async function revokeSessionToken(token: string | undefined): Promise<void> {
  if (token && tokenPattern.test(token)) await repository.deleteSession(tokenHash(token));
}
type LoginResult = { ok: false } | { ok: true; token: string; expiresAt: Date; redirectTo: string };
export async function loginWithPassword(
  input: { email: string; password: string; next?: string },
  keys: ThrottleKey[],
  oldToken: string | undefined,
): Promise<LoginResult> {
  if (!(await repository.reserveLoginAttempt(keys))) return { ok: false };
  const record = await repository.findCredential(input.email);
  const matches = await verifyPassword(input.password, record?.passwordHash ?? dummyHash);
  if (
    !record ||
    !matches ||
    record.user.status !== "ACTIVE" ||
    !["CUSTOMER", "SUPERADMIN"].includes(record.user.role)
  )
    return { ok: false };
  if (keys[0]) await repository.releaseSuccessfulEmailAttempt(keys[0].keyHash);
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000);
  await revokeSessionToken(oldToken);
  await repository.createSession({
    userId: record.user.id,
    tokenHash: tokenHash(token),
    expiresAt,
  });
  return {
    ok: true,
    token,
    expiresAt,
    redirectTo: resolvePostLoginRedirect(input.next, record.user.role),
  };
}
