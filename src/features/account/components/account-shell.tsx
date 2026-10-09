import Link from "next/link";
import type { ReactNode } from "react";
import { Brand } from "@/components/shared/brand";
import { LogoutButton } from "@/features/workspace/components/logout-button";
export function AccountShell({ children, home }: { children: ReactNode; home: string }) {
  return (
    <>
      <a className="skip-link" href="#main">
        Lewati ke konten
      </a>
      <header className="container auth-header">
        <Brand />
        <LogoutButton />
      </header>
      <main id="main" className="container section account-live">
        <nav className="actions account-live-nav" aria-label="Pengaturan akun">
          <Link href={home}>Ruang kerja</Link>
          <Link href="/account">Profil</Link>
          <Link href="/account/security">Keamanan</Link>
        </nav>
        {children}
      </main>
    </>
  );
}
