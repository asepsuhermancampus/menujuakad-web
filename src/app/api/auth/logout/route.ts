import { handleLogout } from "@/server/auth/auth-handlers";
export const runtime = "nodejs";
export async function POST(request: Request) {
  return handleLogout(request);
}
