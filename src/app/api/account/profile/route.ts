import { handleAccount } from "@/server/account/account-handlers";
export const runtime = "nodejs";
export function GET(request: Request) {
  return handleAccount(request, "profile");
}
export function PATCH(request: Request) {
  return handleAccount(request, "profile");
}
