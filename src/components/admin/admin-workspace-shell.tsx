import Link from "next/link";
import type { ReactNode } from "react";
import { Brand } from "@/components/shared/brand";
import { LogoutButton } from "@/features/workspace/components/logout-button";
import type { WorkspaceIdentity } from "@/server/customer/identity";
const links = [
  ["/admin", "Ringkasan"],
  ["/admin/users", "Akun Pengujian"],
  ["/admin/invitations", "Undangan Pengujian"],
  ["/admin/payments", "Pembayaran Uji"],
  ["/admin/webhooks", "Log Webhook"],
];
export function AdminWorkspaceShell({
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
        <span className="badge">SUPERADMIN · Preproduction</span>
        <div>
          {identity.name ?? identity.email}
          <br />
          <small>{identity.email}</small>
        </div>
        <LogoutButton />
      </header>
      <div className="workspace-layout">
        <nav className="workspace-nav" aria-label="Area superadmin">
          {links.map(([href, label]) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </nav>
        <main id="main" className="workspace-main">
          {children}
        </main>
      </div>
    </>
  );
}
