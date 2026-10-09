import Link from "next/link";
import type { InvitationPreviewDto } from "@/features/design-preview/data/fixtures";
import { FloralArt } from "@/components/shared/floral-art";
export function InvitationSummaryCard({ invitation }: { invitation: InvitationPreviewDto }) {
  return (
    <article className="card invitation-summary-card">
      <FloralArt />
      <div className="stack">
        <div className="actions">
          <span className="badge">
            {invitation.status === "DRAFT" ? "Draft" : "Aktif (contoh)"}
          </span>
          <span className="badge">
            {invitation.isPublished ? "Terbit (contoh)" : "Belum diterbitkan"}
          </span>
        </div>
        <h3>{invitation.title}</h3>
        <p>12 Desember 2026 · Serenade No. 1</p>
        <div className="actions">
          <Link className="button" href="/preview-ui/edt-01">
            Edit Undangan
          </Link>
          <Link className="button secondary" href="/preview-ui/cus-04">
            Kelola Detail
          </Link>
        </div>
      </div>
    </article>
  );
}
