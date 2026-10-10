"use client";
import Link from "next/link";
import { useState } from "react";
import { guestsFixture, rsvpStatusLabels } from "@/features/design-preview/data/guests-fixtures";
import { filterGuests, guestCsv, summarizeGuests } from "../lib/guest-preview";
import { guestGroupLabels } from "../lib/guest-labels";
import { GuestSummaryCards } from "./guest-summary-cards";
import { GuestTable } from "./guest-table";
export function GuestManagementPreview({ empty = false }: { empty?: boolean }) {
  const [guests, setGuests] = useState(() => (empty ? [] : [...guestsFixture]));
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [group, setGroup] = useState("ALL");
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState("");
  const filtered = filterGuests(guests, query, status, group);
  const pages = Math.max(1, Math.ceil(filtered.length / 10));
  const summary = summarizeGuests(guests);
  function exportExample() {
    const url = URL.createObjectURL(
      new Blob(["\uFEFF", guestCsv(filtered)], { type: "text/csv;charset=utf-8" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "tamu-contoh.csv";
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage("CSV data contoh diunduh; tidak memuat kontak atau tautan personal.");
  }
  function addExample() {
    const number = guests.length + 1;
    setGuests([
      ...guests,
      {
        id: `local-guest-${number}`,
        invitationId: "demo-invitation-01",
        displayName: `Tamu Lokal Contoh ${number}`,
        group: "FRIENDS",
        rsvpStatus: "PENDING",
        partySize: 1,
        deliveryStatus: "NOT_SENT",
        respondedAt: null,
      },
    ]);
    setMessage("Tamu sintetis ditambahkan di memori browser. Muat ulang untuk reset.");
  }
  return (
    <section className="business stack">
      <header className="guest-page-head">
        <div>
          <p className="aura-label">Tamu · data contoh</p>
          <h1>Daftar Tamu &amp; RSVP</h1>
          <p>
            Kelola rincian undangan, status kehadiran, alokasi kursi, dan pratinjau pengiriman
            tautan. Tidak ada undangan yang benar-benar dikirim.
          </p>
        </div>
        <span className="planner-badge">{summary.total} tamu terdaftar</span>
      </header>
      <GuestSummaryCards summary={summary} />
      <div className="actions">
        <button type="button" className="button" onClick={addExample}>
          Tambah tamu contoh
        </button>
        <Link className="button secondary" href="/preview-ui/gst-02">
          Tinjau impor
        </Link>
        <button type="button" className="button secondary" onClick={exportExample}>
          Unduh CSV contoh
        </button>
      </div>
      <div className="card business-filters">
        <label>
          Cari nama contoh
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />
        </label>
        <label>
          Status RSVP
          <select
            aria-label="Status RSVP"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="ALL">Semua status</option>
            {Object.entries(rsvpStatusLabels).map(([value, label]) => (
              <option value={value} key={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Grup tamu
          <select
            aria-label="Grup tamu"
            value={group}
            onChange={(e) => {
              setGroup(e.target.value);
              setPage(1);
            }}
          >
            <option value="ALL">Semua grup</option>
            {Object.entries(guestGroupLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="button secondary"
          onClick={() => {
            setQuery("");
            setStatus("ALL");
            setGroup("ALL");
            setPage(1);
          }}
        >
          Reset filter
        </button>
      </div>
      <GuestTable guests={filtered.slice((page - 1) * 10, page * 10)} />
      <nav className="actions guest-pagination" aria-label="Halaman tamu">
        <button
          type="button"
          className="button secondary"
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
        >
          Sebelumnya
        </button>
        <span>
          {filtered.length} hasil · Halaman {page} dari {pages}
        </span>
        <button
          type="button"
          className="button secondary"
          disabled={page >= pages}
          onClick={() => setPage(page + 1)}
        >
          Selanjutnya
        </button>
      </nav>
      {message && (
        <p role="status" className="notice">
          {message}
        </p>
      )}
    </section>
  );
}
