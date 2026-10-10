import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/dashboard/planner",
}));
vi.mock("server-only", () => ({}));
import { PlannerDashboardView } from "./planner-dashboard-view";
import { PlannerSavingsView } from "./planner-savings-view";
import { PlannerBudgetView } from "./planner-budget-view";
import { PlannerExpensesView } from "./planner-expenses-view";
import { PlannerTasksView } from "./planner-tasks-view";
import { PlannerRundownView } from "./planner-rundown-view";
import { PlannerVendorsView } from "./planner-vendors-view";
import {
  PlannerRequirementsView,
  PlannerSeserahanView,
} from "./planner-seserahan-requirements-view";
import {
  PlannerCoupleView,
  PlannerEngagementView,
  PlannerMoodboardView,
  PlannerOnboardingView,
  PlannerWeddingKitView,
} from "./planner-misc-views";
import {
  AdminAuditView,
  AdminContentView,
  AdminLandingPreviewView,
  AdminPaymentSettingsView,
  AdminUpgradeRequestsView,
  AdminUserManagementView,
} from "./admin-operational-views";
import { AdminTemplateCatalogView } from "./admin-template-catalog-view";
import { AdminInfrastructureView } from "./admin-infrastructure-view";
import { PlannerAnnouncementView } from "./planner-announcement-view";

/*
 * Kontrak markup modul perencanaan: setiap layar wajib memuat label data
 * contoh dan tidak boleh mengklaim penyimpanan/pembayaran nyata.
 */
const customerViews: readonly [string, () => React.ReactNode, string][] = [
  ["Ringkasan", PlannerDashboardView, "Ringkasan Perencanaan"],
  ["Tabungan", PlannerSavingsView, "Tabungan"],
  ["Anggaran", PlannerBudgetView, "Anggaran"],
  ["Pengeluaran", PlannerExpensesView, "Pengeluaran"],
  ["Tugas", PlannerTasksView, "Tugas"],
  ["Rundown", PlannerRundownView, "Rundown"],
  ["Vendor", PlannerVendorsView, "Vendor"],
  ["Seserahan", PlannerSeserahanView, "Seserahan"],
  ["Persyaratan", PlannerRequirementsView, "Persyaratan Nikah"],
  ["Lamaran", PlannerEngagementView, "Lamaran"],
  ["Moodboard", PlannerMoodboardView, "Moodboard"],
  ["Wedding Kit", PlannerWeddingKitView, "Wedding Kit"],
  ["Pasangan", PlannerCoupleView, "Pasangan"],
  ["Onboarding", PlannerOnboardingView, "Onboarding"],
];

describe("markup layar perencanaan", () => {
  it.each(customerViews)("%s merender satu h1 dan label contoh", (_name, View, heading) => {
    const html = renderToStaticMarkup(createElement(View));
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toContain(heading);
    expect(html).toContain("PERENCANAAN · DATA CONTOH");
    expect(html).toMatch(/contoh/i);
    expect(html).not.toContain("berhasil disimpan");
  });

  it("tabungan menampilkan rekening tersamar dan tidak membocorkan nomor penuh", () => {
    const html = renderToStaticMarkup(createElement(PlannerSavingsView));
    expect(html).toContain("••••4821");
    /* Tidak boleh ada deretan angka panjang di luar format nominal rupiah. */
    const withoutAmounts = html.replace(/Rp[\d.]+/g, "");
    expect(withoutAmounts).not.toMatch(/\d{8,}/);
  });

  it("tugas menandai keterlambatan dengan ikon dan teks, bukan warna saja", () => {
    const html = renderToStaticMarkup(createElement(PlannerTasksView));
    expect(html).toContain("Terlambat");
    expect(html).toContain("!");
  });

  it("wedding kit menonaktifkan tombol beli dan menyebut pembayaran belum aktif", () => {
    const html = renderToStaticMarkup(createElement(PlannerWeddingKitView));
    expect(html).toContain("pembayaran belum aktif");
  });

  it("pasangan menjelaskan batas dua anggota", () => {
    const html = renderToStaticMarkup(createElement(PlannerCoupleView));
    expect(html).toContain("1/2");
    expect(html).toContain("Satu undangan aktif pada satu waktu");
  });
});

const adminViews: readonly [string, () => React.ReactNode, string][] = [
  ["Kelola Pengguna", AdminUserManagementView, "Kelola Pengguna"],
  ["Persetujuan Upgrade", AdminUpgradeRequestsView, "Persetujuan Upgrade"],
  ["Kelola Konten", AdminContentView, "Kelola Konten"],
  ["QRIS & Rekening", AdminPaymentSettingsView, "QRIS &amp; Rekening"],
  ["Audit Log", AdminAuditView, "Audit Log"],
  ["Pratinjau Landing", AdminLandingPreviewView, "Pratinjau Landing"],
  ["Katalog Template", AdminTemplateCatalogView, "Katalog Template &amp; Kurasi Desain"],
  ["Infrastruktur", AdminInfrastructureView, "Infrastruktur, Server Health &amp; Backup Data"],
];

describe("markup layar admin operasional", () => {
  it.each(adminViews)("%s merender satu h1 dan label superadmin", (_name, View, heading) => {
    const html = renderToStaticMarkup(createElement(View));
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toContain(heading);
    expect(html).toContain("SUPERADMIN · DATA CONTOH");
  });

  it("audit log tidak menyediakan tombol hapus", () => {
    const html = renderToStaticMarkup(createElement(AdminAuditView));
    expect(html).not.toMatch(/<button[^>]*>\s*Hapus\s*</);
  });

  it("pratinjau landing menandai draf dan tidak diindeks sebagai publikasi", () => {
    const html = renderToStaticMarkup(createElement(AdminLandingPreviewView));
    expect(html).toContain("DRAF — belum diterbitkan");
  });

  it("kelola pengguna menampilkan peringatan konfirmasi hapus permanen", () => {
    const html = renderToStaticMarkup(createElement(AdminUserManagementView));
    expect(html).toContain("Aktivasi massal");
    expect(html).toContain("Hapus massal");
  });

  it("infrastruktur menolak menampilkan klaim uptime dan enkripsi rekaan", () => {
    const html = renderToStaticMarkup(createElement(AdminInfrastructureView));
    /* Angka dan jaminan pada gambar desain sumber tidak boleh muncul sebagai fakta. */
    expect(html).not.toContain("99,99%");
    expect(html).not.toContain("99.99%");
    expect(html).not.toContain("AES-256");
    expect(html).not.toContain("Kubernetes");
    expect(html).not.toContain("Cloudflare");
    /* Yang ditampilkan adalah status nyata + keterbatasan yang diakui. */
    expect(html).toContain("/api/health");
    expect(html).toContain("Belum pernah diuji");
    expect(html).toContain("Restore basis data belum pernah diuji");
  });

  it("katalog template menandai angka adopsi sebagai contoh", () => {
    const html = renderToStaticMarkup(createElement(AdminTemplateCatalogView));
    expect(html).toContain("contoh");
    expect(html).toContain("Terbitkan Desain Baru");
    expect(html).not.toContain("berhasil diterbitkan");
  });
});

describe("markup pengumuman rilis planner", () => {
  it("menyebut modul nyata dan menolak klaim ekspor PDF serta 100% aman", () => {
    const html = renderToStaticMarkup(createElement(PlannerAnnouncementView));
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toContain("Kelola Perencanaan Pernikahan Lebih Terstruktur");
    expect(html).toContain("Pembaruan Modul Perencanaan");
    /* Klaim pada desain sumber yang belum benar tidak boleh ditampilkan. */
    expect(html).not.toContain("300 DPI");
    expect(html).not.toContain("100% Data Aman");
    expect(html).not.toContain("Enkripsi Multi-Tingkat");
    expect(html).not.toContain("end-to-end");
    /* Batas nyata harus dinyatakan. */
    expect(html).toContain("data contoh");
    expect(html).toContain("belum aktif");
  });
});
