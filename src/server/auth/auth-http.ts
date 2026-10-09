import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { getAuthConfig, type AuthConfig } from "./request-policy";
import { requireCsrf, CSRF_COOKIE, csrfCookieOptions } from "./csrf";
import { SESSION_COOKIE, sessionCookieOptions } from "./auth-service";
export const authJson = (body: object, status = 200) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
export const authError = (status: number, code: string, error: string) => {
  const response = authJson({ ok: false, code, error }, status);
  if (status === 429) response.headers.set("Retry-After", "900");
  return response;
};
export const authUnavailable = () =>
  authError(503, "UNAVAILABLE", "Layanan autentikasi sementara tidak tersedia.");
export function mutationAuthConfig(
  request: Request,
  config?: AuthConfig,
): AuthConfig | NextResponse {
  let resolved: AuthConfig;
  try {
    resolved = config ?? getAuthConfig();
  } catch {
    return authUnavailable();
  }
  try {
    requireCsrf(request, resolved);
  } catch {
    return authError(403, "FORBIDDEN", "Permintaan tidak diizinkan.");
  }
  return resolved;
}
export const requestSessionToken = (request: Request) =>
  new NextRequest(request.url, { headers: request.headers }).cookies.get(SESSION_COOKIE)?.value;
export function clearCsrf(response: NextResponse) {
  response.cookies.set(CSRF_COOKIE, "", {
    ...csrfCookieOptions(),
    maxAge: 0,
    expires: new Date(0),
  });
}
export function setSessionCookie(
  response: NextResponse,
  result: { token: string; expiresAt: Date },
) {
  response.cookies.set(SESSION_COOKIE, result.token, {
    ...sessionCookieOptions(),
    expires: result.expiresAt,
  });
  clearCsrf(response);
}
