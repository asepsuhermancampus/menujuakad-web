import type { Metadata } from "next";
import type { ReactNode } from "react";
export const metadata: Metadata = {
  title: "Pratinjau UI",
  robots: { index: false, follow: false },
  alternates: { canonical: null },
};
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <a className="skip-link" href="#main">
        Langsung ke konten
      </a>
      {children}
    </>
  );
}
