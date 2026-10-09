import { handleGoogleStart } from "@/server/auth/google-handlers";
export const runtime = "nodejs";
export const POST = handleGoogleStart;
