"use client";
import { LocalPreviewForm } from "@/components/shared/local-preview-form";
import { useState } from "react";
export function ContactForm() {
  const [message, setMessage] = useState("");
  return (
    <LocalPreviewForm
      className="card stack"
      onSubmit={(e) => {
        e.preventDefault();
        setMessage("Pesan telah divalidasi lokal. Pengiriman belum terhubung.");
      }}
    >
      <h2>Tinjau Formulir Pesan</h2>
      <p className="notice">Form contoh; pesan tidak dikirim. Hindari data pribadi.</p>
      <label>
        Nama lengkap
        <input required placeholder="Nama Contoh" />
      </label>
      <label>
        Alamat email
        <input required type="email" placeholder="akun@example.invalid" />
      </label>
      <label>
        Topik
        <select>
          <option>Desain undangan</option>
          <option>Akun</option>
          <option>Paket</option>
        </select>
      </label>
      <label>
        Pesan
        <textarea required minLength={10} />
      </label>
      <button className="button" type="submit">
        Tinjau pesan
      </button>
      {message && <p role="status">{message}</p>}
    </LocalPreviewForm>
  );
}
