import "server-only";
import { createCipheriv, createDecipheriv, createHmac, randomBytes } from "node:crypto";
import { z } from "zod";
import { getPrisma } from "../db/client";
import { createSessionToken, hashSessionToken, isSessionToken } from "./session-crypto";
import type { AuthConfig } from "./request-policy";
export const OAUTH_COOKIE = "menujuakad_oauth";
export const oauthCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/api/auth/google",
  maxAge: 300,
});
export const oauthIntentSchema = z.enum(["login", "link", "reauthenticate"]);
const payloadSchema = z
  .object({
    intent: oauthIntentSchema,
    browserHash: z.string().length(64),
    verifier: z.string().length(43),
    nonce: z.string().length(43),
    next: z.string().max(2048).optional(),
    sessionHash: z.string().length(64).nullable(),
    userId: z.string().nullable(),
  })
  .strict();
export type OAuthState = z.infer<typeof payloadSchema>;
const key = (config: AuthConfig) =>
  createHmac("sha256", config.secret).update("oauth-state-encryption:v1").digest();
function seal(payload: OAuthState, config: AuthConfig): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(config), iv);
  cipher.setAAD(Buffer.from("OAUTH_STATE:v1"));
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(payload), "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString("base64url");
}
function open(envelope: string, config: AuthConfig): OAuthState {
  const data = Buffer.from(envelope, "base64url");
  const decipher = createDecipheriv("aes-256-gcm", key(config), data.subarray(0, 12));
  decipher.setAuthTag(data.subarray(12, 28));
  decipher.setAAD(Buffer.from("OAUTH_STATE:v1"));
  return payloadSchema.parse(
    JSON.parse(
      Buffer.concat([decipher.update(data.subarray(28)), decipher.final()]).toString("utf8"),
    ),
  );
}
export async function createOAuthState(
  input: Omit<OAuthState, "browserHash" | "verifier" | "nonce">,
  config: AuthConfig,
) {
  const state = createSessionToken(),
    browser = createSessionToken();
  const payload = payloadSchema.parse({
    ...input,
    browserHash: hashSessionToken(browser),
    verifier: createSessionToken(),
    nonce: createSessionToken(),
  });
  await getPrisma().authVerificationToken.create({
    data: {
      purpose: "OAUTH_STATE",
      tokenHash: hashSessionToken(state),
      userId: payload.userId,
      identifier: payload.browserHash,
      payload: { envelope: seal(payload, config) },
      expiresAt: new Date(Date.now() + 300000),
    },
  });
  return { state, browser, payload };
}
/** Atomic UPDATE commits consumption before exchange or validation failure, including mismatch. */
export async function consumeOAuthState(
  state: string,
  browser: string | undefined,
  config: AuthConfig,
): Promise<OAuthState | null> {
  if (!isSessionToken(state)) return null;
  const rows = await getPrisma().$queryRaw<{ payload: { envelope?: unknown } }[]>`
 UPDATE "AuthVerificationToken" SET "consumedAt"=CURRENT_TIMESTAMP
 WHERE "tokenHash"=${hashSessionToken(state)} AND "purpose"='OAUTH_STATE'
 AND "consumedAt" IS NULL AND "expiresAt">CURRENT_TIMESTAMP
 RETURNING "payload"`;
  const envelope = rows[0]?.payload?.envelope;
  if (typeof envelope !== "string") return null;
  try {
    const payload = open(envelope, config);
    return isSessionToken(browser) && payload.browserHash === hashSessionToken(browser)
      ? payload
      : null;
  } catch {
    return null;
  }
}
