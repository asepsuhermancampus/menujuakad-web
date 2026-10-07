"use client";
import { LocalPreviewForm } from "@/components/shared/local-preview-form";
import { useState } from "react";
export function InvitationResponse() {
  const [message, setMessage] = useState("");
  return (
    <section id="rsvp">
      <p className="eyebrow">KEHADIRAN & DOA RESTU</p>
      <h2>Konfirmasi Kehadiran</h2>
      <p>Form contoh. Respons tidak dikirim atau disimpan pada layanan.</p>
      <LocalPreviewForm
        className="stack"
        onSubmit={(e) => {
          e.preventDefault();
          setMessage("Respons contoh tercatat lokal sampai halaman dimuat ulang.");
        }}
      >
        <label>
          Nama tamu
          <input required placeholder="Tamu Contoh" />
        </label>
        <label>
          Kehadiran
          <select>
            <option value="ATTENDING">Hadir</option>
            <option value="NOT_ATTENDING">Tidak hadir</option>
            <option value="MAYBE">Masih mempertimbangkan</option>
          </select>
        </label>
        <label>
          Jumlah tamu
          <input type="number" min={1} max={2} defaultValue={1} />
        </label>
        <label>
          Ucapan & doa
          <textarea required placeholder="Tuliskan doa terbaik..." />
        </label>
        <button className="button" type="submit">
          Kirim respons contoh
        </button>
        {message && <p role="status">{message}</p>}
      </LocalPreviewForm>
    </section>
  );
}
