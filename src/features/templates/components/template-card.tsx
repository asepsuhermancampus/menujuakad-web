import Link from "next/link";
import type { TemplatePreviewDto } from "@/features/design-preview/data/fixtures";
import { InvitationMedia } from "@/components/shared/invitation-media";
export function TemplateCard({ template }: { template: TemplatePreviewDto }) {
  return (
    <article className="template-card">
      <Link
        className={`template-art tone-${template.category.toLowerCase()}`}
        href={`/templates/${template.slug}`}
        aria-label={`Lihat ${template.name}`}
      >
        <div className="invitation-mini">
          <small>THE WEDDING OF</small>
          <h3>Sarah & Dimas</h3>
          <InvitationMedia kind={template.category} />
          <small>12 · 12 · 2026</small>
        </div>
      </Link>
      <div className="template-copy">
        <small>{template.category}</small>
        <h3>{template.name}</h3>
        <p>{template.description}</p>
        <div className="actions">
          <Link className="button" href={`/templates/${template.slug}`}>
            Lihat Desain
          </Link>
          <Link href={`/demo/${template.slug}`}>Demo ↗</Link>
        </div>
      </div>
    </article>
  );
}
