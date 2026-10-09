"use client";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLogin } from "../hooks/use-login";

/*
 * Halaman login resmi — desain bersih, satu fokus (form), teks minimum.
 * Blok panjang (notice, tombol Google nonaktif, divider ganda) dihapus; status
 * "akun uji" diringkas menjadi satu baris kecil di kaki kartu.
 *
 * Kontrak keamanan yang dipertahankan:
 * - form POST ke /api/auth/login dengan autoComplete username/current-password;
 * - tombol submit disabled sampai JavaScript siap (fallback aman tanpa JS);
 * - pesan galat generik dari useLogin, tanpa membocorkan status akun.
 */
export function LoginForm({ next }: { next?: string }) {
  const state = useLogin(next);
  const [show, setShow] = useState(false);
  return (
    <div className="auth-wrap">
      <section className="auth-card auth-card-compact">
        <header className="auth-head">
          <span className="auth-mark" aria-hidden="true" />
          <h1>Masuk</h1>
          <p className="muted">Gunakan akun Anda untuk melanjutkan.</p>
        </header>
        <form className="stack" action="/api/auth/login" method="post" onSubmit={state.submit}>
          <label>
            Email
            <input
              name="email"
              type="email"
              required
              maxLength={254}
              autoComplete="username"
              placeholder="nama@contoh.com"
            />
          </label>
          <label>
            Kata sandi
            <input
              name="password"
              type={show ? "text" : "password"}
              required
              maxLength={256}
              autoComplete="current-password"
            />
          </label>
          <label className="check auth-show-password">
            <input
              type="checkbox"
              checked={show}
              onChange={(event) => setShow(event.target.checked)}
            />
            Tampilkan kata sandi
          </label>
          <Button type="submit" disabled={!state.ready || state.pending}>
            {state.pending ? "Memproses…" : "Masuk"}
          </Button>
          <noscript>Aktifkan JavaScript untuk masuk dengan aman.</noscript>
        </form>
        {state.message && (
          <p role="alert" className="local-message">
            {state.message}
          </p>
        )}
        <p className="auth-footnote">
          Akun uji preproduction · <Link href="/">beranda</Link>
        </p>
      </section>
    </div>
  );
}
