import "server-only";
import { NextResponse } from "next/server";
import { assertTrustedOrigin } from "@/server/auth/request-policy";
import { WorkspaceError } from "@/server/invitations/errors";
import {
  createCustomerTestRequest,
  getCustomerTestRequest,
  listCustomerTestRequests,
  reviewPaymentTest,
} from "./service";
export const billingResponseHeaders = {
  "Cache-Control": "private, no-store",
  "X-Content-Type-Options": "nosniff",
};
export async function billingHandle(operation: () => Promise<Response>): Promise<Response> {
  try {
    return await operation();
  } catch (error) {
    const known = error instanceof WorkspaceError;
    return NextResponse.json(
      {
        message: known
          ? error.message
          : "Layanan pengujian sedang tidak tersedia. Silakan coba lagi.",
      },
      { status: known ? error.status : 503, headers: billingResponseHeaders },
    );
  }
}
async function readBillingBody(request: Request): Promise<unknown> {
  if (
    request.headers.get("content-type")?.split(";")[0].trim() !== "application/json" ||
    !request.body
  )
    throw new WorkspaceError(400, "Gunakan permintaan JSON.");
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
function requireMutationOrigin(request: Request) {
  if (!assertTrustedOrigin(request)) throw new WorkspaceError(403, "Origin permintaan ditolak.");
}
export function billingCollection(request: Request) {
  return billingHandle(async () => {
    if (request.method === "GET")
      return NextResponse.json(
        { requests: await listCustomerTestRequests() },
        { headers: billingResponseHeaders },
      );
    if (request.method !== "POST") throw new WorkspaceError(405, "Metode tidak didukung.");
    requireMutationOrigin(request);
    return NextResponse.json(
      { request: await createCustomerTestRequest(await readBillingBody(request)) },
      { status: 201, headers: billingResponseHeaders },
    );
  });
}
export function billingResource(id: string) {
  return billingHandle(async () =>
    NextResponse.json(
      { request: await getCustomerTestRequest(id) },
      { headers: billingResponseHeaders },
    ),
  );
}
export function adminPaymentReview(request: Request, id: string) {
  return billingHandle(async () => {
    if (request.method !== "PATCH") throw new WorkspaceError(405, "Metode tidak didukung.");
    requireMutationOrigin(request);
    return NextResponse.json(
      { request: await reviewPaymentTest(id, await readBillingBody(request)) },
      { headers: billingResponseHeaders },
    );
  });
}
