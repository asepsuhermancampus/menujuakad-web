import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/ui/icon";
import { Brand } from "./brand";

/*
 * Kerangka halaman autentikasi sesuai desain AUT-01…06 "Horizon Modern Style":
 * latar aura dengan tiga lingkaran lembut, header merek dengan pintu bantuan dan
 * beranda, serta kaki hukum ringkas. Kartu form disediakan pemanggil (AuthForm)
 * agar shell tetap hanya mengurus tata letak.
 *
 * Catatan: tautan bantuan mengarah ke /faq yang sudah ada, bukan ke kanal
 * dukungan rekaan, karena layanan concierge belum aktif.
 */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="auth-canvas">
      <div className="auth-aura" aria-hidden="true">
        <span className="auth-aura-top" />
        <span className="auth-aura-left" />
        <span className="auth-aura-right" />
      </div>
      <a className="skip-link" href="#main">
        Langsung ke konten
      </a>
      <header className="auth-header">
        <Brand />
        <nav className="auth-header-nav" aria-label="Navigasi bantuan">
          <Link href="/faq">
            <Icon name="shield" size={16} />
            <span>Pusat Bantuan</span>
          </Link>
          <Link href="/">
            <Icon name="arrow-forward" size={16} />
            <span>Beranda</span>
          </Link>
        </nav>
      </header>
      {children}
      <footer className="auth-footer">
        <span>© 2026 Menuju Akad</span>
        <nav aria-label="Informasi hukum">
          <Link href="/terms">Ketentuan</Link>
          <Link href="/privacy">Privasi</Link>
        </nav>
      </footer>
    </div>
  );
}
