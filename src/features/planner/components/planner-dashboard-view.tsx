"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import {
  budgetActualTotalIdr,
  budgetCategoriesFixture,
  budgetTotalIdr,
  expensesFixture,
  savingsTotalBalanceIdr,
  savingsTargetFixture,
} from "@/features/design-preview/data/planner-finance-fixtures";
import { tasksFixture } from "@/features/design-preview/data/planner-work-fixtures";
import { PlannerShell, PlannerStat } from "@/features/planner/components/planner-shell";
import {
  daysLabel,
  daysUntil,
  formatIdrPlain,
  formatPercent,
  picLabels,
} from "@/features/planner/lib/presentation";
import { previewContext } from "@/features/design-preview/data/fixture-context";

/*
 * PLN-01/02 — Shell & Ringkasan Perencanaan (Horizon Modern Style).
 *
 * Susunan mengikuti desain: tiga kartu metrik (dana terkumpul, sisa anggaran,
 * progres tugas), panel hitung mundur akad, panel alokasi anggaran berlapis,
 * lalu blok "hari ini & perhatian" yang memuat tugas jatuh tempo dan
 * pengeluaran terakhir. Semua angka berasal dari fixture sintetis.
 */

const weddingDate = "2026-10-18";

/** Pecah selisih hari menjadi hari/jam/menit/detik untuk grid hitung mundur. */
function countdownParts(targetIso: string, nowIso: string) {
  const target = Date.parse(`${targetIso}T09:00:00Z`);
  const now = Date.parse(`${nowIso}T00:00:00Z`);
  const totalSeconds = Math.max(0, Math.floor((target - now) / 1000));
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

export function PlannerDashboardView() {
  const pendingTasks = tasksFixture.filter((task) => task.status === "PENDING");
  const doneTasks = tasksFixture.filter((task) => task.status === "DONE").length;
  const remainingBudget = budgetTotalIdr - budgetActualTotalIdr;
  const daysToWedding = daysUntil(weddingDate, previewContext.now);
  const today = previewContext.now.slice(0, 10);
  const lateTasks = pendingTasks.filter((task) => task.dueDate < today);
  const upcoming = [...pendingTasks].sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 3);
  const lastExpense = expensesFixture[0];
  const countdown = countdownParts(weddingDate, previewContext.now);

  const savingsPercent = Math.round(
    (savingsTotalBalanceIdr / savingsTargetFixture.targetIdr) * 100,
  );
  const budgetUsedPercent = Math.round((budgetActualTotalIdr / budgetTotalIdr) * 100);
  const taskPercent = Math.round((doneTasks / tasksFixture.length) * 100);

  // Empat kategori terbesar untuk panel alokasi anggaran berlapis.
  const allocation = [...budgetCategoriesFixture]
    .sort((a, b) => b.actualIdr - a.actualIdr)
    .slice(0, 3);

  return (
    <PlannerShell
      title="Ringkasan Perencanaan"
      code="PLN-02"
      breadcrumb="Ringkasan Eksekutif"
      subnav="/dashboard/planner"
      lead="Pantauan terpadu komitmen waktu, alokasi finansial, dan kesiapan seremonial pada data contoh."
      actions={
        <>
          <Link className="button" href="/dashboard/planner/expenses">
            <Icon name="add-circle" size={18} />
            <span>Catat Pengeluaran</span>
          </Link>
          <Link className="button secondary" href="/dashboard/planner/tasks">
            <Icon name="add-task" size={18} />
            <span>Tambah Tugas</span>
          </Link>
        </>
      }
    >
      <div className="planner-summary">
        <PlannerStat
          label="Dana Terkumpul"
          value={formatIdrPlain(savingsTotalBalanceIdr)}
          note={`${formatPercent(savingsTotalBalanceIdr, savingsTargetFixture.targetIdr)} dari target ${formatIdrPlain(savingsTargetFixture.targetIdr)}`}
          icon="savings"
          tone="primary"
          progressPercent={savingsPercent}
        />
        <PlannerStat
          label="Sisa Anggaran"
          value={formatIdrPlain(remainingBudget)}
          note={`Terpakai ${formatIdrPlain(budgetActualTotalIdr)} · Total ${formatIdrPlain(budgetTotalIdr)}`}
          icon="wallet"
          tone="secondary"
          progressPercent={budgetUsedPercent}
        />
        <PlannerStat
          label="Progres Tugas"
          value={`${doneTasks}/${tasksFixture.length}`}
          note={`${taskPercent}% terselesaikan · ${lateTasks.length} terlambat (contoh)`}
          icon="task-alt"
          tone="tertiary"
          progressPercent={taskPercent}
        />
      </div>

      <div className="planner-split">
        <section className="planner-panel">
          <header className="planner-panel-head">
            <div>
              <p className="aura-label">Hitung Mundur Momen Sakral</p>
              <h2>Akad &amp; Resepsi Utama</h2>
              <p className="planner-panel-note">
                Lokasi dan tanggal pada data contoh · menuju hari-H.
              </p>
            </div>
            <span className="planner-badge">{daysLabel(daysToWedding)}</span>
          </header>
          <div className="planner-countdown">
            {(
              [
                [countdown.days, "Hari"],
                [countdown.hours, "Jam"],
                [countdown.minutes, "Menit"],
                [countdown.seconds, "Detik"],
              ] as const
            ).map(([value, unit]) => (
              <div key={unit}>
                <span className="tabular">{String(value).padStart(2, "0")}</span>
                <small>{unit}</small>
              </div>
            ))}
          </div>
          <footer className="planner-panel-foot">
            <span className="planner-foot-icon">
              <Icon name="event-repeat" size={18} />
            </span>
            <div>
              <strong>Momen lamaran &amp; pertemuan keluarga</strong>
              <small>Kediaman mempelai · 20 Desember 2026 (contoh)</small>
            </div>
          </footer>
        </section>

        <section className="planner-panel">
          <header className="planner-panel-head">
            <div>
              <h2>Ringkasan Alokasi Anggaran</h2>
              <p className="planner-panel-note">
                Status serapan biaya terhadap pagu total {formatIdrPlain(budgetTotalIdr)}.
              </p>
            </div>
            <span
              className="planner-badge"
              data-tone={budgetUsedPercent > 90 ? "warning" : "success"}
            >
              {budgetUsedPercent}% Terpakai
            </span>
          </header>
          <div
            className="planner-allocation"
            role="img"
            aria-label={`Alokasi anggaran terpakai ${budgetUsedPercent} persen`}
          >
            {allocation.map((category) => (
              <span
                key={category.id}
                style={{
                  width: `${Math.round((category.actualIdr / budgetTotalIdr) * 100)}%`,
                }}
                title={`${category.name} · ${formatIdrPlain(category.actualIdr)}`}
              />
            ))}
            <span
              className="planner-allocation-rest"
              style={{ width: `${Math.max(0, 100 - budgetUsedPercent)}%` }}
              title={`Sisa pagu · ${formatIdrPlain(remainingBudget)}`}
            />
          </div>
          <ul className="planner-legend">
            {allocation.map((category) => (
              <li key={category.id}>
                <span className="planner-legend-dot" aria-hidden="true" />
                {category.name} ({Math.round((category.actualIdr / budgetTotalIdr) * 100)}%)
              </li>
            ))}
            <li className="planner-legend-rest">
              <span className="planner-legend-dot" aria-hidden="true" />
              Sisa pagu ({Math.max(0, 100 - budgetUsedPercent)}%)
            </li>
          </ul>
        </section>
      </div>

      <section className="planner-panel">
        <header className="planner-panel-head">
          <div>
            <p className="aura-label planner-label-attention">
              <Icon name="error" size={14} />
              <span>Hari Ini &amp; Perhatian</span>
            </p>
            <p className="planner-panel-note">
              Aksi krusial yang memerlukan tindak lanjut segera serta mutasi kas terkini (contoh).
            </p>
          </div>
          <span className="planner-badge">{upcoming.length} tugas terdekat</span>
        </header>

        <div className="planner-attention">
          <div className="planner-attention-tasks">
            <h3>Daftar Tugas Jatuh Tempo ({upcoming.length})</h3>
            {upcoming.map((task) => {
              const days = daysUntil(task.dueDate, previewContext.now);
              return (
                <article className="planner-task-row" key={task.id} data-late={days < 0}>
                  <span className="planner-task-check" aria-hidden="true">
                    <Icon name="task" size={18} />
                  </span>
                  <div>
                    <h4>{task.title}</h4>
                    <p>
                      {picLabels[task.pic]} · {task.dueDate}
                    </p>
                  </div>
                  <span className="planner-badge" data-tone={days < 0 ? "danger" : "success"}>
                    {days < 0 ? `Terlambat ${Math.abs(days)} hari` : daysLabel(days)}
                  </span>
                </article>
              );
            })}
          </div>

          {lastExpense && (
            <div className="planner-expense-card">
              <header>
                <span>Pengeluaran Terakhir</span>
                <small className="tabular">{lastExpense.date}</small>
              </header>
              <div className="planner-expense-main">
                <span className="planner-expense-icon">
                  <Icon name="payments" size={20} />
                </span>
                <div>
                  <h3>{lastExpense.description}</h3>
                  <p>{lastExpense.note}</p>
                  <strong className="tabular">{formatIdrPlain(lastExpense.amountIdr)}</strong>
                </div>
              </div>
              <footer>
                <small>
                  Kategori:{" "}
                  {budgetCategoriesFixture.find((c) => c.id === lastExpense.categoryId)?.name ??
                    "Tidak berkategori"}
                </small>
                <Link href="/dashboard/planner/expenses">
                  Lihat Buku Kas
                  <Icon name="arrow-forward" size={16} />
                </Link>
              </footer>
            </div>
          )}
        </div>
      </section>
    </PlannerShell>
  );
}
