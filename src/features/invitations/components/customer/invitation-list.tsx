"use client";
import Link from "next/link";
import { useState } from "react";
import { invitationsFixture } from "@/features/design-preview/data/fixtures";
import { InvitationSummaryCard } from "./invitation-summary-card";
export function InvitationList() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const filtered = invitationsFixture.filter(
    (invitation) =>
      invitation.title.toLowerCase().includes(search.toLowerCase()) &&
      (status === "ALL" || invitation.status === status),
  );
  return (
    <>
      <div className="workspace-title">
        <div>
          <p className="eyebrow">CERITA KALIAN</p>
          <h1>Undangan Saya</h1>
          <p>Kelola setiap detail undangan dalam satu tempat.</p>
        </div>
        <Link className="button" href="/preview-ui/cus-03">
          + Buat Undangan
        </Link>
      </div>
      <div className="toolbar">
        <label>
          Cari undangan
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nama undangan..."
          />
        </label>
        <label>
          Status undangan
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="ALL">Semua status</option>
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Aktif</option>
          </select>
        </label>
      </div>
      <div className="stack">
        {filtered.map((invitation) => (
          <InvitationSummaryCard invitation={invitation} key={invitation.id} />
        ))}
      </div>
      {!filtered.length && (
        <section className="card empty-state" role="status">
          <h2>Belum ada hasil</h2>
          <p>Ubah kata pencarian atau status undangan.</p>
        </section>
      )}
    </>
  );
}
