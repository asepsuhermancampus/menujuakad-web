import "server-only";
import { NextResponse } from "next/server";
import { browserBinding, failureResponse } from "../account/http";
import { setPendingCookie } from "./otp-http";
import { emptyInput, parseInput } from "../account/account-input";
import {
  getScopedThrottleKeys,
  readLoginInput,
  readBoundedJson,
  type AuthConfig,
} from "./request-policy";
import {
  loginWithPassword,
  revokeSessionToken,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "./auth-service";
import {
  authJson,
  authError,
  authUnavailable,
  mutationAuthConfig,
  requestSessionToken,
  setSessionCookie,
  clearCsrf,
} from "./auth-http";
export async function handleLogin(request: Request, config?: AuthConfig): Promise<NextResponse> {
  const trusted = mutationAuthConfig(request, config);
  if (trusted instanceof NextResponse) return trusted;
  let input;
  try {
    input = await readLoginInput(request);
  } catch {
    return authError(400, "INVALID_INPUT", "Permintaan masuk tidak valid.");
  }
  try {
    const result = await loginWithPassword(
      input,
      getScopedThrottleKeys("login", input.identifier ?? input.email!, request, trusted),
      requestSessionToken(request),
      {
        browserHash: browserBinding(request, trusted),
        otpSendKeys: (phone) =>
          getScopedThrottleKeys("otp-send", phone, request, trusted, {
            identifier: 3,
            ip: 10,
            windowSeconds: 3600,
          }),
      },
    );
    if (!result.ok)
      return result.code === "RATE_LIMITED"
        ? authError(429, "RATE_LIMITED", "Terlalu banyak percobaan. Coba lagi nanti.")
        : authError(401, "INVALID_CREDENTIALS", "Identitas atau kata sandi tidak sesuai.");
    if (result.otpRequired) {
      const response = authJson(
        { ok: true, data: { otpRequired: true, ...result.challenge } },
        202,
      );
      response.cookies.set(SESSION_COOKIE, "", {
        ...sessionCookieOptions(),
        maxAge: 0,
        expires: new Date(0),
      });
      setPendingCookie(response, result.challenge.token);
      return response;
    }
    const response = authJson({ ok: true, redirectTo: result.redirectTo });
    setSessionCookie(response, result);
    return response;
  } catch (error) {
    return failureResponse(error);
  }
}
export async function handleLogout(request: Request, config?: AuthConfig): Promise<NextResponse> {
  const trusted = mutationAuthConfig(request, config);
  if (trusted instanceof NextResponse) return trusted;
  try {
    parseInput(emptyInput, await readBoundedJson(request));
  } catch {
    return authError(400, "INVALID_INPUT", "Data permintaan tidak valid.");
  }
  try {
    await revokeSessionToken(requestSessionToken(request));
    const response = authJson({ ok: true, redirectTo: "/login" });
    response.cookies.set(SESSION_COOKIE, "", {
      ...sessionCookieOptions(),
      maxAge: 0,
      expires: new Date(0),
    });
    clearCsrf(response);
    return response;
  } catch {
    return authUnavailable();
  }
}
