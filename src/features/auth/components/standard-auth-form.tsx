"use client";
import { LocalPreviewForm } from "@/components/shared/local-preview-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { authCopy, type AuthMode } from "../config/auth-copy";
import { useAuthPreview } from "../hooks/use-auth-preview";
export type { AuthMode } from "../config/auth-copy";
export function StandardAuthForm({ mode = "login" }: { mode?: AuthMode }) {
  const state = useAuthPreview(mode);
  const [title, description, action] = authCopy[mode];
  const emailNeeded = ["login", "register", "forgot-password"].includes(mode);
  const passwordNeeded = ["login", "register", "reset-password"].includes(mode);
  return (
    <div className="auth-wrap">
      <section className="auth-card">
        <p className="eyebrow">MENUJU AKAD · AKUN ANDA</p>
        <h1>{title}</h1>
        <p className="muted">{description}</p>
        <p className="notice">
          Tampilan contoh. Autentikasi dan pengiriman email belum terhubung. Gunakan data contoh.
        </p>
        {["login", "register"].includes(mode) && (
          <>
            <Button className="secondary" onClick={state.google}>
              G · {mode === "register" ? "Daftar" : "Masuk"} dengan Google
            </Button>
            <p className="divider">ATAU DENGAN EMAIL</p>
          </>
        )}
        <LocalPreviewForm className="stack" onSubmit={state.submit}>
          {mode === "register" && (
            <label>
              Nama lengkap
              <input name="name" required autoComplete="off" placeholder="Nama Contoh" />
            </label>
          )}
          {emailNeeded && (
            <label>
              Alamat email
              <input
                name="email"
                type="email"
                required
                autoComplete="off"
                placeholder="akun@example.invalid"
              />
            </label>
          )}
          {passwordNeeded && (
            <>
              <label>
                {mode === "reset-password" ? "Kata sandi baru" : "Kata sandi"}
                <input
                  type={state.show ? "text" : "password"}
                  name="password"
                  required
                  minLength={mode === "login" ? 1 : 8}
                  autoComplete="off"
                />
              </label>
              <label className="check">
                <input
                  type="checkbox"
                  checked={state.show}
                  onChange={(e) => state.setShow(e.target.checked)}
                />
                Tampilkan kata sandi
              </label>
            </>
          )}
          {mode === "reset-password" && (
            <label>
              Konfirmasi kata sandi
              <input
                type={state.show ? "text" : "password"}
                name="confirmation"
                minLength={8}
                required
                autoComplete="off"
              />
            </label>
          )}
          {mode === "register" && (
            <label className="check">
              <input type="checkbox" required />
              Saya memahami ini pratinjau dan menyetujui peninjauan lokal.
            </label>
          )}
          <Button type="submit">{action} →</Button>
        </LocalPreviewForm>
        {state.message && (
          <p role="status" className="local-message">
            {state.message}
          </p>
        )}
        <div className="divider">
          {mode === "login" ? (
            <>
              <Link href="/forgot-password">Lupa kata sandi?</Link>
              <p>
                Belum punya akun? <Link href="/register">Buat akun sekarang</Link>
              </p>
            </>
          ) : (
            <Link href="/login">Kembali ke halaman masuk</Link>
          )}
        </div>
      </section>
    </div>
  );
}
