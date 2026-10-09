import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AuthShell } from "@/components/shared/auth-shell";
export const metadata: Metadata = {
  referrer: "no-referrer",
  robots: { index: false, follow: false },
  alternates: { canonical: null },
};
export default function Layout({ children }: { children: ReactNode }) {
  return <AuthShell>{children}</AuthShell>;
}
