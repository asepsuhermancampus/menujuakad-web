import Link from "next/link";
import { buttonClassName } from "@/components/ui/button";

/*
 * Halaman 404 mengikuti desain ERR-404/500 (Horizon Modern Style):
 * kode status + judul + penjelasan + dua aksi + blok bantuan.
 * Versi 500 ditangani `error.tsx` dengan pola visual yang sama.
 */
export default function NotFound() {
  return (
    <main id="main" className="status-page container error-page">
      <p className="error-code" aria-hidden="true">
        HTTP 404
      </p>
      <p className="eyebrow">STATUS 404 — HALAMAN TIDAK DITEMUKAN</p>
      <h1>Halaman yang Anda cari sedang berada di tempat lain</h1>
      <p className="muted">
        Alamat tautan yang Anda tuju mungkin telah dipindahkan, tautan undangan telah kedaluwarsa,
        atau terjadi salah ketik URL saat membuka halaman ini.
      </p>
      <div className="actions error-actions">
        <Link href="/" className={buttonClassName()}>
          Kembali ke beranda
        </Link>
        <Link href="/templates" className={buttonClassName("secondary")}>
          Cari desain di katalog
        </Link>
      </div>

      <section className="error-help">
        <h2>Menghadapi kendala teknis dengan undangan Anda?</h2>
        <p className="muted">
          Kanal bantuan resmi belum diaktifkan. Sementara itu, Anda dapat memeriksa panduan atau
          membuka portal undangan.
        </p>
        <div className="grid-three">
          <article className="card">
            <h3>Buku Panduan</h3>
            <p>Pelajari cara mengisi konfirmasi kehadiran dan hadiah digital pada pratinjau.</p>
            <Link href="/how-it-works">Buka panduan →</Link>
          </article>
          <article className="card">
            <h3>Portal Undangan</h3>
            <p>Masuk ke ruang dashboard untuk mengelola undangan uji Anda.</p>
            <Link href="/login">Masuk ke akun →</Link>
          </article>
          <article className="card">
            <h3>Status Layanan</h3>
            <p>
              Seluruh layanan utama beroperasi normal pada lingkungan pratinjau. Kanal concierge
              belum tersedia.
            </p>
            <Link href="/contact">Lihat halaman bantuan →</Link>
          </article>
        </div>
      </section>
    </main>
  );
}
