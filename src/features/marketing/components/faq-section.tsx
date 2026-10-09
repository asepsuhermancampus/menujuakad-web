"use client";
import { useState } from "react";
const questions = [
  [
    "Bagaimana cara membuat undangan?",
    "Pilih desain, lengkapi cerita kalian, lalu tinjau tampilan undangan. Saat ini editor dapat dicoba melalui pratinjau data contoh.",
  ],
  [
    "Apakah saya bisa masuk atau mendaftar?",
    "Halaman /login digunakan untuk akun uji yang disediakan. Pendaftaran publik, Google dan pemulihan kata sandi belum tersedia; form pada preview hanya simulasi.",
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
    "Harga pada pratinjau merupakan contoh. QRIS statis hanya untuk pengujian setelah login; persetujuan TEST tidak berarti PAID dan tidak memberi hak paket atau penerbitan. Mayar dan pembayaran komersial belum aktif.",
  ],
  [
    "Apakah data saya terlindungi?",
    "Preview memakai data sintetis. Login akun uji memproses email dan kata sandi, sedangkan draft uji dapat disimpan di server. Gunakan data contoh pada workspace; jangan masukkan data tamu asli atau informasi rekening ke form simulasi.",
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
