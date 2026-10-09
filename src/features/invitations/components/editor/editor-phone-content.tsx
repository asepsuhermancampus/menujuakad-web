import { CoverPhonePreview } from "./cover-phone-preview";
import { CountdownPreview } from "./countdown-preview";
import { InvitationMedia } from "@/components/shared/invitation-media";
import { editorFixture } from "@/features/design-preview/data/fixtures";
import type { EditorDraft } from "../../lib/editor-draft";
export function EditorPhoneContent({ code, draft }: { code: string; draft: EditorDraft }) {
  if (code === "EDT-03")
    return (
      <>
        <p className="eyebrow">PASANGAN</p>
        <div className="phone-profiles">
          {[draft.partnerOne, draft.partnerTwo].map((name, index) => (
            <div key={index}>
              <div className="phone-avatar" aria-hidden="true">
                {name.slice(0, 1)}
              </div>
              <h2>{name}</h2>
              <p>{index ? draft.familyTwo : draft.familyOne}</p>
            </div>
          ))}
        </div>
      </>
    );
  if (code === "EDT-04")
    return (
      <>
        <p className="eyebrow">KISAH KAMI</p>
        <h2>{draft.storyTitle}</h2>
        <small>{draft.storyDate}</small>
        <p>{draft.storyBody}</p>
      </>
    );
  if (code === "EDT-05")
    return (
      <>
        <p className="eyebrow">RANGKAIAN ACARA</p>
        <h2>{draft.eventTitle}</h2>
        <p>
          {draft.eventDate} · {draft.eventTime} WIB
        </p>
        <p>{draft.venue}</p>
        <small>{draft.address}</small>
      </>
    );
  if (code === "EDT-06")
    return (
      <>
        <h2>Galeri Momen</h2>
        <div className="phone-gallery">
          <InvitationMedia />
          <InvitationMedia kind="MINIMAL" />
        </div>
        <small>Komposisi contoh dari sumber, bukan unggahan lokal.</small>
      </>
    );
  if (code === "EDT-07")
    return (
      <>
        <h2>Konfirmasi Kehadiran</h2>
        <p>{draft.rsvpEnabled === "true" ? "Form contoh aktif" : "Form contoh disembunyikan"}</p>
        <p>Batas {draft.deadline}</p>
        <p>Maksimum {draft.maxParty} tamu</p>
        <span className="badge">
          Hadir · Tidak Hadir{draft.allowMaybe === "true" ? " · Masih Ragu" : ""}
        </span>
      </>
    );
  if (code === "EDT-09")
    return (
      <>
        <h2>Musik Latar</h2>
        <div className="phone-media-symbol">♫</div>
        <p>{draft.musicTitle}</p>
        <small>
          {draft.musicPlaying === "true" ? "Pemutar simulasi · tanpa audio" : "Pemutar tidak aktif"}
        </small>
        <small>
          {draft.musicEnabled === "true"
            ? "Pengaturan aktif · audio belum tersedia"
            : "Musik tidak diaktifkan"}
        </small>
      </>
    );
  if (code === "EDT-10")
    return (
      <>
        <h2>{draft.dressTitle}</h2>
        <div className="swatches">
          {editorFixture.dressCode.colors.map((color) => (
            <span className="swatch" style={{ background: color }} key={color} />
          ))}
        </div>
        <p>{draft.dressNotes}</p>
      </>
    );
  if (code === "EDT-11")
    return (
      <>
        <h2>Kenangan Bergerak</h2>
        <div
          className="phone-media-symbol"
          style={{ aspectRatio: draft.videoRatio.replace(":", "/") }}
        >
          ▷
        </div>
        <small>
          {draft.videoProvider} · Rasio {draft.videoRatio}
        </small>
        <p>
          {draft.videoEnabled === "true"
            ? "Bagian video contoh aktif"
            : "Bagian video disembunyikan"}
        </p>
        <small>{draft.videoUrl || "Video belum disediakan"}</small>
      </>
    );
  if (code === "EDT-12") return <CountdownPreview draft={draft} />;
  if (code === "EDT-13")
    return (
      <>
        <h2>Saksikan Momen Kami</h2>
        <div className="phone-media-symbol">◉</div>
        <p>
          {draft.liveEnabled === "true" ? "Bagian siaran contoh aktif" : "Siaran belum diaktifkan"}
        </p>
        <small>
          {draft.liveProvider} · {draft.liveSchedule.replace("T", " · ")} WIB
        </small>
        <p>{draft.liveAccess === "INVITED_EXAMPLE" ? "Akses tamu contoh" : "Akses umum contoh"}</p>
        <small>{draft.liveUrl || "Tautan belum disediakan"}</small>
      </>
    );
  if (code === "EDT-14")
    return (
      <>
        <h2>Bagikan Kenangan</h2>
        <div className="phone-media-symbol">#</div>
        <p>{draft.hashtag}</p>
        <p>{draft.filterName}</p>
        <small>
          {draft.filterEnabled === "true"
            ? "Pengaturan filter contoh aktif"
            : "Filter belum diaktifkan"}
        </small>
      </>
    );
  if (code === "EDT-15")
    return (
      <>
        <h2>{draft.locationVenue}</h2>
        <div className="phone-media-symbol">⌖</div>
        <p>{draft.locationAddress}</p>
        <small>
          {draft.locationShowMap === "true" ? "Peta contoh ditampilkan" : "Peta disembunyikan"} ·{" "}
          {draft.locationMapLabel}
        </small>
      </>
    );
  if (code === "EDT-16")
    return (
      <>
        <h2>{draft.verseSource}</h2>
        <div className="phone-media-symbol">❝</div>
        <p>{draft.verseText}</p>
        <small>
          {draft.verseEnabled === "true" ? "Bagian ayat contoh aktif" : "Bagian disembunyikan"} ·{" "}
          {draft.verseTranslation}
        </small>
      </>
    );
  if (code === "EDT-17")
    return (
      <>
        <h2>Susunan Acara</h2>
        <div className="phone-media-symbol">☰</div>
        <p>Urutan rundown contoh tersimpan pada fixture editor.</p>
        <small>Perubahan hanya berlaku selama sesi preview.</small>
      </>
    );
  if (code === "EDT-18")
    return (
      <>
        <h2>Protokol Acara</h2>
        <div className="phone-media-symbol">✚</div>
        <p>{draft.protocolHealth}</p>
        <small>
          {draft.protocolDress} · {draft.protocolParking}
        </small>
      </>
    );
  if (code === "EDT-19")
    return (
      <>
        <h2>Butuh Bantuan?</h2>
        <div className="phone-media-symbol">☏</div>
        <p>Kontak narahubung contoh tersedia pada undangan.</p>
        <small>Nomor telepon tidak disertakan pada preview sintetis.</small>
      </>
    );
  if (code === "EDT-20")
    return (
      <>
        <h2>Kolofon</h2>
        <div className="phone-media-symbol">✦</div>
        <p>{draft.colophonCredit}</p>
        <small>
          {draft.colophonEnabled === "true" ? "Bagian kolofon contoh aktif" : "Bagian disembunyikan"}{" "}
          · {draft.colophonNote}
        </small>
      </>
    );
  return (
    <>
      <CoverPhonePreview draft={draft} />
      {code === "EDT-08" && (
        <p className="notice">Paper preview contoh · paket dan penerbitan belum aktif.</p>
      )}
    </>
  );
}
