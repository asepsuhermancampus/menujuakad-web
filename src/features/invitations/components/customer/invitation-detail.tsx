"use client";
import Link from "next/link";
import { useState } from "react";
import { invitationFixture, editorFixture } from "@/features/design-preview/data/fixtures";
import { InvitationSummaryCard } from "./invitation-summary-card";
export function InvitationDetail() {
  const [message, setMessage] = useState("");
  return (
    <>
      <p className="eyebrow">UNDANGAN SAYA / RINGKASAN</p>
      <h1>{invitationFixture.title}</h1>
      <InvitationSummaryCard invitation={invitationFixture} />
      <section className="section grid-two">
        <article className="card stack">
          <h2>Kelengkapan Undangan</h2>
          {editorFixture.publishChecks.map((check) => (
            <div className="section-heading" key={check.id}>
              <span>{check.label}</span>
              <span className="badge">
                {check.status === "COMPLETE" ? "Lengkap (contoh)" : "Perlu ditinjau"}
              </span>
            </div>
          ))}
          <Link className="button" href="/preview-ui/edt-08">
            Periksa Detail
          </Link>
        </article>
        <article className="card stack">
          <h2>Tautan & Publikasi</h2>
          <p className="notice">Draft · belum diterbitkan. Preview tidak menjadi undangan aktif.</p>
          <Link className="button secondary" href="/preview-ui/inv-02">
            Lihat Preview Undangan
          </Link>
          <button
            className="button secondary"
            onClick={() =>
              setMessage(
                "Tautan contoh: /invitation/sarah-dimas-contoh. Undangan nyata belum diterbitkan.",
              )
            }
          >
            Tinjau tautan contoh
          </button>
          <details>
            <summary>Pengaturan undangan contoh</summary>
            <p>
              Rekonstruksi pelengkap: sumber visual CUS-06 belum tersedia. Domain, penerbitan, dan
              akses tamu belum dihubungkan.
            </p>
          </details>
          {message && <p role="status">{message}</p>}
        </article>
      </section>
      <div className="actions">
        <Link href="/preview-ui/gst-01">Kelola daftar tamu →</Link>
        <Link href="/preview-ui/gst-06">Tinjau analitik contoh →</Link>
      </div>
    </>
  );
}
