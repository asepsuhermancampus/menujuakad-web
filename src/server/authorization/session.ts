import "server-only";
import { cookies } from "next/headers";
import { unstable_rethrow } from "next/navigation";
import { getAuthConfig } from "../auth/request-policy";
import { SESSION_COOKIE, verifySessionToken } from "../auth/auth-service";

/** Konteks internal server; hanya resolver provider terverifikasi boleh membentuknya. */
export type VerifiedSession = Readonly<{
  userId: string;
  role: "CUSTOMER" | "SUPERADMIN";
  /** Masa berlaku dalam epoch milidetik, bukan epoch detik. */
  expiresAt: number;
}>;

export async function getVerifiedSession(): Promise<VerifiedSession | null> {
  try {
    // Touch the request first: absent build secrets must not prerender a permanent denial.
    const jar = await cookies();
    getAuthConfig();
    return await verifySessionToken(jar.get(SESSION_COOKIE)?.value);
  } catch (error) {
    unstable_rethrow(error);
    // Configuration, request-context or database failure must never grant access.
    return null;
  }
}
