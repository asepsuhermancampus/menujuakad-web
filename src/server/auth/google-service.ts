import "server-only";
import { createHash } from "node:crypto";
import { z } from "zod";
import { getGoogleConfig } from "./capabilities";
import {
  getAuthConfig,
  getScopedThrottleKeys,
  readBoundedJson,
  type AuthConfig,
} from "./request-policy";
import { getAuthSession } from "./auth-service";
import { createOAuthState, consumeOAuthState, oauthIntentSchema } from "./oauth-state";
import { reserveLoginAttempt } from "./auth-repository";
import { exchangeGoogleCode } from "./google-provider";
import { persistGoogleIdentity, isRecentAuthentication } from "./google-repository";
import { GoogleFlowError } from "./google-errors";
import { requestSessionToken } from "./auth-http";
import { isSessionToken, hashSessionToken } from "./session-crypto";
const inputSchema = z
  .object({ intent: oauthIntentSchema, next: z.string().max(2048).optional() })
  .strict();
export async function readGoogleStartInput(request: Request) {
  return inputSchema.parse(await readBoundedJson(request));
}
export async function startGoogleOAuth(
  request: Request,
  input: z.infer<typeof inputSchema>,
  config: AuthConfig = getAuthConfig(),
) {
  const parsed = inputSchema.parse(input);
  const google = getGoogleConfig();
  const session = parsed.intent === "login" ? null : await getAuthSession(request);
  if (parsed.intent !== "login" && !session)
    throw new GoogleFlowError("SESSION_REQUIRED", "/account/security");
  if (parsed.intent === "link" && !isRecentAuthentication(session?.reauthenticatedAt))
    throw new GoogleFlowError("REAUTH_REQUIRED", "/account/security");
  if (
    !(await reserveLoginAttempt(
      getScopedThrottleKeys("google-start", session?.userId ?? "anonymous", request, config, {
        identifier: 20,
        ip: 20,
      }),
    ))
  )
    throw new GoogleFlowError("RATE_LIMITED");
  const attempt = await createOAuthState(
    {
      intent: parsed.intent,
      next: parsed.next,
      userId: session?.userId ?? null,
      sessionHash: session?.tokenHash ?? null,
    },
    config,
  );
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.search = new URLSearchParams({
    client_id: google.clientId,
    redirect_uri: google.redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state: attempt.state,
    nonce: attempt.payload.nonce,
    code_challenge: createHash("sha256").update(attempt.payload.verifier).digest("base64url"),
    code_challenge_method: "S256",
    access_type: "online",
    prompt: "select_account",
    ...(parsed.intent === "reauthenticate" ? { max_age: "0" } : {}),
  }).toString();
  return { state: attempt.state, browser: attempt.browser, redirectTo: url.href };
}
export async function completeGoogleOAuth(
  request: Request,
  input: { state: string; browser?: string; code?: string; providerError?: boolean },
  config: AuthConfig = getAuthConfig(),
) {
  const attempt = await consumeOAuthState(input.state, input.browser, config);
  const budget = await reserveLoginAttempt(
    getScopedThrottleKeys("google-callback", input.browser ?? "anonymous", request, config, {
      identifier: 20,
      ip: 20,
    }),
  );
  if (!budget) throw new GoogleFlowError("RATE_LIMITED");
  if (!attempt) throw new GoogleFlowError("GOOGLE_FAILED");
  const returnTo = attempt.intent === "login" ? "/login" : "/account/security";
  if (input.providerError || !input.code || input.code.length > 2048)
    throw new GoogleFlowError("GOOGLE_FAILED", returnTo);
  if (attempt.intent !== "login") {
    const session = await getAuthSession(request);
    if (!session || session.userId !== attempt.userId || session.tokenHash !== attempt.sessionHash)
      throw new GoogleFlowError("SESSION_REQUIRED", returnTo);
    if (attempt.intent === "link" && !isRecentAuthentication(session.reauthenticatedAt))
      throw new GoogleFlowError("REAUTH_REQUIRED", returnTo);
  }
  let identity;
  try {
    identity = await exchangeGoogleCode(input.code, attempt.verifier, attempt.nonce);
  } catch {
    throw new GoogleFlowError("GOOGLE_FAILED", returnTo);
  }
  const token = requestSessionToken(request);
  return persistGoogleIdentity(
    identity,
    attempt,
    isSessionToken(token) ? hashSessionToken(token) : undefined,
  );
}
