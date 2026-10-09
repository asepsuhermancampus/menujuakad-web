"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { identifierError, cleanIdentifierInput } from "../lib/identifier-input";
import { authRequest, AuthClientError } from "../lib/auth-client";
import { useAuthRequest } from "../hooks/use-auth-request";
import { useCapabilities } from "../hooks/use-capabilities";
import type { OtpChallenge } from "../types/auth-contracts";
import { RealAuthCard } from "./real-auth-card";
import { OtpForm } from "./otp-form";
import { NewPasswordForm } from "./password-reset-form";
export function PasswordRecoveryForm() {
  const state = useAuthRequest();
  const { capabilities, loaded } = useCapabilities();
  const [identifier, setIdentifier] = useState("");
  const [sent, setSent] = useState(false);
  const [challenge, setChallenge] = useState<OtpChallenge | null>(null);
  const [resetToken, setResetToken] = useState("");
  const phone = identifier.trim() !== "" && !identifier.includes("@");
  const available = phone ? capabilities.smsOtp : capabilities.emailRecovery;
  return (
    <RealAuthCard title="Pulihkan akun" description="Gunakan email atau telepon terverifikasi.">
      {resetToken ? (
        <NewPasswordForm token={resetToken} />
      ) : challenge ? (
        <>
          <p className="muted">Jika akun dapat dipulihkan, kode dikirim melalui SMS.</p>
          <OtpForm
            challenge={challenge}
            verify={async (code) => {
              const result = await authRequest<{ resetToken: string }>(
                "/api/auth/otp/verify",
                "POST",
                { token: challenge.token, code },
              );
              if (!result.data?.resetToken) throw new AuthClientError(400);
              setResetToken(result.data.resetToken);
              setChallenge(null);
            }}
            resend={async () => {
              const result = await authRequest<OtpChallenge>("/api/auth/otp/resend", "POST", {
                token: challenge.token,
              });
              if (!result.data?.token) throw new AuthClientError(503);
              setChallenge(result.data);
            }}
          />
        </>
      ) : sent ? (
        <p role="status">Jika akun dapat dipulihkan, petunjuk akan dikirim.</p>
      ) : (
        <form
          className="stack"
          method="post"
          action="/api/auth/forgot-password"
          onSubmit={(event) => {
            event.preventDefault();
            if (!available) return;
            const error = identifierError(identifier);
            if (error) {
              state.setMessage(error);
              return;
            }
            void state.run(async () => {
              const result = await authRequest<OtpChallenge>("/api/auth/forgot-password", "POST", {
                identifier: cleanIdentifierInput(identifier),
              });
              if (phone && result.data?.token) setChallenge(result.data);
              else setSent(true);
            });
          }}
        >
          <fieldset
            className="auth-fields stack"
            disabled={!state.ready || state.pending || state.rateLimited}
          >
            <label>
              Email atau nomor telepon
              <input
                name="identifier"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoComplete="username"
                type="text"
                required
                maxLength={254}
              />
            </label>
            {!available && (
              <small className="muted">
                {!loaded
                  ? "Memeriksa layanan…"
                  : phone
                    ? "Pemulihan SMS belum tersedia."
                    : "Pemulihan email belum tersedia."}
              </small>
            )}
            <Button
              type="submit"
              disabled={!state.ready || state.pending || state.rateLimited || !available}
            >
              {state.pending ? "Memproses…" : "Kirim petunjuk"}
            </Button>
          </fieldset>
        </form>
      )}
      {state.message && (
        <p role="alert" className="local-message">
          {state.message}
        </p>
      )}
      <p className="auth-footnote">
        <Link href="/login">Kembali ke masuk</Link>
      </p>
    </RealAuthCard>
  );
}
