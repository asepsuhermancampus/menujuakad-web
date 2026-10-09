import type { AuthResponse, LoginData, OtpChallenge } from "../types/auth-contracts";
import { AuthClientError, isLocalAuthRedirect } from "./auth-client";
export function readLoginResult(
  result: AuthResponse<Partial<LoginData>>,
): { kind: "otp"; challenge: OtpChallenge } | { kind: "authenticated"; redirectTo: string } {
  if (result.data?.otpRequired === true) {
    const { token, expiresIn, resendAfter } = result.data;
    if (
      typeof token !== "string" ||
      !token ||
      token.length > 512 ||
      typeof expiresIn !== "number" ||
      !Number.isFinite(expiresIn) ||
      expiresIn <= 0 ||
      typeof resendAfter !== "number" ||
      !Number.isFinite(resendAfter) ||
      resendAfter < 0
    )
      throw new AuthClientError(503);
    return { kind: "otp", challenge: { token, expiresIn, resendAfter } };
  }
  if (!isLocalAuthRedirect(result.redirectTo)) throw new AuthClientError(503);
  return { kind: "authenticated", redirectTo: result.redirectTo };
}
