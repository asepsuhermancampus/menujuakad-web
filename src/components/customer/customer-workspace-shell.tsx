"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Brand } from "@/components/shared/brand";
import { LogoutButton } from "@/features/workspace/components/logout-button";
import type { WorkspaceIdentity } from "@/server/customer/identity";

/*
 * Shell area customer. Navigasi memakai penanda `aria-current="page"` agar
 * pengguna dan pembaca layar tahu posisinya, dan agar gaya pil aktif pada
 * `workspace.css` bekerja. Tautan dikelompokkan supaya sidebar tetap terbaca
 * saat itemnya bertambah.
 */
const linkGroups: readonly { label: string; links: readonly (readonly [string, string])[] }[] = [
  {
    label: "Undangan",
    links: [
      ["/dashboard", "Dashboard"],
      ["/dashboard/invitations", "Undangan Saya"],
      ["/dashboard/invitations/new", "Buat Undangan"],
    ],
  },
  {
    label: "Tamu & Interaksi",
    links: [
      ["/dashboard/guests", "Daftar Tamu"],
      ["/dashboard/rsvp", "Konfirmasi RSVP"],
      ["/dashboard/wishes", "Buku Ucapan"],
      ["/dashboard/gifts", "Hadiah"],
      ["/dashboard/analytics", "Analitik"],
    ],
  },
  {
    label: "Perencanaan",
    links: [["/dashboard/planner", "Perencanaan"]],
  },
  {
    label: "Billing & Akun",
    links: [
      ["/dashboard/billing", "Paket & Billing"],
      ["/dashboard/billing/packages", "Paket Pengujian"],
      ["/dashboard/notifications", "Notifikasi"],
      ["/dashboard/support", "Bantuan"],
      ["/account", "Profil Akun"],
      ["/account/security", "Keamanan"],
    ],
  },
];

/**
 * Tautan dianggap aktif bila path-nya sama persis atau merupakan turunannya.
 * `/dashboard` dan `/account` diperlakukan eksak agar tidak selalu aktif.
 */
function isActive(pathname: string, href: string) {
  if (href === "/dashboard" || href === "/account") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function CustomerWorkspaceShell({
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
        <div>
          <strong>{identity.name ?? identity.email ?? identity.phone ?? "Akun Anda"}</strong>
          <br />
          <small>{identity.email ?? identity.phone}</small>
        </div>
        <LogoutButton />
      </header>
      <div className="workspace-layout">
        <nav className="workspace-nav" aria-label="Area customer">
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
