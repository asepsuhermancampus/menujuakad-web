"use client";

import Link from "next/link";
import {
  budgetActualTotalIdr,
  budgetTotalIdr,
  expensesFixture,
  savingsTotalBalanceIdr,
  savingsTargetFixture,
} from "@/features/design-preview/data/planner-finance-fixtures";
import { tasksFixture } from "@/features/design-preview/data/planner-work-fixtures";
import { PlannerShell } from "@/features/planner/components/planner-shell";
import {
  daysLabel,
  daysUntil,
  formatIdrPlain,
  formatPercent,
  picLabels,
} from "@/features/planner/lib/presentation";
import { previewContext } from "@/features/design-preview/data/fixture-context";

export function PlannerDashboardView() {
  const pendingTasks = tasksFixture.filter((task) => task.status === "PENDING");
  const doneTasks = tasksFixture.filter((task) => task.status === "DONE").length;
  const remainingBudget = budgetTotalIdr - budgetActualTotalIdr;
  const daysToWedding = daysUntil("2026-10-18", previewContext.now);
  const today = previewContext.now.slice(0, 10);
  const lateTasks = pendingTasks.filter((task) => task.dueDate < today);
  const upcoming = [...pendingTasks]
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 3);
  const lastExpense = expensesFixture[0];

  return (
    <PlannerShell title="Ringkasan Perencanaan" code="PLN-02" subnav="/dashboard/planner">
      <div className="planner-summary">
        <article>
          <h2>Dana terkumpul</h2>
          <strong>{formatIdrPlain(savingsTotalBalanceIdr)}</strong>
          <small>
            {formatPercent(savingsTotalBalanceIdr, savingsTargetFixture.targetIdr)} dari target{" "}
            {formatIdrPlain(savingsTargetFixture.targetIdr)}
          </small>
        </article>
        <article>
          <h2>Sisa anggaran</h2>
          <strong>{formatIdrPlain(remainingBudget)}</strong>
          <small>
            Terpakai {formatPercent(budgetActualTotalIdr, budgetTotalIdr)} dari{" "}
            {formatIdrPlain(budgetTotalIdr)}
          </small>
        </article>
        <article>
          <h2>Progres tugas</h2>
          <strong>
            {doneTasks}/{tasksFixture.length}
          </strong>
          <small>{lateTasks.length} terlambat (contoh)</small>
        </article>
      </div>

      <section className="planner-group">
        <h2>Menuju hari-H</h2>
        <div className="planner-row">
          <div>
            <h3>Pernikahan — 18 Oktober 2026</h3>
            <p>Hitung mundur contoh dari data acara.</p>
          </div>
          <div className="planner-row-actions">
            <strong className="planner-money">{daysLabel(daysToWedding)}</strong>
          </div>
        </div>
      </section>

      <section className="planner-group">
        <h2>
          Hari ini <small>· 3 tugas terdekat (contoh)</small>
        </h2>
        <div className="planner-list">
          {upcoming.map((task) => {
            const days = daysUntil(task.dueDate, previewContext.now);
            return (
              <article className="planner-row" key={task.id}>
                <div>
                  <h3>{task.title}</h3>
                  <p>
                    {picLabels[task.pic]} · {task.dueDate} · {daysLabel(days)}
                  </p>
                </div>
                <div className="planner-row-actions">
                  {days < 0 && (
                    <span className="planner-badge" data-tone="danger">
                      ! Terlambat
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="planner-group">
        <h2>Pengeluaran terakhir</h2>
        {lastExpense && (
          <article className="planner-row">
            <div>
              <h3>{lastExpense.description}</h3>
              <p>
                {lastExpense.date} · {lastExpense.note}
              </p>
            </div>
            <div className="planner-row-actions">
              <strong className="planner-money">{formatIdrPlain(lastExpense.amountIdr)}</strong>
            </div>
          </article>
        )}
      </section>

      <div className="actions">
        <Link className="button" href="/dashboard/planner/expenses">
          Catat pengeluaran
        </Link>
        <Link className="button secondary" href="/dashboard/planner/tasks">
          Tambah tugas
        </Link>
      </div>

      <p className="notice">
        Semua angka pada ringkasan adalah data contoh; belum ada penyimpanan atau sinkronisasi
        pasangan.
      </p>
    </PlannerShell>
  );
}
