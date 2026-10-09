"use client";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { authRequest } from "../lib/auth-client";
import { useAuthRequest } from "../hooks/use-auth-request";
import { useTokenFragment } from "../hooks/use-token-fragment";
import { PasswordField } from "./password-field";
import { RealAuthCard } from "./real-auth-card";
export function NewPasswordForm({ token }: { token: string }) {
  const state = useAuthRequest();
  const [done, setDone] = useState(false);
  if (done)
    return (
      <div className="stack">
        <p role="status">Kata sandi diperbarui. Silakan masuk kembali.</p>
        <Link className="button" href="/login">
          Masuk
        </Link>
      </div>
    );
  return (
    <>
      <form
        className="stack"
        method="post"
        action="/api/auth/reset-password"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          if (data.get("password") !== data.get("confirmation")) {
            state.setMessage("Konfirmasi kata sandi belum sesuai.");
            return;
          }
          void state.run(async () => {
            await authRequest("/api/auth/reset-password", "POST", {
              token,
              password: data.get("password"),
            });
            setDone(true);
          });
        }}
      >
        <fieldset
          className="auth-fields stack"
          disabled={!state.ready || state.pending || state.rateLimited || !token}
        >
          <PasswordField label="Kata sandi baru" newPassword />
          <PasswordField name="confirmation" label="Konfirmasi kata sandi" newPassword />
          <Button
            type="submit"
            disabled={!state.ready || state.pending || state.rateLimited || !token}
          >
            {state.pending ? "Menyimpan…" : "Simpan kata sandi"}
          </Button>
        </fieldset>
      </form>
      {state.message && (
        <p role="alert" className="local-message">
          {state.message}
        </p>
      )}
    </>
  );
}
export function PasswordResetForm() {
  const { token, loaded } = useTokenFragment();
  return (
    <RealAuthCard title="Kata sandi baru">
      {token ? (
        <NewPasswordForm token={token} />
      ) : (
        <p role="status">
          {loaded ? "Tautan tidak berlaku. Minta tautan baru." : "Memeriksa tautan…"}
        </p>
      )}
      <p className="auth-footnote">
        <Link href="/forgot-password">Minta tautan baru</Link>
      </p>
    </RealAuthCard>
  );
}
