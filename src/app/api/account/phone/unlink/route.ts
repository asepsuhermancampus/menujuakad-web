import { handleAccount } from "@/server/account/account-handlers";
export const runtime = "nodejs";
export function POST(request: Request) {
  return handleAccount(request, "phone/unlink");
}
