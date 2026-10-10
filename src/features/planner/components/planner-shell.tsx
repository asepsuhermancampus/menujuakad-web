"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Icon, type IconName } from "@/components/ui/icon";
import type { EventContext } from "@/features/design-preview/data/planner-finance-fixtures";

/**
 * Kerangka modul perencanaan sesuai desain Stitch PLN-01/02 "Horizon Modern
 * Style": bilah modul vertikal (240px di desktop, gulir horizontal di layar
 * sempit), judul halaman dengan breadcrumb, pemilih konteks acara, dan label
 * data contoh.
 *
 * Sub-navigasi dirender sebagai baris horizontal yang dapat digulir — bukan
 * sidebar bersarang — karena halaman sudah berada di dalam shell customer.
 */

const plannerLinks: readonly { href: string; label: string; icon: IconName }[] = [
  { href: "/dashboard/planner", label: "Ringkasan", icon: "grid" },
  { href: "/dashboard/planner/savings", label: "Tabungan", icon: "savings" },
  { href: "/dashboard/planner/budget", label: "Anggaran", icon: "wallet" },
  { href: "/dashboard/planner/expenses", label: "Pengeluaran", icon: "receipt" },
  { href: "/dashboard/planner/tasks", label: "Tugas", icon: "checklist" },
  { href: "/dashboard/planner/rundown", label: "Rundown", icon: "schedule" },
  { href: "/dashboard/planner/vendors", label: "Vendor", icon: "storefront" },
  { href: "/dashboard/planner/seserahan", label: "Seserahan", icon: "gift" },
  { href: "/dashboard/planner/requirements", label: "Persyaratan", icon: "task" },
  { href: "/dashboard/planner/engagement", label: "Lamaran", icon: "favorite" },
  { href: "/dashboard/planner/moodboard", label: "Moodboard", icon: "palette" },
  { href: "/dashboard/planner/wedding-kit", label: "Wedding Kit", icon: "inventory" },
  { href: "/dashboard/planner/couple", label: "Pasangan", icon: "group" },
];

export function PlannerSubNav({ current }: { current?: string }) {
  const pathname = usePathname();
  const active = current ?? pathname;
  return (
    <nav className="planner-nav" aria-label="Modul perencanaan">
      {plannerLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          aria-current={active === link.href ? "page" : undefined}
        >
          <Icon name={link.icon} />
          <span>{link.label}</span>
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
    <div className="planner-context" role="group" aria-label="Pilih konteks acara">
      {(
        [
          ["WEDDING", "Pernikahan", "favorite"],
          ["ENGAGEMENT", "Lamaran", "sparkle"],
        ] as const
      ).map(([key, label, icon]) => (
        <button key={key} type="button" aria-pressed={value === key} onClick={() => onChange(key)}>
          <Icon name={icon} size={16} />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}

export function PlannerShell({
  title,
  code,
  lead,
  breadcrumb,
  children,
  subnav,
  actions,
}: {
  title: string;
  code: string;
  /** Kalimat pengantar di bawah judul; opsional agar shell tetap ringkas. */
  lead?: string;
  breadcrumb?: string;
  children: React.ReactNode;
  subnav?: string;
  actions?: React.ReactNode;
}) {
  const [context, setContext] = useState<EventContext>("WEDDING");
  return (
    <section className="planner-shell stack">
      <div className="planner-topbar">
        <div className="planner-topbar-lead">
          {/*
           * Label "DATA CONTOH" adalah kontrak jujur modul perencanaan: seluruh
           * angka berasal dari fixture sintetis, bukan dari database pengguna.
           */}
          <p className="eyebrow">PERENCANAAN · DATA CONTOH</p>
          <p className="planner-crumb">
            <span>Perencanaan Pernikahan</span>
            <span aria-hidden="true">/</span>
            <span>{breadcrumb ?? title}</span>
          </p>
          <h1>{title}</h1>
          {lead && <p className="planner-lead">{lead}</p>}
        </div>
        <div className="planner-topbar-side">
          <PlannerContextPicker value={context} onChange={setContext} />
          <span className="planner-code" title="Kode layar sumber desain">
            {code}
          </span>
        </div>
      </div>

      <PlannerSubNav current={subnav} />

      {actions && <div className="planner-actions">{actions}</div>}

      <p className="planner-note">
        <Icon name="sparkle" size={16} />
        <span>
          Data contoh · belum tersimpan. Modul perencanaan menampilkan fixture sintetis; belum ada
          penyimpanan, sinkronisasi pasangan, atau layanan pembayaran yang aktif.
        </span>
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

/**
 * Kartu ringkasan metrik. `tone` menentukan warna ikon/lencana sesuai peran
 * metrik pada desain (violet = dana, peach = anggaran, biru = tugas).
 */
export function PlannerStat({
  label,
  value,
  note,
  icon,
  tone = "primary",
  progressPercent,
}: {
  label: string;
  value: string;
  note?: string;
  icon: IconName;
  tone?: "primary" | "secondary" | "tertiary";
  progressPercent?: number;
}) {
  const clamped =
    progressPercent === undefined ? undefined : Math.max(0, Math.min(100, progressPercent));
  // Dibulatkan dua desimal: nilai mentah menghasilkan deretan angka panjang di
  // atribut style yang tidak berguna dan menyulitkan pemeriksaan markup.
  const barWidth = clamped === undefined ? undefined : `${clamped.toFixed(2)}%`;
  return (
    <article className="planner-stat" data-tone={tone}>
      <header>
        <span>{label}</span>
        <span className="planner-stat-icon">
          <Icon name={icon} size={18} />
        </span>
      </header>
      <strong className="tabular">{value}</strong>
      {note && <small className="tabular">{note}</small>}
      {clamped !== undefined && (
        <div
          className="planner-bar"
          role="progressbar"
          aria-valuenow={Math.round(clamped)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={label}
        >
          <span style={{ width: barWidth }} />
        </div>
      )}
    </article>
  );
}
