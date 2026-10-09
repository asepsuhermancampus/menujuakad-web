"use client";
import { Button } from "@/components/ui/button";
import { authRequest } from "@/features/auth/lib/auth-client";
import { useAuthRequest } from "@/features/auth/hooks/use-auth-request";
import type { SecurityDto } from "../types/account-contracts";
export function SmsOtpSettings({
  security,
  proved,
  refresh,
}: {
  security: SecurityDto;
  proved: boolean;
  refresh: () => Promise<void>;
}) {
  const state = useAuthRequest();
  const canEnable = security.hasPassword && security.phoneVerified && security.capabilities.smsOtp;
  const allowed = proved && (security.smsOtpEnabled || canEnable);
  return (
    <section className="card stack">
      <h2>Kode SMS saat masuk</h2>
      <p className="muted">Tambahkan kode SMS setelah kata sandi saat masuk.</p>
      {!canEnable && !security.smsOtpEnabled && (
        <small className="muted">
          {!security.capabilities.smsOtp
            ? "Layanan SMS belum tersedia."
            : "Tambahkan kata sandi dan verifikasi nomor telepon terlebih dahulu."}
        </small>
      )}
      {security.smsOtpEnabled && !security.capabilities.smsOtp && (
        <p className="notice">
          SMS belum tersedia. Gunakan metode masuk lain yang sudah terhubung, atau nonaktifkan kode
          SMS setelah konfirmasi identitas.
        </p>
      )}
      <Button
        type="button"
        className="outline"
        aria-pressed={security.smsOtpEnabled}
        disabled={!state.ready || state.pending || state.rateLimited || !allowed}
        onClick={() =>
          void state.run(async () => {
            if (!allowed) return;
            await authRequest("/api/account/security", "PATCH", {
              smsOtpEnabled: !security.smsOtpEnabled,
            });
            await refresh();
            state.setSuccess(
              security.smsOtpEnabled
                ? "Kode SMS saat masuk dinonaktifkan."
                : "Kode SMS saat masuk diaktifkan.",
            );
          })
        }
      >
        {state.pending
          ? "Menyimpan…"
          : security.smsOtpEnabled
            ? "Nonaktifkan kode SMS"
            : "Aktifkan kode SMS"}
      </Button>
      {state.message && <p role={state.failed ? "alert" : "status"}>{state.message}</p>}
    </section>
  );
}
