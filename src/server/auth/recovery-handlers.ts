import "server-only";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getScopedThrottleKeys, readBoundedJson, type AuthConfig } from "./request-policy";
import { getAuthSession } from "./auth-service";
import { mutationAuthConfig, authJson, clearCsrf } from "./auth-http";
import { normalizeIdentifier, normalizeEmail } from "./identifiers";
import { isSessionToken } from "./session-crypto";
import { requestRecovery, resetPassword, recoveryMessage } from "./recovery-service";
import { requestEmail, verifyEmail } from "./verification-service";
import { verifyOtp, resendOtp } from "./otp-service";
import { requestPhoneVerification } from "../account/contact-service";
import { parseInput } from "../account/account-input";
import { AccountError } from "../account/errors";
import { browserBinding, failureResponse, resultResponse, throttle } from "../account/http";
import { findProof, proofPayloadSchema } from "./proof-repository";
import { requirePendingCookie, setPendingCookie, clearPendingCookie } from "./otp-http";
import { otpInput } from "../account/contact-service";
const identifierInput = z.object({ identifier: z.string().min(1).max(254) }).strict();
const tokenInput = z.object({ token: z.string().refine(isSessionToken) }).strict();
const emailInput = z
  .object({ identifier: z.string().max(254), purpose: z.enum(["register", "verify"]) })
  .strict();
export async function handleRecovery(request: Request, op: string, config?: AuthConfig) {
  const trusted = mutationAuthConfig(request, config);
  if (trusted instanceof NextResponse) return trusted;
  try {
    let input: unknown;
    try {
      input = await readBoundedJson(request);
    } catch {
      throw new AccountError(400, "INVALID_INPUT", "Data permintaan tidak valid.");
    }
    const browserHash = browserBinding(request);
    if (op === "forgot-password") {
      const parsed = parseInput(identifierInput, input);
      let identifier: string;
      try {
        identifier = normalizeIdentifier(parsed.identifier).value;
      } catch {
        throw new AccountError(400, "INVALID_INPUT", "Identitas tidak valid.");
      }
      await throttle(
        request,
        identifier.includes("@") ? "email-send" : "otp-send",
        identifier,
        trusted,
        {
          identifier: 3,
          ip: 10,
          windowSeconds: 3600,
        },
      );
      return authJson({ ok: true, data: await requestRecovery(identifier, browserHash) }, 202);
    }
    if (op === "reset-password") {
      await throttle(request, "reset-proof", "reset", trusted, {
        identifier: 100,
        ip: 10,
        windowSeconds: 900,
      });
      await resetPassword(input);
      const response = authJson({ ok: true, redirectTo: "/login" });
      clearCsrf(response);
      return response;
    }
    if (op === "email/request") {
      const parsed = parseInput(emailInput, input);
      const target = normalizeEmail(parsed.identifier);
      await throttle(request, "email-send", target, trusted, {
        identifier: 3,
        ip: 10,
        windowSeconds: 3600,
      });
      const auth = await getAuthSession(request);
      await requestEmail(target, parsed.purpose, auth ?? undefined, browserHash);
      return authJson(
        { ok: true, data: { message: "Jika verifikasi tersedia, petunjuk akan dikirim." } },
        202,
      );
    }
    if (op === "email/verify") {
      const parsed = parseInput(tokenInput, input);
      await throttle(request, "email-proof", parsed.token, trusted, {
        identifier: 10,
        ip: 100,
        windowSeconds: 900,
      });
      await verifyEmail(parsed.token, (await getAuthSession(request)) ?? undefined, browserHash);
      return authJson({ ok: true, redirectTo: "/login" });
    }
    if (op === "otp/request") {
      parseInput(z.object({}).strict(), input);
      const auth = await getAuthSession(request);
      if (!auth) throw new AccountError(401, "SESSION_REQUIRED");
      return authJson(
        {
          ok: true,
          data: await requestPhoneVerification(auth, browserHash, undefined, (phone) =>
            getScopedThrottleKeys("otp-send", phone, request, trusted, {
              identifier: 3,
              ip: 10,
              windowSeconds: 3600,
            }),
          ),
        },
        202,
      );
    }
    if (op === "otp/verify") {
      await throttle(request, "otp-verify", "verify", trusted, {
        identifier: 1000,
        ip: 100,
        windowSeconds: 900,
      });
      const parsed = parseInput(otpInput, input);
      const proof = await findProof(parsed.token);
      const payload = proofPayloadSchema.safeParse(proof?.payload);
      if (payload.success && payload.data.kind === "password-login")
        requirePendingCookie(request, parsed.token);
      const response = resultResponse(await verifyOtp(parsed, browserHash));
      if (payload.success && payload.data.kind === "password-login") clearPendingCookie(response);
      return response;
    }
    if (op === "otp/resend") {
      const parsed = parseInput(tokenInput, input);
      const proof = await findProof(parsed.token);
      await throttle(request, "otp-send", proof?.identifier ?? parsed.token, trusted, {
        identifier: 3,
        ip: 10,
        windowSeconds: 3600,
      });
      const payload = proofPayloadSchema.safeParse(proof?.payload);
      if (payload.success && payload.data.kind === "password-login")
        requirePendingCookie(request, parsed.token);
      const challenge = await resendOtp(
        parsed.token,
        browserHash,
        undefined,
        (await getAuthSession(request)) ?? undefined,
      );
      const response = authJson({ ok: true, data: challenge }, 202);
      if (payload.success && payload.data.kind === "password-login")
        setPendingCookie(response, challenge.token);
      return response;
    }
    throw new AccountError(404, "NOT_FOUND", recoveryMessage);
  } catch (error) {
    return failureResponse(error);
  }
}
