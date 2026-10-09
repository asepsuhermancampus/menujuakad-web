"use client";
import Link from "next/link";
import { accountFixture } from "@/features/design-preview/data/fixtures";
import { authCopy } from "../config/auth-copy";
import { useAccountMethodPreview } from "../hooks/use-account-method-preview";
import { AuthCard } from "./auth-card";
export function AccountMethodConflictPreview() {
  const state = useAccountMethodPreview();
  return (
    <AuthCard title={authCopy.conflict[0]} description={authCopy.conflict[1]}>
      <div className="stack">
        <article className="auth-state-card">
          <small>AKUN CONTOH</small>
          <p>{accountFixture.email}</p>
          <span className="badge">Metode berbeda · ilustrasi</span>
        </article>
        <article className="card stack">
          <h2>Metode Google (contoh)</h2>
          <p>
            Dalam skenario ini, akun ilustratif sebelumnya memakai Google. Provider belum terhubung.
          </p>
          <button className="button" onClick={state.google}>
            Tinjau masuk dengan Google
          </button>
        </article>
        <article className="card stack">
          <h2>Metode Email (contoh)</h2>
          <p>
            Tinjau alur pemulihan atau penautan metode setelah autentikasi tersedia. Tidak
            menggabungkan akun pada preview.
          </p>
          <button className="button secondary" onClick={state.recover}>
            Tinjau pemulihan email
          </button>
        </article>
        <p className="notice">
          Pratinjau tidak membuktikan keberadaan akun, kepemilikan email, atau metode masuk nyata.
        </p>
        {state.message && (
          <p role="status" className="local-message">
            {state.message}
          </p>
        )}
        <Link href="/login">Gunakan alamat contoh lain</Link>
      </div>
    </AuthCard>
  );
}
