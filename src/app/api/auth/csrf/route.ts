import { handleCsrf } from "@/server/auth/config-handlers";
export const runtime = "nodejs";
export const GET = handleCsrf;
