import { handleLogin } from "@/server/auth/auth-handlers";
export const runtime = "nodejs";
export async function POST(request: Request) {
  return handleLogin(request);
}
