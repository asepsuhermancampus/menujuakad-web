import "server-only";
export class GoogleFlowError extends Error {
  constructor(
    public readonly code:
      "GOOGLE_FAILED" | "GOOGLE_CONFLICT" | "SESSION_REQUIRED" | "REAUTH_REQUIRED" | "RATE_LIMITED",
    public readonly returnTo: "/login" | "/account/security" = "/login",
  ) {
    super("Autentikasi Google tidak dapat diselesaikan.");
  }
}
