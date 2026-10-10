"use client";

import { useState } from "react";
import {
  budgetActualTotalIdr,
  budgetCategoriesFixture,
  budgetStatus,
  budgetTotalIdr,
} from "@/features/design-preview/data/planner-finance-fixtures";
import {
  PlannerEmpty,
  PlannerModal,
  PlannerShell,
  PlannerStat,
} from "@/features/planner/components/planner-shell";
import {
  budgetStatusLabels,
  formatIdrPlain,
  formatPercent,
} from "@/features/planner/lib/presentation";

const statusTone = {
  SAFE: "success",
  NEAR_LIMIT: "warning",
  OVER_BUDGET: "danger",
} as const;

export function PlannerBudgetView() {
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const rows = budgetCategoriesFixture.filter((category) => {
    if (statusFilter === "ALL") return true;
    return budgetStatus(category) === statusFilter;
  });

  const remaining = budgetTotalIdr - budgetActualTotalIdr;
  const usedPercent = Math.round((budgetActualTotalIdr / budgetTotalIdr) * 100);
  const overBudgetCount = budgetCategoriesFixture.filter(
    (category) => budgetStatus(category) === "OVER_BUDGET",
  ).length;

  return (
    <PlannerShell title="Anggaran" code="PLN-04" subnav="/dashboard/planner/budget">
      <div className="planner-summary">
        <PlannerStat
          label="Total anggaran"
          value={formatIdrPlain(budgetTotalIdr)}
          note={`${budgetCategoriesFixture.length} kategori contoh`}
          icon="wallet"
          tone="primary"
          progressPercent={usedPercent}
        />
        <PlannerStat
          label="Terpakai"
          value={formatIdrPlain(budgetActualTotalIdr)}
          note={`${formatPercent(budgetActualTotalIdr, budgetTotalIdr)} dari anggaran`}
          icon="receipt"
          tone="secondary"
          progressPercent={usedPercent}
        />
        <PlannerStat
          label="Sisa anggaran"
          value={formatIdrPlain(remaining)}
          note={`${overBudgetCount} kategori lewat batas (contoh)`}
          icon="task-alt"
          tone="tertiary"
          progressPercent={100 - usedPercent}
        />
      </div>

      <div className="actions" style={{ marginBottom: 20 }}>
        <button type="button" className="button" onClick={() => setCategoryModalOpen(true)}>
          Tambah kategori
        </button>
        <button type="button" className="button secondary">
          Sesuaikan anggaran
        </button>
        <label style={{ marginLeft: "auto" }}>
          Status
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="ALL">Semua status</option>
            <option value="SAFE">Aman</option>
            <option value="NEAR_LIMIT">Mendekati batas</option>
            <option value="OVER_BUDGET">Lewat batas</option>
          </select>
        </label>
      </div>

      {rows.length === 0 ? (
        <PlannerEmpty
          message="Belum ada kategori pada filter ini. Susun anggaran agar pengeluaran terukur."
          action={{ label: "Tambah kategori", onClick: () => setCategoryModalOpen(true) }}
        />
      ) : (
        <div className="business-table">
          <table>
            <caption>Anggaran per kategori (data contoh)</caption>
            <thead>
              <tr>
                <th scope="col">Kategori</th>
                <th scope="col">Anggaran</th>
                <th scope="col">Aktual</th>
                <th scope="col">Selisih</th>
                <th scope="col">Progres</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((category) => {
                const status = budgetStatus(category);
                const ratio = category.budgetIdr
                  ? Math.min((category.actualIdr / category.budgetIdr) * 100, 100)
                  : 0;
                const diff = category.budgetIdr - category.actualIdr;
                return (
                  <tr key={category.id}>
                    <td>{category.name}</td>
                    <td className="planner-money">{formatIdrPlain(category.budgetIdr)}</td>
                    <td className="planner-money">{formatIdrPlain(category.actualIdr)}</td>
                    <td className="planner-money">
                      {diff < 0 ? `−${formatIdrPlain(Math.abs(diff))}` : formatIdrPlain(diff)}
                    </td>
                    <td>
                      <div className="planner-progress" data-status={status} aria-hidden="true">
                        <span style={{ width: `${ratio}%` }} />
                      </div>
                    </td>
                    <td>
                      <span className="planner-badge" data-tone={statusTone[status]}>
                        {status === "OVER_BUDGET" ? "!" : status === "NEAR_LIMIT" ? "!" : "✓"}{" "}
                        {budgetStatusLabels[status]}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <section className="planner-group" style={{ marginTop: 28 }}>
        <h2>
          Distribusi anggaran <small>· satu grafik per layar</small>
        </h2>
        <div className="planner-chart" role="img" aria-label="Distribusi anggaran per kategori">
          {budgetCategoriesFixture.map((category) => {
            const ratio = budgetTotalIdr ? (category.budgetIdr / budgetTotalIdr) * 100 : 0;
            return (
              <div className="planner-chart-row" key={category.id}>
                <span>{category.name}</span>
                <div className="planner-chart-bar">
                  <span style={{ width: `${ratio}%` }} />
                </div>
                <strong>{formatPercent(category.budgetIdr, budgetTotalIdr)}</strong>
              </div>
            );
          })}
        </div>
      </section>

      <p className="notice">
        Angka contoh. Perbandingan anggaran vs aktual belum tersimpan; perubahan tidak dikirim ke
        server.
      </p>

      {categoryModalOpen && (
        <PlannerModal title="Tambah kategori anggaran (contoh)" onClose={() => setCategoryModalOpen(false)}>
          <div className="planner-form-grid">
            <label className="planner-span-2">
              Nama kategori
              <input placeholder="Contoh: Dekorasi" />
            </label>
            <label>
              Anggaran (Rp)
              <input inputMode="numeric" placeholder="0" />
            </label>
            <label>
              Konteks acara
              <select defaultValue="WEDDING">
                <option value="WEDDING">Pernikahan</option>
                <option value="ENGAGEMENT">Lamaran</option>
              </select>
            </label>
            <p className="planner-impact">
              Form contoh. Belum ada penyimpanan; kategori baru tidak akan muncul setelah halaman
              dimuat ulang.
            </p>
          </div>
        </PlannerModal>
      )}
    </PlannerShell>
  );
}
