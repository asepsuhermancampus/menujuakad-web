import "server-only";
import { isAuthRole, isClientRole } from "./roles";
import { redirect } from "next/navigation";
import { buildSafeLoginRedirect } from "./redirect-policy";
import { getVerifiedSession, type VerifiedSession } from "./session";

async function requireSession(
  returnTo: string,
  role?: VerifiedSession["role"],
): Promise<VerifiedSession> {
  const session = await getVerifiedSession();
  if (
    !session ||
    (role
      ? role === "CUSTOMER"
        ? !isClientRole(session.role)
        : session.role !== role
      : !isAuthRole(session.role)) ||
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

export function requireAccountSession(returnTo: string): Promise<VerifiedSession> {
  return requireSession(returnTo);
}
export function requireVendorSession(returnTo: string): Promise<VerifiedSession> {
  return requireSession(returnTo, "VENDOR");
}
