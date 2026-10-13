"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useWorkspaceMutation } from "@/features/workspace/use-workspace-mutation";
import type { GuestDto, GuestSummaryDto } from "@/server/guests/dto";
import {
  RSVP_STATUS_OPTIONS,
  guestCategoryLabels,
  rsvpStatusLabels,
  whatsappHref,
} from "../lib/guest-domain-labels";

/* Form pencatatan respons RSVP per tamu (PUT .../guests/[guestId]/rsvp). */
function RsvpForm({ invitationId, guest }: { invitationId: string; guest: GuestDto }) {
  const mutation = useWorkspaceMutation();
  const [open, setOpen] = useState(false);
  if (!open)
    return (
      <Button className="secondary" onClick={() => setOpen(true)}>
        Catat RSVP
      </Button>
    );
  return (
    <form
      className="stack"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        void mutation
          .mutate(
            `/api/customer/invitations/${invitationId}/guests/${guest.id}/rsvp`,
            "PUT",
            {
              status: String(data.get("status") ?? "PENDING"),
              guestCount: Number(data.get("guestCount") ?? 0),
              phone: guest.phone,
              message: String(data.get("message") ?? "") || null,
            },
          )
          .then(() => setOpen(false));
      }}
    >
      <label>
        Status
        <select name="status" defaultValue={guest.rsvp?.status ?? "PENDING"}>
          {RSVP_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Jumlah hadir (maks {guest.guestCountAllowed})
        <input
          name="guestCount"
          type="number"
          min={0}
          max={guest.guestCountAllowed}
          defaultValue={guest.rsvp?.guestCount ?? 0}
        />
      </label>
      <label>
        Pesan (opsional)
        <input name="message" maxLength={1000} defaultValue="" />
      </label>
      <div className="actions">
        <Button type="submit" disabled={mutation.pending}>
          {mutation.pending ? "Menyimpan…" : "Simpan RSVP"}
        </Button>
        <Button type="button" className="secondary" onClick={() => setOpen(false)}>
          Batal
        </Button>
      </div>
      {mutation.message && <p role={mutation.failed ? "alert" : "status"}>{mutation.message}</p>}
    </form>
  );
}

function SummaryCards({ summary }: { summary: GuestSummaryDto }) {
  return (
    <div className="grid-two" role="region" aria-label="Ringkasan tamu">
      <article className="card">
        <h2>Tamu Terdaftar</h2>
        <p>{summary.registered}</p>
        <p className="billing-muted">{summary.seats} kursi teralokasi</p>
      </article>
      <article className="card">
        <h2>Hadir</h2>
        <p>{summary.attending}</p>
        <p className="billing-muted">{summary.attendingSeats} orang dikonfirmasi</p>
      </article>
      <article className="card">
        <h2>Belum Menjawab</h2>
        <p>{summary.pending}</p>
        <p className="billing-muted">{summary.responded} sudah menjawab</p>
      </article>
      <article className="card">
        <h2>Tingkat Kehadiran</h2>
        <p>{summary.attendanceRatePercent}%</p>
        <p className="billing-muted">
          {summary.declining} tidak hadir · {summary.maybe} masih ragu
        </p>
      </article>
    </div>
  );
}

/*
 * Daftar tamu nyata dari database. Tabel dapat digulir pada layar kecil dan
 * setiap baris menampilkan alokasi kursi, status RSVP, serta aksi nyata.
 */
export function GuestManagementView({
  invitationId,
  guests,
  summary,
  invitationTitle,
}: {
  invitationId: string;
  guests: GuestDto[];
  summary: GuestSummaryDto;
  invitationTitle: string;
}) {
  const [query, setQuery] = useState("");
  const filtered = guests.filter((guest) =>
    guest.name.toLocaleLowerCase("id").includes(query.trim().toLocaleLowerCase("id")),
  );
  return (
    <section className="stack">
      <div className="workspace-title">
        <div>
          <h1>Manajemen Tamu</h1>
          <p className="billing-muted">
            Daftar tamu untuk “{invitationTitle}” tersimpan di database dan dihitung dari data nyata.
          </p>
        </div>
        <span className="badge">Tersimpan</span>
      </div>
      <SummaryCards summary={summary} />
      <label>
        Cari nama tamu
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Ketik nama…"
        />
      </label>
      {guests.length === 0 ? (
        <p className="card">
          Belum ada tamu. Tambahkan tamu pertama, atau impor daftar dari berkas CSV pada form impor.
        </p>
      ) : filtered.length === 0 ? (
        <p className="card">Tidak ada tamu yang cocok dengan pencarian “{query}”.</p>
      ) : (
        <div className="card" style={{ overflowX: "auto" }}>
          <table>
            <caption className="sr-only">Daftar tamu tersimpan</caption>
            <thead>
              <tr>
                <th scope="col">Nama</th>
                <th scope="col">Kategori</th>
                <th scope="col">Kursi</th>
                <th scope="col">RSVP</th>
                <th scope="col">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((guest) => {
                const wa = whatsappHref(
                  guest.phone,
                  `Assalamualaikum ${guest.name}, kami mengundang Anda ke pernikahan kami.`,
                );
                return (
                  <tr key={guest.id}>
                    <td>{guest.name}</td>
                    <td>{guestCategoryLabels[guest.category] ?? guest.category}</td>
                    <td>{guest.guestCountAllowed}</td>
                    <td>{guest.rsvp ? rsvpStatusLabels[guest.rsvp.status] : "Belum menjawab"}</td>
                    <td>
                      <div className="actions">
                        <RsvpForm invitationId={invitationId} guest={guest} />
                        {wa && (
                          <a className="button secondary" href={wa} target="_blank" rel="noreferrer">
                            WhatsApp
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
