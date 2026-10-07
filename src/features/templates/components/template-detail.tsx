import Link from "next/link";
import type { TemplatePreviewDto } from "@/features/design-preview/data/fixtures";
import { InvitationMedia } from "@/components/shared/invitation-media";
export function TemplateDetail({ template }: { template: TemplatePreviewDto }) {
  return (
    <section className="container section">
      <p className="eyebrow">KATALOG DESAIN / {template.name}</p>
      <div className="detail-layout">
        <div className="detail-preview">
          <div className="preview-paper">
            <small>THE WEDDING OF</small>
            <h2>Sarah & Dimas</h2>
            <InvitationMedia kind={template.category} />
            <p>12 DESEMBER 2026</p>
          </div>
          <p>Ilustrasi contoh · tampilan responsif</p>
        </div>
        <div className="stack">
          <article className="card">
            <p className="eyebrow">{template.category}</p>
            <h1>{template.name}</h1>
            <p>{template.description}</p>
            <h3>Detail yang Dirancang</h3>
            <ul>
              <li>Tipografi editorial dan ruang yang lapang</li>
              <li>Informasi pasangan dan rangkaian acara</li>
              <li>Galeri, RSVP, dan buku ucapan contoh</li>
            </ul>
            <div className="swatches">
              {template.colors.map((c) => (
                <span
                  key={c}
                  className="swatch"
                  style={{ background: c }}
                  aria-label={`Warna ${c}`}
                />
              ))}
            </div>
          </article>
          <Link className="button" href={`/demo/${template.slug}`}>
            Lihat Demo Undangan
          </Link>
          <Link className="button secondary" href="/preview-ui/cus-03">
            Coba desain dalam pratinjau
          </Link>
        </div>
      </div>
    </section>
  );
}
