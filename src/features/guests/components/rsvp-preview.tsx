import Link from "next/link";
import { guestsFixture } from "@/features/design-preview/data/guests-fixtures";
import { summarizeGuests } from "../lib/guest-preview";
import { RsvpSessionCards } from "./rsvp-session-cards";
import { RsvpNeedsCards } from "./rsvp-needs-cards";
import { RsvpLatestConfirmations } from "./rsvp-latest-confirmations";
import styles from "../rsvp-preview.module.css";
export function RsvpPreview() {
  const summary = summarizeGuests(guestsFixture);
  const responses = summary.total - summary.pending;
  const responsePercent = Math.round((responses / summary.total) * 100);
  return (
    <section className={`business ${styles.page}`}>
      <nav className={styles.navigation} aria-label="Kelola konfirmasi">
        <Link href="/preview-ui/gst-01">Daftar Tamu ({summary.total})</Link>
        <span aria-current="page">Ringkasan RSVP</span>
        <Link href="/preview-ui/gst-04">Buku Doa & Ucapan</Link>
        <Link className="button secondary" href="/preview-ui/cus-05">
          Pratinjau Undangan
        </Link>
      </nav>
      <header className={styles.sectionHeading}>
        <div>
          <p className="eyebrow">LAPORAN KEHADIRAN & LOGISTIK · DATA CONTOH</p>
          <h1>Rekapitulasi Konfirmasi RSVP</h1>
          <p>Pantau respons sintetis untuk menguji tata letak dan alokasi sesi acara.</p>
        </div>
        <div className={styles.snapshot}>
          <strong>Snapshot fixture</strong>
          <span>6 Oktober 2026</span>
          <small>Tidak tersinkron ke layanan</small>
        </div>
      </header>
      <div className="guest-summary">
        {[
          {
            title: "Total Respons Masuk",
            value: responses,
            unit: `/ ${summary.total} undangan`,
            detail: `${responsePercent}% sudah menjawab, termasuk masih ragu.`,
            highlight: false,
          },
          {
            title: "Total Hadir Pasti",
            value: summary.attending,
            unit: "kontak contoh",
            detail: `${summary.attending} orang · party size 1. ${summary.attendanceRatePercent}% dari seluruh tamu.`,
            highlight: true,
          },
          {
            title: "Konfirmasi Berhalangan",
            value: summary.declining,
            unit: "undangan",
            detail: "Tidak hadir, terpisah dari respons masih ragu.",
            highlight: false,
          },
          {
            title: "Belum Menjawab",
            value: summary.pending,
            unit: "undangan",
            detail: "Batas waktu RSVP belum diatur pada fixture.",
            highlight: false,
          },
        ].map((item) => (
          <article
            className={`card ${styles.summaryCard} ${item.highlight ? styles.attending : ""}`}
            key={item.title}
          >
            <h2>{item.title}</h2>
            <p className={styles.value}>
              {item.value} <span>{item.unit}</span>
            </p>
            {item.title === "Total Respons Masuk" && (
              <progress
                aria-label="Persentase respons termasuk masih ragu"
                value={responses}
                max={summary.total}
              />
            )}
            <p className={styles.summaryDetail}>{item.detail}</p>
          </article>
        ))}
      </div>
      <aside className={styles.maybe}>
        <strong>Masih ragu: {summary.maybe} undangan</strong>
        <span>
          Termasuk {responses} respons masuk, belum dihitung sebagai hadir atau belum menjawab.
        </span>
      </aside>
      <RsvpSessionCards />
      <RsvpNeedsCards />
      <RsvpLatestConfirmations />
    </section>
  );
}
