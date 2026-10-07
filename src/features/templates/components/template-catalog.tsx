"use client";
import { useState } from "react";
import { templatesFixture } from "@/features/design-preview/data/fixtures";
import { TemplateCard } from "./template-card";
export function TemplateCatalog() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Semua");
  const filtered = templatesFixture.filter(
    (t) =>
      (category === "Semua" || t.category === category) &&
      `${t.name} ${t.description}`.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <section className="container section">
      <p className="eyebrow">KOLEKSI PILIHAN</p>
      <h1>Koleksi Desain Undangan</h1>
      <p className="muted">Komposisi yang tenang untuk cerita yang ingin kalian bagikan.</p>
      <div className="toolbar">
        <label className="search-field">
          Cari desain
          <input
            placeholder="Cari nama atau gaya desain..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <div className="tabs">
          {["Semua", "EDITORIAL", "BOTANICAL", "MINIMAL"].map((c) => (
            <button key={c} aria-pressed={category === c} onClick={() => setCategory(c)}>
              {c}
            </button>
          ))}
        </div>
      </div>
      <div className="grid-three">
        {filtered.map((t) => (
          <TemplateCard key={t.id} template={t} />
        ))}
      </div>
      {!filtered.length && <p role="status">Desain tidak ditemukan. Coba kata lain.</p>}
    </section>
  );
}
