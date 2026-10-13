import "server-only";
import { getAuthConfig, getScopedThrottleKeys } from "@/server/auth/request-policy";
import { reserveLoginAttempt } from "@/server/auth/auth-repository";
import { WorkspaceError, unavailable } from "@/server/invitations/errors";
import { personalTokenSchema, publicRsvpSchema } from "./public-input";
import {
  getPublicRsvpContext as readContext,
  submitPublicRsvp as persistRsvp,
} from "./public-repository";

/*
 * Jalur RSVP publik berjalan TANPA sesi login; identitas hanya dari token
 * personal 43 karakter base64url yang cocok persis. Token di-hash untuk
 * pembatasan laju agar token asli tidak pernah masuk tabel throttle.
 */

function parseToken(personalToken: string) {
  const parsed = personalTokenSchema.safeParse(personalToken);
  if (!parsed.success) throw new WorkspaceError(404, "Tautan undangan tidak ditemukan.");
  return parsed.data;
}

/*
 * Batas laju per token + per IP memakai infrastruktur throttle auth yang ada
 * (tabel AuthLoginThrottle). Limit token ketat karena satu tautan hanya untuk
 * satu tamu; limit IP lebih longgar untuk jaringan bersama (mis. venue).
 */
async function throttlePublic(personalToken: string, request: Request) {
  const config = getAuthConfig();
  const keys = getScopedThrottleKeys("guest-rsvp", personalToken, request, config, {
    identifier: 10,
    ip: 300,
    windowSeconds: 900,
  });
  if (!(await reserveLoginAttempt(keys)))
    throw new WorkspaceError(429, "Terlalu banyak percobaan. Silakan coba lagi nanti.");
}

export async function getPublicRsvpContext(personalToken: string) {
  const token = parseToken(personalToken);
  try {
    return await readContext(token);
  } catch (error) {
    unavailable(error);
  }
}

export async function submitPublicRsvp(personalToken: string, request: Request, raw: unknown) {
  const token = parseToken(personalToken);
  await throttlePublic(token, request);
  const input = publicRsvpSchema.safeParse(raw);
  if (!input.success) throw new WorkspaceError(400, "Data RSVP tidak valid.");
  try {
    return await persistRsvp(token, input.data);
  } catch (error) {
    unavailable(error);
  }
}
