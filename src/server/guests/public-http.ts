import "server-only";
import { NextResponse } from "next/server";
import { assertTrustedOrigin } from "@/server/auth/request-policy";
import { WorkspaceError } from "@/server/invitations/errors";
import { submitPublicRsvp } from "./public-service";

/*
 * Handler HTTP RSVP publik. Mutasi tetap melewati gate origin terpercaya
 * (bukan sesi), body dibatasi 4 KiB, dan respons tidak pernah memuat detail
 * exception atau data tamu lain.
 */

const headers = { "Cache-Control": "private, no-store" };

async function readBody(request: Request): Promise<unknown> {
  if (
    request.headers.get("content-type")?.split(";")[0].trim() !== "application/json" ||
    !request.body
  )
    throw new WorkspaceError(400, "Gunakan permintaan JSON.");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > 4096) {
        await reader.cancel();
        throw new WorkspaceError(413, "Permintaan terlalu besar.");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new WorkspaceError(400, "Data JSON tidak valid.");
  }
}

export async function publicRsvpResource(request: Request, personalToken: string) {
  try {
    if (request.method !== "PUT") throw new WorkspaceError(405, "Metode tidak didukung.");
    if (!assertTrustedOrigin(request)) throw new WorkspaceError(403, "Origin permintaan ditolak.");
    const result = await submitPublicRsvp(personalToken, request, await readBody(request));
    return NextResponse.json({ ok: true, rsvp: result }, { headers });
  } catch (error) {
    const known = error instanceof WorkspaceError;
    return NextResponse.json(
      {
        ok: false,
        message: known ? error.message : "Layanan data sedang tidak tersedia. Silakan coba lagi.",
      },
      { status: known ? error.status : 503, headers },
    );
  }
}
