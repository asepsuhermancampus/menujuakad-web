"use client";
import Link from "next/link";
import { editorFixture } from "@/features/design-preview/data/fixtures";
export function PublishPanel({ notify }: { notify: (message: string) => void }) {
  return (
    <>
      <h1>Periksa & Terbitkan</h1>
      <p>Tinjau setiap detail sebelum membagikan hari kalian.</p>
      <article className="card stack">
        <h2>Kesiapan Undangan</h2>
        {editorFixture.publishChecks.map((check) => (
          <div className="section-heading" key={check.id}>
            <span>{check.label}</span>
            <span className={`badge ${check.status === "COMPLETE" ? "success" : ""}`}>
              {check.status === "COMPLETE" ? "Lengkap (contoh)" : "Perlu ditinjau"}
            </span>
          </div>
        ))}
        <p className="notice">
          Undangan contoh berstatus DRAFT dan belum dipublikasikan. Pembayaran, pemeriksaan server,
          dan penerbitan belum terhubung.
        </p>
        <div className="actions">
          <Link className="button secondary" href="/preview-ui/inv-02">
            Tinjau undangan
          </Link>
          <button
            className="button"
            onClick={() =>
              notify(
                "Simulasi pemeriksaan selesai. Undangan tidak diterbitkan dan status server tidak berubah.",
              )
            }
          >
            Simulasikan pemeriksaan terbit
          </button>
        </div>
      </article>
    </>
  );
}
