import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
const service = vi.hoisted(() => ({
  loginWithPassword: vi.fn(),
  revokeSessionToken: vi.fn(),
  SESSION_COOKIE: "menujuakad_session",
  sessionCookieOptions: () => ({
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 604800,
  }),
}));
vi.mock("./auth-service", () => service);
import { handleLogin, handleLogout } from "./auth-handlers";
const config = { origin: "https://menujuakad.com", secret: "a".repeat(32), trustProxy: false };
function request(
  origin = config.origin,
  body = JSON.stringify({ email: "user@example.invalid", password: "dummy-password" }),
) {
  return new Request(`${config.origin}/api/auth/login`, {
    method: "POST",
    headers: { origin, "content-type": "application/json", cookie: "menujuakad_session=old" },
    body,
  });
}
beforeEach(() => {
  vi.resetAllMocks();
});
describe("HTTP auth handlers", () => {
  it("rejects cross-origin login and logout before services", async () => {
    expect((await handleLogin(request("https://evil.example"), config)).status).toBe(403);
    expect((await handleLogout(request("https://evil.example"), config)).status).toBe(403);
    expect(service.loginWithPassword).not.toHaveBeenCalled();
    expect(service.revokeSessionToken).not.toHaveBeenCalled();
  });
  it("never reflects account existence or DB errors", async () => {
    service.loginWithPassword.mockResolvedValue({ ok: false });
    const denied = await handleLogin(request(), config);
    expect(denied.status).toBe(401);
    expect(await denied.json()).toEqual({
      ok: false,
      error: "Email atau kata sandi tidak sesuai.",
    });
    service.loginWithPassword.mockRejectedValue(new Error("postgres://private-secret"));
    const failed = await handleLogin(request(), config);
    expect(failed.status).toBe(503);
    expect(JSON.stringify(await failed.json())).not.toContain("private-secret");
  });
  it("returns only redirect and sets opaque HttpOnly cookie", async () => {
    service.loginWithPassword.mockResolvedValue({
      ok: true,
      token: "a".repeat(43),
      expiresAt: new Date(Date.now() + 604800000),
      redirectTo: "/dashboard",
    });
    const response = await handleLogin(request(), config);
    expect(await response.json()).toEqual({ ok: true, redirectTo: "/dashboard" });
    expect(response.headers.get("set-cookie")).toContain("HttpOnly");
    expect(response.headers.get("set-cookie")).toContain("Secure");
    expect(response.headers.get("cache-control")).toContain("no-store");
  });
  it("clears cookie and server session on logout", async () => {
    const response = await handleLogout(request(), config);
    expect(response.status).toBe(200);
    expect(response.headers.get("set-cookie")).toContain("Max-Age=0");
    expect(service.revokeSessionToken).toHaveBeenCalledWith("old");
  });
  it("rejects malformed body", async () => {
    expect((await handleLogin(request(config.origin, "{}"), config)).status).toBe(400);
    expect(service.loginWithPassword).not.toHaveBeenCalled();
  });
});

it("does not claim logout success when DB revocation fails", async () => {
  service.revokeSessionToken.mockRejectedValue(new Error("DB private"));
  const response = await handleLogout(request(), config);
  expect(response.status).toBe(503);
  expect(response.headers.get("set-cookie")).toBeNull();
});
