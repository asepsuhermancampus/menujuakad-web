const terms = [
  [
    "Ruang lingkup",
    "Situs ini sedang dalam tahap pratinjau UI. Tampilan akun, editor dan pembayaran tidak menyatakan layanan komersial sudah aktif.",
  ],
  [
    "Akun dan konten",
    "Akun nyata belum dapat dibuat. Jangan memasukkan data rahasia, data tamu asli atau informasi rekening ke formulir contoh.",
  ],
  [
    "Pembayaran",
    "Harga dan kuota yang ditampilkan pada pratinjau merupakan ilustrasi. Tidak ada pembayaran atau hak akses yang diterbitkan dari interaksi lokal.",
  ],
  [
    "Ketersediaan",
    "Interaksi contoh tidak disimpan di server dan dapat hilang setelah memuat ulang halaman.",
  ],
  [
    "Ketentuan layanan",
    "Kebijakan komersial, pembatalan dan operasional akan ditetapkan sebelum layanan diaktifkan.",
  ],
];
const privacy = [
  [
    "Data pada pratinjau",
    "Nama, alamat email dan detail undangan yang ditampilkan berasal dari fixture sintetis.",
  ],
  [
    "Formulir lokal",
    "Form contoh hanya melakukan validasi atau perubahan di memori browser. Jangan memasukkan informasi pribadi.",
  ],
  [
    "Layanan eksternal",
    "Integrasi database, autentikasi, penyimpanan, email dan pembayaran belum diaktifkan dalam lingkup slicing ini.",
  ],
  [
    "Penyimpanan",
    "Perubahan UI contoh tidak menjadi catatan akun dan reset ketika halaman dimuat ulang.",
  ],
  [
    "Kebijakan final",
    "Dasar pemrosesan, masa retensi, hak pengguna dan kanal kontak akan ditetapkan sebelum pengumpulan data layanan dimulai.",
  ],
];
export function LegalDocument({ privacyMode = false }: { privacyMode?: boolean }) {
  const sections = privacyMode ? privacy : terms;
  return (
    <section className="container section">
      <p className="eyebrow">INFORMASI PLATFORM · DRAF PRATINJAU</p>
      <h1>
        {privacyMode
          ? "Kebijakan Privasi & Perlindungan Data"
          : "Syarat & Ketentuan Penggunaan Platform"}
      </h1>
      <p className="notice">
        Dokumen draf untuk versi pratinjau. Kebijakan operasional final belum diterbitkan.
      </p>
      <div className="legal-layout">
        <aside aria-label="Daftar isi">
          {sections.map(([title], i) => (
            <a href={`#legal-${i}`} key={title}>
              {i + 1}. {title}
            </a>
          ))}
        </aside>
        <div className="legal-copy card">
          {sections.map(([title, body], i) => (
            <section id={`legal-${i}`} key={title}>
              <h2>
                {i + 1}. {title}
              </h2>
              <p>{body}</p>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
