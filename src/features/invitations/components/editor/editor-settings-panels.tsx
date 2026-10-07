"use client";
import { EditorField, EditorToggle, type EditorFieldProps } from "./editor-field";
import { editorFixture } from "@/features/design-preview/data/fixtures";
export function RsvpPanel(props: EditorFieldProps) {
  return (
    <>
      <h1>Konfigurasi RSVP</h1>
      <p>Atur cara tamu mengonfirmasi kehadiran.</p>
      <article className="card stack">
        <EditorToggle {...props} name="rsvpEnabled" label="Aktifkan RSVP contoh" />
        <EditorToggle {...props} name="allowMaybe" label="Izinkan jawaban masih mempertimbangkan" />
        <EditorField {...props} name="maxParty" label="Maksimum jumlah rombongan" type="number" />
        <EditorField {...props} name="deadline" label="Batas konfirmasi" type="date" />
        <p className="notice">
          Hadir, tidak hadir, dan masih mempertimbangkan adalah status berbeda.
        </p>
      </article>
    </>
  );
}
export { MusicPanel } from "./music-panel";
export function DressPanel(props: EditorFieldProps) {
  return (
    <>
      <h1>Panduan Tamu & Dress Code</h1>
      <article className="card stack">
        <EditorField {...props} name="dressTitle" label="Judul panduan" />
        <EditorField {...props} name="dressNotes" label="Catatan untuk tamu" multiline />
        <div className="swatches">
          {editorFixture.dressCode.colors.map((color) => (
            <span
              className="swatch"
              key={color}
              style={{ background: color }}
              aria-label={`Warna panduan ${color}`}
            />
          ))}
        </div>
      </article>
    </>
  );
}
export { CountdownPanel } from "./countdown-panel";
