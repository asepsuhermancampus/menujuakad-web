"use client";
import { EditorField, type EditorFieldProps } from "./editor-field";
const modes = [
  ["TYPE_FOCUS", "Type Focus", "Tipografi menjadi pusat cerita."],
  ["PORTRAIT", "Portrait", "Slot foto portrait dengan lapisan baca."],
  ["SOLID", "Solid", "Warna tenang tanpa media latar."],
];
export function CoverPanel(props: EditorFieldProps) {
  return (
    <>
      <h1>Sampul Undangan</h1>
      <p>Kesempatan pertama untuk menyampaikan cerita kalian.</p>
      <article className="card stack">
        <h2>Komposisi Sampul</h2>
        <div className="grid-three cover-modes">
          {modes.map(([id, title, description]) => (
            <div className={`cover-mode-card mode-${id.toLowerCase()}`} key={id}>
              <span aria-hidden="true">S & D</span>
              <button
                className="button secondary"
                aria-pressed={props.draft.coverMode === id}
                onClick={() => props.update("coverMode", id)}
              >
                {title}
              </button>
              <small>{description}</small>
            </div>
          ))}
        </div>
        <p className="notice">
          Foto portrait belum tersedia. Media merupakan ilustrasi aman dan tidak diunggah.
        </p>
      </article>
      <article className="card stack">
        <h2>Teks & Tipografi</h2>
        <EditorField {...props} name="title" label="Judul sampul" />
        <EditorField {...props} name="subtitle" label="Kalimat pembuka" multiline />
        <label>
          Gaya tipografi
          <select
            value={props.draft.coverTypography}
            onChange={(e) => props.update("coverTypography", e.target.value)}
          >
            <option value="DISPLAY">Noto Serif · Editorial</option>
            <option value="UI">Manrope · Kontemporer</option>
          </select>
        </label>
        <label>
          Kegelapan overlay
          <input
            type="range"
            min={0}
            max={90}
            step={5}
            value={props.draft.coverOverlay}
            onChange={(e) => props.update("coverOverlay", e.target.value)}
          />
          <small>{props.draft.coverOverlay}% · lapisan ilustratif</small>
        </label>
        <EditorField {...props} name="coverColor" label="Warna dasar sampul" type="color" />
        <p className="notice">
          State tersimpan pada sumber adalah ilustrasi. Tombol simpan hanya mempertahankan draft di
          memori halaman.
        </p>
      </article>
    </>
  );
}
