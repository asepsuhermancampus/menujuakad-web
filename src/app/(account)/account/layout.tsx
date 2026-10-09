import type { Metadata } from "next";
import type { ReactNode } from "react";
import { requireAccountSession } from "@/server/authorization/guards";
import { AccountShell } from "@/features/account/components/account-shell";
export const metadata: Metadata = {
  referrer: "no-referrer",
  robots: { index: false, follow: false },
  alternates: { canonical: null },
};
export const dynamic = "force-dynamic";
export default async function Layout({ children }: { children: ReactNode }) {
  const session = await requireAccountSession("/account");
  const home =
    session.role === "SUPERADMIN" ? "/admin" : session.role === "VENDOR" ? "/vendor" : "/dashboard";
  return <AccountShell home={home}>{children}</AccountShell>;
}
