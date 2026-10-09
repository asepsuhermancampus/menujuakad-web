import "server-only";
import { NextRequest, type NextResponse } from "next/server";
import { hashSessionToken, isSessionToken } from "./session-crypto";
import { equalHash } from "./proof-crypto";
import { invalidProof } from "../account/errors";
export const LOGIN_PENDING_COOKIE = "menujuakad_login_pending";
export const pendingCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/api/auth/otp",
  maxAge: 300,
});
export function setPendingCookie(response: NextResponse, token: string) {
  response.cookies.set(LOGIN_PENDING_COOKIE, token, pendingCookieOptions());
}
export function clearPendingCookie(response: NextResponse) {
  response.cookies.set(LOGIN_PENDING_COOKIE, "", {
    ...pendingCookieOptions(),
    maxAge: 0,
    expires: new Date(0),
  });
}
export function requirePendingCookie(request: Request, token: string) {
  const cookie = new NextRequest(request.url, { headers: request.headers }).cookies.get(
    LOGIN_PENDING_COOKIE,
  )?.value;
  if (
    !cookie ||
    !isSessionToken(cookie) ||
    !equalHash(hashSessionToken(cookie), hashSessionToken(token))
  )
    throw invalidProof();
}
