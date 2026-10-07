import Link from "next/link";
import type { ReactNode } from "react";
import { Brand } from "@/components/shared/brand";
export function CheckoutShell({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="workspace-header checkout-header">
        <Brand />
        <Link href="/preview-ui/cus-07">← Paket Contoh</Link>
      </header>
      <main id="main" className="container section">
        <p className="eyebrow">PAKET / CHECKOUT CONTOH</p>
        {children}
      </main>
    </>
  );
}
