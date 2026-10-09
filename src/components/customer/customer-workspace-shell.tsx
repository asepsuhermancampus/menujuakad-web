import Link from "next/link";
import type { ReactNode } from "react";
import { Brand } from "@/components/shared/brand";
import { LogoutButton } from "@/features/workspace/components/logout-button";
import type { WorkspaceIdentity } from "@/server/customer/identity";
const links = [
  ["/dashboard", "Dashboard"],
  ["/dashboard/invitations", "Undangan Saya"],
  ["/dashboard/invitations/new", "Buat Undangan"],
  ["/dashboard/guests", "Daftar Tamu"],
  ["/dashboard/rsvp", "Konfirmasi RSVP"],
  ["/dashboard/wishes", "Buku Ucapan"],
  ["/dashboard/gifts", "Hadiah"],
  ["/dashboard/analytics", "Analitik"],
  ["/dashboard/billing", "Paket & Billing"],
  ["/dashboard/billing/packages", "Paket Pengujian"],
  ["/dashboard/account", "Akun & Keamanan"],
  ["/dashboard/notifications", "Notifikasi"],
  ["/dashboard/support", "Bantuan"],
];
export function CustomerWorkspaceShell({
  children,
  identity,
}: {
  children: ReactNode;
  identity: WorkspaceIdentity;
}) {
  return (
    <>
      <a href="#main" className="skip-link">
        Lewati ke konten
      </a>
      <header className="workspace-header">
        <Brand />
        <div>
          <strong>{identity.name ?? identity.email}</strong>
          <br />
          <small>{identity.email}</small>
        </div>
        <LogoutButton />
      </header>
      <div className="workspace-layout">
        <nav className="workspace-nav" aria-label="Area customer">
          {links.map(([href, label]) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </nav>
        <main id="main" className="workspace-main">
          <p className="notice">
            Workspace preproduction · Data akun pengujian tersimpan di database. Publikasi komersial
            belum aktif.
          </p>
          {children}
        </main>
      </div>
    </>
  );
}
