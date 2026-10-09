"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { identifierError, cleanIdentifierInput } from "../lib/identifier-input";
import { authRequest, AuthClientError, isLocalAuthRedirect } from "../lib/auth-client";
import { useAuthRequest } from "../hooks/use-auth-request";
import { useCapabilities } from "../hooks/use-capabilities";
import { PasswordField } from "./password-field";
import { GoogleAuthButton } from "./google-auth-button";
import { RealAuthCard } from "./real-auth-card";
import { RegistrationSuccess } from "./registration-success";
import type { RegistrationVerification } from "../types/auth-contracts";
export function RegisterForm() {
  const [created, setCreated] = useState<{
    identifier: string;
    redirectTo: string;
    verification: RegistrationVerification;
  } | null>(null);
  const state = useAuthRequest();
  const { capabilities, loaded } = useCapabilities();
  if (created)
    return (
      <RealAuthCard title="Selamat datang">
        <RegistrationSuccess {...created} />
      </RealAuthCard>
    );
  return (
    <RealAuthCard title="Buat akun" description="Mulai cerita Anda bersama Menuju Akad.">
      <GoogleAuthButton
        enabled={capabilities.google}
        loading={!loaded}
        label="Daftar dengan Google"
      />
      <p className="divider">atau</p>
      <form
        className="stack"
        method="post"
        action="/api/auth/register"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const error = identifierError(data.get("identifier"));
          if (error) {
            state.setMessage(error);
            return;
          }
          void state.run(async () => {
            const identifier = cleanIdentifierInput(String(data.get("identifier") ?? ""));
            const result = await authRequest<RegistrationVerification>(
              "/api/auth/register",
              "POST",
              {
                name: data.get("name"),
                identifier,
                password: data.get("password"),
              },
            );
            if (
              !isLocalAuthRedirect(result.redirectTo) ||
              !result.data ||
              !["email", "sms"].includes(result.data.channel)
            )
              throw new AuthClientError(503);
            setCreated({ identifier, redirectTo: result.redirectTo, verification: result.data });
          });
        }}
      >
        <fieldset
          className="auth-fields stack"
          disabled={!state.ready || state.pending || state.rateLimited}
        >
          <label>
            Nama lengkap
            <input name="name" autoComplete="name" required maxLength={100} />
          </label>
          <label>
            Email atau nomor telepon
            <input name="identifier" type="text" autoComplete="username" required maxLength={254} />
          </label>
          <PasswordField newPassword />
          <label className="check auth-consent">
            <input type="checkbox" required />
            <span>
              Saya menyetujui <Link href="/terms">Ketentuan</Link> dan{" "}
              <Link href="/privacy">Privasi</Link>.
            </span>
          </label>
          <Button type="submit" disabled={!state.ready || state.pending || state.rateLimited}>
            {state.pending ? "Membuat akun…" : "Daftar"}
          </Button>
        </fieldset>
        <noscript>Aktifkan JavaScript untuk mendaftar dengan aman.</noscript>
      </form>
      {state.message && (
        <p role="alert" className="local-message">
          {state.message}
        </p>
      )}
      <p className="auth-footnote">
        Sudah punya akun? <Link href="/login">Masuk</Link>
      </p>
    </RealAuthCard>
  );
}
