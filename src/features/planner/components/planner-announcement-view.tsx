"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon, type IconName } from "@/components/ui/icon";

/*
 * PLN-17 — Pengumuman Rilis & Fitur Baru Planner (Horizon Modern Style).
 *
 * PENTING — perbedaan sadar dari gambar desain: desain sumber menjanjikan
 * "ekspor otomatis 12 dokumen cetak PDF 300 DPI", "enkripsi multi-tingkat",
 * "sinkronisasi cloud normal", dan "100% data aman". Tidak satu pun dapat
 * dibuktikan aplikasi ini — ekspor PDF, sinkronisasi pasangan, dan enkripsi
 * cloud belum diimplementasikan. Pengumuman ini karena itu menyebut modul
 * yang memang sudah ada sebagai pratinjau, dan menandai yang belum aktif.
 */

type AnnouncementFeature = Readonly<{
  icon: IconName;
  title: string;
  body: string;
  foot: string;
  href: string;
  available: boolean;
}>;

const features: readonly AnnouncementFeature[] = [
  {
    icon: "inventory",
    title: "Wedding Kit Digital (PLN-14)",
    body: "Katalog kebutuhan cetak dan perlengkapan acara tersusun per kategori pada data contoh.",
    foot: "Pratinjau · ekspor PDF belum aktif",
    href: "/dashboard/planner/wedding-kit",
    available: true,
  },
  {
    icon: "shield",
    title: "Kolaborasi Pasangan (PLN-15)",
    body: "Halaman kolaborasi menampilkan peran anggota dan undangan bergabung sebagai contoh.",
    foot: "Pratinjau · sinkronisasi belum aktif",
    href: "/dashboard/planner/couple",
    available: true,
  },
  {
    icon: "schedule",
    title: "Rangkaian Lamaran (PLN-12)",
    body: "Rencana lamaran dengan susunan acara dan daftar persiapan pada data contoh.",
    foot: "Pratinjau · belum tersimpan",
    href: "/dashboard/planner/engagement",
    available: true,
  },
] as const;

export function PlannerAnnouncementView() {
  const [dismissed, setDismissed] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  if (dismissed) {
    return (
      <section className="announce-empty">
        <p className="eyebrow">PENGUMUMAN</p>
        <h1>Pengumuman Rilis &amp; Fitur Baru Planner</h1>
        <p>Pengumuman ini sudah ditutup untuk sesi ini.</p>
        <button type="button" className="button secondary" onClick={() => setDismissed(false)}>
          Tampilkan kembali
        </button>
      </section>
    );
  }

  return (
    <section className="announce-shell">
      <article className="announce-card">
        <header className="announce-head">
          <p className="announce-pill">
            <Icon name="sparkle" size={14} />
            <span>Pembaruan Modul Perencanaan</span>
          </p>
          <button
            type="button"
            className="announce-close"
            aria-label="Tutup pengumuman"
            onClick={() => setDismissed(true)}
          >
            <Icon name="delete" size={18} />
          </button>
        </header>

        <h1>Kelola Perencanaan Pernikahan Lebih Terstruktur</h1>
        <p className="announce-lead">
          Modul perencanaan kini mencakup tabungan, anggaran, pengeluaran, tugas, rundown, vendor,
          seserahan, persyaratan, lamaran, moodboard, wedding kit, dan kolaborasi pasangan.
        </p>

        <div className="announce-grid">
          {features.map((feature) => (
            <article className="announce-feature" key={feature.title}>
              <span className="announce-feature-icon" aria-hidden="true">
                <Icon name={feature.icon} size={22} />
              </span>
              <h2>{feature.title}</h2>
              <p>{feature.body}</p>
              <footer>
                <Link href={feature.href}>
                  <span>Buka modul</span>
                  <Icon name="arrow-forward" size={14} />
                </Link>
                <small>{feature.foot}</small>
              </footer>
            </article>
          ))}
        </div>

        {/*
         * Blok status jujur menggantikan klaim "100% Data Aman" pada desain.
         */}
        <div className="announce-status">
          <Icon name="shield" size={18} />
          <div>
            <strong>Status penyimpanan</strong>
            <p>
              Modul perencanaan masih menampilkan data contoh. Belum ada penyimpanan, sinkronisasi
              pasangan, enkripsi cloud, atau ekspor dokumen yang aktif. Jangan memasukkan data
              pribadi nyata.
            </p>
          </div>
        </div>

        <footer className="announce-actions">
          <Link href="/dashboard/planner">
            <span>Jelajahi modul perencanaan</span>
            <Icon name="arrow-forward" size={16} />
          </Link>
          <button
            type="button"
            className="button"
            onClick={() => setNotice("Pengumuman ditandai sudah dibaca pada sesi ini (contoh).")}
          >
            Tandai sudah dibaca
          </button>
        </footer>

        {notice && (
          <p className="notice" role="status">
            {notice}
          </p>
        )}
      </article>
    </section>
  );
}
