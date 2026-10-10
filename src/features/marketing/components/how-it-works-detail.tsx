import Link from "next/link";
import { CallToAction } from "./call-to-action";

/*
 * Struktur mengikuti desain PUB-06 (Horizon Modern Style): hero + 6 langkah
 * + estimasi waktu + perbandingan konvensional vs digital.
 *
 * Klaim pada desain sumber ("15 menit", "30+ tipografi", "hemat 80%",
 * "Rp4–15 juta", "uptime 99,98%", "bank-grade 256-bit") BELUM resmi untuk
 * Menuju Akad. Angka di halaman ini diganti label contoh dan penjelasan
 * pratinjau; jangan mengembalikan klaim pemasaran tanpa sumber resmi.
 */

const steps = [
  {
    number: "01",
    label: "Langkah Awal",
    title: "Pilih Desain & Tema",
    body: "Jelajahi katalog desain contoh dan bandingkan gaya editorial yang tersedia. Pratinjau tampilan dapat dibuka langsung tanpa akun.",
    note: "Katalog contoh — jumlah tema resmi belum ditetapkan",
    href: "/templates",
    action: "Jelajahi desain",
  },
  {
    number: "02",
    label: "Detail Acara",
    title: "Isi Data Mempelai & Acara",
    body: "Lengkapi profil pasangan, susunan waktu akad dan resepsi, serta lokasi acara melalui wizard data contoh.",
    note: "Data contoh — belum tersimpan permanen",
    href: "/preview-ui/cus-03",
    action: "Coba wizard",
  },
  {
    number: "03",
    label: "Media & Rasa",
    title: "Kurasi Foto & Musik",
    body: "Tinjau bagian galeri dan musik latar pada editor modular. Unggah media nyata belum aktif pada versi pratinjau.",
    note: "Unggah media belum aktif",
    href: "/preview-ui/edt-06",
    action: "Lihat editor galeri",
  },
  {
    number: "04",
    label: "Otomasi Tamu",
    title: "Manajemen Daftar Tamu",
    body: "Tambah, kelompokkan, dan tinjau daftar tamu pada contoh. Impor massal dan sinkronisasi kontak belum terhubung.",
    note: "Impor belum aktif — data contoh",
    href: "/preview-ui/gst-01",
    action: "Lihat manajemen tamu",
  },
  {
    number: "05",
    label: "Validasi",
    title: "Pratinjau & Periksa Kesiapan",
    body: "Uji tampilan undangan pada beberapa lebar layar dan periksa daftar kesiapan sebelum menerbitkan. Pembayaran belum aktif.",
    note: "Pembayaran komersial belum aktif",
    href: "/preview-ui/edt-08",
    action: "Periksa contoh",
  },
  {
    number: "06",
    label: "Siap Meluncur",
    title: "Sebar Tautan Personal",
    body: "Bagikan undangan melalui tautan. Pada pratinjau, undangan belum diterbitkan sehingga tautan hanya membuka halaman contoh.",
    note: "Penerbitan belum tersedia",
    href: "/preview-ui/inv-02",
    action: "Lihat undangan contoh",
  },
] as const;

const comparison = [
  {
    icon: "⏱",
    title: "Kecepatan Rilis",
    conventional: "Hitungan minggu — cetak, antrean vendor, dan pengiriman pos.",
    digital: "Perubahan dapat disiapkan dari dashboard dan dibagikan sebagai tautan.",
    badge: "Rencana fitur",
  },
  {
    icon: "✓",
    title: "Fleksibilitas RSVP",
    conventional: "Konfirmasi manual lewat telepon; rekap mudah tercecer.",
    digital: "Formulir RSVP digital dengan rekap terpusat direncanakan.",
    badge: "Belum tersimpan",
  },
  {
    icon: "◎",
    title: "Biaya & Efisiensi",
    conventional: "Biaya per lembar cetak ditambah ongkos kirim.",
    digital: "Harga paket resmi belum ditetapkan; angka pratinjau hanya contoh.",
    badge: "Harga belum resmi",
  },
  {
    icon: "❧",
    title: "Kelestarian",
    conventional: "Menghasilkan limbah kertas dan laminasi.",
    digital: "Undangan digital mengurangi cetak fisik ketika sudah aktif.",
    badge: "Prinsip produk",
  },
] as const;

export function HowItWorksDetail() {
  return (
    <>
      <section className="container section how-hero">
        <p className="eyebrow">PANDUAN LANGKAH MUDAH</p>
        <h1>6 Langkah Menuju Hari Bahagia</h1>
        <p className="muted">
          Rangkai undangan pernikahan digital bergaya editorial dalam alur yang jelas. Halaman ini
          menjelaskan urutan kerjanya; fitur yang belum aktif ditandai jujur pada setiap langkah.
        </p>
        <ul className="how-badges">
          <li>Pratinjau tanpa akun komersial</li>
          <li>Tampilan mobile diperiksa</li>
          <li>Alur data contoh</li>
        </ul>
      </section>

      <section className="container section how-steps">
        <h2 className="section-heading">Alur Kerja Sistematis</h2>
        <p className="muted">
          Dirancang untuk merangkum persiapan undangan menjadi langkah yang mudah diikuti.
        </p>
        <div className="how-step-grid">
          {steps.map((step) => (
            <article className="how-step-card" key={step.number}>
              <header>
                <span className="step-number" aria-hidden="true">
                  {step.number}
                </span>
                <span className="eyebrow">{step.label}</span>
              </header>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
              <span className="badge">{step.note}</span>
              <Link href={step.href}>{step.action} →</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="container section">
        <h2 className="section-heading">Estimasi Waktu Persiapan</h2>
        <p className="muted">
          Durasi di bawah adalah ilustrasi alur pratinjau, bukan jaminan waktu layanan. Waktu nyata
          bergantung pada kelengkapan data dan status fitur.
        </p>
        <div className="how-timing card">
          <div>
            <p className="eyebrow">TOTAL WAKTU PRATINJAU</p>
            <strong className="how-timing-total">kurang dari 30 menit</strong>
            <p className="muted">Perkiraan menjelajah seluruh alur contoh pada pratinjau</p>
          </div>
          <ul>
            <li>
              <span>Meninjau desain</span>
              <strong>~5 menit</strong>
            </li>
            <li>
              <span>Mengisi data contoh</span>
              <strong>~6 menit</strong>
            </li>
            <li>
              <span>Memeriksa pratinjau</span>
              <strong>~4 menit</strong>
            </li>
          </ul>
        </div>
      </section>

      <section className="container section">
        <h2 className="section-heading">Undangan Konvensional vs Standar Digital</h2>
        <p className="muted">
          Perbandingan berikut menjelaskan arah produk. Angka penghematan belum diverifikasi karena
          harga resmi belum ditetapkan.
        </p>
        <div className="grid-two how-compare">
          {comparison.map((row) => (
            <article className="card how-compare-card" key={row.title}>
              <span className="how-compare-icon" aria-hidden="true">
                {row.icon}
              </span>
              <h3>{row.title}</h3>
              <dl>
                <dt>Konvensional</dt>
                <dd>{row.conventional}</dd>
                <dt>Menuju Akad</dt>
                <dd>{row.digital}</dd>
              </dl>
              <span className="badge">{row.badge}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="container section">
        <h2>Informasi dalam Satu Tempat</h2>
        <div className="grid-two">
          <article className="card">
            <h3>Pesan Terpisah</h3>
            <p>Detail acara dan konfirmasi tersebar di beberapa percakapan.</p>
          </article>
          <article className="card">
            <h3>Undangan Terstruktur</h3>
            <p>
              Rancangan mengumpulkan cerita, acara, dan respons dalam satu pengalaman. Respons tamu
              pada pratinjau tidak disimpan; penyimpanan draft akun uji terpisah dari simulasi ini.
            </p>
          </article>
        </div>
      </section>
      <CallToAction />
    </>
  );
}
