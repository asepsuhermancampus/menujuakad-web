"use client";
import Link from "next/link";
import { useState } from "react";
import { previewScreens, screenRecords, previewSourceGaps } from "../data/screens";
export function PreviewGallery() {
  const [search, setSearch] = useState("");
  const [audience, setAudience] = useState("all");
  const filtered = previewScreens.filter(
    (screen) =>
      (audience === "all" || screen.audience === audience) &&
      `${screen.title} ${screen.code}`.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <main id="main" className="container section preview-gallery">
      <p className="eyebrow">STITCH · MENUJU-AKAD-UIUX</p>
      <h1>Galeri UI Menuju Akad</h1>
      <p>
        {previewScreens.length} kode layar · {screenRecords.length} varian sumber. Seluruh konten
        menggunakan data sintetis; interaksi lokal tidak menjalankan layanan nyata.
      </p>
      <p className="notice">
        Galeri ini merupakan pratinjau frontend lintas peran. Identitas customer dan superadmin di
        sini bukan sesi yang terautentikasi.
      </p>
      <div className="toolbar">
        <label>
          Cari layar
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Kode atau nama layar"
          />
        </label>
        <label>
          Area layar
          <select value={audience} onChange={(e) => setAudience(e.target.value)}>
            <option value="all">Semua area</option>
            {[
              ["public", "Publik"],
              ["auth", "Autentikasi"],
              ["customer", "Customer"],
              ["admin", "Superadmin"],
              ["invitation", "Undangan"],
              ["reference", "Referensi"],
            ].map(([id, label]) => (
              <option value={id} key={id}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="grid-three">
        {filtered.map((screen) => (
          <article className="card stack" key={screen.code}>
            <span className="badge">
              {screen.code} · {screen.audience}
            </span>
            <h2 className="preview-card-title">
              <Link href={`/preview-ui/${screen.code.toLowerCase()}`}>
                {screen.title.split("—")[1]?.trim() || screen.code}
              </Link>
            </h2>
            <p>{screen.logicalRoute}</p>
            <details>
              <summary>{screen.variants.length} varian sumber</summary>
              <ul>
                {screen.variants.map((variant) => (
                  <li key={variant.id}>
                    <Link href={`/preview-ui/${screen.code.toLowerCase()}?variant=${variant.id}`}>
                      {variant.device} · {variant.state}
                    </Link>
                    {variant.sourceStatus === "metadata-only" && " · tanpa screenshot"}
                  </li>
                ))}
              </ul>
            </details>
          </article>
        ))}
      </div>
      {!filtered.length && <p role="status">Tidak ada layar sesuai pencarian.</p>}
      <section className="section">
        <h2>Keterbatasan Sumber</h2>
        {previewSourceGaps.map((gap) => (
          <p key={gap.code}>
            {gap.code}: {gap.reason}
          </p>
        ))}
        <p>
          Penyesuaian CUS-05/06 tersedia sebagai pelengkap pada ringkasan undangan; fidelity
          visualnya belum terverifikasi.
        </p>
      </section>
      <Link className="button secondary" href="/">
        Kembali ke beranda
      </Link>
    </main>
  );
}
