"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuthRequest } from "../hooks/use-auth-request";
import type { OtpChallenge } from "../types/auth-contracts";
export function OtpForm({
  challenge,
  verify,
  resend,
  disabled = false,
}: {
  disabled?: boolean;
  challenge: OtpChallenge;
  verify: (code: string) => Promise<void>;
  resend?: () => Promise<void>;
}) {
  const state = useAuthRequest();
  const [remaining, setRemaining] = useState(challenge.resendAfter);
  const [expired, setExpired] = useState(false);
  useEffect(() => {
    const deadline = Date.now() + challenge.resendAfter * 1000;
    const expiry = Date.now() + challenge.expiresIn * 1000;
    const tick = () => {
      setRemaining(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
      setExpired(Date.now() >= expiry);
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [challenge]);
  return (
    <div className="stack">
      <form
        method="post"
        className="stack"
        onSubmit={(event) => {
          event.preventDefault();
          if (expired || disabled) return;
          const code = String(new FormData(event.currentTarget).get("code") ?? "");
          if (!/^\d{6}$/.test(code)) {
            state.setMessage("Masukkan 6 digit kode.");
            return;
          }
          void state.run(() => verify(code));
        }}
      >
        <fieldset
          className="auth-fields stack"
          disabled={!state.ready || state.pending || state.rateLimited || expired || disabled}
        >
          <label>
            Kode SMS
            <input
              key={challenge.token}
              name="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              minLength={6}
              maxLength={6}
              required
            />
          </label>
          <Button
            type="submit"
            disabled={!state.ready || state.pending || state.rateLimited || expired || disabled}
          >
            {state.pending ? "Memeriksa…" : "Verifikasi kode"}
          </Button>
        </fieldset>
      </form>
      {disabled && <p role="status">Konfirmasi identitas untuk melanjutkan.</p>}
      {expired && <p role="status">Kode kedaluwarsa. Minta kode baru.</p>}
      {resend && (
        <Button
          className="outline"
          type="button"
          disabled={!state.ready || state.pending || state.rateLimited || remaining > 0 || disabled}
          onClick={() => void state.run(resend)}
        >
          {remaining > 0 ? `Kirim ulang dalam ${remaining} dtk` : "Kirim ulang kode"}
        </Button>
      )}
      {state.message && (
        <p role="alert" className="local-message">
          {state.message}
        </p>
      )}
    </div>
  );
}
