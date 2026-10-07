"use client";
import { EditorField, type EditorFieldProps } from "./editor-field";
export { CoverPanel } from "./cover-panel";
export function CouplePanel(props: EditorFieldProps) {
  return (
    <>
      <h1>Profil Pasangan</h1>
      <p>Kenalkan dua hati yang akan melangkah bersama.</p>
      <div className="grid-two">
        {[
          ["One", "Pasangan pertama"],
          ["Two", "Pasangan kedua"],
        ].map(([suffix, title]) => (
          <article className="card stack" key={suffix}>
            <h2>{title}</h2>
            <EditorField
              {...props}
              name={`partner${suffix}`}
              label={`Nama ${title.toLowerCase()}`}
            />
            <EditorField
              {...props}
              name={`family${suffix}`}
              label={`Keluarga ${title.toLowerCase()}`}
            />
            <div className="gallery-placeholder">Foto belum disediakan · ilustrasi</div>
          </article>
        ))}
      </div>
    </>
  );
}
export function StoryPanel(props: EditorFieldProps) {
  return (
    <>
      <h1>Kisah Cinta</h1>
      <p>Momen kecil yang membawa kalian sampai ke sini.</p>
      <article className="card stack">
        <EditorField {...props} name="storyTitle" label="Judul momen" />
        <EditorField {...props} name="storyDate" label="Tanggal momen" type="date" />
        <EditorField {...props} name="storyBody" label="Cerita kalian" multiline />
      </article>
    </>
  );
}
export function EventPanel(props: EditorFieldProps) {
  return (
    <>
      <h1>Rangkaian Acara</h1>
      <p>Waktu dan tempat untuk berkumpul bersama.</p>
      <article className="card stack">
        <EditorField {...props} name="eventTitle" label="Nama acara" />
        <div className="grid-two">
          <EditorField {...props} name="eventDate" label="Tanggal acara" type="date" />
          <EditorField {...props} name="eventTime" label="Waktu acara (WIB)" type="time" />
        </div>
        <EditorField {...props} name="venue" label="Nama tempat" />
        <EditorField {...props} name="address" label="Alamat contoh" multiline />
        <p className="notice">Peta dan tautan lokasi nyata belum dihubungkan.</p>
      </article>
    </>
  );
}
