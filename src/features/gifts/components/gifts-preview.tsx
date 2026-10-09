"use client";
import { useState } from "react";
import { giftsFixture } from "@/features/design-preview/data/gifts-fixtures";
import { formatIdr } from "@/features/billing/lib/presentation";
export function GiftsPreview() {
  const [kind, setKind] = useState("ALL");
  const [enabled, setEnabled] = useState(false);
  const total = giftsFixture
    .filter((gift) => gift.kind === "ENVELOPE")
    .reduce((sum, gift) => sum + gift.amountIdr, 0);
  return (
    <section className="business stack">
      <p className="eyebrow">TAMU / HADIAH CONTOH</p>
      <h1>Hadiah & Amplop</h1>
      <p className="notice">
        Laporan pengirim sintetis. Tidak membuktikan transfer diterima atau hadiah telah dikirim.
      </p>
      <div className="grid-three">
        <article className="card">
          <h2>{formatIdr(total)}</h2>
          <p>Nominal amplop yang dilaporkan (contoh)</p>
        </article>
        <article className="card">
          <h2>{giftsFixture.length}</h2>
          <p>Laporan hadiah contoh</p>
        </article>
        <article className="card">
          <h2>Belum terhubung</h2>
          <p>Verifikasi bank / pengiriman</p>
        </article>
      </div>
      <article className="card">
        <h2>Pengaturan Tampilan Hadiah</h2>
        <label>
          <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
          Tampilkan bagian hadiah contoh
        </label>
        <p>
          {enabled ? "Bagian contoh ditampilkan lokal." : "Bagian contoh disembunyikan lokal."}{" "}
          Tidak ada rekening, alamat pengiriman atau QR pembayaran.
        </p>
      </article>
      <label>
        Jenis hadiah
        <select aria-label="Jenis hadiah" value={kind} onChange={(e) => setKind(e.target.value)}>
          <option value="ALL">Semua jenis</option>
          <option value="ENVELOPE">Amplop</option>
          <option value="PHYSICAL">Hadiah fisik</option>
        </select>
      </label>
      <div className="business-table">
        <table>
          <caption>Laporan hadiah sintetis</caption>
          <thead>
            <tr>
              <th>Tamu</th>
              <th>Jenis</th>
              <th>Nominal contoh</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {giftsFixture
              .filter((gift) => kind === "ALL" || gift.kind === kind)
              .map((gift) => (
                <tr key={gift.id}>
                  <td>{gift.guestLabel}</td>
                  <td>{gift.kind === "ENVELOPE" ? "Amplop" : "Hadiah fisik"}</td>
                  <td>{gift.kind === "ENVELOPE" ? formatIdr(gift.amountIdr) : "Tidak ditaksir"}</td>
                  <td>Dilaporkan · belum diverifikasi</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
