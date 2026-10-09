"use client";
import { Button } from "@/components/ui/button";
import { GoogleAuthButton } from "@/features/auth/components/google-auth-button";
import { authRequest } from "@/features/auth/lib/auth-client";
import { useAuthRequest } from "@/features/auth/hooks/use-auth-request";
import type { SecurityDto } from "../types/account-contracts";
export function GoogleSettings({
  security,
  proved,
  refresh,
}: {
  security: SecurityDto;
  proved: boolean;
  refresh: () => Promise<void>;
}) {
  const state = useAuthRequest();
  const backup = security.hasPassword && (security.emailVerified || security.phoneVerified);
  return (
    <section className="card stack">
      <h2>Google</h2>
      {security.googleLinked ? (
        <>
          <p className="muted">Google terhubung.</p>
          <Button
            type="button"
            className="outline"
            disabled={!state.ready || state.pending || state.rateLimited || !proved || !backup}
            onClick={() =>
              void state.run(async () => {
                await authRequest("/api/account/google/unlink", "POST", {});
                await refresh();
                state.setSuccess("Google dilepas.");
              })
            }
          >
            Lepas Google
          </Button>
          {!backup && (
            <small className="muted">
              Tambahkan kata sandi dan kontak terverifikasi sebelum melepas Google.
            </small>
          )}
        </>
      ) : (
        <GoogleAuthButton
          enabled={security.capabilities.google}
          disabled={!proved}
          intent="link"
          next="/account/security"
          label="Lanjutkan dengan Google"
        />
      )}
      {state.message && <p role={state.failed ? "alert" : "status"}>{state.message}</p>}
    </section>
  );
}
