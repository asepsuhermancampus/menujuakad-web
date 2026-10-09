import type { Metadata } from "next";

export const seoOrigin = "https://menujuakad.com";
export const publicSeoPages = [
  ["/", "Sebuah Awal yang Indah"],
  ["/templates", "Katalog Desain Undangan"],
  ["/about", "Tentang Menuju Akad"],
  ["/how-it-works", "Cara Kerja Pratinjau"],
  ["/blog", "Blog & Panduan Pernikahan"],
  ["/faq", "Pertanyaan Umum"],
  ["/contact", "Informasi Bantuan"],
] as const;

/** Path berasal dari whitelist kode, tidak pernah dari Host atau query request. */
export function publicPageMetadata(path: string, title: string, description: string): Metadata {
  if (!/^\/(?:[a-z0-9-]+(?:\/[a-z0-9-]+)*)?$/.test(path)) {
    throw new Error("Path canonical tidak valid");
  }
  const url = `${seoOrigin}${path}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url },
    robots: { index: true, follow: true },
  };
}
