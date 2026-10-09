import Link from "next/link";
import type { ReactNode } from "react";
import { Brand } from "./brand";
export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <>
      <a className="skip-link" href="#main">
        Langsung ke konten
      </a>
      <header className="site-header container">
        <Brand />
        <nav aria-label="Navigasi utama">
          <Link href="/templates">Katalog Desain</Link>
          <Link href="/pricing">Paket</Link>
          <Link href="/how-it-works">Cara Kerja</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/faq">FAQ</Link>
        </nav>
        <div className="actions">
          <Link href="/login">Masuk akun uji</Link>
          <Link className="button" href="/register">
            Simulasi Pendaftaran
          </Link>
        </div>
      </header>
      <p className="container notice">
        Katalog dan preview memakai data contoh. Login akun uji tersedia melalui halaman Masuk;
        pendaftaran publik, penerbitan undangan dan pembayaran komersial belum tersedia.
      </p>
      {children}
      <footer className="site-footer container">
        <div>
          <Brand />
          <p>Untuk setiap cerita yang layak dirayakan.</p>
        </div>
        <nav aria-label="Informasi">
          <Link href="/about">Tentang Kami</Link>
          <Link href="/contact">Hubungi Kami</Link>
          <Link href="/terms">Syarat & Ketentuan</Link>
          <Link href="/privacy">Kebijakan Privasi</Link>
          <Link href="/preview-ui">Pratinjau UI</Link>
        </nav>
        <small>© 2026 Menuju Akad · Sebuah awal yang indah.</small>
      </footer>
    </>
  );
}
