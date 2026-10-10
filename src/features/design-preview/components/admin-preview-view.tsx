/*
 * Modul ini sengaja TIDAK memakai "use client": ia dipanggil dari Server
 * Component (design-preview-view). Fungsi predikatnya murni (hanya membaca
 * peta kode) sehingga aman dievaluasi di server, sementara komponen anak yang
 * dirender tetap Client Component miliknya sendiri.
 */
import {
  AdminAuditView,
  AdminContentView,
  AdminPaymentSettingsView,
  AdminUserManagementView,
} from "@/features/planner/components/admin-operational-views";
import { AdminTemplateCatalogView } from "@/features/planner/components/admin-template-catalog-view";
import { AdminInfrastructureView } from "@/features/planner/components/admin-infrastructure-view";
import { BillingPreviewView } from "./billing-preview-view";
import type { PreviewScreen } from "../types";

/*
 * Pemetaan kode layar admin Stitch (ADM-*) ke komponen tampilan yang sudah
 * di-slicing, agar Preview Studio menampilkan layar asli alih-alih placeholder.
 *
 * ADM-01/02 memakai `BillingPreviewView` yang sudah ada; ADM-03/05/06/07
 * memakai tampilan operasional.
 *
 * Layar upgrade/landing admin tidak punya kode ADM pada snapshot Stitch
 * sehingga tetap memakai placeholder handoff.
 */
const adminScreens: Readonly<Record<string, () => React.ReactNode>> = {
  "ADM-03": () => <AdminUserManagementView />,
  "ADM-04": () => <AdminTemplateCatalogView />,
  "ADM-05": () => <AdminContentView />,
  "ADM-06": () => <AdminAuditView />,
  "ADM-07": () => <AdminPaymentSettingsView />,
  "ADM-08": () => <AdminInfrastructureView />,
};

/** Metadata minimal untuk layar yang dirender lewat BillingPreviewView. */
const billingScreens: Readonly<Record<string, { title: string; route: string }>> = {
  "ADM-01": { title: "ADM-01 — Monitoring Pembayaran", route: "/admin/payments" },
  "ADM-02": { title: "ADM-02 — Rekonsiliasi Webhook", route: "/admin/webhooks" },
};

export function hasAdminPreview(code: string): boolean {
  return Object.hasOwn(adminScreens, code) || Object.hasOwn(billingScreens, code);
}

export function AdminPreviewView({ code, state }: { code: string; state: string }) {
  const screen = adminScreens[code];
  if (screen) return <>{screen()}</>;

  const meta = billingScreens[code];
  if (!meta) return null;

  /*
   * BillingPreviewView menerima objek PreviewScreen; nilai di bawah adalah
   * metadata tampilan, bukan sumber data layanan.
   */
  const preview: PreviewScreen = {
    id: `preview-${code.toLowerCase()}`,
    code,
    title: meta.title,
    audience: "admin",
    logicalRoute: meta.route,
    state,
    device: "DESKTOP",
    sourceStatus: "screenshot",
    width: 2560,
    height: 3240,
    visualInspected: false,
    variants: [],
  };
  return <BillingPreviewView screen={preview} />;
}
