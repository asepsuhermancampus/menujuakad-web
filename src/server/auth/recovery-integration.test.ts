import { PGlite } from "@electric-sql/pglite";
import { PrismaClient } from "@/generated/prisma/client";
import { beforeAll, afterAll, it, expect, vi } from "vitest";
import { workspaceTestAdapter } from "../../../tests/database/workspace-test-adapter";
import { applyAuthMigrations } from "../../../tests/database/auth-multimethod-fixture";
vi.mock("server-only", () => ({}));
const state = vi.hoisted(() => ({ client: null as unknown }));
vi.mock("@/server/db/client", () => ({ getPrisma: () => state.client }));
import { requestRecovery, resetPassword } from "./recovery-service";
import { verifyOtp, resendOtp } from "./otp-service";
import { requestAccountContact, verifyAccountContact } from "../account/contact-service";
import { verifyEmail, requestEmail } from "./verification-service";
import { hashPassword } from "./password-crypto";
import { createSessionToken, hashSessionToken } from "./session-crypto";
import { verifySessionToken, type AuthSession } from "./auth-service";
import { proofHmac } from "./proof-crypto";
import type { DeliveryProviders } from "../integrations/auth/providers";
const db = new PGlite();
let client: PrismaClient;
let auth: AuthSession;
let code = "";
let url = "";
const provider: DeliveryProviders = {
  email: {
    available: true,
    async send(i) {
      url = i.url;
      return { accepted: true, receiptId: "local-email" };
    },
  },
  sms: {
    available: true,
    async send(i) {
      code = i.code;
      return { accepted: true, receiptId: "local-sms" };
    },
  },
};
let browser: string;
let virtualTime = 0;
const timing = {
  now: () => virtualTime,
  wait: async (ms: number) => {
    virtualTime += ms;
  },
};
beforeAll(async () => {
  vi.stubEnv("AUTH_SECRET", "s".repeat(48));
  vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://example.invalid");
  browser = proofHmac("browser", "browser-context");
  await applyAuthMigrations(db);
  client = new PrismaClient({ adapter: workspaceTestAdapter(db) });
  state.client = client;
  const user = await client.user.create({
    data: {
      email: "old@example.invalid",
      emailVerifiedAt: new Date(),
      phone: "+6281111111111",
      phoneVerifiedAt: new Date(),
    },
  });
  await client.authCredential.create({
    data: { userId: user.id, passwordHash: await hashPassword("password-aman-uji") },
  });
  const token = createSessionToken();
  await client.userSession.create({
    data: {
      userId: user.id,
      tokenHash: hashSessionToken(token),
      expiresAt: new Date(Date.now() + 3600000),
      reauthenticatedAt: new Date(),
    },
  });
  auth = (await verifySessionToken(token))!;
}, 20000);
afterAll(async () => {
  vi.unstubAllEnvs();
  await client?.$disconnect();
  await db.close();
});
it("unknown phone recovery gives a bound synthetic challenge but never a reset proof", async () => {
  const result = await requestRecovery("+6281999999999", browser, provider, timing);
  expect(result).toMatchObject({ expiresIn: 300, resendAfter: 60 });
  await expect(
    verifyOtp({ token: "token" in result ? result.token : "", code: "000000" }, browser),
  ).rejects.toMatchObject({ status: 400 });
});
it("five wrong OTP attempts commit and exhaust even when concurrent", async () => {
  const result = await requestRecovery("+6281111111111", browser, provider, timing);
  const token = "token" in result ? String(result.token) : "";
  const sent = code;
  const wrong = sent === "000000" ? "111111" : "000000";
  await Promise.all(
    [1, 2, 3, 4, 5, 6].map(() => verifyOtp({ token, code: wrong }, browser).catch(() => null)),
  );
  const proof = await client.authVerificationToken.findUniqueOrThrow({
    where: { tokenHash: hashSessionToken(token) },
  });
  expect(proof.attempts).toBe(5);
  expect(proof.consumedAt).not.toBeNull();
  await expect(verifyOtp({ token, code: sent }, browser)).rejects.toMatchObject({ status: 400 });
});
it("verified contact swaps only after bound proof; replay and cross-purpose are rejected", async () => {
  const issued = await requestAccountContact(auth, "phone", "081222222222", browser, provider);
  expect((await client.user.findUniqueOrThrow({ where: { id: auth.userId } })).phone).toBe(
    "+6281111111111",
  );
  await expect(verifyOtp({ token: issued.token, code }, browser)).rejects.toMatchObject({
    status: 400,
  });
  await expect(
    verifyAccountContact(
      auth,
      "phone",
      { token: issued.token, code },
      proofHmac("browser", "other-browser"),
    ),
  ).rejects.toMatchObject({ status: 400 });
  const accepted = await verifyAccountContact(
    auth,
    "phone",
    { token: issued.token, code },
    browser,
  );
  expect(accepted.data).toMatchObject({ phone: "+6281222222222", phoneVerified: true });
  if (accepted.rotation) auth = (await verifySessionToken(accepted.rotation.token))!;
  await expect(
    verifyAccountContact(auth, "phone", { token: issued.token, code }, browser),
  ).rejects.toMatchObject({ status: 400 });
});
it("email change proof requires the same user and remains pending until verified", async () => {
  await requestAccountContact(auth, "email", "new@example.invalid", browser, provider);
  const token = new URL(url).hash.slice("#token=".length);
  expect((await client.user.findUniqueOrThrow({ where: { id: auth.userId } })).email).toBe(
    "old@example.invalid",
  );
  await expect(verifyEmail(token)).rejects.toMatchObject({ status: 400 });
  const result = await verifyAccountContact(auth, "email", { token }, browser);
  expect(result.data).toMatchObject({ email: "new@example.invalid", emailVerified: true });
  if (result.rotation) auth = (await verifySessionToken(result.rotation.token))!;
});
it("provider error invalidates pending proof and exposes no fake successful receipt", async () => {
  const broken: DeliveryProviders = {
    ...provider,
    email: {
      available: true,
      async send() {
        throw Error("secret");
      },
    },
  };
  await expect(
    requestAccountContact(auth, "email", "fail@example.invalid", browser, broken),
  ).rejects.toMatchObject({ status: 503 });
  const pending = await client.authVerificationToken.findFirstOrThrow({
    where: { identifier: "fail@example.invalid" },
  });
  expect(pending.consumedAt).not.toBeNull();
});
it("recovery of unverified or Google-only email is generic and sends no email", async () => {
  const google = await client.user.create({
    data: { email: "google@example.invalid", emailVerifiedAt: new Date() },
  });
  await client.authAccount.create({
    data: { userId: google.id, provider: "google", providerAccountId: "google-test" },
  });
  const send = vi.fn(provider.email.send);
  const p = { ...provider, email: { available: true, send } };
  const a = await requestRecovery("google@example.invalid", browser, p, timing);
  const b = await requestRecovery("unknown@example.invalid", browser, p, timing);
  expect(a).toEqual(b);
  expect(send).not.toHaveBeenCalled();
});
it("email ownership verification does not require password and cannot be replayed", async () => {
  const user = await client.user.create({ data: { email: "verify@example.invalid" } });
  const registrationToken = createSessionToken();
  await client.userSession.create({
    data: {
      userId: user.id,
      tokenHash: hashSessionToken(registrationToken),
      expiresAt: new Date(Date.now() + 3600000),
    },
  });
  const verifiedAuth = (await verifySessionToken(registrationToken))!;
  await requestEmail("verify@example.invalid", "register", verifiedAuth, browser, provider, timing);
  const token = new URL(url).hash.slice("#token=".length);
  await expect(verifyEmail(token)).rejects.toMatchObject({ status: 401 });
  await verifyEmail(token, verifiedAuth, browser);
  expect(
    (await client.user.findUniqueOrThrow({ where: { id: user.id } })).emailVerifiedAt,
  ).not.toBeNull();
  await expect(verifyEmail(token, verifiedAuth, browser)).rejects.toMatchObject({ status: 400 });
});
it("resend rejects early resend, replaces old OTP and preserves browser binding", async () => {
  await client.authVerificationToken.updateMany({
    where: { identifier: "+6281222222222" },
    data: { createdAt: new Date(Date.now() - 61000) },
  });
  const original = await requestRecovery("+6281222222222", browser, provider, timing);
  const token = "token" in original ? String(original.token) : "";
  await expect(resendOtp(token, browser, provider, undefined, timing)).rejects.toMatchObject({
    status: 429,
  });
  await client.authVerificationToken.update({
    where: { tokenHash: hashSessionToken(token) },
    data: { createdAt: new Date(Date.now() - 61000) },
  });
  const next = await resendOtp(token, browser, provider, undefined, timing);
  await expect(verifyOtp({ token, code }, browser)).rejects.toMatchObject({ status: 400 });
  const result = await verifyOtp({ token: next.token, code }, browser);
  expect(result.data).toMatchObject({ expiresIn: 600, resetToken: expect.any(String) });
  if (result.data && typeof result.data === "object" && "resetToken" in result.data) {
    await resetPassword({ token: result.data.resetToken, password: "password-reset-aman" });
  }
});
it("public recovery hides target delivery failure exactly like an unknown account", async () => {
  const known = await client.user.create({
    data: { email: "failure-known@example.invalid", emailVerifiedAt: new Date() },
  });
  await client.authCredential.create({
    data: { userId: known.id, passwordHash: await hashPassword("password-aman-uji") },
  });
  const failed: DeliveryProviders = {
    ...provider,
    email: {
      available: true,
      async send() {
        throw Error("provider-unavailable");
      },
    },
  };
  const a = await requestRecovery("failure-known@example.invalid", browser, failed, timing);
  const b = await requestRecovery("failure-unknown@example.invalid", browser, failed, timing);
  expect(a).toEqual(b);
  const proof = await client.authVerificationToken.findFirstOrThrow({
    where: { userId: known.id },
  });
  expect(proof.consumedAt).not.toBeNull();
});
it("reset proof becomes ineligible after the verified identifier changes", async () => {
  const token = createSessionToken();
  await client.authVerificationToken.create({
    data: {
      userId: auth.userId,
      identifier: "old@example.invalid",
      tokenHash: hashSessionToken(token),
      purpose: "PASSWORD_RESET",
      payload: { kind: "reset", delivery: "accepted" },
      expiresAt: new Date(Date.now() + 60000),
    },
  });
  await expect(resetPassword({ token, password: "password-test-aman" })).rejects.toMatchObject({
    status: 400,
  });
});
import { loginWithPassword } from "./auth-service";
import { rotatePasswordSession } from "./auth-repository";
it("OTP enabled login issues no session until browser-bound code is verified", async () => {
  const user = await client.user.create({
    data: { phone: "+6281333333333", phoneVerifiedAt: new Date(), smsOtpEnabled: true },
  });
  const hash = await hashPassword("password-otp-aman");
  await client.authCredential.create({ data: { userId: user.id, passwordHash: hash } });
  const pending = await loginWithPassword(
    { identifier: user.phone!, password: "password-otp-aman" },
    [],
    undefined,
    { browserHash: browser, providers: provider },
  );
  expect(pending).toMatchObject({ ok: true, otpRequired: true });
  expect(await client.userSession.count({ where: { userId: user.id } })).toBe(0);
  if (!pending.ok || !pending.otpRequired) throw Error("Expected pending OTP");
  await expect(
    verifyOtp({ token: pending.challenge.token, code }, proofHmac("browser", "another-browser")),
  ).rejects.toMatchObject({ status: 400 });
  expect(await client.userSession.count({ where: { userId: user.id } })).toBe(0);
  const result = await verifyOtp({ token: pending.challenge.token, code }, browser);
  expect(result.redirectTo).toBe("/dashboard");
  expect(await verifySessionToken(result.rotation!.token)).toMatchObject({ userId: user.id });
  await expect(verifyOtp({ token: pending.challenge.token, code }, browser)).rejects.toMatchObject({
    status: 400,
  });
});
it("missing SMS provider cannot bypass an opted-in factor", async () => {
  const user = await client.user.create({
    data: { phone: "+6281444444444", phoneVerifiedAt: new Date(), smsOtpEnabled: true },
  });
  await client.authCredential.create({
    data: { userId: user.id, passwordHash: await hashPassword("password-otp-aman") },
  });
  const absent: DeliveryProviders = {
    ...provider,
    sms: {
      available: false,
      async send() {
        throw Error("must not be called");
      },
    },
  };
  await expect(
    loginWithPassword({ identifier: user.phone!, password: "password-otp-aman" }, [], undefined, {
      browserHash: browser,
      providers: absent,
    }),
  ).rejects.toMatchObject({ status: 503 });
  expect(await client.userSession.count({ where: { userId: user.id } })).toBe(0);
});
it("factor enable race blocks password-only issuance under user lock", async () => {
  const user = await client.user.findUniqueOrThrow({
    where: { phone: "+6281444444444" },
    include: { credential: true },
  });
  expect(
    await rotatePasswordSession(
      {
        userId: user.id,
        tokenHash: hashSessionToken(createSessionToken()),
        expiresAt: new Date(Date.now() + 60000),
        reauthenticatedAt: new Date(),
      },
      user.credential!.passwordHash,
    ),
  ).toBeNull();
  expect(await client.userSession.count({ where: { userId: user.id } })).toBe(0);
});
it("pending OTP login cannot survive a password version change", async () => {
  const user = await client.user.create({
    data: { phone: "+6281555555555", phoneVerifiedAt: new Date(), smsOtpEnabled: true },
  });
  const hash = await hashPassword("password-otp-aman");
  await client.authCredential.create({ data: { userId: user.id, passwordHash: hash } });
  const pending = await loginWithPassword(
    { identifier: user.phone!, password: "password-otp-aman" },
    [],
    undefined,
    { browserHash: browser, providers: provider },
  );
  if (!pending.ok || !pending.otpRequired) throw Error("Expected pending OTP");
  await client.authCredential.update({
    where: { userId: user.id },
    data: { passwordHash: await hashPassword("password-updated-aman") },
  });
  await expect(verifyOtp({ token: pending.challenge.token, code }, browser)).rejects.toMatchObject({
    status: 400,
  });
  expect(await client.userSession.count({ where: { userId: user.id } })).toBe(0);
});
it("recovery resend after exhausted guesses sends a new code without reviving the old one", async () => {
  const user = await client.user.create({
    data: { phone: "+6281777777777", phoneVerifiedAt: new Date() },
  });
  await client.authCredential.create({
    data: { userId: user.id, passwordHash: await hashPassword("password-otp-aman") },
  });
  const initial = await requestRecovery(user.phone!, browser, provider, timing);
  const token = "token" in initial ? String(initial.token) : "";
  const oldCode = code;
  const wrong = oldCode === "000000" ? "111111" : "000000";
  for (let i = 0; i < 5; i++) await verifyOtp({ token, code: wrong }, browser).catch(() => null);
  await client.authVerificationToken.update({
    where: { tokenHash: hashSessionToken(token) },
    data: { createdAt: new Date(Date.now() - 61000) },
  });
  const next = await resendOtp(token, browser, provider, undefined, timing);
  const newCode = code;
  await expect(verifyOtp({ token, code: oldCode }, browser)).rejects.toMatchObject({ status: 400 });
  expect(await verifyOtp({ token: next.token, code: newCode }, browser)).toMatchObject({
    data: { resetToken: expect.any(String) },
  });
});
it("anonymous registration verification request is denied before any proof is issued", async () => {
  await expect(
    requestEmail("blocked@example.invalid", "register", undefined, browser, provider, timing),
  ).rejects.toMatchObject({ status: 401 });
  expect(
    await client.authVerificationToken.count({ where: { identifier: "blocked@example.invalid" } }),
  ).toBe(0);
});
it("initial email verification refuses a different session belonging to the same user", async () => {
  const user = await client.user.create({ data: { email: "session-bound@example.invalid" } });
  const originalToken = createSessionToken(),
    otherToken = createSessionToken();
  for (const token of [originalToken, otherToken])
    await client.userSession.create({
      data: {
        userId: user.id,
        tokenHash: hashSessionToken(token),
        expiresAt: new Date(Date.now() + 3600000),
      },
    });
  const original = (await verifySessionToken(originalToken))!,
    other = (await verifySessionToken(otherToken))!;
  await requestEmail(user.email!, "register", original, browser, provider, timing);
  const token = new URL(url).hash.slice("#token=".length);
  await expect(verifyEmail(token, other, browser)).rejects.toMatchObject({ status: 400 });
  expect(
    (await client.user.findUniqueOrThrow({ where: { id: user.id } })).emailVerifiedAt,
  ).toBeNull();
  await expect(
    verifyEmail(token, original, proofHmac("browser", "foreign-context")),
  ).rejects.toMatchObject({ status: 400 });
  await verifyEmail(token, original, browser);
  expect(
    (await client.user.findUniqueOrThrow({ where: { id: user.id } })).emailVerifiedAt,
  ).not.toBeNull();
});
it("unknown and eligible recovery resend share the uniform response duration floor", async () => {
  const user = await client.user.create({
    data: { phone: "+6281888888888", phoneVerifiedAt: new Date() },
  });
  await client.authCredential.create({
    data: { userId: user.id, passwordHash: await hashPassword("password-otp-aman") },
  });
  for (const phone of [user.phone!, "+6281999888777"]) {
    const issued = await requestRecovery(phone, browser, provider, timing);
    const token = "token" in issued ? String(issued.token) : "";
    await client.authVerificationToken.update({
      where: { tokenHash: hashSessionToken(token) },
      data: { createdAt: new Date(Date.now() - 61000) },
    });
    const started = virtualTime;
    await resendOtp(token, browser, provider, undefined, timing);
    expect(virtualTime - started).toBe(11000);
  }
});
