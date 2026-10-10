"use client";
import { useMemo, useState } from "react";

/*
 * Konten FAQ mengikuti struktur desain PUB-07 (Horizon Modern Style):
 * hero + pencarian + kategori + accordion + blok bantuan.
 *
 * Klaim pada desain sumber (durasi "15 menit", "30+ tipografi", harga paket,
 * jaminan enkripsi, angka pelanggan) BELUM resmi untuk Menuju Akad. Semua
 * angka/klaim di bawah sudah diselaraskan dengan status pratinjau yang jujur:
 * tanpa harga resmi, tanpa SLA, tanpa klaim sertifikasi. Jangan mengembalikan
 * klaim pemasaran dari desain tanpa bukti.
 */

type FaqItem = Readonly<{ q: string; a: string; category: FaqCategory }>;
type FaqCategory = "MULAI" | "PEMBAYARAN" | "TAMU" | "PRIVASI";

const categoryLabels: Readonly<Record<FaqCategory, string>> = {
  MULAI: "Memulai & Desain",
  PEMBAYARAN: "Pembayaran & Paket",
  TAMU: "Tamu & RSVP Digital",
  PRIVASI: "Masa Aktif & Privasi",
};

export const faqItems: readonly FaqItem[] = [
  {
    category: "MULAI",
    q: "Bagaimana cara membuat undangan?",
    a: "Pilih desain dari katalog, lengkapi data pasangan dan acara, lalu tinjau tampilan undangan. Pada versi pratinjau, seluruh alur ini dapat dicoba memakai data contoh tanpa akun komersial.",
  },
  {
    category: "MULAI",
    q: "Apakah saya bisa masuk atau mendaftar sekarang?",
    a: "Halaman /login hanya untuk akun uji yang disediakan tim. Pendaftaran publik, masuk dengan Google, dan pemulihan kata sandi belum dibuka; form pada pratinjau bersifat simulasi.",
  },
  {
    category: "MULAI",
    q: "Apakah desain dapat disesuaikan?",
    a: "Judul, pasangan, cerita, acara, dan bagian undangan dapat ditinjau pada editor contoh. Jumlah tema, tipografi, dan palet resmi belum ditetapkan sehingga katalog masih menampilkan contoh.",
  },
  {
    category: "TAMU",
    q: "Bagaimana tamu mengonfirmasi kehadiran?",
    a: "Undangan menampilkan formulir RSVP pada pratinjau. Penyimpanan respons tamu dan rekap kuota belum aktif, sehingga jawaban tidak dikirim atau disimpan di server.",
  },
  {
    category: "TAMU",
    q: "Apakah nama tamu bisa berbeda untuk setiap orang?",
    a: "Tautan personal per tamu termasuk dalam rencana pengembangan. Pada pratinjau, sapaan tamu memakai data contoh dan belum ada generator tautan yang berjalan.",
  },
  {
    category: "TAMU",
    q: "Apakah tamu bisa mengirim kado atau amplop digital?",
    a: "Bagian hadiah menampilkan contoh tampilan. Rekening dan QRIS belum terhubung ke layanan pembayaran, dan dana tidak dapat dikirim melalui pratinjau ini.",
  },
  {
    category: "PEMBAYARAN",
    q: "Apakah pembayaran sudah tersedia?",
    a: "Belum. Harga pada pratinjau adalah contoh. QRIS statis hanya untuk pengujian setelah login; persetujuan TEST tidak berarti PAID dan tidak memberi hak paket atau penerbitan. Integrasi pembayaran komersial belum aktif.",
  },
  {
    category: "PEMBAYARAN",
    q: "Paket apa saja yang akan tersedia?",
    a: "Susunan paket, harga, durasi aktif, dan batas fitur masih dalam perencanaan. Informasi pada halaman paket pratinjau diberi label contoh agar tidak dianggap penawaran resmi.",
  },
  {
    category: "PRIVASI",
    q: "Bagaimana masa aktif undangan setelah acara?",
    a: "Kebijakan masa aktif belum ditetapkan. Undangan pada pratinjau tidak diterbitkan, sehingga tidak ada masa aktif yang berjalan.",
  },
  {
    category: "PRIVASI",
    q: "Apakah data tamu dan nomor kontak aman?",
    a: "Pratinjau memakai data sintetis. Login akun uji memproses email dan kata sandi, sedangkan draft uji dapat disimpan di server. Gunakan data contoh pada workspace; jangan memasukkan data tamu asli atau informasi rekening ke form simulasi.",
  },
  {
    category: "PRIVASI",
    q: "Bisakah jadwal atau lokasi diubah setelah dibagikan?",
    a: "Perubahan data undangan termasuk dalam rencana fitur. Pada pratinjau, perubahan hanya tersimpan sebagai draft uji dan tidak memengaruhi undangan yang sudah dibagikan karena publikasi belum tersedia.",
  },
];

function FaqAccordion({ items }: { items: readonly FaqItem[] }) {
  return (
    <div className="faq-list">
      {items.map((item) => (
        <details key={item.q} className="faq-item">
          <summary>
            <span>{item.q}</span>
            <span aria-hidden="true" className="faq-chevron">
              ⌄
            </span>
          </summary>
          <p>{item.a}</p>
        </details>
      ))}
    </div>
  );
}

export function FaqSection({ searchable = false }: { searchable?: boolean }) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<FaqCategory | "ALL">("ALL");

  const filtered = useMemo(
    () =>
      faqItems.filter((item) => {
        const matchesCategory = activeCategory === "ALL" || item.category === activeCategory;
        const matchesQuery = (item.q + item.a).toLowerCase().includes(query.trim().toLowerCase());
        return matchesCategory && matchesQuery;
      }),
    [query, activeCategory],
  );

  return (
    <section className="section container faq">
      <h2 className={searchable ? "sr-only" : undefined}>
        {searchable ? "Daftar pertanyaan" : "Hal yang Sering Ditanyakan"}
      </h2>

      {searchable && (
        <>
          <label className="faq-search">
            Cari pertanyaan
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Contoh: pembayaran, RSVP, data tamu"
            />
          </label>

          <div className="faq-categories" role="group" aria-label="Kategori pertanyaan">
            {(["ALL", "MULAI", "PEMBAYARAN", "TAMU", "PRIVASI"] as const).map((key) => (
              <button
                key={key}
                type="button"
                className="faq-chip"
                aria-pressed={activeCategory === key}
                onClick={() => setActiveCategory(key)}
              >
                {key === "ALL" ? "Semua Pertanyaan" : categoryLabels[key]}
              </button>
            ))}
          </div>
        </>
      )}

      {filtered.length === 0 ? (
        <p className="notice" role="status">
          Tidak ada pertanyaan yang cocok dengan pencarian Anda. Coba kata kunci lain atau hubungi
          concierge.
        </p>
      ) : (
        <FaqAccordion items={filtered} />
      )}
    </section>
  );
}
