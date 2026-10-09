import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest } from "next/server";
import { createSessionToken, isSessionToken } from "./session-crypto";
import { getAuthConfig, requireSameOrigin, type AuthConfig } from "./request-policy";
export const CSRF_COOKIE = "menujuakad_csrf";
const TTL = 1800;
export const csrfCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: TTL,
});
const signature = (cookie: string, expiry: string, config: AuthConfig) =>
  createHmac("sha256", config.secret)
    .update(`csrf:${cookie}:${expiry}:${config.origin}`)
    .digest("base64url");
export function issueCsrf(config: AuthConfig = getAuthConfig(), existingCookie?: string) {
  const cookie = isSessionToken(existingCookie) ? existingCookie : createSessionToken();
  const expiry = String(Math.floor(Date.now() / 1000) + TTL);
  return { cookie, token: `${expiry}.${signature(cookie, expiry, config)}` };
}
export function requireCsrf(request: Request, config: AuthConfig = getAuthConfig()): void {
  requireSameOrigin(request, config);
  const cookie = new NextRequest(request.url, { headers: request.headers }).cookies.get(
    CSRF_COOKIE,
  )?.value;
  const token = request.headers.get("x-csrf-token");
  const match = token && /^(\d{10})\.([A-Za-z0-9_-]{43})$/.exec(token);
  if (!cookie || !isSessionToken(cookie) || !match || match[0] !== token)
    throw new Error("CSRF tidak valid.");
  const expiry = Number(match[1]);
  const now = Math.floor(Date.now() / 1000);
  if (expiry <= now || expiry > now + TTL) throw new Error("CSRF kedaluwarsa.");
  const expected = signature(cookie, match[1], config);
  if (!timingSafeEqual(Buffer.from(match[2]), Buffer.from(expected)))
    throw new Error("CSRF tidak valid.");
}
