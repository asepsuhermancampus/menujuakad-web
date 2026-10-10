"use client";

import { useMemo, useState } from "react";
import { rundownFixture, type RundownItemDto } from "@/features/design-preview/data/planner-work-fixtures";
import {
  PlannerEmpty,
  PlannerModal,
  PlannerShell,
  PlannerTabs,
} from "@/features/planner/components/planner-shell";
import { picLabels } from "@/features/planner/lib/presentation";

export function PlannerRundownView() {
  const [order, setOrder] = useState<readonly RundownItemDto[]>(rundownFixture);
  const [formOpen, setFormOpen] = useState(false);
  const [exportNotice, setExportNotice] = useState(false);

  const items = useMemo(
    () => [...order].sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [order],
  );

  function move(id: string, direction: -1 | 1) {
    setOrder((previous) => {
      const index = previous.findIndex((item) => item.id === id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= previous.length) return previous;
      const next = [...previous];
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      return next;
    });
  }

  function remove(id: string) {
    setOrder((previous) => previous.filter((item) => item.id !== id));
  }

  return (
    <PlannerShell title="Rundown Acara" code="PLN-07" subnav="/dashboard/planner/rundown">
      <PlannerTabs
        tabs={[
          { key: "WEDDING", label: "Pernikahan" },
          { key: "ENGAGEMENT", label: "Lamaran" },
        ]}
        active="WEDDING"
        onChange={() => undefined}
      />

      <div className="planner-summary">
        <article>
          <h2>Jumlah item</h2>
          <strong>{items.length}</strong>
          <small>Susunan acara contoh</small>
        </article>
        <article>
          <h2>Mulai</h2>
          <strong>{items[0]?.startTime ?? "—"}</strong>
          <small>Item pertama</small>
        </article>
        <article>
          <h2>Selesai</h2>
          <strong>{items.at(-1)?.endTime ?? "—"}</strong>
          <small>Item terakhir</small>
        </article>
      </div>

      <div className="actions" style={{ marginBottom: 20 }}>
        <button type="button" className="button" onClick={() => setFormOpen(true)}>
          Tambah item
        </button>
        <button type="button" className="button secondary" onClick={() => setExportNotice(true)}>
          Export PDF (contoh)
        </button>
      </div>

      {exportNotice && (
        <p className="notice" role="status">
          Export contoh belum menghasilkan berkas. Fitur ekspor PDF memerlukan modul dokumen yang
          belum aktif.
        </p>
      )}

      {items.length === 0 ? (
        <PlannerEmpty
          message="Belum ada susunan acara. Tambahkan item pertama."
          action={{ label: "Tambah item", onClick: () => setFormOpen(true) }}
        />
      ) : (
        <div className="planner-timeline">
          {items.map((item, index) => (
            <article className="planner-timeline-item" key={item.id}>
              <div className="planner-timeline-time">
                {item.startTime}
                <br />
                <small style={{ color: "var(--color-taupe)", fontWeight: 400 }}>
                  s.d. {item.endTime}
                </small>
              </div>
              <div>
                <h3>{item.title}</h3>
                <p>
                  {picLabels[item.pic]}
                  {item.note ? ` · ${item.note}` : ""}
                </p>
              </div>
              <div className="planner-row-actions">
                <button
                  type="button"
                  className="button ghost"
                  onClick={() => move(item.id, -1)}
                  disabled={index === 0}
                  aria-label={`Naikkan ${item.title}`}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="button ghost"
                  onClick={() => move(item.id, 1)}
                  disabled={index === items.length - 1}
                  aria-label={`Turunkan ${item.title}`}
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="button ghost"
                  onClick={() => remove(item.id)}
                  aria-label={`Hapus ${item.title}`}
                >
                  Hapus
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <p className="notice">
        Urutan hanya berubah pada sesi ini; belum ada penyimpanan. Export PDF belum aktif.
      </p>

      {formOpen && (
        <PlannerModal title="Tambah item rundown (contoh)" onClose={() => setFormOpen(false)}>
          <div className="planner-form-grid">
            <label>
              Mulai
              <input type="time" defaultValue="09:00" />
            </label>
            <label>
              Selesai
              <input type="time" defaultValue="10:00" />
            </label>
            <label className="planner-span-2">
              Judul
              <input placeholder="Contoh: Prosesi akad" />
            </label>
            <label className="planner-span-2">
              Deskripsi (opsional)
              <textarea rows={2} />
            </label>
            <p className="planner-impact">Form contoh; belum ada penyimpanan.</p>
          </div>
        </PlannerModal>
      )}
    </PlannerShell>
  );
}
