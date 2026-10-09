import "server-only";
import { NextRequest } from "next/server";
import { getAuthCapabilities } from "./capabilities";
import { getAuthConfig } from "./request-policy";
import { issueCsrf, CSRF_COOKIE, csrfCookieOptions } from "./csrf";
import { authJson, authError, authUnavailable } from "./auth-http";
export function handleCapabilities() {
  return authJson({ ok: true, data: getAuthCapabilities() });
}
export function handleCsrf(request: Request) {
  try {
    const config = getAuthConfig();
    const origin = request.headers.get("origin");
    const site = request.headers.get("sec-fetch-site");
    if ((origin && origin !== config.origin) || (site && site !== "same-origin" && site !== "none"))
      return authError(403, "FORBIDDEN", "Permintaan tidak diizinkan.");
    const existing = new NextRequest(request.url, { headers: request.headers }).cookies.get(
      CSRF_COOKIE,
    )?.value;
    const proof = issueCsrf(config, existing);
    const response = authJson({ ok: true, data: { csrfToken: proof.token } });
    response.cookies.set(CSRF_COOKIE, proof.cookie, csrfCookieOptions());
    return response;
  } catch {
    return authUnavailable();
  }
}
