"use client";
import Link from "next/link";
import { useState } from "react";
import { InvitationMedia } from "@/components/shared/invitation-media";
import { InvitationSections } from "./invitation-sections";
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
      <section className="invitation-cover">
        <p className="eyebrow">MENUJU AKAD</p>
        <h1>Tautan Undangan Tidak Dapat Ditemukan</h1>
        <p>Tautan contoh ini tidak valid. Periksa kembali alamat atau hubungi pengirim undangan.</p>
        <Link className="button" href="/">
          Kembali ke Beranda
        </Link>
      </section>
    );
  return (
    <>
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
        <section className="invitation-cover">
          <p className="eyebrow">THE WEDDING CELEBRATION OF</p>
          <h1>Sarah & Dimas</h1>
          <InvitationMedia portrait />
          <p>Sabtu, 12 Desember 2026</p>
          <div className="card">
            <small>Kepada Yth.</small>
            <h3>Tamu Contoh 001</h3>
            <p>Dengan penuh kebahagiaan, kami mengundang Anda.</p>
          </div>
          <button
            className="button"
            onClick={() => {
              setOpen(true);
              window.scrollTo(0, 0);
            }}
          >
            Buka Undangan
          </button>
          <small>MENUJU AKAD · DATA CONTOH</small>
        </section>
      )}
    </>
  );
}
