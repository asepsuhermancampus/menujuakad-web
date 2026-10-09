import "server-only";
import { z } from "zod";
import { getPrisma } from "../db/client";
import { hashPassword } from "./password-crypto";
import { normalizeIdentifier, newPasswordSchema } from "./identifiers";
import { readBoundedJson, type ThrottleKey } from "./request-policy";
import { reserveLoginAttempt } from "./auth-repository";
import { createSessionToken, hashSessionToken, isSessionToken } from "./session-crypto";
import { SESSION_MAX_AGE } from "./auth-service";
import { lockAuthIdentifier } from "./transaction-lock";
const schema = z
  .object({
    name: z.string().trim().min(1).max(100),
    identifier: z.string().min(1).max(254),
    password: newPasswordSchema,
  })
  .strict();
export async function readRegisterInput(request: Request) {
  const input = schema.parse(await readBoundedJson(request));
  return { ...input, identifier: normalizeIdentifier(input.identifier).value };
}
export async function registerWithPassword(
  input: z.infer<typeof schema>,
  keys: ThrottleKey[],
  oldToken?: string,
) {
  // Do not trust direct service callers to choose role or bypass password/identifier validation.
  const parsed = schema.parse(input);
  const identifier = normalizeIdentifier(parsed.identifier);
  if (!(await reserveLoginAttempt(keys)))
    return { ok: false as const, code: "RATE_LIMITED" as const };
  const passwordHash = await hashPassword(parsed.password);
  const token = createSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000);
  try {
    await getPrisma().$transaction(async (tx) => {
      await lockAuthIdentifier(tx, `${identifier.kind}:${identifier.value}`);
      const user = await tx.user.create({
        data: {
          name: parsed.name,
          ...(identifier.kind === "email"
            ? { email: identifier.value }
            : { phone: identifier.value }),
          role: "CLIENT",
          status: "ACTIVE",
        },
      });
      await tx.authCredential.create({ data: { userId: user.id, passwordHash } });
      if (isSessionToken(oldToken))
        await tx.userSession.deleteMany({ where: { tokenHash: hashSessionToken(oldToken) } });
      await tx.userSession.create({
        data: {
          userId: user.id,
          tokenHash: hashSessionToken(token),
          expiresAt,
          reauthenticatedAt: new Date(),
        },
      });
    });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002")
      return { ok: false as const, code: "REGISTRATION_UNAVAILABLE" as const };
    throw error;
  }
  return {
    ok: true as const,
    token,
    expiresAt,
    redirectTo: "/dashboard",
    channel: identifier.kind === "email" ? ("email" as const) : ("sms" as const),
  };
}
