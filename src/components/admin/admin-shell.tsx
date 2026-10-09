import Link from "next/link";
import type { ReactNode } from "react";
import { Brand } from "@/components/shared/brand";
export function AdminShell({ children, code }: { children: ReactNode; code: string }) {
  return (
    <>
      <header className="workspace-header">
        <Brand />
        <span className="badge">SUPERADMIN · Tampilan Contoh</span>
        <Link href="/preview-ui">Preview Studio</Link>
      </header>
      <div className="workspace-layout">
        <nav className="workspace-nav" aria-label="Area superadmin">
          <Link aria-current={code === "ADM-01" ? "page" : undefined} href="/preview-ui/adm-01">
            Monitoring Pembayaran
          </Link>
          <Link aria-current={code === "ADM-02" ? "page" : undefined} href="/preview-ui/adm-02">
            Log Webhook
          </Link>
        </nav>
        <main id="main" className="workspace-main">
          {children}
        </main>
      </div>
    </>
  );
}
