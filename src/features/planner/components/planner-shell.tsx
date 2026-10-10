"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { EventContext } from "@/features/design-preview/data/planner-finance-fixtures";

/**
 * Navigasi modul perencanaan. Pemilih konteks acara adalah kontrol lokal
 * (belum tersimpan) agar dua konteks tidak tercampur saat pemeriksaan UI.
 * Sub-navigasi dirender horizontal agar tidak membuat sidebar bersarang di
 * dalam shell customer yang sudah ada.
 */

const plannerLinks = [
  { href: "/dashboard/planner", label: "Ringkasan" },
  { href: "/dashboard/planner/savings", label: "Tabungan" },
  { href: "/dashboard/planner/budget", label: "Anggaran" },
  { href: "/dashboard/planner/expenses", label: "Pengeluaran" },
  { href: "/dashboard/planner/tasks", label: "Tugas" },
  { href: "/dashboard/planner/rundown", label: "Rundown" },
  { href: "/dashboard/planner/vendors", label: "Vendor" },
  { href: "/dashboard/planner/seserahan", label: "Seserahan" },
  { href: "/dashboard/planner/requirements", label: "Persyaratan" },
  { href: "/dashboard/planner/engagement", label: "Lamaran" },
  { href: "/dashboard/planner/moodboard", label: "Moodboard" },
  { href: "/dashboard/planner/wedding-kit", label: "Wedding Kit" },
  { href: "/dashboard/planner/couple", label: "Pasangan" },
] as const;

export function PlannerSubNav({ current }: { current?: string }) {
  const pathname = usePathname();
  const active = current ?? pathname;
  return (
    <nav className="planner-subnav" aria-label="Modul perencanaan">
      {plannerLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          aria-current={active === link.href ? "page" : undefined}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

export function PlannerContextPicker({
  value,
  onChange,
}: {
  value: EventContext;
  onChange: (next: EventContext) => void;
}) {
  return (
    <div className="planner-context">
      <strong>Konteks acara</strong>
      <div className="planner-context-options" role="group" aria-label="Pilih konteks acara">
        {(
          [
            ["WEDDING", "Pernikahan"],
            ["ENGAGEMENT", "Lamaran"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={`button ${value === key ? "" : "secondary"}`}
            aria-pressed={value === key}
            onClick={() => onChange(key)}
          >
            {label}
          </button>
        ))}
      </div>
      <span className="planner-badge">Pilihan contoh · belum tersimpan</span>
    </div>
  );
}

export function PlannerShell({
  title,
  code,
  children,
  subnav,
}: {
  title: string;
  code: string;
  children: React.ReactNode;
  subnav?: string;
}) {
  const [context, setContext] = useState<EventContext>("WEDDING");
  return (
    <section className="planner-shell stack">
      <div className="workspace-title">
        <div>
          <p className="eyebrow">PERENCANAAN · DATA CONTOH</p>
          <h1>{title}</h1>
        </div>
        <span className="badge">{code}</span>
      </div>
      <PlannerSubNav current={subnav} />
      <PlannerContextPicker value={context} onChange={setContext} />
      <p className="notice">
        Modul perencanaan menampilkan fixture sintetis. Belum ada penyimpanan, sinkronisasi pasangan,
        atau layanan pembayaran yang aktif.
      </p>
      {children}
    </section>
  );
}

export function PlannerEmpty({
  message,
  action,
}: {
  message: string;
  action?: { label: string; onClick?: () => void };
}) {
  return (
    <div className="planner-empty">
      <p>{message}</p>
      {action && (
        <button type="button" className="button" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
}

export function PlannerModal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="planner-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="planner-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <h2>{title}</h2>
        {children}
        <div className="planner-modal-actions">
          <button type="button" className="button secondary" onClick={onClose}>
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

export function PlannerTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: readonly { key: string; label: string }[];
  active: string;
  onChange: (key: string) => void;
}) {
  return (
    <div className="planner-tabs" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          role="tab"
          aria-selected={active === tab.key}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
