import { notFound } from "next/navigation";
import { requireCustomerSession } from "@/server/authorization/guards";
import { getWorkspaceIdentity } from "@/server/customer/identity";
import {
  workspaceView,
  PendingFeature,
  PreviewOnlyFeature,
} from "@/features/workspace/components/data-boundary";
import {
  InvitationListView,
  NewInvitationView,
  InvitationDetailView,
} from "@/features/workspace/components/customer-invitation-views";
import { GuestManagementPreview } from "@/features/guests/components/guest-management-preview";
import { RsvpPreview } from "@/features/guests/components/rsvp-preview";
import { WishesPreview } from "@/features/wishes/components/wishes-preview";
import { GiftsPreview } from "@/features/gifts/components/gifts-preview";
import { NotificationsPreview } from "@/features/account/components/notifications-preview";
import { SupportPreview } from "@/features/support/components/support-preview";
export const dynamic = "force-dynamic";

/*
 * Fitur domain yang UI-nya sudah di-slicing dan dipasang pada route resmi
 * dengan data contoh. Backend penyimpanan belum aktif; batas dijaga oleh
 * PreviewOnlyFeature (label contoh + tanpa DB/provider).
 */
const previewOnly = {
  guests: {
    title: "Manajemen Tamu",
    code: "gst-01",
    render: () => <GuestManagementPreview />,
  },
  rsvp: {
    title: "Konfirmasi RSVP",
    code: "gst-03",
    render: () => <RsvpPreview />,
  },
  wishes: {
    title: "Buku Doa & Ucapan",
    code: "gst-04",
    render: () => <WishesPreview />,
  },
  gifts: {
    title: "Hadiah & Amplop",
    code: "gst-05",
    render: () => <GiftsPreview />,
  },
  notifications: {
    title: "Notifikasi",
    code: "acc-02",
    render: () => <NotificationsPreview />,
  },
  support: {
    title: "Pusat Bantuan",
    code: "sup-01",
    render: () => <SupportPreview />,
  },
} as const;

/* Fitur yang belum punya komponen UI; tetap memakai handoff PendingFeature. */
const pending: Record<string, [string, string]> = {
  analytics: ["Analitik", "gst-06"],
};

const tabs = new Set([
  "editor",
  "preview",
  "settings",
  "guests",
  "rsvp",
  "wishes",
  "gifts",
  "analytics",
]);
export default async function Page({ params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  await requireCustomerSession("/dashboard/" + path.join("/"));
  return workspaceView(async () => {
    if (path[0] === "invitations") {
      if (path.length === 1) return InvitationListView();
      if (path.length === 2 && path[1] === "new") return NewInvitationView();
      if (path.length === 2 || (path.length === 3 && tabs.has(path[2])))
        return InvitationDetailView({ id: path[1], tab: path[2] ?? "" });
      notFound();
    }
    if (path.length === 1 && ["account", "settings"].includes(path[0])) {
      const identity = await getWorkspaceIdentity("CUSTOMER");
      return (
        <section className="card stack">
          <h1>Akun & Keamanan</h1>
          <p>Nama: {identity.name ?? "Belum diisi"}</p>
          <p>Email: {identity.email}</p>
          <p>Identitas dibaca dari database. Perubahan profil dan sandi belum aktif.</p>
        </section>
      );
    }
    if (path.length === 2 && path[0] === "billing" && path[1] === "packages")
      return <PendingFeature title="Paket Pengujian" preview="/preview-ui/cus-07" />;
    if (path.length === 1 && path[0] in previewOnly) {
      const feature = previewOnly[path[0] as keyof typeof previewOnly];
      return (
        <PreviewOnlyFeature title={feature.title} previewCode={feature.code}>
          {feature.render()}
        </PreviewOnlyFeature>
      );
    }
    if (path.length === 1 && pending[path[0]])
      return (
        <PendingFeature
          title={pending[path[0]][0]}
          preview={`/preview-ui/${pending[path[0]][1]}`}
        />
      );
    notFound();
  });
}
