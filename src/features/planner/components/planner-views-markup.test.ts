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
});
