import { handleAccount } from "@/server/account/account-handlers";
export const runtime = "nodejs";
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  return handleAccount(request, "sessions/delete", undefined, (await context.params).id);
}
