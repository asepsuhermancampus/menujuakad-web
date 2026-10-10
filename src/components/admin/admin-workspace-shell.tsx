"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Brand } from "@/components/shared/brand";
import { LogoutButton } from "@/features/workspace/components/logout-button";
import type { WorkspaceIdentity } from "@/server/customer/identity";

/*
 * Shell area superadmin. Susunan mengikuti desain ADM-03: sidebar dengan
 * kelompok modul, header kaca, dan penanda halaman aktif. Navigasi dikelompokkan
 * agar daftar menu operasional tetap terbaca.
 */
const linkGroups: readonly { label: string; links: readonly (readonly [string, string])[] }[] = [
  {
    label: "Modul Tata Kelola",
    links: [
      ["/admin", "Ringkasan"],
      ["/admin/user-management", "Kelola Pengguna"],
      ["/admin/upgrades", "Persetujuan Upgrade"],
      ["/admin/content", "Kelola Konten"],
    ],
  },
  {
    label: "Pembayaran & Webhook",
    links: [
      ["/admin/payments", "Pembayaran Uji"],
      ["/admin/webhooks", "Log Webhook"],
      ["/admin/payment-settings", "QRIS & Rekening"],
    ],
  },
  {
    label: "Sistem",
    links: [
      ["/admin/audit", "Audit Log"],
      ["/admin/landing-preview", "Pratinjau Landing"],
    ],
  },
  {
    label: "Data Pengujian",
    links: [
      ["/admin/users", "Akun Pengujian"],
      ["/admin/invitations", "Undangan Pengujian"],
    ],
  },
  {
    label: "Akun",
    links: [
      ["/account", "Profil Akun"],
      ["/account/security", "Keamanan"],
    ],
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin" || href === "/account") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminWorkspaceShell({
  children,
  identity,
}: {
  children: ReactNode;
  identity: WorkspaceIdentity;
}) {
  const pathname = usePathname();
  return (
    <>
      <a href="#main" className="skip-link">
        Lewati ke konten
      </a>
      <header className="workspace-header">
        <Brand />
        <span className="badge">SUPERADMIN · Preproduction</span>
        <div>
          {identity.name ?? identity.email ?? identity.phone ?? "Akun Anda"}
          <br />
          <small>{identity.email ?? identity.phone}</small>
        </div>
        <LogoutButton />
      </header>
      <div className="workspace-layout">
        <nav className="workspace-nav" aria-label="Area superadmin">
          {linkGroups.map((group) => (
            <div className="workspace-nav-group" key={group.label}>
              <p className="workspace-nav-label">{group.label}</p>
              {group.links.map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  aria-current={isActive(pathname, href) ? "page" : undefined}
                >
                  {label}
                </Link>
              ))}
            </div>
          ))}
        </nav>
        <main id="main" className="workspace-main">
          {children}
        </main>
      </div>
    </>
  );
}
