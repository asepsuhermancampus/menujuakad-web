import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/faq",
}));
vi.mock("server-only", () => ({}));
import { FaqSection, faqItems } from "./faq-section";
import { HowItWorksDetail } from "./how-it-works-detail";
import { ContactOverview } from "./contact-overview";
import { ContactForm } from "./contact-form";
import { LegalDocument } from "./legal-document";
import { terms, privacy } from "../config/legal-copy";

/*
 * Kontrak konten halaman publik versi Horizon Modern Style.
 * Test ini mengunci dua hal: struktur desain baru dipakai, dan TIDAK ada
 * klaim komersial dari desain sumber yang bocor ke UI (harga, durasi janji,
 * kontak rekaan, sertifikasi, entitas hukum).
 */

const forbiddenClaims = [
  "15 menit",
  "30+ tipografi",
  "hemat 80%",
  "Rp 4.000.000",
  "Rp4.000.000",
  "PCI-DSS",
  "TLS 1.3",
  "AES-256",
  "PT Menuju Akad Nusantara",
  "v2.4-ID",
  "99,98%",
  "812-9988-7766",
  "concierge@menujuakad.com",
  "Jl. Setiabudi",
  "256-Bit",
  "bank-grade",
];

describe("halaman FAQ", () => {
  it("menyediakan kategori, pencarian, dan accordion", () => {
    const html = renderToStaticMarkup(createElement(FaqSection, { searchable: true }));
    expect(html).toContain("faq-search");
    expect(html).toContain("Semua Pertanyaan");
    expect(html).toContain("Memulai &amp; Desain");
    expect(html).toContain("faq-item");
    expect(html.match(/<details/g)?.length).toBe(faqItems.length);
  });

  it("memuat pertanyaan dari empat kategori", () => {
    const categories = new Set(faqItems.map((item) => item.category));
    expect(categories).toEqual(new Set(["MULAI", "PEMBAYARAN", "TAMU", "PRIVASI"]));
    expect(faqItems.length).toBeGreaterThanOrEqual(10);
  });

  it("menjelaskan status pratinjau tanpa klaim komersial", () => {
    const html = renderToStaticMarkup(createElement(FaqSection, { searchable: true }));
    expect(html).toContain("belum aktif");
    for (const claim of forbiddenClaims) {
      expect(html).not.toContain(claim);
    }
  });
});

describe("halaman cara membuat", () => {
  it("menampilkan enam langkah dan blok estimasi", () => {
    const html = renderToStaticMarkup(createElement(HowItWorksDetail));
    expect(html).toContain("6 Langkah Menuju Hari Bahagia");
    expect(html.match(/how-step-card/g)?.length).toBe(6);
    expect(html).toContain("Estimasi Waktu Persiapan");
    expect(html).toContain("how-timing");
  });

  it("menandai setiap langkah dengan status jujur", () => {
    const html = renderToStaticMarkup(createElement(HowItWorksDetail));
    expect(html).toContain("Katalog contoh");
    expect(html).toContain("Pembayaran komersial belum aktif");
    expect(html).toContain("Penerbitan belum tersedia");
  });

  it("tidak memuat klaim pemasaran dari desain sumber", () => {
    const html = renderToStaticMarkup(createElement(HowItWorksDetail));
    for (const claim of forbiddenClaims) {
      expect(html).not.toContain(claim);
    }
  });
});

describe("halaman kontak", () => {
  it("menampilkan tiga kanal yang ditandai belum aktif", () => {
    const html = renderToStaticMarkup(createElement(ContactOverview));
    expect(html).toContain("Hubungi Tim Concierge Menuju Akad");
    expect(html.match(/class="card contact-channel"/g)?.length).toBe(3);
    expect(html).toContain("Belum diaktifkan");
    expect(html).toContain("Contoh desain");
  });

  it("formulir menyediakan kategori dan tidak mengirim data", () => {
    const html = renderToStaticMarkup(createElement(ContactForm));
    expect(html).toContain("Kategori keperluan");
    expect(html).toContain("Pertanyaan fitur");
    expect(html).toContain("tidak dikirim");
  });

  it("tidak menampilkan kontak rekaan dari desain sumber", () => {
    const html = renderToStaticMarkup(createElement(ContactOverview));
    for (const claim of forbiddenClaims) {
      expect(html).not.toContain(claim);
    }
  });
});

describe("dokumen hukum", () => {
  it("menyusun enam bagian bernomor dengan daftar isi", () => {
    const html = renderToStaticMarkup(createElement(LegalDocument));
    expect(html.match(/<h2/g)?.length).toBe(6);
    expect(html).toContain("Daftar isi");
    expect(html).toContain("legal-points");
    expect(html).toContain("Status: draf pratinjau");
  });

  it("membedakan konten privasi dan syarat layanan", () => {
    const priv = renderToStaticMarkup(createElement(LegalDocument, { privacyMode: true }));
    const term = renderToStaticMarkup(createElement(LegalDocument, { privacyMode: false }));
    expect(priv).toContain("Kebijakan Privasi");
    expect(term).toContain("Syarat &amp; Ketentuan");
    expect(priv).not.toBe(term);
  });

  it("tidak mengklaim sertifikasi atau entitas yang belum ditetapkan", () => {
    const html = renderToStaticMarkup(createElement(LegalDocument));
    for (const claim of forbiddenClaims) {
      expect(html).not.toContain(claim);
    }
    expect(html).toContain("belum ditetapkan");
  });

  it("setiap naskah memuat enam bagian", () => {
    expect(terms).toHaveLength(6);
    expect(privacy).toHaveLength(6);
    for (const section of [...terms, ...privacy]) {
      expect(section.title.length).toBeGreaterThan(3);
      expect(section.body.length).toBeGreaterThan(20);
    }
  });
});
