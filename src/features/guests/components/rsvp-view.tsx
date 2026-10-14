import Link from "next/link";
import type { GuestDto, GuestSummaryDto } from "@/server/guests/dto";
import { rsvpStatusLabels } from "../lib/guest-domain-labels";

/*
 * Tab RSVP (GST-03) memakai data NYATA dari database: seluruh angka dihitung
 * dari baris Guest + RsvpResponse milik undangan ini, bukan fixture.
 *
 * Halaman ini hanya melaporkan. Pencatatan respons dilakukan di tab Tamu
 * (form per tamu) dan oleh tamu sendiri lewat tautan personal /u/[token],
 * sehingga tidak ada mutasi tersembunyi dari halaman laporan ini.
 */
const respondedAtFormat = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});

function formatRespondedAt(value: string | null) {
  if (!value) return "waktu tidak tercatat";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "waktu tidak tercatat" : respondedAtFormat.format(date);
}

export function RsvpView({
  invitationId,
  summary,
  guests,
}: {
  invitationId: string;
  summary: GuestSummaryDto;
  guests: GuestDto[];
}) {
  const respondedPercent = summary.registered
    ? Math.round((summary.responded / summary.registered) * 100)
    : 0;
  const answered = guests.filter((guest) => guest.rsvp && guest.rsvp.status !== "PENDING");
  const cards = [
    {
      title: "Total Respons Masuk",
      value: summary.responded,
      unit: `/ ${summary.registered} tamu`,
      detail: `${respondedPercent}% tamu sudah menjawab, termasuk yang masih ragu.`,
      progress: true,
    },
    {
      title: "Hadir Pasti",
      value: summary.attending,
      unit: "tamu",
      detail: `${summary.attendingSeats} kursi terpakai · ${summary.attendanceRatePercent}% dari seluruh tamu.`,
    },
    {
      title: "Berhalangan",
      value: summary.declining,
      unit: "tamu",
      detail: "Tidak hadir, terpisah dari respons masih ragu.",
    },
    {
      title: "Belum Menjawab",
      value: summary.pending,
      unit: "tamu",
      detail: "Termasuk tamu yang belum pernah membuka tautan konfirmasi.",
    },
  ];

  return (
    <section className="stack">
      <header className="workspace-title">
        <div>
          <p className="eyebrow">LAPORAN KEHADIRAN · DATA TERSIMPAN</p>
          <h1>Rekapitulasi Konfirmasi RSVP</h1>
          <p className="billing-muted">
            Dihitung dari {summary.registered} tamu dan respons yang benar-benar tersimpan di
            database undangan ini.
          </p>
        </div>
        <span className="badge">
          {summary.responded}/{summary.registered} sudah menjawab
        </span>
      </header>

      <div className="guest-summary">
        {cards.map((card) => (
          <article className="card" key={card.title}>
            <h2>{card.title}</h2>
            <p className="billing-total">
              {card.value} <span className="billing-muted">{card.unit}</span>
            </p>
            {card.progress && (
              <progress
                aria-label="Persentase tamu yang sudah menjawab"
                value={summary.responded}
                max={summary.registered || 1}
              />
            )}
            <p className="billing-muted">{card.detail}</p>
          </article>
        ))}
      </div>

      <aside className="notice">
        <strong>Masih ragu: {summary.maybe} tamu.</strong> Termasuk dalam respons masuk, tetapi belum
        dihitung sebagai hadir maupun berhalangan.
      </aside>

      <section className="stack">
        <h2>Respons terbaru</h2>
        {answered.length === 0 ? (
          <article className="card stack">
            <p>
              Belum ada respons tersimpan. Catat respons manual di tab Tamu, atau bagikan tautan
              personal agar tamu mengisi sendiri.
            </p>
            <Link className="button secondary" href={`/dashboard/invitations/${invitationId}/guests`}>
              Buka tab Tamu
            </Link>
          </article>
        ) : (
          <div className="stack">
            {answered.map((guest) => (
              <article className="card stack" key={guest.id}>
                <h3>{guest.name}</h3>
                <p className="billing-muted">
                  <span className="badge">
                    {guest.rsvp ? rsvpStatusLabels[guest.rsvp.status] : "Belum menjawab"}
                  </span>{" "}
                  · {guest.rsvp?.guestCount ?? 0} orang dari alokasi {guest.guestCountAllowed} kursi ·{" "}
                  {formatRespondedAt(guest.rsvp?.respondedAt ?? null)}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>

      <p className="billing-muted">
        Butuh mengubah respons? Gunakan form per tamu di{" "}
        <Link href={`/dashboard/invitations/${invitationId}/guests`}>tab Tamu</Link> atau tautan
        personal tamu (<code>/u/&lt;token&gt;</code>).
      </p>
    </section>
  );
}
