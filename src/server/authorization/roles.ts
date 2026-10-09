import "server-only";
export type AuthRole = "CLIENT" | "SUPERADMIN";
export function isClientRole(role: unknown): boolean {
  return role === "CLIENT";
}
export function isAuthRole(role: unknown): role is AuthRole {
  return role === "CLIENT" || role === "SUPERADMIN";
}
