import "server-only";
import { OAuth2Client } from "google-auth-library";
import { normalizeEmail } from "./identifiers";
import { getGoogleConfig } from "./capabilities";
export type VerifiedGoogleIdentity = {
  subject: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
};
export function permittedGoogleAvatar(value: unknown): string | null {
  if (typeof value !== "string" || value.length > 2048) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      !url.port &&
      (url.hostname === "googleusercontent.com" || url.hostname.endsWith(".googleusercontent.com"))
      ? url.href
      : null;
  } catch {
    return null;
  }
}
/** The library verifies signature/JWKS, audience and issuer. Explicit checks fail closed on claims. */
export async function exchangeGoogleCode(
  code: string,
  verifier: string,
  nonce: string,
  config = getGoogleConfig(),
): Promise<VerifiedGoogleIdentity> {
  const client = new OAuth2Client({
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    redirectUri: config.redirectUri,
    transporterOptions: { timeout: 10000, retry: false },
  });
  const { tokens } = await client.getToken({
    code,
    codeVerifier: verifier,
    redirect_uri: config.redirectUri,
  });
  if (!tokens.id_token) throw new Error("Google proof tidak valid.");
  const ticket = await client.verifyIdToken({
    idToken: tokens.id_token,
    audience: config.clientId,
  });
  const payload = ticket.getPayload();
  const claims = payload as typeof payload & { nonce?: string; name?: string; picture?: string };
  const now = Math.floor(Date.now() / 1000);
  if (
    !claims ||
    claims.aud !== config.clientId ||
    !["https://accounts.google.com", "accounts.google.com"].includes(claims.iss) ||
    typeof claims.sub !== "string" ||
    claims.sub.trim() !== claims.sub ||
    !claims.sub ||
    claims.sub.length > 255 ||
    /[\x00-\x20\x7f]/.test(claims.sub) ||
    !Number.isSafeInteger(claims.exp) ||
    claims.exp <= now ||
    !Number.isSafeInteger(claims.iat) ||
    claims.iat > now + 60 ||
    claims.email_verified !== true ||
    claims.nonce !== nonce ||
    typeof claims.email !== "string"
  )
    throw new Error("Google proof tidak valid.");
  return {
    subject: claims.sub,
    email: normalizeEmail(claims.email),
    name: typeof claims.name === "string" ? claims.name.trim().slice(0, 100) || null : null,
    avatarUrl: permittedGoogleAvatar(claims.picture),
  };
}
