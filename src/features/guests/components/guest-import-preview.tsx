"use client";
import { useState } from "react";
import { guestsFixture } from "@/features/design-preview/data/guests-fixtures";
import { validateGuestImport } from "../lib/guest-preview";
export function GuestImportPreview() {
  const [text, setText] = useState(
    "Tamu Contoh Impor 001;FAMILY\nTamu Contoh 001;FAMILY\n;FRIENDS",
  );
  const [guests, setGuests] = useState([...guestsFixture]);
  const [message, setMessage] = useState("");
  const rows = validateGuestImport(text, guests);
  const valid = rows.filter((row) => row.status === "VALID");
  function apply() {
    setGuests([
      ...guests,
      ...valid.map((row, index) => ({
        id: `local-import-${guests.length + index}`,
        invitationId: "demo-invitation-01",
        displayName: row.displayName,
        group: row.group,
        rsvpStatus: "PENDING" as const,
        partySize: 1,
        deliveryStatus: "NOT_SENT" as const,
        respondedAt: null,
      })),
    ]);
    setMessage(
      `${valid.length} tamu contoh ditambahkan lokal. Baris invalid tetap tersedia untuk diperbaiki; daftar ini reset saat dimuat ulang.`,
    );
  }
  return (
    <section className="business stack">
      <p className="eyebrow">TAMU / IMPOR CONTOH</p>
      <h1>Impor Tamu</h1>
      <p>
        Format setiap baris: nama;FAMILY, FRIENDS atau COLLEAGUES. Gunakan identitas sintetis, tanpa
        kontak tamu asli.
      </p>
      <label>
        Baris impor contoh
        <textarea rows={7} value={text} onChange={(e) => setText(e.target.value)} />
      </label>
      <div className="business-table">
        <table>
          <caption>Validasi baris impor</caption>
          <thead>
            <tr>
              <th>Baris</th>
              <th>Nama</th>
              <th>Grup</th>
              <th>Status</th>
              <th>Catatan</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.rowNumber}>
                <td>{row.rowNumber}</td>
                <td>{row.displayName || "—"}</td>
                <td>{row.group}</td>
                <td>{row.status}</td>
                <td>{row.issue || "Siap ditambahkan lokal"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        {valid.length} valid · {rows.filter((row) => row.status === "DUPLICATE").length} duplikat ·{" "}
        {rows.filter((row) => row.status === "INVALID").length} invalid
      </p>
      <button type="button" className="button" disabled={!valid.length} onClick={apply}>
        Tambahkan baris valid lokal
      </button>
      {message && (
        <p role="status" className="notice">
          {message}
        </p>
      )}
      <p className="notice">
        Tidak mengunggah berkas atau menyimpan daftar ke server. Impor ini terpisah dari contoh
        manajemen tamu.
      </p>
    </section>
  );
}
