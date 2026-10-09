"use client";
import { useState } from "react";

/*
 * DS-01 Component Sheet & Design Tokens Guide.
 * Nilai token disalin dari snapshot resmi Stitch (docs/design-system.md):
 * metadata proyek MENUJU-AKAD-UIUX, design system Editorial Ivory & Gold v1.
 * Halaman ini referensi internal, bukan rute produksi customer/admin.
 */
const coreColors = [
  ["paper", "#F8F6F1", "Kanvas publik & undangan"],
  ["background", "#fbf9f4", "Latar aplikasi"],
  ["surface", "#FFFFFF", "Kartu & panel"],
  ["beige", "#E5DED3", "Border & bidang lembut"],
  ["gold / primary", "#C5A46D", "Aksen; JANGAN untuk teks kecil"],
  ["primary-deep", "#A8854A", "Teks aksen & tautan"],
  ["primary-soft", "#F1E7D3", "Sorotan lembut"],
  ["accent-soft", "#EFEAE1", "Bidang netral hangat"],
  ["ink", "#171717", "Teks utama & tombol primary"],
  ["ink-soft", "#292929", "Hover tombol & teks isi"],
  ["taupe / muted", "#8A8176", "Border, ikon, teks besar"],
];

const statusColors = [
  ["success", "#3F6B4F", "#E9EFE8"],
  ["danger", "#8A3A2A", "#F4E3DC"],
  ["warning", "#7A5A0C", "#F7E8C6"],
  ["info", "#3A5A72", "#E9EEF2"],
  ["error", "#ba1a1a", "#ffdad6"],
];

const typeScale = [
  ["display-hero", "Noto Serif", "72px / 80px", "400", "-0.02em"],
  ["headline-lg", "Noto Serif", "56px / 64px", "500", "-0.02em"],
  ["headline-md", "Noto Serif", "40px / 48px", "500", "-0.02em"],
  ["headline-sm", "Noto Serif", "28px / 36px", "500", "-0.01em"],
  ["headline-xs", "Noto Serif", "22px / 30px", "500", "-0.01em"],
  ["body-lg", "Manrope", "18px / 28px", "400", "—"],
  ["body-md", "Manrope", "15px / 24px", "400", "—"],
  ["body-sm", "Manrope", "13px / 20px", "400", "—"],
  ["caption", "Manrope", "12px / 16px", "400", "—"],
  ["label-eyebrow", "Manrope", "12px / 16px", "600", "+0.08em"],
  ["label-lg", "Manrope", "14px / 20px", "600", "—"],
  ["label-md", "Manrope", "13px / 18px", "500", "—"],
];

const radii = [
  ["control", "4px"],
  ["button", "6px"],
  ["card", "10px"],
  ["modal", "16px"],
  ["pill / badge", "999px"],
];

const spacing = [
  ["space-xs", "0.25rem"],
  ["space-sm", "0.5rem"],
  ["space-md", "1rem"],
  ["space-lg", "1.5rem"],
  ["space-xl", "2.5rem"],
  ["gutter-mobile", "1.25rem"],
  ["gutter-tablet", "2rem"],
  ["gutter / margin", "2.5rem"],
];

export function DesignReference() {
  const [message, setMessage] = useState("");
  return (
    <main id="main" className="container section component-sheet">
      <p className="eyebrow">EDITORIAL IVORY & GOLD · REFERENSI INTERNAL</p>
      <h1>Komponen & Token Desain</h1>
      <p>
        Snapshot token dari Stitch MENUJU-AKAD-UIUX (design system Editorial Ivory &amp; Gold v1).
        Halaman ini referensi internal untuk konsistensi slicing, bukan rute produksi.
      </p>

      <section className="section">
        <h2>Palet Inti</h2>
        <div className="grid-four">
          {coreColors.map(([label, color, usage]) => (
            <article className="card" key={label}>
              <div
                style={{
                  background: color,
                  height: 72,
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-control)",
                }}
              />
              <p>
                <strong>{label}</strong>
                <br />
                {color}
              </p>
              <small>{usage}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <h2>Warna Status</h2>
        <div className="grid-three">
          {statusColors.map(([label, solid, soft]) => (
            <article className="card" key={label}>
              <div style={{ display: "flex", gap: 8 }}>
                <div
                  style={{
                    background: soft,
                    height: 56,
                    flex: 2,
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-control)",
                  }}
                />
                <div
                  style={{
                    background: solid,
                    height: 56,
                    flex: 1,
                    borderRadius: "var(--radius-control)",
                  }}
                />
              </div>
              <p>
                <strong>{label}</strong> · {solid}
              </p>
              <small>soft {soft}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <h2>Tipografi</h2>
        <h3>Noto Serif · Sebuah Awal yang Indah</h3>
        <p>Manrope · UI, form, navigasi, dan informasi.</p>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Token</th>
                <th>Font</th>
                <th>Ukuran / Line-height</th>
                <th>Weight</th>
                <th>Tracking</th>
              </tr>
            </thead>
            <tbody>
              {typeScale.map(([token, font, size, weight, tracking]) => (
                <tr key={token}>
                  <td>{token}</td>
                  <td>{font}</td>
                  <td>{size}</td>
                  <td>{weight}</td>
                  <td>{tracking}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section">
        <h2>Radius & Spasi</h2>
        <div className="grid-two">
          <div>
            <h3>Radius</h3>
            <ul>
              {radii.map(([label, value]) => (
                <li key={label}>
                  <strong>{label}</strong>: {value}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Spasi</h3>
            <ul>
              {spacing.map(([label, value]) => (
                <li key={label}>
                  <strong>{label}</strong>: {value}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section">
        <h2>Tombol & Status</h2>
        <button className="button" onClick={() => setMessage("Tombol contoh diaktifkan lokal.")}>
          Aksi Utama
        </button>
        <button className="button secondary" onClick={() => setMessage("Aksi sekunder contoh.")}>
          Aksi Sekunder
        </button>
        <button className="button outline" onClick={() => setMessage("Aksi outline contoh.")}>
          Aksi Outline
        </button>
        <button className="button" disabled>
          Tidak Tersedia
        </button>
        <p>
          <span className="badge success">Lengkap</span>{" "}
          <span className="badge danger">Perlu Ditinjau</span>{" "}
          <span className="badge gold">Premium</span>{" "}
          <span className="badge ink">Baru</span>
        </p>
        <p className="notice">Informasi contoh dengan kontras yang terbaca.</p>
      </section>

      <article className="card stack">
        <h2>Form Contoh</h2>
        <label>
          Nama contoh
          <input placeholder="Akun Contoh" />
        </label>
        <label>
          Pilihan contoh
          <select>
            <option>Pilihan satu</option>
            <option>Pilihan dua</option>
          </select>
        </label>
        <label className="check">
          <input type="checkbox" />
          Aktifkan contoh
        </label>
        <label>
          Pesan contoh
          <textarea />
        </label>
      </article>
      {message && <p role="status">{message}</p>}
    </main>
  );
}
