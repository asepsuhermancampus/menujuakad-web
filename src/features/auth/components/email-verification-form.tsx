"use client";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { authRequest } from "../lib/auth-client";
import { useAuthRequest } from "../hooks/use-auth-request";
import { useTokenFragment } from "../hooks/use-token-fragment";
import { RealAuthCard } from "./real-auth-card";
export function EmailVerificationForm() {
  const state = useAuthRequest();
  const { token, loaded } = useTokenFragment();
  const [done, setDone] = useState(false);
  return (
    <RealAuthCard title="Verifikasi email">
      {done ? (
        <p role="status">Email terverifikasi.</p>
      ) : token ? (
        <>
          <p className="muted">Konfirmasi email untuk melindungi akun Anda.</p>
          <Button
            type="button"
            disabled={!state.ready || state.pending || state.rateLimited}
            onClick={() =>
              void state.run(async () => {
                await authRequest("/api/auth/email/verify", "POST", { token });
                setDone(true);
              })
            }
          >
            {state.pending ? "Memverifikasi…" : "Verifikasi email"}
          </Button>
        </>
      ) : (
        <p role="status">
          {loaded
            ? "Tautan tidak berlaku. Minta verifikasi dari pengaturan akun."
            : "Memeriksa tautan…"}
        </p>
      )}
      {state.message && (
        <p role="alert" className="local-message">
          {state.message}
        </p>
      )}
      <p className="auth-footnote">
        <Link href={done ? "/login" : "/account/security"}>
          {done ? "Masuk" : "Pengaturan keamanan"}
        </Link>
      </p>
    </RealAuthCard>
  );
}
