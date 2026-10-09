"use client";
import { Button } from "@/components/ui/button";
import { PasswordField } from "@/features/auth/components/password-field";
import { authRequest } from "@/features/auth/lib/auth-client";
import { useAuthRequest } from "@/features/auth/hooks/use-auth-request";
import type { SecurityDto } from "../types/account-contracts";
export function PasswordSettings({
  security,
  proved,
  refresh,
}: {
  security: SecurityDto;
  proved: boolean;
  refresh: () => Promise<void>;
}) {
  const state = useAuthRequest();
  const allowed =
    proved && (security.hasPassword || security.emailVerified || security.phoneVerified);
  return (
    <section className="card stack">
      <h2>{security.hasPassword ? "Ganti kata sandi" : "Tambahkan kata sandi"}</h2>
      {!security.hasPassword && !security.emailVerified && !security.phoneVerified && (
        <p className="muted">Verifikasi kontak terlebih dahulu.</p>
      )}
      <form
        className="stack"
        method="post"
        onSubmit={(e) => {
          e.preventDefault();
          if (!allowed) return;
          const data = new FormData(e.currentTarget);
          const form = e.currentTarget;
          if (data.get("password") !== data.get("confirmation")) {
            state.setMessage("Konfirmasi kata sandi belum sesuai.");
            return;
          }
          void state.run(async () => {
            await authRequest("/api/account/password", "POST", {
              password: data.get("password"),
              ...(security.hasPassword ? { currentPassword: data.get("currentPassword") } : {}),
            });
            form.reset();
            await refresh();
            state.setSuccess("Kata sandi disimpan. Sesi lain telah diakhiri.");
          });
        }}
      >
        <fieldset
          className="auth-fields stack"
          disabled={!state.ready || state.pending || state.rateLimited || !allowed}
        >
          {security.hasPassword && (
            <PasswordField name="currentPassword" label="Kata sandi saat ini" />
          )}
          <PasswordField newPassword label="Kata sandi baru" />
          <PasswordField newPassword name="confirmation" label="Konfirmasi kata sandi" />
          <Button
            type="submit"
            disabled={!state.ready || state.pending || state.rateLimited || !allowed}
          >
            {state.pending ? "Menyimpan…" : "Simpan kata sandi"}
          </Button>
        </fieldset>
      </form>
      {state.message && <p role={state.failed ? "alert" : "status"}>{state.message}</p>}
    </section>
  );
}
