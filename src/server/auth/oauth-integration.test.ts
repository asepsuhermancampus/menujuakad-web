import { PGlite } from "@electric-sql/pglite";
import { PrismaClient } from "@/generated/prisma/client";
import { beforeAll, afterAll, it, expect, vi } from "vitest";
import { workspaceTestAdapter } from "../../../tests/database/workspace-test-adapter";
import { applyAuthMigrations } from "../../../tests/database/auth-multimethod-fixture";
vi.mock("server-only", () => ({}));
const state = vi.hoisted(() => ({
  client: null as unknown,
  identity: {
    subject: "google-new",
    email: "google@example.invalid",
    name: "Nama Google",
    avatarUrl: null,
  },
}));
vi.mock("@/server/db/client", () => ({ getPrisma: () => state.client }));
vi.mock("./google-provider", () => ({ exchangeGoogleCode: async () => state.identity }));
import { createOAuthState, consumeOAuthState } from "./oauth-state";
import { completeGoogleOAuth, startGoogleOAuth } from "./google-service";
import { hashSessionToken } from "./session-crypto";
import { verifySessionToken } from "./auth-service";
const config = { origin: "https://menujuakad.com", secret: "x".repeat(32), trustProxy: false };
const db = new PGlite();
let client: PrismaClient;
const req = (token?: string) =>
  new Request(config.origin + "/api/auth/google/callback", {
    headers: token ? { cookie: `menujuakad_session=${token}` } : {},
  });
const attempt = (intent: "login" | "link" | "reauthenticate" = "login", token?: string) =>
  startGoogleOAuth(req(token), { intent, next: "/admin" }, config);
const finish = (flow: { state: string; browser: string }, token?: string) =>
  completeGoogleOAuth(
    req(token),
    { state: flow.state, browser: flow.browser, code: "auth-code" },
    config,
  );
beforeAll(async () => {
  vi.stubEnv("AUTH_SECRET", config.secret);
  vi.stubEnv("NEXT_PUBLIC_APP_URL", config.origin);
  vi.stubEnv("GOOGLE_CLIENT_ID", "test.apps.googleusercontent.com");
  vi.stubEnv("GOOGLE_CLIENT_SECRET", "test-secret");
  vi.stubEnv("GOOGLE_REDIRECT_URI", config.origin + "/api/auth/google/callback");
  await applyAuthMigrations(db);
  client = new PrismaClient({ adapter: workspaceTestAdapter(db) });
  state.client = client;
}, 20000);
afterAll(async () => {
  await client?.$disconnect();
  await db.close();
  vi.unstubAllEnvs();
});
it("encrypts PKCE/nonce in DB, consumes state once concurrently and burns browser mismatch", async () => {
  const flow = await createOAuthState({ intent: "login", userId: null, sessionHash: null }, config);
  const row = await client.authVerificationToken.findUniqueOrThrow({
    where: { tokenHash: hashSessionToken(flow.state) },
  });
  expect(JSON.stringify(row)).not.toContain(flow.payload.verifier);
  expect(JSON.stringify(row)).not.toContain(flow.payload.nonce);
  const consumes = await Promise.all(
    [1, 2].map(() => consumeOAuthState(flow.state, flow.browser, config)),
  );
  expect(consumes.filter(Boolean)).toHaveLength(1);
  const wrong = await createOAuthState(
    { intent: "login", userId: null, sessionHash: null },
    config,
  );
  expect(await consumeOAuthState(wrong.state, "a".repeat(43), config)).toBeNull();
  expect(await consumeOAuthState(wrong.state, wrong.browser, config)).toBeNull();
});
it("Google signup issues CLIENT; existing subject uses owner independent of changed email", async () => {
  const flow = await attempt();
  const url = new URL(flow.redirectTo);
  expect(url.origin).toBe("https://accounts.google.com");
  expect(url.searchParams.get("code_challenge_method")).toBe("S256");
  expect(url.searchParams.get("nonce")).toBeTruthy();
  const result = await finish(flow);
  expect(result.redirectTo).toBe("/dashboard");
  expect(result.token).toBeTruthy();
  const user = await client.user.findUniqueOrThrow({ where: { email: "google@example.invalid" } });
  expect(user).toMatchObject({ role: "CLIENT", name: "Nama Google" });
  expect(user.emailVerifiedAt).not.toBeNull();
  state.identity.email = "changed@example.invalid";
  const again = await finish(await attempt());
  expect((await verifySessionToken(again.token))?.userId).toBe(user.id);
  expect(await client.user.count()).toBe(1);
  await expect(finish(flow)).rejects.toThrow();
});
it("never merges Google by email and does not create partial new account", async () => {
  state.identity = { ...state.identity, subject: "different-sub", email: "google@example.invalid" };
  await expect(finish(await attempt())).rejects.toMatchObject({ code: "GOOGLE_CONFLICT" });
  expect(await client.authAccount.count()).toBe(1);
  expect(await client.user.count()).toBe(1);
});
it("links only fresh exact session owner and rejects session switching or revoked session", async () => {
  const user = await client.user.create({ data: { name: "Owner", phone: "+6282222222222" } });
  const token = "c".repeat(43);
  const other = "d".repeat(43);
  const create = (raw: string) =>
    client.userSession.create({
      data: {
        userId: user.id,
        tokenHash: hashSessionToken(raw),
        expiresAt: new Date(Date.now() + 60000),
        reauthenticatedAt: new Date(),
      },
    });
  await create(token);
  await create(other);
  state.identity = { ...state.identity, subject: "link-sub", email: "link@example.invalid" };
  const switched = await attempt("link", token);
  await expect(finish(switched, other)).rejects.toThrow();
  expect(
    await client.authAccount.findUnique({
      where: { userId_provider: { userId: user.id, provider: "google" } },
    }),
  ).toBeNull();
  const good = await attempt("link", token);
  const linked = await finish(good, token);
  expect(linked.redirectTo).toBe("/account/security");
  expect(linked.token).toBeTruthy();
  expect(await verifySessionToken(token)).toBeNull();
  expect(await verifySessionToken(other)).toBeNull();
  expect(
    (
      await client.authAccount.findUniqueOrThrow({
        where: { userId_provider: { userId: user.id, provider: "google" } },
      })
    ).providerAccountId,
  ).toBe("link-sub");
  const current = linked.token!;
  const revoked = await attempt("reauthenticate", current);
  await client.userSession.updateMany({
    where: { tokenHash: hashSessionToken(current) },
    data: { revokedAt: new Date() },
  });
  await expect(finish(revoked, current)).rejects.toThrow();
});
it("Google reauth uses owned subject and rotates session proof without subject overwrite", async () => {
  const account = await client.authAccount.findUniqueOrThrow({
    where: { provider_providerAccountId: { provider: "google", providerAccountId: "link-sub" } },
  });
  const raw = "e".repeat(43);
  await client.userSession.create({
    data: {
      userId: account.userId,
      tokenHash: hashSessionToken(raw),
      expiresAt: new Date(Date.now() + 60000),
      reauthenticatedAt: new Date(0),
    },
  });
  state.identity = { ...state.identity, subject: "foreign-sub" };
  await expect(finish(await attempt("reauthenticate", raw), raw)).rejects.toThrow();
  state.identity.subject = "link-sub";
  const result = await finish(await attempt("reauthenticate", raw), raw);
  expect(result.redirectTo).toBe("/account/security");
  expect(result.token).toBeTruthy();
  expect(await verifySessionToken(raw)).toBeNull();
  expect((await verifySessionToken(result.token))?.reauthenticatedAt?.getTime()).toBeGreaterThan(
    Date.now() - 60000,
  );
  expect(
    (await client.authAccount.findUniqueOrThrow({ where: { id: account.id } })).providerAccountId,
  ).toBe("link-sub");
});

it("expired state cannot be consumed and provider cancellation consumes valid attempt", async () => {
  const expired = await createOAuthState(
    { intent: "login", userId: null, sessionHash: null },
    config,
  );
  await client.authVerificationToken.update({
    where: { tokenHash: hashSessionToken(expired.state) },
    data: { expiresAt: new Date(0) },
  });
  expect(await consumeOAuthState(expired.state, expired.browser, config)).toBeNull();
  const flow = await attempt();
  await expect(
    completeGoogleOAuth(
      req(),
      { state: flow.state, browser: flow.browser, providerError: true },
      config,
    ),
  ).rejects.toThrow();
  await expect(finish(flow)).rejects.toThrow();
});
it("link requires fresh proof even when active session exists", async () => {
  const user = await client.user.findUniqueOrThrow({ where: { email: "google@example.invalid" } });
  const raw = "f".repeat(43);
  await client.userSession.create({
    data: {
      userId: user.id,
      tokenHash: hashSessionToken(raw),
      expiresAt: new Date(Date.now() + 60000),
      reauthenticatedAt: new Date(Date.now() - 301000),
    },
  });
  await expect(attempt("link", raw)).rejects.toMatchObject({ code: "REAUTH_REQUIRED" });
});
