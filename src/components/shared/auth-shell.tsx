import Link from "next/link";
import type { ReactNode } from "react";
import { Brand } from "./brand";

/*
 * Kerangka halaman autentikasi yang bersih: hanya merek di atas dan catatan
 * hukum ringkas di bawah. Tautan "Kembali ke beranda" di header dihapus karena
 * sudah tersedia di kaki kartu form, sehingga tidak ada tautan ganda.
 */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <>
      <a className="skip-link" href="#main">
        Langsung ke konten
      </a>
      <header className="container auth-header">
        <Brand />
      </header>
      {children}
      <footer className="container auth-footer">
        <span>© 2026 Menuju Akad</span>
        <nav aria-label="Informasi hukum">
          <Link href="/terms">Ketentuan</Link>
          <Link href="/privacy">Privasi</Link>
        </nav>
      </footer>
    </>
  );
}
