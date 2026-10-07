"use client";
import { useState } from "react";
export function DesignReference() {
  const [message, setMessage] = useState("");
  return (
    <main id="main" className="container section component-sheet">
      <p className="eyebrow">EDITORIAL IVORY & GOLD</p>
      <h1>Komponen & Token Desain</h1>
      <section className="section">
        <h2>Palet</h2>
        <div className="grid-four">
          {[
            ["Ivory", "#FBF9F4"],
            ["Ink", "#171717"],
            ["Gold", "#C5A46D"],
            ["Soft", "#EFEAE1"],
          ].map(([label, color]) => (
            <article className="card" key={label}>
              <div style={{ background: color, height: 80, border: "1px solid #e5ded3" }} />
              <p>
                {label} · {color}
              </p>
            </article>
          ))}
        </div>
      </section>
      <section className="section">
        <h2>Tipografi</h2>
        <h3>Noto Serif · Sebuah Awal yang Indah</h3>
        <p>Manrope · UI, form, navigasi, dan informasi.</p>
      </section>
      <section className="section">
        <h2>Tombol & Status</h2>
        <button className="button" onClick={() => setMessage("Tombol contoh diaktifkan lokal.")}>
          Aksi Utama
        </button>
        <button className="button secondary" onClick={() => setMessage("Aksi sekunder contoh.")}>
          Aksi Sekunder
        </button>
        <button className="button" disabled>
          Tidak Tersedia
        </button>
        <p>
          <span className="badge success">Lengkap</span>{" "}
          <span className="badge danger">Perlu Ditinjau</span>
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
