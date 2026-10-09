import { expect, it, vi, beforeEach } from "vitest";
vi.mock("server-only", () => ({}));
const fixture = vi.hoisted(() => ({
  claims: {} as Record<string, unknown>,
  token: "id-token",
  fail: false,
}));
vi.mock("google-auth-library", () => ({
  OAuth2Client: class {
    async getToken() {
      return { tokens: { id_token: fixture.token } };
    }
    async verifyIdToken() {
      if (fixture.fail) throw new Error("signature");
      return { getPayload: () => fixture.claims };
    }
  },
}));
import { exchangeGoogleCode } from "./google-provider";
const config = {
  clientId: "client.apps.googleusercontent.com",
  clientSecret: "secret",
  redirectUri: "https://menujuakad.com/api/auth/google/callback",
};
beforeEach(() => {
  fixture.fail = false;
  fixture.token = "id-token";
  fixture.claims = {
    aud: config.clientId,
    iss: "https://accounts.google.com",
    sub: "google-sub",
    exp: Math.floor(Date.now() / 1000) + 300,
    iat: Math.floor(Date.now() / 1000),
    email: "USER@EXAMPLE.INVALID",
    email_verified: true,
    nonce: "nonce",
    name: "Nama",
    picture: "https://lh3.googleusercontent.com/avatar",
  };
});
it("checks verified Google subject, exact audience, issuer, expiry and nonce", async () => {
  expect(await exchangeGoogleCode("code", "verifier", "nonce", config)).toMatchObject({
    subject: "google-sub",
    email: "user@example.invalid",
    name: "Nama",
  });
  for (const patch of [
    { aud: "other" },
    { iss: "https://evil.example" },
    { sub: "" },
    { exp: 0 },
    { email_verified: false },
    { nonce: "wrong" },
  ]) {
    const original = fixture.claims;
    fixture.claims = { ...original, ...patch };
    await expect(exchangeGoogleCode("code", "verifier", "nonce", config)).rejects.toThrow();
    fixture.claims = original;
  }
  fixture.fail = true;
  await expect(exchangeGoogleCode("code", "verifier", "nonce", config)).rejects.toThrow();
});
it("drops untrusted avatar URLs and refuses missing id token", async () => {
  fixture.claims.picture = "https://evil.example/avatar";
  expect((await exchangeGoogleCode("code", "verifier", "nonce", config)).avatarUrl).toBeNull();
  fixture.token = "";
  await expect(exchangeGoogleCode("code", "verifier", "nonce", config)).rejects.toThrow();
});
