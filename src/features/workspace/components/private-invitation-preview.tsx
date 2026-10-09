import type { InvitationDto } from "@/server/invitations/dto";
export function PrivateInvitationPreview({ invitation }: { invitation: InvitationDto }) {
  const { couple, sections } = invitation;
  return (
    <article className="card stack">
      <p className="badge">Preview privat · Data tersimpan · {invitation.status}</p>
      <h1>{sections.cover?.heading || invitation.title}</h1>
      {sections.cover?.message && (
        <p style={{ whiteSpace: "pre-wrap" }}>{sections.cover.message}</p>
      )}
      <h2>
        {couple?.groomFullName || "Nama mempelai pria belum diisi"} &amp;{" "}
        {couple?.brideFullName || "Nama mempelai wanita belum diisi"}
      </h2>
      <p>
        {invitation.weddingDate ?? "Tanggal belum diisi"} · {invitation.timezone}
      </p>
      {couple && (
        <section>
          <h2>Pasangan</h2>
          <p>{couple.groomParents}</p>
          <p>{couple.groomBio}</p>
          <p>{couple.brideParents}</p>
          <p>{couple.brideBio}</p>
        </section>
      )}
      {sections.event && (
        <section>
          <h2>{sections.event.name || "Acara"}</h2>
          <p>
            {sections.event.date ?? "Tanggal belum diisi"} · {sections.event.time} ·{" "}
            {invitation.timezone}
          </p>
          <p>{sections.event.venue}</p>
          <p style={{ whiteSpace: "pre-wrap" }}>{sections.event.address}</p>
        </section>
      )}
      {sections.story?.text && (
        <section>
          <h2>Kisah Kami</h2>
          <p style={{ whiteSpace: "pre-wrap" }}>{sections.story.text}</p>
        </section>
      )}
      {sections.rsvp?.enabled && (
        <section>
          <h2>Konfirmasi Kehadiran</h2>
          <p>Batas konfirmasi: {sections.rsvp.deadline ?? "Belum ditentukan"}</p>
          <p>Form RSVP publik belum aktif.</p>
        </section>
      )}
      <p className="notice">
        Preview ini hanya dapat dibaca oleh pemilik setelah login. URL draft belum diterbitkan untuk
        tamu.
      </p>
    </article>
  );
}
