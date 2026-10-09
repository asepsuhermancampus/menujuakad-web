import type { AuthMode } from "../config/auth-copy";
import { StandardAuthForm } from "./standard-auth-form";
import { VerificationEmailPreview } from "./verification-email-preview";
import { AccountMethodConflictPreview } from "./account-method-conflict-preview";
export type { AuthMode } from "../config/auth-copy";
export function AuthForm({ mode = "login" }: { mode?: AuthMode }) {
  if (mode === "verify-email") return <VerificationEmailPreview />;
  if (mode === "conflict") return <AccountMethodConflictPreview />;
  return <StandardAuthForm mode={mode} />;
}
