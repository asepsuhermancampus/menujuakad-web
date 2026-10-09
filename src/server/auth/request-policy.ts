import "server-only";
import { createHmac } from "node:crypto";
import { isIP } from "node:net";
import { z } from "zod";
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
}
const loginSchema = z
  .object({
    email: z.string().trim().toLowerCase().max(254).email(),
    password: z
      .string()
      .min(1)
      .max(256)
      .refine((value) => Buffer.byteLength(value, "utf8") <= 1024),
    next: z.string().max(2048).optional(),
  })
  .strict();
export async function readLoginInput(request: Request) {
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
  return loginSchema.parse(JSON.parse(Buffer.concat(chunks).toString("utf8")));
}
export type ThrottleKey = { keyHash: string; limit: number };
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
