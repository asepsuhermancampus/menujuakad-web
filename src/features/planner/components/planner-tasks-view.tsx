"use client";

import { useMemo, useState } from "react";
import { previewContext } from "@/features/design-preview/data/fixture-context";
import { tasksFixture, type TaskDto } from "@/features/design-preview/data/planner-work-fixtures";
import {
  PlannerEmpty,
  PlannerModal,
  PlannerShell,
  PlannerStat,
} from "@/features/planner/components/planner-shell";
import { daysLabel, daysUntil, picLabels } from "@/features/planner/lib/presentation";

function groupTasks(tasks: readonly TaskDto[]) {
  const today = previewContext.now.slice(0, 10);
  const pending = tasks.filter((task) => task.status === "PENDING");
  return {
    late: pending.filter((task) => task.dueDate < today),
    today: pending.filter((task) => task.dueDate === today),
    week: pending.filter((task) => {
      const days = daysUntil(task.dueDate, previewContext.now);
      return days > 0 && days <= 7;
    }),
    later: pending.filter((task) => daysUntil(task.dueDate, previewContext.now) > 7),
    done: tasks.filter((task) => task.status === "DONE"),
  };
}

export function PlannerTasksView() {
  const [done, setDone] = useState<ReadonlySet<string>>(new Set());
  const [picFilter, setPicFilter] = useState("ALL");
  const [formOpen, setFormOpen] = useState(false);

  const withLocalState = useMemo(
    () =>
      tasksFixture.map((task) =>
        done.has(task.id) ? { ...task, status: "DONE" as const } : task,
      ),
    [done],
  );

  const visible = withLocalState.filter((task) => picFilter === "ALL" || task.pic === picFilter);
  const groups = groupTasks(visible);
  const doneCount = withLocalState.filter((task) => task.status === "DONE").length;
  const donePercent =
    withLocalState.length === 0 ? 0 : Math.round((doneCount / withLocalState.length) * 100);

  function toggle(id: string) {
    setDone((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const sections: readonly [string, readonly TaskDto[], string][] = [
    ["Terlambat", groups.late, "danger"],
    ["Hari ini", groups.today, "default"],
    ["Minggu ini", groups.week, "default"],
    ["Nanti", groups.later, "default"],
    ["Selesai", groups.done, "success"],
  ];

  return (
    <PlannerShell title="Tugas" code="PLN-06" subnav="/dashboard/planner/tasks">
      <div className="planner-summary">
        <PlannerStat
          label="Progres tugas"
          value={`${doneCount}/${withLocalState.length}`}
          note="Selesai (termasuk centang contoh di sesi ini)"
          icon="task-alt"
          tone="primary"
          progressPercent={donePercent}
        />
        <PlannerStat
          label="Terlambat"
          value={String(groups.late.length)}
          note="Perlu perhatian"
          icon="error"
          tone="secondary"
        />
        <PlannerStat
          label="Jatuh tempo minggu ini"
          value={String(groups.week.length)}
          note="7 hari ke depan"
          icon="schedule"
          tone="tertiary"
        />
      </div>

      <div className="actions" style={{ marginBottom: 20 }}>
        <button type="button" className="button" onClick={() => setFormOpen(true)}>
          Tambah tugas
        </button>
        <label style={{ marginLeft: "auto" }}>
          PIC
          <select value={picFilter} onChange={(event) => setPicFilter(event.target.value)}>
            <option value="ALL">Semua PIC</option>
            <option value="SELF">Saya</option>
            <option value="PARTNER">Pasangan</option>
            <option value="SHARED">Bersama</option>
          </select>
        </label>
      </div>

      {visible.length === 0 ? (
        <PlannerEmpty
          message="Belum ada tugas pada filter ini. Tambahkan persiapan pertama."
          action={{ label: "Tambah tugas", onClick: () => setFormOpen(true) }}
        />
      ) : (
        sections
          .filter(([, items]) => items.length > 0)
          .map(([label, items, tone]) => (
            <section className="planner-group" key={label}>
              <h2>
                {label} <small>· {items.length} tugas</small>
              </h2>
              <div className="planner-list">
                {items.map((task) => {
                  const isDone = task.status === "DONE";
                  const days = daysUntil(task.dueDate, previewContext.now);
                  const late = !isDone && days < 0;
                  return (
                    <label className="planner-checkbox-row" data-done={isDone} key={task.id}>
                      <input
                        type="checkbox"
                        checked={isDone}
                        onChange={() => toggle(task.id)}
                        aria-label={`Tandai ${task.title} ${isDone ? "belum selesai" : "selesai"}`}
                      />
                      <span className="planner-checkbox-title">
                        <strong>{task.title}</strong>
                        <small>
                          {picLabels[task.pic]} · {task.dueDate} ·{" "}
                          {isDone ? "Selesai" : daysLabel(days)}
                        </small>
                      </span>
                      {late && (
                        <span className="planner-badge" data-tone="danger">
                          ! Terlambat
                        </span>
                      )}
                      {tone === "success" && isDone && (
                        <span className="planner-badge" data-tone="success">
                          ✓ Selesai
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            </section>
          ))
      )}

      <p className="notice">
        Centang di halaman ini hanya mengubah tampilan sesi berjalan; belum ada penyimpanan status.
      </p>

      {formOpen && (
        <PlannerModal title="Tambah tugas (contoh)" onClose={() => setFormOpen(false)}>
          <div className="planner-form-grid">
            <label className="planner-span-2">
              Judul tugas
              <input placeholder="Contoh: Konfirmasi jumlah tamu ke katering" />
            </label>
            <label>
              PIC
              <select defaultValue="SHARED">
                <option value="SELF">Saya</option>
                <option value="PARTNER">Pasangan</option>
                <option value="SHARED">Bersama</option>
              </select>
            </label>
            <label>
              Tenggat
              <input type="date" />
            </label>
            <label className="planner-span-2">
              Catatan (opsional)
              <textarea rows={3} placeholder="Detail tambahan" />
            </label>
            <p className="planner-impact">
              Form contoh; belum ada penyimpanan. Tugas baru tidak akan tersimpan.
            </p>
          </div>
        </PlannerModal>
      )}
    </PlannerShell>
  );
}
