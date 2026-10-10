"use client";
import Link from "next/link";
import { EditorPhoneContent } from "./editor-phone-content";
import { Icon } from "@/components/ui/icon";
import { editorFixture, galleryErrorFixture } from "@/features/design-preview/data/fixtures";
import { useEditorDraft } from "../../hooks/use-editor-draft";
import { EditorPanel } from "./editor-panel";
const sections = [
  ["EDT-02", "Sampul"],
  ["EDT-03", "Pasangan"],
  ["EDT-04", "Kisah cinta"],
  ["EDT-16", "Ayat & mukadimah"],
  ["EDT-05", "Acara"],
  ["EDT-15", "Lokasi & peta"],
  ["EDT-17", "Susunan acara"],
  ["EDT-18", "Protokol acara"],
  ["EDT-06", "Galeri"],
  ["EDT-07", "RSVP"],
  ["EDT-09", "Musik latar"],
  ["EDT-10", "Panduan tamu"],
  ["EDT-11", "Video"],
  ["EDT-12", "Hitung mundur"],
  ["EDT-13", "Siaran langsung"],
  ["EDT-14", "Tagar & Filter"],
  ["EDT-19", "Kontak narahubung"],
  ["EDT-20", "Kolofon & kredit"],
  ["EDT-08", "Periksa & Terbitkan"],
];
export function EditorPreview({
  code,
  errorState = false,
}: {
  code: string;
  errorState?: boolean;
}) {
  const fixture = errorState ? galleryErrorFixture : editorFixture;
  const editor = useEditorDraft(fixture);
  /*
   * Bilah status editor mengikuti desain EDT-01: breadcrumb kembali ke
   * ringkasan undangan, identitas template, indikator simpan otomatis, dan
   * progres kelengkapan. Semua angka berasal dari fixture contoh.
   */
  const filledSections = sections.length;
  const progressPercent = Math.round((filledSections / sections.length) * 100);
  return (
    <>
      <header className="editor-header">
        <div className="editor-header-lead">
          <Link className="editor-back" href="/preview-ui/cus-04">
            <Icon name="arrow-forward" size={16} />
            <span>Ringkasan Undangan</span>
          </Link>
          <span className="editor-header-divider" aria-hidden="true" />
          <div className="editor-header-title">
            <strong>Menuju Akad</strong>
            <small>Serenade No. 1 · Sarah &amp; Dimas</small>
          </div>
        </div>

        <div className="editor-header-status">
          <span className="editor-save-state">
            <Icon name="task-alt" size={14} />
            <span>
              {editor.dirty ? "Perubahan lokal belum disimpan" : "Draf tersimpan otomatis"}
            </span>
          </span>
          <span className="editor-header-divider" aria-hidden="true" />
          <div
            className="editor-progress"
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Kelengkapan bagian undangan contoh"
          >
            <span style={{ width: `${progressPercent}%` }} />
          </div>
          <small className="tabular">
            {progressPercent}% terisi ({filledSections}/{sections.length})
          </small>
        </div>

        <div className="editor-header-actions">
          <Link className="button secondary" href={`/preview-ui/${code.toLowerCase()}`}>
            <Icon name="visibility" size={16} />
            <span>Pratinjau</span>
          </Link>
          <Link className="button" href="/preview-ui/edt-08">
            <span>Periksa &amp; Terbitkan</span>
            <Icon name="arrow-forward" size={16} />
          </Link>
        </div>
      </header>
      <main id="main" className={`editor-layout ${code === "EDT-08" ? "publish-editor" : ""}`}>
        <nav className="editor-nav" aria-label="Bagian editor">
          <p className="editor-nav-label">Struktur Undangan</p>
          <p className="editor-nav-hint">{sections.length} modul tersedia</p>
          {sections.map(([id, label], index) => {
            const active = code === id || (code === "EDT-01" && id === "EDT-02");
            return (
              <Link
                key={id}
                href={`/preview-ui/${id.toLowerCase()}`}
                aria-current={active ? "page" : undefined}
              >
                <span className="editor-nav-index tabular">{index + 1}</span>
                <span className="editor-nav-text">{label}</span>
                <Icon name="task-alt" size={14} />
              </Link>
            );
          })}
        </nav>
        <section className="editor-panel">
          <EditorPanel
            code={code}
            fixture={fixture}
            draft={editor.draft}
            update={editor.update}
            notify={editor.setMessage}
          />
          <footer className="editor-footer">
            <p role="status">{editor.message}</p>
            <button className="button" onClick={editor.save}>
              Simpan perubahan lokal
            </button>
          </footer>
        </section>
        <aside className="phone-column">
          <p className="eyebrow">PRATINJAU BAGIAN · DATA CONTOH</p>
          <div className="phone-frame">
            <div className="phone-notch" />
            <EditorPhoneContent code={code} draft={editor.draft} />
          </div>
          <Link href="/preview-ui/inv-02">Buka pratinjau penuh →</Link>
        </aside>
      </main>
    </>
  );
}
