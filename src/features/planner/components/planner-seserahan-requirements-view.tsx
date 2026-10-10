"use client";

import { useState } from "react";
import {
  seserahanFixture,
  seserahanTotalEstimateIdr,
  requirementsFixture,
} from "@/features/design-preview/data/planner-misc-fixtures";
import { previewContext } from "@/features/design-preview/data/fixture-context";
import {
  PlannerEmpty,
  PlannerModal,
  PlannerShell,
} from "@/features/planner/components/planner-shell";
import {
  daysLabel,
  daysUntil,
  formatIdrPlain,
  formatPercent,
  seserahanCategoryLabels,
  seserahanStatusLabels,
} from "@/features/planner/lib/presentation";

const seserahanTone = {
  NOT_BOUGHT: "default",
  BOUGHT: "success",
  PREPARED: "success",
} as const;

export function PlannerSeserahanView() {
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [formOpen, setFormOpen] = useState(false);

  const rows = seserahanFixture.filter(
    (item) => categoryFilter === "ALL" || item.category === categoryFilter,
  );
  const doneCount = seserahanFixture.filter((item) => item.status !== "NOT_BOUGHT").length;

  return (
    <PlannerShell title="Seserahan & Hantaran" code="PLN-10" subnav="/dashboard/planner/seserahan">
      <div className="planner-summary">
        <article>
          <h2>Total item</h2>
          <strong>{seserahanFixture.length}</strong>
          <small>{doneCount} sudah dibeli/disiapkan (contoh)</small>
        </article>
        <article>
          <h2>Estimasi biaya</h2>
          <strong>{formatIdrPlain(seserahanTotalEstimateIdr)}</strong>
          <small>Jumlah estimasi semua item</small>
        </article>
        <article>
          <h2>Progres</h2>
          <strong>{formatPercent(doneCount, seserahanFixture.length)}</strong>
          <small>Item yang sudah dibeli/disiapkan</small>
        </article>
      </div>

      <div className="actions" style={{ marginBottom: 20 }}>
        <button type="button" className="button" onClick={() => setFormOpen(true)}>
          Tambah item
        </button>
        <label style={{ marginLeft: "auto" }}>
          Kategori
          <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
            <option value="ALL">Semua kategori</option>
            <option value="SESERAHAN_WANITA">Seserahan Wanita</option>
            <option value="SESERAHAN_PRIA">Seserahan Pria</option>
            <option value="HANTARAN_LAMARAN">Hantaran Lamaran</option>
          </select>
        </label>
      </div>

      {rows.length === 0 ? (
        <PlannerEmpty
          message="Belum ada item seserahan pada filter ini. Tambahkan daftar pertama."
          action={{ label: "Tambah item", onClick: () => setFormOpen(true) }}
        />
      ) : (
        <div className="business-table">
          <table>
            <caption>Daftar seserahan dan hantaran (data contoh)</caption>
            <thead>
              <tr>
                <th scope="col">Item</th>
                <th scope="col">Kategori</th>
                <th scope="col">Estimasi harga</th>
                <th scope="col">Status</th>
                <th scope="col">Catatan</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{seserahanCategoryLabels[item.category]}</td>
                  <td className="planner-money">
                    {item.estimateIdr > 0 ? formatIdrPlain(item.estimateIdr) : "—"}
                  </td>
                  <td>
                    <span className="planner-badge" data-tone={seserahanTone[item.status]}>
                      {item.status === "NOT_BOUGHT" ? "•" : "✓"}{" "}
                      {seserahanStatusLabels[item.status]}
                    </span>
                  </td>
                  <td>{item.note || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="notice" style={{ marginTop: 20 }}>
        Daftar contoh; tidak ada pembelian atau tautan belanja nyata.
      </p>

      {formOpen && (
        <PlannerModal title="Tambah item seserahan (contoh)" onClose={() => setFormOpen(false)}>
          <div className="planner-form-grid">
            <label className="planner-span-2">
              Nama item
              <input placeholder="Contoh: Perhiasan seserahan" />
            </label>
            <label>
              Kategori
              <select defaultValue="SESERAHAN_WANITA">
                <option value="SESERAHAN_WANITA">Seserahan Wanita</option>
                <option value="SESERAHAN_PRIA">Seserahan Pria</option>
                <option value="HANTARAN_LAMARAN">Hantaran Lamaran</option>
              </select>
            </label>
            <label>
              Estimasi harga (Rp)
              <input inputMode="numeric" placeholder="0" />
            </label>
            <label className="planner-span-2">
              Catatan (opsional)
              <input placeholder="Contoh: cari model klasik" />
            </label>
            <p className="planner-impact">Form contoh; belum ada penyimpanan.</p>
          </div>
        </PlannerModal>
      )}
    </PlannerShell>
  );
}

export function PlannerRequirementsView() {
  const [done, setDone] = useState<ReadonlySet<string>>(
    new Set(requirementsFixture.filter((item) => item.done).map((item) => item.id)),
  );

  const items = [...requirementsFixture].sort(
    (a, b) => Number(done.has(a.id)) - Number(done.has(b.id)),
  );
  const doneCount = done.size;

  return (
    <PlannerShell title="Persyaratan Nikah" code="PLN-11" subnav="/dashboard/planner/requirements">
      <div className="planner-summary">
        <article>
          <h2>Progres dokumen</h2>
          <strong>
            {doneCount}/{requirementsFixture.length}
          </strong>
          <small>{formatPercent(doneCount, requirementsFixture.length)} selesai</small>
        </article>
        <article>
          <h2>Belum selesai</h2>
          <strong>{requirementsFixture.length - doneCount}</strong>
          <small>Termasuk 1 dokumen mendekati tenggat</small>
        </article>
        <article>
          <h2>Lampiran terunggah</h2>
          <strong>{requirementsFixture.filter((item) => item.attachmentLabel).length}</strong>
          <small>Nama berkas contoh</small>
        </article>
      </div>

      <div className="planner-list">
        {items.map((item) => {
          const isDone = done.has(item.id);
          const days = item.dueDate ? daysUntil(item.dueDate, previewContext.now) : null;
          return (
            <label className="planner-checkbox-row" data-done={isDone} key={item.id}>
              <input
                type="checkbox"
                checked={isDone}
                onChange={() =>
                  setDone((previous) => {
                    const next = new Set(previous);
                    if (next.has(item.id)) next.delete(item.id);
                    else next.add(item.id);
                    return next;
                  })
                }
                aria-label={`Tandai ${item.name} ${isDone ? "belum selesai" : "selesai"}`}
              />
              <span className="planner-checkbox-title">
                <strong>{item.name}</strong>
                <small>
                  {item.dueDate ? `Tenggat ${item.dueDate}` : "Tanpa tenggat"}
                  {days !== null ? ` · ${daysLabel(days)}` : ""}
                  {item.attachmentLabel ? ` · Lampiran: ${item.attachmentLabel}` : " · Belum ada lampiran"}
                  {item.note ? ` · ${item.note}` : ""}
                </small>
              </span>
              {days !== null && days < 0 && !isDone && (
                <span className="planner-badge" data-tone="warning">
                  ! Tenggat lewat
                </span>
              )}
              {isDone && (
                <span className="planner-badge" data-tone="success">
                  ✓ Selesai
                </span>
              )}
            </label>
          );
        })}
      </div>

      <p className="notice">
        Status centang hanya berlaku pada sesi ini. Unggah dokumen belum aktif; nama lampiran adalah
        contoh.
      </p>
    </PlannerShell>
  );
}
