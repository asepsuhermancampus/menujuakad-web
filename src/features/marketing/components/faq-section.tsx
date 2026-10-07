"use client";
import { useState } from "react";
const questions = [
  [
    "Bagaimana cara membuat undangan?",
    "Pilih desain, lengkapi cerita kalian, lalu tinjau tampilan undangan. Saat ini editor dapat dicoba melalui pratinjau data contoh.",
  ],
  [
    "Apakah desain dapat disesuaikan?",
    "Judul, pasangan, cerita, acara dan bagian undangan dapat ditinjau pada editor contoh.",
  ],
  [
    "Bagaimana tamu mengonfirmasi kehadiran?",
    "Undangan menampilkan formulir RSVP. Integrasi penyimpanan respons belum tersedia pada versi pratinjau.",
  ],
  [
    "Apakah pembayaran sudah tersedia?",
    "Harga pada pratinjau merupakan contoh. Pembayaran komersial belum diaktifkan.",
  ],
  [
    "Apakah data saya terlindungi?",
    "Pratinjau memakai data sintetis. Jangan memasukkan informasi pribadi atau data rekening nyata.",
  ],
];
export function FaqSection({ searchable = false }: { searchable?: boolean }) {
  const [q, setQ] = useState("");
  return (
    <section className="section container faq">
      <p className="eyebrow">KAMI DI SINI UNTUK MEMBANTU</p>
      <h2>{searchable ? "Pertanyaan yang Sering Diajukan" : "Hal yang Sering Ditanyakan"}</h2>
      {searchable && (
        <label>
          Cari pertanyaan
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari pertanyaan..."
          />
        </label>
      )}
      {questions
        .filter(([a, b]) => (a + b).toLowerCase().includes(q.toLowerCase()))
        .map(([a, b]) => (
          <details key={a}>
            <summary>{a}</summary>
            <p>{b}</p>
          </details>
        ))}
    </section>
  );
}
