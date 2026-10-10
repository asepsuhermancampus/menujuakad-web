"use client";
import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { InvitationMedia } from "@/components/shared/invitation-media";
import { invitationFixture } from "@/features/design-preview/data/fixtures";
import { InvitationSections } from "./invitation-sections";

/*
 * INV-01 — Cover Undangan (Horizon Modern Style).
 *
 * Susunan mengikuti desain: bingkai tipis di tepi layar, kepala dengan monogram
 * dan lencana tautan privat, kartu sampul berisi monogram pasangan, nama,
 * ilustrasi, baris tanggal/lokasi, blok "Kepada Yth.", lalu tombol Buka
 * Undangan.
 *
 * Catatan kejujuran: desain sumber memuat lencana "Tautan Eksklusif &
 * Terenkripsi" dan "Musik Latar: Clair de Lune". Tidak ada enkripsi tautan
 * khusus maupun audio berlisensi pada pratinjau ini, sehingga keduanya diganti
 * penanda contoh yang tidak mengklaim hal tersebut. Nama tamu diambil dari
 * fixture sintetis, bukan data orang nyata.
 *
 * Kontrak pengujian yang dipertahankan: tombol "Buka Undangan" ada pada state
 * normal dan TIDAK ada pada state tautan tidak valid.
 */

/** Inisial pasangan untuk monogram, mis. "Sarah & Dimas" → "S&D". */
function monogram(title: string) {
  const parts = title.split(/[&]/).map((part) => part.trim());
  if (parts.length < 2) return title.slice(0, 2).toUpperCase();
  return `${parts[0].slice(0, 1)}&${parts[1].slice(0, 1)}`.toUpperCase();
}

export function InvitationView({
  opened = false,
  invalid = false,
}: {
  opened?: boolean;
  invalid?: boolean;
}) {
  const [isOpen, setOpen] = useState(opened);

  if (invalid)
    return (
      <div className="invitation-canvas">
        <section className="invitation-cover invitation-cover-invalid">
          <span className="invitation-seal" aria-hidden="true">
            <Icon name="shield" size={22} />
          </span>
          <p className="aura-label">Menuju Akad</p>
          <h1>Tautan Undangan Tidak Dapat Ditemukan</h1>
          <p>
            Tautan contoh ini tidak valid. Periksa kembali alamat atau hubungi pengirim undangan.
          </p>
          <Link className="button" href="/">
            Kembali ke Beranda
          </Link>
          <small>Menuju Akad · data contoh</small>
        </section>
      </div>
    );

  return (
    <div className="invitation-canvas">
      {isOpen ? (
        <>
          <article className="invitation-document">
            <InvitationSections />
          </article>
          <nav className="invitation-nav" aria-label="Bagian undangan">
            <a href="#pasangan">Pasangan</a>
            <a href="#acara">Acara</a>
            <a href="#galeri">Galeri</a>
            <a href="#rsvp">RSVP</a>
            <a href="#hadiah">Hadiah</a>
          </nav>
        </>
      ) : (
        <>
          <header className="invitation-head">
            <span className="invitation-head-brand">
              <Icon name="favorite" size={16} />
              <span>INV-01 · Undangan privat</span>
            </span>
            {/* Lencana kejujuran menggantikan klaim "Terenkripsi" pada desain. */}
            <span className="invitation-head-badge">
              <Icon name="visibility" size={14} />
              <span>Pratinjau · data contoh</span>
            </span>
          </header>

          <main className="invitation-cover">
            <div className="invitation-cover-top">
              <span className="invitation-seal" aria-hidden="true">
                {monogram(invitationFixture.title)}
              </span>
              <p className="aura-label">The wedding celebration of</p>
              <div className="invitation-rule" aria-hidden="true" />
              <h1>{invitationFixture.title}</h1>
              <p className="invitation-partners">
                {invitationFixture.partnerOne} &amp; {invitationFixture.partnerTwo}
              </p>
            </div>

            <figure className="invitation-figure">
              <InvitationMedia portrait />
              <figcaption>
                <span>Akad &amp; resepsi</span>
                <span>Data ilustrasi</span>
              </figcaption>
            </figure>

            <div className="invitation-meta">
              <span>
                <Icon name="schedule" size={16} />
                <span>Sabtu, 12 Desember 2026</span>
              </span>
              <span className="invitation-meta-dot" aria-hidden="true" />
              <span>
                <Icon name="schedule" size={16} />
                <span>Lokasi ilustrasi · belum tersedia</span>
              </span>
            </div>

            <div className="invitation-addressee">
              <p>Kepada Yth. Bapak/Ibu/Saudara/i:</p>
              <h2>Tamu Contoh 001</h2>
              <span className="invitation-addressee-badge">
                <Icon name="task-alt" size={14} />
                <span>Alokasi contoh: 2 orang</span>
              </span>
              <p>
                Tanpa mengurangi rasa hormat, kami bermaksud mengundang Bapak/Ibu/Saudara/i untuk
                hadir dan memberikan doa restu pada momentum sakral pernikahan kami.
              </p>
            </div>

            <div className="invitation-cover-actions">
              <button
                className="button"
                onClick={() => {
                  setOpen(true);
                  window.scrollTo(0, 0);
                }}
              >
                <Icon name="visibility" size={18} />
                <span>Buka Undangan</span>
                <Icon name="arrow-forward" size={16} />
              </button>
              <small>
                <Icon name="shield" size={14} />
                <span>Musik latar belum disertakan pada pratinjau ini.</span>
              </small>
            </div>
          </main>

          <footer className="invitation-cover-foot">
            <span>Menuju Akad · undangan contoh</span>
            <span>Halaman ini tidak menyimpan data tamu</span>
          </footer>
        </>
      )}
    </div>
  );
}
