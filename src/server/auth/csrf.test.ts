import { expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { issueCsrf, requireCsrf, CSRF_COOKIE } from "./csrf";
const config = { origin: "https://menujuakad.com", secret: "x".repeat(32), trustProxy: false };
it("rejects token replay from another browser, tampering and expiry", () => {
  const proof = issueCsrf(config);
  const req = (token = proof.token, cookie = proof.cookie) =>
    new Request(config.origin, {
      method: "POST",
      headers: { origin: config.origin, "x-csrf-token": token, cookie: `${CSRF_COOKIE}=${cookie}` },
    });
  expect(() => requireCsrf(req(), config)).not.toThrow();
  expect(() => requireCsrf(req(proof.token, issueCsrf(config).cookie), config)).toThrow();
  expect(() => requireCsrf(req(proof.token + "x"), config)).toThrow();
  expect(() =>
    requireCsrf(new Request(config.origin, { headers: { origin: config.origin } }), config),
  ).toThrow();
  vi.useFakeTimers();
  vi.setSystemTime(Date.now() + 3600000);
  expect(() => requireCsrf(req(), config)).toThrow();
  vi.useRealTimers();
});

it("renews proof on the same browser cookie without invalidating an outstanding proof", () => {
  const first = issueCsrf(config);
  const second = issueCsrf(config, first.cookie);
  expect(second.cookie).toBe(first.cookie);
  const request = new Request(config.origin, {
    headers: {
      origin: config.origin,
      "x-csrf-token": first.token,
      cookie: `${CSRF_COOKIE}=${second.cookie}`,
    },
  });
  expect(() => requireCsrf(request, config)).not.toThrow();
});
