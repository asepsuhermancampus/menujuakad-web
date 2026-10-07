"use client";
import type { EditorPreviewDto } from "@/features/design-preview/data/fixtures";
import { useGalleryPreview } from "../../hooks/use-gallery-preview";
export function GalleryPanel({ fixture }: { fixture: EditorPreviewDto }) {
  const gallery = useGalleryPreview(
    fixture.gallery,
    fixture.galleryQuota.limit,
    fixture.galleryQuota.used,
  );
  return (
    <>
      <h1>Galeri Momen</h1>
      <p>Susun kenangan yang ingin kalian bagikan.</p>
      <article className="card stack">
        <div className="section-heading">
          <h2>Foto & Ilustrasi</h2>
          <span className="badge">
            {gallery.used} / {fixture.galleryQuota.limit} contoh
          </span>
        </div>
        <p>Batas contoh 5 MB per berkas. Unggahan nyata belum tersedia.</p>
        <button className="button secondary" onClick={gallery.addExample}>
          Tambahkan ilustrasi contoh
        </button>
        <div className="grid-two">
          {gallery.items.map((item) => (
            <article className="card stack" key={item.id}>
              <div className={`gallery-placeholder ${item.status === "ERROR" ? "danger" : ""}`}>
                {item.label}
              </div>
              {item.status === "ERROR" && (
                <p className="notice danger">
                  Berkas contoh melebihi batas ukuran. Pilih ilustrasi lain.
                </p>
              )}
              <button
                className="button secondary"
                onClick={() => gallery.remove(item.id)}
                aria-label={`Hapus ${item.label}`}
              >
                Hapus dari pratinjau
              </button>
            </article>
          ))}
        </div>
        {gallery.used >= fixture.galleryQuota.limit && (
          <p className="notice danger">Kuota sumber contoh telah mencapai batas paket.</p>
        )}
        {gallery.message && <p role="status">{gallery.message}</p>}
      </article>
    </>
  );
}
