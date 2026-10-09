import { handleGoogleCallback } from "@/server/auth/google-handlers";
export const runtime = "nodejs";
export const GET = handleGoogleCallback;
