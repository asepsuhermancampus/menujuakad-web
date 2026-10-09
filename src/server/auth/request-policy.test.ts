import { describe, expect, it, vi, afterEach } from "vitest";
vi.mock("server-only", () => ({}));
import {
  getAuthConfig,
  requireSameOrigin,
  readLoginInput,
  getThrottleKeys,
} from "./request-policy";
afterEach(() => vi.unstubAllEnvs());
const config = { origin: "https://menujuakad.com", secret: "x".repeat(32), trustProxy: false };
describe("auth boundary", () => {
  it("rejects missing configuration", () => {
    vi.stubEnv("AUTH_SECRET", "");
    expect(() => getAuthConfig()).toThrow();
  });
  it.each([null, "https://evil.example", "https://menujuakad.com.evil", "https://menujuakad.com/"])(
    "rejects origin %s",
    (origin) => {
      const request = new Request("https://menujuakad.com/api/auth/login", {
        headers: origin ? { origin } : {},
      });
      expect(() => requireSameOrigin(request, config)).toThrow();
    },
  );
  it("accepts explicitly configured local E2E origin", () => {
    expect(() =>
      requireSameOrigin(
        new Request("http://localhost:3107", { headers: { origin: "http://localhost:3107" } }),
        { ...config, origin: "http://localhost:3107" },
      ),
    ).not.toThrow();
  });
  it("validates and normalizes login input", async () => {
    expect(
      await readLoginInput(
        new Request("http://localhost", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            email: " USER@EXAMPLE.INVALID ",
            password: "password",
            next: "/admin",
          }),
        }),
      ),
    ).toEqual({ email: "user@example.invalid", password: "password", next: "/admin" });
  });
  it("rejects oversized streaming body without trusting content length", async () => {
    await expect(
      readLoginInput(
        new Request("http://localhost", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: "x".repeat(5000),
        }),
      ),
    ).rejects.toThrow();
  });
  it("does not trust forged proxy headers and never exposes raw email", () => {
    const request = new Request("http://localhost", { headers: { "x-forwarded-for": "1.2.3.4" } });
    const keys = getThrottleKeys("user@example.invalid", request, config);
    expect(keys).toEqual(
      getThrottleKeys("user@example.invalid", new Request("http://localhost"), config),
    );
    expect(keys.every((k) => /^[a-f0-9]{64}$/.test(k.keyHash))).toBe(true);
  });
});

import { assertTrustedOrigin } from "./request-policy";
it("reusable mutation origin gate fails closed and accepts configured origin only", () => {
  vi.stubEnv("AUTH_SECRET", "a".repeat(32));
  vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://menujuakad.com");
  expect(
    assertTrustedOrigin(
      new Request("https://menujuakad.com", { headers: { origin: "https://menujuakad.com" } }),
    ),
  ).toBe(true);
  expect(assertTrustedOrigin(new Request("https://menujuakad.com"))).toBe(false);
});
