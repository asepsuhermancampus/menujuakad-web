"use client";
import { identifierError, cleanIdentifierInput } from "@/features/auth/lib/identifier-input";
import { ContactRemoval } from "./contact-removal";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { authRequest, AuthClientError } from "@/features/auth/lib/auth-client";
import { useAuthRequest } from "@/features/auth/hooks/use-auth-request";
import { useTokenFragment } from "@/features/auth/hooks/use-token-fragment";
import { OtpForm } from "@/features/auth/components/otp-form";
import type { OtpChallenge } from "@/features/auth/types/auth-contracts";
import type { SecurityDto } from "../types/account-contracts";
export function ContactSettings({
  security,
  proved,
  refresh,
}: {
  security: SecurityDto;
  proved: boolean;
  refresh: () => Promise<void>;
}) {
  const state = useAuthRequest();
  const { token } = useTokenFragment();
  const [emailDone, setEmailDone] = useState(false);
  const [phone, setPhone] = useState("");
  const [challenge, setChallenge] = useState<OtpChallenge | null>(null);
  async function requestPhone() {
    if (!proved) throw new AuthClientError(403, 0, "REAUTH_REQUIRED");
    const invalid = identifierError(phone);
    if (invalid || phone.includes("@")) {
      state.setMessage(invalid ?? "Masukkan nomor telepon.");
      return;
    }
    const result = await authRequest<OtpChallenge>("/api/account/phone/otp", "POST", {
      phone: cleanIdentifierInput(phone),
    });
    if (!result.data?.token) throw new AuthClientError(503);
    setChallenge(result.data);
  }
  return (
    <section className="card stack">
      <h2>Email & telepon</h2>
      <p className="muted">Kontak berubah setelah verifikasi berhasil.</p>
      <ContactRemoval security={security} proved={proved} refresh={refresh} />
      {token && !emailDone && (
        <Button
          type="button"
          disabled={!proved || state.pending || state.rateLimited || !state.ready}
          onClick={() =>
            void state.run(async () => {
              await authRequest("/api/account/email/verify", "POST", { token });
              setEmailDone(true);
              await refresh();
              state.setSuccess("Email terverifikasi.");
            })
          }
        >
          Konfirmasi email baru
        </Button>
      )}
      <form
        className="stack"
        method="post"
        onSubmit={(e) => {
          e.preventDefault();
          if (!proved || !security.capabilities.emailRecovery) return;
          const email = new FormData(e.currentTarget).get("email");
          void state.run(async () => {
            await authRequest("/api/account/email/request", "POST", { email });
            state.setSuccess("Periksa email untuk tautan verifikasi.");
          });
        }}
      >
        <fieldset
          className="auth-fields stack"
          disabled={
            !state.ready ||
            state.pending ||
            state.rateLimited ||
            !proved ||
            !security.capabilities.emailRecovery
          }
        >
          <label>
            Email
            <input name="email" type="email" autoComplete="email" maxLength={254} required />
          </label>
          <Button
            type="submit"
            className="outline"
            disabled={
              !state.ready ||
              state.pending ||
              state.rateLimited ||
              !proved ||
              !security.capabilities.emailRecovery
            }
          >
            Kirim verifikasi email
          </Button>
        </fieldset>
      </form>
      {!security.capabilities.emailRecovery && (
        <small className="muted">Verifikasi email belum tersedia.</small>
      )}
      {challenge ? (
        <OtpForm
          challenge={challenge}
          disabled={!proved || !security.capabilities.smsOtp}
          verify={async (code) => {
            if (!proved) throw new AuthClientError(403, 0, "REAUTH_REQUIRED");
            await authRequest("/api/account/phone/verify", "POST", {
              token: challenge.token,
              code,
            });
            setChallenge(null);
            await refresh();
            state.setSuccess("Telepon terverifikasi.");
          }}
          resend={requestPhone}
        />
      ) : (
        <form
          className="stack"
          method="post"
          onSubmit={(e) => {
            e.preventDefault();
            if (proved && security.capabilities.smsOtp) void state.run(requestPhone);
          }}
        >
          <fieldset
            className="auth-fields stack"
            disabled={
              !state.ready ||
              state.pending ||
              state.rateLimited ||
              !proved ||
              !security.capabilities.smsOtp
            }
          >
            <label>
              Nomor telepon
              <input
                name="phone"
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={24}
                required
                placeholder="08…"
              />
            </label>
            <Button
              type="submit"
              className="outline"
              disabled={
                !state.ready ||
                state.pending ||
                state.rateLimited ||
                !proved ||
                !security.capabilities.smsOtp
              }
            >
              Kirim kode SMS
            </Button>
          </fieldset>
        </form>
      )}
      {!security.capabilities.smsOtp && (
        <small className="muted">Verifikasi SMS belum tersedia.</small>
      )}
      {state.message && <p role={state.failed ? "alert" : "status"}>{state.message}</p>}
    </section>
  );
}
