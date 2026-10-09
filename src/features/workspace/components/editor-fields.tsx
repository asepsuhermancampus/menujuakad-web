import type { InvitationDto } from "@/server/invitations/dto";
export function EditorFields({ invitation }: { invitation: InvitationDto }) {
  const { couple, sections } = invitation;
  return (
    <>
      <section className="stack">
        <h2>Cover</h2>
        <label>
          Judul cover
          <input name="coverHeading" maxLength={160} defaultValue={sections.cover?.heading ?? ""} />
        </label>
        <label>
          Pesan pembuka
          <textarea
            name="coverMessage"
            maxLength={2000}
            defaultValue={sections.cover?.message ?? ""}
          />
        </label>
      </section>
      <section className="stack">
        <h2>Pasangan</h2>
        <div className="grid-two">
          {(["groom", "bride"] as const).map((person) => (
            <div className="stack" key={person}>
              <h3>{person === "groom" ? "Mempelai pria" : "Mempelai wanita"}</h3>
              <label>
                Nama lengkap
                <input
                  name={`${person}FullName`}
                  maxLength={160}
                  defaultValue={couple?.[`${person}FullName`] ?? ""}
                />
              </label>
              <label>
                Nama panggilan
                <input
                  name={`${person}Nickname`}
                  maxLength={80}
                  defaultValue={couple?.[`${person}Nickname`] ?? ""}
                />
              </label>
              <label>
                Orang tua
                <input
                  name={`${person}Parents`}
                  maxLength={240}
                  defaultValue={couple?.[`${person}Parents`] ?? ""}
                />
              </label>
              <label>
                Profil singkat
                <textarea
                  name={`${person}Bio`}
                  maxLength={1500}
                  defaultValue={couple?.[`${person}Bio`] ?? ""}
                />
              </label>
            </div>
          ))}
        </div>
      </section>
      <section className="stack">
        <h2>Acara</h2>
        <label>
          Nama acara
          <input name="eventName" maxLength={160} defaultValue={sections.event?.name ?? ""} />
        </label>
        <div className="grid-two">
          <label>
            Tanggal acara
            <input
              type="date"
              name="eventDate"
              defaultValue={sections.event?.date ?? invitation.weddingDate ?? ""}
            />
          </label>
          <label>
            Waktu acara
            <input
              type="time"
              name="eventTime"
              required
              defaultValue={sections.event?.time ?? "09:00"}
            />
          </label>
        </div>
        <label>
          Tempat
          <input name="eventVenue" maxLength={240} defaultValue={sections.event?.venue ?? ""} />
        </label>
        <label>
          Alamat
          <textarea
            name="eventAddress"
            maxLength={1000}
            defaultValue={sections.event?.address ?? ""}
          />
        </label>
        <p>Zona waktu: {invitation.timezone}</p>
      </section>
      <section className="stack">
        <h2>Kisah</h2>
        <label>
          Kisah pasangan
          <textarea name="storyText" maxLength={6000} defaultValue={sections.story?.text ?? ""} />
        </label>
      </section>
      <section className="stack">
        <h2>Konfigurasi RSVP</h2>
        <label className="check">
          <input
            type="checkbox"
            name="rsvpEnabled"
            defaultChecked={sections.rsvp?.enabled ?? false}
          />
          Tampilkan section RSVP dalam preview
        </label>
        <label>
          Batas konfirmasi
          <input type="date" name="rsvpDeadline" defaultValue={sections.rsvp?.deadline ?? ""} />
        </label>
        <p>Konfigurasi disimpan. Penerimaan RSVP dari tamu belum aktif.</p>
      </section>
    </>
  );
}
