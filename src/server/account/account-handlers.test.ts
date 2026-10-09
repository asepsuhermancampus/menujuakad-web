import { it, expect, vi, beforeEach } from "vitest";
vi.mock("server-only", () => ({}));
const state = vi.hoisted(() => ({
  mutation: vi.fn(),
  read: vi.fn(),
  session: vi.fn(),
  reserve: vi.fn(),
}));
vi.mock("./account-service", () => ({ accountMutation: state.mutation, readAccount: state.read }));
vi.mock("../auth/auth-repository", () => ({ reserveLoginAttempt: state.reserve }));
vi.mock("../auth/auth-service", () => ({
  getAuthSession: state.session,
  SESSION_COOKIE: "menujuakad_session",
  sessionCookieOptions: () => ({ httpOnly: true, path: "/", sameSite: "lax" }),
}));
import { handleAccount } from "./account-handlers";
import { issueCsrf } from "../auth/csrf";
const config = { origin: "https://example.invalid", secret: "s".repeat(48), trustProxy: false };
function request(body: unknown, csrf = true) {
  const issued = issueCsrf(config);
  return new Request(config.origin + "/api/account/profile", {
    method: "PATCH",
    headers: {
      origin: config.origin,
      "Content-Type": "application/json",
      ...(csrf ? { "X-CSRF-Token": issued.token, cookie: `menujuakad_csrf=${issued.cookie}` } : {}),
    },
    body: JSON.stringify(body),
  });
}
beforeEach(() => {
  state.mutation.mockReset();
  state.read.mockReset();
  state.reserve.mockResolvedValue(true);
  state.session.mockResolvedValue({ userId: "owner", sessionId: "s", tokenHash: "h" });
});
it("missing CSRF rejects before resolving session or touching database", async () => {
  const response = await handleAccount(request({ name: "A" }, false), "profile", config);
  expect(response.status).toBe(403);
  expect(state.mutation).not.toHaveBeenCalled();
  expect(response.headers.get("Cache-Control")).toBe("no-store");
});
it("missing session fails closed", async () => {
  state.session.mockResolvedValue(null);
  const response = await handleAccount(request({ name: "A" }), "profile", config);
  expect(response.status).toBe(401);
  expect(state.mutation).not.toHaveBeenCalled();
});
it("rotation sets HttpOnly cookie and never returns raw token JSON", async () => {
  state.mutation.mockResolvedValue({
    data: { id: "owner" },
    rotation: { token: "private-session", expiresAt: new Date(Date.now() + 60000) },
  });
  const response = await handleAccount(request({ name: "A" }), "profile", config);
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ ok: true, data: { id: "owner" } });
  expect(response.headers.get("Set-Cookie")).toContain("HttpOnly");
});
it("unknown database errors remain unavailable without stack or provider detail", async () => {
  state.mutation.mockRejectedValue(Error("credential-secret"));
  const response = await handleAccount(request({ name: "A" }), "profile", config);
  expect(response.status).toBe(503);
  expect(await response.text()).not.toContain("credential-secret");
});

it("DELETE accepts a missing body but refuses supplied privilege fields", async () => {
  const prototype = request({ userId: "foreign" });
  const body = JSON.stringify({ userId: "foreign" });
  const invalid = new Request(config.origin + "/api/account/sessions/s", {
    method: "DELETE",
    headers: prototype.headers,
    body,
  });
  expect((await handleAccount(invalid, "sessions/delete", config, "s")).status).toBe(400);
  expect(state.mutation).not.toHaveBeenCalled();
  state.mutation.mockResolvedValue({ clearSession: true, redirectTo: "/login" });
  const valid = new Request(config.origin + "/api/account/sessions/s", {
    method: "DELETE",
    headers: prototype.headers,
  });
  expect((await handleAccount(valid, "sessions/delete", config, "s")).status).toBe(200);
});
