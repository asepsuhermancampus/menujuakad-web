import Link from "next/link";
import type { ReactNode } from "react";
import { Brand } from "./brand";
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <>
      <a className="skip-link" href="#main">
        Langsung ke konten
      </a>
      <header className="container auth-header">
        <Brand />
        <Link href="/">Kembali ke beranda</Link>
      </header>
      {children}
      <footer className="container auth-footer">
        <span>© 2026 Menuju Akad · Akun contoh</span>
        <nav aria-label="Informasi akun">
          <Link href="/terms">Ketentuan</Link>
          <Link href="/privacy">Privasi</Link>
          <Link href="/preview-ui">Pratinjau UI</Link>
        </nav>
      </footer>
    </>
  );
}
