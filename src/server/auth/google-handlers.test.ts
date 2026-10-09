import { expect, it, vi, beforeEach, afterEach } from "vitest";
vi.mock("server-only", () => ({}));
const service = vi.hoisted(() => ({ startGoogleOAuth: vi.fn(), completeGoogleOAuth: vi.fn() }));
vi.mock("./google-service", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./google-service")>()),
  ...service,
}));
import { handleGoogleStart, handleGoogleCallback } from "./google-handlers";
import { issueCsrf, CSRF_COOKIE } from "./csrf";
import { GoogleFlowError } from "./google-errors";
const origin = "https://menujuakad.com";
beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("AUTH_SECRET", "x".repeat(32));
  vi.stubEnv("NEXT_PUBLIC_APP_URL", origin);
});
afterEach(() => vi.unstubAllEnvs());
it("Google unavailable fails closed; start rejects role input and missing CSRF", async () => {
  const proof = issueCsrf();
  const request = (body: object, csrf = true) =>
    new Request(origin + "/api/auth/google/start", {
      method: "POST",
      headers: {
        origin,
        "content-type": "application/json",
        ...(csrf ? { "x-csrf-token": proof.token } : {}),
        cookie: `${CSRF_COOKIE}=${proof.cookie}`,
      },
      body: JSON.stringify(body),
    });
  expect((await handleGoogleStart(request({ intent: "login" }, false))).status).toBe(403);
  expect((await handleGoogleStart(request({ intent: "login", role: "SUPERADMIN" }))).status).toBe(
    400,
  );
  service.startGoogleOAuth.mockRejectedValue(new Error("client-secret-private"));
  const r = await handleGoogleStart(request({ intent: "login" }));
  expect(r.status).toBe(503);
  expect(JSON.stringify(await r.json())).not.toContain("private");
});
it("callback redirects from configured origin and never forwards code/state/token or provider error", async () => {
  service.completeGoogleOAuth.mockRejectedValue(new GoogleFlowError("GOOGLE_CONFLICT"));
  const r = await handleGoogleCallback(
    new Request(
      origin + "/api/auth/google/callback?state=secretstate&code=secretcode&error=private",
      { headers: { host: "evil.example" } },
    ),
  );
  expect(r.status).toBe(303);
  expect(r.headers.get("location")).toBe(origin + "/login?error=google_conflict");
  expect(r.headers.get("referrer-policy")).toBe("no-referrer");
});
it("callback session success sets HttpOnly cookie and local role redirect", async () => {
  service.completeGoogleOAuth.mockResolvedValue({
    token: "a".repeat(43),
    expiresAt: new Date(Date.now() + 60000),
    redirectTo: "/dashboard",
  });
  const r = await handleGoogleCallback(
    new Request(origin + "/api/auth/google/callback?state=s&code=c"),
  );
  expect(r.status).toBe(303);
  expect(r.headers.get("location")).toBe(origin + "/dashboard");
  expect(r.headers.get("set-cookie")).toContain("HttpOnly");
  expect(r.headers.get("cache-control")).toBe("no-store");
});
