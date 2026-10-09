import Link from "next/link";
import type { Metadata } from "next";
import { requireVendorSession } from "@/server/authorization/guards";
import { AccountShell } from "@/features/account/components/account-shell";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  robots: { index: false, follow: false },
  alternates: { canonical: null },
};
export default async function Page() {
  await requireVendorSession("/vendor");
  return (
    <AccountShell home="/vendor">
      <section className="card stack">
        <p className="eyebrow">AKUN VENDOR</p>
        <h1>Selamat datang</h1>
        <p className="muted">Kelola profil dan keamanan akun Anda.</p>
        <div className="actions">
          <Link className="button" href="/account">
            Profil akun
          </Link>
          <Link className="button outline" href="/account/security">
            Keamanan
          </Link>
        </div>
      </section>
    </AccountShell>
  );
}
