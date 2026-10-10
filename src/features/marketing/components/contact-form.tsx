"use client";
import { LocalPreviewForm } from "@/components/shared/local-preview-form";
import { useState } from "react";

/*
 * Formulir kontak contoh mengikuti struktur PUB-08: nama, email, WhatsApp,
 * kategori keperluan, dan pesan. Validasi berjalan lokal di browser; tidak
 * ada data yang dikirim ke server. Kategori memakai daftar dari desain.
 */
export function ContactForm() {
  const [message, setMessage] = useState("");
  return (
    <LocalPreviewForm
      className="card stack contact-form"
      onSubmit={(e) => {
        e.preventDefault();
        setMessage(
          "Pesan tervalidasi di browser Anda. Pengiriman belum terhubung, sehingga tidak ada pesan yang terkirim.",
        );
      }}
    >
      <h2>Formulir Pesan</h2>
      <p className="notice">Form contoh; pesan tidak dikirim. Hindari data pribadi.</p>
      <label>
        Nama lengkap <span aria-hidden="true">*</span>
        <input required placeholder="Nama Contoh" autoComplete="name" />
      </label>
      <label>
        Alamat email aktif <span aria-hidden="true">*</span>
        <input required type="email" placeholder="akun@example.invalid" autoComplete="email" />
      </label>
      <label>
        Nomor WhatsApp <span aria-hidden="true">*</span>
        <input required inputMode="tel" placeholder="08xx-xxxx-xxxx" autoComplete="tel" />
      </label>
      <label>
        Kategori keperluan <span aria-hidden="true">*</span>
        <select required defaultValue="">
          <option value="" disabled>
            Pilih kategori kendala atau konsultasi…
          </option>
          <option>Pertanyaan fitur</option>
          <option>Bantuan pembayaran</option>
          <option>Permintaan khusus</option>
          <option>Kendala teknis</option>
        </select>
      </label>
      <label>
        Pesan / detail kebutuhan <span aria-hidden="true">*</span>
        <textarea required minLength={10} placeholder="Tuliskan kebutuhan atau kendala Anda" />
      </label>
      <button className="button" type="submit">
        Tinjau pesan
      </button>
      <p className="muted contact-form-note">
        Data kontak tidak dikirim atau disimpan pada versi pratinjau.
      </p>
      {message && (
        <p className="success contact-form-success" role="status">
          {message}
        </p>
      )}
    </LocalPreviewForm>
  );
}
