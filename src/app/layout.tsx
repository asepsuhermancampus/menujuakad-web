import type { Metadata } from "next";
import type { ReactNode } from "react";
import { siteConfig } from "@/config/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: "Menuju Akad — Sebuah Awal yang Indah", template: "%s | Menuju Akad" },
  description: siteConfig.description,
  alternates: { canonical: "/" },
  openGraph: {
    title: "Menuju Akad — Sebuah Awal yang Indah",
    description: siteConfig.description,
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    type: "website",
    url: "/",
  },
  // Halaman fondasi belum menjadi situs publik final.
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
