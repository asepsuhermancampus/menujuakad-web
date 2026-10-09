import { PGlite } from "@electric-sql/pglite";
import { PrismaClient } from "@/generated/prisma/client";
import { beforeAll, afterAll, it, expect, vi } from "vitest";
import { workspaceTestAdapter } from "../../../tests/database/workspace-test-adapter";
import { applyAuthMigrations } from "../../../tests/database/auth-multimethod-fixture";
vi.mock("server-only", () => ({}));
const state = vi.hoisted(() => ({ client: null as unknown }));
vi.mock("@/server/db/client", () => ({ getPrisma: () => state.client }));
import { accountMutation, readAccount } from "./account-service";
import { hashPassword, verifyPassword } from "../auth/password-crypto";
import { createSessionToken, hashSessionToken } from "../auth/session-crypto";
import { verifySessionToken, type AuthSession } from "../auth/auth-service";
import { resetPassword } from "../auth/recovery-service";
const db = new PGlite();
let client: PrismaClient;
let session: AuthSession;
let rawSession: string;
beforeAll(async () => {
  await applyAuthMigrations(db);
  client = new PrismaClient({ adapter: workspaceTestAdapter(db) });
  state.client = client;
  const user = await client.user.create({
    data: { email: "account@example.invalid", emailVerifiedAt: new Date(), name: "Uji" },
  });
  await client.authCredential.create({
    data: { userId: user.id, passwordHash: await hashPassword("password-awal-aman") },
  });
  rawSession = createSessionToken();
  await client.userSession.create({
    data: {
      userId: user.id,
      tokenHash: hashSessionToken(rawSession),
      expiresAt: new Date(Date.now() + 3600000),
      reauthenticatedAt: new Date(),
    },
  });
  session = (await verifySessionToken(rawSession))!;
}, 20000);
afterAll(async () => {
  await client?.$disconnect();
  await db.close();
});
it("profile rejects privilege fields and reads only safe DTO", async () => {
  await expect(
    accountMutation(session, "profile", { name: "X", role: "SUPERADMIN" }),
  ).rejects.toMatchObject({ status: 400 });
  const result = await accountMutation(session, "profile", { name: " Nama baru " });
  expect(result.data).toMatchObject({ name: "Nama baru", emailVerified: true });
  expect(await readAccount(session, "security")).toMatchObject({
    hasPassword: true,
    googleLinked: false,
  });
});
it("last verified password identifier cannot be removed", async () => {
  await expect(accountMutation(session, "email/unlink", {})).rejects.toMatchObject({ status: 409 });
  expect((await client.user.findUniqueOrThrow({ where: { id: session.userId } })).email).toBe(
    "account@example.invalid",
  );
});
it("other user session revoke is indistinguishable from missing", async () => {
  await expect(accountMutation(session, "sessions/delete", {}, "not-owned")).rejects.toMatchObject({
    status: 404,
  });
});
it("stale reauth and concurrently revoked bound sessions cannot mutate", async () => {
  await client.userSession.update({
    where: { id: session.sessionId },
    data: { reauthenticatedAt: new Date(Date.now() - 310000) },
  });
  await expect(accountMutation(session, "google/unlink", {})).rejects.toMatchObject({
    status: 403,
  });
  await client.userSession.update({
    where: { id: session.sessionId },
    data: { reauthenticatedAt: new Date(), revokedAt: new Date() },
  });
  await expect(accountMutation(session, "profile", { name: "revoked" })).rejects.toMatchObject({
    status: 401,
  });
  await client.userSession.update({ where: { id: session.sessionId }, data: { revokedAt: null } });
});
it("reset proof changes credential and revokes all sessions atomically, once", async () => {
  const token = createSessionToken();
  await client.authVerificationToken.create({
    data: {
      tokenHash: hashSessionToken(token),
      purpose: "PASSWORD_RESET",
      userId: session.userId,
      identifier: "account@example.invalid",
      payload: { kind: "reset", delivery: "accepted" },
      expiresAt: new Date(Date.now() + 100000),
    },
  });
  const results = await Promise.allSettled(
    [1, 2].map(() => resetPassword({ token, password: "password-baru-aman" })),
  );
  expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
  const credential = await client.authCredential.findUniqueOrThrow({
    where: { userId: session.userId },
  });
  expect(await verifyPassword("password-baru-aman", credential.passwordHash)).toBe(true);
  expect(await verifySessionToken(rawSession)).toBeNull();
  expect(
    await client.authVerificationToken.findUnique({
      where: { tokenHash: hashSessionToken(token) },
    }),
  ).toMatchObject({ consumedAt: expect.any(Date) });
});
async function fixture(
  options: { credential?: boolean; google?: boolean; verified?: boolean } = {
    credential: true,
    verified: true,
  },
) {
  const token = createSessionToken();
  const user = await client.user.create({
    data: {
      email: `${token.slice(0, 10).toLowerCase()}@example.invalid`,
      emailVerifiedAt: options.verified ? new Date() : null,
    },
  });
  if (options.credential)
    await client.authCredential.create({
      data: { userId: user.id, passwordHash: await hashPassword("password-awal-aman") },
    });
  if (options.google)
    await client.authAccount.create({
      data: { userId: user.id, provider: "google", providerAccountId: token },
    });
  const expiresAt = new Date(Date.now() + 3600000);
  await client.userSession.create({
    data: {
      userId: user.id,
      tokenHash: hashSessionToken(token),
      expiresAt,
      reauthenticatedAt: new Date(),
    },
  });
  return { user, token, auth: (await verifySessionToken(token))!, expiresAt };
}
it("password reauth rotates opaque token while preserving absolute expiry", async () => {
  const f = await fixture();
  await client.userSession.update({
    where: { id: f.auth.sessionId },
    data: { reauthenticatedAt: new Date(Date.now() - 600000) },
  });
  const result = await accountMutation(f.auth, "reauthenticate", {
    password: "password-awal-aman",
  });
  expect(result.rotation?.expiresAt).toEqual(f.expiresAt);
  expect(result.data).toMatchObject({ reauthenticatedUntil: expect.any(String) });
  expect(await verifySessionToken(f.token)).toBeNull();
  expect(await verifySessionToken(result.rotation!.token)).toMatchObject({ userId: f.user.id });
});
it("password change requires old proof, revokes others and rotates current atomically", async () => {
  const f = await fixture();
  const other = createSessionToken();
  await client.userSession.create({
    data: { userId: f.user.id, tokenHash: hashSessionToken(other), expiresAt: f.expiresAt },
  });
  await expect(
    accountMutation(f.auth, "password", { password: "password-baru-aman" }),
  ).rejects.toMatchObject({ status: 401 });
  const result = await accountMutation(f.auth, "password", {
    password: "password-baru-aman",
    currentPassword: "password-awal-aman",
  });
  expect(await verifySessionToken(f.token)).toBeNull();
  expect(await verifySessionToken(other)).toBeNull();
  expect(await verifySessionToken(result.rotation!.token)).not.toBeNull();
});
it("credentialless account without linked Google cannot set a password", async () => {
  const f = await fixture({ verified: true });
  await expect(
    accountMutation(f.auth, "password", { password: "password-set-aman" }),
  ).rejects.toMatchObject({ status: 403 });
  expect(await client.authCredential.findUnique({ where: { userId: f.user.id } })).toBeNull();
});
it("Google-only requires verified identifier to add credential", async () => {
  const f = await fixture({ google: true, verified: false });
  await expect(
    accountMutation(f.auth, "password", { password: "password-set-aman" }),
  ).rejects.toMatchObject({ status: 409 });
  await client.user.update({ where: { id: f.user.id }, data: { emailVerifiedAt: new Date() } });
  const result = await accountMutation(f.auth, "password", { password: "password-set-aman" });
  expect(result.rotation).toBeDefined();
  expect(await client.authCredential.findUnique({ where: { userId: f.user.id } })).not.toBeNull();
});
it("parallel removal cannot leave an account with zero login methods", async () => {
  const f = await fixture({ credential: true, google: true, verified: true });
  const result = await Promise.allSettled(
    ["google/unlink", "email/unlink"].map((op) => accountMutation(f.auth, op, {})),
  );
  expect(result.filter((r) => r.status === "fulfilled")).toHaveLength(1);
  const user = await client.user.findUniqueOrThrow({
    where: { id: f.user.id },
    include: { credential: true, authAccounts: true },
  });
  expect(
    Boolean(
      user.authAccounts.length ||
      (user.credential && (user.emailVerifiedAt || user.phoneVerifiedAt)),
    ),
  ).toBe(true);
});
it("deleting own current session is allowed without fresh reauth and clears cookie contract", async () => {
  const f = await fixture();
  await client.userSession.update({
    where: { id: f.auth.sessionId },
    data: { reauthenticatedAt: null },
  });
  const result = await accountMutation(f.auth, "sessions/delete", {}, f.auth.sessionId);
  expect(result).toMatchObject({ clearSession: true, redirectTo: "/login" });
  expect(await verifySessionToken(f.token)).toBeNull();
});
it("SMS opt-in fails closed when the SMS provider is not configured", async () => {
  const f = await fixture();
  await expect(accountMutation(f.auth, "security", { smsOtpEnabled: true })).rejects.toMatchObject({
    status: 503,
  });
  expect(await readAccount(f.auth, "security")).toMatchObject({ smsOtpEnabled: false });
});
it("OTP opt-in flag persists, invalidates pending proof and rotates only current session", async () => {
  vi.stubEnv("AUTH_SECRET", "s".repeat(48));
  vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://example.invalid");
  vi.stubEnv("TWILIO_ACCOUNT_SID", "AC" + "a".repeat(32));
  vi.stubEnv("TWILIO_AUTH_TOKEN", "b".repeat(32));
  vi.stubEnv("TWILIO_FROM_NUMBER", "+6281000000000");
  const f = await fixture();
  await client.user.update({
    where: { id: f.user.id },
    data: { phone: "+6281666666666", phoneVerifiedAt: new Date() },
  });
  const other = createSessionToken();
  await client.userSession.create({
    data: { userId: f.user.id, tokenHash: hashSessionToken(other), expiresAt: f.expiresAt },
  });
  const proof = await client.authVerificationToken.create({
    data: {
      userId: f.user.id,
      tokenHash: hashSessionToken(createSessionToken()),
      purpose: "PHONE_OTP",
      payload: { kind: "password-login", delivery: "accepted" },
      expiresAt: new Date(Date.now() + 60000),
    },
  });
  const enabled = await accountMutation(f.auth, "security", { smsOtpEnabled: true });
  expect(enabled.data).toMatchObject({ smsOtpEnabled: true });
  expect((await client.user.findUniqueOrThrow({ where: { id: f.user.id } })).smsOtpEnabled).toBe(
    true,
  );
  expect(
    (await client.authVerificationToken.findUniqueOrThrow({ where: { id: proof.id } })).consumedAt,
  ).not.toBeNull();
  expect(await verifySessionToken(other)).toBeNull();
  expect(await verifySessionToken(f.token)).toBeNull();
  const current = (await verifySessionToken(enabled.rotation!.token))!;
  const unlinked = await accountMutation(current, "phone/unlink", {});
  expect(await client.user.findUniqueOrThrow({ where: { id: f.user.id } })).toMatchObject({
    phone: null,
    smsOtpEnabled: false,
  });
  expect(unlinked.rotation).toBeDefined();
  vi.unstubAllEnvs();
});
it("successful reauth releases only its reservation and preserves prior failures", async () => {
  const f = await fixture();
  const key = "a".repeat(64);
  await client.authLoginThrottle.create({
    data: { keyHash: key, failedAttempts: 3, windowStartsAt: new Date() },
  });
  await accountMutation(
    f.auth,
    "reauthenticate",
    { password: "password-awal-aman" },
    undefined,
    key,
  );
  expect(
    (await client.authLoginThrottle.findUniqueOrThrow({ where: { keyHash: key } })).failedAttempts,
  ).toBe(2);
});
