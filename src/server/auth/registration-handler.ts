import "server-only";
import { NextResponse } from "next/server";
import { getScopedThrottleKeys } from "./request-policy";
import {
  authJson,
  authError,
  authUnavailable,
  mutationAuthConfig,
  requestSessionToken,
  setSessionCookie,
} from "./auth-http";
import { readRegisterInput, registerWithPassword } from "./registration-service";
import { getAuthCapabilities } from "./capabilities";
export async function handleRegister(request: Request) {
  const config = mutationAuthConfig(request);
  if (config instanceof NextResponse) return config;
  let input;
  try {
    input = await readRegisterInput(request);
  } catch {
    return authError(400, "INVALID_INPUT", "Data pendaftaran tidak valid.");
  }
  try {
    const result = await registerWithPassword(
      input,
      getScopedThrottleKeys("register", input.identifier, request, config, {
        identifier: 3,
        ip: 5,
        windowSeconds: 3600,
      }),
      requestSessionToken(request),
    );
    if (!result.ok)
      return result.code === "RATE_LIMITED"
        ? authError(429, "RATE_LIMITED", "Terlalu banyak percobaan. Coba lagi nanti.")
        : authError(
            409,
            "REGISTRATION_UNAVAILABLE",
            "Pendaftaran tidak dapat diselesaikan. Gunakan metode masuk yang sudah Anda gunakan.",
          );
    const capabilities = getAuthCapabilities();
    const response = authJson(
      {
        ok: true,
        redirectTo: result.redirectTo,
        data: {
          verificationRequired: true,
          channel: result.channel,
          verificationAvailable:
            result.channel === "email" ? capabilities.emailRecovery : capabilities.smsOtp,
        },
      },
      201,
    );
    setSessionCookie(response, result);
    return response;
  } catch {
    return authUnavailable();
  }
}
