import "server-only";
import { NextRequest, NextResponse } from "next/server";
import {
  getAuthConfig,
  getThrottleKeys,
  readLoginInput,
  requireSameOrigin,
  type AuthConfig,
} from "./request-policy";
import {
  loginWithPassword,
  revokeSessionToken,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "./auth-service";
const json = (body: object, status = 200) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
const unavailable = () =>
  json({ ok: false, error: "Layanan masuk sementara tidak tersedia." }, 503);
function checkOrigin(request: Request, config?: AuthConfig): AuthConfig | NextResponse {
  let resolved: AuthConfig;
  try {
    resolved = config ?? getAuthConfig();
  } catch {
    return unavailable();
  }
  try {
    requireSameOrigin(request, resolved);
  } catch {
    return json({ ok: false, error: "Permintaan tidak diizinkan." }, 403);
  }
  return resolved;
}
export async function handleLogin(request: Request, config?: AuthConfig): Promise<NextResponse> {
  const trusted = checkOrigin(request, config);
  if (trusted instanceof NextResponse) return trusted;
  let input;
  try {
    input = await readLoginInput(request);
  } catch {
    return json({ ok: false, error: "Permintaan masuk tidak valid." }, 400);
  }
  try {
    const oldToken = new NextRequest(request.url, { headers: request.headers }).cookies.get(
      SESSION_COOKIE,
    )?.value;
    const result = await loginWithPassword(
      input,
      getThrottleKeys(input.email, request, trusted),
      oldToken,
    );
    if (!result.ok) return json({ ok: false, error: "Email atau kata sandi tidak sesuai." }, 401);
    const response = json({ ok: true, redirectTo: result.redirectTo });
    response.cookies.set(SESSION_COOKIE, result.token, {
      ...sessionCookieOptions(),
      expires: result.expiresAt,
    });
    return response;
  } catch {
    return unavailable();
  }
}
export async function handleLogout(request: Request, config?: AuthConfig): Promise<NextResponse> {
  const trusted = checkOrigin(request, config);
  if (trusted instanceof NextResponse) return trusted;
  try {
    await revokeSessionToken(
      new NextRequest(request.url, { headers: request.headers }).cookies.get(SESSION_COOKIE)?.value,
    );
    const response = json({ ok: true, redirectTo: "/login" });
    response.cookies.set(SESSION_COOKIE, "", {
      ...sessionCookieOptions(),
      maxAge: 0,
      expires: new Date(0),
    });
    return response;
  } catch {
    return unavailable();
  }
}
