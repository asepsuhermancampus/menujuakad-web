import Link from "next/link";
import type { ReactNode } from "react";
import {
  getCustomerInvitation,
  listCustomerInvitations,
  listCustomerTemplates,
} from "@/server/invitations/service";
import { CreateInvitationForm } from "./create-invitation-form";
import { DeleteDraftButton } from "./delete-draft-button";
import { InvitationEditorForm } from "./invitation-editor-form";
import { InvitationSettingsForm } from "./invitation-settings-form";
import { PrivateInvitationPreview } from "./private-invitation-preview";
import { PendingFeature, PreviewOnlyFeature } from "./data-boundary";
import { GuestManagementView } from "@/features/guests/components/guest-management-view";
import { GuestCreateForm } from "@/features/guests/components/guest-create-form";
import { GuestImportForm } from "@/features/guests/components/guest-import-form";
import { listGuests } from "@/server/guests/service";
import { RsvpPreview } from "@/features/guests/components/rsvp-preview";
import { WishesPreview } from "@/features/wishes/components/wishes-preview";
import { GiftsPreview } from "@/features/gifts/components/gifts-preview";
export async function InvitationListView() {
  const invitations = await listCustomerInvitations();
  return (
    <section className="stack">
      <div className="workspace-title">
        <h1>Undangan Saya</h1>
        <Link className="button" href="/dashboard/invitations/new">
          Buat Draft
        </Link>
      </div>
      <p>Menampilkan hingga 100 undangan milik akun Anda dari database.</p>
      {invitations.length === 0 ? (
        <p className="card">Belum ada undangan. Buat draft pertama Anda.</p>
      ) : (
        <div className="grid-two">
          {invitations.map((invitation) => (
            <article className="card stack" key={invitation.id}>
              <h2>{invitation.title}</h2>
              <span className="badge">
                {invitation.status} · {invitation.isPublished ? "Terbit" : "Privat"}
              </span>
              <p>
                {invitation.weddingDate ?? "Tanggal belum ditentukan"} · {invitation.timezone}
              </p>
              <p>{invitation.slug}</p>
              <Link href={`/dashboard/invitations/${invitation.id}`}>Kelola Undangan</Link>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
export async function NewInvitationView() {
  return (
    <section className="stack">
      <h1>Buat Undangan</h1>
      <CreateInvitationForm templates={await listCustomerTemplates()} />
    </section>
  );
}
const sections = [
  ["", "Ringkasan"],
  ["editor", "Editor"],
  ["preview", "Preview Privat"],
  ["settings", "Pengaturan"],
  ["guests", "Tamu"],
  ["rsvp", "RSVP"],
  ["wishes", "Ucapan"],
  ["gifts", "Hadiah"],
  ["analytics", "Analitik"],
];
const pending: Record<string, [string, string]> = {
  analytics: ["Analitik", "gst-06"],
};
/* Tab yang masih memakai fixture contoh; tamu sudah tersimpan di database. */
const domainViews: Record<string, { title: string; code: string; render: () => ReactNode }> = {
  rsvp: { title: "Konfirmasi RSVP", code: "gst-03", render: () => <RsvpPreview /> },
  wishes: { title: "Buku Ucapan", code: "gst-04", render: () => <WishesPreview /> },
  gifts: { title: "Hadiah", code: "gst-05", render: () => <GiftsPreview /> },
};
/*
 * Tab Tamu memakai data NYATA dari database (bukan fixture): daftar, ringkasan,
 * dan form tambah. Guard sesi & kepemilikan undangan diverifikasi di service.
 */
async function GuestsTab({ id, title }: { id: string; title: string }) {
  const { guests, summary } = await listGuests(id);
  return (
    <div className="stack">
      <GuestManagementView
        invitationId={id}
        guests={guests}
        summary={summary}
        invitationTitle={title}
      />
      <GuestCreateForm invitationId={id} />
      <GuestImportForm invitationId={id} />
    </div>
  );
}

export async function InvitationDetailView({ id, tab }: { id: string; tab: string }) {
  const invitation = await getCustomerInvitation(id);
  const base = `/dashboard/invitations/${invitation.id}`;
  return (
    <section className="stack">
      <nav className="actions" aria-label="Navigasi undangan">
        {sections.map(([path, label]) => (
          <Link
            key={path}
            href={path ? `${base}/${path}` : base}
            aria-current={path === tab ? "page" : undefined}
          >
            {label}
          </Link>
        ))}
      </nav>
      {tab === "editor" ? (
        <>
          <h1>Editor: {invitation.title}</h1>
          <InvitationEditorForm key={invitation.updatedAt} invitation={invitation} />
        </>
      ) : tab === "settings" ? (
        <>
          <h1>Pengaturan Undangan</h1>
          <InvitationSettingsForm key={invitation.updatedAt} invitation={invitation} />
        </>
      ) : tab === "preview" ? (
        <PrivateInvitationPreview invitation={invitation} />
      ) : tab === "guests" ? (
        <GuestsTab id={invitation.id} title={invitation.title} />
      ) : domainViews[tab] ? (
        <PreviewOnlyFeature
          title={domainViews[tab].title}
          previewCode={domainViews[tab].code}
        >
          {domainViews[tab].render()}
        </PreviewOnlyFeature>
      ) : pending[tab] ? (
        <PendingFeature title={pending[tab][0]} preview={`/preview-ui/${pending[tab][1]}`} />
      ) : (
        <article className="card stack">
          <h1>{invitation.title}</h1>
          <span className="badge">
            {invitation.status} · {invitation.isPublished ? "Terbit" : "Privat"}
          </span>
          <p>Alamat: {invitation.slug}</p>
          <p>{invitation.template.name}</p>
          <p>
            Tanggal: {invitation.weddingDate ?? "Belum diisi"} · {invitation.timezone}
          </p>
          <p>Terakhir disimpan: {invitation.updatedAt}</p>
          <Link className="button" href={`${base}/editor`}>
            Buka Editor
          </Link>
          <p className="notice">
            Publikasi komersial belum aktif. QRIS pengujian tidak menerbitkan undangan. Draft dengan
            riwayat pembayaran uji tidak dapat dihapus.
          </p>
          {invitation.status === "DRAFT" && !invitation.isPublished && (
            <DeleteDraftButton id={invitation.id} />
          )}
        </article>
      )}
    </section>
  );
}
