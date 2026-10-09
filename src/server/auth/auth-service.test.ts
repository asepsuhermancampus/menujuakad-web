import { describe, expect, it, vi, beforeEach } from "vitest";
vi.mock("server-only", () => ({}));
const store = vi.hoisted(() => ({
  reserveLoginAttempt: vi.fn(),
  releaseSuccessfulEmailAttempt: vi.fn(),
  findCredential: vi.fn(),
  findSession: vi.fn(),
  createSession: vi.fn(),
  rotatePasswordSession: vi.fn(),
  deleteSession: vi.fn(),
  beginPasswordOtpLogin: vi.fn(),
}));
vi.mock("./auth-repository", () => store);
vi.mock("./otp-service", () => ({ beginPasswordOtpLogin: store.beginPasswordOtpLogin }));
import { loginWithPassword, verifySessionToken, revokeSessionToken } from "./auth-service";
import { hashPassword } from "./password-crypto";
import { createHash } from "node:crypto";
const input = { email: "user@example.invalid", password: "dummy-uji!", next: "/admin" };
beforeEach(() => {
  vi.resetAllMocks();
  store.reserveLoginAttempt.mockResolvedValue(true);
  store.rotatePasswordSession.mockResolvedValue({ id: "u", role: "CUSTOMER", status: "ACTIVE" });
});
describe("server authentication", () => {
  it("gives identical denial for unknown, wrong password and suspended users", async () => {
    const hash = await hashPassword(input.password);
    for (const record of [
      null,
      { passwordHash: hash, user: { id: "u", role: "CUSTOMER", status: "SUSPENDED" } },
      { passwordHash: hash, user: { id: "u", role: "CUSTOMER", status: "ACTIVE" } },
    ]) {
      store.findCredential.mockResolvedValue(record);
      expect(await loginWithPassword({ ...input, password: "wrong" }, [], undefined)).toEqual({
        ok: false,
      });
    }
  });
  it("rotates opaque session and returns role-safe redirect without identity", async () => {
    store.findCredential.mockResolvedValue({
      passwordHash: await hashPassword(input.password),
      user: { id: "u", role: "CUSTOMER", status: "ACTIVE" },
    });
    const oldToken = "a".repeat(43);
    const result = await loginWithPassword(
      input,
      [
        { keyHash: "email-hash", limit: 5 },
        { keyHash: "ip-hash", limit: 100 },
      ],
      oldToken,
    );
    expect(result).toMatchObject({ ok: true, redirectTo: "/dashboard" });
    if (!result.ok || result.otpRequired) throw new Error("login failed");
    expect(result.token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(result.token).not.toBe(oldToken);
    expect(store.releaseSuccessfulEmailAttempt).toHaveBeenCalledWith("email-hash");
    expect(store.rotatePasswordSession.mock.calls[0][0]).toMatchObject({
      userId: "u",
      tokenHash: createHash("sha256").update(result.token).digest("hex"),
    });
    expect(store.rotatePasswordSession.mock.calls[0][2]).toBe(
      createHash("sha256").update(oldToken).digest("hex"),
    );
  });
  it("denies throttled request before expensive hashing or account lookup", async () => {
    store.reserveLoginAttempt.mockResolvedValue(false);
    expect(await loginWithPassword(input, [], undefined)).toEqual({
      ok: false,
      code: "RATE_LIMITED",
    });
    expect(store.findCredential).not.toHaveBeenCalled();
  });
  it("rechecks ACTIVE, expiry and database revocation each time", async () => {
    const token = "a".repeat(43);
    const row = {
      expiresAt: new Date(Date.now() + 60000),
      user: { id: "u", role: "SUPERADMIN", status: "ACTIVE" },
    };
    store.findSession.mockResolvedValue(row);
    expect(await verifySessionToken(token)).toMatchObject({ userId: "u", role: "SUPERADMIN" });
    for (const record of [
      null,
      { ...row, expiresAt: new Date(0) },
      { ...row, user: { ...row.user, status: "SUSPENDED" } },
    ]) {
      store.findSession.mockResolvedValue(record);
      expect(await verifySessionToken(token)).toBeNull();
    }
    expect(await verifySessionToken("role=SUPERADMIN")).toBeNull();
  });
  it("rejects tampered token and deletes only hashed token on logout", async () => {
    store.findSession.mockResolvedValue(null);
    expect(await verifySessionToken("b".repeat(43))).toBeNull();
    await revokeSessionToken("a".repeat(43));
    expect(store.deleteSession).toHaveBeenCalledWith(
      createHash("sha256").update("a".repeat(43)).digest("hex"),
    );
  });
});

it("suspended account cannot log in even with matching password", async () => {
  store.findCredential.mockResolvedValue({
    passwordHash: await hashPassword(input.password),
    user: { id: "u", role: "CUSTOMER", status: "SUSPENDED" },
  });
  expect(await loginWithPassword(input, [], undefined)).toEqual({ ok: false });
  expect(store.createSession).not.toHaveBeenCalled();
});
it("rejects malformed cookie before database lookup", async () => {
  expect(await verifySessionToken("a".repeat(43) + "\n")).toBeNull();
  expect(store.findSession).not.toHaveBeenCalled();
});

it("accepts CLIENT and VENDOR from database and rejects revoked sessions", async () => {
  const row = {
    id: "s",
    tokenHash: "hash",
    reauthenticatedAt: new Date(),
    revokedAt: null,
    expiresAt: new Date(Date.now() + 60000),
    user: { id: "u", status: "ACTIVE", role: "CLIENT" },
  };
  store.findSession.mockResolvedValue(row);
  expect(await verifySessionToken("a".repeat(43))).toMatchObject({
    userId: "u",
    role: "CLIENT",
    sessionId: "s",
  });
  store.findSession.mockResolvedValue({ ...row, user: { ...row.user, role: "VENDOR" } });
  expect(await verifySessionToken("a".repeat(43))).toMatchObject({ role: "VENDOR" });
  store.findSession.mockResolvedValue({ ...row, revokedAt: new Date() });
  expect(await verifySessionToken("a".repeat(43))).toBeNull();
});

it("SMS-enabled password proof returns only pending challenge and never issues full session", async () => {
  const passwordHash = await hashPassword(input.password);
  store.findCredential.mockResolvedValue({
    passwordHash,
    user: {
      id: "u",
      role: "CLIENT",
      status: "ACTIVE",
      smsOtpEnabled: true,
      phone: "+6281234567890",
      phoneVerifiedAt: new Date(),
    },
  });
  store.beginPasswordOtpLogin.mockResolvedValue({
    token: "opaque-challenge",
    expiresIn: 300,
    resendAfter: 60,
  });
  const result = await loginWithPassword(input, [], undefined, { browserHash: "browser-bound" });
  expect(result).toEqual({
    ok: true,
    otpRequired: true,
    challenge: { token: "opaque-challenge", expiresIn: 300, resendAfter: 60 },
  });
  expect(store.rotatePasswordSession).not.toHaveBeenCalled();
});
it("SMS-enabled login cannot bypass provider failure or missing browser context", async () => {
  const passwordHash = await hashPassword(input.password);
  store.findCredential.mockResolvedValue({
    passwordHash,
    user: { id: "u", role: "CLIENT", status: "ACTIVE", smsOtpEnabled: true },
  });
  store.beginPasswordOtpLogin.mockRejectedValue(new Error("Provider unavailable"));
  await expect(
    loginWithPassword(input, [], undefined, { browserHash: "browser-bound" }),
  ).rejects.toThrow();
  await expect(loginWithPassword(input, [], undefined)).rejects.toThrow();
  expect(store.rotatePasswordSession).not.toHaveBeenCalled();
});
