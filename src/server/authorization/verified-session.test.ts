import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
const context = vi.hoisted(() => ({
  token: undefined as string | undefined,
  record: null as unknown,
  unavailable: false,
  reads: 0,
  frameworkError: null as Error | null,
}));
vi.mock("next/headers", () => ({
  cookies: async () => {
    context.reads++;
    if (context.frameworkError) throw context.frameworkError;
    return { get: () => (context.token ? { value: context.token } : undefined) };
  },
}));
vi.mock("../auth/auth-repository", () => ({
  findSession: async () => {
    if (context.unavailable) throw new Error("private DB failure");
    return context.record;
  },
}));
import { getVerifiedSession } from "./session";
beforeEach(() => {
  vi.stubEnv("AUTH_SECRET", "a".repeat(32));
  vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://menujuakad.com");
  context.token = "a".repeat(43);
  context.unavailable = false;
  context.reads = 0;
  context.frameworkError = null;
  context.record = {
    expiresAt: new Date(Date.now() + 60000),
    user: { id: "verified-user", status: "ACTIVE", role: "CUSTOMER" },
  };
});
afterEach(() => vi.unstubAllEnvs());
describe("request scoped verified session", () => {
  it("returns identity only from current database record", async () => {
    expect(await getVerifiedSession()).toMatchObject({ userId: "verified-user", role: "CUSTOMER" });
    context.record = null;
    expect(await getVerifiedSession()).toBeNull();
  });
  it("fails closed for DB errors, missing config and forged cookie", async () => {
    context.unavailable = true;
    expect(await getVerifiedSession()).toBeNull();
    context.unavailable = false;
    vi.stubEnv("AUTH_SECRET", "");
    expect(await getVerifiedSession()).toBeNull();
    vi.stubEnv("AUTH_SECRET", "a".repeat(32));
    context.token = "SUPERADMIN";
    expect(await getVerifiedSession()).toBeNull();
  });
});

it("reads dynamic request cookies even when runtime config is missing", async () => {
  vi.stubEnv("AUTH_SECRET", "");
  expect(await getVerifiedSession()).toBeNull();
  expect(context.reads).toBe(1);
});
it("preserves Next dynamic rendering bailout", async () => {
  context.frameworkError = Object.assign(new Error("dynamic render"), {
    digest: "DYNAMIC_SERVER_USAGE",
  });
  await expect(getVerifiedSession()).rejects.toThrow("dynamic render");
});
