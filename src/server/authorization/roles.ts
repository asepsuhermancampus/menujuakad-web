import "server-only";
export type AuthRole = "CUSTOMER" | "CLIENT" | "VENDOR" | "SUPERADMIN";
export function isClientRole(role: unknown): boolean {
  return role === "CLIENT" || role === "CUSTOMER";
}
export function isAuthRole(role: unknown): role is AuthRole {
  return ["CLIENT", "CUSTOMER", "VENDOR", "SUPERADMIN"].includes(role as string);
}
