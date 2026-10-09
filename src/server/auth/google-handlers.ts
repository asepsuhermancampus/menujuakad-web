import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { getAuthConfig } from "./request-policy";
import { startGoogleOAuth, readGoogleStartInput, completeGoogleOAuth } from "./google-service";
import { GoogleFlowError } from "./google-errors";
import { OAUTH_COOKIE, oauthCookieOptions } from "./oauth-state";
import {
  authJson,
  authError,
  authUnavailable,
  mutationAuthConfig,
  setSessionCookie,
  clearCsrf,
} from "./auth-http";
export async function handleGoogleStart(request: Request) {
  const config = mutationAuthConfig(request);
  if (config instanceof NextResponse) return config;
  let input;
  try {
    input = await readGoogleStartInput(request);
  } catch {
    return authError(400, "INVALID_INPUT", "Permintaan Google tidak valid.");
  }
  try {
    const flow = await startGoogleOAuth(request, input, config);
    const response = authJson({ ok: true, redirectTo: flow.redirectTo });
    response.cookies.set(OAUTH_COOKIE, flow.browser, oauthCookieOptions());
    return response;
  } catch (error) {
    if (error instanceof GoogleFlowError)
      return authError(
        error.code === "RATE_LIMITED" ? 429 : error.code === "SESSION_REQUIRED" ? 401 : 403,
        error.code,
        error.message,
      );
    return authUnavailable();
  }
}
export async function handleGoogleCallback(request: Request) {
  let location = "/login?error=google_unavailable";
  let result;
  try {
    const config = getAuthConfig();
    const query = new URL(request.url).searchParams;
    const valid =
      query.getAll("state").length === 1 &&
      query.getAll("code").length <= 1 &&
      query.getAll("error").length <= 1;
    try {
      result = await completeGoogleOAuth(
        request,
        {
          state: query.get("state") ?? "",
          code: valid ? (query.get("code") ?? undefined) : undefined,
          providerError: !valid || query.has("error"),
          browser: new NextRequest(request.url, { headers: request.headers }).cookies.get(
            OAUTH_COOKIE,
          )?.value,
        },
        config,
      );
      location = new URL(result.redirectTo, config.origin).href;
    } catch (error) {
      const code =
        error instanceof GoogleFlowError ? error.code.toLowerCase() : "google_unavailable";
      const target = error instanceof GoogleFlowError ? error.returnTo : "/login";
      location = new URL(`${target}?error=${code}`, config.origin).href;
    }
  } catch {}
  const response = new NextResponse(null, {
    status: 303,
    headers: { Location: location, "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" },
  });
  response.cookies.set(OAUTH_COOKIE, "", {
    ...oauthCookieOptions(),
    maxAge: 0,
    expires: new Date(0),
  });
  if (result && "token" in result && result.token && result.expiresAt)
    setSessionCookie(response, { token: result.token, expiresAt: result.expiresAt });
  else if (result) clearCsrf(response);
  return response;
}
