import { notFound } from "next/navigation";
import { requireSuperadminSession } from "@/server/authorization/guards";
import {
  workspaceView,
  PreviewOnlyFeature,
} from "@/features/workspace/components/data-boundary";
import {
  AdminUsersView,
  AdminInvitationsView,
} from "@/features/workspace/components/admin-workspace-views";
import { BillingPreviewView } from "@/features/design-preview/components/billing-preview-view";
import type { PreviewScreen } from "@/features/design-preview/types";
export const dynamic = "force-dynamic";

/*
 * Layar admin yang sudah di-slicing dipasang pada route resmi dengan data contoh.
 * `BillingPreviewView` memerlukan objek PreviewScreen minimal; nilai di bawah
 * adalah metadata tampilan, bukan sumber data layanan.
 */
const admScreens: Readonly<Record<string, PreviewScreen>> = {
  "ADM-01": {
    id: "route-adm-01",
    code: "ADM-01",
    title: "ADM-01 — Monitoring Pembayaran",
    audience: "admin",
    logicalRoute: "/admin/payments",
    state: "Default",
    device: "DESKTOP",
    sourceStatus: "screenshot",
    width: 2560,
    height: 2946,
    visualInspected: false,
    variants: [],
  },
  "ADM-02": {
    id: "route-adm-02",
    code: "ADM-02",
    title: "ADM-02 — Rekonsiliasi Webhook",
    audience: "admin",
    logicalRoute: "/admin/webhooks",
    state: "Default",
    device: "DESKTOP",
    sourceStatus: "screenshot",
    width: 2560,
    height: 4094,
    visualInspected: false,
    variants: [],
  },
};

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ path: string[] }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { path } = await params;
  await requireSuperadminSession("/admin/" + path.join("/"));
  const page = Math.max(1, Math.min(Number((await searchParams).page) || 1, 10000));
  return workspaceView(async () => {
    if (path.length !== 1) notFound();
    if (path[0] === "users") return AdminUsersView({ page: Number.isSafeInteger(page) ? page : 1 });
    if (path[0] === "invitations")
      return AdminInvitationsView({ page: Number.isSafeInteger(page) ? page : 1 });
    if (path[0] === "payments")
      return (
        <PreviewOnlyFeature title="Monitoring Pembayaran" previewCode="adm-01">
          <BillingPreviewView screen={admScreens["ADM-01"]} />
        </PreviewOnlyFeature>
      );
    if (path[0] === "webhooks")
      return (
        <PreviewOnlyFeature title="Rekonsiliasi Webhook" previewCode="adm-02">
          <BillingPreviewView screen={admScreens["ADM-02"]} />
        </PreviewOnlyFeature>
      );
    notFound();
  });
}
