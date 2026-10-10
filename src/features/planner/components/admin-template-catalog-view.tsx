"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { AdminPageHeader, AdminPanel, AdminStatCard } from "@/components/admin/admin-page-header";
import {
  adminTemplateCategoryLabels,
  adminTemplateStatusLabels,
  adminTemplateTierLabels,
  adminTemplatesFixture,
} from "@/features/design-preview/data/planner-admin-fixtures";
import { PlannerEmpty, PlannerModal } from "@/features/planner/components/planner-shell";

/*
 * ADM-04 — Manajemen Template & Katalog Desain (Horizon Modern Style).
 *
 * Tata letak mengikuti desain: tiga kartu metrik, deretan tab kategori, lalu
 * grid kartu template. Seluruh angka adopsi/penilaian diberi label contoh
 * karena tidak ada statistik layanan nyata; aksi publikasi hanya mengubah
 * state lokal dan tidak menyentuh katalog produksi.
 */

const categoryTabs = [
  { key: "ALL", label: "Semua Template" },
  { key: "EDITORIAL", label: "Editorial" },
  { key: "MODERN", label: "Luminous Modern" },
  { key: "FLORAL", label: "Floral Minimal" },
  { key: "DARK", label: "Dark Luxury" },
] as const;

export function AdminTemplateCatalogView() {
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [notice, setNotice] = useState<string | null>(null);
  const [publishTarget, setPublishTarget] = useState<string | null>(null);

  const rows = adminTemplatesFixture.filter(
    (template) => activeCategory === "ALL" || template.category === activeCategory,
  );
  const publishedCount = adminTemplatesFixture.filter((t) => t.status === "PUBLISHED").length;
  const draftCount = adminTemplatesFixture.length - publishedCount;

  return (
    <section className="planner-shell stack">
      <AdminPageHeader
        title="Katalog Template & Kurasi Desain"
        code="ADM-04"
        breadcrumb="Manajemen Template & Katalog Desain"
        lead="Kelola ketersediaan tema, status publikasi template, dan unggah varian preset baru pada data contoh."
      />

      <p className="notice">
        Katalog contoh. Publikasi dan unggahan preset belum mengubah katalog produksi; angka adopsi
        dan penilaian di bawah adalah ilustrasi tata letak, bukan statistik layanan.
      </p>

      {notice && (
        <p className="notice" role="status">
          {notice}
        </p>
      )}

      <div className="admin-stat-grid">
        <AdminStatCard
          label="Total template"
          value={`${adminTemplatesFixture.length} Tema`}
          note="Data contoh"
          hint={`${publishedCount} terbit · ${draftCount} draf`}
          icon="inventory"
          tone="primary"
        />
        <AdminStatCard
          label="Template paling banyak dipakai"
          value="Serenade No. 1"
          note="412 pasangan (contoh)"
          hint="Ilustrasi tata letak"
          icon="sparkle"
          tone="secondary"
        />
        <AdminStatCard
          label="Skor kepuasan"
          value="4,9 / 5,0"
          note="920 ulasan (contoh)"
          hint="Bukan metrik layanan nyata"
          icon="task-alt"
          tone="tertiary"
        />
      </div>

      <AdminPanel title="Kategori" icon="palette" hint="Saring katalog per gaya desain">
        <div className="planner-tabs" role="tablist">
          {categoryTabs.map((tab) => {
            const count =
              tab.key === "ALL"
                ? adminTemplatesFixture.length
                : adminTemplatesFixture.filter((t) => t.category === tab.key).length;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={activeCategory === tab.key}
                onClick={() => setActiveCategory(tab.key)}
              >
                {tab.label} ({count})
              </button>
            );
          })}
        </div>
      </AdminPanel>

      {rows.length === 0 ? (
        <PlannerEmpty message="Belum ada template pada kategori ini." />
      ) : (
        <div className="admin-template-grid">
          {rows.map((template) => (
            <article className="admin-template-card" key={template.id}>
              <div className="admin-template-art" aria-hidden="true">
                <span>{template.name.slice(0, 1)}</span>
              </div>
              <div className="admin-template-body">
                <header>
                  <h3>{template.name}</h3>
                  <span
                    className="planner-badge"
                    data-tone={template.status === "PUBLISHED" ? "success" : "warning"}
                  >
                    {adminTemplateStatusLabels[template.status]}
                  </span>
                </header>
                <p>
                  {adminTemplateCategoryLabels[template.category]} ·{" "}
                  {adminTemplateTierLabels[template.tier]}
                </p>
                <dl className="admin-template-meta">
                  <div>
                    <dt>Adopsi</dt>
                    <dd>{template.adoptedLabel}</dd>
                  </div>
                  <div>
                    <dt>Penilaian</dt>
                    <dd>{template.ratingLabel}</dd>
                  </div>
                </dl>
                <footer>
                  <button
                    type="button"
                    className="button ghost"
                    onClick={() =>
                      setNotice(
                        template.status === "PUBLISHED"
                          ? `${template.name} sudah terbit pada katalog contoh.`
                          : `Publikasi ${template.name} dicatat (contoh). Katalog produksi belum berubah.`,
                      )
                    }
                  >
                    {template.status === "PUBLISHED" ? "Lihat publikasi" : "Terbitkan"}
                  </button>
                  <button
                    type="button"
                    className="button ghost"
                    onClick={() => setPublishTarget(template.id)}
                  >
                    Sunting preset
                  </button>
                </footer>
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="actions">
        <button
          type="button"
          className="button"
          onClick={() =>
            setNotice("Unggah preset baru belum tersedia; unggahan berkas menunggu backend media.")
          }
        >
          <Icon name="add-circle" size={18} />
          <span>Terbitkan Desain Baru</span>
        </button>
      </div>

      {publishTarget && (
        <PlannerModal title="Sunting preset (contoh)" onClose={() => setPublishTarget(null)}>
          <p>
            Penyuntingan preset memerlukan penyimpanan berkas dan backend katalog yang belum aktif.
            Panel ini hanya menandai niat, tanpa mengubah data apa pun.
          </p>
          <div className="planner-modal-actions">
            <button
              type="button"
              className="button"
              onClick={() => {
                setNotice("Penyuntingan preset dicatat (contoh). Tidak ada berkas yang diunggah.");
                setPublishTarget(null);
              }}
            >
              Mengerti
            </button>
          </div>
        </PlannerModal>
      )}
    </section>
  );
}
