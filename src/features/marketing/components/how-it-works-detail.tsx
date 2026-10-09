import Link from "next/link";
import { CallToAction } from "./call-to-action";
const steps = [
  [
    "01",
    "Temukan Desain Kalian",
    "Pilih karakter visual yang selaras dengan cerita kalian.",
    "/templates",
    "Jelajahi desain",
  ],
  [
    "02",
    "Tinjau Pendaftaran",
    "Pendaftaran ini hanya simulasi. Login akun uji yang disediakan berada di /login.",
    "/preview-ui/aut-02",
    "Tinjau simulasi",
  ],
  [
    "03",
    "Kenalkan Pasangan",
    "Lengkapi nama dan informasi awal melalui wizard data contoh.",
    "/preview-ui/cus-03",
    "Coba wizard",
  ],
  [
    "04",
    "Rangkai Cerita & Acara",
    "Susun kisah, tanggal acara, dan galeri melalui editor modular.",
    "/preview-ui/edt-01",
    "Jelajahi editor",
  ],
  [
    "05",
    "Tinjau Detail & Paket",
    "Periksa isi undangan dan opsi paket ilustratif sebelum siap dibagikan.",
    "/preview-ui/edt-08",
    "Periksa contoh",
  ],
  [
    "06",
    "Tinjau Undangan untuk Tamu",
    "Buka preview undangan. Penerbitan dan respons nyata masih belum terhubung.",
    "/preview-ui/inv-02",
    "Lihat undangan",
  ],
];
export function HowItWorksDetail() {
  return (
    <>
      <section className="container section cta">
        <p className="eyebrow">SETIAP DETAIL PUNYA TEMPAT</p>
        <h1>Dari Cerita Menjadi Undangan</h1>
        <p>Enam langkah untuk menyiapkan hari istimewa kalian.</p>
      </section>
      <section className="container stack how-detail">
        {steps.map(([number, title, body, href, action], index) => (
          <article className={`how-step ${index % 2 ? "how-step-reverse" : ""}`} key={number}>
            <div>
              <span className="step-number">{number}</span>
              <h2>{title}</h2>
              <p>{body}</p>
              <Link href={href}>{action} →</Link>
            </div>
            <div className="how-ui card" aria-label={`Ilustrasi langkah ${number}`}>
              <span className="eyebrow">MENUJU AKAD · ILUSTRASI UI</span>
              <h3>{title}</h3>
              <div className="how-ui-line" />
              <div className="how-ui-line short" />
              <div className="grid-two">
                <span className="how-ui-tile">{number}</span>
                <span className="how-ui-tile">Contoh</span>
              </div>
              <span className="badge">Perubahan lokal</span>
            </div>
          </article>
        ))}
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
              pada preview tidak disimpan; penyimpanan draft akun uji terpisah dari simulasi ini.
            </p>
          </article>
        </div>
      </section>
      <CallToAction />
    </>
  );
}
