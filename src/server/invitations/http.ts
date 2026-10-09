import "server-only";
import { NextResponse } from "next/server";
import { assertTrustedOrigin } from "@/server/auth/request-policy";
import { z } from "zod";
import { WorkspaceError } from "./errors";
import {
  createCustomerInvitation,
  deleteCustomerInvitation,
  getCustomerInvitation,
  listCustomerInvitations,
  updateCustomerInvitation,
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
      if (length > 32768) {
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
export function invitationCollection(request: Request) {
  return handle(async () => {
    if (request.method === "GET")
      return NextResponse.json({ invitations: await listCustomerInvitations() }, { headers });
    if (request.method !== "POST") throw new WorkspaceError(405, "Metode tidak didukung.");
    mutationGate(request);
    return NextResponse.json(
      { invitation: await createCustomerInvitation(await readBody(request)) },
      { status: 201, headers },
    );
  });
}
export function invitationResource(request: Request, id: string) {
  return handle(async () => {
    if (!/^[a-zA-Z0-9_-]{1,128}$/.test(id))
      throw new WorkspaceError(404, "Undangan tidak ditemukan.");
    if (request.method === "GET")
      return NextResponse.json({ invitation: await getCustomerInvitation(id) }, { headers });
    mutationGate(request);
    const raw = await readBody(request);
    if (request.method === "PATCH")
      return NextResponse.json(
        { invitation: await updateCustomerInvitation(id, raw) },
        { headers },
      );
    if (request.method === "DELETE") {
      if (!z.object({}).strict().safeParse(raw).success)
        throw new WorkspaceError(400, "Data hapus tidak valid.");
      await deleteCustomerInvitation(id);
      return new Response(null, { status: 204, headers });
    }
    throw new WorkspaceError(405, "Metode tidak didukung.");
  });
}
