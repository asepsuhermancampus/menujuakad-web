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
    (role ? !roleMatches(session.role, role) : !isAuthRole(session.role)) ||
    typeof session.userId !== "string" ||
    session.userId.trim().length === 0 ||
    !Number.isSafeInteger(session.expiresAt) ||
    session.expiresAt <= Date.now()
  ) {
    redirect(buildSafeLoginRedirect(returnTo));
  }
  return session;
}

/** CLIENT adalah satu-satunya role customer; SUPERADMIN harus cocok persis. */
function roleMatches(actual: VerifiedSession["role"], required: VerifiedSession["role"]): boolean {
  return required === "CLIENT" ? isClientRole(actual) : actual === required;
}

export function requireCustomerSession(returnTo: string): Promise<VerifiedSession> {
  return requireSession(returnTo, "CLIENT");
}

export function requireSuperadminSession(returnTo: string): Promise<VerifiedSession> {
  return requireSession(returnTo, "SUPERADMIN");
}

export function requireAccountSession(returnTo: string): Promise<VerifiedSession> {
  return requireSession(returnTo);
}
