import Link from "next/link";
import type { ReactNode } from "react";
import { CustomerHeader } from "./customer-header";
import { CustomerBottomNavigation } from "./customer-bottom-navigation";
const links = [
  ["CUS-01", "Dashboard"],
  ["CUS-02", "Undangan Saya"],
  ["GST-01", "Daftar Tamu"],
  ["GST-03", "Konfirmasi RSVP"],
  ["GST-04", "Buku Ucapan"],
  ["CUS-07", "Paket & Billing"],
  ["ACC-01", "Akun & Keamanan"],
  ["ACC-02", "Notifikasi"],
  ["SUP-01", "Bantuan"],
];
export function CustomerShell({ children, code }: { children: ReactNode; code: string }) {
  return (
    <>
      <CustomerHeader />
      <div className={`workspace-layout ${code === "CUS-01" ? "dashboard-layout" : ""}`}>
        <nav className="workspace-nav" aria-label="Area customer">
          {links.map(([c, t]) => (
            <Link
              key={c}
              href={`/preview-ui/${c.toLowerCase()}`}
              aria-current={c === code ? "page" : undefined}
            >
              {t}
            </Link>
          ))}
        </nav>
        <main className="workspace-main" id="main">
          {children}
        </main>
      </div>
      {code === "CUS-01" && <CustomerBottomNavigation />}
    </>
  );
}
