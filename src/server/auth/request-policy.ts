import "server-only";
import { createHmac } from "node:crypto";
import { isIP } from "node:net";
import { z } from "zod";
import { normalizeIdentifier, normalizeEmail, loginPasswordSchema } from "./identifiers";
export type AuthConfig = Readonly<{ origin: string; secret: string; trustProxy: boolean }>;
export function getAuthConfig(): AuthConfig {
  const secret = process.env.AUTH_SECRET;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!secret || secret.length < 32 || !appUrl) throw new Error("Autentikasi belum dikonfigurasi.");
  const url = new URL(appUrl);
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    (process.env.NODE_ENV === "production" && url.protocol !== "https:")
  )
    throw new Error("Origin autentikasi tidak valid.");
  return { origin: url.origin, secret, trustProxy: process.env.AUTH_TRUST_PROXY === "1" };
}
export function requireSameOrigin(request: Request, config: AuthConfig): void {
  if (request.headers.get("origin") !== config.origin) throw new Error("Origin tidak valid.");
  const site = request.headers.get("sec-fetch-site");
  if (site && site !== "same-origin" && site !== "none") throw new Error("Origin tidak valid.");
}
const loginSchema = z
  .object({
    email: z.string().optional(),
    identifier: z.string().optional(),
    password: loginPasswordSchema,
    next: z.string().max(2048).optional(),
  })
  .strict()
  .refine((value) => (value.email === undefined) !== (value.identifier === undefined));
export async function readLoginInput(request: Request) {
  const input = loginSchema.parse(await readBoundedJson(request));
  if (input.email !== undefined)
    return { email: normalizeEmail(input.email), password: input.password, next: input.next };
  return {
    identifier: normalizeIdentifier(input.identifier!).value,
    password: input.password,
    next: input.next,
  };
}
export async function readBoundedJson(request: Request): Promise<unknown> {
  if (
    request.headers.get("content-type")?.split(";")[0].trim() !== "application/json" ||
    !request.body
  )
    throw new Error("Permintaan tidak valid.");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 4096) {
        await reader.cancel();
        throw new Error("Permintaan terlalu besar.");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}
export type ThrottleKey = { keyHash: string; limit: number; windowSeconds?: number };
export function getThrottleKeys(
  email: string,
  request: Request,
  config: AuthConfig,
): ThrottleKey[] {
  // Caddy appends the immediate peer: only enable behind a controlled, private upstream.
  const peer = config.trustProxy
    ? request.headers.get("x-forwarded-for")?.split(",").at(-1)?.trim()
    : undefined;
  const ip = peer && isIP(peer) ? peer : "shared-untrusted";
  const hash = (scope: string) => createHmac("sha256", config.secret).update(scope).digest("hex");
  return [
    { keyHash: hash(`email:${email}`), limit: 5 },
    { keyHash: hash(`ip:${ip}`), limit: 100 },
  ];
}

/** Reusable mutation gate; false on missing config or untrusted/missing Origin. */
export function assertTrustedOrigin(request: Request): boolean {
  try {
    requireSameOrigin(request, getAuthConfig());
    return true;
  } catch {
    return false;
  }
}

export function getScopedThrottleKeys(
  scope: string,
  identifier: string,
  request: Request,
  config: AuthConfig,
  limits: { identifier?: number; ip?: number; windowSeconds?: number } = {},
): ThrottleKey[] {
  const legacy = getThrottleKeys(identifier, request, config);
  const hash = (value: string) =>
    createHmac("sha256", config.secret).update(`${scope}:${value}`).digest("hex");
  return [
    {
      keyHash: hash(legacy[0].keyHash),
      limit: limits.identifier ?? 5,
      windowSeconds: limits.windowSeconds ?? 900,
    },
    {
      keyHash: hash(legacy[1].keyHash),
      limit: limits.ip ?? 100,
      windowSeconds: limits.windowSeconds ?? 900,
    },
  ];
}
