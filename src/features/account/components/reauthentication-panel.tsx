"use client";
import { Button } from "@/components/ui/button";
import { authRequest } from "@/features/auth/lib/auth-client";
import { useAuthRequest } from "@/features/auth/hooks/use-auth-request";
import { GoogleAuthButton } from "@/features/auth/components/google-auth-button";
import { PasswordField } from "@/features/auth/components/password-field";
import type { SecurityDto } from "../types/account-contracts";
export function ReauthenticationPanel({
  security,
  proved,
  refresh,
}: {
  security: SecurityDto;
  proved: boolean;
  refresh: () => Promise<void>;
}) {
  const state = useAuthRequest();
  return (
    <section className="card stack">
      <h2>Konfirmasi identitas</h2>
      <p className="muted">
        {proved
          ? "Terkonfirmasi. Perubahan sensitif tersedia selama 5 menit."
          : "Konfirmasi sebelum mengubah metode masuk atau sesi lain."}
      </p>
      {security.hasPassword ? (
        <form
          className="stack"
          method="post"
          onSubmit={(e) => {
            e.preventDefault();
            const password = new FormData(e.currentTarget).get("password");
            const form = e.currentTarget;
            void state.run(async () => {
              await authRequest("/api/account/reauthenticate", "POST", { password });
              form.reset();
              await refresh();
            });
          }}
        >
          <fieldset
            className="auth-fields stack"
            disabled={!state.ready || state.pending || state.rateLimited}
          >
            <PasswordField label="Kata sandi saat ini" />
            <Button type="submit" disabled={!state.ready || state.pending || state.rateLimited}>
              {state.pending ? "Memeriksa…" : "Konfirmasi"}
            </Button>
          </fieldset>
        </form>
      ) : (
        <GoogleAuthButton
          enabled={security.googleLinked && security.capabilities.google}
          intent="reauthenticate"
          next="/account/security"
          label="Lanjutkan dengan Google"
        />
      )}
      {state.message && <p role="alert">{state.message}</p>}
    </section>
  );
}
