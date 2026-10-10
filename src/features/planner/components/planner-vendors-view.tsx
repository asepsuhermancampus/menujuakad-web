"use client";

import { useMemo, useState } from "react";
import {
  marketplaceVendorsFixture,
  vendorsFixture,
} from "@/features/design-preview/data/planner-work-fixtures";
import {
  PlannerEmpty,
  PlannerModal,
  PlannerShell,
} from "@/features/planner/components/planner-shell";
import { formatIdrPlain, vendorStatusLabels } from "@/features/planner/lib/presentation";

const statusTone = {
  UNPAID: "danger",
  PARTIAL: "warning",
  PAID: "success",
} as const;

export function PlannerVendorsView() {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [formOpen, setFormOpen] = useState(false);
  const [marketOpen, setMarketOpen] = useState(false);
  const [saved, setSaved] = useState<ReadonlySet<string>>(new Set());

  const rows = vendorsFixture.filter(
    (vendor) => statusFilter === "ALL" || vendor.status === statusFilter,
  );

  const totals = useMemo(
    () => ({
      total: vendorsFixture.reduce((sum, vendor) => sum + vendor.totalIdr, 0),
      paid: vendorsFixture.reduce((sum, vendor) => sum + vendor.paidIdr, 0),
    }),
    [],
  );

  return (
    <PlannerShell title="Vendor" code="PLN-08" subnav="/dashboard/planner/vendors">
      <div className="planner-summary">
        <article>
          <h2>Total vendor</h2>
          <strong>{vendorsFixture.length}</strong>
          <small>{vendorsFixture.filter((vendor) => vendor.status === "PAID").length} lunas (contoh)</small>
        </article>
        <article>
          <h2>Nilai kontrak</h2>
          <strong>{formatIdrPlain(totals.total)}</strong>
          <small>Jumlah harga semua vendor contoh</small>
        </article>
        <article>
          <h2>Sisa pembayaran</h2>
          <strong>{formatIdrPlain(totals.total - totals.paid)}</strong>
          <small>Belum dibayar (contoh)</small>
        </article>
      </div>

      <div className="actions" style={{ marginBottom: 20 }}>
        <button type="button" className="button" onClick={() => setFormOpen(true)}>
          Tambah vendor
        </button>
        <button type="button" className="button secondary" onClick={() => setMarketOpen(true)}>
          Cari vendor
        </button>
        <label style={{ marginLeft: "auto" }}>
          Status
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="ALL">Semua status</option>
            <option value="UNPAID">Belum dibayar</option>
            <option value="PARTIAL">DP sebagian</option>
            <option value="PAID">Lunas</option>
          </select>
        </label>
      </div>

      {rows.length === 0 ? (
        <PlannerEmpty
          message="Belum ada vendor pada filter ini. Catat vendor yang sudah dipilih."
          action={{ label: "Tambah vendor", onClick: () => setFormOpen(true) }}
        />
      ) : (
        <div className="business-table">
          <table>
            <caption>Vendor dan status pembayaran (data contoh)</caption>
            <thead>
              <tr>
                <th scope="col">Nama</th>
                <th scope="col">Kategori</th>
                <th scope="col">Harga total</th>
                <th scope="col">Dibayar</th>
                <th scope="col">Sisa</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((vendor) => (
                <tr key={vendor.id}>
                  <td>
                    {vendor.name}
                    <br />
                    <small style={{ color: "var(--color-taupe)" }}>{vendor.note}</small>
                  </td>
                  <td>{vendor.category}</td>
                  <td className="planner-money">{formatIdrPlain(vendor.totalIdr)}</td>
                  <td className="planner-money">{formatIdrPlain(vendor.paidIdr)}</td>
                  <td className="planner-money">{formatIdrPlain(vendor.totalIdr - vendor.paidIdr)}</td>
                  <td>
                    <span className="planner-badge" data-tone={statusTone[vendor.status]}>
                      {vendor.status === "PAID" ? "✓" : vendor.status === "PARTIAL" ? "•" : "!"}{" "}
                      {vendorStatusLabels[vendor.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="notice" style={{ marginTop: 20 }}>
        Vendor dan pembayaran adalah contoh; tidak ada transfer atau kontrak nyata.
      </p>

      {marketOpen && (
        <PlannerModal title="Cari vendor (katalog contoh)" onClose={() => setMarketOpen(false)}>
          <p className="notice">
            Katalog contoh — belum ada vendor mitra terdaftar. Daftar ini tidak menawarkan jasa
            nyata.
          </p>
          <div className="planner-list">
            {marketplaceVendorsFixture.map((vendor) => (
              <article className="planner-row" key={vendor.id}>
                <div>
                  <h3>{vendor.name}</h3>
                  <p>
                    {vendor.category} · {vendor.city} · {vendor.priceBand} · {vendor.ratingLabel}
                  </p>
                </div>
                <div className="planner-row-actions">
                  <button
                    type="button"
                    className="button secondary"
                    aria-pressed={saved.has(vendor.id)}
                    onClick={() =>
                      setSaved((previous) => {
                        const next = new Set(previous);
                        if (next.has(vendor.id)) next.delete(vendor.id);
                        else next.add(vendor.id);
                        return next;
                      })
                    }
                  >
                    {saved.has(vendor.id) ? "Tersimpan" : "Simpan"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </PlannerModal>
      )}

      {formOpen && (
        <PlannerModal title="Tambah vendor (contoh)" onClose={() => setFormOpen(false)}>
          <div className="planner-form-grid">
            <label className="planner-span-2">
              Nama vendor
              <input placeholder="Contoh: Venue Seruni" />
            </label>
            <label>
              Kategori
              <select defaultValue="Venue">
                {["Venue", "Dekorasi", "Dokumentasi", "Busana & Rias", "Katering", "Lainnya"].map(
                  (category) => (
                    <option key={category}>{category}</option>
                  ),
                )}
              </select>
            </label>
            <label>
              Harga total (Rp)
              <input inputMode="numeric" placeholder="0" />
            </label>
            <label>
              Dibayar (Rp)
              <input inputMode="numeric" placeholder="0" />
            </label>
            <label>
              Kontak (opsional)
              <input placeholder="Nama kontak, bukan nomor lengkap" />
            </label>
            <p className="planner-impact">
              Form contoh; data tidak disimpan dan tidak menghubungi vendor.
            </p>
          </div>
        </PlannerModal>
      )}
    </PlannerShell>
  );
}
