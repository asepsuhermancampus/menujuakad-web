"use client";
import Link from "next/link";
import { useState } from "react";
import { packagesFixture } from "@/features/design-preview/data/fixtures";
import { formatIdr } from "../../lib/presentation";
import { PackageCard } from "./package-card";

export function PackageSelectionPreview() {
  const [selectedId, setSelectedId] = useState(
    packagesFixture.find((p) => p.recommended)?.id ?? "",
  );
  const selected = packagesFixture.find((p) => p.id === selectedId);
  return (
    <div className="billing stack" data-billing="packages">
      <header className="billing-centered">
        <span className="badge">Edisi editorial — data contoh</span>
        <h1>Pilih Paket Penerbitan & Masa Aktif</h1>
        <p>
          Pilih komposisi sesuai kebutuhan hari kalian. Harga, kuota, dan masa aktif belum menjadi
          penawaran komersial.
        </p>
        <span className="billing-pill">Pembayaran satu kali · contoh tampilan</span>
      </header>
      <div className="billing-packages">
        {packagesFixture.map((plan) => (
          <PackageCard
            key={plan.id}
            plan={plan}
            selected={selectedId === plan.id}
            onSelect={() => setSelectedId(plan.id)}
          />
        ))}
      </div>
      <p className="notice" role="status">
        Pilihan lokal: {selected?.name ?? "Belum dipilih"}{" "}
        {selected && formatIdr(selected.amountIdr)}. Tidak membuat order atau mengaktifkan paket.
      </p>
      <section className="billing-centered">
        <p className="billing-eyebrow">Matriks komparasi</p>
        <h2>Perbandingan Rincian Fitur</h2>
        <p>Spesifikasi contoh untuk meninjau desain paket.</p>
      </section>
      <div
        className="billing-table-scroll"
        role="region"
        aria-label="Perbandingan paket contoh"
        tabIndex={0}
      >
        <table>
          <caption className="sr-only">Kuota dan fitur paket contoh</caption>
          <thead>
            <tr>
              <th>Spesifikasi & kapasitas</th>
              {packagesFixture.map((p) => (
                <th key={p.id} scope="col">
                  {p.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="billing-group">
              <th colSpan={4}>Distribusi & media contoh</th>
            </tr>
            <tr>
              <th scope="row">Kuota tamu</th>
              {packagesFixture.map((p) => (
                <td key={p.id}>{p.guestLimit}</td>
              ))}
            </tr>
            <tr>
              <th scope="row">Kapasitas galeri</th>
              {packagesFixture.map((p) => (
                <td key={p.id}>{p.galleryLimit} foto</td>
              ))}
            </tr>
            <tr className="billing-group">
              <th colSpan={4}>Komposisi fitur contoh</th>
            </tr>
            <tr>
              <th scope="row">Pilihan fitur</th>
              {packagesFixture.map((p) => (
                <td key={p.id}>{p.features.join(" · ")}</td>
              ))}
            </tr>
            <tr>
              <th scope="row">Pembayaran / publikasi</th>
              {packagesFixture.map((p) => (
                <td key={p.id}>Belum aktif</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <section className="billing-faq">
        <div className="billing-centered">
          <p className="billing-eyebrow">Pusat informasi</p>
          <h2>Pertanyaan Mengenai Penerbitan</h2>
        </div>
        <div className="billing-packages">
          {[
            ["Apakah harga ini resmi?", "Seluruh nominal merupakan harga contoh untuk review UI."],
            [
              "Kapan paket akan aktif?",
              "Preview tidak melakukan pembayaran atau aktivasi. Integrasi layanan belum tersedia.",
            ],
            [
              "Apakah pilihan disimpan?",
              "Pilihan hanya ada pada halaman ini dan tidak disimpan ke akun.",
            ],
          ].map(([title, copy]) => (
            <details className="billing-panel" key={title}>
              <summary>{title}</summary>
              <p>{copy}</p>
            </details>
          ))}
        </div>
      </section>
      <aside className="billing-panel billing-help">
        <div>
          <h3>Butuh panduan?</h3>
          <p>
            Checkout ilustratif menggunakan order Signature, terpisah dari pilihan lokal di atas.
          </p>
        </div>
        <Link className="button secondary" href="/preview-ui/cus-08">
          Lihat checkout contoh Signature
        </Link>
      </aside>
    </div>
  );
}
