import { it, expect, vi, beforeEach } from "vitest";
vi.mock("server-only", () => ({}));
const state = vi.hoisted(() => ({
  recovery: vi.fn(),
  email: vi.fn(),
  contact: vi.fn(),
  reserve: vi.fn(),
  auth: vi.fn(),
}));
vi.mock("./auth-repository", () => ({ reserveLoginAttempt: state.reserve }));
vi.mock("./recovery-service", () => ({
  requestRecovery: state.recovery,
  resetPassword: vi.fn(),
  recoveryMessage: "Jika akun dapat dipulihkan, petunjuk akan dikirim.",
}));
vi.mock("./verification-service", () => ({ requestEmail: state.email, verifyEmail: vi.fn() }));
vi.mock("../account/contact-service", () => ({
  requestAccountContact: state.contact,
  verifyAccountContact: vi.fn(),
  requestPhoneVerification: vi.fn(),
  otpInput: {},
}));
vi.mock("./auth-service", () => ({
  getAuthSession: state.auth,
  SESSION_COOKIE: "menujuakad_session",
  SESSION_MAX_AGE: 604800,
  sessionCookieOptions: () => ({ httpOnly: true, path: "/", sameSite: "lax" }),
}));
import { handleRecovery } from "./recovery-handlers";
import { handleAccount } from "../account/account-handlers";
import { issueCsrf } from "./csrf";
const config = { origin: "https://example.invalid", secret: "s".repeat(48), trustProxy: false };
function request(path: string, body: unknown) {
  const issued = issueCsrf(config);
  return new Request(config.origin + path, {
    method: "POST",
    headers: {
      origin: config.origin,
      "Content-Type": "application/json",
      "X-CSRF-Token": issued.token,
      cookie: `menujuakad_csrf=${issued.cookie}`,
    },
    body: JSON.stringify(body),
  });
}
beforeEach(() => {
  vi.stubEnv("AUTH_SECRET", config.secret);
  vi.stubEnv("NEXT_PUBLIC_APP_URL", config.origin);
  state.reserve.mockResolvedValue(true);
  state.auth.mockResolvedValue({ userId: "owner", sessionId: "s", tokenHash: "h" });
});
it("account email request drops the email bearer token from JSON", async () => {
  state.contact.mockResolvedValue({
    token: "private-email-proof",
    expiresIn: 86400,
    resendAfter: 60,
  });
  const response = await handleAccount(
    request("/api/account/email/request", { email: "test@example.invalid" }),
    "email/request",
    config,
  );
  expect(response.status).toBe(202);
  const text = await response.text();
  expect(text).not.toContain("private-email-proof");
  expect(text).not.toContain("token");
});
it("email register send response never returns a bearer token", async () => {
  state.email.mockResolvedValue({ token: "private-email-proof" });
  const response = await handleRecovery(
    request("/api/auth/email/request", { identifier: "test@example.invalid", purpose: "register" }),
    "email/request",
    config,
  );
  expect(response.status).toBe(202);
  expect(await response.text()).not.toContain("token");
});
it("SMS account request returns only the opaque challenge contract", async () => {
  state.contact.mockResolvedValue({ token: "opaque-challenge", expiresIn: 300, resendAfter: 60 });
  const response = await handleAccount(
    request("/api/account/phone/otp", { phone: "081234567890" }),
    "phone/otp",
    config,
  );
  expect(response.status).toBe(202);
  expect(await response.json()).toEqual({
    ok: true,
    data: { token: "opaque-challenge", expiresIn: 300, resendAfter: 60 },
  });
});
