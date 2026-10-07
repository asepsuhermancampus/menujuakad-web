"use client";
import { EditorField, EditorToggle, type EditorFieldProps } from "./editor-field";
export function VideoPanel(props: EditorFieldProps) {
  return (
    <>
      <h1>Video Sinematik</h1>
      <p>Berikan ruang untuk kenangan bergerak.</p>
      <article className="card stack">
        <h2>Sumber Video</h2>
        <EditorToggle {...props} name="videoEnabled" label="Tampilkan bagian video contoh" />
        <label>
          Provider video contoh
          <select
            value={props.draft.videoProvider}
            onChange={(e) => props.update("videoProvider", e.target.value)}
          >
            <option value="URL">Tautan HTTPS</option>
            <option value="YOUTUBE">YouTube (belum terhubung)</option>
            <option value="VIMEO">Vimeo (belum terhubung)</option>
          </select>
        </label>
        <EditorField {...props} name="videoUrl" label="URL video contoh (HTTPS)" type="url" />
        <button className="button secondary" disabled>
          Unggah video · belum tersedia
        </button>
      </article>
      <article className="card stack">
        <h2>Pemutar & Tata Letak</h2>
        <label>
          Rasio video
          <select
            value={props.draft.videoRatio}
            onChange={(e) => props.update("videoRatio", e.target.value)}
          >
            <option value="16:9">16:9 · Sinematik</option>
            <option value="4:3">4:3 · Klasik</option>
            <option value="9:16">9:16 · Portrait</option>
          </select>
        </label>
        <div
          className="video-placeholder"
          style={{ aspectRatio: props.draft.videoRatio.replace(":", "/") }}
        >
          ▷<small>Slot pemutar ilustratif · tanpa embed</small>
        </div>
        <EditorField {...props} name="videoPoster" label="Label poster contoh" />
        <p className="notice">
          Tautan hanya divalidasi lokal; provider, player, dan unggahan tidak dihubungkan.
        </p>
      </article>
    </>
  );
}
export function LivePanel(props: EditorFieldProps) {
  return (
    <>
      <h1>Siaran Langsung</h1>
      <article className="card stack">
        <h2>Platform & Tautan</h2>
        <EditorToggle {...props} name="liveEnabled" label="Tampilkan siaran langsung contoh" />
        <label>
          Platform siaran contoh
          <select
            value={props.draft.liveProvider}
            onChange={(e) => props.update("liveProvider", e.target.value)}
          >
            <option value="YOUTUBE">YouTube (contoh)</option>
            <option value="ZOOM">Zoom (contoh)</option>
            <option value="OTHER">Platform lain (contoh)</option>
          </select>
        </label>
        <EditorField {...props} name="liveUrl" label="URL siaran contoh (HTTPS)" type="url" />
      </article>
      <article className="card stack">
        <h2>Jadwal & Akses</h2>
        <EditorField
          {...props}
          name="liveSchedule"
          label="Jadwal siaran (WIB)"
          type="datetime-local"
        />
        <label>
          Pengaturan akses contoh
          <select
            value={props.draft.liveAccess}
            onChange={(e) => props.update("liveAccess", e.target.value)}
          >
            <option value="PUBLIC_EXAMPLE">Tautan umum (contoh)</option>
            <option value="INVITED_EXAMPLE">Tamu undangan (contoh)</option>
          </select>
        </label>
        <p className="notice">
          Pengaturan akses ini tidak memberi perlindungan sesi/tamu nyata. Verifikasi server
          diperlukan saat layanan aktif.
        </p>
        <div className="video-placeholder">
          ◉<small>Siaran belum terhubung · {props.draft.liveSchedule.replace("T", " · ")}</small>
        </div>
      </article>
    </>
  );
}
export function HashtagPanel(props: EditorFieldProps) {
  return (
    <>
      <h1>Filter Instagram & Tagar</h1>
      <p>Satukan kenangan dalam satu tanda.</p>
      <article className="card stack">
        <h2>Tagar Pernikahan</h2>
        <EditorField {...props} name="hashtag" label="Tagar pernikahan" />
        <p className="hashtag-preview">{props.draft.hashtag || "#TagarContoh"}</p>
        <small>Tagar hanya teks ilustratif; tidak mencari atau mengirim ke Instagram.</small>
      </article>
      <article className="card stack">
        <h2>Filter & Thumbnail</h2>
        <EditorToggle {...props} name="filterEnabled" label="Tampilkan tautan filter contoh" />
        <EditorField {...props} name="filterName" label="Nama filter contoh" />
        <EditorField {...props} name="filterUrl" label="URL filter contoh (HTTPS)" type="url" />
        <div className="filter-thumbnail">
          S · D<small>Thumbnail ilustrasi · aset filter belum tersedia</small>
        </div>
        <button className="button secondary" disabled>
          Unggah thumbnail · belum terhubung
        </button>
        <p className="notice">Filter Instagram dan layanan media belum terhubung.</p>
      </article>
    </>
  );
}
