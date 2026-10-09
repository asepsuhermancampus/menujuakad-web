"use client";
import Link from "next/link";
import { EditorPhoneContent } from "./editor-phone-content";
import { Brand } from "@/components/shared/brand";
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
  return (
    <>
      <header className="workspace-header">
        <Brand />
        <Link href="/preview-ui/cus-04">← Ringkasan Undangan</Link>
        <span className="badge">{editor.dirty ? "Perubahan lokal" : "Data contoh"}</span>
      </header>
      <main id="main" className={`editor-layout ${code === "EDT-08" ? "publish-editor" : ""}`}>
        <nav className="editor-nav" aria-label="Bagian editor">
          {sections.map(([id, label]) => (
            <Link
              key={id}
              href={`/preview-ui/${id.toLowerCase()}`}
              aria-current={
                code === id || (code === "EDT-01" && id === "EDT-02") ? "page" : undefined
              }
            >
              {label}
            </Link>
          ))}
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
