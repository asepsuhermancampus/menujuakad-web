import "server-only";
import { redirect } from "next/navigation";
import { buildSafeLoginRedirect } from "./redirect-policy";
import { getVerifiedSession, type VerifiedSession } from "./session";

async function requireSession(
  returnTo: string,
  role: VerifiedSession["role"],
): Promise<VerifiedSession> {
  const session = await getVerifiedSession();
  if (
    !session ||
    session.role !== role ||
    typeof session.userId !== "string" ||
    session.userId.trim().length === 0 ||
    !Number.isSafeInteger(session.expiresAt) ||
    session.expiresAt <= Date.now()
  ) {
    redirect(buildSafeLoginRedirect(returnTo));
  }
  return session;
}

export function requireCustomerSession(returnTo: string): Promise<VerifiedSession> {
  return requireSession(returnTo, "CUSTOMER");
}

export function requireSuperadminSession(returnTo: string): Promise<VerifiedSession> {
  return requireSession(returnTo, "SUPERADMIN");
}
