import { handleRecovery } from "@/server/auth/recovery-handlers";
export const runtime = "nodejs";
export function POST(request: Request) {
  return handleRecovery(request, "email/verify");
}
