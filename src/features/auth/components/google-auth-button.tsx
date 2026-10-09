"use client";
import { Button } from "@/components/ui/button";
import { authRequest, AuthClientError, isGoogleAuthRedirect } from "../lib/auth-client";
import { useAuthRequest } from "../hooks/use-auth-request";
export function GoogleMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6C44.4 38.03 46.98 31.87 46.98 24.55z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59C10.05 27.14 9.77 25.6 9.77 24s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.15 1.45-4.92 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}
export function GoogleAuthButton({
  enabled,
  loading = false,
  intent = "login",
  next,
  label = "Masuk dengan Google",
  disabled = false,
}: {
  enabled: boolean;
  loading?: boolean;
  intent?: "login" | "link" | "reauthenticate";
  next?: string;
  label?: string;
  disabled?: boolean;
}) {
  const state = useAuthRequest();
  return (
    <div className="stack auth-google">
      <Button
        type="button"
        className="google-button"
        disabled={
          !state.ready || !enabled || loading || disabled || state.pending || state.rateLimited
        }
        onClick={() =>
          void state.run(async () => {
            const result = await authRequest("/api/auth/google/start", "POST", {
              intent,
              ...(next ? { next } : {}),
            });
            if (!isGoogleAuthRedirect(result.redirectTo)) throw new AuthClientError(503);
            window.location.assign(result.redirectTo);
          })
        }
      >
        <GoogleMark />
        {state.pending ? "Menghubungkan…" : label}
      </Button>
      {!enabled && (
        <small className="muted">{loading ? "Memeriksa Google…" : "Google belum tersedia."}</small>
      )}
      {state.message && (
        <p role="alert" className="local-message">
          {state.message}
        </p>
      )}
    </div>
  );
}
