import "server-only";
import { NextResponse } from "next/server";
import { z } from "zod";
import { readBoundedJson, type AuthConfig } from "../auth/request-policy";
import { mutationAuthConfig, authJson } from "../auth/auth-http";
import { getAuthSession } from "../auth/auth-service";
import { normalizeEmail, normalizePhone } from "../auth/identifiers";
import { AccountError } from "./errors";
import { accountMutation, readAccount } from "./account-service";
import { requestAccountContact, verifyAccountContact } from "./contact-service";
import { parseInput, emptyInput } from "./account-input";
import { browserBinding, failureResponse, resultResponse, throttle, readConfig } from "./http";
const emailRequest = z.object({ email: z.string().max(254) }).strict();
const phoneRequest = z.object({ phone: z.string().max(24) }).strict();
export async function handleAccount(
  request: Request,
  op: string,
  config?: AuthConfig,
  id?: string,
) {
  try {
    const mutation = request.method !== "GET";
    const trusted = mutation ? mutationAuthConfig(request, config) : readConfig(config);
    if (trusted instanceof NextResponse) return trusted;
    const auth = await getAuthSession(request);
    if (!auth) throw new AccountError(401, "SESSION_REQUIRED", "Silakan masuk kembali.");
    if (!mutation) return authJson({ ok: true, data: await readAccount(auth, op) });
    let input: unknown = {};
    if (request.method !== "DELETE" || request.body !== null) {
      try {
        input = await readBoundedJson(request);
      } catch {
        throw new AccountError(400, "INVALID_INPUT", "Data permintaan tidak valid.");
      }
    }
    if (request.method === "DELETE") parseInput(emptyInput, input);
    const keys = await throttle(
      request,
      op === "reauthenticate" ? "reauthenticate" : "account-security",
      auth.userId,
      trusted,
      op === "reauthenticate"
        ? { identifier: 5, ip: 100, windowSeconds: 900 }
        : { identifier: 10, ip: 100, windowSeconds: 900 },
    );
    if (op === "email/request" || op === "phone/otp") {
      let target: string;
      try {
        target =
          op === "email/request"
            ? normalizeEmail(parseInput(emailRequest, input).email)
            : normalizePhone(parseInput(phoneRequest, input).phone);
      } catch {
        throw new AccountError(400, "INVALID_INPUT", "Kontak tidak valid.");
      }
      await throttle(request, op === "email/request" ? "email-send" : "otp-send", target, trusted, {
        identifier: 3,
        ip: 10,
        windowSeconds: 3600,
      });
      const challenge = await requestAccountContact(
        auth,
        op === "email/request" ? "email" : "phone",
        target,
        browserBinding(request),
      );
      return authJson(
        {
          ok: true,
          data:
            op === "email/request"
              ? { message: "Periksa email untuk tautan verifikasi." }
              : challenge,
        },
        202,
      );
    }
    if (op === "email/verify" || op === "phone/verify")
      return resultResponse(
        await verifyAccountContact(
          auth,
          op === "email/verify" ? "email" : "phone",
          input,
          browserBinding(request),
        ),
      );
    return resultResponse(
      await accountMutation(
        auth,
        op,
        input,
        id,
        op === "reauthenticate" ? keys[0]?.keyHash : undefined,
      ),
    );
  } catch (error) {
    return failureResponse(error);
  }
}
