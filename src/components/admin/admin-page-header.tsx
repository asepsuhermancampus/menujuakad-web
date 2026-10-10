import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/ui/icon";

/**
 * Kepala halaman area admin sesuai desain ADM-03…08 "Horizon Modern Style":
 * breadcrumb kecil, judul dengan lencana kode layar, satu kalimat penjelas, dan
 * deretan aksi di sisi kanan. Dipakai bersama oleh seluruh layar admin
 * operasional agar ritme halamannya konsisten.
 */
export function AdminPageHeader({
  title,
  code,
  lead,
  breadcrumb,
  actions,
}: {
  title: string;
  /**
   * Kode layar sumber Stitch. Hanya diisi bila layar ini memang punya padanan
   * desain; layar internal tanpa desain tidak diberi kode agar tidak mengklaim
   * sesuatu yang belum digambar.
   */
  code?: string;
  lead?: string;
  breadcrumb?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="admin-page-head">
      <div className="admin-page-head-lead">
        {/*
         * Label "DATA CONTOH" adalah kontrak jujur area admin: seluruh baris
         * berasal dari fixture sintetis, bukan dari database produksi.
         */}
        <p className="eyebrow">SUPERADMIN · DATA CONTOH</p>
        <p className="admin-crumb">
          <span>Admin Center</span>
          <Icon name="chevron-right" size={14} />
          <span>{breadcrumb ?? title}</span>
        </p>
        <div className="admin-page-title">
          <h1>{title}</h1>
          {code && <span className="admin-code">{code}</span>}
        </div>
        {lead && <p className="admin-lead">{lead}</p>}
      </div>
      {actions && <div className="admin-page-actions">{actions}</div>}
    </header>
  );
}

/**
 * Kartu metrik admin (ADM-03/04/08): label, angka besar, ikon berwarna per
 * peran, dan baris catatan dengan pemisah. `tone` mengikuti desain — violet
 * untuk data utama, peach untuk perhatian, biru untuk jadwal.
 */
export function AdminStatCard({
  label,
  value,
  note,
  hint,
  icon,
  tone = "primary",
}: {
  label: string;
  value: string;
  note?: string;
  hint?: string;
  icon: IconName;
  tone?: "primary" | "secondary" | "tertiary" | "danger";
}) {
  return (
    <article className="admin-stat" data-tone={tone}>
      <div className="admin-stat-main">
        <div>
          <p className="admin-stat-label">{label}</p>
          <strong className="tabular">{value}</strong>
        </div>
        <span className="admin-stat-icon">
          <Icon name={icon} size={22} />
        </span>
      </div>
      {(note || hint) && (
        <footer className="admin-stat-foot">
          {note && <span>{note}</span>}
          {hint && <small>{hint}</small>}
        </footer>
      )}
    </article>
  );
}

/**
 * Panel konten admin dengan kepala opsional. Menyatukan radius, hairline, dan
 * bayangan aura agar tidak ada kartu dengan bahasa visual berbeda.
 */
export function AdminPanel({
  title,
  hint,
  icon,
  children,
  className,
}: {
  title?: string;
  hint?: string;
  icon?: IconName;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={className ? `admin-panel ${className}` : "admin-panel"}>
      {title && (
        <header className="admin-panel-head">
          <h2>
            {icon && <Icon name={icon} size={18} />}
            <span>{title}</span>
          </h2>
          {hint && <span className="admin-panel-hint">{hint}</span>}
        </header>
      )}
      {children}
    </section>
  );
}
