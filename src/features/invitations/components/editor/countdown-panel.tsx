"use client";
import { EditorField, EditorToggle, type EditorFieldProps } from "./editor-field";
export function CountdownPanel(props: EditorFieldProps) {
  return (
    <>
      <h1>Hitung Mundur</h1>
      <p>Menanti sebuah awal yang indah.</p>
      <article className="card stack">
        <h2>Acara & Waktu Acuan</h2>
        <EditorToggle {...props} name="countdownEnabled" label="Tampilkan hitung mundur contoh" />
        <EditorField
          {...props}
          name="countdownDate"
          label="Waktu tujuan (WIB)"
          type="datetime-local"
        />
        <p className="notice">
          Clock fixture tetap, 7 Oktober 2026 pukul 15.00 WIB. Angka adalah durasi ilustratif yang
          tidak berjalan sebagai timer produksi.
        </p>
      </article>
      <article className="card stack">
        <h2>Gaya Hitung Mundur</h2>
        <div className="tabs">
          {[
            ["CLASSIC", "Klasik"],
            ["CARDS", "Kartu"],
            ["MINIMAL", "Minimal"],
          ].map(([id, label]) => (
            <button
              key={id}
              aria-pressed={props.draft.countdownStyle === id}
              onClick={() => props.update("countdownStyle", id)}
            >
              {label}
            </button>
          ))}
        </div>
        <h3>Saat Waktu Terlewati</h3>
        <EditorField {...props} name="countdownZeroText" label="Pesan saat hari tiba" />
        <p>Tanggal lampau menampilkan zero-state, tanpa durasi negatif.</p>
      </article>
      <article className="card stack">
        <h2>Kalender Acara</h2>
        <label>
          Tanggal kalender contoh
          <input
            type="date"
            value={props.draft.countdownDate.slice(0, 10)}
            onChange={(e) =>
              props.update(
                "countdownDate",
                `${e.target.value}T${props.draft.countdownDate.slice(11) || "09:00"}`,
              )
            }
          />
        </label>
        <p>
          {props.draft.eventTitle} · {props.draft.venue}
        </p>
        <button className="button secondary" disabled>
          Tambahkan ke kalender · belum aktif
        </button>
      </article>
    </>
  );
}
