"use client";
import Link from "next/link";
import { accountFixture } from "@/features/design-preview/data/fixtures";
import { authCopy } from "../config/auth-copy";
import { useVerificationPreview } from "../hooks/use-verification-preview";
import { AuthCard } from "./auth-card";
export function VerificationEmailPreview() {
  const state = useVerificationPreview();
  return (
    <AuthCard title={authCopy["verify-email"][0]} description={authCopy["verify-email"][1]}>
      <div className="stack">
        <div className="verification-symbol" aria-hidden="true">
          ✉
        </div>
        <article className="auth-state-card">
          <small>ALAMAT EMAIL CONTOH</small>
          <p>{accountFixture.email}</p>
          <span className="badge">Menunggu verifikasi · simulasi</span>
        </article>
        <ol className="auth-instructions">
          <li>Tinjau alamat email contoh.</li>
          <li>Periksa kotak masuk dan folder spam pada alur layanan nanti.</li>
          <li>Pratinjau tidak membuat tautan verifikasi atau mengirim email.</li>
        </ol>
        <p>
          Jeda kirim ulang contoh: <strong>{state.remaining} detik</strong>
        </p>
        <button className="button" disabled={state.remaining > 0} onClick={state.resend}>
          Simulasikan kirim ulang
        </button>
        <button className="button secondary" onClick={state.advance}>
          Simulasikan 30 detik berlalu
        </button>
        <button className="button secondary" onClick={state.inspect}>
          Tinjau kotak masuk contoh
        </button>
        {state.message && (
          <p role="status" className="local-message">
            {state.message}
          </p>
        )}
        <Link href="/login">Kembali ke halaman masuk</Link>
      </div>
    </AuthCard>
  );
}
