"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { previewScreens, screenRecords, previewSourceGaps } from "../data/screens";
import type { PreviewAudience, PreviewScreen } from "../types";

/*
 * Preview Studio — satu halaman untuk menavigasi 63 kode / 74 varian.
 * Rancangan penggabungan: kartu per layar dihapus, diganti daftar ringkas
 * berkelompok per domain dengan pencarian, filter area, dan navigasi keyboard.
 * Route /preview-ui/{code} tetap dipertahankan agar tautan lama tidak putus.
 */
const audiences: readonly Readonly<{ id: PreviewAudience | "all"; label: string }>[] = [
  { id: "all", label: "Semua area" },
  { id: "public", label: "Publik" },
  { id: "auth", label: "Autentikasi" },
  { id: "customer", label: "Customer" },
  { id: "admin", label: "Superadmin" },
  { id: "invitation", label: "Undangan" },
  { id: "reference", label: "Referensi" },
];

const domainOrder = ["PUB", "AUT", "CUS", "EDT", "GST", "INV", "ACC", "SUP", "ADM", "ERR", "DS"] as const;
const domainLabels: Readonly<Record<string, string>> = {
  PUB: "Halaman Publik",
  AUT: "Autentikasi",
  CUS: "Dashboard Customer",
  EDT: "Editor Undangan",
  GST: "Manajemen Tamu",
  INV: "Undangan Tampil",
  ACC: "Akun & Notifikasi",
  SUP: "Dukungan",
  ADM: "Superadmin",
  ERR: "Halaman Error",
  DS: "Referensi Desain",
};

function screenName(screen: PreviewScreen): string {
  return screen.title.split("—")[1]?.trim() || screen.code;
}

export function PreviewGallery() {
  const [search, setSearch] = useState("");
  const [audience, setAudience] = useState<PreviewAudience | "all">("all");
  const [collapsed, setCollapsed] = useState<readonly string[]>([]);

  const filtered = useMemo(
    () =>
      previewScreens.filter(
        (screen) =>
          (audience === "all" || screen.audience === audience) &&
          `${screen.title} ${screen.code}`.toLowerCase().includes(search.toLowerCase()),
      ),
    [search, audience],
  );

  const grouped = useMemo(() => {
    const map = new Map<string, PreviewScreen[]>();
    for (const screen of filtered) {
      const domain = screen.code.split("-")[0];
      map.set(domain, [...(map.get(domain) ?? []), screen]);
    }
    return domainOrder
      .filter((domain) => map.has(domain))
      .map((domain) => [domain, map.get(domain) ?? []] as const);
  }, [filtered]);

  const toggle = (domain: string) =>
    setCollapsed((previous) =>
      previous.includes(domain) ? previous.filter((item) => item !== domain) : [...previous, domain],
    );

  return (
    <main id="main" className="container section preview-gallery">
      <p className="eyebrow">STITCH · MENUJU-AKAD-UIUX</p>
      <h1>Preview Studio</h1>
      <p>
        {previewScreens.length} kode layar · {screenRecords.length} varian sumber dalam{" "}
        {grouped.length} kelompok domain. Semua konten sintetis; interaksi lokal tidak menjalankan
        layanan nyata.
      </p>
      <p className="notice">
        Pratinjau frontend lintas peran. Identitas customer dan superadmin di sini bukan sesi
        terautentikasi. Gunakan pencarian dan filter untuk menemukan layar dengan cepat.
      </p>
      <div className="toolbar">
        <label className="search-field">
          Cari layar
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Kode atau nama layar, mis. GST-03 atau RSVP"
          />
        </label>
        <label>
          Area layar
          <select
            value={audience}
            onChange={(event) => setAudience(event.target.value as PreviewAudience | "all")}
          >
            {audiences.map(({ id, label }) => (
              <option value={id} key={id}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {grouped.map(([domain, screens]) => {
        const isCollapsed = collapsed.includes(domain);
        return (
          <section className="section preview-domain" key={domain}>
            <div className="section-heading">
              <div>
                <h2>
                  {domainLabels[domain] ?? domain}{" "}
                  <small className="muted">
                    {screens.length} layar · {screens.reduce((total, screen) => total + screen.variants.length, 0)} varian
                  </small>
                </h2>
              </div>
              <button
                type="button"
                className="button ghost"
                aria-expanded={!isCollapsed}
                onClick={() => toggle(domain)}
              >
                {isCollapsed ? "Buka kelompok" : "Ringkas kelompok"}
              </button>
            </div>
            {!isCollapsed && (
              <ul className="preview-list">
                {screens.map((screen) => (
                  <li className="preview-row" key={screen.code}>
                    <span className="badge">{screen.code}</span>
                    <div className="preview-row-main">
                      <Link href={`/preview-ui/${screen.code.toLowerCase()}`}>
                        {screenName(screen)}
                      </Link>
                      <small>{screen.logicalRoute ?? "—"}</small>
                    </div>
                    <div className="preview-row-variants">
                      {screen.variants.map((variant) => (
                        <Link
                          key={variant.id}
                          className="badge"
                          href={`/preview-ui/${screen.code.toLowerCase()}?variant=${variant.id}`}
                          title={`${variant.device} · ${variant.state}`}
                        >
                          {variant.device === "MOBILE" ? "M" : variant.device === "TABLET" ? "T" : "D"}
                          {variant.sourceStatus === "metadata-only" && " ·"}
                        </Link>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}

      {!filtered.length && <p role="status">Tidak ada layar sesuai pencarian.</p>}

      <section className="section">
        <h2>Keterbatasan Sumber</h2>
        {previewSourceGaps.map((gap) => (
          <p key={gap.code}>
            {gap.code}: {gap.reason}
          </p>
        ))}
        <p>
          CUS-05/06 memiliki layar preview khusus berdasarkan PNG valid. Fidelity seluruh layar
          masih memerlukan review browser; HTML sumber belum valid.
        </p>
      </section>
      <Link className="button secondary" href="/">
        Kembali ke beranda
      </Link>
    </main>
  );
}
