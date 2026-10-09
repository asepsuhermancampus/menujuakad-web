import "server-only";

const safeReturnPath = /^\/(?:dashboard|admin)(?:\/[A-Za-z0-9_-]+)*\/?$/;

export function buildSafeLoginRedirect(returnTo: string): string {
  // Allowlist path saja: tidak perlu decoding berulang atau memercayai origin browser.
  const match =
    typeof returnTo === "string" && returnTo.length <= 2048 ? safeReturnPath.exec(returnTo) : null;
  // Kesamaan penuh juga menolak newline terakhir yang dapat dilewati anchor $ regex.
  const target = match !== null && match[0] === returnTo ? returnTo : "/dashboard";
  return `/login?next=${encodeURIComponent(target)}`;
}

export function resolvePostLoginRedirect(
  next: string | undefined,
  role: "CUSTOMER" | "SUPERADMIN",
): string {
  const root = role === "SUPERADMIN" ? "/admin" : "/dashboard";
  if (typeof next !== "string") return root;
  const match = next.length <= 2048 ? safeReturnPath.exec(next) : null;
  return match && match[0] === next && (next === root || next.startsWith(`${root}/`)) ? next : root;
}
