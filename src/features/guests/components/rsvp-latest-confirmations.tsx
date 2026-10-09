"use client";
import Link from "next/link";
import { useState } from "react";
import { latestRsvpFixture } from "@/features/design-preview/data/rsvp-session-fixtures";
import { rsvpStatusLabels, type RsvpStatus } from "@/features/design-preview/data/guests-fixtures";
import styles from "../rsvp-preview.module.css";
export function RsvpLatestConfirmations() {
  const [status, setStatus] = useState<"ALL" | RsvpStatus>("ALL");
  const filtered = latestRsvpFixture.filter(
    (guest) => status === "ALL" || guest.rsvpStatus === status,
  );
  return (
    <section aria-labelledby="latest-rsvp-heading">
      <div className={styles.sectionHeading}>
        <div>
          <h2 id="latest-rsvp-heading">Konfirmasi RSVP Terbaru</h2>
          <p>
            Cuplikan 5 respons fixture bertanggal 6 Oktober 2026; bukan umpan aktivitas langsung.
          </p>
        </div>
        <label>
          Status respons contoh
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as "ALL" | RsvpStatus)}
          >
            <option value="ALL">Semua respons contoh</option>
            {Object.entries(rsvpStatusLabels)
              .filter(([value]) => value !== "PENDING")
              .map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
          </select>
        </label>
      </div>
      <div className={`business-table guest-table ${styles.latestTable}`}>
        <table>
          <caption>Konfirmasi sintetis · tidak ada data tamu nyata</caption>
          <thead>
            <tr>
              <th scope="col">Nama Tamu Contoh</th>
              <th scope="col">Alokasi Orang</th>
              <th scope="col">Sesi Contoh</th>
              <th scope="col">Status Konfirmasi</th>
              <th scope="col">Waktu Fixture</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((guest) => (
              <tr key={guest.id}>
                <td>
                  <span className="guest-cell-label">Nama</span>
                  {guest.displayName}
                </td>
                <td>
                  <span className="guest-cell-label">Alokasi</span>
                  {guest.rsvpStatus === "ATTENDING" ? guest.partySize : 0} orang hadir
                </td>
                <td>
                  <span className="guest-cell-label">Sesi</span>
                  {guest.rsvpStatus === "ATTENDING"
                    ? "Akad & Resepsi · contoh"
                    : "Belum dialokasikan"}
                </td>
                <td>
                  <span className="guest-cell-label">Status</span>
                  <span className="badge guest-rsvp-badge" data-status={guest.rsvpStatus}>
                    {rsvpStatusLabels[guest.rsvpStatus]}
                  </span>
                </td>
                <td>
                  <span className="guest-cell-label">Waktu</span>
                  <time dateTime={guest.respondedAt ?? undefined}>6 Oktober 2026 · 15.00 WIB</time>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!filtered.length && <p role="status">Tidak ada respons pada cuplikan ini.</p>}
      </div>
      <div className={styles.latestFooter}>
        <small>Menampilkan {filtered.length} dari 5 respons cuplikan.</small>
        <Link className="button secondary" href="/preview-ui/gst-01">
          Buka Seluruh Daftar Tamu →
        </Link>
      </div>
    </section>
  );
}
