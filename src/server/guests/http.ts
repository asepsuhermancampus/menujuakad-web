import "server-only";
import { NextResponse } from "next/server";
import { assertTrustedOrigin } from "@/server/auth/request-policy";
import { WorkspaceError } from "@/server/invitations/errors";
import { z } from "zod";
import {
  archiveGuest,
  bulkCreateGuests,
  createGuest,
  listGuests,
  updateGuest,
  updateRsvp,
} from "./service";

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
      /* Impor massal 500 baris tetap jauh di bawah 256 KiB. */
      if (length > 262144) {
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

async function handle(operation: () => Promise<Response>): Promise<Response> {
  try {
    return await operation();
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

function mutationGate(request: Request) {
  if (!assertTrustedOrigin(request)) throw new WorkspaceError(403, "Origin permintaan ditolak.");
}

const idSchema = /^[a-zA-Z0-9_-]{1,128}$/;

/* Koleksi tamu: GET daftar+ringkasan, POST tambah satu, PUT impor massal. */
export function guestCollection(request: Request, invitationId: string) {
  return handle(async () => {
    if (!idSchema.test(invitationId)) throw new WorkspaceError(404, "Undangan tidak ditemukan.");
    if (request.method === "GET") return NextResponse.json(await listGuests(invitationId), { headers });
    mutationGate(request);
    const raw = await readBody(request);
    if (request.method === "POST")
      return NextResponse.json({ guest: await createGuest(invitationId, raw) }, { status: 201, headers });
    if (request.method === "PUT")
      return NextResponse.json(await bulkCreateGuests(invitationId, raw), { status: 201, headers });
    throw new WorkspaceError(405, "Metode tidak didukung.");
  });
}

/* Satu tamu: PATCH ubah, DELETE arsipkan. */
export function guestResource(request: Request, invitationId: string, guestId: string) {
  return handle(async () => {
    if (!idSchema.test(invitationId) || !idSchema.test(guestId))
      throw new WorkspaceError(404, "Tamu tidak ditemukan.");
    mutationGate(request);
    const raw = await readBody(request);
    if (request.method === "PATCH")
      return NextResponse.json(
        { guest: await updateGuest(invitationId, guestId, raw) },
        { headers },
      );
    if (request.method === "DELETE") {
      if (!z.object({}).strict().safeParse(raw).success)
        throw new WorkspaceError(400, "Data hapus tidak valid.");
      await archiveGuest(invitationId, guestId);
      return new Response(null, { status: 204, headers });
    }
    throw new WorkspaceError(405, "Metode tidak didukung.");
  });
}

/* RSVP satu tamu: PUT mencatat/mengganti respons. */
export function guestRsvpResource(request: Request, invitationId: string, guestId: string) {
  return handle(async () => {
    if (!idSchema.test(invitationId) || !idSchema.test(guestId))
      throw new WorkspaceError(404, "Tamu tidak ditemukan.");
    if (request.method !== "PUT") throw new WorkspaceError(405, "Metode tidak didukung.");
    mutationGate(request);
    return NextResponse.json(
      { guest: await updateRsvp(invitationId, guestId, await readBody(request)) },
      { headers },
    );
  });
}
