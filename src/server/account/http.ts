import "server-only";
import { NextRequest, type NextResponse } from "next/server";
import { z } from "zod";
import { getAuthConfig, getScopedThrottleKeys } from "../auth/request-policy";
import { reserveLoginAttempt } from "../auth/auth-repository";
import {
  authJson,
  authError,
  authUnavailable,
  setSessionCookie,
  clearCsrf,
} from "../auth/auth-http";
import { SESSION_COOKIE, sessionCookieOptions } from "../auth/auth-service";
import { CSRF_COOKIE } from "../auth/csrf";
import { proofHmacWithSecret } from "../auth/proof-crypto";
import { AccountError } from "./errors";
import type { MutationResult } from "./account-service";
import type { AuthConfig } from "../auth/request-policy";
export function browserBinding(request: Request, config: AuthConfig = getAuthConfig()) {
  const cookie = new NextRequest(request.url, { headers: request.headers }).cookies.get(
    CSRF_COOKIE,
  )?.value;
  if (!cookie) throw new AccountError(403, "FORBIDDEN");
  return proofHmacWithSecret(config.secret, "browser", cookie);
}
export async function throttle(
  request: Request,
  scope: string,
  identifier: string,
  config: AuthConfig,
  limits: { identifier?: number; ip?: number; windowSeconds?: number },
) {
  const keys = getScopedThrottleKeys(scope, identifier, request, config, limits);
  if (!(await reserveLoginAttempt(keys)))
    throw new AccountError(429, "RATE_LIMITED", "Terlalu banyak percobaan. Coba lagi nanti.");
  return keys;
}
export function resultResponse(result: MutationResult, status = 200): NextResponse {
  const response = authJson(
    {
      ok: true,
      ...(result.data !== undefined ? { data: result.data } : {}),
      ...(result.redirectTo ? { redirectTo: result.redirectTo } : {}),
    },
    status,
  );
  if (result.rotation) setSessionCookie(response, result.rotation);
  if (result.clearSession) {
    response.cookies.set(SESSION_COOKIE, "", {
      ...sessionCookieOptions(),
      maxAge: 0,
      expires: new Date(0),
    });
    clearCsrf(response);
  }
  return response;
}
export function failureResponse(error: unknown) {
  if (error instanceof AccountError) {
    const response = authError(error.status, error.code, error.message);
    if (error.code === "RESEND_COOLDOWN") response.headers.set("Retry-After", "60");
    return response;
  }
  if (error instanceof z.ZodError)
    return authError(400, "INVALID_INPUT", "Data permintaan tidak valid.");
  return authUnavailable();
}
export function readConfig(config?: AuthConfig) {
  return config ?? getAuthConfig();
}
