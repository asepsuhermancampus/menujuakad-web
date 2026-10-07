"use client";
import { LocalPreviewForm } from "@/components/shared/local-preview-form";
import { useSupportPreview } from "../hooks/use-support-preview";
export function SupportPreview() {
  const state = useSupportPreview();
  const selected = state.tickets.find((ticket) => ticket.id === state.selected);
  const filtered = state.tickets.filter(
    (ticket) => state.filter === "ALL" || ticket.status === state.filter,
  );
  return (
    <>
      <div className="workspace-title">
        <div>
          <p className="eyebrow">PUSAT BANTUAN</p>
          <h1>Kami Siap Membantu</h1>
          <p>Kelola pertanyaan contoh dan tinjau percakapan dukungan.</p>
        </div>
        <button className="button" onClick={() => state.setCreating(!state.creating)}>
          {state.creating ? "Batalkan" : "+ Tiket Contoh Baru"}
        </button>
      </div>
      <p className="notice">
        Data dan pesan contoh. Kontak, jadwal concierge, serta pengiriman dukungan belum aktif.
      </p>
      <div className="grid-three support-stats">
        {[
          [
            "Tiket terbuka contoh",
            state.tickets.filter((ticket) => ticket.status === "OPEN").length,
          ],
          [
            "Tiket selesai contoh",
            state.tickets.filter((ticket) => ticket.status === "RESOLVED").length,
          ],
          ["Concierge", "Belum aktif"],
        ].map(([label, value]) => (
          <article className="card" key={label}>
            <small>{label}</small>
            <h2>{value}</h2>
          </article>
        ))}
      </div>
      <div className="grid-two">
        <article className="card stack">
          <h2>Tiket Bantuan</h2>
          <label>
            Filter status tiket
            <select value={state.filter} onChange={(e) => state.setFilter(e.target.value)}>
              <option value="ALL">Semua</option>
              <option value="OPEN">Terbuka</option>
              <option value="IN_PROGRESS">Ditinjau</option>
              <option value="RESOLVED">Selesai</option>
            </select>
          </label>
          {filtered.map((ticket) => (
            <button
              className="ticket-selector"
              aria-pressed={state.selected === ticket.id}
              key={ticket.id}
              onClick={() => {
                state.setSelected(ticket.id);
                state.setCreating(false);
              }}
            >
              <strong>{ticket.subject}</strong>
              <span className="badge">
                {ticket.status === "OPEN"
                  ? "Terbuka"
                  : ticket.status === "IN_PROGRESS"
                    ? "Ditinjau"
                    : "Selesai"}
              </span>
            </button>
          ))}
          {!filtered.length && <p>Tidak ada tiket pada filter ini.</p>}
        </article>
        <article className="card stack">
          <h2>{state.creating ? "Tiket Contoh Baru" : selected?.subject}</h2>
          {!state.creating &&
            selected?.messages.map((item) => (
              <div className="support-message" key={item.id}>
                <small>
                  {item.author === "CUSTOMER_EXAMPLE" ? "Anda (contoh)" : "Dukungan (contoh)"}
                </small>
                <p>{item.body}</p>
              </div>
            ))}
          <LocalPreviewForm className="stack" onSubmit={state.submit}>
            {state.creating && (
              <label>
                Judul pertanyaan
                <input name="subject" required />
              </label>
            )}
            <label>
              Pesan contoh
              <textarea
                name="body"
                minLength={5}
                required
                placeholder="Tulis pertanyaan contoh tanpa data pribadi..."
              />
            </label>
            <button className="button" type="submit">
              {state.creating ? "Tambahkan tiket lokal" : "Tambahkan balasan lokal"}
            </button>
          </LocalPreviewForm>
        </article>
      </div>
      {state.message && (
        <p role="status" className="local-message">
          {state.message}
        </p>
      )}
    </>
  );
}
