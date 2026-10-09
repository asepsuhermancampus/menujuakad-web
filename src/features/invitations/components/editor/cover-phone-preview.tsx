import { InvitationMedia } from "@/components/shared/invitation-media";
import type { EditorDraft } from "../../lib/editor-draft";
export function CoverPhonePreview({ draft }: { draft: EditorDraft }) {
  const font = draft.coverTypography === "UI" ? "var(--font-body)" : "var(--font-editorial)";
  const mode = draft.coverMode;
  return (
    <div
      className={`cover-phone-preview cover-${mode.toLowerCase()}`}
      data-cover-mode={mode}
      data-overlay={draft.coverOverlay}
      style={{ background: draft.coverColor, fontFamily: font }}
    >
      <small>THE WEDDING OF</small>
      {mode === "PORTRAIT" && (
        <div
          className="cover-media-layer"
          style={{ filter: `brightness(${1 - Number(draft.coverOverlay) / 100})` }}
        >
          <InvitationMedia portrait />
        </div>
      )}
      <h2 style={{ fontFamily: font }}>{draft.title || "Judul Undangan"}</h2>
      {mode === "TYPE_FOCUS" && <div className="cover-type-rule" aria-hidden="true" />}
      <p>{draft.subtitle}</p>
      <p>12 DESEMBER 2026</p>
      <small>
        {mode === "TYPE_FOCUS" ? "Type Focus" : mode === "PORTRAIT" ? "Portrait" : "Solid"} ·
        ilustrasi lokal
      </small>
    </div>
  );
}
