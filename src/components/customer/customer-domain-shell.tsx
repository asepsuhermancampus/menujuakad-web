import Link from "next/link";
import type { ReactNode } from "react";
import { CustomerHeader } from "./customer-header";
export function CustomerDomainShell({ children, code }: { children: ReactNode; code: string }) {
  return (
    <>
      <CustomerHeader />
      <div className="container domain-breadcrumb">
        <Link href="/preview-ui/cus-04">Undangan Saya / Sarah & Dimas</Link>
        <span className="badge">Belum diterbitkan · contoh</span>
      </div>
      <nav className="container domain-tabs" aria-label="Kelola undangan">
        {[
          ["GST-01", "Tamu"],
          ["GST-03", "RSVP"],
          ["GST-04", "Ucapan"],
          ["GST-05", "Hadiah"],
          ["GST-06", "Statistik"],
        ].map(([id, label]) => (
          <Link
            key={id}
            href={`/preview-ui/${id.toLowerCase()}`}
            aria-current={code === id ? "page" : undefined}
          >
            {label}
          </Link>
        ))}
      </nav>
      <main id="main" className="container section domain-main">
        {children}
      </main>
    </>
  );
}
