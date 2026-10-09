"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuthRequest } from "../hooks/use-auth-request";
import { authRequest } from "../lib/auth-client";
import type { RegistrationVerification } from "../types/auth-contracts";
export function RegistrationSuccess({
  identifier,
  redirectTo,
  verification,
}: {
  identifier: string;
  redirectTo: string;
  verification: RegistrationVerification;
}) {
  const state = useAuthRequest();
  return (
    <div className="stack">
      <p role="status">Akun dibuat. Kontak Anda belum terverifikasi.</p>
      <p className="muted">Verifikasi kontak agar dapat dipakai untuk pemulihan akun.</p>
      {verification.verificationAvailable ? (
        verification.channel === "email" ? (
          <Button
            type="button"
            disabled={!state.ready || state.pending || state.rateLimited}
            onClick={() =>
              void state.run(async () => {
                await authRequest("/api/auth/email/request", "POST", {
                  identifier,
                  purpose: "register",
                });
                state.setSuccess("Jika verifikasi dapat dikirim, periksa email Anda.");
              })
            }
          >
            {state.pending ? "Memproses…" : "Kirim verifikasi email"}
          </Button>
        ) : (
          <Link className="button outline" href="/account/security">
            Verifikasi nomor telepon
          </Link>
        )
      ) : (
        <p className="muted">
          Verifikasi {verification.channel === "email" ? "email" : "SMS"} belum tersedia. Anda tetap
          dapat masuk dengan kata sandi.
        </p>
      )}
      {state.message && <p role={state.failed ? "alert" : "status"}>{state.message}</p>}
      <Link href="/account/security">Kelola kontak & keamanan</Link>
      <Link className="button" href={redirectTo}>
        Lanjut ke ruang kerja
      </Link>
    </div>
  );
}
