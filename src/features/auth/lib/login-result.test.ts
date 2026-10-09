import { describe, expect, it } from "vitest";
import { readLoginResult } from "./login-result";
describe("hasil login dua tahap", () => {
  it("challenge OTP bukan sesi penuh atau redirect workspace", () => {
    expect(
      readLoginResult({
        ok: true,
        data: { otpRequired: true, token: "transient", expiresIn: 300, resendAfter: 60 },
      }),
    ).toEqual({
      kind: "otp",
      challenge: { token: "transient", expiresIn: 300, resendAfter: 60 },
    });
  });
  it("hasil sesi lengkap mengikuti path lokal tervalidasi", () => {
    expect(readLoginResult({ ok: true, redirectTo: "/vendor" })).toEqual({
      kind: "authenticated",
      redirectTo: "/vendor",
    });
  });
  it.each([
    { ok: true, redirectTo: "https://evil.example" },
    { ok: true },
    {
      ok: true,
      redirectTo: "/dashboard",
      data: { otpRequired: true, token: "", expiresIn: 300, resendAfter: 60 },
    },
    { ok: true, data: { otpRequired: true, token: "transient", expiresIn: -1, resendAfter: 60 } },
  ] as const)("respons tidak lengkap gagal tertutup: %j", (response) => {
    expect(() => readLoginResult(response)).toThrow();
  });
});
