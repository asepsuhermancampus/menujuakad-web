"use client";
import Link from "next/link";
import { OtpForm } from "./otp-form";
import { OAuthFeedback } from "./oauth-feedback";
import { Button } from "@/components/ui/button";
import { useLogin } from "../hooks/use-login";
import { useCapabilities } from "../hooks/use-capabilities";
import { GoogleAuthButton } from "./google-auth-button";
import { PasswordField } from "./password-field";
import { RealAuthCard } from "./real-auth-card";
export function LoginForm({ next, error }: { next?: string; error?: string }) {
  const state = useLogin(next);
  const { capabilities, loaded } = useCapabilities();
  if (state.challenge)
    return (
      <RealAuthCard title="Konfirmasi masuk" description="Masukkan kode SMS untuk melanjutkan.">
        <OtpForm challenge={state.challenge} verify={state.verify} resend={state.resend} />
        <Button type="button" className="outline" onClick={state.cancelChallenge}>
          Gunakan metode lain
        </Button>
      </RealAuthCard>
    );
  return (
    <RealAuthCard title="Masuk" description="Selamat datang kembali.">
      <OAuthFeedback code={error} />
      <GoogleAuthButton enabled={capabilities.google} loading={!loaded} next={next} />
      <p className="divider">atau</p>
      <form className="stack" action="/api/auth/login" method="post" onSubmit={state.submit}>
        <fieldset
          className="auth-fields stack"
          disabled={!state.ready || state.pending || state.rateLimited}
        >
          <label>
            Email atau nomor telepon
            <input
              name="identifier"
              type="text"
              required
              maxLength={254}
              autoComplete="username"
              placeholder="Email atau 08…"
            />
          </label>
          <PasswordField />
          <Link className="auth-recovery-link" href="/forgot-password">
            Lupa kata sandi?
          </Link>
          <Button type="submit" disabled={!state.ready || state.pending || state.rateLimited}>
            {state.pending ? "Memproses…" : "Masuk"}
          </Button>
        </fieldset>
        <noscript>Aktifkan JavaScript untuk masuk dengan aman.</noscript>
      </form>
      {state.message && (
        <p role="alert" className="local-message">
          {state.message}
        </p>
      )}
      <p className="auth-footnote">
        Belum punya akun? <Link href="/register">Daftar</Link>
      </p>
    </RealAuthCard>
  );
}
