"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { AdminPageHeader, AdminPanel, AdminStatCard } from "@/components/admin/admin-page-header";
import {
  adminServiceHealthFixture,
  type AdminServiceHealthDto,
} from "@/features/design-preview/data/planner-admin-fixtures";

/*
 * ADM-08 — Infrastruktur, Server Health & Backup (Horizon Modern Style).
 *
 * PENTING — perbedaan sadar dari gambar desain: desain sumber memuat klaim
 * operasional yang tidak dapat dibuktikan aplikasi ini (uptime 99,99%, jumlah
 * pod Kubernetes, kapasitas memori node, mTLS, Cloudflare Enterprise,
 * AES-256-GCM, snapshot harian 14,8 GB ke multi-cloud). Tidak ada telemetri
 * semacam itu di lingkungan ini, sehingga menampilkannya akan menjadi klaim
 * palsu. Layar ini hanya menampilkan:
 *   1. Status yang berasal dari health check nyata (`/api/health`).
 *   2. Konfigurasi integrasi yang memang belum aktif, ditandai apa adanya.
 *   3. Keterbatasan backup/restore yang belum pernah diuji.
 */

type HealthResponse = {
  status: "ok" | "not_ready";
  checks: { application: "ok"; database: "ok" | "not_configured" | "unavailable" };
};

const statusLabels: Readonly<Record<AdminServiceHealthDto["status"], string>> = {
  ok: "Normal",
  not_configured: "Belum dikonfigurasi",
  unavailable: "Tidak tersedia",
};

export function AdminInfrastructureView() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [probeFailed, setProbeFailed] = useState(false);

  /*
   * Probe sekali saat halaman dibuka. Kegagalan jaringan ditandai sebagai
   * "tidak dapat diperiksa" — bukan dianggap normal, dan bukan dianggap rusak.
   */
  useEffect(() => {
    let cancelled = false;
    fetch("/api/health", { cache: "no-store" })
      .then(async (response) => {
        const body = (await response.json()) as HealthResponse;
        if (!cancelled) setHealth(body);
      })
      .catch(() => {
        if (!cancelled) setProbeFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const databaseStatus: AdminServiceHealthDto["status"] = probeFailed
    ? "unavailable"
    : !health
      ? "not_configured"
      : health.checks.database;

  const services = adminServiceHealthFixture.map((service) =>
    service.id === "svc-db" ? { ...service, status: databaseStatus } : service,
  );

  const okCount = services.filter((service) => service.status === "ok").length;

  return (
    <section className="planner-shell stack">
      <AdminPageHeader
        title="Infrastruktur, Server Health & Backup Data"
        code="ADM-08"
        breadcrumb="Infrastruktur & Server Health"
        lead="Status yang benar-benar dapat dibaca aplikasi: liveness proses, kesiapan basis data, dan konfigurasi integrasi."
      />

      <p className="notice">
        Layar ini sengaja <strong>tidak</strong> menampilkan angka uptime, jumlah pod, kapasitas
        memori, atau jaminan enkripsi seperti pada gambar desain sumber. Aplikasi tidak memiliki
        telemetri tersebut, sehingga menampilkannya akan menjadi klaim palsu.
      </p>

      <div className="admin-stat-grid">
        <AdminStatCard
          label="Status sistem terbaca"
          value={`${okCount} / ${services.length} Layanan`}
          note={health ? `Health check: ${health.status}` : "Menunggu hasil probe"}
          hint="Berasal dari /api/health"
          icon="monitor"
          tone={okCount === services.length ? "primary" : "secondary"}
        />
        <AdminStatCard
          label="Basis data"
          value={statusLabels[databaseStatus]}
          note="Probe SELECT 1 tanpa membaca data pelanggan"
          hint={probeFailed ? "Probe gagal dijalankan" : "Diperiksa saat halaman dibuka"}
          icon="backup"
          tone={databaseStatus === "ok" ? "tertiary" : "danger"}
        />
        <AdminStatCard
          label="Uji pemulihan data"
          value="Belum pernah diuji"
          note="Backup otomatis belum aktif"
          hint="Restore produksi masih terbuka"
          icon="shield"
          tone="danger"
        />
      </div>

      <AdminPanel
        title="Status Kesehatan Layanan"
        icon="monitor"
        hint="GET /api/health · tanpa cache"
      >
        <ul className="admin-service-list">
          {services.map((service) => (
            <li key={service.id} data-status={service.status}>
              <span className="admin-service-dot" aria-hidden="true" />
              <div>
                <strong>{service.name}</strong>
                <small>{service.note}</small>
              </div>
              <span
                className="planner-badge"
                data-tone={service.status === "ok" ? "success" : "warning"}
              >
                {statusLabels[service.status]}
              </span>
            </li>
          ))}
        </ul>
      </AdminPanel>

      <AdminPanel title="Batasan operasional yang tercatat" icon="shield">
        <ul className="admin-limits">
          {[
            "Backup otomatis terjadwal belum dikonfigurasi pada lingkungan ini.",
            "Restore basis data belum pernah diuji; rencana pemulihan masih berupa dokumen.",
            "Alert eksternal dan pemantauan uptime belum terpasang.",
            "Gateway pembayaran (Mayar) dan provider email belum aktif.",
          ].map((item) => (
            <li key={item}>
              <Icon name="error" size={16} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </AdminPanel>
    </section>
  );
}
