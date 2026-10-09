import "server-only";
import type { AuthRole } from "./roles";

const safeReturnPath = /^\/(?:dashboard|admin|vendor|account)(?:\/[A-Za-z0-9_-]+)*\/?$/;

export function buildSafeLoginRedirect(returnTo: string): string {
  // Allowlist path saja: tidak perlu decoding berulang atau memercayai origin browser.
  const match =
    typeof returnTo === "string" && returnTo.length <= 2048 ? safeReturnPath.exec(returnTo) : null;
  // Kesamaan penuh juga menolak newline terakhir yang dapat dilewati anchor $ regex.
  const target = match !== null && match[0] === returnTo ? returnTo : "/dashboard";
  return `/login?next=${encodeURIComponent(target)}`;
}

export function resolvePostLoginRedirect(next: string | undefined, role: AuthRole): string {
  const root = role === "SUPERADMIN" ? "/admin" : role === "VENDOR" ? "/vendor" : "/dashboard";
  if (typeof next !== "string") return root;
  const match = next.length <= 2048 ? safeReturnPath.exec(next) : null;
  return match &&
    match[0] === next &&
    (next === root ||
      next.startsWith(`${root}/`) ||
      next === "/account" ||
      next === "/account/security")
    ? next
    : root;
}
