"use client";
import { EditorField, EditorToggle, type EditorFieldProps } from "./editor-field";
const playlist = ["Piano Ilustratif", "Senandung Akustik Contoh", "Instrumental Tenang Contoh"];
export function MusicPanel(props: EditorFieldProps) {
  return (
    <>
      <h1>Musik Latar</h1>
      <p>Suasana yang mengiringi cerita kalian.</p>
      <article className="card stack">
        <EditorToggle {...props} name="musicEnabled" label="Tampilkan pengaturan musik" />
        <h2>Pemutar Contoh</h2>
        <div className="music-wave" aria-hidden="true">
          {[18, 34, 24, 50, 40, 65, 20, 46, 36, 54, 25, 42].map((height, index) => (
            <span key={index} style={{ height }} />
          ))}
        </div>
        <p>{props.draft.musicTrack}</p>
        <button
          className="button secondary"
          onClick={() =>
            props.update("musicPlaying", props.draft.musicPlaying === "true" ? "false" : "true")
          }
        >
          {props.draft.musicPlaying === "true"
            ? "Hentikan simulasi pemutar"
            : "Simulasikan pemutar"}
        </button>
        <small>
          {props.draft.musicPlaying === "true"
            ? "State pemutar simulasi aktif · tidak ada audio dimainkan"
            : "Audio berlisensi belum tersedia"}
        </small>
        <label>
          Volume contoh
          <input
            type="range"
            min={0}
            max={100}
            value={props.draft.musicVolume}
            onChange={(e) => props.update("musicVolume", e.target.value)}
          />
        </label>
      </article>
      <article className="card stack">
        <h2>Playlist Ilustratif</h2>
        {playlist.map((track) => (
          <button
            className="playlist-choice"
            key={track}
            aria-pressed={props.draft.musicTrack === track}
            onClick={() => {
              props.update("musicTrack", track);
              props.update("musicTitle", track);
            }}
          >
            {track}
            <small>Tidak ada berkas audio</small>
          </button>
        ))}
        <EditorField {...props} name="musicTitle" label="Judul musik contoh" />
      </article>
      <article className="card stack">
        <h2>Unggahan & Perilaku Audio</h2>
        <button className="button secondary" disabled>
          Unggah audio · belum terhubung
        </button>
        <EditorToggle {...props} name="musicLoop" label="Ulangi musik (pengaturan contoh)" />
        <EditorToggle
          {...props}
          name="musicAutoplay"
          label="Mulai setelah undangan dibuka (contoh)"
        />
        <p className="notice">
          Tidak mengambil, memutar, atau mengunggah audio. Pilihan playlist dan perilaku hanya state
          lokal.
        </p>
      </article>
    </>
  );
}
