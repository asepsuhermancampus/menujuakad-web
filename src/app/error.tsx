"use client";

import Link from "next/link";
import { Button, buttonClassName } from "@/components/ui/button";

/*
 * Halaman 500 mengikuti pola desain ERR-404/500 (Horizon Modern Style).
 * Tidak ada klaim "uptime 99,98%" atau status layanan dari desain sumber;
 * pesan di bawah menjelaskan kondisi sebenarnya dan menawarkan pemulihan.
 */
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="status-page container error-page">
      <p className="error-code" aria-hidden="true">
        HTTP 500
      </p>
      <p className="eyebrow">STATUS 500 — GANGGUAN SEMENTARA</p>
      <h1>Halaman belum dapat ditampilkan saat ini</h1>
      <p className="muted">
        Terjadi gangguan sementara pada halaman ini. Data Anda tidak terpengaruh. Coba muat kembali,
        atau kembali ke beranda bila masalah berlanjut.
      </p>
      <div className="actions error-actions">
        <Button onClick={reset}>Coba lagi</Button>
        <Link href="/" className={buttonClassName("secondary")}>
          Kembali ke beranda
        </Link>
      </div>

      <section className="error-help">
        <h2>Butuh bantuan lain?</h2>
        <p className="muted">
          Kanal bantuan resmi belum diaktifkan. Halaman panduan dan katalog tetap dapat dibuka.
        </p>
        <div className="grid-three">
          <article className="card">
            <h3>Buku Panduan</h3>
            <p>Pelajari alur pratinjau dan langkah penggunaan.</p>
            <Link href="/how-it-works">Buka panduan →</Link>
          </article>
          <article className="card">
            <h3>Katalog Desain</h3>
            <p>Telusuri desain contoh yang tersedia pada pratinjau.</p>
            <Link href="/templates">Lihat katalog →</Link>
          </article>
          <article className="card">
            <h3>Halaman Bantuan</h3>
            <p>Tinjau kanal bantuan yang direncanakan.</p>
            <Link href="/contact">Lihat bantuan →</Link>
          </article>
        </div>
      </section>
    </main>
  );
}
